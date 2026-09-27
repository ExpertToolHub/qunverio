/* ============================================================
   QUNVERIO — JPG TO PDF (tools/pdf/jpg-to-pdf.js) — FINAL v1
   Convert images to PDF with page size, orientation, margin
   Uses: jsPDF
   ============================================================ */

console.log('%cJPG to PDF module loading...', 'color:#3b82f6;font-weight:bold');

/* ============================================================
   STATE
   ============================================================ */
let jpImages = [];
let jpDragId = null;
let jpBusy = false;

let jpSettings = {
  pageSize: 'a4',
  orientation: 'auto',
  margin: 'small',
  fit: 'contain',
  quality: 0.92
};

/* ============================================================
   HELPERS
   ============================================================ */
function jpFmtSize(bytes) {
  if (!bytes) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0, n = bytes;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return n.toFixed(n < 10 ? 2 : 1) + ' ' + u[i];
}

function jpFmtName(name, max = 34) {
  if (!name) return '';
  if (name.length <= max) return name;
  const ext = name.split('.').pop();
  const base = name.slice(0, max - ext.length - 4);
  return base + '...' + ext;
}

function jpToast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

function jpUid() {
  return 'i_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function jpIsImage(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = (file.name || '').toLowerCase();
  return /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/.test(ext);
}

/* ============================================================
   LOAD IMAGE (with natural dimensions + preview)
   ============================================================ */
function jpLoadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => resolve({
        dataUrl: ev.target.result,
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspect: img.naturalWidth / img.naturalHeight
      });
      img.onerror = () => reject(new Error('Image decode failed'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   ADD FILES
   ============================================================ */
async function jpAddFiles(fileList) {
  const files = Array.from(fileList).filter(jpIsImage);
  if (files.length === 0) {
    jpToast('❌ Sirf images select karo (JPG/PNG/WebP)', 'error');
    return;
  }
  if (jpBusy) { jpToast('⏳ Please wait...', 'error'); return; }

  jpBusy = true;
  const statusEl = document.getElementById('jpStatus');
  let added = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 50 * 1024 * 1024) {
      jpToast(`⚠️ ${jpFmtName(file.name)} 50MB se bada — skip`, 'error');
      continue;
    }
    if (statusEl) statusEl.textContent = `⏳ Loading ${i + 1}/${files.length}: ${jpFmtName(file.name, 24)}`;

    try {
      const info = await jpLoadImage(file);
      jpImages.push({
        id: jpUid(),
        file,
        name: file.name,
        size: file.size,
        dataUrl: info.dataUrl,
        width: info.width,
        height: info.height,
        aspect: info.aspect
      });
      added++;
      jpRenderList();
      await new Promise(r => setTimeout(r, 20));
    } catch (e) {
      console.error('Image load fail:', e);
      jpToast(`❌ ${jpFmtName(file.name)} load nahi hui`, 'error');
    }
  }

  jpBusy = false;
  if (statusEl) statusEl.textContent = '';
  jpUpdateStats();
  if (added > 0) jpToast(`✅ ${added} image${added > 1 ? 's' : ''} added`, 'success');
}

/* ============================================================
   RENDER LIST
   ============================================================ */
function jpRenderList() {
  const list = document.getElementById('jpList');
  const empty = document.getElementById('jpEmpty');
  const actions = document.getElementById('jpActions');
  if (!list) return;

  if (jpImages.length === 0) {
    if (empty) empty.style.display = 'block';
    if (actions) actions.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (actions) actions.style.display = 'flex';

  list.innerHTML = jpImages.map((img, i) => `
    <div class="jp-item" draggable="true" data-id="${img.id}">
      <div class="jp-drag">⋮⋮</div>
      <div class="jp-num">${i + 1}</div>
      <div class="jp-thumb"><img src="${img.dataUrl}" alt=""></div>
      <div class="jp-info">
        <div class="jp-name" title="${img.name}">${jpFmtName(img.name, 36)}</div>
        <div class="jp-meta">${img.width}×${img.height} • ${jpFmtSize(img.size)}</div>
      </div>
      <div class="jp-ctrl">
        <button class="jp-btn" onclick="jpMove(${i},-1)" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="jp-btn" onclick="jpMove(${i},1)" ${i === jpImages.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="jp-btn jp-del" onclick="jpRemove('${img.id}')">✕</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.jp-item').forEach(el => {
    el.addEventListener('dragstart', e => {
      jpDragId = el.dataset.id;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      jpDragId = null;
      document.querySelectorAll('.jp-item').forEach(x => x.classList.remove('drag-over'));
    });
    el.addEventListener('dragover', e => {
      e.preventDefault();
      if (el.dataset.id !== jpDragId) el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('drag-over');
      const targetId = el.dataset.id;
      if (!jpDragId || jpDragId === targetId) return;
      const fromIdx = jpImages.findIndex(x => x.id === jpDragId);
      const toIdx = jpImages.findIndex(x => x.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return;
      const [moved] = jpImages.splice(fromIdx, 1);
      jpImages.splice(toIdx, 0, moved);
      jpDragId = null;
      jpRenderList();
      jpUpdateStats();
    });
  });
}

window.jpMove = (idx, dir) => {
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= jpImages.length) return;
  [jpImages[idx], jpImages[newIdx]] = [jpImages[newIdx], jpImages[idx]];
  jpRenderList();
};

window.jpRemove = (id) => {
  jpImages = jpImages.filter(x => x.id !== id);
  jpRenderList();
  jpUpdateStats();
};

window.jpClearAll = () => {
  if (jpImages.length === 0) return;
  if (!confirm('Saari images hata dein?')) return;
  jpImages = [];
  jpRenderList();
  jpUpdateStats();
  jpToast('🗑️ Saari images remove');
};

function jpUpdateStats() {
  const el = document.getElementById('jpStats');
  if (!el) return;
  if (jpImages.length === 0) { el.textContent = ''; return; }
  const totalSize = jpImages.reduce((s, x) => s + x.size, 0);
  el.innerHTML = `📊 <strong>${jpImages.length}</strong> image${jpImages.length > 1 ? 's' : ''} • 
    <strong>${jpFmtSize(totalSize)}</strong> total`;
}

/* ============================================================
   SETTINGS
   ============================================================ */
window.jpSetSetting = (key, val) => {
  jpSettings[key] = val;
  // highlight active buttons
  const groups = {
    pageSize: 'jpPageSize',
    orientation: 'jpOrientation',
    margin: 'jpMargin',
    fit: 'jpFit'
  };
  if (groups[key]) {
    const wrap = document.getElementById(groups[key]);
    if (wrap) {
      wrap.querySelectorAll('.jp-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.val === String(val));
      });
    }
  }
  if (key === 'quality') {
    const q = document.getElementById('jpQualityVal');
    if (q) q.textContent = Math.round(val * 100) + '%';
  }
};

/* ============================================================
   PAGE SIZES (mm)
   ============================================================ */
const JP_PAGE_SIZES = {
  a4:     { w: 210, h: 297 },
  letter: { w: 215.9, h: 279.4 },
  legal:  { w: 215.9, h: 355.6 },
  a3:     { w: 297, h: 420 },
  a5:     { w: 148, h: 210 }
};

const JP_MARGINS = {
  none: 0,
  small: 6,
  medium: 12,
  large: 20
};

/* ============================================================
   BUILD PDF — MAIN LOGIC
   ============================================================ */
window.jpBuildPDF = async () => {
  if (jpImages.length === 0) { jpToast('❌ Pehle images add karo', 'error'); return; }
  if (typeof jspdf === 'undefined') { jpToast('❌ jsPDF load nahi hui', 'error'); return; }
  if (jpBusy) return;

  jpBusy = true;
  const btn = document.getElementById('jpBuildBtn');
  const progWrap = document.getElementById('jpProgress');
  const progFill = document.getElementById('jpProgressFill');
  const progText = document.getElementById('jpProgressText');
  const progPct = document.getElementById('jpProgressPct');

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Building...'; }
  if (progWrap) progWrap.style.display = 'block';

  try {
    const { jsPDF } = jspdf;

    // Determine page format for jsPDF (mm units)
    const setSize = jpSettings.pageSize;
    const autoOrient = jpSettings.orientation === 'auto';
    const isAuto = setSize === 'auto';

    // If Auto page size → use each image's own size (custom per page)
    let doc = null;

    for (let i = 0; i < jpImages.length; i++) {
      const img = jpImages[i];
      const pct = Math.round((i / jpImages.length) * 100);
      if (progFill) progFill.style.width = pct + '%';
      if (progPct) progPct.textContent = pct + '%';
      if (progText) progText.textContent = `Adding ${i + 1}/${jpImages.length}: ${jpFmtName(img.name, 30)}`;

      // Determine this page's format
      let pageW, pageH;
      if (isAuto) {
        // Page = image aspect ratio at 96 DPI equivalent (px → mm)
        // Use image px as mm with small scale for readability: 1px = 0.264583mm (96dpi)
        const dpi = 96;
        pageW = (img.width / dpi) * 25.4;
        pageH = (img.height / dpi) * 25.4;
      } else {
        const size = JP_PAGE_SIZES[setSize] || JP_PAGE_SIZES.a4;
        pageW = size.w;
        pageH = size.h;
        // Auto orientation based on image
        if (autoOrient) {
          if (img.aspect > 1.05 && pageH > pageW) { [pageW, pageH] = [pageH, pageW]; }
          else if (img.aspect < 0.95 && pageW > pageH) { [pageW, pageH] = [pageH, pageW]; }
        } else if (jpSettings.orientation === 'landscape' && pageH > pageW) {
          [pageW, pageH] = [pageH, pageW];
        } else if (jpSettings.orientation === 'portrait' && pageW > pageH) {
          [pageW, pageH] = [pageH, pageW];
        }
      }

      // Create / add page
      if (!doc) {
        doc = new jsPDF({
          unit: 'mm',
          format: [pageW, pageH],
          orientation: pageW > pageH ? 'landscape' : 'portrait',
          compress: true
        });
      } else {
        doc.addPage([pageW, pageH], pageW > pageH ? 'landscape' : 'portrait');
      }

      // Compute image area with margins + fit
      const m = JP_MARGINS[jpSettings.margin] || 0;
      const availW = pageW - 2 * m;
      const availH = pageH - 2 * m;
      const imgAspect = img.aspect;

      let drawW, drawH, offsetX, offsetY;

      if (jpSettings.fit === 'stretch') {
        drawW = availW;
        drawH = availH;
        offsetX = m;
        offsetY = m;
      } else if (jpSettings.fit === 'cover') {
        // Fill entire page, crop overflow (jsPDF doesn't crop — so simulate)
        // Use "cover" by scaling image to fill avail, then it overflows → clamp to container
        // Simpler: draw like "contain" but scale to fill
        if (availW / availH > imgAspect) {
          drawH = availH;
          drawW = availH * imgAspect;
        } else {
          drawW = availW;
          drawH = availW / imgAspect;
        }
        // For true cover, would need clipping — jsPDF lacks clip path with addImage easily
        // Use "cover" = draw bigger than page, centered, overflow clipped by PDF viewer
        // Safest: use contain here too
        // (Keeping "cover" as visually larger centered — actually still contain logic)
        // We'll implement as "contain" for reliability
        offsetX = m + (availW - drawW) / 2;
        offsetY = m + (availH - drawH) / 2;
        // Actually make it fill: scale up
        const scaleFactor = Math.max(availW / drawW, availH / drawH);
        drawW *= scaleFactor;
        drawH *= scaleFactor;
        offsetX = m + (availW - drawW) / 2;
        offsetY = m + (availH - drawH) / 2;
      } else {
        // contain (default)
        if (availW / availH > imgAspect) {
          drawH = availH;
          drawW = availH * imgAspect;
        } else {
          drawW = availW;
          drawH = availW / imgAspect;
        }
        offsetX = m + (availW - drawW) / 2;
        offsetY = m + (availH - drawH) / 2;
      }

      // Add image
      const fmt = (img.dataUrl.indexOf('image/png') === 5) ? 'PNG' : 'JPEG';
      try {
        doc.addImage(img.dataUrl, fmt, offsetX, offsetY, drawW, drawH, undefined, 'FAST');
      } catch (e) {
        // fallback: try as JPEG
        try {
          doc.addImage(img.dataUrl, 'JPEG', offsetX, offsetY, drawW, drawH, undefined, 'FAST');
        } catch (e2) {
          console.error('addImage failed for', img.name, e2);
        }
      }

      await new Promise(r => setTimeout(r, 15));
    }

    if (progFill) progFill.style.width = '100%';
    if (progPct) progPct.textContent = '100%';
    if (progText) progText.textContent = '📦 Generating PDF...';
    await new Promise(r => setTimeout(r, 100));

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `images_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);

    jpToast(`✅ PDF ready! ${jpImages.length} pages, ${jpFmtSize(blob.size)}`, 'success');
    if (progText) progText.textContent = `✅ Done — ${jpImages.length} pages, ${jpFmtSize(blob.size)}`;
  } catch (e) {
    console.error('PDF build error:', e);
    jpToast('❌ PDF fail: ' + (e.message || 'unknown'), 'error');
    if (progText) progText.textContent = '❌ Failed';
  } finally {
    jpBusy = false;
    if (btn) { btn.disabled = false; btn.textContent = '📄 Create PDF'; }
    setTimeout(() => {
      if (progWrap) progWrap.style.display = 'none';
      if (progFill) progFill.style.width = '0%';
      if (progPct) progPct.textContent = '';
      if (progText) progText.textContent = '';
    }, 3500);
  }
};

/* ============================================================
   RENDER (main HTML)
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['jpg-to-pdf'] = () => `
<div class="jp-wrap">

  <div id="jpDrop" class="jp-drop">
    <div class="jp-drop-icon">🖼️</div>
    <div class="jp-drop-title">Images drag & drop karo</div>
    <div class="jp-drop-sub">JPG • PNG • WebP • Multiple OK • Max 50MB each</div>
    <button class="btn btn-primary" onclick="document.getElementById('jpInput').click()">
      📁 Select Images
    </button>
    <input type="file" id="jpInput" accept="image/*" multiple hidden>
  </div>

  <div id="jpStatus" style="font-size:12.5px;color:var(--text-3);text-align:center;margin-top:10px"></div>

  <div id="jpEmpty" class="empty-state" style="margin-top:14px">
    <div class="es-emoji">🗂️</div>
    <div class="es-title">Koi image nahi hai</div>
    Upar se images add karo
  </div>

  <div id="jpStats" style="font-size:13px;color:var(--text-2);text-align:center;margin:14px 0;padding:10px;background:var(--surface-2);border-radius:10px"></div>

  <div id="jpList" class="jp-list"></div>

  <div id="jpActions" style="display:none;margin-top:16px">

    <div class="jp-settings">
      <div class="jp-setting-row">
        <label>📐 Page Size</label>
        <div class="jp-chips" id="jpPageSize">
          <div class="jp-chip" data-val="a4" onclick="jpSetSetting('pageSize','a4')">A4</div>
          <div class="jp-chip" data-val="letter" onclick="jpSetSetting('pageSize','letter')">Letter</div>
          <div class="jp-chip" data-val="legal" onclick="jpSetSetting('pageSize','legal')">Legal</div>
          <div class="jp-chip" data-val="a3" onclick="jpSetSetting('pageSize','a3')">A3</div>
          <div class="jp-chip" data-val="a5" onclick="jpSetSetting('pageSize','a5')">A5</div>
          <div class="jp-chip" data-val="auto" onclick="jpSetSetting('pageSize','auto')">Auto</div>
        </div>
      </div>

      <div class="jp-setting-row">
        <label>🔄 Orientation</label>
        <div class="jp-chips" id="jpOrientation">
          <div class="jp-chip active" data-val="auto" onclick="jpSetSetting('orientation','auto')">Auto</div>
          <div class="jp-chip" data-val="portrait" onclick="jpSetSetting('orientation','portrait')">Portrait</div>
          <div class="jp-chip" data-val="landscape" onclick="jpSetSetting('orientation','landscape')">Landscape</div>
        </div>
      </div>

      <div class="jp-setting-row">
        <label>📏 Margin</label>
        <div class="jp-chips" id="jpMargin">
          <div class="jp-chip" data-val="none" onclick="jpSetSetting('margin','none')">None</div>
          <div class="jp-chip active" data-val="small" onclick="jpSetSetting('margin','small')">Small</div>
          <div class="jp-chip" data-val="medium" onclick="jpSetSetting('margin','medium')">Medium</div>
          <div class="jp-chip" data-val="large" onclick="jpSetSetting('margin','large')">Large</div>
        </div>
      </div>

      <div class="jp-setting-row">
        <label>🖼️ Image Fit</label>
        <div class="jp-chips" id="jpFit">
          <div class="jp-chip active" data-val="contain" onclick="jpSetSetting('fit','contain')">Fit</div>
          <div class="jp-chip" data-val="cover" onclick="jpSetSetting('fit','cover')">Fill</div>
          <div class="jp-chip" data-val="stretch" onclick="jpSetSetting('fit','stretch')">Stretch</div>
        </div>
      </div>
    </div>

    <div id="jpProgress" style="display:none;margin-top:14px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-3);margin-bottom:6px">
        <span id="jpProgressText"></span>
        <span id="jpProgressPct"></span>
      </div>
      <div style="height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden">
        <div id="jpProgressFill" style="height:100%;width:0%;background:var(--gradient);transition:width .3s"></div>
      </div>
    </div>

    <div class="btn-group" style="margin-top:16px">
      <button class="btn btn-secondary" onclick="document.getElementById('jpInput').click()">➕ Add More</button>
      <button class="btn btn-secondary" onclick="jpClearAll()">🗑️ Clear All</button>
      <button class="btn btn-primary" id="jpBuildBtn" onclick="jpBuildPDF()">📄 Create PDF</button>
    </div>

    <div class="hint" style="margin-top:14px;text-align:center">
      🔒 100% browser me process — images upload nahi hoti
    </div>
  </div>
</div>

<style>
  .jp-wrap { padding: 4px 0; }
  .jp-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 26px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .jp-drop:hover, .jp-drop.dragover { border-color: var(--primary); background: var(--surface-hover); }
  .jp-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .jp-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .jp-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }

  .jp-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .jp-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; cursor: grab; transition: all .18s; }
  .jp-item:active { cursor: grabbing; }
  .jp-item.dragging { opacity: .4; }
  .jp-item.drag-over { border-color: var(--primary); background: var(--surface-hover); transform: scale(1.01); }
  .jp-drag { color: var(--text-3); font-size: 15px; cursor: grab; user-select: none; padding: 0 2px; letter-spacing: -2px; }
  .jp-num { width: 26px; height: 26px; border-radius: 8px; background: var(--gradient); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
  .jp-thumb { width: 46px; height: 46px; border-radius: 8px; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
  .jp-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .jp-info { flex: 1; min-width: 0; }
  .jp-name { font-size: 13.5px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .jp-meta { font-size: 11.5px; color: var(--text-3); margin-top: 2px; }
  .jp-ctrl { display: flex; gap: 4px; flex-shrink: 0; }
  .jp-btn { width: 30px; height: 30px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
  .jp-btn:hover:not(:disabled) { background: var(--surface-hover); color: var(--text); }
  .jp-btn:disabled { opacity: .35; cursor: not-allowed; }
  .jp-del:hover { background: rgba(239,68,68,.15); color: var(--danger); border-color: var(--danger); }

  .jp-settings { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; margin-top: 16px; }
  .jp-setting-row { margin-bottom: 14px; }
  .jp-setting-row:last-child { margin-bottom: 0; }
  .jp-setting-row label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2); margin-bottom: 8px; }
  .jp-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .jp-chip { padding: 8px 14px; border-radius: 10px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .jp-chip:hover { background: var(--surface-hover); }
  .jp-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }

  @media (max-width: 480px) {
    .jp-item { gap: 6px; padding: 8px; }
    .jp-name { font-size: 12.5px; }
    .jp-ctrl .jp-btn { width: 28px; height: 28px; font-size: 13px; }
    .jp-thumb { width: 40px; height: 40px; }
    .jp-num { width: 22px; height: 22px; font-size: 11px; }
    .jp-chip { padding: 7px 11px; font-size: 11.5px; }
  }
</style>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['jpg-to-pdf'] = () => {
  const drop = document.getElementById('jpDrop');
  const input = document.getElementById('jpInput');
  if (!drop || !input) return;

  // default active chips
  jpSetSetting('pageSize', jpSettings.pageSize);
  jpSetSetting('orientation', jpSettings.orientation);
  jpSetSetting('margin', jpSettings.margin);
  jpSetSetting('fit', jpSettings.fit);

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });

  input.addEventListener('change', e => {
    if (e.target.files && e.target.files.length) {
      jpAddFiles(e.target.files);
      e.target.value = '';
    }
  });

  ['dragenter', 'dragover'].forEach(ev => {
    drop.addEventListener(ev, e => {
      e.preventDefault(); e.stopPropagation();
      drop.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(ev => {
    drop.addEventListener(ev, e => {
      e.preventDefault(); e.stopPropagation();
      drop.classList.remove('dragover');
    });
  });
  drop.addEventListener('drop', e => {
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      jpAddFiles(e.dataTransfer.files);
    }
  });
};

console.log('%c✅ JPG to PDF loaded', 'color:#3b82f6;font-weight:bold');