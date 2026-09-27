/* ============================================================
   QUNVERIO — ALL CALCULATORS
   File: tools/calculators/all.js
   24 Calculators — Sab ek file me
   ============================================================ */

console.log('%c🚀 Loading All Calculators...', 'color:#6366f1;font-weight:bold;font-size:14px');

/* ============================================================
   1. GST CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['gst-calculator'] = () => `
  <div class="card">
    <div class="card-title">GST Calculation</div>
    <div class="field"><label>Amount (₹)</label><input type="number" id="gstAmount" placeholder="10000" min="0" step="0.01"></div>
    <div class="field"><label>GST Rate (%)</label>
      <select id="gstRate">
        <option value="5">5% (Essential Items)</option>
        <option value="12">12% (Standard)</option>
        <option value="18" selected>18% (Most Common)</option>
        <option value="28">28% (Luxury)</option>
      </select>
    </div>
    <div class="field"><label>GST Type</label>
      <select id="gstType">
        <option value="exclusive" selected>Add GST (Exclusive)</option>
        <option value="inclusive">Remove GST (Inclusive)</option>
      </select>
    </div>
    <button class="btn btn-primary btn-block" onclick="gstCalculate()">📊 Calculate GST</button>
  </div>
  <div class="result-box" id="gstResult">
    <div class="result-title">GST Calculation Result</div>
    <div class="result-main" id="gstMain">₹0.00</div>
    <div class="result-sub" id="gstSub">Total amount</div>
    <div class="result-row"><span class="k">Base Amount</span><span class="v" id="gstBase">₹0</span></div>
    <div class="result-row"><span class="k">GST Rate</span><span class="v" id="gstRateShow">18%</span></div>
    <div class="result-row"><span class="k">GST Amount</span><span class="v" id="gstAmountShow">₹0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Total Amount</span><span class="v" id="gstTotal" style="color:#fff">₹0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('gstResult','gst-calculation')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('gstResult','gst-calculation')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('gstResult','GST Calculation')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['gst-calculator'] = () => { console.log('✅ GST Calculator ready'); };
window.gstCalculate = function() {
  const amount = parseFloat(document.getElementById('gstAmount').value);
  const rate = parseFloat(document.getElementById('gstRate').value);
  const type = document.getElementById('gstType').value;
  if (!amount || amount <= 0) { toast('Enter a valid amount', 'error'); return; }
  let base, gstAmount, total;
  if (type === 'exclusive') { base = amount; gstAmount = (amount * rate) / 100; total = base + gstAmount; }
  else { total = amount; base = (amount * 100) / (100 + rate); gstAmount = total - base; }
  const fmt = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('gstMain').textContent = fmt(total);
  document.getElementById('gstSub').textContent = type === 'exclusive' ? 'Total (Base + GST)' : 'Base Amount';
  document.getElementById('gstBase').textContent = fmt(base);
  document.getElementById('gstRateShow').textContent = rate + '%';
  document.getElementById('gstAmountShow').textContent = fmt(gstAmount);
  document.getElementById('gstTotal').textContent = fmt(total);
  document.getElementById('gstResult').classList.add('active');
  toast('GST calculated ✅', 'success');
};

/* ============================================================
   2. AGE CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['age-calculator'] = () => `
  <div class="card">
    <div class="card-title">Age Calculation</div>
    <div class="field"><label>Date of Birth</label><input type="date" id="ageDob"></div>
    <div class="field"><label>Calculate Age As On</label><input type="date" id="ageAsOn"></div>
    <button class="btn btn-primary btn-block" onclick="ageCalculate()">🎂 Calculate Age</button>
  </div>
  <div class="result-box" id="ageResult">
    <div class="result-title">Age Result</div>
    <div class="result-main" id="ageMain">0 Years</div>
    <div class="result-sub" id="ageSub">Calculate karo</div>
    <div class="result-row"><span class="k">Years</span><span class="v" id="ageYears">0</span></div>
    <div class="result-row"><span class="k">Months</span><span class="v" id="ageMonths">0</span></div>
    <div class="result-row"><span class="k">Days</span><span class="v" id="ageDays">0</span></div>
    <div class="result-row"><span class="k">Total Days</span><span class="v" id="ageTotalDays">0</span></div>
    <div class="result-row"><span class="k">Total Hours</span><span class="v" id="ageTotalHours">0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Next Birthday In</span><span class="v" id="ageNextBday" style="color:#fff">0 days</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('ageResult','age-calculation')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('ageResult','age-calculation')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('ageResult','Age Calculation')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['age-calculator'] = () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('ageAsOn').value = today;
  console.log('✅ Age Calculator ready');
};
window.ageCalculate = function() {
  const dob = new Date(document.getElementById('ageDob').value);
  const asOn = new Date(document.getElementById('ageAsOn').value);
  if (!dob || !asOn || dob > asOn) { toast('Enter valid dates', 'error'); return; }
  let years = asOn.getFullYear() - dob.getFullYear();
  let months = asOn.getMonth() - dob.getMonth();
  let days = asOn.getDate() - dob.getDate();
  if (days < 0) { months--; days += new Date(asOn.getFullYear(), asOn.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  const totalDays = Math.floor((asOn - dob) / (1000 * 60 * 60 * 24));
  const totalHours = totalDays * 24;
  let nextBday = new Date(asOn.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBday < asOn) nextBday.setFullYear(nextBday.getFullYear() + 1);
  const nextBdayDays = Math.ceil((nextBday - asOn) / (1000 * 60 * 60 * 24));
  document.getElementById('ageMain').textContent = years + ' Years ' + months + ' Months';
  document.getElementById('ageSub').textContent = years + 'y ' + months + 'm ' + days + 'd';
  document.getElementById('ageYears').textContent = years;
  document.getElementById('ageMonths').textContent = months;
  document.getElementById('ageDays').textContent = days;
  document.getElementById('ageTotalDays').textContent = totalDays.toLocaleString('en-IN');
  document.getElementById('ageTotalHours').textContent = totalHours.toLocaleString('en-IN');
  document.getElementById('ageNextBday').textContent = nextBdayDays + ' days';
  document.getElementById('ageResult').classList.add('active');
  toast('Age calculated ✅', 'success');
};

/* ============================================================
   3. PERCENTAGE CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['percentage-calculator'] = () => `
  <div class="card">
    <div class="card-title">Percentage Calculator</div>
    <div class="field"><label>What is X% of Y?</label>
      <div class="field-row">
        <input type="number" id="pct1X" placeholder="X (%)" step="0.01">
        <input type="number" id="pct1Y" placeholder="Y (value)" step="0.01">
      </div>
    </div>
    <button class="btn btn-primary btn-block" onclick="pctCalc1()">Calculate</button>
    <div class="result-box" id="pct1Result" style="margin-top:12px">
      <div class="result-main" id="pct1Main">0</div>
      <div class="result-sub" id="pct1Sub">Result</div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">X is what % of Y?</div>
    <div class="field-row">
      <input type="number" id="pct2X" placeholder="X" step="0.01">
      <input type="number" id="pct2Y" placeholder="Y" step="0.01">
    </div>
    <button class="btn btn-primary btn-block" onclick="pctCalc2()">Calculate</button>
    <div class="result-box" id="pct2Result" style="margin-top:12px">
      <div class="result-main" id="pct2Main">0%</div>
      <div class="result-sub" id="pct2Sub">Percentage</div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Percentage Increase / Decrease</div>
    <div class="field-row">
      <input type="number" id="pct3From" placeholder="From" step="0.01">
      <input type="number" id="pct3To" placeholder="To" step="0.01">
    </div>
    <button class="btn btn-primary btn-block" onclick="pctCalc3()">Calculate</button>
    <div class="result-box" id="pct3Result" style="margin-top:12px">
      <div class="result-main" id="pct3Main">0%</div>
      <div class="result-sub" id="pct3Sub">Change</div>
      <div class="export-btns">
        <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('pct3Result','percentage')"><i>📥</i>PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('pct3Result','percentage')"><i>🖼️</i>Image</button>
        <button class="btn btn-secondary btn-sm" onclick="extraPrint('pct3Result','Percentage')"><i>🖨️</i>Print</button>
      </div>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['percentage-calculator'] = () => { console.log('✅ Percentage Calculator ready'); };
window.pctCalc1 = function() {
  const x = parseFloat(document.getElementById('pct1X').value);
  const y = parseFloat(document.getElementById('pct1Y').value);
  if (isNaN(x) || isNaN(y)) { toast('Enter both values', 'error'); return; }
  const r = (x * y) / 100;
  document.getElementById('pct1Main').textContent = r.toLocaleString('en-IN', { maximumFractionDigits: 4 });
  document.getElementById('pct1Sub').textContent = x + '% of ' + y + ' = ' + r.toLocaleString('en-IN');
  document.getElementById('pct1Result').classList.add('active');
  toast('Calculated ✅', 'success');
};
window.pctCalc2 = function() {
  const x = parseFloat(document.getElementById('pct2X').value);
  const y = parseFloat(document.getElementById('pct2Y').value);
  if (isNaN(x) || isNaN(y) || y === 0) { toast('Enter valid values', 'error'); return; }
  const r = (x / y) * 100;
  document.getElementById('pct2Main').textContent = r.toLocaleString('en-IN', { maximumFractionDigits: 4 }) + '%';
  document.getElementById('pct2Sub').textContent = x + ' is ' + r.toLocaleString('en-IN', { maximumFractionDigits: 4 }) + '% of ' + y;
  document.getElementById('pct2Result').classList.add('active');
  toast('Calculated ✅', 'success');
};
window.pctCalc3 = function() {
  const from = parseFloat(document.getElementById('pct3From').value);
  const to = parseFloat(document.getElementById('pct3To').value);
  if (isNaN(from) || isNaN(to) || from === 0) { toast('Enter valid values', 'error'); return; }
  const change = ((to - from) / Math.abs(from)) * 100;
  const dir = change >= 0 ? 'Increase' : 'Decrease';
  document.getElementById('pct3Main').textContent = Math.abs(change).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + '% ' + dir;
  document.getElementById('pct3Sub').textContent = 'From ' + from + ' to ' + to;
  document.getElementById('pct3Result').classList.add('active');
  toast('Calculated ✅', 'success');
};

/* ============================================================
   4. DISCOUNT CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['discount-calculator'] = () => `
  <div class="card">
    <div class="card-title">Discount Calculation</div>
    <div class="field"><label>Original Price (₹)</label><input type="number" id="discPrice" placeholder="1000" step="0.01"></div>
    <div class="field"><label>Discount (%)</label><input type="number" id="discPercent" placeholder="20" step="0.01"></div>
    <div class="field"><label>Additional Discount (%) — Optional</label><input type="number" id="discExtra" placeholder="0" step="0.01"></div>
    <button class="btn btn-primary btn-block" onclick="discCalculate()">💰 Calculate Discount</button>
  </div>
  <div class="result-box" id="discResult">
    <div class="result-title">Discount Result</div>
    <div class="result-main" id="discMain">₹0.00</div>
    <div class="result-sub" id="discSub">You Pay</div>
    <div class="result-row"><span class="k">Original Price</span><span class="v" id="discOriginal">₹0</span></div>
    <div class="result-row"><span class="k">Discount Amount</span><span class="v" id="discSave" style="color:#10b981">- ₹0</span></div>
    <div class="result-row"><span class="k">You Saved</span><span class="v" id="discSavedPct">0%</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Final Price</span><span class="v" id="discFinal" style="color:#fff">₹0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('discResult','discount')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('discResult','discount')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('discResult','Discount')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['discount-calculator'] = () => { console.log('✅ Discount Calculator ready'); };
window.discCalculate = function() {
  const price = parseFloat(document.getElementById('discPrice').value);
  const pct = parseFloat(document.getElementById('discPercent').value) || 0;
  const extra = parseFloat(document.getElementById('discExtra').value) || 0;
  if (!price || price <= 0) { toast('Enter valid price', 'error'); return; }
  const priceAfterFirst = price - (price * pct / 100);
  const finalPrice = priceAfterFirst - (priceAfterFirst * extra / 100);
  const totalDiscount = price - finalPrice;
  const savedPct = (totalDiscount / price) * 100;
  const fmt = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('discMain').textContent = fmt(finalPrice);
  document.getElementById('discSub').textContent = 'Final price after discount';
  document.getElementById('discOriginal').textContent = fmt(price);
  document.getElementById('discSave').textContent = '- ' + fmt(totalDiscount);
  document.getElementById('discSavedPct').textContent = savedPct.toFixed(2) + '%';
  document.getElementById('discFinal').textContent = fmt(finalPrice);
  document.getElementById('discResult').classList.add('active');
  toast('Discount calculated ✅', 'success');
};

/* ============================================================
   5. BMI CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['bmi-calculator'] = () => `
  <div class="card">
    <div class="card-title">BMI Calculator</div>
    <div class="field"><label>Weight (kg)</label><input type="number" id="bmiWeight" placeholder="70" step="0.1"></div>
    <div class="field"><label>Height (cm)</label><input type="number" id="bmiHeight" placeholder="170" step="0.1"></div>
    <button class="btn btn-primary btn-block" onclick="bmiCalculate()">⚖️ Calculate BMI</button>
  </div>
  <div class="result-box" id="bmiResult">
    <div class="result-title">BMI Result</div>
    <div class="result-main" id="bmiMain">0.00</div>
    <div class="result-sub" id="bmiCategory">Enter your details</div>
    <div class="result-row"><span class="k">Weight</span><span class="v" id="bmiWeightShow">0 kg</span></div>
    <div class="result-row"><span class="k">Height</span><span class="v" id="bmiHeightShow">0 cm</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Category</span><span class="v" id="bmiCatFinal" style="color:#fff">—</span></div>
    <div style="margin-top:12px;padding:10px;background:var(--surface-2);border-radius:8px;font-size:12px;line-height:1.7">
      <strong>Categories:</strong><br>
      Underweight: &lt; 18.5<br>
      Normal: 18.5 – 24.9<br>
      Overweight: 25 – 29.9<br>
      Obese: ≥ 30
    </div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('bmiResult','bmi')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('bmiResult','bmi')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('bmiResult','BMI Result')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['bmi-calculator'] = () => { console.log('✅ BMI Calculator ready'); };
window.bmiCalculate = function() {
  const weight = parseFloat(document.getElementById('bmiWeight').value);
  const height = parseFloat(document.getElementById('bmiHeight').value) / 100;
  if (!weight || !height || weight <= 0 || height <= 0) { toast('Enter valid details', 'error'); return; }
  const bmi = weight / (height * height);
  let cat, color;
  if (bmi < 18.5) { cat = 'Underweight'; color = '#f59e0b'; }
  else if (bmi < 25) { cat = 'Normal Weight ✅'; color = '#10b981'; }
  else if (bmi < 30) { cat = 'Overweight'; color = '#f59e0b'; }
  else { cat = 'Obese'; color = '#ef4444'; }
  document.getElementById('bmiMain').textContent = bmi.toFixed(2);
  document.getElementById('bmiCategory').textContent = cat;
  document.getElementById('bmiWeightShow').textContent = weight + ' kg';
  document.getElementById('bmiHeightShow').textContent = (height * 100).toFixed(1) + ' cm';
  document.getElementById('bmiCatFinal').textContent = cat;
  document.getElementById('bmiCatFinal').style.color = color;
  document.getElementById('bmiResult').classList.add('active');
  toast('BMI calculated ✅', 'success');
};

console.log('%c✅ Part 1 loaded — 5 calculators', 'color:#10b981;font-weight:bold');

/* ============================================================
   6. SIP CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['sip-calculator'] = () => `
  <div class="card">
    <div class="card-title">SIP Calculator</div>
    <div class="field"><label>Monthly Investment (₹)</label><input type="number" id="sipMonthly" placeholder="5000" step="100"></div>
    <div class="field"><label>Expected Return Rate (% per year)</label><input type="number" id="sipRate" placeholder="12" step="0.1"></div>
    <div class="field"><label>Time Period (Years)</label><input type="number" id="sipYears" placeholder="10" step="0.5"></div>
    <button class="btn btn-primary btn-block" onclick="sipCalculate()">📈 Calculate SIP</button>
  </div>
  <div class="result-box" id="sipResult">
    <div class="result-title">SIP Result</div>
    <div class="result-main" id="sipMain">₹0</div>
    <div class="result-sub" id="sipSub">Maturity Amount</div>
    <div class="result-row"><span class="k">Invested Amount</span><span class="v" id="sipInvested">₹0</span></div>
    <div class="result-row"><span class="k">Estimated Returns</span><span class="v" id="sipReturns" style="color:#10b981">₹0</span></div>
    <div class="result-row"><span class="k">Total Value</span><span class="v" id="sipTotal">₹0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Wealth Gained</span><span class="v" id="sipWealth" style="color:#10b981">0%</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('sipResult','sip')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('sipResult','sip')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('sipResult','SIP Result')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['sip-calculator'] = () => { console.log('✅ SIP Calculator ready'); };
window.sipCalculate = function() {
  const monthly = parseFloat(document.getElementById('sipMonthly').value);
  const rate = parseFloat(document.getElementById('sipRate').value);
  const years = parseFloat(document.getElementById('sipYears').value);
  if (!monthly || !rate || !years || monthly <= 0 || years <= 0) { toast('Enter valid values', 'error'); return; }
  const months = years * 12;
  const monthlyRate = rate / 12 / 100;
  const maturity = monthly * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  const invested = monthly * months;
  const returns = maturity - invested;
  const wealthPct = (returns / invested) * 100;
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('sipMain').textContent = fmt(maturity);
  document.getElementById('sipSub').textContent = 'Maturity Amount (after ' + years + ' years)';
  document.getElementById('sipInvested').textContent = fmt(invested);
  document.getElementById('sipReturns').textContent = fmt(returns);
  document.getElementById('sipTotal').textContent = fmt(maturity);
  document.getElementById('sipWealth').textContent = wealthPct.toFixed(1) + '%';
  document.getElementById('sipResult').classList.add('active');
  toast('SIP calculated ✅', 'success');
};

/* ============================================================
   7. EMI / LOAN CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['emi-calculator'] = () => `
  <div class="card">
    <div class="card-title">EMI / Loan Calculator</div>
    <div class="field"><label>Loan Amount (₹)</label><input type="number" id="emiAmount" placeholder="500000" step="1000"></div>
    <div class="field"><label>Interest Rate (% per year)</label><input type="number" id="emiRate" placeholder="9" step="0.1"></div>
    <div class="field"><label>Loan Tenure (Years)</label><input type="number" id="emiYears" placeholder="5" step="0.5"></div>
    <button class="btn btn-primary btn-block" onclick="emiCalculate()">🏦 Calculate EMI</button>
  </div>
  <div class="result-box" id="emiResult">
    <div class="result-title">EMI Result</div>
    <div class="result-main" id="emiMain">₹0</div>
    <div class="result-sub" id="emiSub">Monthly EMI</div>
    <div class="result-row"><span class="k">Principal Amount</span><span class="v" id="emiPrincipal">₹0</span></div>
    <div class="result-row"><span class="k">Total Interest</span><span class="v" id="emiInterest" style="color:#f59e0b">₹0</span></div>
    <div class="result-row"><span class="k">Total Payment</span><span class="v" id="emiTotal">₹0</span></div>
    <div class="result-row"><span class="k">Total Months</span><span class="v" id="emiMonths">0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Interest % of Principal</span><span class="v" id="emiIntPct" style="color:#f59e0b">0%</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('emiResult','emi')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('emiResult','emi')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('emiResult','EMI Result')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['emi-calculator'] = () => { console.log('✅ EMI Calculator ready'); };
window.emiCalculate = function() {
  const amount = parseFloat(document.getElementById('emiAmount').value);
  const rate = parseFloat(document.getElementById('emiRate').value);
  const years = parseFloat(document.getElementById('emiYears').value);
  if (!amount || !rate || !years || amount <= 0 || rate <= 0 || years <= 0) { toast('Enter valid values', 'error'); return; }
  const months = years * 12;
  const monthlyRate = rate / 12 / 100;
  const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - amount;
  const intPct = (totalInterest / amount) * 100;
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('emiMain').textContent = fmt(emi);
  document.getElementById('emiSub').textContent = 'Monthly EMI for ' + years + ' years';
  document.getElementById('emiPrincipal').textContent = fmt(amount);
  document.getElementById('emiInterest').textContent = fmt(totalInterest);
  document.getElementById('emiTotal').textContent = fmt(totalPayment);
  document.getElementById('emiMonths').textContent = months;
  document.getElementById('emiIntPct').textContent = intPct.toFixed(1) + '%';
  document.getElementById('emiResult').classList.add('active');
  toast('EMI calculated ✅', 'success');
};

/* ============================================================
   8. FD CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['fd-calculator'] = () => `
  <div class="card">
    <div class="card-title">Fixed Deposit Calculator</div>
    <div class="field"><label>Principal Amount (₹)</label><input type="number" id="fdAmount" placeholder="100000" step="1000"></div>
    <div class="field"><label>Interest Rate (% per year)</label><input type="number" id="fdRate" placeholder="7" step="0.1"></div>
    <div class="field"><label>Tenure (Years)</label><input type="number" id="fdYears" placeholder="5" step="0.5"></div>
    <div class="field"><label>Compounding Frequency</label>
      <select id="fdFreq">
        <option value="1">Yearly</option>
        <option value="2">Half-Yearly</option>
        <option value="4" selected>Quarterly</option>
        <option value="12">Monthly</option>
      </select>
    </div>
    <button class="btn btn-primary btn-block" onclick="fdCalculate()">🏦 Calculate FD</button>
  </div>
  <div class="result-box" id="fdResult">
    <div class="result-title">FD Result</div>
    <div class="result-main" id="fdMain">₹0</div>
    <div class="result-sub" id="fdSub">Maturity Amount</div>
    <div class="result-row"><span class="k">Principal</span><span class="v" id="fdPrincipal">₹0</span></div>
    <div class="result-row"><span class="k">Interest Earned</span><span class="v" id="fdInterest" style="color:#10b981">₹0</span></div>
    <div class="result-row"><span class="k">Tenure</span><span class="v" id="fdTenure">0 years</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Maturity Amount</span><span class="v" id="fdMaturity" style="color:#fff">₹0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('fdResult','fd')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('fdResult','fd')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('fdResult','FD Result')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['fd-calculator'] = () => { console.log('✅ FD Calculator ready'); };
window.fdCalculate = function() {
  const amount = parseFloat(document.getElementById('fdAmount').value);
  const rate = parseFloat(document.getElementById('fdRate').value);
  const years = parseFloat(document.getElementById('fdYears').value);
  const freq = parseInt(document.getElementById('fdFreq').value);
  if (!amount || !rate || !years || amount <= 0 || rate <= 0 || years <= 0) { toast('Enter valid values', 'error'); return; }
  const maturity = amount * Math.pow(1 + (rate / 100) / freq, freq * years);
  const interest = maturity - amount;
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('fdMain').textContent = fmt(maturity);
  document.getElementById('fdSub').textContent = 'After ' + years + ' years';
  document.getElementById('fdPrincipal').textContent = fmt(amount);
  document.getElementById('fdInterest').textContent = fmt(interest);
  document.getElementById('fdTenure').textContent = years + ' years';
  document.getElementById('fdMaturity').textContent = fmt(maturity);
  document.getElementById('fdResult').classList.add('active');
  toast('FD calculated ✅', 'success');
};

/* ============================================================
   9. SIMPLE INTEREST CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['simple-interest-calculator'] = () => `
  <div class="card">
    <div class="card-title">Simple Interest Calculator</div>
    <div class="field"><label>Principal (₹)</label><input type="number" id="siPrincipal" placeholder="10000" step="100"></div>
    <div class="field"><label>Rate (% per year)</label><input type="number" id="siRate" placeholder="8" step="0.1"></div>
    <div class="field"><label>Time (Years)</label><input type="number" id="siTime" placeholder="3" step="0.1"></div>
    <button class="btn btn-primary btn-block" onclick="siCalculate()">💵 Calculate</button>
  </div>
  <div class="result-box" id="siResult">
    <div class="result-title">Simple Interest Result</div>
    <div class="result-main" id="siMain">₹0</div>
    <div class="result-sub">Total Amount (Principal + Interest)</div>
    <div class="result-row"><span class="k">Principal</span><span class="v" id="siPrincipalShow">₹0</span></div>
    <div class="result-row"><span class="k">Interest Earned</span><span class="v" id="siInterest" style="color:#10b981">₹0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Total Amount</span><span class="v" id="siTotal" style="color:#fff">₹0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('siResult','simple-interest')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('siResult','simple-interest')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('siResult','Simple Interest')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['simple-interest-calculator'] = () => { console.log('✅ Simple Interest Calculator ready'); };
window.siCalculate = function() {
  const p = parseFloat(document.getElementById('siPrincipal').value);
  const r = parseFloat(document.getElementById('siRate').value);
  const t = parseFloat(document.getElementById('siTime').value);
  if (!p || !r || !t || p <= 0) { toast('Enter valid values', 'error'); return; }
  const si = (p * r * t) / 100;
  const total = p + si;
  const fmt = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('siMain').textContent = fmt(total);
  document.getElementById('siPrincipalShow').textContent = fmt(p);
  document.getElementById('siInterest').textContent = fmt(si);
  document.getElementById('siTotal').textContent = fmt(total);
  document.getElementById('siResult').classList.add('active');
  toast('Simple Interest calculated ✅', 'success');
};

/* ============================================================
   10. COMPOUND INTEREST CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['compound-interest-calculator'] = () => `
  <div class="card">
    <div class="card-title">Compound Interest Calculator</div>
    <div class="field"><label>Principal (₹)</label><input type="number" id="ciPrincipal" placeholder="10000" step="100"></div>
    <div class="field"><label>Rate (% per year)</label><input type="number" id="ciRate" placeholder="8" step="0.1"></div>
    <div class="field"><label>Time (Years)</label><input type="number" id="ciTime" placeholder="5" step="0.5"></div>
    <div class="field"><label>Compounding</label>
      <select id="ciFreq">
        <option value="1" selected>Yearly</option>
        <option value="2">Half-Yearly</option>
        <option value="4">Quarterly</option>
        <option value="12">Monthly</option>
      </select>
    </div>
    <button class="btn btn-primary btn-block" onclick="ciCalculate()">📊 Calculate</button>
  </div>
  <div class="result-box" id="ciResult">
    <div class="result-title">Compound Interest Result</div>
    <div class="result-main" id="ciMain">₹0</div>
    <div class="result-sub">Total Amount</div>
    <div class="result-row"><span class="k">Principal</span><span class="v" id="ciPrincipalShow">₹0</span></div>
    <div class="result-row"><span class="k">Interest Earned</span><span class="v" id="ciInterest" style="color:#10b981">₹0</span></div>
    <div class="result-row"><span class="k">Effective Return</span><span class="v" id="ciReturn">0%</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Total Amount</span><span class="v" id="ciTotal" style="color:#fff">₹0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('ciResult','compound-interest')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('ciResult','compound-interest')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('ciResult','Compound Interest')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['compound-interest-calculator'] = () => { console.log('✅ Compound Interest Calculator ready'); };
window.ciCalculate = function() {
  const p = parseFloat(document.getElementById('ciPrincipal').value);
  const r = parseFloat(document.getElementById('ciRate').value);
  const t = parseFloat(document.getElementById('ciTime').value);
  const n = parseInt(document.getElementById('ciFreq').value);
  if (!p || !r || !t || p <= 0) { toast('Enter valid values', 'error'); return; }
  const total = p * Math.pow(1 + (r / 100) / n, n * t);
  const interest = total - p;
  const returnPct = (interest / p) * 100;
  const fmt = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('ciMain').textContent = fmt(total);
  document.getElementById('ciPrincipalShow').textContent = fmt(p);
  document.getElementById('ciInterest').textContent = fmt(interest);
  document.getElementById('ciReturn').textContent = returnPct.toFixed(2) + '%';
  document.getElementById('ciTotal').textContent = fmt(total);
  document.getElementById('ciResult').classList.add('active');
  toast('Compound Interest calculated ✅', 'success');
};

console.log('%c✅ Part 2 loaded — 10 calculators total', 'color:#10b981;font-weight:bold');

/* ============================================================
   11. INCOME TAX CALCULATOR (Old vs New Regime)
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['income-tax-calculator'] = () => `
  <div class="card">
    <div class="card-title">Income Tax Calculator (FY 2024-25)</div>
    <div class="field"><label>Annual Income (₹)</label><input type="number" id="itIncome" placeholder="1000000" step="1000"></div>
    <div class="field"><label>Deductions (80C, 80D etc.) — Old Regime only (₹)</label><input type="number" id="itDeduct" placeholder="150000" step="1000"></div>
    <button class="btn btn-primary btn-block" onclick="itCalculate()">📊 Calculate Tax</button>
  </div>
  <div class="result-box" id="itResult">
    <div class="result-title">Tax Comparison (Old vs New Regime)</div>
    <div class="result-main" id="itMain">₹0</div>
    <div class="result-sub" id="itSub">Recommended Regime</div>
    <div class="result-row"><span class="k">Gross Income</span><span class="v" id="itGross">₹0</span></div>
    <div class="result-row"><span class="k">Old Regime Tax</span><span class="v" id="itOld" style="color:#f59e0b">₹0</span></div>
    <div class="result-row"><span class="k">New Regime Tax</span><span class="v" id="itNew" style="color:#10b981">₹0</span></div>
    <div class="result-row"><span class="k">Your Savings</span><span class="v" id="itSave" style="color:#10b981">₹0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Recommended</span><span class="v" id="itBest" style="color:#fff">—</span></div>
    <div style="margin-top:12px;padding:10px;background:var(--surface-2);border-radius:8px;font-size:11px;line-height:1.6;color:var(--text-3)">
      <strong>Note:</strong> Ye approximate calculation hai FY 2024-25 ke slabs ke hisaab se. Actual tax CA se verify karein.
    </div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('itResult','income-tax')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('itResult','income-tax')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('itResult','Income Tax')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['income-tax-calculator'] = () => { console.log('✅ Income Tax Calculator ready'); };

function calcOldRegime(income, deductions) {
  const taxable = Math.max(0, income - deductions - 50000); // Standard deduction
  let tax = 0;
  if (taxable <= 250000) tax = 0;
  else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
  else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.20;
  else tax = 112500 + (taxable - 1000000) * 0.30;
  // Rebate 87A
  if (taxable <= 500000) tax = 0;
  // Cess 4%
  return tax * 1.04;
}

function calcNewRegime(income) {
  const taxable = Math.max(0, income - 75000); // Standard deduction new regime
  let tax = 0;
  if (taxable <= 300000) tax = 0;
  else if (taxable <= 700000) tax = (taxable - 300000) * 0.05;
  else if (taxable <= 1000000) tax = 20000 + (taxable - 700000) * 0.10;
  else if (taxable <= 1200000) tax = 50000 + (taxable - 1000000) * 0.15;
  else if (taxable <= 1500000) tax = 80000 + (taxable - 1200000) * 0.20;
  else tax = 140000 + (taxable - 1500000) * 0.30;
  // Rebate 87A
  if (taxable <= 700000) tax = 0;
  // Cess 4%
  return tax * 1.04;
}

window.itCalculate = function() {
  const income = parseFloat(document.getElementById('itIncome').value);
  const deduct = parseFloat(document.getElementById('itDeduct').value) || 0;
  if (!income || income <= 0) { toast('Enter valid income', 'error'); return; }
  const oldTax = calcOldRegime(income, deduct);
  const newTax = calcNewRegime(income);
  const best = oldTax < newTax ? 'Old Regime ✅' : 'New Regime ✅';
  const save = Math.abs(oldTax - newTax);
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('itMain').textContent = fmt(Math.min(oldTax, newTax));
  document.getElementById('itSub').textContent = 'Best Regime Tax';
  document.getElementById('itGross').textContent = fmt(income);
  document.getElementById('itOld').textContent = fmt(oldTax);
  document.getElementById('itNew').textContent = fmt(newTax);
  document.getElementById('itSave').textContent = fmt(save);
  document.getElementById('itBest').textContent = best;
  document.getElementById('itResult').classList.add('active');
  toast('Tax calculated ✅', 'success');
};

/* ============================================================
   12. HRA EXEMPTION CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['hra-calculator'] = () => `
  <div class="card">
    <div class="card-title">HRA Exemption Calculator</div>
    <div class="field"><label>Basic Salary (Annual) (₹)</label><input type="number" id="hraBasic" placeholder="600000" step="1000"></div>
    <div class="field"><label>HRA Received (Annual) (₹)</label><input type="number" id="hraReceived" placeholder="240000" step="1000"></div>
    <div class="field"><label>Rent Paid (Annual) (₹)</label><input type="number" id="hraRent" placeholder="300000" step="1000"></div>
    <div class="field"><label>Metro City?</label>
      <select id="hraMetro">
        <option value="yes">Yes (Delhi, Mumbai, Kolkata, Chennai)</option>
        <option value="no" selected>No (Other cities)</option>
      </select>
    </div>
    <button class="btn btn-primary btn-block" onclick="hraCalculate()">🏠 Calculate Exemption</button>
  </div>
  <div class="result-box" id="hraResult">
    <div class="result-title">HRA Exemption Result</div>
    <div class="result-main" id="hraMain">₹0</div>
    <div class="result-sub">Exempted HRA</div>
    <div class="result-row"><span class="k">Actual HRA Received</span><span class="v" id="hraReceivedShow">₹0</span></div>
    <div class="result-row"><span class="k">Rule 1: Actual HRA</span><span class="v" id="hraRule1">₹0</span></div>
    <div class="result-row"><span class="k">Rule 2: Rent - 10% of Basic</span><span class="v" id="hraRule2">₹0</span></div>
    <div class="result-row"><span class="k">Rule 3: 50%/40% of Basic</span><span class="v" id="hraRule3">₹0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Exempted HRA (Min of 3)</span><span class="v" id="hraExempt" style="color:#fff">₹0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('hraResult','hra-exemption')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('hraResult','hra-exemption')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('hraResult','HRA Exemption')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['hra-calculator'] = () => { console.log('✅ HRA Calculator ready'); };
window.hraCalculate = function() {
  const basic = parseFloat(document.getElementById('hraBasic').value);
  const hra = parseFloat(document.getElementById('hraReceived').value);
  const rent = parseFloat(document.getElementById('hraRent').value);
  const metro = document.getElementById('hraMetro').value === 'yes';
  if (!basic || !hra || !rent) { toast('Enter all values', 'error'); return; }
  const rule1 = hra;
  const rule2 = Math.max(0, rent - basic * 0.10);
  const rule3 = basic * (metro ? 0.50 : 0.40);
  const exempt = Math.min(rule1, rule2, rule3);
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('hraMain').textContent = fmt(exempt);
  document.getElementById('hraReceivedShow').textContent = fmt(hra);
  document.getElementById('hraRule1').textContent = fmt(rule1);
  document.getElementById('hraRule2').textContent = fmt(rule2);
  document.getElementById('hraRule3').textContent = fmt(rule3);
  document.getElementById('hraExempt').textContent = fmt(exempt);
  document.getElementById('hraResult').classList.add('active');
  toast('HRA calculated ✅', 'success');
};

/* ============================================================
   13. GRATUITY CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['gratuity-calculator'] = () => `
  <div class="card">
    <div class="card-title">Gratuity Calculator</div>
    <div class="field"><label>Last Drawn Salary (Basic + DA) (₹/month)</label><input type="number" id="gratSalary" placeholder="50000" step="100"></div>
    <div class="field"><label>Years of Service</label><input type="number" id="gratYears" placeholder="10" step="0.5"></div>
    <button class="btn btn-primary btn-block" onclick="gratCalculate()">💼 Calculate Gratuity</button>
  </div>
  <div class="result-box" id="gratResult">
    <div class="result-title">Gratuity Result</div>
    <div class="result-main" id="gratMain">₹0</div>
    <div class="result-sub">Gratuity Amount</div>
    <div class="result-row"><span class="k">Last Salary</span><span class="v" id="gratSalShow">₹0</span></div>
    <div class="result-row"><span class="k">Years of Service</span><span class="v" id="gratYearsShow">0</span></div>
    <div class="result-row"><span class="k">Formula Used</span><span class="v" style="font-size:11px">(15 × Salary × Years) / 26</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Gratuity Payable</span><span class="v" id="gratTotal" style="color:#fff">₹0</span></div>
    <div style="margin-top:12px;padding:10px;background:var(--surface-2);border-radius:8px;font-size:11px;line-height:1.6;color:var(--text-3)">
      <strong>Note:</strong> Gratuity is tax-exempt up to ₹20 lakh. Applicable after 5 years of continuous service.
    </div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('gratResult','gratuity')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('gratResult','gratuity')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('gratResult','Gratuity')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['gratuity-calculator'] = () => { console.log('✅ Gratuity Calculator ready'); };
window.gratCalculate = function() {
  const salary = parseFloat(document.getElementById('gratSalary').value);
  const years = parseFloat(document.getElementById('gratYears').value);
  if (!salary || !years) { toast('Enter valid values', 'error'); return; }
  const gratuity = (15 * salary * years) / 26;
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('gratMain').textContent = fmt(gratuity);
  document.getElementById('gratSalShow').textContent = fmt(salary);
  document.getElementById('gratYearsShow').textContent = years + ' years';
  document.getElementById('gratTotal').textContent = fmt(gratuity);
  document.getElementById('gratResult').classList.add('active');
  toast('Gratuity calculated ✅', 'success');
};

/* ============================================================
   14. TDS CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['tds-calculator'] = () => `
  <div class="card">
    <div class="card-title">TDS Calculator</div>
    <div class="field"><label>Amount (₹)</label><input type="number" id="tdsAmount" placeholder="100000" step="100"></div>
    <div class="field"><label>TDS Rate (%)</label>
      <select id="tdsRate">
        <option value="1">1% (194C - Contractor)</option>
        <option value="2">2% (194C - Individual)</option>
        <option value="5">5% (194H - Commission)</option>
        <option value="10" selected>10% (194J - Professional)</option>
        <option value="20">20% (194I - Rent)</option>
        <option value="30">30% (194B - Lottery)</option>
      </select>
    </div>
    <button class="btn btn-primary btn-block" onclick="tdsCalculate()">📋 Calculate TDS</button>
  </div>
  <div class="result-box" id="tdsResult">
    <div class="result-title">TDS Result</div>
    <div class="result-main" id="tdsMain">₹0</div>
    <div class="result-sub">TDS Amount</div>
    <div class="result-row"><span class="k">Gross Amount</span><span class="v" id="tdsGross">₹0</span></div>
    <div class="result-row"><span class="k">TDS Rate</span><span class="v" id="tdsRateShow">10%</span></div>
    <div class="result-row"><span class="k">TDS Deducted</span><span class="v" id="tdsDeducted" style="color:#f59e0b">₹0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Net Payable</span><span class="v" id="tdsNet" style="color:#10b981">₹0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('tdsResult','tds')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('tdsResult','tds')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('tdsResult','TDS')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['tds-calculator'] = () => { console.log('✅ TDS Calculator ready'); };
window.tdsCalculate = function() {
  const amount = parseFloat(document.getElementById('tdsAmount').value);
  const rate = parseFloat(document.getElementById('tdsRate').value);
  if (!amount || amount <= 0) { toast('Enter valid amount', 'error'); return; }
  const tds = (amount * rate) / 100;
  const net = amount - tds;
  const fmt = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('tdsMain').textContent = fmt(tds);
  document.getElementById('tdsGross').textContent = fmt(amount);
  document.getElementById('tdsRateShow').textContent = rate + '%';
  document.getElementById('tdsDeducted').textContent = fmt(tds);
  document.getElementById('tdsNet').textContent = fmt(net);
  document.getElementById('tdsResult').classList.add('active');
  toast('TDS calculated ✅', 'success');
};

/* ============================================================
   15. PPF CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['ppf-calculator'] = () => `
  <div class="card">
    <div class="card-title">PPF Calculator</div>
    <div class="field"><label>Yearly Investment (₹)</label><input type="number" id="ppfYearly" placeholder="150000" step="500"></div>
    <div class="field"><label>Interest Rate (% per year)</label><input type="number" id="ppfRate" placeholder="7.1" value="7.1" step="0.1"></div>
    <div class="field"><label>Tenure (Years)</label><input type="number" id="ppfYears" placeholder="15" value="15" step="1"></div>
    <button class="btn btn-primary btn-block" onclick="ppfCalculate()">🏦 Calculate PPF</button>
  </div>
  <div class="result-box" id="ppfResult">
    <div class="result-title">PPF Result</div>
    <div class="result-main" id="ppfMain">₹0</div>
    <div class="result-sub">Maturity Amount</div>
    <div class="result-row"><span class="k">Total Investment</span><span class="v" id="ppfInvested">₹0</span></div>
    <div class="result-row"><span class="k">Interest Earned</span><span class="v" id="ppfInterest" style="color:#10b981">₹0</span></div>
    <div class="result-row"><span class="k">Tenure</span><span class="v" id="ppfTenure">15 years</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Maturity Amount</span><span class="v" id="ppfTotal" style="color:#fff">₹0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('ppfResult','ppf')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('ppfResult','ppf')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('ppfResult','PPF')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['ppf-calculator'] = () => { console.log('✅ PPF Calculator ready'); };
window.ppfCalculate = function() {
  const yearly = parseFloat(document.getElementById('ppfYearly').value);
  const rate = parseFloat(document.getElementById('ppfRate').value);
  const years = parseFloat(document.getElementById('ppfYears').value);
  if (!yearly || !rate || !years) { toast('Enter valid values', 'error'); return; }
  let total = 0;
  for (let i = 0; i < years; i++) {
    total = (total + yearly) * (1 + rate / 100);
  }
  const invested = yearly * years;
  const interest = total - invested;
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('ppfMain').textContent = fmt(total);
  document.getElementById('ppfInvested').textContent = fmt(invested);
  document.getElementById('ppfInterest').textContent = fmt(interest);
  document.getElementById('ppfTenure').textContent = years + ' years';
  document.getElementById('ppfTotal').textContent = fmt(total);
  document.getElementById('ppfResult').classList.add('active');
  toast('PPF calculated ✅', 'success');
};

console.log('%c✅ Part 3 loaded — 15 calculators total', 'color:#10b981;font-weight:bold');

/* ============================================================
   16. NPS CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['nps-calculator'] = () => `
  <div class="card">
    <div class="card-title">NPS Calculator (National Pension Scheme)</div>
    <div class="field"><label>Monthly Contribution (₹)</label><input type="number" id="npsMonthly" placeholder="5000" step="500"></div>
    <div class="field"><label>Your Age</label><input type="number" id="npsAge" placeholder="30" step="1"></div>
    <div class="field"><label>Retirement Age</label><input type="number" id="npsRetAge" placeholder="60" value="60" step="1"></div>
    <div class="field"><label>Expected Return (% per year)</label><input type="number" id="npsRate" placeholder="10" value="10" step="0.1"></div>
    <button class="btn btn-primary btn-block" onclick="npsCalculate()">💰 Calculate NPS</button>
  </div>
  <div class="result-box" id="npsResult">
    <div class="result-title">NPS Result</div>
    <div class="result-main" id="npsMain">₹0</div>
    <div class="result-sub" id="npsSub">Total Corpus at Retirement</div>
    <div class="result-row"><span class="k">Total Investment</span><span class="v" id="npsInvested">₹0</span></div>
    <div class="result-row"><span class="k">Interest Earned</span><span class="v" id="npsReturns" style="color:#10b981">₹0</span></div>
    <div class="result-row"><span class="k">Years to Retirement</span><span class="v" id="npsYears">0</span></div>
    <div class="result-row"><span class="k">Lumpsum (40%)</span><span class="v" id="npsLumpsum">₹0</span></div>
    <div class="result-row"><span class="k">Annuity (60%)</span><span class="v" id="npsAnnuity">₹0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Est. Monthly Pension</span><span class="v" id="npsPension" style="color:#10b981">₹0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('npsResult','nps')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('npsResult','nps')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('npsResult','NPS')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['nps-calculator'] = () => { console.log('✅ NPS Calculator ready'); };
window.npsCalculate = function() {
  const monthly = parseFloat(document.getElementById('npsMonthly').value);
  const age = parseFloat(document.getElementById('npsAge').value);
  const retAge = parseFloat(document.getElementById('npsRetAge').value);
  const rate = parseFloat(document.getElementById('npsRate').value);
  if (!monthly || !age || !retAge || !rate || retAge <= age) { toast('Enter valid values', 'error'); return; }
  const years = retAge - age;
  const months = years * 12;
  const monthlyRate = rate / 12 / 100;
  const corpus = monthly * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  const invested = monthly * months;
  const returns = corpus - invested;
  const lumpsum = corpus * 0.40;
  const annuity = corpus * 0.60;
  const monthlyPension = (annuity * 0.06) / 12; // 6% annuity rate
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('npsMain').textContent = fmt(corpus);
  document.getElementById('npsSub').textContent = 'Corpus after ' + years + ' years';
  document.getElementById('npsInvested').textContent = fmt(invested);
  document.getElementById('npsReturns').textContent = fmt(returns);
  document.getElementById('npsYears').textContent = years;
  document.getElementById('npsLumpsum').textContent = fmt(lumpsum);
  document.getElementById('npsAnnuity').textContent = fmt(annuity);
  document.getElementById('npsPension').textContent = fmt(monthlyPension);
  document.getElementById('npsResult').classList.add('active');
  toast('NPS calculated ✅', 'success');
};

/* ============================================================
   17. CAGR CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['cagr-calculator'] = () => `
  <div class="card">
    <div class="card-title">CAGR Calculator (Compound Annual Growth Rate)</div>
    <div class="field"><label>Initial Value (₹)</label><input type="number" id="cagrInitial" placeholder="100000" step="100"></div>
    <div class="field"><label>Final Value (₹)</label><input type="number" id="cagrFinal" placeholder="250000" step="100"></div>
    <div class="field"><label>Time Period (Years)</label><input type="number" id="cagrYears" placeholder="5" step="0.5"></div>
    <button class="btn btn-primary btn-block" onclick="cagrCalculate()">📈 Calculate CAGR</button>
  </div>
  <div class="result-box" id="cagrResult">
    <div class="result-title">CAGR Result</div>
    <div class="result-main" id="cagrMain">0%</div>
    <div class="result-sub">Compound Annual Growth Rate</div>
    <div class="result-row"><span class="k">Initial Value</span><span class="v" id="cagrInitShow">₹0</span></div>
    <div class="result-row"><span class="k">Final Value</span><span class="v" id="cagrFinalShow">₹0</span></div>
    <div class="result-row"><span class="k">Absolute Growth</span><span class="v" id="cagrAbsolute" style="color:#10b981">₹0</span></div>
    <div class="result-row"><span class="k">Total Return</span><span class="v" id="cagrTotal" style="color:#10b981">0%</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">CAGR</span><span class="v" id="cagrFinalPct" style="color:#fff">0%</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('cagrResult','cagr')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('cagrResult','cagr')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('cagrResult','CAGR')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['cagr-calculator'] = () => { console.log('✅ CAGR Calculator ready'); };
window.cagrCalculate = function() {
  const initial = parseFloat(document.getElementById('cagrInitial').value);
  const final_ = parseFloat(document.getElementById('cagrFinal').value);
  const years = parseFloat(document.getElementById('cagrYears').value);
  if (!initial || !final_ || !years || initial <= 0 || years <= 0) { toast('Enter valid values', 'error'); return; }
  const cagr = (Math.pow(final_ / initial, 1 / years) - 1) * 100;
  const growth = final_ - initial;
  const totalReturn = (growth / initial) * 100;
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('cagrMain').textContent = cagr.toFixed(2) + '%';
  document.getElementById('cagrInitShow').textContent = fmt(initial);
  document.getElementById('cagrFinalShow').textContent = fmt(final_);
  document.getElementById('cagrAbsolute').textContent = fmt(growth);
  document.getElementById('cagrTotal').textContent = totalReturn.toFixed(2) + '%';
  document.getElementById('cagrFinalPct').textContent = cagr.toFixed(2) + '%';
  document.getElementById('cagrResult').classList.add('active');
  toast('CAGR calculated ✅', 'success');
};

/* ============================================================
   18. INFLATION CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['inflation-calculator'] = () => `
  <div class="card">
    <div class="card-title">Inflation Calculator</div>
    <div class="field"><label>Current Amount (₹)</label><input type="number" id="inflAmount" placeholder="100000" step="1000"></div>
    <div class="field"><label>Inflation Rate (% per year)</label><input type="number" id="inflRate" placeholder="6" value="6" step="0.1"></div>
    <div class="field"><label>Time Period (Years)</label><input type="number" id="inflYears" placeholder="10" step="1"></div>
    <button class="btn btn-primary btn-block" onclick="inflCalculate()">📉 Calculate Inflation</button>
  </div>
  <div class="result-box" id="inflResult">
    <div class="result-title">Inflation Result</div>
    <div class="result-main" id="inflMain">₹0</div>
    <div class="result-sub">Future Value Needed</div>
    <div class="result-row"><span class="k">Today's Value</span><span class="v" id="inflToday">₹0</span></div>
    <div class="result-row"><span class="k">Future Value</span><span class="v" id="inflFuture" style="color:#f59e0b">₹0</span></div>
    <div class="result-row"><span class="k">Value Eroded</span><span class="v" id="inflEroded" style="color:#ef4444">₹0</span></div>
    <div class="result-row"><span class="k">Purchasing Power Loss</span><span class="v" id="inflLoss" style="color:#ef4444">0%</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Present Value of Future Amount</span><span class="v" id="inflPV" style="color:#fff">₹0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('inflResult','inflation')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('inflResult','inflation')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('inflResult','Inflation')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['inflation-calculator'] = () => { console.log('✅ Inflation Calculator ready'); };
window.inflCalculate = function() {
  const amount = parseFloat(document.getElementById('inflAmount').value);
  const rate = parseFloat(document.getElementById('inflRate').value);
  const years = parseFloat(document.getElementById('inflYears').value);
  if (!amount || !rate || !years) { toast('Enter valid values', 'error'); return; }
  const future = amount * Math.pow(1 + rate / 100, years);
  const eroded = future - amount;
  const loss = (eroded / future) * 100;
  const pv = amount / Math.pow(1 + rate / 100, years);
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('inflMain').textContent = fmt(future);
  document.getElementById('inflToday').textContent = fmt(amount);
  document.getElementById('inflFuture').textContent = fmt(future);
  document.getElementById('inflEroded').textContent = fmt(eroded);
  document.getElementById('inflLoss').textContent = loss.toFixed(2) + '%';
  document.getElementById('inflPV').textContent = fmt(pv);
  document.getElementById('inflResult').classList.add('active');
  toast('Inflation calculated ✅', 'success');
};

/* ============================================================
   19. RETIREMENT CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['retirement-calculator'] = () => `
  <div class="card">
    <div class="card-title">Retirement Calculator</div>
    <div class="field"><label>Current Age</label><input type="number" id="retAge" placeholder="30" step="1"></div>
    <div class="field"><label>Retirement Age</label><input type="number" id="retRetireAge" placeholder="60" value="60" step="1"></div>
    <div class="field"><label>Monthly Expenses Today (₹)</label><input type="number" id="retExpenses" placeholder="40000" step="1000"></div>
    <div class="field"><label>Inflation Rate (% per year)</label><input type="number" id="retInflation" placeholder="6" value="6" step="0.1"></div>
    <div class="field"><label>Expected Return Post-Retirement (% per year)</label><input type="number" id="retReturn" placeholder="7" value="7" step="0.1"></div>
    <div class="field"><label>Life Expectancy</label><input type="number" id="retLife" placeholder="80" value="80" step="1"></div>
    <button class="btn btn-primary btn-block" onclick="retCalculate()">🏖️ Calculate Corpus</button>
  </div>
  <div class="result-box" id="retResult">
    <div class="result-title">Retirement Result</div>
    <div class="result-main" id="retMain">₹0</div>
    <div class="result-sub">Retirement Corpus Required</div>
    <div class="result-row"><span class="k">Monthly Expense at Retirement</span><span class="v" id="retMonthly">₹0</span></div>
    <div class="result-row"><span class="k">Yearly Expense at Retirement</span><span class="v" id="retYearly">₹0</span></div>
    <div class="result-row"><span class="k">Retirement Years</span><span class="v" id="retYearsShow">0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Corpus Required</span><span class="v" id="retCorpus" style="color:#fff">₹0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('retResult','retirement')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('retResult','retirement')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('retResult','Retirement')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['retirement-calculator'] = () => { console.log('✅ Retirement Calculator ready'); };
window.retCalculate = function() {
  const age = parseFloat(document.getElementById('retAge').value);
  const retAge = parseFloat(document.getElementById('retRetireAge').value);
  const expenses = parseFloat(document.getElementById('retExpenses').value);
  const inflation = parseFloat(document.getElementById('retInflation').value);
  const retReturn = parseFloat(document.getElementById('retReturn').value);
  const life = parseFloat(document.getElementById('retLife').value);
  if (!age || !retAge || !expenses || retAge <= age || life <= retAge) { toast('Enter valid values', 'error'); return; }
  const yearsToRet = retAge - age;
  const retYears = life - retAge;
  const futureMonthly = expenses * Math.pow(1 + inflation / 100, yearsToRet);
  const futureYearly = futureMonthly * 12;
  // Inflation-adjusted return
  const realReturn = ((1 + retReturn / 100) / (1 + inflation / 100) - 1) * 100;
  const corpus = futureYearly * ((1 - Math.pow(1 + realReturn / 100, -retYears)) / (realReturn / 100));
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('retMain').textContent = fmt(corpus);
  document.getElementById('retMonthly').textContent = fmt(futureMonthly);
  document.getElementById('retYearly').textContent = fmt(futureYearly);
  document.getElementById('retYearsShow').textContent = retYears + ' years';
  document.getElementById('retCorpus').textContent = fmt(corpus);
  document.getElementById('retResult').classList.add('active');
  toast('Retirement corpus calculated ✅', 'success');
};

/* ============================================================
   20. BREAK-EVEN CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['break-even-calculator'] = () => `
  <div class="card">
    <div class="card-title">Break-even Calculator</div>
    <div class="field"><label>Fixed Costs (₹)</label><input type="number" id="beFixed" placeholder="100000" step="1000"></div>
    <div class="field"><label>Selling Price per Unit (₹)</label><input type="number" id="bePrice" placeholder="500" step="1"></div>
    <div class="field"><label>Variable Cost per Unit (₹)</label><input type="number" id="beVarCost" placeholder="300" step="1"></div>
    <button class="btn btn-primary btn-block" onclick="beCalculate()">📊 Calculate Break-even</button>
  </div>
  <div class="result-box" id="beResult">
    <div class="result-title">Break-even Result</div>
    <div class="result-main" id="beMain">0 units</div>
    <div class="result-sub">Break-even Point (Units)</div>
    <div class="result-row"><span class="k">Contribution Margin</span><span class="v" id="beMargin">₹0</span></div>
    <div class="result-row"><span class="k">Fixed Costs</span><span class="v" id="beFixedShow">₹0</span></div>
    <div class="result-row"><span class="k">Break-even Sales (₹)</span><span class="v" id="beSales">₹0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Units to Sell</span><span class="v" id="beUnits" style="color:#fff">0</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('beResult','break-even')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('beResult','break-even')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('beResult','Break-even')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['break-even-calculator'] = () => { console.log('✅ Break-even Calculator ready'); };
window.beCalculate = function() {
  const fixed = parseFloat(document.getElementById('beFixed').value);
  const price = parseFloat(document.getElementById('bePrice').value);
  const varCost = parseFloat(document.getElementById('beVarCost').value);
  if (!fixed || !price || !varCost || price <= varCost) { toast('Price must be > Variable Cost', 'error'); return; }
  const margin = price - varCost;
  const units = Math.ceil(fixed / margin);
  const sales = units * price;
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('beMain').textContent = units.toLocaleString('en-IN') + ' units';
  document.getElementById('beMargin').textContent = fmt(margin);
  document.getElementById('beFixedShow').textContent = fmt(fixed);
  document.getElementById('beSales').textContent = fmt(sales);
  document.getElementById('beUnits').textContent = units.toLocaleString('en-IN');
  document.getElementById('beResult').classList.add('active');
  toast('Break-even calculated ✅', 'success');
};

console.log('%c✅ Part 4 loaded — 20 calculators total', 'color:#10b981;font-weight:bold');

/* ============================================================
   21. PROFIT MARGIN CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['profit-margin-calculator'] = () => `
  <div class="card">
    <div class="card-title">Profit Margin Calculator</div>
    <div class="field"><label>Cost Price (₹)</label><input type="number" id="pmCost" placeholder="500" step="0.01"></div>
    <div class="field"><label>Selling Price (₹)</label><input type="number" id="pmSell" placeholder="750" step="0.01"></div>
    <button class="btn btn-primary btn-block" onclick="pmCalculate()">💹 Calculate Profit</button>
  </div>
  <div class="result-box" id="pmResult">
    <div class="result-title">Profit Result</div>
    <div class="result-main" id="pmMain">₹0</div>
    <div class="result-sub" id="pmSub">Profit</div>
    <div class="result-row"><span class="k">Cost Price</span><span class="v" id="pmCostShow">₹0</span></div>
    <div class="result-row"><span class="k">Selling Price</span><span class="v" id="pmSellShow">₹0</span></div>
    <div class="result-row"><span class="k">Profit/Loss</span><span class="v" id="pmProfit">₹0</span></div>
    <div class="result-row"><span class="k">Profit Margin (%)</span><span class="v" id="pmMargin">0%</span></div>
    <div class="result-row"><span class="k">Markup (%)</span><span class="v" id="pmMarkup">0%</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Profit Margin</span><span class="v" id="pmFinalMargin" style="color:#fff">0%</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('pmResult','profit-margin')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('pmResult','profit-margin')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('pmResult','Profit Margin')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['profit-margin-calculator'] = () => { console.log('✅ Profit Margin Calculator ready'); };
window.pmCalculate = function() {
  const cost = parseFloat(document.getElementById('pmCost').value);
  const sell = parseFloat(document.getElementById('pmSell').value);
  if (!cost || !sell || cost <= 0) { toast('Enter valid values', 'error'); return; }
  const profit = sell - cost;
  const marginPct = (profit / sell) * 100;
  const markupPct = (profit / cost) * 100;
  const isProfit = profit >= 0;
  const fmt = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('pmMain').textContent = fmt(profit);
  document.getElementById('pmSub').textContent = isProfit ? 'Profit ✅' : 'Loss ❌';
  document.getElementById('pmCostShow').textContent = fmt(cost);
  document.getElementById('pmSellShow').textContent = fmt(sell);
  const profitEl = document.getElementById('pmProfit');
  profitEl.textContent = fmt(profit);
  profitEl.style.color = isProfit ? '#10b981' : '#ef4444';
  document.getElementById('pmMargin').textContent = marginPct.toFixed(2) + '%';
  document.getElementById('pmMarkup').textContent = markupPct.toFixed(2) + '%';
  const finalEl = document.getElementById('pmFinalMargin');
  finalEl.textContent = marginPct.toFixed(2) + '%';
  finalEl.style.color = isProfit ? '#10b981' : '#ef4444';
  document.getElementById('pmResult').classList.add('active');
  toast('Profit calculated ✅', 'success');
};

/* ============================================================
   22. RENT VS BUY CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['rent-vs-buy-calculator'] = () => `
  <div class="card">
    <div class="card-title">Rent vs Buy Calculator</div>
    <div class="field"><label>Property Price (₹)</label><input type="number" id="rvbPrice" placeholder="5000000" step="10000"></div>
    <div class="field"><label>Down Payment (₹)</label><input type="number" id="rvbDown" placeholder="1000000" step="10000"></div>
    <div class="field"><label>Home Loan Rate (% per year)</label><input type="number" id="rvbRate" placeholder="9" value="9" step="0.1"></div>
    <div class="field"><label>Loan Tenure (Years)</label><input type="number" id="rvbTenure" placeholder="20" value="20" step="1"></div>
    <div class="field"><label>Monthly Rent if Renting (₹)</label><input type="number" id="rvbRent" placeholder="20000" step="500"></div>
    <div class="field"><label>Expected Rent Increase (% per year)</label><input type="number" id="rvbRentInc" placeholder="5" value="5" step="0.1"></div>
    <div class="field"><label>Property Appreciation (% per year)</label><input type="number" id="rvbApp" placeholder="6" value="6" step="0.1"></div>
    <button class="btn btn-primary btn-block" onclick="rvbCalculate()">🏠 Compare</button>
  </div>
  <div class="result-box" id="rvbResult">
    <div class="result-title">Rent vs Buy Result</div>
    <div class="result-main" id="rvbMain">—</div>
    <div class="result-sub" id="rvbSub">Better option after tenure</div>
    <div class="result-row"><span class="k">Total Rent Paid</span><span class="v" id="rvbRentTotal">₹0</span></div>
    <div class="result-row"><span class="k">Total Buy Cost (EMI + Down)</span><span class="v" id="rvbBuyTotal">₹0</span></div>
    <div class="result-row"><span class="k">Property Value at End</span><span class="v" id="rvbPropValue" style="color:#10b981">₹0</span></div>
    <div class="result-row"><span class="k">Net Cost (Buy)</span><span class="v" id="rvbNetBuy">₹0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Winner</span><span class="v" id="rvbWinner" style="color:#fff">—</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('rvbResult','rent-vs-buy')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('rvbResult','rent-vs-buy')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('rvbResult','Rent vs Buy')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['rent-vs-buy-calculator'] = () => { console.log('✅ Rent vs Buy Calculator ready'); };
window.rvbCalculate = function() {
  const price = parseFloat(document.getElementById('rvbPrice').value);
  const down = parseFloat(document.getElementById('rvbDown').value);
  const rate = parseFloat(document.getElementById('rvbRate').value);
  const tenure = parseFloat(document.getElementById('rvbTenure').value);
  const rent = parseFloat(document.getElementById('rvbRent').value);
  const rentInc = parseFloat(document.getElementById('rvbRentInc').value);
  const app = parseFloat(document.getElementById('rvbApp').value);
  if (!price || !down || !rent || !tenure) { toast('Enter valid values', 'error'); return; }
  // Total Rent
  let totalRent = 0;
  let currentRent = rent;
  for (let i = 0; i < tenure; i++) {
    totalRent += currentRent * 12;
    currentRent *= (1 + rentInc / 100);
  }
  // Loan EMI
  const loan = price - down;
  const months = tenure * 12;
  const monthlyRate = rate / 12 / 100;
  const emi = (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalEMI = emi * months;
  const totalBuyCost = down + totalEMI;
  // Property value at end
  const propValue = price * Math.pow(1 + app / 100, tenure);
  const netBuy = totalBuyCost - propValue;
  const fmt = (n) => '₹' + Math.round(Math.abs(n)).toLocaleString('en-IN');
  const winner = netBuy < totalRent ? '🏠 BUY' : '🏘️ RENT';
  document.getElementById('rvbMain').textContent = winner;
  document.getElementById('rvbSub').textContent = 'Better choice for ' + tenure + ' years';
  document.getElementById('rvbRentTotal').textContent = fmt(totalRent);
  document.getElementById('rvbBuyTotal').textContent = fmt(totalBuyCost);
  document.getElementById('rvbPropValue').textContent = fmt(propValue);
  document.getElementById('rvbNetBuy').textContent = (netBuy < 0 ? '-' : '') + fmt(netBuy);
  document.getElementById('rvbWinner').textContent = winner;
  document.getElementById('rvbResult').classList.add('active');
  toast('Comparison done ✅', 'success');
};

/* ============================================================
   23. MARRIAGE / BABY PLANNER CALCULATOR
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['marriage-planner-calculator'] = () => `
  <div class="card">
    <div class="card-title">Marriage / Baby Planner</div>
    <div class="field"><label>Current Savings (₹)</label><input type="number" id="mpSavings" placeholder="100000" step="10000"></div>
    <div class="field"><label>Monthly Savings (₹)</label><input type="number" id="mpMonthly" placeholder="10000" step="1000"></div>
    <div class="field"><label>Target Amount (₹)</label><input type="number" id="mpTarget" placeholder="500000" step="10000"></div>
    <div class="field"><label>Expected Return (% per year)</label><input type="number" id="mpRate" placeholder="10" value="10" step="0.1"></div>
    <button class="btn btn-primary btn-block" onclick="mpCalculate()">💍 Calculate Timeline</button>
  </div>
  <div class="result-box" id="mpResult">
    <div class="result-title">Planner Result</div>
    <div class="result-main" id="mpMain">0 months</div>
    <div class="result-sub" id="mpSub">Time to reach target</div>
    <div class="result-row"><span class="k">Current Savings</span><span class="v" id="mpSavingsShow">₹0</span></div>
    <div class="result-row"><span class="k">Monthly Savings</span><span class="v" id="mpMonthlyShow">₹0</span></div>
    <div class="result-row"><span class="k">Target</span><span class="v" id="mpTargetShow">₹0</span></div>
    <div class="result-row"><span class="k">Expected Returns</span><span class="v" id="mpReturns" style="color:#10b981">₹0</span></div>
    <div class="result-row" style="background:var(--surface-2);padding:12px;border-radius:8px;margin-top:8px"><span class="k" style="color:#fff">Time Required</span><span class="v" id="mpTime" style="color:#fff">0 months</span></div>
    <div class="export-btns">
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadPDF('mpResult','marriage-planner')"><i>📥</i>PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="extraDownloadImage('mpResult','marriage-planner')"><i>🖼️</i>Image</button>
      <button class="btn btn-secondary btn-sm" onclick="extraPrint('mpResult','Marriage Planner')"><i>🖨️</i>Print</button>
    </div>
  </div>
`;
window.EXTRA_TOOL_INITS['marriage-planner-calculator'] = () => { console.log('✅ Marriage Planner ready'); };
window.mpCalculate = function() {
  const savings = parseFloat(document.getElementById('mpSavings').value) || 0;
  const monthly = parseFloat(document.getElementById('mpMonthly').value);
  const target = parseFloat(document.getElementById('mpTarget').value);
  const rate = parseFloat(document.getElementById('mpRate').value);
  if (!monthly || !target || !rate) { toast('Enter valid values', 'error'); return; }
  const monthlyRate = rate / 12 / 100;
  // FV of current savings
  // Time to reach target: solve for n
  // target = savings*(1+r)^n + monthly * ((1+r)^n - 1)/r
  let months = 0;
  let total = savings;
  while (total < target && months < 1200) {
    total = total * (1 + monthlyRate) + monthly;
    months++;
  }
  const totalInvested = savings + (monthly * months);
  const returns = total - totalInvested;
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  document.getElementById('mpMain').textContent = months + ' months';
  document.getElementById('mpSub').textContent = '≈ ' + (months / 12).toFixed(1) + ' years';
  document.getElementById('mpSavingsShow').textContent = fmt(savings);
  document.getElementById('mpMonthlyShow').textContent = fmt(monthly);
  document.getElementById('mpTargetShow').textContent = fmt(target);
  document.getElementById('mpReturns').textContent = fmt(returns);
  document.getElementById('mpTime').textContent = months + ' months';
  document.getElementById('mpResult').classList.add('active');
  toast('Timeline calculated ✅', 'success');
};

console.log('%c🎉 ALL 23 CALCULATORS LOADED SUCCESSFULLY!', 'color:#10b981;font-weight:bold;font-size:16px');
console.log('%c✅ Total: 24 calculators ready', 'color:#6366f1;font-weight:bold');