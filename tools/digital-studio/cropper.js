/* ============================================================
   QUNVERIO — IMAGE CROPPER (tools/digital-studio/cropper.js)
   Crop images with aspect ratios, rotate, zoom, flip
   Uses: Cropper.js
   ============================================================ */

console.log('%cImage Cropper loading...', 'color:#10b981;font-weight:bold');

let crImages = [];         // [{ id, file, name, size, dataUrl, width, height }]
let crActiveIdx = 0;       // Currently editing index
let crCropper = null;      // Cropper.js instance
let crBusy = false;

let crSettings = {
  aspect: 'free',          // free | 1:1 | 16:9 | 9:16 | 4:3 | 3:4 | 3:2 | 2:3 | 35:45
  outputFormat: 'original',// original | jpg | png | webp
  quality: 92
};

const CR_ASPECTS = {
  'free':  NaN,
  '1:1':   1,
  '16:9':  16/9,
  '9:16':  9/16,
  '4:3':   4/3,
  '3:4':   3/4,
  '3:2':   3/2,
  '2:3':   2/3,
  '35:45': 35/45
};

/* ============================================================
   HELPERS
   ============================================================ */
function crFmtSize(bytes) {
  if (!bytes && bytes !== 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function crFmtName(name, max = 30) {
  if (!name) return '';
  if (name.length <= max) return name;
  const ext = name.split('.').pop();
  const base = name.slice(0, max - ext.length - 4);
  return base + '...' + ext;
}

function crToast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

function crUid() {
  return 'cr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function crIsImage(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name || '');
}

function crBaseName(name) {
  return (name || 'image').replace(/\.[^.]+$/, '').replace(/[^a-z0-9_\-]/gi, '_');
}

/* ============================================================
   LOAD IMAGE
   ============================================================ */
function crLoadImage(file) {
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

async function crAddFiles(fileList) {
  const files = Array.from(fileList).filter(crIsImage);
  if (files.length === 0) {
    crToast('❌ Sirf images select karo', 'error');
    return;
  }
  if (crBusy) return;
  crBusy = true;
  const statusEl = document.getElementById('crStatus');
  let added = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 50 * 1024 * 1024) {
      crToast(`⚠️ ${crFmtName(file.name)} 50MB se bada`, 'error');
      continue;
    }
    if (statusEl) statusEl.textContent = `⏳ Loading ${i + 1}/${files.length}...`;
    try {
      const info = await crLoadImage(file);
      crImages.push({
        id: crUid(),
        file,
        name: file.name,
        size: file.size,
        dataUrl: info.dataUrl,
        width: info.width,
        height: info.height,
        cropped: null
      });
      added++;
      crRenderList();
      await new Promise(r => setTimeout(r, 15));
    } catch (e) {
      crToast(`❌ ${crFmtName(file.name)} load nahi hui`, 'error');
    }
  }
  crBusy = false;
  if (statusEl) statusEl.textContent = '';
  if (added > 0) {
    crToast(`✅ ${added} image${added > 1 ? 's' : ''} added`, 'success');
    crRenderList();
    crRenderPanel();
  }
}

/* ============================================================
   RENDER LIST (thumbnail strip)
   ============================================================ */
function crRenderList() {
  const strip = document.getElementById('crStrip');
  const empty = document.getElementById('crEmpty');
  const panel = document.getElementById('crPanel');
  if (!strip) return;

  if (crImages.length === 0) {
    if (empty) empty.style.display = 'block';
    if (panel) panel.style.display = 'none';
    strip.innerHTML = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (panel) panel.style.display = 'block';

  strip.innerHTML = crImages.map((img, i) => `
    <div class="cr-thumb ${i === crActiveIdx ? 'active' : ''}" onclick="crSelect(${i})" title="${img.name}">
      <img src="${img.dataUrl}" alt="">
      ${img.cropped ? `<div class="cr-done">✓</div>` : ''}
      <button class="cr-thumb-del" onclick="event.stopPropagation();crRemove('${img.id}')" title="Remove">×</button>
    </div>
  `).join('');

  const info = document.getElementById('crFileInfo');
  if (info && crImages[crActiveIdx]) {
    const f = crImages[crActiveIdx];
    info.textContent = `${f.width}×${f.height} • ${crFmtSize(f.size)}`;
  }
}

window.crSelect = (idx) => {
  if (idx < 0 || idx >= crImages.length) return;
  crActiveIdx = idx;
  crRenderList();
  crRenderPanel();
};

window.crRemove = (id) => {
  const idx = crImages.findIndex(x => x.id === id);
  if (idx === -1) return;
  const f = crImages[idx];
  if (f.cropped && f.cropped.url) URL.revokeObjectURL(f.cropped.url);
  crImages.splice(idx, 1);
  if (crActiveIdx >= crImages.length) crActiveIdx = Math.max(0, crImages.length - 1);
  crRenderList();
  crRenderPanel();
  crUpdateStats();
};

window.crClearAll = () => {
  if (crImages.length === 0) return;
  if (!confirm('Saari images hata dein?')) return;
  crImages.forEach(f => {
    if (f.cropped && f.cropped.url) URL.revokeObjectURL(f.cropped.url);
  });
  crImages = [];
  crActiveIdx = 0;
  if (crCropper) { crCropper.destroy(); crCropper = null; }
  crRenderList();
  crRenderPanel();
  crUpdateStats();
  crToast('🗑️ Saari images remove');
};

function crUpdateStats() {
  const el = document.getElementById('crStats');
  if (!el) return;
  if (crImages.length === 0) { el.textContent = ''; return; }
  const done = crImages.filter(x => x.cropped).length;
  el.innerHTML = `📊 <strong>${crImages.length}</strong> image${crImages.length > 1 ? 's' : ''} • 
    <strong>${done}</strong> cropped`;
}

/* ============================================================
   RENDER MAIN CROP PANEL
   ============================================================ */
function crRenderPanel() {
  const panel = document.getElementById('crPanel');
  if (!panel || crImages.length === 0) return;

  const f = crImages[crActiveIdx];
  if (!f) return;

  const stage = document.getElementById('crStage');
  if (stage) {
    stage.innerHTML = `<img id="crEditImage" src="${f.dataUrl}" alt="">`;
  }

  // Setup cropper after image loads
  setTimeout(() => {
    const imgEl = document.getElementById('crEditImage');
    if (!imgEl) return;

    if (crCropper) { crCropper.destroy(); crCropper = null; }

    if (typeof Cropper === 'undefined') {
      crToast('⚠️ Cropper library load nahi hui');
      return;
    }

    const aspect = CR_ASPECTS[crSettings.aspect];
    crCropper = new Cropper(imgEl, {
      aspectRatio: isNaN(aspect) ? NaN : aspect,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.85,
      background: false,
      responsive: true,
      checkOrientation: false,
      modal: true,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      minContainerHeight: 320
    });
  }, 50);

  // Highlight active aspect chip
  document.querySelectorAll('.cr-aspect-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.val === crSettings.aspect);
  });

  // Update format chips
  document.querySelectorAll('.cr-format-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.val === crSettings.outputFormat);
  });

  crUpdateStats();
}

/* ============================================================
   SETTINGS
   ============================================================ */
window.crSetAspect = (aspect) => {
  crSettings.aspect = aspect;
  document.querySelectorAll('.cr-aspect-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.val === aspect);
  });
  if (crCropper) {
    const val = CR_ASPECTS[aspect];
    crCropper.setAspectRatio(isNaN(val) ? NaN : val);
  }
};

window.crRotate = (deg) => {
  if (crCropper) crCropper.rotate(deg);
};

window.crZoom = (ratio) => {
  if (crCropper) crCropper.zoom(ratio);
};

window.crFlip = (dir) => {
  if (!crCropper) return;
  const data = crCropper.getData();
  if (dir === 'h') {
    crCropper.scaleX(data.scaleX === -1 ? 1 : -1);
  } else {
    crCropper.scaleY(data.scaleY === -1 ? 1 : -1);
  }
};

window.crResetCropper = () => {
  if (crCropper) crCropper.reset();
};

window.crSetFormat = (format) => {
  crSettings.outputFormat = format;
  document.querySelectorAll('.cr-format-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.val === format);
  });
};

window.crSetQuality = (val) => {
  crSettings.quality = parseInt(val, 10);
  const el = document.getElementById('crQualityVal');
  if (el) el.textContent = val + '%';
};

/* ============================================================
   APPLY CROP TO CURRENT
   ============================================================ */
window.crApplyCrop = async () => {
  if (!crCropper) { crToast('❌ Pehle image select karo', 'error'); return; }
  const f = crImages[crActiveIdx];
  if (!f) return;

  try {
    const canvas = crCropper.getCroppedCanvas({
      imageSmoothingQuality: 'high'
    });
    if (!canvas) { crToast('❌ Crop fail', 'error'); return; }

    // Determine output format
    let mime = f.file.type || 'image/jpeg';
    let ext = (f.name.split('.').pop() || 'jpg').toLowerCase();
    if (crSettings.outputFormat === 'jpg') { mime = 'image/jpeg'; ext = 'jpg'; }
    else if (crSettings.outputFormat === 'png') { mime = 'image/png'; ext = 'png'; }
    else if (crSettings.outputFormat === 'webp') { mime = 'image/webp'; ext = 'webp'; }

    const quality = mime === 'image/png' ? undefined : crSettings.quality / 100;
    const blob = await new Promise(res => canvas.toBlob(res, mime, quality));

    if (!blob) { crToast('❌ Blob fail', 'error'); return; }

    // Clean old
    if (f.cropped && f.cropped.url) URL.revokeObjectURL(f.cropped.url);

    const outName = `${crBaseName(f.name)}_cropped.${ext}`;
    const url = URL.createObjectURL(blob);
    f.cropped = { blob, url, name: outName, size: blob.size };
    f.width = canvas.width;
    f.height = canvas.height;

    crRenderList();
    crUpdateStats();
    crToast(`✅ Cropped (${canvas.width}×${canvas.height}, ${crFmtSize(blob.size)})`, 'success');
  } catch (e) {
    console.error('Crop error:', e);
    crToast('❌ Crop fail: ' + (e.message || ''), 'error');
  }
};

/* ============================================================
   DOWNLOAD CURRENT
   ============================================================ */
window.crDownloadCurrent = () => {
  const f = crImages[crActiveIdx];
  if (!f || !f.cropped) { crToast('❌ Pehle apply crop karo', 'error'); return; }
  const a = document.createElement('a');
  a.href = f.cropped.url;
  a.download = f.cropped.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  crToast('✅ Downloaded', 'success');
};

/* ============================================================
   APPLY TO ALL + DOWNLOAD ZIP
   ============================================================ */
window.crApplyAll = async () => {
  if (crImages.length === 0) { crToast('❌ Pehle images add karo', 'error'); return; }
  crToast('⏳ Saari images process ho rahi hain...');

  // We'll crop each image using its own crop (setup via Cropper one by one is complex)
  // Simpler approach: for each image, use current crop settings (aspect, but center-crop)
  // Actually — since crop is per-image, we need Cropper per image.
  // Let's just apply crop to current image and inform user to do others manually.
  crToast('ℹ️ Har image ka crop alag hota hai — ek-ek karke Apply Crop karo');
};

window.crDownloadZip = async () => {
  const done = crImages.filter(f => f.cropped);
  if (done.length === 0) { crToast('❌ Koi image cropped nahi hai', 'error'); return; }
  if (typeof JSZip === 'undefined') { crToast('❌ JSZip load nahi hui', 'error'); return; }
  crToast('📦 ZIP bana rahe hain...');
  const zip = new JSZip();
  done.forEach(f => zip.file(f.cropped.name, f.cropped.blob));
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cropped_${done.length}_images.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  crToast(`✅ ZIP downloaded (${done.length} images)`, 'success');
};

/* ============================================================
   RENDER (main HTML)
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['image-cropper'] = () => `
<div class="cr-wrap">

  <div id="crDrop" class="cr-drop">
    <div class="cr-drop-icon">✂️</div>
    <div class="cr-drop-title">Images drag & drop karo</div>
    <div class="cr-drop-sub">JPG • PNG • WebP • Multiple OK</div>
    <button class="btn btn-primary" onclick="document.getElementById('crInput').click()">
      📁 Select Images
    </button>
    <input type="file" id="crInput" accept="image/*" multiple hidden>
  </div>

  <div id="crStatus" style="font-size:12.5px;color:var(--text-3);text-align:center;margin-top:10px"></div>

  <div id="crEmpty" class="empty-state" style="margin-top:14px">
    <div class="es-emoji">🗂️</div>
    <div class="es-title">Koi image nahi hai</div>
    Upar se images add karo
  </div>

  <div id="crPanel" style="display:none;margin-top:14px">

    <div id="crStats" style="font-size:13px;color:var(--text-2);text-align:center;margin-bottom:12px;padding:10px;background:var(--surface-2);border-radius:10px"></div>

    <!-- THUMB STRIP -->
    <div class="cr-strip" id="crStrip"></div>

    <!-- EDITOR -->
    <div class="cr-editor">
      <div class="cr-stage" id="crStage"></div>

      <div class="cr-toolbar">
        <button class="cr-tool" onclick="crRotate(-90)" title="Rotate Left">↺</button>
        <button class="cr-tool" onclick="crRotate(90)" title="Rotate Right">↻</button>
        <button class="cr-tool" onclick="crZoom(0.1)" title="Zoom In">➕</button>
        <button class="cr-tool" onclick="crZoom(-0.1)" title="Zoom Out">➖</button>
        <button class="cr-tool" onclick="crFlip('h')" title="Flip Horizontal">⇄</button>
        <button class="cr-tool" onclick="crFlip('v')" title="Flip Vertical">⇅</button>
        <button class="cr-tool" onclick="crResetCropper()" title="Reset">⟳</button>
      </div>

      <div class="cr-aspects" id="crAspects">
        <div class="cr-aspect-chip active" data-val="free" onclick="crSetAspect('free')">Free</div>
        <div class="cr-aspect-chip" data-val="1:1" onclick="crSetAspect('1:1')">1:1</div>
        <div class="cr-aspect-chip" data-val="16:9" onclick="crSetAspect('16:9')">16:9</div>
        <div class="cr-aspect-chip" data-val="9:16" onclick="crSetAspect('9:16')">9:16</div>
        <div class="cr-aspect-chip" data-val="4:3" onclick="crSetAspect('4:3')">4:3</div>
        <div class="cr-aspect-chip" data-val="3:4" onclick="crSetAspect('3:4')">3:4</div>
        <div class="cr-aspect-chip" data-val="3:2" onclick="crSetAspect('3:2')">3:2</div>
        <div class="cr-aspect-chip" data-val="2:3" onclick="crSetAspect('2:3')">2:3</div>
        <div class="cr-aspect-chip" data-val="35:45" onclick="crSetAspect('35:45')">Passport</div>
      </div>

      <div class="cr-file-info" id="crFileInfo"></div>

      <!-- OUTPUT FORMAT -->
      <div class="cr-settings-row">
        <label>📁 Output Format</label>
        <div class="cr-format-chips">
          <div class="cr-format-chip active" data-val="original" onclick="crSetFormat('original')">Original</div>
          <div class="cr-format-chip" data-val="jpg" onclick="crSetFormat('jpg')">JPG</div>
          <div class="cr-format-chip" data-val="png" onclick="crSetFormat('png')">PNG</div>
          <div class="cr-format-chip" data-val="webp" onclick="crSetFormat('webp')">WebP</div>
        </div>
      </div>

      <div class="cr-settings-row">
        <label>🎚️ Quality: <span id="crQualityVal">${crSettings.quality}%</span></label>
        <input type="range" min="50" max="100" value="${crSettings.quality}" oninput="crSetQuality(this.value)" style="width:100%">
      </div>

      <div class="btn-group" style="margin-top:14px">
        <button class="btn btn-secondary" onclick="crResetCropper()">🔄 Reset Crop</button>
        <button class="btn btn-primary" onclick="crApplyCrop()">✓ Apply Crop</button>
      </div>

      <div class="btn-group" style="margin-top:10px">
        <button class="btn btn-secondary" onclick="crDownloadCurrent()">⬇ Download Current</button>
        <button class="btn btn-secondary" onclick="crDownloadZip()">📦 Download All (ZIP)</button>
        <button class="btn btn-secondary" onclick="crClearAll()">🗑️ Clear All</button>
      </div>

      <div class="hint" style="margin-top:14px;text-align:center">
        🔒 100% browser me process — images upload nahi hoti
      </div>
    </div>
  </div>
</div>

<style>
  .cr-wrap { padding: 4px 0; }
  .cr-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 26px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .cr-drop:hover, .cr-drop.dragover { border-color: var(--primary); background: var(--surface-hover); }
  .cr-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .cr-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .cr-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }

  .cr-strip { display: flex; gap: 8px; overflow-x: auto; padding: 8px 4px 12px; }
  .cr-thumb { position: relative; width: 74px; height: 74px; border-radius: 10px; overflow: hidden; border: 2px solid var(--border); flex-shrink: 0; cursor: pointer; transition: all .15s; background: #fff; }
  .cr-thumb:hover { border-color: var(--primary); }
  .cr-thumb.active { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.25); }
  .cr-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .cr-done { position: absolute; bottom: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: #10b981; color: #fff; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
  .cr-thumb-del { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,.65); color: #fff; font-size: 12px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; }
  .cr-thumb-del:hover { background: #ef4444; }

  .cr-editor { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 12px; }
  .cr-stage { position: relative; width: 100%; height: 340px; background: #111; border-radius: 10px; overflow: hidden; }
  .cr-stage img { max-width: 100%; display: block; }

  .cr-toolbar { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; justify-content: center; }
  .cr-tool { width: 40px; height: 40px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
  .cr-tool:hover { background: var(--surface-hover); color: var(--primary); }

  .cr-aspects { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; justify-content: center; }
  .cr-aspect-chip { padding: 7px 12px; border-radius: 8px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .cr-aspect-chip:hover { background: var(--surface-hover); }
  .cr-aspect-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }

  .cr-file-info { text-align: center; font-size: 12px; color: var(--text-3); margin: 10px 0; }

  .cr-settings-row { margin-top: 12px; }
  .cr-settings-row > label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2); margin-bottom: 6px; }
  .cr-format-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .cr-format-chip { padding: 7px 12px; border-radius: 8px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12px; font-weight: 600; cursor: pointer; }
  .cr-format-chip:hover { background: var(--surface-hover); }
  .cr-format-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }

  input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 3px; background: var(--surface-2); outline: none; }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--gradient); cursor: pointer; }

  @media (max-width: 480px) {
    .cr-stage { height: 260px; }
    .cr-tool { width: 36px; height: 36px; font-size: 14px; }
    .cr-aspect-chip { padding: 6px 10px; font-size: 11.5px; }
    .cr-thumb { width: 62px; height: 62px; }
  }
</style>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['image-cropper'] = () => {
  const drop = document.getElementById('crDrop');
  const input = document.getElementById('crInput');
  if (!drop || !input) return;

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });
  input.addEventListener('change', e => {
    if (e.target.files && e.target.files.length) {
      crAddFiles(e.target.files);
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
      crAddFiles(e.dataTransfer.files);
    }
  });
};

console.log('%c✅ Image Cropper loaded', 'color:#10b981;font-weight:bold');