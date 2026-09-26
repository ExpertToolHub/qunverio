/* ============================================================
   QUNVERIO — QR CODE GENERATOR (tools/qr-generator.js)
   Simple, Fast, Ultra HD Download + Print
   ============================================================ */

console.log('%c📱 QR Generator Loading...', 'color:#8b5cf6;font-weight:bold');

/* ============================================================
   RENDERER — Form
   ============================================================ */
window.EXTRA_TOOL_RENDERERS = window.EXTRA_TOOL_RENDERERS || {};
window.EXTRA_TOOL_INITS = window.EXTRA_TOOL_INITS || {};

window.EXTRA_TOOL_RENDERERS['qr-generator'] = () => `
  <div class="card">
    <div class="card-title">QR Code Generator</div>
    <div class="field">
      <label>Paste URL or Text</label>
      <textarea id="qrInput" placeholder="https://example.com ya koi bhi text paste karo..." rows="3" style="font-size:15px"></textarea>
      <div class="hint">URL, text, phone number, email — kuch bhi paste karo, QR ban jayega</div>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="qrProGenerate()" style="flex:2">📱 Generate QR</button>
      <button class="btn btn-secondary" onclick="qrProReset()" style="flex:1">🔄 Reset</button>
    </div>
  </div>
  <div class="result-box" id="qrResult"></div>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['qr-generator'] = () => {
  console.log('%c✅ QR Generator initialized', 'color:#10b981');
};

/* ============================================================
   GENERATE QR
   ============================================================ */
window.qrProGenerate = function() {
  const raw = document.getElementById('qrInput').value.trim();
  if (!raw) { if (typeof toast === 'function') toast('Paste URL or text first', 'error'); return; }

  // Auto-detect type
  let data = raw;
  if (/^https?:\/\//i.test(raw)) data = raw;
  else if (/^www\./i.test(raw)) data = 'https://' + raw;
  else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) data = 'mailto:' + raw;
  else if (/^\+?[\d\s\-()]{10,}$/.test(raw)) data = 'tel:' + raw.replace(/[^\d+]/g, '');
  else data = raw;

  const box = document.getElementById('qrResult');
  box.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'qr-container';
  container.style.background = '#ffffff';
  box.appendChild(container);

  try {
    new QRCode(container, {
      text: data,
      width: 320,
      height: 320,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch (e) {
    console.error(e);
    if (typeof toast === 'function') toast('QR generation failed', 'error');
    return;
  }

  setTimeout(() => {
    const canvas = container.querySelector('canvas');
    if (canvas) {
      canvas.style.padding = '20px';
      canvas.style.background = '#ffffff';
      canvas.style.borderRadius = '12px';
    }
    const img = container.querySelector('img');
    if (img) {
      img.style.padding = '20px';
      img.style.background = '#ffffff';
      img.style.borderRadius = '12px';
    }

    const actions = document.createElement('div');
    actions.innerHTML = `
      <div class="export-btns no-export no-print" style="margin-top:14px">
        <button class="btn btn-secondary" onclick="qrProDownloadPNG()"><i>🖼️</i>HD PNG</button>
        <button class="btn btn-secondary" onclick="qrProDownloadSVG()"><i>📐</i>HD SVG</button>
        <button class="btn btn-secondary" onclick="qrProPrint()"><i>🖨️</i>Print</button>
      </div>
      <div class="btn-group" style="margin-top:8px">
        <button class="btn btn-secondary btn-sm" onclick="qrProCopy()">📋 Copy Link</button>
        <button class="btn btn-secondary btn-sm" onclick="qrProShare()">📤 Share</button>
      </div>`;
    box.appendChild(actions);
    box.classList.add('active');

    // Store data for copy/share
    window._qrData = data;
  }, 150);
};

/* ============================================================
   ULTRA HD PNG DOWNLOAD (6x resolution + white padding)
   ============================================================ */
window.qrProDownloadPNG = function() {
  const container = document.querySelector('#qrResult .qr-container');
  if (!container) { if (typeof toast === 'function') toast('Generate QR first', 'error'); return; }

  const canvas = container.querySelector('canvas');
  const img = container.querySelector('img');
  let src = null;
  let baseSize = 320;

  if (canvas) {
    src = canvas.toDataURL('image/png');
    baseSize = canvas.width || 320;
  } else if (img && img.src && img.src.startsWith('data:')) {
    src = img.src;
    baseSize = img.naturalWidth || 320;
  } else if (img && img.src) {
    src = img.src;
    baseSize = img.naturalWidth || 320;
  }

  if (!src) { if (typeof toast === 'function') toast('QR not ready', 'error'); return; }

  // ULTRA HD: 6x resolution + 12% white padding
  const SCALE = 6;
  const PADDING_PCT = 0.12;
  const finalSize = baseSize * SCALE;

  const hdCanvas = document.createElement('canvas');
  hdCanvas.width = finalSize;
  hdCanvas.height = finalSize;
  const ctx = hdCanvas.getContext('2d');

  // Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, finalSize, finalSize);

  const imgEl = new Image();
  imgEl.onload = () => {
    const pad = finalSize * PADDING_PCT;
    const innerSize = finalSize - (2 * pad);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(imgEl, pad, pad, innerSize, innerSize);

    const url = hdCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = 'qunverio-qr-' + finalSize + 'px.png';
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof toast === 'function') toast('Ultra HD QR (' + finalSize + 'px) ✅', 'success');
  };
  imgEl.onerror = () => { if (typeof toast === 'function') toast('QR download failed', 'error'); };
  imgEl.src = src;
};

/* ============================================================
   ULTRA HD SVG DOWNLOAD (8x resolution + white padding)
   ============================================================ */
window.qrProDownloadSVG = function() {
  const container = document.querySelector('#qrResult .qr-container');
  if (!container) { if (typeof toast === 'function') toast('Generate QR first', 'error'); return; }

  const canvas = container.querySelector('canvas');
  if (!canvas) { if (typeof toast === 'function') toast('SVG requires canvas QR', 'error'); return; }

  const SCALE = 8;
  const PADDING_PCT = 0.12;
  const baseSize = canvas.width || 320;
  const finalSize = baseSize * SCALE;
  const pad = finalSize * PADDING_PCT;
  const innerSize = finalSize - (2 * pad);

  const hdCanvas = document.createElement('canvas');
  hdCanvas.width = finalSize;
  hdCanvas.height = finalSize;
  const ctx = hdCanvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, finalSize, finalSize);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, pad, pad, innerSize, innerSize);
  const pngData = hdCanvas.toDataURL('image/png');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${finalSize}" height="${finalSize}" viewBox="0 0 ${finalSize} ${finalSize}">
    <rect width="${finalSize}" height="${finalSize}" fill="#ffffff"/>
    <image href="${pngData}" x="${pad}" y="${pad}" width="${innerSize}" height="${innerSize}" preserveAspectRatio="xMidYMid meet"/>
  </svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = 'qunverio-qr-' + finalSize + 'px.svg';
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  if (typeof toast === 'function') toast('Ultra HD SVG (' + finalSize + 'px) ✅', 'success');
};

/* ============================================================
   PRINT — Clean QR print (no blank page)
   ============================================================ */
window.qrProPrint = function() {
  const container = document.querySelector('#qrResult .qr-container');
  if (!container) { if (typeof toast === 'function') toast('Generate QR first', 'error'); return; }

  const canvas = container.querySelector('canvas');
  const img = container.querySelector('img');
  let src = null;
  if (canvas) src = canvas.toDataURL('image/png');
  else if (img && img.src) src = img.src;

  if (!src) { if (typeof toast === 'function') toast('QR not ready', 'error'); return; }

  const printHtml = `<!DOCTYPE html>
<html><head><title>Qunverio QR Print</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:30px;background:#fff}
  .header{display:flex;justify-content:space-between;align-items:center;width:100%;max-width:600px;padding-bottom:14px;border-bottom:3px solid #6366f1;margin-bottom:24px}
  .brand{font-size:24px;font-weight:900;color:#6366f1;white-space:nowrap}
  .date{font-size:12px;color:#888;text-align:right;white-space:nowrap}
  .qr-wrap{background:#fff;padding:24px;border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center}
  .qr-wrap img{width:420px;height:420px;image-rendering:pixelated;display:block}
  .footer{margin-top:24px;font-size:12px;color:#888;text-align:center}
  @media print{body{padding:15px}.qr-wrap{box-shadow:none;padding:16px}.qr-wrap img{width:100%;max-width:480px;height:auto}}
  @media (max-width:600px){.qr-wrap img{width:280px;height:280px}}
</style>
</head>
<body>
  <div class="header">
    <div class="brand">⚡ Qunverio</div>
    <div class="date">${new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
  </div>
  <div class="qr-wrap"><img src="${src}" alt="QR Code" /></div>
  <div class="footer">Generated by Qunverio — qunverio.vercel.app</div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(printHtml); doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 600);
    return;
  }
  printWindow.document.write(printHtml);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 1200);
  }, 600);
};

/* ============================================================
   COPY & SHARE
   ============================================================ */
window.qrProCopy = function() {
  if (!window._qrData) return;
  navigator.clipboard.writeText(window._qrData)
    .then(() => { if (typeof toast === 'function') toast('Copied!', 'success'); })
    .catch(() => { if (typeof toast === 'function') toast('Copy failed', 'error'); });
};

window.qrProShare = function() {
  if (!window._qrData) return;
  if (navigator.share) {
    navigator.share({ title: 'QR Code', text: window._qrData }).catch(() => {});
  } else {
    window.qrProCopy();
  }
};

/* ============================================================
   RESET
   ============================================================ */
window.qrProReset = function() {
  const input = document.getElementById('qrInput');
  if (input) input.value = '';
  const box = document.getElementById('qrResult');
  box.classList.remove('active');
  box.innerHTML = '';
  window._qrData = '';
  if (typeof toast === 'function') toast('Reset done', 'success');
};

console.log('%c✅ QR Generator loaded — Ultra HD download + Print ready', 'color:#8b5cf6;font-weight:bold;font-size:14px');