/* ============================================================
   YIELD CALCULATOR — Qunverio
   File: tools/calculator/yield-calculator.js
   Input: Total Qty, Achieved Qty
   Output: Yield Rate (%)
   ============================================================ */

window.EXTRA_TOOL_RENDERERS['yield-calculator'] = () => `
  <div class="card">
    <div class="card-title">Yield Calculator</div>
    <div class="field">
      <label>Total Quantity</label>
      <input type="number" id="ycTotalQty" placeholder="3507" step="1" min="1">
    </div>
    <div class="field">
      <label>Achieved Quantity</label>
      <input type="number" id="ycAchQty" placeholder="3500" step="1" min="0">
    </div>
    <button class="btn btn-primary btn-block" onclick="yieldCalculate()">📊 Calculate Yield</button>
  </div>

  <div class="result-box" id="yieldResult">
    <div class="result-title">Yield Result</div>
    <div class="result-main" id="yieldMain">0.00%</div>
    <div class="result-sub" id="yieldSub">Yield Rate</div>

    <div class="result-row">
      <span class="k">Total Quantity</span>
      <span class="v" id="yieldTotalShow">0</span>
    </div>
    <div class="result-row">
      <span class="k">Achieved Quantity</span>
      <span class="v" id="yieldAchShow">0</span>
    </div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px">
      <span class="k" style="color:#fff">Yield Rate</span>
      <span class="v" id="yieldPctShow" style="color:#10b981">0.00%</span>
    </div>

    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('yieldResult','yield-calculation')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('yieldResult','yield-calculation')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('yieldResult','Yield Calculation')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;

window.EXTRA_TOOL_INITS['yield-calculator'] = () => {
  console.log('✅ Yield Calculator ready');
};

window.yieldCalculate = function() {
  const total = parseFloat(document.getElementById('ycTotalQty').value);
  const achieved = parseFloat(document.getElementById('ycAchQty').value);

  if (!total || total <= 0) { toast('Enter valid Total Qty', 'error'); return; }
  if (isNaN(achieved) || achieved < 0) { toast('Enter valid Achieved Qty', 'error'); return; }
  if (achieved > total) { toast('Achieved Qty cannot be more than Total Qty', 'error'); return; }

  const yieldPct = (achieved / total) * 100;

  const fmtNum = (n) => n.toLocaleString('en-IN');

  document.getElementById('yieldMain').textContent = yieldPct.toFixed(2) + '%';
  document.getElementById('yieldSub').textContent = 'Yield Rate';
  document.getElementById('yieldTotalShow').textContent = fmtNum(total);
  document.getElementById('yieldAchShow').textContent = fmtNum(achieved);

  const pctEl = document.getElementById('yieldPctShow');
  pctEl.textContent = yieldPct.toFixed(2) + '%';

  // Color based on yield
  let color = '#10b981'; // green
  if (yieldPct < 95) color = '#ef4444';       // red
  else if (yieldPct < 99) color = '#f59e0b';  // orange
  pctEl.style.color = color;

  document.getElementById('yieldResult').classList.add('active');
  toast('Yield calculated ✅', 'success');
};

console.log('✅ Yield Calculator loaded');