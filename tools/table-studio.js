/* ============================================================
   QUNVERIO — TABLE STUDIO (v1.0)
   Path: tools/table-studio.js
   Excel-style table editor with HD PNG, PDF, Print export
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     STATE
     ============================================================ */
  const state = {
    rows: 5,
    cols: 4,
    data: [],           // 2D array of cell objects
    title: 'My Table',
    subtitle: '',
    theme: 'modern',
    selectedCells: [],
    history: [],
    historyIndex: -1,
    isExporting: false
  };

  /* ============================================================
     HELPERS
     ============================================================ */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function toast(msg, type) {
    if (typeof window.toast === 'function') {
      try { window.toast(msg, type || ''); return; } catch (_) {}
    }
    // fallback
    let t = document.getElementById('qvts-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'qvts-toast';
      t.className = 'qvts-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ============================================================
     DEFAULT DATA
     ============================================================ */
  function createEmptyCell() {
    return {
      text: '',
      bold: false,
      italic: false,
      underline: false,
      align: 'left',
      valign: 'middle',
      fontFamily: '',
      fontSize: '',
      textColor: '',
      bgColor: '',
      colSpan: 1,
      rowSpan: 1
    };
  }

  function createEmptyTable(rows, cols) {
    const d = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(createEmptyCell());
      d.push(row);
    }
    return d;
  }

  function createSampleTable() {
    const d = createEmptyTable(5, 4);
    // Header
    d[0][0].text = 'Product';   d[0][0].bold = true;
    d[0][1].text = 'Price';     d[0][1].bold = true;
    d[0][2].text = 'Quantity';  d[0][2].bold = true;
    d[0][3].text = 'Total';     d[0][3].bold = true;
    // Rows
    const rows = [
      ['Notebook', '50', '2', '100'],
      ['Pen',      '10', '5', '50'],
      ['Bag',      '800', '1', '800'],
      ['Bottle',   '250', '2', '500']
    ];
    rows.forEach((r, i) => {
      r.forEach((v, j) => { d[i + 1][j].text = v; });
    });
    return d;
  }

  /* ============================================================
     CSS — Scoped with .qvts- prefix
     ============================================================ */
  const CSS = `
    .qvts-wrap { max-width: 1100px; margin: 0 auto; padding-bottom: 120px; }
    .qvts-wrap * { box-sizing: border-box; }

    /* ── TOP CONTROLS ── */
    .qvts-card {
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .qvts-card-title {
      font-size: 12px; font-weight: 800;
      text-transform: uppercase; letter-spacing: .07em;
      color: var(--text-3, #6b74a0);
      margin-bottom: 10px;
    }

    /* ── TITLE/SUBTITLE INPUTS ── */
    .qvts-title-input {
      width: 100%;
      padding: 11px 13px;
      background: var(--surface-2, #1c2250);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 11px;
      font-size: 18px; font-weight: 800;
      outline: none; color: var(--text, #eef1ff);
      font-family: inherit;
      margin-bottom: 8px;
      transition: border-color .18s;
    }
    .qvts-subtitle-input {
      width: 100%;
      padding: 9px 13px;
      background: var(--surface-2, #1c2250);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 11px;
      font-size: 14px;
      outline: none; color: var(--text-2, #a8b0d8);
      font-family: inherit;
      transition: border-color .18s;
    }
    .qvts-title-input:focus, .qvts-subtitle-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,.15);
    }

    /* ── TOOLBAR ── */
    .qvts-toolbar {
      display: flex; flex-wrap: wrap; gap: 6px;
      align-items: center;
      padding: 10px;
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 12px;
      margin-bottom: 10px;
    }
    .qvts-toolbar-group {
      display: flex; gap: 4px;
      padding-right: 8px;
      border-right: 1px solid var(--border, rgba(255,255,255,0.08));
    }
    .qvts-toolbar-group:last-child { border-right: none; padding-right: 0; }
    .qvts-tb-btn {
      min-width: 32px; height: 32px;
      padding: 0 8px;
      display: inline-flex; align-items: center; justify-content: center;
      gap: 4px;
      border-radius: 8px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      color: var(--text, #eef1ff);
      font-size: 13px; font-weight: 700;
      cursor: pointer;
      transition: background .15s, transform .15s;
      white-space: nowrap;
    }
    .qvts-tb-btn:hover { background: var(--surface-hover, #232a5e); }
    .qvts-tb-btn:active { transform: scale(.94); }
    .qvts-tb-btn.active {
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      color: #fff;
      border-color: transparent;
    }
    .qvts-tb-btn.danger { color: #fca5a5; }
    .qvts-tb-btn.danger:hover { background: rgba(239,68,68,.15); }

    /* ── TAB SWITCHER ── */
    .qvts-tabs {
      display: flex; gap: 6px;
      padding: 6px;
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 12px;
      margin-bottom: 12px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .qvts-tabs::-webkit-scrollbar { display: none; }
    .qvts-tab {
      flex: 1 0 auto; min-width: 90px;
      padding: 10px 14px;
      border-radius: 9px;
      background: transparent;
      border: none;
      color: var(--text-2, #a8b0d8);
      font-size: 13px; font-weight: 700;
      cursor: pointer;
      transition: background .18s, color .18s;
    }
    .qvts-tab.active {
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      color: #fff;
    }

    /* ── TABLE EDITOR ── */
    .qvts-table-scroll {
      overflow-x: auto;
      overflow-y: auto;
      max-width: 100%;
      border-radius: 12px;
      background: var(--surface-2, #1c2250);
      padding: 12px;
    }
    .qvts-table {
      border-collapse: collapse;
      background: #ffffff;
      color: #111827;
      min-width: 100%;
      table-layout: auto;
    }
    .qvts-table td {
      min-width: 80px;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      font-size: 14px;
      outline: none;
      cursor: cell;
      vertical-align: middle;
      transition: background .15s;
      word-break: break-word;
      min-height: 40px;
    }
    .qvts-table td:focus {
      background: #eef2ff;
      box-shadow: inset 0 0 0 2px #6366f1;
    }
    .qvts-table td.qvts-selected {
      background: #dbeafe !important;
      box-shadow: inset 0 0 0 2px #2563eb;
    }
    .qvts-table td.qvts-header {
      background: #f3f4f6;
      font-weight: 700;
    }

    /* ── SIDE PANEL (Formatting) ── */
    .qvts-panel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 10px;
    }
    .qvts-field { display: flex; flex-direction: column; gap: 5px; }
    .qvts-field label {
      font-size: 11.5px; font-weight: 600;
      color: var(--text-2, #a8b0d8);
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .qvts-field input[type="text"],
    .qvts-field input[type="number"],
    .qvts-field select {
      padding: 9px 11px;
      background: var(--surface-2, #1c2250);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 10px;
      font-size: 13.5px;
      color: var(--text, #eef1ff);
      outline: none;
      font-family: inherit;
    }
    .qvts-field input[type="color"] {
      width: 100%; height: 38px;
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 10px;
      background: var(--surface-2, #1c2250);
      cursor: pointer;
      padding: 2px;
    }

    /* ── TEMPLATES GRID ── */
    .qvts-templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }
    .qvts-template {
      background: var(--surface-2, #1c2250);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 12px;
      padding: 12px;
      text-align: center;
      cursor: pointer;
      transition: transform .15s, border-color .15s;
    }
    .qvts-template:hover {
      transform: translateY(-2px);
      border-color: #6366f1;
    }
    .qvts-template-icon {
      font-size: 26px; margin-bottom: 6px;
    }
    .qvts-template-name {
      font-size: 12.5px; font-weight: 700;
      color: var(--text, #eef1ff);
    }

    /* ── PREVIEW PANEL ── */
    .qvts-preview-wrap {
      background: #ffffff;
      color: #111827;
      padding: 24px;
      border-radius: 12px;
      overflow-x: auto;
    }
    .qvts-preview-title {
      font-size: 22px; font-weight: 900;
      margin-bottom: 4px; color: #111827;
    }
    .qvts-preview-subtitle {
      font-size: 13px; color: #6b7280;
      margin-bottom: 14px;
    }
    .qvts-preview-table {
      border-collapse: collapse;
      width: 100%;
    }
    .qvts-preview-table td {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      font-size: 14px;
      vertical-align: middle;
      word-break: break-word;
    }

    /* ── EXPORT BUTTONS ── */
    .qvts-export-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }
    .qvts-export-btn {
      padding: 14px;
      border-radius: 12px;
      background: var(--surface-2, #1c2250);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      color: var(--text, #eef1ff);
      font-size: 13px; font-weight: 700;
      cursor: pointer;
      display: flex; flex-direction: column;
      align-items: center; gap: 6px;
      transition: transform .15s, background .18s;
    }
    .qvts-export-btn:hover {
      background: var(--surface-hover, #232a5e);
      transform: translateY(-2px);
    }
    .qvts-export-btn .ico { font-size: 22px; }
    .qvts-export-btn:disabled {
      opacity: 0.5; cursor: not-allowed;
      transform: none;
    }

    /* ── LOADING ── */
    .qvts-loading {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 14px;
      z-index: 99999;
      color: #fff;
    }
    .qvts-spinner {
      width: 44px; height: 44px;
      border: 4px solid rgba(255,255,255,0.15);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: qvts-spin .8s linear infinite;
    }
    @keyframes qvts-spin { to { transform: rotate(360deg); } }

    /* ── TOAST ── */
    .qvts-toast {
      position: fixed; bottom: 100px; left: 50%;
      transform: translateX(-50%) translateY(120px);
      background: var(--surface, #151a3d);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      color: var(--text, #eef1ff);
      padding: 11px 18px;
      border-radius: 12px;
      font-size: 13px; font-weight: 600;
      z-index: 100001;
      transition: transform .35s;
      max-width: 88vw;
      text-align: center;
      box-shadow: 0 12px 32px rgba(0,0,0,0.45);
      pointer-events: none;
    }
    .qvts-toast.show { transform: translateX(-50%) translateY(0); }

    /* ── MOBILE ── */
    @media (max-width: 640px) {
      .qvts-toolbar { gap: 4px; padding: 8px; }
      .qvts-tb-btn { min-width: 30px; height: 30px; font-size: 12px; padding: 0 6px; }
      .qvts-table td { font-size: 13px; padding: 8px 10px; min-width: 70px; }
      .qvts-panel-grid { grid-template-columns: 1fr 1fr; }
      .qvts-templates-grid { grid-template-columns: 1fr 1fr; }
      .qvts-export-grid { grid-template-columns: 1fr 1fr; }
      .qvts-preview-wrap { padding: 14px; }
    }
  `;

  function injectCSS() {
    if (document.getElementById('qvts-css')) return;
    const s = document.createElement('style');
    s.id = 'qvts-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ============================================================
     END CHUNK 1
     ============================================================ */
  // ⬇️ CHUNK 2 CONTINUES HERE ⬇️
/* ============================================================
   TEMPLATES DATA
   ============================================================ */
const TEMPLATES = [
  { id: 'simple',      icon: '▦', name: 'Simple Table' },
  { id: 'modern',      icon: '◆', name: 'Modern Table' },
  { id: 'professional',icon: '🏢', name: 'Professional' },
  { id: 'attendance',  icon: '📋', name: 'Attendance' },
  { id: 'marks',       icon: '🎓', name: 'Marks Table' },
  { id: 'pricelist',   icon: '🏷️', name: 'Price List' },
  { id: 'comparison',  icon: '⚖️', name: 'Comparison' },
  { id: 'invoice',     icon: '🧾', name: 'Invoice Items' },
  { id: 'schedule',    icon: '📅', name: 'Daily Schedule' },
  { id: 'expense',     icon: '💰', name: 'Expense Table' },
  { id: 'checklist',   icon: '✅', name: 'Checklist' },
  { id: 'blank',       icon: '⬜', name: 'Blank Table' }
];

function getTemplateConfig(id) {
  // Returns { rows, cols, headerColor, altRow, borderColor, fontFamily }
  switch (id) {
    case 'simple':       return { rows: 5, cols: 4, headerColor: '#f3f4f6', altRow: false, borderColor: '#d1d5db', fontFamily: 'Arial, sans-serif' };
    case 'modern':       return { rows: 5, cols: 4, headerColor: '#6366f1', altRow: true,  borderColor: '#e5e7eb', fontFamily: 'Inter, sans-serif' };
    case 'professional': return { rows: 6, cols: 5, headerColor: '#1e293b', altRow: true,  borderColor: '#cbd5e1', fontFamily: 'Georgia, serif' };
    case 'attendance':   return { rows: 11, cols: 6, headerColor: '#059669', altRow: true, borderColor: '#a7f3d0', fontFamily: 'Arial, sans-serif' };
    case 'marks':        return { rows: 8, cols: 6, headerColor: '#dc2626', altRow: true,  borderColor: '#fecaca', fontFamily: 'Arial, sans-serif' };
    case 'pricelist':    return { rows: 8, cols: 3, headerColor: '#f59e0b', altRow: true,  borderColor: '#fde68a', fontFamily: 'Arial, sans-serif' };
    case 'comparison':   return { rows: 5, cols: 4, headerColor: '#7c3aed', altRow: false, borderColor: '#ddd6fe', fontFamily: 'Inter, sans-serif' };
    case 'invoice':      return { rows: 6, cols: 5, headerColor: '#0891b2', altRow: false, borderColor: '#a5f3fc', fontFamily: 'Arial, sans-serif' };
    case 'schedule':     return { rows: 10, cols: 3, headerColor: '#2563eb', altRow: true,  borderColor: '#bfdbfe', fontFamily: 'Inter, sans-serif' };
    case 'expense':      return { rows: 8, cols: 4, headerColor: '#16a34a', altRow: true,  borderColor: '#bbf7d0', fontFamily: 'Arial, sans-serif' };
    case 'checklist':    return { rows: 8, cols: 3, headerColor: '#f97316', altRow: false, borderColor: '#fed7aa', fontFamily: 'Arial, sans-serif' };
    case 'blank':        return { rows: 5, cols: 4, headerColor: '#f3f4f6', altRow: false, borderColor: '#d1d5db', fontFamily: 'Arial, sans-serif' };
    default:             return { rows: 5, cols: 4, headerColor: '#f3f4f6', altRow: false, borderColor: '#d1d5db', fontFamily: 'Arial, sans-serif' };
  }
}

/* ============================================================
   RENDER MAIN UI
   ============================================================ */
function renderHTML() {
  return `
    <div class="qvts-wrap">
      <!-- Title / Subtitle -->
      <div class="qvts-card">
        <div class="qvts-card-title">Table Title</div>
        <input type="text" class="qvts-title-input" id="qvts-title" placeholder="Enter table title..." value="${esc(state.title)}" />
        <input type="text" class="qvts-subtitle-input" id="qvts-subtitle" placeholder="Optional subtitle..." value="${esc(state.subtitle)}" />
      </div>

      <!-- Tabs -->
      <div class="qvts-tabs">
        <button class="qvts-tab active" data-tab="edit">✏️ Edit</button>
        <button class="qvts-tab" data-tab="format">🎨 Format</button>
        <button class="qvts-tab" data-tab="templates">📐 Templates</button>
        <button class="qvts-tab" data-tab="preview">👁️ Preview</button>
        <button class="qvts-tab" data-tab="export">📤 Export</button>
      </div>

      <!-- TAB: EDIT -->
      <div class="qvts-tab-content" data-content="edit">
        <!-- Toolbar -->
        <div class="qvts-toolbar">
          <div class="qvts-toolbar-group">
            <button class="qvts-tb-btn" data-act="add-row" title="Add Row">➕ Row</button>
            <button class="qvts-tb-btn danger" data-act="del-row" title="Delete Row">➖ Row</button>
          </div>
          <div class="qvts-toolbar-group">
            <button class="qvts-tb-btn" data-act="add-col" title="Add Column">➕ Col</button>
            <button class="qvts-tb-btn danger" data-act="del-col" title="Delete Column">➖ Col</button>
          </div>
          <div class="qvts-toolbar-group">
            <button class="qvts-tb-btn" data-act="undo" title="Undo">↶</button>
            <button class="qvts-tb-btn" data-act="redo" title="Redo">↷</button>
          </div>
          <div class="qvts-toolbar-group">
            <button class="qvts-tb-btn" data-act="merge" title="Merge Cells">🔲 Merge</button>
            <button class="qvts-tb-btn" data-act="unmerge" title="Unmerge">⬜ Unmerge</button>
          </div>
          <div class="qvts-toolbar-group">
            <button class="qvts-tb-btn danger" data-act="clear" title="Clear Table">🗑️ Clear</button>
            <button class="qvts-tb-btn danger" data-act="reset" title="Reset">♻️ Reset</button>
          </div>
        </div>

        <!-- Table Size Selector -->
        <div class="qvts-card" style="padding: 10px 14px">
          <div class="qvts-toolbar-group" style="flex-wrap: wrap">
            <span style="font-size: 12px; color: var(--text-3); margin-right: 6px; align-self: center">Quick Size:</span>
            <button class="qvts-tb-btn" data-act="size-3x3">3×3</button>
            <button class="qvts-tb-btn" data-act="size-5x5">5×5</button>
            <button class="qvts-tb-btn" data-act="size-8x5">8×5</button>
            <button class="qvts-tb-btn" data-act="size-10x6">10×6</button>
            <button class="qvts-tb-btn" data-act="size-10x10">10×10</button>
          </div>
        </div>

        <!-- Table -->
        <div class="qvts-table-scroll" id="qvts-table-scroll">
          <table class="qvts-table" id="qvts-table"></table>
        </div>
      </div>

      <!-- TAB: FORMAT -->
      <div class="qvts-tab-content" data-content="format" style="display:none">
        <div class="qvts-card">
          <div class="qvts-card-title">Text Formatting</div>
          <div class="qvts-panel-grid">
            <div class="qvts-field">
              <label>Font Family</label>
              <select id="qvts-font-family">
                <option value="">Default</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Inter', sans-serif">Inter</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
              </select>
            </div>
            <div class="qvts-field">
              <label>Font Size</label>
              <select id="qvts-font-size">
                <option value="">Default</option>
                <option value="11px">11</option>
                <option value="12px">12</option>
                <option value="13px">13</option>
                <option value="14px">14</option>
                <option value="15px">15</option>
                <option value="16px">16</option>
                <option value="18px">18</option>
                <option value="20px">20</option>
              </select>
            </div>
            <div class="qvts-field">
              <label>Text Color</label>
              <input type="color" id="qvts-text-color" value="#111827" />
            </div>
            <div class="qvts-field">
              <label>Cell Background</label>
              <input type="color" id="qvts-cell-bg" value="#ffffff" />
            </div>
          </div>
        </div>

        <div class="qvts-card">
          <div class="qvts-card-title">Alignment</div>
          <div class="qvts-toolbar">
            <div class="qvts-toolbar-group">
              <button class="qvts-tb-btn" data-align="left" title="Left">⬅️</button>
              <button class="qvts-tb-btn" data-align="center" title="Center">⬆️</button>
              <button class="qvts-tb-btn" data-align="right" title="Right">➡️</button>
            </div>
            <div class="qvts-toolbar-group">
              <button class="qvts-tb-btn" data-valign="top" title="Top">⤒</button>
              <button class="qvts-tb-btn" data-valign="middle" title="Middle">≡</button>
              <button class="qvts-tb-btn" data-valign="bottom" title="Bottom">⤓</button>
            </div>
          </div>
        </div>

        <div class="qvts-card">
          <div class="qvts-card-title">Borders</div>
          <div class="qvts-panel-grid">
            <div class="qvts-field">
              <label>Border Color</label>
              <input type="color" id="qvts-border-color" value="#d1d5db" />
            </div>
            <div class="qvts-field">
              <label>Border Thickness</label>
              <select id="qvts-border-thickness">
                <option value="1px" selected>1 px</option>
                <option value="2px">2 px</option>
                <option value="3px">3 px</option>
                <option value="0px">None</option>
              </select>
            </div>
            <div class="qvts-field">
              <label>Cell Padding</label>
              <select id="qvts-cell-padding">
                <option value="6px 8px">Small</option>
                <option value="10px 12px" selected>Medium</option>
                <option value="14px 18px">Large</option>
              </select>
            </div>
          </div>
        </div>

        <div class="qvts-card">
          <div class="qvts-card-title">Header & Zebra</div>
          <div class="qvts-toolbar">
            <button class="qvts-tb-btn" data-act="style-header">Style Header Row</button>
            <button class="qvts-tb-btn" data-act="toggle-zebra">Toggle Zebra</button>
          </div>
        </div>
      </div>

      <!-- TAB: TEMPLATES -->
      <div class="qvts-tab-content" data-content="templates" style="display:none">
        <div class="qvts-card">
          <div class="qvts-card-title">Choose a Template</div>
          <div class="qvts-templates-grid">
            ${TEMPLATES.map(t => `
              <div class="qvts-template" data-template="${t.id}">
                <div class="qvts-template-icon">${t.icon}</div>
                <div class="qvts-template-name">${esc(t.name)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- TAB: PREVIEW -->
      <div class="qvts-tab-content" data-content="preview" style="display:none">
        <div class="qvts-card">
          <div class="qvts-card-title">Live Preview</div>
          <div class="qvts-preview-wrap" id="qvts-preview-wrap"></div>
        </div>
      </div>

      <!-- TAB: EXPORT -->
      <div class="qvts-tab-content" data-content="export" style="display:none">
        <div class="qvts-card">
          <div class="qvts-card-title">Download Options</div>
          <div class="qvts-export-grid">
            <button class="qvts-export-btn" data-export="png" id="qvts-export-png">
              <span class="ico">🖼️</span>
              <span>PNG (HD)</span>
              <span style="font-size:10.5px; opacity:0.7">2x / 3x / 4x</span>
            </button>
            <button class="qvts-export-btn" data-export="pdf" id="qvts-export-pdf">
              <span class="ico">📄</span>
              <span>PDF</span>
              <span style="font-size:10.5px; opacity:0.7">A4 Portrait / Landscape</span>
            </button>
            <button class="qvts-export-btn" data-export="print" id="qvts-export-print">
              <span class="ico">🖨️</span>
              <span>Print</span>
              <span style="font-size:10.5px; opacity:0.7">Direct print</span>
            </button>
            <button class="qvts-export-btn" data-export="csv" id="qvts-export-csv">
              <span class="ico">📊</span>
              <span>CSV</span>
              <span style="font-size:10.5px; opacity:0.7">Excel compatible</span>
            </button>
            <button class="qvts-export-btn" data-export="copy" id="qvts-export-copy">
              <span class="ico">📋</span>
              <span>Copy Table</span>
              <span style="font-size:10.5px; opacity:0.7">TSV to clipboard</span>
            </button>
            <button class="qvts-export-btn" data-export="save" id="qvts-export-save">
              <span class="ico">💾</span>
              <span>Save Draft</span>
              <span style="font-size:10.5px; opacity:0.7">To browser</span>
            </button>
          </div>
        </div>

        <div class="qvts-card">
          <div class="qvts-card-title">PNG Scale</div>
          <div class="qvts-toolbar">
            <button class="qvts-tb-btn active" data-scale="2">2x (HD)</button>
            <button class="qvts-tb-btn" data-scale="3">3x (Full HD)</button>
            <button class="qvts-tb-btn" data-scale="4">4x (Ultra HD)</button>
          </div>
          <div style="font-size:11.5px; color:var(--text-3); margin-top:8px; line-height:1.5">
            ⚠️ 4x export may fail on low-memory devices. If it fails, try 2x or 3x.
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   END CHUNK 2
   ============================================================ */
// ⬇️ CHUNK 3 CONTINUES HERE ⬇️
/* ============================================================
   TABLE RENDERING
   ============================================================ */
function renderTable() {
  const table = document.getElementById('qvts-table');
  if (!table) return;
  table.innerHTML = '';

  for (let r = 0; r < state.rows; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < state.cols; c++) {
      const cell = state.data[r][c];
      const td = document.createElement('td');
      td.dataset.r = r;
      td.dataset.c = c;
      td.contentEditable = 'true';
      td.textContent = cell.text || '';

      // Apply formatting
      if (cell.bold) td.style.fontWeight = '700';
      if (cell.italic) td.style.fontStyle = 'italic';
      if (cell.underline) td.style.textDecoration = 'underline';
      if (cell.align) td.style.textAlign = cell.align;
      if (cell.valign) td.style.verticalAlign = cell.valign;
      if (cell.fontFamily) td.style.fontFamily = cell.fontFamily;
      if (cell.fontSize) td.style.fontSize = cell.fontSize;
      if (cell.textColor) td.style.color = cell.textColor;
      if (cell.bgColor) td.style.background = cell.bgColor;
      if (r === 0) td.classList.add('qvts-header');
      if (cell.colSpan > 1) td.colSpan = cell.colSpan;
      if (cell.rowSpan > 1) td.rowSpan = cell.rowSpan;

      // Events
      td.addEventListener('input', () => {
        state.data[r][c].text = td.textContent;
        pushHistory();
      });
      td.addEventListener('focus', () => {
        td.addEventListener('keydown', handleCellKeydown);
      });
      td.addEventListener('blur', () => {
        td.removeEventListener('keydown', handleCellKeydown);
      });
      td.addEventListener('mousedown', handleCellMousedown);
      td.addEventListener('touchstart', handleCellTouchstart, { passive: true });

      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

function handleCellKeydown(e) {
  // Tab moves to next cell
  if (e.key === 'Tab') {
    e.preventDefault();
    const td = e.target;
    const r = parseInt(td.dataset.r);
    const c = parseInt(td.dataset.c);
    let nextR = r, nextC = c + 1;
    if (nextC >= state.cols) { nextC = 0; nextR++; }
    if (nextR >= state.rows) return;
    const next = document.querySelector(`.qvts-table td[data-r="${nextR}"][data-c="${nextC}"]`);
    if (next) next.focus();
    return;
  }
  // Enter moves down
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const td = e.target;
    const r = parseInt(td.dataset.r);
    const c = parseInt(td.dataset.c);
    if (r + 1 < state.rows) {
      const next = document.querySelector(`.qvts-table td[data-r="${r + 1}"][data-c="${c}"]`);
      if (next) next.focus();
    }
    return;
  }
  // Escape blurs
  if (e.key === 'Escape') {
    e.preventDefault();
    e.target.blur();
    return;
  }
}

function handleCellMousedown(e) {
  // Multi-select with Ctrl/Cmd
  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
    clearSelection();
  }
  const td = e.currentTarget;
  td.classList.add('qvts-selected');
  const key = td.dataset.r + ',' + td.dataset.c;
  if (!state.selectedCells.includes(key)) state.selectedCells.push(key);
}

function handleCellTouchstart(e) {
  // Same as mousedown for touch
  handleCellMousedown({ currentTarget: e.currentTarget, ctrlKey: false, metaKey: false, shiftKey: false });
}

function clearSelection() {
  state.selectedCells = [];
  document.querySelectorAll('.qvts-table td.qvts-selected').forEach(td => {
    td.classList.remove('qvts-selected');
  });
}

/* ============================================================
   ROW / COLUMN MANAGEMENT
   ============================================================ */
function addRow() {
  const newRow = [];
  for (let c = 0; c < state.cols; c++) newRow.push(createEmptyCell());
  state.data.push(newRow);
  state.rows++;
  pushHistory();
  renderTable();
  renderPreview();
  toast('Row added', 'success');
}

function delRow() {
  if (state.rows <= 1) { toast('Cannot delete last row', 'error'); return; }
  state.data.pop();
  state.rows--;
  pushHistory();
  renderTable();
  renderPreview();
  toast('Row deleted', 'success');
}

function addCol() {
  for (let r = 0; r < state.rows; r++) {
    state.data[r].push(createEmptyCell());
  }
  state.cols++;
  pushHistory();
  renderTable();
  renderPreview();
  toast('Column added', 'success');
}

function delCol() {
  if (state.cols <= 1) { toast('Cannot delete last column', 'error'); return; }
  for (let r = 0; r < state.rows; r++) {
    state.data[r].pop();
  }
  state.cols--;
  pushHistory();
  renderTable();
  renderPreview();
  toast('Column deleted', 'success');
}

/* ============================================================
   FORMATTING
   ============================================================ */
function applyToSelected(fn) {
  if (!state.selectedCells.length) {
    toast('Select cells first (tap cells to select)', 'error');
    return;
  }
  state.selectedCells.forEach(key => {
    const [r, c] = key.split(',').map(Number);
    if (state.data[r] && state.data[r][c]) fn(state.data[r][c]);
  });
  pushHistory();
  renderTable();
  renderPreview();
}

function alignSelected(align) {
  applyToSelected(c => { c.align = align; });
}

function valignSelected(valign) {
  applyToSelected(c => { c.valign = valign; });
}

function styleHeaderRow() {
  for (let c = 0; c < state.cols; c++) {
    state.data[0][c].bold = true;
    state.data[0][c].bgColor = '#f3f4f6';
    state.data[0][c].align = 'center';
  }
  pushHistory();
  renderTable();
  renderPreview();
  toast('Header row styled', 'success');
}

function toggleZebra() {
  for (let r = 1; r < state.rows; r++) {
    if (r % 2 === 1) {
      for (let c = 0; c < state.cols; c++) {
        state.data[r][c].bgColor = '#f9fafb';
      }
    } else {
      for (let c = 0; c < state.cols; c++) {
        state.data[r][c].bgColor = '';
      }
    }
  }
  pushHistory();
  renderTable();
  renderPreview();
  toast('Zebra striping toggled', 'success');
}

function clearTable() {
  if (!confirm('Clear all table content?')) return;
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      state.data[r][c] = createEmptyCell();
    }
  }
  pushHistory();
  renderTable();
  renderPreview();
  toast('Table cleared', 'success');
}

function resetTable() {
  if (!confirm('Reset to default sample table?')) return;
  state.rows = 5;
  state.cols = 4;
  state.data = createSampleTable();
  state.title = 'My Table';
  state.subtitle = '';
  const t = document.getElementById('qvts-title');
  const s = document.getElementById('qvts-subtitle');
  if (t) t.value = state.title;
  if (s) s.value = state.subtitle;
  pushHistory();
  renderTable();
  renderPreview();
  toast('Table reset', 'success');
}

function setSize(rows, cols) {
  const newData = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      if (state.data[r] && state.data[r][c]) row.push(state.data[r][c]);
      else row.push(createEmptyCell());
    }
    newData.push(row);
  }
  state.data = newData;
  state.rows = rows;
  state.cols = cols;
  pushHistory();
  renderTable();
  renderPreview();
  toast('Size set to ' + rows + '×' + cols, 'success');
}

/* ============================================================
   MERGE / UNMERGE
   ============================================================ */
function mergeSelected() {
  if (state.selectedCells.length < 2) {
    toast('Select at least 2 cells to merge', 'error');
    return;
  }
  // Simple horizontal merge in a single row
  const cells = state.selectedCells.map(k => k.split(',').map(Number));
  const sameRow = cells.every(c => c[0] === cells[0][0]);
  if (!sameRow) {
    toast('Merge only works in same row (for now)', 'error');
    return;
  }
  const row = cells[0][0];
  const minC = Math.min(...cells.map(c => c[1]));
  const maxC = Math.max(...cells.map(c => c[1]));
  const span = maxC - minC + 1;
  // Combine text
  let text = '';
  for (let c = minC; c <= maxC; c++) {
    if (state.data[row][c].text) text += (text ? ' ' : '') + state.data[row][c].text;
  }
  state.data[row][minC].text = text;
  state.data[row][minC].colSpan = span;
  // Clear others and hide them visually
  for (let c = minC + 1; c <= maxC; c++) {
    state.data[row][c].colSpan = 0;
    state.data[row][c].text = '';
  }
  pushHistory();
  renderTable();
  renderPreview();
  toast('Cells merged', 'success');
}

function unmergeSelected() {
  state.selectedCells.forEach(key => {
    const [r, c] = key.split(',').map(Number);
    if (state.data[r] && state.data[r][c]) {
      state.data[r][c].colSpan = 1;
      state.data[r][c].rowSpan = 1;
    }
  });
  pushHistory();
  renderTable();
  renderPreview();
  toast('Unmerged', 'success');
}

/* ============================================================
   TEMPLATES
   ============================================================ */
function applyTemplate(id) {
  const cfg = getTemplateConfig(id);
  state.rows = cfg.rows;
  state.cols = cfg.cols;
  state.data = createEmptyTable(cfg.rows, cfg.cols);

  // Fill with a sample structure
  if (id === 'attendance') {
    state.data[0][0].text = 'Roll No'; state.data[0][1].text = 'Name';
    state.data[0][2].text = 'Day 1';   state.data[0][3].text = 'Day 2';
    state.data[0][4].text = 'Day 3';   state.data[0][5].text = 'Total';
  } else if (id === 'marks') {
    state.data[0][0].text = 'Roll No'; state.data[0][1].text = 'Name';
    state.data[0][2].text = 'Math';    state.data[0][3].text = 'Science';
    state.data[0][4].text = 'English'; state.data[0][5].text = 'Total';
  } else if (id === 'pricelist') {
    state.data[0][0].text = 'Item';  state.data[0][1].text = 'Price'; state.data[0][2].text = 'Stock';
  } else if (id === 'invoice') {
    state.data[0][0].text = 'Item';  state.data[0][1].text = 'Qty';
    state.data[0][2].text = 'Price'; state.data[0][3].text = 'GST';
    state.data[0][4].text = 'Total';
  } else if (id === 'schedule') {
    state.data[0][0].text = 'Time'; state.data[0][1].text = 'Task'; state.data[0][2].text = 'Notes';
  } else if (id === 'expense') {
    state.data[0][0].text = 'Date'; state.data[0][1].text = 'Category';
    state.data[0][2].text = 'Amount'; state.data[0][3].text = 'Notes';
  } else if (id === 'checklist') {
    state.data[0][0].text = '✓'; state.data[0][1].text = 'Task'; state.data[0][2].text = 'Notes';
  } else if (id === 'comparison') {
    state.data[0][0].text = 'Feature'; state.data[0][1].text = 'Option A';
    state.data[0][2].text = 'Option B'; state.data[0][3].text = 'Winner';
  } else {
    // Generic header
    for (let c = 0; c < state.cols; c++) {
      state.data[0][c].text = 'Column ' + (c + 1);
      state.data[0][c].bold = true;
      state.data[0][c].align = 'center';
      state.data[0][c].bgColor = cfg.headerColor;
      state.data[0][c].textColor = '#ffffff';
    }
  }

  // Style header
  for (let c = 0; c < state.cols; c++) {
    state.data[0][c].bold = true;
    state.data[0][c].align = 'center';
    state.data[0][c].bgColor = cfg.headerColor;
    if (cfg.headerColor !== '#f3f4f6') state.data[0][c].textColor = '#ffffff';
  }

  // Zebra
  if (cfg.altRow) {
    for (let r = 1; r < state.rows; r++) {
      if (r % 2 === 1) {
        for (let c = 0; c < state.cols; c++) {
          state.data[r][c].bgColor = '#f9fafb';
        }
      }
    }
  }

  pushHistory();
  renderTable();
  renderPreview();
  toast('Template applied: ' + id, 'success');
}

/* ============================================================
   UNDO / REDO
   ============================================================ */
function pushHistory() {
  // Serialize current state
  const snapshot = JSON.stringify({
    rows: state.rows,
    cols: state.cols,
    data: state.data,
    title: state.title,
    subtitle: state.subtitle
  });
  // Avoid duplicates
  if (state.history[state.historyIndex] === snapshot) return;
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snapshot);
  if (state.history.length > 30) {
    state.history.shift();
  } else {
    state.historyIndex++;
  }
}

function undo() {
  if (state.historyIndex <= 0) { toast('Nothing to undo', 'error'); return; }
  state.historyIndex--;
  const snapshot = JSON.parse(state.history[state.historyIndex]);
  state.rows = snapshot.rows;
  state.cols = snapshot.cols;
  state.data = snapshot.data;
  state.title = snapshot.title;
  state.subtitle = snapshot.subtitle;
  const t = document.getElementById('qvts-title');
  const s = document.getElementById('qvts-subtitle');
  if (t) t.value = state.title;
  if (s) s.value = state.subtitle;
  renderTable();
  renderPreview();
  toast('Undone', 'success');
}

function redo() {
  if (state.historyIndex >= state.history.length - 1) { toast('Nothing to redo', 'error'); return; }
  state.historyIndex++;
  const snapshot = JSON.parse(state.history[state.historyIndex]);
  state.rows = snapshot.rows;
  state.cols = snapshot.cols;
  state.data = snapshot.data;
  state.title = snapshot.title;
  state.subtitle = snapshot.subtitle;
  const t = document.getElementById('qvts-title');
  const s = document.getElementById('qvts-subtitle');
  if (t) t.value = state.title;
  if (s) s.value = state.subtitle;
  renderTable();
  renderPreview();
  toast('Redone', 'success');
}

/* ============================================================
   LIVE PREVIEW
   ============================================================ */
function renderPreview() {
  const wrap = document.getElementById('qvts-preview-wrap');
  if (!wrap) return;
  wrap.innerHTML = buildPreviewHTML();
}

function buildPreviewHTML() {
  let html = '';
  if (state.title) html += `<div class="qvts-preview-title">${esc(state.title)}</div>`;
  if (state.subtitle) html += `<div class="qvts-preview-subtitle">${esc(state.subtitle)}</div>`;
  html += '<table class="qvts-preview-table"><tbody>';
  for (let r = 0; r < state.rows; r++) {
    html += '<tr>';
    for (let c = 0; c < state.cols; c++) {
      const cell = state.data[r][c];
      if (cell.colSpan === 0) continue; // merged-away cell
      const span = cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : '';
      const rspan = cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : '';
      const styles = [];
      if (cell.bold) styles.push('font-weight:700');
      if (cell.italic) styles.push('font-style:italic');
      if (cell.underline) styles.push('text-decoration:underline');
      if (cell.align) styles.push('text-align:' + cell.align);
      if (cell.valign) styles.push('vertical-align:' + cell.valign);
      if (cell.fontFamily) styles.push('font-family:' + cell.fontFamily);
      if (cell.fontSize) styles.push('font-size:' + cell.fontSize);
      if (cell.textColor) styles.push('color:' + cell.textColor);
      if (cell.bgColor) styles.push('background:' + cell.bgColor);
      html += `<td${span}${rspan} style="${styles.join(';')}">${esc(cell.text)}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

/* ============================================================
   END CHUNK 3
   ============================================================ */
// ⬇️ CHUNK 4 CONTINUES HERE ⬇️

  /* ============================================================
     EXPORT: PNG
     ============================================================ */
  async function exportPNG() {
    if (state.isExporting) return;
    state.isExporting = true;
    showLoading('Generating HD PNG...');

    try {
      const scale = parseInt(document.querySelector('.qvts-tb-btn[data-scale].active')?.dataset.scale || '2');
      const target = buildExportNode();
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;left:-99999px;top:0;background:#fff;padding:0;margin:0;';
      wrap.appendChild(target);
      document.body.appendChild(wrap);

      await new Promise(r => setTimeout(r, 200));

      if (!window.htmlToImage) throw new Error('html-to-image library not loaded');

      const dataUrl = await window.htmlToImage.toPng(target, {
        quality: 1,
        pixelRatio: scale,
        backgroundColor: '#ffffff',
        width: target.scrollWidth,
        height: target.scrollHeight,
        cacheBust: true
      });

      const a = document.createElement('a');
      a.download = makeFilename('png');
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      document.body.removeChild(wrap);
      toast('PNG downloaded (' + scale + 'x) ✅', 'success');
    } catch (e) {
      console.error(e);
      toast('PNG export failed. Try 2x scale or fewer rows.', 'error');
    } finally {
      hideLoading();
      state.isExporting = false;
    }
  }

  /* ============================================================
     EXPORT: PDF
     ============================================================ */
  async function exportPDF() {
    if (state.isExporting) return;
    state.isExporting = true;
    showLoading('Generating PDF...');

    try {
      if (!window.htmlToImage || !window.jspdf) throw new Error('Required libraries not loaded');

      const target = buildExportNode();
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;left:-99999px;top:0;background:#fff;padding:0;margin:0;';
      wrap.appendChild(target);
      document.body.appendChild(wrap);

      await new Promise(r => setTimeout(r, 200));

      const dataUrl = await window.htmlToImage.toPng(target, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: target.scrollWidth,
        height: target.scrollHeight,
        cacheBust: true
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      // Multi-page support
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pageHeightPx = canvas.width * (ph / pw);
      let y = 0;
      let pageIndex = 0;

      while (y < canvas.height) {
        const sliceH = Math.min(pageHeightPx, canvas.height - y);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sliceH;
        const sctx = slice.getContext('2d');
        sctx.fillStyle = '#ffffff';
        sctx.fillRect(0, 0, slice.width, slice.height);
        sctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

        if (pageIndex > 0) pdf.addPage();

        const sliceRatio = slice.width / slice.height;
        let w = pw - 10;
        let h = w / sliceRatio;
        if (h > ph - 10) { h = ph - 10; w = h * sliceRatio; }

        pdf.addImage(slice.toDataURL('image/png'), 'PNG', (pw - w) / 2, (ph - h) / 2, w, h, undefined, 'FAST');
        y += sliceH;
        pageIndex++;
      }

      pdf.save(makeFilename('pdf'));
      document.body.removeChild(wrap);
      toast('PDF downloaded ✅', 'success');
    } catch (e) {
      console.error(e);
      toast('PDF export failed', 'error');
    } finally {
      hideLoading();
      state.isExporting = false;
    }
  }

  /* ============================================================
     EXPORT: PRINT
     ============================================================ */
  function exportPrint() {
    const target = buildExportNode();
    const html = `<!DOCTYPE html><html><head><title>${esc(state.title || 'Table')}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; padding: 20px; background: #fff; color: #111; }
        h1 { font-size: 22px; font-weight: 900; margin: 0 0 4px; }
        p.sub { font-size: 13px; color: #6b7280; margin: 0 0 16px; }
        table { border-collapse: collapse; width: 100%; }
        td { padding: 10px 12px; border: 1px solid #d1d5db; font-size: 14px; vertical-align: middle; word-break: break-word; }
        @media print {
          body { padding: 0; }
          @page { margin: 12mm; }
        }
      </style></head><body>
        ${state.title ? `<h1>${esc(state.title)}</h1>` : ''}
        ${state.subtitle ? `<p class="sub">${esc(state.subtitle)}</p>` : ''}
        ${target.querySelector('table').outerHTML}
      </body></html>`;

    const win = window.open('', '_blank');
    if (!win) {
      toast('Popup blocked. Allow popups for this site.', 'error');
      return;
    }
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
      setTimeout(() => win.close(), 1000);
    }, 400);
  }

  /* ============================================================
     EXPORT: CSV
     ============================================================ */
  function exportCSV() {
    try {
      let csv = '';
      for (let r = 0; r < state.rows; r++) {
        const row = [];
        for (let c = 0; c < state.cols; c++) {
          const cell = state.data[r][c];
          let val = String(cell.text || '');
          // Escape quotes
          if (/[",\n]/.test(val)) val = '"' + val.replace(/"/g, '""') + '"';
          row.push(val);
        }
        csv += row.join(',') + '\n';
      }
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = makeFilename('csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('CSV downloaded ✅', 'success');
    } catch (e) {
      console.error(e);
      toast('CSV export failed', 'error');
    }
  }

  /* ============================================================
     EXPORT: COPY TABLE (TSV)
     ============================================================ */
  function exportCopy() {
    try {
      let tsv = '';
      for (let r = 0; r < state.rows; r++) {
        const row = [];
        for (let c = 0; c < state.cols; c++) {
          row.push(String(state.data[r][c].text || '').replace(/\t/g, ' '));
        }
        tsv += row.join('\t') + '\n';
      }
      if (!navigator.clipboard) { toast('Copy not supported', 'error'); return; }
      navigator.clipboard.writeText(tsv)
        .then(() => toast('Table copied — paste in Excel ✅', 'success'))
        .catch(() => toast('Copy failed', 'error'));
    } catch (e) {
      console.error(e);
      toast('Copy failed', 'error');
    }
  }

  /* ============================================================
     SAVE / LOAD DRAFT
     ============================================================ */
  const DRAFT_KEY = 'qvts_draft_v1';

  function saveDraft() {
    try {
      const draft = {
        rows: state.rows,
        cols: state.cols,
        data: state.data,
        title: state.title,
        subtitle: state.subtitle,
        savedAt: Date.now()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      toast('Draft saved ✅', 'success');
    } catch (e) {
      console.error(e);
      toast('Save failed — storage full?', 'error');
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return false;
      const draft = JSON.parse(raw);
      if (!draft || !draft.data) return false;
      state.rows = draft.rows || 5;
      state.cols = draft.cols || 4;
      state.data = draft.data;
      state.title = draft.title || '';
      state.subtitle = draft.subtitle || '';
      const t = document.getElementById('qvts-title');
      const s = document.getElementById('qvts-subtitle');
      if (t) t.value = state.title;
      if (s) s.value = state.subtitle;
      renderTable();
      renderPreview();
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ============================================================
     EXPORT NODE BUILDER (for PNG/PDF/Print)
     ============================================================ */
  function buildExportNode() {
    const div = document.createElement('div');
    div.style.cssText = 'background:#fff;color:#111;padding:20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;width:fit-content;min-width:400px;';
    let html = '';
    if (state.title) html += `<div style="font-size:22px;font-weight:900;margin-bottom:4px;color:#111;">${esc(state.title)}</div>`;
    if (state.subtitle) html += `<div style="font-size:13px;color:#6b7280;margin-bottom:14px;">${esc(state.subtitle)}</div>`;
    html += '<table style="border-collapse:collapse;">';
    for (let r = 0; r < state.rows; r++) {
      html += '<tr>';
      for (let c = 0; c < state.cols; c++) {
        const cell = state.data[r][c];
        if (cell.colSpan === 0) continue;
        const span = cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : '';
        const rspan = cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : '';
        const styles = ['padding:10px 12px', 'border:1px solid #d1d5db', 'font-size:14px', 'vertical-align:' + (cell.valign || 'middle'), 'word-break:break-word'];
        if (cell.bold) styles.push('font-weight:700');
        if (cell.italic) styles.push('font-style:italic');
        if (cell.underline) styles.push('text-decoration:underline');
        if (cell.align) styles.push('text-align:' + cell.align);
        if (cell.fontFamily) styles.push('font-family:' + cell.fontFamily);
        if (cell.fontSize) styles.push('font-size:' + cell.fontSize);
        if (cell.textColor) styles.push('color:' + cell.textColor);
        if (cell.bgColor) styles.push('background:' + cell.bgColor);
        html += `<td${span}${rspan} style="${styles.join(';')}">${esc(cell.text)}</td>`;
      }
      html += '</tr>';
    }
    html += '</table>';
    div.innerHTML = html;
    return div;
  }

  /* ============================================================
     LOADING OVERLAY
     ============================================================ */
  function showLoading(msg) {
    hideLoading();
    const div = document.createElement('div');
    div.className = 'qvts-loading';
    div.id = 'qvts-loading';
    div.innerHTML = `<div class="qvts-spinner"></div><div>${esc(msg || 'Working...')}</div>`;
    document.body.appendChild(div);
  }

  function hideLoading() {
    const el = document.getElementById('qvts-loading');
    if (el) el.remove();
  }

  /* ============================================================
     FILENAME HELPER
     ============================================================ */
  function makeFilename(ext) {
    const safe = (state.title || 'table').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const date = new Date().toISOString().slice(0, 10);
    return `qunverio-${safe || 'table'}-${date}.${ext}`;
  }

  /* ============================================================
     EVENT WIRING
     ============================================================ */
  function wireEvents() {
    // Title / Subtitle
    const titleEl = document.getElementById('qvts-title');
    const subEl = document.getElementById('qvts-subtitle');
    if (titleEl) titleEl.addEventListener('input', () => {
      state.title = titleEl.value;
      renderPreview();
    });
    if (subEl) subEl.addEventListener('input', () => {
      state.subtitle = subEl.value;
      renderPreview();
    });

    // Tabs
    document.querySelectorAll('.qvts-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.qvts-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        document.querySelectorAll('.qvts-tab-content').forEach(c => {
          c.style.display = c.dataset.content === target ? '' : 'none';
        });
        if (target === 'preview') renderPreview();
      });
    });

    // Toolbar buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.qvts-tb-btn');
      if (!btn) return;
      if (!btn.closest('.qvts-wrap')) return;

      const act = btn.dataset.act;
      const scale = btn.dataset.scale;
      const align = btn.dataset.align;
      const valign = btn.dataset.valign;

      if (scale) {
        document.querySelectorAll('.qvts-tb-btn[data-scale]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        return;
      }

      if (align) { alignSelected(align); return; }
      if (valign) { valignSelected(valign); return; }

      switch (act) {
        case 'add-row': addRow(); break;
        case 'del-row': delRow(); break;
        case 'add-col': addCol(); break;
        case 'del-col': delCol(); break;
        case 'undo': undo(); break;
        case 'redo': redo(); break;
        case 'merge': mergeSelected(); break;
        case 'unmerge': unmergeSelected(); break;
        case 'clear': clearTable(); break;
        case 'reset': resetTable(); break;
        case 'style-header': styleHeaderRow(); break;
        case 'toggle-zebra': toggleZebra(); break;
        case 'size-3x3': setSize(3, 3); break;
        case 'size-5x5': setSize(5, 5); break;
        case 'size-8x5': setSize(8, 5); break;
        case 'size-10x6': setSize(10, 6); break;
        case 'size-10x10': setSize(10, 10); break;
      }
    });

    // Format controls
    const ff = document.getElementById('qvts-font-family');
    if (ff) ff.addEventListener('change', () => applyToSelected(c => { c.fontFamily = ff.value; }));
    const fs = document.getElementById('qvts-font-size');
    if (fs) fs.addEventListener('change', () => applyToSelected(c => { c.fontSize = fs.value; }));
    const tc = document.getElementById('qvts-text-color');
    if (tc) tc.addEventListener('input', () => applyToSelected(c => { c.textColor = tc.value; }));
    const cb = document.getElementById('qvts-cell-bg');
    if (cb) cb.addEventListener('input', () => applyToSelected(c => { c.bgColor = cb.value; }));
    const bc = document.getElementById('qvts-border-color');
    if (bc) bc.addEventListener('input', () => {
      document.querySelectorAll('.qvts-table td').forEach(td => td.style.borderColor = bc.value);
    });
    const bt = document.getElementById('qvts-border-thickness');
    if (bt) bt.addEventListener('change', () => {
      document.querySelectorAll('.qvts-table td').forEach(td => td.style.borderWidth = bt.value);
    });
    const cp = document.getElementById('qvts-cell-padding');
    if (cp) cp.addEventListener('change', () => {
      document.querySelectorAll('.qvts-table td').forEach(td => td.style.padding = cp.value);
    });

    // Templates
    document.querySelectorAll('.qvts-template').forEach(t => {
      t.addEventListener('click', () => applyTemplate(t.dataset.template));
    });

    // Export buttons
    const exPng = document.getElementById('qvts-export-png');
    if (exPng) exPng.addEventListener('click', exportPNG);
    const exPdf = document.getElementById('qvts-export-pdf');
    if (exPdf) exPdf.addEventListener('click', exportPDF);
    const exPrint = document.getElementById('qvts-export-print');
    if (exPrint) exPrint.addEventListener('click', exportPrint);
    const exCsv = document.getElementById('qvts-export-csv');
    if (exCsv) exCsv.addEventListener('click', exportCSV);
    const exCopy = document.getElementById('qvts-export-copy');
    if (exCopy) exCopy.addEventListener('click', exportCopy);
    const exSave = document.getElementById('qvts-export-save');
    if (exSave) exSave.addEventListener('click', saveDraft);
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    injectCSS();

    // Load draft if exists, else sample
    const loaded = loadDraft();
    if (!loaded) {
      state.data = createSampleTable();
      state.rows = 5;
      state.cols = 4;
    }

    // Title/subtitle inputs already rendered via renderHTML
    const t = document.getElementById('qvts-title');
    const s = document.getElementById('qvts-subtitle');
    if (t) t.value = state.title;
    if (s) s.value = state.subtitle;

    renderTable();
    renderPreview();
    wireEvents();

    // Initial history
    pushHistory();
  }

  /* ============================================================
     REGISTER WITH QUNVERIO
     ============================================================ */
  window.EXTRA_TOOL_RENDERERS = window.EXTRA_TOOL_RENDERERS || {};
  window.EXTRA_TOOL_INITS = window.EXTRA_TOOL_INITS || {};

  window.EXTRA_TOOL_RENDERERS['table-studio'] = function () {
    return renderHTML();
  };

  window.EXTRA_TOOL_INITS['table-studio'] = function () {
    init();
  };

  console.log('%c✅ Table Studio loaded (v1.0)', 'color:#6366f1;font-weight:bold');
})();