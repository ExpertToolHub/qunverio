/* ============================================================
   QUNVERIO — COMMON SETUP (tools/setup.js)
   Sab tools ke liye common code
   ============================================================ */

console.log('%cQunverio Setup Loading...', 'color:#10b981;font-weight:bold');

/* ============================================================
   TOOLS DATA
   ============================================================ */
const EXTRA_TOOLS = [
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    cat: 'utility',
    icon: '📱',
    desc: 'Generate QR codes for URLs and text instantly',
    howto: 'Paste any URL or text. Click Generate QR. Download as PNG or SVG, or Print. Perfect for sharing links, WiFi, contacts.',
    kw: ['qr', 'qr code', 'generator', 'url', 'link', 'scan']
  },
  {
    id: 'ctc-salary',
    name: 'CTC → In-Hand Salary',
    cat: 'finance',
    icon: '💼',
    desc: 'Calculate your take-home salary from CTC',
    howto: 'Enter annual CTC, basic %, HRA %, PF, tax. Click Calculate to see monthly in-hand salary with full breakdown.',
    kw: ['ctc', 'salary', 'in-hand', 'take home', 'monthly salary', 'income', 'pf', 'tax']
  }
];

window.EXTRA_TOOLS = EXTRA_TOOLS;

/* ============================================================
   TOOL CARD HTML GENERATOR
   ============================================================ */
function extraToolCardHTML(t) {
  const catMap = {
    'finance': 'linear-gradient(135deg,#22c55e,#10b981)',
    'utility': 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'pdf':     'linear-gradient(135deg,#ef4444,#f97316)',
    'photo':   'linear-gradient(135deg,#ec4899,#8b5cf6)',
    'student': 'linear-gradient(135deg,#8b5cf6,#6366f1)'
  };
  const grad = catMap[t.cat] || 'var(--gradient)';
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
   AUTO-INJECT CARDS
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
  // Dark blue rows → white text
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

console.log('%c✅ Setup loaded — ' + EXTRA_TOOLS.length + ' tools ready', 'color:#10b981;font-weight:bold;font-size:14px');