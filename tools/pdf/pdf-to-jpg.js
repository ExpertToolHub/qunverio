/* ============================================================
   QUNVERIO — PDF TO JPG (tools/pdf/pdf-to-jpg.js) — FINAL v1
   Convert PDF pages to JPG/PNG images
   Uses: pdf.js + JSZip (multi output)
   ============================================================ */

console.log('%cPDF to JPG module loading...', 'color:#10b981;font-weight:bold');

/* ============================================================
   STATE
   ============================================================ */
let pjFile = null;
let pjPages = [];        // [{ n, viewportW, viewportH, selected }]
let pjBusy = false;
let pjPdfDoc = null;     // pdf.js document

let pjSettings = {
  quality: 'medium',     // low | medium | high
  format: 'jpg'          // jpg | png
};

/* ============================================================
   DPI MAP
   ============================================================ */
const PJ_SCALES = {
  low: 1.0,      // ~72 DPI
  medium: 2.0,   // ~150 DPI
  high: 4.0      // ~300 DPI
};

/* ============================================================
   HELPERS
   ============================================================ */
function pjFmtSize(bytes) {
  if (!bytes) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0, n = bytes;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return n.toFixed(n < 10 ? 2 : 1) + ' ' + u[i];
}

function pjFmtName(name, max = 34) {
  if (!name) return '';
  if (name.length <= max) return name;
  const ext = name.split('.').pop();
  const base = name.slice(0, max - ext.length - 4);
  return base + '...' + ext;
}

function pjToast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

function pjBaseName(name) {
  return (name || 'document').replace(/\.pdf$/i, '').replace(/[^a-z0-9_\-]/gi, '_');
}

/* ============================================================
   LOAD PDF
   ============================================================ */
async function pjLoadFile(file) {
  if (!file) return;
  if (!(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
    pjToast('❌ Sirf PDF file select karo', 'error');
    return;
  }
  if (file.size > 200 * 1024 * 1024) {
    pjToast('❌ PDF 200MB se bada hai', 'error');
    return;
  }
  if (pjBusy) return;
  if (typeof pdfjsLib === 'undefined') {
    pjToast('❌ pdf.js load nahi hui', 'error');
    return;
  }

  pjBusy = true;
  const statusEl = document.getElementById('pjStatus');
  if (statusEl) statusEl.textContent = '⏳ Loading PDF...';

  try {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    pjPdfDoc = pdf;
    pjFile = { name: file.name, size: file.size, pages: pdf.numPages };

    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      pages.push({
        n: i,
        viewportW: Math.round(viewport.width),
        viewportH: Math.round(viewport.height),
        selected: true
      });
      if (statusEl) statusEl.textContent = `⏳ Reading page ${i}/${pdf.numPages}...`;
    }
    pjPages = pages;

    if (statusEl) statusEl.textContent = '';
    pjRenderLoaded();
    pjToast(`✅ ${pdf.numPages} pages loaded`, 'success');
  } catch (e) {
    console.error(e);
    pjToast('❌ PDF load nahi hui: ' + (e.message || ''), 'error');
    if (statusEl) statusEl.textContent = '';
  } finally {
    pjBusy = false;
  }
}

/* ============================================================
   RENDER AFTER LOAD
   ============================================================ */
async function pjRenderLoaded() {
  const drop = document.getElementById('pjDrop');
  const panel = document.getElementById('pjPanel');
  if (drop) drop.style.display = 'none';
  if (panel) panel.style.display = 'block';

  const fileInfo = document.getElementById('pjFileInfo');
  if (fileInfo && pjFile) {
    fileInfo.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--surface-2);border-radius:12px;border:1px solid var(--border)">
        <span style="font-size:26px">📄</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${pjFmtName(pjFile.name, 34)}</div>
          <div style="font-size:11.5px;color:var(--text-3);margin-top:2px">${pjFmtSize(pjFile.size)} • ${pjFile.pages} pages</div>
        </div>
        <button class="btn btn-sm btn-secondary" onclick="pjReset()">Change</button>
      </div>
    `;
  }

  const pageCount = document.getElementById('pjPageCount');
  if (pageCount) pageCount.textContent = pjFile.pages;

  const selCount = document.getElementById('pjSelectedCount');
  if (selCount) selCount.textContent = pjPages.filter(p => p.selected).length;

  // Render thumbnails (lazy — small preview only)
  await pjRenderThumbs();
}

async function pjRenderThumbs() {
  const grid = document.getElementById('pjPagesGrid');
  if (!grid || !pjPdfDoc) return;

  grid.innerHTML = pjPages.map(p => `
    <div class="pj-page ${p.selected ? 'selected' : ''}" data-n="${p.n}" onclick="pjTogglePage(${p.n})">
      <div class="pj-page-thumb" id="pjThumb${p.n}">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-3);font-size:12px">Page ${p.n}</div>
        <div class="pj-page-check">${p.selected ? '✓' : ''}</div>
      </div>
      <div class="pj-page-num">Page ${p.n}</div>
    </div>
  `).join('');

  // Generate thumbs async (small scale)
  for (const p of pjPages) {
    try {
      const page = await pjPdfDoc.getPage(p.n);
      const viewport = page.getViewport({ scale: 0.35 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;

      const thumbEl = document.getElementById('pjThumb' + p.n);
      if (thumbEl) {
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/jpeg', 0.7);
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0';
        thumbEl.insertBefore(img, thumbEl.firstChild);
      }
      await new Promise(r => setTimeout(r, 20));
    } catch (e) {
      console.warn('Thumb fail page', p.n, e);
    }
  }
}

/* ============================================================
   PAGE SELECTION
   ============================================================ */
window.pjTogglePage = (n) => {
  const p = pjPages.find(x => x.n === n);
  if (!p) return;
  p.selected = !p.selected;
  const el = document.querySelector(`.pj-page[data-n="${n}"]`);
  if (el) {
    el.classList.toggle('selected', p.selected);
    const check = el.querySelector('.pj-page-check');
    if (check) check.textContent = p.selected ? '✓' : '';
  }
  const selCount = document.getElementById('pjSelectedCount');
  if (selCount) selCount.textContent = pjPages.filter(x => x.selected).length;
};

window.pjSelectAll = () => {
  pjPages.forEach(p => p.selected = true);
  document.querySelectorAll('.pj-page').forEach(el => {
    el.classList.add('selected');
    const c = el.querySelector('.pj-page-check');
    if (c) c.textContent = '✓';
  });
  document.getElementById('pjSelectedCount').textContent = pjPages.length;
};

window.pjSelectNone = () => {
  pjPages.forEach(p => p.selected = false);
  document.querySelectorAll('.pj-page').forEach(el => {
    el.classList.remove('selected');
    const c = el.querySelector('.pj-page-check');
    if (c) c.textContent = '';
  });
  document.getElementById('pjSelectedCount').textContent = '0';
};

window.pjInvertSelection = () => {
  pjPages.forEach(p => p.selected = !p.selected);
  document.querySelectorAll('.pj-page').forEach(el => {
    const n = parseInt(el.dataset.n, 10);
    const p = pjPages.find(x => x.n === n);
    if (p) {
      el.classList.toggle('selected', p.selected);
      const c = el.querySelector('.pj-page-check');
      if (c) c.textContent = p.selected ? '✓' : '';
    }
  });
  document.getElementById('pjSelectedCount').textContent = pjPages.filter(x => x.selected).length;
};

/* ============================================================
   SETTINGS
   ============================================================ */
window.pjSetSetting = (key, val) => {
  pjSettings[key] = val;
  const groups = { quality: 'pjQuality', format: 'pjFormat' };
  if (groups[key]) {
    const wrap = document.getElementById(groups[key]);
    if (wrap) {
      wrap.querySelectorAll('.pj-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.val === String(val));
      });
    }
  }
};

/* ============================================================
   CONVERT — MAIN LOGIC
   ============================================================ */
window.pjConvert = async () => {
  if (!pjPdfDoc) { pjToast('❌ Pehle PDF upload karo', 'error'); return; }
  if (pjBusy) return;

  const selectedPages = pjPages.filter(p => p.selected).map(p => p.n);
  if (selectedPages.length === 0) {
    pjToast('❌ Kam se kam 1 page select karo', 'error');
    return;
  }

  pjBusy = true;
  const btn = document.getElementById('pjConvertBtn');
  const progWrap = document.getElementById('pjProgress');
  const progFill = document.getElementById('pjProgressFill');
  const progText = document.getElementById('pjProgressText');
  const progPct = document.getElementById('pjProgressPct');

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Converting...'; }
  if (progWrap) progWrap.style.display = 'block';

  try {
    const scale = PJ_SCALES[pjSettings.quality] || 2.0;
    const isPng = pjSettings.format === 'png';
    const ext = isPng ? 'png' : 'jpg';
    const mime = isPng ? 'image/png' : 'image/jpeg';
    const base = pjBaseName(pjFile.name);

    const results = []; // [{ name, blob }]

    for (let i = 0; i < selectedPages.length; i++) {
      const pageNum = selectedPages[i];
      const pct = Math.round((i / selectedPages.length) * 100);
      if (progFill) progFill.style.width = pct + '%';
      if (progPct) progPct.textContent = pct + '%';
      if (progText) progText.textContent = `Converting ${i + 1}/${selectedPages.length}: Page ${pageNum} (${scale}x)`;

      const page = await pjPdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, mime, isPng ? undefined : 0.92);
      });

      if (!blob) throw new Error('Blob creation failed for page ' + pageNum);

      results.push({
        name: `${base}_page_${String(pageNum).padStart(3, '0')}.${ext}`,
        blob
      });

      // free memory
      canvas.width = 0;
      canvas.height = 0;

      await new Promise(r => setTimeout(r, 30));
    }

    if (progFill) progFill.style.width = '100%';
    if (progPct) progPct.textContent = '100%';
    if (progText) progText.textContent = '📦 Packaging...';
    await new Promise(r => setTimeout(r, 100));

    // Single page → direct download
    if (results.length === 1) {
      const url = URL.createObjectURL(results[0].blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = results[0].name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      pjToast(`✅ 1 ${ext.toUpperCase()} ready (${pjFmtSize(results[0].blob.size)})`, 'success');
      if (progText) progText.textContent = `✅ Done — ${results[0].name}`;
    } else {
      if (typeof JSZip === 'undefined') {
        pjToast('❌ JSZip load nahi hui', 'error');
        if (progText) progText.textContent = '❌ JSZip missing';
        return;
      }
      const zip = new JSZip();
      results.forEach(r => zip.file(r.name, r.blob));
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'STORE'  // images already compressed
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${base}_images_${results.length}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      pjToast(`✅ ${results.length} images in ZIP (${pjFmtSize(zipBlob.size)})`, 'success');
      if (progText) progText.textContent = `✅ Done — ${results.length} images`;
    }
  } catch (e) {
    console.error('Convert error:', e);
    pjToast('❌ Convert fail: ' + (e.message || 'unknown'), 'error');
    if (progText) progText.textContent = '❌ Failed';
  } finally {
    pjBusy = false;
    if (btn) { btn.disabled = false; btn.textContent = '🖼️ Convert to JPG'; }
    setTimeout(() => {
      if (progWrap) progWrap.style.display = 'none';
      if (progFill) progFill.style.width = '0%';
      if (progPct) progPct.textContent = '';
      if (progText) progText.textContent = '';
    }, 3500);
  }
};

/* ============================================================
   RESET
   ============================================================ */
window.pjReset = () => {
  pjFile = null;
  pjPages = [];
  pjPdfDoc = null;
  pjBusy = false;
  const drop = document.getElementById('pjDrop');
  const panel = document.getElementById('pjPanel');
  const input = document.getElementById('pjInput');
  if (drop) drop.style.display = 'block';
  if (panel) panel.style.display = 'none';
  if (input) input.value = '';
  pjToast('🔄 Reset done');
};

/* ============================================================
   RENDER (main HTML)
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['pdf-to-jpg'] = () => `
<div class="pj-wrap">

  <div id="pjDrop" class="pj-drop">
    <div class="pj-drop-icon">🖼️</div>
    <div class="pj-drop-title">PDF file drag & drop karo</div>
    <div class="pj-drop-sub">ya click karke select karo • Max 200MB</div>
    <button class="btn btn-primary" onclick="document.getElementById('pjInput').click()">
      📁 Select PDF
    </button>
    <input type="file" id="pjInput" accept="application/pdf,.pdf" hidden>
  </div>

  <div id="pjStatus" style="font-size:12.5px;color:var(--text-3);text-align:center;margin-top:10px"></div>

  <div id="pjPanel" style="display:none;margin-top:14px">

    <div id="pjFileInfo"></div>

    <div class="pj-settings">
      <div class="pj-setting-row">
        <label>🎚️ Quality</label>
        <div class="pj-chips" id="pjQuality">
          <div class="pj-chip" data-val="low" onclick="pjSetSetting('quality','low')">Low (~72 DPI)</div>
          <div class="pj-chip active" data-val="medium" onclick="pjSetSetting('quality','medium')">Medium (~150 DPI)</div>
          <div class="pj-chip" data-val="high" onclick="pjSetSetting('quality','high')">High (~300 DPI)</div>
        </div>
      </div>

      <div class="pj-setting-row">
        <label>🖼️ Format</label>
        <div class="pj-chips" id="pjFormat">
          <div class="pj-chip active" data-val="jpg" onclick="pjSetSetting('format','jpg')">JPG</div>
          <div class="pj-chip" data-val="png" onclick="pjSetSetting('format','png')">PNG</div>
        </div>
      </div>
    </div>

    <div style="margin-top:14px;display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn btn-sm btn-secondary" onclick="pjSelectAll()">Select All</button>
      <button class="btn btn-sm btn-secondary" onclick="pjSelectNone()">Select None</button>
      <button class="btn btn-sm btn-secondary" onclick="pjInvertSelection()">Invert</button>
      <div style="margin-left:auto;font-size:12px;color:var(--text-3);align-self:center">
        Total: <strong id="pjPageCount">0</strong> • Selected: <strong id="pjSelectedCount">0</strong>
      </div>
    </div>

    <div class="pj-pages-grid" id="pjPagesGrid"></div>

    <div id="pjProgress" style="display:none;margin-top:14px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-3);margin-bottom:6px">
        <span id="pjProgressText"></span>
        <span id="pjProgressPct"></span>
      </div>
      <div style="height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden">
        <div id="pjProgressFill" style="height:100%;width:0%;background:var(--gradient);transition:width .3s"></div>
      </div>
    </div>

    <div class="btn-group" style="margin-top:16px">
      <button class="btn btn-secondary" onclick="pjReset()">🔄 Reset</button>
      <button class="btn btn-primary" id="pjConvertBtn" onclick="pjConvert()">🖼️ Convert to JPG</button>
    </div>

    <div class="hint" style="margin-top:14px;text-align:center">
      🔒 100% browser me process — files upload nahi hoti
    </div>
  </div>
</div>

<style>
  .pj-wrap { padding: 4px 0; }
  .pj-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 30px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .pj-drop:hover, .pj-drop.dragover { border-color: var(--primary); background: var(--surface-hover); }
  .pj-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .pj-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .pj-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }

  .pj-settings { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; margin-top: 12px; }
  .pj-setting-row { margin-bottom: 14px; }
  .pj-setting-row:last-child { margin-bottom: 0; }
  .pj-setting-row label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2); margin-bottom: 8px; }
  .pj-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .pj-chip { padding: 8px 14px; border-radius: 10px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .pj-chip:hover { background: var(--surface-hover); }
  .pj-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }

  .pj-pages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px; margin-top: 12px; max-height: 420px; overflow-y: auto; padding: 10px; background: var(--surface-2); border-radius: 12px; }
  .pj-page { cursor: pointer; text-align: center; transition: all .15s; }
  .pj-page-thumb { position: relative; border-radius: 8px; overflow: hidden; border: 2px solid transparent; background: #fff; aspect-ratio: 3/4; }
  .pj-page-thumb img { position: absolute; top: 0; left: 0; }
  .pj-page-check { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,.5); border: 2px solid #fff; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; transition: all .15s; z-index: 2; }
  .pj-page.selected .pj-page-thumb { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.2); }
  .pj-page.selected .pj-page-check { background: var(--gradient); }
  .pj-page-num { font-size: 11px; color: var(--text-3); margin-top: 4px; font-weight: 600; }

  @media (max-width: 480px) {
    .pj-pages-grid { grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: 6px; }
    .pj-chip { padding: 7px 11px; font-size: 11.5px; }
  }
</style>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['pdf-to-jpg'] = () => {
  const drop = document.getElementById('pjDrop');
  const input = document.getElementById('pjInput');
  if (!drop || !input) return;

  // default chip highlights
  pjSetSetting('quality', pjSettings.quality);
  pjSetSetting('format', pjSettings.format);

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });

  input.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      pjLoadFile(e.target.files[0]);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      pjLoadFile(e.dataTransfer.files[0]);
    }
  });
};

console.log('%c✅ PDF to JPG loaded', 'color:#10b981;font-weight:bold');