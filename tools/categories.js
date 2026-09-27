/* ============================================================
   QUNVERIO — CATEGORIES VIEW (tools/categories.js)
   Category grid, category detail view logic
   ============================================================ */

console.log('%cCategories module loading...', 'color:#8b5cf6');

/* ============================================================
   RENDER CATEGORY GRID
   ============================================================ */
window.renderCategories = function() {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;
  const cats = window.CATEGORIES || [];
  const tools = window.EXTRA_TOOLS || [];
  if (cats.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="es-emoji">🚧</div><div class="es-title">No Categories</div>Categories loading...</div>';
    return;
  }
  grid.innerHTML = cats.map(c => {
    const count = tools.filter(t => t.cat === c.id).length;
    return `<div class="category-card" onclick="openCategoryView('${c.id}')">
      <div class="cat-icon" style="background:${c.gradient}">${c.icon}</div>
      <div class="cat-name">${c.name}</div>
      <div class="cat-desc">${c.desc}</div>
      <div class="cat-count">${count} tool${count !== 1 ? 's' : ''}</div>
      <div class="cat-arrow">→</div>
    </div>`;
  }).join('');
};

/* ============================================================
   OPEN CATEGORY VIEW
   ============================================================ */
window.openCategoryView = function(catId) {
  const cat = (window.CATEGORIES || []).find(c => c.id === catId);
  if (!cat) {
    if (typeof toast === 'function') toast('Category not found', 'error');
    return;
  }
  const tools = (window.EXTRA_TOOLS || []).filter(t => t.cat === catId);
  
  const titleEl = document.getElementById('catViewTitle');
  const subEl = document.getElementById('catViewSub');
  const listEl = document.getElementById('catViewList');
  
  if (titleEl) titleEl.textContent = cat.icon + ' ' + cat.name;
  if (subEl) subEl.textContent = tools.length + ' tool' + (tools.length !== 1 ? 's' : '') + ' available';
  
  if (listEl) {
    if (tools.length === 0) {
      listEl.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="es-emoji">🚧</div><div class="es-title">Coming Soon</div>Tools are being added to this category</div>';
    } else {
      listEl.innerHTML = tools.map(t => window.extraToolCardHTML(t)).join('');
    }
  }
  
  if (typeof switchView === 'function') switchView('categoryView');
  if (typeof updateBottomNav === 'function') updateBottomNav('tools');
};

/* ============================================================
   RE-RENDER CATEGORY TOOLS (agar category view active hai)
   ============================================================ */
window.renderCategoryTools = function() {
  const active = document.querySelector('.workspace.active');
  if (active && active.id === 'categoryView') {
    const title = document.getElementById('catViewTitle')?.textContent || '';
    const cat = (window.CATEGORIES || []).find(c => title.includes(c.name));
    if (cat) window.openCategoryView(cat.id);
  }
};

/* ============================================================
   OPEN TOOLS VIEW (categories wali screen)
   ============================================================ */
window.openToolsView = function() {
  window.renderCategories();
  if (typeof switchView === 'function') switchView('toolsView');
  if (typeof updateBottomNav === 'function') updateBottomNav('tools');
};

/* ============================================================
   AUTO-REFRESH ON LOAD
   ============================================================ */
setTimeout(() => {
  const catGrid = document.getElementById('categoryGrid');
  if (catGrid && (window.CATEGORIES || []).length > 0) {
    window.renderCategories();
    console.log('%c✅ Categories rendered: ' + (window.CATEGORIES || []).length, 'color:#8b5cf6');
  }
}, 200);

console.log('%c✅ Categories module loaded', 'color:#8b5cf6;font-weight:bold');