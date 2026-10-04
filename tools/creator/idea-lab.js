/* ============================================================
   QUNVERIO — IDEA LAB (v1.0)
   Path: tools/creator/idea-lab.js
   AI-powered YouTube video ideas, viral topics, series planner
   ============================================================ */

(function () {
  'use strict';

  if (!window.QVH) {
    console.warn('QVH not loaded — idea-lab.js skipping');
    return;
  }

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
      temperature: opts.temperature != null ? opts.temperature : 0.95,
      maxTokens: opts.maxTokens || 1800
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

  // Parse bullet/numbered list items from AI output
  function parseIdeas(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const ideas = [];
    for (let line of lines) {
      let t = line
        .replace(/^\*\*|\*\*$/g, '')
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/^[-•*]\s*/, '')
        .replace(/^["'`]|["'`]$/g, '')
        .trim();
      if (!t) continue;
      if (/^(here|sure|ye|yeh|below|following|these|based on)/i.test(t) && t.length < 80) continue;
      if (t.endsWith(':')) continue;
      if (t.length < 15) continue;
      if (t.length > 250) t = t.slice(0, 250);
      ideas.push(t);
      if (ideas.length >= 30) break;
    }
    return ideas;
  }

  const CSS = `
    .qvhi-wrap { max-width: 720px; margin: 0 auto; }
    .qvhi-tabs {
      display: flex; gap: 6px; overflow-x: auto;
      padding-bottom: 12px; margin-bottom: 12px;
      scrollbar-width: none;
    }
    .qvhi-tabs::-webkit-scrollbar { display: none; }
    .qvhi-tab {
      flex: 0 0 auto; padding: 8px 14px; border-radius: 20px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      font-size: 12px; font-weight: 700;
      color: var(--text-2, #a8b0d8);
      cursor: pointer; white-space: nowrap;
      transition: all .18s;
    }
    .qvhi-tab.active {
      background: linear-gradient(135deg,#f59e0b,#f97316);
      color: #fff; border-color: transparent;
      box-shadow: 0 4px 12px rgba(245,158,11,.35);
    }
    .qvhi-panel { display: none; }
    .qvhi-panel.active { display: block; animation: qvhi-fade .22s ease; }
    @keyframes qvhi-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }

    .qvhi-card {
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 14px; padding: 15px; margin-bottom: 12px;
    }
    .qvhi-card-title {
      font-size: 12px; font-weight: 800;
      text-transform: uppercase; letter-spacing: .07em;
      color: var(--text-3, #6b74a0); margin-bottom: 12px;
    }
    .qvhi-field { margin-bottom: 12px; }
    .qvhi-field label {
      display: block; font-size: 12.5px; font-weight: 600;
      color: var(--text-2, #a8b0d8); margin-bottom: 5px;
    }
    .qvhi-field input, .qvhi-field textarea, .qvhi-field select {
      width: 100%; padding: 11px 13px;
      background: var(--surface-2, #1c2250);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 11px;
      font-size: 14px; outline: none; color: var(--text, #eef1ff);
      font-family: inherit; box-sizing: border-box;
      transition: border-color .18s;
    }
    .qvhi-field input:focus, .qvhi-field textarea:focus, .qvhi-field select:focus {
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245,158,11,.15);
    }
    .qvhi-field textarea { resize: vertical; min-height: 70px; }
    .qvhi-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 420px) { .qvhi-row2 { grid-template-columns: 1fr; } }

    .qvhi-btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 6px; padding: 13px 18px;
      border-radius: 12px; border: none;
      font-size: 14px; font-weight: 700;
      cursor: pointer; white-space: nowrap;
      transition: transform .15s, box-shadow .18s;
    }
    .qvhi-btn:active { transform: scale(.97); }
    .qvhi-btn-primary {
      background: linear-gradient(135deg,#f59e0b,#f97316);
      color: #fff; width: 100%;
      box-shadow: 0 4px 14px rgba(245,158,11,.35);
    }

    .qvhi-loading {
      text-align: center; padding: 28px 16px;
      color: var(--text-2, #a8b0d8); font-size: 13px;
    }
    .qvhi-spinner {
      width: 32px; height: 32px; margin: 0 auto 12px;
      border: 3px solid var(--surface-2, #1c2250);
      border-top-color: #f59e0b;
      border-radius: 50%;
      animation: qvhi-spin .8s linear infinite;
    }
    @keyframes qvhi-spin { to { transform: rotate(360deg) } }

    .qvhi-error {
      background: rgba(239,68,68,.1);
      border-left: 3px solid #ef4444;
      border-radius: 10px;
      padding: 12px 14px; margin-top: 12px;
      font-size: 13px; color: #fca5a5; line-height: 1.5;
    }

    .qvhi-idea-card {
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 12px;
      padding: 13px 14px;
      margin-bottom: 9px;
      transition: border-color .18s;
    }
    .qvhi-idea-card:hover { border-color: rgba(245,158,11,.4); }
    .qvhi-idea-num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; border-radius: 8px;
      background: linear-gradient(135deg,#f59e0b,#f97316);
      color: #fff; font-size: 11px; font-weight: 800;
      margin-right: 8px; flex-shrink: 0;
    }
    .qvhi-idea-text {
      font-size: 14px; font-weight: 600;
      color: var(--text, #eef1ff);
      line-height: 1.45; margin-bottom: 9px;
      display: flex; align-items: flex-start;
      word-break: break-word;
    }
    .qvhi-idea-actions {
      display: flex; gap: 5px; flex-wrap: wrap;
    }
    .qvhi-idea-btn {
      padding: 6px 10px; border-radius: 7px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      font-size: 11px; font-weight: 700;
      color: var(--text-2, #a8b0d8);
      cursor: pointer; transition: all .15s;
    }
    .qvhi-idea-btn:hover { background: var(--surface-hover, #232a5e); color: var(--text, #eef1ff); }
    .qvhi-idea-btn.primary {
      background: linear-gradient(135deg,#f59e0b,#f97316);
      color: #fff; border-color: transparent;
    }

    .qvhi-actions-row {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px;
      margin-top: 12px;
    }
    .qvhi-action {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 10px 4px; border-radius: 10px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      font-size: 11px; font-weight: 700;
      color: var(--text, #eef1ff);
      cursor: pointer;
    }
    .qvhi-action:hover { background: var(--surface-hover, #232a5e); }
    .qvhi-action .ico { font-size: 15px; }

    .qvhi-note {
      font-size: 11.5px; color: var(--text-3, #6b74a0);
      background: var(--surface-2, #1c2250);
      border-left: 3px solid #f59e0b;
      padding: 10px 12px; border-radius: 8px;
      margin-top: 12px; line-height: 1.55;
    }
  `;

  function injectCSS() {
    if (document.getElementById('qvhi-css')) return;
    const s = document.createElement('style');
    s.id = 'qvhi-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function render(container) {
    injectCSS();
    container.innerHTML = `
      <div class="qvhi-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#f59e0b,#f97316)">
          <div class="qvh-th-icon">💡</div>
          <div style="flex:1;min-width:0">
            <h3>Idea Lab</h3>
            <p>AI video ideas, viral topics, series planner</p>
          </div>
        </div>

        <div class="qvhi-tabs" id="qvhiTabs">
          <button class="qvhi-tab active" data-tab="gen">💡 Idea Generator</button>
          <button class="qvhi-tab" data-tab="viral">🔥 Viral Topics</button>
          <button class="qvhi-tab" data-tab="series">📚 Series Ideas</button>
          <button class="qvhi-tab" data-tab="next">🎯 Next Video</button>
          <button class="qvhi-tab" data-tab="month">📅 30-Day Plan</button>
        </div>

        <div id="qvhiPanels">
          ${panelGen()}
          ${panelViral()}
          ${panelSeries()}
          ${panelNext()}
          ${panelMonth()}
        </div>

        <div class="qvhi-note">
          ⚠️ <strong>Note:</strong> Ye AI-generated ideas suggestions hain. Actual performance depend karta hai execution, thumbnail, title aur audience pe. No guaranteed virality.
        </div>
      </div>
    `;

    wireTabs();
    wirePanels();
  }

  function panelGen() {
    return `
      <div class="qvhi-panel active" data-panel="gen">
        <div class="qvhi-card">
          <div class="qvhi-card-title">Video Idea Generator</div>
          <div class="qvhi-field">
            <label>Topic / Niche *</label>
            <input type="text" id="qvhi-gen-topic" placeholder="e.g. personal finance for beginners in India" />
          </div>
          <div class="qvhi-row2">
            <div class="qvhi-field">
              <label>Language</label>
              <select id="qvhi-gen-lang">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>
            <div class="qvhi-field">
              <label>Format</label>
              <select id="qvhi-gen-format">
                <option value="any">Any</option>
                <option value="long">Long-form</option>
                <option value="short">Shorts</option>
              </select>
            </div>
          </div>
          <div class="qvhi-field">
            <label>Audience (optional)</label>
            <input type="text" id="qvhi-gen-aud" placeholder="e.g. college students, 18-25 age" />
          </div>
          <button class="qvhi-btn qvhi-btn-primary" id="qvhi-gen-go">✨ Generate 10 Ideas</button>
          <div id="qvhi-gen-out"></div>
        </div>
      </div>
    `;
  }

  function panelViral() {
    return `
      <div class="qvhi-panel" data-panel="viral">
        <div class="qvhi-card">
          <div class="qvhi-card-title">Viral Topic Finder</div>
          <div class="qvhi-field">
            <label>Your Niche *</label>
            <input type="text" id="qvhi-viral-niche" placeholder="e.g. tech reviews, cooking, fitness" />
          </div>
          <div class="qvhi-row2">
            <div class="qvhi-field">
              <label>Language</label>
              <select id="qvhi-viral-lang">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>
            <div class="qvhi-field">
              <label>Trend Type</label>
              <select id="qvhi-viral-type">
                <option value="evergreen">Evergreen topics</option>
                <option value="trending">Trending / seasonal</option>
                <option value="controversial">Debate-worthy</option>
                <option value="curiosity">Curiosity-driven</option>
              </select>
            </div>
          </div>
          <button class="qvhi-btn qvhi-btn-primary" id="qvhi-viral-go">🔥 Find Viral Angles</button>
          <div id="qvhi-viral-out"></div>
        </div>
      </div>
    `;
  }

  function panelSeries() {
    return `
      <div class="qvhi-panel" data-panel="series">
        <div class="qvhi-card">
          <div class="qvhi-card-title">Series Idea Generator</div>
          <div class="qvhi-field">
            <label>Niche / Topic *</label>
            <input type="text" id="qvhi-series-niche" placeholder="e.g. programming tutorials for beginners" />
          </div>
          <div class="qvhi-field">
            <label>Language</label>
            <select id="qvhi-series-lang">
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>
          <button class="qvhi-btn qvhi-btn-primary" id="qvhi-series-go">📚 Generate 5 Series</button>
          <div id="qvhi-series-out"></div>
        </div>
      </div>
    `;
  }

  function panelNext() {
    return `
      <div class="qvhi-panel" data-panel="next">
        <div class="qvhi-card">
          <div class="qvhi-card-title">Next Video Suggestion</div>
          <div class="qvhi-field">
            <label>Your Recent Videos / Topics *</label>
            <textarea id="qvhi-next-recent" placeholder="e.g.&#10;1. Python basics for beginners&#10;2. How to install VS Code&#10;3. 5 Python projects for beginners"></textarea>
          </div>
          <div class="qvhi-field">
            <label>Language</label>
            <select id="qvhi-next-lang">
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>
          <button class="qvhi-btn qvhi-btn-primary" id="qvhi-next-go">🎯 Suggest Next Videos</button>
          <div id="qvhi-next-out"></div>
        </div>
      </div>
    `;
  }

  function panelMonth() {
    return `
      <div class="qvhi-panel" data-panel="month">
        <div class="qvhi-card">
          <div class="qvhi-card-title">30-Day Content Plan</div>
          <div class="qvhi-field">
            <label>Niche / Channel Focus *</label>
            <input type="text" id="qvhi-month-niche" placeholder="e.g. fitness, tech, education" />
          </div>
          <div class="qvhi-row2">
            <div class="qvhi-field">
              <label>Language</label>
              <select id="qvhi-month-lang">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>
            <div class="qvhi-field">
              <label>Videos Per Week</label>
              <select id="qvhi-month-freq">
                <option value="2">2 per week</option>
                <option value="3" selected>3 per week</option>
                <option value="5">5 per week</option>
                <option value="7">Daily</option>
              </select>
            </div>
          </div>
          <button class="qvhi-btn qvhi-btn-primary" id="qvhi-month-go">📅 Generate 30-Day Plan</button>
          <div id="qvhi-month-out"></div>
        </div>
      </div>
    `;
  }

  function wireTabs() {
    document.querySelectorAll('.qvhi-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.qvhi-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const id = tab.dataset.tab;
        document.querySelectorAll('.qvhi-panel').forEach(p => {
          p.classList.toggle('active', p.dataset.panel === id);
        });
      });
    });
  }

  function wirePanels() {
    bind('qvhi-gen-go', 'qvhi-gen-out', async () => {
      const topic = (document.getElementById('qvhi-gen-topic').value || '').trim();
      const lang = document.getElementById('qvhi-gen-lang').value;
      const format = document.getElementById('qvhi-gen-format').value;
      const aud = (document.getElementById('qvhi-gen-aud').value || '').trim();
      if (!topic) throw new Error('Topic daalo');

      const prompt = `Generate 10 YouTube video ideas in ${lang}.
Topic/Niche: ${topic}
${aud ? 'Target audience: ' + aud : ''}
Format: ${format === 'any' ? 'mix of long and short' : format}

Rules:
- Each idea should be a clear, clickable video concept
- Include variety: tutorial, list, story, opinion, challenge
- Keep each idea 1-2 lines max
- Language: ${lang}
Return ONLY the numbered list (1-10). No intro, no outro.`;

      const text = await callAI(prompt, {
        systemPrompt: 'You are a YouTube content strategist. Return only the numbered list of ideas.',
        temperature: 0.95, maxTokens: 1400
      });
      return parseIdeas(text);
    });

    bind('qvhi-viral-go', 'qvhi-viral-out', async () => {
      const niche = (document.getElementById('qvhi-viral-niche').value || '').trim();
      const lang = document.getElementById('qvhi-viral-lang').value;
      const type = document.getElementById('qvhi-viral-type').value;
      if (!niche) throw new Error('Niche daalo');

      const typeMap = {
        evergreen: 'evergreen topics that stay relevant forever',
        trending: 'trending/seasonal topics that are hot right now',
        controversial: 'debate-worthy topics that spark discussion',
        curiosity: 'curiosity-driven topics with intriguing angles'
      };

      const prompt = `Give 10 ${typeMap[type]} for a YouTube channel in ${lang}.
Niche: ${niche}

Rules:
- Each topic should be viral-worthy but honest
- No fake clickbait
- 1-2 lines per idea
- Language: ${lang}
Return ONLY the numbered list (1-10).`;

      const text = await callAI(prompt, {
        systemPrompt: 'You are a viral YouTube topic researcher. Return only the numbered list.',
        temperature: 0.95, maxTokens: 1400
      });
      return parseIdeas(text);
    });

    bind('qvhi-series-go', 'qvhi-series-out', async () => {
      const niche = (document.getElementById('qvhi-series-niche').value || '').trim();
      const lang = document.getElementById('qvhi-series-lang').value;
      if (!niche) throw new Error('Niche daalo');

      const prompt = `Suggest 5 YouTube series ideas in ${lang} for the niche: ${niche}.

For each series:
- Series name
- 3-4 example episode topics

Format each series as:
1. Series Name — Episode 1, Episode 2, Episode 3

Return ONLY the numbered list (1-5). Language: ${lang}.`;

      const text = await callAI(prompt, {
        systemPrompt: 'You are a YouTube series planner. Return only the numbered list.',
        temperature: 0.9, maxTokens: 1500
      });
      return parseIdeas(text);
    });

    bind('qvhi-next-go', 'qvhi-next-out', async () => {
      const recent = (document.getElementById('qvhi-next-recent').value || '').trim();
      const lang = document.getElementById('qvhi-next-lang').value;
      if (!recent) throw new Error('Recent videos daalo');

      const prompt = `Based on these recent videos, suggest 8 next video ideas in ${lang}.
Recent videos:
${recent}

Rules:
- Ideas should follow the channel's direction
- Mix of continuation + fresh angles
- 1-2 lines per idea
- Language: ${lang}
Return ONLY the numbered list (1-8).`;

      const text = await callAI(prompt, {
        systemPrompt: 'You are a YouTube growth strategist. Return only the numbered list.',
        temperature: 0.9, maxTokens: 1400
      });
      return parseIdeas(text);
    });

    bind('qvhi-month-go', 'qvhi-month-out', async () => {
      const niche = (document.getElementById('qvhi-month-niche').value || '').trim();
      const lang = document.getElementById('qvhi-month-lang').value;
      const freq = document.getElementById('qvhi-month-freq').value;
      if (!niche) throw new Error('Niche daalo');

      const videosCount = freq === '7' ? 30 : parseInt(freq) * 4;
      const prompt = `Create a 30-day content plan (${videosCount} videos) for a YouTube channel in ${lang}.
Niche: ${niche}
Videos per week: ${freq}

Rules:
- List each video as a separate line
- Format: Week X, Day Y — Video idea
- Keep ideas specific and actionable
- Language: ${lang}
Return ONLY the list, no intro.`;

      const text = await callAI(prompt, {
        systemPrompt: 'You are a YouTube content planner. Return only the daily/weekly list.',
        temperature: 0.9, maxTokens: 2500
      });
      return parseIdeas(text);
    });
  }

  function bind(btnId, outId, fn) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const out = document.getElementById(outId);
      out.innerHTML = `<div class="qvhi-loading"><div class="qvhi-spinner"></div>AI soch raha hai...</div>`;
      btn.disabled = true;
      try {
        const ideas = await fn();
        if (!ideas || !ideas.length) throw new Error('Koi idea nahi mila');
        out.innerHTML = renderIdeasList(ideas, outId);
      } catch (e) {
        out.innerHTML = `<div class="qvhi-error">❌ ${esc(e.message || 'Something went wrong')}</div>`;
      } finally {
        btn.disabled = false;
      }
    });
  }

  function renderIdeasList(ideas, key) {
    const cards = ideas.map((t, i) => `
      <div class="qvhi-idea-card" data-idea="${esc(t)}">
        <div class="qvhi-idea-text"><span class="qvhi-idea-num">${i + 1}</span><span>${esc(t)}</span></div>
        <div class="qvhi-idea-actions">
          <button class="qvhi-idea-btn" data-act="copy" data-t="${esc(t)}">📋 Copy</button>
          <button class="qvhi-idea-btn primary" data-act="save" data-t="${esc(t)}">💾 Save</button>
        </div>
      </div>
    `).join('');
    return `
      <div style="margin-top:14px">
        <div class="qvhi-card-title" style="margin-bottom:10px">Generated Ideas</div>
        <div id="qvhi-${key}-list">${cards}</div>
        <div class="qvhi-actions-row">
          <button class="qvhi-action" data-act="copy-all" data-key="${key}"><span class="ico">📋</span>Copy All</button>
          <button class="qvhi-action" data-act="print" data-key="${key}"><span class="ico">🖨️</span>Print</button>
          <button class="qvhi-action" data-act="pdf" data-key="${key}"><span class="ico">📄</span>PDF</button>
        </div>
      </div>
    `;
  }

  /* Delegated events */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === 'copy') { copyText(btn.dataset.t || ''); return; }
    if (act === 'save') { saveToWorkspaceIdea(btn.dataset.t || ''); return; }

    const key = btn.dataset.key;
    if (!key) return;
    const list = document.getElementById('qvhi-' + key + '-list');
    if (!list) return;
    const ideas = Array.from(list.querySelectorAll('.qvhi-idea-card')).map(c => c.dataset.idea);

    if (act === 'copy-all') { copyText(ideas.join('\n')); return; }
    if (act === 'print') { printIdeas(ideas); return; }
    if (act === 'pdf') { pdfIdeas(ideas); return; }
  });

  function saveToWorkspaceIdea(idea) {
    const KEY = 'qvh_workspace_v1';
    let data = { ideas: [], titles: [], scripts: [] };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        data = {
          ideas: Array.isArray(p.ideas) ? p.ideas : [],
          titles: Array.isArray(p.titles) ? p.titles : [],
          scripts: Array.isArray(p.scripts) ? p.scripts : []
        };
      }
    } catch (err) {}

    const exists = data.ideas.some(x => (x.title || '').trim().toLowerCase() === idea.trim().toLowerCase());
    if (exists) { QVH.toast('Already saved in Idea Vault', ''); return; }

    data.ideas.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title: idea,
      notes: 'Saved from Idea Lab',
      ts: Date.now()
    });
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      QVH.toast('Saved to Idea Vault ✅', 'success');
    } catch (err) {
      QVH.toast('Save failed', 'error');
    }
  }

  function themeColors() {
    const cs = getComputedStyle(document.body);
    function safe(v, fb) {
      let val = (cs.getPropertyValue(v) || '').trim();
      if (!val || val.startsWith('var(') || val.length > 60) return fb;
      return val;
    }
    return {
      bg: safe('--bg', '#0a0e27'),
      surface: safe('--surface', '#151a3d'),
      border: safe('--border-strong', 'rgba(255,255,255,0.14)'),
      text: safe('--text', '#eef1ff'),
      text2: safe('--text-2', '#a8b0d8'),
      text3: safe('--text-3', '#6b74a0')
    };
  }

  function buildReportHTML(ideas, heading) {
    const c = themeColors();
    const now = new Date().toLocaleString('en-IN');
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Qunverio — ${heading}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif; background:${c.bg}; color:${c.text}; padding:40px 32px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .wrap { max-width:720px; margin:0 auto; }
  .brand { display:flex; align-items:center; justify-content:space-between; padding-bottom:18px; border-bottom:3px solid #f59e0b; margin-bottom:24px; }
  .brand-logo { display:flex; align-items:center; gap:10px; }
  .brand-icon { width:40px; height:40px; border-radius:11px; background:linear-gradient(135deg,#f59e0b,#f97316); display:flex; align-items:center; justify-content:center; font-size:20px; }
  .brand-name { font-size:22px; font-weight:900; color:#f59e0b; }
  .brand-meta { font-size:12px; color:${c.text2}; text-align:right; }
  .doc-title { font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; color:${c.text3}; margin-bottom:8px; }
  .big { font-size:26px; font-weight:900; color:${c.text}; margin-bottom:22px; }
  .icard { background:${c.surface}; border:1px solid ${c.border}; border-radius:14px; padding:14px 16px; margin-bottom:10px; display:flex; gap:10px; align-items:flex-start; }
  .inum { width:24px; height:24px; border-radius:8px; background:linear-gradient(135deg,#f59e0b,#f97316); color:#fff; font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .itext { font-size:14.5px; font-weight:600; color:${c.text}; line-height:1.4; }
  .footer { margin-top:26px; padding-top:18px; border-top:1px solid ${c.border}; text-align:center; font-size:11.5px; color:${c.text3}; }
  @media print { body { background:${c.bg} !important; padding:20px 16px; } .wrap { max-width:100%; } }
  @page { margin:14mm; size:A4; }
</style>
</head><body>
  <div class="wrap">
    <div class="brand">
      <div class="brand-logo"><div class="brand-icon">⚡</div><div class="brand-name">Qunverio</div></div>
      <div class="brand-meta">Idea Lab<br>${now}</div>
    </div>
    <div class="doc-title">${heading}</div>
    <div class="big">${ideas.length} Ideas</div>
    ${ideas.map((t, i) => `<div class="icard"><div class="inum">${i+1}</div><div class="itext">${esc(t)}</div></div>`).join('')}
    <div class="footer">Generated by <strong style="color:${c.text2};">Qunverio Creator Hub</strong> • qunverio.vercel.app</div>
  </div>
</body></html>`;
  }

  function printIdeas(ideas) {
    const html = buildReportHTML(ideas, 'Idea Lab Report');
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

  async function pdfIdeas(ideas) {
    QVH.toast('Generating PDF...', '');
    const html = buildReportHTML(ideas, 'Idea Lab Report');
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
        const dataUrl = await window.htmlToImage.toPng(target, {
          quality: 1, pixelRatio: 2.5,
          backgroundColor: c.bg,
          width: target.scrollWidth, height: target.scrollHeight,
          cacheBust: true
        });
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = c.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
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
          pdf.save('qunverio-idea-lab.pdf');
          QVH.toast('PDF downloaded ✅', 'success');
        };
        img.src = dataUrl;
      } catch (e) {
        console.error(e);
        QVH.toast('PDF failed', 'error');
      } finally {
        if (iframe.parentNode) document.body.removeChild(iframe);
      }
    }, 900);
  }

  QVH.registerRenderer('idea', render);
  console.log('%c✅ Idea Lab registered', 'color:#f59e0b;font-weight:bold');
})();