/* ============================================================
   QUNVERIO — IMAGE COMPRESSOR (tools/digital-studio/compressor.js)
   Compress images with quality mode OR target size mode
   Target size auto-iterates quality until file fits (perfect for govt forms)
   ============================================================ */

console.log('%cImage Compressor module loading...', 'color:#ef4444;font-weight:bold');

let icFiles = [];
let icBusy = false;
let icMode = 'quality';   // quality | target

let icSettings = {
  quality: 80,
  targetKB: 50,
  format: 'jpeg',      // jpeg | webp
  maxDimension: 0      // 0 = no resize, else max px
};

/* ============================================================
   HELPERS
   ============================================================ */
function icFmtSize(bytes) {
  if (!bytes && bytes !== 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function icFmtName(name, max = 32) {
  if (!name) return '';
  if (name.length <= max) return name;
  const ext = name.split('.').pop();
  const base = name.slice(0, max - ext.length - 4);
  return base + '...' + ext;
}

function icToast(msg, type) {
  if (typeof toast === 'function') toast(msg, type || '');
  else console.log('[TOAST]', msg);
}

function icUid() {
  return 'ic_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function icIsImage(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name || '');
}

function icBaseName(name) {
  return (name || 'image').replace(/\.[^.]+$/, '').replace(/[^a-z0-9_\-]/gi, '_');
}

/* ============================================================
   LOAD IMAGE
   ============================================================ */
function icLoadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => resolve({
        dataUrl: ev.target.result,
        width: img.naturalWidth,
        height: img.naturalHeight,
        img
      });
      img.onerror = () => reject(new Error('decode fail'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('read fail'));
    reader.readAsDataURL(file);
  });
}

async function icAddFiles(fileList) {
  const files = Array.from(fileList).filter(icIsImage);
  if (files.length === 0) {
    icToast('❌ Sirf images select karo', 'error');
    return;
  }
  if (icBusy) return;
  icBusy = true;
  const statusEl = document.getElementById('icStatus');
  let added = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 50 * 1024 * 1024) {
      icToast(`⚠️ ${icFmtName(file.name)} 50MB se bada`, 'error');
      continue;
    }
    if (statusEl) statusEl.textContent = `⏳ Loading ${i + 1}/${files.length}...`;
    try {
      const info = await icLoadImage(file);
      icFiles.push({
        id: icUid(),
        file,
        name: file.name,
        size: file.size,
        dataUrl: info.dataUrl,
        width: info.width,
        height: info.height,
        aspect: info.width / info.height,
        compressed: null   // filled after compress
      });
      added++;
      icRenderList();
      await new Promise(r => setTimeout(r, 15));
    } catch (e) {
      icToast(`❌ ${icFmtName(file.name)} load nahi hui`, 'error');
    }
  }
  icBusy = false;
  if (statusEl) statusEl.textContent = '';
  if (added > 0) {
    icToast(`✅ ${added} image${added > 1 ? 's' : ''} added`, 'success');
    icRenderList();
  }
}

/* ============================================================
   RENDER LIST
   ============================================================ */
function icRenderList() {
  const list = document.getElementById('icList');
  const empty = document.getElementById('icEmpty');
  const panel = document.getElementById('icPanel');
  if (!list) return;

  if (icFiles.length === 0) {
    if (empty) empty.style.display = 'block';
    if (panel) panel.style.display = 'none';
    list.innerHTML = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (panel) panel.style.display = 'block';

  list.innerHTML = icFiles.map((f, i) => {
    const compressed = f.compressed;
    let metaExtra = '';
    if (compressed) {
      const ratio = Math.round((1 - compressed.size / f.size) * 100);
      const badge = ratio > 0 ? `-${ratio}%` : `+${Math.abs(ratio)}%`;
      const color = ratio > 0 ? '#10b981' : '#f59e0b';
      metaExtra = `
        <span class="ic-result" style="color:${color};font-weight:700">
          ${icFmtSize(compressed.size)} <span style="font-size:10px">(${badge})</span>
        </span>
      `;
    }
    return `
      <div class="ic-item" data-id="${f.id}">
        <div class="ic-num">${i + 1}</div>
        <div class="ic-thumb"><img src="${f.dataUrl}" alt=""></div>
        <div class="ic-info">
          <div class="ic-name" title="${f.name}">${icFmtName(f.name, 34)}</div>
          <div class="ic-meta">
            <span class="ic-orig">${icFmtSize(f.size)}</span>
            <span class="ic-dims">• ${f.width}×${f.height}</span>
            ${metaExtra}
          </div>
        </div>
        ${compressed ? `<a class="ic-download" href="${compressed.url}" download="${compressed.name}" title="Download">⬇</a>` : ''}
        <button class="ic-btn ic-del" onclick="icRemove('${f.id}')">✕</button>
      </div>
    `;
  }).join('');

  icUpdateStats();
}

window.icRemove = (id) => {
  const f = icFiles.find(x => x.id === id);
  if (f && f.compressed && f.compressed.url) URL.revokeObjectURL(f.compressed.url);
  icFiles = icFiles.filter(x => x.id !== id);
  icRenderList();
};

window.icClearAll = () => {
  if (icFiles.length === 0) return;
  if (!confirm('Saari images hata dein?')) return;
  icFiles.forEach(f => {
    if (f.compressed && f.compressed.url) URL.revokeObjectURL(f.compressed.url);
  });
  icFiles = [];
  icRenderList();
  icToast('🗑️ Saari images remove');
};

function icUpdateStats() {
  const el = document.getElementById('icStats');
  if (!el) return;
  if (icFiles.length === 0) { el.textContent = ''; return; }
  const totalOrig = icFiles.reduce((s, x) => s + x.size, 0);
  const done = icFiles.filter(x => x.compressed);
  const totalNew = done.reduce((s, x) => s + x.compressed.size, 0);
  if (done.length === 0) {
    el.innerHTML = `📊 <strong>${icFiles.length}</strong> image${icFiles.length > 1 ? 's' : ''} • 
      <strong>${icFmtSize(totalOrig)}</strong> total`;
  } else {
    const saved = totalOrig - totalNew;
    const pct = Math.round((saved / totalOrig) * 100);
    el.innerHTML = `📊 <strong>${icFiles.length}</strong> image${icFiles.length > 1 ? 's' : ''} • 
      <strong>${icFmtSize(totalOrig)}</strong> → <strong style="color:#10b981">${icFmtSize(totalNew)}</strong> 
      <span style="color:#10b981">(−${pct}%)</span>`;
  }
}

/* ============================================================
   SETTINGS
   ============================================================ */
window.icSetMode = (mode) => {
  icMode = mode;
  document.querySelectorAll('.ic-mode-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });
  const qBox = document.getElementById('icQualityBox');
  const tBox = document.getElementById('icTargetBox');
  if (qBox) qBox.style.display = mode === 'quality' ? 'block' : 'none';
  if (tBox) tBox.style.display = mode === 'target' ? 'block' : 'none';
};

window.icSetSetting = (key, val) => {
  icSettings[key] = val;
  const groups = { format: 'icFormat' };
  if (groups[key]) {
    const wrap = document.getElementById(groups[key]);
    if (wrap) {
      wrap.querySelectorAll('.ic-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.val === String(val));
      });
    }
  }
};

window.icSetQuality = (val) => {
  icSettings.quality = parseInt(val, 10);
  const el = document.getElementById('icQualityVal');
  if (el) el.textContent = val + '%';
};

window.icSetTargetSize = (val) => {
  icSettings.targetKB = Math.max(5, parseInt(val, 10) || 50);
};

window.icSetPreset = (kb) => {
  icSettings.targetKB = kb;
  const inp = document.getElementById('icTargetInput');
  if (inp) inp.value = kb;
  icToast(`🎯 Target: ${kb} KB`);
};

window.icSetMaxDim = (val) => {
  icSettings.maxDimension = parseInt(val, 10) || 0;
};

/* ============================================================
   COMPRESS LOGIC
   ============================================================ */

// Render canvas at dimensions (with optional max-dim scaling)
function icGetCanvasDims(f) {
  let w = f.width, h = f.height;
  if (icSettings.maxDimension > 0) {
    const max = icSettings.maxDimension;
    if (w > max || h > max) {
      if (w > h) { h = Math.round(h * (max / w)); w = max; }
      else { w = Math.round(w * (max / h)); h = max; }
    }
  }
  return { w, h };
}

// Compress at a given quality, return blob + size
function icCompressAtQuality(f, quality) {
  return new Promise(async resolve => {
    const dims = icGetCanvasDims(f);
    const canvas = document.createElement('canvas');
    canvas.width = dims.w;
    canvas.height = dims.h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // White bg for JPEG (avoid black transparency)
    if (icSettings.format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, dims.w, dims.h);
    }
    ctx.drawImage(f.img || await new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = f.dataUrl;
    }), 0, 0, dims.w, dims.h);

    const mime = icSettings.format === 'webp' ? 'image/webp' : 'image/jpeg';
    canvas.toBlob(blob => {
      canvas.width = 0; canvas.height = 0;
      resolve(blob);
    }, mime, quality);
  });
}

// Auto-iterate quality to hit target size
async function icCompressToTarget(f, targetBytes) {
  let lo = 0.1, hi = 1.0;
  let bestBlob = null;
  let bestQ = 0.85;
  let iterations = 0;
  const maxIter = 12;

  // Quick check: if original is already smaller, use high quality
  if (f.size <= targetBytes) {
    const blob = await icCompressAtQuality(f, 0.95);
    if (blob && blob.size <= targetBytes) return { blob, quality: 0.95 };
  }

  while (lo <= hi && iterations < maxIter) {
    const mid = (lo + hi) / 2;
    const blob = await icCompressAtQuality(f, mid);
    if (!blob) break;
    iterations++;

    if (blob.size <= targetBytes) {
      bestBlob = blob;
      bestQ = mid;
      lo = mid + 0.03; // try higher quality
    } else {
      hi = mid - 0.03;
    }
    if (Math.abs(blob.size - targetBytes) < targetBytes * 0.1) break;
  }

  // If still too big, reduce dimension
  if (!bestBlob || bestBlob.size > targetBytes) {
    // Try progressive downscale
    let scale = 0.85;
    for (let i = 0; i < 5 && scale > 0.3; i++) {
      const origMax = icSettings.maxDimension;
      const tmpMax = Math.round(Math.max(f.width, f.height) * scale);
      icSettings.maxDimension = tmpMax;
      const blob = await icCompressAtQuality(f, 0.75);
      icSettings.maxDimension = origMax;
      if (blob && blob.size <= targetBytes) {
        return { blob, quality: 0.75, scaled: true };
      }
      scale -= 0.15;
    }
  }

  return { blob: bestBlob, quality: bestQ };
}

/* ============================================================
   MAIN COMPRESS ALL
   ============================================================ */
window.icCompressAll = async () => {
  if (icFiles.length === 0) { icToast('❌ Pehle images add karo', 'error'); return; }
  if (icBusy) return;

  icBusy = true;
  const btn = document.getElementById('icCompressBtn');
  const progWrap = document.getElementById('icProgress');
  const progFill = document.getElementById('icProgressFill');
  const progText = document.getElementById('icProgressText');
  const progPct = document.getElementById('icProgressPct');

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Compressing...'; }
  if (progWrap) progWrap.style.display = 'block';

  try {
    // Clear old compressed
    icFiles.forEach(f => {
      if (f.compressed && f.compressed.url) URL.revokeObjectURL(f.compressed.url);
      f.compressed = null;
    });

    for (let i = 0; i < icFiles.length; i++) {
      const f = icFiles[i];
      const pct = Math.round((i / icFiles.length) * 100);
      if (progFill) progFill.style.width = pct + '%';
      if (progPct) progPct.textContent = pct + '%';
      if (progText) progText.textContent = `Compressing ${i + 1}/${icFiles.length}: ${icFmtName(f.name, 28)}`;

      let blob, quality;
      if (icMode === 'target') {
        const targetBytes = icSettings.targetKB * 1024;
        const res = await icCompressToTarget(f, targetBytes);
        blob = res.blob;
        quality = res.quality;
      } else {
        blob = await icCompressAtQuality(f, icSettings.quality / 100);
        quality = icSettings.quality / 100;
      }

      if (!blob) {
        console.warn('Blob fail for', f.name);
        continue;
      }

      const ext = icSettings.format === 'webp' ? 'webp' : 'jpg';
      const outName = `${icBaseName(f.name)}_compressed.${ext}`;
      const url = URL.createObjectURL(blob);

      f.compressed = {
        blob,
        url,
        name: outName,
        size: blob.size,
        quality: Math.round(quality * 100)
      };

      icRenderList();
      await new Promise(r => setTimeout(r, 30));
    }

    if (progFill) progFill.style.width = '100%';
    if (progPct) progPct.textContent = '100%';
    if (progText) progText.textContent = '✅ All done!';
    icToast(`✅ ${icFiles.length} image${icFiles.length > 1 ? 's' : ''} compressed`, 'success');

    // Auto-download ZIP if multiple & all done
    const done = icFiles.filter(f => f.compressed);
    if (done.length > 1) {
      // Show "Download ZIP" button instead of auto
      icShowZipBtn();
    }
  } catch (e) {
    console.error('Compress error:', e);
    icToast('❌ Compress fail: ' + (e.message || ''), 'error');
  } finally {
    icBusy = false;
    if (btn) { btn.disabled = false; btn.textContent = '🗜️ Compress All'; }
    setTimeout(() => {
      if (progWrap) progWrap.style.display = 'none';
      if (progFill) progFill.style.width = '0%';
      if (progPct) progPct.textContent = '';
      if (progText) progText.textContent = '';
    }, 2500);
  }
};

window.icDownloadZip = async () => {
  const done = icFiles.filter(f => f.compressed);
  if (done.length === 0) return;
  if (typeof JSZip === 'undefined') { icToast('❌ JSZip load nahi hui', 'error'); return; }
  icToast('📦 ZIP bana rahe hain...');
  const zip = new JSZip();
  done.forEach(f => zip.file(f.compressed.name, f.compressed.blob));
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `compressed_${done.length}images.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  icToast(`✅ ZIP downloaded (${icFmtSize(zipBlob.size)})`, 'success');
};

function icShowZipBtn() {
  const el = document.getElementById('icZipBtn');
  if (el) el.style.display = 'flex';
}

/* ============================================================
   RENDER (main HTML)
   ============================================================ */
window.EXTRA_TOOL_RENDERERS['image-compressor'] = () => `
<div class="ic-wrap">

  <div id="icDrop" class="ic-drop">
    <div class="ic-drop-icon">🗜️</div>
    <div class="ic-drop-title">Images drag & drop karo</div>
    <div class="ic-drop-sub">JPG • PNG • WebP • Multiple OK • Max 50MB each</div>
    <button class="btn btn-primary" onclick="document.getElementById('icInput').click()">
      📁 Select Images
    </button>
    <input type="file" id="icInput" accept="image/*" multiple hidden>
  </div>

  <div id="icStatus" style="font-size:12.5px;color:var(--text-3);text-align:center;margin-top:10px"></div>

  <div id="icEmpty" class="empty-state" style="margin-top:14px">
    <div class="es-emoji">🗂️</div>
    <div class="es-title">Koi image nahi hai</div>
    Upar se images add karo
  </div>

  <div id="icPanel" style="display:none">

    <div id="icStats" style="font-size:13px;color:var(--text-2);text-align:center;margin:14px 0;padding:10px;background:var(--surface-2);border-radius:10px"></div>

    <div class="ic-list" id="icList"></div>

    <!-- MODE TABS -->
    <div class="ic-mode-tabs">
      <div class="ic-mode-tab active" data-mode="quality" onclick="icSetMode('quality')">⚙️ Quality Mode</div>
      <div class="ic-mode-tab" data-mode="target" onclick="icSetMode('target')">🎯 Target Size (KB)</div>
    </div>

    <!-- QUALITY MODE -->
    <div id="icQualityBox" class="ic-settings" style="margin-top:12px">
      <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">
        Quality: <span id="icQualityVal">${icSettings.quality}%</span>
      </label>
      <input type="range" min="10" max="100" value="${icSettings.quality}"
        oninput="icSetQuality(this.value)" style="width:100%">
      <div class="hint" style="margin-top:6px">
        80-90% = best • 50-70% = balanced • 20-40% = max compression
      </div>
    </div>

    <!-- TARGET MODE -->
    <div id="icTargetBox" class="ic-settings" style="display:none;margin-top:12px">
      <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">
        🎯 Target Size (KB)
      </label>
      <div class="field">
        <input type="number" id="icTargetInput" value="${icSettings.targetKB}"
          min="5" max="5000" oninput="icSetTargetSize(this.value)" placeholder="e.g. 50">
      </div>
      <div class="hint" style="margin-bottom:8px">Common presets:</div>
      <div class="ic-presets">
        <button class="ic-chip" onclick="icSetPreset(20)">20 KB</button>
        <button class="ic-chip" onclick="icSetPreset(50)">50 KB</button>
        <button class="ic-chip" onclick="icSetPreset(100)">100 KB</button>
        <button class="ic-chip" onclick="icSetPreset(200)">200 KB</button>
        <button class="ic-chip" onclick="icSetPreset(500)">500 KB</button>
        <button class="ic-chip" onclick="icSetPreset(1024)">1 MB</button>
      </div>
      <div class="hint" style="margin-top:10px;padding:8px;background:rgba(99,102,241,.1);border-radius:8px">
        💡 <strong>Govt forms ke liye:</strong> 20-50 KB<br>
        📧 <strong>Email/WhatsApp:</strong> 100-500 KB
      </div>
    </div>

    <!-- OUTPUT FORMAT -->
    <div class="ic-settings" style="margin-top:12px">
      <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:8px">
        📁 Output Format
      </label>
      <div class="ic-chips" id="icFormat">
        <div class="ic-chip ${icSettings.format === 'jpeg' ? 'active' : ''}" data-val="jpeg" onclick="icSetSetting('format','jpeg')">JPG</div>
        <div class="ic-chip ${icSettings.format === 'webp' ? 'active' : ''}" data-val="webp" onclick="icSetSetting('format','webp')">WebP</div>
      </div>
      <div style="margin-top:12px">
        <label style="display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px">
          Max Dimension (px) — optional
        </label>
        <input type="number" id="icMaxDim" value="0" min="0" max="10000"
          oninput="icSetMaxDim(this.value)" placeholder="0 = keep original size"
          style="width:100%;padding:10px 12px;background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;color:var(--text)">
        <div class="hint" style="margin-top:4px">0 = original | e.g. 1920 = Full HD max</div>
      </div>
    </div>

    <div id="icProgress" style="display:none;margin-top:14px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-3);margin-bottom:6px">
        <span id="icProgressText"></span>
        <span id="icProgressPct"></span>
      </div>
      <div style="height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden">
        <div id="icProgressFill" style="height:100%;width:0%;background:var(--gradient);transition:width .3s"></div>
      </div>
    </div>

    <div class="btn-group" style="margin-top:16px">
      <button class="btn btn-secondary" onclick="document.getElementById('icInput').click()">➕ Add More</button>
      <button class="btn btn-secondary" onclick="icClearAll()">🗑️ Clear</button>
      <button class="btn btn-primary" id="icCompressBtn" onclick="icCompressAll()">🗜️ Compress All</button>
    </div>

    <div class="btn-group" style="margin-top:10px">
      <button class="btn btn-secondary" id="icZipBtn" style="display:none" onclick="icDownloadZip()">📦 Download All as ZIP</button>
    </div>

    <div class="hint" style="margin-top:14px;text-align:center">
      🔒 100% browser me process — images upload nahi hoti
    </div>
  </div>
</div>

<style>
  .ic-wrap { padding: 4px 0; }
  .ic-drop { border: 2px dashed var(--border-strong); border-radius: 16px; padding: 26px 20px; text-align: center; background: var(--surface); cursor: pointer; transition: all .2s; }
  .ic-drop:hover, .ic-drop.dragover { border-color: var(--primary); background: var(--surface-hover); }
  .ic-drop-icon { font-size: 42px; margin-bottom: 8px; }
  .ic-drop-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .ic-drop-sub { font-size: 12.5px; color: var(--text-3); margin-bottom: 14px; }

  .ic-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; max-height: 340px; overflow-y: auto; }
  .ic-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
  .ic-num { width: 26px; height: 26px; border-radius: 8px; background: var(--gradient); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
  .ic-thumb { width: 46px; height: 46px; border-radius: 8px; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
  .ic-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .ic-info { flex: 1; min-width: 0; }
  .ic-name { font-size: 13.5px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ic-meta { font-size: 11.5px; color: var(--text-3); margin-top: 2px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .ic-orig { color: var(--text-3); }
  .ic-dims { color: var(--text-3); font-size: 11px; }
  .ic-result { font-size: 11.5px; }
  .ic-btn, .ic-download { width: 30px; height: 30px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; text-decoration: none; }
  .ic-download { background: rgba(16,185,129,.15); color: #10b981; border-color: rgba(16,185,129,.3); }
  .ic-download:hover { background: rgba(16,185,129,.25); }
  .ic-del:hover { background: rgba(239,68,68,.15); color: var(--danger); border-color: var(--danger); }

  .ic-mode-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
  .ic-mode-tab { padding: 9px 14px; border-radius: 10px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; flex: 1; text-align: center; }
  .ic-mode-tab:hover { background: var(--surface-hover); }
  .ic-mode-tab.active { background: var(--gradient); color: #fff; border-color: transparent; }

  .ic-settings { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
  .ic-chips, .ic-presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .ic-chip { padding: 7px 12px; border-radius: 8px; background: var(--surface-2); border: 1.5px solid var(--border); color: var(--text-2); font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .ic-chip:hover { background: var(--surface-hover); }
  .ic-chip.active { background: var(--gradient); color: #fff; border-color: transparent; }

  input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 3px; background: var(--surface-2); outline: none; }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--gradient); cursor: pointer; }
  input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: var(--gradient); cursor: pointer; border: none; }

  @media (max-width: 480px) {
    .ic-item { gap: 6px; padding: 8px; }
    .ic-name { font-size: 12.5px; }
    .ic-thumb { width: 40px; height: 40px; }
    .ic-num { width: 22px; height: 22px; font-size: 11px; }
    .ic-mode-tab { padding: 8px 10px; font-size: 11.5px; }
  }
</style>
`;

/* ============================================================
   INIT
   ============================================================ */
window.EXTRA_TOOL_INITS['image-compressor'] = () => {
  const drop = document.getElementById('icDrop');
  const input = document.getElementById('icInput');
  if (!drop || !input) return;

  drop.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') return;
    input.click();
  });

  input.addEventListener('change', e => {
    if (e.target.files && e.target.files.length) {
      icAddFiles(e.target.files);
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
      icAddFiles(e.dataTransfer.files);
    }
  });
};

console.log('%c✅ Image Compressor loaded', 'color:#ef4444;font-weight:bold');