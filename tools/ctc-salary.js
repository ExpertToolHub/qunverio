/* ============================================================
   QUNVERIO — CTC → IN-HAND SALARY CALCULATOR (tools/ctc-salary.js)
   Complete Salary Calculator with Ultra HD Download
   ============================================================ */

console.log('%c💼 CTC Salary Calculator Loading...', 'color:#22c55e;font-weight:bold');

/* ============================================================
   RENDERER — Form
   ============================================================ */
window.EXTRA_TOOL_RENDERERS = window.EXTRA_TOOL_RENDERERS || {};
window.EXTRA_TOOL_INITS = window.EXTRA_TOOL_INITS || {};

window.EXTRA_TOOL_RENDERERS['ctc-salary'] = () => `
  <div class="card">
    <div class="card-title">Salary Details</div>
    <div class="field">
      <label>Annual CTC (₹)</label>
      <input type="number" id="ctcAmount" min="0" step="1000" value="600000" />
    </div>
    <div class="field-row">
      <div class="field">
        <label>Basic (% of CTC)</label>
        <input type="number" id="ctcBasicPct" min="0" max="100" step="0.5" value="40" />
      </div>
      <div class="field">
        <label>HRA (% of Basic)</label>
        <input type="number" id="ctcHraPct" min="0" max="100" step="0.5" value="50" />
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">Deductions</div>
    <div class="field-row">
      <div class="field">
        <label>Employee PF (%)</label>
        <input type="number" id="ctcPfPct" min="0" max="100" step="0.5" value="12" />
      </div>
      <div class="field">
        <label>Professional Tax (₹/yr)</label>
        <input type="number" id="ctcProfTax" min="0" step="100" value="2400" />
      </div>
    </div>
    <div class="field">
      <label>Other Deductions (₹/yr)</label>
      <input type="number" id="ctcOtherDed" min="0" step="100" value="0" />
    </div>
    <div class="field">
      <label>Estimated Income Tax (₹/yr)</label>
      <input type="number" id="ctcTax" min="0" step="1000" value="0" />
      <div class="hint">User estimate — actual tax apne CA se check karo.</div>
    </div>
  </div>

  <div class="btn-group" style="margin-bottom:14px">
    <button class="btn btn-primary" onclick="ctcCalculate()" style="flex:2">💰 Calculate</button>
    <button class="btn btn-secondary" onclick="ctcReset()" style="flex:1">🔄 Reset</button>
  </div>

  <div class="result-box" id="ctcResult"></div>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['ctc-salary'] = () => {
  console.log('%c✅ CTC Salary Calculator initialized', 'color:#10b981');
};

/* ============================================================
   CALCULATE
   ============================================================ */
window.ctcCalculate = function() {
  const ctc = Number(document.getElementById('ctcAmount').value) || 0;
  const basicPct = Number(document.getElementById('ctcBasicPct').value) || 40;
  const hraPct = Number(document.getElementById('ctcHraPct').value) || 50;
  const pfPct = Number(document.getElementById('ctcPfPct').value) || 12;
  const profTax = Number(document.getElementById('ctcProfTax').value) || 0;
  const otherDed = Number(document.getElementById('ctcOtherDed').value) || 0;
  const tax = Number(document.getElementById('ctcTax').value) || 0;

  if (ctc <= 0) {
    if (typeof toast === 'function') toast('Enter valid CTC', 'error');
    return;
  }

  // Calculations
  const basic = ctc * basicPct / 100;
  const hra = basic * hraPct / 100;
  const employerPF = basic * 12 / 100;
  const employeePF = basic * pfPct / 100;
  const specialAllowance = ctc - basic - hra - employerPF;
  const grossSalary = basic + hra + specialAllowance;
  const totalDeductions = employeePF + profTax + otherDed + tax;
  const annualInHand = grossSalary - totalDeductions;
  const monthlyInHand = annualInHand / 12;
  const monthlyGross = grossSalary / 12;
  const dedPct = grossSalary > 0 ? (totalDeductions / grossSalary * 100) : 0;

  const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const box = document.getElementById('ctcResult');
  box.innerHTML = `
    <div class="result-title">Salary Breakdown</div>
    <div class="result-main">${fmt(monthlyInHand)}</div>
    <div class="result-sub">Monthly In-Hand Salary</div>

    <div style="margin-top:20px">
      <div class="result-row"><span class="k">Annual CTC</span><span class="v">${fmt(ctc)}</span></div>
      <div class="result-row"><span class="k">Basic (${basicPct}%)</span><span class="v">${fmt(basic)}</span></div>
      <div class="result-row"><span class="k">HRA (${hraPct}%)</span><span class="v">${fmt(hra)}</span></div>
      <div class="result-row"><span class="k">Special Allowance</span><span class="v">${fmt(specialAllowance)}</span></div>
      <div class="result-row"><span class="k">Employer PF</span><span class="v">${fmt(employerPF)}</span></div>
      <div class="result-row" style="background:var(--surface-2);padding:10px 8px;margin-top:8px;border-radius:8px">
        <span class="k" style="font-weight:700">Annual Gross</span>
        <span class="v">${fmt(grossSalary)}</span>
      </div>
    </div>

    <div style="margin-top:20px">
      <div class="card-title" style="margin-bottom:10px">Deductions (Annual)</div>
      <div class="result-row"><span class="k">Employee PF</span><span class="v txn-credit">− ${fmt(employeePF)}</span></div>
      <div class="result-row"><span class="k">Professional Tax</span><span class="v txn-credit">− ${fmt(profTax)}</span></div>
      <div class="result-row"><span class="k">Other</span><span class="v txn-credit">− ${fmt(otherDed)}</span></div>
      <div class="result-row"><span class="k">Income Tax</span><span class="v txn-credit">− ${fmt(tax)}</span></div>
      <div class="result-row" style="background:var(--surface-2);padding:10px 8px;margin-top:8px;border-radius:8px">
        <span class="k" style="font-weight:700">Total Deductions</span>
        <span class="v">${fmt(totalDeductions)} (${dedPct.toFixed(1)}%)</span>
      </div>
    </div>

    <div style="margin-top:20px">
      <div class="card-title" style="margin-bottom:10px">In-Hand Summary</div>
      <div class="result-row"><span class="k">Monthly Gross</span><span class="v">${fmt(monthlyGross)}</span></div>
      <div class="result-row"><span class="k" style="font-weight:700">Monthly In-Hand</span><span class="v" style="color:var(--success)">${fmt(monthlyInHand)}</span></div>
      <div class="result-row"><span class="k" style="font-weight:700">Annual In-Hand</span><span class="v" style="color:var(--success)">${fmt(annualInHand)}</span></div>
    </div>

    <div class="how-to-use" style="margin-top:16px;font-size:12px">
      ⚠️ <strong>Disclaimer:</strong> Ye estimate hai. Official calculation ke liye apne HR/CA se check karo.
    </div>

    <div class="export-btns no-export no-print" style="margin-top:14px">
      <button class="btn btn-secondary" onclick="extraDownloadPDF('ctcResult','ctc-salary')"><i>📄</i>PDF</button>
      <button class="btn btn-secondary" onclick="extraDownloadImage('ctcResult','ctc-salary')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary" onclick="extraPrint('ctcResult','CTC → In-Hand Salary Report')"><i>🖨️</i>Print</button>
    </div>
    <div class="btn-group" style="margin-top:8px">
      <button class="btn btn-secondary btn-sm" onclick="ctcCopy()">📋 Copy</button>
      <button class="btn btn-secondary btn-sm" onclick="ctcShare()">📤 Share</button>
    </div>
  `;
  box.classList.add('active');

  // Save summary for copy/share
  window._ctcSummary = `CTC → In-Hand Salary\n\nAnnual CTC: ${fmt(ctc)}\nMonthly In-Hand: ${fmt(monthlyInHand)}\nAnnual In-Hand: ${fmt(annualInHand)}\nTotal Deductions: ${fmt(totalDeductions)} (${dedPct.toFixed(1)}%)`;
};

/* ============================================================
   RESET
   ============================================================ */
window.ctcReset = function() {
  document.getElementById('ctcAmount').value = 600000;
  document.getElementById('ctcBasicPct').value = 40;
  document.getElementById('ctcHraPct').value = 50;
  document.getElementById('ctcPfPct').value = 12;
  document.getElementById('ctcProfTax').value = 2400;
  document.getElementById('ctcOtherDed').value = 0;
  document.getElementById('ctcTax').value = 0;
  const box = document.getElementById('ctcResult');
  box.classList.remove('active');
  box.innerHTML = '';
  window._ctcSummary = '';
  if (typeof toast === 'function') toast('Reset done', 'success');
};

/* ============================================================
   COPY
   ============================================================ */
window.ctcCopy = function() {
  if (!window._ctcSummary) {
    if (typeof toast === 'function') toast('Calculate first', 'error');
    return;
  }
  navigator.clipboard.writeText(window._ctcSummary)
    .then(() => { if (typeof toast === 'function') toast('Copied!', 'success'); })
    .catch(() => { if (typeof toast === 'function') toast('Copy failed', 'error'); });
};

/* ============================================================
   SHARE
   ============================================================ */
window.ctcShare = function() {
  if (!window._ctcSummary) {
    if (typeof toast === 'function') toast('Calculate first', 'error');
    return;
  }
  if (navigator.share) {
    navigator.share({ title: 'CTC Salary Calculator', text: window._ctcSummary }).catch(() => {});
  } else {
    window.ctcCopy();
  }
};

console.log('%c✅ CTC Salary Calculator loaded — Calculate + PDF + Print ready', 'color:#22c55e;font-weight:bold;font-size:14px');