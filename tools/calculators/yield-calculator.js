/* ============================================================
   PRODUCTION YIELD CALCULATOR — Qunverio
   File: tools/calculators/yield-calculator.js
   Input: Total Qty, Achieved Qty
   Output: Yield Rate (%)
   ============================================================ */

window.EXTRA_TOOL_RENDERERS['production-yield-calculator'] = () => `
  <div class="card">
    <div class="card-title">Production Yield Calculator</div>
    <div class="field">
      <label>Total Quantity</label>
      <input type="number" id="pyTotalQty" placeholder="3507" step="1" min="1">
    </div>
    <div class="field">
      <label>Achieved Quantity</label>
      <input type="number" id="pyAchQty" placeholder="3500" step="1" min="0">
    </div>
    <button class="btn btn-primary btn-block" onclick="productionYieldCalculate()">📊 Calculate Yield</button>
  </div>

  <div class="result-box" id="pyResult">
    <div class="result-title">Yield Result</div>
    <div class="result-main" id="pyMain">0.00%</div>
    <div class="result-sub" id="pySub">Yield Rate</div>

    <div class="result-row">
      <span class="k">Total Quantity</span>
      <span class="v" id="pyTotalShow">0</span>
    </div>
    <div class="result-row">
      <span class="k">Achieved Quantity</span>
      <span class="v" id="pyAchShow">0</span>
    </div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px">
      <span class="k" style="color:#fff">Yield Rate</span>
      <span class="v" id="pyPctShow" style="color:#10b981">0.00%</span>
    </div>

    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('pyResult','production-yield')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('pyResult','production-yield')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('pyResult','Production Yield')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;

window.EXTRA_TOOL_INITS['production-yield-calculator'] = () => {
  console.log('✅ Production Yield Calculator ready');
};

window.productionYieldCalculate = function() {
  const total = parseFloat(document.getElementById('pyTotalQty').value);
  const achieved = parseFloat(document.getElementById('pyAchQty').value);

  if (!total || total <= 0) { toast('Enter valid Total Qty', 'error'); return; }
  if (isNaN(achieved) || achieved < 0) { toast('Enter valid Achieved Qty', 'error'); return; }
  if (achieved > total) { toast('Achieved Qty cannot be more than Total Qty', 'error'); return; }

  const yieldPct = (achieved / total) * 100;
  const fmtNum = (n) => n.toLocaleString('en-IN');

  document.getElementById('pyMain').textContent = yieldPct.toFixed(2) + '%';
  document.getElementById('pySub').textContent = 'Yield Rate';
  document.getElementById('pyTotalShow').textContent = fmtNum(total);
  document.getElementById('pyAchShow').textContent = fmtNum(achieved);

  const pctEl = document.getElementById('pyPctShow');
  pctEl.textContent = yieldPct.toFixed(2) + '%';

  let color = '#10b981';
  if (yieldPct < 95) color = '#ef4444';
  else if (yieldPct < 99) color = '#f59e0b';
  pctEl.style.color = color;

  document.getElementById('pyResult').classList.add('active');
  toast('Yield calculated ✅', 'success');
};

console.log('✅ Production Yield Calculator loaded');