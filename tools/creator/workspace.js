/* ============================================================
   QUNVERIO — CREATOR WORKSPACE
   Path: tools/creator/workspace.js
   Idea Vault + Title Vault + Script Vault (localStorage)
   ============================================================ */

(function () {
  'use strict';

  if (!window.QVH) {
    console.warn('QVH not loaded — workspace.js skipping');
    return;
  }

  const QVH = window.QVH;
  const STORAGE_KEY = 'qvh_workspace_v1';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function fmtDate(ts) {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  /* ============================================================
     STORAGE
     ============================================================ */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ideas: [], titles: [], scripts: [] };
      const d = JSON.parse(raw);
      return {
        ideas: Array.isArray(d.ideas) ? d.ideas : [],
        titles: Array.isArray(d.titles) ? d.titles : [],
        scripts: Array.isArray(d.scripts) ? d.scripts : []
      };
    } catch (e) { return { ideas: [], titles: [], scripts: [] }; }
  }
  function save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
    catch (e) { return false; }
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ============================================================
     STATE
     ============================================================ */
  let currentTab = 'ideas';
  let searchQuery = '';

  /* ============================================================
     STYLES
     ============================================================ */
  const CSS = `
    .qvhw-wrap { max-width: 720px; margin: 0 auto; }

    .qvhw-stats {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
      margin-bottom: 14px;
    }
    .qvhw-stat {
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 12px; padding: 12px 8px; text-align: center;
    }
    .qvhw-stat-num {
      font-size: 20px; font-weight: 900;
      background: linear-gradient(135deg,#6366f1,#ec4899);
      -webkit-background-clip: text; background-clip: text;
      color: transparent; -webkit-text-fill-color: transparent;
    }
    .qvhw-stat-label {
      font-size: 10.5px; font-weight: 700;
      text-transform: uppercase; letter-spacing: .06em;
      color: var(--text-3, #6b74a0); margin-top: 3px;
    }

    .qvhw-tabs {
      display: flex; gap: 6px; margin-bottom: 12px;
    }
    .qvhw-tab {
      flex: 1;
      padding: 10px 8px; border-radius: 10px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      font-size: 12.5px; font-weight: 700;
      color: var(--text-2, #a8b0d8);
      cursor: pointer; white-space: nowrap;
      transition: all .18s;
    }
    .qvhw-tab.active {
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      color: #fff; border-color: transparent;
      box-shadow: 0 4px 12px rgba(99,102,241,.35);
    }

    .qvhw-searchbar {
      position: relative; margin-bottom: 12px;
    }
    .qvhw-searchbar input {
      width: 100%; padding: 11px 40px 11px 14px;
      background: var(--surface, #151a3d);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 11px;
      font-size: 14px; outline: none;
      color: var(--text, #eef1ff);
      box-sizing: border-box;
    }
    .qvhw-searchbar input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
    .qvhw-searchbar .icon {
      position: absolute; right: 12px; top: 50%;
      transform: translateY(-50%); font-size: 16px; opacity: .5;
      pointer-events: none;
    }

    .qvhw-add-row {
      display: grid; grid-template-columns: 1fr auto; gap: 8px;
      margin-bottom: 14px;
    }
    .qvhw-add-btn {
      padding: 12px 18px; border-radius: 12px; border: none;
      font-size: 14px; font-weight: 700;
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      color: #fff; cursor: pointer;
      box-shadow: 0 4px 14px rgba(99,102,241,.35);
      transition: transform .15s;
      white-space: nowrap;
    }
    .qvhw-add-btn:active { transform: scale(.97); }

    .qvhw-empty {
      text-align: center; padding: 44px 22px;
      background: var(--surface, #151a3d);
      border: 1.5px dashed var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 14px;
      color: var(--text-3, #6b74a0); font-size: 13px;
      line-height: 1.6;
    }
    .qvhw-empty .emoji { font-size: 40px; display: block; margin-bottom: 8px; opacity: .7; }
    .qvhw-empty strong { display: block; color: var(--text-2, #a8b0d8); font-size: 14.5px; margin-bottom: 4px; }

    .qvhw-item {
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 12px;
      padding: 13px 14px;
      margin-bottom: 9px;
      transition: border-color .18s, transform .18s;
    }
    .qvhw-item:hover { border-color: var(--border-strong, rgba(255,255,255,0.14)); }
    .qvhw-item-head {
      display: flex; align-items: flex-start; gap: 10px;
      margin-bottom: 6px;
    }
    .qvhw-item-title {
      flex: 1; font-size: 14px; font-weight: 700;
      color: var(--text, #eef1ff); line-height: 1.35;
      word-break: break-word;
    }
    .qvhw-item-del {
      width: 28px; height: 28px; border-radius: 8px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      color: var(--text-3, #6b74a0);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; cursor: pointer; flex-shrink: 0;
      transition: all .15s;
    }
    .qvhw-item-del:hover { background: rgba(239,68,68,.15); color: #ef4444; border-color: rgba(239,68,68,.3); }
    .qvhw-item-notes {
      font-size: 12.5px; color: var(--text-2, #a8b0d8);
      line-height: 1.5; white-space: pre-wrap; word-break: break-word;
      margin-bottom: 8px;
    }
    .qvhw-item-foot {
      display: flex; justify-content: space-between; align-items: center;
      gap: 8px; flex-wrap: wrap;
    }
    .qvhw-item-date {
      font-size: 10.5px; color: var(--text-3, #6b74a0);
    }
    .qvhw-item-actions {
      display: flex; gap: 5px;
    }
    .qvhw-item-action {
      padding: 5px 10px; border-radius: 7px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      font-size: 11px; font-weight: 700;
      color: var(--text-2, #a8b0d8);
      cursor: pointer; transition: all .15s;
    }
    .qvhw-item-action:hover { background: var(--surface-hover, #232a5e); color: var(--text, #eef1ff); }

    .qvhw-footer-actions {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      margin-top: 16px; padding-top: 14px;
      border-top: 1px solid var(--border, rgba(255,255,255,0.08));
    }
    .qvhw-foot-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 11px 10px; border-radius: 10px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      font-size: 12px; font-weight: 700;
      color: var(--text, #eef1ff);
      cursor: pointer; transition: background .15s;
    }
    .qvhw-foot-btn:hover { background: var(--surface-hover, #232a5e); }

    /* Modal */
    .qvhw-modal-bg {
      position: fixed; inset: 0; z-index: 10050;
      background: rgba(0,0,0,.65);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: qvhw-fade .2s ease;
    }
    @keyframes qvhw-fade { from { opacity: 0 } to { opacity: 1 } }
    .qvhw-modal {
      background: var(--surface, #151a3d);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 16px;
      padding: 20px;
      width: 100%; max-width: 440px;
      max-height: 88vh; overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,.5);
    }
    .qvhw-modal h3 {
      font-size: 16px; font-weight: 800;
      margin: 0 0 14px; color: var(--text, #eef1ff);
    }
    .qvhw-field { margin-bottom: 12px; }
    .qvhw-field label {
      display: block; font-size: 12.5px; font-weight: 600;
      color: var(--text-2, #a8b0d8); margin-bottom: 5px;
    }
    .qvhw-field input, .qvhw-field textarea {
      width: 100%; padding: 11px 13px;
      background: var(--surface-2, #1c2250);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 11px;
      font-size: 14px; outline: none; color: var(--text, #eef1ff);
      font-family: inherit; box-sizing: border-box;
      transition: border-color .18s;
    }
    .qvhw-field input:focus, .qvhw-field textarea:focus {
      border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.15);
    }
    .qvhw-field textarea { min-height: 100px; resize: vertical; }
    .qvhw-modal-btns {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      margin-top: 14px;
    }
    .qvhw-modal-btn {
      padding: 12px; border-radius: 11px; border: none;
      font-size: 14px; font-weight: 700;
      cursor: pointer; transition: transform .15s;
    }
    .qvhw-modal-btn:active { transform: scale(.97); }
    .qvhw-modal-btn.cancel {
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      color: var(--text, #eef1ff);
    }
    .qvhw-modal-btn.primary {
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      color: #fff;
      box-shadow: 0 4px 14px rgba(99,102,241,.35);
    }
  `;

  function injectCSS() {
    if (document.getElementById('qvhw-css')) return;
    const s = document.createElement('style');
    s.id = 'qvhw-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function render(container) {
    injectCSS();

    container.innerHTML = `
      <div class="qvhw-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#3b82f6,#6366f1)">
          <div class="qvh-th-icon">📁</div>
          <div style="flex:1;min-width:0">
            <h3>Creator Workspace</h3>
            <p>Idea Vault • Title Vault • Script Vault</p>
          </div>
        </div>

        <div class="qvhw-stats" id="qvhwStats"></div>

        <div class="qvhw-tabs">
          <button class="qvhw-tab active" data-tab="ideas">💡 Ideas</button>
          <button class="qvhw-tab" data-tab="titles">📝 Titles</button>
          <button class="qvhw-tab" data-tab="scripts">🎬 Scripts</button>
        </div>

        <div class="qvhw-searchbar">
          <input type="text" id="qvhwSearch" placeholder="Search vault..." autocomplete="off" />
          <span class="icon">🔍</span>
        </div>

        <div class="qvhw-add-row">
          <button class="qvhw-add-btn" id="qvhwAddBtn">＋ Add New</button>
        </div>

        <div id="qvhwList"></div>

        <div class="qvhw-footer-actions">
          <button class="qvhw-foot-btn" id="qvhwExport"><span>⬇️</span> Export All (JSON)</button>
          <button class="qvhw-foot-btn" id="qvhwImport"><span>⬆️</span> Import (JSON)</button>
        </div>
      </div>
    `;

    renderStats();
    renderList();
    wireEvents();
  }

  function renderStats() {
    const d = load();
    const el = document.getElementById('qvhwStats');
    if (!el) return;
    el.innerHTML = `
      <div class="qvhw-stat"><div class="qvhw-stat-num">${d.ideas.length}</div><div class="qvhw-stat-label">💡 Ideas</div></div>
      <div class="qvhw-stat"><div class="qvhw-stat-num">${d.titles.length}</div><div class="qvhw-stat-label">📝 Titles</div></div>
      <div class="qvhw-stat"><div class="qvhw-stat-num">${d.scripts.length}</div><div class="qvhw-stat-label">🎬 Scripts</div></div>
    `;
  }

  function renderList() {
    const el = document.getElementById('qvhwList');
    if (!el) return;
    const d = load();
    const items = d[currentTab] || [];
    const q = searchQuery.trim().toLowerCase();

    const filtered = q
      ? items.filter(it => (it.title || '').toLowerCase().includes(q) || (it.notes || '').toLowerCase().includes(q))
      : items;

    if (filtered.length === 0) {
      const labels = { ideas: 'idea', titles: 'title', scripts: 'script' };
      const emojis = { ideas: '💡', titles: '📝', scripts: '🎬' };
      el.innerHTML = `<div class="qvhw-empty">
        <span class="emoji">${emojis[currentTab]}</span>
        <strong>No ${labels[currentTab]}s yet</strong>
        ${q ? 'No results matched your search.' : 'Tap "Add New" to save your first one.'}
      </div>`;
      return;
    }

    // Sort newest first
    const sorted = filtered.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));

    el.innerHTML = sorted.map(it => `
      <div class="qvhw-item" data-id="${it.id}">
        <div class="qvhw-item-head">
          <div class="qvhw-item-title">${esc(it.title || 'Untitled')}</div>
          <button class="qvhw-item-del" data-act="del" data-id="${it.id}" title="Delete">🗑️</button>
        </div>
        ${it.notes ? `<div class="qvhw-item-notes">${esc(it.notes)}</div>` : ''}
        <div class="qvhw-item-foot">
          <div class="qvhw-item-date">${fmtDate(it.ts || Date.now())}</div>
          <div class="qvhw-item-actions">
            <button class="qvhw-item-action" data-act="copy" data-id="${it.id}">📋 Copy</button>
            <button class="qvhw-item-action" data-act="edit" data-id="${it.id}">✏️ Edit</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ============================================================
     EVENTS
     ============================================================ */
  function wireEvents() {
    // Tabs
    document.querySelectorAll('.qvhw-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.qvhw-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        searchQuery = '';
        const s = document.getElementById('qvhwSearch');
        if (s) s.value = '';
        renderList();
      });
    });

    // Search
    const searchInput = document.getElementById('qvhwSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderList();
      });
    }

    // Add
    const addBtn = document.getElementById('qvhwAddBtn');
    if (addBtn) addBtn.addEventListener('click', () => openEditor(null));

    // Export
    const exportBtn = document.getElementById('qvhwExport');
    if (exportBtn) exportBtn.addEventListener('click', exportAll);

    // Import
    const importBtn = document.getElementById('qvhwImport');
    if (importBtn) importBtn.addEventListener('click', importAll);

    // Delegated item actions
    const list = document.getElementById('qvhwList');
    if (list) {
      list.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if (act === 'del') deleteItem(id);
        else if (act === 'copy') copyItem(id);
        else if (act === 'edit') openEditor(id);
      });
    }
  }

  /* ============================================================
     ADD / EDIT MODAL
     ============================================================ */
  function openEditor(id) {
    const d = load();
    const items = d[currentTab] || [];
    const existing = id ? items.find(x => x.id === id) : null;
    const isEdit = !!existing;

    const labels = { ideas: '💡 Idea', titles: '📝 Title', scripts: '🎬 Script' };
    const fieldLabel = { ideas: 'Idea Title', titles: 'Title', scripts: 'Script Title' };
    const notesLabel = { ideas: 'Notes / Description', titles: 'Notes (optional)', scripts: 'Script Content' };

    const bg = document.createElement('div');
    bg.className = 'qvhw-modal-bg';
    bg.innerHTML = `
      <div class="qvhw-modal" onclick="event.stopPropagation()">
        <h3>${isEdit ? 'Edit ' : 'Add '}${labels[currentTab]}</h3>
        <div class="qvhw-field">
          <label>${fieldLabel[currentTab]}</label>
          <input type="text" id="qvhwM-title" maxlength="200" value="${existing ? esc(existing.title) : ''}" placeholder="${fieldLabel[currentTab]}..." />
        </div>
        <div class="qvhw-field">
          <label>${notesLabel[currentTab]}</label>
          <textarea id="qvhwM-notes" maxlength="20000" placeholder="Details...">${existing ? esc(existing.notes || '') : ''}</textarea>
        </div>
        <div class="qvhw-modal-btns">
          <button class="qvhw-modal-btn cancel" id="qvhwM-cancel">Cancel</button>
          <button class="qvhw-modal-btn primary" id="qvhwM-save">${isEdit ? 'Update' : 'Save'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(bg);

    setTimeout(() => {
      const inp = document.getElementById('qvhwM-title');
      if (inp) inp.focus();
    }, 100);

    function close() { if (bg.parentNode) document.body.removeChild(bg); }

    document.getElementById('qvhwM-cancel').addEventListener('click', close);
    bg.addEventListener('click', (e) => { if (e.target === bg) close(); });

    document.getElementById('qvhwM-save').addEventListener('click', () => {
      const title = document.getElementById('qvhwM-title').value.trim();
      const notes = document.getElementById('qvhwM-notes').value.trim();
      if (!title && !notes) { QVH.toast('Kuch likho pehle', 'error'); return; }

      const data = load();
      if (isEdit) {
        const idx = data[currentTab].findIndex(x => x.id === id);
        if (idx !== -1) {
          data[currentTab][idx].title = title || 'Untitled';
          data[currentTab][idx].notes = notes;
          data[currentTab][idx].ts = Date.now();
        }
      } else {
        data[currentTab].push({
          id: uid(),
          title: title || 'Untitled',
          notes,
          ts: Date.now()
        });
      }
      save(data);
      close();
      renderStats();
      renderList();
      QVH.toast(isEdit ? 'Updated ✅' : 'Saved ✅', 'success');
    });

    // Ctrl+Enter to save
    bg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        document.getElementById('qvhwM-save').click();
      }
      if (e.key === 'Escape') close();
    });
  }

  /* ============================================================
     DELETE
     ============================================================ */
  function deleteItem(id) {
    if (!confirm('Delete this item? Ye undo nahi hoga.')) return;
    const d = load();
    d[currentTab] = d[currentTab].filter(x => x.id !== id);
    save(d);
    renderStats();
    renderList();
    QVH.toast('Deleted', 'success');
  }

  /* ============================================================
     COPY
     ============================================================ */
  function copyItem(id) {
    const d = load();
    const it = d[currentTab].find(x => x.id === id);
    if (!it) return;
    const text = `${it.title || 'Untitled'}\n\n${it.notes || ''}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => QVH.toast('Copied! 📋', 'success'))
        .catch(() => QVH.toast('Copy failed', 'error'));
    }
  }

  /* ============================================================
     EXPORT ALL
     ============================================================ */
  function exportAll() {
    const d = load();
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'Qunverio Creator Workspace',
      ideas: d.ideas,
      titles: d.titles,
      scripts: d.scripts
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qunverio-workspace-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    QVH.toast('Exported ✅', 'success');
  }

  /* ============================================================
     IMPORT
     ============================================================ */
  function importAll() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json,.json';
    inp.addEventListener('change', () => {
      const file = inp.files && inp.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          const incoming = {
            ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
            titles: Array.isArray(parsed.titles) ? parsed.titles : [],
            scripts: Array.isArray(parsed.scripts) ? parsed.scripts : []
          };
          const current = load();
          const totalNew = incoming.ideas.length + incoming.titles.length + incoming.scripts.length;
          if (totalNew === 0) { QVH.toast('No items found in file', 'error'); return; }
          if (!confirm(`Import ${totalNew} items? Existing items will be merged.`)) return;

          // Merge — avoid id collision
          const mergeKey = (arr, existing) => {
            const existingIds = new Set(existing.map(x => x.id));
            return existing.concat(arr.map(it => {
              if (existingIds.has(it.id)) {
                return { ...it, id: uid() };
              }
              return it;
            }));
          };
          const merged = {
            ideas: mergeKey(incoming.ideas, current.ideas),
            titles: mergeKey(incoming.titles, current.titles),
            scripts: mergeKey(incoming.scripts, current.scripts)
          };
          save(merged);
          renderStats();
          renderList();
          QVH.toast(`Imported ${totalNew} items ✅`, 'success');
        } catch (e) {
          console.error(e);
          QVH.toast('Invalid JSON file', 'error');
        }
      };
      reader.readAsText(file);
    });
    inp.click();
  }

  /* ============================================================
     REGISTER
     ============================================================ */
  QVH.registerRenderer('workspace', render);
  console.log('%c✅ Workspace registered', 'color:#3b82f6;font-weight:bold');
})();