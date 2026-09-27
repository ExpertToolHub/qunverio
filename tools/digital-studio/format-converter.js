/* ============================================================
   QUNVERIO — IMAGE FORMAT CONVERTER (tools/digital-studio/format-converter.js)
   Convert images between JPG, PNG, WebP, BMP
   ============================================================ */

console.log('%cImage Format Converter loading...', 'color:#8b5cf6;font-weight:bold');

let fcFiles = [];
let fcBusy = false;

let fcSettings = {
  format: 'jpg',       // jpg | png | webp
  quality: 92,         // for jpg/webp
  maxDim: 0,           // 0 = original
  bgColor: '#ffffff'   // for transparency → jpg
};

/* ============================================================
   HELPERS
   ============================================================ */
function fcFmtSize(bytes) {
  if (!bytes && bytes !== 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function fcFmtName(name, max = 34) {
  if (!name) return '';
  if (name.length <= max) return name;
  const ext = name.split('.').pop();
  const base = name.slice(0, max - ext.length - 4);
  return base + '...' + ext;
}

function fcToast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

function fcUid() {
  return 'fc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function fcIsImage(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name || '');
}

function fcBaseName(name) {
  return (name || 'image').replace(/\.[^.]+$/, '').replace(/[^a-z0-9_\-]/gi, '_');
}

function fcGetExt(mime) {
  return { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[mime] || 'jpg';
}

/* ============================================================
   LOAD IMAGE
   ============================================================ */
function fcLoadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => resolve({
        dataUrl: ev.target.result,
        width: img.naturalWidth,
        height: img.naturalHeight,
        img
      });
      img.onerror = () => reject(new Error('decode fail'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('read fail'));
    reader.readAsDataURL(file);
  });
}

async function fcAddFiles(fileList) {
  const files = Array.from(fileList).filter(fcIsImage);
  if (files.length === 0) {
    fcToast('❌ Sirf images select karo', 'error');
    return;
  }
  if (fcBusy) return;
  fcBusy = true;
  const statusEl = document.getElementById('fcStatus');
  let added = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 50 * 1024 * 1024) {
      fcToast(`⚠️ ${fcFmtName(file.name)} 50MB se bada`, 'error');
      continue;
    }
    if (statusEl) statusEl.textContent = `⏳ Loading ${i + 1}/${files.length}...`;
    try {
      const info = await fcLoadImage(file);
      const ext = (file.name.split('.').pop() || '').toUpperCase();
      fcFiles.push({
        id: fcUid(),
        file,
        name: file.name,
        size: file.size,
        dataUrl: info.dataUrl,
        width: info.width,
        height: info.height,
        img: info.img,
        origExt: ext,
        converted: null
      });
      added++;
      fcRenderList();
      await new Promise(r => setTimeout(r, 15));
    } catch (e) {
      fcToast(`❌ ${fcFmtName(file.name)} load nahi hui`, 'error');
    }
  }
  fcBusy = false;
  if (statusEl) statusEl.textContent = '';
  if (added > 0) {
    fcToast(`✅ ${added} image${added > 1 ? 's' : ''} added`, 'success');
    fcRenderList();
  }
}

/* ============================================================
   RENDER LIST
   ============================================================ */
function fcRenderList() {
  const list = document.getElementById('fcList');
  const empty = document.getElementById('fcEmpty');
  const panel = document.getElementById('fcPanel');
  if (!list) return;

  if (fcFiles.length === 0) {
    if (empty) empty.style.display = 'block';
    if (panel) panel.style.display = 'none';
    list.innerHTML = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (panel) panel.style.display = 'block';

  const targetExt = fcSettings.format.toUpperCase();

  list.innerHTML = fcFiles.map((f, i) => {
    const sameFormat = f.origExt.toLowerCase() === fcSettings.format;
    const arrow = sameFormat ? '•' : '→';
    const arrowColor = sameFormat ? 'var(--text-3)' : 'var(--primary)';

    let converted = '';
    if (f.converted) {
      const diff = f.size - f.converted.size;
      const pct = Math.round((diff / f.size) * 100);
      const color = diff > 0 ? '#10b981' : '#f59e0b';
      const sign = diff > 0 ? '-' : '+';
      converted = `<span style="color:${color};font-weight:700;font-size:11.5px">
        ${fcFmtSize(f.converted.size)} (${sign}${Math.abs(pct)}%)
      </span>`;
    }

    return `
      <div class="fc-item" data-id="${f.id}">
        <div class="fc-num">${i + 1}</div>
        <div class="fc-thumb" style="background-image:url(${f.dataUrl})"></div>
        <div class="fc-info">
          <div class="fc-name" title="${f.name}">${fcFmtName(f.name, 30)}</div>
          <div class="fc-meta">
            <span class="fc-badge">${f.origExt}</span>
            <span style="color:${arrowColor};font-weight:700">${arrow}</span>
            <span class="fc-badge fc-badge-new">${targetExt}</span>
            <span class="fc-size">• ${fcFmtSize(f.size)}</span>
            ${converted}
          </div>
        </div>
        ${f.converted ? `<a class="fc-download" href="${f.converted.url}" download="${f.converted.name}" title="Download">⬇</a>` : ''}
        <button class="fc-btn fc-del" onclick="fcRemove('${f.id}')">✕</button>
      </div>
    `;
  }).join('');

  fcUpdateStats();
}

window.fcRemove = (id) => {
  const f = fcFiles.find(x => x.id === id);
  if (f && f.converted && f.converted.url) URL.revokeObjectURL(f.converted.url);
  fcFiles = fcFiles.filter(x => x.id !== id);
  fcRenderList();
};

window.fcClearAll = () => {
  if (fcFiles.length === 0) return;
  if (!confirm('Saari images hata dein?')) return;
  fcFiles.forEach(f => {
    if (f.converted && f.converted.url) URL.revokeObjectURL(f.converted.url);
  });
  fcFiles = [];
  fcRenderList();
  fcToast('🗑️ Saari images remove');
};

function fcUpdateStats() {
  const el = document.getElementById('fcStats');
  if (!el) return;
  if (fcFiles.length === 0) { el.textContent = ''; return; }
  const totalOrig = fcFiles.reduce((s, x) => s + x.size, 0);
  const done = fcFiles.filter(x => x.converted);
  const totalNew = done.reduce((s, x) => s + x.converted.size, 0);
  if (done.length === 0) {
    el.innerHTML = `📊 <strong>${fcFiles.length}</strong> image${fcFiles.length > 1 ? 's' : ''} • 
      <strong>${fcFmtSize(totalOrig)}</strong> total`;
  } else {
    const diff = totalOrig - totalNew;
    const pct = Math.round((diff / totalOrig) * 100);
    const sign = diff > 0 ? '−' : '+';
    const color = diff > 0 ? '#10b981' : '#f59e0b';
    el.innerHTML = `📊 <strong>${fcFiles.length}</strong> image${fcFiles.length > 1 ? 's' : ''} • 
      <strong>${fcFmtSize(totalOrig)}</strong> → <strong style="color:${color}">${fcFmtSize(totalNew)}</strong> 
      <span style="color:${color}">(${sign}${Math.abs(pct)}%)</span>`;
  }
}

/* ============================================================
   SETTINGS
   ============================================================ */
window.fcSetFormat = (format) => {
  fcSettings.format = format;
  document.querySelectorAll('.fc-format-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.val === format);
  });
  // Clear previous conversions since format changed
  fcFiles.forEach(f => {
    if (f.converted && f.converted.url) URL.revokeObjectURL(f.converted.url);
    f.converted = null;
  });
  const zipBtn = document.getElementById('fcZipBtn');
  if (zipBtn) zipBtn.style.display = 'none';
  fcRenderList();
};

window.fcSetQuality = (val) => {
  fcSettings.quality = parseInt(val, 10);
  const el = document.getElementById('fcQualityVal');
  if (el) el.textContent = val + '%';
};

window.fcSetMaxDim = (val) => {
  fcSettings.maxDim = parseInt(val, 10) || 0;
};

window.fcSetBg = (val) => {
  fcSettings.bgColor = val;
};

window.fcSetBgPreset = (val) => {
  fcSettings.bgColor = val;
  const el = document.getElementById('fcBgColor');
  if (el) el.value = val;
};

/* ============================================================
   CONVERT — MAIN
   ============================================================ */
function fcGetCanvasDims(f) {
  let w = f.width, h = f.height;
  if (fcSettings.maxDim > 0) {
    const max = fcSettings.maxDim;
    if (w > max || h > max) {
      if (w > h) { h = Math.round(h * (max / w)); w = max; }
      else { w = Math.round(w * (max / h)); h = max; }
    }
  }
  return { w, h };
}

async function fcConvertOne(f) {
  const dims = fcGetCanvasDims(f);
  const canvas = document.createElement('canvas');
  canvas.width = dims.w;
  canvas.height = dims.h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill background for JPG/BMP (no transparency)
  if (fcSettings.format === 'jpg' || fcSettings.format === 'bmp') {
    ctx.fillStyle = fcSettings.bgColor;
    ctx.fillRect(0, 0, dims.w, dims.h);
  }
  ctx.drawImage(f.img, 0, 0, dims.w, dims.h);

  const mimeMap = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp'
  };
  const mime = mimeMap[fcSettings.format] || 'image/jpeg';
  const quality = (fcSettings.format === 'png') ? undefined : fcSettings.quality / 100;

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      canvas.width = 0; canvas.height = 0;
      resolve(blob);
    }, mime, quality);
  });
}

window.fcConvertAll = async () => {
  if (fcFiles.length === 0) { fcToast('❌ Pehle images add karo', 'error'); return; }
  if (fcBusy) return;

  fcBusy = true;
  const btn = document.getElementById('fcConvertBtn');
  const progWrap = document.getElementById('fcProgress');
  const progFill = document.getElementById('fcProgressFill');
  const progText = document.getElementById('fcProgressText');
  const progPct = document.getElementById('fcProgressPct');

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Converting...'; }
  if (progWrap) progWrap.style.display = 'block';

  try {
    // Clear old
    fcFiles.forEach(f => {
      if (f.converted && f.converted.url) URL.revokeObjectURL(f.converted.url);
      f.converted = null;
    });

    const ext = fcSettings.format;
    for (let i = 0; i < fcFiles.length; i++) {
      const f = fcFiles[i];
      const pct = Math.round((i / fcFiles.length) * 100);
      if (progFill) progFill.style.width = pct + '%';
      if (progPct) progPct.textContent = pct + '%';
      if (progText) progText.textContent = `Converting ${i + 1}/${fcFiles.length}: ${fcFmtName(f.name, 28)}`;

      const blob = await fcConvertOne(f);
      if (!blob) continue;

      const outName = `${fcBaseName(f.name)}.${ext}`;
      const url = URL.createObjectURL(blob);
      f.converted = { blob, url, name: outName, size: blob.size };

      fcRenderList();
      await new Promise(r => setTimeout(r, 20));
    }

    if (progFill) progFill.style.width = '100%';
    if (progPct) progPct.textContent = '100%';
    if (progText) progText.textContent = '✅ All done!';
    fcToast(`✅ ${fcFiles.length} image${fcFiles.length > 1 ? 's' : ''} converted`, 'success');

    if (fcFiles.length > 1) {
      const zipBtn = document.getElementById('fcZipBtn');
      if (zipBtn) zipBtn.style.display = 'flex';
    }
  } catch (e) {
    console.error('Convert error:', e);
    fcToast('❌ Convert fail: ' + (e.message || ''), 'error');
  } finally {
    fcBusy = false;
    if (btn) { btn.disabled = false; btn.textContent = '🔄 Convert All'; }
    setTimeout(() => {
      if (progWrap) progWrap.style.display = 'none';
      if (progFill) progFill.style.width = '0%';
      if (progPct) progPct.textContent = '';
      if (progText) progText.textContent = '';
    }, 2500);
  }
};

window.fcDownloadZip = async () => {
  const done = fcFiles.filter(f => f.converted);
  if (done.length === 0) return;
  if (typeof JSZip === 'undefined') { fcToast('❌ JSZip load nahi hui', 'error'); return; }
  fcToast('📦 ZIP bana rahe hain...');
  const zip = new JSZip();
  done.forEach(f => zip.file(f.converted.name, f.converted.blob));
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `converted_${done.length}_${fcSettings.format}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  fcToast(`✅ ZIP downloaded (${fcFmtSize(zipBlob.size)})`, 'success');
};

/* ============================================================
   RENDER (main HTML)
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['format-converter'] = () => `
<div class="fc-wrap">

  <div id="fcDrop" class="fc-drop">
    <div class="fc-drop-icon">🔄</div>
    <div class="fc-drop-title">Images drag & drop karo</div>
    <div class="fc-drop-sub">JPG • PNG • WebP • BMP • GIF • Multiple OK</div>
    <button class="btn btn-primary" onclick="document.getElementById('fcInput').click()">
      📁 Select Images
    </button>
    <input type="file" id="fcInput" accept="image/*" multiple hidden>
  </div>

  <div id="fcStatus" style="font-size:12.5px;color:var(--text-3);text-align:center;margin-top:10px"></div>

  <div id="fcEmpty" class="empty-state" style="margin-top:14px">
    <div class="es-emoji">🗂️</div>
    <div class="es-title">Koi image nahi hai</div>
    Upar se images add karo
  </div>

  <div id="fcPanel" style="display:none">

    <div id="fcStats" style="font-size:13px;color:var(--text-2);text-align:center;margin:14px 0;padding:10px;background:var(--surface-2);border-radius:10px"></div>

    <div class="fc-list" id="fcList"></div>

    <!-- FORMAT SELECT -->
    <div class="fc-settings" style="margin-top:14px">
      <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:10px">
        🔄 Convert to
      </label>
      <div class="fc-format-grid">
        <div class="fc-format-chip ${fcSettings.format === 'jpg' ? 'active' : ''}" data-val="jpg" onclick="fcSetFormat('jpg')">
          <span style="font-size:22px">🖼️</span>
          <span>JPG</span>
        </div>
        <div class="fc-format-chip ${fcSettings.format === 'png' ? 'active' : ''}" data-val="png" onclick="fcSetFormat('png')">
          <span style="font-size:22px">🎨</span>
          <span>PNG</span>
        </div>
        <div class="fc-format-chip ${fcSettings.format === 'webp' ? 'active' : ''}" data-val="webp" onclick="fcSetFormat('webp')">
          <span style="font-size:22px">⚡</span>
          <span>WebP</span>
        </div>
      </div>

      <div id="fcQualityBox" style="margin-top:14px;display:${fcSettings.format === 'png' ? 'none' : 'block'}">
        <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
          Quality: <span id="fcQualityVal">${fcSettings.quality}%</span>
        </label>
        <input type="range" min="30" max="100" value="${fcSettings.quality}" oninput="fcSetQuality(this.value)" style="width:100%">
        <div class="hint" style="margin-top:4px">90-100% = best • 60-80% = balanced • 30-50% = small</div>
      </div>

      <div id="fcBgBox" style="margin-top:14px;display:${fcSettings.format === 'jpg' ? 'block' : 'none'}">
        <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
          Background (for transparent PNG → JPG)
        </label>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input type="color" id="fcBgColor" value="${fcSettings.bgColor}" onchange="fcSetBg(this.value)" style="width:60px;height:40px;padding:4px;border-radius:8px;border:1.5px solid var(--border);cursor:pointer">
          <button class="fc-chip-sm" onclick="fcSetBgPreset('#ffffff')">⬜ White</button>
          <button class="fc-chip-sm" onclick="fcSetBgPreset('#000000')">⬛ Black</button>
          <button class="fc-chip-sm" onclick="fcSetBgPreset('#dbeafe')">🟦 Blue</button>
          <button class="fc-chip-sm" onclick="fcSetBgPreset('#fee2e2')">🟥 Red</button>
        </div>
      </div>

      <div style="margin-top:14px">
        <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
          Max Dimension (px) — optional
        </label>
        <input type="number" id="fcMaxDim" value="0" min="0" max="10000"
          oninput="fcSetMaxDim(this.value)" placeholder="0 = original size"
          style="width:100%;padding:10px 12px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
        <div class="hint" style="margin-top:4px">0 = original | e.g. 1920 = Full HD max</div>
      </div>
    </div>

    <div id="fcProgress" style="display:none;margin-top:14px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-3);margin-bottom:6px">
        <span id="fcProgressText"></span>
        <span id="fcProgressPct"></span>
      </div>
      <div style="height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden">
        <div id="fcProgressFill" style="height:100%;width:0%;background:var(--gradient);transition:width .3s"></div>
      </div>
    </div>

    <div class="btn-group" style="margin-top:16px">
      <button class="btn btn-secondary" onclick="document.getElementById('fcInput').click()">➕ Add More</button>
      <button class="btn btn-secondary" onclick="fcClearAll()">🗑️ Clear</button>
      <button class="btn btn-primary" id="fcConvertBtn" onclick="fcConvertAll()">🔄 Convert All</button>
    </div>

    <div class="btn-group" style="margin-top:10px">
      <button class="btn btn-secondary" id="fcZipBtn" style="display:none" onclick="fcDownloadZip()">📦 Download All as ZIP</button>
    </div>

    <div class="hint" style="margin-top:14px;text-align:center">
      🔒 100% browser me process — images upload nahi hoti
    </div>
  </div>
</div>

<style>
  .fc-wrap { padding: 4px 0; }
  .fc-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 26px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .fc-drop:hover, .fc-drop.dragover { border-color: var(--primary); background: var(--surface-hover); }
  .fc-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .fc-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .fc-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }

  .fc-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; max-height: 340px; overflow-y: auto; }
  .fc-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
  .fc-num { width: 26px; height: 26px; border-radius: 8px; background: var(--gradient); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
  .fc-thumb { width: 46px; height: 46px; border-radius: 8px; background: #fff; border: 1px solid var(--border); background-size: cover; background-position: center; flex-shrink: 0; }
  .fc-info { flex: 1; min-width: 0; }
  .fc-name { font-size: 13.5px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fc-meta { font-size: 11.5px; color: var(--text-3); margin-top: 3px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .fc-badge { padding: 1px 6px; border-radius: 4px; background: var(--surface-2); color: var(--text-2); font-weight: 700; font-size: 10px; letter-spacing: .5px; }
  .fc-badge-new { background: var(--gradient); color: #fff; }
  .fc-size { color: var(--text-3); }
  .fc-btn, .fc-download { width: 30px; height: 30px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; text-decoration: none; }
  .fc-download { background: rgba(16,185,129,.15); color: #10b981; border-color: rgba(16,185,129,.3); }
  .fc-download:hover { background: rgba(16,185,129,.25); }
  .fc-del:hover { background: rgba(239,68,68,.15); color: var(--danger); border-color: var(--danger); }

  .fc-settings { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
  .fc-format-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .fc-format-chip { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 8px; border-radius: 12px; background: var(--surface-2); border: 2px solid var(--border); color: var(--text-2); font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
  .fc-format-chip:hover { background: var(--surface-hover); }
  .fc-format-chip.active { background: var(--gradient); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(99,102,241,.3); }

  .fc-chip-sm { padding: 8px 12px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); font-size: 12px; font-weight: 600; cursor: pointer; }
  .fc-chip-sm:hover { background: var(--surface-hover); }

  input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 3px; background: var(--surface-2); outline: none; }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--gradient); cursor: pointer; }
  input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: var(--gradient); cursor: pointer; border: none; }

  @media (max-width: 480px) {
    .fc-item { gap: 6px; padding: 8px; }
    .fc-name { font-size: 12.5px; }
    .fc-thumb { width: 40px; height: 40px; }
    .fc-num { width: 22px; height: 22px; font-size: 11px; }
    .fc-format-chip { padding: 10px 4px; font-size: 12px; }
  }
</style>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['format-converter'] = () => {
  const drop = document.getElementById('fcDrop');
  const input = document.getElementById('fcInput');
  if (!drop || !input) return;

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });
  input.addEventListener('change', e => {
    if (e.target.files && e.target.files.length) {
      fcAddFiles(e.target.files);
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
      fcAddFiles(e.dataTransfer.files);
    }
  });
};

// Fix: show/hide quality & bg boxes on format change
const _origFcSetFormat = window.fcSetFormat;
window.fcSetFormat = (format) => {
  _origFcSetFormat(format);
  const qBox = document.getElementById('fcQualityBox');
  const bBox = document.getElementById('fcBgBox');
  if (qBox) qBox.style.display = format === 'png' ? 'none' : 'block';
  if (bBox) bBox.style.display = format === 'jpg' ? 'block' : 'none';
};

console.log('%c✅ Image Format Converter loaded', 'color:#8b5cf6;font-weight:bold');