/* ============================================================
   QUNVERIO — BACKGROUND REMOVER (v8 — Mobile Friendly)
   Uses @imgly/background-removal@1.0.7 (smaller, mobile-friendly)
   ============================================================ */

console.log('%cBackground Remover v8 loading...', 'color:#ec4899;font-weight:bold');

let bgOriginalFile = null;
let bgOriginalUrl = null;
let bgProcessedBlob = null;
let bgProcessedUrl = null;
let bgLibraryLoaded = false;
let bgBusy = false;

let bgSettings = {
  bgType: 'transparent',
  bgColor: '#ffffff',
  outputFormat: 'png',
  quality: 92,
  maxDim: 800
};

/* ============================================================
   HELPERS
   ============================================================ */
function bgFmtSize(bytes) {
  if (!bytes && bytes !== 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function bgToast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

function bgSetProgress(pct, text) {
  const wrap = document.getElementById('bgProgressWrap');
  const fill = document.getElementById('bgProgressFill');
  const pctEl = document.getElementById('bgProgressPct');
  const textEl = document.getElementById('bgProgressText');
  if (wrap) wrap.style.display = 'block';
  if (fill) fill.style.width = Math.round(pct) + '%';
  if (pctEl) pctEl.textContent = Math.round(pct) + '%';
  if (textEl) textEl.textContent = text || '';
}

function bgHideProgress() {
  const wrap = document.getElementById('bgProgressWrap');
  if (wrap) setTimeout(() => wrap.style.display = 'none', 3000);
}

/* ============================================================
   LOAD LIBRARY
   ============================================================ */
async function bgLoadLibrary() {
  if (bgLibraryLoaded) return true;

  bgSetProgress(5, '🔍 AI library load...');

  // Check globals (script tag)
  if (typeof window.removeBackground === 'function') {
    window.__bgRemoveFn = window.removeBackground;
    bgLibraryLoaded = true;
    bgSetProgress(20, '✅ AI ready');
    return true;
  }

  if (window.ImglyBackgroundRemoval && typeof window.ImglyBackgroundRemoval.removeBackground === 'function') {
    window.__bgRemoveFn = window.ImglyBackgroundRemoval.removeBackground;
    bgLibraryLoaded = true;
    bgSetProgress(20, '✅ AI ready');
    return true;
  }

  // Dynamic import fallback — 1.0.7 (smaller)
  const cdns = [
    'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.0.7/+esm',
    'https://unpkg.com/@imgly/background-removal@1.0.7/+esm'
  ];

  for (let i = 0; i < cdns.length; i++) {
    try {
      bgSetProgress(10 + i * 5, `📥 Loading AI (${i + 1}/${cdns.length})...`);
      const mod = await import(cdns[i]);
      if (mod && typeof mod.removeBackground === 'function') {
        window.__bgRemoveFn = mod.removeBackground;
        bgLibraryLoaded = true;
        bgSetProgress(20, `✅ AI ready`);
        return true;
      }
    } catch (e) {
      console.warn(`CDN ${i + 1} fail:`, e.message);
    }
  }

  bgSetProgress(0, '❌ AI load fail');
  bgToast('❌ AI library load nahi hui', 'error');
  bgHideProgress();
  return false;
}

/* ============================================================
   PROCESS — Simple approach (no model parameter)
   ============================================================ */
async function bgProcessWithFallback(file) {
  bgSetProgress(25, '⏳ Image prepare...');
  const resizedFile = await bgResizeIfNeeded(file);

  bgSetProgress(30, '📥 AI library load...');
  const ok = await bgLoadLibrary();
  if (!ok) throw new Error('Library load nahi hui');

  bgSetProgress(35, '🎨 Background remove ho raha hai...');

  // Simple config — no model parameter (1.0.7 doesn't need it)
  const config = {
    progress: (key, current, total) => {
      const pct = 35 + Math.round((current / total) * 50);
      const mb = (current / (1024 * 1024)).toFixed(1);
      const totalMb = (total / (1024 * 1024)).toFixed(1);
      bgSetProgress(pct, `📥 AI: ${mb}MB / ${totalMb}MB`);
    }
  };

  const resultBlob = await window.__bgRemoveFn(resizedFile, config);
  console.log('%c✅ Background removed', 'color:#10b981;font-weight:bold');

  bgSetProgress(88, '🖼️ Background apply...');
  let finalBlob = resultBlob;

  if (bgSettings.bgType === 'color') {
    finalBlob = await bgApplyBgColor(finalBlob, bgSettings.bgColor);
  }

  if (bgSettings.outputFormat === 'jpg') {
    finalBlob = await bgConvertToJpg(finalBlob);
  }

  return finalBlob;
}

/* ============================================================
   MAIN PROCESS
   ============================================================ */
async function bgProcessImage(file) {
  if (bgBusy) return;
  bgBusy = true;

  try {
    const resultBlob = await bgProcessWithFallback(file);

    bgSetProgress(95, '✅ Ready!');
    bgProcessedBlob = resultBlob;

    if (bgProcessedUrl) URL.revokeObjectURL(bgProcessedUrl);
    bgProcessedUrl = URL.createObjectURL(bgProcessedBlob);

    bgRenderResult();
    bgHideProgress();
    bgToast('✅ Background removed!', 'success');
  } catch (e) {
    console.error('BG remove error:', e);
    bgToast('❌ Fail: ' + (e.message || 'unknown'), 'error');
    bgSetProgress(0, '❌ Failed');
    bgHideProgress();
  } finally {
    bgBusy = false;
  }
}

/* ============================================================
   RESIZE
   ============================================================ */
function bgResizeIfNeeded(file) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxDim = bgSettings.maxDim;
      if (img.width <= maxDim && img.height <= maxDim) {
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }
      let w = img.width, h = img.height;
      if (w > h) { h = Math.round(h * (maxDim / w)); w = maxDim; }
      else { w = Math.round(w * (maxDim / h)); h = maxDim; }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        resolve(blob || file);
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

/* ============================================================
   APPLY BG COLOR
   ============================================================ */
function bgApplyBgColor(blob, color) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(b => resolve(b), 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(blob); };
    img.src = url;
  });
}

/* ============================================================
   CONVERT TO JPG
   ============================================================ */
function bgConvertToJpg(blob) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = bgSettings.bgType === 'color' ? bgSettings.bgColor : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(b => resolve(b), 'image/jpeg', bgSettings.quality / 100);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(blob); };
    img.src = url;
  });
}

/* ============================================================
   RENDER FUNCTIONS
   ============================================================ */
function bgRenderDrop() {
  const drop = document.getElementById('bgDrop');
  const panel = document.getElementById('bgPanel');
  if (drop) drop.style.display = 'block';
  if (panel) panel.style.display = 'none';
}

function bgRenderPanel() {
  const drop = document.getElementById('bgDrop');
  const panel = document.getElementById('bgPanel');
  if (drop) drop.style.display = 'none';
  if (panel) panel.style.display = 'block';

  const orig = document.getElementById('bgOriginalPreview');
  if (orig && bgOriginalUrl) {
    orig.innerHTML = `<img src="${bgOriginalUrl}" alt="Original" style="max-width:100%;max-height:180px;border-radius:10px;display:block;margin:0 auto">`;
  }

  bgRenderResult();
}

function bgRenderResult() {
  const result = document.getElementById('bgResultPreview');
  if (!result) return;

  if (!bgProcessedUrl) {
    result.innerHTML = `
      <div style="text-align:center;padding:24px 12px;color:var(--text-3)">
        <div style="font-size:42px;opacity:.4;margin-bottom:8px">🎨</div>
        <div style="font-size:13px">Click <strong>Remove Background</strong> to start</div>
      </div>
    `;
    return;
  }

  result.innerHTML = `
    <div style="background:${bgSettings.bgType === 'transparent' ? 'repeating-conic-gradient(#e5e7eb 0 25%, transparent 0 50%) 50% / 16px 16px' : bgSettings.bgColor};padding:10px;border-radius:12px;border:1px solid var(--border)">
      <img src="${bgProcessedUrl}" alt="Result" style="max-width:100%;max-height:280px;display:block;margin:0 auto">
    </div>
    <div style="margin-top:10px;font-size:12px;color:var(--text-3);text-align:center">
      ✅ ${bgFmtSize(bgProcessedBlob.size)} • ${bgSettings.outputFormat.toUpperCase()}
    </div>
  `;
}

/* ============================================================
   SETTINGS
   ============================================================ */
window.bgSetSetting = (key, val) => {
  bgSettings[key] = val;
  if (key === 'bgType') {
    document.querySelectorAll('.bg-type-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.val === val);
    });
    const colorBox = document.getElementById('bgColorBox');
    if (colorBox) colorBox.style.display = val === 'color' ? 'block' : 'none';
  }
  if (key === 'outputFormat') {
    document.querySelectorAll('.bg-format-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.val === val);
    });
  }
  if (key === 'quality') {
    const el = document.getElementById('bgQualityVal');
    if (el) el.textContent = val + '%';
  }
  if (key === 'maxDim') {
    bgSettings.maxDim = parseInt(val, 10) || 800;
  }
  if (bgProcessedBlob && (key === 'bgType' || key === 'bgColor' || key === 'outputFormat')) {
    bgReprocess();
  }
};

window.bgSetBgColor = (val) => {
  bgSettings.bgColor = val;
  if (bgProcessedBlob) bgReprocess();
};

window.bgSetBgPreset = (val) => {
  bgSettings.bgColor = val;
  const el = document.getElementById('bgColorPicker');
  if (el) el.value = val;
  if (bgProcessedBlob) bgReprocess();
};

async function bgReprocess() {
  if (!bgProcessedBlob) return;
  if (bgProcessedUrl) URL.revokeObjectURL(bgProcessedUrl);
  bgProcessedUrl = URL.createObjectURL(bgProcessedBlob);
  bgRenderResult();
}

window.bgLoadFile = (file) => {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    bgToast('❌ Sirf image select karo', 'error');
    return;
  }
  if (file.size > 30 * 1024 * 1024) {
    bgToast('❌ Image 30MB se choti', 'error');
    return;
  }
  bgOriginalFile = file;
  if (bgOriginalUrl) URL.revokeObjectURL(bgOriginalUrl);
  bgOriginalUrl = URL.createObjectURL(file);
  bgProcessedBlob = null;
  bgProcessedUrl = null;
  bgRenderPanel();
};

window.bgRemoveBackground = async () => {
  if (!bgOriginalFile) { bgToast('❌ Pehle image upload karo', 'error'); return; }
  if (bgBusy) { bgToast('⏳ Please wait...', 'error'); return; }
  await bgProcessImage(bgOriginalFile);
};

window.bgDownload = () => {
  if (!bgProcessedBlob || !bgProcessedUrl) {
    bgToast('❌ Pehle background remove karo', 'error');
    return;
  }
  const ext = bgSettings.outputFormat === 'jpg' ? 'jpg' : 'png';
  const a = document.createElement('a');
  a.href = bgProcessedUrl;
  a.download = `nobg_${Date.now()}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  bgToast('✅ Downloaded!', 'success');
};

window.bgReset = () => {
  if (!confirm('Reset kar dein?')) return;
  if (bgOriginalUrl) URL.revokeObjectURL(bgOriginalUrl);
  if (bgProcessedUrl) URL.revokeObjectURL(bgProcessedUrl);
  bgOriginalFile = null;
  bgOriginalUrl = null;
  bgProcessedBlob = null;
  bgProcessedUrl = null;
  bgRenderDrop();
  bgToast('🔄 Reset done');
};

/* ============================================================
   RENDER (main HTML)
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['background-remover'] = () => `
<div class="bg-wrap">

  <div id="bgDrop" class="bg-drop">
    <div class="bg-drop-icon">🎨</div>
    <div class="bg-drop-title">Image upload karo</div>
    <div class="bg-drop-sub">JPG • PNG • WebP • Max 30MB</div>
    <button class="btn btn-primary" onclick="document.getElementById('bgInput').click()">
      📁 Select Image
    </button>
    <input type="file" id="bgInput" accept="image/*" hidden>
  </div>

  <div id="bgPanel" style="display:none;margin-top:14px">

    <div class="card" style="text-align:center">
      <div class="card-title">📸 Original</div>
      <div id="bgOriginalPreview"></div>
      <button class="btn btn-primary" style="width:100%;margin-top:12px" onclick="bgRemoveBackground()">
        ✨ Remove Background
      </button>
    </div>

    <div id="bgProgressWrap" style="display:none;margin-top:14px;padding:14px;background:var(--surface);border-radius:14px;border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-3);margin-bottom:8px">
        <span id="bgProgressText">Processing...</span>
        <span id="bgProgressPct">0%</span>
      </div>
      <div style="height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden">
        <div id="bgProgressFill" style="height:100%;width:0%;background:var(--gradient);transition:width .3s"></div>
      </div>
      <div class="hint" style="margin-top:8px;font-size:11px">
        ⚡ Mobile-friendly AI model • Small image = faster
      </div>
    </div>

    <div class="card" style="margin-top:14px;text-align:center">
      <div class="card-title">🎨 Result</div>
      <div id="bgResultPreview"></div>
    </div>

    <div class="bg-settings">
      <div class="card-title" style="margin-bottom:10px">🎨 New Background</div>

      <div class="bg-type-chips">
        <div class="bg-type-chip active" data-val="transparent" onclick="bgSetSetting('bgType','transparent')">
          <span style="font-size:18px">🔲</span>
          <span>Transparent</span>
        </div>
        <div class="bg-type-chip" data-val="color" onclick="bgSetSetting('bgType','color')">
          <span style="font-size:18px">🎨</span>
          <span>Solid Color</span>
        </div>
      </div>

      <div id="bgColorBox" style="display:none;margin-top:14px">
        <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">
          Choose Color
        </label>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input type="color" id="bgColorPicker" value="${bgSettings.bgColor}" onchange="bgSetBgColor(this.value)"
            style="width:60px;height:44px;padding:4px;border-radius:10px;border:1.5px solid var(--border);cursor:pointer">
          <button class="bg-color-btn" onclick="bgSetBgPreset('#ffffff')" style="background:#fff;border:1px solid #ccc">White</button>
          <button class="bg-color-btn" onclick="bgSetBgPreset('#000000')" style="background:#000;color:#fff">Black</button>
          <button class="bg-color-btn" onclick="bgSetBgPreset('#3b82f6')" style="background:#3b82f6;color:#fff">Blue</button>
          <button class="bg-color-btn" onclick="bgSetBgPreset('#ef4444')" style="background:#ef4444;color:#fff">Red</button>
          <button class="bg-color-btn" onclick="bgSetBgPreset('#10b981')" style="background:#10b981;color:#fff">Green</button>
        </div>
      </div>
    </div>

    <div class="bg-settings">
      <div class="card-title" style="margin-bottom:10px">📤 Output</div>
      <div class="bg-format-chips">
        <div class="bg-format-chip active" data-val="png" onclick="bgSetSetting('outputFormat','png')">PNG (transparent)</div>
        <div class="bg-format-chip" data-val="jpg" onclick="bgSetSetting('outputFormat','jpg')">JPG (smaller)</div>
      </div>

      <div style="margin-top:12px">
        <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
          Max Dimension (px)
        </label>
        <input type="number" value="${bgSettings.maxDim}" min="400" max="2000" step="100"
          onchange="bgSetSetting('maxDim',this.value)"
          style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
        <div class="hint">800 = fast on mobile • 1200 = balance • 2000 = quality</div>
      </div>
    </div>

    <div class="btn-group" style="margin-top:14px">
      <button class="btn btn-secondary" onclick="bgReset()">🔄 Reset</button>
      <button class="btn btn-primary" onclick="bgDownload()">⬇ Download</button>
    </div>

    <div class="hint" style="margin-top:14px;text-align:center">
      🔒 100% browser me process — image upload nahi hoti
    </div>
  </div>
</div>

<style>
  .bg-wrap { padding: 4px 0; }
  .bg-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 30px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .bg-drop:hover { border-color: var(--primary); background: var(--surface-hover); }
  .bg-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .bg-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .bg-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }

  .bg-settings { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; margin-top: 12px; }

  .bg-type-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .bg-type-chip { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 8px; border-radius: 12px; background: var(--surface-2); border: 2px solid var(--border); color: var(--text-2); font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all .15s; }
  .bg-type-chip:hover { background: var(--surface-hover); }
  .bg-type-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }

  .bg-color-btn { padding: 8px 12px; border-radius: 8px; font-size: 11.5px; font-weight: 700; cursor: pointer; }

  .bg-format-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .bg-format-chip { padding: 8px 12px; border-radius: 8px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12px; font-weight: 600; cursor: pointer; }
  .bg-format-chip:hover { background: var(--surface-hover); }
  .bg-format-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }

  @media (max-width: 480px) {
    .bg-type-chips { grid-template-columns: 1fr; }
  }
</style>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['background-remover'] = () => {
  const input = document.getElementById('bgInput');
  const drop = document.getElementById('bgDrop');
  if (!input || !drop) return;

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });
  input.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      bgLoadFile(e.target.files[0]);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      bgLoadFile(e.dataTransfer.files[0]);
    }
  });
};

console.log('%c✅ Background Remover v8 loaded', 'color:#ec4899;font-weight:bold');