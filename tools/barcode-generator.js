/* ============================================================
   QUNVERIO — ULTRA HD BARCODE GENERATOR (FIXED)
   Full Pixel Quality + White Background + No Black Issue
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
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
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
        margin: 20,
        background: '#ffffff',
        lineColor: '#000000'
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
   ULTRA HD PNG DOWNLOAD — FIXED VERSION
   White background guaranteed + Sharp lines
   ============================================================ */
window.barDownloadPNG = function() {
  const svg = document.querySelector('#barResult svg');
  if (!svg) { if (typeof toast === 'function') toast('Generate first', 'error'); return; }

  if (typeof toast === 'function') toast('Generating Ultra HD PNG...');

  // Step 1: Get SVG dimensions
  const svgRect = svg.getBoundingClientRect();
  const origWidth = Math.max(Math.round(svgRect.width), 300);
  const origHeight = Math.max(Math.round(svgRect.height), 100);

  // Step 2: HD dimensions — 10x scale + minimum
  const SCALE = 10;
  const finalWidth = Math.max(origWidth * SCALE, 4000);
  const finalHeight = Math.max(origHeight * SCALE, 1200);

  // Step 3: Clone SVG with proper dimensions
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  clone.setAttribute('width', finalWidth);
  clone.setAttribute('height', finalHeight);
  clone.setAttribute('viewBox', '0 0 ' + origWidth + ' ' + origHeight);

  // Force white rect background inside SVG
  const existingRect = clone.querySelector('rect');
  if (existingRect) {
    existingRect.setAttribute('fill', '#ffffff');
    existingRect.setAttribute('width', origWidth);
    existingRect.setAttribute('height', origHeight);
  } else {
    const whiteRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    whiteRect.setAttribute('x', '0');
    whiteRect.setAttribute('y', '0');
    whiteRect.setAttribute('width', origWidth);
    whiteRect.setAttribute('height', origHeight);
    whiteRect.setAttribute('fill', '#ffffff');
    clone.insertBefore(whiteRect, clone.firstChild);
  }

  // Force text to be black and bold
  clone.querySelectorAll('text').forEach(t => {
    t.setAttribute('fill', '#000000');
    t.style.fontFamily = 'Arial, sans-serif';
    t.style.fontWeight = 'bold';
  });

  // Step 4: Serialize SVG
  const svgString = new XMLSerializer().serializeToString(clone);

  // Step 5: Create SVG Data URL (base64)
  let svgUrl;
  try {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    svgUrl = URL.createObjectURL(svgBlob);
  } catch (e) {
    const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    svgUrl = encoded;
  }

  // Step 6: Draw on canvas
  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d');

      // CRITICAL: White background FIRST (prevents black/transparent)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalWidth, finalHeight);

      // Then draw SVG on top
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      // Convert to PNG with MAX quality
      const pngDataUrl = canvas.toDataURL('image/png', 1.0);

      // Download
      const a = document.createElement('a');
      a.download = 'qunverio-barcode-' + finalWidth + 'x' + finalHeight + 'px.png';
      a.href = pngDataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      if (svgUrl.startsWith('blob:')) URL.revokeObjectURL(svgUrl);

      if (typeof toast === 'function') toast('Ultra HD PNG (' + finalWidth + '×' + finalHeight + ') ✅', 'success');
    } catch (err) {
      console.error('Canvas error:', err);
      if (typeof toast === 'function') toast('PNG failed — try SVG', 'error');
    }
  };

  img.onerror = (err) => {
    console.error('Image load error:', err);
    if (svgUrl.startsWith('blob:')) URL.revokeObjectURL(svgUrl);
    if (typeof toast === 'function') toast('PNG failed — try SVG button', 'error');
  };

  img.src = svgUrl;
};

/* ============================================================
   SVG DOWNLOAD (Vector — Infinite Quality, Always Works)
   ============================================================ */
window.barDownloadSVG = function() {
  const svg = document.querySelector('#barResult svg');
  if (!svg) { if (typeof toast === 'function') toast('Generate first', 'error'); return; }

  // Clone and ensure clean SVG
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Ensure white rect background
  const existingRect = clone.querySelector('rect');
  if (!existingRect) {
    const svgRect = svg.getBoundingClientRect();
    const whiteRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    whiteRect.setAttribute('x', '0');
    whiteRect.setAttribute('y', '0');
    whiteRect.setAttribute('width', Math.round(svgRect.width));
    whiteRect.setAttribute('height', Math.round(svgRect.height));
    whiteRect.setAttribute('fill', '#ffffff');
    clone.insertBefore(whiteRect, clone.firstChild);
  }

  // Force text black
  clone.querySelectorAll('text').forEach(t => {
    t.setAttribute('fill', '#000000');
    t.style.fontFamily = 'Arial, sans-serif';
    t.style.fontWeight = 'bold';
  });

  const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
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

console.log('%c✅ Barcode Generator loaded — Ultra HD PNG (Fixed) + SVG + Print', 'color:#8b5cf6;font-weight:bold;font-size:14px');