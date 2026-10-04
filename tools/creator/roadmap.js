/* ============================================================
   QUNVERIO — YOUTUBE ROADMAP
   Path: tools/creator/roadmap.js
   Beginner → Pro journey with progress tracking (localStorage)
   ============================================================ */

(function () {
  'use strict';

  if (!window.QVH) {
    console.warn('QVH not loaded — roadmap.js skipping');
    return;
  }

  const QVH = window.QVH;
  const STORAGE_KEY = 'qvh_roadmap_v1';

  /* ============================================================
     HELPERS
     ============================================================ */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) {}
  }

  /* ============================================================
     ROADMAP DATA
     ============================================================ */
  const ROADMAP = [
    {
      id: 'start',
      icon: '🚀',
      title: '1. Start YouTube',
      subtitle: 'Setup your channel from scratch',
      color: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      target: 'Day 1',
      items: [
        'Create a Google account (if not already)',
        'Create a YouTube channel with a clear name',
        'Add a professional profile picture',
        'Write a channel description (2-3 lines)',
        'Add channel banner (2560×1440 px)',
        'Add links (Instagram, website, etc.)',
        'Enable 2-Step Verification for security'
      ]
    },
    {
      id: 'niche',
      icon: '🎯',
      title: '2. Choose Your Niche',
      subtitle: 'Find what you want to make videos about',
      color: 'linear-gradient(135deg,#f59e0b,#f97316)',
      target: 'Day 2-3',
      items: [
        'List 3-5 things you know or enjoy',
        'Check if there is audience demand (search on YouTube)',
        'See if top creators exist — good sign, not bad',
        'Pick one niche and commit for at least 20 videos',
        'Identify your target audience (age, language, region)',
        'Write down what makes you different from others'
      ]
    },
    {
      id: 'setup',
      icon: '⚙️',
      title: '3. Channel Setup',
      subtitle: 'Professional look from day one',
      color: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
      target: 'Day 3-4',
      items: [
        'Verify your phone number (unlock longer videos)',
        'Set your channel keywords in settings',
        'Add channel trailer for new visitors',
        'Create a 3-5 video playlist structure',
        'Customize your channel layout',
        'Enable advanced features in YouTube Studio'
      ]
    },
    {
      id: 'first-video',
      icon: '🎬',
      title: '4. Your First Video',
      subtitle: 'The hardest one — just start',
      color: 'linear-gradient(135deg,#ec4899,#ef4444)',
      target: 'Week 1',
      items: [
        'Pick a simple topic you can explain',
        'Write a basic script (even 200 words is fine)',
        'Record with phone or any camera you have',
        'Edit with free tools (CapCut, DaVinci Resolve)',
        'Create a simple thumbnail in Canva',
        'Write a title (40-60 characters)',
        'Write description with keywords',
        'Upload and set to Public',
        'Share on WhatsApp / Instagram status',
        'Respond to every comment for first week'
      ]
    },
    {
      id: 'first-10',
      icon: '🔟',
      title: '5. First 10 Videos',
      subtitle: 'Consistency over perfection',
      color: 'linear-gradient(135deg,#10b981,#059669)',
      target: 'Month 1-2',
      items: [
        'Publish 1 video per week minimum',
        'Try different formats (tutorial, vlog, list)',
        'Study your Analytics — which video did best?',
        'Improve one thing each video',
        'Do not delete old videos',
        'Ask for feedback from friends',
        'Keep learning from bigger creators in your niche'
      ]
    },
    {
      id: '100-subs',
      icon: '💯',
      title: '6. First 100 Subscribers',
      subtitle: 'Your first real milestone',
      color: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
      target: 'Month 2-4',
      items: [
        'Share every video in relevant Facebook groups',
        'Comment on similar creators\' videos (genuinely)',
        'Make a "subscribe" ask in every video (but not desperate)',
        'Create a pinned comment inviting subs',
        'Collaborate with other small creators',
        'Make at least one video targeting a trending topic',
        'Reply to all comments personally'
      ]
    },
    {
      id: '1000-subs',
      icon: '🏆',
      title: '7. 1,000 Subscribers + 4,000 Hours',
      subtitle: 'Monetization eligibility',
      color: 'linear-gradient(135deg,#22c55e,#10b981)',
      target: 'Month 6-12',
      items: [
        'Publish consistently (minimum 1 per week)',
        'Study YouTube Studio Analytics weekly',
        'Focus on watch time — not just views',
        'Make longer videos (8+ minutes) where suitable',
        'Improve thumbnails + titles (this is 80% of CTR)',
        'Build 2-3 recurring series formats',
        'Create a Shorts strategy to boost discovery'
      ]
    },
    {
      id: 'monetize',
      icon: '💰',
      title: '8. Monetization Basics',
      subtitle: 'YPP + sponsorships',
      color: 'linear-gradient(135deg,#f59e0b,#f97316)',
      target: 'After 1K subs',
      items: [
        'Apply to YouTube Partner Program',
        'Link AdSense account',
        'Set up Google payment info + tax info',
        'Understand CPM vs RPM (RPM is what you get)',
        'Do not rely only on ads — plan sponsorships',
        'Explore Super Thanks, memberships, Super Chat',
        'Read YouTube monetization policies fully'
      ]
    },
    {
      id: 'seo',
      icon: '🔍',
      title: '9. SEO & Growth',
      subtitle: 'Get discovered by new viewers',
      color: 'linear-gradient(135deg,#14b8a6,#06b6d4)',
      target: 'Ongoing',
      items: [
        'Research keywords before making videos',
        'Put main keyword in title, description, tags',
        'Add timestamps / chapters to videos',
        'Write detailed descriptions (150+ words)',
        'Use 3-5 relevant hashtags',
        'Add end screens + cards to every video',
        'Create playlists with keyword-rich titles'
      ]
    },
    {
      id: 'thumbnail',
      icon: '🖼️',
      title: '10. Thumbnail Mastery',
      subtitle: 'CTR is 80% of YouTube growth',
      color: 'linear-gradient(135deg,#ec4899,#ef4444)',
      target: 'Ongoing',
      items: [
        'Use big faces with clear emotions',
        'Use 3-5 words maximum text',
        'High contrast colors (test on mobile)',
        'Never clickbait falsely — deliver on promise',
        'Use consistent brand colors/fonts',
        'Test 2-3 thumbnail variants when possible',
        'Study what top creators in your niche do'
      ]
    },
    {
      id: 'scale',
      icon: '📈',
      title: '11. Scale to 10K+',
      subtitle: 'Turn YouTube into income',
      color: 'linear-gradient(135deg,#3b82f6,#6366f1)',
      target: 'Year 1-2',
      items: [
        'Build email list or community (Discord/Telegram)',
        'Create digital products or courses',
        'Pitch to brands directly (sponsorship deck)',
        'Hire an editor / thumbnail designer',
        'Diversify to Shorts + Longs + Community posts',
        'Add affiliate marketing where it fits naturally',
        'Consider membership / Patreon'
      ]
    },
    {
      id: 'pro',
      icon: '👑',
      title: '12. Full-Time Creator',
      subtitle: 'Sustainable long-term career',
      color: 'linear-gradient(135deg,#a0522d,#c47b4a)',
      target: 'Year 2+',
      items: [
        'Multiple income streams (ads, sponsors, products)',
        'Outsource: editor, writer, thumbnail, manager',
        'Build team or agency if scaling beyond yourself',
        'Track all income + expenses properly',
        'Register as business if income is significant',
        'Balance content creation with business operations',
        'Never stop learning the platform changes'
      ]
    }
  ];

  /* ============================================================
     STYLES
     ============================================================ */
  const CSS = `
    .qvhr-wrap { max-width: 720px; margin: 0 auto; }

    .qvhr-progress-card {
      background: var(--surface, #151a3d);
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 16px;
    }
    .qvhr-prog-top {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 10px; gap: 10px;
    }
    .qvhr-prog-label {
      font-size: 12px; font-weight: 800;
      text-transform: uppercase; letter-spacing: .06em;
      color: var(--text-3, #6b74a0);
    }
    .qvhr-prog-value {
      font-size: 22px; font-weight: 900;
      background: linear-gradient(135deg,#22c55e,#10b981);
      -webkit-background-clip: text; background-clip: text;
      color: transparent; -webkit-text-fill-color: transparent;
    }
    .qvhr-prog-bar {
      height: 10px;
      background: var(--surface-2, #1c2250);
      border-radius: 20px;
      overflow: hidden;
      position: relative;
    }
    .qvhr-prog-fill {
      height: 100%;
      background: linear-gradient(135deg,#22c55e,#10b981);
      border-radius: 20px;
      transition: width .5s cubic-bezier(.34,1.4,.64,1);
      box-shadow: 0 0 12px rgba(34,197,94,.5);
    }
    .qvhr-prog-sub {
      font-size: 12px; color: var(--text-3, #6b74a0);
      margin-top: 8px; text-align: center;
    }
    .qvhr-reset {
      display: inline-block;
      font-size: 11.5px; color: var(--danger, #ef4444);
      cursor: pointer; margin-top: 6px;
      font-weight: 700; text-decoration: underline;
    }

    .qvhr-milestone {
      background: var(--surface, #151a3d);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 16px;
      margin-bottom: 12px;
      overflow: hidden;
      transition: border-color .2s;
    }
    .qvhr-milestone.done {
      border-color: rgba(16,185,129,.4);
      background: linear-gradient(135deg, rgba(16,185,129,.06), transparent);
    }
    .qvhr-m-header {
      display: flex; align-items: center; gap: 12px;
      padding: 15px;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .qvhr-m-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 21px; color: #fff;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,.25);
    }
    .qvhr-m-text { flex: 1; min-width: 0; }
    .qvhr-m-title {
      font-size: 14.5px; font-weight: 800;
      color: var(--text, #eef1ff);
      margin-bottom: 2px; line-height: 1.25;
    }
    .qvhr-m-sub {
      font-size: 11.5px; color: var(--text-3, #6b74a0);
      line-height: 1.35;
    }
    .qvhr-m-target {
      font-size: 10.5px; font-weight: 700;
      padding: 3px 8px; border-radius: 20px;
      background: var(--surface-2, #1c2250);
      color: var(--text-2, #a8b0d8);
      flex-shrink: 0;
    }
    .qvhr-m-chevron {
      font-size: 15px; color: var(--text-3, #6b74a0);
      transition: transform .25s;
      flex-shrink: 0;
    }
    .qvhr-milestone.open .qvhr-m-chevron { transform: rotate(90deg); }
    .qvhr-m-badge {
      font-size: 10px; font-weight: 800;
      padding: 2px 7px; border-radius: 20px;
      background: rgba(16,185,129,.18);
      color: #10b981;
      margin-left: 6px;
      flex-shrink: 0;
    }
    .qvhr-m-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height .35s ease;
    }
    .qvhr-milestone.open .qvhr-m-body { max-height: 2000px; }
    .qvhr-m-items {
      padding: 0 15px 15px;
      border-top: 1px solid var(--border, rgba(255,255,255,0.08));
    }
    .qvhr-item {
      display: flex; align-items: flex-start; gap: 11px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border, rgba(255,255,255,0.05));
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      font-size: 13.5px; line-height: 1.45;
      color: var(--text-2, #a8b0d8);
    }
    .qvhr-item:last-child { border-bottom: none; }
    .qvhr-check {
      width: 20px; height: 20px;
      border-radius: 6px;
      border: 2px solid var(--border-strong, rgba(255,255,255,0.24));
      background: transparent;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 1px;
      font-size: 12px; color: transparent;
      transition: all .15s;
    }
    .qvhr-item.checked .qvhr-check {
      background: linear-gradient(135deg,#22c55e,#10b981);
      border-color: transparent;
      color: #fff;
    }
    .qvhr-item.checked { color: var(--text-3, #6b74a0); text-decoration: line-through; text-decoration-color: rgba(107,116,160,.5); }

    .qvhr-actions-row {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
      margin-top: 16px; padding: 14px;
      background: var(--surface, #151a3d);
      border-radius: 14px;
      border: 1px solid var(--border-strong, rgba(255,255,255,0.14));
    }
    .qvhr-action {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 11px 6px; border-radius: 10px;
      background: var(--surface-2, #1c2250);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      font-size: 11.5px; font-weight: 700;
      color: var(--text, #eef1ff);
      cursor: pointer;
      transition: background .15s;
    }
    .qvhr-action:hover { background: var(--surface-hover, #232a5e); }
    .qvhr-action .qvhr-a-icon { font-size: 16px; }
  `;

  function injectCSS() {
    if (document.getElementById('qvhr-css')) return;
    const s = document.createElement('style');
    s.id = 'qvhr-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function render(container) {
    injectCSS();

    const progress = loadProgress();
    const totalItems = ROADMAP.reduce((sum, m) => sum + m.items.length, 0);
    const doneItems = Object.values(progress).filter(Boolean).length;
    const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

    container.innerHTML = `
      <div class="qvhr-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#a0522d,#c47b4a)">
          <div class="qvh-th-icon">🗺️</div>
          <div style="flex:1;min-width:0">
            <h3>YouTube Roadmap</h3>
            <p>Zero se full-time creator tak — step-by-step journey</p>
          </div>
        </div>

        <div class="qvhr-progress-card">
          <div class="qvhr-prog-top">
            <div class="qvhr-prog-label">Your Progress</div>
            <div class="qvhr-prog-value">${pct}%</div>
          </div>
          <div class="qvhr-prog-bar">
            <div class="qvhr-prog-fill" style="width:${pct}%"></div>
          </div>
          <div class="qvhr-prog-sub">
            ${doneItems} / ${totalItems} tasks completed
            ${doneItems > 0 ? '<br><span class="qvhr-reset" id="qvhrReset">Reset all progress</span>' : ''}
          </div>
        </div>

        <div id="qvhrList"></div>

        <div class="qvhr-actions-row">
          <button class="qvhr-action" data-act="copy"><span class="qvhr-a-icon">📋</span>Copy</button>
          <button class="qvhr-action" data-act="print"><span class="qvhr-a-icon">🖨️</span>Print</button>
          <button class="qvhr-action" data-act="pdf"><span class="qvhr-a-icon">📄</span>PDF</button>
        </div>
      </div>
    `;

    renderMilestones(progress);
    wireEvents(progress);
  }

  function renderMilestones(progress) {
    const list = document.getElementById('qvhrList');
    if (!list) return;

    list.innerHTML = ROADMAP.map((m, idx) => {
      const doneCount = m.items.filter((_, i) => progress[m.id + '_' + i]).length;
      const isDone = doneCount === m.items.length;
      return `
        <div class="qvhr-milestone ${isDone ? 'done' : ''}" data-mid="${m.id}">
          <div class="qvhr-m-header" data-toggle="${m.id}">
            <div class="qvhr-m-icon" style="background:${m.color}">${m.icon}</div>
            <div class="qvhr-m-text">
              <div class="qvhr-m-title">
                ${esc(m.title)}
                ${isDone ? '<span class="qvhr-m-badge">✓ DONE</span>' : ''}
              </div>
              <div class="qvhr-m-sub">${esc(m.subtitle)}</div>
            </div>
            <div class="qvhr-m-target">${esc(m.target)}</div>
            <div class="qvhr-m-chevron">▸</div>
          </div>
          <div class="qvhr-m-body">
            <div class="qvhr-m-items">
              ${m.items.map((item, i) => {
                const key = m.id + '_' + i;
                const checked = !!progress[key];
                return `
                  <div class="qvhr-item ${checked ? 'checked' : ''}" data-key="${key}">
                    <div class="qvhr-check">✓</div>
                    <div>${esc(item)}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function wireEvents(progress) {
    // Toggle milestone open/close
    document.querySelectorAll('[data-toggle]').forEach(h => {
      h.addEventListener('click', () => {
        const milestone = h.closest('.qvhr-milestone');
        if (milestone) milestone.classList.toggle('open');
      });
    });

    // Toggle item check
    document.querySelectorAll('.qvhr-item').forEach(it => {
      it.addEventListener('click', () => {
        const key = it.dataset.key;
        if (!key) return;
        progress[key] = !progress[key];
        if (!progress[key]) delete progress[key];
        saveProgress(progress);
        it.classList.toggle('checked', !!progress[key]);

        // Update milestone done state
        const milestone = it.closest('.qvhr-milestone');
        const mid = milestone?.dataset.mid;
        const m = ROADMAP.find(x => x.id === mid);
        if (m) {
          const doneCount = m.items.filter((_, i) => progress[m.id + '_' + i]).length;
          const isDone = doneCount === m.items.length;
          milestone.classList.toggle('done', isDone);
          // Update header badge
          const title = milestone.querySelector('.qvhr-m-title');
          if (title) {
            const existing = title.querySelector('.qvhr-m-badge');
            if (isDone && !existing) {
              title.insertAdjacentHTML('beforeend', ' <span class="qvhr-m-badge">✓ DONE</span>');
            } else if (!isDone && existing) {
              existing.remove();
            }
          }
        }

        // Update overall progress
        updateProgressBar(progress);
      });
    });

    // Reset
    const reset = document.getElementById('qvhrReset');
    if (reset) {
      reset.addEventListener('click', () => {
        if (!confirm('Reset all progress? Ye undo nahi hoga.')) return;
        localStorage.removeItem(STORAGE_KEY);
        render(document.getElementById('qvhBody'));
      });
    }

    // Actions
    document.querySelectorAll('.qvhr-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        if (act === 'copy') copyRoadmap(progress);
        else if (act === 'print') printRoadmap(progress);
        else if (act === 'pdf') pdfRoadmap(progress);
      });
    });
  }

  function updateProgressBar(progress) {
    const totalItems = ROADMAP.reduce((sum, m) => sum + m.items.length, 0);
    const doneItems = Object.values(progress).filter(Boolean).length;
    const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
    const fill = document.querySelector('.qvhr-prog-fill');
    const val = document.querySelector('.qvhr-prog-value');
    const sub = document.querySelector('.qvhr-prog-sub');
    if (fill) fill.style.width = pct + '%';
    if (val) val.textContent = pct + '%';
    if (sub) {
      sub.innerHTML = `${doneItems} / ${totalItems} tasks completed` +
        (doneItems > 0 ? '<br><span class="qvhr-reset" id="qvhrReset">Reset all progress</span>' : '');
      const reset = document.getElementById('qvhrReset');
      if (reset) {
        reset.addEventListener('click', () => {
          if (!confirm('Reset all progress? Ye undo nahi hoga.')) return;
          localStorage.removeItem(STORAGE_KEY);
          render(document.getElementById('qvhBody'));
        });
      }
    }
  }

  /* ============================================================
     BUILD TEXT REPORT (for copy)
     ============================================================ */
  function buildText(progress) {
    let text = '🗺️ YOUTUBE ROADMAP — Qunverio Creator Hub\n';
    text += '═'.repeat(50) + '\n\n';
    ROADMAP.forEach(m => {
      text += `${m.icon} ${m.title}  [${m.target}]\n`;
      text += `${m.subtitle}\n`;
      m.items.forEach((item, i) => {
        const key = m.id + '_' + i;
        const mark = progress[key] ? '[✓]' : '[ ]';
        text += `  ${mark} ${item}\n`;
      });
      text += '\n';
    });
    const total = ROADMAP.reduce((s, m) => s + m.items.length, 0);
    const done = Object.values(progress).filter(Boolean).length;
    text += `Progress: ${done}/${total} (${Math.round(done/total*100)}%)\n`;
    text += '─'.repeat(50) + '\n';
    text += 'Generated by Qunverio Creator Hub • qunverio.vercel.app\n';
    return text;
  }

  function copyRoadmap(progress) {
    const text = buildText(progress);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => QVH.toast('Copied! 📋', 'success'))
        .catch(() => QVH.toast('Copy failed', 'error'));
    }
  }

  /* ============================================================
     BUILD HTML REPORT (for print & PDF)
     ============================================================ */
  function themeColors() {
    const cs = getComputedStyle(document.body);
    function safe(v, fb) {
      let val = (cs.getPropertyValue(v) || '').trim();
      if (!val || val.startsWith('var(') || val.length > 60) return fb;
      return val;
    }
    return {
      bg: safe('--bg', '#0a0e27'),
      surface: safe('--surface', '#151a3d'),
      border: safe('--border-strong', 'rgba(255,255,255,0.14)'),
      text: safe('--text', '#eef1ff'),
      text2: safe('--text-2', '#a8b0d8'),
      text3: safe('--text-3', '#6b74a0')
    };
  }

  function buildReportHTML(progress) {
    const c = themeColors();
    const now = new Date().toLocaleString('en-IN');
    const total = ROADMAP.reduce((s, m) => s + m.items.length, 0);
    const done = Object.values(progress).filter(Boolean).length;
    const pct = Math.round((done / total) * 100);

    const milestonesHTML = ROADMAP.map(m => {
      const mDone = m.items.filter((_, i) => progress[m.id + '_' + i]).length;
      const mTotal = m.items.length;
      const isDone = mDone === mTotal;
      return `
        <div style="background:${c.surface};border:1px solid ${c.border};border-radius:14px;padding:16px 18px;margin-bottom:14px;${isDone ? 'border-color:rgba(16,185,129,.4);' : ''}">
          <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
            <div style="font-size:22px;line-height:1;">${m.icon}</div>
            <div style="flex:1;">
              <div style="font-size:15px;font-weight:800;color:${c.text};margin-bottom:2px;">
                ${m.title}
                ${isDone ? '<span style="background:rgba(16,185,129,.2);color:#10b981;font-size:10px;padding:2px 8px;border-radius:20px;margin-left:6px;">✓ DONE</span>' : ''}
              </div>
              <div style="font-size:12px;color:${c.text2};">${m.subtitle} • ${mDone}/${mTotal}</div>
            </div>
            <div style="font-size:10.5px;font-weight:700;color:${c.text2};background:rgba(255,255,255,.05);padding:3px 8px;border-radius:20px;">${m.target}</div>
          </div>
          <div style="border-top:1px solid ${c.border};padding-top:10px;">
            ${m.items.map((item, i) => {
              const checked = !!progress[m.id + '_' + i];
              return `
                <div style="display:flex;gap:9px;align-items:flex-start;padding:7px 0;font-size:13px;line-height:1.45;color:${checked ? c.text3 : c.text2};${checked ? 'text-decoration:line-through;' : ''}">
                  <span style="color:${checked ? '#10b981' : c.text3};font-weight:900;flex-shrink:0;">${checked ? '✓' : '○'}</span>
                  <span>${item}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Qunverio — YouTube Roadmap</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
    background: ${c.bg}; color: ${c.text};
    padding: 40px 32px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .wrap { max-width: 720px; margin: 0 auto; }
  .brand {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 18px; border-bottom: 3px solid #6366f1;
    margin-bottom: 24px;
  }
  .brand-logo { display: flex; align-items: center; gap: 10px; }
  .brand-icon {
    width: 40px; height: 40px; border-radius: 11px;
    background: linear-gradient(135deg,#6366f1,#ec4899);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .brand-name { font-size: 22px; font-weight: 900; color: #8b5cf6; }
  .brand-meta { font-size: 12px; color: ${c.text2}; text-align: right; }
  .doc-title {
    font-size: 12px; font-weight: 800;
    text-transform: uppercase; letter-spacing: .1em;
    color: ${c.text3}; margin-bottom: 8px;
  }
  .big { font-size: 34px; font-weight: 900; color: #10b981; margin-bottom: 6px; }
  .sub { font-size: 13px; color: ${c.text2}; margin-bottom: 24px; }
  .prog-bar {
    height: 10px; background: rgba(255,255,255,.06);
    border-radius: 20px; overflow: hidden; margin-bottom: 26px;
  }
  .prog-fill {
    height: 100%; background: linear-gradient(135deg,#22c55e,#10b981);
    border-radius: 20px;
  }
  .footer {
    margin-top: 30px; padding-top: 20px;
    border-top: 1px solid ${c.border};
    text-align: center; font-size: 11.5px; color: ${c.text3};
  }
  @media print {
    body { background: ${c.bg} !important; padding: 20px 16px; }
    .wrap { max-width: 100%; }
  }
  @page { margin: 12mm; size: A4; }
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
    <div class="doc-title">YouTube Roadmap</div>
    <div class="big">${pct}% Complete</div>
    <div class="sub">${done} / ${total} tasks completed • Zero se Full-Time Creator</div>
    <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
    ${milestonesHTML}
    <div class="footer">
      Generated by <strong style="color:${c.text2};">Qunverio Creator Hub</strong> • qunverio.vercel.app
    </div>
  </div>
</body></html>`;
  }

  function printRoadmap(progress) {
    const html = buildReportHTML(progress);
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

  async function pdfRoadmap(progress) {
    QVH.toast('Generating PDF...', '');
    const html = buildReportHTML(progress);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:820px;height:1200px;border:0;opacity:0;pointer-events:none;z-index:-1;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();

    setTimeout(async () => {
      try {
        if (!window.htmlToImage) { QVH.toast('PDF library missing', 'error'); document.body.removeChild(iframe); return; }
        const c = themeColors();
        const target = doc.body;
        const dataUrl = await window.htmlToImage.toPng(target, {
          quality: 1, pixelRatio: 2.5,
          backgroundColor: c.bg,
          width: target.scrollWidth, height: target.scrollHeight,
          cacheBust: true
        });
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const img = new Image();
        img.onload = () => {
          const ratio = img.width / img.height;
          // Multi-page support if tall
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = c.bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const pageHeightPx = canvas.width * (ph / pw);
          let y = 0;
          let pageIndex = 0;
          while (y < canvas.height) {
            const sliceH = Math.min(pageHeightPx, canvas.height - y);
            const slice = document.createElement('canvas');
            slice.width = canvas.width;
            slice.height = sliceH;
            const sctx = slice.getContext('2d');
            sctx.fillStyle = c.bg;
            sctx.fillRect(0, 0, slice.width, slice.height);
            sctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
            if (pageIndex > 0) pdf.addPage();
            const sliceRatio = slice.width / slice.height;
            let w = pw - 12;
            let h = w / sliceRatio;
            if (h > ph - 12) { h = ph - 12; w = h * sliceRatio; }
            pdf.addImage(slice.toDataURL('image/png'), 'PNG', (pw - w) / 2, (ph - h) / 2, w, h, undefined, 'FAST');
            y += sliceH;
            pageIndex++;
          }
          pdf.save('qunverio-youtube-roadmap.pdf');
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
     REGISTER
     ============================================================ */
  QVH.registerRenderer('roadmap', render);
  console.log('%c✅ Roadmap registered', 'color:#a0522d;font-weight:bold');
})();