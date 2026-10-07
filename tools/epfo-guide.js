/* ============================================================
   Qunverio — EPFO / PF Guide Tool
   Standalone tool | CSS prefix: qvepfo-
   No API key needed | No Aadhaar needed
   ============================================================ */
(function () {
  'use strict';

  const EPFO_PORTAL = 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/';
  const EPFO_PASSBOOK = 'https://passbook.epfindia.gov.in/MemberPassBook/Login';
  const EPFO_CLAIM = 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/';

  // ---------- CSS ----------
  function injectCSS() {
    if (document.getElementById('qvepfo-style')) return;
    const style = document.createElement('style');
    style.id = 'qvepfo-style';
    style.textContent = `
      .qvepfo-wrap { max-width: 820px; margin: 0 auto; padding: 4px 0 32px; }

      .qvepfo-card {
        background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,.08));
        border-radius: 16px; padding: 20px; margin-bottom: 16px;
      }
      .qvepfo-title { font-size: 18px; font-weight: 700; color: var(--text,#fff); margin-bottom: 6px; }
      .qvepfo-sub { font-size: 13px; color: var(--text-muted,#9ca3af); margin-bottom: 16px; }

      .qvepfo-label {
        display: block; font-size: 13px; font-weight: 600;
        color: var(--text-muted, #9ca3af); margin-bottom: 8px;
      }
      .qvepfo-input {
        width: 100%; padding: 14px 16px; border-radius: 12px;
        background: var(--bg, #0a0e27); color: var(--text, #fff);
        border: 1px solid var(--border, rgba(255,255,255,.1));
        font-size: 16px; font-family: inherit; outline: none; transition: border .2s;
        letter-spacing: .5px; box-sizing: border-box;
      }
      .qvepfo-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }

      .qvepfo-btn {
        padding: 14px 24px; border: none; border-radius: 12px; cursor: pointer;
        background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%);
        color: #fff; font-weight: 700; font-size: 15px; font-family: inherit;
        transition: transform .15s, box-shadow .2s; width: 100%; margin-top: 14px;
      }
      .qvepfo-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,.4); }
      .qvepfo-btn:active { transform: translateY(0); }

      .qvepfo-btn-ghost {
        background: transparent; border: 1px solid var(--border, rgba(255,255,255,.15));
        color: var(--text, #fff); display: inline-block; width: auto;
        padding: 12px 20px; margin: 8px 8px 0 0; text-decoration: none;
        font-weight: 600; font-size: 14px; border-radius: 12px;
        transition: all .2s; cursor: pointer;
      }
      .qvepfo-btn-ghost:hover { border-color: #6366f1; box-shadow: 0 4px 14px rgba(99,102,241,.25); }

      .qvepfo-hint { font-size: 12px; color: var(--text-muted,#9ca3af); margin-top: 8px; }
      .qvepfo-error {
        background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.35);
        color: #fca5a5; padding: 14px 16px; border-radius: 12px;
        font-size: 14px; margin-top: 14px;
      }

      .qvepfo-step {
        display: flex; gap: 14px; padding: 16px;
        background: var(--bg, #0a0e27); border: 1px solid var(--border, rgba(255,255,255,.08));
        border-radius: 12px; margin-bottom: 12px;
      }
      .qvepfo-step-num {
        flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%;
        background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
        color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center;
        font-size: 14px;
      }
      .qvepfo-step-content { flex: 1; }
      .qvepfo-step-title { font-size: 15px; font-weight: 700; color: var(--text,#fff); margin-bottom: 4px; }
      .qvepfo-step-desc { font-size: 13px; color: var(--text-muted,#9ca3af); line-height: 1.5; }

      .qvepfo-docs {
        background: rgba(99,102,241,.08); border: 1px solid rgba(99,102,241,.25);
        border-radius: 12px; padding: 16px; margin-top: 16px;
      }
      .qvepfo-docs h4 { font-size: 14px; color: #a5b4fc; margin-bottom: 10px; font-weight: 700; }
      .qvepfo-docs ul { margin: 0; padding-left: 20px; }
      .qvepfo-docs li { font-size: 13px; color: var(--text-muted,#9ca3af); margin-bottom: 6px; line-height: 1.5; }

      .qvepfo-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }

      .qvepfo-tip {
        background: rgba(34,197,94,.08); border: 1px solid rgba(34,197,94,.25);
        border-radius: 12px; padding: 14px 16px; margin-top: 14px;
        font-size: 13px; color: #86efac; line-height: 1.5;
      }

      @media (max-width: 520px) {
        .qvepfo-step { padding: 14px; }
        .qvepfo-btn-ghost { width: 100%; text-align: center; margin-right: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------- HTML ----------
  function renderHTML() {
    return `
      <div class="qvepfo-wrap">

        <div class="qvepfo-card">
          <div class="qvepfo-title">💰 EPFO / PF Balance Guide</div>
          <div class="qvepfo-sub">UAN daalo aur step-by-step guide lo — PF balance check, passbook, claim sab aasaan.</div>

          <label class="qvepfo-label">Enter UAN (12-digit) or PF Number</label>
          <input class="qvepfo-input" id="qvepfo-input" type="text"
            inputmode="numeric" maxlength="12" placeholder="e.g. 100123456789"
            autocomplete="off" spellcheck="false" />

          <div class="qvepfo-hint">UAN nahi pata? Payslip ya previous employer se le sakte ho.</div>

          <button class="qvepfo-btn" id="qvepfo-btn">📖 Guide Dekho</button>
          <div id="qvepfo-result"></div>
        </div>

        <div class="qvepfo-card">
          <div class="qvepfo-title">⚡ Quick Links</div>
          <div class="qvepfo-sub">Direct official EPFO portals pe jao.</div>
          <div class="qvepfo-actions">
            <a class="qvepfo-btn-ghost" href="${EPFO_PORTAL}" target="_blank" rel="noopener">🔗 Member Portal</a>
            <a class="qvepfo-btn-ghost" href="${EPFO_PASSBOOK}" target="_blank" rel="noopener">📘 Passbook</a>
            <a class="qvepfo-btn-ghost" href="https://www.epfindia.gov.in/site_en/For_Employees.php" target="_blank" rel="noopener">🌐 EPFO Home</a>
          </div>
        </div>

        <div class="qvepfo-tip">
          ⚠️ <b>Note:</b> Ye tool sirf guide deta hai. Actual balance check EPFO portal pe hoga (UAN + OTP + Aadhaar verification ke saath).
        </div>

      </div>
    `;
  }

  // ---------- Render Guide ----------
  function renderGuide(uan) {
    const el = document.getElementById('qvepfo-result');

    const steps = [
      {
        title: 'UAN Activate Karo',
        desc: 'Agar UAN naya hai, toh pehle activate karo. EPFO portal pe "Activate UAN" option hai. UAN + Aadhaar + mobile se activate hota hai.'
      },
      {
        title: 'Member Portal pe Login Karo',
        desc: 'UAN + password daalo. Password bhool gaye toh "Forgot Password" se reset karo (UAN + DOB + mobile se).'
      },
      {
        title: 'Passbook Dekho',
        desc: 'Login ke baad "View Passbook" click karo. Yahan employer-wise PF contributions, interest, aur closing balance dikhega.'
      },
      {
        title: 'KYC Update Karo',
        desc: 'Agar KYC pending hai, toh "Manage → KYC" me Aadhaar, PAN, bank details add karo. KYC complete hone pe hi claim process hoga.'
      },
      {
        title: 'Claim / Withdrawal',
        desc: 'PF withdrawal ke liye "Online Services → Claim" me jao. Form 19 (final PF), Form 10C (pension), Form 31 (advance) options hain.'
      }
    ];

    const docs = [
      'UAN (12-digit)',
      'Aadhaar number (linked with UAN)',
      'PAN card',
      'Bank account (cancelled cheque)',
      'Mobile number (UAN registered)'
    ];

    el.innerHTML = `
      <div style="margin-top:20px">
        <div class="qvepfo-title" style="font-size:16px;margin-bottom:12px">
          📖 ${uan ? 'UAN: ' + escapeHtml(uan) : ''} — Step-by-Step Guide
        </div>

        ${steps.map((s, i) => `
          <div class="qvepfo-step">
            <div class="qvepfo-step-num">${i + 1}</div>
            <div class="qvepfo-step-content">
              <div class="qvepfo-step-title">${escapeHtml(s.title)}</div>
              <div class="qvepfo-step-desc">${escapeHtml(s.desc)}</div>
            </div>
          </div>
        `).join('')}

        <div class="qvepfo-docs">
          <h4>📋 Documents Ready Rakho</h4>
          <ul>${docs.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
        </div>

        <div class="qvepfo-actions">
          <a class="qvepfo-btn-ghost" href="${EPFO_PORTAL}" target="_blank" rel="noopener">🔗 EPFO Portal pe Jao</a>
          <a class="qvepfo-btn-ghost" href="${EPFO_PASSBOOK}" target="_blank" rel="noopener">📘 Passbook Check</a>
        </div>
      </div>
    `;
  }

  // ---------- Helpers ----------
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function toast(msg, type) {
    if (window.toast) return window.toast(msg, type);
    if (window.QVH && window.QVH.toast) return window.QVH.toast(msg, type);
    console.log('[qvepfo]', type || 'info', msg);
  }

  // ---------- Init ----------
  function init() {
    injectCSS();

    const input = document.getElementById('qvepfo-input');
    const btn = document.getElementById('qvepfo-btn');

    if (input) {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 12);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleClick();
      });
    }

    if (btn) {
      btn.addEventListener('click', handleClick);
    }

    function handleClick() {
      const val = (input.value || '').trim();
      if (val && val.length !== 12) {
        const el = document.getElementById('qvepfo-result');
        el.innerHTML = `<div class="qvepfo-error">⚠️ UAN 12-digit hona chahiye. Check karo aur fir try karo.</div>`;
        toast('UAN 12-digit hona chahiye', 'error');
        return;
      }
      renderGuide(val);
      toast('Guide ready ✅', 'success');
      // Scroll to result
      setTimeout(() => {
        const el = document.getElementById('qvepfo-result');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  // ---------- Register ----------
  window.EXTRA_TOOL_RENDERERS = window.EXTRA_TOOL_RENDERERS || {};
  window.EXTRA_TOOL_INITS = window.EXTRA_TOOL_INITS || {};
  window.EXTRA_TOOL_RENDERERS['epfo-guide'] = renderHTML;
  window.EXTRA_TOOL_INITS['epfo-guide'] = init;
})();