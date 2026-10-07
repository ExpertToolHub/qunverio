/* ============================================================
   Qunverio — Advanced PDF Editor
   Single File Version | CSS prefix: qvpe-
   Libraries: PDF.js (CDN) + pdf-lib (CDN)
   Max file size: 30 MB | Max pages: 200
   Part 1: Core (viewer, upload, nav, zoom)
   Part 2: Text, Image, Shapes, Draw, Highlight
   ============================================================ */
(function () {
  'use strict';

  const MAX_FILE_SIZE = 30 * 1024 * 1024;
  const MAX_PAGES = 200;

  const state = {
    pdfDoc: null,
    pdfLibDoc: null,
    pdfBytes: null,
    fileName: 'document.pdf',
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    rotation: 0,
    tool: 'select',
    annotations: {},
    selectedObject: null,
    drawing: false,
    drawStart: null,
    currentDraw: null,
    drawingColor: '#6366f1',
    drawingWidth: 2,
    textFont: 'Helvetica',
    textSize: 14,
    textColor: '#000000',
    highlightColor: '#fbbf24',
    imageFile: null
  };

  // ---------- LIBRARY LOADER ----------
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load: ' + src));
      document.head.appendChild(s);
    });
  }

  async function ensureLibraries() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  // ---------- CSS ----------
  function injectCSS() {
    if (document.getElementById('qvpe-style')) return;
    const style = document.createElement('style');
    style.id = 'qvpe-style';
    style.textContent = `
      .qvpe-wrap {
        position: fixed; inset: 0; z-index: 9998;
        background: #0a0e27; display: flex; flex-direction: column;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .qvpe-wrap.qvpe-hidden { display: none !important; }
      .qvpe-hidden { display: none !important; }

      .qvpe-topbar {
        display: flex; align-items: center; gap: 8px;
        padding: 10px 12px; background: #151a3d;
        border-bottom: 1px solid rgba(255,255,255,.08);
        flex-shrink: 0;
      }
      .qvpe-btn-icon {
        width: 40px; height: 40px; border-radius: 10px;
        background: transparent; border: 1px solid rgba(255,255,255,.1);
        color: #fff; font-size: 18px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all .2s; flex-shrink: 0;
      }
      .qvpe-btn-icon:hover { border-color: #6366f1; background: rgba(99,102,241,.1); }
      .qvpe-btn-icon:disabled { opacity: .35; cursor: not-allowed; }
      .qvpe-filename {
        flex: 1; font-size: 13px; color: #9ca3af; font-weight: 600;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        text-align: center;
      }
      .qvpe-btn-primary {
        padding: 10px 16px; border-radius: 10px; border: none;
        background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%);
        color: #fff; font-weight: 700; font-size: 13px; cursor: pointer;
        font-family: inherit; white-space: nowrap;
      }
      .qvpe-btn-primary:hover { opacity: .9; }

      .qvpe-main {
        flex: 1; display: flex; overflow: hidden; position: relative;
      }

      .qvpe-sidebar {
        width: 130px; background: #0d1230;
        border-right: 1px solid rgba(255,255,255,.08);
        overflow-y: auto; padding: 10px 8px; flex-shrink: 0;
      }
      .qvpe-sidebar.qvpe-hidden { display: none; }
      .qvpe-thumb {
        margin-bottom: 10px; cursor: pointer; border-radius: 8px;
        overflow: hidden; border: 2px solid transparent;
        background: #151a3d; transition: border .2s;
      }
      .qvpe-thumb.active { border-color: #6366f1; }
      .qvpe-thumb canvas { width: 100%; display: block; }
      .qvpe-thumb-num {
        text-align: center; font-size: 11px; color: #9ca3af;
        padding: 4px 0; font-weight: 600;
      }

      .qvpe-canvas-wrap {
        flex: 1; overflow: auto; position: relative;
        background: #060a1f; display: flex; justify-content: center;
        align-items: flex-start; padding: 20px;
      }
      .qvpe-canvas-container {
        position: relative; box-shadow: 0 4px 30px rgba(0,0,0,.5);
        background: #fff; line-height: 0;
      }
      .qvpe-canvas-container canvas {
        display: block; max-width: 100%;
      }
      .qvpe-overlay {
        position: absolute; inset: 0; pointer-events: none;
      }
      .qvpe-overlay.active {
        pointer-events: auto; cursor: crosshair;
      }
      .qvpe-overlay.text-mode { cursor: text; }
      .qvpe-overlay.draw-mode { cursor: crosshair; }
      .qvpe-overlay.highlight-mode { cursor: crosshair; }

      /* Floating text input */
      .qvpe-text-input {
        position: absolute; z-index: 100;
        background: rgba(99,102,241,.1);
        border: 2px solid #6366f1; border-radius: 6px;
        color: #000; padding: 4px 8px; font-family: Helvetica, Arial, sans-serif;
        outline: none; min-width: 80px; box-shadow: 0 4px 20px rgba(0,0,0,.4);
      }

      .qvpe-toolbar {
        display: flex; gap: 6px; padding: 10px 12px;
        background: #151a3d; border-top: 1px solid rgba(255,255,255,.08);
        overflow-x: auto; flex-shrink: 0;
        scrollbar-width: none;
      }
      .qvpe-toolbar::-webkit-scrollbar { display: none; }
      .qvpe-tool {
        display: flex; flex-direction: column; align-items: center;
        gap: 4px; padding: 8px 12px; border-radius: 10px;
        background: transparent; border: 1px solid rgba(255,255,255,.08);
        color: #9ca3af; font-size: 10px; cursor: pointer;
        font-family: inherit; font-weight: 600; flex-shrink: 0;
        transition: all .2s; min-width: 60px;
      }
      .qvpe-tool:hover { border-color: #6366f1; color: #fff; }
      .qvpe-tool.active {
        background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
        color: #fff; border-color: transparent;
      }
      .qvpe-tool-icon { font-size: 18px; }

      /* Sub-toolbar (context sensitive) */
      .qvpe-subtoolbar {
        display: flex; gap: 8px; padding: 8px 12px;
        background: #0d1230; border-top: 1px solid rgba(255,255,255,.05);
        align-items: center; overflow-x: auto; flex-shrink: 0;
        scrollbar-width: none;
      }
      .qvpe-subtoolbar::-webkit-scrollbar { display: none; }
      .qvpe-subtoolbar label {
        font-size: 11px; color: #9ca3af; font-weight: 600;
        display: flex; align-items: center; gap: 6px; white-space: nowrap;
      }
      .qvpe-subtoolbar input[type="color"] {
        width: 32px; height: 28px; border: none; border-radius: 6px;
        background: transparent; cursor: pointer;
      }
      .qvpe-subtoolbar input[type="number"] {
        width: 60px; padding: 6px 8px; border-radius: 6px;
        background: #151a3d; border: 1px solid rgba(255,255,255,.1);
        color: #fff; font-size: 12px; font-family: inherit;
      }
      .qvpe-subtoolbar select {
        padding: 6px 8px; border-radius: 6px;
        background: #151a3d; border: 1px solid rgba(255,255,255,.1);
        color: #fff; font-size: 12px; font-family: inherit;
      }

      .qvpe-pagenav {
        position: absolute; bottom: 80px; right: 20px;
        background: rgba(21,26,61,.95); border: 1px solid rgba(255,255,255,.15);
        border-radius: 12px; padding: 8px 12px; display: flex;
        align-items: center; gap: 10px; font-size: 13px; color: #fff;
        backdrop-filter: blur(10px); box-shadow: 0 4px 20px rgba(0,0,0,.4);
      }
      .qvpe-pagenav button {
        background: transparent; border: none; color: #fff; cursor: pointer;
        font-size: 16px; padding: 4px 8px; border-radius: 6px;
      }
      .qvpe-pagenav button:hover { background: rgba(99,102,241,.3); }

      .qvpe-zoomctl {
        position: absolute; bottom: 80px; left: 20px;
        background: rgba(21,26,61,.95); border: 1px solid rgba(255,255,255,.15);
        border-radius: 12px; padding: 6px; display: flex; gap: 4px;
        backdrop-filter: blur(10px);
      }
      .qvpe-zoomctl button {
        background: transparent; border: none; color: #fff; cursor: pointer;
        padding: 6px 10px; border-radius: 6px; font-size: 14px; font-weight: 700;
      }
      .qvpe-zoomctl button:hover { background: rgba(99,102,241,.3); }

      .qvpe-upload {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; padding: 40px 20px;
        text-align: center;
      }
      .qvpe-upload-icon { font-size: 64px; margin-bottom: 20px; opacity: .7; }
      .qvpe-upload-title { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 8px; }
      .qvpe-upload-sub { font-size: 14px; color: #9ca3af; margin-bottom: 28px; max-width: 400px; line-height: 1.5; }
      .qvpe-upload-btn {
        padding: 16px 32px; border-radius: 14px; border: none;
        background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%);
        color: #fff; font-weight: 700; font-size: 16px; cursor: pointer;
        font-family: inherit;
      }
      .qvpe-upload-hint { font-size: 12px; color: #6b7280; margin-top: 16px; }

      .qvpe-loading {
        position: absolute; inset: 0; background: rgba(10,14,39,.9);
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 16px; z-index: 10;
      }
      .qvpe-spinner {
        width: 40px; height: 40px; border: 4px solid rgba(99,102,241,.25);
        border-top-color: #6366f1; border-radius: 50%;
        animation: qvpe-spin .7s linear infinite;
      }
      @keyframes qvpe-spin { to { transform: rotate(360deg); } }
      .qvpe-loading-text { color: #9ca3af; font-size: 14px; }

      .qvpe-toast {
        position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
        background: #151a3d; border: 1px solid rgba(99,102,241,.4);
        color: #fff; padding: 12px 20px; border-radius: 12px;
        font-size: 14px; z-index: 10001; box-shadow: 0 8px 30px rgba(0,0,0,.5);
        max-width: 90vw;
      }
      .qvpe-toast.error { border-color: rgba(239,68,68,.5); }

      @media (max-width: 700px) {
        .qvpe-sidebar { width: 90px; }
        .qvpe-thumb-num { font-size: 10px; }
        .qvpe-tool { min-width: 54px; padding: 6px 8px; font-size: 9px; }
        .qvpe-tool-icon { font-size: 16px; }
        .qvpe-filename { font-size: 11px; }
        .qvpe-btn-primary { padding: 8px 12px; font-size: 12px; }
        .qvpe-btn-icon { width: 36px; height: 36px; font-size: 16px; }
        .qvpe-pagenav { bottom: 76px; right: 10px; padding: 6px 10px; font-size: 12px; }
        .qvpe-zoomctl { bottom: 76px; left: 10px; }
        .qvpe-canvas-wrap { padding: 10px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------- TOAST ----------
  function toast(msg, type) {
    const t = document.createElement('div');
    t.className = 'qvpe-toast' + (type === 'error' ? ' error' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  // ---------- HTML ----------
  function renderHTML() {
    return `
      <div class="qvpe-wrap qvpe-hidden" id="qvpe-wrap">

        <div class="qvpe-upload" id="qvpe-upload-screen">
          <div class="qvpe-upload-icon">📄</div>
          <div class="qvpe-upload-title">PDF Editor</div>
          <div class="qvpe-upload-sub">
            PDF upload karo aur edit karo — text, image, shapes, drawing, highlight sab kuch.
          </div>
          <button class="qvpe-upload-btn" id="qvpe-upload-btn">📁 PDF Upload Karo</button>
          <input type="file" id="qvpe-file-input" accept="application/pdf" style="display:none" />
          <div class="qvpe-upload-hint">Max 30 MB · Max 200 pages · Sab kuch browser me process hota hai</div>
        </div>

        <div class="qvpe-wrap qvpe-hidden" id="qvpe-editor-screen" style="position:static">
          <div class="qvpe-topbar">
            <button class="qvpe-btn-icon" id="qvpe-back" title="Close">←</button>
            <button class="qvpe-btn-icon" id="qvpe-toggle-sidebar" title="Pages">📄</button>
            <div class="qvpe-filename" id="qvpe-fname">document.pdf</div>
            <button class="qvpe-btn-primary" id="qvpe-save">💾 Save</button>
          </div>

          <div class="qvpe-main">
            <div class="qvpe-sidebar" id="qvpe-sidebar"></div>
            <div class="qvpe-canvas-wrap" id="qvpe-canvas-wrap">
              <div class="qvpe-canvas-container" id="qvpe-canvas-container">
                <canvas id="qvpe-canvas"></canvas>
                <div class="qvpe-overlay" id="qvpe-overlay"></div>
              </div>
            </div>

            <div class="qvpe-zoomctl">
              <button id="qvpe-zoom-out">−</button>
              <button id="qvpe-zoom-in">+</button>
              <button id="qvpe-zoom-fit">⤢</button>
            </div>

            <div class="qvpe-pagenav">
              <button id="qvpe-prev">‹</button>
              <span><span id="qvpe-cur-page">1</span> / <span id="qvpe-total-pages">1</span></span>
              <button id="qvpe-next">›</button>
            </div>

            <div class="qvpe-loading qvpe-hidden" id="qvpe-loading">
              <div class="qvpe-spinner"></div>
              <div class="qvpe-loading-text">Loading...</div>
            </div>
          </div>

          <div class="qvpe-subtoolbar" id="qvpe-subtoolbar" style="display:none">
            <div id="qvpe-subtoolbar-content"></div>
          </div>

          <div class="qvpe-toolbar" id="qvpe-toolbar">
            <button class="qvpe-tool active" data-tool="select"><span class="qvpe-tool-icon">👆</span>Select</button>
            <button class="qvpe-tool" data-tool="text"><span class="qvpe-tool-icon">T</span>Text</button>
            <button class="qvpe-tool" data-tool="image"><span class="qvpe-tool-icon">🖼️</span>Image</button>
            <button class="qvpe-tool" data-tool="draw"><span class="qvpe-tool-icon">✏️</span>Draw</button>
            <button class="qvpe-tool" data-tool="highlight"><span class="qvpe-tool-icon">🖍️</span>Highlight</button>
            <button class="qvpe-tool" data-tool="shape"><span class="qvpe-tool-icon">▭</span>Shape</button>
            <button class="qvpe-tool" data-tool="signature"><span class="qvpe-tool-icon">✍️</span>Sign</button>
            <button class="qvpe-tool" data-tool="redact"><span class="qvpe-tool-icon">⬛</span>Redact</button>
          </div>
        </div>

      </div>
    `;
  }

  // ---------- RENDER PAGE ----------
  async function renderPage(pageNum) {
    if (!state.pdfDoc) return;
    const page = await state.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: state.scale, rotation: state.rotation });

    const canvas = document.getElementById('qvpe-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const container = document.getElementById('qvpe-canvas-container');
    container.style.width = viewport.width + 'px';
    container.style.height = viewport.height + 'px';

    document.getElementById('qvpe-cur-page').textContent = pageNum;

    document.querySelectorAll('.qvpe-thumb').forEach((t, i) => {
      t.classList.toggle('active', i + 1 === pageNum);
    });

    // Redraw existing annotations for this page
    redrawAnnotations();
  }

  // ---------- THUMBNAILS ----------
  async function renderThumbnails() {
    const sidebar = document.getElementById('qvpe-sidebar');
    sidebar.innerHTML = '';
    const thumbScale = 0.15;

    for (let i = 1; i <= state.totalPages; i++) {
      const wrap = document.createElement('div');
      wrap.className = 'qvpe-thumb';
      wrap.dataset.page = i;
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas);
      const num = document.createElement('div');
      num.className = 'qvpe-thumb-num';
      num.textContent = 'Page ' + i;
      wrap.appendChild(num);
      sidebar.appendChild(wrap);

      (async () => {
        const page = await state.pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: thumbScale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      })();

      wrap.addEventListener('click', () => {
        state.currentPage = i;
        renderPage(i);
      });
    }
  }

  // ---------- ANNOTATIONS REDRAW ----------
  function redrawAnnotations() {
    const overlay = document.getElementById('qvpe-overlay');
    overlay.innerHTML = '';
    const pageAnns = state.annotations[state.currentPage] || [];
    pageAnns.forEach(ann => {
      if (ann.type === 'text') {
        addTextAnnotation(ann);
      } else if (ann.type === 'image') {
        addImageAnnotation(ann);
      } else if (ann.type === 'shape') {
        addShapeAnnotation(ann);
      } else if (ann.type === 'draw') {
        addDrawAnnotation(ann);
      } else if (ann.type === 'highlight') {
        addHighlightAnnotation(ann);
      }
    });
  }

  // ---------- TEXT ANNOTATION ----------
  function addTextAnnotation(ann) {
    const overlay = document.getElementById('qvpe-overlay');
    const div = document.createElement('div');
    div.className = 'qvpe-ann-text';
    div.style.position = 'absolute';
    div.style.left = ann.x + 'px';
    div.style.top = ann.y + 'px';
    div.style.fontFamily = ann.font || 'Helvetica, Arial, sans-serif';
    div.style.fontSize = (ann.size * state.scale) + 'px';
    div.style.color = ann.color || '#000';
    div.style.whiteSpace = 'pre';
    div.style.lineHeight = '1.2';
    div.style.cursor = 'move';
    div.dataset.annId = ann.id;
    div.textContent = ann.text;

    // Drag support
    let dragging = false, sx, sy, ox, oy;
    div.addEventListener('mousedown', (e) => {
      if (state.tool !== 'select') return;
      e.stopPropagation();
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = ann.x; oy = ann.y;
    });
    div.addEventListener('touchstart', (e) => {
      if (state.tool !== 'select') return;
      e.stopPropagation();
      const t = e.touches[0];
      dragging = true;
      sx = t.clientX; sy = t.clientY;
      ox = ann.x; oy = ann.y;
    }, { passive: true });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });

    function onMove(e) {
      if (!dragging) return;
      const pt = e.touches ? e.touches[0] : e;
      const dx = pt.clientX - sx;
      const dy = pt.clientY - sy;
      ann.x = ox + dx;
      ann.y = oy + dy;
      div.style.left = ann.x + 'px';
      div.style.top = ann.y + 'px';
    }

    document.addEventListener('mouseup', () => { dragging = false; });
    document.addEventListener('touchend', () => { dragging = false; });

    overlay.appendChild(div);
  }

  // ---------- IMAGE ANNOTATION ----------
  function addImageAnnotation(ann) {
    const overlay = document.getElementById('qvpe-overlay');
    const img = document.createElement('img');
    img.src = ann.src;
    img.style.position = 'absolute';
    img.style.left = ann.x + 'px';
    img.style.top = ann.y + 'px';
    img.style.width = (ann.w * state.scale) + 'px';
    img.style.height = (ann.h * state.scale) + 'px';
    img.style.cursor = 'move';
    img.style.userSelect = 'none';
    img.dataset.annId = ann.id;

    let dragging = false, sx, sy, ox, oy;
    const start = (e) => {
      if (state.tool !== 'select') return;
      e.stopPropagation();
      const pt = e.touches ? e.touches[0] : e;
      dragging = true;
      sx = pt.clientX; sy = pt.clientY;
      ox = ann.x; oy = ann.y;
    };
    const move = (e) => {
      if (!dragging) return;
      const pt = e.touches ? e.touches[0] : e;
      ann.x = ox + (pt.clientX - sx);
      ann.y = oy + (pt.clientY - sy);
      img.style.left = ann.x + 'px';
      img.style.top = ann.y + 'px';
    };
    const end = () => { dragging = false; };

    img.addEventListener('mousedown', start);
    img.addEventListener('touchstart', start, { passive: true });
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, { passive: true });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);

    overlay.appendChild(img);
  }

  // ---------- SHAPE ANNOTATION ----------
  function addShapeAnnotation(ann) {
    const overlay = document.getElementById('qvpe-overlay');
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.left = ann.x + 'px';
    el.style.top = ann.y + 'px';
    el.style.width = (ann.w * state.scale) + 'px';
    el.style.height = (ann.h * state.scale) + 'px';
    el.style.border = ann.borderWidth + 'px solid ' + ann.color;
    el.style.pointerEvents = 'auto';
    el.dataset.annId = ann.id;

    if (ann.shape === 'circle') {
      el.style.borderRadius = '50%';
    } else if (ann.shape === 'line') {
      // line handled as thin div
      el.style.height = '2px';
      el.style.background = ann.color;
      el.style.border = 'none';
    }

    el.style.cursor = 'move';

    let dragging = false, sx, sy, ox, oy;
    const start = (e) => {
      if (state.tool !== 'select') return;
      e.stopPropagation();
      const pt = e.touches ? e.touches[0] : e;
      dragging = true;
      sx = pt.clientX; sy = pt.clientY;
      ox = ann.x; oy = ann.y;
    };
    const move = (e) => {
      if (!dragging) return;
      const pt = e.touches ? e.touches[0] : e;
      ann.x = ox + (pt.clientX - sx);
      ann.y = oy + (pt.clientY - sy);
      el.style.left = ann.x + 'px';
      el.style.top = ann.y + 'px';
    };
    const end = () => { dragging = false; };

    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start, { passive: true });
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, { passive: true });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);

    overlay.appendChild(el);
  }

  // ---------- DRAW ANNOTATION ----------
  function addDrawAnnotation(ann) {
    const overlay = document.getElementById('qvpe-overlay');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.inset = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.dataset.annId = ann.id;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pts = ann.points;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x} ${pts[i].y}`;
    }
    path.setAttribute('d', d);
    path.setAttribute('stroke', ann.color);
    path.setAttribute('stroke-width', ann.width * state.scale);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);

    overlay.appendChild(svg);
  }

  // ---------- HIGHLIGHT ANNOTATION ----------
  function addHighlightAnnotation(ann) {
    const overlay = document.getElementById('qvpe-overlay');
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.left = ann.x + 'px';
    el.style.top = ann.y + 'px';
    el.style.width = ann.w + 'px';
    el.style.height = ann.h + 'px';
    el.style.background = ann.color;
    el.style.opacity = '0.35';
    el.style.mixBlendMode = 'multiply';
    el.style.pointerEvents = 'none';
    overlay.appendChild(el);
  }

  // ---------- SUBTOOLBAR ----------
  function renderSubtoolbar(tool) {
    const sub = document.getElementById('qvpe-subtoolbar');
    const content = document.getElementById('qvpe-subtoolbar-content');

    if (tool === 'select') {
      sub.style.display = 'none';
      return;
    }
    sub.style.display = 'flex';

    if (tool === 'text') {
      content.innerHTML = `
        <label>Color <input type="color" id="qvpe-text-color" value="${state.textColor}"></label>
        <label>Size <input type="number" id="qvpe-text-size" value="${state.textSize}" min="8" max="72"></label>
        <label>Font
          <select id="qvpe-text-font">
            <option>Helvetica</option>
            <option>Times-Roman</option>
            <option>Courier</option>
          </select>
        </label>
      `;
      document.getElementById('qvpe-text-color').addEventListener('input', e => state.textColor = e.target.value);
      document.getElementById('qvpe-text-size').addEventListener('input', e => state.textSize = parseInt(e.target.value) || 14);
      document.getElementById('qvpe-text-font').addEventListener('change', e => state.textFont = e.target.value);
    } else if (tool === 'draw') {
      content.innerHTML = `
        <label>Color <input type="color" id="qvpe-draw-color" value="${state.drawingColor}"></label>
        <label>Width <input type="number" id="qvpe-draw-width" value="${state.drawingWidth}" min="1" max="20"></label>
      `;
      document.getElementById('qvpe-draw-color').addEventListener('input', e => state.drawingColor = e.target.value);
      document.getElementById('qvpe-draw-width').addEventListener('input', e => state.drawingWidth = parseInt(e.target.value) || 2);
    } else if (tool === 'highlight') {
      content.innerHTML = `
        <label>Color <input type="color" id="qvpe-hl-color" value="${state.highlightColor}"></label>
      `;
      document.getElementById('qvpe-hl-color').addEventListener('input', e => state.highlightColor = e.target.value);
    } else if (tool === 'image') {
      content.innerHTML = `
        <button class="qvpe-btn-primary" id="qvpe-img-pick" style="padding:8px 12px;font-size:12px">📁 Image Choose</button>
        <input type="file" id="qvpe-img-input" accept="image/*" style="display:none">
        <span style="font-size:12px;color:#9ca3af">Phir page pe tap karo</span>
      `;
      document.getElementById('qvpe-img-pick').addEventListener('click', () => {
        document.getElementById('qvpe-img-input').click();
      });
      document.getElementById('qvpe-img-input').addEventListener('change', (e) => {
        const f = e.target.files[0];
        if (f) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            state.imageFile = { src: ev.target.result, name: f.name };
            toast('Image ready — page pe tap karo');
          };
          reader.readAsDataURL(f);
        }
      });
    } else if (tool === 'shape') {
      content.innerHTML = `
        <label>Shape
          <select id="qvpe-shape-type">
            <option value="rect">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="line">Line</option>
          </select>
        </label>
        <label>Color <input type="color" id="qvpe-shape-color" value="#6366f1"></label>
        <label>Width <input type="number" id="qvpe-shape-width" value="2" min="1" max="10"></label>
      `;
      state.shapeType = 'rect';
      state.shapeColor = '#6366f1';
      state.shapeWidth = 2;
      document.getElementById('qvpe-shape-type').addEventListener('change', e => state.shapeType = e.target.value);
      document.getElementById('qvpe-shape-color').addEventListener('input', e => state.shapeColor = e.target.value);
      document.getElementById('qvpe-shape-width').addEventListener('input', e => state.shapeWidth = parseInt(e.target.value) || 2);
    } else if (tool === 'signature') {
      content.innerHTML = `
        <button class="qvpe-btn-primary" id="qvpe-sig-pick" style="padding:8px 12px;font-size:12px">✍️ Draw Signature</button>
        <span style="font-size:12px;color:#9ca3af">Part 3 me aayega</span>
      `;
    } else if (tool === 'redact') {
      content.innerHTML = `
        <span style="font-size:12px;color:#f87171;font-weight:600">⚠️ Redaction — Part 3 me aayega</span>
      `;
    }
  }

  // ---------- OVERLAY EVENTS ----------
  function setupOverlayEvents() {
    const overlay = document.getElementById('qvpe-overlay');
    let tempInput = null;

    // TEXT tool — click to place text input
    overlay.addEventListener('click', (e) => {
      const rect = overlay.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (state.tool === 'text') {
        // create temp input
        if (tempInput) tempInput.remove();
        tempInput = document.createElement('input');
        tempInput.className = 'qvpe-text-input';
        tempInput.style.left = x + 'px';
        tempInput.style.top = (y - 15) + 'px';
        tempInput.style.fontSize = (state.textSize * state.scale) + 'px';
        tempInput.style.color = state.textColor;
        tempInput.placeholder = 'Type...';
        overlay.appendChild(tempInput);
        setTimeout(() => tempInput.focus(), 50);

        const commit = () => {
          const text = tempInput.value.trim();
          if (text) {
            const ann = {
              id: 'ann_' + Date.now(),
              type: 'text',
              x: x,
              y: y - 15,
              text: text,
              size: state.textSize,
              color: state.textColor,
              font: state.textFont
            };
            if (!state.annotations[state.currentPage]) state.annotations[state.currentPage] = [];
            state.annotations[state.currentPage].push(ann);
            redrawAnnotations();
            toast('Text add ho gaya');
          }
          tempInput.remove();
          tempInput = null;
        };

        tempInput.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') commit();
          if (ev.key === 'Escape') { tempInput.remove(); tempInput = null; }
        });
        tempInput.addEventListener('blur', () => {
          setTimeout(commit, 100);
        });
      } else if (state.tool === 'image' && state.imageFile) {
        const img = new Image();
        img.onload = () => {
          const maxW = 200;
          const ratio = img.height / img.width;
          const w = Math.min(maxW, img.width);
          const h = w * ratio;
          const ann = {
            id: 'ann_' + Date.now(),
            type: 'image',
            x: x - w / 2,
            y: y - h / 2,
            w: w,
            h: h,
            src: state.imageFile.src
          };
          if (!state.annotations[state.currentPage]) state.annotations[state.currentPage] = [];
          state.annotations[state.currentPage].push(ann);
          redrawAnnotations();
          toast('Image add ho gayi');
        };
        img.src = state.imageFile.src;
      }
    });

    // DRAW — mousedown/move/up
    let drawing = false;
    let currentPoints = [];

    const getPt = (e) => {
      const rect = overlay.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      return { x: pt.clientX - rect.left, y: pt.clientY - rect.top };
    };

    const startDraw = (e) => {
      if (state.tool !== 'draw' && state.tool !== 'highlight') return;
      drawing = true;
      currentPoints = [getPt(e)];
    };
    const moveDraw = (e) => {
      if (!drawing) return;
      e.preventDefault();
      currentPoints.push(getPt(e));
      // live preview — simplified: just add path each move
      const overlay2 = document.getElementById('qvpe-overlay');
      // Remove previous preview
      const prev = overlay2.querySelector('.qvpe-preview');
      if (prev) prev.remove();
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('qvpe-preview');
      svg.style.position = 'absolute';
      svg.style.inset = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'none';
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let d = `M ${currentPoints[0].x} ${currentPoints[0].y}`;
      for (let i = 1; i < currentPoints.length; i++) {
        d += ` L ${currentPoints[i].x} ${currentPoints[i].y}`;
      }
      path.setAttribute('d', d);
      path.setAttribute('stroke', state.tool === 'draw' ? state.drawingColor : state.highlightColor);
      path.setAttribute('stroke-width', (state.tool === 'draw' ? state.drawingWidth : 12) * state.scale);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      if (state.tool === 'highlight') path.setAttribute('opacity', '0.35');
      svg.appendChild(path);
      overlay2.appendChild(svg);
    };
    const endDraw = () => {
      if (!drawing) return;
      drawing = false;
      if (currentPoints.length < 2) { currentPoints = []; return; }

      if (state.tool === 'draw') {
        const ann = {
          id: 'ann_' + Date.now(),
          type: 'draw',
          points: currentPoints.slice(),
          color: state.drawingColor,
          width: state.drawingWidth
        };
        if (!state.annotations[state.currentPage]) state.annotations[state.currentPage] = [];
        state.annotations[state.currentPage].push(ann);
      } else if (state.tool === 'highlight') {
        // Bounding box of points
        const xs = currentPoints.map(p => p.x);
        const ys = currentPoints.map(p => p.y);
        const x = Math.min(...xs);
        const y = Math.min(...ys);
        const w = Math.max(...xs) - x;
        const h = Math.max(...ys) - y;
        const ann = {
          id: 'ann_' + Date.now(),
          type: 'highlight',
          x: x, y: y, w: w, h: h,
          color: state.highlightColor
        };
        if (!state.annotations[state.currentPage]) state.annotations[state.currentPage] = [];
        state.annotations[state.currentPage].push(ann);
      }

      currentPoints = [];
      redrawAnnotations();
      toast(state.tool === 'draw' ? 'Drawing add ho gayi' : 'Highlight add ho gaya');
    };

    overlay.addEventListener('mousedown', startDraw);
    overlay.addEventListener('mousemove', moveDraw);
    overlay.addEventListener('mouseup', endDraw);
    overlay.addEventListener('touchstart', startDraw, { passive: true });
    overlay.addEventListener('touchmove', moveDraw, { passive: false });
    overlay.addEventListener('touchend', endDraw);

    // SHAPE — drag to create
    let shapeStart = null;
    overlay.addEventListener('mousedown', (e) => {
      if (state.tool !== 'shape') return;
      const rect = overlay.getBoundingClientRect();
      shapeStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });
    overlay.addEventListener('mouseup', (e) => {
      if (state.tool !== 'shape' || !shapeStart) return;
      const rect = overlay.getBoundingClientRect();
      const x2 = e.clientX - rect.left;
      const y2 = e.clientY - rect.top;
      const x = Math.min(shapeStart.x, x2);
      const y = Math.min(shapeStart.y, y2);
      const w = Math.abs(x2 - shapeStart.x) || 100;
      const h = Math.abs(y2 - shapeStart.y) || 60;
      const ann = {
        id: 'ann_' + Date.now(),
        type: 'shape',
        shape: state.shapeType || 'rect',
        x, y, w, h,
        color: state.shapeColor || '#6366f1',
        borderWidth: state.shapeWidth || 2
      };
      if (!state.annotations[state.currentPage]) state.annotations[state.currentPage] = [];
      state.annotations[state.currentPage].push(ann);
      redrawAnnotations();
      shapeStart = null;
      toast('Shape add ho gaya');
    });
  }

  // ---------- LOAD PDF ----------
  async function loadPDF(file) {
    if (file.size > MAX_FILE_SIZE) {
      toast('File 30 MB se badi hai.', 'error');
      return;
    }
    if (file.type !== 'application/pdf') {
      toast('Sirf PDF files allowed hain.', 'error');
      return;
    }

    showLoading(true, 'PDF load ho rahi hai...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      state.pdfBytes = arrayBuffer.slice(0);
      state.fileName = file.name;

      state.pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      state.totalPages = state.pdfDoc.numPages;

      if (state.totalPages > MAX_PAGES) {
        toast(`${MAX_PAGES} se zyada pages hain.`, 'error');
        showLoading(false);
        return;
      }

      state.pdfLibDoc = await window.PDFLib.PDFDocument.load(arrayBuffer.slice(0));

      document.getElementById('qvpe-upload-screen').classList.add('qvpe-hidden');
      document.getElementById('qvpe-editor-screen').classList.remove('qvpe-hidden');
      document.getElementById('qvpe-fname').textContent = file.name;
      document.getElementById('qvpe-total-pages').textContent = state.totalPages;

      await renderThumbnails();
      await renderPage(1);
      state.currentPage = 1;

      showLoading(false);
      toast('PDF load ho gayi ✅');
    } catch (err) {
      console.error(err);
      showLoading(false);
      toast('PDF load nahi ho payi.', 'error');
    }
  }

  function showLoading(show, text) {
    const el = document.getElementById('qvpe-loading');
    if (!el) return;
    el.classList.toggle('qvpe-hidden', !show);
    if (text) el.querySelector('.qvpe-loading-text').textContent = text;
  }

  // ---------- INIT ----------
  function init() {
    injectCSS();

    document.getElementById('qvpe-upload-btn').addEventListener('click', () => {
      document.getElementById('qvpe-file-input').click();
    });
    document.getElementById('qvpe-file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) loadPDF(file);
    });

    document.getElementById('qvpe-back').addEventListener('click', () => {
      if (confirm('Editor band karein? Unsaved changes lost ho jaayenge.')) {
        document.getElementById('qvpe-wrap').classList.add('qvpe-hidden');
      }
    });

    document.getElementById('qvpe-toggle-sidebar').addEventListener('click', () => {
      document.getElementById('qvpe-sidebar').classList.toggle('qvpe-hidden');
    });

    document.getElementById('qvpe-prev').addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderPage(state.currentPage);
      }
    });
    document.getElementById('qvpe-next').addEventListener('click', () => {
      if (state.currentPage < state.totalPages) {
        state.currentPage++;
        renderPage(state.currentPage);
      }
    });

    document.getElementById('qvpe-zoom-in').addEventListener('click', () => {
      state.scale = Math.min(state.scale + 0.25, 3);
      renderPage(state.currentPage);
    });
    document.getElementById('qvpe-zoom-out').addEventListener('click', () => {
      state.scale = Math.max(state.scale - 0.25, 0.4);
      renderPage(state.currentPage);
    });
    document.getElementById('qvpe-zoom-fit').addEventListener('click', () => {
      state.scale = 1.0;
      renderPage(state.currentPage);
    });

    document.querySelectorAll('.qvpe-tool').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.qvpe-tool').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.tool = btn.dataset.tool;

        const overlay = document.getElementById('qvpe-overlay');
        overlay.className = 'qvpe-overlay';
        if (state.tool !== 'select') overlay.classList.add('active');
        if (state.tool === 'text') overlay.classList.add('text-mode');
        if (state.tool === 'draw') overlay.classList.add('draw-mode');
        if (state.tool === 'highlight') overlay.classList.add('highlight-mode');

        renderSubtoolbar(state.tool);
      });
    });

    document.getElementById('qvpe-save').addEventListener('click', () => {
      toast('Export Part 3 me aayega', 'error');
    });

    setupOverlayEvents();
  }

  window.QVPE_OPEN = function () {
    document.getElementById('qvpe-wrap').classList.remove('qvpe-hidden');
  };

  window.EXTRA_TOOL_RENDERERS = window.EXTRA_TOOL_RENDERERS || {};
  window.EXTRA_TOOL_INITS = window.EXTRA_TOOL_INITS || {};

  window.EXTRA_TOOL_RENDERERS['pdf-editor'] = function () {
    ensureLibraries().catch(console.error);
    return renderHTML();
  };

  window.EXTRA_TOOL_INITS['pdf-editor'] = function () {
    ensureLibraries().then(() => {
      init();
      setTimeout(() => window.QVPE_OPEN(), 100);
    }).catch(() => {
      toast('Libraries load nahi hui. Internet check karein.', 'error');
    });
  };
})();