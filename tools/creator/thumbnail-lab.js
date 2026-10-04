/* ============================================================
   QUNVERIO — THUMBNAIL LAB (v1.0)
   Path: tools/creator/thumbnail-lab.js
   AI ideas + text + roast + client-side preview & dimension check
   ============================================================ */

(function () {
  'use strict';
  if (!window.QVH) { console.warn('QVH not loaded — thumbnail-lab.js skipping'); return; }
  const QVH = window.QVH;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function copyText(text) {
    if (!navigator.clipboard) { QVH.toast('Copy not supported', 'error'); return; }
    navigator.clipboard.writeText(text).then(() => QVH.toast('Copied! 📋', 'success')).catch(() => QVH.toast('Copy failed', 'error'));
  }
  async function callAI(prompt, opts) {
    opts = opts || {};
    const body = { prompt, systemPrompt: opts.systemPrompt || '', temperature: opts.temperature != null ? opts.temperature : 0.9, maxTokens: opts.maxTokens || 1500 };
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
      if (t.length > 300) t = t.slice(0, 300);
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
    .qvhtl-wrap { max-width: 720px; margin: 0 auto; }
    .qvhtl-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 12px; scrollbar-width: none; }
    .qvhtl-tabs::-webkit-scrollbar { display: none; }
    .qvhtl-tab { flex: 0 0 auto; padding: 8px 14px; border-radius: 20px; background: var(--surface-2, #1c2250); border: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 12px; font-weight: 700; color: var(--text-2, #a8b0d8); cursor: pointer; white-space: nowrap; transition: all .18s; }
    .qvhtl-tab.active { background: linear-gradient(135deg,#ec4899,#ef4444); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(236,72,153,.35); }
    .qvhtl-panel { display: none; }
    .qvhtl-panel.active { display: block; animation: qvhtl-fade .22s ease; }
    @keyframes qvhtl-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
    .qvhtl-card { background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 14px; padding: 15px; margin-bottom: 12px; }
    .qvhtl-card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; color: var(--text-3, #6b74a0); margin-bottom: 12px; }
    .qvhtl-field { margin-bottom: 12px; }
    .qvhtl-field label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2, #a8b0d8); margin-bottom: 5px; }
    .qvhtl-field input, .qvhtl-field textarea, .qvhtl-field select { width: 100%; padding: 11px 13px; background: var(--surface-2, #1c2250); border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 11px; font-size: 14px; outline: none; color: var(--text, #eef1ff); font-family: inherit; box-sizing: border-box; transition: border-color .18s; }
    .qvhtl-field input:focus, .qvhtl-field textarea:focus, .qvhtl-field select:focus { border-color: #ec4899; box-shadow: 0 0 0 3px rgba(236,72,153,.15); }
    .qvhtl-field textarea { resize: vertical; min-height: 70px; }
    .qvhtl-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 420px) { .qvhtl-row2 { grid-template-columns: 1fr; } }
    .qvhtl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 13px 18px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: transform .15s; }
    .qvhtl-btn:active { transform: scale(.97); }
    .qvhtl-btn-primary { background: linear-gradient(135deg,#ec4899,#ef4444); color: #fff; width: 100%; box-shadow: 0 4px 14px rgba(236,72,153,.35); }
    .qvhtl-loading { text-align: center; padding: 28px 16px; color: var(--text-2, #a8b0d8); font-size: 13px; }
    .qvhtl-spinner { width: 32px; height: 32px; margin: 0 auto 12px; border: 3px solid var(--surface-2, #1c2250); border-top-color: #ec4899; border-radius: 50%; animation: qvhtl-spin .8s linear infinite; }
    @keyframes qvhtl-spin { to { transform: rotate(360deg) } }
    .qvhtl-error { background: rgba(239,68,68,.1); border-left: 3px solid #ef4444; border-radius: 10px; padding: 12px 14px; margin-top: 12px; font-size: 13px; color: #fca5a5; line-height: 1.5; }
    .qvhtl-result { background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 12px; padding: 14px; margin-top: 12px; }
    .qvhtl-result-text { font-size: 13.5px; line-height: 1.65; color: var(--text, #eef1ff); white-space: pre-wrap; word-break: break-word; max-height: 420px; overflow-y: auto; }
    .qvhtl-stat-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12.5px; color: var(--text-2, #a8b0d8); border-bottom: 1px solid var(--border, rgba(255,255,255,0.05)); }
    .qvhtl-stat-row:last-child { border-bottom: none; }
    .qvhtl-stat-row .val { color: var(--text, #eef1ff); font-weight: 700; }
    .qvhtl-stat-row .val.good { color: #10b981; }
    .qvhtl-stat-row .val.warn { color: #f59e0b; }
    .qvhtl-stat-row .val.bad { color: #ef4444; }
    .qvhtl-item { background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 12px; padding: 13px 14px; margin-bottom: 9px; }
    .qvhtl-item-num { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 8px; background: linear-gradient(135deg,#ec4899,#ef4444); color: #fff; font-size: 11px; font-weight: 800; margin-right: 8px; flex-shrink: 0; }
    .qvhtl-item-text { font-size: 13.5px; font-weight: 600; color: var(--text, #eef1ff); line-height: 1.5; margin-bottom: 9px; display: flex; align-items: flex-start; word-break: break-word; }
    .qvhtl-item-actions { display: flex; gap: 5px; flex-wrap: wrap; }
    .qvhtl-item-btn { padding: 6px 10px; border-radius: 7px; background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 11px; font-weight: 700; color: var(--text-2, #a8b0d8); cursor: pointer; }
    .qvhtl-item-btn:hover { background: var(--surface-hover, #232a5e); color: var(--text, #eef1ff); }
    .qvhtl-item-btn.primary { background: linear-gradient(135deg,#ec4899,#ef4444); color: #fff; border-color: transparent; }
    .qvhtl-actions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 12px; }
    .qvhtl-action { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px; border-radius: 10px; background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); font-size: 11px; font-weight: 700; color: var(--text, #eef1ff); cursor: pointer; }
    .qvhtl-action:hover { background: var(--surface-hover, #232a5e); }
    .qvhtl-action .ico { font-size: 15px; }
    .qvhtl-note { font-size: 11.5px; color: var(--text-3, #6b74a0); background: var(--surface-2, #1c2250); border-left: 3px solid #f59e0b; padding: 10px 12px; border-radius: 8px; margin-top: 12px; line-height: 1.55; }

    /* Preview tools */
    .qvhtl-upload {
      display: block;
      border: 2px dashed var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 14px;
      padding: 28px 20px;
      text-align: center;
      cursor: pointer;
      background: var(--surface-2, #1c2250);
      transition: border-color .18s;
    }
    .qvhtl-upload:hover { border-color: #ec4899; }
    .qvhtl-upload input { display: none; }
    .qvhtl-upload .icon { font-size: 40px; display: block; margin-bottom: 8px; opacity: .7; }
    .qvhtl-upload strong { display: block; color: var(--text, #eef1ff); font-size: 14px; margin-bottom: 4px; }
    .qvhtl-upload span { color: var(--text-3, #6b74a0); font-size: 12px; }

    .qvhtl-previews {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
      margin-top: 12px;
    }
    @media (max-width: 480px) { .qvhtl-previews { grid-template-columns: 1fr; } }
    .qvhtl-preview {
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 10px;
      padding: 10px;
    }
    .qvhtl-preview-label {
      font-size: 10.5px; font-weight: 700;
      text-transform: uppercase; letter-spacing: .05em;
      color: var(--text-3, #6b74a0); margin-bottom: 8px;
      display: flex; justify-content: space-between;
    }
    .qvhtl-preview img {
      width: 100%; height: auto; border-radius: 6px; display: block; background: #000;
    }
    .qvhtl-preview .no-img {
      aspect-ratio: 16/9; border-radius: 6px; background: #000;
      display: flex; align-items: center; justify-content: center;
      color: #555; font-size: 11px;
    }
    .qvhtl-clear-btn {
      padding: 7px 12px; border-radius: 9px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      font-size: 11.5px; font-weight: 700;
      color: var(--text-2, #a8b0d8);
      cursor: pointer; margin-top: 10px;
    }
  `;

  function injectCSS() {
    if (document.getElementById('qvhtl-css')) return;
    const s = document.createElement('style');
    s.id = 'qvhtl-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  function render(container) {
    injectCSS();
    container.innerHTML = `
      <div class="qvhtl-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#ec4899,#ef4444)">
          <div class="qvh-th-icon">🖼️</div>
          <div style="flex:1;min-width:0"><h3>Thumbnail Lab</h3><p>AI ideas, text, roast + preview & dimension check</p></div>
        </div>
        <div class="qvhtl-tabs" id="qvhtlTabs">
          <button class="qvhtl-tab active" data-tab="idea">🎨 Idea</button>
          <button class="qvhtl-tab" data-tab="text">📝 Text</button>
          <button class="qvhtl-tab" data-tab="roast">🔥 Roast</button>
          <button class="qvhtl-tab" data-tab="preview">📱 Preview</button>
        </div>
        <div id="qvhtlPanels">
          ${panelIdea()}${panelText()}${panelRoast()}${panelPreview()}
        </div>
        <div class="qvhtl-note">
          ⚠️ <strong>Note:</strong> AI suggestions hain. Thumbnail performance depend karta hai audience, topic aur competition pe. No guaranteed CTR.
        </div>
      </div>`;
    wireTabs(); wirePanels();
  }

  function panelIdea() {
    return `<div class="qvhtl-panel active" data-panel="idea"><div class="qvhtl-card">
      <div class="qvhtl-card-title">Thumbnail Idea Generator</div>
      <div class="qvhtl-field"><label>Video Title / Topic *</label><input type="text" id="qvhtl-i-title" placeholder="e.g. 5 budgeting rules that changed my life" /></div>
      <div class="qvhtl-row2">
        <div class="qvhtl-field"><label>Language</label><select id="qvhtl-i-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
        <div class="qvhtl-field"><label>Niche</label><input type="text" id="qvhtl-i-niche" placeholder="e.g. finance" /></div>
      </div>
      <button class="qvhtl-btn qvhtl-btn-primary" id="qvhtl-i-go">🎨 Generate 5 Ideas</button>
      <div id="qvhtl-i-out"></div>
    </div></div>`;
  }
  function panelText() {
    return `<div class="qvhtl-panel" data-panel="text"><div class="qvhtl-card">
      <div class="qvhtl-card-title">Thumbnail Text Generator</div>
      <div class="qvhtl-field"><label>Video Title / Topic *</label><input type="text" id="qvhtl-t-title" placeholder="e.g. how to save money fast" /></div>
      <div class="qvhtl-field"><label>Language</label><select id="qvhtl-t-lang"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
      <button class="qvhtl-btn qvhtl-btn-primary" id="qvhtl-t-go">📝 Generate Text</button>
      <div id="qvhtl-t-out"></div>
    </div></div>`;
  }
  function panelRoast() {
    return `<div class="qvhtl-panel" data-panel="roast"><div class="qvhtl-card">
      <div class="qvhtl-card-title">Thumbnail Roast 🔥</div>
      <div class="qvhtl-field"><label>Describe Your Thumbnail *</label><textarea id="qvhtl-r-desc" placeholder="Kya dikh raha hai? Text? Face? Colors? Layout?"></textarea></div>
      <div class="qvhtl-field"><label>Video Title</label><input type="text" id="qvhtl-r-title" placeholder="Video ka title (optional)" /></div>
      <button class="qvhtl-btn qvhtl-btn-primary" id="qvhtl-r-go">🔥 Roast It</button>
      <div id="qvhtl-r-out"></div>
    </div></div>`;
  }
  function panelPreview() {
    return `<div class="qvhtl-panel" data-panel="preview"><div class="qvhtl-card">
      <div class="qvhtl-card-title">Preview & Dimension Check</div>
      <label class="qvhtl-upload" for="qvhtl-file">
        <input type="file" id="qvhtl-file" accept="image/*" />
        <span class="icon">🖼️</span>
        <strong>Tap to upload thumbnail</strong>
        <span>JPG / PNG / WebP • Best: 1280×720</span>
      </label>
      <div id="qvhtl-p-out"></div>
    </div></div>`;
  }

  function wireTabs() {
    document.querySelectorAll('.qvhtl-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.qvhtl-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.qvhtl-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
      });
    });
  }

  function wirePanels() {
    bind('qvhtl-i-go', 'qvhtl-i-out', async () => {
      const title = (document.getElementById('qvhtl-i-title').value || '').trim();
      const lang = document.getElementById('qvhtl-i-lang').value;
      const niche = (document.getElementById('qvhtl-i-niche').value || '').trim();
      if (!title) throw new Error('Title daalo');
      const prompt = `Give 5 different thumbnail concept ideas for this YouTube video.\n\nTitle: ${title}\n${niche ? 'Niche: ' + niche : ''}\nLanguage: ${lang}\n\nFor each idea include:\n- Main visual element (face, object, scene)\n- Suggested text overlay (2-4 words)\n- Color scheme recommendation\n- Emotion or expression\n\nFormat each as: "1. [Concept] — Text: [text] | Colors: [colors] | Emotion: [emotion]"\n\nReturn ONLY numbered list 1-5. Language: ${lang}.`;
      const text = await callAI(prompt, { systemPrompt: 'You are a YouTube thumbnail designer. Return only numbered list.', temperature: 0.9, maxTokens: 1200 });
      const items = parseList(text);
      return { type: 'list', items };
    });

    bind('qvhtl-t-go', 'qvhtl-t-out', async () => {
      const title = (document.getElementById('qvhtl-t-title').value || '').trim();
      const lang = document.getElementById('qvhtl-t-lang').value;
      if (!title) throw new Error('Title daalo');
      const prompt = `Generate 10 short punchy thumbnail text options for this YouTube video.\n\nTitle: ${title}\nLanguage: ${lang}\n\nRules:\n- Each text 2-4 words maximum (thumbnail me fit ho sake)\n- Punchy, curiosity-driven\n- Honest, no false clickbait\n- Language: ${lang}\n\nReturn ONLY numbered list 1-10. No extra text.`;
      const text = await callAI(prompt, { systemPrompt: 'You are a YouTube thumbnail text expert. Return only numbered list.', temperature: 0.95, maxTokens: 600 });
      const items = parseList(text);
      return { type: 'list', items };
    });

    bind('qvhtl-r-go', 'qvhtl-r-out', async () => {
      const desc = (document.getElementById('qvhtl-r-desc').value || '').trim();
      const title = (document.getElementById('qvhtl-r-title').value || '').trim();
      if (!desc) throw new Error('Thumbnail describe karo');
      const prompt = `Roast this YouTube thumbnail (honest, constructive, but FUNNY).\n\nThumbnail description: ${desc}\n${title ? 'Video title: ' + title : ''}\n\nStructure:\n## First Impression\n(1 line — what stands out)\n\n## The Roast 🔥\n(3-4 funny but constructive criticisms)\n\n## What Actually Works\n(2-3 positives, if any)\n\n## Fix It Like This\n(3-4 specific actionable suggestions)\n\nRules:\n- Be honest but never mean\n- Funny tone\n- Specific, not generic\n- No fake CTR numbers\n\nReturn ONLY the roast in markdown.`;
      const text = await callAI(prompt, { systemPrompt: 'You are a YouTube thumbnail critic. Honest, funny, constructive. Return only markdown.', temperature: 0.9, maxTokens: 1200 });
      return { type: 'text', text: cleanText(text) };
    });

    // Preview handler
    const fileInput = document.getElementById('qvhtl-file');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const out = document.getElementById('qvhtl-p-out');
            out.innerHTML = renderPreview(img, file);
            // Attach clear button
            const cb = document.getElementById('qvhtl-clear');
            if (cb) cb.addEventListener('click', () => {
              out.innerHTML = '';
              fileInput.value = '';
            });
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
    }
  }

  function bind(btnId, outId, fn) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const out = document.getElementById(outId);
      out.innerHTML = `<div class="qvhtl-loading"><div class="qvhtl-spinner"></div>AI soch raha hai...</div>`;
      btn.disabled = true;
      try {
        const res = await fn();
        out.innerHTML = renderResult(res, outId);
      } catch (e) {
        out.innerHTML = `<div class="qvhtl-error">❌ ${esc(e.message || 'Something went wrong')}</div>`;
      } finally { btn.disabled = false; }
    });
  }

  function renderResult(res, key) {
    if (!res) return '';
    if (res.type === 'text') {
      return `
        <div class="qvhtl-result"><div class="qvhtl-result-text" id="qvhtl-${key}-text">${esc(res.text)}</div></div>
        <div class="qvhtl-actions-row">
          <button class="qvhtl-action" data-act="copy-text" data-target="qvhtl-${key}-text"><span class="ico">📋</span>Copy</button>
          <button class="qvhtl-action" data-act="save-text" data-target="qvhtl-${key}-text"><span class="ico">💾</span>Save</button>
          <button class="qvhtl-action" data-act="print-text" data-target="qvhtl-${key}-text" data-title="Thumbnail Lab"><span class="ico">🖨️</span>Print</button>
        </div>`;
    }
    if (res.type === 'list') {
      const cards = res.items.map((t, i) => `
        <div class="qvhtl-item" data-item="${esc(t)}">
          <div class="qvhtl-item-text"><span class="qvhtl-item-num">${i + 1}</span><span>${esc(t)}</span></div>
          <div class="qvhtl-item-actions">
            <button class="qvhtl-item-btn" data-act="copy-item" data-t="${esc(t)}">📋 Copy</button>
            <button class="qvhtl-item-btn primary" data-act="save-item" data-t="${esc(t)}">💾 Save</button>
          </div>
        </div>`).join('');
      return `
        <div class="qvhtl-stat-row"><span>Total</span><span class="val good">${res.items.length} options</span></div>
        <div style="margin-top:12px" id="qvhtl-${key}-list">${cards}</div>
        <div class="qvhtl-actions-row">
          <button class="qvhtl-action" data-act="copy-all" data-key="${key}"><span class="ico">📋</span>Copy All</button>
          <button class="qvhtl-action" data-act="save-all" data-key="${key}"><span class="ico">💾</span>Save All</button>
          <button class="qvhtl-action" data-act="print-all" data-key="${key}"><span class="ico">🖨️</span>Print</button>
        </div>`;
    }
    return '';
  }

  function renderPreview(img, file) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const ratio = (w / h).toFixed(3);
    const is16x9 = Math.abs((w / h) - (16/9)) < 0.02;
    const isHD = w >= 1280 && h >= 720;
    const sizeKB = (file.size / 1024).toFixed(1);

    // Dimension status
    let dimCls = 'bad';
    let dimMsg = 'Galat dimensions';
    if (is16x9 && isHD) { dimCls = 'good'; dimMsg = 'Perfect! ✅'; }
    else if (is16x9) { dimCls = 'warn'; dimMsg = 'Ratio OK, resolution low'; }
    else { dimCls = 'bad'; dimMsg = 'Not 16:9 ratio — YouTube crop karega'; }

    // Mobile preview width
    const mobileW = 320;
    const mobileH = Math.round(mobileW / (w / h));

    return `
      <div class="qvhtl-stat-row"><span>Dimensions</span><span class="val ${dimCls}">${w} × ${h} (${dimMsg})</span></div>
      <div class="qvhtl-stat-row"><span>Aspect Ratio</span><span class="val ${is16x9 ? 'good' : 'bad'}">${ratio} ${is16x9 ? '(16:9 ✅)' : '(Not 16:9)'}</span></div>
      <div class="qvhtl-stat-row"><span>File Size</span><span class="val ${file.size <= 2 * 1024 * 1024 ? 'good' : 'warn'}">${sizeKB} KB ${file.size <= 2 * 1024 * 1024 ? '(under 2 MB ✅)' : '(over 2 MB limit)'}</span></div>
      <div class="qvhtl-stat-row"><span>YouTube HD</span><span class="val ${isHD ? 'good' : 'warn'}">${isHD ? 'HD ✅' : 'Below 720p'}</span></div>

      <div class="qvhtl-previews">
        <div class="qvhtl-preview">
          <div class="qvhtl-preview-label"><span>📱 Mobile (feed)</span><span>${mobileW}px</span></div>
          <img src="${img.src}" style="width:100%;" alt="" />
        </div>
        <div class="qvhtl-preview">
          <div class="qvhtl-preview-label"><span>🖥️ Desktop</span><span>full</span></div>
          <img src="${img.src}" style="width:100%;" alt="" />
        </div>
      </div>

      <div class="qvhtl-actions-row">
        <button class="qvhtl-action" data-act="copy-report"><span class="ico">📋</span>Copy Info</button>
        <button class="qvhtl-action" data-act="print-report"><span class="ico">🖨️</span>Print</button>
        <button class="qvhtl-action" id="qvhtl-clear"><span class="ico">🗑️</span>Clear</button>
      </div>
    `;
  }

  /* Delegated events */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (!btn.closest('.qvhtl-wrap')) return;
    const act = btn.dataset.act;

    if (act === 'copy-item') { copyText(btn.dataset.t || ''); return; }
    if (act === 'save-item') { saveText(btn.dataset.t || '', 'Thumbnail'); return; }
    if (act === 'copy-text') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      copyText((el.innerText || el.textContent || '').trim());
      return;
    }
    if (act === 'save-text') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      saveText((el.innerText || el.textContent || '').trim(), 'Thumbnail');
      return;
    }
    if (act === 'print-text') {
      const el = document.getElementById(btn.dataset.target);
      if (!el) return;
      printText((el.innerText || el.textContent || '').trim(), btn.dataset.title || 'Thumbnail Lab');
      return;
    }
    if (act === 'copy-all' || act === 'save-all' || act === 'print-all') {
      const list = document.getElementById('qvhtl-' + btn.dataset.key + '-list');
      if (!list) return;
      const items = Array.from(list.querySelectorAll('.qvhtl-item')).map(c => c.dataset.item);
      const text = items.map((x, i) => `${i + 1}. ${x}`).join('\n\n');
      if (act === 'copy-all') copyText(text);
      else if (act === 'save-all') saveText(text, 'Thumbnail');
      else printText(text, 'Thumbnail Lab');
      return;
    }
    if (act === 'copy-report') {
      const rows = Array.from(btn.closest('.qvhtl-card').querySelectorAll('.qvhtl-stat-row')).map(r => r.textContent.trim());
      copyText(rows.join('\n'));
      return;
    }
    if (act === 'print-report') {
      const rows = Array.from(btn.closest('.qvhtl-card').querySelectorAll('.qvhtl-stat-row')).map(r => r.textContent.trim());
      printText(rows.join('\n'), 'Thumbnail Dimension Report');
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
    const title = (kind || 'Thumbnail') + ' — ' + new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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
      .wrap{max-width:720px;margin:0 auto}.brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:3px solid #ec4899;margin-bottom:24px}.brand-logo{display:flex;align-items:center;gap:10px}.brand-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#ec4899,#ef4444);display:flex;align-items:center;justify-content:center;font-size:20px}.brand-name{font-size:22px;font-weight:900;color:#ec4899}.brand-meta{font-size:12px;color:${c.text2};text-align:right}
      .doc-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${c.text3};margin-bottom:8px}.content{background:${c.surface};border:1px solid ${c.border};border-radius:14px;padding:18px 20px;font-size:14px;line-height:1.7;color:${c.text};white-space:pre-wrap;word-break:break-word}
      .footer{margin-top:26px;padding-top:18px;border-top:1px solid ${c.border};text-align:center;font-size:11.5px;color:${c.text3}}
      @media print{body{background:${c.bg} !important;padding:20px 16px}.wrap{max-width:100%}}@page{margin:14mm;size:A4}
    </style></head><body><div class="wrap">
      <div class="brand"><div class="brand-logo"><div class="brand-icon">⚡</div><div class="brand-name">Qunverio</div></div><div class="brand-meta">Thumbnail Lab<br>${now}</div></div>
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

  QVH.registerRenderer('thumbnail', render);
  console.log('%c✅ Thumbnail Lab registered', 'color:#ec4899;font-weight:bold');
})();