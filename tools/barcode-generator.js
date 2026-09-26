/* ============================================================
   QUNVERIO — ULTRA HD BARCODE GENERATOR
   Full Pixel Quality + White Padding
   ============================================================ */

console.log('%c🎫 Barcode Generator Loading...', 'color:#8b5cf6;font-weight:bold');

window.EXTRA_TOOL_RENDERERS = window.EXTRA_TOOL_RENDERERS || {};
window.EXTRA_TOOL_INITS = window.EXTRA_TOOL_INITS || {};

/* ============================================================
   FORM
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['barcode-generator'] = () => `
  <div class="card">
    <div class="card-title">Barcode Generator</div>
    <div class="field">
      <label>Paste URL or Text</label>
      <textarea id="barInput" placeholder="https://example.com ya koi bhi text/number..." rows="3" style="font-size:15px"></textarea>
      <div class="hint">Kuch bhi paste karo — barcode automatically ban jayega</div>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="barGenerate()" style="flex:2">🎫 Generate Barcode</button>
      <button class="btn btn-secondary" onclick="barReset()" style="flex:1">🔄 Reset</button>
    </div>
  </div>
  <div class="result-box" id="barResult"></div>
`;

window.EXTRA_TOOL_INITS['barcode-generator'] = () => {
  console.log('%c✅ Barcode Generator initialized', 'color:#10b981');
};

/* ============================================================
   GENERATE BARCODE
   ============================================================ */
window.barGenerate = function() {
  const text = document.getElementById('barInput').value.trim();

  if (!text) {
    if (typeof toast === 'function') toast('Paste URL or text first', 'error');
    return;
  }

  if (typeof JsBarcode === 'undefined') {
    if (typeof toast === 'function') toast('Library missing — refresh page', 'error');
    return;
  }

  const box = document.getElementById('barResult');
  box.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'barcode-container';
  container.style.cssText = 'padding:24px;background:#ffffff;border-radius:12px;text-align:center;margin-top:12px;overflow-x:auto;display:flex;align-items:center;justify-content:center';
  box.appendChild(container);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  container.appendChild(svg);

  // Auto format
  let format = 'CODE128';
  let finalText = text;

  if (/^\d{13}$/.test(text)) format = 'EAN13';
  else if (/^\d{12}$/.test(text)) format = 'UPC';
  else {
    format = 'CODE128';
    if (finalText.length > 80) {
      finalText = finalText.substring(0, 80);
      if (typeof toast === 'function') toast('Text truncated to 80 chars');
    }
  }

  try {
    JsBarcode(svg, finalText, {
      format: format,
      width: 1.0,
      height: 40,
      displayValue: true,
      fontSize: 11,
      margin: 20,
      background: '#ffffff',
      lineColor: '#000000'
    });
  } catch (e) {
    console.error('Barcode error:', e);
    try {
      JsBarcode(svg, text.substring(0, 80), {
        format: 'CODE128',
        width: 1.0,
        height: 40,
        displayValue: true,
        fontSize: 11,
        margin: 20
      });
    } catch (e2) {
      container.innerHTML = '<div style="color:#ef4444;padding:20px;font-size:13px">Barcode generate nahi hua. Kuch aur try karo.</div>';
      if (typeof toast === 'function') toast('Barcode failed', 'error');
      return;
    }
  }

  setTimeout(() => {
    const actions = document.createElement('div');
    actions.innerHTML = `
      <div class="export-btns no-export no-print" style="margin-top:14px">
        <button class="btn btn-secondary" onclick="barDownloadPNG()"><i>🖼️</i>HD PNG</button>
        <button class="btn btn-secondary" onclick="barDownloadSVG()"><i>📐</i>SVG</button>
        <button class="btn btn-secondary" onclick="barPrint()"><i>🖨️</i>Print</button>
      </div>`;
    box.appendChild(actions);
    box.classList.add('active');
    if (typeof toast === 'function') toast('Barcode generated ✅', 'success');
  }, 100);
};

/* ============================================================
   ULTRA HD PNG DOWNLOAD (FULL PIXEL QUALITY)
   ============================================================ */
window.barDownloadPNG = function() {
  const svg = document.querySelector('#barResult svg');
  if (!svg) { if (typeof toast === 'function') toast('Generate first', 'error'); return; }

  if (typeof toast === 'function') toast('Generating Ultra HD PNG...');

  // Get real SVG dimensions
  const svgRect = svg.getBoundingClientRect();
  const svgWidth = svgRect.width || 600;
  const svgHeight = svgRect.height || 200;

  // ULTRA HD — 10x Scale + Minimum dimensions
  const SCALE = 10;
  const MIN_WIDTH = 4000;   // Minimum 4000px width
  const MIN_HEIGHT = 1200;  // Minimum 1200px height

  const canvasWidth = Math.max(svgWidth * SCALE, MIN_WIDTH);
  const canvasHeight = Math.max(svgHeight * SCALE, MIN_HEIGHT);

  // Clone SVG with explicit dimensions
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', canvasWidth);
  clone.setAttribute('height', canvasHeight);
  clone.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Make sure all text/rects scale properly
  clone.querySelectorAll('rect').forEach(r => {
    r.setAttribute('fill', '#ffffff');
  });
  clone.querySelectorAll('text').forEach(t => {
    t.setAttribute('fill', '#000000');
    t.style.fontFamily = 'Arial, sans-serif';
    t.style.fontWeight = 'bold';
  });

  const svgData = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Pure white background (with extra padding)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Disable smoothing for CRISP barcode lines
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    // Draw at full resolution
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    URL.revokeObjectURL(url);

    // Convert to PNG with MAX quality
    const dataUrl = canvas.toDataURL('image/png', 1.0);

    const a = document.createElement('a');
    a.download = 'qunverio-barcode-' + canvasWidth + 'x' + canvasHeight + 'px-' + Date.now() + '.png';
    a.href = dataUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (typeof toast === 'function') toast('Ultra HD PNG (' + canvasWidth + '×' + canvasHeight + 'px) ✅', 'success');
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    if (typeof toast === 'function') toast('Download failed', 'error');
  };

  img.src = url;
};

/* ============================================================
   SVG DOWNLOAD (Vector — Infinite Quality)
   ============================================================ */
window.barDownloadSVG = function() {
  const svg = document.querySelector('#barResult svg');
  if (!svg) { if (typeof toast === 'function') toast('Generate first', 'error'); return; }

  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const svgData = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = 'qunverio-barcode-' + Date.now() + '.svg';
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  if (typeof toast === 'function') toast('SVG downloaded ✅ (Infinite quality)', 'success');
};

/* ============================================================
   PRINT
   ============================================================ */
window.barPrint = function() {
  const svg = document.querySelector('#barResult svg');
  if (!svg) { if (typeof toast === 'function') toast('Generate first', 'error'); return; }

  const svgData = new XMLSerializer().serializeToString(svg);
  const html = `<!DOCTYPE html>
<html><head><title>Barcode Print — Qunverio</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:30px;background:#fff}
  .header{display:flex;justify-content:space-between;align-items:center;width:100%;max-width:600px;padding-bottom:14px;border-bottom:3px solid #6366f1;margin-bottom:24px}
  .brand{font-size:24px;font-weight:900;color:#6366f1}
  .date{font-size:12px;color:#888}
  .barcode-wrap{background:#fff;padding:30px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;overflow-x:auto;max-width:100%}
  .barcode-wrap svg{max-width:100%;height:auto;display:block}
  .footer{margin-top:24px;font-size:12px;color:#888;text-align:center}
  @media print{body{padding:15px}.barcode-wrap{box-shadow:none;padding:20px}}
</style>
</head>
<body>
  <div class="header">
    <div class="brand">⚡ Qunverio</div>
    <div class="date">${new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
  </div>
  <div class="barcode-wrap">${svgData}</div>
  <div class="footer">Generated by Qunverio — qunverio.vercel.app</div>
</body>
</html>`;

  const w = window.open('', '_blank');
  if (!w) {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 600);
    return;
  }
  w.document.write(html);
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
    setTimeout(() => w.close(), 1000);
  }, 600);
};

/* ============================================================
   RESET
   ============================================================ */
window.barReset = function() {
  const input = document.getElementById('barInput');
  if (input) input.value = '';
  const box = document.getElementById('barResult');
  box.classList.remove('active');
  box.innerHTML = '';
  if (typeof toast === 'function') toast('Reset done', 'success');
};

console.log('%c✅ Barcode Generator loaded — Ultra HD PNG (4000px+) + SVG + Print', 'color:#8b5cf6;font-weight:bold;font-size:14px');