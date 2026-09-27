/* ============================================================
   QUNVERIO — PDF SPLITTER (tools/pdf/splitter.js) — FINAL v1
   Split PDF by range, every page, every N pages, or halves
   Uses: pdf-lib (split) + pdf.js (thumbnails) + JSZip (multi output)
   ============================================================ */

console.log('%cPDF Splitter module loading...', 'color:#f59e0b;font-weight:bold');

/* ============================================================
   STATE
   ============================================================ */
let spFile = null;
let spPages = [];
let spMode = 'range';
let spBusy = false;

/* ============================================================
   HELPERS
   ============================================================ */
function spFmtSize(bytes) {
  if (!bytes) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0, n = bytes;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return n.toFixed(n < 10 ? 2 : 1) + ' ' + u[i];
}

function spFmtName(name, max = 32) {
  if (!name) return '';
  if (name.length <= max) return name;
  const ext = name.split('.').pop();
  const base = name.slice(0, max - ext.length - 4);
  return base + '...' + ext;
}

function spToast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

function spBaseName(name) {
  return (name || 'document').replace(/\.pdf$/i, '').replace(/[^a-z0-9_\-]/gi, '_');
}

/* ============================================================
   THUMBNAIL GENERATOR
   ============================================================ */
async function spGenThumbs(arrayBuffer) {
  if (typeof pdfjsLib === 'undefined') throw new Error('pdf.js not loaded');
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const total = pdf.numPages;
  const pages = [];

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.35 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    pages.push({ n: i, thumb: canvas.toDataURL('image/jpeg', 0.7), selected: true });
  }
  return { pdf, pages, total };
}

/* ============================================================
   LOAD PDF
   ============================================================ */
async function spLoadFile(file) {
  if (!file) return;
  if (!(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
    spToast('❌ Sirf PDF file select karo', 'error');
    return;
  }
  if (file.size > 200 * 1024 * 1024) {
    spToast('❌ PDF 200MB se bada hai', 'error');
    return;
  }
  if (spBusy) return;

  spBusy = true;
  const statusEl = document.getElementById('spStatus');
  if (statusEl) statusEl.textContent = '⏳ Loading PDF & generating previews...';

  try {
    const buffer = await file.arrayBuffer();
    const { pages } = await spGenThumbs(buffer);
    spFile = { name: file.name, size: file.size, buffer, pages: pages.length };
    spPages = pages;

    if (statusEl) statusEl.textContent = '';
    spRenderLoaded();
    spToast(`✅ ${pages.length} pages loaded`, 'success');
  } catch (e) {
    console.error(e);
    spToast('❌ PDF load nahi hui: ' + (e.message || ''), 'error');
    if (statusEl) statusEl.textContent = '';
  } finally {
    spBusy = false;
  }
}

/* ============================================================
   RENDER AFTER LOAD
   ============================================================ */
function spRenderLoaded() {
  const drop = document.getElementById('spDrop');
  const panel = document.getElementById('spPanel');
  if (drop) drop.style.display = 'none';
  if (panel) panel.style.display = 'block';

  const fileInfo = document.getElementById('spFileInfo');
  if (fileInfo && spFile) {
    fileInfo.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--surface-2);border-radius:12px;border:1px solid var(--border)">
        <span style="font-size:26px">📄</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${spFmtName(spFile.name, 34)}</div>
          <div style="font-size:11.5px;color:var(--text-3);margin-top:2px">${spFmtSize(spFile.size)} • ${spFile.pages} pages</div>
        </div>
        <button class="btn btn-sm btn-secondary" onclick="spReset()">Change</button>
      </div>
    `;
  }

  const pageCount = document.getElementById('spPageCount');
  if (pageCount) pageCount.textContent = spFile.pages;

  const rangeInput = document.getElementById('spRangeInput');
  if (rangeInput) rangeInput.value = `1-${spFile.pages}`;

  const everyNInput = document.getElementById('spEveryNInput');
  if (everyNInput) everyNInput.max = spFile.pages;

  const selCount = document.getElementById('spSelectedCount');
  if (selCount) selCount.textContent = spPages.filter(p => p.selected).length;

  spRenderPages();
  spRenderModeUI();
}

/* ============================================================
   RENDER PAGE GRID
   ============================================================ */
function spRenderPages() {
  const grid = document.getElementById('spPagesGrid');
  if (!grid) return;

  grid.innerHTML = spPages.map(p => `
    <div class="sp-page ${p.selected ? 'selected' : ''}" data-n="${p.n}" onclick="spTogglePage(${p.n})">
      <div class="sp-page-thumb">
        <img src="${p.thumb}" alt="Page ${p.n}" loading="lazy">
        <div class="sp-page-check">${p.selected ? '✓' : ''}</div>
      </div>
      <div class="sp-page-num">Page ${p.n}</div>
    </div>
  `).join('');
}

window.spTogglePage = (n) => {
  const p = spPages.find(x => x.n === n);
  if (!p) return;
  p.selected = !p.selected;
  spRenderPages();
  const selCount = document.getElementById('spSelectedCount');
  if (selCount) selCount.textContent = spPages.filter(x => x.selected).length;
};

window.spSelectAll = () => {
  spPages.forEach(p => p.selected = true);
  spRenderPages();
  const selCount = document.getElementById('spSelectedCount');
  if (selCount) selCount.textContent = spPages.length;
};

window.spSelectNone = () => {
  spPages.forEach(p => p.selected = false);
  spRenderPages();
  const selCount = document.getElementById('spSelectedCount');
  if (selCount) selCount.textContent = '0';
};

window.spInvertSelection = () => {
  spPages.forEach(p => p.selected = !p.selected);
  spRenderPages();
  const selCount = document.getElementById('spSelectedCount');
  if (selCount) selCount.textContent = spPages.filter(x => x.selected).length;
};

/* ============================================================
   MODE SWITCHER
   ============================================================ */
window.spSetMode = (mode) => {
  spMode = mode;
  document.querySelectorAll('.sp-mode-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });
  spRenderModeUI();
};

function spRenderModeUI() {
  const rangeBox = document.getElementById('spRangeBox');
  const everyNBox = document.getElementById('spEveryNBox');
  if (rangeBox) rangeBox.style.display = spMode === 'range' ? 'block' : 'none';
  if (everyNBox) everyNBox.style.display = spMode === 'everyN' ? 'block' : 'none';
}

/* ============================================================
   PARSE RANGE — "1-5, 8, 10-12"
   ============================================================ */
function spParseRange(str, maxPage) {
  const parts = String(str || '').split(',').map(s => s.trim()).filter(Boolean);
  const pages = new Set();
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(x => parseInt(x.trim(), 10));
      if (isNaN(a) || isNaN(b)) continue;
      const start = Math.max(1, Math.min(a, b));
      const end = Math.min(maxPage, Math.max(a, b));
      for (let i = start; i <= end; i++) pages.add(i);
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= maxPage) pages.add(n);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

/* ============================================================
   SPLIT — MAIN LOGIC
   ============================================================ */
window.spSplit = async () => {
  if (!spFile) { spToast('❌ Pehle PDF upload karo', 'error'); return; }
  if (typeof PDFLib === 'undefined') { spToast('❌ pdf-lib load nahi hui', 'error'); return; }
  if (spBusy) return;

  let outputs = [];
  const base = spBaseName(spFile.name);

  if (spMode === 'range') {
    const input = document.getElementById('spRangeInput');
    const rangeStr = input ? input.value : '';
    const selectedPages = spParseRange(rangeStr, spFile.pages);
    if (selectedPages.length === 0) {
      spToast('❌ Valid range likho (e.g., 1-5, 8, 10-12)', 'error');
      return;
    }
    outputs.push({
      name: `${base}_pages_${selectedPages[0]}-${selectedPages[selectedPages.length - 1]}.pdf`,
      pages: selectedPages
    });
  } else if (spMode === 'every') {
    for (let i = 1; i <= spFile.pages; i++) {
      outputs.push({ name: `${base}_page_${i}.pdf`, pages: [i] });
    }
  } else if (spMode === 'everyN') {
    const nEl = document.getElementById('spEveryNInput');
    const N = parseInt(nEl ? nEl.value : '5', 10);
    if (isNaN(N) || N < 1 || N > spFile.pages) {
      spToast('❌ Valid N (pages per file) likho', 'error');
      return;
    }
    let idx = 1;
    while (idx <= spFile.pages) {
      const chunk = [];
      for (let j = 0; j < N && idx <= spFile.pages; j++, idx++) chunk.push(idx);
      outputs.push({ name: `${base}_pages_${chunk[0]}-${chunk[chunk.length - 1]}.pdf`, pages: chunk });
    }
  } else if (spMode === 'halves') {
    const half = Math.ceil(spFile.pages / 2);
    outputs.push({ name: `${base}_part1.pdf`, pages: Array.from({ length: half }, (_, i) => i + 1) });
    if (half < spFile.pages) {
      outputs.push({ name: `${base}_part2.pdf`, pages: Array.from({ length: spFile.pages - half }, (_, i) => half + i + 1) });
    }
  } else if (spMode === 'selected') {
    const sel = spPages.filter(p => p.selected).map(p => p.n);
    if (sel.length === 0) { spToast('❌ Kam se kam 1 page select karo', 'error'); return; }
    outputs.push({ name: `${base}_selected.pdf`, pages: sel });
  }

  if (outputs.length === 0) { spToast('❌ Kuch output nahi bana', 'error'); return; }

  spBusy = true;
  const btn = document.getElementById('spSplitBtn');
  const progWrap = document.getElementById('spProgress');
  const progFill = document.getElementById('spProgressFill');
  const progText = document.getElementById('spProgressText');
  const progPct = document.getElementById('spProgressPct');

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Splitting...'; }
  if (progWrap) progWrap.style.display = 'block';

  try {
    const { PDFDocument } = PDFLib;
    const srcDoc = await PDFDocument.load(spFile.buffer, { ignoreEncryption: true });
    const results = [];

    for (let i = 0; i < outputs.length; i++) {
      const out = outputs[i];
      const pct = Math.round((i / outputs.length) * 100);
      if (progFill) progFill.style.width = pct + '%';
      if (progPct) progPct.textContent = pct + '%';
      if (progText) progText.textContent = `Splitting ${i + 1}/${outputs.length}: ${spFmtName(out.name, 32)}`;

      const newDoc = await PDFDocument.create();
      const indices = out.pages.map(n => n - 1);
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach(p => newDoc.addPage(p));
      const bytes = await newDoc.save();
      results.push({ name: out.name, bytes });

      await new Promise(r => setTimeout(r, 20));
    }

    if (progFill) progFill.style.width = '100%';
    if (progPct) progPct.textContent = '100%';
    if (progText) progText.textContent = '📦 Packaging...';
    await new Promise(r => setTimeout(r, 100));

    // Single output → direct PDF
    if (results.length === 1) {
      const blob = new Blob([results[0].bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = results[0].name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      spToast(`✅ Split done! 1 PDF (${spFmtSize(blob.size)})`, 'success');
      if (progText) progText.textContent = `✅ Done — ${results[0].name}`;
    } else {
      // Multiple → ZIP
      if (typeof JSZip === 'undefined') {
        spToast('❌ JSZip load nahi hui', 'error');
        if (progText) progText.textContent = '❌ JSZip missing';
        return;
      }
      const zip = new JSZip();
      results.forEach(r => zip.file(r.name, r.bytes));
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${base}_split_${results.length}files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      spToast(`✅ Split done! ${results.length} files in ZIP (${spFmtSize(zipBlob.size)})`, 'success');
      if (progText) progText.textContent = `✅ Done — ${results.length} PDFs in ZIP`;
    }
  } catch (e) {
    console.error('Split error:', e);
    spToast('❌ Split fail: ' + (e.message || 'unknown'), 'error');
    if (progText) progText.textContent = '❌ Failed';
  } finally {
    spBusy = false;
    if (btn) { btn.disabled = false; btn.textContent = '✂️ Split PDF'; }
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
window.spReset = () => {
  spFile = null;
  spPages = [];
  spBusy = false;
  spMode = 'range';
  const drop = document.getElementById('spDrop');
  const panel = document.getElementById('spPanel');
  const input = document.getElementById('spInput');
  if (drop) drop.style.display = 'block';
  if (panel) panel.style.display = 'none';
  if (input) input.value = '';
  document.querySelectorAll('.sp-mode-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === 'range');
  });
  spToast('🔄 Reset done');
};

/* ============================================================
   RENDER (main HTML)
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['pdf-splitter'] = () => `
<div class="sp-wrap">

  <div id="spDrop" class="sp-drop">
    <div class="sp-drop-inner">
      <div class="sp-drop-icon">✂️</div>
      <div class="sp-drop-title">PDF file drag & drop karo</div>
      <div class="sp-drop-sub">ya click karke select karo • Max 200MB</div>
      <button class="btn btn-primary" onclick="document.getElementById('spInput').click()">
        📁 Select PDF
      </button>
      <input type="file" id="spInput" accept="application/pdf,.pdf" hidden>
    </div>
  </div>

  <div id="spStatus" style="font-size:12.5px;color:var(--text-3);text-align:center;margin-top:10px"></div>

  <div id="spPanel" style="display:none;margin-top:14px">

    <div id="spFileInfo"></div>

    <div class="sp-mode-tabs">
      <div class="sp-mode-tab active" data-mode="range" onclick="spSetMode('range')">📏 Range</div>
      <div class="sp-mode-tab" data-mode="every" onclick="spSetMode('every')">📄 Every Page</div>
      <div class="sp-mode-tab" data-mode="everyN" onclick="spSetMode('everyN')">🔢 Every N Pages</div>
      <div class="sp-mode-tab" data-mode="halves" onclick="spSetMode('halves')">➗ Halves</div>
      <div class="sp-mode-tab" data-mode="selected" onclick="spSetMode('selected')">☑️ Selected</div>
    </div>

    <div id="spRangeBox" style="margin-top:12px">
      <div class="field">
        <label>Page Range (e.g., 1-5, 8, 10-12)</label>
        <input type="text" id="spRangeInput" placeholder="1-5, 8, 10-12" value="1-1">
      </div>
      <div class="hint">Total pages: <strong id="spPageCount">0</strong> • Selected: <strong id="spSelectedCount">0</strong></div>
    </div>

    <div id="spEveryNBox" style="display:none;margin-top:12px">
      <div class="field">
        <label>Pages per file (N)</label>
        <input type="number" id="spEveryNInput" value="5" min="1" max="500">
      </div>
      <div class="hint">Har N pages ka alag PDF banega</div>
    </div>

    <div class="sp-sel-controls">
      <button class="btn btn-sm btn-secondary" onclick="spSelectAll()">Select All</button>
      <button class="btn btn-sm btn-secondary" onclick="spSelectNone()">Select None</button>
      <button class="btn btn-sm btn-secondary" onclick="spInvertSelection()">Invert</button>
    </div>

    <div class="sp-pages-grid" id="spPagesGrid"></div>

    <div id="spProgress" style="display:none;margin-top:14px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-3);margin-bottom:6px">
        <span id="spProgressText"></span>
        <span id="spProgressPct"></span>
      </div>
      <div style="height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden">
        <div id="spProgressFill" style="height:100%;width:0%;background:var(--gradient);transition:width .3s"></div>
      </div>
    </div>

    <div class="btn-group" style="margin-top:16px">
      <button class="btn btn-secondary" onclick="spReset()">🔄 Reset</button>
      <button class="btn btn-primary" id="spSplitBtn" onclick="spSplit()">✂️ Split PDF</button>
    </div>

    <div class="hint" style="margin-top:14px;text-align:center">
      🔒 100% browser me process — files upload nahi hoti
    </div>
  </div>
</div>

<style>
  .sp-wrap { padding: 4px 0; }
  .sp-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 30px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .sp-drop:hover, .sp-drop.dragover { border-color: var(--primary); background: var(--surface-hover); }
  .sp-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .sp-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .sp-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }

  .sp-mode-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
  .sp-mode-tab { padding: 9px 14px; border-radius: 10px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .sp-mode-tab:hover { background: var(--surface-hover); }
  .sp-mode-tab.active { background: var(--gradient); color: #fff; border-color: transparent; }

  .sp-sel-controls { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 14px; }

  .sp-pages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(85px, 1fr)); gap: 8px; margin-top: 12px; max-height: 420px; overflow-y: auto; padding: 10px; background: var(--surface-2); border-radius: 12px; }
  .sp-page { cursor: pointer; text-align: center; transition: all .15s; }
  .sp-page-thumb { position: relative; border-radius: 8px; overflow: hidden; border: 2px solid transparent; background: #fff; aspect-ratio: 3/4; }
  .sp-page img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sp-page-check { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,.5); border: 2px solid #fff; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; transition: all .15s; }
  .sp-page.selected .sp-page-thumb { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.2); }
  .sp-page.selected .sp-page-check { background: var(--gradient); }
  .sp-page-num { font-size: 11px; color: var(--text-3); margin-top: 4px; font-weight: 600; }

  @media (max-width: 480px) {
    .sp-pages-grid { grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 6px; }
    .sp-mode-tab { padding: 8px 11px; font-size: 11.5px; }
  }
</style>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['pdf-splitter'] = () => {
  const drop = document.getElementById('spDrop');
  const input = document.getElementById('spInput');
  if (!drop || !input) return;

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });

  input.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      spLoadFile(e.target.files[0]);
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
      spLoadFile(e.dataTransfer.files[0]);
    }
  });
};

console.log('%c✅ PDF Splitter loaded', 'color:#f59e0b;font-weight:bold');