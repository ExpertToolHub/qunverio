/* ============================================================
   QUNVERIO — PASSPORT PHOTO MAKER (FINAL v6)
   Presets: 3, 6, 12, 24, Fill All + Manual Count
   ============================================================ */

console.log('%cPassport Photo Maker loading...', 'color:#3b82f6;font-weight:bold');

let ppOriginal = null;
let ppCroppedCanvas = null;
let ppCropper = null;
let ppBusy = false;

let ppSettings = {
  size: 'passport_in',
  customW: 35, customH: 45,
  bgColor: '#ffffff',
  border: false,
  borderColor: '#000000',
  borderWidth: 4,
  sharpness: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  smooth: 0,
  sheetSize: 'a4',
  sheetOrientation: 'portrait',
  gap: 2,
  margin: 5,
  dpi: 300,
  showCutMarks: true,
  showBorderOnSheet: true,
  photoCount: 0,
  layoutMode: 'auto',
  manualCols: 4,
  manualRows: 2
};

const PP_PRESETS = {
  passport_in: { w: 35, h: 45, label: '🇮🇳 Passport India (35×45mm)' },
  passport_us: { w: 51, h: 51, label: '🇺🇸 US Passport (51×51mm)' },
  passport_uk: { w: 35, h: 45, label: '🇬🇧 UK Passport (35×45mm)' },
  stamp:       { w: 20, h: 25, label: '📮 Stamp Size (20×25mm)' },
  visa:        { w: 35, h: 45, label: '✈️ Visa Photo (35×45mm)' },
  pan:         { w: 25, h: 35, label: '📋 PAN/Aadhaar (25×35mm)' },
  custom:      { w: 35, h: 45, label: '⚙️ Custom' }
};

const PP_BG_PRESETS = [
  { name: 'White', color: '#ffffff', border: '#000000' },
  { name: 'Black', color: '#000000', border: '#ffffff' },
  { name: 'Blue',  color: '#dbeafe', border: '#1e3a8a' },
  { name: 'Red',   color: '#fee2e2', border: '#7f1d1d' },
  { name: 'Grey',  color: '#e5e7eb', border: '#374151' },
  { name: 'Green', color: '#d1fae5', border: '#065f46' },
  { name: 'Yellow',color: '#fef3c7', border: '#78350f' }
];

const PP_STROKE_COLORS = [
  { name: 'Black', color: '#000000' },
  { name: 'White', color: '#ffffff' },
  { name: 'Grey',  color: '#6b7280' },
  { name: 'Blue',  color: '#1e3a8a' },
  { name: 'Red',   color: '#dc2626' },
  { name: 'Green', color: '#059669' }
];

/* ============================================================
   HELPERS
   ============================================================ */
function ppToast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

function ppMMToPx(mm, dpi) {
  return Math.round((mm / 25.4) * dpi);
}

/* ============================================================
   CALCULATE LAYOUT
   ============================================================ */
function ppCalcLayout(pageW, pageH, wMM, hMM, margin, gap) {
  const availW = pageW - 2 * margin;
  const availH = pageH - 2 * margin;
  const maxCols = Math.max(1, Math.floor((availW + gap) / (wMM + gap)));
  const maxRows = Math.max(1, Math.floor((availH + gap) / (hMM + gap)));
  return { maxCols, maxRows, maxTotal: maxCols * maxRows };
}

/* ============================================================
   LOAD FILE
   ============================================================ */
window.ppLoadFile = (file) => {
  if (!file) return;
  if (!file.type.startsWith('image/')) { ppToast('❌ Sirf image select karo', 'error'); return; }
  if (file.size > 30 * 1024 * 1024) { ppToast('❌ Image 30MB se choti honi chahiye', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => { ppOriginal = e.target.result; ppOpenCropper(); };
  reader.readAsDataURL(file);
};

/* ============================================================
   CROPPER
   ============================================================ */
window.ppOpenCropper = () => {
  if (!ppOriginal) return;
  const getRatio = () => {
    const preset = PP_PRESETS[ppSettings.size];
    const w = preset ? preset.w : ppSettings.customW;
    const h = preset ? preset.h : ppSettings.customH;
    return w / h;
  };

  const modal = document.getElementById('ppCropModal');
  const img = document.getElementById('ppCropImage');
  if (!modal || !img) return;

  img.src = ppOriginal;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  img.onload = () => {
    if (ppCropper) { ppCropper.destroy(); ppCropper = null; }
    if (typeof Cropper === 'undefined') { ppCroppedCanvas = null; ppToast('⚠️ Cropper load nahi hui'); return; }
    ppCropper = new Cropper(img, {
      aspectRatio: getRatio(),
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.85,
      background: false,
      responsive: true,
      checkOrientation: false,
      modal: true,
      guides: false,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      minContainerHeight: 320
    });
  };
};

window.ppCloseCropModal = () => {
  const modal = document.getElementById('ppCropModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  if (ppCropper) { ppCropper.destroy(); ppCropper = null; }
};

window.ppCropApply = () => {
  if (!ppCropper) { ppCloseCropModal(); return; }
  try {
    const preset = PP_PRESETS[ppSettings.size];
    const wMM = preset ? preset.w : ppSettings.customW;
    const hMM = preset ? preset.h : ppSettings.customH;
    const wPx = ppMMToPx(wMM, ppSettings.dpi);
    const hPx = ppMMToPx(hMM, ppSettings.dpi);

    const canvas = ppCropper.getCroppedCanvas({
      width: wPx, height: hPx,
      imageSmoothingQuality: 'high',
      fillColor: ppSettings.bgColor
    });
    ppCroppedCanvas = canvas;
    ppCloseCropModal();
    ppRenderPreview();
    ppToast('✅ Photo cropped', 'success');
  } catch (e) {
    console.error(e);
    ppToast('❌ Crop fail', 'error');
  }
};

window.ppCropCancel = () => {
  ppCloseCropModal();
  if (!ppCroppedCanvas) { ppOriginal = null; ppRenderDrop(); }
};

window.ppRecrop = () => { if (ppOriginal) ppOpenCropper(); };

/* ============================================================
   SETTINGS
   ============================================================ */
window.ppSetSetting = (key, val) => {
  if (key === 'photoCount' || key === 'manualCols' || key === 'manualRows' || key === 'dpi' || key === 'gap' || key === 'margin') {
    ppSettings[key] = parseInt(val, 10) || 0;
  } else {
    ppSettings[key] = val;
  }

  if (key === 'size') {
    if (ppOriginal) {
      const preset = PP_PRESETS[val];
      if (preset) { ppSettings.customW = preset.w; ppSettings.customH = preset.h; }
      ppRenderPreview();
    }
  } else if (key === 'customW' || key === 'customH') {
    ppSettings[key] = parseFloat(val) || 35;
    ppRenderPreview();
  } else if (key === 'bgColor') {
    ppRenderPreview();
  } else if (key === 'showCutMarks' || key === 'showBorderOnSheet') {
    ppSettings[key] = !!val;
    ppRenderPreview();
  } else if (key === 'dpi' || key === 'gap' || key === 'margin') {
    ppRenderPreview();
  } else if (key === 'sheetSize' || key === 'sheetOrientation') {
    ppRenderPreview();
  } else if (key === 'photoCount' || key === 'layoutMode' || key === 'manualCols' || key === 'manualRows') {
    ppRenderPreview();
  }
};

/* ============================================================
   PHOTO COUNT + LAYOUT
   ============================================================ */
window.ppSetPhotoCount = (val) => {
  ppSettings.photoCount = Math.max(0, parseInt(val, 10) || 0);
  ppSettings.layoutMode = 'auto';
  const modeSel = document.getElementById('ppLayoutMode');
  if (modeSel) modeSel.value = 'auto';
  const hint = document.getElementById('ppPhotoCountHint');
  if (hint) hint.textContent = ppSettings.photoCount === 0 ? 'Auto (fill sheet)' : `${ppSettings.photoCount} photos`;
  ppRenderPreview();
};

window.ppSetLayoutMode = (mode) => {
  ppSettings.layoutMode = mode;
  const box = document.getElementById('ppManualLayoutBox');
  if (box) box.style.display = mode === 'manual' ? 'block' : 'none';
  ppRenderPreview();
};

window.ppSetManualLayout = (key, val) => {
  ppSettings[key] = Math.max(1, parseInt(val, 10) || 1);
  ppRenderPreview();
};

window.ppQuickCount = (n) => {
  ppSettings.photoCount = n;
  ppSettings.layoutMode = 'auto';
  const input = document.getElementById('ppPhotoCountInput');
  if (input) input.value = n;
  const modeSel = document.getElementById('ppLayoutMode');
  if (modeSel) modeSel.value = 'auto';
  const hint = document.getElementById('ppPhotoCountHint');
  if (hint) hint.textContent = n === 0 ? 'Auto (fill sheet)' : `${n} photos`;
  ppRenderPreview();
  ppToast(n === 0 ? '📄 Fill all photos' : `✅ ${n} photos selected`, 'success');
};

/* ============================================================
   DROPDOWN
   ============================================================ */
window.ppToggleDropdown = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const isOpen = el.style.display === 'block';
  el.style.display = isOpen ? 'none' : 'block';
  const arrow = document.getElementById(id + 'Arrow');
  if (arrow) arrow.textContent = isOpen ? '▼' : '▲';
};

/* ============================================================
   STROKE
   ============================================================ */
window.ppToggleStroke = (checked) => {
  ppSettings.border = !!checked;
  const controls = document.getElementById('ppStrokeControls');
  if (controls) controls.style.display = checked ? 'block' : 'none';
  const status = document.getElementById('ppStrokeStatus');
  if (status) status.textContent = checked ? 'ON' : 'OFF';
  ppRenderPreview();
};

window.ppSetStrokeWidth = (val) => {
  let v = parseInt(val, 10);
  if (isNaN(v)) v = 1;
  v = Math.max(1, Math.min(20, v));
  ppSettings.borderWidth = v;
  const label = document.getElementById('ppStrokeWidthVal');
  if (label) label.textContent = v;
  const slider = document.getElementById('ppStrokeWidthSlider');
  if (slider) slider.value = v;
  ppRenderPreview();
};

window.ppStrokeStep = (delta) => {
  ppSetStrokeWidth(ppSettings.borderWidth + delta);
};

window.ppSetStrokeColor = (color) => {
  ppSettings.borderColor = color;
  const picker = document.getElementById('ppStrokeColorPicker');
  if (picker) picker.value = color;
  document.querySelectorAll('.pp-stroke-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.color === color);
  });
  ppRenderPreview();
};

window.ppResetStroke = () => {
  ppSettings.borderColor = '#000000';
  ppSettings.borderWidth = 4;
  const picker = document.getElementById('ppStrokeColorPicker');
  if (picker) picker.value = '#000000';
  const label = document.getElementById('ppStrokeWidthVal');
  if (label) label.textContent = '4';
  const slider = document.getElementById('ppStrokeWidthSlider');
  if (slider) slider.value = 4;
  document.querySelectorAll('.pp-stroke-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.color === '#000000');
  });
  ppRenderPreview();
  ppToast('🔄 Stroke reset', 'success');
};

/* ============================================================
   ADJUSTMENTS
   ============================================================ */
window.ppSetAdjustment = (key, val) => {
  ppSettings[key] = parseInt(val, 10) || 0;
  const labels = {
    sharpness: 'ppSharpVal',
    brightness: 'ppBrightVal',
    contrast: 'ppContrastVal',
    saturation: 'ppSatVal',
    smooth: 'ppSmoothVal'
  };
  const el = document.getElementById(labels[key]);
  if (el) el.textContent = val;
  ppRenderPreview();
};

window.ppResetAdjustments = () => {
  ppSettings.sharpness = 0;
  ppSettings.brightness = 100;
  ppSettings.contrast = 100;
  ppSettings.saturation = 100;
  ppSettings.smooth = 0;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  set('ppSharpSlider', 0);
  set('ppBrightSlider', 100);
  set('ppContrastSlider', 100);
  set('ppSatSlider', 100);
  set('ppSmoothSlider', 0);
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('ppSharpVal', 0);
  setText('ppBrightVal', 100);
  setText('ppContrastVal', 100);
  setText('ppSatVal', 100);
  setText('ppSmoothVal', 0);
  ppRenderPreview();
  ppToast('🔄 Adjustments reset', 'success');
};

/* ============================================================
   QUICK BG PRESETS
   ============================================================ */
window.ppApplyBgPreset = (idx) => {
  const p = PP_BG_PRESETS[idx];
  if (!p) return;
  ppSettings.bgColor = p.color;
  ppSettings.borderColor = p.border;
  ppSettings.border = true;
  if (ppOriginal) ppOpenCropper();
  else ppRenderPreview();
  document.querySelectorAll('.pp-bg-chip').forEach((c, i) => {
    c.classList.toggle('active', i === idx);
  });
  ppToast(`🎨 ${p.name} applied`, 'success');
};

/* ============================================================
   RENDER DROP
   ============================================================ */
function ppRenderDrop() {
  const drop = document.getElementById('ppDrop');
  const panel = document.getElementById('ppPanel');
  if (drop) drop.style.display = 'block';
  if (panel) panel.style.display = 'none';
}

/* ============================================================
   APPLY ADJUSTMENTS
   ============================================================ */
function ppApplyAdjustments(canvas) {
  if (!canvas) return canvas;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const brightness = ppSettings.brightness / 100;
  const contrast = ppSettings.contrast / 100;
  const saturation = ppSettings.saturation / 100;
  const sharpness = ppSettings.sharpness;
  const smooth = ppSettings.smooth;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    r *= brightness; g *= brightness; b *= brightness;
    r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * saturation;
    g = gray + (g - gray) * saturation;
    b = gray + (b - gray) * saturation;
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  if (sharpness > 0) {
    const copy = new Uint8ClampedArray(data);
    const amt = sharpness / 100;
    const w = canvas.width, h = canvas.height;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const center = copy[i + c];
          const avg = (copy[((y - 1) * w + x) * 4 + c] + copy[((y + 1) * w + x) * 4 + c] + copy[(y * w + x - 1) * 4 + c] + copy[(y * w + x + 1) * 4 + c]) / 4;
          const diff = center - avg;
          data[i + c] = Math.max(0, Math.min(255, center + diff * amt * 2));
        }
      }
    }
  }

  if (smooth > 0) {
    const copy = new Uint8ClampedArray(data);
    const radius = Math.max(1, Math.round(smooth / 20));
    const w = canvas.width, h = canvas.height;
    const amt = smooth / 100;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
              const ni = (ny * w + nx) * 4;
              rSum += copy[ni]; gSum += copy[ni + 1]; bSum += copy[ni + 2];
              count++;
            }
          }
        }
        const rAvg = rSum / count, gAvg = gSum / count, bAvg = bSum / count;
        data[i] = copy[i] * (1 - amt) + rAvg * amt;
        data[i + 1] = copy[i + 1] * (1 - amt) + gAvg * amt;
        data[i + 2] = copy[i + 2] * (1 - amt) + bAvg * amt;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/* ============================================================
   BUILD PHOTO
   ============================================================ */
function ppBuildPhoto() {
  if (!ppCroppedCanvas) return null;
  const temp = document.createElement('canvas');
  temp.width = ppCroppedCanvas.width;
  temp.height = ppCroppedCanvas.height;
  const ctx = temp.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, temp.width, temp.height);
  ctx.drawImage(ppCroppedCanvas, 0, 0);
  ppApplyAdjustments(temp);
  if (ppSettings.border) {
    const bpx = Math.max(1, Math.round(ppSettings.borderWidth * ppSettings.dpi / 96));
    ctx.strokeStyle = ppSettings.borderColor || '#000000';
    ctx.lineWidth = bpx * 2;
    ctx.strokeRect(bpx, bpx, temp.width - bpx * 2, temp.height - bpx * 2);
  }
  return temp;
}

/* ============================================================
   GET LAYOUT
   ============================================================ */
function ppGetLayout() {
  const preset = PP_PRESETS[ppSettings.size];
  const wMM = preset ? preset.w : ppSettings.customW;
  const hMM = preset ? preset.h : ppSettings.customH;

  const pages = {
    a4: { p: { w: 210, h: 297 }, l: { w: 297, h: 210 } },
    a5: { p: { w: 148, h: 210 }, l: { w: 210, h: 148 } },
    letter: { p: { w: 215.9, h: 279.4 }, l: { w: 279.4, h: 215.9 } }
  };

  const sheetDim = pages[ppSettings.sheetSize][ppSettings.sheetOrientation === 'landscape' ? 'l' : 'p'];
  const pageW = sheetDim.w, pageH = sheetDim.h;

  const { maxCols, maxRows, maxTotal } = ppCalcLayout(pageW, pageH, wMM, hMM, ppSettings.margin, ppSettings.gap);

  if (ppSettings.layoutMode === 'manual') {
    const cols = Math.min(ppSettings.manualCols, maxCols);
    const rows = Math.min(ppSettings.manualRows, maxRows);
    return { cols, rows, total: cols * rows, pageW, pageH, wMM, hMM, maxCols, maxRows, maxTotal };
  }

  if (ppSettings.photoCount === 0) {
    return { cols: maxCols, rows: maxRows, total: maxTotal, pageW, pageH, wMM, hMM, maxCols, maxRows, maxTotal };
  }

  const N = Math.min(ppSettings.photoCount, maxTotal);
  let bestCols = maxCols, bestRows = maxRows, bestDiff = Infinity;

  for (let rows = 1; rows <= maxRows; rows++) {
    const cols = Math.ceil(N / rows);
    if (cols > maxCols) continue;
    const total = cols * rows;
    if (total < N) continue;
    const diff = total - N;
    if (diff < bestDiff) {
      bestDiff = diff;
      bestCols = cols;
      bestRows = rows;
    }
  }

  return { cols: bestCols, rows: bestRows, total: bestCols * bestRows, pageW, pageH, wMM, hMM, maxCols, maxRows, maxTotal };
}

/* ============================================================
   RENDER PREVIEW
   ============================================================ */
function ppRenderPreview() {
  const drop = document.getElementById('ppDrop');
  const panel = document.getElementById('ppPanel');
  if (drop) drop.style.display = 'none';
  if (panel) panel.style.display = 'block';

  const single = document.getElementById('ppSinglePreview');
  if (single) {
    if (ppCroppedCanvas) {
      const canvas = ppBuildPhoto();
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const preset = PP_PRESETS[ppSettings.size];
      const wMM = preset ? preset.w : ppSettings.customW;
      const hMM = preset ? preset.h : ppSettings.customH;

      single.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <div style="background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.15);border-radius:4px">
            <img src="${dataUrl}" style="max-width:200px;max-height:260px;display:block;border-radius:2px">
          </div>
          <div style="font-size:12px;color:var(--text-3)">
            ${wMM}×${hMM}mm @ ${ppSettings.dpi} DPI
            ${ppSettings.border ? ` • ${ppSettings.borderWidth}px border` : ''}
          </div>
        </div>
      `;
    } else {
      single.innerHTML = `<div class="empty-state" style="margin:0">
        <div class="es-emoji">📸</div>
        <div class="es-title">Photo crop karo</div>
        <button class="btn btn-primary" onclick="ppOpenCropper()" style="margin-top:10px">✂️ Open Crop</button>
      </div>`;
    }
  }

  ppRenderSheet();
}

/* ============================================================
   RENDER SHEET
   ============================================================ */
function ppRenderSheet() {
  const sheet = document.getElementById('ppSheetPreview');
  if (!sheet) return;
  if (!ppCroppedCanvas) { sheet.innerHTML = ''; return; }

  const layout = ppGetLayout();
  const { cols, rows, total, pageW, pageH, wMM, hMM, maxTotal } = layout;

  const countEl = document.getElementById('ppSheetCount');
  if (countEl) countEl.textContent = total;

  const infoEl = document.getElementById('ppSheetInfo');
  if (infoEl) infoEl.textContent = `${cols} × ${rows} = ${total} photos (max: ${maxTotal})`;

  const scale = Math.min(360 / pageW, 500 / pageH);
  const photoCanvas = ppBuildPhoto();
  const bgData = photoCanvas.toDataURL('image/jpeg', 0.9);

  let html = `<div class="pp-sheet-canvas" style="
    width:${pageW * scale}px;height:${pageH * scale}px;
    background:#fff;position:relative;box-shadow:0 4px 20px rgba(0,0,0,.2);border-radius:2px">`;

  let drawn = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (ppSettings.photoCount > 0 && ppSettings.layoutMode === 'auto' && drawn >= ppSettings.photoCount) break;

      const x = ppSettings.margin + c * (wMM + ppSettings.gap);
      const y = ppSettings.margin + r * (hMM + ppSettings.gap);
      html += `<div style="
        position:absolute;
        left:${x * scale}px;top:${y * scale}px;
        width:${wMM * scale}px;height:${hMM * scale}px;
        background-image:url(${bgData});
        background-size:cover;background-position:center;
        border:${ppSettings.showBorderOnSheet ? '0.5px solid #999' : 'none'}">
      </div>`;
      drawn++;
    }
  }

  if (ppSettings.showCutMarks) {
    html += `<div style="position:absolute;inset:${ppSettings.margin * scale}px;border:1px dashed rgba(0,0,0,.15);pointer-events:none"></div>`;
  }

  html += '</div>';
  html += `<div style="font-size:11.5px;color:var(--text-3);text-align:center;margin-top:8px">
    ${cols} × ${rows} = <strong>${total}</strong> photos
  </div>`;

  sheet.innerHTML = html;
}

/* ============================================================
   DOWNLOADS
   ============================================================ */
window.ppDownloadSingle = () => {
  if (!ppCroppedCanvas) { ppToast('❌ Pehle photo crop karo', 'error'); return; }
  const canvas = ppBuildPhoto();
  const url = canvas.toDataURL('image/jpeg', 0.95);
  const a = document.createElement('a');
  a.href = url;
  a.download = `passport_photo_${Date.now()}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  ppToast('✅ Single photo downloaded', 'success');
};

function ppBuildSheetCanvas() {
  if (!ppCroppedCanvas) return null;

  const layout = ppGetLayout();
  const { cols, rows, total, pageW, pageH, wMM, hMM } = layout;
  const dpi = ppSettings.dpi;

  const pageWpx = ppMMToPx(pageW, dpi);
  const pageHpx = ppMMToPx(pageH, dpi);

  const canvas = document.createElement('canvas');
  canvas.width = pageWpx;
  canvas.height = pageHpx;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, pageWpx, pageHpx);

  const wPx = ppMMToPx(wMM, dpi);
  const hPx = ppMMToPx(hMM, dpi);
  const gapPx = ppMMToPx(ppSettings.gap, dpi);
  const marginPx = ppMMToPx(ppSettings.margin, dpi);

  const photoSource = ppBuildPhoto();
  const photoCanvas = document.createElement('canvas');
  photoCanvas.width = wPx;
  photoCanvas.height = hPx;
  const pctx = photoCanvas.getContext('2d');
  pctx.fillStyle = '#ffffff';
  pctx.fillRect(0, 0, wPx, hPx);
  pctx.drawImage(photoSource, 0, 0, wPx, hPx);

  let drawn = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (ppSettings.photoCount > 0 && ppSettings.layoutMode === 'auto' && drawn >= ppSettings.photoCount) break;

      const x = marginPx + c * (wPx + gapPx);
      const y = marginPx + r * (hPx + gapPx);
      ctx.drawImage(photoCanvas, x, y);
      if (ppSettings.showBorderOnSheet) {
        ctx.strokeStyle = '#bbbbbb';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, wPx - 1, hPx - 1);
      }
      drawn++;
    }
  }

  return { canvas, cols, rows, pageW, pageH, total: drawn };
}

window.ppDownloadSheet = async () => {
  if (!ppCroppedCanvas) { ppToast('❌ Pehle photo crop karo', 'error'); return; }
  if (ppBusy) return;
  ppBusy = true;
  try {
    const result = ppBuildSheetCanvas();
    if (!result) return;
    const { canvas, cols, rows, total } = result;
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.95));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passport_sheet_${cols}x${rows}_${total}photos_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    ppToast(`✅ Sheet downloaded (${cols}×${rows} = ${total} photos)`, 'success');
  } catch (e) {
    console.error(e);
    ppToast('❌ Download fail', 'error');
  } finally { ppBusy = false; }
};

window.ppDownloadPDF = async () => {
  if (!ppCroppedCanvas) { ppToast('❌ Pehle photo crop karo', 'error'); return; }
  if (ppBusy) return;
  if (typeof jspdf === 'undefined') { ppToast('❌ jsPDF load nahi hui', 'error'); return; }
  ppBusy = true;
  try {
    const result = ppBuildSheetCanvas();
    if (!result) return;
    const { canvas, pageW, pageH, cols, rows, total } = result;
    const { jsPDF } = jspdf;
    const orientation = pageW > pageH ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ unit: 'mm', format: [pageW, pageH], orientation, compress: true });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(dataUrl, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
    pdf.save(`passport_sheet_${cols}x${rows}_${total}photos_${Date.now()}.pdf`);
    ppToast(`✅ PDF downloaded (${total} photos)`, 'success');
  } catch (e) {
    console.error(e);
    ppToast('❌ PDF fail', 'error');
  } finally { ppBusy = false; }
};

window.ppPrint = () => {
  if (!ppCroppedCanvas) { ppToast('❌ Pehle photo crop karo', 'error'); return; }
  const result = ppBuildSheetCanvas();
  if (!result) return;
  const { canvas, pageW, pageH } = result;
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const html = `<!DOCTYPE html><html><head><title>Passport Photo Print</title>
    <style>
      @page { size: ${pageW}mm ${pageH}mm; margin: 0; }
      html,body{margin:0;padding:0;background:#fff}
      img{width:${pageW}mm;height:${pageH}mm;display:block}
    </style></head><body><img src="${dataUrl}" onload="window.focus();window.print();setTimeout(()=>window.close(),500)"></body></html>`;
  const w = window.open('', '_blank');
  if (!w) { ppToast('❌ Popup blocked', 'error'); return; }
  w.document.write(html);
  w.document.close();
};

/* ============================================================
   RESET
   ============================================================ */
window.ppReset = () => {
  if (!confirm('Photo reset kar dein?')) return;
  ppOriginal = null;
  ppCroppedCanvas = null;
  if (ppCropper) { ppCropper.destroy(); ppCropper = null; }
  ppCloseCropModal();
  ppRenderDrop();
  ppToast('🔄 Reset done');
};

/* ============================================================
   RENDER HTML
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['passport-photo'] = () => `
<div class="pp-wrap">

  <div id="ppDrop" class="pp-drop">
    <div class="pp-drop-icon">🆔</div>
    <div class="pp-drop-title">Photo upload karo</div>
    <div class="pp-drop-sub">JPG • PNG • Max 30MB • Face visible ho</div>
    <button class="btn btn-primary" onclick="document.getElementById('ppInput').click()">
      📁 Select Photo
    </button>
    <input type="file" id="ppInput" accept="image/*" hidden>
  </div>

  <div id="ppPanel" style="display:none;margin-top:14px">

    <div class="card" style="text-align:center">
      <div class="card-title">📸 Your Photo</div>
      <div id="ppSinglePreview"></div>
      <div class="btn-group" style="margin-top:12px">
        <button class="btn btn-secondary" onclick="ppRecrop()">✂️ Re-crop</button>
        <button class="btn btn-secondary" onclick="ppReset()">🔄 Change Photo</button>
        <button class="btn btn-primary" onclick="ppDownloadSingle()">⬇ Single JPG</button>
      </div>
    </div>

    <!-- PHOTO SIZE -->
    <div class="pp-settings">
      <div class="pp-setting-row">
        <label>📏 Photo Size</label>
        <select onchange="ppSetSetting('size',this.value)" style="width:100%;padding:10px 12px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
          ${Object.entries(PP_PRESETS).map(([k, v]) => `
            <option value="${k}" ${ppSettings.size === k ? 'selected' : ''}>${v.label}</option>
          `).join('')}
        </select>
      </div>

      ${ppSettings.size === 'custom' ? `
      <div class="pp-setting-row" style="display:flex;gap:10px">
        <div class="field" style="flex:1">
          <label>Width (mm)</label>
          <input type="number" value="${ppSettings.customW}" min="10" max="200" oninput="ppSetSetting('customW',this.value)">
        </div>
        <div class="field" style="flex:1">
          <label>Height (mm)</label>
          <input type="number" value="${ppSettings.customH}" min="10" max="200" oninput="ppSetSetting('customH',this.value)">
        </div>
      </div>
      ` : ''}

      <div class="pp-setting-row">
        <label>⚡ Quick Background + Border</label>
        <div class="pp-bg-presets">
          ${PP_BG_PRESETS.map((p, i) => `
            <div class="pp-bg-chip" onclick="ppApplyBgPreset(${i})" title="${p.name}">
              <span class="pp-bg-dot" style="background:${p.color};border-color:${p.border}"></span>
              <span>${p.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="pp-setting-row">
        <label>🎨 Custom Background</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" value="${ppSettings.bgColor}" onchange="ppSetSetting('bgColor',this.value)"
            style="width:70px;height:42px;padding:4px;cursor:pointer;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px">
          <span style="font-size:12px;color:var(--text-3)">${ppSettings.bgColor}</span>
        </div>
      </div>
    </div>

    <!-- PHOTO COUNT -->
    <div class="pp-settings" style="margin-top:12px;border:1.5px solid var(--primary)">
      <div class="card-title" style="margin-bottom:10px;color:var(--primary)">📸 Kitni Photos Chahiye?</div>

      <div class="pp-setting-row">
        <label>Quick Presets</label>
        <div class="pp-count-presets">
          <button class="pp-count-chip" onclick="ppQuickCount(3)">3</button>
          <button class="pp-count-chip" onclick="ppQuickCount(6)">6</button>
          <button class="pp-count-chip" onclick="ppQuickCount(12)">12</button>
          <button class="pp-count-chip" onclick="ppQuickCount(24)">24</button>
          <button class="pp-count-chip" onclick="ppQuickCount(0)">Fill All</button>
        </div>
      </div>

      <div class="pp-setting-row">
        <label>Custom Count (manual)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="number" id="ppPhotoCountInput" value="${ppSettings.photoCount}" min="0" max="100"
            oninput="ppSetPhotoCount(this.value)"
            placeholder="0 = auto fill"
            style="flex:1;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
          <span id="ppPhotoCountHint" style="font-size:12px;color:var(--text-3);min-width:100px;text-align:right">
            ${ppSettings.photoCount === 0 ? 'Auto (fill sheet)' : ppSettings.photoCount + ' photos'}
          </span>
        </div>
      </div>

      <div class="pp-setting-row">
        <label>Layout Mode</label>
        <select id="ppLayoutMode" onchange="ppSetLayoutMode(this.value)" style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
          <option value="auto" ${ppSettings.layoutMode === 'auto' ? 'selected' : ''}>✨ Auto (best fit)</option>
          <option value="manual" ${ppSettings.layoutMode === 'manual' ? 'selected' : ''}>⚙️ Manual (cols/rows)</option>
        </select>
      </div>

      <div id="ppManualLayoutBox" style="display:${ppSettings.layoutMode === 'manual' ? 'block' : 'none'};margin-top:10px">
        <div style="display:flex;gap:10px">
          <div class="field" style="flex:1">
            <label>Columns</label>
            <input type="number" value="${ppSettings.manualCols}" min="1" max="10" oninput="ppSetManualLayout('manualCols', this.value)" style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
          </div>
          <div class="field" style="flex:1">
            <label>Rows</label>
            <input type="number" value="${ppSettings.manualRows}" min="1" max="10" oninput="ppSetManualLayout('manualRows', this.value)" style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
          </div>
        </div>
      </div>

      <div class="hint" style="margin-top:8px;text-align:center" id="ppSheetInfo">
        Auto layout calculate hoga
      </div>
    </div>

    <!-- STROKE -->
    <div class="pp-dropdown" style="margin-top:12px">
      <div class="pp-dropdown-header" onclick="ppToggleDropdown('ppStrokeDropdown')">
        <span style="font-size:16px">🖼️</span>
        <span style="font-weight:700;flex:1;color:var(--text)">Stroke / Border</span>
        <span id="ppStrokeStatus" style="font-size:11.5px;color:var(--text-3);margin-right:8px">${ppSettings.border ? 'ON' : 'OFF'}</span>
        <span id="ppStrokeDropdownArrow" style="font-size:12px;color:var(--text-3)">▼</span>
      </div>
      <div id="ppStrokeDropdown" style="display:none;padding:14px;background:var(--surface-2);border:1px solid var(--border);border-top:none;border-radius:0 0 12px 12px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:14px;font-weight:600;color:var(--text-2);font-size:13px">
          <input type="checkbox" ${ppSettings.border ? 'checked' : ''} onchange="ppToggleStroke(this.checked)" style="width:auto">
          Enable Stroke
        </label>
        <div id="ppStrokeControls" style="display:${ppSettings.border ? 'block' : 'none'}">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">Color</label>
          <div class="pp-stroke-colors">
            ${PP_STROKE_COLORS.map(c => `
              <div class="pp-stroke-chip ${ppSettings.borderColor === c.color ? 'active' : ''}"
                   data-color="${c.color}"
                   onclick="ppSetStrokeColor('${c.color}')"
                   style="background:${c.color};${c.color === '#ffffff' ? 'border:1px solid #ccc' : ''}"
                   title="${c.name}"></div>
            `).join('')}
            <div class="pp-stroke-chip pp-stroke-custom" title="Custom">
              <input type="color" id="ppStrokeColorPicker" value="${ppSettings.borderColor}"
                onchange="ppSetStrokeColor(this.value)"
                style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%">
              🎨
            </div>
          </div>
          <div style="margin-top:16px">
            <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">
              Width: <span id="ppStrokeWidthVal">${ppSettings.borderWidth}</span> px
            </label>
            <div style="display:flex;align-items:center;gap:10px">
              <button class="pp-step-btn" onclick="ppStrokeStep(-1)">−</button>
              <input type="range" id="ppStrokeWidthSlider" min="1" max="20" value="${ppSettings.borderWidth}" oninput="ppSetStrokeWidth(parseInt(this.value))" style="flex:1">
              <button class="pp-step-btn" onclick="ppStrokeStep(1)">+</button>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" style="width:100%;margin-top:12px" onclick="ppResetStroke()">🔄 Reset Stroke</button>
        </div>
      </div>
    </div>

    <!-- ADJUSTMENTS -->
    <div class="pp-dropdown" style="margin-top:12px">
      <div class="pp-dropdown-header" onclick="ppToggleDropdown('ppAdjDropdown')">
        <span style="font-size:16px">🎚️</span>
        <span style="font-weight:700;flex:1;color:var(--text)">Adjustments</span>
        <span id="ppAdjDropdownArrow" style="font-size:12px;color:var(--text-3)">▼</span>
      </div>
      <div id="ppAdjDropdown" style="display:none;padding:14px;background:var(--surface-2);border:1px solid var(--border);border-top:none;border-radius:0 0 12px 12px">
        <div style="margin-bottom:14px">
          <label style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
            <span>✨ Sharpness</span><span id="ppSharpVal">${ppSettings.sharpness}</span>
          </label>
          <input type="range" id="ppSharpSlider" min="0" max="100" value="${ppSettings.sharpness}" oninput="ppSetAdjustment('sharpness', this.value)" style="width:100%">
        </div>
        <div style="margin-bottom:14px">
          <label style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
            <span>☀️ Brightness</span><span id="ppBrightVal">${ppSettings.brightness}</span>
          </label>
          <input type="range" id="ppBrightSlider" min="50" max="200" value="${ppSettings.brightness}" oninput="ppSetAdjustment('brightness', this.value)" style="width:100%">
        </div>
        <div style="margin-bottom:14px">
          <label style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
            <span>◐ Contrast</span><span id="ppContrastVal">${ppSettings.contrast}</span>
          </label>
          <input type="range" id="ppContrastSlider" min="50" max="200" value="${ppSettings.contrast}" oninput="ppSetAdjustment('contrast', this.value)" style="width:100%">
        </div>
        <div style="margin-bottom:14px">
          <label style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
            <span>🎨 Saturation</span><span id="ppSatVal">${ppSettings.saturation}</span>
          </label>
          <input type="range" id="ppSatSlider" min="0" max="200" value="${ppSettings.saturation}" oninput="ppSetAdjustment('saturation', this.value)" style="width:100%">
        </div>
        <div style="margin-bottom:14px">
          <label style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
            <span>💧 Smooth</span><span id="ppSmoothVal">${ppSettings.smooth}</span>
          </label>
          <input type="range" id="ppSmoothSlider" min="0" max="100" value="${ppSettings.smooth}" oninput="ppSetAdjustment('smooth', this.value)" style="width:100%">
        </div>
        <button class="btn btn-secondary btn-sm" style="width:100%" onclick="ppResetAdjustments()">🔄 Reset All</button>
      </div>
    </div>

    <!-- SHEET SETTINGS -->
    <div class="pp-settings" style="margin-top:12px">
      <div class="card-title" style="margin-bottom:10px">📄 Paper / Sheet Settings</div>

      <div class="pp-setting-row" style="display:flex;gap:10px">
        <div class="field" style="flex:1">
          <label>Sheet Size</label>
          <select onchange="ppSetSetting('sheetSize',this.value)" style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
            <option value="a4" ${ppSettings.sheetSize === 'a4' ? 'selected' : ''}>A4 (210×297mm)</option>
            <option value="a5" ${ppSettings.sheetSize === 'a5' ? 'selected' : ''}>A5 (148×210mm)</option>
            <option value="letter" ${ppSettings.sheetSize === 'letter' ? 'selected' : ''}>Letter</option>
          </select>
        </div>
        <div class="field" style="flex:1">
          <label>Orientation</label>
          <select onchange="ppSetSetting('sheetOrientation',this.value)" style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
            <option value="portrait" ${ppSettings.sheetOrientation === 'portrait' ? 'selected' : ''}>Portrait</option>
            <option value="landscape" ${ppSettings.sheetOrientation === 'landscape' ? 'selected' : ''}>Landscape</option>
          </select>
        </div>
      </div>

      <div class="pp-setting-row" style="display:flex;gap:10px">
        <div class="field" style="flex:1">
          <label>Gap (mm)</label>
          <input type="number" value="${ppSettings.gap}" min="0" max="20" step="0.5" onchange="ppSetSetting('gap',this.value)" style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
        </div>
        <div class="field" style="flex:1">
          <label>Margin (mm)</label>
          <input type="number" value="${ppSettings.margin}" min="0" max="30" step="0.5" onchange="ppSetSetting('margin',this.value)" style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
        </div>
        <div class="field" style="flex:1">
          <label>DPI</label>
          <select onchange="ppSetSetting('dpi',this.value)" style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
            <option value="150" ${ppSettings.dpi === 150 ? 'selected' : ''}>150</option>
            <option value="300" ${ppSettings.dpi === 300 ? 'selected' : ''}>300</option>
            <option value="600" ${ppSettings.dpi === 600 ? 'selected' : ''}>600 HD</option>
          </select>
        </div>
      </div>

      <div class="pp-setting-row">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="checkbox" ${ppSettings.showBorderOnSheet ? 'checked' : ''} onchange="ppSetSetting('showBorderOnSheet',this.checked)" style="width:auto">
          Show thin borders on sheet
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;margin-top:6px">
          <input type="checkbox" ${ppSettings.showCutMarks ? 'checked' : ''} onchange="ppSetSetting('showCutMarks',this.checked)" style="width:auto">
          Show cut marks
        </label>
      </div>
    </div>

    <!-- PREVIEW -->
    <div class="card" style="margin-top:14px;text-align:center">
      <div class="card-title">📄 Sheet Preview — <span id="ppSheetCount">0</span> photos</div>
      <div id="ppSheetPreview" style="display:flex;flex-direction:column;align-items:center;overflow:auto;padding:8px"></div>
    </div>

    <div class="btn-group" style="margin-top:14px">
      <button class="btn btn-secondary" onclick="ppDownloadSheet()">⬇ JPG Sheet</button>
      <button class="btn btn-secondary" onclick="ppDownloadPDF()">📄 PDF Sheet</button>
      <button class="btn btn-primary" onclick="ppPrint()">🖨️ Print</button>
    </div>

    <div class="hint" style="margin-top:14px;text-align:center">
      🔒 100% browser me process — photo upload nahi hoti
    </div>
  </div>
</div>

<div class="pp-crop-modal" id="ppCropModal">
  <div class="pp-crop-header">
    <h3>✂️ Crop Photo (Face Align)</h3>
    <button class="btn btn-secondary" onclick="ppCropCancel()" style="padding:6px 12px">✕</button>
  </div>
  <div class="pp-crop-body">
    <img id="ppCropImage" src="" alt="Crop">
  </div>
  <div class="pp-crop-footer">
    <button class="btn btn-secondary" onclick="ppCropCancel()">Cancel</button>
    <button class="btn btn-primary" onclick="ppCropApply()">✓ Apply Crop</button>
  </div>
</div>

<style>
  .pp-wrap { padding: 4px 0; }
  .pp-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 30px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .pp-drop:hover { border-color: var(--primary); background: var(--surface-hover); }
  .pp-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .pp-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .pp-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }

  .pp-settings { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
  .pp-setting-row { margin-bottom: 12px; }
  .pp-setting-row:last-child { margin-bottom: 0; }
  .pp-setting-row > label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2); margin-bottom: 6px; }

  .pp-bg-presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .pp-bg-chip { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 10px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .pp-bg-chip:hover { background: var(--surface-hover); border-color: var(--primary); }
  .pp-bg-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }
  .pp-bg-dot { width: 14px; height: 14px; border-radius: 50%; display: inline-block; border: 2px solid; }

  .pp-count-presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .pp-count-chip { padding: 8px 14px; border-radius: 10px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; min-width: 46px; }
  .pp-count-chip:hover { background: var(--primary); color: #fff; border-color: transparent; transform: translateY(-2px); }
  .pp-count-chip:active { transform: scale(0.95); }

  .pp-dropdown { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
  .pp-dropdown-header { display: flex; align-items: center; gap: 10px; padding: 14px; cursor: pointer; transition: all .15s; }
  .pp-dropdown-header:hover { background: var(--surface-hover); }

  .pp-stroke-colors { display: flex; gap: 8px; flex-wrap: wrap; }
  .pp-stroke-chip { width: 40px; height: 40px; border-radius: 10px; cursor: pointer; position: relative; border: 2px solid transparent; transition: all .15s; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .pp-stroke-chip:hover { transform: scale(1.08); }
  .pp-stroke-chip.active { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.25); }
  .pp-stroke-custom { background: linear-gradient(135deg,#ff6b6b,#ffd93d,#6bcB77,#4d96ff,#9b5de5); overflow: hidden; }

  .pp-step-btn { width: 36px; height: 36px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border-strong); color: var(--text); font-size: 18px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .pp-step-btn:hover { background: var(--surface-hover); color: var(--primary); }

  input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 3px; background: var(--surface); outline: none; }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--gradient); cursor: pointer; }

  .pp-sheet-canvas { border: 1px solid #ddd; }

  .pp-crop-modal { position: fixed; inset: 0; background: rgba(0,0,0,.95); z-index: 99999; display: none; flex-direction: column; }
  .pp-crop-modal.active { display: flex; }
  .pp-crop-header { padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); background: var(--surface); }
  .pp-crop-header h3 { color: var(--text); font-size: 15px; margin: 0; }
  .pp-crop-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 16px; overflow: hidden; position: relative; }
  .pp-crop-body img { max-width: 100%; max-height: 100%; display: block; }
  .pp-crop-footer { padding: 14px 18px; display: flex; gap: 10px; border-top: 1px solid var(--border); background: var(--surface); }
  .pp-crop-footer .btn { flex: 1; }

  @media (max-width: 480px) {
    .pp-setting-row { flex-wrap: wrap; }
    .pp-sheet-canvas { transform: scale(0.85); transform-origin: top center; }
    .pp-stroke-chip { width: 36px; height: 36px; }
    .pp-count-chip { padding: 6px 10px; font-size: 12px; min-width: 40px; }
  }
</style>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['passport-photo'] = () => {
  const input = document.getElementById('ppInput');
  const drop = document.getElementById('ppDrop');
  if (!input || !drop) return;

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });
  input.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      ppLoadFile(e.target.files[0]);
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
      ppLoadFile(e.dataTransfer.files[0]);
    }
  });
};

console.log('%c✅ Passport Photo Maker v6 loaded', 'color:#3b82f6;font-weight:bold');