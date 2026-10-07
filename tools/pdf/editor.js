/* ============================================================
   Qunverio — Advanced PDF Editor
   Single File Version | CSS prefix: qvpe-
   Libraries: PDF.js (CDN) + pdf-lib (CDN)
   Max file size: 30 MB
   ============================================================ */
(function () {
  'use strict';

  // ---------- CONSTANTS ----------
  const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB
  const MAX_PAGES = 200;

  // ---------- STATE ----------
  const state = {
    pdfDoc: null,           // PDF.js document
    pdfLibDoc: null,        // pdf-lib document (for export)
    pdfBytes: null,         // Original file bytes
    fileName: 'document.pdf',
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    rotation: 0,
    tool: 'select',         // select | text | image | draw | highlight | signature | redact
    history: [],
    historyIndex: -1,
    annotations: {},        // { pageNum: [annotations] }
    selectedObject: null
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
      .qvpe-hidden { display: none !important; }

      /* ---- Top Bar ---- */
      .qvpe-topbar {
        display: flex; align-items: center; gap: 10px;
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
      .qvpe-btn-icon.active { background: #6366f1; border-color: #6366f1; }
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
      .qvpe-btn-primary:disabled { opacity: .4; cursor: not-allowed; }

      /* ---- Main Area ---- */
      .qvpe-main {
        flex: 1; display: flex; overflow: hidden; position: relative;
      }

      /* ---- Sidebar (Thumbnails) ---- */
      .qvpe-sidebar {
        width: 130px; background: #0d1230;
        border-right: 1px solid rgba(255,255,255,.08);
        overflow-y: auto; padding: 10px 8px; flex-shrink: 0;
      }
      .qvpe-sidebar.qvpe-hidden { display: none; }
      .qvpe-thumb {
        margin-bottom: 10px; cursor: pointer; border-radius: 8px;
        overflow: hidden; border: 2px solid transparent;
        background: #151a3d; transition: border .2s; position: relative;
      }
      .qvpe-thumb.active { border-color: #6366f1; }
      .qvpe-thumb canvas { width: 100%; display: block; }
      .qvpe-thumb-num {
        text-align: center; font-size: 11px; color: #9ca3af;
        padding: 4px 0; font-weight: 600;
      }

      /* ---- Canvas Area ---- */
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
      .qvpe-overlay.active { pointer-events: auto; cursor: crosshair; }

      /* ---- Bottom Toolbar ---- */
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

      /* ---- Page Nav (bottom-right) ---- */
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

      /* ---- Zoom controls ---- */
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

      /* ---- Upload Screen ---- */
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
      .qvpe-upload-btn:hover { opacity: .9; }
      .qvpe-upload-hint { font-size: 12px; color: #6b7280; margin-top: 16px; }

      /* ---- Loading ---- */
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

      /* ---- Toast ---- */
      .qvpe-toast {
        position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
        background: #151a3d; border: 1px solid rgba(99,102,241,.4);
        color: #fff; padding: 12px 20px; border-radius: 12px;
        font-size: 14px; z-index: 10001; box-shadow: 0 8px 30px rgba(0,0,0,.5);
        max-width: 90vw;
      }
      .qvpe-toast.error { border-color: rgba(239,68,68,.5); }

      /* ---- Mobile ---- */
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

        <!-- Upload Screen -->
        <div class="qvpe-upload" id="qvpe-upload-screen">
          <div class="qvpe-upload-icon">📄</div>
          <div class="qvpe-upload-title">PDF Editor</div>
          <div class="qvpe-upload-sub">
            PDF upload karo aur edit karo — text, image, shapes, signature, redaction sab kuch.
          </div>
          <button class="qvpe-upload-btn" id="qvpe-upload-btn">📁 PDF Upload Karo</button>
          <input type="file" id="qvpe-file-input" accept="application/pdf" style="display:none" />
          <div class="qvpe-upload-hint">Max file size: 30 MB · Max pages: 200 · Sab kuch browser me process hota hai</div>
        </div>

        <!-- Editor Screen -->
        <div class="qvpe-wrap qvpe-hidden" id="qvpe-editor-screen" style="position:static">
          <div class="qvpe-topbar">
            <button class="qvpe-btn-icon" id="qvpe-back" title="Close">←</button>
            <button class="qvpe-btn-icon" id="qvpe-toggle-sidebar" title="Pages">📄</button>
            <div class="qvpe-filename" id="qvpe-fname">document.pdf</div>
            <button class="qvpe-btn-icon" id="qvpe-undo" title="Undo" disabled>↶</button>
            <button class="qvpe-btn-icon" id="qvpe-redo" title="Redo" disabled>↷</button>
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

    // Update container size
    document.getElementById('qvpe-canvas-container').style.width = viewport.width + 'px';
    document.getElementById('qvpe-canvas-container').style.height = viewport.height + 'px';

    // Update page nav
    document.getElementById('qvpe-cur-page').textContent = pageNum;

    // Update thumbnails active
    document.querySelectorAll('.qvpe-thumb').forEach((t, i) => {
      t.classList.toggle('active', i + 1 === pageNum);
    });
  }

  // ---------- RENDER THUMBNAILS ----------
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

      // Lazy render
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

  // ---------- LOAD PDF ----------
  async function loadPDF(file) {
    // Validation
    if (file.size > MAX_FILE_SIZE) {
      toast('File 30 MB se badi hai. Chhoti PDF try karein.', 'error');
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

      // PDF.js load
      state.pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      state.totalPages = state.pdfDoc.numPages;

      if (state.totalPages > MAX_PAGES) {
        toast(`${MAX_PAGES} se zyada pages hain. Ye PDF support nahi hai.`, 'error');
        showLoading(false);
        return;
      }

      // pdf-lib load (for export later)
      state.pdfLibDoc = await window.PDFLib.PDFDocument.load(arrayBuffer.slice(0));

      // UI switch
      document.getElementById('qvpe-upload-screen').classList.add('qvpe-hidden');
      document.getElementById('qvpe-editor-screen').classList.remove('qvpe-hidden');
      document.getElementById('qvpe-fname').textContent = file.name;
      document.getElementById('qvpe-total-pages').textContent = state.totalPages;

      // Render
      await renderThumbnails();
      await renderPage(1);
      state.currentPage = 1;

      showLoading(false);
      toast('PDF load ho gayi ✅');
    } catch (err) {
      console.error(err);
      showLoading(false);
      toast('PDF load nahi ho payi. File corrupt ho sakti hai.', 'error');
    }
  }

  // ---------- LOADING ----------
  function showLoading(show, text) {
    const el = document.getElementById('qvpe-loading');
    if (!el) return;
    el.classList.toggle('qvpe-hidden', !show);
    if (text) el.querySelector('.qvpe-loading-text').textContent = text;
  }

  // ---------- INIT ----------
  function init() {
    injectCSS();

    // Upload button
    document.getElementById('qvpe-upload-btn').addEventListener('click', () => {
      document.getElementById('qvpe-file-input').click();
    });

    document.getElementById('qvpe-file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) loadPDF(file);
    });

    // Close
    document.getElementById('qvpe-back').addEventListener('click', () => {
      if (confirm('Editor band karein? Unsaved changes lost ho jaayenge.')) {
        document.getElementById('qvpe-wrap').classList.add('qvpe-hidden');
      }
    });

    // Sidebar toggle
    document.getElementById('qvpe-toggle-sidebar').addEventListener('click', () => {
      document.getElementById('qvpe-sidebar').classList.toggle('qvpe-hidden');
    });

    // Page nav
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

    // Zoom
    document.getElementById('qvpe-zoom-in').addEventListener('click', () => {
      state.scale = Math.min(state.scale + 0.25, 3);
      renderPage(state.currentPage);
    });
    document.getElementById('qvpe-zoom-out').addEventListener('click', () => {
      state.scale = Math.max(state.scale - 0.25, 0.4);
      renderPage(state.currentPage);
    });
    document.getElementById('qvpe-zoom-fit').addEventListener('click', () => {
      const wrap = document.getElementById('qvpe-canvas-wrap');
      // Simple fit: scale to 1.0
      state.scale = 1.0;
      renderPage(state.currentPage);
    });

    // Tool selection
    document.querySelectorAll('.qvpe-tool').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.qvpe-tool').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.tool = btn.dataset.tool;
        // Overlay activation for non-select tools
        const overlay = document.getElementById('qvpe-overlay');
        overlay.classList.toggle('active', state.tool !== 'select');
      });
    });

    // Save (placeholder — Part 3 me complete)
    document.getElementById('qvpe-save').addEventListener('click', () => {
      toast('Export feature Part 3 me aayega', 'error');
    });

    // Undo/Redo (placeholder)
    document.getElementById('qvpe-undo').disabled = true;
    document.getElementById('qvpe-redo').disabled = true;

    // Open editor on demand
    document.getElementById('qvpe-upload-screen').classList.remove('qvpe-hidden');
  }

  // ---------- PUBLIC OPEN ----------
  window.QVPE_OPEN = function () {
    document.getElementById('qvpe-wrap').classList.remove('qvpe-hidden');
  };

  // ---------- REGISTER ----------
  window.EXTRA_TOOL_RENDERERS = window.EXTRA_TOOL_RENDERERS || {};
  window.EXTRA_TOOL_INITS = window.EXTRA_TOOL_INITS || {};

  window.EXTRA_TOOL_RENDERERS['pdf-editor'] = function () {
    ensureLibraries().catch(console.error);
    return renderHTML();
  };

  window.EXTRA_TOOL_INITS['pdf-editor'] = function () {
    ensureLibraries().then(() => {
      init();
      // Auto-open fullscreen
      setTimeout(() => window.QVPE_OPEN(), 100);
    }).catch(() => {
      toast('Libraries load nahi hui. Internet check karein.', 'error');
    });
  };
})();