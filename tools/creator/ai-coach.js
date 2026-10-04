/* ============================================================
   QUNVERIO — AI YOUTUBE COACH (v1.0)
   Path: tools/creator/ai-coach.js
   Chat-style context-aware YouTube coach
   ============================================================ */

(function () {
  'use strict';
  if (!window.QVH) { console.warn('QVH not loaded — ai-coach.js skipping'); return; }
  const QVH = window.QVH;

  const HISTORY_KEY = 'qvh_coach_history_v1';
  const MAX_HISTORY = 30;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function copyText(text) {
    if (!navigator.clipboard) { QVH.toast('Copy not supported', 'error'); return; }
    navigator.clipboard.writeText(text).then(() => QVH.toast('Copied! 📋', 'success')).catch(() => QVH.toast('Copy failed', 'error'));
  }

  async function callAI(prompt, systemPrompt) {
    const r = await fetch('/api/creator-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemPrompt, temperature: 0.8, maxTokens: 2000 })
    });
    if (!r.ok) { let errMsg = 'AI request failed'; try { const j = await r.json(); errMsg = j.error || j.details || errMsg; } catch (e) {} throw new Error(errMsg); }
    const data = await r.json();
    if (!data.success || !data.text) throw new Error('Empty AI response');
    return data.text;
  }

  function loadHistory() {
    try { const raw = localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; }
    catch (e) { return []; }
  }
  function saveHistory(h) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-MAX_HISTORY))); } catch (e) {}
  }

  // Read workspace data for context
  function getWorkspaceContext() {
    try {
      const raw = localStorage.getItem('qvh_workspace_v1');
      if (!raw) return '';
      const d = JSON.parse(raw);
      const ideas = (d.ideas || []).slice(0, 5).map(x => x.title);
      const titles = (d.titles || []).slice(0, 5).map(x => x.title);
      const scripts = (d.scripts || []).slice(0, 3).map(x => x.title);
      let ctx = '';
      if (ideas.length) ctx += `\nRecent saved ideas: ${ideas.join(' | ')}`;
      if (titles.length) ctx += `\nRecent saved titles: ${titles.join(' | ')}`;
      if (scripts.length) ctx += `\nRecent scripts/analyses: ${scripts.join(' | ')}`;
      return ctx;
    } catch (e) { return ''; }
  }

  const CSS = `
    .qvhc-wrap { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; height: 100%; }
    .qvhc-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
    .qvhc-header-title { display: flex; align-items: center; gap: 10px; }
    .qvhc-avatar {
      width: 40px; height: 40px; border-radius: 12px;
      background: linear-gradient(135deg,#6366f1,#ec4899);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; color: #fff;
      box-shadow: 0 4px 12px rgba(99,102,241,.35);
      flex-shrink: 0;
    }
    .qvhc-header-title h3 { font-size: 15px; font-weight: 800; color: var(--text, #eef1ff); margin: 0; }
    .qvhc-header-title p { font-size: 11.5px; color: var(--text-3, #6b74a0); margin: 1px 0 0; }
    .qvhc-clear {
      padding: 7px 12px; border-radius: 9px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      font-size: 11.5px; font-weight: 700;
      color: var(--text-2, #a8b0d8);
      cursor: pointer; flex-shrink: 0;
    }
    .qvhc-clear:hover { background: rgba(239,68,68,.12); color: #ef4444; }

    .qvhc-chat {
      flex: 1; min-height: 320px; max-height: 60vh;
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 14px;
      padding: 14px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
      margin-bottom: 10px;
      display: flex; flex-direction: column; gap: 10px;
    }

    .qvhc-msg {
      display: flex; gap: 9px; align-items: flex-end;
      max-width: 88%;
    }
    .qvhc-msg.user { align-self: flex-end; flex-direction: row-reverse; }
    .qvhc-msg-avatar {
      width: 28px; height: 28px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; flex-shrink: 0;
    }
    .qvhc-msg.user .qvhc-msg-avatar { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; }
    .qvhc-msg.ai .qvhc-msg-avatar { background: linear-gradient(135deg,#ec4899,#6366f1); color: #fff; }
    .qvhc-bubble {
      padding: 10px 13px; border-radius: 14px;
      font-size: 13.5px; line-height: 1.55;
      white-space: pre-wrap; word-break: break-word;
      max-width: 100%;
    }
    .qvhc-msg.user .qvhc-bubble {
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .qvhc-msg.ai .qvhc-bubble {
      background: var(--surface-2, #1c2250);
      color: var(--text, #eef1ff);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-bottom-left-radius: 4px;
    }
    .qvhc-bubble-actions {
      display: flex; gap: 5px; margin-top: 7px;
      flex-wrap: wrap;
    }
    .qvhc-bubble-btn {
      padding: 4px 9px; border-radius: 6px;
      background: var(--surface, #151a3d);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      font-size: 10.5px; font-weight: 700;
      color: var(--text-2, #a8b0d8);
      cursor: pointer; transition: all .15s;
    }
    .qvhc-bubble-btn:hover { background: var(--surface-hover, #232a5e); color: var(--text, #eef1ff); }

    .qvhc-typing {
      display: flex; gap: 4px; padding: 10px 14px;
      background: var(--surface-2, #1c2250);
      border-radius: 14px;
      width: fit-content;
    }
    .qvhc-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--text-3, #6b74a0);
      animation: qvhc-bounce 1.2s infinite;
    }
    .qvhc-typing span:nth-child(2) { animation-delay: .15s; }
    .qvhc-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes qvhc-bounce { 0%,60%,100% { transform: translateY(0); opacity: .5 } 30% { transform: translateY(-6px); opacity: 1 } }

    .qvhc-empty {
      text-align: center; padding: 28px 16px; color: var(--text-3, #6b74a0);
      font-size: 13px; line-height: 1.5;
    }
    .qvhc-empty .qvhc-empty-icon { font-size: 42px; display: block; margin-bottom: 8px; opacity: .7; }
    .qvhc-empty strong { display: block; color: var(--text-2, #a8b0d8); font-size: 14.5px; margin-bottom: 4px; }

    .qvhc-quick {
      display: flex; gap: 6px; overflow-x: auto;
      padding-bottom: 8px; margin-bottom: 10px;
      scrollbar-width: none;
    }
    .qvhc-quick::-webkit-scrollbar { display: none; }
    .qvhc-qbtn {
      flex: 0 0 auto;
      padding: 8px 12px; border-radius: 20px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      font-size: 11.5px; font-weight: 600;
      color: var(--text-2, #a8b0d8);
      cursor: pointer; white-space: nowrap;
      transition: all .15s;
    }
    .qvhc-qbtn:hover { background: var(--surface-hover, #232a5e); color: var(--text, #eef1ff); border-color: var(--border-strong, rgba(255,255,255,0.14)); }

    .qvhc-input-row {
      display: flex; gap: 8px; align-items: flex-end;
    }
    .qvhc-input {
      flex: 1;
      background: var(--surface, #151a3d);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 14px;
      padding: 11px 14px;
      font-size: 14px; outline: none;
      color: var(--text, #eef1ff);
      font-family: inherit;
      resize: none;
      min-height: 44px; max-height: 120px;
      box-sizing: border-box;
      transition: border-color .18s;
    }
    .qvhc-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
    .qvhc-send {
      width: 44px; height: 44px; border-radius: 14px;
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      border: none; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; cursor: pointer; flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(99,102,241,.4);
      transition: transform .15s;
    }
    .qvhc-send:active { transform: scale(.94); }
    .qvhc-send:disabled { opacity: .5; cursor: not-allowed; }

    .qvhc-note {
      font-size: 11px; color: var(--text-3, #6b74a0);
      text-align: center; margin-top: 8px; line-height: 1.5;
    }
  `;

  function injectCSS() {
    if (document.getElementById('qvhc-css')) return;
    const s = document.createElement('style');
    s.id = 'qvhc-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  let history = [];
  let isWaiting = false;

  function render(container) {
    injectCSS();
    history = loadHistory();

    container.innerHTML = `
      <div class="qvhc-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#6366f1,#ec4899)">
          <div class="qvh-th-icon">🤖</div>
          <div style="flex:1;min-width:0"><h3>AI YouTube Coach</h3><p>Ask anything about your channel, content, growth</p></div>
        </div>

        <div class="qvhc-header">
          <div class="qvhc-header-title">
            <div class="qvhc-avatar">🤖</div>
            <div>
              <h3>Your Coach</h3>
              <p>${history.length ? history.length + ' messages in history' : 'Ready to help'}</p>
            </div>
          </div>
          ${history.length ? '<button class="qvhc-clear" id="qvhc-clear">🗑️ Clear</button>' : ''}
        </div>

        <div class="qvhc-chat" id="qvhc-chat"></div>

        <div class="qvhc-quick" id="qvhc-quick">
          <button class="qvhc-qbtn" data-q="Mere channel ke liye next video kya hona chahiye?">🎯 Next video idea</button>
          <button class="qvhc-qbtn" data-q="Mere views kyu kam aa rahe hain? Kya improve karun?">📉 Views kam kyun</button>
          <button class="qvhc-qbtn" data-q="1,000 subscribers fast kaise laaun?">🏆 1K subs plan</button>
          <button class="qvhc-qbtn" data-q="Beginner ke liye best niche kaunsa hai?">🎨 Best niche</button>
          <button class="qvhc-qbtn" data-q="Mera thumbnail improve karne ke tips do.">🖼️ Thumbnail tips</button>
          <button class="qvhc-qbtn" data-q="YouTube SEO kaise improve karun?">🔍 SEO tips</button>
        </div>

        <div class="qvhc-input-row">
          <textarea class="qvhc-input" id="qvhc-input" rows="1" placeholder="Ask your coach... (e.g. mere channel ke liye next video kya banau?)"></textarea>
          <button class="qvhc-send" id="qvhc-send" aria-label="Send">➤</button>
        </div>
        <div class="qvhc-note">⚠️ AI advice suggestions hain. Apni judgment use karo. Ye tool YouTube se affiliated nahi hai.</div>
      </div>
    `;

    renderChat();
    wireEvents();
  }

  function renderChat() {
    const chat = document.getElementById('qvhc-chat');
    if (!chat) return;

    if (!history.length) {
      chat.innerHTML = `
        <div class="qvhc-empty">
          <span class="qvhc-empty-icon">💬</span>
          <strong>Hi! Main tumhara YouTube Coach hoon.</strong>
          Channel, content, SEO, growth — kuch bhi poochho.<br>
          Neeche quick buttons se start kar sakte ho.
        </div>
      `;
      return;
    }

    chat.innerHTML = history.map((m, i) => renderMessage(m, i)).join('');
    chat.scrollTop = chat.scrollHeight;
  }

  function renderMessage(msg, idx) {
    const isUser = msg.role === 'user';
    const avatar = isUser ? '👤' : '🤖';
    const cls = isUser ? 'user' : 'ai';
    let actions = '';
    if (!isUser && msg.content) {
      actions = `
        <div class="qvhc-bubble-actions">
          <button class="qvhc-bubble-btn" data-act="copy-msg" data-idx="${idx}">📋 Copy</button>
          <button class="qvhc-bubble-btn" data-act="save-msg" data-idx="${idx}">💾 Save</button>
        </div>
      `;
    }
    return `
      <div class="qvhc-msg ${cls}">
        <div class="qvhc-msg-avatar">${avatar}</div>
        <div class="qvhc-bubble">${esc(msg.content)}${actions}</div>
      </div>
    `;
  }

  function appendMessage(msg) {
    const chat = document.getElementById('qvhc-chat');
    if (!chat) return;
    // Remove empty state if present
    const empty = chat.querySelector('.qvhc-empty');
    if (empty) empty.remove();

    const idx = history.length;
    history.push(msg);
    saveHistory(history);

    const div = document.createElement('div');
    div.innerHTML = renderMessage(msg, idx);
    chat.appendChild(div.firstElementChild);
    chat.scrollTop = chat.scrollHeight;
  }

  function showTyping() {
    const chat = document.getElementById('qvhc-chat');
    if (!chat) return;
    const div = document.createElement('div');
    div.className = 'qvhc-msg ai';
    div.id = 'qvhc-typing';
    div.innerHTML = `
      <div class="qvhc-msg-avatar">🤖</div>
      <div class="qvhc-typing"><span></span><span></span><span></span></div>
    `;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('qvhc-typing');
    if (t) t.remove();
  }

  async function sendMessage(text) {
    text = (text || '').trim();
    if (!text || isWaiting) return;
    isWaiting = true;

    const sendBtn = document.getElementById('qvhc-send');
    const inputEl = document.getElementById('qvhc-input');
    if (sendBtn) sendBtn.disabled = true;
    if (inputEl) { inputEl.value = ''; inputEl.style.height = 'auto'; }

    appendMessage({ role: 'user', content: text });
    showTyping();

    try {
      // Build conversation context (last 6 turns)
      const recent = history.slice(-8);
      const convParts = recent.map(m => (m.role === 'user' ? 'User: ' : 'Coach: ') + m.content).join('\n\n');

      const workspaceCtx = getWorkspaceContext();
      const sys = `You are Qunverio's YouTube Coach — a friendly, practical YouTube growth expert for Indian creators.

Your style:
- Reply in the SAME language the user writes in (Hindi / English / Hinglish)
- Be conversational, encouraging, and practical
- Give specific, actionable advice — not generic platitudes
- Use bullet points when listing tips
- Keep answers focused (150-300 words usually)
- Never promise guaranteed results
- Never invent metrics or fake data
- If user asks something outside YouTube/content creation, gently redirect

${workspaceCtx ? 'USER CONTEXT (from their workspace):' + workspaceCtx : ''}`;

      const prompt = `Previous conversation:\n${convParts}\n\nUser's new message: ${text}\n\nRespond as the coach.`;

      const reply = await callAI(prompt, sys);
      hideTyping();
      appendMessage({ role: 'assistant', content: reply.trim() });
    } catch (e) {
      hideTyping();
      appendMessage({ role: 'assistant', content: '❌ Sorry, kuch problem aa gayi. Dobara try karo.\n\n' + (e.message || '') });
    } finally {
      isWaiting = false;
      if (sendBtn) sendBtn.disabled = false;
      const i = document.getElementById('qvhc-input');
      if (i) i.focus();
    }
  }

  function wireEvents() {
    const sendBtn = document.getElementById('qvhc-send');
    const inputEl = document.getElementById('qvhc-input');
    const clearBtn = document.getElementById('qvhc-clear');

    if (sendBtn) sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
    if (inputEl) {
      inputEl.addEventListener('input', () => {
        inputEl.style.height = 'auto';
        inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
      });
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage(inputEl.value);
        }
      });
    }
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (!confirm('Clear full chat history?')) return;
      history = [];
      saveHistory(history);
      renderChat();
      const c = document.getElementById('qvhc-clear');
      if (c) c.remove();
    });

    // Quick prompt buttons
    document.querySelectorAll('.qvhc-qbtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.q;
        if (q) sendMessage(q);
      });
    });
  }

  /* Delegated: copy/save messages */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (!btn.closest('.qvhc-wrap')) return;
    const act = btn.dataset.act;
    const idx = parseInt(btn.dataset.idx);
    if (isNaN(idx) || !history[idx]) return;
    const msg = history[idx];

    if (act === 'copy-msg') { copyText(msg.content); return; }
    if (act === 'save-msg') {
      const KEY = 'qvh_workspace_v1';
      let data = { ideas: [], titles: [], scripts: [] };
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const p = JSON.parse(raw);
          data = { ideas: Array.isArray(p.ideas) ? p.ideas : [], titles: Array.isArray(p.titles) ? p.titles : [], scripts: Array.isArray(p.scripts) ? p.scripts : [] };
        }
      } catch (err) {}
      const title = 'Coach advice — ' + new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      data.scripts.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), title, notes: msg.content, ts: Date.now() });
      try {
        localStorage.setItem(KEY, JSON.stringify(data));
        QVH.toast('Saved to Script Vault ✅', 'success');
      } catch (err) { QVH.toast('Save failed', 'error'); }
      return;
    }
  });

  QVH.registerRenderer('coach', render);
  console.log('%c✅ AI Coach registered', 'color:#ec4899;font-weight:bold');
})();