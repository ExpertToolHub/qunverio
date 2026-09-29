/* ============================================================
   QUNVERIO — BACKGROUND REMOVER (FINAL v5)
   Fast CDN + Auto Cache + All Features
   ============================================================ */

console.log('%cBackground Remover loading...', 'color:#ec4899;font-weight:bold');

/* ============================================================
   STATE
   ============================================================ */
let brOriginalFile = null;
let brOriginalUrl = null;
let brRemovedBlob = null;
let brRemovedImg = null;
let brCanvas = null;
let brCtx = null;
let brHistory = [];
let brHistoryIdx = -1;
let brBusy = false;
let brLibFn = null;
let brLibLoading = false;
let brBrushMode = 'none';
let brBrushSize = 30;
let brZoom = 1;
let brPanX = 0, brPanY = 0;
let brCompareMode = false;
let brCropInstance = null;

let brSettings = {
  bgType: 'transparent',
  bgColor: '#ffffff',
  bgGrad1: '#667eea',
  bgGrad2: '#764ba2',
  bgBlur: 10,
  bgImage: null,
  outputFormat: 'png',
  quality: 92,
  maxDim: 1200,
  sharpen: 0,
  hdUpscale: 1
};

/* ============================================================
   HELPERS
   ============================================================ */
function brFmtSize(bytes) {
  if (!bytes && bytes !== 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function brToast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

function brSetProgress(pct, text) {
  const wrap = document.getElementById('brProgressWrap');
  const fill = document.getElementById('brProgressFill');
  const pctEl = document.getElementById('brProgressPct');
  const textEl = document.getElementById('brProgressText');
  if (wrap) wrap.style.display = 'block';
  if (fill) fill.style.width = Math.round(pct) + '%';
  if (pctEl) pctEl.textContent = Math.round(pct) + '%';
  if (textEl) textEl.textContent = text || '';
}

function brHideProgress() {
  const wrap = document.getElementById('brProgressWrap');
  if (wrap) setTimeout(() => wrap.style.display = 'none', 3000);
}

/* ============================================================
   LOAD LIBRARY — v5 (Fast CDN + Cache)
   ============================================================ */
async function brLoadLibrary() {
  if (brLibFn) return true;
  if (brLibLoading) return false;
  brLibLoading = true;
  brSetProgress(3, '⏳ AI library check...');

  try {
    // 1. Already preloaded?
    if (typeof window.__bgLibFn === 'function') {
      brLibFn = window.__bgLibFn;
      brSetProgress(10, '✅ AI ready (cached)');
      console.log('%c✅ Using cached library', 'color:#10b981');
      return true;
    }

    // 2. Try dynamic import — FAST CDNs first
    const cdns = [
      'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm',
      'https://unpkg.com/@imgly/background-removal@1.5.5/+esm',
      'https://esm.sh/@imgly/background-removal@1.5.5'
    ];

    for (let i = 0; i < cdns.length; i++) {
      try {
        brSetProgress(5 + i * 2, `📥 CDN ${i + 1}/${cdns.length}...`);
        console.log(`%c🎯 Trying CDN ${i + 1}: ${cdns[i]}`, 'color:#f59e0b');
        const mod = await import(cdns[i]);
        if (mod && typeof mod.removeBackground === 'function') {
          brLibFn = mod.removeBackground;
        } else if (mod.default && typeof mod.default.removeBackground === 'function') {
          brLibFn = mod.default.removeBackground;
        }
        if (brLibFn) {
          brSetProgress(10, `✅ AI ready (CDN ${i + 1})`);
          window.__bgLibFn = brLibFn;
          console.log(`%c✅ Library loaded from CDN ${i + 1}`, 'color:#10b981');
          return true;
        }
      } catch (e) {
        console.warn(`CDN ${i + 1} fail:`, e.message);
      }
    }

    brSetProgress(0, '❌ AI load failed');
    brToast('❌ AI library load nahi hui — internet check karo', 'error');
    return false;
  } finally {
    brLibLoading = false;
  }
}

/* ============================================================
   LOAD FILE (opens crop modal)
   ============================================================ */
window.brLoadFile = (file) => {
  if (!file) return;
  if (!file.type.startsWith('image/')) { brToast('❌ Sirf image select karo', 'error'); return; }
  if (file.size > 30 * 1024 * 1024) { brToast('❌ Image 30MB se choti', 'error'); return; }
  brOriginalFile = file;
  if (brOriginalUrl) URL.revokeObjectURL(brOriginalUrl);
  brOriginalUrl = URL.createObjectURL(file);
  brResetAll();
  brOpenCropModal();
};

/* ============================================================
   CROP MODAL
   ============================================================ */
window.brOpenCropModal = () => {
  const modal = document.getElementById('brCropModal');
  const img = document.getElementById('brCropImage');
  if (!modal || !img || !brOriginalUrl) return;

  img.src = brOriginalUrl;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  img.onload = () => {
    if (brCropInstance) { brCropInstance.destroy(); brCropInstance = null; }
    if (typeof Cropper === 'undefined') {
      brCloseCropModal();
      brUseOriginalImage();
      return;
    }
    brCropInstance = new Cropper(img, {
      aspectRatio: NaN,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.9,
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
  };
};

window.brCloseCropModal = () => {
  const modal = document.getElementById('brCropModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  if (brCropInstance) { brCropInstance.destroy(); brCropInstance = null; }
};

window.brSkipCrop = () => { brCloseCropModal(); brUseOriginalImage(); };

window.brApplyCrop = async () => {
  if (!brCropInstance) { brCloseCropModal(); brUseOriginalImage(); return; }
  try {
    const canvas = brCropInstance.getCroppedCanvas({ imageSmoothingQuality: 'high' });
    if (!canvas) { brSkipCrop(); return; }
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    if (blob) {
      if (brOriginalUrl) URL.revokeObjectURL(brOriginalUrl);
      brOriginalFile = new File([blob], 'cropped.png', { type: 'image/png' });
      brOriginalUrl = URL.createObjectURL(blob);
    }
    brCloseCropModal();
    brRenderPanel();
    brToast('✅ Cropped — now Remove Background', 'success');
  } catch (e) {
    console.error(e);
    brSkipCrop();
  }
};

function brUseOriginalImage() {
  brRenderPanel();
  brToast('✅ Image loaded — Remove Background click karo', 'success');
}

window.brReCrop = () => { if (brOriginalUrl) brOpenCropModal(); };
window.brRotateCrop = (deg) => { if (brCropInstance) brCropInstance.rotate(deg); };
window.brFlipCropH = () => {
  if (!brCropInstance) return;
  const d = brCropInstance.getData();
  brCropInstance.scaleX(d.scaleX === -1 ? 1 : -1);
};
window.brFlipCropV = () => {
  if (!brCropInstance) return;
  const d = brCropInstance.getData();
  brCropInstance.scaleY(d.scaleY === -1 ? 1 : -1);
};
window.brResetCrop = () => { if (brCropInstance) brCropInstance.reset(); };

/* ============================================================
   RESET
   ============================================================ */
window.brResetAll = () => {
  brRemovedBlob = null;
  brRemovedImg = null;
  brHistory = [];
  brHistoryIdx = -1;
  brZoom = 1;
  brPanX = 0; brPanY = 0;
  brBrushMode = 'none';
  brCompareMode = false;
};

/* ============================================================
   RENDER
   ============================================================ */
function brRenderDrop() {
  const drop = document.getElementById('brDrop');
  const panel = document.getElementById('brPanel');
  if (drop) drop.style.display = 'block';
  if (panel) panel.style.display = 'none';
}

function brRenderPanel() {
  const drop = document.getElementById('brDrop');
  const panel = document.getElementById('brPanel');
  if (drop) drop.style.display = 'none';
  if (panel) panel.style.display = 'block';

  const orig = document.getElementById('brOriginalPreview');
  if (orig && brOriginalUrl) {
    orig.innerHTML = `<img src="${brOriginalUrl}" alt="Original" style="max-width:100%;max-height:160px;border-radius:10px;display:block;margin:0 auto">`;
  }
}

/* ============================================================
   REMOVE BACKGROUND — MAIN
   ============================================================ */
window.brRemoveBackground = async () => {
  if (!brOriginalFile) { brToast('❌ Pehle image upload karo', 'error'); return; }
  if (brBusy) return;
  brBusy = true;

  const btn = document.getElementById('brRemoveBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Processing...'; }

  const startTime = Date.now();

  try {
    const ok = await brLoadLibrary();
    if (!ok) throw new Error('AI library load nahi hui');

    brSetProgress(20, '⏳ Image prepare...');
    const resized = await brResizeIfNeeded(brOriginalFile);
    brSetProgress(30, '🎨 AI background remove kar raha hai...');

    const blob = await brLibFn(resized, {
      model: 'medium',
      output: { format: 'image/png', quality: 1.0 },
      progress: (key, current, total) => {
        const pct = 30 + Math.round((current / total) * 55);
        const mb = (current / (1024 * 1024)).toFixed(1);
        const totalMb = (total / (1024 * 1024)).toFixed(1);
        if (typeof key === 'string' && (key.includes('fetch') || key.includes('model'))) {
          brSetProgress(pct, `📥 Model: ${mb}MB / ${totalMb}MB`);
        } else {
          brSetProgress(pct, `🎨 Processing: ${mb}MB`);
        }
      }
    });

    brSetProgress(88, '🖼️ Setting up editor...');
    brRemovedBlob = blob;
    await brSetupCanvas(blob);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    brSetProgress(100, `✅ Ready! (${elapsed}s)`);
    brHideProgress();
    brToast(`✅ Background removed! (${elapsed}s)`, 'success');
    const c = document.getElementById('brControls');
    if (c) c.style.display = 'block';
    brRenderPreview();
  } catch (e) {
    console.error('BG remove error:', e);
    brToast('❌ Fail: ' + (e.message || 'unknown'), 'error');
    brSetProgress(0, '❌ Failed');
    brHideProgress();
  } finally {
    brBusy = false;
    if (btn) { btn.disabled = false; btn.textContent = '✨ Remove Background'; }
  }
};

function brResizeIfNeeded(file) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxDim = brSettings.maxDim;
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
   SETUP CANVAS
   ============================================================ */
async function brSetupCanvas(blob) {
  const img = await new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = URL.createObjectURL(blob);
  });
  brRemovedImg = img;

  const canvas = document.getElementById('brCanvas');
  if (!canvas) return;
  canvas.width = img.width;
  canvas.height = img.height;
  brCanvas = canvas;
  brCtx = canvas.getContext('2d');
  brCtx.clearRect(0, 0, canvas.width, canvas.height);
  brCtx.drawImage(img, 0, 0);

  brHistory = [brCtx.getImageData(0, 0, canvas.width, canvas.height)];
  brHistoryIdx = 0;

  brSetupBrushEvents();
  brRenderPreview();
}

/* ============================================================
   BRUSH
   ============================================================ */
function brSetupBrushEvents() {
  const canvas = brCanvas;
  if (!canvas) return;

  let isDrawing = false;
  let lastX = 0, lastY = 0;

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const start = (e) => {
    if (brBrushMode === 'none') return;
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x; lastY = pos.y;
    brDrawAt(pos.x, pos.y, pos.x, pos.y);
  };

  const move = (e) => {
    if (!isDrawing || brBrushMode === 'none') return;
    e.preventDefault();
    const pos = getPos(e);
    brDrawAt(lastX, lastY, pos.x, pos.y);
    lastX = pos.x; lastY = pos.y;
  };

  const end = () => {
    if (!isDrawing) return;
    isDrawing = false;
    brSaveHistory();
    brRenderPreview();
  };

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);
}

function brDrawAt(x1, y1, x2, y2) {
  const ctx = brCtx;
  ctx.save();
  ctx.globalCompositeOperation = brBrushMode === 'erase' ? 'destination-out' : 'source-over';
  ctx.lineWidth = brBrushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function brSaveHistory() {
  if (!brCtx) return;
  brHistoryIdx++;
  brHistory = brHistory.slice(0, brHistoryIdx);
  brHistory.push(brCtx.getImageData(0, 0, brCanvas.width, brCanvas.height));
  if (brHistory.length > 20) { brHistory.shift(); brHistoryIdx--; }
}

window.brUndo = () => {
  if (brHistoryIdx <= 0) { brToast('⚠️ Kuch undo nahi', 'error'); return; }
  brHistoryIdx--;
  brCtx.putImageData(brHistory[brHistoryIdx], 0, 0);
  brRenderPreview();
};

window.brRedo = () => {
  if (brHistoryIdx >= brHistory.length - 1) { brToast('⚠️ Kuch redo nahi', 'error'); return; }
  brHistoryIdx++;
  brCtx.putImageData(brHistory[brHistoryIdx], 0, 0);
  brRenderPreview();
};

window.brSetBrush = (mode) => {
  brBrushMode = mode;
  document.querySelectorAll('.br-brush-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.val === mode);
  });
  const sizeBox = document.getElementById('brBrushSizeBox');
  if (sizeBox) sizeBox.style.display = mode === 'none' ? 'none' : 'block';
  if (brCanvas) brCanvas.style.cursor = mode === 'none' ? 'default' : 'crosshair';
};

window.brSetBrushSize = (val) => {
  brBrushSize = parseInt(val, 10);
  const el = document.getElementById('brBrushSizeVal');
  if (el) el.textContent = val + 'px';
};

/* ============================================================
   ZOOM / COMPARE
   ============================================================ */
window.brZoomIn = () => { brZoom = Math.min(3, brZoom + 0.2); brRenderPreview(); };
window.brZoomOut = () => { brZoom = Math.max(0.3, brZoom - 0.2); brRenderPreview(); };
window.brZoomReset = () => { brZoom = 1; brPanX = 0; brPanY = 0; brRenderPreview(); };

window.brToggleCompare = () => {
  brCompareMode = !brCompareMode;
  const btn = document.getElementById('brCompareBtn');
  if (btn) btn.classList.toggle('active', brCompareMode);
  brRenderPreview();
};

/* ============================================================
   RENDER PREVIEW
   ============================================================ */
function brRenderPreview() {
  if (!brCanvas) return;

  const preview = document.createElement('canvas');
  preview.width = brCanvas.width;
  preview.height = brCanvas.height;
  const pctx = preview.getContext('2d');

  brDrawBackground(pctx, preview.width, preview.height);
  pctx.drawImage(brCanvas, 0, 0);

  if (brSettings.sharpen > 0) {
    brApplySharpen(pctx, preview.width, preview.height, brSettings.sharpen);
  }

  brDisplayPreview(preview);
}

function brDisplayPreview(preview) {
  const view = document.getElementById('brPreviewCanvas');
  if (!view) return;

  const maxW = view.parentElement.clientWidth || 400;
  const maxH = 340;
  const scale = Math.min(maxW / preview.width, maxH / preview.height) * brZoom;

  view.width = preview.width * scale;
  view.height = preview.height * scale;
  const vctx = view.getContext('2d');
  vctx.imageSmoothingEnabled = true;
  vctx.imageSmoothingQuality = 'high';
  vctx.clearRect(0, 0, view.width, view.height);
  vctx.drawImage(preview, brPanX, brPanY, view.width, view.height);
}

function brDrawBackground(ctx, w, h) {
  const t = brSettings.bgType;
  if (t === 'transparent') return;
  if (t === 'color') { ctx.fillStyle = brSettings.bgColor; ctx.fillRect(0, 0, w, h); return; }
  if (t === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, brSettings.bgGrad1);
    grad.addColorStop(1, brSettings.bgGrad2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  if (t === 'image' && brSettings.bgImage) {
    const img = brSettings.bgImage;
    const r = Math.max(w / img.width, h / img.height);
    const dw = img.width * r, dh = img.height * r;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }
}

function brApplySharpen(ctx, w, h, amount) {
  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);
    const strength = amount / 3;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const center = copy[i + c] * (1 + 4 * strength);
          const top = copy[((y - 1) * w + x) * 4 + c] * strength;
          const bottom = copy[((y + 1) * w + x) * 4 + c] * strength;
          const left = copy[(y * w + x - 1) * 4 + c] * strength;
          const right = copy[(y * w + x + 1) * 4 + c] * strength;
          data[i + c] = Math.max(0, Math.min(255, center - top - bottom - left - right));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (e) { /* ignore */ }
}

/* ============================================================
   SETTINGS
   ============================================================ */
window.brSetSetting = (key, val) => {
  brSettings[key] = val;

  if (key === 'bgType') {
    document.querySelectorAll('.br-bg-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.val === val);
    });
    ['color', 'gradient', 'image'].forEach(t => {
      const el = document.getElementById('brBg' + t.charAt(0).toUpperCase() + t.slice(1) + 'Box');
      if (el) el.style.display = t === val ? 'block' : 'none';
    });
  }
  if (key === 'outputFormat') {
    document.querySelectorAll('.br-format-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.val === val);
    });
  }
  if (key === 'quality') {
    const el = document.getElementById('brQualityVal');
    if (el) el.textContent = val + '%';
  }
  if (key === 'maxDim') brSettings.maxDim = parseInt(val, 10) || 1200;
  if (key === 'sharpen') {
    brSettings.sharpen = parseInt(val, 10) || 0;
    const el = document.getElementById('brSharpenVal');
    if (el) el.textContent = val;
  }
  if (key === 'hdUpscale') brSettings.hdUpscale = parseFloat(val) || 1;

  brRenderPreview();
};

window.brSetBgColor = (val) => { brSettings.bgColor = val; brRenderPreview(); };
window.brSetGrad = (which, val) => {
  if (which === '1') brSettings.bgGrad1 = val;
  else brSettings.bgGrad2 = val;
  brRenderPreview();
};
window.brSetBgImage = (file) => {
  if (!file) return;
  const img = new Image();
  img.onload = () => { brSettings.bgImage = img; brRenderPreview(); brToast('✅ Custom bg loaded', 'success'); };
  img.src = URL.createObjectURL(file);
};

/* ============================================================
   BUILD FINAL
   ============================================================ */
async function brBuildFinalCanvas() {
  const w = brCanvas.width;
  const h = brCanvas.height;
  const scale = brSettings.hdUpscale;
  const fw = Math.round(w * scale);
  const fh = Math.round(h * scale);

  const final = document.createElement('canvas');
  final.width = fw;
  final.height = fh;
  const fctx = final.getContext('2d');
  fctx.imageSmoothingEnabled = true;
  fctx.imageSmoothingQuality = 'high';

  brDrawBackground(fctx, fw, fh);
  fctx.drawImage(brCanvas, 0, 0, fw, fh);

  if (brSettings.sharpen > 0) brApplySharpen(fctx, fw, fh, brSettings.sharpen);

  return final;
}

/* ============================================================
   DOWNLOAD / EXPORT
   ============================================================ */
window.brDownload = async () => {
  if (!brCanvas) { brToast('❌ Pehle background remove karo', 'error'); return; }
  const final = await brBuildFinalCanvas();
  if (!final) return;

  let mime = 'image/png';
  let ext = 'png';
  if (brSettings.outputFormat === 'jpg') { mime = 'image/jpeg'; ext = 'jpg'; }
  else if (brSettings.outputFormat === 'webp') { mime = 'image/webp'; ext = 'webp'; }

  const quality = mime === 'image/png' ? undefined : brSettings.quality / 100;
  const blob = await new Promise(res => final.toBlob(res, mime, quality));

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nobg_${Date.now()}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  brToast(`✅ Downloaded (${brFmtSize(blob.size)})`, 'success');
};

window.brDownloadPDF = async () => {
  if (!brCanvas) { brToast('❌ Pehle background remove karo', 'error'); return; }
  if (typeof jspdf === 'undefined') { brToast('❌ jsPDF load nahi hui', 'error'); return; }
  const final = await brBuildFinalCanvas();
  const dataUrl = final.toDataURL('image/jpeg', 0.95);
  const { jsPDF } = jspdf;
  const pdf = new jsPDF({
    orientation: final.width > final.height ? 'landscape' : 'portrait',
    unit: 'mm', format: 'a4'
  });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const ratio = final.width / final.height;
  let w = pw - 20, h = w / ratio;
  if (h > ph - 20) { h = ph - 20; w = h * ratio; }
  pdf.addImage(dataUrl, 'JPEG', (pw - w) / 2, (ph - h) / 2, w, h);
  pdf.save(`nobg_${Date.now()}.pdf`);
  brToast('✅ PDF downloaded', 'success');
};

window.brPrint = async () => {
  if (!brCanvas) { brToast('❌ Pehle background remove karo', 'error'); return; }
  const final = await brBuildFinalCanvas();
  const dataUrl = final.toDataURL('image/png');
  const win = window.open('', '_blank');
  if (!win) { brToast('❌ Popup blocked', 'error'); return; }
  win.document.write(`<html><head><title>Print</title><style>html,body{margin:0;padding:20px;text-align:center;background:#fff}img{max-width:100%;height:auto}</style></head><body><img src="${dataUrl}" onload="window.print();setTimeout(()=>window.close(),500)"></body></html>`);
  win.document.close();
};

window.brShare = async () => {
  if (!brCanvas) { brToast('❌ Pehle background remove karo', 'error'); return; }
  const final = await brBuildFinalCanvas();
  const blob = await new Promise(res => final.toBlob(res, 'image/png'));
  const file = new File([blob], 'nobg.png', { type: 'image/png' });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Qunverio' }); } catch (e) {}
  } else {
    brToast('⚠️ Share supported nahi');
  }
};

window.brCopy = async () => {
  if (!brCanvas) { brToast('❌ Pehle background remove karo', 'error'); return; }
  try {
    const final = await brBuildFinalCanvas();
    const blob = await new Promise(res => final.toBlob(res, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    brToast('📋 Copied!', 'success');
  } catch (e) { brToast('❌ Copy fail', 'error'); }
};

window.brRegenerate = async () => {
  if (!brOriginalFile) return;
  brResetAll();
  await brRemoveBackground();
};

window.brReset = () => {
  if (!confirm('Reset kar dein?')) return;
  if (brOriginalUrl) URL.revokeObjectURL(brOriginalUrl);
  brOriginalFile = null;
  brOriginalUrl = null;
  brResetAll();
  brRenderDrop();
  brToast('🔄 Reset done');
};

/* ============================================================
   RENDER HTML
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['background-remover'] = () => `
<div class="br-wrap">

  <div id="brDrop" class="br-drop">
    <div class="br-drop-icon">🎨</div>
    <div class="br-drop-title">Image upload karo</div>
    <div class="br-drop-sub">JPG • PNG • WebP • Max 30MB</div>
    <button class="btn btn-primary" onclick="document.getElementById('brInput').click()">
      📁 Select Image
    </button>
    <input type="file" id="brInput" accept="image/*" hidden>
  </div>

  <div id="brPanel" style="display:none;margin-top:14px">

    <div class="card" style="text-align:center">
      <div class="card-title">📸 Original</div>
      <div id="brOriginalPreview"></div>
      <div style="display:flex;gap:6px;margin-top:12px">
        <button class="btn btn-secondary" style="flex:1" onclick="brReCrop()">✂️ Re-crop</button>
        <button class="btn btn-primary" id="brRemoveBtn" style="flex:2" onclick="brRemoveBackground()">
          ✨ Remove Background
        </button>
      </div>
    </div>

    <div id="brProgressWrap" style="display:none;margin-top:14px;padding:14px;background:var(--surface);border-radius:14px;border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-3);margin-bottom:8px">
        <span id="brProgressText">Processing...</span>
        <span id="brProgressPct">0%</span>
      </div>
      <div style="height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden">
        <div id="brProgressFill" style="height:100%;width:0%;background:var(--gradient);transition:width .3s"></div>
      </div>
      <div class="hint" style="margin-top:8px;font-size:11px">
        ⚡ First time: model download (30-60s) • Next time: fast (cached)
      </div>
    </div>

    <div id="brControls" style="display:none">

      <div class="card" style="text-align:center">
        <div class="card-title">🎨 Preview</div>
        <div id="brCanvasWrap" style="background:repeating-conic-gradient(#e5e7eb 0 25%, #fff 0 50%) 50% / 20px 20px;border-radius:12px;padding:10px;overflow:hidden;position:relative;min-height:200px;display:flex;align-items:center;justify-content:center">
          <canvas id="brPreviewCanvas" style="max-width:100%;display:block;border-radius:8px;touch-action:none"></canvas>
          <canvas id="brCanvas" style="display:none"></canvas>
        </div>
        <div style="display:flex;gap:6px;justify-content:center;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-sm btn-secondary" onclick="brZoomOut()">➖</button>
          <button class="btn btn-sm btn-secondary" onclick="brZoomReset()">100%</button>
          <button class="btn btn-sm btn-secondary" onclick="brZoomIn()">➕</button>
          <button class="btn btn-sm btn-secondary" id="brCompareBtn" onclick="brToggleCompare()">👁️ Compare</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🖌️ Brush (Erase / Restore)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          <div class="br-brush-chip active" data-val="none" onclick="brSetBrush('none')">None</div>
          <div class="br-brush-chip" data-val="erase" onclick="brSetBrush('erase')">🗑️ Erase</div>
          <div class="br-brush-chip" data-val="restore" onclick="brSetBrush('restore')">🖌️ Restore</div>
        </div>
        <div id="brBrushSizeBox" style="display:none">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
            Brush Size: <span id="brBrushSizeVal">30px</span>
          </label>
          <input type="range" min="5" max="100" value="30" oninput="brSetBrushSize(this.value)" style="width:100%">
        </div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <button class="btn btn-sm btn-secondary" onclick="brUndo()" style="flex:1">↶ Undo</button>
          <button class="btn btn-sm btn-secondary" onclick="brRedo()" style="flex:1">↷ Redo</button>
          <button class="btn btn-sm btn-secondary" onclick="brRegenerate()" style="flex:1">🔄 Re-run AI</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🎨 Background</div>
        <div class="br-bg-chips">
          <div class="br-bg-chip active" data-val="transparent" onclick="brSetSetting('bgType','transparent')">
            <span>🔲</span><span>Transparent</span>
          </div>
          <div class="br-bg-chip" data-val="color" onclick="brSetSetting('bgType','color')">
            <span>🎨</span><span>Color</span>
          </div>
          <div class="br-bg-chip" data-val="gradient" onclick="brSetSetting('bgType','gradient')">
            <span>🌈</span><span>Gradient</span>
          </div>
          <div class="br-bg-chip" data-val="image" onclick="brSetSetting('bgType','image')">
            <span>🖼️</span><span>Custom</span>
          </div>
        </div>

        <div id="brBgColorBox" style="display:none;margin-top:12px">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">Color</label>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <input type="color" value="#ffffff" onchange="brSetBgColor(this.value)" style="width:60px;height:44px;padding:4px;border-radius:10px;border:1.5px solid var(--border);cursor:pointer">
            <button class="br-color-btn" onclick="brSetBgColor('#ffffff')" style="background:#fff;border:1px solid #ccc">White</button>
            <button class="br-color-btn" onclick="brSetBgColor('#000000')" style="background:#000;color:#fff">Black</button>
            <button class="br-color-btn" onclick="brSetBgColor('#3b82f6')" style="background:#3b82f6;color:#fff">Blue</button>
            <button class="br-color-btn" onclick="brSetBgColor('#ef4444')" style="background:#ef4444;color:#fff">Red</button>
            <button class="br-color-btn" onclick="brSetBgColor('#10b981')" style="background:#10b981;color:#fff">Green</button>
          </div>
        </div>

        <div id="brBgGradientBox" style="display:none;margin-top:12px">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">Gradient</label>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="color" value="#667eea" onchange="brSetGrad('1',this.value)" style="width:60px;height:44px;padding:4px;border-radius:10px;border:1.5px solid var(--border);cursor:pointer">
            <span style="color:var(--text-3)">→</span>
            <input type="color" value="#764ba2" onchange="brSetGrad('2',this.value)" style="width:60px;height:44px;padding:4px;border-radius:10px;border:1.5px solid var(--border);cursor:pointer">
          </div>
        </div>

        <div id="brBgImageBox" style="display:none;margin-top:12px">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">Custom Background</label>
          <input type="file" accept="image/*" onchange="brSetBgImage(this.files[0])" style="width:100%">
        </div>
      </div>

      <div class="card">
        <div class="card-title">✨ Effects</div>
        <div>
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">Sharpen: <span id="brSharpenVal">0</span></label>
          <input type="range" min="0" max="3" value="0" oninput="brSetSetting('sharpen',this.value)" style="width:100%">
        </div>
      </div>

      <div class="card">
        <div class="card-title">📤 Export</div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">Format</label>
          <div class="br-format-chips">
            <div class="br-format-chip active" data-val="png" onclick="brSetSetting('outputFormat','png')">PNG</div>
            <div class="br-format-chip" data-val="jpg" onclick="brSetSetting('outputFormat','jpg')">JPG</div>
            <div class="br-format-chip" data-val="webp" onclick="brSetSetting('outputFormat','webp')">WebP</div>
          </div>
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">Quality: <span id="brQualityVal">92%</span></label>
          <input type="range" min="50" max="100" value="92" oninput="brSetSetting('quality',parseInt(this.value))" style="width:100%">
        </div>
        <div>
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">HD Upscale</label>
          <select onchange="brSetSetting('hdUpscale',parseFloat(this.value))" style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
            <option value="1">1x (Original)</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x (HD)</option>
          </select>
        </div>
      </div>

      <div class="btn-group" style="margin-top:14px">
        <button class="btn btn-secondary" onclick="brCopy()">📋 Copy</button>
        <button class="btn btn-secondary" onclick="brShare()">🔗 Share</button>
        <button class="btn btn-secondary" onclick="brDownloadPDF()">📄 PDF</button>
        <button class="btn btn-secondary" onclick="brPrint()">🖨️ Print</button>
      </div>
      <div class="btn-group" style="margin-top:8px">
        <button class="btn btn-primary" onclick="brDownload()">⬇ Download Image</button>
        <button class="btn btn-secondary" onclick="brReset()">🔄 New</button>
      </div>

    </div>
  </div>
</div>

<!-- CROP MODAL -->
<div class="br-crop-modal" id="brCropModal">
  <div class="br-crop-header">
    <h3>✂️ Crop Image</h3>
    <button class="btn btn-secondary" onclick="brCloseCropModal()" style="padding:6px 12px">✕</button>
  </div>
  <div class="br-crop-body">
    <img id="brCropImage" src="" alt="Crop">
  </div>
  <div class="br-crop-toolbar">
    <button class="br-tool-btn" onclick="brRotateCrop(-90)" title="Rotate Left">↺</button>
    <button class="br-tool-btn" onclick="brRotateCrop(90)" title="Rotate Right">↻</button>
    <button class="br-tool-btn" onclick="brFlipCropH()" title="Flip H">⇄</button>
    <button class="br-tool-btn" onclick="brFlipCropV()" title="Flip V">⇅</button>
    <button class="br-tool-btn" onclick="brResetCrop()" title="Reset">⟳</button>
  </div>
  <div class="br-crop-footer">
    <button class="btn btn-secondary" onclick="brSkipCrop()">Skip Crop</button>
    <button class="btn btn-primary" onclick="brApplyCrop()">✓ Apply Crop</button>
  </div>
</div>

<style>
  .br-wrap { padding: 4px 0; }
  .br-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 30px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .br-drop:hover { border-color: var(--primary); background: var(--surface-hover); }
  .br-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .br-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .br-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }

  .br-brush-chip, .br-bg-chip, .br-format-chip {
    padding: 8px 12px; border-radius: 10px; background: var(--surface-2);
    border: 1.5px solid var(--border); color: var(--text-2);
    font-size: 12px; font-weight: 600; cursor: pointer;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .br-bg-chip { flex-direction: column; padding: 10px 8px; min-width: 60px; text-align: center; }
  .br-brush-chip:hover, .br-bg-chip:hover, .br-format-chip:hover { background: var(--surface-hover); }
  .br-brush-chip.active, .br-bg-chip.active, .br-format-chip.active {
    background: var(--gradient); color: #fff; border-color: transparent;
  }
  .br-bg-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .br-format-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .br-color-btn { padding: 8px 12px; border-radius: 8px; font-size: 11.5px; font-weight: 700; cursor: pointer; }

  input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 3px; background: var(--surface-2); outline: none; }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--gradient); cursor: pointer; }

  .br-crop-modal { position: fixed; inset: 0; background: rgba(0,0,0,.95); z-index: 99999; display: none; flex-direction: column; }
  .br-crop-modal.active { display: flex; }
  .br-crop-header { padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); background: var(--surface); }
  .br-crop-header h3 { color: var(--text); font-size: 15px; margin: 0; }
  .br-crop-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 16px; overflow: hidden; position: relative; }
  .br-crop-body img { max-width: 100%; max-height: 100%; display: block; }
  .br-crop-toolbar { padding: 10px 14px; display: flex; gap: 8px; justify-content: center; border-top: 1px solid var(--border); background: var(--surface); flex-wrap: wrap; }
  .br-tool-btn { width: 42px; height: 42px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .br-tool-btn:hover { background: var(--surface-hover); color: var(--primary); }
  .br-crop-footer { padding: 14px 18px; display: flex; gap: 10px; border-top: 1px solid var(--border); background: var(--surface); }
  .br-crop-footer .btn { flex: 1; }

  @media (max-width: 480px) {
    .br-bg-chip { min-width: 50px; padding: 8px 6px; font-size: 11px; }
  }
</style>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['background-remover'] = () => {
  const input = document.getElementById('brInput');
  const drop = document.getElementById('brDrop');
  if (!input || !drop) return;

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });
  input.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      brLoadFile(e.target.files[0]);
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
      brLoadFile(e.dataTransfer.files[0]);
    }
  });
};

console.log('%c✅ Background Remover v5 loaded', 'color:#ec4899;font-weight:bold');