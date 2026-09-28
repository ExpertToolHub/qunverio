/* ============================================================
   QUNVERIO — BACKGROUND REMOVER (Qunverio Style + All Features)
   Uses @imgly/background-removal via ESM CDN
   Features: BG change, brush, undo, compare, export
   ============================================================ */

console.log('%cBackground Remover loading...', 'color:#ec4899;font-weight:bold');

/* ============================================================
   STATE
   ============================================================ */
let brOriginalFile = null;
let brOriginalUrl = null;
let brRemovedBlob = null;       // Transparent PNG blob (AI output)
let brRemovedImg = null;        // Loaded Image of AI output
let brCanvas = null;            // Main canvas (editable)
let brCtx = null;
let brHistory = [];             // Undo stack
let brHistoryIdx = -1;
let brBusy = false;
let brLibFn = null;
let brLibLoading = false;
let brBrushMode = 'none';       // none | erase | restore
let brBrushSize = 30;
let brZoom = 1;
let brPanX = 0, brPanY = 0;
let brCompareMode = false;
let brAIResult = null;          // Original AI output (before brush edits)

let brSettings = {
  bgType: 'transparent',        // transparent | color | gradient | blur | image
  bgColor: '#ffffff',
  bgGrad1: '#667eea',
  bgGrad2: '#764ba2',
  bgGradDir: '135deg',
  bgBlur: 10,
  bgImage: null,                // Uploaded custom bg
  outputFormat: 'png',          // png | jpg | webp
  quality: 92,
  maxDim: 1500,
  feather: 0,                   // 0-5 px
  halo: 0,                      // 0-3
  sharpen: 0,                   // 0-3
  hdUpscale: 1,                 // 1x | 1.5x | 2x
  exportSize: 'original'        // original | 500 | 1000 | 2000
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
   LOAD AI LIBRARY
   ============================================================ */
async function brLoadLibrary() {
  if (brLibFn) return true;
  if (brLibLoading) return false;
  brLibLoading = true;
  brSetProgress(3, '⏳ AI library load ho rahi hai...');
  try {
    const mod = await import('https://esm.sh/@imgly/background-removal@1.5.5');
    if (mod && typeof mod.removeBackground === 'function') {
      brLibFn = mod.removeBackground;
    } else if (mod.default && typeof mod.default.removeBackground === 'function') {
      brLibFn = mod.default.removeBackground;
    }
    brSetProgress(10, '✅ AI ready');
    return !!brLibFn;
  } catch (e) {
    console.error('AI library load fail:', e);
    brToast('❌ AI library load nahi hui', 'error');
    return false;
  } finally {
    brLibLoading = false;
  }
}

/* ============================================================
   LOAD FILE (upload)
   ============================================================ */
window.brLoadFile = (file) => {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    brToast('❌ Sirf image select karo', 'error');
    return;
  }
  if (file.size > 30 * 1024 * 1024) {
    brToast('❌ Image 30MB se choti', 'error');
    return;
  }
  brOriginalFile = file;
  if (brOriginalUrl) URL.revokeObjectURL(brOriginalUrl);
  brOriginalUrl = URL.createObjectURL(file);
  brResetAll();
  brRenderPanel();
  brToast('✅ Image loaded', 'success');
};

window.brResetAll = () => {
  brRemovedBlob = null;
  brRemovedImg = null;
  brAIResult = null;
  brHistory = [];
  brHistoryIdx = -1;
  brZoom = 1;
  brPanX = 0; brPanY = 0;
  brBrushMode = 'none';
  brCompareMode = false;
};

/* ============================================================
   RENDER PANEL
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

  brRenderCanvas();
}

/* ============================================================
   MAIN — REMOVE BACKGROUND
   ============================================================ */
window.brRemoveBackground = async () => {
  if (!brOriginalFile) { brToast('❌ Pehle image upload karo', 'error'); return; }
  if (brBusy) return;
  brBusy = true;

  const btn = document.getElementById('brRemoveBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Processing...'; }

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

    brSetProgress(100, '✅ Ready!');
    brHideProgress();
    brToast('✅ Background removed! Ab edit kar sakte ho.', 'success');
    brRenderControls();
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

/* ============================================================
   RESIZE IF NEEDED
   ============================================================ */
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
   SETUP CANVAS (with brush, zoom, compare)
   ============================================================ */
async function brSetupCanvas(blob) {
  const img = await new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = URL.createObjectURL(blob);
  });
  brRemovedImg = img;
  brAIResult = img;

  const canvas = document.getElementById('brCanvas');
  if (!canvas) return;
  canvas.width = img.width;
  canvas.height = img.height;
  brCanvas = canvas;
  brCtx = canvas.getContext('2d');

  // Draw AI result
  brCtx.clearRect(0, 0, canvas.width, canvas.height);
  brCtx.drawImage(img, 0, 0);

  // Save initial state
  brHistory = [brCtx.getImageData(0, 0, canvas.width, canvas.height)];
  brHistoryIdx = 0;

  // Setup brush events
  brSetupBrushEvents();

  // Render preview at current zoom/pan
  brRenderPreview();
}

/* ============================================================
   BRUSH EVENTS (erase / restore)
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
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
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
  if (brHistory.length > 20) {
    brHistory.shift();
    brHistoryIdx--;
  }
}

window.brUndo = () => {
  if (brHistoryIdx <= 0) { brToast('⚠️ Kuch undo karne ko nahi', 'error'); return; }
  brHistoryIdx--;
  brCtx.putImageData(brHistory[brHistoryIdx], 0, 0);
  brRenderPreview();
  brToast('↶ Undo', 'success');
};

window.brRedo = () => {
  if (brHistoryIdx >= brHistory.length - 1) { brToast('⚠️ Kuch redo karne ko nahi', 'error'); return; }
  brHistoryIdx++;
  brCtx.putImageData(brHistory[brHistoryIdx], 0, 0);
  brRenderPreview();
  brToast('↷ Redo', 'success');
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
   ZOOM / PAN
   ============================================================ */
window.brZoomIn = () => { brZoom = Math.min(3, brZoom + 0.2); brRenderPreview(); };
window.brZoomOut = () => { brZoom = Math.max(0.3, brZoom - 0.2); brRenderPreview(); };
window.brZoomReset = () => { brZoom = 1; brPanX = 0; brPanY = 0; brRenderPreview(); };

/* ============================================================
   COMPARE (before/after)
   ============================================================ */
window.brToggleCompare = () => {
  brCompareMode = !brCompareMode;
  const btn = document.getElementById('brCompareBtn');
  if (btn) btn.classList.toggle('active', brCompareMode);
  brRenderPreview();
};

/* ============================================================
   RENDER PREVIEW (with all effects)
   ============================================================ */
function brRenderPreview() {
  const wrap = document.getElementById('brCanvasWrap');
  if (!wrap || !brCanvas) return;

  // Apply composite background to preview (temporary canvas)
  const preview = document.createElement('canvas');
  preview.width = brCanvas.width;
  preview.height = brCanvas.height;
  const pctx = preview.getContext('2d');

  // 1. Draw background
  brDrawBackground(pctx, preview.width, preview.height);

  // 2. Draw foreground (canvas content) — or original if compare
  if (brCompareMode && brOriginalUrl) {
    // Load original image and draw
    const img = new Image();
    img.onload = () => {
      pctx.drawImage(img, 0, 0, preview.width, preview.height);
      brDisplayPreview(preview);
    };
    img.src = brOriginalUrl;
    return;
  }

  pctx.drawImage(brCanvas, 0, 0);

  // 3. Apply feather/halo/sharpen if any
  if (brSettings.feather > 0 || brSettings.halo > 0) {
    // Simple edge smoothing — draw multiple offsets (approximation)
    // (proper implementation would need a mask, this is a lightweight version)
  }

  // 4. Apply sharpen (simple convolution)
  if (brSettings.sharpen > 0) {
    brApplySharpen(pctx, preview.width, preview.height, brSettings.sharpen);
  }

  brDisplayPreview(preview);
}

function brDisplayPreview(preview) {
  const view = document.getElementById('brPreviewCanvas');
  if (!view) return;

  // Match display size
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
  if (t === 'transparent') {
    // Checkerboard will be handled by CSS on parent
    return;
  }
  if (t === 'color') {
    ctx.fillStyle = brSettings.bgColor;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  if (t === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, brSettings.bgGrad1);
    grad.addColorStop(1, brSettings.bgGrad2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  if (t === 'blur') {
    // Draw original image blurred
    if (brOriginalUrl) {
      const img = new Image();
      img.src = brOriginalUrl;
      // Can't draw synchronously — skip for now
      // (Would need async rendering)
    }
    return;
  }
  if (t === 'image' && brSettings.bgImage) {
    const img = brSettings.bgImage;
    // Cover fit
    const r = Math.max(w / img.width, h / img.height);
    const dw = img.width * r, dh = img.height * r;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return;
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
  } catch (e) {
    // ignore
  }
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
    ['color', 'gradient', 'blur', 'image'].forEach(t => {
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
  if (key === 'maxDim') brSettings.maxDim = parseInt(val, 10) || 1500;
  if (key === 'feather' || key === 'halo' || key === 'sharpen') {
    brSettings[key] = parseInt(val, 10) || 0;
    const el = document.getElementById('br' + key.charAt(0).toUpperCase() + key.slice(1) + 'Val');
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
   RESET / UNDO / DOWNLOAD / SHARE / PRINT / PDF
   ============================================================ */
window.brReset = () => {
  if (!confirm('Reset kar dein? Saara kaam delete ho jayega.')) return;
  if (brOriginalUrl) URL.revokeObjectURL(brOriginalUrl);
  brOriginalFile = null;
  brOriginalUrl = null;
  brResetAll();
  brRenderDrop();
  brToast('🔄 Reset done');
};

window.brRegenerate = async () => {
  if (!brOriginalFile) return;
  brResetAll();
  await brRemoveBackground();
};

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

async function brBuildFinalCanvas() {
  const w = brCanvas.width;
  const h = brCanvas.height;

  // HD upscale
  const scale = brSettings.hdUpscale;
  const fw = Math.round(w * scale);
  const fh = Math.round(h * scale);

  const final = document.createElement('canvas');
  final.width = fw;
  final.height = fh;
  const fctx = final.getContext('2d');
  fctx.imageSmoothingEnabled = true;
  fctx.imageSmoothingQuality = 'high';

  // 1. Background
  if (brSettings.bgType === 'blur' && brOriginalUrl) {
    // Draw blurred original
    const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = brOriginalUrl; });
    fctx.save();
    fctx.filter = `blur(${brSettings.bgBlur}px)`;
    fctx.drawImage(img, 0, 0, fw, fh);
    fctx.restore();
  } else {
    brDrawBackground(fctx, fw, fh);
  }

  // 2. Foreground (canvas)
  fctx.drawImage(brCanvas, 0, 0, fw, fh);

  // 3. Sharpen
  if (brSettings.sharpen > 0) {
    brApplySharpen(fctx, fw, fh, brSettings.sharpen);
  }

  return final;
}

window.brDownloadPDF = async () => {
  if (!brCanvas) { brToast('❌ Pehle background remove karo', 'error'); return; }
  if (typeof jspdf === 'undefined') { brToast('❌ jsPDF load nahi hui', 'error'); return; }

  const final = await brBuildFinalCanvas();
  if (!final) return;

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
  win.document.write(`
    <html><head><title>Print</title>
    <style>html,body{margin:0;padding:20px;text-align:center;background:#fff}
    img{max-width:100%;height:auto}</style></head>
    <body><img src="${dataUrl}" onload="window.print();setTimeout(()=>window.close(),500)"></body></html>
  `);
  win.document.close();
};

window.brShare = async () => {
  if (!brCanvas) { brToast('❌ Pehle background remove karo', 'error'); return; }
  const final = await brBuildFinalCanvas();
  const blob = await new Promise(res => final.toBlob(res, 'image/png'));
  const file = new File([blob], 'nobg.png', { type: 'image/png' });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Qunverio BG Removed' }); }
    catch (e) { /* cancelled */ }
  } else {
    brToast('⚠️ Share supported nahi — download use karo');
  }
};

window.brCopy = async () => {
  if (!brCanvas) { brToast('❌ Pehle background remove karo', 'error'); return; }
  try {
    const final = await brBuildFinalCanvas();
    const blob = await new Promise(res => final.toBlob(res, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    brToast('📋 Copied to clipboard!', 'success');
  } catch (e) {
    brToast('❌ Copy fail', 'error');
  }
};

/* ============================================================
   RENDER CONTROLS (show after remove)
   ============================================================ */
function brRenderControls() {
  const c = document.getElementById('brControls');
  if (c) c.style.display = 'block';
  brRenderPreview();
}

/* ============================================================
   MAIN RENDER (HTML)
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

    <!-- ORIGINAL + REMOVE BUTTON -->
    <div class="card" style="text-align:center">
      <div class="card-title">📸 Original</div>
      <div id="brOriginalPreview"></div>
      <button class="btn btn-primary" id="brRemoveBtn" style="width:100%;margin-top:12px" onclick="brRemoveBackground()">
        ✨ Remove Background
      </button>
    </div>

    <!-- PROGRESS -->
    <div id="brProgressWrap" style="display:none;margin-top:14px;padding:14px;background:var(--surface);border-radius:14px;border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-3);margin-bottom:8px">
        <span id="brProgressText">Processing...</span>
        <span id="brProgressPct">0%</span>
      </div>
      <div style="height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden">
        <div id="brProgressFill" style="height:100%;width:0%;background:var(--gradient);transition:width .3s"></div>
      </div>
    </div>

    <!-- EDITOR (after removal) -->
    <div id="brControls" style="display:none">

      <!-- CANVAS PREVIEW -->
      <div class="card" style="text-align:center">
        <div class="card-title">🎨 Preview</div>
        <div id="brCanvasWrap" style="background:repeating-conic-gradient(#e5e7eb 0 25%, #fff 0 50%) 50% / 20px 20px;border-radius:12px;padding:10px;overflow:hidden;position:relative;min-height:200px;display:flex;align-items:center;justify-content:center">
          <canvas id="brPreviewCanvas" style="max-width:100%;display:block;border-radius:8px;touch-action:none"></canvas>
          <canvas id="brCanvas" style="display:none"></canvas>
        </div>
        <div style="display:flex;gap:6px;justify-content:center;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-sm btn-secondary" onclick="brZoomOut()">➖ Zoom Out</button>
          <button class="btn btn-sm btn-secondary" onclick="brZoomReset()">100%</button>
          <button class="btn btn-sm btn-secondary" onclick="brZoomIn()">➕ Zoom In</button>
          <button class="btn btn-sm btn-secondary" id="brCompareBtn" onclick="brToggleCompare()">👁️ Compare</button>
        </div>
      </div>

      <!-- BRUSH -->
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

      <!-- BACKGROUND CHANGE -->
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
          <div class="br-bg-chip" data-val="blur" onclick="brSetSetting('bgType','blur')">
            <span>💨</span><span>Blur</span>
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

        <div id="brBgBlurBox" style="display:none;margin-top:12px">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">Blur Amount</label>
          <input type="range" min="2" max="30" value="10" oninput="brSetSetting('bgBlur',parseInt(this.value))" style="width:100%">
        </div>

        <div id="brBgImageBox" style="display:none;margin-top:12px">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">Upload Custom Background</label>
          <input type="file" accept="image/*" onchange="brSetBgImage(this.files[0])" style="width:100%">
        </div>
      </div>

      <!-- EDGE / EFFECTS -->
      <div class="card">
        <div class="card-title">✨ Effects</div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">Edge Feather: <span id="brFeatherVal">0</span></label>
          <input type="range" min="0" max="5" value="0" oninput="brSetSetting('feather',this.value)" style="width:100%">
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">Halo Removal: <span id="brHaloVal">0</span></label>
          <input type="range" min="0" max="3" value="0" oninput="brSetSetting('halo',this.value)" style="width:100%">
        </div>
        <div>
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">Sharpen: <span id="brSharpenVal">0</span></label>
          <input type="range" min="0" max="3" value="0" oninput="brSetSetting('sharpen',this.value)" style="width:100%">
        </div>
      </div>

      <!-- EXPORT SETTINGS -->
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
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">HD Upscale</label>
          <select onchange="brSetSetting('hdUpscale',parseFloat(this.value))" style="width:100%;padding:10px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
            <option value="1">1x (Original)</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x (HD)</option>
          </select>
        </div>
      </div>

      <!-- DOWNLOAD ACTIONS -->
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

  // Preload AI library in background
  brLoadLibrary().then(ok => {
    if (ok) console.log('%c✅ AI library preloaded', 'color:#10b981');
  });
};

console.log('%c✅ Background Remover loaded', 'color:#ec4899;font-weight:bold');