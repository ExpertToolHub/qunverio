/* ============================================================
   QUNVERIO — TITLE LAB (v1.1)
   Path: tools/creator/title-lab.js
   AI + client-side YouTube title tools (conflict fix)
   ============================================================ */

(function () {
  'use strict';

  if (!window.QVH) { console.warn('QVH not loaded — title-lab.js skipping'); return; }

  const QVH = window.QVH;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function copyText(text) {
    if (!navigator.clipboard) { QVH.toast('Copy not supported', 'error'); return; }
    navigator.clipboard.writeText(text)
      .then(() => QVH.toast('Copied! 📋', 'success'))
      .catch(() => QVH.toast('Copy failed', 'error'));
  }
  async function callAI(prompt, opts) {
    opts = opts || {};
    const body = {
      prompt,
      systemPrompt: opts.systemPrompt || '',
      temperature: opts.temperature != null ? opts.temperature : 0.9,
      maxTokens: opts.maxTokens || 1500
    };
    const r = await fetch('/api/creator-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      let errMsg = 'AI request failed';
      try { const j = await r.json(); errMsg = j.error || j.details || errMsg; } catch (e) {}
      throw new Error(errMsg);
    }
    const data = await r.json();
    if (!data.success || !data.text) throw new Error('Empty AI response');
    return data.text;
  }
  function parseTitles(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const titles = [];
    for (let line of lines) {
      let t = line
        .replace(/^\*\*|\*\*$/g, '')
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/^[-•*]\s*/, '')
        .replace(/^["'`]|["'`]$/g, '')
        .trim();
      if (!t) continue;
      if (/^(here|sure|ye|yeh|below|following|these)/i.test(t) && t.length < 80) continue;
      if (t.endsWith(':')) continue;
      if (t.length < 10) continue;
      if (t.length > 150) t = t.slice(0, 150);
      titles.push(t);
      if (titles.length >= 15) break;
    }
    return titles;
  }

  function scoreTitle(title) {
    if (!title || title.trim().length === 0) return { total: 0, breakdown: [] };
    const t = title.trim();
    const len = t.length;
    const words = t.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    let lengthScore = 0, lengthMsg = '';
    if (len >= 40 && len <= 70) { lengthScore = 25; lengthMsg = 'Ideal length ✅'; }
    else if (len >= 30 && len < 40) { lengthScore = 18; lengthMsg = 'Thoda chhota'; }
    else if (len > 70 && len <= 90) { lengthScore = 18; lengthMsg = 'Thoda lamba'; }
    else if (len < 30) { lengthScore = 10; lengthMsg = 'Bahut chhota'; }
    else { lengthScore = 8; lengthMsg = 'Bahut lamba'; }

    const numberScore = /\d/.test(t) ? 12 : 0;
    const powerWords = ['how', 'why', 'best', 'top', 'secret', 'truth', 'proven', 'ultimate', 'complete', 'easy', 'fast', 'mistake', 'wrong', 'right', 'stop', 'start', 'free', 'new', 'hidden', 'real', 'kaise', 'kyun', 'kya', 'sabse', 'asli', 'sach', 'galti'];
    const lower = t.toLowerCase();
    const powerMatches = powerWords.filter(w => lower.includes(w)).length;
    const powerScore = Math.min(powerMatches * 5, 20);
    const emotionWords = ['shocking', 'surprising', 'unbelievable', 'amazing', 'insane', 'crazy', 'emotional', 'heart', 'love', 'hate', 'fear', 'warning', 'never', 'always', 'nobody', 'everyone', '?', '!'];
    const emotionMatches = emotionWords.filter(w => lower.includes(w)).length;
    const emotionScore = Math.min(emotionMatches * 5, 15);

    let specScore = 0;
    if (/[A-Z][a-z]+/.test(t.replace(/^./, ''))) specScore += 5;
    if (/["'`]/.test(t)) specScore += 5;
    if (/\(.+\)/.test(t)) specScore += 3;
    specScore = Math.min(specScore, 10);

    const specialChars = (t.match(/[^\w\s\u0900-\u097F]/g) || []).length;
    let clarityScore = 10;
    if (specialChars > 6) clarityScore = 5;
    if (specialChars > 12) clarityScore = 2;

    let keywordScore = 8;
    if (wordCount < 4) keywordScore = 4;
    if (wordCount > 14) keywordScore = 4;

    const breakdown = [
      { k: 'Length', v: `${len} chars — ${lengthMsg}`, s: lengthScore, max: 25 },
      { k: 'Number / list', v: /\d/.test(t) ? 'Number mila ✅' : 'Number add karo', s: numberScore, max: 12 },
      { k: 'Power words', v: powerMatches > 0 ? `${powerMatches} mile` : 'Power words add karo', s: powerScore, max: 20 },
      { k: 'Emotion / Curiosity', v: emotionMatches > 0 ? `${emotionMatches} markers` : 'Curiosity add karo', s: emotionScore, max: 15 },
      { k: 'Specificity', v: specScore > 6 ? 'Specific ✅' : 'Specific banao', s: specScore, max: 10 },
      { k: 'Clarity', v: specialChars > 6 ? 'Bahut special chars' : 'Clean ✅', s: clarityScore, max: 10 },
      { k: 'Keyword balance', v: wordCount < 4 ? 'Kam words' : (wordCount > 14 ? 'Zyada words' : 'Balanced ✅'), s: keywordScore, max: 8 }
    ];
    const total = breakdown.reduce((sum, b) => sum + b.s, 0);
    return { total: Math.min(total, 100), breakdown, len, wordCount };
  }

  const CSS = `
    .qvht-wrap { max-width: 720px; margin: 0 auto; }
    .qvht-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 12px; scrollbar-width: none; }
    .qvht-tabs::-webkit-scrollbar { display: none; }
    .qvht-tab {
      flex: 0 0 auto; padding: 8px 14px; border-radius: 20px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      font-size: 12px; font-weight: 700;
      color: var(--text-2, #a8b0d8);
      cursor: pointer; white-space: nowrap; transition: all .18s;
    }
    .qvht-tab.active {
      background: linear-gradient(135deg,#8b5cf6,#6366f1);
      color: #fff; border-color: transparent;
      box-shadow: 0 4px 12px rgba(139,92,246,.35);
    }
    .qvht-panel { display: none; }
    .qvht-panel.active { display: block; animation: qvht-fade .22s ease; }
    @keyframes qvht-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
    .qvht-card { background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 14px; padding: 15px; margin-bottom: 12px; }
    .qvht-card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; color: var(--text-3, #6b74a0); margin-bottom: 12px; }
    .qvht-field { margin-bottom: 12px; }
    .qvht-field label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2, #a8b0d8); margin-bottom: 5px; }
    .qvht-field input, .qvht-field textarea, .qvht-field select {
      width: 100%; padding: 11px 13px;
      background: var(--surface-2, #1c2250);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 11px; font-size: 14px; outline: none;
      color: var(--text, #eef1ff); font-family: inherit; box-sizing: border-box;
      transition: border-color .18s;
    }
    .qvht-field input:focus, .qvht-field textarea:focus, .qvht-field select:focus {
      border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,.15);
    }
    .qvht-field textarea { resize: vertical; min-height: 70px; }
    .qvht-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 420px) { .qvht-row2 { grid-template-columns: 1fr; } }
    .qvht-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 13px 18px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: transform .15s, box-shadow .18s; }
    .qvht-btn:active { transform: scale(.97); }
    .qvht-btn-primary { background: linear-gradient(135deg,#8b5cf6,#6366f1); color: #fff; width: 100%; box-shadow: 0 4px 14px rgba(139,92,246,.35); }
    .qvht-loading { text-align: center; padding: 28px 16px; color: var(--text-2, #a8b0d8); font-size: 13px; }
    .qvht-spinner { width: 32px; height: 32px; margin: 0 auto 12px; border: 3px solid var(--surface-2, #1c2250); border-top-color: #8b5cf6; border-radius: 50%; animation: qvht-spin .8s linear infinite; }
    @keyframes qvht-spin { to { transform: rotate(360deg) } }
    .qvht-error { background: rgba(239,68,68,.1); border-left: 3px solid #ef4444; border-radius: 10px; padding: 12px 14px; margin-top: 12px; font-size: 13px; color: #fca5a5; line-height: 1.5; }
    .qvht-title-card { background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 12px; padding: 13px 14px; margin-bottom: 9px; transition: border-color .18s; }
    .qvht-title-card:hover { border-color: rgba(139,92,246,.4); }
    .qvht-title-card .qvht-tc-text { font-size: 14px; font-weight: 600; color: var(--text, #eef1ff); line-height: 1.4; margin-bottom: 8px; word-break: break-word; }
    .qvht-title-card .qvht-tc-meta { display: flex; gap: 6px; align-items: center; font-size: 10.5px; color: var(--text-3, #6b74a0); margin-bottom: 9px; }
    .qvht-tc-badge { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 10px; font-weight: 700; background: var(--surface-2, #1c2250); color: var(--text-2, #a8b0d8); }
    .qvht-tc-badge.good { background: rgba(16,185,129,.18); color: #10b981; }
    .qvht-tc-badge.warn { background: rgba(245,158,11,.18); color: #f59e0b; }
    .qvht-tc-badge.bad { background: rgba(239,68,68,.18); color: #ef4444; }
    .qvht-tc-actions { display: flex; gap: 5px; flex-wrap: wrap; }
    .qvht-tc-btn { padding: 6px 10px; border-radius: 7px; background: var(--surface-2, #1c2250); border: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 11px; font-weight: 700; color: var(--text-2, #a8b0d8); cursor: pointer; transition: all .15s; }
    .qvht-tc-btn:hover { background: var(--surface-hover, #232a5e); color: var(--text, #eef1ff); }
    .qvht-tc-btn.primary { background: linear-gradient(135deg,#8b5cf6,#6366f1); color: #fff; border-color: transparent; }
    .qvht-score-wrap { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
    .qvht-score-circle { width: 74px; height: 74px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; transition: background .5s; }
    .qvht-score-circle::after { content: ''; position: absolute; inset: 6px; border-radius: 50%; background: var(--surface, #151a3d); }
    .qvht-score-num { position: relative; z-index: 1; font-size: 20px; font-weight: 900; color: var(--text, #eef1ff); }
    .qvht-score-label { font-size: 12px; color: var(--text-3, #6b74a0); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
    .qvht-score-verdict { font-size: 14px; font-weight: 800; color: var(--text, #eef1ff); }
    .qvht-breakdown-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--border, rgba(255,255,255,0.05)); font-size: 13px; gap: 12px; }
    .qvht-breakdown-row:last-child { border-bottom: none; }
    .qvht-bd-k { color: var(--text-2, #a8b0d8); font-weight: 600; flex-shrink: 0; }
    .qvht-bd-v { color: var(--text-3, #6b74a0); font-size: 11.5px; flex: 1; text-align: right; }
    .qvht-bd-s { color: var(--text, #eef1ff); font-weight: 700; font-size: 12.5px; flex-shrink: 0; }
    .qvht-len-bar { height: 8px; background: var(--surface-2, #1c2250); border-radius: 20px; overflow: hidden; margin-top: 8px; }
    .qvht-len-fill { height: 100%; border-radius: 20px; transition: width .2s, background .2s; }
    .qvht-len-meta { display: flex; justify-content: space-between; font-size: 10.5px; color: var(--text-3, #6b74a0); margin-top: 4px; }
    .qvht-actions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 12px; }
    .qvht-action { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px; border-radius: 10px; background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); font-size: 11px; font-weight: 700; color: var(--text, #eef1ff); cursor: pointer; }
    .qvht-action:hover { background: var(--surface-hover, #232a5e); }
    .qvht-action .ico { font-size: 15px; }
    .qvht-note { font-size: 11.5px; color: var(--text-3, #6b74a0); background: var(--surface-2, #1c2250); border-left: 3px solid #f59e0b; padding: 10px 12px; border-radius: 8px; margin-top: 12px; line-height: 1.55; }
  `;

  function injectCSS() {
    if (document.getElementById('qvht-css')) return;
    const s = document.createElement('style');
    s.id = 'qvht-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function render(container) {
    injectCSS();
    container.innerHTML = `
      <div class="qvht-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#8b5cf6,#6366f1)">
          <div class="qvh-th-icon">📝</div>
          <div style="flex:1;min-width:0">
            <h3>Title Lab</h3>
            <p>AI titles, CTR score, length checker, A/B variations</p>
          </div>
        </div>
        <div class="qvht-tabs" id="qvhtTabs">
          <button class="qvht-tab active" data-tab="gen">💡 AI Generator</button>
          <button class="qvht-tab" data-tab="ctr">🎯 CTR Focus</button>
          <button class="qvht-tab" data-tab="rewrite">✏️ Rewrite</button>
          <button class="qvht-tab" data-tab="score">📊 Score</button>
          <button class="qvht-tab" data-tab="length">📏 Length</button>
          <button class="qvht-tab" data-tab="ab">🔀 A/B</button>
        </div>
        <div id="qvhtPanels">
          ${panelGen()}${panelCtr()}${panelRewrite()}${panelScore()}${panelLength()}${panelAb()}
        </div>
        <div class="qvht-note">
          ⚠️ <strong>Note:</strong> Ye AI-generated titles suggestions hain. Actual CTR depend karta hai thumbnail, content quality, audience aur competition pe. No guaranteed CTR.
        </div>
      </div>
    `;
    wireTabs();
    wirePanels();
  }

  function panelGen() {
    return `
      <div class="qvht-panel active" data-panel="gen">
        <div class="qvht-card">
          <div class="qvht-card-title">Generate AI Titles</div>
          <div class="qvht-field"><label>Video Topic *</label><input type="text" id="qvht-gen-topic" placeholder="e.g. how to start a youtube channel in 2025" /></div>
          <div class="qvht-row2">
            <div class="qvht-field"><label>Niche</label><input type="text" id="qvht-gen-niche" placeholder="e.g. tech, education" /></div>
            <div class="qvht-field"><label>Language</label><select id="qvht-gen-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
          </div>
          <div class="qvht-field"><label>Extra Context (optional)</label><textarea id="qvht-gen-context" placeholder="Audience age, tone..."></textarea></div>
          <button class="qvht-btn qvht-btn-primary" id="qvht-gen-go">✨ Generate 10 Titles</button>
          <div id="qvht-gen-out"></div>
        </div>
      </div>`;
  }
  function panelCtr() {
    return `
      <div class="qvht-panel" data-panel="ctr">
        <div class="qvht-card">
          <div class="qvht-card-title">CTR-Focused Titles</div>
          <div class="qvht-field"><label>Video Topic *</label><input type="text" id="qvht-ctr-topic" placeholder="e.g. 5 hidden iPhone settings" /></div>
          <div class="qvht-row2">
            <div class="qvht-field"><label>Language</label><select id="qvht-ctr-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
            <div class="qvht-field"><label>Focus</label><select id="qvht-ctr-focus"><option value="curiosity">Curiosity gap</option><option value="emotion">Emotional</option><option value="shock">Shock / Surprise</option><option value="howto">How-to / Practical</option><option value="number">Number-based list</option></select></div>
          </div>
          <button class="qvht-btn qvht-btn-primary" id="qvht-ctr-go">🎯 Generate CTR Titles</button>
          <div id="qvht-ctr-out"></div>
        </div>
      </div>`;
  }
  function panelRewrite() {
    return `
      <div class="qvht-panel" data-panel="rewrite">
        <div class="qvht-card">
          <div class="qvht-card-title">Rewrite Your Title</div>
          <div class="qvht-field"><label>Your Current Title *</label><textarea id="qvht-rw-title" placeholder="Paste your existing title..."></textarea></div>
          <div class="qvht-row2">
            <div class="qvht-field"><label>Language</label><select id="qvht-rw-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
            <div class="qvht-field"><label>Goal</label><select id="qvht-rw-goal"><option value="higher-ctr">Higher CTR</option><option value="shorter">Shorter</option><option value="clearer">Clearer</option><option value="emotional">More emotional</option></select></div>
          </div>
          <button class="qvht-btn qvht-btn-primary" id="qvht-rw-go">✏️ Improve Title</button>
          <div id="qvht-rw-out"></div>
        </div>
      </div>`;
  }
  function panelScore() {
    return `
      <div class="qvht-panel" data-panel="score">
        <div class="qvht-card">
          <div class="qvht-card-title">Title Score (Instant, No AI)</div>
          <div class="qvht-field"><label>Enter Title</label><textarea id="qvht-sc-title" placeholder="Type or paste a title..."></textarea></div>
          <div id="qvht-sc-out"></div>
        </div>
      </div>`;
  }
  function panelLength() {
    return `
      <div class="qvht-panel" data-panel="length">
        <div class="qvht-card">
          <div class="qvht-card-title">Length Checker (Live)</div>
          <div class="qvht-field">
            <label>Type Your Title</label>
            <input type="text" id="qvht-len-input" placeholder="Start typing..." maxlength="200" />
            <div class="qvht-len-bar"><div class="qvht-len-fill" id="qvht-len-fill" style="width:0%"></div></div>
            <div class="qvht-len-meta"><span id="qvht-len-chars">0 chars</span><span id="qvht-len-status"></span></div>
          </div>
        </div>
      </div>`;
  }
  function panelAb() {
    return `
      <div class="qvht-panel" data-panel="ab">
        <div class="qvht-card">
          <div class="qvht-card-title">A/B Title Variations</div>
          <div class="qvht-field"><label>Base Title *</label><textarea id="qvht-ab-title" placeholder="Enter your base title..."></textarea></div>
          <div class="qvht-field"><label>Language</label><select id="qvht-ab-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
          <button class="qvht-btn qvht-btn-primary" id="qvht-ab-go">🔀 Generate 5 Variations</button>
          <div id="qvht-ab-out"></div>
        </div>
      </div>`;
  }

  function wireTabs() {
    document.querySelectorAll('.qvht-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.qvht-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.qvht-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
      });
    });
  }

  function wirePanels() {
    bind('qvht-gen-go', 'qvht-gen-out', async () => {
      const topic = (document.getElementById('qvht-gen-topic').value || '').trim();
      const niche = (document.getElementById('qvht-gen-niche').value || '').trim();
      const lang = document.getElementById('qvht-gen-lang').value;
      const ctx = (document.getElementById('qvht-gen-context').value || '').trim();
      if (!topic) throw new Error('Topic daalo');
      const sys = 'You are an expert YouTube title copywriter. Generate titles that are clickable, honest. Return ONLY the titles, one per line, numbered 1-10.';
      const prompt = `Generate 10 YouTube video titles in ${lang}.\nTopic: ${topic}\n${niche ? 'Niche: ' + niche : ''}\n${ctx ? 'Context: ' + ctx : ''}\n\nRules:\n- 45-70 chars\n- Curiosity + emotion\n- No fake promises\nReturn ONLY numbered list.`;
      const text = await callAI(prompt, { systemPrompt: sys, temperature: 0.95, maxTokens: 1200 });
      return parseTitles(text);
    });

    bind('qvht-ctr-go', 'qvht-ctr-out', async () => {
      const topic = (document.getElementById('qvht-ctr-topic').value || '').trim();
      const lang = document.getElementById('qvht-ctr-lang').value;
      const focus = document.getElementById('qvht-ctr-focus').value;
      if (!topic) throw new Error('Topic daalo');
      const focusMap = { curiosity: 'curiosity gap', emotion: 'emotional angle', shock: 'surprise/shock', howto: 'practical how-to', number: 'number-based list' };
      const prompt = `Generate 8 high-CTR YouTube titles in ${lang}.\nTopic: ${topic}\nFocus: ${focusMap[focus]}\n\nRules: 45-70 chars, honest, strong hook.\nReturn ONLY numbered list 1-8.`;
      const text = await callAI(prompt, { systemPrompt: 'YouTube CTR expert. Return only numbered list.', temperature: 0.95, maxTokens: 1000 });
      return parseTitles(text);
    });

    bind('qvht-rw-go', 'qvht-rw-out', async () => {
      const title = (document.getElementById('qvht-rw-title').value || '').trim();
      const lang = document.getElementById('qvht-rw-lang').value;
      const goal = document.getElementById('qvht-rw-goal').value;
      if (!title) throw new Error('Title daalo');
      const goalMap = { 'higher-ctr': 'increase CTR honestly', shorter: 'make shorter (40-55)', clearer: 'make clearer', emotional: 'add emotion' };
      const prompt = `Rewrite this YouTube title.\nOriginal: "${title}"\nGoal: ${goalMap[goal]}\nLanguage: ${lang}\n\nGive 5 rewrites. Return ONLY numbered list 1-5.`;
      const text = await callAI(prompt, { systemPrompt: 'YouTube title editor. Return only numbered list.', temperature: 0.9, maxTokens: 800 });
      return parseTitles(text);
    });

    const scInput = document.getElementById('qvht-sc-title');
    if (scInput) scInput.addEventListener('input', () => {
      const out = document.getElementById('qvht-sc-out');
      const title = scInput.value;
      if (!title.trim()) { out.innerHTML = ''; return; }
      out.innerHTML = renderScore(title);
    });

    const lenInput = document.getElementById('qvht-len-input');
    if (lenInput) {
      const upd = () => {
        const t = lenInput.value || '';
        const len = t.length;
        const charsEl = document.getElementById('qvht-len-chars');
        const statusEl = document.getElementById('qvht-len-status');
        const fillEl = document.getElementById('qvht-len-fill');
        if (charsEl) charsEl.textContent = len + ' chars';
        let status = ''; let color = 'linear-gradient(90deg,#10b981,#22c55e)';
        let width = Math.min((len / 70) * 100, 100);
        if (len === 0) { status = ''; width = 0; }
        else if (len < 30) { status = '❌ Bahut chhota'; color = 'linear-gradient(90deg,#ef4444,#f97316)'; }
        else if (len < 40) { status = '⚠️ Thoda chhota'; color = 'linear-gradient(90deg,#f59e0b,#f97316)'; }
        else if (len <= 70) { status = '✅ Ideal'; }
        else if (len <= 90) { status = '⚠️ Thoda lamba'; color = 'linear-gradient(90deg,#f59e0b,#f97316)'; width = 100; }
        else { status = '❌ Bahut lamba'; color = 'linear-gradient(90deg,#ef4444,#f97316)'; width = 100; }
        if (statusEl) statusEl.textContent = status;
        if (fillEl) { fillEl.style.width = width + '%'; fillEl.style.background = color; }
      };
      lenInput.addEventListener('input', upd); upd();
    }

    bind('qvht-ab-go', 'qvht-ab-out', async () => {
      const title = (document.getElementById('qvht-ab-title').value || '').trim();
      const lang = document.getElementById('qvht-ab-lang').value;
      if (!title) throw new Error('Base title daalo');
      const prompt = `Create 5 A/B test variations of this YouTube title.\nBase: "${title}"\nLanguage: ${lang}\n\nDifferent angle each (curiosity, number, emotional, question, bold). Return ONLY numbered list 1-5.`;
      const text = await callAI(prompt, { systemPrompt: 'YouTube A/B testing expert. Return only numbered list.', temperature: 0.95, maxTokens: 800 });
      return parseTitles(text);
    });
  }

  function bind(btnId, outId, fn) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const out = document.getElementById(outId);
      out.innerHTML = `<div class="qvht-loading"><div class="qvht-spinner"></div>AI soch raha hai...</div>`;
      btn.disabled = true;
      try {
        const titles = await fn();
        if (!titles || !titles.length) throw new Error('Koi title nahi mila');
        out.innerHTML = renderTitlesList(titles, outId);
      } catch (e) {
        out.innerHTML = `<div class="qvht-error">❌ ${esc(e.message || 'Something went wrong')}</div>`;
      } finally { btn.disabled = false; }
    });
  }

  function renderTitlesList(titles, key) {
    if (!titles.length) return `<div style="text-align:center;padding:20px;color:var(--text-3)">No titles</div>`;
    const cardsHTML = titles.map(t => {
      const sc = scoreTitle(t);
      const badgeCls = sc.total >= 75 ? 'good' : (sc.total >= 55 ? 'warn' : 'bad');
      return `
        <div class="qvht-title-card" data-title="${esc(t)}">
          <div class="qvht-tc-text">${esc(t)}</div>
          <div class="qvht-tc-meta"><span>${t.length} chars</span><span>•</span><span class="qvht-tc-badge ${badgeCls}">Score ${sc.total}</span></div>
          <div class="qvht-tc-actions">
            <button class="qvht-tc-btn" data-act="copy" data-t="${esc(t)}">📋 Copy</button>
            <button class="qvht-tc-btn primary" data-act="save" data-t="${esc(t)}">💾 Save</button>
          </div>
        </div>`;
    }).join('');
    return `
      <div style="margin-top:14px">
        <div class="qvht-card-title" style="margin-bottom:10px">Generated Titles</div>
        <div id="qvht-${key}-list">${cardsHTML}</div>
        <div class="qvht-actions-row">
          <button class="qvht-action" data-act="copy-all" data-key="${key}"><span class="ico">📋</span>Copy All</button>
          <button class="qvht-action" data-act="print" data-key="${key}"><span class="ico">🖨️</span>Print</button>
          <button class="qvht-action" data-act="pdf" data-key="${key}"><span class="ico">📄</span>PDF</button>
        </div>
      </div>`;
  }

  function renderScore(title) {
    const s = scoreTitle(title);
    const verdict = s.total >= 80 ? 'Excellent 🎯' : s.total >= 65 ? 'Strong 💪' : s.total >= 50 ? 'Decent 👍' : s.total >= 35 ? 'Needs work ✏️' : 'Weak ❌';
    const deg = Math.round((s.total / 100) * 360);
    const color = s.total >= 75 ? '#10b981' : (s.total >= 50 ? '#f59e0b' : '#ef4444');
    const breakdownHTML = s.breakdown.map(b => `<div class="qvht-breakdown-row"><span class="qvht-bd-k">${esc(b.k)}</span><span class="qvht-bd-v">${esc(b.v)}</span><span class="qvht-bd-s">${b.s}/${b.max}</span></div>`).join('');
    return `
      <div class="qvht-score-wrap">
        <div class="qvht-score-circle" style="background: conic-gradient(${color} ${deg}deg, var(--surface-2, #1c2250) ${deg}deg)"><span class="qvht-score-num">${s.total}</span></div>
        <div><div class="qvht-score-label">Title Score</div><div class="qvht-score-verdict">${verdict}</div></div>
      </div>
      <div>${breakdownHTML}</div>`;
  }

  /* Delegated events — scoped to Title Lab only */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    // Skip if not inside Title Lab
    if (!btn.closest('.qvht-wrap')) return;

    const act = btn.dataset.act;
    if (act === 'copy') { copyText(btn.dataset.t || ''); return; }
    if (act === 'save') { saveToWorkspaceTitle(btn.dataset.t || ''); return; }

    const key = btn.dataset.key;
    if (!key) return;
    const list = document.getElementById('qvht-' + key + '-list');
    if (!list) return;
    const titles = Array.from(list.querySelectorAll('.qvht-title-card')).map(c => c.dataset.title);

    if (act === 'copy-all') { copyText(titles.join('\n')); return; }
    if (act === 'print') { printTitles(titles); return; }
    if (act === 'pdf') { pdfTitles(titles); return; }
  });

  function saveToWorkspaceTitle(title) {
    const KEY = 'qvh_workspace_v1';
    let data = { ideas: [], titles: [], scripts: [] };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        data = { ideas: Array.isArray(p.ideas) ? p.ideas : [], titles: Array.isArray(p.titles) ? p.titles : [], scripts: Array.isArray(p.scripts) ? p.scripts : [] };
      }
    } catch (err) {}
    const exists = data.titles.some(x => (x.title || '').trim().toLowerCase() === title.trim().toLowerCase());
    if (exists) { QVH.toast('Already saved in Title Vault', ''); return; }
    data.titles.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), title, notes: 'Saved from Title Lab', ts: Date.now() });
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      QVH.toast('Saved to Title Vault ✅', 'success');
    } catch (err) { QVH.toast('Save failed', 'error'); }
  }

  function themeColors() {
    const cs = getComputedStyle(document.body);
    function safe(v, fb) { let val = (cs.getPropertyValue(v) || '').trim(); if (!val || val.startsWith('var(') || val.length > 60) return fb; return val; }
    return { bg: safe('--bg', '#0a0e27'), surface: safe('--surface', '#151a3d'), border: safe('--border-strong', 'rgba(255,255,255,0.14)'), text: safe('--text', '#eef1ff'), text2: safe('--text-2', '#a8b0d8'), text3: safe('--text-3', '#6b74a0') };
  }

  function buildReportHTML(titles, heading) {
    const c = themeColors();
    const now = new Date().toLocaleString('en-IN');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Qunverio — ${heading}</title><style>
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;background:${c.bg};color:${c.text};padding:40px 32px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .wrap{max-width:720px;margin:0 auto}.brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:3px solid #8b5cf6;margin-bottom:24px}.brand-logo{display:flex;align-items:center;gap:10px}.brand-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#8b5cf6,#6366f1);display:flex;align-items:center;justify-content:center;font-size:20px}.brand-name{font-size:22px;font-weight:900;color:#8b5cf6}.brand-meta{font-size:12px;color:${c.text2};text-align:right}
      .doc-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${c.text3};margin-bottom:8px}.big{font-size:26px;font-weight:900;color:${c.text};margin-bottom:22px}.tcard{background:${c.surface};border:1px solid ${c.border};border-radius:14px;padding:14px 16px;margin-bottom:10px}.ttext{font-size:15px;font-weight:600;color:${c.text};line-height:1.4;margin-bottom:6px}.tmeta{font-size:11px;color:${c.text3}}
      .footer{margin-top:26px;padding-top:18px;border-top:1px solid ${c.border};text-align:center;font-size:11.5px;color:${c.text3}}
      @media print{body{background:${c.bg} !important;padding:20px 16px}.wrap{max-width:100%}}@page{margin:14mm;size:A4}
    </style></head><body><div class="wrap">
      <div class="brand"><div class="brand-logo"><div class="brand-icon">⚡</div><div class="brand-name">Qunverio</div></div><div class="brand-meta">Title Lab<br>${now}</div></div>
      <div class="doc-title">${heading}</div><div class="big">${titles.length} Titles</div>
      ${titles.map(t => { const sc = scoreTitle(t); return `<div class="tcard"><div class="ttext">${esc(t)}</div><div class="tmeta">${t.length} chars • Score ${sc.total}/100</div></div>`; }).join('')}
      <div class="footer">Generated by <strong style="color:${c.text2};">Qunverio Creator Hub</strong> • qunverio.vercel.app</div>
    </div></body></html>`;
  }

  function printTitles(titles) {
    const html = buildReportHTML(titles, 'Title Lab Report');
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => { try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) {} setTimeout(() => { if (iframe.parentNode) document.body.removeChild(iframe); }, 1500); }, 700);
  }

  async function pdfTitles(titles) {
    QVH.toast('Generating PDF...', '');
    const html = buildReportHTML(titles, 'Title Lab Report');
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:820px;height:1200px;border:0;opacity:0;pointer-events:none;z-index:-1;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(async () => {
      try {
        if (!window.htmlToImage) { QVH.toast('PDF library missing', 'error'); document.body.removeChild(iframe); return; }
        const c = themeColors();
        const target = doc.body;
        const dataUrl = await window.htmlToImage.toPng(target, { quality: 1, pixelRatio: 2.5, backgroundColor: c.bg, width: target.scrollWidth, height: target.scrollHeight, cacheBust: true });
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = c.bg; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0);
          const pageH = canvas.width * (ph / pw);
          let y = 0, page = 0;
          while (y < canvas.height) {
            const sliceH = Math.min(pageH, canvas.height - y);
            const slice = document.createElement('canvas');
            slice.width = canvas.width; slice.height = sliceH;
            const sctx = slice.getContext('2d');
            sctx.fillStyle = c.bg; sctx.fillRect(0, 0, slice.width, slice.height);
            sctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
            if (page > 0) pdf.addPage();
            const r = slice.width / slice.height;
            let w = pw - 12, h = w / r;
            if (h > ph - 12) { h = ph - 12; w = h * r; }
            pdf.addImage(slice.toDataURL('image/png'), 'PNG', (pw - w) / 2, (ph - h) / 2, w, h, undefined, 'FAST');
            y += sliceH; page++;
          }
          pdf.save('qunverio-title-lab.pdf');
          QVH.toast('PDF downloaded ✅', 'success');
        };
        img.src = dataUrl;
      } catch (e) { console.error(e); QVH.toast('PDF failed', 'error'); } finally { if (iframe.parentNode) document.body.removeChild(iframe); }
    }, 900);
  }

  QVH.registerRenderer('title', render);
  console.log('%c✅ Title Lab registered (v1.1)', 'color:#8b5cf6;font-weight:bold');
})();