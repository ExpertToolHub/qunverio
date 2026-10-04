/* ============================================================
   QUNVERIO — COMMUNITY LAB (v1.0)
   Path: tools/creator/community.js
   AI posts, polls, Q&A, comment replies
   ============================================================ */

(function () {
  'use strict';
  if (!window.QVH) { console.warn('QVH not loaded — community.js skipping'); return; }
  const QVH = window.QVH;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function copyText(text) {
    if (!navigator.clipboard) { QVH.toast('Copy not supported', 'error'); return; }
    navigator.clipboard.writeText(text).then(() => QVH.toast('Copied! 📋', 'success')).catch(() => QVH.toast('Copy failed', 'error'));
  }
  async function callAI(prompt, opts) {
    opts = opts || {};
    const body = { prompt, systemPrompt: opts.systemPrompt || '', temperature: opts.temperature != null ? opts.temperature : 0.85, maxTokens: opts.maxTokens || 1500 };
    const r = await fetch('/api/creator-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { let errMsg = 'AI request failed'; try { const j = await r.json(); errMsg = j.error || j.details || errMsg; } catch (e) {} throw new Error(errMsg); }
    const data = await r.json();
    if (!data.success || !data.text) throw new Error('Empty AI response');
    return data.text;
  }

  function parseList(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const items = [];
    for (let line of lines) {
      let t = line.replace(/^\*\*|\*\*$/g, '').replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*]\s*/, '').replace(/^["'`]|["'`]$/g, '').trim();
      if (!t) continue;
      if (/^(here|sure|ye|yeh|below|following|these)/i.test(t) && t.length < 80) continue;
      if (t.endsWith(':')) continue;
      if (t.length < 5) continue;
      if (t.length > 400) t = t.slice(0, 400);
      items.push(t);
    }
    return items;
  }

  function cleanText(text) {
    let out = text.trim();
    out = out.replace(/^\*\*|\*\*$/gm, '');
    out = out.replace(/^#+\s*/gm, '');
    out = out.replace(/^(here|sure|below|following)[^\n]*\n+/i, '');
    return out.trim();
  }

  const CSS = `
    .qvhk-wrap { max-width: 720px; margin: 0 auto; }
    .qvhk-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 12px; scrollbar-width: none; }
    .qvhk-tabs::-webkit-scrollbar { display: none; }
    .qvhk-tab { flex: 0 0 auto; padding: 8px 14px; border-radius: 20px; background: var(--surface-2, #1c2250); border: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 12px; font-weight: 700; color: var(--text-2, #a8b0d8); cursor: pointer; white-space: nowrap; transition: all .18s; }
    .qvhk-tab.active { background: linear-gradient(135deg,#14b8a6,#06b6d4); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(20,184,166,.35); }
    .qvhk-panel { display: none; }
    .qvhk-panel.active { display: block; animation: qvhk-fade .22s ease; }
    @keyframes qvhk-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
    .qvhk-card { background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 14px; padding: 15px; margin-bottom: 12px; }
    .qvhk-card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; color: var(--text-3, #6b74a0); margin-bottom: 12px; }
    .qvhk-field { margin-bottom: 12px; }
    .qvhk-field label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2, #a8b0d8); margin-bottom: 5px; }
    .qvhk-field input, .qvhk-field textarea, .qvhk-field select { width: 100%; padding: 11px 13px; background: var(--surface-2, #1c2250); border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 11px; font-size: 14px; outline: none; color: var(--text, #eef1ff); font-family: inherit; box-sizing: border-box; transition: border-color .18s; }
    .qvhk-field input:focus, .qvhk-field textarea:focus, .qvhk-field select:focus { border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,.15); }
    .qvhk-field textarea { resize: vertical; min-height: 70px; }
    .qvhk-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 420px) { .qvhk-row2 { grid-template-columns: 1fr; } }
    .qvhk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 13px 18px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: transform .15s; }
    .qvhk-btn:active { transform: scale(.97); }
    .qvhk-btn-primary { background: linear-gradient(135deg,#14b8a6,#06b6d4); color: #fff; width: 100%; box-shadow: 0 4px 14px rgba(20,184,166,.35); }
    .qvhk-loading { text-align: center; padding: 28px 16px; color: var(--text-2, #a8b0d8); font-size: 13px; }
    .qvhk-spinner { width: 32px; height: 32px; margin: 0 auto 12px; border: 3px solid var(--surface-2, #1c2250); border-top-color: #14b8a6; border-radius: 50%; animation: qvhk-spin .8s linear infinite; }
    @keyframes qvhk-spin { to { transform: rotate(360deg) } }
    .qvhk-error { background: rgba(239,68,68,.1); border-left: 3px solid #ef4444; border-radius: 10px; padding: 12px 14px; margin-top: 12px; font-size: 13px; color: #fca5a5; line-height: 1.5; }
    .qvhk-result { background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 12px; padding: 14px; margin-top: 12px; }
    .qvhk-result-text { font-size: 13.5px; line-height: 1.65; color: var(--text, #eef1ff); white-space: pre-wrap; word-break: break-word; max-height: 420px; overflow-y: auto; }
    .qvhk-stat-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12.5px; color: var(--text-2, #a8b0d8); border-bottom: 1px solid var(--border, rgba(255,255,255,0.05)); }
    .qvhk-stat-row:last-child { border-bottom: none; }
    .qvhk-stat-row .val { color: var(--text, #eef1ff); font-weight: 700; }
    .qvhk-stat-row .val.good { color: #10b981; }
    .qvhk-card-item { background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 12px; padding: 13px 14px; margin-bottom: 9px; }
    .qvhk-item-num { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 8px; background: linear-gradient(135deg,#14b8a6,#06b6d4); color: #fff; font-size: 11px; font-weight: 800; margin-right: 8px; flex-shrink: 0; }
    .qvhk-item-text { font-size: 13.5px; font-weight: 600; color: var(--text, #eef1ff); line-height: 1.5; margin-bottom: 9px; display: flex; align-items: flex-start; word-break: break-word; }
    .qvhk-item-actions { display: flex; gap: 5px; flex-wrap: wrap; }
    .qvhk-item-btn { padding: 6px 10px; border-radius: 7px; background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 11px; font-weight: 700; color: var(--text-2, #a8b0d8); cursor: pointer; }
    .qvhk-item-btn:hover { background: var(--surface-hover, #232a5e); color: var(--text, #eef1ff); }
    .qvhk-item-btn.primary { background: linear-gradient(135deg,#14b8a6,#06b6d4); color: #fff; border-color: transparent; }
    .qvhk-actions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 12px; }
    .qvhk-action { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px; border-radius: 10px; background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); font-size: 11px; font-weight: 700; color: var(--text, #eef1ff); cursor: pointer; }
    .qvhk-action:hover { background: var(--surface-hover, #232a5e); }
    .qvhk-action .ico { font-size: 15px; }
    .qvhk-note { font-size: 11.5px; color: var(--text-3, #6b74a0); background: var(--surface-2, #1c2250); border-left: 3px solid #f59e0b; padding: 10px 12px; border-radius: 8px; margin-top: 12px; line-height: 1.55; }
  `;

  function injectCSS() {
    if (document.getElementById('qvhk-css')) return;
    const s = document.createElement('style');
    s.id = 'qvhk-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  function render(container) {
    injectCSS();
    container.innerHTML = `
      <div class="qvhk-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#14b8a6,#06b6d4)">
          <div class="qvh-th-icon">💬</div>
          <div style="flex:1;min-width:0"><h3>Community Lab</h3><p>AI community posts, polls, Q&A, comment replies</p></div>
        </div>
        <div class="qvhk-tabs" id="qvhkTabs">
          <button class="qvhk-tab active" data-tab="post">📝 Post</button>
          <button class="qvhk-tab" data-tab="poll">📊 Poll</button>
          <button class="qvhk-tab" data-tab="qa">🎤 Q&A</button>
          <button class="qvhk-tab" data-tab="reply">💬 Reply</button>
          <button class="qvhk-tab" data-tab="hate">🛡️ Hate Reply</button>
        </div>
        <div id="qvhkPanels">
          ${panelPost()}${panelPoll()}${panelQa()}${panelReply()}${panelHate()}
        </div>
        <div class="qvhk-note">
          ⚠️ <strong>Note:</strong> Ye AI-generated suggestions hain. Apni audience aur brand voice ke hisaab se edit karo. No guaranteed engagement.
        </div>
      </div>`;
    wireTabs(); wirePanels();
  }

  function panelPost() {
    return `<div class="qvhk-panel active" data-panel="post"><div class="qvhk-card">
      <div class="qvhk-card-title">Community Post Generator</div>
      <div class="qvhk-field"><label>Post Topic / Theme *</label><input type="text" id="qvhk-p-topic" placeholder="e.g. behind the scenes of my last video" /></div>
      <div class="qvhk-row2">
        <div class="qvhk-field"><label>Language</label><select id="qvhk-p-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
        <div class="qvhk-field"><label>Post Type</label><select id="qvhk-p-type"><option value="update">Channel update</option><option value="question">Question to audience</option><option value="teaser">Teaser / Announcement</option><option value="tips">Quick tips</option><option value="behind">Behind the scenes</option></select></div>
      </div>
      <button class="qvhk-btn qvhk-btn-primary" id="qvhk-p-go">📝 Generate Post</button>
      <div id="qvhk-p-out"></div>
    </div></div>`;
  }
  function panelPoll() {
    return `<div class="qvhk-panel" data-panel="poll"><div class="qvhk-card">
      <div class="qvhk-card-title">Poll Generator</div>
      <div class="qvhk-field"><label>Poll Topic *</label><input type="text" id="qvhk-po-topic" placeholder="e.g. which topic should I cover next?" /></div>
      <div class="qvhk-row2">
        <div class="qvhk-field"><label>Language</label><select id="qvhk-po-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
        <div class="qvhk-field"><label>Options Count</label><select id="qvhk-po-count"><option value="3">3 options</option><option value="4" selected>4 options</option></select></div>
      </div>
      <button class="qvhk-btn qvhk-btn-primary" id="qvhk-po-go">📊 Generate Poll</button>
      <div id="qvhk-po-out"></div>
    </div></div>`;
  }
  function panelQa() {
    return `<div class="qvhk-panel" data-panel="qa"><div class="qvhk-card">
      <div class="qvhk-card-title">Q&A Generator</div>
      <div class="qvhk-field"><label>Your Channel Niche *</label><input type="text" id="qvhk-qa-niche" placeholder="e.g. personal finance for beginners" /></div>
      <div class="qvhk-field"><label>Language</label><select id="qvhk-qa-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
      <button class="qvhk-btn qvhk-btn-primary" id="qvhk-qa-go">🎤 Generate Q&A Prompts</button>
      <div id="qvhk-qa-out"></div>
    </div></div>`;
  }
  function panelReply() {
    return `<div class="qvhk-panel" data-panel="reply"><div class="qvhk-card">
      <div class="qvhk-card-title">Comment Reply Generator</div>
      <div class="qvhk-field"><label>Comment to Reply To *</label><textarea id="qvhk-r-comment" placeholder="Paste the comment here..."></textarea></div>
      <div class="qvhk-row2">
        <div class="qvhk-field"><label>Language</label><select id="qvhk-r-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
        <div class="qvhk-field"><label>Reply Style</label><select id="qvhk-r-style"><option value="friendly">Friendly</option><option value="professional">Professional</option><option value="grateful">Grateful</option><option value="question">Question back</option></select></div>
      </div>
      <button class="qvhk-btn qvhk-btn-primary" id="qvhk-r-go">💬 Generate Reply</button>
      <div id="qvhk-r-out"></div>
    </div></div>`;
  }
  function panelHate() {
    return `<div class="qvhk-panel" data-panel="hate"><div class="qvhk-card">
      <div class="qvhk-card-title">Hate / Negative Comment Reply</div>
      <div class="qvhk-field"><label>Negative Comment *</label><textarea id="qvhk-h-comment" placeholder="Paste the hate / negative comment..."></textarea></div>
      <div class="qvhk-row2">
        <div class="qvhk-field"><label>Language</label><select id="qvhk-h-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
        <div class="qvhk-field"><label>Reply Approach</label><select id="qvhk-h-approach"><option value="polite">Polite & Professional</option><option value="ignore">Soft Ignore</option><option value="curious">Ask for feedback</option><option value="calm">Calm & Positive</option></select></div>
      </div>
      <button class="qvhk-btn qvhk-btn-primary" id="qvhk-h-go">🛡️ Generate Replies</button>
      <div id="qvhk-h-out"></div>
    </div></div>`;
  }

  function wireTabs() {
    document.querySelectorAll('.qvhk-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.qvhk-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.qvhk-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
      });
    });
  }

  function wirePanels() {
    bind('qvhk-p-go', 'qvhk-p-out', async () => {
      const topic = (document.getElementById('qvhk-p-topic').value || '').trim();
      const lang = document.getElementById('qvhk-p-lang').value;
      const type = document.getElementById('qvhk-p-type').value;
      if (!topic) throw new Error('Topic daalo');
      const typeMap = { update: 'channel update', question: 'engaging question to audience', teaser: 'teaser / announcement', tips: 'quick tips', behind: 'behind the scenes' };
      const prompt = `Write a YouTube Community Post in ${lang}.\n\nTopic: ${topic}\nPost type: ${typeMap[type]}\n\nRules:\n- 80-200 words\n- Conversational tone\n- End with an engaging CTA (ask to comment / vote / share)\n- Use emojis sparingly (2-4)\n- No false promises\n- Language: ${lang}\n\nReturn ONLY the post text.`;
      const text = await callAI(prompt, { systemPrompt: 'YouTube community manager. Return only the post text.', temperature: 0.85, maxTokens: 700 });
      return { type: 'text', text: cleanText(text) };
    });

    bind('qvhk-po-go', 'qvhk-po-out', async () => {
      const topic = (document.getElementById('qvhk-po-topic').value || '').trim();
      const lang = document.getElementById('qvhk-po-lang').value;
      const count = document.getElementById('qvhk-po-count').value;
      if (!topic) throw new Error('Topic daalo');
      const prompt = `Create a YouTube Community Poll in ${lang}.\n\nPoll topic: ${topic}\nNumber of options: ${count}\n\nFormat:\nQuestion: [the poll question]\nOptions:\n1. [option]\n2. [option]\n...\n\nRules:\n- Question short and clear (under 15 words)\n- Options distinct, engaging\n- Language: ${lang}\n\nReturn ONLY in the format above.`;
      const text = await callAI(prompt, { systemPrompt: 'YouTube community poll expert. Return only the poll format.', temperature: 0.9, maxTokens: 500 });
      return { type: 'text', text: cleanText(text) };
    });

    bind('qvhk-qa-go', 'qvhk-qa-out', async () => {
      const niche = (document.getElementById('qvhk-qa-niche').value || '').trim();
      const lang = document.getElementById('qvhk-qa-lang').value;
      if (!niche) throw new Error('Niche daalo');
      const prompt = `Generate 8 Q&A prompts for a YouTube community post in ${lang}.\nNiche: ${niche}\n\nRules:\n- Each prompt invites audience to share their answer\n- Questions relevant to the niche\n- 1 line each\n- Language: ${lang}\n\nReturn ONLY numbered list 1-8.`;
      const text = await callAI(prompt, { systemPrompt: 'YouTube community engagement expert. Return only numbered list.', temperature: 0.9, maxTokens: 800 });
      const items = parseList(text);
      return { type: 'list', items };
    });

    bind('qvhk-r-go', 'qvhk-r-out', async () => {
      const comment = (document.getElementById('qvhk-r-comment').value || '').trim();
      const lang = document.getElementById('qvhk-r-lang').value;
      const style = document.getElementById('qvhk-r-style').value;
      if (!comment) throw new Error('Comment daalo');
      const styleMap = { friendly: 'warm and friendly', professional: 'polite and professional', grateful: 'grateful and appreciative', question: 'engage with a follow-up question' };
      const prompt = `Write 3 reply options for this YouTube comment in ${lang}.\n\nComment: "${comment}"\n\nReply style: ${styleMap[style]}\nLanguage: ${lang}\n\nRules:\n- Each reply under 40 words\n- Natural, genuine tone\n- Language: ${lang}\n\nReturn ONLY numbered list 1-3.`;
      const text = await callAI(prompt, { systemPrompt: 'YouTube community manager. Return only numbered list.', temperature: 0.85, maxTokens: 500 });
      const items = parseList(text);
      return { type: 'list', items };
    });

    bind('qvhk-h-go', 'qvhk-h-out', async () => {
      const comment = (document.getElementById('qvhk-h-comment').value || '').trim();
      const lang = document.getElementById('qvhk-h-lang').value;
      const approach = document.getElementById('qvhk-h-approach').value;
      if (!comment) throw new Error('Comment daalo');
      const approachMap = { polite: 'polite, professional — never rude', ignore: 'soft ignore without engaging in argument', curious: 'ask for constructive feedback', calm: 'calm and positive — defuse tension' };
      const prompt = `Write 3 reply options for this negative / hate YouTube comment in ${lang}.\n\nComment: "${comment}"\n\nApproach: ${approachMap[approach]}\nLanguage: ${lang}\n\nRules:\n- Never attack back\n- Keep it short (under 40 words)\n- Maintain creator's dignity\n- Language: ${lang}\n\nReturn ONLY numbered list 1-3.`;
      const text = await callAI(prompt, { systemPrompt: 'You help YouTube creators handle hate comments professionally. Return only numbered list.', temperature: 0.8, maxTokens: 500 });
      const items = parseList(text);
      return { type: 'list', items };
    });
  }

  function bind(btnId, outId, fn) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const out = document.getElementById(outId);
      out.innerHTML = `<div class="qvhk-loading"><div class="qvhk-spinner"></div>AI soch raha hai...</div>`;
      btn.disabled = true;
      try {
        const res = await fn();
        out.innerHTML = renderResult(res, outId);
      } catch (e) {
        out.innerHTML = `<div class="qvhk-error">❌ ${esc(e.message || 'Something went wrong')}</div>`;
      } finally { btn.disabled = false; }
    });
  }

  function renderResult(res, key) {
    if (!res) return '';
    if (res.type === 'text') {
      const words = res.text.split(/\s+/).filter(Boolean).length;
      const chars = res.text.length;
      return `
        <div class="qvhk-stat-row"><span>Words</span><span class="val">${words}</span></div>
        <div class="qvhk-stat-row"><span>Characters</span><span class="val">${chars}</span></div>
        <div class="qvhk-result"><div class="qvhk-result-text" id="qvhk-${key}-text">${esc(res.text)}</div></div>
        <div class="qvhk-actions-row">
          <button class="qvhk-action" data-act="copy-text" data-target="qvhk-${key}-text"><span class="ico">📋</span>Copy</button>
          <button class="qvhk-action" data-act="save-text" data-target="qvhk-${key}-text"><span class="ico">💾</span>Save</button>
          <button class="qvhk-action" data-act="print-text" data-target="qvhk-${key}-text" data-title="Community Lab"><span class="ico">🖨️</span>Print</button>
        </div>`;
    }
    if (res.type === 'list') {
      const cards = res.items.map((t, i) => `
        <div class="qvhk-card-item" data-item="${esc(t)}">
          <div class="qvhk-item-text"><span class="qvhk-item-num">${i + 1}</span><span>${esc(t)}</span></div>
          <div class="qvhk-item-actions">
            <button class="qvhk-item-btn" data-act="copy-item" data-t="${esc(t)}">📋 Copy</button>
            <button class="qvhk-item-btn primary" data-act="save-item" data-t="${esc(t)}">💾 Save</button>
          </div>
        </div>`).join('');
      return `
        <div class="qvhk-stat-row"><span>Total</span><span class="val good">${res.items.length} options</span></div>
        <div style="margin-top:12px" id="qvhk-${key}-list">${cards}</div>
        <div class="qvhk-actions-row">
          <button class="qvhk-action" data-act="copy-all" data-key="${key}"><span class="ico">📋</span>Copy All</button>
          <button class="qvhk-action" data-act="save-all" data-key="${key}"><span class="ico">💾</span>Save All</button>
          <button class="qvhk-action" data-act="print-all" data-key="${key}"><span class="ico">🖨️</span>Print</button>
        </div>`;
    }
    return '';
  }

  /* Delegated events */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (!btn.closest('.qvhk-wrap')) return;
    const act = btn.dataset.act;

    if (act === 'copy-item') { copyText(btn.dataset.t || ''); return; }
    if (act === 'save-item') { saveText(btn.dataset.t || '', 'Community'); return; }
    if (act === 'copy-text') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      copyText((el.innerText || el.textContent || '').trim());
      return;
    }
    if (act === 'save-text') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      saveText((el.innerText || el.textContent || '').trim(), 'Community');
      return;
    }
    if (act === 'print-text') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      printText((el.innerText || el.textContent || '').trim(), btn.dataset.title || 'Community Lab');
      return;
    }
    if (act === 'copy-all' || act === 'save-all' || act === 'print-all') {
      const list = document.getElementById('qvhk-' + btn.dataset.key + '-list');
      if (!list) return;
      const items = Array.from(list.querySelectorAll('.qvhk-card-item')).map(c => c.dataset.item);
      const text = items.map((x, i) => `${i + 1}. ${x}`).join('\n\n');
      if (act === 'copy-all') copyText(text);
      else if (act === 'save-all') saveText(text, 'Community');
      else printText(text, 'Community Lab');
      return;
    }
  });

  function saveText(text, kind) {
    const KEY = 'qvh_workspace_v1';
    let data = { ideas: [], titles: [], scripts: [] };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        data = { ideas: Array.isArray(p.ideas) ? p.ideas : [], titles: Array.isArray(p.titles) ? p.titles : [], scripts: Array.isArray(p.scripts) ? p.scripts : [] };
      }
    } catch (err) {}
    const title = (kind || 'Community') + ' — ' + new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    data.scripts.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), title, notes: text, ts: Date.now() });
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      QVH.toast('Saved to Script Vault ✅', 'success');
    } catch (err) { QVH.toast('Save failed', 'error'); }
  }

  function themeColors() {
    const cs = getComputedStyle(document.body);
    function safe(v, fb) { let val = (cs.getPropertyValue(v) || '').trim(); if (!val || val.startsWith('var(') || val.length > 60) return fb; return val; }
    return { bg: safe('--bg', '#0a0e27'), surface: safe('--surface', '#151a3d'), border: safe('--border-strong', 'rgba(255,255,255,0.14)'), text: safe('--text', '#eef1ff'), text2: safe('--text-2', '#a8b0d8'), text3: safe('--text-3', '#6b74a0') };
  }

  function buildReportHTML(content, heading) {
    const c = themeColors();
    const now = new Date().toLocaleString('en-IN');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Qunverio — ${heading}</title><style>
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;background:${c.bg};color:${c.text};padding:40px 32px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .wrap{max-width:720px;margin:0 auto}.brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:3px solid #14b8a6;margin-bottom:24px}.brand-logo{display:flex;align-items:center;gap:10px}.brand-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#14b8a6,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:20px}.brand-name{font-size:22px;font-weight:900;color:#14b8a6}.brand-meta{font-size:12px;color:${c.text2};text-align:right}
      .doc-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${c.text3};margin-bottom:8px}.content{background:${c.surface};border:1px solid ${c.border};border-radius:14px;padding:18px 20px;font-size:14px;line-height:1.7;color:${c.text};white-space:pre-wrap;word-break:break-word}
      .footer{margin-top:26px;padding-top:18px;border-top:1px solid ${c.border};text-align:center;font-size:11.5px;color:${c.text3}}
      @media print{body{background:${c.bg} !important;padding:20px 16px}.wrap{max-width:100%}}@page{margin:14mm;size:A4}
    </style></head><body><div class="wrap">
      <div class="brand"><div class="brand-logo"><div class="brand-icon">⚡</div><div class="brand-name">Qunverio</div></div><div class="brand-meta">Community Lab<br>${now}</div></div>
      <div class="doc-title">${heading}</div>
      <div class="content">${esc(content)}</div>
      <div class="footer">Generated by <strong style="color:${c.text2};">Qunverio Creator Hub</strong> • qunverio.vercel.app</div>
    </div></body></html>`;
  }

  function printText(content, heading) {
    const html = buildReportHTML(content, heading);
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => { try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) {} setTimeout(() => { if (iframe.parentNode) document.body.removeChild(iframe); }, 1500); }, 700);
  }

  QVH.registerRenderer('community', render);
  console.log('%c✅ Community Lab registered', 'color:#14b8a6;font-weight:bold');
})();