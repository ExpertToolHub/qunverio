/* ============================================================
   QUNVERIO — SIGNATURE CROPPER (tools/digital-studio/signature-cropper.js)
   Crop signature, remove background, make white bg — for forms
   Uses: Cropper.js + Canvas (threshold filter)
   ============================================================ */

console.log('%cSignature Cropper loading...', 'color:#06b6d4;font-weight:bold');

let sgImage = null;           // original image data
let sgCropper = null;
let sgBusy = false;

let sgSettings = {
  // Auto-enhance settings
  autoWhite: true,
  threshold: 180,             // 0-255, higher = more white
  contrast: 130,              // 50-200%
  brightness: 100,            // 50-200%
  removeShadows: true,
  thickness: 0,               // -3 to +3 px, signature thickness
  // Output
  bgColor: '#ffffff',
  outputFormat: 'png',        // png | jpg
  outputWidth: 600,           // px, auto-scale height
  // Presets for Indian forms
  preset: 'pan'               // pan | aadhaar | bank | exam | custom
};

const SG_PRESETS = {
  pan:      { label: '📋 PAN Card (400×200)', w: 400, h: 200, maxKB: 30 },
  aadhaar:  { label: '🆔 Aadhaar (400×200)', w: 400, h: 200, maxKB: 20 },
  bank:     { label: '🏦 Bank KYC (400×200)', w: 400, h: 200, maxKB: 30 },
  exam:     { label: '📝 Exam Form (300×80)', w: 300, h: 80, maxKB: 15 },
  custom:   { label: '⚙️ Custom', w: 600, h: 200, maxKB: 100 }
};

/* ============================================================
   HELPERS
   ============================================================ */
function sgFmtSize(bytes) {
  if (!bytes && bytes !== 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function sgToast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

/* ============================================================
   LOAD FILE
   ============================================================ */
window.sgLoadFile = (file) => {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    sgToast('❌ Sirf image select karo', 'error');
    return;
  }
  if (file.size > 30 * 1024 * 1024) {
    sgToast('❌ Image 30MB se bada', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    sgImage = e.target.result;
    sgOpenCropper();
  };
  reader.readAsDataURL(file);
};

/* ============================================================
   OPEN CROPPER
   ============================================================ */
window.sgOpenCropper = () => {
  if (!sgImage) return;
  const preset = SG_PRESETS[sgSettings.preset];
  const aspect = preset.w / preset.h;

  const modal = document.getElementById('sgCropModal');
  const img = document.getElementById('sgCropImage');
  if (!modal || !img) return;

  img.src = sgImage;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  img.onload = () => {
    if (sgCropper) { sgCropper.destroy(); sgCropper = null; }
    if (typeof Cropper === 'undefined') {
      sgToast('⚠️ Cropper library load nahi hui');
      return;
    }
    sgCropper = new Cropper(img, {
      aspectRatio: aspect,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.9,
      background: false,
      responsive: true,
      checkOrientation: false,
      modal: true,
      guides: false,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      minContainerHeight: 300
    });
  };
};

window.sgCloseCropModal = () => {
  const modal = document.getElementById('sgCropModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  if (sgCropper) { sgCropper.destroy(); sgCropper = null; }
};

window.sgCropApply = () => {
  if (!sgCropper) { sgCloseCropModal(); return; }
  try {
    const canvas = sgCropper.getCroppedCanvas({
      imageSmoothingQuality: 'high'
    });
    window.sgCroppedCanvas = canvas;
    sgCloseCropModal();
    sgRenderPreview();
    sgToast('✅ Signature cropped', 'success');
  } catch (e) {
    console.error(e);
    sgToast('❌ Crop fail', 'error');
  }
};

window.sgCropCancel = () => {
  sgCloseCropModal();
  if (!window.sgCroppedCanvas) {
    sgImage = null;
    sgRenderDrop();
  }
};

window.sgRecrop = () => {
  if (!sgImage) return;
  sgOpenCropper();
};

/* ============================================================
   IMAGE PROCESSING — signature enhancement
   ============================================================ */
function sgProcessSignature() {
  if (!window.sgCroppedCanvas) return null;

  const src = window.sgCroppedCanvas;
  const preset = SG_PRESETS[sgSettings.preset];

  // Output dimensions
  const targetW = parseInt(sgSettings.outputWidth) || preset.w;
  const aspect = src.height / src.width;
  const targetH = Math.round(targetW * aspect);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = sgSettings.bgColor;
  ctx.fillRect(0, 0, targetW, targetH);

  // Draw source at full size
  ctx.drawImage(src, 0, 0, targetW, targetH);

  // Get image data for processing
  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;

  // Apply contrast + brightness + threshold + shadows
  const contrast = sgSettings.contrast / 100;
  const brightness = sgSettings.brightness / 100;
  const threshold = sgSettings.threshold;

  // First pass: brightness + contrast
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];

    // Grayscale (luminance)
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Brightness
    gray *= brightness;

    // Contrast
    gray = ((gray / 255 - 0.5) * contrast + 0.5) * 255;

    // Clamp
    gray = Math.max(0, Math.min(255, gray));

    // Threshold for auto-white (signature → dark, bg → white)
    if (sgSettings.autoWhite) {
      if (gray > threshold) gray = 255;         // background → white
      else gray = Math.max(0, gray - 30);       // signature → darker
    }

    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  // Second pass: remove shadows (if enabled)
  if (sgSettings.removeShadows) {
    // Find the darkest pixel and normalize
    let minGray = 255;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < minGray) minGray = data[i];
    }
    if (minGray > 40) {
      // Signature is light — darken it
      for (let i = 0; i < data.length; i += 4) {
        let v = data[i];
        // Stretch: [minGray, 255] → [0, 255]
        v = Math.max(0, Math.min(255, ((v - minGray) / (255 - minGray)) * 255));
        data[i] = data[i + 1] = data[i + 2] = v;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return canvas;
}

/* ============================================================
   RENDER PREVIEW
   ============================================================ */
function sgRenderPreview() {
  const drop = document.getElementById('sgDrop');
  const panel = document.getElementById('sgPanel');
  if (drop) drop.style.display = 'none';
  if (panel) panel.style.display = 'block';

  if (!window.sgCroppedCanvas) {
    const single = document.getElementById('sgPreview');
    if (single) single.innerHTML = '<div class="empty-state"><div class="es-emoji">✍️</div><div class="es-title">Photo crop karo</div><button class="btn btn-primary" onclick="sgOpenCropper()" style="margin-top:10px">✂️ Open Crop</button></div>';
    return;
  }

  const processed = sgProcessSignature();
  if (!processed) return;

  // Save current data URL
  window.sgProcessedCanvas = processed;

  const dataUrl = processed.toDataURL('image/png');

  const preview = document.getElementById('sgPreview');
  if (preview) {
    const preset = SG_PRESETS[sgSettings.preset];
    preview.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
        <div style="background:#fff;padding:8px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.15);border:1px solid #ddd">
          <img src="${dataUrl}" style="max-width:100%;max-height:180px;display:block">
        </div>
        <div style="font-size:12px;color:var(--text-3)">
          ${processed.width}×${processed.height}px @ ${sgSettings.outputFormat.toUpperCase()}
        </div>
      </div>
    `;
  }

  // Update file size estimate
  sgUpdateSizeEstimate();
}

function sgUpdateSizeEstimate() {
  const el = document.getElementById('sgSizeEstimate');
  if (!el || !window.sgProcessedCanvas) return;

  const format = sgSettings.outputFormat;
  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = format === 'png' ? undefined : 0.92;

  window.sgProcessedCanvas.toBlob(blob => {
    if (!blob) { el.textContent = ''; return; }
    const size = blob.size;
    const preset = SG_PRESETS[sgSettings.preset];
    const target = preset.maxKB * 1024;
    const ok = size <= target;
    const color = ok ? '#10b981' : '#f59e0b';
    const icon = ok ? '✅' : '⚠️';
    el.innerHTML = `${icon} <strong style="color:${color}">${sgFmtSize(size)}</strong> 
      <span style="color:var(--text-3)">(target: ${preset.maxKB} KB)</span>
      ${!ok ? `<br><span style="font-size:11px;color:#f59e0b">💡 Tip: quality kam karo ya preset size chota choose karo</span>` : ''}`;
  }, mime, quality);
}

/* ============================================================
   SETTINGS
   ============================================================ */
window.sgSetPreset = (preset) => {
  sgSettings.preset = preset;
  const p = SG_PRESETS[preset];
  if (p) sgSettings.outputWidth = p.w;
  const input = document.getElementById('sgOutputWidth');
  if (input) input.value = p.w;
  sgRenderPreview();
};

window.sgSetSetting = (key, val) => {
  sgSettings[key] = val;
  if (key === 'outputWidth') sgSettings[key] = parseInt(val, 10) || 600;
  if (key === 'threshold' || key === 'contrast' || key === 'brightness') {
    sgSettings[key] = parseFloat(val);
    const el = document.getElementById('sg' + key.charAt(0).toUpperCase() + key.slice(1) + 'Val');
    if (el) el.textContent = val + (key === 'threshold' ? '' : '%');
  }
  if (key === 'outputFormat') {
    document.querySelectorAll('.sg-format-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.val === val);
    });
  }
  if (key === 'autoWhite' || key === 'removeShadows') {
    sgSettings[key] = !!val;
  }
  sgRenderPreview();
};

window.sgResetSettings = () => {
  sgSettings = {
    autoWhite: true,
    threshold: 180,
    contrast: 130,
    brightness: 100,
    removeShadows: true,
    thickness: 0,
    bgColor: '#ffffff',
    outputFormat: 'png',
    outputWidth: 400,
    preset: 'pan'
  };
  sgRenderPreview();
  sgToast('🔄 Settings reset');
};

/* ============================================================
   RENDER — DROP ZONE
   ============================================================ */
function sgRenderDrop() {
  const drop = document.getElementById('sgDrop');
  const panel = document.getElementById('sgPanel');
  if (drop) drop.style.display = 'block';
  if (panel) panel.style.display = 'none';
}

/* ============================================================
   DOWNLOAD
   ============================================================ */
window.sgDownload = async () => {
  if (!window.sgProcessedCanvas) {
    sgToast('❌ Pehle signature crop karo', 'error');
    return;
  }
  const format = sgSettings.outputFormat;
  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';
  const quality = format === 'png' ? undefined : 0.92;

  const blob = await new Promise(res => window.sgProcessedCanvas.toBlob(res, mime, quality));
  if (!blob) { sgToast('❌ Download fail', 'error'); return; }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `signature_${Date.now()}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  sgToast(`✅ Downloaded (${sgFmtSize(blob.size)})`, 'success');
};

window.sgReset = () => {
  if (!confirm('Signature reset kar dein?')) return;
  sgImage = null;
  window.sgCroppedCanvas = null;
  window.sgProcessedCanvas = null;
  if (sgCropper) { sgCropper.destroy(); sgCropper = null; }
  sgCloseCropModal();
  sgRenderDrop();
  sgToast('🔄 Reset done');
};

/* ============================================================
   RENDER (main HTML)
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['signature-cropper'] = () => `
<div class="sg-wrap">

  <div id="sgDrop" class="sg-drop">
    <div class="sg-drop-icon">✍️</div>
    <div class="sg-drop-title">Signature photo upload karo</div>
    <div class="sg-drop-sub">JPG • PNG • Max 30MB • White paper pe signature</div>
    <button class="btn btn-primary" onclick="document.getElementById('sgInput').click()">
      📁 Select Photo
    </button>
    <input type="file" id="sgInput" accept="image/*" hidden>
  </div>

  <div id="sgPanel" style="display:none;margin-top:14px">

    <!-- PREVIEW -->
    <div class="card" style="text-align:center">
      <div class="card-title">✍️ Preview</div>
      <div id="sgPreview"></div>
      <div id="sgSizeEstimate" style="margin-top:12px;font-size:13px"></div>
      <div class="btn-group" style="margin-top:12px">
        <button class="btn btn-secondary" onclick="sgRecrop()">✂️ Re-crop</button>
        <button class="btn btn-secondary" onclick="sgReset()">🔄 Change Photo</button>
      </div>
    </div>

    <!-- PRESETS -->
    <div class="sg-settings">
      <div class="card-title" style="margin-bottom:10px">📋 Form Presets</div>
      <div class="sg-presets">
        ${Object.entries(SG_PRESETS).map(([k, v]) => `
          <div class="sg-preset-chip ${sgSettings.preset === k ? 'active' : ''}" data-val="${k}" onclick="sgSetPreset('${k}')">
            ${v.label}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- AUTO ENHANCE -->
    <div class="sg-settings">
      <div class="card-title" style="margin-bottom:10px">🎨 Signature Enhancement</div>

      <div class="sg-toggle-row">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" ${sgSettings.autoWhite ? 'checked' : ''} onchange="sgSetSetting('autoWhite',this.checked)" style="width:auto">
          <span>Auto-white background</span>
        </label>
      </div>

      <div class="sg-toggle-row">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" ${sgSettings.removeShadows ? 'checked' : ''} onchange="sgSetSetting('removeShadows',this.checked)" style="width:auto">
          <span>Remove shadows / brighten</span>
        </label>
      </div>

      <div class="sg-slider-row">
        <label>Threshold (white cutoff): <span id="sgThresholdVal">${sgSettings.threshold}</span></label>
        <input type="range" min="80" max="240" value="${sgSettings.threshold}" oninput="sgSetSetting('threshold',this.value)" style="width:100%">
        <div class="hint">Zyada = zyada white (background clean)</div>
      </div>

      <div class="sg-slider-row">
        <label>Contrast: <span id="sgContrastVal">${sgSettings.contrast}%</span></label>
        <input type="range" min="50" max="250" value="${sgSettings.contrast}" oninput="sgSetSetting('contrast',this.value)" style="width:100%">
      </div>

      <div class="sg-slider-row">
        <label>Brightness: <span id="sgBrightnessVal">${sgSettings.brightness}%</span></label>
        <input type="range" min="50" max="150" value="${sgSettings.brightness}" oninput="sgSetSetting('brightness',this.value)" style="width:100%">
      </div>

      <button class="btn btn-secondary btn-sm" onclick="sgResetSettings()" style="margin-top:8px;width:100%">
        🔄 Reset Enhancement
      </button>
    </div>

    <!-- OUTPUT -->
    <div class="sg-settings">
      <div class="card-title" style="margin-bottom:10px">📤 Output Settings</div>

      <div style="margin-bottom:14px">
        <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
          Width (px)
        </label>
        <input type="number" id="sgOutputWidth" value="${sgSettings.outputWidth}" min="100" max="2000"
          oninput="sgSetSetting('outputWidth',this.value)"
          style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
      </div>

      <div>
        <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
          Format
        </label>
        <div class="sg-format-chips">
          <div class="sg-format-chip ${sgSettings.outputFormat === 'png' ? 'active' : ''}" data-val="png" onclick="sgSetSetting('outputFormat','png')">PNG (transparent support)</div>
          <div class="sg-format-chip ${sgSettings.outputFormat === 'jpg' ? 'active' : ''}" data-val="jpg" onclick="sgSetSetting('outputFormat','jpg')">JPG (smaller)</div>
        </div>
      </div>
    </div>

    <!-- DOWNLOAD -->
    <div class="btn-group" style="margin-top:14px">
      <button class="btn btn-primary" onclick="sgDownload()" style="width:100%">⬇ Download Signature</button>
    </div>

    <div class="hint" style="margin-top:14px;text-align:center">
      🔒 100% browser me process — photo upload nahi hoti
    </div>
  </div>
</div>

<!-- CROP MODAL -->
<div class="sg-crop-modal" id="sgCropModal">
  <div class="sg-crop-header">
    <h3>✂️ Crop Signature</h3>
    <button class="btn btn-secondary" onclick="sgCropCancel()" style="padding:6px 12px">✕</button>
  </div>
  <div class="sg-crop-body">
    <img id="sgCropImage" src="" alt="Crop">
  </div>
  <div class="sg-crop-footer">
    <button class="btn btn-secondary" onclick="sgCropCancel()">Cancel</button>
    <button class="btn btn-primary" onclick="sgCropApply()">✓ Apply Crop</button>
  </div>
</div>

<style>
  .sg-wrap { padding: 4px 0; }
  .sg-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 30px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .sg-drop:hover { border-color: var(--primary); background: var(--surface-hover); }
  .sg-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .sg-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .sg-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }

  .sg-settings { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; margin-top: 12px; }
  .sg-presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .sg-preset-chip { padding: 8px 12px; border-radius: 10px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .sg-preset-chip:hover { background: var(--surface-hover); }
  .sg-preset-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }

  .sg-toggle-row { margin-bottom: 10px; font-size: 13px; color: var(--text-2); }
  .sg-slider-row { margin-bottom: 12px; }
  .sg-slider-row > label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2); margin-bottom: 6px; }
  .sg-format-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .sg-format-chip { padding: 8px 12px; border-radius: 8px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12px; font-weight: 600; cursor: pointer; }
  .sg-format-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }

  input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 3px; background: var(--surface-2); outline: none; }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--gradient); cursor: pointer; }

  .sg-crop-modal { position: fixed; inset: 0; background: rgba(0,0,0,.95); z-index: 99999; display: none; flex-direction: column; }
  .sg-crop-modal.active { display: flex; }
  .sg-crop-header { padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2a2a3e; background: var(--surface); }
  .sg-crop-header h3 { color: var(--text); font-size: 15px; margin: 0; }
  .sg-crop-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 16px; overflow: hidden; position: relative; }
  .sg-crop-body img { max-width: 100%; max-height: 100%; display: block; }
  .sg-crop-footer { padding: 14px 18px; display: flex; gap: 10px; border-top: 1px solid #2a2a3e; background: var(--surface); }
  .sg-crop-footer .btn { flex: 1; }
</style>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['signature-cropper'] = () => {
  const input = document.getElementById('sgInput');
  const drop = document.getElementById('sgDrop');
  if (!input || !drop) return;

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });
  input.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      sgLoadFile(e.target.files[0]);
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
      sgLoadFile(e.dataTransfer.files[0]);
    }
  });
};

console.log('%c✅ Signature Cropper loaded', 'color:#06b6d4;font-weight:bold');