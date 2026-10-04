/* ============================================================
   QUNVERIO — CHECKLISTS (v1.0)
   Path: tools/creator/checklists.js
   Ready-made YouTube checklists with progress tracking
   ============================================================ */

(function () {
  'use strict';
  if (!window.QVH) { console.warn('QVH not loaded — checklists.js skipping'); return; }
  const QVH = window.QVH;

  const STORAGE_KEY = 'qvh_checklists_v1';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function loadProgress() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) {}
  }

  const CHECKLISTS = [
    {
      id: 'upload',
      icon: '📤',
      title: 'Video Upload Checklist',
      desc: 'Video upload karne se pehle ye sab check karo',
      color: 'linear-gradient(135deg,#ef4444,#f97316)',
      items: [
        'Title 45-70 characters ke beech hai',
        'Thumbnail 1280×720 upload kiya (custom, HD)',
        'Description 150+ words ki hai',
        'Main keyword title + description me hai',
        'Tags 400-500 characters me add kiye',
        '3-5 relevant hashtags add kiye',
        'End screen + cards add kiye',
        'Timestamps / chapters add kiye (agar 5+ min video)',
        'Video ko sahi playlist me add kiya',
        'Category sahi select ki',
        'Language + subtitles check kiye',
        'Pinned comment add kiya (engagement ke liye)',
        'Monetization friendly content hai',
        'Music / clips copyright free hain',
        'Video 1080p ya higher me upload hui'
      ]
    },
    {
      id: 'thumbnail',
      icon: '🖼️',
      title: 'Thumbnail Checklist',
      desc: 'Thumbnail banate waqt ye dhyan rakho',
      color: 'linear-gradient(135deg,#ec4899,#ef4444)',
      items: [
        'Size: 1280×720 pixels (16:9 ratio)',
        'File under 2 MB hai',
        'Text 3-5 words se zyada nahi',
        'Text mobile pe readable hai',
        'Big face with clear emotion hai',
        'High contrast colors use kiye',
        'Bright, saturated colors hain',
        'Focal point clear hai (ek cheez pe focus)',
        'Background cluttered nahi hai',
        'Brand colors / fonts consistent hain',
        'Mobile pe preview test kiya',
        'Competitor thumbnails se alag dikh raha hai',
        'Clickbait nahi hai — content deliver karega',
        'No small details (mobile pe gayab ho jaate)'
      ]
    },
    {
      id: 'seo',
      icon: '🔍',
      title: 'SEO Checklist',
      desc: 'YouTube search me rank karne ke liye',
      color: 'linear-gradient(135deg,#10b981,#059669)',
      items: [
        'Keyword research ki (search volume check)',
        'Main keyword title ke first 40 chars me hai',
        'Title me emotion / curiosity hai',
        'Description me keyword pehle 150 chars me hai',
        'Description detailed, helpful hai (150+ words)',
        'Tags relevant aur specific hain',
        'Hashtags 3-5 hain (relevant)',
        'Timestamps add kiye (long videos)',
        'Playlist keyword-rich title ke saath hai',
        'Playlist me video add kiya',
        'End screens + cards se related videos link kiye',
        'Subtitles / captions add kiye',
        'Thumbnail alt text quality hai (auto)',
        'Consistent upload schedule maintain kar rahe ho'
      ]
    },
    {
      id: 'channel',
      icon: '📺',
      title: 'Channel Setup Checklist',
      desc: 'Channel pehli baar set karte waqt (one-time)',
      color: 'linear-gradient(135deg,#3b82f6,#6366f1)',
      items: [
        'Channel name clear aur memorable hai',
        'Profile picture 800×800 (brand logo/face)',
        'Channel banner 2560×1440 upload kiya',
        'Channel description 2-3 lines me likhi',
        'Custom URL claim kiya (youtube.com/@handle)',
        'Email verify kiya',
        'Phone number verify kiya (long videos unlock)',
        'Channel keywords add kiye',
        'Links add kiye (Instagram, website, etc.)',
        'Featured video / channel trailer set kiya',
        'Playlists create kiye (3-5 categories)',
        'Default upload settings set kiye',
        'Advanced features enable kiye (YouTube Studio)',
        'Two-factor authentication enable kiya',
        'Comment moderation set kiya'
      ]
    },
    {
      id: 'record',
      icon: '🎬',
      title: 'Recording Checklist',
      desc: 'Shoot karne se pehle',
      color: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
      items: [
        'Script / outline ready hai',
        'Camera fully charged hai',
        'Extra memory card space hai',
        'Audio: mic / lapel set hai',
        'Room soundproof / silent hai',
        'Lighting proper hai (main + fill light)',
        'Camera resolution 1080p ya higher set hai',
        'Frame rate 24/30/60 fps decide kiya',
        'Camera angle / framing set ki',
        'Background clean aur interesting hai',
        'Phone silent pe hai',
        'AC / fan noise off kiya',
        'Backup: dusra device ready hai (agar possible)',
        'Test recording karke audio/video check kiya'
      ]
    },
    {
      id: 'edit',
      icon: '✂️',
      title: 'Editing Checklist',
      desc: 'Video edit karte waqt',
      color: 'linear-gradient(135deg,#14b8a6,#06b6d4)',
      items: [
        'Hook first 5-10 seconds me hai',
        'Unnecessary pauses remove kiye',
        'Jump cuts clean hain',
        'Background music add kiya (low volume)',
        'Audio levels normalized (-6db to -12db)',
        'Color correction / grading ki',
        'Text / captions / titles add kiye',
        'Zoom / pan effects minimal aur purposeful',
        'Transitions smooth hain',
        'B-roll / cutaways add kiye jahan zaroorat ho',
        'Outro + end screen placeholder rakha',
        'Total duration target ke hisaab se hai',
        'Final export 1080p / 4K me kiya',
        'Watched full video end-to-end verify kiya'
      ]
    },
    {
      id: 'monetize',
      icon: '💰',
      title: 'Monetization Checklist',
      desc: 'YPP join karne se pehle',
      color: 'linear-gradient(135deg,#22c55e,#10b981)',
      items: [
        '1,000 subscribers complete kiye',
        '4,000 valid public watch hours (12 months)',
        'Ya 10M Shorts views (90 days)',
        'YouTube Partner Program apply kiya',
        'AdSense account link kiya',
        'Payment info add kiya',
        'Tax info submit kiya',
        'Aadhaar / PAN details verified',
        'Address confirmed (PIN mailer)',
        'Community guidelines follow kiye',
        'No copyright strikes hain',
        'No Community strikes hain',
        'Content advertiser-friendly hai (mostly)',
        'Monetization policies read kiye',
        'Super Thanks, memberships enable kiye'
      ]
    }
  ];

  const CSS = `
    .qvhcl-wrap { max-width: 720px; margin: 0 auto; }
    .qvhcl-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 12px; scrollbar-width: none; }
    .qvhcl-tabs::-webkit-scrollbar { display: none; }
    .qvhcl-tab { flex: 0 0 auto; padding: 8px 14px; border-radius: 20px; background: var(--surface-2, #1c2250); border: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 12px; font-weight: 700; color: var(--text-2, #a8b0d8); cursor: pointer; white-space: nowrap; transition: all .18s; }
    .qvhcl-tab.active { background: linear-gradient(135deg,#f59e0b,#ec4899); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(245,158,11,.35); }
    .qvhcl-panel { display: none; }
    .qvhcl-panel.active { display: block; animation: qvhcl-fade .22s ease; }
    @keyframes qvhcl-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }

    .qvhcl-progress-card {
      background: var(--surface, #151a3d);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .qvhcl-prog-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .qvhcl-prog-label { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--text-3, #6b74a0); }
    .qvhcl-prog-value {
      font-size: 20px; font-weight: 900;
      background: linear-gradient(135deg,#22c55e,#10b981);
      -webkit-background-clip: text; background-clip: text;
      color: transparent; -webkit-text-fill-color: transparent;
    }
    .qvhcl-prog-bar { height: 9px; background: var(--surface-2, #1c2250); border-radius: 20px; overflow: hidden; }
    .qvhcl-prog-fill { height: 100%; background: linear-gradient(135deg,#22c55e,#10b981); border-radius: 20px; transition: width .4s ease; box-shadow: 0 0 10px rgba(34,197,94,.4); }
    .qvhcl-prog-sub { font-size: 11.5px; color: var(--text-3, #6b74a0); margin-top: 8px; text-align: center; }
    .qvhcl-reset { display: inline-block; font-size: 11px; color: #ef4444; cursor: pointer; margin-top: 6px; font-weight: 700; text-decoration: underline; }

    .qvhcl-list { background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 14px; padding: 8px 14px; margin-bottom: 12px; }
    .qvhcl-item {
      display: flex; align-items: flex-start; gap: 11px;
      padding: 11px 0; border-bottom: 1px solid var(--border, rgba(255,255,255,0.05));
      cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent;
      font-size: 13.5px; line-height: 1.5; color: var(--text-2, #a8b0d8);
      transition: color .15s;
    }
    .qvhcl-item:last-child { border-bottom: none; }
    .qvhcl-check {
      width: 21px; height: 21px; border-radius: 7px;
      border: 2px solid var(--border-strong, rgba(255,255,255,0.24));
      background: transparent;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 1px;
      font-size: 12px; color: transparent;
      transition: all .15s;
    }
    .qvhcl-item.checked .qvhcl-check {
      background: linear-gradient(135deg,#22c55e,#10b981);
      border-color: transparent; color: #fff;
    }
    .qvhcl-item.checked { color: var(--text-3, #6b74a0); text-decoration: line-through; text-decoration-color: rgba(107,116,160,.5); }

    .qvhcl-actions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 12px; }
    .qvhcl-action { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 11px 4px; border-radius: 10px; background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); font-size: 11px; font-weight: 700; color: var(--text, #eef1ff); cursor: pointer; }
    .qvhcl-action:hover { background: var(--surface-hover, #232a5e); }
    .qvhcl-action .ico { font-size: 15px; }

    .qvhcl-note { font-size: 11.5px; color: var(--text-3, #6b74a0); background: var(--surface-2, #1c2250); border-left: 3px solid #f59e0b; padding: 10px 12px; border-radius: 8px; margin-top: 12px; line-height: 1.55; }
  `;

  function injectCSS() {
    if (document.getElementById('qvhcl-css')) return;
    const s = document.createElement('style');
    s.id = 'qvhcl-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  let currentTab = 'upload';

  function render(container) {
    injectCSS();
    container.innerHTML = `
      <div class="qvhcl-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#f59e0b,#ec4899)">
          <div class="qvh-th-icon">✅</div>
          <div style="flex:1;min-width:0"><h3>Checklists</h3><p>Ready-made YouTube workflows — tick, save, print</p></div>
        </div>
        <div class="qvhcl-tabs" id="qvhclTabs">
          ${CHECKLISTS.map((c, i) => `
            <button class="qvhcl-tab ${i === 0 ? 'active' : ''}" data-tab="${c.id}">${c.icon} ${c.title.replace(' Checklist', '')}</button>
          `).join('')}
        </div>
        <div id="qvhclPanels">
          ${CHECKLISTS.map((c, i) => renderPanel(c, i === 0)).join('')}
        </div>
        <div class="qvhcl-note">
          ⚠️ <strong>Tip:</strong> Progress automatically save hoti hai. Print/PDF se physical checklist bhi bana sakte ho.
        </div>
      </div>
    `;
    wireTabs();
    wireItems();
  }

  function renderPanel(cl, isActive) {
    const progress = loadProgress();
    const total = cl.items.length;
    const done = cl.items.filter((_, i) => progress[cl.id + '_' + i]).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    return `
      <div class="qvhcl-panel ${isActive ? 'active' : ''}" data-panel="${cl.id}">
        <div class="qvhcl-progress-card">
          <div class="qvhcl-prog-top">
            <div class="qvhcl-prog-label">Progress</div>
            <div class="qvhcl-prog-value">${pct}%</div>
          </div>
          <div class="qvhcl-prog-bar"><div class="qvhcl-prog-fill" style="width:${pct}%"></div></div>
          <div class="qvhcl-prog-sub">
            ${done} / ${total} completed
            ${done > 0 ? `<br><span class="qvhcl-reset" data-cl="${cl.id}">Reset</span>` : ''}
          </div>
        </div>
        <div class="qvhcl-list">
          ${cl.items.map((item, i) => {
            const key = cl.id + '_' + i;
            const checked = !!progress[key];
            return `
              <div class="qvhcl-item ${checked ? 'checked' : ''}" data-key="${key}" data-cl="${cl.id}">
                <div class="qvhcl-check">✓</div>
                <div>${esc(item)}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="qvhcl-actions-row">
          <button class="qvhcl-action" data-act="copy" data-cl="${cl.id}"><span class="ico">📋</span>Copy</button>
          <button class="qvhcl-action" data-act="print" data-cl="${cl.id}"><span class="ico">🖨️</span>Print</button>
          <button class="qvhcl-action" data-act="pdf" data-cl="${cl.id}"><span class="ico">📄</span>PDF</button>
        </div>
      </div>
    `;
  }

  function wireTabs() {
    document.querySelectorAll('.qvhcl-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.qvhcl-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        document.querySelectorAll('.qvhcl-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === currentTab));
      });
    });
  }

  function wireItems() {
    // Tick items
    document.querySelectorAll('.qvhcl-item').forEach(it => {
      it.addEventListener('click', () => {
        const key = it.dataset.key;
        const clId = it.dataset.cl;
        if (!key) return;
        const progress = loadProgress();
        progress[key] = !progress[key];
        if (!progress[key]) delete progress[key];
        saveProgress(progress);
        it.classList.toggle('checked', !!progress[key]);
        updateProgress(clId);
      });
    });

    // Reset links
    document.querySelectorAll('.qvhcl-reset').forEach(r => {
      r.addEventListener('click', (e) => {
        e.stopPropagation();
        const clId = r.dataset.cl;
        if (!confirm('Reset is checklist ka progress?')) return;
        const progress = loadProgress();
        const cl = CHECKLISTS.find(c => c.id === clId);
        if (!cl) return;
        cl.items.forEach((_, i) => delete progress[clId + '_' + i]);
        saveProgress(progress);
        // Re-render current panel
        const panel = document.querySelector(`.qvhcl-panel[data-panel="${clId}"]`);
        if (panel) {
          const wrap = panel.parentElement;
          const newHTML = renderPanel(cl, clId === currentTab);
          const tmp = document.createElement('div');
          tmp.innerHTML = newHTML;
          wrap.replaceChild(tmp.firstElementChild, panel);
          // Re-wire items in this panel
          wrap.querySelector(`.qvhcl-panel[data-panel="${clId}"]`).querySelectorAll('.qvhcl-item').forEach(it => {
            it.addEventListener('click', () => handleItemClick(it));
          });
          wrap.querySelector(`.qvhcl-panel[data-panel="${clId}"]`).querySelectorAll('.qvhcl-reset').forEach(rr => {
            rr.addEventListener('click', (e) => handleReset(e, rr));
          });
          wrap.querySelector(`.qvhcl-panel[data-panel="${clId}"]`).querySelectorAll('.qvhcl-action').forEach(a => {
            a.addEventListener('click', () => handleAction(a));
          });
        }
      });
    });

    // Actions
    document.querySelectorAll('.qvhcl-action').forEach(a => {
      a.addEventListener('click', () => handleAction(a));
    });
  }

  function handleItemClick(it) {
    const key = it.dataset.key;
    const clId = it.dataset.cl;
    if (!key) return;
    const progress = loadProgress();
    progress[key] = !progress[key];
    if (!progress[key]) delete progress[key];
    saveProgress(progress);
    it.classList.toggle('checked', !!progress[key]);
    updateProgress(clId);
  }

  function handleReset(e, r) {
    e.stopPropagation();
    const clId = r.dataset.cl;
    if (!confirm('Reset is checklist ka progress?')) return;
    const progress = loadProgress();
    const cl = CHECKLISTS.find(c => c.id === clId);
    if (!cl) return;
    cl.items.forEach((_, i) => delete progress[clId + '_' + i]);
    saveProgress(progress);
    const panel = document.querySelector(`.qvhcl-panel[data-panel="${clId}"]`);
    if (!panel) return;
    const wrap = panel.parentElement;
    const newHTML = renderPanel(cl, clId === currentTab);
    const tmp = document.createElement('div');
    tmp.innerHTML = newHTML;
    wrap.replaceChild(tmp.firstElementChild, panel);
    const newPanel = wrap.querySelector(`.qvhcl-panel[data-panel="${clId}"]`);
    newPanel.querySelectorAll('.qvhcl-item').forEach(it => it.addEventListener('click', () => handleItemClick(it)));
    newPanel.querySelectorAll('.qvhcl-reset').forEach(rr => rr.addEventListener('click', (e) => handleReset(e, rr)));
    newPanel.querySelectorAll('.qvhcl-action').forEach(a => a.addEventListener('click', () => handleAction(a)));
  }

  function updateProgress(clId) {
    const cl = CHECKLISTS.find(c => c.id === clId);
    if (!cl) return;
    const progress = loadProgress();
    const total = cl.items.length;
    const done = cl.items.filter((_, i) => progress[clId + '_' + i]).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const panel = document.querySelector(`.qvhcl-panel[data-panel="${clId}"]`);
    if (!panel) return;
    const val = panel.querySelector('.qvhcl-prog-value');
    const fill = panel.querySelector('.qvhcl-prog-fill');
    const sub = panel.querySelector('.qvhcl-prog-sub');
    if (val) val.textContent = pct + '%';
    if (fill) fill.style.width = pct + '%';
    if (sub) {
      sub.innerHTML = `${done} / ${total} completed` + (done > 0 ? `<br><span class="qvhcl-reset" data-cl="${clId}">Reset</span>` : '');
      const r = sub.querySelector('.qvhcl-reset');
      if (r) r.addEventListener('click', (e) => handleReset(e, r));
    }
  }

  function handleAction(btn) {
    const act = btn.dataset.act;
    const clId = btn.dataset.cl;
    const cl = CHECKLISTS.find(c => c.id === clId);
    if (!cl) return;
    const progress = loadProgress();

    const lines = cl.items.map((item, i) => {
      const mark = progress[clId + '_' + i] ? '[x]' : '[ ]';
      return `${mark} ${item}`;
    });
    const done = cl.items.filter((_, i) => progress[clId + '_' + i]).length;
    const header = `${cl.icon} ${cl.title}\n${cl.desc}\n\nProgress: ${done}/${cl.items.length}\n` + '-'.repeat(40) + '\n';
    const text = header + lines.join('\n') + '\n' + '-'.repeat(40) + '\nGenerated by Qunverio Creator Hub • qunverio.vercel.app';

    if (act === 'copy') { copyText(text); return; }
    if (act === 'print') { printChecklist(cl, progress); return; }
    if (act === 'pdf') { pdfChecklist(cl, progress); return; }
  }

  function copyText(text) {
    if (!navigator.clipboard) { QVH.toast('Copy not supported', 'error'); return; }
    navigator.clipboard.writeText(text).then(() => QVH.toast('Copied! 📋', 'success')).catch(() => QVH.toast('Copy failed', 'error'));
  }

  function themeColors() {
    const cs = getComputedStyle(document.body);
    function safe(v, fb) { let val = (cs.getPropertyValue(v) || '').trim(); if (!val || val.startsWith('var(') || val.length > 60) return fb; return val; }
    return { bg: safe('--bg', '#0a0e27'), surface: safe('--surface', '#151a3d'), border: safe('--border-strong', 'rgba(255,255,255,0.14)'), text: safe('--text', '#eef1ff'), text2: safe('--text-2', '#a8b0d8'), text3: safe('--text-3', '#6b74a0') };
  }

  function buildChecklistHTML(cl, progress) {
    const c = themeColors();
    const now = new Date().toLocaleString('en-IN');
    const done = cl.items.filter((_, i) => progress[cl.id + '_' + i]).length;
    const total = cl.items.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Qunverio — ${esc(cl.title)}</title><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;background:${c.bg};color:${c.text};padding:40px 32px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .wrap{max-width:720px;margin:0 auto}
      .brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:3px solid #f59e0b;margin-bottom:24px}
      .brand-logo{display:flex;align-items:center;gap:10px}
      .brand-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#f59e0b,#ec4899);display:flex;align-items:center;justify-content:center;font-size:20px}
      .brand-name{font-size:22px;font-weight:900;background:linear-gradient(135deg,#f59e0b,#ec4899);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
      .brand-meta{font-size:12px;color:${c.text2};text-align:right}
      .doc-title{font-size:20px;font-weight:900;color:${c.text};margin-bottom:6px}
      .doc-desc{font-size:13px;color:${c.text2};margin-bottom:22px}
      .prog-card{background:${c.surface};border:1px solid ${c.border};border-radius:14px;padding:16px;margin-bottom:20px}
      .prog-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
      .prog-label{font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:${c.text3}}
      .prog-value{font-size:22px;font-weight:900;color:#10b981}
      .prog-bar{height:10px;background:rgba(255,255,255,.06);border-radius:20px;overflow:hidden}
      .prog-fill{height:100%;background:linear-gradient(135deg,#22c55e,#10b981);border-radius:20px}
      .list{background:${c.surface};border:1px solid ${c.border};border-radius:14px;padding:8px 18px}
      .item{display:flex;gap:11px;align-items:flex-start;padding:12px 0;border-bottom:1px solid ${c.border};font-size:14px;line-height:1.5;color:${c.text2}}
      .item:last-child{border-bottom:none}
      .item.done{color:${c.text3};text-decoration:line-through}
      .item .check{width:20px;height:20px;border-radius:6px;border:2px solid rgba(255,255,255,.24);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;color:transparent;margin-top:1px}
      .item.done .check{background:linear-gradient(135deg,#22c55e,#10b981);border-color:transparent;color:#fff}
      .footer{margin-top:26px;padding-top:18px;border-top:1px solid ${c.border};text-align:center;font-size:11.5px;color:${c.text3}}
      @media print{body{background:${c.bg} !important;padding:20px 16px}.wrap{max-width:100%}}
      @page{margin:14mm;size:A4}
    </style></head><body>
      <div class="wrap">
        <div class="brand">
          <div class="brand-logo"><div class="brand-icon">⚡</div><div class="brand-name">Qunverio</div></div>
          <div class="brand-meta">Checklists<br>${now}</div>
        </div>
        <div class="doc-title">${cl.icon} ${esc(cl.title)}</div>
        <div class="doc-desc">${esc(cl.desc)}</div>
        <div class="prog-card">
          <div class="prog-top">
            <div class="prog-label">Progress</div>
            <div class="prog-value">${pct}%</div>
          </div>
          <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
          <div style="font-size:11.5px;color:${c.text3};margin-top:8px;text-align:center">${done} / ${total} completed</div>
        </div>
        <div class="list">
          ${cl.items.map((item, i) => {
            const checked = !!progress[cl.id + '_' + i];
            return `<div class="item ${checked ? 'done' : ''}"><div class="check">✓</div><div>${esc(item)}</div></div>`;
          }).join('')}
        </div>
        <div class="footer">Generated by <strong style="color:${c.text2};">Qunverio Creator Hub</strong> • qunverio.vercel.app</div>
      </div>
    </body></html>`;
  }

  function printChecklist(cl, progress) {
    const html = buildChecklistHTML(cl, progress);
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => { try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) {} setTimeout(() => { if (iframe.parentNode) document.body.removeChild(iframe); }, 1500); }, 700);
  }

  async function pdfChecklist(cl, progress) {
    QVH.toast('Generating PDF...', '');
    const html = buildChecklistHTML(cl, progress);
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
          pdf.save('qunverio-' + cl.id + '-checklist.pdf');
          QVH.toast('PDF downloaded ✅', 'success');
        };
        img.src = dataUrl;
      } catch (e) { console.error(e); QVH.toast('PDF failed', 'error'); } finally { if (iframe.parentNode) document.body.removeChild(iframe); }
    }, 900);
  }

  QVH.registerRenderer('checklist', render);
  console.log('%c✅ Checklists registered', 'color:#f59e0b;font-weight:bold');
})();