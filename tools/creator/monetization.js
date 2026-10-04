/* ============================================================
   QUNVERIO — MONETIZATION LAB (v1.2)
   Path: tools/creator/monetization.js
   Fix: HD PNG white screen (computed colors, on-screen render)
   ============================================================ */

(function () {
  'use strict';

  if (!window.QVH) {
    console.warn('QVH not loaded — monetization.js skipping');
    return;
  }

  const QVH = window.QVH;

  /* ============================================================
     HELPERS
     ============================================================ */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function fmtINR(n) {
    n = Number(n) || 0;
    return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }
  function fmtNum(n, d) {
    return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: d || 2 });
  }

  /* ============================================================
     Get computed colors from current theme — returns HEX/RGB,
     so html-to-image can render without CSS vars
     ============================================================ */
  function themeColors() {
    const cs = getComputedStyle(document.body);
    function get(v, fallback) {
      const val = cs.getPropertyValue(v).trim();
      return val || fallback;
    }
    // Fallback: agar var value bhi var hai to ek safe fallback dete hain
    function safe(v, fallback) {
      let val = get(v, '');
      if (!val || val.startsWith('var(') || val.length > 60) return fallback;
      return val;
    }
    return {
      bg:       safe('--bg', '#0a0e27'),
      surface:  safe('--surface', '#151a3d'),
      surface2: safe('--surface-2', '#1c2250'),
      border:   safe('--border-strong', 'rgba(255,255,255,0.14)'),
      text:     safe('--text', '#eef1ff'),
      text2:    safe('--text-2', '#a8b0d8'),
      text3:    safe('--text-3', '#6b74a0')
    };
  }

  /* ============================================================
     STYLES
     ============================================================ */
  const CSS = `
    .qvhm-tabs {
      display: flex; gap: 8px; overflow-x: auto;
      padding: 4px 0 12px; margin-bottom: 4px;
      scrollbar-width: none;
    }
    .qvhm-tabs::-webkit-scrollbar { display: none; }
    .qvhm-tab {
      flex: 0 0 auto;
      padding: 8px 14px; border-radius: 20px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      font-size: 12.5px; font-weight: 700;
      color: var(--text-2, #a8b0d8);
      cursor: pointer; white-space: nowrap;
      transition: all .18s;
    }
    .qvhm-tab:hover { background: var(--surface-hover, #232a5e); }
    .qvhm-tab.active {
      background: linear-gradient(135deg,#22c55e,#10b981);
      color: #fff; border-color: transparent;
      box-shadow: 0 4px 12px rgba(34,197,94,.35);
    }
    .qvhm-section { display: none; }
    .qvhm-section.active { display: block; animation: qvhm-fade .25s ease; }
    @keyframes qvhm-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }

    .qvhm-card {
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 14px;
      padding: 16px; margin-bottom: 12px;
    }
    .qvhm-title {
      font-size: 12px; font-weight: 800;
      text-transform: uppercase; letter-spacing: .07em;
      color: var(--text-3, #6b74a0);
      margin-bottom: 12px;
    }
    .qvhm-field { margin-bottom: 12px; }
    .qvhm-field label {
      display: block; font-size: 12.5px; font-weight: 600;
      color: var(--text-2, #a8b0d8); margin-bottom: 5px;
    }
    .qvhm-field input, .qvhm-field select {
      width: 100%; padding: 11px 13px;
      background: var(--surface-2, #1c2250);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 11px;
      font-size: 14px; outline: none;
      color: var(--text, #eef1ff);
      transition: border-color .18s, box-shadow .18s;
    }
    .qvhm-field input:focus, .qvhm-field select:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16,185,129,.15);
    }
    .qvhm-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 420px) { .qvhm-row2 { grid-template-columns: 1fr; } }

    .qvhm-btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 6px; padding: 12px 18px;
      border-radius: 12px; border: none;
      font-size: 14px; font-weight: 700;
      cursor: pointer; white-space: nowrap;
      transition: transform .15s, box-shadow .18s;
    }
    .qvhm-btn:active { transform: scale(.97); }
    .qvhm-btn-primary {
      background: linear-gradient(135deg,#22c55e,#10b981);
      color: #fff;
      box-shadow: 0 4px 14px rgba(34,197,94,.35);
      width: 100%;
    }

    .qvhm-result {
      background: var(--surface, #151a3d);
      border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 14px; padding: 18px;
      margin-top: 14px; display: none;
    }
    .qvhm-result.active { display: block; animation: qvhm-fade .3s ease; }
    .qvhm-result-title {
      font-size: 11px; font-weight: 800;
      text-transform: uppercase; letter-spacing: .08em;
      color: var(--text-3, #6b74a0);
      margin-bottom: 12px; padding-bottom: 10px;
      border-bottom: 1px dashed var(--border-strong, rgba(255,255,255,0.14));
    }
    .qvhm-main {
      font-size: clamp(24px, 6.5vw, 34px);
      font-weight: 900; line-height: 1.15;
      background: linear-gradient(135deg,#22c55e,#10b981);
      -webkit-background-clip: text; background-clip: text;
      color: transparent; -webkit-text-fill-color: transparent;
      margin-bottom: 4px; word-break: break-word;
    }
    .qvhm-sub { font-size: 12.5px; color: var(--text-3, #6b74a0); margin-bottom: 14px; }
    .qvhm-line {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0; border-bottom: 1px solid var(--border, rgba(255,255,255,0.08));
      font-size: 13.5px; gap: 12px;
    }
    .qvhm-line:last-child { border-bottom: none; }
    .qvhm-line .k { color: var(--text-2, #a8b0d8); font-weight: 500; }
    .qvhm-line .v { font-weight: 700; text-align: right; word-break: break-word; }
    .qvhm-line.highlight { background: rgba(16,185,129,.1); margin: 4px -10px; padding: 10px; border-radius: 8px; border: none; }
    .qvhm-line.highlight .v { color: #10b981; }

    .qvhm-actions {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
      margin-top: 14px; padding-top: 14px;
      border-top: 1px solid var(--border, rgba(255,255,255,0.08));
    }
    @media (max-width: 380px) { .qvhm-actions { grid-template-columns: repeat(2, 1fr); } }
    .qvhm-action {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 10px 4px; border-radius: 10px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      font-size: 11px; font-weight: 700;
      color: var(--text, #eef1ff);
      cursor: pointer; transition: all .15s;
    }
    .qvhm-action:hover { background: var(--surface-hover, #232a5e); }
    .qvhm-action:active { transform: scale(.96); }
    .qvhm-action .qvh-a-icon { font-size: 15px; }
    .qvhm-action[data-act="png"] { border-color: rgba(139,92,246,.5); }
    .qvhm-action[data-act="png"]:hover { background: rgba(139,92,246,.15); }

    .qvhm-note {
      font-size: 11.5px; color: var(--text-3, #6b74a0);
      background: var(--surface-2, #1c2250);
      border-left: 3px solid #f59e0b;
      padding: 10px 12px; border-radius: 8px;
      margin-top: 12px; line-height: 1.55;
    }
  `;

  function injectCSS() {
    if (document.getElementById('qvhm-css')) return;
    const s = document.createElement('style');
    s.id = 'qvhm-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function render(container) {
    injectCSS();
    container.innerHTML = `
      <div class="qvh-tool-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#22c55e,#10b981)">
          <div class="qvh-th-icon">💰</div>
          <div style="flex:1;min-width:0">
            <h3>Monetization Lab</h3>
            <p>YouTube revenue, CPM, RPM, sponsorship & income projections</p>
          </div>
        </div>
        <div class="qvhm-tabs" id="qvhmTabs">
          <button class="qvhm-tab active" data-tab="revenue">💵 Revenue</button>
          <button class="qvhm-tab" data-tab="cpm">📊 CPM</button>
          <button class="qvhm-tab" data-tab="rpm">📈 RPM</button>
          <button class="qvhm-tab" data-tab="sponsor">🤝 Sponsor</button>
          <button class="qvhm-tab" data-tab="monthly">📅 Monthly</button>
          <button class="qvhm-tab" data-tab="goal">🎯 Goal</button>
        </div>
        <div id="qvhmSections"></div>
        <div class="qvhm-note">
          ⚠️ <strong>Note:</strong> Ye sab results <strong>estimates</strong> hain. Actual YouTube earnings CPM, audience geography, content type, season aur YouTube ke policies pe depend karti hain.
        </div>
      </div>
    `;

    document.getElementById('qvhmSections').innerHTML = `
      ${sectionRevenue()}
      ${sectionCPM()}
      ${sectionRPM()}
      ${sectionSponsor()}
      ${sectionMonthly()}
      ${sectionGoal()}
    `;

    wireTabs(container);
    wireCalculators();
  }

  function actionsBlock(boxId, title, file) {
    return `
      <div class="qvhm-actions">
        <button class="qvhm-action" data-act="copy" data-box="${boxId}"><span class="qvh-a-icon">📋</span>Copy</button>
        <button class="qvhm-action" data-act="print" data-box="${boxId}" data-title="${title}"><span class="qvh-a-icon">🖨️</span>Print</button>
        <button class="qvhm-action" data-act="pdf" data-box="${boxId}" data-file="${file}"><span class="qvh-a-icon">📄</span>PDF</button>
        <button class="qvhm-action" data-act="png" data-box="${boxId}" data-file="${file}"><span class="qvh-a-icon">🖼️</span>HD PNG</button>
      </div>
    `;
  }

  function sectionRevenue() {
    return `
      <div class="qvhm-section active" data-section="revenue">
        <div class="qvhm-card">
          <div class="qvhm-title">YouTube Revenue Calculator</div>
          <div class="qvhm-field">
            <label>Monthly Views</label>
            <input type="number" id="rv-views" placeholder="e.g. 100000" min="0" inputmode="numeric" />
          </div>
          <div class="qvhm-row2">
            <div class="qvhm-field">
              <label>CPM (₹)</label>
              <input type="number" id="rv-cpm" placeholder="e.g. 60" min="0" step="0.01" inputmode="decimal" />
            </div>
            <div class="qvhm-field">
              <label>Monetized Playback Rate (%)</label>
              <input type="number" id="rv-mpr" placeholder="e.g. 55" min="0" max="100" step="1" value="55" inputmode="numeric" />
            </div>
          </div>
          <button class="qvhm-btn qvhm-btn-primary" id="rv-calc">💰 Calculate Revenue</button>
        </div>
        <div class="qvhm-result" id="rv-result">
          <div class="qvhm-result-title">Estimated Revenue</div>
          <div class="qvhm-main" id="rv-main">₹0</div>
          <div class="qvhm-sub" id="rv-sub"></div>
          <div id="rv-breakdown"></div>
          ${actionsBlock('rv-result', 'YouTube Revenue Report', 'qunverio-youtube-revenue')}
        </div>
      </div>
    `;
  }

  function sectionCPM() {
    return `
      <div class="qvhm-section" data-section="cpm">
        <div class="qvhm-card">
          <div class="qvhm-title">CPM Calculator</div>
          <div class="qvhm-field">
            <label>Total Ad Revenue (₹)</label>
            <input type="number" id="cp-rev" placeholder="e.g. 5000" min="0" step="0.01" inputmode="decimal" />
          </div>
          <div class="qvhm-field">
            <label>Total Ad Impressions (in thousands)</label>
            <input type="number" id="cp-imp" placeholder="e.g. 100 (for 100,000 impressions)" min="0" step="0.01" inputmode="decimal" />
            <div style="font-size:11px;color:var(--text-3);margin-top:4px">CPM = Revenue ÷ (Impressions ÷ 1000). Agar 100,000 impressions hain toh 100 likho.</div>
          </div>
          <button class="qvhm-btn qvhm-btn-primary" id="cp-calc">📊 Calculate CPM</button>
        </div>
        <div class="qvhm-result" id="cp-result">
          <div class="qvhm-result-title">Calculated CPM</div>
          <div class="qvhm-main" id="cp-main">₹0</div>
          <div class="qvhm-sub">Cost per 1,000 impressions</div>
          <div id="cp-breakdown"></div>
          ${actionsBlock('cp-result', 'CPM Report', 'qunverio-cpm')}
        </div>
      </div>
    `;
  }

  function sectionRPM() {
    return `
      <div class="qvhm-section" data-section="rpm">
        <div class="qvhm-card">
          <div class="qvhm-title">RPM Calculator</div>
          <div class="qvhm-field">
            <label>Total Revenue (₹)</label>
            <input type="number" id="rp-rev" placeholder="e.g. 5000" min="0" step="0.01" inputmode="decimal" />
          </div>
          <div class="qvhm-field">
            <label>Total Views (in thousands)</label>
            <input type="number" id="rp-views" placeholder="e.g. 200 (for 200,000 views)" min="0" step="0.01" inputmode="decimal" />
            <div style="font-size:11px;color:var(--text-3);margin-top:4px">RPM = Revenue ÷ (Views ÷ 1000).</div>
          </div>
          <button class="qvhm-btn qvhm-btn-primary" id="rp-calc">📈 Calculate RPM</button>
        </div>
        <div class="qvhm-result" id="rp-result">
          <div class="qvhm-result-title">Calculated RPM</div>
          <div class="qvhm-main" id="rp-main">₹0</div>
          <div class="qvhm-sub">Revenue per 1,000 total views</div>
          <div id="rp-breakdown"></div>
          ${actionsBlock('rp-result', 'RPM Report', 'qunverio-rpm')}
        </div>
      </div>
    `;
  }

  function sectionSponsor() {
    return `
      <div class="qvhm-section" data-section="sponsor">
        <div class="qvhm-card">
          <div class="qvhm-title">Sponsorship Rate Estimator</div>
          <div class="qvhm-row2">
            <div class="qvhm-field">
              <label>Average Views per Video</label>
              <input type="number" id="sp-views" placeholder="e.g. 50000" min="0" inputmode="numeric" />
            </div>
            <div class="qvhm-field">
              <label>Niche Type</label>
              <select id="sp-niche">
                <option value="0.015">General / Vlog (low)</option>
                <option value="0.025" selected>Education / How-to (medium)</option>
                <option value="0.04">Tech / Finance (high)</option>
                <option value="0.06">Business / SaaS (premium)</option>
                <option value="0.08">Insurance / Loan (very high)</option>
              </select>
            </div>
          </div>
          <div class="qvhm-field">
            <label>Negotiation Multiplier</label>
            <select id="sp-mult">
              <option value="0.7">Beginner (0.7x)</option>
              <option value="1.0" selected>Standard (1.0x)</option>
              <option value="1.3">Established (1.3x)</option>
              <option value="1.6">Premium (1.6x)</option>
            </select>
          </div>
          <button class="qvhm-btn qvhm-btn-primary" id="sp-calc">🤝 Estimate Sponsorship Rate</button>
        </div>
        <div class="qvhm-result" id="sp-result">
          <div class="qvhm-result-title">Estimated Sponsorship Rate</div>
          <div class="qvhm-main" id="sp-main">₹0</div>
          <div class="qvhm-sub">Approximate range per sponsored video</div>
          <div id="sp-breakdown"></div>
          ${actionsBlock('sp-result', 'Sponsorship Rate Report', 'qunverio-sponsorship')}
        </div>
      </div>
    `;
  }

  function sectionMonthly() {
    return `
      <div class="qvhm-section" data-section="monthly">
        <div class="qvhm-card">
          <div class="qvhm-title">Monthly Income Projection</div>
          <div class="qvhm-field">
            <label>Average Monthly Views</label>
            <input type="number" id="mo-views" placeholder="e.g. 500000" min="0" inputmode="numeric" />
          </div>
          <div class="qvhm-row2">
            <div class="qvhm-field">
              <label>CPM (₹)</label>
              <input type="number" id="mo-cpm" placeholder="e.g. 60" min="0" step="0.01" value="60" inputmode="decimal" />
            </div>
            <div class="qvhm-field">
              <label>Monetized Playback (%)</label>
              <input type="number" id="mo-mpr" placeholder="e.g. 55" min="0" max="100" value="55" inputmode="numeric" />
            </div>
          </div>
          <div class="qvhm-row2">
            <div class="qvhm-field">
              <label>Monthly Sponsorships</label>
              <input type="number" id="mo-sponsors" placeholder="e.g. 2" min="0" value="0" inputmode="numeric" />
            </div>
            <div class="qvhm-field">
              <label>Per Sponsorship (₹)</label>
              <input type="number" id="mo-sponrate" placeholder="e.g. 15000" min="0" value="0" inputmode="numeric" />
            </div>
          </div>
          <button class="qvhm-btn qvhm-btn-primary" id="mo-calc">📅 Project Income</button>
        </div>
        <div class="qvhm-result" id="mo-result">
          <div class="qvhm-result-title">Monthly Income Projection</div>
          <div class="qvhm-main" id="mo-main">₹0</div>
          <div class="qvhm-sub">Total estimated monthly income</div>
          <div id="mo-breakdown"></div>
          ${actionsBlock('mo-result', 'Monthly Income Projection', 'qunverio-monthly-income')}
        </div>
      </div>
    `;
  }

  function sectionGoal() {
    return `
      <div class="qvhm-section" data-section="goal">
        <div class="qvhm-card">
          <div class="qvhm-title">Goal Calculator</div>
          <div class="qvhm-field">
            <label>Target Monthly Income (₹)</label>
            <input type="number" id="gl-target" placeholder="e.g. 50000" min="0" inputmode="numeric" />
          </div>
          <div class="qvhm-row2">
            <div class="qvhm-field">
              <label>Your CPM (₹)</label>
              <input type="number" id="gl-cpm" placeholder="e.g. 60" min="0" step="0.01" value="60" inputmode="decimal" />
            </div>
            <div class="qvhm-field">
              <label>Monetized Playback (%)</label>
              <input type="number" id="gl-mpr" placeholder="e.g. 55" min="0" max="100" value="55" inputmode="numeric" />
            </div>
          </div>
          <button class="qvhm-btn qvhm-btn-primary" id="gl-calc">🎯 Calculate Required Views</button>
        </div>
        <div class="qvhm-result" id="gl-result">
          <div class="qvhm-result-title">Required Monthly Views</div>
          <div class="qvhm-main" id="gl-main">0</div>
          <div class="qvhm-sub">Estimated views needed to hit your goal</div>
          <div id="gl-breakdown"></div>
          ${actionsBlock('gl-result', 'Goal Calculator Report', 'qunverio-goal')}
        </div>
      </div>
    `;
  }

  function wireTabs(container) {
    container.querySelectorAll('.qvhm-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.qvhm-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const id = tab.dataset.tab;
        container.querySelectorAll('.qvhm-section').forEach(s => {
          s.classList.toggle('active', s.dataset.section === id);
        });
      });
    });
  }

  function wireCalculators() {
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };

    bind('rv-calc', () => {
      const views = parseFloat(document.getElementById('rv-views').value) || 0;
      const cpm = parseFloat(document.getElementById('rv-cpm').value) || 0;
      const mpr = parseFloat(document.getElementById('rv-mpr').value) || 55;
      if (!views || !cpm) { QVH.toast('Views aur CPM daalo', 'error'); return; }
      const monViews = views * (mpr / 100);
      const rev = (monViews / 1000) * cpm;
      showResult('rv-result', {
        main: fmtINR(rev),
        sub: `${fmtNum(views)} views @ ${mpr}% monetized @ ₹${cpm} CPM`,
        rows: [
          { k: 'Total views', v: fmtNum(views) },
          { k: 'Monetized views', v: fmtNum(monViews) },
          { k: 'CPM', v: '₹' + cpm },
          { k: 'Estimated revenue', v: fmtINR(rev), highlight: true },
          { k: 'Daily average', v: fmtINR(rev / 30) },
          { k: 'Yearly projection', v: fmtINR(rev * 12), highlight: true }
        ]
      });
    });

    bind('cp-calc', () => {
      const rev = parseFloat(document.getElementById('cp-rev').value) || 0;
      const impK = parseFloat(document.getElementById('cp-imp').value) || 0;
      if (!rev || !impK) { QVH.toast('Revenue aur impressions daalo', 'error'); return; }
      const cpm = rev / impK;
      showResult('cp-result', {
        main: fmtINR(cpm),
        sub: `₹${fmtNum(rev)} revenue ÷ ${fmtNum(impK * 1000)} impressions × 1000`,
        rows: [
          { k: 'Total revenue', v: fmtINR(rev) },
          { k: 'Total impressions', v: fmtNum(impK * 1000) },
          { k: 'CPM', v: fmtINR(cpm), highlight: true }
        ]
      });
    });

    bind('rp-calc', () => {
      const rev = parseFloat(document.getElementById('rp-rev').value) || 0;
      const viewsK = parseFloat(document.getElementById('rp-views').value) || 0;
      if (!rev || !viewsK) { QVH.toast('Revenue aur views daalo', 'error'); return; }
      const rpm = rev / viewsK;
      showResult('rp-result', {
        main: fmtINR(rpm),
        sub: `₹${fmtNum(rev)} revenue ÷ ${fmtNum(viewsK * 1000)} views × 1000`,
        rows: [
          { k: 'Total revenue', v: fmtINR(rev) },
          { k: 'Total views', v: fmtNum(viewsK * 1000) },
          { k: 'RPM', v: fmtINR(rpm), highlight: true }
        ]
      });
    });

    bind('sp-calc', () => {
      const views = parseFloat(document.getElementById('sp-views').value) || 0;
      const niche = parseFloat(document.getElementById('sp-niche').value) || 0.025;
      const mult = parseFloat(document.getElementById('sp-mult').value) || 1;
      if (!views) { QVH.toast('Average views daalo', 'error'); return; }
      const base = views * niche * mult;
      const low = base * 0.8;
      const high = base * 1.25;
      showResult('sp-result', {
        main: fmtINR(base),
        sub: `Approx range: ${fmtINR(low)} – ${fmtINR(high)} per video`,
        rows: [
          { k: 'Average views', v: fmtNum(views) },
          { k: 'Niche rate', v: '₹' + (niche * 1000).toFixed(1) + ' per 1000 views' },
          { k: 'Multiplier', v: mult + 'x' },
          { k: 'Estimated base', v: fmtINR(base), highlight: true },
          { k: 'Low estimate', v: fmtINR(low) },
          { k: 'High estimate', v: fmtINR(high) }
        ]
      });
    });

    bind('mo-calc', () => {
      const views = parseFloat(document.getElementById('mo-views').value) || 0;
      const cpm = parseFloat(document.getElementById('mo-cpm').value) || 60;
      const mpr = parseFloat(document.getElementById('mo-mpr').value) || 55;
      const sponsors = parseFloat(document.getElementById('mo-sponsors').value) || 0;
      const sponRate = parseFloat(document.getElementById('mo-sponrate').value) || 0;
      if (!views) { QVH.toast('Average monthly views daalo', 'error'); return; }
      const monViews = views * (mpr / 100);
      const adRev = (monViews / 1000) * cpm;
      const sponRev = sponsors * sponRate;
      const total = adRev + sponRev;
      showResult('mo-result', {
        main: fmtINR(total),
        sub: `Ads: ${fmtINR(adRev)} + Sponsors: ${fmtINR(sponRev)}`,
        rows: [
          { k: 'Monthly views', v: fmtNum(views) },
          { k: 'Ad revenue', v: fmtINR(adRev) },
          { k: 'Sponsorship revenue', v: fmtINR(sponRev) },
          { k: 'Total monthly', v: fmtINR(total), highlight: true },
          { k: 'Yearly projection', v: fmtINR(total * 12), highlight: true }
        ]
      });
    });

    bind('gl-calc', () => {
      const target = parseFloat(document.getElementById('gl-target').value) || 0;
      const cpm = parseFloat(document.getElementById('gl-cpm').value) || 60;
      const mpr = parseFloat(document.getElementById('gl-mpr').value) || 55;
      if (!target) { QVH.toast('Target income daalo', 'error'); return; }
      const revenuePerView = (cpm / 1000) * (mpr / 100);
      const viewsNeeded = target / revenuePerView;
      const dailyViews = viewsNeeded / 30;
      showResult('gl-result', {
        main: fmtNum(Math.ceil(viewsNeeded)) + ' views',
        sub: `~${fmtNum(Math.ceil(dailyViews))} views per day`,
        rows: [
          { k: 'Target income', v: fmtINR(target) },
          { k: 'CPM', v: '₹' + cpm },
          { k: 'Monetized playback', v: mpr + '%' },
          { k: 'Required monthly views', v: fmtNum(Math.ceil(viewsNeeded)), highlight: true },
          { k: 'Required daily views', v: fmtNum(Math.ceil(dailyViews)) },
          { k: 'Required yearly views', v: fmtNum(Math.ceil(viewsNeeded * 12)), highlight: true }
        ]
      });
    });

    document.querySelectorAll('.qvhm-action').forEach(btn => {
      btn.addEventListener('click', () => handleAction(btn));
    });
  }

  function showResult(id, opts) {
    const box = document.getElementById(id);
    if (!box) return;
    const mainEl = box.querySelector('.qvhm-main');
    const subEl = box.querySelector('.qvhm-sub');
    const breakdown = box.querySelector('div[id$="-breakdown"]');
    if (mainEl) mainEl.textContent = opts.main;
    if (subEl) subEl.textContent = opts.sub || '';
    if (breakdown) {
      breakdown.innerHTML = (opts.rows || []).map(r => `
        <div class="qvhm-line ${r.highlight ? 'highlight' : ''}">
          <span class="k">${esc(r.k)}</span>
          <span class="v">${esc(r.v)}</span>
        </div>
      `).join('');
    }
    box.classList.add('active');
    if (typeof QVH.toast === 'function') QVH.toast('Calculated ✅', 'success');
  }

  /* ============================================================
     ACTION HANDLER
     ============================================================ */
  function handleAction(btn) {
    const act = btn.dataset.act;
    const boxId = btn.dataset.box;
    const box = document.getElementById(boxId);
    if (!box || !box.classList.contains('active')) {
      QVH.toast('Pehle calculate karo', 'error'); return;
    }

    if (act === 'copy') {
      const text = box.innerText.replace(/\s+/g, ' ').trim();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => QVH.toast('Copied! 📋', 'success'))
          .catch(() => QVH.toast('Copy failed', 'error'));
      }
      return;
    }

    if (act === 'print') { printDark(boxId, btn.dataset.title || 'Qunverio Report'); return; }
    if (act === 'pdf')   { pdfDark(boxId, btn.dataset.file || 'qunverio-report', btn.dataset.title || 'Qunverio Report'); return; }
    if (act === 'png')   { pngHD(boxId, btn.dataset.file || 'qunverio-report'); return; }
  }

  /* ============================================================
     BUILD REPORT HTML (for print & PDF — uses raw colors)
     ============================================================ */
  function buildReportHTML(sourceEl, title) {
    const c = themeColors();
    const clone = sourceEl.cloneNode(true);
    clone.querySelectorAll('.qvhm-actions').forEach(n => n.remove());

    const main = clone.querySelector('.qvhm-main')?.textContent || '';
    const sub  = clone.querySelector('.qvhm-sub')?.textContent || '';
    const titleText = clone.querySelector('.qvhm-result-title')?.textContent || '';
    const rows = [];
    clone.querySelectorAll('.qvhm-line').forEach(line => {
      rows.push({
        k: line.querySelector('.k')?.textContent || '',
        v: line.querySelector('.v')?.textContent || '',
        hi: line.classList.contains('highlight')
      });
    });

    const now = new Date().toLocaleString('en-IN');

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<title>Qunverio — ${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
    background: ${c.bg};
    color: ${c.text};
    padding: 40px 32px;
    min-height: 100vh;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .wrap { max-width: 720px; margin: 0 auto; }
  .brand {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 18px;
    border-bottom: 3px solid #6366f1;
    margin-bottom: 26px;
  }
  .brand-logo { display: flex; align-items: center; gap: 10px; }
  .brand-icon {
    width: 40px; height: 40px; border-radius: 11px;
    background: linear-gradient(135deg,#6366f1,#ec4899);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .brand-name {
    font-size: 22px; font-weight: 900;
    background: linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);
    -webkit-background-clip: text; background-clip: text;
    color: transparent; -webkit-text-fill-color: transparent;
  }
  .brand-meta { font-size: 12px; color: ${c.text2}; text-align: right; }
  .doc-title {
    font-size: 12px; font-weight: 800;
    text-transform: uppercase; letter-spacing: .1em;
    color: ${c.text3}; margin-bottom: 16px;
  }
  .headline {
    font-size: 13px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .08em;
    color: ${c.text3}; margin-bottom: 10px;
  }
  .big {
    font-size: 46px; font-weight: 900;
    line-height: 1.1; margin-bottom: 6px;
    background: linear-gradient(135deg,#22c55e,#10b981);
    -webkit-background-clip: text; background-clip: text;
    color: transparent; -webkit-text-fill-color: transparent;
    word-break: break-word;
  }
  .sub { font-size: 14px; color: ${c.text2}; margin-bottom: 26px; }
  .rows {
    background: ${c.surface};
    border: 1.5px solid ${c.border};
    border-radius: 16px;
    padding: 20px 22px;
  }
  .line {
    display: flex; justify-content: space-between; align-items: center;
    padding: 13px 0;
    border-bottom: 1px solid ${c.border};
    font-size: 14.5px; gap: 14px;
  }
  .line:last-child { border-bottom: none; }
  .line .k { color: ${c.text2}; font-weight: 500; }
  .line .v { font-weight: 700; text-align: right; color: ${c.text}; }
  .line.hi {
    background: rgba(16,185,129,0.12);
    margin: 6px -12px;
    padding: 13px 12px;
    border-radius: 10px;
    border: none;
  }
  .line.hi .v { color: #10b981; font-size: 16px; font-weight: 800; }
  .footer {
    margin-top: 30px; padding-top: 20px;
    border-top: 1px solid ${c.border};
    text-align: center;
    font-size: 11.5px; color: ${c.text3};
  }
  .footer strong { color: ${c.text2}; }
  .note {
    margin-top: 18px; padding: 12px 14px;
    background: rgba(245,158,11,0.1);
    border-left: 3px solid #f59e0b;
    border-radius: 8px;
    font-size: 11.5px; color: ${c.text2}; line-height: 1.6;
  }
  @media print {
    body { background: ${c.bg} !important; padding: 20px 16px; }
    .wrap { max-width: 100%; }
    .big { font-size: 34px; }
    .rows { padding: 16px; }
  }
  @page { margin: 14mm; size: A4; }
</style>
</head><body>
  <div class="wrap">
    <div class="brand">
      <div class="brand-logo">
        <div class="brand-icon">⚡</div>
        <div class="brand-name">Qunverio</div>
      </div>
      <div class="brand-meta">Creator Hub<br>${now}</div>
    </div>
    <div class="doc-title">${title}</div>
    <div class="headline">${titleText}</div>
    <div class="big">${main}</div>
    <div class="sub">${sub}</div>
    <div class="rows">
      ${rows.map(r => `
        <div class="line ${r.hi ? 'hi' : ''}">
          <span class="k">${r.k}</span>
          <span class="v">${r.v}</span>
        </div>
      `).join('')}
    </div>
    <div class="note">
      ⚠️ <strong>Note:</strong> Ye results estimates hain. Actual YouTube earnings CPM, audience geography, content type, season aur YouTube policies pe depend karti hain. Qunverio is not affiliated with YouTube.
    </div>
    <div class="footer">
      Generated by <strong>Qunverio Creator Hub</strong> • qunverio.vercel.app
    </div>
  </div>
</body></html>`;
  }

  /* ============================================================
     PRINT
     ============================================================ */
  function printDark(boxId, title) {
    const box = document.getElementById(boxId);
    if (!box) return;
    const html = buildReportHTML(box, title);
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => {
      try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) { console.error(e); }
      setTimeout(() => { if (iframe.parentNode) document.body.removeChild(iframe); }, 1500);
    }, 700);
  }

  /* ============================================================
     PDF (dark premium via html-to-image on iframe body)
     ============================================================ */
  async function pdfDark(boxId, file, title) {
    const box = document.getElementById(boxId);
    if (!box) return;
    QVH.toast('Generating PDF...', '');
    const html = buildReportHTML(box, title);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:0;top:0;width:820px;height:1200px;border:0;opacity:0;pointer-events:none;z-index:-1;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();

    setTimeout(async () => {
      try {
        const target = doc.body;
        if (!window.htmlToImage) { QVH.toast('PDF library missing', 'error'); document.body.removeChild(iframe); return; }

        const c = themeColors();
        const dataUrl = await window.htmlToImage.toPng(target, {
          quality: 1,
          pixelRatio: 2.5,
          backgroundColor: c.bg,
          width: target.scrollWidth,
          height: target.scrollHeight,
          cacheBust: true
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();

        const img = new Image();
        img.onload = () => {
          // dark background page
          pdf.setFillColor(10, 14, 39);
          pdf.rect(0, 0, pw, ph, 'F');
          const ratio = img.width / img.height;
          let w = pw - 12;
          let h = w / ratio;
          if (h > ph - 12) { h = ph - 12; w = h * ratio; }
          const x = (pw - w) / 2;
          const y = (ph - h) / 2;
          pdf.addImage(dataUrl, 'PNG', x, y, w, h, undefined, 'FAST');
          pdf.save((file || 'qunverio-report') + '.pdf');
          QVH.toast('PDF downloaded ✅', 'success');
        };
        img.src = dataUrl;
      } catch (e) {
        console.error(e);
        QVH.toast('PDF failed', 'error');
      } finally {
        if (iframe.parentNode) document.body.removeChild(iframe);
      }
    }, 900);
  }

  /* ============================================================
     HD PNG — render OFF-SCREEN wrapper (not -99999px)
     Uses computed colors, invisible via opacity/z-index
     ============================================================ */
  async function pngHD(boxId, file) {
    const box = document.getElementById(boxId);
    if (!box) return;
    QVH.toast('Generating HD PNG...', '');

    const c = themeColors();

    // Extract data
    const main = box.querySelector('.qvhm-main')?.textContent || '';
    const sub  = box.querySelector('.qvhm-sub')?.textContent || '';
    const titleText = box.querySelector('.qvhm-result-title')?.textContent || '';
    const rows = [];
    box.querySelectorAll('.qvhm-line').forEach(line => {
      rows.push({
        k: line.querySelector('.k')?.textContent || '',
        v: line.querySelector('.v')?.textContent || '',
        hi: line.classList.contains('highlight')
      });
    });

    const now = new Date().toLocaleString('en-IN');

    // Build wrapper — WILL be visible in DOM but hidden via opacity + z-index
    // (html-to-image needs the element to be laid out, not display:none or off-screen)
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 720px;
      padding: 32px 28px 26px;
      background: ${c.bg};
      color: ${c.text};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
      border-radius: 20px;
      box-sizing: border-box;
      opacity: 0;
      z-index: -1;
      pointer-events: none;
    `;

    wrapper.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:16px;border-bottom:3px solid #6366f1;margin-bottom:22px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#ec4899);display:flex;align-items:center;justify-content:center;font-size:20px;">⚡</div>
          <div style="font-size:22px;font-weight:900;color:#8b5cf6;">Qunverio</div>
        </div>
        <div style="font-size:12px;color:${c.text2};text-align:right;line-height:1.4;">
          Creator Hub<br>${now}
        </div>
      </div>

      <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${c.text3};margin-bottom:14px;">
        ${titleText}
      </div>
      <div style="font-size:46px;font-weight:900;line-height:1.1;margin-bottom:6px;color:#10b981;word-break:break-word;">
        ${main}
      </div>
      <div style="font-size:14px;color:${c.text2};margin-bottom:22px;">${sub}</div>

      <div style="background:${c.surface};border:1.5px solid ${c.border};border-radius:16px;padding:18px 20px;">
        ${rows.map(r => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid ${c.border};font-size:14.5px;gap:14px;${r.hi ? 'background:rgba(16,185,129,0.12);margin:6px -12px;padding:12px;border-radius:10px;border:none;' : ''}">
            <span style="color:${c.text2};font-weight:500;">${r.k}</span>
            <span style="font-weight:700;text-align:right;color:${r.hi ? '#10b981' : c.text};font-size:${r.hi ? '16px' : '14.5px'};">${r.v}</span>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:18px;padding:12px 14px;background:rgba(245,158,11,0.1);border-left:3px solid #f59e0b;border-radius:8px;font-size:11.5px;color:${c.text2};line-height:1.6;">
        ⚠️ <strong style="color:${c.text};">Note:</strong> Ye results estimates hain. Actual YouTube earnings CPM, audience geography, content type, season aur YouTube policies pe depend karti hain.
      </div>

      <div style="margin-top:22px;padding-top:16px;border-top:1px solid ${c.border};text-align:center;font-size:11.5px;color:${c.text3};">
        Generated by <strong style="color:${c.text2};">Qunverio Creator Hub</strong> • qunverio.vercel.app
      </div>
    `;

    document.body.appendChild(wrapper);

    // Wait for layout & fonts
    await new Promise(r => setTimeout(r, 500));

    if (!window.htmlToImage) {
      QVH.toast('PNG library missing', 'error');
      document.body.removeChild(wrapper);
      return;
    }

    try {
      const dataUrl = await window.htmlToImage.toPng(wrapper, {
        quality: 1,
        pixelRatio: 4,
        backgroundColor: c.bg,
        width: wrapper.scrollWidth,
        height: wrapper.scrollHeight,
        cacheBust: true,
        skipFonts: false
      });
      const a = document.createElement('a');
      a.download = (file || 'qunverio-report') + '.png';
      a.href = dataUrl;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      QVH.toast('HD PNG downloaded ✅', 'success');
    } catch (e) {
      console.error(e);
      QVH.toast('PNG failed: ' + (e.message || 'unknown'), 'error');
    } finally {
      if (wrapper.parentNode) document.body.removeChild(wrapper);
    }
  }

  QVH.registerRenderer('money', render);
  console.log('%c✅ Monetization Lab registered (v1.2)', 'color:#10b981;font-weight:bold');
})();