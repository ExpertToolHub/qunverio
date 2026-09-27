/* ============================================================
   QUNVERIO — PDF MERGER (tools/pdf/merger.js)
   Browser-side PDF merging with drag-drop, reorder, preview
   ============================================================ */

console.log('%cPDF Merger module loading...', 'color:#ec4899;font-weight:bold');

let rbMergerFiles = [];
let rbMergerDragId = null;
let rbMergerBusy = false;

function rbFmtSize(bytes) {
  if (!bytes) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0, n = bytes;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return n.toFixed(n < 10 ? 2 : 1) + ' ' + u[i];
}

function rbFmtName(name, max = 32) {
  if (!name) return '';
  if (name.length <= max) return name;
  const ext = name.split('.').pop();
  const base = name.slice(0, max - ext.length - 4);
  return base + '...' + ext;
}

function rbUid() {
  return 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function rbToastMsg(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

async function rbGenThumb(arrayBuffer) {
  if (typeof pdfjsLib === 'undefined') return null;
  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.3 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    return { thumb: canvas.toDataURL('image/jpeg', 0.7), pages: pdf.numPages };
  } catch (e) {
    console.warn('Thumb fail:', e);
    return null;
  }
}

async function rbAddFiles(fileList) {
  const files = Array.from(fileList).filter(f =>
    f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
  );
  if (files.length === 0) {
    rbToastMsg('❌ Sirf PDF files select karo', 'error');
    return;
  }
  if (rbMergerBusy) { rbToastMsg('⏳ Please wait...', 'error'); return; }

  rbMergerBusy = true;
  const statusEl = document.getElementById('rbMergerStatus');
  let added = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 200 * 1024 * 1024) {
      rbToastMsg(`⚠️ ${rbFmtName(file.name)} 200MB se bada hai — skip`, 'error');
      continue;
    }
    if (statusEl) statusEl.textContent = `⏳ Loading ${i + 1}/${files.length}: ${rbFmtName(file.name, 24)}`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const meta = await rbGenThumb(arrayBuffer);
      rbMergerFiles.push({
        id: rbUid(),
        file,
        name: file.name,
        size: file.size,
        pages: meta ? meta.pages : '?',
        thumb: meta ? meta.thumb : null,
        buffer: arrayBuffer
      });
      added++;
      rbMergerRenderList();
      await new Promise(r => setTimeout(r, 30));
    } catch (e) {
      console.error('File load fail:', e);
      rbToastMsg(`❌ ${rbFmtName(file.name)} load nahi hui`, 'error');
    }
  }

  rbMergerBusy = false;
  if (statusEl) statusEl.textContent = '';
  rbMergerUpdateStats();
  if (added > 0) rbToastMsg(`✅ ${added} file${added > 1 ? 's' : ''} added`, 'success');
}

function rbMergerRenderList() {
  const list = document.getElementById('rbMergerList');
  const empty = document.getElementById('rbMergerEmpty');
  const actions = document.getElementById('rbMergerActions');
  if (!list) return;

  if (rbMergerFiles.length === 0) {
    if (empty) empty.style.display = 'block';
    if (actions) actions.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (actions) actions.style.display = 'flex';

  list.innerHTML = rbMergerFiles.map((f, i) => `
    <div class="rb-mrg-item" draggable="true" data-id="${f.id}" data-idx="${i}">
      <div class="rb-mrg-drag" title="Drag to reorder">⋮⋮</div>
      <div class="rb-mrg-num">${i + 1}</div>
      <div class="rb-mrg-thumb">
        ${f.thumb ? `<img src="${f.thumb}" alt="">` : `<span style="font-size:26px">📄</span>`}
      </div>
      <div class="rb-mrg-info">
        <div class="rb-mrg-name" title="${f.name}">${rbFmtName(f.name, 38)}</div>
        <div class="rb-mrg-meta">${rbFmtSize(f.size)} • ${f.pages} page${f.pages !== 1 ? 's' : ''}</div>
      </div>
      <div class="rb-mrg-ctrl">
        <button class="rb-mrg-btn" onclick="rbMergerMove(${i},-1)" title="Move up" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="rb-mrg-btn" onclick="rbMergerMove(${i},1)" title="Move down" ${i === rbMergerFiles.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="rb-mrg-btn rb-mrg-del" onclick="rbMergerRemove('${f.id}')" title="Remove">✕</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.rb-mrg-item').forEach(el => {
    el.addEventListener('dragstart', e => {
      rbMergerDragId = el.dataset.id;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      rbMergerDragId = null;
      document.querySelectorAll('.rb-mrg-item').forEach(x => x.classList.remove('drag-over'));
    });
    el.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (el.dataset.id !== rbMergerDragId) el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('drag-over');
      const targetId = el.dataset.id;
      if (!rbMergerDragId || rbMergerDragId === targetId) return;
      const fromIdx = rbMergerFiles.findIndex(f => f.id === rbMergerDragId);
      const toIdx = rbMergerFiles.findIndex(f => f.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return;
      const [moved] = rbMergerFiles.splice(fromIdx, 1);
      rbMergerFiles.splice(toIdx, 0, moved);
      rbMergerDragId = null;
      rbMergerRenderList();
      rbMergerUpdateStats();
    });
  });
}

window.rbMergerMove = (idx, dir) => {
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= rbMergerFiles.length) return;
  [rbMergerFiles[idx], rbMergerFiles[newIdx]] = [rbMergerFiles[newIdx], rbMergerFiles[idx]];
  rbMergerRenderList();
};

window.rbMergerRemove = (id) => {
  rbMergerFiles = rbMergerFiles.filter(f => f.id !== id);
  rbMergerRenderList();
  rbMergerUpdateStats();
};

window.rbMergerClearAll = () => {
  if (rbMergerFiles.length === 0) return;
  if (!confirm('Saari files hata dein?')) return;
  rbMergerFiles = [];
  rbMergerRenderList();
  rbMergerUpdateStats();
  rbToastMsg('🗑️ Saari files remove');
};

function rbMergerUpdateStats() {
  const el = document.getElementById('rbMergerStats');
  if (!el) return;
  if (rbMergerFiles.length === 0) { el.textContent = ''; return; }
  const totalSize = rbMergerFiles.reduce((s, f) => s + f.size, 0);
  const totalPages = rbMergerFiles.reduce((s, f) => s + (typeof f.pages === 'number' ? f.pages : 0), 0);
  el.innerHTML = `📊 <strong>${rbMergerFiles.length}</strong> file${rbMergerFiles.length > 1 ? 's' : ''} • 
    <strong>${totalPages || '?'}</strong> pages • 
    <strong>${rbFmtSize(totalSize)}</strong> total`;
}

window.rbMergerMerge = async () => {
  if (rbMergerFiles.length < 2) {
    rbToastMsg('❌ Kam se kam 2 PDF chahiye', 'error');
    return;
  }
  if (typeof PDFLib === 'undefined') {
    rbToastMsg('❌ pdf-lib load nahi hui', 'error');
    return;
  }
  if (rbMergerBusy) return;

  rbMergerBusy = true;
  const btn = document.getElementById('rbMergerBtn');
  const progWrap = document.getElementById('rbMergerProgress');
  const progFill = document.getElementById('rbMergerProgressFill');
  const progText = document.getElementById('rbMergerProgressText');

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Merging...'; }
  if (progWrap) progWrap.style.display = 'block';

  try {
    const { PDFDocument } = PDFLib;
    const merged = await PDFDocument.create();

    for (let i = 0; i < rbMergerFiles.length; i++) {
      const f = rbMergerFiles[i];
      if (progFill) progFill.style.width = Math.round((i / rbMergerFiles.length) * 100) + '%';
      if (progText) progText.textContent = `Merging ${i + 1}/${rbMergerFiles.length}: ${rbFmtName(f.name, 24)}`;

      try {
        const srcDoc = await PDFDocument.load(f.buffer, { ignoreEncryption: true });
        const pageIndices = srcDoc.getPageIndices();
        const copiedPages = await merged.copyPages(srcDoc, pageIndices);
        copiedPages.forEach(p => merged.addPage(p));
      } catch (e) {
        console.error(`Skip ${f.name}:`, e);
        rbToastMsg(`⚠️ ${rbFmtName(f.name)} skip (encrypted/corrupt)`, 'error');
      }
      await new Promise(r => setTimeout(r, 10));
    }

    if (progFill) progFill.style.width = '100%';
    if (progText) progText.textContent = '📦 Building PDF...';

    const bytes = await merged.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);

    const totalPages = merged.getPageCount();
    rbToastMsg(`✅ Merged! ${totalPages} pages, ${rbFmtSize(blob.size)}`, 'success');
    if (progText) progText.textContent = `✅ Done — ${totalPages} pages, ${rbFmtSize(blob.size)}`;
  } catch (e) {
    console.error('Merge error:', e);
    rbToastMsg('❌ Merge fail: ' + (e.message || 'unknown'), 'error');
    if (progText) progText.textContent = '❌ Failed';
  } finally {
    rbMergerBusy = false;
    if (btn) { btn.disabled = false; btn.textContent = '🔗 Merge PDFs'; }
    setTimeout(() => {
      if (progWrap) progWrap.style.display = 'none';
      if (progFill) progFill.style.width = '0%';
      if (progText) progText.textContent = '';
    }, 3000);
  }
};

window.EXTRA_TOOL_RENDERERS['pdf-merger'] = () => `
<div class="rb-mrg-wrap">

  <div id="rbMergerDrop" class="rb-mrg-drop">
    <div class="rb-mrg-drop-inner">
      <div class="rb-mrg-drop-icon">📄</div>
      <div class="rb-mrg-drop-title">PDF files drag & drop karo</div>
      <div class="rb-mrg-drop-sub">ya click karke select karo • Multiple files OK • Max 200MB each</div>
      <button class="btn btn-primary rb-mrg-pick" onclick="document.getElementById('rbMergerInput').click()">
        📁 Select PDF Files
      </button>
      <input type="file" id="rbMergerInput" accept="application/pdf,.pdf" multiple hidden>
    </div>
  </div>

  <div id="rbMergerEmpty" class="empty-state" style="margin-top:14px">
    <div class="es-emoji">🗂️</div>
    <div class="es-title">Koi file nahi hai</div>
    Upar se PDF files add karo (2 ya zyada)
  </div>

  <div id="rbMergerStatus" style="font-size:12.5px;color:var(--text-3);text-align:center;margin-top:10px"></div>

  <div id="rbMergerStats" style="font-size:13px;color:var(--text-2);text-align:center;margin:14px 0;padding:10px;background:var(--surface-2);border-radius:10px"></div>

  <div id="rbMergerList" class="rb-mrg-list"></div>

  <div id="rbMergerProgress" style="display:none;margin-top:14px">
    <div style="height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden">
      <div id="rbMergerProgressFill" style="height:100%;width:0%;background:var(--gradient);transition:width .3s"></div>
    </div>
    <div id="rbMergerProgressText" style="font-size:12px;color:var(--text-3);text-align:center;margin-top:8px"></div>
  </div>

  <div id="rbMergerActions" class="btn-group" style="display:none;margin-top:16px">
    <button class="btn btn-secondary" onclick="document.getElementById('rbMergerInput').click()">➕ Add More</button>
    <button class="btn btn-secondary" onclick="rbMergerClearAll()">🗑️ Clear All</button>
    <button class="btn btn-primary" id="rbMergerBtn" onclick="rbMergerMerge()">🔗 Merge PDFs</button>
  </div>

  <div class="hint" style="margin-top:14px;text-align:center">
    🔒 100% browser me process — files server pe upload nahi hoti
  </div>
</div>

<style>
  .rb-mrg-wrap { padding: 4px 0; }
  .rb-mrg-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 26px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .rb-mrg-drop:hover, .rb-mrg-drop.dragover { border-color: var(--primary); background: var(--surface-hover); }
  .rb-mrg-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .rb-mrg-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .rb-mrg-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }
  .rb-mrg-pick { padding: 11px 22px; }
  .rb-mrg-list { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
  .rb-mrg-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; cursor: grab; transition: all .18s; }
  .rb-mrg-item:active { cursor: grabbing; }
  .rb-mrg-item.dragging { opacity: .4; }
  .rb-mrg-item.drag-over { border-color: var(--primary); background: var(--surface-hover); transform: scale(1.01); }
  .rb-mrg-drag { color: var(--text-3); font-size: 15px; cursor: grab; user-select: none; padding: 0 2px; letter-spacing: -2px; }
  .rb-mrg-num { width: 26px; height: 26px; border-radius: 8px; background: var(--gradient); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
  .rb-mrg-thumb { width: 42px; height: 54px; border-radius: 6px; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
  .rb-mrg-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .rb-mrg-info { flex: 1; min-width: 0; }
  .rb-mrg-name { font-size: 13.5px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rb-mrg-meta { font-size: 11.5px; color: var(--text-3); margin-top: 2px; }
  .rb-mrg-ctrl { display: flex; gap: 4px; flex-shrink: 0; }
  .rb-mrg-btn { width: 30px; height: 30px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
  .rb-mrg-btn:hover:not(:disabled) { background: var(--surface-hover); color: var(--text); }
  .rb-mrg-btn:disabled { opacity: .35; cursor: not-allowed; }
  .rb-mrg-del:hover { background: rgba(239,68,68,.15); color: var(--danger); border-color: var(--danger); }
  @media (max-width: 480px) {
    .rb-mrg-item { gap: 6px; padding: 8px 8px; }
    .rb-mrg-name { font-size: 12.5px; }
    .rb-mrg-ctrl .rb-mrg-btn { width: 28px; height: 28px; font-size: 13px; }
    .rb-mrg-thumb { width: 36px; height: 46px; }
    .rb-mrg-num { width: 22px; height: 22px; font-size: 11px; }
  }
</style>
`;

window.EXTRA_TOOL_INITS['pdf-merger'] = () => {
  const drop = document.getElementById('rbMergerDrop');
  const input = document.getElementById('rbMergerInput');
  if (!drop || !input) return;

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });

  input.addEventListener('change', e => {
    if (e.target.files && e.target.files.length) {
      rbAddFiles(e.target.files);
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
      rbAddFiles(e.dataTransfer.files);
    }
  });
};

console.log('%c✅ PDF Merger loaded', 'color:#ec4899;font-weight:bold');