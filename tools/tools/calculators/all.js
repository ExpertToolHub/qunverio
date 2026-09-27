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

// ==== PART 2 BELOW ====