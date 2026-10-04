/* ============================================================
   QUNVERIO — SEO LAB (v1.0)
   Path: tools/creator/seo-lab.js
   AI description, tags, hashtags, keywords, chapters
   ============================================================ */

(function () {
  'use strict';
  if (!window.QVH) { console.warn('QVH not loaded — seo-lab.js skipping'); return; }
  const QVH = window.QVH;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function copyText(text) {
    if (!navigator.clipboard) { QVH.toast('Copy not supported', 'error'); return; }
    navigator.clipboard.writeText(text).then(() => QVH.toast('Copied! 📋', 'success')).catch(() => QVH.toast('Copy failed', 'error'));
  }
  async function callAI(prompt, opts) {
    opts = opts || {};
    const body = { prompt, systemPrompt: opts.systemPrompt || '', temperature: opts.temperature != null ? opts.temperature : 0.8, maxTokens: opts.maxTokens || 2000 };
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
      let t = line.replace(/^\*\*|\*\*$/g, '').replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*]\s*/, '').replace(/^#+\s*/, '').replace(/^["'`]|["'`]$/g, '').trim();
      if (!t) continue;
      if (/^(here|sure|ye|yeh|below|following|these)/i.test(t) && t.length < 80) continue;
      if (t.endsWith(':')) continue;
      if (t.length < 2) continue;
      if (t.length > 300) t = t.slice(0, 300);
      items.push(t);
    }
    return items;
  }

  function parseDescription(text) {
    // Strip markdown headers, keep paragraphs
    let out = text.trim();
    out = out.replace(/^\*\*|\*\*$/gm, '');
    out = out.replace(/^#+\s*/gm, '');
    out = out.replace(/^(here|sure|below|following)[^\n]*\n+/i, '');
    return out.trim();
  }

  const CSS = `
    .qvhs-wrap { max-width: 720px; margin: 0 auto; }
    .qvhs-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 12px; scrollbar-width: none; }
    .qvhs-tabs::-webkit-scrollbar { display: none; }
    .qvhs-tab { flex: 0 0 auto; padding: 8px 14px; border-radius: 20px; background: var(--surface-2, #1c2250); border: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 12px; font-weight: 700; color: var(--text-2, #a8b0d8); cursor: pointer; white-space: nowrap; transition: all .18s; }
    .qvhs-tab.active { background: linear-gradient(135deg,#10b981,#059669); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(16,185,129,.35); }
    .qvhs-panel { display: none; }
    .qvhs-panel.active { display: block; animation: qvhs-fade .22s ease; }
    @keyframes qvhs-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
    .qvhs-card { background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 14px; padding: 15px; margin-bottom: 12px; }
    .qvhs-card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; color: var(--text-3, #6b74a0); margin-bottom: 12px; }
    .qvhs-field { margin-bottom: 12px; }
    .qvhs-field label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2, #a8b0d8); margin-bottom: 5px; }
    .qvhs-field input, .qvhs-field textarea, .qvhs-field select { width: 100%; padding: 11px 13px; background: var(--surface-2, #1c2250); border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 11px; font-size: 14px; outline: none; color: var(--text, #eef1ff); font-family: inherit; box-sizing: border-box; transition: border-color .18s; }
    .qvhs-field input:focus, .qvhs-field textarea:focus, .qvhs-field select:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.15); }
    .qvhs-field textarea { resize: vertical; min-height: 70px; }
    .qvhs-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 420px) { .qvhs-row2 { grid-template-columns: 1fr; } }
    .qvhs-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 13px 18px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: transform .15s, box-shadow .18s; }
    .qvhs-btn:active { transform: scale(.97); }
    .qvhs-btn-primary { background: linear-gradient(135deg,#10b981,#059669); color: #fff; width: 100%; box-shadow: 0 4px 14px rgba(16,185,129,.35); }
    .qvhs-loading { text-align: center; padding: 28px 16px; color: var(--text-2, #a8b0d8); font-size: 13px; }
    .qvhs-spinner { width: 32px; height: 32px; margin: 0 auto 12px; border: 3px solid var(--surface-2, #1c2250); border-top-color: #10b981; border-radius: 50%; animation: qvhs-spin .8s linear infinite; }
    @keyframes qvhs-spin { to { transform: rotate(360deg) } }
    .qvhs-error { background: rgba(239,68,68,.1); border-left: 3px solid #ef4444; border-radius: 10px; padding: 12px 14px; margin-top: 12px; font-size: 13px; color: #fca5a5; line-height: 1.5; }
    .qvhs-result { background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 12px; padding: 14px; margin-top: 12px; }
    .qvhs-result-text { font-size: 13.5px; line-height: 1.6; color: var(--text, #eef1ff); white-space: pre-wrap; word-break: break-word; max-height: 400px; overflow-y: auto; }
    .qvhs-tag { display: inline-block; padding: 6px 11px; border-radius: 20px; background: var(--surface, #151a3d); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); font-size: 12px; font-weight: 600; color: var(--text-2, #a8b0d8); margin: 0 5px 6px 0; }
    .qvhs-tag.hash { background: rgba(16,185,129,.12); color: #10b981; border-color: rgba(16,185,129,.3); }
    .qvhs-tags-wrap { line-height: 1.9; margin-top: 4px; }
    .qvhs-actions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 12px; }
    .qvhs-action { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px; border-radius: 10px; background: var(--surface, #151a3d); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); font-size: 11px; font-weight: 700; color: var(--text, #eef1ff); cursor: pointer; }
    .qvhs-action:hover { background: var(--surface-hover, #232a5e); }
    .qvhs-action .ico { font-size: 15px; }
    .qvhs-note { font-size: 11.5px; color: var(--text-3, #6b74a0); background: var(--surface-2, #1c2250); border-left: 3px solid #f59e0b; padding: 10px 12px; border-radius: 8px; margin-top: 12px; line-height: 1.55; }
    .qvhs-stat-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12.5px; color: var(--text-2, #a8b0d8); border-bottom: 1px solid var(--border, rgba(255,255,255,0.05)); }
    .qvhs-stat-row:last-child { border-bottom: none; }
    .qvhs-stat-row .val { color: var(--text, #eef1ff); font-weight: 700; }
    .qvhs-stat-row.warn .val { color: #f59e0b; }
    .qvhs-stat-row.bad .val { color: #ef4444; }
    .qvhs-stat-row.good .val { color: #10b981; }
    .qvhs-check { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border, rgba(255,255,255,0.05)); font-size: 13px; line-height: 1.5; color: var(--text-2, #a8b0d8); }
    .qvhs-check:last-child { border-bottom: none; }
    .qvhs-check .tick { color: #10b981; font-weight: 900; flex-shrink: 0; }
  `;

  function injectCSS() {
    if (document.getElementById('qvhs-css')) return;
    const s = document.createElement('style');
    s.id = 'qvhs-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  function render(container) {
    injectCSS();
    container.innerHTML = `
      <div class="qvhs-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#10b981,#059669)">
          <div class="qvh-th-icon">🔍</div>
          <div style="flex:1;min-width:0"><h3>SEO Lab</h3><p>Description, tags, hashtags, keywords, chapters</p></div>
        </div>
        <div class="qvhs-tabs" id="qvhsTabs">
          <button class="qvhs-tab active" data-tab="desc">📄 Description</button>
          <button class="qvhs-tab" data-tab="tags">🏷️ Tags</button>
          <button class="qvhs-tab" data-tab="hash">#️⃣ Hashtags</button>
          <button class="qvhs-tab" data-tab="kw">🔑 Keywords</button>
          <button class="qvhs-tab" data-tab="chap">📑 Chapters</button>
          <button class="qvhs-tab" data-tab="check">✅ Checklist</button>
        </div>
        <div id="qvhsPanels">
          ${panelDesc()}${panelTags()}${panelHash()}${panelKw()}${panelChap()}${panelCheck()}
        </div>
        <div class="qvhs-note">
          ⚠️ <strong>Note:</strong> Ye AI-generated SEO suggestions hain. Actual ranking YouTube algorithm, competition aur audience behavior pe depend karti hai. No guaranteed ranking.
        </div>
      </div>`;
    wireTabs(); wirePanels();
  }

  function panelDesc() {
    return `<div class="qvhs-panel active" data-panel="desc"><div class="qvhs-card">
      <div class="qvhs-card-title">Description Generator</div>
      <div class="qvhs-field"><label>Video Title *</label><input type="text" id="qvhs-d-title" placeholder="e.g. 5 Essential Budgeting Rules for Beginners in India" /></div>
      <div class="qvhs-field"><label>Video Summary / Key Points *</label><textarea id="qvhs-d-summary" placeholder="Video me kya cover karoge? Point-wise likho..."></textarea></div>
      <div class="qvhs-row2">
        <div class="qvhs-field"><label>Language</label><select id="qvhs-d-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
        <div class="qvhs-field"><label>Tone</label><select id="qvhs-d-tone"><option>Informative</option><option>Friendly</option><option>Professional</option><option>Casual</option></select></div>
      </div>
      <button class="qvhs-btn qvhs-btn-primary" id="qvhs-d-go">📄 Generate Description</button>
      <div id="qvhs-d-out"></div>
    </div></div>`;
  }
  function panelTags() {
    return `<div class="qvhs-panel" data-panel="tags"><div class="qvhs-card">
      <div class="qvhs-card-title">Tags Generator</div>
      <div class="qvhs-field"><label>Video Title / Topic *</label><input type="text" id="qvhs-t-topic" placeholder="e.g. personal finance for beginners" /></div>
      <div class="qvhs-field"><label>Niche (optional)</label><input type="text" id="qvhs-t-niche" placeholder="e.g. finance, education" /></div>
      <button class="qvhs-btn qvhs-btn-primary" id="qvhs-t-go">🏷️ Generate Tags</button>
      <div id="qvhs-t-out"></div>
    </div></div>`;
  }
  function panelHash() {
    return `<div class="qvhs-panel" data-panel="hash"><div class="qvhs-card">
      <div class="qvhs-card-title">Hashtag Generator</div>
      <div class="qvhs-field"><label>Video Topic *</label><input type="text" id="qvhs-h-topic" placeholder="e.g. budget planning for Indian families" /></div>
      <button class="qvhs-btn qvhs-btn-primary" id="qvhs-h-go">#️⃣ Generate Hashtags</button>
      <div id="qvhs-h-out"></div>
    </div></div>`;
  }
  function panelKw() {
    return `<div class="qvhs-panel" data-panel="kw"><div class="qvhs-card">
      <div class="qvhs-card-title">Keyword Generator</div>
      <div class="qvhs-field"><label>Main Topic / Niche *</label><input type="text" id="qvhs-k-topic" placeholder="e.g. how to save money in India" /></div>
      <div class="qvhs-row2">
        <div class="qvhs-field"><label>Language</label><select id="qvhs-k-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
        <div class="qvhs-field"><label>Search Intent</label><select id="qvhs-k-intent"><option value="informational">Informational</option><option value="commercial">Commercial</option><option value="howto">How-to</option><option value="comparison">Comparison</option></select></div>
      </div>
      <button class="qvhs-btn qvhs-btn-primary" id="qvhs-k-go">🔑 Generate Keywords</button>
      <div id="qvhs-k-out"></div>
    </div></div>`;
  }
  function panelChap() {
    return `<div class="qvhs-panel" data-panel="chap"><div class="qvhs-card">
      <div class="qvhs-card-title">Chapter / Timestamp Generator</div>
      <div class="qvhs-field"><label>Video Topic *</label><input type="text" id="qvhs-c-topic" placeholder="e.g. iPhone 15 review + tips" /></div>
      <div class="qvhs-field"><label>Key Sections (optional, agar pata hai)</label><textarea id="qvhs-c-sections" placeholder="e.g.&#10;Intro&#10;Unboxing&#10;Camera test&#10;Battery&#10;Verdict"></textarea></div>
      <div class="qvhs-field"><label>Duration (approx minutes)</label><input type="number" id="qvhs-c-dur" placeholder="e.g. 12" min="1" max="180" /></div>
      <button class="qvhs-btn qvhs-btn-primary" id="qvhs-c-go">📑 Generate Chapters</button>
      <div id="qvhs-c-out"></div>
    </div></div>`;
  }
  function panelCheck() {
    return `<div class="qvhs-panel" data-panel="check"><div class="qvhs-card">
      <div class="qvhs-card-title">Pre-Upload SEO Checklist</div>
      <div id="qvhs-check-list"></div>
      <button class="qvhs-btn qvhs-btn-primary mt-16" id="qvhs-check-go">✅ Show Checklist</button>
      <div id="qvhs-check-out"></div>
    </div></div>`;
  }

  function wireTabs() {
    document.querySelectorAll('.qvhs-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.qvhs-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.qvhs-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
      });
    });
  }

  function wirePanels() {
    // Description
    bind('qvhs-d-go', 'qvhs-d-out', async () => {
      const title = (document.getElementById('qvhs-d-title').value || '').trim();
      const summary = (document.getElementById('qvhs-d-summary').value || '').trim();
      const lang = document.getElementById('qvhs-d-lang').value;
      const tone = document.getElementById('qvhs-d-tone').value;
      if (!title) throw new Error('Title daalo');
      if (!summary) throw new Error('Summary daalo');
      const prompt = `Write a YouTube video description in ${lang}.\n\nTitle: ${title}\nSummary/Key points: ${summary}\nTone: ${tone}\n\nRules:\n- Start with a hook (2-3 lines that show in search)\n- Include main keywords naturally\n- 150-250 words\n- Add 3-5 relevant hashtags at end\n- Add placeholder for links/socials: "🔗 Follow me: [links]"\n- No fake promises\n\nReturn ONLY the description text, no intro/outro.`;
      const text = await callAI(prompt, { systemPrompt: 'You are a YouTube SEO expert. Return only the description text.', temperature: 0.8, maxTokens: 1200 });
      return { type: 'desc', text: parseDescription(text) };
    });

    // Tags
    bind('qvhs-t-go', 'qvhs-t-out', async () => {
      const topic = (document.getElementById('qvhs-t-topic').value || '').trim();
      const niche = (document.getElementById('qvhs-t-niche').value || '').trim();
      if (!topic) throw new Error('Topic daalo');
      const prompt = `Generate 25-30 YouTube SEO tags for a video about: ${topic}\n${niche ? 'Niche: ' + niche : ''}\n\nRules:\n- Mix of exact, broad, and long-tail\n- Total must fit within 500 characters when comma-separated\n- No irrelevant tags\n- Include Hinglish variants if India-focused\n\nReturn ONLY the comma-separated tags on one line. No numbers, no bullets.`;
      const text = await callAI(prompt, { systemPrompt: 'YouTube tags expert. Return only comma-separated tags.', temperature: 0.7, maxTokens: 600 });
      const cleaned = text.replace(/\n/g, ' ').replace(/\s*,\s*/g, ', ').replace(/^[-•*]\s*/, '').trim();
      return { type: 'tags', text: cleaned };
    });

    // Hashtags
    bind('qvhs-h-go', 'qvhs-h-out', async () => {
      const topic = (document.getElementById('qvhs-h-topic').value || '').trim();
      if (!topic) throw new Error('Topic daalo');
      const prompt = `Generate 20 relevant YouTube hashtags for: ${topic}\n\nRules:\n- Each starts with #\n- Mix of broad and niche\n- No spaces inside hashtag\n- No offensive ones\n\nReturn ONLY hashtags separated by spaces, on one line. No numbers, no bullets.`;
      const text = await callAI(prompt, { systemPrompt: 'YouTube hashtag expert. Return only hashtags separated by spaces.', temperature: 0.7, maxTokens: 400 });
      const cleaned = text.replace(/\n/g, ' ').trim();
      const tags = cleaned.split(/\s+/).map(x => x.startsWith('#') ? x : '#' + x.replace(/^#+/, '')).filter(Boolean);
      return { type: 'hash', tags };
    });

    // Keywords
    bind('qvhs-k-go', 'qvhs-k-out', async () => {
      const topic = (document.getElementById('qvhs-k-topic').value || '').trim();
      const lang = document.getElementById('qvhs-k-lang').value;
      const intent = document.getElementById('qvhs-k-intent').value;
      if (!topic) throw new Error('Topic daalo');
      const intentMap = { informational: 'informational search', commercial: 'commercial search', howto: 'how-to search', comparison: 'comparison search' };
      const prompt = `Generate 20 SEO keywords in ${lang} for YouTube topic: ${topic}\nIntent: ${intentMap[intent]}\n\nRules:\n- Include short-tail and long-tail keywords\n- No duplicates\n- Real search phrases\n- Language: ${lang}\n\nReturn ONLY numbered list 1-20.`;
      const text = await callAI(prompt, { systemPrompt: 'YouTube keyword researcher. Return only numbered list.', temperature: 0.8, maxTokens: 900 });
      return { type: 'kw', items: parseList(text) };
    });

    // Chapters
    bind('qvhs-c-go', 'qvhs-c-out', async () => {
      const topic = (document.getElementById('qvhs-c-topic').value || '').trim();
      const sections = (document.getElementById('qvhs-c-sections').value || '').trim();
      const dur = parseInt(document.getElementById('qvhs-c-dur').value) || 10;
      if (!topic) throw new Error('Topic daalo');
      const prompt = `Create YouTube chapters / timestamps for a ${dur}-minute video.\nTopic: ${topic}\n${sections ? 'Sections mentioned: ' + sections : ''}\n\nRules:\n- First chapter must be "0:00 Intro" (or Intro variant)\n- Timestamps increasing, last should be < ${dur}:00\n- 6-9 chapters\n- Format exactly: "0:00 Intro", "1:23 Topic name"\n- Real-sounding timings\n\nReturn ONLY the chapter list, one per line. No bullets, no numbers, just timestamps.`;
      const text = await callAI(prompt, { systemPrompt: 'YouTube chapter expert. Return only timestamp lines.', temperature: 0.7, maxTokens: 700 });
      const lines = text.split('\n').map(l => l.trim()).filter(l => /^\d+:\d+/.test(l)).map(l => l.replace(/^[-•*]\s*/, ''));
      return { type: 'chap', lines };
    });

    // Checklist
    const cbtn = document.getElementById('qvhs-check-go');
    if (cbtn) cbtn.addEventListener('click', () => {
      const out = document.getElementById('qvhs-check-out');
      const list = [
        'Main keyword title me pehle 40 chars me hai',
        'Title 45-70 characters ke beech hai',
        'Description me main keyword pehle 150 chars me hai',
        'Description 150+ words ka hai',
        'Timestamp / chapters add kiye (agar 5+ min video)',
        'Tags 400-500 characters ke beech hain',
        '3-5 relevant hashtags add kiye',
        'Thumbnail me 3-5 words ki readable text hai',
        'Thumbnail mobile me test kiya',
        'Custom thumbnail upload kiya (1280x720)',
        'End screen + cards add kiye',
        'Playlist me video add kiya',
        'Pinned comment add kiya',
        'Video category sahi select ki',
        'Language + subtitles check kiye',
        'Monetization friendly content hai (no copyright)'
      ];
      out.innerHTML = `
        <div class="qvhs-result" style="margin-top:12px">
          ${list.map(t => `<div class="qvhs-check"><span class="tick">☐</span><span>${esc(t)}</span></div>`).join('')}
        </div>
        <div class="qvhs-actions-row">
          <button class="qvhs-action" data-act="copy-check"><span class="ico">📋</span>Copy</button>
          <button class="qvhs-action" data-act="print-check"><span class="ico">🖨️</span>Print</button>
          <button class="qvhs-action" data-act="pdf-check"><span class="ico">📄</span>PDF</button>
        </div>
      `;
    });
  }

  function bind(btnId, outId, fn) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const out = document.getElementById(outId);
      out.innerHTML = `<div class="qvhs-loading"><div class="qvhs-spinner"></div>AI soch raha hai...</div>`;
      btn.disabled = true;
      try {
        const res = await fn();
        out.innerHTML = renderResult(res);
      } catch (e) {
        out.innerHTML = `<div class="qvhs-error">❌ ${esc(e.message || 'Something went wrong')}</div>`;
      } finally { btn.disabled = false; }
    });
  }

  function renderResult(res) {
    if (!res) return '';
    if (res.type === 'desc') {
      const len = res.text.length;
      const words = res.text.split(/\s+/).filter(Boolean).length;
      return `
        <div class="qvhs-stat-row"><span>Characters</span><span class="val ${len >= 300 && len <= 5000 ? 'good' : 'warn'}">${len}</span></div>
        <div class="qvhs-stat-row"><span>Words</span><span class="val ${words >= 150 ? 'good' : 'warn'}">${words}</span></div>
        <div class="qvhs-result"><div class="qvhs-result-text" id="qvhs-result-text">${esc(res.text)}</div></div>
        <div class="qvhs-actions-row">
          <button class="qvhs-action" data-act="copy-text" data-target="qvhs-result-text"><span class="ico">📋</span>Copy</button>
          <button class="qvhs-action" data-act="save-script" data-target="qvhs-result-text"><span class="ico">💾</span>Save</button>
          <button class="qvhs-action" data-act="print-text" data-target="qvhs-result-text" data-title="SEO Description"><span class="ico">🖨️</span>Print</button>
        </div>`;
    }
    if (res.type === 'tags') {
      const len = res.text.length;
      const count = res.text.split(',').filter(x => x.trim()).length;
      const tagsHTML = res.text.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="qvhs-tag">${esc(t)}</span>`).join('');
      return `
        <div class="qvhs-stat-row"><span>Tag count</span><span class="val good">${count}</span></div>
        <div class="qvhs-stat-row"><span>Characters</span><span class="val ${len <= 500 ? 'good' : 'bad'}">${len} / 500</span></div>
        <div class="qvhs-result"><div class="qvhs-tags-wrap" id="qvhs-result-text">${tagsHTML}</div></div>
        <div class="qvhs-actions-row">
          <button class="qvhs-action" data-act="copy-text" data-target="qvhs-result-text"><span class="ico">📋</span>Copy</button>
          <button class="qvhs-action" data-act="save-script" data-target="qvhs-result-text"><span class="ico">💾</span>Save</button>
          <button class="qvhs-action" data-act="print-text" data-target="qvhs-result-text" data-title="SEO Tags"><span class="ico">🖨️</span>Print</button>
        </div>`;
    }
    if (res.type === 'hash') {
      const tagsHTML = res.tags.map(t => `<span class="qvhs-tag hash">${esc(t)}</span>`).join('');
      return `
        <div class="qvhs-stat-row"><span>Hashtags</span><span class="val good">${res.tags.length}</span></div>
        <div class="qvhs-result"><div class="qvhs-tags-wrap" id="qvhs-result-text">${tagsHTML}</div></div>
        <div class="qvhs-actions-row">
          <button class="qvhs-action" data-act="copy-text" data-target="qvhs-result-text"><span class="ico">📋</span>Copy</button>
          <button class="qvhs-action" data-act="save-script" data-target="qvhs-result-text"><span class="ico">💾</span>Save</button>
          <button class="qvhs-action" data-act="print-text" data-target="qvhs-result-text" data-title="SEO Hashtags"><span class="ico">🖨️</span>Print</button>
        </div>`;
    }
    if (res.type === 'kw') {
      const itemsHTML = res.items.map(t => `<div class="qvhs-check" style="border:none;padding:6px 0"><span class="tick">🔑</span><span>${esc(t)}</span></div>`).join('');
      return `
        <div class="qvhs-stat-row"><span>Keywords</span><span class="val good">${res.items.length}</span></div>
        <div class="qvhs-result"><div id="qvhs-result-text">${itemsHTML}</div></div>
        <div class="qvhs-actions-row">
          <button class="qvhs-action" data-act="copy-text" data-target="qvhs-result-text"><span class="ico">📋</span>Copy</button>
          <button class="qvhs-action" data-act="save-script" data-target="qvhs-result-text"><span class="ico">💾</span>Save</button>
          <button class="qvhs-action" data-act="print-text" data-target="qvhs-result-text" data-title="SEO Keywords"><span class="ico">🖨️</span>Print</button>
        </div>`;
    }
    if (res.type === 'chap') {
      if (!res.lines.length) return `<div class="qvhs-error">❌ Chapters generate nahi ho paye. Dobara try karo.</div>`;
      const linesHTML = res.lines.map(l => `<div class="qvhs-check" style="border:none;padding:6px 0"><span class="tick">🕐</span><span>${esc(l)}</span></div>`).join('');
      return `
        <div class="qvhs-stat-row"><span>Chapters</span><span class="val good">${res.lines.length}</span></div>
        <div class="qvhs-result"><div id="qvhs-result-text">${linesHTML}</div></div>
        <div class="qvhs-actions-row">
          <button class="qvhs-action" data-act="copy-text" data-target="qvhs-result-text"><span class="ico">📋</span>Copy</button>
          <button class="qvhs-action" data-act="save-script" data-target="qvhs-result-text"><span class="ico">💾</span>Save</button>
          <button class="qvhs-action" data-act="print-text" data-target="qvhs-result-text" data-title="SEO Chapters"><span class="ico">🖨️</span>Print</button>
        </div>`;
    }
    return '';
  }

  /* Delegated events — scoped to SEO Lab only */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (!btn.closest('.qvhs-wrap')) return;
    const act = btn.dataset.act;

    if (act === 'copy-check') {
      const items = Array.from(document.querySelectorAll('#qvhs-check-out .qvhs-check')).map(c => '☐ ' + c.textContent.replace(/^☐\s*/, '').trim());
      copyText(items.join('\n'));
      return;
    }
    if (act === 'copy-text') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      copyText((el.innerText || el.textContent || '').trim());
      return;
    }
    if (act === 'save-script') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      saveToWorkspace((el.innerText || el.textContent || '').trim(), btn.closest('.qvhs-panel')?.dataset.panel || 'seo');
      return;
    }
    if (act === 'print-text') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      printText((el.innerText || el.textContent || '').trim(), btn.dataset.title || 'SEO Lab Report');
      return;
    }
    if (act === 'print-check') {
      const items = Array.from(document.querySelectorAll('#qvhs-check-out .qvhs-check')).map(c => '☐ ' + c.textContent.replace(/^☐\s*/, '').trim());
      printText(items.join('\n'), 'Pre-Upload SEO Checklist');
      return;
    }
    if (act === 'pdf-check') {
      const items = Array.from(document.querySelectorAll('#qvhs-check-out .qvhs-check')).map(c => '☐ ' + c.textContent.replace(/^☐\s*/, '').trim());
      pdfText(items.join('\n'), 'Pre-Upload SEO Checklist');
      return;
    }
  });

  function saveToWorkspace(text, panel) {
    const KEY = 'qvh_workspace_v1';
    let data = { ideas: [], titles: [], scripts: [] };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        data = { ideas: Array.isArray(p.ideas) ? p.ideas : [], titles: Array.isArray(p.titles) ? p.titles : [], scripts: Array.isArray(p.scripts) ? p.scripts : [] };
      }
    } catch (err) {}

    const titleMap = { desc: 'SEO Description', tags: 'SEO Tags', hash: 'SEO Hashtags', kw: 'SEO Keywords', chap: 'SEO Chapters' };
    const title = (titleMap[panel] || 'SEO Item') + ' — ' + new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

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
      .wrap{max-width:720px;margin:0 auto}.brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:3px solid #10b981;margin-bottom:24px}.brand-logo{display:flex;align-items:center;gap:10px}.brand-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;font-size:20px}.brand-name{font-size:22px;font-weight:900;color:#10b981}.brand-meta{font-size:12px;color:${c.text2};text-align:right}
      .doc-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${c.text3};margin-bottom:8px}.big{font-size:20px;font-weight:900;color:${c.text};margin-bottom:22px}.content{background:${c.surface};border:1px solid ${c.border};border-radius:14px;padding:18px 20px;font-size:14px;line-height:1.7;color:${c.text};white-space:pre-wrap;word-break:break-word}
      .footer{margin-top:26px;padding-top:18px;border-top:1px solid ${c.border};text-align:center;font-size:11.5px;color:${c.text3}}
      @media print{body{background:${c.bg} !important;padding:20px 16px}.wrap{max-width:100%}}@page{margin:14mm;size:A4}
    </style></head><body><div class="wrap">
      <div class="brand"><div class="brand-logo"><div class="brand-icon">⚡</div><div class="brand-name">Qunverio</div></div><div class="brand-meta">SEO Lab<br>${now}</div></div>
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
          pdf.save('qunverio-seo-lab.pdf');
          QVH.toast('PDF downloaded ✅', 'success');
        };
        img.src = dataUrl;
      } catch (e) { console.error(e); QVH.toast('PDF failed', 'error'); } finally { if (iframe.parentNode) document.body.removeChild(iframe); }
    }, 900);
  }

  QVH.registerRenderer('seo', render);
  console.log('%c✅ SEO Lab registered', 'color:#10b981;font-weight:bold');
})();