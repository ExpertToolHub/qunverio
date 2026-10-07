/* ============================================================
   Qunverio — Pincode & IFSC Lookup Tool
   Standalone tool | CSS prefix: qvpi-
   APIs: api.postalpincode.in (no key), ifsc.razorpay.com (no key)
   ============================================================ */
(function () {
  'use strict';

  const PINCODE_API = 'https://api.postalpincode.in/pincode/';
  const IFSC_API = 'https://ifsc.razorpay.com/';

  // ---------- CSS ----------
  function injectCSS() {
    if (document.getElementById('qvpi-style')) return;
    const style = document.createElement('style');
    style.id = 'qvpi-style';
    style.textContent = `
      .qvpi-wrap { max-width: 820px; margin: 0 auto; padding: 4px 0 32px; }
      .qvpi-tabs {
        display: flex; gap: 8px; background: var(--surface, #151a3d);
        padding: 6px; border-radius: 14px; margin-bottom: 20px;
        border: 1px solid var(--border, rgba(255,255,255,0.08));
      }
      .qvpi-tab {
        flex: 1; padding: 12px 10px; border: none; cursor: pointer;
        background: transparent; color: var(--text-muted, #9ca3af);
        font-size: 14px; font-weight: 600; border-radius: 10px;
        transition: all .2s ease; font-family: inherit;
      }
      .qvpi-tab.active {
        background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%);
        color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,.35);
      }
      .qvpi-panel { display: none; }
      .qvpi-panel.active { display: block; animation: qvpiFade .25s ease; }
      @keyframes qvpiFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

      .qvpi-card {
        background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,.08));
        border-radius: 16px; padding: 20px; margin-bottom: 16px;
      }
      .qvpi-label {
        display: block; font-size: 13px; font-weight: 600;
        color: var(--text-muted, #9ca3af); margin-bottom: 8px;
      }
      .qvpi-input-row { display: flex; gap: 10px; flex-wrap: wrap; }
      .qvpi-input {
        flex: 1; min-width: 180px; padding: 14px 16px; border-radius: 12px;
        background: var(--bg, #0a0e27); color: var(--text, #fff);
        border: 1px solid var(--border, rgba(255,255,255,.1));
        font-size: 16px; font-family: inherit; outline: none; transition: border .2s;
        letter-spacing: .5px;
      }
      .qvpi-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
      .qvpi-input.qvpi-upper { text-transform: uppercase; }
      .qvpi-btn {
        padding: 14px 24px; border: none; border-radius: 12px; cursor: pointer;
        background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%);
        color: #fff; font-weight: 700; font-size: 15px; font-family: inherit;
        transition: transform .15s, box-shadow .2s; white-space: nowrap;
      }
      .qvpi-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,.4); }
      .qvpi-btn:active { transform: translateY(0); }
      .qvpi-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
      .qvpi-btn-sm { padding: 8px 14px; font-size: 13px; border-radius: 9px; }
      .qvpi-btn-ghost {
        background: transparent; border: 1px solid var(--border, rgba(255,255,255,.15));
        color: var(--text-muted, #9ca3af);
      }
      .qvpi-btn-ghost:hover { border-color: #6366f1; color: #fff; box-shadow: none; }

      .qvpi-hint { font-size: 12px; color: var(--text-muted,#9ca3af); margin-top: 8px; }
      .qvpi-error {
        background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.35);
        color: #fca5a5; padding: 14px 16px; border-radius: 12px;
        font-size: 14px; margin-top: 14px;
      }
      .qvpi-loading {
        display: flex; align-items: center; gap: 10px; justify-content: center;
        padding: 28px; color: var(--text-muted,#9ca3af); font-size: 14px;
      }
      .qvpi-spinner {
        width: 20px; height: 20px; border: 3px solid rgba(99,102,241,.25);
        border-top-color: #6366f1; border-radius: 50%;
        animation: qvpiSpin .7s linear infinite;
      }
      @keyframes qvpiSpin { to { transform: rotate(360deg); } }

      .qvpi-result-head {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; margin-bottom: 14px; flex-wrap: wrap;
      }
      .qvpi-result-title { font-size: 16px; font-weight: 700; color: var(--text,#fff); }
      .qvpi-result-sub { font-size: 13px; color: var(--text-muted,#9ca3af); margin-top: 2px; }

      .qvpi-po-list { display: flex; flex-direction: column; gap: 12px; }
      .qvpi-po {
        background: var(--bg, #0a0e27); border: 1px solid var(--border, rgba(255,255,255,.08));
        border-radius: 12px; padding: 16px;
      }
      .qvpi-po-name { font-weight: 700; font-size: 15px; color: var(--text,#fff); margin-bottom: 10px; }
      .qvpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
      .qvpi-grid.qvpi-grid-1 { grid-template-columns: 1fr; }
      .qvpi-item { font-size: 13px; }
      .qvpi-item .qvpi-k { color: var(--text-muted,#9ca3af); display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 3px; }
      .qvpi-item .qvpi-v { color: var(--text,#fff); font-weight: 500; word-break: break-word; }

      .qvpi-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
      .qvpi-badge {
        font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 20px;
        letter-spacing: .5px;
      }
      .qvpi-badge.on { background: rgba(34,197,94,.15); color: #4ade80; border: 1px solid rgba(34,197,94,.35); }
      .qvpi-badge.off { background: rgba(239,68,68,.1); color: #f87171; border: 1px solid rgba(239,68,68,.25); }
      .qvpi-badge.info { background: rgba(99,102,241,.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,.3); }

      .qvpi-recent { margin-top: 20px; }
      .qvpi-recent h4 { font-size: 12px; color: var(--text-muted,#9ca3af); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; font-weight: 600; }
      .qvpi-chips { display: flex; gap: 8px; flex-wrap: wrap; }
      .qvpi-chip {
        padding: 7px 12px; border-radius: 20px; font-size: 12px; cursor: pointer;
        background: var(--surface,#151a3d); border: 1px solid var(--border,rgba(255,255,255,.1));
        color: var(--text-muted,#9ca3af); transition: all .2s; font-family: inherit;
      }
      .qvpi-chip:hover { border-color: #6366f1; color: #fff; }

      @media (max-width: 520px) {
        .qvpi-grid { grid-template-columns: 1fr; }
        .qvpi-btn { width: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------- HTML ----------
  function renderHTML() {
    return `
      <div class="qvpi-wrap">
        <div class="qvpi-tabs">
          <button class="qvpi-tab active" data-tab="pincode">📍 Pincode Lookup</button>
          <button class="qvpi-tab" data-tab="ifsc">🏦 IFSC Lookup</button>
        </div>

        <!-- Pincode Panel -->
        <div class="qvpi-panel active" id="qvpi-panel-pincode">
          <div class="qvpi-card">
            <label class="qvpi-label">Enter 6-digit Pincode</label>
            <div class="qvpi-input-row">
              <input class="qvpi-input" id="qvpi-pin-input" type="tel"
                inputmode="numeric" maxlength="6" placeholder="e.g. 380009"
                autocomplete="postal-code" />
              <button class="qvpi-btn" id="qvpi-pin-btn">🔍 Search</button>
            </div>
            <div class="qvpi-hint">India Post official data — area, district & state info.</div>
          </div>
          <div id="qvpi-pin-result"></div>
          <div class="qvpi-recent" id="qvpi-pin-recent" style="display:none">
            <h4>Recent Pincodes</h4>
            <div class="qvpi-chips" id="qvpi-pin-chips"></div>
          </div>
        </div>

        <!-- IFSC Panel -->
        <div class="qvpi-panel" id="qvpi-panel-ifsc">
          <div class="qvpi-card">
            <label class="qvpi-label">Enter 11-character IFSC Code</label>
            <div class="qvpi-input-row">
              <input class="qvpi-input qvpi-upper" id="qvpi-ifsc-input" type="text"
                maxlength="11" placeholder="e.g. HDFC0000001"
                autocomplete="off" spellcheck="false" />
              <button class="qvpi-btn" id="qvpi-ifsc-btn">🔍 Search</button>
            </div>
            <div class="qvpi-hint">Razorpay IFSC data — bank, branch, MICR & services.</div>
          </div>
          <div id="qvpi-ifsc-result"></div>
          <div class="qvpi-recent" id="qvpi-ifsc-recent" style="display:none">
            <h4>Recent IFSC Codes</h4>
            <div class="qvpi-chips" id="qvpi-ifsc-chips"></div>
          </div>
        </div>
      </div>
    `;
  }

  // ---------- Helpers ----------
  function toast(msg, type) {
    if (window.toast) return window.toast(msg, type);
    if (window.QVH && window.QVH.toast) return window.QVH.toast(msg, type);
    console.log('[qvpi]', type || 'info', msg);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function copy(text, label) {
    const done = () => toast((label || 'Copied') + ' ✅', 'success');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); cb(); } catch (e) { toast('Copy failed', 'error'); }
    document.body.removeChild(ta);
  }

  function setLoading(el, msg) {
    el.innerHTML = `<div class="qvpi-card"><div class="qvpi-loading">
      <div class="qvpi-spinner"></div><span>${esc(msg || 'Fetching details…')}</span>
    </div></div>`;
  }
  function setError(el, msg) {
    el.innerHTML = `<div class="qvpi-error">⚠️ ${esc(msg)}</div>`;
  }

  // ---------- Recent storage ----------
  const RECENT_KEY = 'qvpi_recent_v1';
  function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || { pincode: [], ifsc: [] }; }
    catch (e) { return { pincode: [], ifsc: [] }; }
  }
  function addRecent(kind, val) {
    const r = getRecent();
    r[kind] = [val, ...(r[kind] || []).filter(v => v !== val)].slice(0, 5);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(r)); } catch (e) {}
    renderRecent(kind);
  }
  function renderRecent(kind) {
    const wrap = document.getElementById(kind === 'pincode' ? 'qvpi-pin-recent' : 'qvpi-ifsc-recent');
    const chips = document.getElementById(kind === 'pincode' ? 'qvpi-pin-chips' : 'qvpi-ifsc-chips');
    if (!wrap || !chips) return;
    const items = getRecent()[kind] || [];
    if (!items.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    chips.innerHTML = items.map(v =>
      `<button class="qvpi-chip" data-kind="${kind}" data-val="${esc(v)}">${esc(v)}</button>`
    ).join('');
    chips.querySelectorAll('.qvpi-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const k = chip.dataset.kind, v = chip.dataset.val;
        if (k === 'pincode') {
          document.getElementById('qvpi-pin-input').value = v;
          searchPincode(v);
        } else {
          document.getElementById('qvpi-ifsc-input').value = v;
          searchIFSC(v);
        }
      });
    });
  }

  // ---------- Pincode Search ----------
  async function searchPincode(pin) {
    const resultEl = document.getElementById('qvpi-pin-result');
    pin = String(pin || '').trim();
    if (!/^\d{6}$/.test(pin)) {
      setError(resultEl, 'Invalid pincode. Please enter a valid 6-digit pincode.');
      toast('Enter valid 6-digit pincode', 'error');
      return;
    }
    setLoading(resultEl, 'Looking up pincode ' + pin + '…');
    try {
      const res = await fetch(PINCODE_API + pin);
      if (!res.ok) throw new Error('Network error: ' + res.status);
      const data = await res.json();
      const block = Array.isArray(data) ? data[0] : data;
      if (!block || block.Status !== 'Success' || !block.PostOffice || !block.PostOffice.length) {
        setError(resultEl, 'No records found for pincode ' + pin + '.');
        return;
      }
      addRecent('pincode', pin);
      renderPincodeResult(resultEl, pin, block.PostOffice);
    } catch (err) {
      setError(resultEl, 'Could not fetch data. Check your internet and try again.');
      console.error('[qvpi] pincode error:', err);
    }
  }

  function renderPincodeResult(el, pin, offices) {
    const cards = offices.map(po => {
      const rows = [
        ['District', po.District],
        ['State', po.State],
        ['Circle', po.Circle],
        ['Division', po.Division],
        ['Region', po.Region],
        ['Block', po.Block],
        ['Branch Type', po.BranchType],
        ['Delivery', po.DeliveryStatus],
        ['Country', po.Country]
      ].filter(r => r[1]);
      const grid = rows.map(([k, v]) =>
        `<div class="qvpi-item"><span class="qvpi-k">${esc(k)}</span><span class="qvpi-v">${esc(v)}</span></div>`
      ).join('');
      const copyAddr = `${po.Name}, ${po.District}, ${po.State} - ${po.Pincode}`;
      return `
        <div class="qvpi-po">
          <div class="qvpi-result-head">
            <div class="qvpi-po-name">📍 ${esc(po.Name)}</div>
            <button class="qvpi-btn qvpi-btn-sm qvpi-btn-ghost qvpi-copy-addr"
              data-copy="${esc(copyAddr)}">📋 Copy</button>
          </div>
          <div class="qvpi-grid">${grid}</div>
        </div>`;
    }).join('');

    el.innerHTML = `
      <div class="qvpi-card">
        <div class="qvpi-result-head">
          <div>
            <div class="qvpi-result-title">Pincode ${esc(pin)}</div>
            <div class="qvpi-result-sub">${offices.length} post office${offices.length > 1 ? 's' : ''} found</div>
          </div>
          <button class="qvpi-btn qvpi-btn-sm qvpi-btn-ghost qvpi-copy-addr"
            data-copy="${esc(offices.map(o => `${o.Name}, ${o.District}, ${o.State} - ${o.Pincode}`).join(' | '))}">
            📋 Copy All
          </button>
        </div>
        <div class="qvpi-po-list">${cards}</div>
      </div>`;

    el.querySelectorAll('.qvpi-copy-addr').forEach(b => {
      b.addEventListener('click', () => copy(b.dataset.copy, 'Address copied'));
    });
  }

  // ---------- IFSC Search ----------
  async function searchIFSC(ifsc) {
    const resultEl = document.getElementById('qvpi-ifsc-result');
    ifsc = String(ifsc || '').trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      setError(resultEl, 'Invalid IFSC format. Example: HDFC0000001 (4 letters + 0 + 6 alphanumeric).');
      toast('Enter valid 11-char IFSC', 'error');
      return;
    }
    setLoading(resultEl, 'Looking up IFSC ' + ifsc + '…');
    try {
      const res = await fetch(IFSC_API + ifsc);
      if (res.status === 404 || res.status === 422) {
        setError(resultEl, 'IFSC code not found. Please check and try again.');
        return;
      }
      if (!res.ok) throw new Error('Network error: ' + res.status);
      const data = await res.json();
      if (!data || !data.BANK) {
        setError(resultEl, 'No details available for ' + ifsc + '.');
        return;
      }
      addRecent('ifsc', ifsc);
      renderIFSCResult(resultEl, ifsc, data);
    } catch (err) {
      setError(resultEl, 'Could not fetch data. Check your internet and try again.');
      console.error('[qvpi] ifsc error:', err);
    }
  }

  function renderIFSCResult(el, ifsc, d) {
    const rows = [
      ['Bank', d.BANK],
      ['Branch', d.BRANCH],
      ['Address', d.ADDRESS],
      ['City', d.CITY],
      ['District', d.DISTRICT],
      ['State', d.STATE],
      ['Centre', d.CENTRE],
      ['Contact', d.CONTACT],
      ['MICR', d.MICR],
      ['SWIFT', d.SWIFT],
      ['ISO 3166', d.ISO3166],
      ['Bank Code', d.BANKCODE]
    ].filter(r => r[1]);

    const grid = rows.map(([k, v]) =>
      `<div class="qvpi-item"><span class="qvpi-k">${esc(k)}</span><span class="qvpi-v">${esc(v)}</span></div>`
    ).join('');

    const svc = (label, on) =>
      `<span class="qvpi-badge ${on ? 'on' : 'off'}">${on ? '✓' : '✕'} ${label}</span>`;

    const fullText = `Bank: ${d.BANK}\nBranch: ${d.BRANCH}\nIFSC: ${d.IFSC}\nAddress: ${d.ADDRESS}\nCity: ${d.CITY}\nState: ${d.STATE}\nMICR: ${d.MICR}`;

    el.innerHTML = `
      <div class="qvpi-card">
        <div class="qvpi-result-head">
          <div>
            <div class="qvpi-result-title">🏦 ${esc(d.BANK)}</div>
            <div class="qvpi-result-sub">${esc(d.BRANCH)} — ${esc(d.CITY || '')}${d.CITY && d.STATE ? ', ' : ''}${esc(d.STATE || '')}</div>
          </div>
          <button class="qvpi-btn qvpi-btn-sm qvpi-btn-ghost qvpi-copy-ifsc"
            data-copy="${esc(ifsc)}">📋 Copy IFSC</button>
        </div>

        <div class="qvpi-badges">
          <span class="qvpi-badge info">IFSC: ${esc(ifsc)}</span>
          ${svc('RTGS', d.RTGS)} ${svc('NEFT', d.NEFT)} ${svc('IMPS', d.IMPS)} ${svc('UPI', d.UPI)}
        </div>

        <div class="qvpi-grid" style="margin-top:16px">${grid}</div>

        <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
          <button class="qvpi-btn qvpi-btn-sm qvpi-copy-full"
            data-copy="${esc(fullText)}">📋 Copy Full Details</button>
        </div>
      </div>`;

    el.querySelectorAll('.qvpi-copy-ifsc').forEach(b =>
      b.addEventListener('click', () => copy(b.dataset.copy, 'IFSC copied')));
    el.querySelectorAll('.qvpi-copy-full').forEach(b =>
      b.addEventListener('click', () => copy(b.dataset.copy, 'Details copied')));
  }

  // ---------- Init ----------
  function init() {
    injectCSS();

    // Tabs
    document.querySelectorAll('.qvpi-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const t = tab.dataset.tab;
        document.querySelectorAll('.qvpi-tab').forEach(x => x.classList.toggle('active', x === tab));
        document.querySelectorAll('.qvpi-panel').forEach(p =>
          p.classList.toggle('active', p.id === 'qvpi-panel-' + t));
      });
    });

    // Pincode
    const pinInput = document.getElementById('qvpi-pin-input');
    const pinBtn = document.getElementById('qvpi-pin-btn');
    if (pinInput) {
      pinInput.addEventListener('input', () => {
        pinInput.value = pinInput.value.replace(/\D/g, '').slice(0, 6);
      });
      pinInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchPincode(pinInput.value); });
      pinInput.addEventListener('input', () => {
        if (pinInput.value.length === 6) searchPincode(pinInput.value);
      });
    }
    if (pinBtn) pinBtn.addEventListener('click', () => searchPincode(pinInput.value));

    // IFSC
    const ifscInput = document.getElementById('qvpi-ifsc-input');
    const ifscBtn = document.getElementById('qvpi-ifsc-btn');
    if (ifscInput) {
      ifscInput.addEventListener('input', () => {
        ifscInput.value = ifscInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
      });
      ifscInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchIFSC(ifscInput.value); });
    }
    if (ifscBtn) ifscBtn.addEventListener('click', () => searchIFSC(ifscInput.value));

    // Recents
    renderRecent('pincode');
    renderRecent('ifsc');
  }

  // ---------- Register ----------
  window.EXTRA_TOOL_RENDERERS = window.EXTRA_TOOL_RENDERERS || {};
  window.EXTRA_TOOL_INITS = window.EXTRA_TOOL_INITS || {};
  window.EXTRA_TOOL_RENDERERS['pincode-ifsc'] = renderHTML;
  window.EXTRA_TOOL_INITS['pincode-ifsc'] = init;
})();