/* ============================================================
   QUNVERIO — IMAGE ENHANCER (FINAL)
   Auto Enhance + Manual Sliders + Filters + 8x Upscale
   + Before/After Compare + Bulk ZIP + 100% browser-side
   ============================================================ */

console.log('%cImage Enhancer loading...', 'color:#a855f7;font-weight:bold');

window.EXTRA_TOOL_RENDERERS['image-enhancer'] = () => `
  <div class="tool-container">

    <div class="card" id="ie-upload-card">
      <div class="ie-drop" id="ie-drop">
        <div class="ie-drop-icon">✨</div>
        <div class="ie-drop-title">Images drag & drop karo</div>
        <div class="ie-drop-sub">JPG • PNG • WebP • Multiple OK • Max 10MB each</div>
        <button class="btn btn-primary" onclick="document.getElementById('ie-file-input').click()">
          📁 Select Images
        </button>
        <input type="file" id="ie-file-input" accept="image/*" multiple hidden />
      </div>
      <div class="hint" style="text-align:center;margin-top:10px">
        🔒 100% browser me process — koi upload nahi hoti
      </div>
    </div>

    <div id="ie-workspace" style="display:none;">

      <div class="card">
        <label style="display:block;margin-bottom:8px;font-weight:600;">📸 Your Images</label>
        <div id="ie-chips" style="display:flex;flex-wrap:wrap;gap:8px;"></div>
      </div>

      <div class="card">
        <label style="display:block;margin-bottom:8px;font-weight:600;">👁️ Before / After</label>
        <div id="ie-compare" style="position:relative;width:100%;max-width:600px;margin:0 auto;overflow:hidden;border-radius:12px;background:repeating-conic-gradient(#e5e7eb 0 25%, #fff 0 50%) 50% / 20px 20px;touch-action:none;user-select:none;">
          <canvas id="ie-canvas-after" style="display:block;width:100%;height:auto;"></canvas>
          <div id="ie-clip" style="position:absolute;top:0;left:0;height:100%;width:50%;overflow:hidden;pointer-events:none;">
            <canvas id="ie-canvas-before" style="display:block;width:100%;height:auto;"></canvas>
          </div>
          <div id="ie-handle" style="position:absolute;top:0;left:50%;width:3px;height:100%;background:linear-gradient(135deg,#a855f7,#ec4899);transform:translateX(-50%);cursor:ew-resize;pointer-events:auto;">
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#a855f7,#ec4899);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;box-shadow:0 4px 12px rgba(0,0,0,0.4);font-size:18px;">⇄</div>
          </div>
          <div style="position:absolute;bottom:8px;left:8px;padding:4px 10px;background:rgba(0,0,0,0.7);color:white;border-radius:6px;font-size:12px;font-weight:700;">BEFORE</div>
          <div style="position:absolute;bottom:8px;right:8px;padding:4px 10px;background:linear-gradient(135deg,#a855f7,#ec4899);color:white;border-radius:6px;font-size:12px;font-weight:700;">AFTER</div>
        </div>
      </div>

      <div class="card">
        <label style="display:block;margin-bottom:8px;font-weight:600;">⚡ Quick Actions</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <button class="btn btn-primary" id="ie-auto">✨ Auto Enhance</button>
          <button class="btn btn-secondary" id="ie-reset">↺ Reset</button>
        </div>
        <label style="display:block;margin:12px 0 8px;font-weight:600;">🎨 Filters</label>
        <div id="ie-filters" style="display:flex;flex-wrap:wrap;gap:8px;">
          <button class="chip ie-filter active" data-filter="none">None</button>
          <button class="chip ie-filter" data-filter="grayscale">Grayscale</button>
          <button class="chip ie-filter" data-filter="sepia">Sepia</button>
          <button class="chip ie-filter" data-filter="vintage">Vintage</button>
          <button class="chip ie-filter" data-filter="cool">Cool</button>
          <button class="chip ie-filter" data-filter="warm">Warm</button>
        </div>
      </div>

      <div class="card">
        <label style="display:block;margin-bottom:12px;font-weight:600;">🎚️ Manual Adjustments</label>

        <div class="field">
          <label>☀️ Brightness <span id="ie-brightness-val" class="hint" style="float:right;">100%</span></label>
          <input type="range" id="ie-brightness" min="0" max="200" value="100" style="width:100%;" />
        </div>

        <div class="field">
          <label>◐ Contrast <span id="ie-contrast-val" class="hint" style="float:right;">100%</span></label>
          <input type="range" id="ie-contrast" min="0" max="200" value="100" style="width:100%;" />
        </div>

        <div class="field">
          <label>🎨 Saturation <span id="ie-saturation-val" class="hint" style="float:right;">100%</span></label>
          <input type="range" id="ie-saturation" min="0" max="200" value="100" style="width:100%;" />
        </div>

        <div class="field">
          <label>✨ Sharpness <span id="ie-sharpen-val" class="hint" style="float:right;">0</span></label>
          <input type="range" id="ie-sharpen" min="0" max="100" value="0" style="width:100%;" />
        </div>

        <div class="field">
          <label>🌡️ Warmth <span id="ie-warmth-val" class="hint" style="float:right;">0</span></label>
          <input type="range" id="ie-warmth" min="-100" max="100" value="0" style="width:100%;" />
        </div>

        <div class="field">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="ie-denoise" />
            <span>💧 Denoise (smooth noise)</span>
          </label>
        </div>
      </div>

      <div class="card">
        <label style="display:block;margin-bottom:8px;font-weight:600;">🚀 HD Upscale</label>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
          <button class="chip ie-upscale active" data-scale="1">1x</button>
          <button class="chip ie-upscale" data-scale="2">2x</button>
          <button class="chip ie-upscale" data-scale="4">4x</button>
          <button class="chip ie-upscale" data-scale="8">8x</button>
        </div>
        <div class="hint" style="margin-top:8px">
          💡 8x best quality — print-ready HD output (slow on big images)
        </div>
      </div>

      <div class="card">
        <label style="display:block;margin-bottom:8px;font-weight:600;">📤 Export</label>
        <div class="field">
          <label>Output Format</label>
          <select id="ie-format">
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
        <div class="field">
          <label>Quality <span id="ie-quality-val" class="hint" style="float:right;">92%</span></label>
          <input type="range" id="ie-quality" min="50" max="100" value="92" style="width:100%;" />
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
          <button class="btn btn-primary" id="ie-download-one">⬇ Download Current</button>
          <button class="btn btn-secondary" id="ie-download-all">📦 Download All (ZIP)</button>
        </div>
      </div>

    </div>
  </div>

  <style>
    .ie-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 30px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
    .ie-drop:hover, .ie-drop.dragover { border-color: var(--primary); background: var(--surface-hover); }
    .ie-drop-icon { font-size: 42px; margin-bottom: 8px; }
    .ie-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .ie-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }
  </style>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['image-enhancer'] = () => {
  const state = {
    images: [],
    currentId: null,
    upscale: 1,
  };

  const fileInput = document.getElementById('ie-file-input');
  const dropZone = document.getElementById('ie-drop');
  const workspace = document.getElementById('ie-workspace');
  const chipsEl = document.getElementById('ie-chips');
  const canvasAfter = document.getElementById('ie-canvas-after');
  const canvasBefore = document.getElementById('ie-canvas-before');
  const clipEl = document.getElementById('ie-clip');
  const handleEl = document.getElementById('ie-handle');
  const compareEl = document.getElementById('ie-compare');

  const brightnessEl = document.getElementById('ie-brightness');
  const contrastEl = document.getElementById('ie-contrast');
  const saturationEl = document.getElementById('ie-saturation');
  const sharpenEl = document.getElementById('ie-sharpen');
  const warmthEl = document.getElementById('ie-warmth');
  const denoiseEl = document.getElementById('ie-denoise');

  const brightnessVal = document.getElementById('ie-brightness-val');
  const contrastVal = document.getElementById('ie-contrast-val');
  const saturationVal = document.getElementById('ie-saturation-val');
  const sharpenVal = document.getElementById('ie-sharpen-val');
  const warmthVal = document.getElementById('ie-warmth-val');

  const formatEl = document.getElementById('ie-format');
  const qualityEl = document.getElementById('ie-quality');
  const qualityVal = document.getElementById('ie-quality-val');

  /* -------- File Upload -------- */
  fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      if (!file.type.startsWith('image/')) { toast(`${file.name}: not an image`, 'error'); continue; }
      if (file.size > 10 * 1024 * 1024) { toast(`${file.name}: >10MB skipped`, 'error'); continue; }
      try {
        const img = await loadImage(file);
        state.images.push({
          id: 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          name: file.name,
          img,
          width: img.naturalWidth,
          height: img.naturalHeight,
          settings: getDefaultSettings(),
        });
      } catch (err) { console.error(err); toast(`${file.name}: load failed`, 'error'); }
    }
    fileInput.value = '';
    if (state.images.length) {
      workspace.style.display = '';
      dropZone.parentElement.style.display = 'none';
      state.currentId = state.images[0].id;
      renderChips();
      loadCurrent();
      toast(`${state.images.length} image(s) loaded`, 'success');
    }
  });

  /* -------- Drag & Drop -------- */
  ['dragenter', 'dragover'].forEach(ev => {
    dropZone.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(ev => {
    dropZone.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('dragover'); });
  });
  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length) {
      const fakeEvent = { target: { files: dt.files, value: '' } };
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event('change'));
    }
  });
  dropZone.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    fileInput.click();
  });

  function getDefaultSettings() {
    return { brightness: 100, contrast: 100, saturation: 100, sharpen: 0, warmth: 0, denoise: false, filter: 'none' };
  }

  /* -------- Chips -------- */
  function renderChips() {
    chipsEl.innerHTML = '';
    state.images.forEach((im, i) => {
      const chip = document.createElement('button');
      chip.className = 'chip' + (im.id === state.currentId ? ' active' : '');
      chip.textContent = `${i + 1}. ${truncate(im.name, 18)}`;
      chip.title = im.name;
      chip.addEventListener('click', () => {
        state.currentId = im.id;
        renderChips();
        loadCurrent();
      });
      chipsEl.appendChild(chip);
    });
  }
  function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  /* -------- Load Current -------- */
  function loadCurrent() {
    const cur = getCurrent();
    if (!cur) return;

    canvasBefore.width = cur.width;
    canvasBefore.height = cur.height;
    const bctx = canvasBefore.getContext('2d');
    bctx.clearRect(0, 0, cur.width, cur.height);
    bctx.drawImage(cur.img, 0, 0);

    const s = cur.settings;
    brightnessEl.value = s.brightness;
    contrastEl.value = s.contrast;
    saturationEl.value = s.saturation;
    sharpenEl.value = s.sharpen;
    warmthEl.value = s.warmth;
    denoiseEl.checked = s.denoise;

    brightnessVal.textContent = s.brightness + '%';
    contrastVal.textContent = s.contrast + '%';
    saturationVal.textContent = s.saturation + '%';
    sharpenVal.textContent = s.sharpen;
    warmthVal.textContent = s.warmth;

    document.querySelectorAll('.ie-filter').forEach((b) => {
      b.classList.toggle('active', b.dataset.filter === s.filter);
    });

    renderAfter();
    resetComparePos();
  }

  function getCurrent() { return state.images.find((x) => x.id === state.currentId); }

  /* -------- Core Render -------- */
  function renderAfter() {
    const cur = getCurrent();
    if (!cur) return;

    const s = cur.settings;
    canvasAfter.width = cur.width;
    canvasAfter.height = cur.height;
    const ctx = canvasAfter.getContext('2d');
    ctx.drawImage(cur.img, 0, 0);

    if (s.denoise) applyBoxBlur(ctx, cur.width, cur.height, 1);

    const needsColorAdj = s.brightness !== 100 || s.contrast !== 100 || s.saturation !== 100 || s.filter !== 'none' || s.warmth !== 0;
    if (needsColorAdj) applyColorAdjust(ctx, cur.width, cur.height, s);

    if (s.sharpen > 0) applySharpen(ctx, cur.width, cur.height, s.sharpen);
  }

  function applyBoxBlur(ctx, w, h, radius) {
    const src = ctx.getImageData(0, 0, w, h);
    const out = ctx.createImageData(w, h);
    const sp = src.data; const op = out.data; const r = radius;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const idx = (ny * w + nx) * 4;
            rSum += sp[idx]; gSum += sp[idx + 1]; bSum += sp[idx + 2]; count++;
          }
        }
        const i = (y * w + x) * 4;
        op[i] = rSum / count; op[i + 1] = gSum / count; op[i + 2] = bSum / count; op[i + 3] = sp[i + 3];
      }
    }
    ctx.putImageData(out, 0, 0);
  }

  function applyColorAdjust(ctx, w, h, s) {
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const b = s.brightness / 100;
    const c = s.contrast / 100;
    const sat = s.saturation / 100;
    const warmth = s.warmth / 100;
    const filter = s.filter;

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], bl = d[i + 2];

      r *= b; g *= b; bl *= b;

      r = (r - 128) * c + 128;
      g = (g - 128) * c + 128;
      bl = (bl - 128) * c + 128;

      const gray = 0.299 * r + 0.587 * g + 0.114 * bl;
      r = gray + (r - gray) * sat;
      g = gray + (g - gray) * sat;
      bl = gray + (bl - gray) * sat;

      if (warmth > 0) { r *= 1 + warmth * 0.2; g *= 1 + warmth * 0.05; bl *= 1 - warmth * 0.15; }
      else if (warmth < 0) { r *= 1 + warmth * 0.15; g *= 1 + warmth * 0.02; bl *= 1 - warmth * 0.2; }

      if (filter === 'grayscale') { const gy = 0.299 * r + 0.587 * g + 0.114 * bl; r = g = bl = gy; }
      else if (filter === 'sepia') {
        const sr = 0.393 * r + 0.769 * g + 0.189 * bl;
        const sg = 0.349 * r + 0.686 * g + 0.168 * bl;
        const sb = 0.272 * r + 0.534 * g + 0.131 * bl;
        r = sr; g = sg; bl = sb;
      }
      else if (filter === 'vintage') { r = r * 0.9 + 40; g = g * 0.85 + 20; bl = bl * 0.75; }
      else if (filter === 'cool') { r *= 0.9; bl *= 1.15; }
      else if (filter === 'warm') { r *= 1.12; g *= 1.03; bl *= 0.88; }

      d[i] = clamp255(r); d[i + 1] = clamp255(g); d[i + 2] = clamp255(bl);
    }
    ctx.putImageData(img, 0, 0);
  }

  function clamp255(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

  function applySharpen(ctx, w, h, amount) {
    const strength = amount / 100;
    const a = strength;
    const center = 1 + 4 * a;
    const src = ctx.getImageData(0, 0, w, h);
    const out = ctx.createImageData(w, h);
    const sp = src.data; const op = out.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        for (let ch = 0; ch < 3; ch++) {
          let sum = 0;
          if (y > 0) sum += -a * sp[((y - 1) * w + x) * 4 + ch];
          if (y < h - 1) sum += -a * sp[((y + 1) * w + x) * 4 + ch];
          if (x > 0) sum += -a * sp[(y * w + (x - 1)) * 4 + ch];
          if (x < w - 1) sum += -a * sp[(y * w + (x + 1)) * 4 + ch];
          sum += center * sp[i + ch];
          op[i + ch] = clamp255(sum);
        }
        op[i + 3] = sp[i + 3];
      }
    }
    ctx.putImageData(out, 0, 0);
  }

  /* -------- Sliders -------- */
  function bindSlider(el, valEl, key, suffix = '%') {
    el.addEventListener('input', () => {
      const v = parseInt(el.value, 10);
      valEl.textContent = v + suffix;
      const cur = getCurrent(); if (!cur) return;
      cur.settings[key] = v;
      renderAfter();
    });
  }
  bindSlider(brightnessEl, brightnessVal, 'brightness');
  bindSlider(contrastEl, contrastVal, 'contrast');
  bindSlider(saturationEl, saturationVal, 'saturation');
  bindSlider(sharpenEl, sharpenVal, 'sharpen', '');
  bindSlider(warmthEl, warmthVal, 'warmth', '');

  denoiseEl.addEventListener('change', () => {
    const cur = getCurrent(); if (!cur) return;
    cur.settings.denoise = denoiseEl.checked;
    renderAfter();
  });

  /* -------- Filters -------- */
  document.querySelectorAll('.ie-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ie-filter').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cur = getCurrent(); if (!cur) return;
      cur.settings.filter = btn.dataset.filter;
      renderAfter();
    });
  });

  /* -------- Upscale Buttons -------- */
  document.querySelectorAll('.ie-upscale').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ie-upscale').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.upscale = parseInt(btn.dataset.scale, 10);
      const note = state.upscale === 1 ? '1x (original)' : state.upscale + 'x HD upscale';
      toast('Upscale: ' + note, 'success');
    });
  });

  /* -------- Auto Enhance -------- */
  document.getElementById('ie-auto').addEventListener('click', () => {
    const cur = getCurrent(); if (!cur) return;
    const ctx = canvasAfter.getContext('2d');
    const data = ctx.getImageData(0, 0, canvasAfter.width, canvasAfter.height).data;
    let sum = 0, count = 0;
    for (let i = 0; i < data.length; i += 80) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      count++;
    }
    const avg = sum / count;
    const target = 130;
    const delta = target - avg;
    let newBrightness = 100 + (delta / 255) * 100;
    newBrightness = Math.max(80, Math.min(140, newBrightness));

    cur.settings.brightness = Math.round(newBrightness);
    cur.settings.contrast = 115;
    cur.settings.saturation = 115;
    cur.settings.sharpen = 25;
    cur.settings.warmth = 5;
    cur.settings.denoise = false;

    brightnessEl.value = cur.settings.brightness;
    brightnessVal.textContent = cur.settings.brightness + '%';
    contrastEl.value = cur.settings.contrast;
    contrastVal.textContent = cur.settings.contrast + '%';
    saturationEl.value = cur.settings.saturation;
    saturationVal.textContent = cur.settings.saturation + '%';
    sharpenEl.value = cur.settings.sharpen;
    sharpenVal.textContent = cur.settings.sharpen;
    warmthEl.value = cur.settings.warmth;
    warmthVal.textContent = cur.settings.warmth;
    denoiseEl.checked = false;

    renderAfter();
    toast('✨ Auto enhanced!', 'success');
  });

  /* -------- Reset -------- */
  document.getElementById('ie-reset').addEventListener('click', () => {
    const cur = getCurrent(); if (!cur) return;
    cur.settings = getDefaultSettings();
    loadCurrent();
    toast('↺ Reset done', 'success');
  });

  /* -------- Compare Slider -------- */
  let dragging = false;
  function setComparePos(clientX) {
    const rect = compareEl.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    clipEl.style.width = pct + '%';
    handleEl.style.left = pct + '%';
  }
  function resetComparePos() { clipEl.style.width = '50%'; handleEl.style.left = '50%'; }
  function startDrag(e) { dragging = true; e.preventDefault(); }
  function stopDrag() { dragging = false; }
  function moveDrag(e) {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setComparePos(x);
  }
  handleEl.addEventListener('mousedown', startDrag);
  handleEl.addEventListener('touchstart', startDrag, { passive: false });
  compareEl.addEventListener('mousedown', (e) => { startDrag(e); setComparePos(e.clientX); });
  compareEl.addEventListener('touchstart', (e) => { startDrag(e); setComparePos(e.touches[0].clientX); }, { passive: false });
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('touchmove', moveDrag, { passive: false });
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);

  /* -------- Quality -------- */
  qualityEl.addEventListener('input', () => {
    qualityVal.textContent = qualityEl.value + '%';
  });

  /* -------- Export Helpers -------- */
  function exportCanvas(canvas, format, quality) {
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), format, quality / 100));
  }
  function makeFilename(originalName, format) {
    const base = originalName.replace(/\.[^.]+$/, '');
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    return `${base}_enhanced.${ext}`;
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* -------- Upscale Render (using canvas drawImage smoothing) -------- */
  function buildUpscaledCanvas(sourceCanvas, scale) {
    if (scale === 1) return sourceCanvas;
    const w = sourceCanvas.width * scale;
    const h = sourceCanvas.height * scale;
    const out = document.createElement('canvas');
    out.width = w; out.height = h;
    const ctx = out.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceCanvas, 0, 0, w, h);
    // Apply mild sharpen after upscale for crispness
    if (scale >= 2) applySharpen(ctx, w, h, 15);
    return out;
  }

  /* -------- Download Current -------- */
  document.getElementById('ie-download-one').addEventListener('click', async () => {
    const cur = getCurrent(); if (!cur) return;
    const format = formatEl.value;
    const quality = parseInt(qualityEl.value, 10);
    toast('⏳ Rendering...', 'success');
    const upscaled = buildUpscaledCanvas(canvasAfter, state.upscale);
    const blob = await exportCanvas(upscaled, format, quality);
    if (!blob) return toast('Export failed', 'error');
    downloadBlob(blob, makeFilename(cur.name, format));
    toast('✅ Downloaded!', 'success');
  });

  /* -------- Download All ZIP -------- */
  document.getElementById('ie-download-all').addEventListener('click', async () => {
    if (state.images.length < 1) return;
    if (typeof JSZip === 'undefined') { toast('JSZip loading... retry in 1s', 'error'); return; }
    toast('📦 Preparing ZIP...', 'success');

    const zip = new JSZip();
    const format = formatEl.value;
    const quality = parseInt(qualityEl.value, 10);
    const currentId = state.currentId;

    for (const im of state.images) {
      const tmp = document.createElement('canvas');
      tmp.width = im.width;
      tmp.height = im.height;
      const ctx = tmp.getContext('2d');
      ctx.drawImage(im.img, 0, 0);

      const s = im.settings;
      if (s.denoise) applyBoxBlur(ctx, im.width, im.height, 1);
      const needsColorAdj = s.brightness !== 100 || s.contrast !== 100 || s.saturation !== 100 || s.filter !== 'none' || s.warmth !== 0;
      if (needsColorAdj) applyColorAdjust(ctx, im.width, im.height, s);
      if (s.sharpen > 0) applySharpen(ctx, im.width, im.height, s.sharpen);

      const upscaled = buildUpscaledCanvas(tmp, state.upscale);
      const blob = await exportCanvas(upscaled, format, quality);
      if (blob) zip.file(makeFilename(im.name, format), blob);
    }

    state.currentId = currentId;
    renderAfter();

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `qunverio_enhanced_${Date.now()}.zip`);
    toast('✅ ZIP downloaded!', 'success');
  });

  /* -------- Helpers -------- */
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }

  /* -------- Load JSZip on demand -------- */
  if (typeof JSZip === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    s.async = true;
    document.head.appendChild(s);
  }
};

console.log('%c✅ Image Enhancer loaded', 'color:#a855f7;font-weight:bold');