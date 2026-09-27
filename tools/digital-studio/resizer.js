/* ============================================================
   QUNVERIO — IMAGE RESIZER (tools/digital-studio/resizer.js)
   Resize images by pixels, percentage, or presets
   ============================================================ */

console.log('%cImage Resizer module loading...', 'color:#f59e0b;font-weight:bold');

let irFiles = [];         // [{ id, file, name, size, origW, origH, newW, newH, preview }]
let irBusy = false;
let irGlobalMode = 'pixels';   // pixels | percent | preset
let irSettings = {
  width: 800,
  height: 600,
  lockAspect: true,
  percent: 50,
  preset: 'custom',
  format: 'original',   // original | jpg | png | webp
  quality: 0.92
};

/* ============================================================
   PRESETS
   ============================================================ */
const IR_PRESETS = {
  instagram_post:   { w: 1080, h: 1080, label: '📷 Instagram Post (1080×1080)' },
  instagram_story:  { w: 1080, h: 1920, label: '📷 Instagram Story (1080×1920)' },
  facebook_post:    { w: 1200, h: 630,  label: '📘 Facebook Post (1200×630)' },
  facebook_cover:   { w: 820,  h: 312,  label: '📘 Facebook Cover (820×312)' },
  youtube_thumb:    { w: 1280, h: 720,  label: '📺 YouTube Thumbnail (1280×720)' },
  twitter_post:     { w: 1200, h: 675,  label: '🐦 Twitter Post (1200×675)' },
  whatsapp_dp:      { w: 500,  h: 500,  label: '💬 WhatsApp DP (500×500)' },
  passport:         { w: 413,  h: 531,  label: '🛂 Passport Photo (35×45mm @300dpi)' },
  a4_300dpi:        { w: 2480, h: 3508, label: '📄 A4 @300dpi (2480×3508)' },
  hd_720:           { w: 1280, h: 720,  label: '🖥️ HD (1280×720)' },
  hd_1080:          { w: 1920, h: 1080, label: '🖥️ Full HD (1920×1080)' },
  hd_4k:            { w: 3840, h: 2160, label: '🖥️ 4K (3840×2160)' }
};

/* ============================================================
   HELPERS
   ============================================================ */
function irFmtSize(bytes) {
  if (!bytes) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0, n = bytes;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return n.toFixed(n < 10 ? 2 : 1) + ' ' + u[i];
}

function irFmtName(name, max = 32) {
  if (!name) return '';
  if (name.length <= max) return name;
  const ext = name.split('.').pop();
  const base = name.slice(0, max - ext.length - 4);
  return base + '...' + ext;
}

function irToast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

function irUid() {
  return 'ir_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function irIsImage(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name || '');
}

function irBaseName(name) {
  return (name || 'image').replace(/\.[^.]+$/, '').replace(/[^a-z0-9_\-]/gi, '_');
}

/* ============================================================
   LOAD IMAGE
   ============================================================ */
function irLoadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => resolve({
        dataUrl: ev.target.result,
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      img.onerror = () => reject(new Error('decode fail'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('read fail'));
    reader.readAsDataURL(file);
  });
}

async function irAddFiles(fileList) {
  const files = Array.from(fileList).filter(irIsImage);
  if (files.length === 0) {
    irToast('❌ Sirf images select karo', 'error');
    return;
  }
  if (irBusy) return;
  irBusy = true;
  const statusEl = document.getElementById('irStatus');
  let added = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 50 * 1024 * 1024) {
      irToast(`⚠️ ${irFmtName(file.name)} 50MB se bada`, 'error');
      continue;
    }
    if (statusEl) statusEl.textContent = `⏳ Loading ${i + 1}/${files.length}...`;
    try {
      const info = await irLoadImage(file);
      irFiles.push({
        id: irUid(),
        file,
        name: file.name,
        size: file.size,
        dataUrl: info.dataUrl,
        origW: info.width,
        origH: info.height,
        aspect: info.width / info.height
      });
      added++;
      irRenderList();
      await new Promise(r => setTimeout(r, 15));
    } catch (e) {
      irToast(`❌ ${irFmtName(file.name)} load nahi hui`, 'error');
    }
  }
  irBusy = false;
  if (statusEl) statusEl.textContent = '';
  if (added > 0) {
    irToast(`✅ ${added} image${added > 1 ? 's' : ''} added`, 'success');
    irRenderList();
  }
}

/* ============================================================
   RENDER LIST
   ============================================================ */
function irRenderList() {
  const list = document.getElementById('irList');
  const empty = document.getElementById('irEmpty');
  const panel = document.getElementById('irPanel');
  if (!list) return;

  if (irFiles.length === 0) {
    if (empty) empty.style.display = 'block';
    if (panel) panel.style.display = 'none';
    list.innerHTML = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (panel) panel.style.display = 'block';

  const targetDims = irGetTargetDims();

  list.innerHTML = irFiles.map((f, i) => {
    const preview = irCalcDims(f, targetDims);
    return `
      <div class="ir-item" data-id="${f.id}">
        <div class="ir-num">${i + 1}</div>
        <div class="ir-thumb"><img src="${f.dataUrl}" alt=""></div>
        <div class="ir-info">
          <div class="ir-name" title="${f.name}">${irFmtName(f.name, 34)}</div>
          <div class="ir-meta">
            <span class="ir-orig">${f.origW}×${f.origH}</span>
            <span class="ir-arrow">→</span>
            <span class="ir-new">${preview.w}×${preview.h}</span>
            <span class="ir-size">(${irFmtSize(f.size)})</span>
          </div>
        </div>
        <button class="ir-btn ir-del" onclick="irRemove('${f.id}')">✕</button>
      </div>
    `;
  }).join('');

  irUpdateStats();
}

window.irRemove = (id) => {
  irFiles = irFiles.filter(x => x.id !== id);
  irRenderList();
};

window.irClearAll = () => {
  if (irFiles.length === 0) return;
  if (!confirm('Saari images hata dein?')) return;
  irFiles = [];
  irRenderList();
  irToast('🗑️ Saari images remove');
};

function irUpdateStats() {
  const el = document.getElementById('irStats');
  if (!el) return;
  if (irFiles.length === 0) { el.textContent = ''; return; }
  const totalSize = irFiles.reduce((s, x) => s + x.size, 0);
  el.innerHTML = `📊 <strong>${irFiles.length}</strong> image${irFiles.length > 1 ? 's' : ''} • 
    <strong>${irFmtSize(totalSize)}</strong> total`;
}

/* ============================================================
   DIM CALCULATION
   ============================================================ */
function irGetTargetDims() {
  if (irGlobalMode === 'pixels') {
    return { w: parseInt(irSettings.width) || 800, h: parseInt(irSettings.height) || 600, lock: irSettings.lockAspect };
  }
  if (irGlobalMode === 'percent') {
    return { percent: parseFloat(irSettings.percent) || 50 };
  }
  if (irGlobalMode === 'preset') {
    const p = IR_PRESETS[irSettings.preset];
    if (p) return { w: p.w, h: p.h, lock: false };
    return { w: 800, h: 600, lock: false };
  }
  return { w: 800, h: 600, lock: false };
}

function irCalcDims(f, target) {
  if (target.percent) {
    const s = target.percent / 100;
    return { w: Math.max(1, Math.round(f.origW * s)), h: Math.max(1, Math.round(f.origH * s)) };
  }
  // pixels or preset
  const tw = target.w, th = target.h;
  if (target.lock) {
    // Fit within box, maintain aspect
    const ratio = f.aspect;
    const boxRatio = tw / th;
    let w, h;
    if (ratio > boxRatio) { w = tw; h = Math.round(tw / ratio); }
    else { h = th; w = Math.round(th * ratio); }
    return { w, h };
  } else {
    return { w: tw, h: th };
  }
}

/* ============================================================
   SETTINGS UI
   ============================================================ */
window.irSetMode = (mode) => {
  irGlobalMode = mode;
  document.querySelectorAll('.ir-mode-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });
  document.getElementById('irPixelsBox').style.display = mode === 'pixels' ? 'block' : 'none';
  document.getElementById('irPercentBox').style.display = mode === 'percent' ? 'block' : 'none';
  document.getElementById('irPresetBox').style.display = mode === 'preset' ? 'block' : 'none';
  irRenderList();
};

window.irSetSetting = (key, val) => {
  irSettings[key] = val;
  const groups = { format: 'irFormat' };
  if (groups[key]) {
    const wrap = document.getElementById(groups[key]);
    if (wrap) {
      wrap.querySelectorAll('.ir-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.val === String(val));
      });
    }
  }
  irRenderList();
};

window.irSetAspectLock = (checked) => {
  irSettings.lockAspect = checked;
};

window.irSetPercent = (val) => {
  irSettings.percent = parseFloat(val) || 50;
  const el = document.getElementById('irPercentVal');
  if (el) el.textContent = irSettings.percent + '%';
  irRenderList();
};

window.irSetPreset = (val) => {
  irSettings.preset = val;
  irRenderList();
};

window.irSetQuality = (val) => {
  irSettings.quality = parseFloat(val) / 100;
  const el = document.getElementById('irQualityVal');
  if (el) el.textContent = Math.round(val) + '%';
};

/* ============================================================
   RESIZE — MAIN
   ============================================================ */
window.irResizeAll = async () => {
  if (irFiles.length === 0) { irToast('❌ Pehle images add karo', 'error'); return; }
  if (irBusy) return;

  irBusy = true;
  const btn = document.getElementById('irResizeBtn');
  const progWrap = document.getElementById('irProgress');
  const progFill = document.getElementById('irProgressFill');
  const progText = document.getElementById('irProgressText');
  const progPct = document.getElementById('irProgressPct');

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Resizing...'; }
  if (progWrap) progWrap.style.display = 'block';

  try {
    const target = irGetTargetDims();
    const results = []; // [{ name, blob }]

    for (let i = 0; i < irFiles.length; i++) {
      const f = irFiles[i];
      const pct = Math.round((i / irFiles.length) * 100);
      if (progFill) progFill.style.width = pct + '%';
      if (progPct) progPct.textContent = pct + '%';
      if (progText) progText.textContent = `Resizing ${i + 1}/${irFiles.length}: ${irFmtName(f.name, 28)}`;

      const dims = irCalcDims(f, target);
      const canvas = document.createElement('canvas');
      canvas.width = dims.w;
      canvas.height = dims.h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = f.dataUrl;
      });
      ctx.drawImage(img, 0, 0, dims.w, dims.h);

      // Output format
      let mime = f.file.type || 'image/jpeg';
      let ext = (f.name.split('.').pop() || 'jpg').toLowerCase();
      if (irSettings.format === 'jpg') { mime = 'image/jpeg'; ext = 'jpg'; }
      else if (irSettings.format === 'png') { mime = 'image/png'; ext = 'png'; }
      else if (irSettings.format === 'webp') { mime = 'image/webp'; ext = 'webp'; }

      const quality = (mime === 'image/png') ? undefined : irSettings.quality;

      const blob = await new Promise(resolve => canvas.toBlob(resolve, mime, quality));
      if (!blob) throw new Error('Blob fail');

      const outName = `${irBaseName(f.name)}_${dims.w}x${dims.h}.${ext}`;
      results.push({ name: outName, blob });

      canvas.width = 0; canvas.height = 0;
      await new Promise(r => setTimeout(r, 20));
    }

    if (progFill) progFill.style.width = '100%';
    if (progPct) progPct.textContent = '100%';
    if (progText) progText.textContent = '📦 Packaging...';
    await new Promise(r => setTimeout(r, 100));

    // Single file → direct download
    if (results.length === 1) {
      const url = URL.createObjectURL(results[0].blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = results[0].name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      irToast(`✅ 1 image resized (${irFmtSize(results[0].blob.size)})`, 'success');
    } else {
      if (typeof JSZip === 'undefined') {
        irToast('❌ JSZip load nahi hui', 'error');
        return;
      }
      const zip = new JSZip();
      results.forEach(r => zip.file(r.name, r.blob));
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'STORE'
      });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resized_${results.length}images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      irToast(`✅ ${results.length} images in ZIP (${irFmtSize(zipBlob.size)})`, 'success');
    }
  } catch (e) {
    console.error('Resize error:', e);
    irToast('❌ Resize fail: ' + (e.message || ''), 'error');
  } finally {
    irBusy = false;
    if (btn) { btn.disabled = false; btn.textContent = '📐 Resize All'; }
    setTimeout(() => {
      if (progWrap) progWrap.style.display = 'none';
      if (progFill) progFill.style.width = '0%';
      if (progPct) progPct.textContent = '';
      if (progText) progText.textContent = '';
    }, 3000);
  }
};

/* ============================================================
   RENDER (main HTML)
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['image-resizer'] = () => `
<div class="ir-wrap">

  <div id="irDrop" class="ir-drop">
    <div class="ir-drop-icon">🖼️</div>
    <div class="ir-drop-title">Images drag & drop karo</div>
    <div class="ir-drop-sub">JPG • PNG • WebP • Multiple OK • Max 50MB each</div>
    <button class="btn btn-primary" onclick="document.getElementById('irInput').click()">
      📁 Select Images
    </button>
    <input type="file" id="irInput" accept="image/*" multiple hidden>
  </div>

  <div id="irStatus" style="font-size:12.5px;color:var(--text-3);text-align:center;margin-top:10px"></div>

  <div id="irEmpty" class="empty-state" style="margin-top:14px">
    <div class="es-emoji">🗂️</div>
    <div class="es-title">Koi image nahi hai</div>
    Upar se images add karo
  </div>

  <div id="irPanel" style="display:none">

    <div id="irStats" style="font-size:13px;color:var(--text-2);text-align:center;margin:14px 0;padding:10px;background:var(--surface-2);border-radius:10px"></div>

    <div class="ir-list" id="irList"></div>

    <!-- MODE TABS -->
    <div class="ir-mode-tabs">
      <div class="ir-mode-tab active" data-mode="pixels" onclick="irSetMode('pixels')">📐 Pixels</div>
      <div class="ir-mode-tab" data-mode="percent" onclick="irSetMode('percent')">💯 Percent</div>
      <div class="ir-mode-tab" data-mode="preset" onclick="irSetMode('preset')">⚡ Preset</div>
    </div>

    <!-- PIXELS -->
    <div id="irPixelsBox" class="ir-settings" style="margin-top:12px">
      <div class="ir-row">
        <div class="field" style="flex:1">
          <label>Width (px)</label>
          <input type="number" id="irW" value="${irSettings.width}" min="1" max="10000"
            oninput="irSetSetting('width',this.value)">
        </div>
        <button class="ir-swap" onclick="irSwapDims()" title="Swap">⇄</button>
        <div class="field" style="flex:1">
          <label>Height (px)</label>
          <input type="number" id="irH" value="${irSettings.height}" min="1" max="10000"
            oninput="irSetSetting('height',this.value)">
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:6px;margin-top:10px;font-size:12.5px;color:var(--text-2);cursor:pointer">
        <input type="checkbox" ${irSettings.lockAspect ? 'checked' : ''}
          onchange="irSetAspectLock(this.checked)" style="width:auto">
        🔒 Lock aspect ratio
      </label>
    </div>

    <!-- PERCENT -->
    <div id="irPercentBox" class="ir-settings" style="display:none;margin-top:12px">
      <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">
        Scale: <span id="irPercentVal">${irSettings.percent}%</span>
      </label>
      <input type="range" min="5" max="200" value="${irSettings.percent}"
        oninput="irSetPercent(this.value)" style="width:100%">
      <div class="ir-percent-chips">
        ${[25,50,75,100,125,150,200].map(p =>
          `<button class="ir-chip" onclick="irSetPercent(${p});document.querySelector('#irPercentBox input[type=range]').value=${p}">${p}%</button>`
        ).join('')}
      </div>
    </div>

    <!-- PRESET -->
    <div id="irPresetBox" class="ir-settings" style="display:none;margin-top:12px">
      <div class="field">
        <label>Choose Preset Size</label>
        <select onchange="irSetPreset(this.value)">
          <option value="custom">Custom</option>
          ${Object.entries(IR_PRESETS).map(([k, v]) =>
            `<option value="${k}" ${irSettings.preset === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
      </div>
    </div>

    <!-- OUTPUT FORMAT -->
    <div class="ir-settings" style="margin-top:12px">
      <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">
        📁 Output Format
      </label>
      <div class="ir-chips" id="irFormat">
        <div class="ir-chip ${irSettings.format === 'original' ? 'active' : ''}" data-val="original" onclick="irSetSetting('format','original')">Original</div>
        <div class="ir-chip ${irSettings.format === 'jpg' ? 'active' : ''}" data-val="jpg" onclick="irSetSetting('format','jpg')">JPG</div>
        <div class="ir-chip ${irSettings.format === 'png' ? 'active' : ''}" data-val="png" onclick="irSetSetting('format','png')">PNG</div>
        <div class="ir-chip ${irSettings.format === 'webp' ? 'active' : ''}" data-val="webp" onclick="irSetSetting('format','webp')">WebP</div>
      </div>
      <div style="margin-top:12px">
        <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
          Quality: <span id="irQualityVal">${Math.round(irSettings.quality * 100)}%</span>
        </label>
        <input type="range" min="50" max="100" value="${Math.round(irSettings.quality * 100)}"
          oninput="irSetQuality(this.value)" style="width:100%">
      </div>
    </div>

    <div id="irProgress" style="display:none;margin-top:14px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-3);margin-bottom:6px">
        <span id="irProgressText"></span>
        <span id="irProgressPct"></span>
      </div>
      <div style="height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden">
        <div id="irProgressFill" style="height:100%;width:0%;background:var(--gradient);transition:width .3s"></div>
      </div>
    </div>

    <div class="btn-group" style="margin-top:16px">
      <button class="btn btn-secondary" onclick="document.getElementById('irInput').click()">➕ Add More</button>
      <button class="btn btn-secondary" onclick="irClearAll()">🗑️ Clear All</button>
      <button class="btn btn-primary" id="irResizeBtn" onclick="irResizeAll()">📐 Resize All</button>
    </div>

    <div class="hint" style="margin-top:14px;text-align:center">
      🔒 100% browser me process — images upload nahi hoti
    </div>
  </div>
</div>

<style>
  .ir-wrap { padding: 4px 0; }
  .ir-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 26px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .ir-drop:hover, .ir-drop.dragover { border-color: var(--primary); background: var(--surface-hover); }
  .ir-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .ir-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .ir-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }

  .ir-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; max-height: 340px; overflow-y: auto; }
  .ir-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
  .ir-num { width: 26px; height: 26px; border-radius: 8px; background: var(--gradient); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
  .ir-thumb { width: 46px; height: 46px; border-radius: 8px; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
  .ir-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .ir-info { flex: 1; min-width: 0; }
  .ir-name { font-size: 13.5px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ir-meta { font-size: 11.5px; color: var(--text-3); margin-top: 2px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .ir-orig { color: var(--text-3); }
  .ir-arrow { color: var(--primary); font-weight: 700; }
  .ir-new { color: var(--success); font-weight: 700; }
  .ir-size { color: var(--text-3); }
  .ir-btn { width: 30px; height: 30px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .ir-del:hover { background: rgba(239,68,68,.15); color: var(--danger); border-color: var(--danger); }

  .ir-mode-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
  .ir-mode-tab { padding: 9px 14px; border-radius: 10px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .ir-mode-tab:hover { background: var(--surface-hover); }
  .ir-mode-tab.active { background: var(--gradient); color: #fff; border-color: transparent; }

  .ir-settings { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
  .ir-row { display: flex; align-items: flex-end; gap: 8px; }
  .ir-swap { width: 40px; height: 40px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border); font-size: 18px; cursor: pointer; flex-shrink: 0; }
  .ir-swap:hover { background: var(--surface-hover); }
  .ir-percent-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .ir-chip { padding: 7px 12px; border-radius: 8px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .ir-chip:hover { background: var(--surface-hover); }
  .ir-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }
  .ir-chips { display: flex; flex-wrap: wrap; gap: 6px; }

  input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 3px; background: var(--surface-2); outline: none; }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--gradient); cursor: pointer; }
  input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: var(--gradient); cursor: pointer; border: none; }

  @media (max-width: 480px) {
    .ir-item { gap: 6px; padding: 8px; }
    .ir-name { font-size: 12.5px; }
    .ir-thumb { width: 40px; height: 40px; }
    .ir-num { width: 22px; height: 22px; font-size: 11px; }
  }
</style>
`;

window.irSwapDims = () => {
  const w = document.getElementById('irW');
  const h = document.getElementById('irH');
  if (!w || !h) return;
  const tmp = w.value;
  w.value = h.value;
  h.value = tmp;
  irSettings.width = parseInt(w.value) || 800;
  irSettings.height = parseInt(h.value) || 600;
  irRenderList();
};

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['image-resizer'] = () => {
  const drop = document.getElementById('irDrop');
  const input = document.getElementById('irInput');
  if (!drop || !input) return;

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });

  input.addEventListener('change', e => {
    if (e.target.files && e.target.files.length) {
      irAddFiles(e.target.files);
      e.target.value = '';
    }
  });

  ['dragenter', 'dragover'].forEach(ev => {
    drop.addEventListener(ev, e => {
      e.preventDefault(); e.stopPropagation();
      drop.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(ev => {
    drop.addEventListener(ev, e => {
      e.preventDefault(); e.stopPropagation();
      drop.classList.remove('dragover');
    });
  });
  drop.addEventListener('drop', e => {
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      irAddFiles(e.dataTransfer.files);
    }
  });
};

console.log('%c✅ Image Resizer loaded', 'color:#f59e0b;font-weight:bold');