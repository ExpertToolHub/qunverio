/* ============================================================
   QUNVERIO — AI STUDY NOTES GENERATOR
   File: tools/study-notes.js
   Final Version (v16) — Text cut/overlap fix
   ============================================================ */

(function () {
  'use strict';

  const QVSN_API_URL = 'https://qunverio-study-notes.rakeshyadav81098.workers.dev';

  const QVSN_STATE = {
    fullPrompt: '',
    depth: 'standard',
    language: 'english',
    penColor: 'blue',
    rawText: '',
    partNumber: 0,
    isGenerating: false,
    autoMode: false,
    isEditing: false,
    draftKey: 'qvsn_draft_v16'
  };

  const QVSN_DIAGRAMS = {
    solar_panel: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="30" width="80" height="50" fill="#1e40af" stroke="#0f172a" stroke-width="2"/><line x1="30" y1="30" x2="30" y2="80" stroke="#0f172a" stroke-width="1"/><line x1="50" y1="30" x2="50" y2="80" stroke="#0f172a" stroke-width="1"/><line x1="70" y1="30" x2="70" y2="80" stroke="#0f172a" stroke-width="1"/><line x1="10" y1="55" x2="90" y2="55" stroke="#0f172a" stroke-width="1"/><circle cx="75" cy="20" r="8" fill="#fbbf24"/></svg>',
    circuit: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="40" width="60" height="20" fill="none" stroke="#1e40af" stroke-width="2"/><line x1="10" y1="50" x2="20" y2="50" stroke="#1e40af" stroke-width="2"/><line x1="80" y1="50" x2="90" y2="50" stroke="#1e40af" stroke-width="2"/><circle cx="50" cy="50" r="6" fill="#dc2626"/></svg>',
    graph: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><line x1="15" y1="85" x2="90" y2="85" stroke="#0f172a" stroke-width="2"/><line x1="15" y1="85" x2="15" y2="10" stroke="#0f172a" stroke-width="2"/><polyline points="15,75 35,60 55,65 75,35 90,20" fill="none" stroke="#dc2626" stroke-width="2"/></svg>',
    flowchart: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="35" y="5" width="30" height="15" fill="#e0e7ff" stroke="#1e40af" stroke-width="1.5"/><line x1="50" y1="20" x2="50" y2="35" stroke="#1e40af" stroke-width="1.5"/><rect x="35" y="35" width="30" height="15" fill="#e0e7ff" stroke="#1e40af" stroke-width="1.5"/><line x1="50" y1="50" x2="50" y2="65" stroke="#1e40af" stroke-width="1.5"/><rect x="35" y="65" width="30" height="15" fill="#e0e7ff" stroke="#1e40af" stroke-width="1.5"/></svg>',
    microscope: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="20" width="8" height="40" fill="#1e40af"/><circle cx="44" cy="18" r="6" fill="#0f172a"/><rect x="30" y="60" width="40" height="8" fill="#1e40af"/><line x1="44" y1="68" x2="44" y2="85" stroke="#0f172a" stroke-width="3"/></svg>',
    atom: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="8" fill="#dc2626"/><ellipse cx="50" cy="50" rx="35" ry="14" fill="none" stroke="#1e40af" stroke-width="1.5"/><ellipse cx="50" cy="50" rx="35" ry="14" fill="none" stroke="#1e40af" stroke-width="1.5" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="35" ry="14" fill="none" stroke="#1e40af" stroke-width="1.5" transform="rotate(120 50 50)"/></svg>',
    plant: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="90" x2="50" y2="40" stroke="#166534" stroke-width="3"/><path d="M50 60 Q30 50 25 35 Q40 40 50 60" fill="#22c55e"/><path d="M50 50 Q70 40 75 25 Q60 30 50 50" fill="#22c55e"/><ellipse cx="50" cy="92" rx="20" ry="5" fill="#78350f"/></svg>',
    human_heart: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 85 C20 60 20 30 40 25 C50 22 50 35 50 35 C50 35 50 22 60 25 C80 30 80 60 50 85 Z" fill="#dc2626" stroke="#0f172a" stroke-width="1.5"/></svg>',
    dna: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 10 Q70 30 30 50 Q70 70 30 90" fill="none" stroke="#1e40af" stroke-width="2"/><path d="M70 10 Q30 30 70 50 Q30 70 70 90" fill="none" stroke="#dc2626" stroke-width="2"/></svg>',
    water_cycle: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="25" r="10" fill="#fbbf24"/><path d="M10 60 Q30 40 50 60 Q70 80 90 60" fill="none" stroke="#3b82f6" stroke-width="2"/></svg>'
  };

  function qvsnConvertLatex(formula) {
    let f = formula;
    const subMap = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','a':'ₐ','e':'ₑ','h':'ₕ','i':'ᵢ','j':'ⱼ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ','o':'ₒ','p':'ₚ','r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ','x':'ₓ' };
    const supMap = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','n':'ⁿ','i':'ⁱ','x':'ˣ','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','g':'ᵍ','h':'ʰ','j':'ʲ','k':'ᵏ','l':'ˡ','m':'ᵐ','o':'ᵒ','p':'ᵖ','r':'ʳ','s':'ˢ','t':'ᵗ','u':'ᵘ','v':'ᵛ','w':'ʷ','y':'ʸ','z':'ᶻ' };

    let prev = ''; let iter = 5;
    while (f !== prev && iter > 0) { prev = f; f = f.replace(/\\?frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)'); iter--; }
    prev = ''; iter = 5;
    while (f !== prev && iter > 0) { prev = f; f = f.replace(/\\?sqrt\{([^{}]+)\}/g, '√($1)'); iter--; }

    f = f.replace(/_\{([^}]+)\}/g, function (m, s) { return s.split('').map(function (c) { return subMap[c] || c; }).join(''); });
    f = f.replace(/_([0-9a-zA-Z])/g, function (m, c) { return subMap[c] || ('_' + c); });
    f = f.replace(/\^\{([^}]+)\}/g, function (m, s) { return s.split('').map(function (c) { return supMap[c] || ('^' + c); }).join(''); });
    f = f.replace(/\^([0-9ni])/g, function (m, c) { return supMap[c] || ('^' + c); });

    const greekMap = {
      'rho': 'ρ', 'sigma': 'σ', 'tau': 'τ', 'phi': 'φ',
      'theta': 'θ', 'alpha': 'α', 'beta': 'β', 'gamma': 'γ',
      'delta': 'δ', 'eta': 'η', 'mu': 'μ', 'nu': 'ν',
      'pi': 'π', 'omega': 'ω', 'lambda': 'λ', 'epsilon': 'ε',
      'varepsilon': 'ε', 'zeta': 'ζ', 'iota': 'ι', 'kappa': 'κ',
      'xi': 'ξ', 'upsilon': 'υ', 'chi': 'χ', 'psi': 'ψ',
      'Delta': 'Δ', 'Omega': 'Ω', 'Sigma': 'Σ', 'Pi': 'Π',
      'Phi': 'Φ', 'Theta': 'Θ', 'Lambda': 'Λ', 'Gamma': 'Γ'
    };

    f = f.replace(/\\([a-zA-Z]+)/g, function(m, name) {
      return greekMap[name] || m;
    });

    f = f.replace(/\$([a-zA-Z]+)\$/g, function(m, name) {
      return greekMap[name] || name;
    });

    f = f.replace(/\\times/g, ' × ').replace(/\\cdot/g, ' · ').replace(/\\div/g, ' ÷ ')
      .replace(/\\pm/g, ' ± ').replace(/\\mp/g, ' ∓ ').replace(/\\leq/g, ' ≤ ').replace(/\\geq/g, ' ≥ ')
      .replace(/\\neq/g, ' ≠ ').replace(/\\approx/g, ' ≈ ').replace(/\\equiv/g, ' ≡ ').replace(/\\propto/g, ' ∝ ')
      .replace(/\\infty/g, ' ∞ ').replace(/\\rightarrow/g, ' → ').replace(/\\leftarrow/g, ' ← ')
      .replace(/\\leftrightarrow/g, ' ↔ ').replace(/\\Rightarrow/g, ' ⇒ ').replace(/\\Leftarrow/g, ' ⇐ ')
      .replace(/\\sum/g, ' Σ ').replace(/\\prod/g, ' ∏ ').replace(/\\int/g, ' ∫ ').replace(/\\partial/g, ' ∂ ')
      .replace(/\\nabla/g, ' ∇ ')
      .replace(/\\text\{([^}]+)\}/g, '$1').replace(/\\mathrm\{([^}]+)\}/g, '$1')
      .replace(/\\mathbf\{([^}]+)\}/g, '$1').replace(/\\left/g, '').replace(/\\right/g, '');

    f = f.replace(/\\/g, '');
    f = f.replace(/\$/g, '');
    f = f.replace(/[{}]/g, '');
    f = f.replace(/\s+/g, ' ').trim();

    return f;
  }

  const QVSN_CSS = `
.qvsn-wrap {
  max-width: 700px; margin: 0 auto; padding: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1f2937; background: #f8fafc;
}
.qvsn-header { text-align: center; margin-bottom: 16px; }
.qvsn-title {
  font-size: 1.5rem; font-weight: 800; letter-spacing: -0.3px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  margin: 0;
}
.qvsn-sub { color: #64748b; font-size: 0.82rem; margin-top: 4px; }

.qvsn-card {
  background: #ffffff; border-radius: 12px; padding: 14px;
  margin-bottom: 12px; border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.qvsn-label {
  display: block; font-size: 0.78rem; color: #475569;
  margin-bottom: 5px; font-weight: 600;
}

.qvsn-textarea, .qvsn-input, .qvsn-select {
  width: 100%; padding: 10px 12px; border-radius: 8px;
  border: 1px solid #d1d5db; background: #ffffff; color: #1f2937;
  font-size: 0.88rem; font-family: inherit; outline: none;
  box-sizing: border-box; transition: border-color 0.15s;
}
.qvsn-textarea { resize: vertical; min-height: 90px; line-height: 1.5; }
.qvsn-textarea:focus, .qvsn-input:focus, .qvsn-select:focus {
  border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}
.qvsn-textarea::placeholder { color: #cbd5e1; font-style: italic; }

.qvsn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
.qvsn-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 10px; }

.qvsn-btn {
  width: 100%; padding: 12px; border: none; border-radius: 10px;
  font-size: 0.92rem; font-weight: 700; cursor: pointer; font-family: inherit;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  color: #fff; margin-top: 12px;
  transition: transform 0.1s, box-shadow 0.2s;
  box-shadow: 0 3px 10px rgba(99,102,241,0.25);
}
.qvsn-btn:hover:not(:disabled) { transform: translateY(-1px); }
.qvsn-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.qvsn-btn-secondary {
  background: #ffffff; color: #4f46e5; border: 1.5px solid #c7d2fe;
  box-shadow: none;
}
.qvsn-btn-secondary:hover:not(:disabled) { background: #eef2ff; }
.qvsn-btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 3px 10px rgba(16,185,129,0.25);
}

.qvsn-status { text-align: center; padding: 10px; font-size: 0.82rem; color: #6366f1; font-weight: 500; }
.qvsn-error {
  background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
  padding: 10px 12px; border-radius: 8px; margin-top: 10px; font-size: 0.82rem; line-height: 1.4;
}
.qvsn-success {
  background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a;
  padding: 10px 12px; border-radius: 8px; margin-top: 10px; font-size: 0.82rem; font-weight: 500;
}
.qvsn-counter { font-size: 0.68rem; color: #94a3b8; text-align: right; margin-top: 2px; font-variant-numeric: tabular-nums; }
.qvsn-counter.warn { color: #f59e0b; }

.qvsn-toggle {
  display: flex; gap: 6px; margin-top: 10px; padding: 3px;
  background: #f1f5f9; border-radius: 8px;
}
.qvsn-toggle button {
  flex: 1; padding: 8px 12px; border: none; background: transparent;
  border-radius: 6px; cursor: pointer; font-family: inherit;
  font-size: 0.8rem; font-weight: 600; color: #64748b; transition: all 0.15s;
}
.qvsn-toggle button.active { background: #ffffff; color: #4f46e5; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

.qvsn-progress-wrap { margin-top: 10px; }
.qvsn-progress-bar { width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
.qvsn-progress-fill {
  height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
  border-radius: 3px; transition: width 0.3s ease; width: 0%;
}
.qvsn-progress-text { text-align: center; font-size: 0.75rem; color: #64748b; margin-top: 6px; }

.qvsn-pages { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
.qvsn-page {
  background: #fefefe; color: #1e3a8a; width: 100%;
  aspect-ratio: 210 / 297; padding: 14mm 10mm 10mm 18mm;
  position: relative; border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  font-family: 'Kalam', cursive, sans-serif;
  overflow: hidden; box-sizing: border-box;
  background-image: repeating-linear-gradient(transparent, transparent 25px, #e5e7eb 25px, #e5e7eb 26px);
  background-size: 100% 26px; background-position: 0 14mm;
  line-height: 26px; font-size: 13px;
}
.qvsn-page::before {
  content: ''; position: absolute; top: 0; bottom: 0; left: 18mm;
  width: 1.5px; background: #fca5a5;
}
.qvsn-page-num {
  position: absolute; bottom: 5mm; right: 8mm;
  font-size: 10px; color: #9ca3af; font-weight: 500;
}
.qvsn-h1 { color: #dc2626; font-weight: 700; font-size: 18px; margin: 0 0 8px; line-height: 26px; border-bottom: 2px solid #fecaca; padding-bottom: 2px; }
.qvsn-h2 { color: #1d4ed8; font-weight: 700; font-size: 15px; margin: 12px 0 4px; line-height: 26px; border-left: 4px solid #3b82f6; padding-left: 8px; }
.qvsn-h3 { color: #7c3aed; font-weight: 700; font-size: 13px; margin: 10px 0 4px; line-height: 26px; font-style: italic; }
.qvsn-p { margin: 0; line-height: 26px; color: #1e3a8a; }
.qvsn-ul { margin: 0; padding-left: 20px; line-height: 26px; color: #1e3a8a; }
.qvsn-def {
  background: linear-gradient(90deg, rgba(250,204,21,0.3) 0%, rgba(250,204,21,0.15) 100%);
  border-left: 4px solid #f59e0b; padding: 5px 10px; margin: 4px 0;
  border-radius: 6px; line-height: 26px; color: #78350f; font-size: 12.5px;
}
.qvsn-formula {
  background: linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%);
  border: 1.5px dashed #3b82f6; padding: 6px 10px; margin: 6px 0;
  border-radius: 6px; font-weight: 700; text-align: center; line-height: 26px;
  color: #1e40af; word-wrap: break-word; overflow-wrap: break-word; font-size: 12.5px;
}
.qvsn-diagram { display: flex; justify-content: center; margin: 6px 0; }
.qvsn-diagram svg { width: 70px; height: 70px; }

.qvsn-pen-black .qvsn-p, .qvsn-pen-black .qvsn-ul, .qvsn-pen-black .qvsn-page { color: #111827; }
.qvsn-pen-green .qvsn-p, .qvsn-pen-green .qvsn-ul, .qvsn-pen-green .qvsn-page { color: #166534; }
.qvsn-page[contenteditable="true"] { outline: 2px dashed #6366f1; outline-offset: 4px; }

.qvsn-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.qvsn-actions .qvsn-btn { margin-top: 0; }

@media (max-width: 640px) {
  .qvsn-wrap { padding: 12px 10px 24px; }
  .qvsn-title { font-size: 1.3rem; }
  .qvsn-card { padding: 12px; border-radius: 10px; }
  .qvsn-row { grid-template-columns: 1fr; gap: 8px; }
  .qvsn-row3 { grid-template-columns: 1fr 1fr; gap: 6px; }
  .qvsn-page {
    padding: 10mm 6mm 8mm 14mm; font-size: 11.5px; line-height: 22px;
    background-size: 100% 22px; background-position: 0 10mm;
  }
  .qvsn-page::before { left: 14mm; }
  .qvsn-h1 { font-size: 15px; line-height: 22px; }
  .qvsn-h2 { font-size: 13px; line-height: 22px; }
  .qvsn-h3 { font-size: 11.5px; line-height: 22px; }
  .qvsn-p, .qvsn-ul { line-height: 22px; }
  .qvsn-def { font-size: 11px; line-height: 22px; }
  .qvsn-formula { font-size: 11px; line-height: 22px; }
}`;

  function qvsnInjectCSS() {
    if (document.getElementById('qvsn-styles')) return;
    const style = document.createElement('style');
    style.id = 'qvsn-styles';
    style.textContent = QVSN_CSS;
    document.head.appendChild(style);
    if (!document.getElementById('qvsn-font')) {
      const link = document.createElement('link');
      link.id = 'qvsn-font'; link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap';
      document.head.appendChild(link);
    }
    if (!document.getElementById('qvsn-inter')) {
      const link2 = document.createElement('link');
      link2.id = 'qvsn-inter'; link2.rel = 'stylesheet';
      link2.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link2);
    }
  }

  function qvsnLoadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed: ' + src)); };
      document.head.appendChild(s);
    });
  }

  async function qvsnEnsureLibraries() {
    if (typeof html2canvas === 'undefined') await qvsnLoadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    if (!window.jspdf || !window.jspdf.jsPDF) await qvsnLoadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    if (typeof htmlToImage === 'undefined') await qvsnLoadScript('https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js');
  }

  function qvsnRenderHTML() {
    return `
<div class="qvsn-wrap">
  <div class="qvsn-header">
    <div class="qvsn-title">📚 AI Study Notes Generator</div>
    <div class="qvsn-sub">Topic daalo → AI notes banayega → PNG/PDF export karo</div>
  </div>

  <div class="qvsn-card">
    <label class="qvsn-label" for="qvsn-prompt">📝 Topic / Full Prompt</label>
    <textarea id="qvsn-prompt" class="qvsn-textarea" placeholder="Yahan apna topic likho..." maxlength="2000"></textarea>
    <div class="qvsn-counter" id="qvsn-counter">0 / 2000</div>

    <div class="qvsn-row3">
      <div>
        <label class="qvsn-label" for="qvsn-language">🌐 Language</label>
        <select id="qvsn-language" class="qvsn-select">
          <option value="english" selected>English</option>
          <option value="hindi">Hindi</option>
          <option value="hinglish">Hinglish</option>
        </select>
      </div>
      <div>
        <label class="qvsn-label" for="qvsn-depth">📊 Depth</label>
        <select id="qvsn-depth" class="qvsn-select">
          <option value="basic">Basic</option>
          <option value="standard" selected>Standard</option>
          <option value="deep">Deep</option>
        </select>
      </div>
      <div>
        <label class="qvsn-label" for="qvsn-pen">🖊️ Pen</label>
        <select id="qvsn-pen" class="qvsn-select">
          <option value="blue" selected>Blue</option>
          <option value="black">Black</option>
          <option value="green">Green</option>
        </select>
      </div>
    </div>

    <label class="qvsn-label" style="margin-top:12px;">⚙️ Mode</label>
    <div class="qvsn-toggle" id="qvsn-mode-toggle">
      <button type="button" data-mode="manual" class="active">🎯 Manual (1 click = 1 part)</button>
      <button type="button" data-mode="auto">🚀 Auto (sab generate karo)</button>
    </div>

    <button id="qvsn-generate" class="qvsn-btn">✨ Generate Notes</button>
    <div id="qvsn-status" class="qvsn-status" style="display:none;"></div>
    <div id="qvsn-error" class="qvsn-error" style="display:none;"></div>
    <div id="qvsn-success" class="qvsn-success" style="display:none;"></div>
  </div>

  <div id="qvsn-progress-wrap" class="qvsn-card" style="display:none;">
    <div class="qvsn-progress-bar"><div class="qvsn-progress-fill" id="qvsn-progress-fill"></div></div>
    <div class="qvsn-progress-text" id="qvsn-progress-text">Ready</div>
  </div>

  <div id="qvsn-actions-wrap" class="qvsn-card" style="display:none;">
    <button id="qvsn-more" class="qvsn-btn qvsn-btn-success" style="display:none;">🔄 Generate More (Part <span id="qvsn-part-num">2</span>)</button>
    <button id="qvsn-done" class="qvsn-btn qvsn-btn-secondary" style="display:none;">✅ Done — Merge All</button>
    <div class="qvsn-actions" style="margin-top:10px;">
      <button id="qvsn-edit" class="qvsn-btn qvsn-btn-secondary">✏️ Edit</button>
      <button id="qvsn-png" class="qvsn-btn qvsn-btn-secondary">🖼️ PNG (HD)</button>
      <button id="qvsn-pdf" class="qvsn-btn qvsn-btn-secondary">📄 PDF</button>
      <button id="qvsn-print" class="qvsn-btn qvsn-btn-secondary">🖨️ Print</button>
      <button id="qvsn-clear" class="qvsn-btn qvsn-btn-secondary" style="grid-column: span 2;">🗑️ Clear All</button>
    </div>
  </div>

  <div id="qvsn-pages" class="qvsn-pages"></div>
</div>`;
  }

  function qvsnShowStatus(msg) { const el = document.getElementById('qvsn-status'); if (el) { el.textContent = msg; el.style.display = 'block'; } }
  function qvsnHideStatus() { const el = document.getElementById('qvsn-status'); if (el) el.style.display = 'none'; }
  function qvsnShowError(msg) { const el = document.getElementById('qvsn-error'); if (el) { el.textContent = msg; el.style.display = 'block'; } }
  function qvsnHideError() { const el = document.getElementById('qvsn-error'); if (el) el.style.display = 'none'; }
  function qvsnShowSuccess(msg) { const el = document.getElementById('qvsn-success'); if (el) { el.textContent = msg; el.style.display = 'block'; } }
  function qvsnHideSuccess() { const el = document.getElementById('qvsn-success'); if (el) el.style.display = 'none'; }
  function qvsnEsc(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function qvsnUpdateCounter() {
    const input = document.getElementById('qvsn-prompt');
    const counter = document.getElementById('qvsn-counter');
    if (!input || !counter) return;
    const len = input.value.length;
    counter.textContent = len + ' / 2000';
    if (len > 1800) counter.classList.add('warn');
    else counter.classList.remove('warn');
  }

  function qvsnUpdateProgress(percent, text) {
    const fill = document.getElementById('qvsn-progress-fill');
    const txt = document.getElementById('qvsn-progress-text');
    const wrap = document.getElementById('qvsn-progress-wrap');
    if (wrap) wrap.style.display = 'block';
    if (fill) fill.style.width = percent + '%';
    if (txt) txt.textContent = text;
  }

  async function qvsnGeneratePart(isFirstPart) {
    if (QVSN_STATE.isGenerating) return;
    QVSN_STATE.isGenerating = true;

    const fullPrompt = (document.getElementById('qvsn-prompt') || {}).value || '';
    const language = (document.getElementById('qvsn-language') || {}).value || 'english';
    const depth = (document.getElementById('qvsn-depth') || {}).value || 'standard';

    if (isFirstPart && !fullPrompt.trim()) {
      qvsnShowError('Pehle topic toh likho!');
      QVSN_STATE.isGenerating = false;
      return;
    }

    if (isFirstPart && fullPrompt.length > 2000) {
      qvsnShowError('Topic bahut lamba hai (max 2000 characters).');
      QVSN_STATE.isGenerating = false;
      return;
    }

    const nextPart = isFirstPart ? 1 : (QVSN_STATE.partNumber + 1);
    const topic = fullPrompt.split('\n')[0].trim().slice(0, 100);

    qvsnHideError();
    qvsnHideSuccess();
    qvsnShowStatus(`🤖 Part ${nextPart} generate ho raha hai...`);
    qvsnUpdateProgress(10, `Part ${nextPart} start...`);

    const genBtn = document.getElementById('qvsn-generate');
    const moreBtn = document.getElementById('qvsn-more');
    const doneBtn = document.getElementById('qvsn-done');
    if (genBtn) genBtn.disabled = true;
    if (moreBtn) moreBtn.disabled = true;

    try {
      qvsnUpdateProgress(30, `Part ${nextPart}: AI soch raha hai...`);

      const res = await fetch(QVSN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic,
          fullPrompt: fullPrompt.trim(),
          previousContent: isFirstPart ? '' : QVSN_STATE.rawText,
          partNumber: nextPart,
          level: 'detailed',
          depth: depth,
          language: language
        })
      });

      qvsnUpdateProgress(70, `Part ${nextPart}: Response process ho raha hai...`);

      let data;
      try { data = await res.json(); } catch (e) { throw new Error('Server response invalid (HTTP ' + res.status + ')'); }
      if (!res.ok || !data.success) throw new Error((data && data.error) || 'AI response empty');

      if (data.allCovered) {
        qvsnUpdateProgress(100, `✅ Saare topics cover ho gaye!`);
        qvsnShowSuccess('🎉 Saare topics cover ho gaye! Ab export kar sakte ho.');
        if (moreBtn) moreBtn.style.display = 'none';
        if (doneBtn) doneBtn.style.display = 'block';
        if (genBtn) genBtn.disabled = false;
        QVSN_STATE.isGenerating = false;
        return;
      }

      if (isFirstPart) {
        QVSN_STATE.rawText = data.text;
      } else {
        QVSN_STATE.rawText = QVSN_STATE.rawText + '\n\n' + data.text;
      }

      QVSN_STATE.partNumber = nextPart;
      QVSN_STATE.fullPrompt = fullPrompt.trim();
      QVSN_STATE.depth = depth;
      QVSN_STATE.language = language;

      qvsnRenderPages(QVSN_STATE.rawText);
      qvsnSaveDraft();

      qvsnUpdateProgress(100, `✅ Part ${nextPart} ready!`);
      qvsnShowSuccess(`✅ Part ${nextPart} ready! Total pages: ${document.querySelectorAll('.qvsn-page').length}`);
      qvsnShowStatus('');
      setTimeout(qvsnHideStatus, 100);

      const actionsWrap = document.getElementById('qvsn-actions-wrap');
      if (actionsWrap) actionsWrap.style.display = 'block';
      if (moreBtn) { moreBtn.style.display = 'block'; moreBtn.disabled = false; }
      const partNumEl = document.getElementById('qvsn-part-num');
      if (partNumEl) partNumEl.textContent = nextPart + 1;
      if (doneBtn) doneBtn.style.display = 'block';

      if (QVSN_STATE.autoMode && !data.allCovered) {
        qvsnUpdateProgress(50, `🚀 Auto mode: Part ${nextPart + 1} shuru ho raha hai...`);
        await new Promise(r => setTimeout(r, 1500));
        QVSN_STATE.isGenerating = false;
        await qvsnGeneratePart(false);
        return;
      }

    } catch (err) {
      qvsnShowError('❌ ' + err.message);
      qvsnUpdateProgress(0, 'Error');
    } finally {
      QVSN_STATE.isGenerating = false;
      if (genBtn) genBtn.disabled = false;
      if (moreBtn) moreBtn.disabled = false;
    }
  }

  function qvsnParseMarkdown(md) {
    const thinkingPatterns = [
      /^wait\b/i, /^check\b/i, /^word count check/i, /^self-correction/i,
      /^final structure verification/i, /^ensure\b/i, /^hinglish check/i,
      /^instead of/i, /^i will just write/i, /^i need to/i,
      /^i initially thought/i, /^one detail/i, /^correction on/i,
      /^i'll use/i, /^i must\b/i, /^let me\b/i, /^now[, ]/i,
      /^alright[, ]/i, /^okay[, ]/i, /^note:/i, /^checking\b/i,
      /^verify/i, /^the content/i, /^the rules/i, /^my response/i,
      /^my output/i, /^i used/i, /^as per/i, /^following the/i,
      /^based on the/i, /^it looks/i, /^the structure/i,
      /^format check/i, /^language check/i, /^drafting:/i,
      /^final answer/i, /^actually[, ]/i, /^hmm\b/i, /^let's\b/i,
      /^start with #/i, /^## for sections/i, /^### for sub-sections/i,
      /^final review/i, /^final check/i, /^drafting text/i,
      /^refining content/i, /^example of forbidden/i, /^example of allowed/i,
      /^intro: done/i, /^topic \d+:/i, /^part \d+ only/i,
      /^no bold/i, /^no meta-commentary/i,
      /^allowed:/i, /^forbidden:/i,
      /^sample text/i, /^output format/i, /^structure:/i,
      /^rule \d+/i, /^section \d+/i,
      /^i will now/i, /^i will write/i, /^i will use/i,
      /^my plan/i, /^my strategy/i, /^my approach/i
    ];

    const lines = md.split('\n');
    let html = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let trimmed = line.trim();

      if (!trimmed) { if (inList) { html += '</ul>'; inList = false; } continue; }

      trimmed = trimmed.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');

      const cleanForCheck = trimmed.replace(/^-\s*/, '').replace(/^#+\s*/, '');
      let isThinking = false;
      for (let p = 0; p < thinkingPatterns.length; p++) {
        if (thinkingPatterns[p].test(cleanForCheck)) { isThinking = true; break; }
      }
      if (isThinking) continue;

      const diagMatch = trimmed.match(/^\[DIAGRAM:\s*(\w+)\s*\]\s*$/i);
      if (diagMatch) {
        if (inList) { html += '</ul>'; inList = false; }
        const key = diagMatch[1].toLowerCase();
        if (QVSN_DIAGRAMS[key]) html += '<div class="qvsn-diagram">' + QVSN_DIAGRAMS[key] + '</div>';
        continue;
      }

      if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<div class="qvsn-h1">' + qvsnEsc(trimmed.slice(2)) + '</div>';
        continue;
      }
      if (trimmed.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<div class="qvsn-h3">' + qvsnEsc(trimmed.slice(4)) + '</div>';
        continue;
      }
      if (trimmed.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<div class="qvsn-h2">' + qvsnEsc(trimmed.slice(3)) + '</div>';
        continue;
      }

      if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
        if (inList) { html += '</ul>'; inList = false; }
        let formula = trimmed.slice(2, -2).trim();
        formula = qvsnConvertLatex(formula);
        html += '<div class="qvsn-formula">' + qvsnEsc(formula) + '</div>';
        continue;
      }

      if (trimmed.startsWith('- ')) {
        if (!inList) { html += '<ul class="qvsn-ul">'; inList = true; }
        html += '<li>' + qvsnEsc(trimmed.slice(2)) + '</li>';
        continue;
      }

      if (/^definition:/i.test(trimmed)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<div class="qvsn-def">' + qvsnEsc(trimmed) + '</div>';
        continue;
      }

      if (inList) { html += '</ul>'; inList = false; }
      html += '<div class="qvsn-p">' + qvsnEsc(trimmed) + '</div>';
    }

    if (inList) html += '</ul>';
    return html;
  }

  function qvsnRenderPages(md) {
    const container = document.getElementById('qvsn-pages');
    if (!container) return;

    const penClass = 'qvsn-pen-' + QVSN_STATE.penColor;
    const contentLines = md.split('\n').filter(function (l) { return l.trim(); });
    const LINES_PER_PAGE = 14;
    const pages = [];
    let currentPage = [];

    function isSectionStart(line) {
      const t = line.trim();
      return t.startsWith('# ') || t.startsWith('## ') || t.startsWith('### ') ||
             /^definition:/i.test(t) || t.startsWith('$$') || t.startsWith('[DIAGRAM');
    }

    for (let i = 0; i < contentLines.length; i++) {
      currentPage.push(contentLines[i]);

      if (currentPage.length >= LINES_PER_PAGE) {
        const nextLine = contentLines[i + 1] || '';
        const nextIsSection = isSectionStart(nextLine);

        if (nextIsSection || currentPage.length >= 16) {
          pages.push(currentPage.join('\n'));
          currentPage = [];
        }
      }
    }

    if (currentPage.length > 0) pages.push(currentPage.join('\n'));
    if (pages.length === 0) pages.push('');

    container.innerHTML = pages.map(function (pageMd, idx) {
      const innerHTML = qvsnParseMarkdown(pageMd);
      return '<div class="qvsn-page ' + penClass + '" data-page="' + (idx + 1) + '">' +
        '<div class="qvsn-page-content">' + innerHTML + '</div>' +
        '<div class="qvsn-page-num">Page ' + (idx + 1) + ' / ' + pages.length + '</div>' +
        '</div>';
    }).join('');
  }

  function qvsnToggleEdit() {
    QVSN_STATE.isEditing = !QVSN_STATE.isEditing;
    const pages = document.querySelectorAll('.qvsn-page');
    for (let i = 0; i < pages.length; i++) {
      pages[i].setAttribute('contenteditable', QVSN_STATE.isEditing ? 'true' : 'false');
    }
    const btn = document.getElementById('qvsn-edit');
    if (btn) btn.textContent = QVSN_STATE.isEditing ? '💾 Save' : '✏️ Edit';
  }

  function qvsnSaveDraft() {
    try {
      localStorage.setItem(QVSN_STATE.draftKey, JSON.stringify({
        fullPrompt: QVSN_STATE.fullPrompt,
        depth: QVSN_STATE.depth,
        language: QVSN_STATE.language,
        penColor: QVSN_STATE.penColor,
        rawText: QVSN_STATE.rawText,
        partNumber: QVSN_STATE.partNumber
      }));
    } catch (e) {}
  }

  function qvsnLoadDraft() {
    try {
      const raw = localStorage.getItem(QVSN_STATE.draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.fullPrompt && document.getElementById('qvsn-prompt')) document.getElementById('qvsn-prompt').value = d.fullPrompt;
      if (d.depth && document.getElementById('qvsn-depth')) document.getElementById('qvsn-depth').value = d.depth;
      if (d.language && document.getElementById('qvsn-language')) document.getElementById('qvsn-language').value = d.language;
      if (d.penColor && document.getElementById('qvsn-pen')) {
        document.getElementById('qvsn-pen').value = d.penColor;
        QVSN_STATE.penColor = d.penColor;
      }
      if (d.rawText) {
        QVSN_STATE.rawText = d.rawText;
        QVSN_STATE.partNumber = d.partNumber || 1;
        QVSN_STATE.fullPrompt = d.fullPrompt || '';
        qvsnRenderPages(d.rawText);
        const aw = document.getElementById('qvsn-actions-wrap');
        if (aw) aw.style.display = 'block';
        const moreBtn = document.getElementById('qvsn-more');
        if (moreBtn) moreBtn.style.display = 'block';
        const doneBtn = document.getElementById('qvsn-done');
        if (doneBtn) doneBtn.style.display = 'block';
        const partNumEl = document.getElementById('qvsn-part-num');
        if (partNumEl) partNumEl.textContent = (QVSN_STATE.partNumber + 1);
        qvsnUpdateProgress(100, `Restored: ${QVSN_STATE.partNumber} parts loaded`);
      }
      qvsnUpdateCounter();
    } catch (e) {}
  }

  function qvsnClearAll() {
    if (!confirm('Sab kuch clear kar dein?')) return;
    localStorage.removeItem(QVSN_STATE.draftKey);
    QVSN_STATE.rawText = '';
    QVSN_STATE.partNumber = 0;
    QVSN_STATE.fullPrompt = '';
    if (document.getElementById('qvsn-prompt')) {
      document.getElementById('qvsn-prompt').value = '';
    }
    document.getElementById('qvsn-pages').innerHTML = '';
    document.getElementById('qvsn-actions-wrap').style.display = 'none';
    const progressWrap = document.getElementById('qvsn-progress-wrap');
    if (progressWrap) progressWrap.style.display = 'none';
    qvsnHideStatus(); qvsnHideError(); qvsnHideSuccess();
    qvsnUpdateCounter();
  }

  async function qvsnExportPNG() {
    qvsnShowStatus('🖼️ PNG bana raha hai (HD)...');
    try {
      await qvsnEnsureLibraries();
      if (typeof htmlToImage === 'undefined') throw new Error('PNG library load nahi hui.');
      const pages = document.querySelectorAll('.qvsn-page');
      for (let i = 0; i < pages.length; i++) {
        qvsnShowStatus('🖼️ Page ' + (i + 1) + ' / ' + pages.length + ' export ho raha hai...');
        const dataUrl = await htmlToImage.toPng(pages[i], { pixelRatio: 3, backgroundColor: '#fefefe' });
        const link = document.createElement('a');
        link.download = 'study-notes-page-' + (i + 1) + '.png';
        link.href = dataUrl;
        link.click();
        await new Promise(function (r) { setTimeout(r, 400); });
      }
      qvsnShowStatus('✅ PNG download ho gaya!');
      setTimeout(qvsnHideStatus, 2500);
    } catch (e) {
      qvsnShowError('PNG export fail: ' + e.message);
    }
  }

  async function qvsnExportPDF() {
    qvsnShowStatus('📄 PDF bana raha hai...');
    try {
      await qvsnEnsureLibraries();
      if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('jsPDF library load nahi hui');
      if (typeof html2canvas === 'undefined') throw new Error('html2canvas library load nahi hui');

      const jsPDF = window.jspdf.jsPDF;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = document.querySelectorAll('.qvsn-page');
      if (pages.length === 0) throw new Error('Pehle notes generate karo!');

      const pdfW = 210;
      const pdfH = 297;

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        qvsnShowStatus('📄 Page ' + (i + 1) + ' / ' + pages.length + ' process ho raha hai...');

        const canvas = await html2canvas(pages[i], {
          scale: 3,
          backgroundColor: '#fefefe',
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        const imgAspect = canvas.width / canvas.height;
        const pdfAspect = pdfW / pdfH;

        let drawW, drawH, offsetX, offsetY;

        if (imgAspect > pdfAspect) {
          drawW = pdfW;
          drawH = pdfW / imgAspect;
          offsetX = 0;
          offsetY = (pdfH - drawH) / 2;
        } else {
          drawH = pdfH;
          drawW = pdfH * imgAspect;
          offsetX = (pdfW - drawW) / 2;
          offsetY = 0;
        }

        pdf.addImage(imgData, 'JPEG', offsetX, offsetY, drawW, drawH, undefined, 'FAST');
      }

      pdf.save('study-notes.pdf');
      qvsnShowStatus('✅ PDF download ho gaya!');
      setTimeout(qvsnHideStatus, 2500);
    } catch (e) {
      qvsnShowError('PDF export fail: ' + e.message);
    }
  }

  function qvsnPrint() {
    const pagesEl = document.getElementById('qvsn-pages');
    if (!pagesEl || !pagesEl.innerHTML.trim()) { qvsnShowError('Pehle notes generate karo!'); return; }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(
      '<html><head><title>Study Notes</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" rel="stylesheet">' +
      '<style>' + QVSN_CSS + '</style>' +
      '<style>' +
      '@page { size: A4; margin: 0; }' +
      '@media print { body { margin: 0; padding: 0; background: #fff; }' +
      '.qvsn-page { page-break-after: always; background: #fff !important; box-shadow: none !important; margin: 0 auto; border-radius: 0; }' +
      '.qvsn-page:last-child { page-break-after: auto; }' +
      '}' +
      '</style>' +
      '</head><body>' + pagesEl.innerHTML + '</body></html>'
    );
    printWindow.document.close();
    setTimeout(function () { printWindow.print(); }, 800);
  }

  function qvsnInit() {
    qvsnInjectCSS();
    qvsnLoadDraft();
    qvsnEnsureLibraries().catch(function () {});

    const genBtn = document.getElementById('qvsn-generate');
    const moreBtn = document.getElementById('qvsn-more');
    const doneBtn = document.getElementById('qvsn-done');
    const editBtn = document.getElementById('qvsn-edit');
    const pngBtn = document.getElementById('qvsn-png');
    const pdfBtn = document.getElementById('qvsn-pdf');
    const printBtn = document.getElementById('qvsn-print');
    const clearBtn = document.getElementById('qvsn-clear');
    const penSel = document.getElementById('qvsn-pen');
    const promptInput = document.getElementById('qvsn-prompt');
    const modeToggle = document.getElementById('qvsn-mode-toggle');

    if (genBtn) genBtn.addEventListener('click', function () { qvsnGeneratePart(true); });
    if (moreBtn) moreBtn.addEventListener('click', function () { qvsnGeneratePart(false); });
    if (doneBtn) doneBtn.addEventListener('click', function () {
      qvsnShowSuccess('🎉 Notes ready! Ab PNG/PDF/Print kar sakte ho.');
      document.getElementById('qvsn-progress-wrap').style.display = 'none';
    });
    if (editBtn) editBtn.addEventListener('click', qvsnToggleEdit);
    if (pngBtn) pngBtn.addEventListener('click', qvsnExportPNG);
    if (pdfBtn) pdfBtn.addEventListener('click', qvsnExportPDF);
    if (printBtn) printBtn.addEventListener('click', qvsnPrint);
    if (clearBtn) clearBtn.addEventListener('click', qvsnClearAll);

    if (penSel) {
      penSel.addEventListener('change', function () {
        QVSN_STATE.penColor = this.value;
        const pages = document.querySelectorAll('.qvsn-page');
        for (let i = 0; i < pages.length; i++) {
          pages[i].classList.remove('qvsn-pen-blue', 'qvsn-pen-black', 'qvsn-pen-green');
          pages[i].classList.add('qvsn-pen-' + this.value);
        }
        qvsnSaveDraft();
      });
    }

    if (modeToggle) {
      modeToggle.addEventListener('click', function (e) {
        if (e.target.tagName !== 'BUTTON') return;
        const mode = e.target.getAttribute('data-mode');
        QVSN_STATE.autoMode = (mode === 'auto');
        const btns = modeToggle.querySelectorAll('button');
        for (let i = 0; i < btns.length; i++) btns[i].classList.remove('active');
        e.target.classList.add('active');
      });
    }

    if (promptInput) {
      promptInput.addEventListener('input', qvsnUpdateCounter);
      promptInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.ctrlKey) qvsnGeneratePart(true);
      });
    }
  }

  window.EXTRA_TOOL_RENDERERS = window.EXTRA_TOOL_RENDERERS || {};
  window.EXTRA_TOOL_INITS = window.EXTRA_TOOL_INITS || {};

  window.EXTRA_TOOL_RENDERERS['study-notes-generator'] = function () { return qvsnRenderHTML(); };
  window.EXTRA_TOOL_INITS['study-notes-generator'] = function () { qvsnInit(); };

  qvsnInjectCSS();

})();