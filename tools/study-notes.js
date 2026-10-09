/* ============================================================
   QUNVERIO — AI STUDY NOTES GENERATOR
   File: tools/study-notes.js
   Final Version (v3) — Thinking filter + Clean output
   ============================================================ */

(function () {
  'use strict';

  /* ---------------- STATE ---------------- */
  const QVSN_STATE = {
    topic: '',
    level: 'medium',
    subject: '',
    language: 'english',
    depth: 'standard',
    maxPages: '2',
    penColor: 'blue',
    rawText: '',
    isEditing: false,
    draftKey: 'qvsn_draft_v3'
  };

  /* ---------------- SVG DIAGRAMS ---------------- */
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

  /* ---------------- CSS ---------------- */
  const QVSN_CSS = `
.qvsn-wrap { max-width: 900px; margin: 0 auto; padding: 16px; font-family: 'Kalam', cursive, sans-serif; }
.qvsn-header { text-align: center; margin-bottom: 20px; }
.qvsn-title { font-size: 1.8rem; font-weight: 700; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.qvsn-sub { color: #9ca3af; font-size: 0.9rem; margin-top: 4px; }
.qvsn-card { background: #151a3d; border-radius: 16px; padding: 20px; margin-bottom: 16px; border: 1px solid rgba(99,102,241,0.15); }
.qvsn-label { display: block; font-size: 0.85rem; color: #c7d2fe; margin-bottom: 6px; font-weight: 600; }
.qvsn-input, .qvsn-select { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(99,102,241,0.3); background: #0a0e27; color: #e5e7eb; font-size: 0.95rem; font-family: inherit; outline: none; box-sizing: border-box; }
.qvsn-input:focus, .qvsn-select:focus { border-color: #6366f1; }
.qvsn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
.qvsn-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer; font-family: inherit; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); color: #fff; margin-top: 16px; }
.qvsn-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.qvsn-btn-secondary { background: #1f2547; color: #c7d2fe; border: 1px solid rgba(99,102,241,0.3); }
.qvsn-status { text-align: center; padding: 12px; font-size: 0.9rem; color: #9ca3af; }
.qvsn-error { background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.4); color: #fca5a5; padding: 12px; border-radius: 10px; margin-top: 12px; font-size: 0.9rem; }
.qvsn-pages { display: flex; flex-direction: column; gap: 20px; margin-top: 20px; }
.qvsn-page { background: #fefefe; color: #1e3a8a; width: 100%; aspect-ratio: 210 / 297; padding: 20mm 15mm 15mm 25mm; position: relative; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); font-family: 'Kalam', cursive, sans-serif; overflow: hidden; box-sizing: border-box; background-image: repeating-linear-gradient(transparent, transparent 27px, #e5e7eb 27px, #e5e7eb 28px); background-size: 100% 28px; background-position: 0 20mm; line-height: 28px; font-size: 15px; }
.qvsn-page::before { content: ''; position: absolute; top: 0; bottom: 0; left: 20mm; width: 1px; background: #fca5a5; }
.qvsn-page-num { position: absolute; bottom: 6mm; right: 10mm; font-size: 11px; color: #9ca3af; }
.qvsn-h1 { color: #dc2626; font-weight: 700; font-size: 20px; margin: 0 0 8px; line-height: 28px; }
.qvsn-h2 { color: #dc2626; font-weight: 700; font-size: 17px; margin: 12px 0 4px; line-height: 28px; }
.qvsn-p { margin: 0; line-height: 28px; color: #1e3a8a; }
.qvsn-ul { margin: 0; padding-left: 22px; line-height: 28px; color: #1e3a8a; }
.qvsn-def { background: rgba(250,204,21,0.25); border-left: 3px solid #f59e0b; padding: 4px 10px; margin: 4px 0; border-radius: 4px; line-height: 28px; }
.qvsn-formula { background: rgba(99,102,241,0.12); border: 1px dashed #6366f1; padding: 6px 12px; margin: 6px 0; border-radius: 6px; font-weight: 700; text-align: center; line-height: 28px; color: #4338ca; }
.qvsn-diagram { display: flex; justify-content: center; margin: 8px 0; }
.qvsn-diagram svg { width: 90px; height: 90px; }
.qvsn-pen-black .qvsn-p, .qvsn-pen-black .qvsn-ul, .qvsn-pen-black .qvsn-page { color: #111827; }
.qvsn-pen-green .qvsn-p, .qvsn-pen-green .qvsn-ul, .qvsn-pen-green .qvsn-page { color: #166534; }
.qvsn-page[contenteditable="true"] { outline: 2px dashed #6366f1; outline-offset: 4px; }
.qvsn-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
.qvsn-actions .qvsn-btn { margin-top: 0; }
@media (max-width: 640px) {
  .qvsn-row { grid-template-columns: 1fr; }
  .qvsn-title { font-size: 1.4rem; }
  .qvsn-page { padding: 12mm 8mm 12mm 15mm; font-size: 13px; line-height: 24px; background-size: 100% 24px; background-position: 0 12mm; }
  .qvsn-page::before { left: 12mm; }
  .qvsn-h1 { font-size: 17px; line-height: 24px; }
  .qvsn-h2 { font-size: 15px; line-height: 24px; }
  .qvsn-p, .qvsn-ul { line-height: 24px; }
}`;

  function qvsnInjectCSS() {
    if (document.getElementById('qvsn-styles')) return;
    const style = document.createElement('style');
    style.id = 'qvsn-styles';
    style.textContent = QVSN_CSS;
    document.head.appendChild(style);
    if (!document.getElementById('qvsn-font')) {
      const link = document.createElement('link');
      link.id = 'qvsn-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap';
      document.head.appendChild(link);
    }
  }

  /* ---------------- HTML ---------------- */
  function qvsnRenderHTML() {
    return `
<div class="qvsn-wrap">
  <div class="qvsn-header">
    <div class="qvsn-title">📚 AI Study Notes Generator</div>
    <div class="qvsn-sub">Topic daalo → AI handwriting notes banayega → PNG/PDF export karo</div>
  </div>

  <div class="qvsn-card">
    <label class="qvsn-label" for="qvsn-topic">📝 Topic</label>
    <input type="text" id="qvsn-topic" class="qvsn-input" placeholder="e.g. Renewable Energy Sources" autocomplete="off" />

    <div class="qvsn-row">
      <div>
        <label class="qvsn-label" for="qvsn-level">📊 Detail Level</label>
        <select id="qvsn-level" class="qvsn-select">
          <option value="short">Short (Concise)</option>
          <option value="medium" selected>Medium (Balanced)</option>
          <option value="detailed">Detailed (In-depth)</option>
        </select>
      </div>
      <div>
        <label class="qvsn-label" for="qvsn-subject">🎓 Subject (optional)</label>
        <input type="text" id="qvsn-subject" class="qvsn-input" placeholder="e.g. Physics" autocomplete="off" />
      </div>
    </div>

    <div class="qvsn-row">
      <div>
        <label class="qvsn-label" for="qvsn-depth">📖 Content Depth</label>
        <select id="qvsn-depth" class="qvsn-select">
          <option value="basic">Basic — Simple points</option>
          <option value="standard" selected>Standard — With examples</option>
          <option value="deep">Deep — Full explanation + extra facts</option>
        </select>
      </div>
      <div>
        <label class="qvsn-label" for="qvsn-pages-limit">📄 Max Pages</label>
        <select id="qvsn-pages-limit" class="qvsn-select">
          <option value="1">1 Page</option>
          <option value="2" selected>2 Pages</option>
          <option value="3">3 Pages</option>
          <option value="5">5 Pages</option>
          <option value="10">10 Pages (Unlimited)</option>
        </select>
      </div>
    </div>

    <div class="qvsn-row">
      <div>
        <label class="qvsn-label" for="qvsn-language">🌐 Language</label>
        <select id="qvsn-language" class="qvsn-select">
          <option value="english" selected>English</option>
          <option value="hindi">Hindi</option>
          <option value="hinglish">Hinglish</option>
        </select>
      </div>
      <div>
        <label class="qvsn-label" for="qvsn-pen">🖊️ Pen Color</label>
        <select id="qvsn-pen" class="qvsn-select">
          <option value="blue" selected>Blue Pen</option>
          <option value="black">Black Pen</option>
          <option value="green">Green Pen</option>
        </select>
      </div>
    </div>

    <button id="qvsn-generate" class="qvsn-btn">✨ Generate Notes</button>
    <div id="qvsn-status" class="qvsn-status" style="display:none;"></div>
    <div id="qvsn-error" class="qvsn-error" style="display:none;"></div>
  </div>

  <div id="qvsn-actions-wrap" class="qvsn-card" style="display:none;">
    <div class="qvsn-actions">
      <button id="qvsn-edit" class="qvsn-btn qvsn-btn-secondary">✏️ Edit Mode</button>
      <button id="qvsn-regen" class="qvsn-btn qvsn-btn-secondary">🔄 Regenerate</button>
      <button id="qvsn-png" class="qvsn-btn">🖼️ PNG (HD)</button>
      <button id="qvsn-pdf" class="qvsn-btn">📄 PDF</button>
      <button id="qvsn-print" class="qvsn-btn qvsn-btn-secondary">🖨️ Print</button>
      <button id="qvsn-clear" class="qvsn-btn qvsn-btn-secondary">🗑️ Clear</button>
    </div>
  </div>

  <div id="qvsn-pages" class="qvsn-pages"></div>
</div>`;
  }

  /* ---------------- HELPERS ---------------- */
  function qvsnShowStatus(msg) {
    const el = document.getElementById('qvsn-status');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }
  function qvsnHideStatus() {
    const el = document.getElementById('qvsn-status');
    if (el) el.style.display = 'none';
  }
  function qvsnShowError(msg) {
    const el = document.getElementById('qvsn-error');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }
  function qvsnHideError() {
    const el = document.getElementById('qvsn-error');
    if (el) el.style.display = 'none';
  }
  function qvsnEsc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ---------------- AI CALL ---------------- */
  async function qvsnCallAI() {
    const topic = (document.getElementById('qvsn-topic') || {}).value || '';
    const level = (document.getElementById('qvsn-level') || {}).value || 'medium';
    const subject = (document.getElementById('qvsn-subject') || {}).value || '';
    const language = (document.getElementById('qvsn-language') || {}).value || 'english';
    const depth = (document.getElementById('qvsn-depth') || {}).value || 'standard';
    const maxPages = (document.getElementById('qvsn-pages-limit') || {}).value || '2';

    if (!topic.trim()) {
      qvsnShowError('Bhai, pehle topic toh likho!');
      return;
    }

    qvsnShowStatus('🤖 AI notes bana raha hai...');
    qvsnHideError();

    const genBtn = document.getElementById('qvsn-generate');
    if (genBtn) genBtn.disabled = true;
    document.getElementById('qvsn-pages').innerHTML = '';

    try {
      const res = await fetch('/api/study-notes-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          level: level,
          subject: subject.trim(),
          language: language,
          depth: depth,
          maxPages: maxPages
        })
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Server response invalid (HTTP ' + res.status + ')');
      }

      if (!res.ok || !data.success || !data.text) {
        throw new Error((data && data.error) || 'AI response empty');
      }

      QVSN_STATE.rawText = data.text;
      QVSN_STATE.topic = topic.trim();
      QVSN_STATE.level = level;
      QVSN_STATE.subject = subject.trim();
      QVSN_STATE.language = language;
      QVSN_STATE.depth = depth;
      QVSN_STATE.maxPages = maxPages;

      qvsnRenderPages(data.text);
      qvsnSaveDraft();
      qvsnShowStatus('✅ Notes ready! Ab export kar sakte ho.');
      document.getElementById('qvsn-actions-wrap').style.display = 'block';

      setTimeout(qvsnHideStatus, 2500);

    } catch (err) {
      qvsnShowError('❌ ' + err.message);
    } finally {
      if (genBtn) genBtn.disabled = false;
    }
  }

  /* ---------------- PARSER (with thinking filter) ---------------- */
  function qvsnParseMarkdown(md) {
    const thinkingPatterns = [
      /^wait\b/i,
      /^check\b/i,
      /^word count check/i,
      /^self-correction/i,
      /^final structure verification/i,
      /^ensure\b/i,
      /^hinglish check/i,
      /^instead of/i,
      /^i will just write/i,
      /^i need to/i,
      /^i initially thought/i,
      /^one detail/i,
      /^correction on/i,
      /^i'll use/i,
      /^i must\b/i,
      /^let me\b/i,
      /^now[, ]/i,
      /^alright[, ]/i,
      /^okay[, ]/i,
      /^note:/i,
      /^checking\b/i,
      /^verify/i,
      /^the content/i,
      /^the rules/i,
      /^my response/i,
      /^my output/i,
      /^i used/i,
      /^as per/i,
      /^following the/i,
      /^based on the/i,
      /^it looks/i,
      /^the structure/i,
      /^format check/i,
      /^language check/i,
      /^drafting:/i,
      /^final answer/i,
      /^actually[, ]/i,
      /^hmm\b/i,
      /^let's\b/i
    ];

    const lines = md.split('\n');
    let html = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let trimmed = line.trim();

      if (!trimmed) {
        if (inList) { html += '</ul>'; inList = false; }
        continue;
      }

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
        if (QVSN_DIAGRAMS[key]) {
          html += '<div class="qvsn-diagram">' + QVSN_DIAGRAMS[key] + '</div>';
        }
        continue;
      }

      if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<div class="qvsn-h1">' + qvsnEsc(trimmed.slice(2)) + '</div>';
        continue;
      }
      if (trimmed.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<div class="qvsn-h2" style="font-size:15px;">' + qvsnEsc(trimmed.slice(4)) + '</div>';
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
        formula = formula
          .replace(/\\times/g, '×').replace(/\\rightarrow/g, '→')
          .replace(/\\leftarrow/g, '←').replace(/\\cdot/g, '·')
          .replace(/\\pm/g, '±').replace(/\\Delta/g, 'Δ')
          .replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β')
          .replace(/\\gamma/g, 'γ').replace(/\\pi/g, 'π')
          .replace(/\\/g, '');
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

  /* ---------------- RENDER PAGES ---------------- */
  function qvsnRenderPages(md) {
    const container = document.getElementById('qvsn-pages');
    if (!container) return;

    const penClass = 'qvsn-pen-' + QVSN_STATE.penColor;
    const contentLines = md.split('\n').filter(function (l) { return l.trim(); });
    const LINES_PER_PAGE = 22;
    const pages = [];

    for (let i = 0; i < contentLines.length; i += LINES_PER_PAGE) {
      pages.push(contentLines.slice(i, i + LINES_PER_PAGE).join('\n'));
    }
    if (pages.length === 0) pages.push('');

    container.innerHTML = pages.map(function (pageMd, idx) {
      const innerHTML = qvsnParseMarkdown(pageMd);
      return '<div class="qvsn-page ' + penClass + '" data-page="' + (idx + 1) + '">' +
        '<div class="qvsn-page-content">' + innerHTML + '</div>' +
        '<div class="qvsn-page-num">Page ' + (idx + 1) + ' / ' + pages.length + '</div>' +
        '</div>';
    }).join('');
  }

  /* ---------------- EDIT ---------------- */
  function qvsnToggleEdit() {
    QVSN_STATE.isEditing = !QVSN_STATE.isEditing;
    const pages = document.querySelectorAll('.qvsn-page');
    for (let i = 0; i < pages.length; i++) {
      pages[i].setAttribute('contenteditable', QVSN_STATE.isEditing ? 'true' : 'false');
    }
    const btn = document.getElementById('qvsn-edit');
    if (btn) btn.textContent = QVSN_STATE.isEditing ? '💾 Save Edits' : '✏️ Edit Mode';
  }

  /* ---------------- LOCALSTORAGE ---------------- */
  function qvsnSaveDraft() {
    try {
      localStorage.setItem(QVSN_STATE.draftKey, JSON.stringify({
        topic: QVSN_STATE.topic,
        level: QVSN_STATE.level,
        subject: QVSN_STATE.subject,
        language: QVSN_STATE.language,
        depth: QVSN_STATE.depth,
        maxPages: QVSN_STATE.maxPages,
        penColor: QVSN_STATE.penColor,
        rawText: QVSN_STATE.rawText
      }));
    } catch (e) {}
  }

  function qvsnLoadDraft() {
    try {
      const raw = localStorage.getItem(QVSN_STATE.draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.topic && document.getElementById('qvsn-topic')) document.getElementById('qvsn-topic').value = d.topic;
      if (d.level && document.getElementById('qvsn-level')) document.getElementById('qvsn-level').value = d.level;
      if (d.subject && document.getElementById('qvsn-subject')) document.getElementById('qvsn-subject').value = d.subject;
      if (d.language && document.getElementById('qvsn-language')) document.getElementById('qvsn-language').value = d.language;
      if (d.depth && document.getElementById('qvsn-depth')) document.getElementById('qvsn-depth').value = d.depth;
      if (d.maxPages && document.getElementById('qvsn-pages-limit')) document.getElementById('qvsn-pages-limit').value = d.maxPages;
      if (d.penColor && document.getElementById('qvsn-pen')) {
        document.getElementById('qvsn-pen').value = d.penColor;
        QVSN_STATE.penColor = d.penColor;
      }
      if (d.rawText) {
        QVSN_STATE.rawText = d.rawText;
        QVSN_STATE.topic = d.topic || '';
        QVSN_STATE.subject = d.subject || '';
        qvsnRenderPages(d.rawText);
        const aw = document.getElementById('qvsn-actions-wrap');
        if (aw) aw.style.display = 'block';
      }
    } catch (e) {}
  }

  function qvsnClearAll() {
    if (!confirm('Sab kuch clear kar dein?')) return;
    localStorage.removeItem(QVSN_STATE.draftKey);
    if (document.getElementById('qvsn-topic')) document.getElementById('qvsn-topic').value = '';
    if (document.getElementById('qvsn-subject')) document.getElementById('qvsn-subject').value = '';
    document.getElementById('qvsn-pages').innerHTML = '';
    document.getElementById('qvsn-actions-wrap').style.display = 'none';
    QVSN_STATE.rawText = '';
    qvsnHideStatus();
    qvsnHideError();
  }

  /* ---------------- EXPORT PNG ---------------- */
  async function qvsnExportPNG() {
    if (typeof htmlToImage === 'undefined') {
      qvsnShowError('PNG library load nahi hui. Page refresh karo.');
      return;
    }
    qvsnShowStatus('🖼️ PNG bana raha hai (HD)...');
    try {
      const pages = document.querySelectorAll('.qvsn-page');
      for (let i = 0; i < pages.length; i++) {
        const dataUrl = await htmlToImage.toPng(pages[i], {
          pixelRatio: 3,
          backgroundColor: '#fefefe'
        });
        const link = document.createElement('a');
        link.download = 'study-notes-' + (QVSN_STATE.topic.slice(0, 30) || 'notes') + '-page-' + (i + 1) + '.png';
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

  /* ---------------- EXPORT PDF ---------------- */
  async function qvsnExportPDF() {
    qvsnShowStatus('📄 PDF bana raha hai...');
    try {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error('jsPDF library load nahi hui');
      }
      if (typeof html2canvas === 'undefined') {
        throw new Error('html2canvas library load nahi hui');
      }
      const jsPDF = window.jspdf.jsPDF;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = document.querySelectorAll('.qvsn-page');

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: '#fefefe' });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdfW = 210;
        const pdfH = (canvas.height * pdfW) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, Math.min(pdfH, 297));
      }

      pdf.save('study-notes-' + (QVSN_STATE.topic.slice(0, 30) || 'notes') + '.pdf');
      qvsnShowStatus('✅ PDF download ho gaya!');
      setTimeout(qvsnHideStatus, 2500);
    } catch (e) {
      qvsnShowError('PDF export fail: ' + e.message);
    }
  }

  /* ---------------- PRINT ---------------- */
  function qvsnPrint() {
    const pagesEl = document.getElementById('qvsn-pages');
    if (!pagesEl || !pagesEl.innerHTML.trim()) {
      qvsnShowError('Pehle notes generate karo!');
      return;
    }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(
      '<html><head><title>Study Notes</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" rel="stylesheet">' +
      '<style>' + QVSN_CSS + '</style>' +
      '<style>body{margin:0;padding:0;background:#fff;}.qvsn-page{page-break-after:always;background:#fff !important;box-shadow:none !important;margin:0 auto;}</style>' +
      '</head><body>' + pagesEl.innerHTML + '</body></html>'
    );
    printWindow.document.close();
    setTimeout(function () { printWindow.print(); }, 700);
  }

  /* ---------------- INIT ---------------- */
  function qvsnInit() {
    qvsnInjectCSS();
    qvsnLoadDraft();

    const genBtn = document.getElementById('qvsn-generate');
    const editBtn = document.getElementById('qvsn-edit');
    const regenBtn = document.getElementById('qvsn-regen');
    const pngBtn = document.getElementById('qvsn-png');
    const pdfBtn = document.getElementById('qvsn-pdf');
    const printBtn = document.getElementById('qvsn-print');
    const clearBtn = document.getElementById('qvsn-clear');
    const penSel = document.getElementById('qvsn-pen');

    if (genBtn) genBtn.addEventListener('click', qvsnCallAI);
    if (editBtn) editBtn.addEventListener('click', qvsnToggleEdit);
    if (regenBtn) regenBtn.addEventListener('click', qvsnCallAI);
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

    const topicInput = document.getElementById('qvsn-topic');
    if (topicInput) {
      topicInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') qvsnCallAI();
      });
    }
  }

  /* ---------------- REGISTER ---------------- */
  window.EXTRA_TOOL_RENDERERS = window.EXTRA_TOOL_RENDERERS || {};
  window.EXTRA_TOOL_INITS = window.EXTRA_TOOL_INITS || {};

  window.EXTRA_TOOL_RENDERERS['study-notes-generator'] = function () {
    return qvsnRenderHTML();
  };
  window.EXTRA_TOOL_INITS['study-notes-generator'] = function () {
    qvsnInit();
  };

  qvsnInjectCSS();

})();