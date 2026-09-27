
/* ============================================================
   QUNVERIO — COMMON SETUP (tools/setup.js)
   Sab tools ke liye common code + Categories
   ============================================================ */

console.log('%cQunverio Setup Loading...', 'color:#10b981;font-weight:bold');

/* ============================================================
   CATEGORIES DATA
   ============================================================ */
const CATEGORIES = [
  {
    id: 'calculators',
    name: 'Calculators',
    icon: '🧮',
    desc: 'CTC, GST, SIP, EMI, Age & more',
    gradient: 'linear-gradient(135deg,#22c55e,#10b981)'
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    desc: 'Tax, Loan, Investment tools',
    gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)'
  },
  {
    id: 'students',
    name: 'Students',
    icon: '🎓',
    desc: 'Resume, CGPA, Percentage tools',
    gradient: 'linear-gradient(135deg,#8b5cf6,#6366f1)'
  },
  {
    id: 'generators',
    name: 'Generators',
    icon: '📄',
    desc: 'QR, Barcode, Password generators',
    gradient: 'linear-gradient(135deg,#f59e0b,#f97316)'
  },
  {
    id: 'converters',
    name: 'Converters',
    icon: '🔄',
    desc: 'Unit, Case, Currency converters',
    gradient: 'linear-gradient(135deg,#ec4899,#8b5cf6)'
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: '🛠️',
    desc: 'Word Counter, Image Tools & more',
    gradient: 'linear-gradient(135deg,#14b8a6,#06b6d4)'
  },
const EXTRA_TOOLS = [
  /* ===== EXISTING TOOLS ===== */
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    cat: 'generators',
    icon: '📱',
    desc: 'Generate QR codes for URLs and text instantly',
    howto: 'Paste any URL or text. Click Generate QR. Download as PNG or SVG, or Print.',
    kw: ['qr', 'qr code', 'generator', 'url', 'link', 'scan']
  },
  {
    id: 'ctc-salary',
    name: 'CTC → In-Hand Salary',
    cat: 'calculators',
    icon: '💼',
    desc: 'Calculate your take-home salary from CTC',
    howto: 'Enter annual CTC, basic %, HRA %, PF, tax. Click Calculate to see monthly in-hand salary.',
    kw: ['ctc', 'salary', 'in-hand', 'take home', 'monthly salary', 'income', 'pf', 'tax']
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    cat: 'generators',
    icon: '🎫',
    desc: 'Generate barcodes for products',
    howto: 'Enter barcode text/number. Choose format. Click Generate. Download or Print.',
    kw: ['barcode', 'bar code', 'product', 'scan']
  },
  {
    id: 'resume-builder',
    name: 'Resume Builder',
    cat: 'students',
    icon: '📄',
    desc: 'Create professional ATS-friendly resume with PDF download',
    howto: 'Fill personal info, education, experience, skills. Choose template. Preview and download PDF.',
    kw: ['resume', 'cv', 'bio data', 'resume maker', 'cv builder', 'job', 'career']
  },

  /* ===== CALCULATORS (24) ===== */
  {
    id: 'gst-calculator',
    name: 'GST Calculator',
    cat: 'calculators',
    icon: '💰',
    desc: 'Calculate GST for any amount — inclusive or exclusive',
    howto: 'Enter amount and GST rate. Choose add or remove GST. Click Calculate.',
    kw: ['gst', 'tax', 'goods', 'services', 'gst calculator', 'cgst', 'sgst']
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    cat: 'calculators',
    icon: '🎂',
    desc: 'Calculate exact age in years, months, days',
    howto: 'Enter date of birth and current date. Click Calculate Age.',
    kw: ['age', 'age calculator', 'birthday', 'dob', 'date of birth']
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    cat: 'calculators',
    icon: '📊',
    desc: 'Calculate percentages, increase, decrease easily',
    howto: 'Enter values. Choose calculation type. Click Calculate.',
    kw: ['percentage', 'percent', 'increase', 'decrease', 'discount percent']
  },
  {
    id: 'discount-calculator',
    name: 'Discount Calculator',
    cat: 'calculators',
    icon: '🏷️',
    desc: 'Calculate discount and final price after discount',
    howto: 'Enter original price and discount %. Click Calculate.',
    kw: ['discount', 'sale', 'off', 'price', 'discount calculator']
  },
  {
    id: 'bmi-calculator',
    name: 'BMI Calculator',
    cat: 'calculators',
    icon: '⚖️',
    desc: 'Calculate your Body Mass Index and health category',
    howto: 'Enter weight (kg) and height (cm). Click Calculate BMI.',
    kw: ['bmi', 'body mass', 'health', 'weight', 'fitness']
  },
  {
    id: 'sip-calculator',
    name: 'SIP Calculator',
    cat: 'calculators',
    icon: '📈',
    desc: 'Calculate mutual fund SIP returns and maturity',
    howto: 'Enter monthly amount, rate, years. Click Calculate SIP.',
    kw: ['sip', 'mutual fund', 'investment', 'returns', 'sip calculator']
  },
  {
    id: 'emi-calculator',
    name: 'EMI / Loan Calculator',
    cat: 'calculators',
    icon: '🏦',
    desc: 'Calculate monthly EMI for home, car, personal loan',
    howto: 'Enter loan amount, interest rate, tenure. Click Calculate EMI.',
    kw: ['emi', 'loan', 'home loan', 'car loan', 'emi calculator']
  },
  {
    id: 'fd-calculator',
    name: 'FD Calculator',
    cat: 'calculators',
    icon: '💵',
    desc: 'Calculate Fixed Deposit maturity and interest',
    howto: 'Enter principal, rate, tenure, compounding. Click Calculate.',
    kw: ['fd', 'fixed deposit', 'bank', 'interest', 'fd calculator']
  },
  {
    id: 'simple-interest-calculator',
    name: 'Simple Interest Calculator',
    cat: 'calculators',
    icon: '📉',
    desc: 'Calculate simple interest on principal amount',
    howto: 'Enter principal, rate, time. Click Calculate.',
    kw: ['simple interest', 'si', 'interest', 'loan interest']
  },
  {
    id: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    cat: 'calculators',
    icon: '📈',
    desc: 'Calculate compound interest with compounding frequency',
    howto: 'Enter principal, rate, time, frequency. Click Calculate.',
    kw: ['compound interest', 'ci', 'interest', 'compounding']
  },
  {
    id: 'income-tax-calculator',
    name: 'Income Tax Calculator',
    cat: 'calculators',
    icon: '📋',
    desc: 'Compare Old vs New Regime tax liability',
    howto: 'Enter annual income and deductions. Click Calculate Tax.',
    kw: ['income tax', 'tax', 'old regime', 'new regime', 'itr']
  },
  {
    id: 'hra-calculator',
    name: 'HRA Exemption Calculator',
    cat: 'calculators',
    icon: '🏠',
    desc: 'Calculate HRA exemption for tax saving',
    howto: 'Enter basic salary, HRA received, rent paid. Click Calculate.',
    kw: ['hra', 'house rent allowance', 'tax exemption', 'rent']
  },
  {
    id: 'gratuity-calculator',
    name: 'Gratuity Calculator',
    cat: 'calculators',
    icon: '💼',
    desc: 'Calculate gratuity amount on retirement/resignation',
    howto: 'Enter last salary and years of service. Click Calculate Gratuity.',
    kw: ['gratuity', 'retirement', 'service', 'employee benefits']
  },
  {
    id: 'tds-calculator',
    name: 'TDS Calculator',
    cat: 'calculators',
    icon: '📋',
    desc: 'Calculate TDS deducted on payments',
    howto: 'Enter amount and TDS rate. Click Calculate TDS.',
    kw: ['tds', 'tax deducted', 'source', '194c', '194j']
  },
  {
    id: 'ppf-calculator',
    name: 'PPF Calculator',
    cat: 'calculators',
    icon: '🏦',
    desc: 'Calculate Public Provident Fund maturity',
    howto: 'Enter yearly investment, rate, tenure. Click Calculate PPF.',
    kw: ['ppf', 'public provident fund', 'tax saving', 'investment']
  },
  {
    id: 'nps-calculator',
    name: 'NPS Calculator',
    cat: 'calculators',
    icon: '💰',
    desc: 'Calculate National Pension Scheme corpus & pension',
    howto: 'Enter monthly contribution, age, retirement age. Click Calculate.',
    kw: ['nps', 'pension', 'retirement', 'national pension']
  },
  {
    id: 'cagr-calculator',
    name: 'CAGR Calculator',
    cat: 'calculators',
    icon: '📈',
    desc: 'Calculate Compound Annual Growth Rate of investment',
    howto: 'Enter initial value, final value, years. Click Calculate CAGR.',
    kw: ['cagr', 'growth rate', 'annual return', 'investment growth']
  },
  {
    id: 'inflation-calculator',
    name: 'Inflation Calculator',
    cat: 'calculators',
    icon: '📉',
    desc: 'Calculate impact of inflation on money value',
    howto: 'Enter amount, inflation rate, years. Click Calculate.',
    kw: ['inflation', 'price rise', 'value of money', 'purchasing power']
  },
  {
    id: 'retirement-calculator',
    name: 'Retirement Calculator',
    cat: 'calculators',
    icon: '🏖️',
    desc: 'Calculate retirement corpus needed for comfortable life',
    howto: 'Enter age, expenses, inflation. Click Calculate Corpus.',
    kw: ['retirement', 'corpus', 'pension', 'planning']
  },
  {
    id: 'break-even-calculator',
    name: 'Break-even Calculator',
    cat: 'calculators',
    icon: '📊',
    desc: 'Calculate break-even point for business',
    howto: 'Enter fixed cost, selling price, variable cost. Click Calculate.',
    kw: ['break even', 'business', 'profit', 'cost', 'bep']
  },
  {
    id: 'profit-margin-calculator',
    name: 'Profit Margin Calculator',
    cat: 'calculators',
    icon: '💹',
    desc: 'Calculate profit margin and markup percentage',
    howto: 'Enter cost and selling price. Click Calculate.',
    kw: ['profit margin', 'markup', 'business', 'profit', 'margin']
  },
  {
    id: 'rent-vs-buy-calculator',
    name: 'Rent vs Buy Calculator',
    cat: 'calculators',
    icon: '🏘️',
    desc: 'Compare cost of renting vs buying a property',
    howto: 'Enter property price, rent, tenure. Click Compare.',
    kw: ['rent vs buy', 'property', 'home loan', 'renting', 'buying']
  },
  {
    id: 'marriage-planner-calculator',
    name: 'Marriage / Baby Planner',
    cat: 'calculators',
    icon: '💍',
    desc: 'Calculate time to reach financial goals like marriage',
    howto: 'Enter savings, monthly amount, target. Click Calculate Timeline.',
    kw: ['marriage', 'baby', 'planning', 'savings', 'goal']
  },
  {
    id: 'yield-calculator',
    name: 'Yield Calculator',
    cat: 'calculators',
    icon: '📈',
    desc: 'Calculate annual yield and CAGR on investments',
    howto: 'Enter investment, current value, years. Click Calculate Yield.',
    kw: ['yield', 'return', 'investment', 'cagr', 'annual yield']
  }
];


window.CATEGORIES = CATEGORIES;

/* ============================================================
   TOOLS DATA
   ============================================================ */
const EXTRA_TOOLS = [
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    cat: 'generators',
    icon: '📱',
    desc: 'Generate QR codes for URLs and text instantly',
    howto: 'Paste any URL or text. Click Generate QR. Download as PNG or SVG, or Print. Perfect for sharing links, WiFi, contacts.',
    kw: ['qr', 'qr code', 'generator', 'url', 'link', 'scan']
  },
  {
    id: 'ctc-salary',
    name: 'CTC → In-Hand Salary',
    cat: 'calculators',
    icon: '💼',
    desc: 'Calculate your take-home salary from CTC',
    howto: 'Enter annual CTC, basic %, HRA %, PF, tax. Click Calculate to see monthly in-hand salary with full breakdown.',
    kw: ['ctc', 'salary', 'in-hand', 'take home', 'monthly salary', 'income', 'pf', 'tax']
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    cat: 'generators',
    icon: '🎫',
    desc: 'Generate barcodes for products',
    howto: 'Enter barcode text/number. Choose format. Click Generate. Download or Print.',
    kw: ['barcode', 'bar code', 'product', 'scan']
  },
  {
    id: 'resume-builder',
    name: 'Resume Builder',
    cat: 'students',
    icon: '📄',
    desc: 'Create professional ATS-friendly resume with PDF download',
    howto: 'Fill personal info, education, experience, skills. Choose template. Preview and download PDF.',
    kw: ['resume', 'cv', 'bio data', 'resume maker', 'cv builder', 'job', 'career']
  }
];

window.EXTRA_TOOLS = EXTRA_TOOLS;

/* ============================================================
   TOOL CARD HTML GENERATOR
   ============================================================ */
function extraToolCardHTML(t) {
  const cat = CATEGORIES.find(c => c.id === t.cat);
  const grad = cat ? cat.gradient : 'var(--gradient)';
  const isFav = (typeof isFavorite === 'function' && isFavorite(t.id));
  const fav = isFav ? 'active' : '';
  const star = isFav ? '★' : '☆';
  return `<div class="tool-card" data-extra-tool="${t.id}" onclick="openExtraTool('${t.id}')">
    <button class="fav-btn ${fav}" onclick="event.stopPropagation();if(typeof toggleFavorite==='function')toggleFavorite('${t.id}',event)" title="Favorite">${star}</button>
    <div class="tool-icon" style="background:${grad}">${t.icon}</div>
    <div class="tool-name">${t.name}</div>
    <div class="tool-desc">${t.desc}</div>
    <button class="tool-open-btn">Open Tool →</button>
  </div>`;
}
window.extraToolCardHTML = extraToolCardHTML;

/* ============================================================
   AUTO-INJECT CARDS (Home pe saare tools — hidden, sirf fallback)
   ============================================================ */
function injectExtraTools() {
  const allToolsGrid = document.getElementById('allTools');
  if (allToolsGrid) {
    const existing = allToolsGrid.querySelectorAll('[data-extra-tool]');
    if (existing.length === 0) {
      allToolsGrid.insertAdjacentHTML('beforeend', EXTRA_TOOLS.map(t => extraToolCardHTML(t)).join(''));
      console.log('%c✅ ' + EXTRA_TOOLS.length + ' tools injected', 'color:#10b981');
    }
  }
}
setTimeout(injectExtraTools, 100);

/* ============================================================
   TOOL OPEN HANDLER
   ============================================================ */
window.EXTRA_TOOL_RENDERERS = window.EXTRA_TOOL_RENDERERS || {};
window.EXTRA_TOOL_INITS = window.EXTRA_TOOL_INITS || {};

window.openExtraTool = function(toolId) {
  const tool = EXTRA_TOOLS.find(t => t.id === toolId);
  if (!tool) { if (typeof toast === 'function') toast('Tool not found', 'error'); return; }

  const titleEl = document.getElementById('toolTitle');
  const descEl = document.getElementById('toolDesc');
  const howtoEl = document.getElementById('toolHowTo');
  const bodyEl = document.getElementById('toolBody');

  if (titleEl) titleEl.textContent = tool.icon + ' ' + tool.name;
  if (descEl) descEl.textContent = tool.desc;
  document.title = tool.name + ' — Qunverio';

  const favBtn = document.getElementById('toolFavBtn');
  if (favBtn) {
    favBtn.dataset.tool = toolId;
    const isFav = (typeof isFavorite === 'function' && isFavorite(toolId));
    favBtn.textContent = isFav ? '★' : '☆';
    favBtn.classList.toggle('active', isFav);
    favBtn.onclick = (e) => { if (typeof toggleFavorite === 'function') toggleFavorite(toolId, e); };
  }

  if (howtoEl && tool.howto) {
    howtoEl.style.display = 'block';
    howtoEl.innerHTML = '<strong>📖 How to use:</strong> ' + tool.howto;
  }

  const renderer = window.EXTRA_TOOL_RENDERERS[toolId];
  if (bodyEl) {
    if (!renderer) {
      bodyEl.innerHTML = '<div class="card">Loading...</div>';
    } else {
      bodyEl.innerHTML = renderer();
      setTimeout(() => {
        if (window.EXTRA_TOOL_INITS[toolId]) window.EXTRA_TOOL_INITS[toolId]();
      }, 50);
    }
  }

  if (typeof addRecent === 'function') addRecent(toolId);
  if (typeof switchView === 'function') switchView('toolView');
};

/* ============================================================
   ULTRA HD PDF DOWNLOAD (4x resolution)
   ============================================================ */
window.extraDownloadPDF = function(boxId, filename) {
  const el = document.getElementById(boxId);
  if (!el || !el.classList.contains('active')) {
    if (typeof toast === 'function') toast('Calculate first', 'error');
    return;
  }
  if (typeof toast === 'function') toast('Generating Ultra HD PDF...');

  const clone = el.cloneNode(true);
  clone.querySelectorAll('.btn-group, .export-btns, .how-to-use, .no-print').forEach(n => n.remove());
  clone.style.background = '#ffffff';
  clone.style.color = '#111111';
  clone.style.padding = '40px';
  clone.style.width = '820px';
  clone.style.boxSizing = 'border-box';
  clone.style.fontFamily = 'Arial, sans-serif';

  clone.querySelectorAll('.result-main').forEach(e => {
    const c = e.style.color || '#4f46e5';
    e.style.background = 'none';
    e.style.webkitTextFillColor = c;
    e.style.color = c;
    e.style.fontSize = '36px';
    e.style.fontWeight = '900';
  });
  clone.querySelectorAll('*').forEach(e => {
    const cs = window.getComputedStyle(e);
    if (cs.webkitTextFillColor === 'transparent' || cs.color === 'rgba(0, 0, 0, 0)') {
      e.style.webkitTextFillColor = '#111111';
      e.style.color = '#111111';
      e.style.background = 'none';
    }
  });
  clone.querySelectorAll('[style*="var(--surface-2)"]').forEach(row => {
    row.style.background = '#1c2250';
    row.querySelectorAll('*').forEach(el => {
      el.style.color = '#ffffff';
      el.style.webkitTextFillColor = '#ffffff';
    });
  });
  clone.querySelectorAll('.k, .result-sub, .result-title, .card-title').forEach(e => {
    if (e.closest('[style*="var(--surface-2)"]')) return;
    e.style.color = '#555555';
  });
  clone.querySelectorAll('.v').forEach(e => {
    if (e.closest('[style*="var(--surface-2)"]')) return;
    e.style.color = '#111111';
  });

  const header = document.createElement('div');
  header.innerHTML = `
    <div style="display:flex;justify-content:space-between;padding-bottom:16px;border-bottom:3px solid #6366f1;margin-bottom:20px">
      <div style="font-size:28px;font-weight:900;color:#6366f1">⚡ Qunverio</div>
      <div style="font-size:14px;color:#888">${new Date().toLocaleString('en-IN')}</div>
    </div>`;
  clone.insertBefore(header, clone.firstChild);

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-99999px;top:0;background:#fff;width:820px;padding:0;margin:0;';
  wrap.appendChild(clone);
  document.body.appendChild(wrap);

  setTimeout(() => {
    if (!window.htmlToImage) { toast('Library not loaded', 'error'); document.body.removeChild(wrap); return; }
    htmlToImage.toPng(clone, { quality: 1.0, pixelRatio: 4, backgroundColor: '#ffffff' })
      .then(dataUrl => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const img = new Image();
        img.onload = () => {
          const ratio = img.width / img.height;
          let w = pw - 20, h = w / ratio;
          if (h > ph - 20) { h = ph - 20; w = h * ratio; }
          pdf.addImage(dataUrl, 'PNG', (pw - w) / 2, 10, w, h, undefined, 'FAST');
          pdf.save((filename || 'qunverio') + '.pdf');
          toast('Ultra HD PDF downloaded ✅', 'success');
        };
        img.src = dataUrl;
      })
      .catch(err => { console.error(err); toast('PDF failed', 'error'); })
      .finally(() => document.body.removeChild(wrap));
  }, 400);
};

/* ============================================================
   ULTRA HD IMAGE DOWNLOAD (4x resolution)
   ============================================================ */
window.extraDownloadImage = function(boxId, filename) {
  const el = document.getElementById(boxId);
  if (!el || !el.classList.contains('active')) {
    if (typeof toast === 'function') toast('Calculate first', 'error');
    return;
  }
  if (typeof toast === 'function') toast('Generating Ultra HD Image...');

  const clone = el.cloneNode(true);
  clone.querySelectorAll('.btn-group, .export-btns, .how-to-use, .no-print').forEach(n => n.remove());
  clone.style.background = '#ffffff';
  clone.style.color = '#111111';
  clone.style.padding = '40px';
  clone.style.width = '820px';
  clone.style.boxSizing = 'border-box';
  clone.style.fontFamily = 'Arial, sans-serif';

  clone.querySelectorAll('.result-main').forEach(e => {
    const c = e.style.color || '#4f46e5';
    e.style.background = 'none';
    e.style.webkitTextFillColor = c;
    e.style.color = c;
    e.style.fontSize = '36px';
    e.style.fontWeight = '900';
  });
  clone.querySelectorAll('*').forEach(e => {
    const cs = window.getComputedStyle(e);
    if (cs.webkitTextFillColor === 'transparent' || cs.color === 'rgba(0, 0, 0, 0)') {
      e.style.webkitTextFillColor = '#111111';
      e.style.color = '#111111';
      e.style.background = 'none';
    }
  });
  clone.querySelectorAll('[style*="var(--surface-2)"]').forEach(row => {
    row.style.background = '#1c2250';
    row.querySelectorAll('*').forEach(el => {
      el.style.color = '#ffffff';
      el.style.webkitTextFillColor = '#ffffff';
    });
  });
  clone.querySelectorAll('.k, .result-sub, .result-title, .card-title').forEach(e => {
    if (e.closest('[style*="var(--surface-2)"]')) return;
    e.style.color = '#555555';
  });
  clone.querySelectorAll('.v').forEach(e => {
    if (e.closest('[style*="var(--surface-2)"]')) return;
    e.style.color = '#111111';
  });

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-99999px;top:0;background:#fff;width:820px;padding:0;margin:0;';
  wrap.appendChild(clone);
  document.body.appendChild(wrap);

  setTimeout(() => {
    if (!window.htmlToImage) { toast('Library not loaded', 'error'); document.body.removeChild(wrap); return; }
    htmlToImage.toPng(clone, { quality: 1.0, pixelRatio: 4, backgroundColor: '#ffffff' })
      .then(dataUrl => {
        const a = document.createElement('a');
        a.download = (filename || 'qunverio') + '.png';
        a.href = dataUrl;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        toast('Ultra HD Image downloaded ✅', 'success');
      })
      .catch(err => { console.error(err); toast('Image failed', 'error'); })
      .finally(() => document.body.removeChild(wrap));
  }, 400);
};

/* ============================================================
   UNIVERSAL PRINT
   ============================================================ */
window.extraPrint = function(boxId, title) {
  const el = document.getElementById(boxId);
  if (!el || !el.classList.contains('active')) {
    if (typeof toast === 'function') toast('Calculate first', 'error');
    return;
  }

  const clone = el.cloneNode(true);
  clone.querySelectorAll('.btn-group, .export-btns, .how-to-use, .no-print').forEach(n => n.remove());
  clone.querySelectorAll('.result-main').forEach(e => {
    const c = e.style.color || '#4f46e5';
    e.style.background = 'none';
    e.style.webkitTextFillColor = c;
    e.style.color = c;
    e.style.fontSize = '28px';
    e.style.fontWeight = '900';
  });
  clone.querySelectorAll('*').forEach(e => {
    const cs = window.getComputedStyle(e);
    if (cs.webkitTextFillColor === 'transparent' || cs.color === 'rgba(0, 0, 0, 0)') {
      e.style.webkitTextFillColor = '#111111';
      e.style.color = '#111111';
      e.style.background = 'none';
    }
  });
  clone.querySelectorAll('[style*="var(--surface-2)"]').forEach(row => {
    row.style.background = '#1c2250';
    row.querySelectorAll('*').forEach(el => {
      el.style.color = '#ffffff';
      el.style.webkitTextFillColor = '#ffffff';
    });
  });
  clone.querySelectorAll('.k, .result-sub, .result-title, .card-title').forEach(e => {
    if (e.closest('[style*="var(--surface-2)"]')) return;
    e.style.color = '#555555';
  });
  clone.querySelectorAll('.v').forEach(e => {
    if (e.closest('[style*="var(--surface-2)"]')) return;
    e.style.color = '#111111';
  });

  const header = `<div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:2px solid #6366f1;margin-bottom:14px;font-family:Arial,sans-serif"><div style="font-size:18px;font-weight:900;color:#6366f1">⚡ Qunverio</div><div style="font-size:11px;color:#888">${new Date().toLocaleString('en-IN')}</div></div>${title ? `<div style="font-size:16px;font-weight:700;color:#111;margin-bottom:12px;font-family:Arial,sans-serif">${title}</div>` : ''}`;

  const html = `<!DOCTYPE html><html><head><title>Qunverio Print</title><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;padding:20px;color:#111;background:#fff}
    .result-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;font-size:14px;gap:10px}
    .result-row .k{color:#555;font-weight:500}
    .result-row .v{color:#111;font-weight:700;text-align:right}
    .result-main{font-size:28px;font-weight:900;color:#4f46e5;margin-bottom:6px}
    .result-sub{color:#666;font-size:13px;margin-bottom:14px}
    .result-title{font-size:12px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;padding-bottom:8px;border-bottom:1px dashed #ccc}
    .card-title{font-size:13px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:.06em;margin:14px 0 8px}
    img{max-width:100%;height:auto;border-radius:8px}
    @media print{body{padding:10px}}
  </style></head><body>${header}${clone.outerHTML}</body></html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 500);
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 1000);
  }, 500);
};

/* ============================================================
   COPY & SHARE
   ============================================================ */
window.extraCopy = function(text) {
  if (!text) { if (typeof toast === 'function') toast('Nothing to copy', 'error'); return; }
  navigator.clipboard.writeText(text).then(() => toast('Copied!', 'success')).catch(() => toast('Copy failed', 'error'));
};
window.extraShare = function(title, text) {
  if (!text) return;
  if (navigator.share) navigator.share({ title: title || 'Qunverio', text }).catch(() => {});
  else window.extraCopy(text);
};

/* ============================================================
   CATEGORY HELPERS
   ============================================================ */
window.getCategoryById = function(id) {
  return CATEGORIES.find(c => c.id === id);
};
window.getToolsByCategory = function(catId) {
  return EXTRA_TOOLS.filter(t => t.cat === catId);
};
window.getToolCategoryName = function(toolId) {
  const tool = EXTRA_TOOLS.find(t => t.id === toolId);
  if (!tool) return '';
  const cat = CATEGORIES.find(c => c.id === tool.cat);
  return cat ? cat.name : '';
};

console.log('%c✅ Setup loaded — ' + EXTRA_TOOLS.length + ' tools, ' + CATEGORIES.length + ' categories', 'color:#10b981;font-weight:bold;font-size:14px');