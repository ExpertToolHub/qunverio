// Background Remover — Hybrid Color-Based (Mobile-First, 100% Client-Side)

window.EXTRA_TOOL_RENDERERS['background-remover'] = () => `
  <div class="card">
    <div class="field">
      <label>Upload Image</label>
      <input type="file" id="bgrm-file" accept="image/*" />
    </div>

    <div id="bgrm-workspace" style="display:none;">
      <div style="position:relative;margin:16px 0;background:
        repeating-conic-gradient(#2a2f55 0% 25%, #1c2250 0% 50%) 50%/20px 20px;
        border-radius:12px;overflow:hidden;touch-action:none;">
        <canvas id="bgrm-canvas" style="max-width:100%;display:block;margin:0 auto;"></canvas>
      </div>

      <div class="field">
        <label>Tolerance: <span id="bgrm-tol-val">30</span></label>
        <input type="range" id="bgrm-tol" min="5" max="120" value="30" style="width:100%;" />
        <div class="hint">Zyada = zyada background remove. Kam = safe.</div>
      </div>

      <div class="field">
        <label>Tool Mode</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="chip" id="bgrm-mode-auto" data-active="1">🎯 Auto Remove</button>
          <button class="chip" id="bgrm-mode-brush">🖌️ Erase Brush</button>
          <button class="chip" id="bgrm-mode-restore">↩️ Restore</button>
          <button class="chip" id="bgrm-mode-pick">💧 Pick Color</button>
        </div>
      </div>

      <div class="field" id="bgrm-brush-size-wrap" style="display:none;">
        <label>Brush Size: <span id="bgrm-brush-val">25</span>px</label>
        <input type="range" id="bgrm-brush" min="5" max="80" value="25" style="width:100%;" />
      </div>

      <div class="field">
        <label>Background</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="chip" data-bg="transparent" data-active="1">⬜ Transparent</button>
          <button class="chip" data-bg="#ffffff">⬜ White</button>
          <button class="chip" data-bg="#000000">⬛ Black</button>
          <button class="chip" data-bg="#6366f1">🟦 Blue</button>
          <button class="chip" data-bg="#ef4444">🟥 Red</button>
          <button class="chip" data-bg="#10b981">🟩 Green</button>
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">
        <button class="btn btn-primary" id="bgrm-download">⬇️ Download PNG</button>
        <button class="btn btn-secondary" id="bgrm-reset">🔄 Reset</button>
      </div>
    </div>

    <div class="hint" style="margin-top:12px;">
      💡 <b>Tip:</b> Solid/plain background wali images best result deti hain
      (passport photo, product shot, studio background). Complex backgrounds ke liye
      "Erase Brush" use karo.
    </div>
  </div>
`;

window.EXTRA_TOOL_INITS['background-remover'] = () => {
  const fileInput = document.getElementById('bgrm-file');
  const workspace = document.getElementById('bgrm-workspace');
  const canvas = document.getElementById('bgrm-canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const tolSlider = document.getElementById('bgrm-tol');
  const tolVal = document.getElementById('bgrm-tol-val');
  const brushSlider = document.getElementById('bgrm-brush');
  const brushVal = document.getElementById('bgrm-brush-val');
  const brushWrap = document.getElementById('bgrm-brush-size-wrap');

  let origCanvas = null;      // pristine copy
  let workCanvas = null;      // current editable
  let origData = null;        // pristine ImageData
  let working = false;
  let mode = 'auto';          // auto | brush | restore | pick
  let pickedColor = null;
  let bgColor = 'transparent';
  let displayCanvas = null;   // for compositing bg preview

  // ---------- Load Image ----------
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Cap dimension for mobile perf (max 1600px)
        const MAX = 1600;
        let w = img.width, h = img.height;
        if (Math.max(w, h) > MAX) {
          const scale = MAX / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        origData = ctx.getImageData(0, 0, w, h);
        workCanvas = document.createElement('canvas');
        workCanvas.width = w; workCanvas.height = h;
        workCanvas.getContext('2d').putImageData(origData, 0, 0);
        origCanvas = workCanvas;

        workspace.style.display = 'block';
        autoRemove();
        render();
        toast('Image loaded. Auto-removing background...', 'success');
      };
      img.onerror = () => toast('Failed to load image', 'error');
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // ---------- Auto Background Removal (Flood-fill from edges) ----------
  function autoRemove() {
    if (!origData) return;
    const w = origData.width, h = origData.height;
    const src = new Uint8ClampedArray(origData.data);
    const out = new Uint8ClampedArray(src); // copy
    const tol = parseInt(tolSlider.value);
    const tolSq = tol * tol * 3;

    // Sample background color from 4 corners + edge midpoints
    const samples = [
      [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
      [w >> 1, 0], [w >> 1, h - 1], [0, h >> 1], [w - 1, h >> 1]
    ];
    let rSum = 0, gSum = 0, bSum = 0;
    for (const [x, y] of samples) {
      const i = (y * w + x) * 4;
      rSum += src[i]; gSum += src[i + 1]; bSum += src[i + 2];
    }
    const n = samples.length;
    const bgR = rSum / n, bgG = gSum / n, bgB = bSum / n;

    // BFS from all 4 edges
    const visited = new Uint8Array(w * h);
    const queue = [];

    function tryPush(x, y) {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const idx = y * w + x;
      if (visited[idx]) return;
      const i = idx * 4;
      const dr = src[i] - bgR, dg = src[i + 1] - bgG, db = src[i + 2] - bgB;
      if (dr * dr + dg * dg + db * db <= tolSq) {
        visited[idx] = 1;
        queue.push(idx);
      }
    }

    for (let x = 0; x < w; x++) { tryPush(x, 0); tryPush(x, h - 1); }
    for (let y = 0; y < h; y++) { tryPush(0, y); tryPush(w - 1, y); }

    let head = 0;
    while (head < queue.length) {
      const idx = queue[head++];
      const x = idx % w, y = (idx / w) | 0;
      // Mark transparent
      out[idx * 4 + 3] = 0;
      tryPush(x + 1, y); tryPush(x - 1, y);
      tryPush(x, y + 1); tryPush(x, y - 1);
    }

    // Feathering: soften edges (1-pass)
    featherAlpha(out, w, h);

    const wctx = workCanvas.getContext('2d');
    wctx.putImageData(new ImageData(out, w, h), 0, 0);
  }

  function featherAlpha(data, w, h) {
    // Simple 1-pixel blur on alpha channel edges
    const copy = new Uint8ClampedArray(data.length);
    copy.set(data);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4 + 3;
        const a = copy[i];
        if (a === 0 || a === 255) continue;
        let sum = 0, cnt = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            sum += copy[((y + dy) * w + (x + dx)) * 4 + 3];
            cnt++;
          }
        data[i] = sum / cnt;
      }
    }
  }

  // ---------- Render (composite with background color) ----------
  function render() {
    if (!workCanvas) return;
    const w = workCanvas.width, h = workCanvas.height;
    ctx.clearRect(0, 0, w, h);

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
    } else {
      // Checkerboard for transparency preview
      const s = 10;
      for (let y = 0; y < h; y += s) {
        for (let x = 0; x < w; x += s) {
          ctx.fillStyle = ((x / s + y / s) % 2 === 0) ? '#2a2f55' : '#1c2250';
          ctx.fillRect(x, y, s, s);
        }
      }
    }
    ctx.drawImage(workCanvas, 0, 0);
  }

  // ---------- Tolerance slider ----------
  tolSlider.addEventListener('input', () => {
    tolVal.textContent = tolSlider.value;
    if (mode === 'auto' && origData) {
      debounceAuto();
    }
  });

  let autoTimer = null;
  function debounceAuto() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => { autoRemove(); render(); }, 150);
  }

  // ---------- Mode switching ----------
  const modeBtns = {
    auto: document.getElementById('bgrm-mode-auto'),
    brush: document.getElementById('bgrm-mode-brush'),
    restore: document.getElementById('bgrm-mode-restore'),
    pick: document.getElementById('bgrm-mode-pick'),
  };

  function setMode(m) {
    mode = m;
    Object.entries(modeBtns).forEach(([k, btn]) => {
      btn.dataset.active = (k === m) ? '1' : '0';
      btn.style.background = (k === m) ? 'var(--gradient)' : '';
      btn.style.color = (k === m) ? '#fff' : '';
    });
    brushWrap.style.display = (m === 'brush' || m === 'restore') ? 'block' : 'none';
    canvas.style.cursor = (m === 'pick') ? 'crosshair' : 'default';
  }

  modeBtns.auto.addEventListener('click', () => { setMode('auto'); autoRemove(); render(); });
  modeBtns.brush.addEventListener('click', () => setMode('brush'));
  modeBtns.restore.addEventListener('click', () => setMode('restore'));
  modeBtns.pick.addEventListener('click', () => setMode('pick'));
  setMode('auto');

  brushSlider.addEventListener('input', () => {
    brushVal.textContent = brushSlider.value;
  });

  // ---------- Background color chips ----------
  document.querySelectorAll('#bgrm-workspace .chip[data-bg]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#bgrm-workspace .chip[data-bg]').forEach(c => {
        c.dataset.active = '0'; c.style.background = ''; c.style.color = '';
      });
      chip.dataset.active = '1';
      chip.style.background = 'var(--gradient)';
      chip.style.color = '#fff';
      bgColor = chip.dataset.bg;
      render();
    });
  });

  // ---------- Canvas interaction (brush / pick) ----------
  let drawing = false;
  let lastX = 0, lastY = 0;

  function canvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let cx, cy;
    if (e.touches && e.touches[0]) {
      cx = (e.touches[0].clientX - rect.left) * scaleX;
      cy = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      cx = (e.clientX - rect.left) * scaleX;
      cy = (e.clientY - rect.top) * scaleY;
    }
    return { x: cx, y: cy };
  }

  function paint(x, y, erase) {
    const wctx = workCanvas.getContext('2d');
    const size = parseInt(brushSlider.value);
    wctx.save();
    wctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
    if (!erase) {
      // Restore from original
      const r = size / 2;
      wctx.beginPath();
      wctx.arc(x, y, r, 0, Math.PI * 2);
      wctx.clip();
      wctx.drawImage(origCanvas, 0, 0);
    } else {
      wctx.beginPath();
      wctx.arc(x, y, size / 2, 0, Math.PI * 2);
      wctx.fill();
    }
    wctx.restore();
  }

  function startDraw(e) {
    if (mode !== 'brush' && mode !== 'restore') return;
    e.preventDefault();
    drawing = true;
    const { x, y } = canvasCoords(e);
    lastX = x; lastY = y;
    paint(x, y, mode === 'brush');
    render();
  }

  function moveDraw(e) {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = canvasCoords(e);
    // Interpolate between points for smooth stroke
    const dist = Math.hypot(x - lastX, y - lastY);
    const steps = Math.max(1, Math.floor(dist / 3));
    for (let s = 1; s <= steps; s++) {
      const ix = lastX + (x - lastX) * (s / steps);
      const iy = lastY + (y - lastY) * (s / steps);
      paint(ix, iy, mode === 'brush');
    }
    lastX = x; lastY = y;
    render();
  }

  function endDraw() { drawing = false; }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', moveDraw, { passive: false });
  canvas.addEventListener('touchend', endDraw);

  // Pick color mode
  canvas.addEventListener('click', (e) => {
    if (mode !== 'pick') return;
    const { x, y } = canvasCoords(e);
    const px = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
    pickedColor = [px[0], px[1], px[2]];
    toast(`Color picked: RGB(${px[0]}, ${px[1]}, ${px[2]})`, 'success');
    // Auto switch to auto mode and remove from this color
    removeColor(pickedColor, parseInt(tolSlider.value));
    render();
  });

  function removeColor(rgb, tol) {
    if (!origData) return;
    const w = origData.width, h = origData.height;
    const src = new Uint8ClampedArray(origData.data);
    const out = new Uint8ClampedArray(src);
    const tolSq = tol * tol * 3;
    const [tr, tg, tb] = rgb;
    for (let i = 0; i < src.length; i += 4) {
      const dr = src[i] - tr, dg = src[i + 1] - tg, db = src[i + 2] - tb;
      if (dr * dr + dg * dg + db * db <= tolSq) {
        out[i + 3] = 0;
      }
    }
    const wctx = workCanvas.getContext('2d');
    wctx.putImageData(new ImageData(out, w, h), 0, 0);
  }

  // ---------- Reset ----------
  document.getElementById('bgrm-reset').addEventListener('click', () => {
    if (!origData) return;
    const wctx = workCanvas.getContext('2d');
    wctx.putImageData(origData, 0, 0);
    render();
    toast('Reset done', 'success');
  });

  // ---------- Download ----------
  document.getElementById('bgrm-download').addEventListener('click', () => {
    if (!workCanvas) return;
    // Export at original resolution (composite bg if set)
    const w = workCanvas.width, h = workCanvas.height;
    const exp = document.createElement('canvas');
    exp.width = w; exp.height = h;
    const ectx = exp.getContext('2d');
    if (bgColor !== 'transparent') {
      ectx.fillStyle = bgColor;
      ectx.fillRect(0, 0, w, h);
    }
    ectx.drawImage(workCanvas, 0, 0);

    exp.toBlob((blob) => {
      if (!blob) { toast('Export failed', 'error'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qunverio-bg-removed-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Downloaded!', 'success');
    }, 'image/png');
  });
};