/* Barcode Generator */
window.EXTRA_TOOL_RENDERERS['barcode-generator'] = () => `
  <div class="card">
    <div class="card-title">Barcode Generator</div>
    <div class="field">
      <label>Barcode Text/Number</label>
      <input type="text" id="barInput" placeholder="123456789012" maxlength="60" />
    </div>
    <div class="field">
      <label>Format</label>
      <select id="barFormat">
        <option value="CODE128">CODE128 (any text)</option>
        <option value="EAN13">EAN13 (13 digits)</option>
        <option value="UPC">UPC (12 digits)</option>
        <option value="CODE39">CODE39</option>
      </select>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="barGenerate()" style="flex:2">🎫 Generate</button>
      <button class="btn btn-secondary" onclick="barReset()" style="flex:1">🔄 Reset</button>
    </div>
  </div>
  <div class="result-box" id="barResult"></div>
`;

window.EXTRA_TOOL_INITS['barcode-generator'] = () => {
  console.log('%c✅ Barcode Generator loaded', 'color:#10b981');
};

window.barGenerate = function() {
  const text = document.getElementById('barInput').value.trim();
  if (!text) { if (typeof toast === 'function') toast('Enter text first', 'error'); return; }
  const format = document.getElementById('barFormat').value;
  const box = document.getElementById('barResult');
  box.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'barcode-container';
  container.style.cssText = 'padding:22px;background:#ffffff;border-radius:12px;text-align:center;margin-top:12px';
  box.appendChild(container);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  container.appendChild(svg);
  try {
    JsBarcode(svg, text, { format, width: 2, height: 80, displayValue: true, fontSize: 14, margin: 10 });
  } catch(e) {
    container.innerHTML = '<div style="color:#ef4444;padding:20px">Invalid input for ' + format + '</div>';
    if (typeof toast === 'function') toast('Barcode failed', 'error');
    return;
  }
  setTimeout(() => {
    const actions = document.createElement('div');
    actions.innerHTML = `
      <div class="export-btns no-export no-print" style="margin-top:14px">
        <button class="btn btn-secondary" onclick="barDownloadPNG()"><i>🖼️</i>PNG</button>
        <button class="btn btn-secondary" onclick="barPrint()"><i>🖨️</i>Print</button>
      </div>`;
    box.appendChild(actions);
    box.classList.add('active');
  }, 100);
};

window.barDownloadPNG = function() {
  const svg = document.querySelector('#barResult svg');
  if (!svg) { if (typeof toast === 'function') toast('Generate first', 'error'); return; }
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width * 4;
    canvas.height = img.height * 4;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const a = document.createElement('a');
    a.download = 'barcode.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
    if (typeof toast === 'function') toast('Barcode downloaded ✅', 'success');
  };
  img.src = url;
};

window.barPrint = function() {
  const svg = document.querySelector('#barResult svg');
  if (!svg) return;
  const svgData = new XMLSerializer().serializeToString(svg);
  const html = `<!DOCTYPE html><html><head><title>Barcode</title><style>
    body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fff}
    svg{max-width:90%;height:auto}
  </style></head><body>${svgData}</body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html); w.document.close();
  setTimeout(() => { w.print(); w.close(); }, 500);
};

window.barReset = function() {
  document.getElementById('barInput').value = '';
  const box = document.getElementById('barResult');
  box.classList.remove('active');
  box.innerHTML = '';
  if (typeof toast === 'function') toast('Reset done', 'success');
};