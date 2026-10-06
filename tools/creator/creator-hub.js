/* ============================================================
   QUNVERIO — CREATOR HUB (tools/creator/creator-hub.js) v1.5
   YouTube Creator Dashboard — full-screen overlay
   v1.5: SCROLL FIX — absolute positioning (100% reliable)
   ============================================================ */

(function () {
  'use strict';

  if (window.QVH && window.QVH._loaded) return;

  const QVH = window.QVH || {};
  QVH._loaded = true;
  QVH._version = '1.5.0';

  /* ============================================================
     CSS — Uses ABSOLUTE positioning for guaranteed scroll
     ============================================================ */
  const QVH_CSS = `
    /* ── ROOT: Full screen container ── */
    .qvh-root {
      position: fixed !important;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 9999;
      background: var(--bg, #0a0e27);
      color: var(--text, #eef1ff);
      display: none;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
      -webkit-tap-highlight-color: transparent;
      height: 100vh;
      height: 100dvh;
      width: 100vw;
      width: 100dvw;
    }
    .qvh-root.open { display: block !important; animation: qvh-fade-in .25s ease; }
    @keyframes qvh-fade-in { from { opacity: 0 } to { opacity: 1 } }

    /* ── HEADER: Pinned to top ── */
    .qvh-header {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 62px;
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px;
      background: var(--surface, #151a3d);
      border-bottom: 1px solid var(--border, rgba(255,255,255,0.08));
      z-index: 10;
      box-sizing: border-box;
    }
    .qvh-back {
      width: 38px; height: 38px; border-radius: 10px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; color: var(--text, #eef1ff);
      cursor: pointer; flex-shrink: 0;
    }
    .qvh-back:active { transform: scale(.94); }
    .qvh-header-title { flex: 1; min-width: 0; }
    .qvh-header-title h2 {
      font-size: 15px; font-weight: 800; margin: 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .qvh-header-title p {
      font-size: 11.5px; color: var(--text-3, #6b74a0); margin: 2px 0 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .qvh-header-badge {
      padding: 4px 9px; border-radius: 20px;
      background: linear-gradient(135deg,#ff0000,#ec4899);
      color: #fff; font-size: 10.5px; font-weight: 800;
      letter-spacing: .04em; flex-shrink: 0;
    }

    /* ── BODY: Pinned between header and nav, scrolls independently ── */
    .qvh-body {
      position: absolute;
      top: 62px;
      left: 0; right: 0;
      bottom: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      padding: 18px 16px 100px;
      box-sizing: border-box;
    }

    /* ── BOTTOM NAV: Pinned to bottom ── */
    .qvh-bottom-nav {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      display: flex;
      background: var(--surface, #151a3d);
      border-top: 1px solid var(--border, rgba(255,255,255,0.08));
      padding: 8px 4px;
      padding-bottom: calc(8px + env(safe-area-inset-bottom));
      z-index: 10;
      overflow-x: auto;
      scrollbar-width: none;
      box-sizing: border-box;
    }
    .qvh-bottom-nav::-webkit-scrollbar { display: none; }
    .qvh-bn-item {
      flex: 1 0 auto; min-width: 62px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 3px; padding: 6px 8px;
      border-radius: 10px;
      font-size: 10px; font-weight: 700;
      color: var(--text-3, #6b74a0);
      cursor: pointer; background: none; border: none;
      transition: color .2s;
    }
    .qvh-bn-item .qvh-bn-icon { font-size: 17px; line-height: 1; }
    .qvh-bn-item.active { color: var(--primary, #6366f1); }

    /* ── HERO ── */
    .qvh-hero { text-align: center; padding: 8px 0 20px; }
    .qvh-hero-icon {
      width: 68px; height: 68px; border-radius: 20px;
      background: linear-gradient(135deg,#ff0000,#ec4899);
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 32px; box-shadow: 0 10px 30px rgba(255,0,0,0.35);
      margin-bottom: 12px;
    }
    .qvh-hero h1 {
      font-size: clamp(20px, 5.5vw, 28px);
      font-weight: 900; margin: 0 0 6px; letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .qvh-hero h1 .qvh-grad {
      background: linear-gradient(135deg,#ff0000,#ec4899);
      -webkit-background-clip: text; background-clip: text;
      color: transparent; -webkit-text-fill-color: transparent;
    }
    .qvh-hero p {
      color: var(--text-2, #a8b0d8); font-size: 13px;
      max-width: 480px; margin: 0 auto 4px; line-height: 1.55;
    }

    .qvh-section-title {
      font-size: 12px; font-weight: 800;
      text-transform: uppercase; letter-spacing: .08em;
      color: var(--text-3, #6b74a0);
      margin: 18px 0 10px;
    }

    /* ── GRID & CARDS ── */
    .qvh-grid {
      display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 11px;
    }
    @media (min-width: 560px) { .qvh-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (min-width: 900px) { .qvh-grid { grid-template-columns: repeat(4, 1fr); } }

    .qvh-card {
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 16px; padding: 15px;
      cursor: pointer; display: flex; flex-direction: column; gap: 9px;
      position: relative; overflow: hidden;
      transition: transform .22s cubic-bezier(.34,1.4,.64,1), box-shadow .22s, border-color .22s;
      min-height: 148px; text-align: left;
    }
    .qvh-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--qvh-card-grad, linear-gradient(135deg,#6366f1,#8b5cf6));
      opacity: 0; transition: opacity .25s;
    }
    .qvh-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.4);
      border-color: var(--border-strong, rgba(255,255,255,0.14));
    }
    .qvh-card:hover::before { opacity: 1; }
    .qvh-card:active { transform: scale(.98); }
    .qvh-card-icon {
      width: 46px; height: 46px; border-radius: 13px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; color: #fff;
      box-shadow: 0 6px 16px rgba(0,0,0,0.25);
      flex-shrink: 0;
      background: var(--qvh-card-grad, linear-gradient(135deg,#6366f1,#8b5cf6));
    }
    .qvh-card-name {
      font-size: 14px; font-weight: 800; line-height: 1.25;
      color: var(--text, #eef1ff);
    }
    .qvh-card-desc {
      font-size: 11.5px; color: var(--text-3, #6b74a0);
      line-height: 1.4; flex: 1;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .qvh-card-tag {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 10.5px; font-weight: 700;
      padding: 3px 8px; border-radius: 20px;
      background: var(--surface-2, #1c2250);
      color: var(--text-2, #a8b0d8);
      align-self: flex-start; margin-top: auto;
    }
    .qvh-card-tag.ready { background: rgba(16,185,129,0.15); color: #10b981; }
    .qvh-card-tag.soon { background: rgba(245,158,11,0.15); color: #f59e0b; }

    .qvh-tool-wrap { max-width: 720px; margin: 0 auto; }
    .qvh-tool-header {
      display: flex; align-items: center; gap: 11px;
      padding: 14px;
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 14px; margin-bottom: 14px;
    }
    .qvh-tool-header .qvh-th-icon {
      width: 42px; height: 42px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; color: #fff;
      background: var(--qvh-card-grad, linear-gradient(135deg,#6366f1,#8b5cf6));
      flex-shrink: 0;
    }
    .qvh-tool-header h3 {
      font-size: 15px; font-weight: 800; margin: 0 0 2px; line-height: 1.3;
    }
    .qvh-tool-header p {
      font-size: 12px; color: var(--text-3, #6b74a0); margin: 0; line-height: 1.4;
    }
    .qvh-placeholder {
      text-align: center; padding: 44px 22px;
      background: var(--surface, #151a3d);
      border: 1.5px dashed var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 16px;
      color: var(--text-3, #6b74a0); font-size: 13px; line-height: 1.6;
    }
    .qvh-placeholder .qvh-ph-emoji {
      font-size: 40px; margin-bottom: 10px; display: block; opacity: .7;
    }
    .qvh-placeholder strong {
      display: block; color: var(--text-2, #a8b0d8);
      font-size: 14.5px; margin-bottom: 4px;
    }

    /* ── DESKTOP: Sidebar + Shifted content ── */
    .qvh-sidebar { display: none; }
    @media (min-width: 900px) {
      .qvh-sidebar {
        display: flex; flex-direction: column;
        position: absolute;
        top: 0; left: 0; bottom: 0;
        width: 240px;
        background: var(--surface, #151a3d);
        border-right: 1px solid var(--border, rgba(255,255,255,0.08));
        padding: 14px 10px;
        overflow-y: auto;
        z-index: 20;
        box-sizing: border-box;
      }
      .qvh-sidebar .qvh-sb-brand {
        display: flex; align-items: center; gap: 9px;
        padding: 10px 8px 16px;
        border-bottom: 1px solid var(--border, rgba(255,255,255,0.08));
        margin-bottom: 12px;
      }
      .qvh-sidebar .qvh-sb-brand .qvh-sb-icon {
        width: 34px; height: 34px; border-radius: 10px;
        background: linear-gradient(135deg,#ff0000,#ec4899);
        display: flex; align-items: center; justify-content: center;
        font-size: 17px;
      }
      .qvh-sidebar .qvh-sb-brand h3 { font-size: 14px; font-weight: 800; margin: 0; }
      .qvh-sidebar .qvh-sb-brand p { font-size: 10.5px; color: var(--text-3, #6b74a0); margin: 1px 0 0; }
      .qvh-sb-item {
        display: flex; align-items: center; gap: 11px;
        padding: 10px 11px; border-radius: 10px;
        font-size: 13px; font-weight: 600;
        color: var(--text-2, #a8b0d8);
        cursor: pointer; background: none; border: none;
        text-align: left; width: 100%; margin-bottom: 2px;
        transition: background .18s, color .18s;
      }
      .qvh-sb-item:hover { background: var(--surface-hover, #232a5e); color: var(--text, #eef1ff); }
      .qvh-sb-item.active {
        background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(236,72,153,0.18));
        color: var(--text, #eef1ff);
      }
      .qvh-sb-item .qvh-sb-icon { font-size: 17px; width: 22px; text-align: center; }

      /* Shift header, body, nav right by sidebar width */
      .qvh-header { left: 240px; }
      .qvh-body   { left: 240px; padding-bottom: 40px; }
      .qvh-bottom-nav { display: none; }
    }

    /* ── TOAST ── */
    .qvh-toast {
      position: fixed; bottom: 100px; left: 50%;
      transform: translateX(-50%) translateY(120px);
      background: var(--surface, #151a3d);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      color: var(--text, #eef1ff);
      padding: 11px 18px; border-radius: 12px;
      font-size: 13px; font-weight: 600;
      z-index: 10001; transition: transform .35s;
      max-width: 88vw; text-align: center;
      box-shadow: 0 12px 32px rgba(0,0,0,0.45);
      pointer-events: none;
    }
    .qvh-toast.show { transform: translateX(-50%) translateY(0); }
  `;

  function injectCSS() {
    if (document.getElementById('qvh-css')) return;
    const style = document.createElement('style');
    style.id = 'qvh-css';
    style.textContent = QVH_CSS;
    document.head.appendChild(style);
  }

  /* ============================================================
     CATEGORIES — Vivid distinct colors
     ============================================================ */
  const QVH_CATEGORIES = [
    { id: 'idea',      icon: '💡', name: 'Idea Lab',      desc: 'Video ideas, viral topics, series planner', grad: 'linear-gradient(135deg,#fbbf24,#f59e0b)', ready: true },
    { id: 'title',     icon: '📝', name: 'Title Lab',     desc: 'AI titles, CTR score, A/B variations',       grad: 'linear-gradient(135deg,#a78bfa,#7c3aed)', ready: true },
    { id: 'thumbnail', icon: '🖼️', name: 'Thumbnail Lab', desc: 'Text ideas, analyzer, mobile preview',       grad: 'linear-gradient(135deg,#f472b6,#db2777)', ready: true },
    { id: 'script',    icon: '🎬', name: 'Script Lab',    desc: 'Hooks, full scripts, story structure',       grad: 'linear-gradient(135deg,#818cf8,#4f46e5)', ready: true },
    { id: 'seo',       icon: '🔍', name: 'SEO Lab',       desc: 'Description, tags, hashtags, chapters',      grad: 'linear-gradient(135deg,#34d399,#059669)', ready: true },
    { id: 'analytics', icon: '📊', name: 'Analytics',     desc: 'Channel, video & competitor analysis',       grad: 'linear-gradient(135deg,#22d3ee,#0284c7)', ready: true },
    { id: 'coach',     icon: '🤖', name: 'AI Coach',      desc: 'Ask anything about your channel',            grad: 'linear-gradient(135deg,#f472b6,#8b5cf6)', ready: true },
    { id: 'community', icon: '💬', name: 'Community',     desc: 'Posts, polls, replies, comments',            grad: 'linear-gradient(135deg,#2dd4bf,#0891b2)', ready: true },
    { id: 'money',     icon: '💰', name: 'Monetization',  desc: 'Revenue, CPM, RPM, sponsorship rates',       grad: 'linear-gradient(135deg,#4ade80,#16a34a)', ready: true },
    { id: 'workspace', icon: '📁', name: 'Workspace',     desc: 'Idea vault, script vault, calendar',         grad: 'linear-gradient(135deg,#60a5fa,#2563eb)', ready: true },
    { id: 'roadmap',   icon: '🗺️', name: 'Roadmap',       desc: 'Beginner to pro YouTube journey',            grad: 'linear-gradient(135deg,#fb923c,#c2410c)', ready: true },
    { id: 'checklist', icon: '✅', name: 'Checklists',    desc: 'Upload, SEO, thumbnail & channel setup',     grad: 'linear-gradient(135deg,#facc15,#eab308)', ready: true },
    { id: 'coming',    icon: '🚀', name: 'Coming Soon',   desc: 'Instagram, TikTok, Facebook, X',             grad: 'linear-gradient(135deg,#94a3b8,#475569)', ready: false, tag: 'Soon' }
  ];

  const state = { open: false, currentCategory: null };
  let rootEl = null;

  function buildShell() {
    if (rootEl) return rootEl;
    rootEl = document.createElement('div');
    rootEl.className = 'qvh-root';
    rootEl.id = 'qvhRoot';
    rootEl.setAttribute('role', 'dialog');
    rootEl.setAttribute('aria-modal', 'true');
    rootEl.innerHTML = `
      <aside class="qvh-sidebar" id="qvhSidebar">
        <div class="qvh-sb-brand">
          <div class="qvh-sb-icon">🎬</div>
          <div><h3>Creator Hub</h3><p>YouTube Toolkit</p></div>
        </div>
        <div id="qvhSbItems"></div>
      </aside>
      <header class="qvh-header">
        <button class="qvh-back" id="qvhBackBtn" aria-label="Back">←</button>
        <div class="qvh-header-title">
          <h2 id="qvhHeaderTitle">YouTube Creator Hub</h2>
          <p id="qvhHeaderSub">Your YouTube command center</p>
        </div>
        <span class="qvh-header-badge">BETA</span>
      </header>
      <div class="qvh-body" id="qvhBody"></div>
      <nav class="qvh-bottom-nav" id="qvhBottomNav"></nav>
    `;
    document.body.appendChild(rootEl);
    return rootEl;
  }

  function renderBottomNav() {
    const el = document.getElementById('qvhBottomNav');
    if (!el) return;
    const items = [
      { id: 'home', icon: '🏠', label: 'Home' },
      { id: 'idea', icon: '💡', label: 'Idea' },
      { id: 'title', icon: '📝', label: 'Title' },
      { id: 'script', icon: '🎬', label: 'Script' },
      { id: 'seo', icon: '🔍', label: 'SEO' },
      { id: 'analytics', icon: '📊', label: 'Analyze' },
      { id: 'coach', icon: '🤖', label: 'Coach' }
    ];
    el.innerHTML = items.map(it => `
      <button class="qvh-bn-item ${state.currentCategory === it.id || (it.id === 'home' && !state.currentCategory) ? 'active' : ''}" data-qvh-nav="${it.id}">
        <span class="qvh-bn-icon">${it.icon}</span>
        <span>${it.label}</span>
      </button>
    `).join('');
    el.querySelectorAll('[data-qvh-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.qvhNav;
        if (id === 'home') renderHome();
        else openCategory(id);
      });
    });
  }

  function renderSidebar() {
    const el = document.getElementById('qvhSbItems');
    if (!el) return;
    el.innerHTML = `
      <button class="qvh-sb-item ${!state.currentCategory ? 'active' : ''}" data-qvh-sb="home">
        <span class="qvh-sb-icon">🏠</span> Dashboard
      </button>
      ${QVH_CATEGORIES.map(c => `
        <button class="qvh-sb-item ${state.currentCategory === c.id ? 'active' : ''}" data-qvh-sb="${c.id}">
          <span class="qvh-sb-icon">${c.icon}</span> ${c.name}
        </button>
      `).join('')}
    `;
    el.querySelectorAll('[data-qvh-sb]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.qvhSb;
        if (id === 'home') renderHome();
        else openCategory(id);
      });
    });
  }

  function renderHome() {
    state.currentCategory = null;
    setHeader('YouTube Creator Hub', 'Your YouTube command center');
    const body = document.getElementById('qvhBody');
    if (!body) return;
    body.innerHTML = `
      <div class="qvh-hero">
        <div class="qvh-hero-icon">🎬</div>
        <h1>Your <span class="qvh-grad">YouTube Command Center</span></h1>
        <p>Idea se growth tak — saare tools ek jagah. AI-powered, free, aur India ke creators ke liye banaya gaya.</p>
      </div>
      <div class="qvh-section-title">All Modules</div>
      <div class="qvh-grid">
        ${QVH_CATEGORIES.map(c => `
          <button class="qvh-card" data-qvh-cat="${c.id}" style="--qvh-card-grad:${c.grad}">
            <div class="qvh-card-icon">${c.icon}</div>
            <div class="qvh-card-name">${c.name}</div>
            <div class="qvh-card-desc">${c.desc}</div>
            <span class="qvh-card-tag ${c.ready ? 'ready' : 'soon'}">
              ${c.ready ? '● Ready' : (c.tag || '○ Coming Soon')}
            </span>
          </button>
        `).join('')}
      </div>
    `;
    body.querySelectorAll('[data-qvh-cat]').forEach(card => {
      card.addEventListener('click', () => openCategory(card.dataset.qvhCat));
    });
    renderBottomNav();
    renderSidebar();
    body.scrollTop = 0;
  }

  function openCategory(catId) {
    const cat = QVH_CATEGORIES.find(c => c.id === catId);
    if (!cat) return;
    state.currentCategory = catId;
    setHeader(cat.name, cat.desc);
    const renderer = QVH._renderers && QVH._renderers[catId];
    if (renderer) renderer(document.getElementById('qvhBody'), cat);
    else renderPlaceholder(cat);
    renderBottomNav();
    renderSidebar();
    const body = document.getElementById('qvhBody');
    if (body) body.scrollTop = 0;
  }

  function renderPlaceholder(cat) {
    const body = document.getElementById('qvhBody');
    if (!body) return;
    body.innerHTML = `
      <div class="qvh-tool-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:${cat.grad}">
          <div class="qvh-th-icon">${cat.icon}</div>
          <div style="flex:1;min-width:0">
            <h3>${cat.name}</h3>
            <p>${cat.desc}</p>
          </div>
        </div>
        <div class="qvh-placeholder">
          <span class="qvh-ph-emoji">🚧</span>
          <strong>Coming soon</strong>
          Ye module abhi banaya ja raha hai.<br>
          Aap wapas jaakar doosre modules explore kar sakte hain.
        </div>
      </div>
    `;
    body.scrollTop = 0;
  }

  function setHeader(title, sub) {
    const t = document.getElementById('qvhHeaderTitle');
    const s = document.getElementById('qvhHeaderSub');
    if (t) t.textContent = title;
    if (s) s.textContent = sub || '';
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */
  QVH.openHub = function () {
    injectCSS();
    buildShell();
    rootEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    state.open = true;
    renderHome();
  };

  QVH.closeHub = function () {
    if (!rootEl) return;
    rootEl.classList.remove('open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    state.open = false;
  };

  QVH.openCategory = function (catId) {
    openCategory(catId);
  };

  document.addEventListener('click', (e) => {
    if (e.target.closest('#qvhBackBtn')) {
      if (state.currentCategory) renderHome();
      else QVH.closeHub();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!state.open) return;
    if (e.key === 'Escape') {
      if (state.currentCategory) renderHome();
      else QVH.closeHub();
    }
  });

  QVH._renderers = QVH._renderers || {};
  QVH.registerRenderer = function (categoryId, renderFn) {
    QVH._renderers[categoryId] = renderFn;
  };

  QVH.getCategories = function () { return QVH_CATEGORIES.slice(); };

  QVH.toast = function (msg, type) {
    if (typeof window.toast === 'function') {
      try { window.toast(msg, type || ''); return; } catch (_) {}
    }
    let t = document.getElementById('qvhLocalToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'qvhLocalToast';
      t.className = 'qvh-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2400);
  };

  console.log('%c✅ Creator Hub loaded (v' + QVH._version + ')', 'color:#ff0000;font-weight:bold;font-size:13px');

  window.QVH = QVH;

})();