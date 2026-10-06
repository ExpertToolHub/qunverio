/* ============================================================
   QUNVERIO — INSTAGRAM BIO GENERATOR (v1.0)
   Path: tools/creator/bio-generator.js
   AI-powered Instagram bio generator
   ============================================================ */

(function () {
  'use strict';
  if (!window.QVH) { console.warn('QVH not loaded — bio-generator.js skipping'); return; }
  const QVH = window.QVH;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function copyText(text) {
    if (!navigator.clipboard) { QVH.toast('Copy not supported', 'error'); return; }
    navigator.clipboard.writeText(text).then(() => QVH.toast('Copied! 📋', 'success')).catch(() => QVH.toast('Copy failed', 'error'));
  }
  async function callAI(prompt, opts) {
    opts = opts || {};
    const body = { prompt, systemPrompt: opts.systemPrompt || '', temperature: opts.temperature != null ? opts.temperature : 0.95, maxTokens: opts.maxTokens || 1800 };
    const r = await fetch('/api/creator-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { let errMsg = 'AI request failed'; try { const j = await r.json(); errMsg = j.error || j.details || errMsg; } catch (e) {} throw new Error(errMsg); }
    const data = await r.json();
    if (!data.success || !data.text) throw new Error('Empty AI response');
    return data.text;
  }

  function parseBios(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const bios = [];
    let current = '';
    for (let line of lines) {
      // New bio if starts with number
      if (/^\d+[\.\)]\s*/.test(line)) {
        if (current) bios.push(current.trim());
        current = line.replace(/^\d+[\.\)]\s*/, '');
      } else if (/^[-•*]\s+/.test(line)) {
        if (current) bios.push(current.trim());
        current = line.replace(/^[-•*]\s+/, '');
      } else if (line.startsWith('Bio') && /^\d/.test(line.replace(/Bio\s*/, ''))) {
        if (current) bios.push(current.trim());
        current = line.replace(/^Bio\s*\d+[:.]\s*/, '');
      } else {
        // Continuation line
        if (current) current += '\n' + line;
        else current = line;
      }
    }
    if (current) bios.push(current.trim());
    return bios.filter(b => b.length > 15 && b.length < 500).slice(0, 12);
  }

  const CSS = `
    .qvbg-wrap { max-width: 720px; margin: 0 auto; }
    .qvbg-card { background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 14px; padding: 15px; margin-bottom: 12px; }
    .qvbg-card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; color: var(--text-3, #6b74a0); margin-bottom: 12px; }
    .qvbg-field { margin-bottom: 12px; }
    .qvbg-field label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2, #a8b0d8); margin-bottom: 5px; }
    .qvbg-field input, .qvbg-field textarea, .qvbg-field select { width: 100%; padding: 11px 13px; background: var(--surface-2, #1c2250); border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 11px; font-size: 14px; outline: none; color: var(--text, #eef1ff); font-family: inherit; box-sizing: border-box; transition: border-color .18s; }
    .qvbg-field input:focus, .qvbg-field textarea:focus, .qvbg-field select:focus { border-color: #ec4899; box-shadow: 0 0 0 3px rgba(236,72,153,.15); }
    .qvbg-field textarea { resize: vertical; min-height: 60px; }
    .qvbg-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 420px) { .qvbg-row2 { grid-template-columns: 1fr; } }
    .qvbg-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 13px 18px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: transform .15s, box-shadow .18s; }
    .qvbg-btn:active { transform: scale(.97); }
    .qvbg-btn-primary { background: linear-gradient(135deg,#ec4899,#a78bfa); color: #fff; width: 100%; box-shadow: 0 4px 14px rgba(236,72,153,.35); }
    .qvbg-loading { text-align: center; padding: 28px 16px; color: var(--text-2, #a8b0d8); font-size: 13px; }
    .qvbg-spinner { width: 32px; height: 32px; margin: 0 auto 12px; border: 3px solid var(--surface-2, #1c2250); border-top-color: #ec4899; border-radius: 50%; animation: qvbg-spin .8s linear infinite; }
    @keyframes qvbg-spin { to { transform: rotate(360deg) } }
    .qvbg-error { background: rgba(239,68,68,.1); border-left: 3px solid #ef4444; border-radius: 10px; padding: 12px 14px; margin-top: 12px; font-size: 13px; color: #fca5a5; line-height: 1.5; }
    .qvbg-bio-card { background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 12px; padding: 13px 14px; margin-bottom: 9px; transition: border-color .18s; }
    .qvbg-bio-card:hover { border-color: rgba(236,72,153,.4); }
    .qvbg-bio-num { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 8px; background: linear-gradient(135deg,#ec4899,#a78bfa); color: #fff; font-size: 11px; font-weight: 800; margin-right: 8px; flex-shrink: 0; }
    .qvbg-bio-text { font-size: 13.5px; line-height: 1.55; color: var(--text, #eef1ff); white-space: pre-wrap; word-break: break-word; margin-bottom: 10px; padding-left: 32px; font-family: 'Segoe UI', Roboto, sans-serif; }
    .qvbg-bio-actions { display: flex; gap: 5px; flex-wrap: wrap; padding-left: 32px; }
    .qvbg-bio-btn { padding: 6px 10px; border-radius: 7px; background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 11px; font-weight: 700; color: var(--text-2, #a8b0d8); cursor: pointer; transition: all .15s; }
    .qvbg-bio-btn:hover { background: var(--surface-hover, #232a5e); color: var(--text, #eef1ff); }
    .qvbg-bio-btn.primary { background: linear-gradient(135deg,#ec4899,#a78bfa); color: #fff; border-color: transparent; }
    .qvbg-actions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 12px; }
    .qvbg-action { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px; border-radius: 10px; background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); font-size: 11px; font-weight: 700; color: var(--text, #eef1ff); cursor: pointer; }
    .qvbg-action:hover { background: var(--surface-hover, #232a5e); }
    .qvbg-action .ico { font-size: 15px; }
    .qvbg-note { font-size: 11.5px; color: var(--text-3, #6b74a0); background: var(--surface-2, #1c2250); border-left: 3px solid #f59e0b; padding: 10px 12px; border-radius: 8px; margin-top: 12px; line-height: 1.55; }
  `;

  function injectCSS() {
    if (document.getElementById('qvbg-css')) return;
    const s = document.createElement('style');
    s.id = 'qvbg-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  function render(container) {
    injectCSS();
    container.innerHTML = `
      <div class="qvbg-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#ec4899,#a78bfa)">
          <div class="qvh-th-icon">✨</div>
          <div style="flex:1;min-width:0"><h3>Instagram Bio Generator</h3><p>AI-powered bios — aesthetic, professional, funny</p></div>
        </div>

        <div class="qvbg-card">
          <div class="qvbg-card-title">Your Info</div>
          <div class="qvbg-row2">
            <div class="qvbg-field">
              <label>Name / Brand *</label>
              <input type="text" id="qvbg-name" placeholder="e.g. Rahul / FitLife" />
            </div>
            <div class="qvbg-field">
              <label>Profession / Role</label>
              <input type="text" id="qvbg-prof" placeholder="e.g. YouTuber, Fitness Coach" />
            </div>
          </div>
          <div class="qvbg-row2">
            <div class="qvbg-field">
              <label>Niche</label>
              <select id="qvbg-niche">
                <option>Creator / Influencer</option>
                <option>Business / Entrepreneur</option>
                <option>Fitness / Health</option>
                <option>Fashion / Beauty</option>
                <option>Travel</option>
                <option>Food</option>
                <option>Tech</option>
                <option>Education</option>
                <option>Photography</option>
                <option>Music / Artist</option>
                <option>Motivation</option>
                <option>Personal</option>
              </select>
            </div>
            <div class="qvbg-field">
              <label>Vibe / Style</label>
              <select id="qvbg-vibe">
                <option>Aesthetic / Minimal</option>
                <option>Professional</option>
                <option>Funny / Sarcastic</option>
                <option>Bold / Confident</option>
                <option>Luxury</option>
                <option>Cute / Friendly</option>
                <option>Motivational</option>
                <option>Mysterious</option>
              </select>
            </div>
          </div>
          <div class="qvbg-field">
            <label>Interests / Keywords (optional)</label>
            <input type="text" id="qvbg-interests" placeholder="e.g. gym, coding, music, travel" />
          </div>
          <div class="qvbg-field">
            <label>Extra Info (optional)</label>
            <textarea id="qvbg-extra" placeholder="e.g. DM for collabs, Mumbai based, love coffee"></textarea>
          </div>
          <button class="qvbg-btn qvbg-btn-primary" id="qvbg-go">✨ Generate 10 Bios</button>
          <div id="qvbg-out"></div>
        </div>

        <div class="qvbg-note">
          ⚠️ <strong>Tip:</strong> Har bio ko copy karke Instagram pe try karo. Best lagne wala rakho. Ye suggestions hain — apna personal touch zaroor add karo.
        </div>
      </div>
    `;

    wire();
  }

  function wire() {
    const btn = document.getElementById('qvbg-go');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const name = (document.getElementById('qvbg-name').value || '').trim();
      const prof = (document.getElementById('qvbg-prof').value || '').trim();
      const niche = document.getElementById('qvbg-niche').value;
      const vibe = document.getElementById('qvbg-vibe').value;
      const interests = (document.getElementById('qvbg-interests').value || '').trim();
      const extra = (document.getElementById('qvbg-extra').value || '').trim();

      if (!name) { QVH.toast('Name ya brand daalo', 'error'); return; }

      const out = document.getElementById('qvbg-out');
      out.innerHTML = `<div class="qvbg-loading"><div class="qvbg-spinner"></div>AI bios soch raha hai...</div>`;
      btn.disabled = true;

      try {
        const prompt = `Generate 10 different Instagram bio options for this person.

Name/Brand: ${name}
${prof ? 'Profession: ' + prof : ''}
Niche: ${niche}
Vibe/Style: ${vibe}
${interests ? 'Interests: ' + interests : ''}
${extra ? 'Extra info: ' + extra : ''}

Rules:
- Each bio should be 3-5 lines max
- Include relevant emojis (2-4 per bio)
- Use aesthetic symbols where suitable (✨ 💫 🌸 🖤 ⚡ 🌿 💫 ❀)
- Use line breaks between sections
- Include a CTA or link placeholder where natural (e.g. "👇 link below" or "DM for collabs")
- Different styles for each: aesthetic, professional, funny, minimal, bold, poetic, etc.
- Instagram-friendly (no offensive content)
- Mix Hinglish and English where natural
- Each bio should feel unique

Return in this format (numbered 1-10):

1. [bio text with line breaks]

2. [bio text with line breaks]

...and so on.

Return ONLY the numbered list. No intro, no outro.`;

        const text = await callAI(prompt, {
          systemPrompt: 'You are an Instagram bio expert for Indian creators. Return only the numbered list of bios.',
          temperature: 0.95,
          maxTokens: 2000
        });

        const bios = parseBios(text);
        if (!bios.length) throw new Error('Koi bio generate nahi hui. Dobara try karo.');

        out.innerHTML = renderBios(bios);
      } catch (e) {
        out.innerHTML = `<div class="qvbg-error">❌ ${esc(e.message || 'Something went wrong')}</div>`;
      } finally {
        btn.disabled = false;
      }
    });
  }

  function renderBios(bios) {
    const cards = bios.map((b, i) => `
      <div class="qvbg-bio-card" data-bio="${esc(b)}">
        <div class="qvbg-bio-text"><span class="qvbg-bio-num">${i + 1}</span>${esc(b)}</div>
        <div class="qvbg-bio-actions">
          <button class="qvbg-bio-btn" data-act="copy" data-t="${esc(b)}">📋 Copy</button>
          <button class="qvbg-bio-btn primary" data-act="save" data-t="${esc(b)}">💾 Save</button>
        </div>
      </div>
    `).join('');

    return `
      <div style="margin-top:14px">
        <div class="qvbg-card-title" style="margin-bottom:10px">Generated Bios</div>
        <div id="qvbg-bio-list">${cards}</div>
        <div class="qvbg-actions-row">
          <button class="qvbg-action" data-act="copy-all"><span class="ico">📋</span>Copy All</button>
          <button class="qvbg-action" data-act="save-all"><span class="ico">💾</span>Save All</button>
          <button class="qvbg-action" data-act="print"><span class="ico">🖨️</span>Print</button>
        </div>
      </div>
    `;
  }

  /* Delegated events */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (!btn.closest('.qvbg-wrap')) return;
    const act = btn.dataset.act;

    if (act === 'copy') { copyText(btn.dataset.t || ''); return; }
    if (act === 'save') { saveBio(btn.dataset.t || ''); return; }

    if (act === 'copy-all' || act === 'save-all' || act === 'print') {
      const list = document.getElementById('qvbg-bio-list');
      if (!list) return;
      const bios = Array.from(list.querySelectorAll('.qvbg-bio-card')).map(c => c.dataset.bio);
      if (act === 'copy-all') copyText(bios.join('\n\n---\n\n'));
      else if (act === 'save-all') saveBio(bios.join('\n\n---\n\n'), true);
      else printBios(bios);
      return;
    }
  });

  function saveBio(text, isBulk) {
    const KEY = 'qvh_workspace_v1';
    let data = { ideas: [], titles: [], scripts: [] };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        data = { ideas: Array.isArray(p.ideas) ? p.ideas : [], titles: Array.isArray(p.titles) ? p.titles : [], scripts: Array.isArray(p.scripts) ? p.scripts : [] };
      }
    } catch (err) {}

    const title = (isBulk ? 'Bio Set' : 'Bio') + ' — ' + new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    data.ideas.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title,
      notes: text,
      ts: Date.now()
    });
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      QVH.toast('Saved to Idea Vault ✅', 'success');
    } catch (err) { QVH.toast('Save failed', 'error'); }
  }

  function themeColors() {
    const cs = getComputedStyle(document.body);
    function safe(v, fb) { let val = (cs.getPropertyValue(v) || '').trim(); if (!val || val.startsWith('var(') || val.length > 60) return fb; return val; }
    return { bg: safe('--bg', '#0a0e27'), surface: safe('--surface', '#151a3d'), border: safe('--border-strong', 'rgba(255,255,255,0.14)'), text: safe('--text', '#eef1ff'), text2: safe('--text-2', '#a8b0d8'), text3: safe('--text-3', '#6b74a0') };
  }

  function buildReportHTML(bios) {
    const c = themeColors();
    const now = new Date().toLocaleString('en-IN');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Qunverio — Instagram Bios</title><style>
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;background:${c.bg};color:${c.text};padding:40px 32px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .wrap{max-width:720px;margin:0 auto}.brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:3px solid #ec4899;margin-bottom:24px}
      .brand-logo{display:flex;align-items:center;gap:10px}.brand-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#ec4899,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:20px}
      .brand-name{font-size:22px;font-weight:900;color:#ec4899}.brand-meta{font-size:12px;color:${c.text2};text-align:right}
      .doc-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${c.text3};margin-bottom:8px}
      .big{font-size:26px;font-weight:900;color:${c.text};margin-bottom:22px}
      .bcard{background:${c.surface};border:1px solid ${c.border};border-radius:14px;padding:14px 16px;margin-bottom:10px;white-space:pre-wrap;font-size:14px;line-height:1.6;color:${c.text}}
      .bnum{font-weight:900;color:#ec4899;margin-right:8px}
      .footer{margin-top:26px;padding-top:18px;border-top:1px solid ${c.border};text-align:center;font-size:11.5px;color:${c.text3}}
      @media print{body{background:${c.bg} !important;padding:20px 16px}.wrap{max-width:100%}}@page{margin:14mm;size:A4}
    </style></head><body><div class="wrap">
      <div class="brand"><div class="brand-logo"><div class="brand-icon">✨</div><div class="brand-name">Qunverio</div></div><div class="brand-meta">Bio Generator<br>${now}</div></div>
      <div class="doc-title">Instagram Bios</div>
      <div class="big">${bios.length} Options</div>
      ${bios.map((b, i) => `<div class="bcard"><span class="bnum">${i + 1}.</span>${esc(b)}</div>`).join('')}
      <div class="footer">Generated by <strong style="color:${c.text2};">Qunverio</strong> • qunverio.vercel.app</div>
    </div></body></html>`;
  }

  function printBios(bios) {
    const html = buildReportHTML(bios);
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => {
      try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) {}
      setTimeout(() => { if (iframe.parentNode) document.body.removeChild(iframe); }, 1500);
    }, 700);
  }

  QVH.registerRenderer('bio', render);
  console.log('%c✅ Bio Generator registered', 'color:#ec4899;font-weight:bold');
})();