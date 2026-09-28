/* ============================================================
   QUNVERIO — PASSPORT PHOTO MAKER (FINAL v2)
   With Stroke/Border customization
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
  borderWidth: 1,
  sheetSize: 'a4',
  sheetOrientation: 'portrait',
  gap: 2,
  margin: 5,
  dpi: 300,
  showCutMarks: true,
  showBorderOnSheet: true
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

function ppBaseName(name) {
  return (name || 'photo').replace(/\.[^.]+$/, '').replace(/[^a-z0-9_\-]/gi, '_');
}

function ppUid() {
  return 'pp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}

/* ============================================================
   LOAD FILE
   ============================================================ */
window.ppLoadFile = (file) => {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    ppToast('❌ Sirf image select karo', 'error');
    return;
  }
  if (file.size > 30 * 1024 * 1024) {
    ppToast('❌ Image 30MB se choti honi chahiye', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    ppOriginal = e.target.result;
    ppOpenCropper();
  };
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
    if (typeof Cropper === 'undefined') {
      ppCroppedCanvas = null;
      ppToast('⚠️ Cropper load nahi hui');
      return;
    }
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
      width: wPx,
      height: hPx,
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
  if (!ppCroppedCanvas) {
    ppOriginal = null;
    ppRenderDrop();
  }
};

window.ppRecrop = () => {
  if (!ppOriginal) return;
  ppOpenCropper();
};

/* ============================================================
   SETTINGS
   ============================================================ */
window.ppSetSetting = (key, val) => {
  ppSettings[key] = val;
  if (key === 'size') {
    if (ppOriginal) {
      const preset = PP_PRESETS[val];
      if (preset) {
        ppSettings.customW = preset.w;
        ppSettings.customH = preset.h;
      }
      ppRenderPreview();
    }
  } else if (key === 'customW' || key === 'customH') {
    ppSettings[key] = parseFloat(val) || 35;
    ppRenderPreview();
  } else if (key === 'bgColor' || key === 'borderColor') {
    ppRenderPreview();
  } else if (key === 'border' || key === 'showCutMarks' || key === 'showBorderOnSheet') {
    ppSettings[key] = !!val;
    ppRenderPreview();
  } else if (key === 'borderWidth' || key === 'dpi' || key === 'gap' || key === 'margin') {
    ppSettings[key] = parseFloat(val) || 0;
    ppRenderPreview();
  } else if (key === 'sheetSize' || key === 'sheetOrientation') {
    ppRenderPreview();
  }
};

/* ============================================================
   QUICK BG + BORDER PRESETS
   ============================================================ */
window.ppApplyBgPreset = (idx) => {
  const p = PP_BG_PRESETS[idx];
  if (!p) return;
  ppSettings.bgColor = p.color;
  ppSettings.borderColor = p.border;
  if (ppOriginal && ppCropper) {
    // Re-crop with new bg
    ppCropApply();
  } else {
    ppRenderPreview();
  }
  // Update selected chip
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
      const dataUrl = ppCroppedCanvas.toDataURL('image/jpeg', 0.95);
      const preset = PP_PRESETS[ppSettings.size];
      const wMM = preset ? preset.w : ppSettings.customW;
      const hMM = preset ? preset.h : ppSettings.customH;

      // Border style
      const bw = ppSettings.border ? ppSettings.borderWidth : 0;
      const bc = ppSettings.borderColor || '#000000';
      const borderStyle = ppSettings.border ? `${bw}px solid ${bc}` : '1px solid #ccc';

      single.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <div style="position:relative;background:#fff;padding:${bw}px;box-shadow:0 2px 12px rgba(0,0,0,.15);border-radius:4px">
            <img src="${dataUrl}" style="
              max-width:200px;max-height:260px;
              display:block;border-radius:2px;
              border:${ppSettings.border ? `${bw}px solid ${bc}` : 'none'}">
          </div>
          <div style="font-size:12px;color:var(--text-3)">${wMM}×${hMM}mm @ ${ppSettings.dpi} DPI${ppSettings.border ? ` • ${bw}px ${bc} border` : ''}</div>
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
  if (!ppCroppedCanvas) {
    sheet.innerHTML = '';
    return;
  }

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

  const margin = ppSettings.margin;
  const gap = ppSettings.gap;
  const availW = pageW - 2 * margin;
  const availH = pageH - 2 * margin;

  const cols = Math.max(1, Math.floor((availW + gap) / (wMM + gap)));
  const rows = Math.max(1, Math.floor((availH + gap) / (hMM + gap)));
  const total = cols * rows;

  const countEl = document.getElementById('ppSheetCount');
  if (countEl) countEl.textContent = total;

  const scale = Math.min(360 / pageW, 500 / pageH);

  // Apply border to preview thumbnail
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = ppCroppedCanvas.width;
  tempCanvas.height = ppCroppedCanvas.height;
  const tctx = tempCanvas.getContext('2d');

  // Draw bg
  tctx.fillStyle = '#ffffff';
  tctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // Draw photo
  tctx.drawImage(ppCroppedCanvas, 0, 0);

  // Apply border if enabled
  if (ppSettings.border) {
    tctx.strokeStyle = ppSettings.borderColor || '#000000';
    tctx.lineWidth = ppSettings.borderWidth * 2;
    tctx.strokeRect(
      ppSettings.borderWidth,
      ppSettings.borderWidth,
      tempCanvas.width - ppSettings.borderWidth * 2,
      tempCanvas.height - ppSettings.borderWidth * 2
    );
  }

  const bgData = tempCanvas.toDataURL('image/jpeg', 0.9);

  let html = `<div class="pp-sheet-canvas" style="
    width:${pageW * scale}px;height:${pageH * scale}px;
    background:#fff;position:relative;box-shadow:0 4px 20px rgba(0,0,0,.2);border-radius:2px">`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = margin + c * (wMM + gap);
      const y = margin + r * (hMM + gap);
      html += `<div class="pp-photo-slot" style="
        position:absolute;
        left:${x * scale}px;top:${y * scale}px;
        width:${wMM * scale}px;height:${hMM * scale}px;
        background-image:url(${bgData});
        background-size:cover;background-position:center;
        border:${ppSettings.showBorderOnSheet ? '0.5px solid #999' : 'none'}">
      </div>`;
    }
  }

  if (ppSettings.showCutMarks) {
    html += `<div style="position:absolute;inset:${margin * scale}px;border:1px dashed rgba(0,0,0,.15);pointer-events:none"></div>`;
  }

  html += '</div>';
  html += `<div style="font-size:11.5px;color:var(--text-3);text-align:center;margin-top:8px">
    ${cols} × ${rows} = <strong>${total}</strong> photos fit on this page
  </div>`;

  sheet.innerHTML = html;
}

/* ============================================================
   DOWNLOAD SINGLE
   ============================================================ */
window.ppDownloadSingle = () => {
  if (!ppCroppedCanvas) { ppToast('❌ Pehle photo crop karo', 'error'); return; }

  // Build with border
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = ppCroppedCanvas.width;
  tempCanvas.height = ppCroppedCanvas.height;
  const tctx = tempCanvas.getContext('2d');
  tctx.drawImage(ppCroppedCanvas, 0, 0);

  if (ppSettings.border) {
    tctx.strokeStyle = ppSettings.borderColor || '#000000';
    tctx.lineWidth = ppSettings.borderWidth * 2;
    tctx.strokeRect(
      ppSettings.borderWidth,
      ppSettings.borderWidth,
      tempCanvas.width - ppSettings.borderWidth * 2,
      tempCanvas.height - ppSettings.borderWidth * 2
    );
  }

  const url = tempCanvas.toDataURL('image/jpeg', 0.95);
  const a = document.createElement('a');
  a.href = url;
  a.download = `passport_photo_${Date.now()}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  ppToast('✅ Single photo downloaded', 'success');
};

/* ============================================================
   BUILD SHEET CANVAS
   ============================================================ */
function ppBuildSheetCanvas() {
  if (!ppCroppedCanvas) return null;

  const preset = PP_PRESETS[ppSettings.size];
  const wMM = preset ? preset.w : ppSettings.customW;
  const hMM = preset ? preset.h : ppSettings.customH;
  const dpi = ppSettings.dpi;

  const pages = {
    a4: { p: { w: 210, h: 297 }, l: { w: 297, h: 210 } },
    a5: { p: { w: 148, h: 210 }, l: { w: 210, h: 148 } },
    letter: { p: { w: 215.9, h: 279.4 }, l: { w: 279.4, h: 215.9 } }
  };

  const sheetDim = pages[ppSettings.sheetSize][ppSettings.sheetOrientation === 'landscape' ? 'l' : 'p'];
  const pageW = sheetDim.w, pageH = sheetDim.h;

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

  const availW = pageWpx - 2 * marginPx;
  const availH = pageHpx - 2 * marginPx;

  const cols = Math.max(1, Math.floor((availW + gapPx) / (wPx + gapPx)));
  const rows = Math.max(1, Math.floor((availH + gapPx) / (hPx + gapPx)));

  // Create photo with border
  const photoCanvas = document.createElement('canvas');
  photoCanvas.width = wPx;
  photoCanvas.height = hPx;
  const pctx = photoCanvas.getContext('2d');
  pctx.fillStyle = '#ffffff';
  pctx.fillRect(0, 0, wPx, hPx);
  pctx.drawImage(ppCroppedCanvas, 0, 0, wPx, hPx);

  if (ppSettings.border) {
    const bpx = Math.max(1, Math.round(ppSettings.borderWidth * dpi / 96));
    pctx.strokeStyle = ppSettings.borderColor || '#000000';
    pctx.lineWidth = bpx * 2;
    pctx.strokeRect(bpx, bpx, wPx - bpx * 2, hPx - bpx * 2);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = marginPx + c * (wPx + gapPx);
      const y = marginPx + r * (hPx + gapPx);
      ctx.drawImage(photoCanvas, x, y);
      if (ppSettings.showBorderOnSheet) {
        ctx.strokeStyle = '#bbbbbb';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, wPx - 1, hPx - 1);
      }
    }
  }

  return { canvas, cols, rows, pageW, pageH };
}

/* ============================================================
   DOWNLOAD SHEET / PDF / PRINT
   ============================================================ */
window.ppDownloadSheet = async () => {
  if (!ppCroppedCanvas) { ppToast('❌ Pehle photo crop karo', 'error'); return; }
  if (ppBusy) return;
  ppBusy = true;
  try {
    const result = ppBuildSheetCanvas();
    if (!result) return;
    const { canvas, cols, rows } = result;

    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.95));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passport_sheet_${cols}x${rows}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    ppToast(`✅ Sheet downloaded (${cols}×${rows} = ${cols * rows} photos)`, 'success');
  } catch (e) {
    console.error(e);
    ppToast('❌ Download fail', 'error');
  } finally {
    ppBusy = false;
  }
};

window.ppDownloadPDF = async () => {
  if (!ppCroppedCanvas) { ppToast('❌ Pehle photo crop karo', 'error'); return; }
  if (ppBusy) return;
  if (typeof jspdf === 'undefined') { ppToast('❌ jsPDF load nahi hui', 'error'); return; }
  ppBusy = true;
  try {
    const result = ppBuildSheetCanvas();
    if (!result) return;
    const { canvas, pageW, pageH, cols, rows } = result;

    const { jsPDF } = jspdf;
    const orientation = pageW > pageH ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ unit: 'mm', format: [pageW, pageH], orientation, compress: true });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(dataUrl, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
    pdf.save(`passport_sheet_${cols}x${rows}_${Date.now()}.pdf`);
    ppToast(`✅ PDF downloaded (${cols * rows} photos)`, 'success');
  } catch (e) {
    console.error(e);
    ppToast('❌ PDF fail', 'error');
  } finally {
    ppBusy = false;
  }
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

      <!-- QUICK PRESETS -->
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

      <!-- CUSTOM BG COLOR -->
      <div class="pp-setting-row">
        <label>🎨 Custom Background</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" value="${ppSettings.bgColor}" onchange="ppSetSetting('bgColor',this.value)"
            style="width:70px;height:42px;padding:4px;cursor:pointer;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px">
          <span style="font-size:12px;color:var(--text-3)">${ppSettings.bgColor}</span>
        </div>
      </div>
    </div>

    <!-- STROKE / BORDER -->
    <div class="pp-settings" style="margin-top:12px">
      <div class="card-title" style="margin-bottom:10px">🖼️ Stroke / Border</div>

      <div class="pp-setting-row" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;margin:0;font-weight:600;color:var(--text-2)">
          <input type="checkbox" ${ppSettings.border ? 'checked' : ''} onchange="ppSetSetting('border',this.checked)" style="width:auto">
          Border ON / OFF
        </label>
      </div>

      ${ppSettings.border ? `
        <div class="pp-setting-row" style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
          <div class="field" style="flex:1;min-width:120px">
            <label>Stroke Color</label>
            <input type="color" value="${ppSettings.borderColor}" onchange="ppSetSetting('borderColor',this.value)"
              style="width:100%;height:42px;padding:4px;cursor:pointer;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px">
          </div>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            <button class="pp-quick-color" style="background:#000000" onclick="ppSetSetting('borderColor','#000000');ppRenderPreview()" title="Black">Black</button>
            <button class="pp-quick-color" style="background:#ffffff;color:#000;border:1px solid #ccc" onclick="ppSetSetting('borderColor','#ffffff');ppRenderPreview()" title="White">White</button>
            <button class="pp-quick-color" style="background:#374151;color:#fff" onclick="ppSetSetting('borderColor','#374151');ppRenderPreview()" title="Grey">Grey</button>
            <button class="pp-quick-color" style="background:#1e3a8a;color:#fff" onclick="ppSetSetting('borderColor','#1e3a8a');ppRenderPreview()" title="Blue">Blue</button>
          </div>
        </div>

        <div class="pp-setting-row">
          <label>Stroke Width: <span id="ppBorderWidthVal">${ppSettings.borderWidth}</span> px</label>
          <input type="range" min="1" max="20" value="${ppSettings.borderWidth}"
            oninput="ppSetSetting('borderWidth',parseInt(this.value));document.getElementById('ppBorderWidthVal').textContent=this.value"
            style="width:100%">
        </div>
      ` : ''}
    </div>

    <!-- SHEET SETTINGS -->
    <div class="pp-settings" style="margin-top:12px">
      <div class="card-title" style="margin-bottom:10px">📄 A4 Sheet Settings</div>

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
      <div class="card-title">📄 A4 Sheet Preview — <span id="ppSheetCount">0</span> photos</div>
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

<!-- CROP MODAL -->
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
  .pp-bg-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 12px; border-radius: 10px;
    background: var(--surface-2); border: 1.5px solid var(--border);
    color: var(--text-2); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all .15s;
  }
  .pp-bg-chip:hover { background: var(--surface-hover); border-color: var(--primary); }
  .pp-bg-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }
  .pp-bg-dot {
    width: 14px; height: 14px; border-radius: 50%;
    display: inline-block; border: 2px solid;
  }
  .pp-quick-color {
    padding: 6px 10px; border-radius: 6px;
    font-size: 10.5px; font-weight: 700;
    color: #fff; cursor: pointer; border: none;
  }

  input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 3px; background: var(--surface-2); outline: none; }
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

console.log('%c✅ Passport Photo Maker loaded', 'color:#3b82f6;font-weight:bold');