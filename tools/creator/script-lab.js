/* ============================================================
   QUNVERIO — SCRIPT LAB (v1.0)
   Path: tools/creator/script-lab.js
   AI full scripts, hooks, shorts, story structure, CTA
   ============================================================ */

(function () {
  'use strict';
  if (!window.QVH) { console.warn('QVH not loaded — script-lab.js skipping'); return; }
  const QVH = window.QVH;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function copyText(text) {
    if (!navigator.clipboard) { QVH.toast('Copy not supported', 'error'); return; }
    navigator.clipboard.writeText(text).then(() => QVH.toast('Copied! 📋', 'success')).catch(() => QVH.toast('Copy failed', 'error'));
  }
  async function callAI(prompt, opts) {
    opts = opts || {};
    const body = { prompt, systemPrompt: opts.systemPrompt || '', temperature: opts.temperature != null ? opts.temperature : 0.85, maxTokens: opts.maxTokens || 3000 };
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

  function cleanScript(text) {
    let out = text.trim();
    out = out.replace(/^\*\*|\*\*$/gm, '');
    out = out.replace(/^#+\s*/gm, '');
    out = out.replace(/^(here|sure|below|following)[^\n]*\n+/i, '');
    return out.trim();
  }

  const CSS = `
    .qvhs2-wrap { max-width: 720px; margin: 0 auto; }
    .qvhs2-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 12px; scrollbar-width: none; }
    .qvhs2-tabs::-webkit-scrollbar { display: none; }
    .qvhs2-tab { flex: 0 0 auto; padding: 8px 14px; border-radius: 20px; background: var(--surface-2, #1c2250); border: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 12px; font-weight: 700; color: var(--text-2, #a8b0d8); cursor: pointer; white-space: nowrap; transition: all .18s; }
    .qvhs2-tab.active { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(99,102,241,.35); }
    .qvhs2-panel { display: none; }
    .qvhs2-panel.active { display: block; animation: qvhs2-fade .22s ease; }
    @keyframes qvhs2-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
    .qvhs2-card { background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 14px; padding: 15px; margin-bottom: 12px; }
    .qvhs2-card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; color: var(--text-3, #6b74a0); margin-bottom: 12px; }
    .qvhs2-field { margin-bottom: 12px; }
    .qvhs2-field label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2, #a8b0d8); margin-bottom: 5px; }
    .qvhs2-field input, .qvhs2-field textarea, .qvhs2-field select { width: 100%; padding: 11px 13px; background: var(--surface-2, #1c2250); border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 11px; font-size: 14px; outline: none; color: var(--text, #eef1ff); font-family: inherit; box-sizing: border-box; transition: border-color .18s; }
    .qvhs2-field input:focus, .qvhs2-field textarea:focus, .qvhs2-field select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
    .qvhs2-field textarea { resize: vertical; min-height: 70px; }
    .qvhs2-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .qvhs2-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    @media (max-width: 480px) { .qvhs2-row2, .qvhs2-row3 { grid-template-columns: 1fr; } }
    .qvhs2-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 13px 18px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: transform .15s, box-shadow .18s; }
    .qvhs2-btn:active { transform: scale(.97); }
    .qvhs2-btn-primary { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; width: 100%; box-shadow: 0 4px 14px rgba(99,102,241,.35); }
    .qvhs2-loading { text-align: center; padding: 28px 16px; color: var(--text-2, #a8b0d8); font-size: 13px; }
    .qvhs2-spinner { width: 32px; height: 32px; margin: 0 auto 12px; border: 3px solid var(--surface-2, #1c2250); border-top-color: #6366f1; border-radius: 50%; animation: qvhs2-spin .8s linear infinite; }
    @keyframes qvhs2-spin { to { transform: rotate(360deg) } }
    .qvhs2-error { background: rgba(239,68,68,.1); border-left: 3px solid #ef4444; border-radius: 10px; padding: 12px 14px; margin-top: 12px; font-size: 13px; color: #fca5a5; line-height: 1.5; }
    .qvhs2-result { background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 12px; padding: 14px; margin-top: 12px; }
    .qvhs2-result-text { font-size: 13.5px; line-height: 1.7; color: var(--text, #eef1ff); white-space: pre-wrap; word-break: break-word; max-height: 500px; overflow-y: auto; }
    .qvhs2-stat-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12.5px; color: var(--text-2, #a8b0d8); border-bottom: 1px solid var(--border, rgba(255,255,255,0.05)); }
    .qvhs2-stat-row:last-child { border-bottom: none; }
    .qvhs2-stat-row .val { color: var(--text, #eef1ff); font-weight: 700; }
    .qvhs2-stat-row .val.good { color: #10b981; }
    .qvhs2-stat-row .val.warn { color: #f59e0b; }
    .qvhs2-actions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 12px; }
    .qvhs2-action { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px; border-radius: 10px; background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); font-size: 11px; font-weight: 700; color: var(--text, #eef1ff); cursor: pointer; }
    .qvhs2-action:hover { background: var(--surface-hover, #232a5e); }
    .qvhs2-action .ico { font-size: 15px; }
    .qvhs2-hook-card { background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 12px; padding: 13px 14px; margin-bottom: 9px; }
    .qvhs2-hook-num { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 8px; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; font-size: 11px; font-weight: 800; margin-right: 8px; flex-shrink: 0; }
    .qvhs2-hook-text { font-size: 13.5px; font-weight: 600; color: var(--text, #eef1ff); line-height: 1.5; margin-bottom: 9px; display: flex; align-items: flex-start; word-break: break-word; }
    .qvhs2-hook-actions { display: flex; gap: 5px; flex-wrap: wrap; }
    .qvhs2-hook-btn { padding: 6px 10px; border-radius: 7px; background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 11px; font-weight: 700; color: var(--text-2, #a8b0d8); cursor: pointer; }
    .qvhs2-hook-btn:hover { background: var(--surface-hover, #232a5e); color: var(--text, #eef1ff); }
    .qvhs2-hook-btn.primary { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border-color: transparent; }
    .qvhs2-note { font-size: 11.5px; color: var(--text-3, #6b74a0); background: var(--surface-2, #1c2250); border-left: 3px solid #f59e0b; padding: 10px 12px; border-radius: 8px; margin-top: 12px; line-height: 1.55; }
  `;

  function injectCSS() {
    if (document.getElementById('qvhs2-css')) return;
    const s = document.createElement('style');
    s.id = 'qvhs2-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  function render(container) {
    injectCSS();
    container.innerHTML = `
      <div class="qvhs2-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#6366f1,#8b5cf6)">
          <div class="qvh-th-icon">🎬</div>
          <div style="flex:1;min-width:0"><h3>Script Lab</h3><p>AI scripts, hooks, shorts, story structure</p></div>
        </div>
        <div class="qvhs2-tabs" id="qvhs2Tabs">
          <button class="qvhs2-tab active" data-tab="full">🎬 Full Script</button>
          <button class="qvhs2-tab" data-tab="short">⚡ Shorts Script</button>
          <button class="qvhs2-tab" data-tab="hook">🎣 Hook</button>
          <button class="qvhs2-tab" data-tab="story">🎭 Story</button>
          <button class="qvhs2-tab" data-tab="cta">📢 CTA</button>
        </div>
        <div id="qvhs2Panels">
          ${panelFull()}${panelShort()}${panelHook()}${panelStory()}${panelCta()}
        </div>
        <div class="qvhs2-note">
          ⚠️ <strong>Note:</strong> Ye AI-generated scripts suggestions hain. Apne style aur content ke hisaab se edit karo. No guaranteed virality.
        </div>
      </div>`;
    wireTabs(); wirePanels();
  }

  function panelFull() {
    return `<div class="qvhs2-panel active" data-panel="full"><div class="qvhs2-card">
      <div class="qvhs2-card-title">Full Video Script</div>
      <div class="qvhs2-field"><label>Video Title / Topic *</label><input type="text" id="qvhs2-f-title" placeholder="e.g. 5 Essential Budgeting Rules for Beginners" /></div>
      <div class="qvhs2-row2">
        <div class="qvhs2-field"><label>Language</label><select id="qvhs2-f-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
        <div class="qvhs2-field"><label>Video Length</label><select id="qvhs2-f-dur"><option value="3">3-4 minutes</option><option value="6" selected>6-8 minutes</option><option value="10">10-12 minutes</option><option value="15">15+ minutes</option></select></div>
      </div>
      <div class="qvhs2-row2">
        <div class="qvhs2-field"><label>Tone</label><select id="qvhs2-f-tone"><option>Friendly</option><option>Professional</option><option>Casual</option><option>Energetic</option><option>Calm / Educational</option></select></div>
        <div class="qvhs2-field"><label>Audience</label><input type="text" id="qvhs2-f-aud" placeholder="e.g. college students" /></div>
      </div>
      <div class="qvhs2-field"><label>Key Points (optional)</label><textarea id="qvhs2-f-points" placeholder="Points jo video me cover karne hain..."></textarea></div>
      <button class="qvhs2-btn qvhs2-btn-primary" id="qvhs2-f-go">🎬 Generate Full Script</button>
      <div id="qvhs2-f-out"></div>
    </div></div>`;
  }
  function panelShort() {
    return `<div class="qvhs2-panel" data-panel="short"><div class="qvhs2-card">
      <div class="qvhs2-card-title">Shorts Script (60 sec)</div>
      <div class="qvhs2-field"><label>Shorts Topic / Hook *</label><input type="text" id="qvhs2-s-topic" placeholder="e.g. 1 savings tip that changed my life" /></div>
      <div class="qvhs2-field"><label>Language</label><select id="qvhs2-s-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
      <button class="qvhs2-btn qvhs2-btn-primary" id="qvhs2-s-go">⚡ Generate Shorts Script</button>
      <div id="qvhs2-s-out"></div>
    </div></div>`;
  }
  function panelHook() {
    return `<div class="qvhs2-panel" data-panel="hook"><div class="qvhs2-card">
      <div class="qvhs2-card-title">Hook Generator</div>
      <div class="qvhs2-field"><label>Video Topic *</label><input type="text" id="qvhs2-h-topic" placeholder="e.g. how to save money in your 20s" /></div>
      <div class="qvhs2-row2">
        <div class="qvhs2-field"><label>Language</label><select id="qvhs2-h-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
        <div class="qvhs2-field"><label>Hook Type</label><select id="qvhs2-h-type"><option value="curiosity">Curiosity</option><option value="shock">Shock</option><option value="question">Question</option><option value="story">Story</option><option value="stat">Stat / Number</option></select></div>
      </div>
      <button class="qvhs2-btn qvhs2-btn-primary" id="qvhs2-h-go">🎣 Generate 5 Hooks</button>
      <div id="qvhs2-h-out"></div>
    </div></div>`;
  }
  function panelStory() {
    return `<div class="qvhs2-panel" data-panel="story"><div class="qvhs2-card">
      <div class="qvhs2-card-title">Story Structure Framework</div>
      <div class="qvhs2-field"><label>Video Topic / Story *</label><input type="text" id="qvhs2-st-topic" placeholder="e.g. how I grew my channel from 0 to 10K" /></div>
      <div class="qvhs2-field"><label>Language</label><select id="qvhs2-st-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
      <button class="qvhs2-btn qvhs2-btn-primary" id="qvhs2-st-go">🎭 Generate Story Framework</button>
      <div id="qvhs2-st-out"></div>
    </div></div>`;
  }
  function panelCta() {
    return `<div class="qvhs2-panel" data-panel="cta"><div class="qvhs2-card">
      <div class="qvhs2-card-title">Call-to-Action Generator</div>
      <div class="qvhs2-field"><label>Video Topic *</label><input type="text" id="qvhs2-c-topic" placeholder="e.g. beginner's guide to investing" /></div>
      <div class="qvhs2-row2">
        <div class="qvhs2-field"><label>Language</label><select id="qvhs2-c-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
        <div class="qvhs2-field"><label>CTA Goal</label><select id="qvhs2-c-goal"><option value="subscribe">Subscribe</option><option value="like">Like + Comment</option><option value="next">Watch Next Video</option><option value="link">Click Link / Signup</option><option value="engage">Engage / Discuss</option></select></div>
      </div>
      <button class="qvhs2-btn qvhs2-btn-primary" id="qvhs2-c-go">📢 Generate CTAs</button>
      <div id="qvhs2-c-out"></div>
    </div></div>`;
  }

  function wireTabs() {
    document.querySelectorAll('.qvhs2-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.qvhs2-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.qvhs2-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
      });
    });
  }

  function wirePanels() {
    // Full Script
    bind('qvhs2-f-go', 'qvhs2-f-out', async () => {
      const title = (document.getElementById('qvhs2-f-title').value || '').trim();
      const lang = document.getElementById('qvhs2-f-lang').value;
      const dur = document.getElementById('qvhs2-f-dur').value;
      const tone = document.getElementById('qvhs2-f-tone').value;
      const aud = (document.getElementById('qvhs2-f-aud').value || '').trim();
      const points = (document.getElementById('qvhs2-f-points').value || '').trim();
      if (!title) throw new Error('Title daalo');

      const prompt = `Write a complete YouTube video script in ${lang}.

Title: ${title}
Length: ${dur} minutes
Tone: ${tone}
${aud ? 'Audience: ' + aud : ''}
${points ? 'Key points to cover: ' + points : ''}

Structure:
[HOOK] - 15-20 sec opening that grabs attention
[INTRO] - 20-30 sec, what video covers + why it matters
[BODY] - main content with 3-5 sections
[RECAP] - quick summary
[CTA] - subscribe/comment ask
[OUTRO] - friendly sign-off

Rules:
- Natural, conversational tone
- Include [B-ROLL], [ON SCREEN TEXT], [PAUSE] cues where useful
- 100-150 words per minute of video
- Language: ${lang}
Return ONLY the script text, no extra notes.`;

      const text = await callAI(prompt, { systemPrompt: 'You are a professional YouTube scriptwriter. Return only the script.', temperature: 0.85, maxTokens: 3500 });
      return { type: 'script', text: cleanScript(text) };
    });

    // Shorts
    bind('qvhs2-s-go', 'qvhs2-s-out', async () => {
      const topic = (document.getElementById('qvhs2-s-topic').value || '').trim();
      const lang = document.getElementById('qvhs2-s-lang').value;
      if (!topic) throw new Error('Topic daalo');

      const prompt = `Write a 60-second YouTube Shorts script in ${lang}.

Topic: ${topic}

Structure:
[HOOK] - first 2 seconds, must stop scroll
[VALUE] - main point in 30-40 seconds
[PAYOFF] - satisfying conclusion
[CTA] - quick follow/subscribe ask

Rules:
- Total 130-160 words (60 sec at fast pace)
- Punchy, fast-paced
- No filler
- Language: ${lang}
Return ONLY the script text.`;

      const text = await callAI(prompt, { systemPrompt: 'You are a YouTube Shorts expert. Return only the script.', temperature: 0.9, maxTokens: 800 });
      return { type: 'script', text: cleanScript(text) };
    });

    // Hooks
    bind('qvhs2-h-go', 'qvhs2-h-out', async () => {
      const topic = (document.getElementById('qvhs2-h-topic').value || '').trim();
      const lang = document.getElementById('qvhs2-h-lang').value;
      const type = document.getElementById('qvhs2-h-type').value;
      if (!topic) throw new Error('Topic daalo');

      const typeMap = { curiosity: 'curiosity gap', shock: 'shock / surprise', question: 'thought-provoking question', story: 'personal story opener', stat: 'statistic / number-based' };

      const prompt = `Write 5 different YouTube opening hooks in ${lang}.

Topic: ${topic}
Hook type: ${typeMap[type]}

Rules:
- Each hook 2-3 sentences max
- First line must grab attention immediately
- Honest, no clickbait lies
- Different angles each
- Language: ${lang}
Return ONLY numbered list 1-5.`;

      const text = await callAI(prompt, { systemPrompt: 'You are a YouTube hook expert. Return only numbered list.', temperature: 0.95, maxTokens: 1000 });
      const hooks = parseList(text);
      return { type: 'hooks', items: hooks };
    });

    // Story
    bind('qvhs2-st-go', 'qvhs2-st-out', async () => {
      const topic = (document.getElementById('qvhs2-st-topic').value || '').trim();
      const lang = document.getElementById('qvhs2-st-lang').value;
      if (!topic) throw new Error('Topic daalo');

      const prompt = `Create a story framework for a YouTube video in ${lang}.

Topic/Story: ${topic}

Use the STORY framework:
[S] Setup - context and hook
[T] Tension - conflict or problem
[O] Obstacle - what went wrong
[R] Resolution - how it was solved
[Y] Yield - lesson / takeaway

Rules:
- Write actual content for each section (2-4 sentences)
- Keep it natural and engaging
- Language: ${lang}
Return ONLY the framework with sections clearly labeled.`;

      const text = await callAI(prompt, { systemPrompt: 'You are a YouTube storytelling expert. Return only the framework.', temperature: 0.85, maxTokens: 1500 });
      return { type: 'script', text: cleanScript(text) };
    });

    // CTA
    bind('qvhs2-c-go', 'qvhs2-c-out', async () => {
      const topic = (document.getElementById('qvhs2-c-topic').value || '').trim();
      const lang = document.getElementById('qvhs2-c-lang').value;
      const goal = document.getElementById('qvhs2-c-goal').value;
      if (!topic) throw new Error('Topic daalo');

      const goalMap = {
        subscribe: 'subscribe to channel',
        like: 'like + comment',
        next: 'watch next video',
        link: 'click link / signup',
        engage: 'share thoughts / discuss'
      };

      const prompt = `Write 5 different call-to-action (CTA) endings for a YouTube video in ${lang}.

Topic: ${topic}
CTA Goal: ${goalMap[goal]}

Rules:
- Each CTA 2-3 sentences
- Natural and non-pushy
- Different angles
- Language: ${lang}
Return ONLY numbered list 1-5.`;

      const text = await callAI(prompt, { systemPrompt: 'You are a YouTube CTA expert. Return only numbered list.', temperature: 0.9, maxTokens: 900 });
      const ctas = parseList(text);
      return { type: 'hooks', items: ctas };
    });
  }

  function bind(btnId, outId, fn) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const out = document.getElementById(outId);
      out.innerHTML = `<div class="qvhs2-loading"><div class="qvhs2-spinner"></div>AI script likh raha hai...</div>`;
      btn.disabled = true;
      try {
        const res = await fn();
        out.innerHTML = renderResult(res);
      } catch (e) {
        out.innerHTML = `<div class="qvhs2-error">❌ ${esc(e.message || 'Something went wrong')}</div>`;
      } finally { btn.disabled = false; }
    });
  }

  function renderResult(res) {
    if (!res) return '';
    if (res.type === 'script') {
      const len = res.text.length;
      const words = res.text.split(/\s+/).filter(Boolean).length;
      const mins = (words / 140).toFixed(1);
      return `
        <div class="qvhs2-stat-row"><span>Words</span><span class="val">${words}</span></div>
        <div class="qvhs2-stat-row"><span>Characters</span><span class="val">${len}</span></div>
        <div class="qvhs2-stat-row"><span>Est. speaking time</span><span class="val good">~${mins} min</span></div>
        <div class="qvhs2-result"><div class="qvhs2-result-text" id="qvhs2-result-text">${esc(res.text)}</div></div>
        <div class="qvhs2-actions-row">
          <button class="qvhs2-action" data-act="copy-text" data-target="qvhs2-result-text"><span class="ico">📋</span>Copy</button>
          <button class="qvhs2-action" data-act="save-script" data-target="qvhs2-result-text"><span class="ico">💾</span>Save</button>
          <button class="qvhs2-action" data-act="print-text" data-target="qvhs2-result-text" data-title="Script Lab Report"><span class="ico">🖨️</span>Print</button>
        </div>`;
    }
    if (res.type === 'hooks') {
      const cards = res.items.map((t, i) => `
        <div class="qvhs2-hook-card" data-hook="${esc(t)}">
          <div class="qvhs2-hook-text"><span class="qvhs2-hook-num">${i + 1}</span><span>${esc(t)}</span></div>
          <div class="qvhs2-hook-actions">
            <button class="qvhs2-hook-btn" data-act="copy" data-t="${esc(t)}">📋 Copy</button>
            <button class="qvhs2-hook-btn primary" data-act="save-hook" data-t="${esc(t)}">💾 Save</button>
          </div>
        </div>`).join('');
      return `
        <div class="qvhs2-stat-row"><span>Total</span><span class="val good">${res.items.length} variations</span></div>
        <div style="margin-top:12px" id="qvhs2-hooks-list">${cards}</div>
        <div class="qvhs2-actions-row">
          <button class="qvhs2-action" data-act="copy-all-hooks"><span class="ico">📋</span>Copy All</button>
          <button class="qvhs2-action" data-act="print-hooks"><span class="ico">🖨️</span>Print</button>
          <button class="qvhs2-action" data-act="pdf-hooks"><span class="ico">📄</span>PDF</button>
        </div>`;
    }
    return '';
  }

  /* Delegated events — scoped */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (!btn.closest('.qvhs2-wrap')) return;
    const act = btn.dataset.act;

    if (act === 'copy') { copyText(btn.dataset.t || ''); return; }
    if (act === 'save-hook') { saveScript(btn.dataset.t || '', 'Hook / CTA'); return; }
    if (act === 'copy-text') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      copyText((el.innerText || el.textContent || '').trim());
      return;
    }
    if (act === 'save-script') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      saveScript((el.innerText || el.textContent || '').trim(), 'Script');
      return;
    }
    if (act === 'print-text') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      printText((el.innerText || el.textContent || '').trim(), btn.dataset.title || 'Script Lab Report');
      return;
    }
    if (act === 'copy-all-hooks') {
      const list = document.getElementById('qvhs2-hooks-list');
      if (!list) return;
      const hooks = Array.from(list.querySelectorAll('.qvhs2-hook-card')).map(c => c.dataset.hook);
      copyText(hooks.join('\n\n'));
      return;
    }
    if (act === 'print-hooks' || act === 'pdf-hooks') {
      const list = document.getElementById('qvhs2-hooks-list');
      if (!list) return;
      const hooks = Array.from(list.querySelectorAll('.qvhs2-hook-card')).map(c => c.dataset.hook);
      const text = hooks.map((h, i) => `${i+1}. ${h}`).join('\n\n');
      if (act === 'print-hooks') printText(text, 'Script Lab — Hooks');
      else pdfText(text, 'Script Lab — Hooks');
      return;
    }
  });

  function saveScript(text, kind) {
    const KEY = 'qvh_workspace_v1';
    let data = { ideas: [], titles: [], scripts: [] };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        data = { ideas: Array.isArray(p.ideas) ? p.ideas : [], titles: Array.isArray(p.titles) ? p.titles : [], scripts: Array.isArray(p.scripts) ? p.scripts : [] };
      }
    } catch (err) {}

    const title = (kind || 'Script') + ' — ' + new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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
      .wrap{max-width:720px;margin:0 auto}.brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:3px solid #6366f1;margin-bottom:24px}.brand-logo{display:flex;align-items:center;gap:10px}.brand-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:20px}.brand-name{font-size:22px;font-weight:900;color:#8b5cf6}.brand-meta{font-size:12px;color:${c.text2};text-align:right}
      .doc-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${c.text3};margin-bottom:8px}.big{font-size:20px;font-weight:900;color:${c.text};margin-bottom:22px}.content{background:${c.surface};border:1px solid ${c.border};border-radius:14px;padding:18px 20px;font-size:14px;line-height:1.7;color:${c.text};white-space:pre-wrap;word-break:break-word}
      .footer{margin-top:26px;padding-top:18px;border-top:1px solid ${c.border};text-align:center;font-size:11.5px;color:${c.text3}}
      @media print{body{background:${c.bg} !important;padding:20px 16px}.wrap{max-width:100%}}@page{margin:14mm;size:A4}
    </style></head><body><div class="wrap">
      <div class="brand"><div class="brand-logo"><div class="brand-icon">⚡</div><div class="brand-name">Qunverio</div></div><div class="brand-meta">Script Lab<br>${now}</div></div>
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

  async function pdfText(content, heading) {
    QVH.toast('Generating PDF...', '');
    const html = buildReportHTML(content, heading);
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
          pdf.save('qunverio-script-lab.pdf');
          QVH.toast('PDF downloaded ✅', 'success');
        };
        img.src = dataUrl;
      } catch (e) { console.error(e); QVH.toast('PDF failed', 'error'); } finally { if (iframe.parentNode) document.body.removeChild(iframe); }
    }, 900);
  }

  QVH.registerRenderer('script', render);
  console.log('%c✅ Script Lab registered', 'color:#6366f1;font-weight:bold');
})();