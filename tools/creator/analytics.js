/* ============================================================
   QUNVERIO — ANALYTICS (v1.0)
   Path: tools/creator/analytics.js
   Channel, Video, Competitor analyzer via YouTube Data API + AI
   ============================================================ */

(function () {
  'use strict';
  if (!window.QVH) { console.warn('QVH not loaded — analytics.js skipping'); return; }
  const QVH = window.QVH;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function copyText(text) {
    if (!navigator.clipboard) { QVH.toast('Copy not supported', 'error'); return; }
    navigator.clipboard.writeText(text).then(() => QVH.toast('Copied! 📋', 'success')).catch(() => QVH.toast('Copy failed', 'error'));
  }
  function fmtNum(n) {
    n = Number(n) || 0;
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return n.toLocaleString('en-IN');
  }
  function fmtDate(s) {
    if (!s) return '';
    try {
      const d = new Date(s);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return s; }
  }

  // Extract channel handle / ID / username from URL or raw string
  function parseChannelInput(input) {
    if (!input) return null;
    let s = input.trim();
    // Full URL
    if (s.includes('youtube.com') || s.includes('youtu.be')) {
      try {
        const u = new URL(s.startsWith('http') ? s : 'https://' + s);
        const pathname = u.pathname;
        // /channel/UCxxxx
        const m1 = pathname.match(/\/channel\/(UC[\w-]+)/);
        if (m1) return { type: 'id', value: m1[1] };
        // /@handle
        const m2 = pathname.match(/\/@([\w.-]+)/);
        if (m2) return { type: 'handle', value: m2[1] };
        // /c/customname or /user/username
        const m3 = pathname.match(/\/(c|user)\/([\w.-]+)/);
        if (m3) return { type: 'username', value: m3[2] };
      } catch (e) {}
    }
    // Raw UC... ID
    if (/^UC[\w-]{20,}$/.test(s)) return { type: 'id', value: s };
    // Raw handle
    s = s.replace(/^@/, '');
    return { type: 'handle', value: s };
  }

  function parseVideoInput(input) {
    if (!input) return null;
    let s = input.trim();
    // youtu.be/ID, youtube.com/watch?v=ID, /shorts/ID, /embed/ID
    const m1 = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
    if (m1) return m1[1];
    if (/^[\w-]{6,}$/.test(s)) return s;
    return null;
  }

  async function ytApi(action, params) {
    const qs = new URLSearchParams({ action, ...params }).toString();
    const r = await fetch('/api/creator-youtube?' + qs);
    const data = await r.json();
    if (!r.ok || !data.success) {
      throw new Error(data?.error || data?.details || 'YouTube API failed');
    }
    return data.data;
  }

  async function callAI(prompt, opts) {
    opts = opts || {};
    const body = { prompt, systemPrompt: opts.systemPrompt || '', temperature: opts.temperature != null ? opts.temperature : 0.7, maxTokens: opts.maxTokens || 2500 };
    const r = await fetch('/api/creator-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { let errMsg = 'AI request failed'; try { const j = await r.json(); errMsg = j.error || j.details || errMsg; } catch (e) {} throw new Error(errMsg); }
    const data = await r.json();
    if (!data.success || !data.text) throw new Error('Empty AI response');
    return data.text;
  }

  const CSS = `
    .qvha-wrap { max-width: 720px; margin: 0 auto; }
    .qvha-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 12px; scrollbar-width: none; }
    .qvha-tabs::-webkit-scrollbar { display: none; }
    .qvha-tab { flex: 0 0 auto; padding: 8px 14px; border-radius: 20px; background: var(--surface-2, #1c2250); border: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 12px; font-weight: 700; color: var(--text-2, #a8b0d8); cursor: pointer; white-space: nowrap; transition: all .18s; }
    .qvha-tab.active { background: linear-gradient(135deg,#06b6d4,#3b82f6); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(6,182,212,.35); }
    .qvha-panel { display: none; }
    .qvha-panel.active { display: block; animation: qvha-fade .22s ease; }
    @keyframes qvha-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
    .qvha-card { background: var(--surface, #151a3d); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 14px; padding: 15px; margin-bottom: 12px; }
    .qvha-card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; color: var(--text-3, #6b74a0); margin-bottom: 12px; }
    .qvha-field { margin-bottom: 12px; }
    .qvha-field label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-2, #a8b0d8); margin-bottom: 5px; }
    .qvha-field input, .qvha-field textarea, .qvha-field select { width: 100%; padding: 11px 13px; background: var(--surface-2, #1c2250); border: 1.5px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 11px; font-size: 14px; outline: none; color: var(--text, #eef1ff); font-family: inherit; box-sizing: border-box; transition: border-color .18s; }
    .qvha-field input:focus, .qvha-field textarea:focus, .qvha-field select:focus { border-color: #06b6d4; box-shadow: 0 0 0 3px rgba(6,182,212,.15); }
    .qvha-field .hint { font-size: 11px; color: var(--text-3, #6b74a0); margin-top: 4px; line-height: 1.4; }
    .qvha-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 13px 18px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: transform .15s; }
    .qvha-btn:active { transform: scale(.97); }
    .qvha-btn-primary { background: linear-gradient(135deg,#06b6d4,#3b82f6); color: #fff; width: 100%; box-shadow: 0 4px 14px rgba(6,182,212,.35); }
    .qvha-loading { text-align: center; padding: 32px 16px; color: var(--text-2, #a8b0d8); font-size: 13px; }
    .qvha-spinner { width: 34px; height: 34px; margin: 0 auto 12px; border: 3px solid var(--surface-2, #1c2250); border-top-color: #06b6d4; border-radius: 50%; animation: qvha-spin .8s linear infinite; }
    @keyframes qvha-spin { to { transform: rotate(360deg) } }
    .qvha-error { background: rgba(239,68,68,.1); border-left: 3px solid #ef4444; border-radius: 10px; padding: 12px 14px; margin-top: 12px; font-size: 13px; color: #fca5a5; line-height: 1.5; }
    .qvha-channel-head { display: flex; gap: 14px; align-items: center; padding: 14px; background: var(--surface-2, #1c2250); border-radius: 14px; margin-bottom: 14px; }
    .qvha-channel-head img { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .qvha-ch-info { flex: 1; min-width: 0; }
    .qvha-ch-name { font-size: 16px; font-weight: 800; color: var(--text, #eef1ff); line-height: 1.2; margin-bottom: 3px; }
    .qvha-ch-handle { font-size: 12px; color: var(--text-3, #6b74a0); }
    .qvha-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
    .qvha-stat { background: var(--surface-2, #1c2250); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 12px; padding: 12px 8px; text-align: center; }
    .qvha-stat-num { font-size: 16px; font-weight: 900; background: linear-gradient(135deg,#06b6d4,#3b82f6); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; line-height: 1.15; word-break: break-word; }
    .qvha-stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--text-3, #6b74a0); margin-top: 4px; }
    .qvha-video-list { display: flex; flex-direction: column; gap: 8px; }
    .qvha-video-item { display: flex; gap: 10px; background: var(--surface-2, #1c2250); border-radius: 10px; padding: 8px; }
    .qvha-video-thumb { width: 80px; height: 45px; border-radius: 6px; object-fit: cover; flex-shrink: 0; background: #000; }
    .qvha-video-info { flex: 1; min-width: 0; }
    .qvha-video-title { font-size: 12.5px; font-weight: 700; color: var(--text, #eef1ff); line-height: 1.35; margin-bottom: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .qvha-video-meta { font-size: 10.5px; color: var(--text-3, #6b74a0); }
    .qvha-analysis { background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); border-radius: 12px; padding: 14px; margin-top: 14px; }
    .qvha-analysis h4 { font-size: 12.5px; font-weight: 800; color: #06b6d4; text-transform: uppercase; letter-spacing: .06em; margin: 0 0 8px; }
    .qvha-analysis h4:not(:first-child) { margin-top: 14px; }
    .qvha-analysis p { font-size: 13px; line-height: 1.65; color: var(--text, #eef1ff); margin: 0 0 8px; white-space: pre-wrap; word-break: break-word; }
    .qvha-analysis ul { padding-left: 20px; margin: 0 0 8px; }
    .qvha-analysis li { font-size: 13px; line-height: 1.6; color: var(--text-2, #a8b0d8); margin-bottom: 4px; }
    .qvha-actions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 12px; }
    .qvha-action { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px; border-radius: 10px; background: var(--surface-2, #1c2250); border: 1px solid var(--border-strong, rgba(255,255,255,0.14)); font-size: 11px; font-weight: 700; color: var(--text, #eef1ff); cursor: pointer; }
    .qvha-action:hover { background: var(--surface-hover, #232a5e); }
    .qvha-action .ico { font-size: 15px; }
    .qvha-note { font-size: 11.5px; color: var(--text-3, #6b74a0); background: var(--surface-2, #1c2250); border-left: 3px solid #f59e0b; padding: 10px 12px; border-radius: 8px; margin-top: 12px; line-height: 1.55; }
  `;

  function injectCSS() {
    if (document.getElementById('qvha-css')) return;
    const s = document.createElement('style');
    s.id = 'qvha-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  function render(container) {
    injectCSS();
    container.innerHTML = `
      <div class="qvha-wrap">
        <div class="qvh-tool-header" style="--qvh-card-grad:linear-gradient(135deg,#06b6d4,#3b82f6)">
          <div class="qvh-th-icon">📊</div>
          <div style="flex:1;min-width:0"><h3>Analytics</h3><p>Channel, video & competitor analysis (real YouTube data)</p></div>
        </div>
        <div class="qvha-tabs" id="qvhaTabs">
          <button class="qvha-tab active" data-tab="channel">📺 Channel</button>
          <button class="qvha-tab" data-tab="video">🎥 Video</button>
          <button class="qvha-tab" data-tab="comp">🥊 Competitor</button>
        </div>
        <div id="qvhaPanels">
          ${panelChannel()}
          ${panelVideo()}
          ${panelComp()}
        </div>
        <div class="qvha-note">
          ⚠️ <strong>Note:</strong> Ye analysis <strong>public YouTube data</strong> + AI interpretation pe based hai. Private metrics (CTR, retention, impressions, watch time) public URL se available nahi hote — unke liye OAuth + YouTube Analytics API chahiye. Sab estimates hain, no guarantee.
        </div>
      </div>`;
    wireTabs(); wirePanels();
  }

  function panelChannel() {
    return `<div class="qvha-panel active" data-panel="channel"><div class="qvha-card">
      <div class="qvha-card-title">Channel Analyzer</div>
      <div class="qvha-field">
        <label>Channel URL / Handle / ID *</label>
        <input type="text" id="qvha-ch-input" placeholder="e.g. @MrBeast or youtube.com/@MrBeast" />
        <div class="hint">Full URL, @handle, ya channel ID (UC...) daal sakte ho</div>
      </div>
      <button class="qvha-btn qvha-btn-primary" id="qvha-ch-go">📺 Analyze Channel</button>
      <div id="qvha-ch-out"></div>
    </div></div>`;
  }
  function panelVideo() {
    return `<div class="qvha-panel" data-panel="video"><div class="qvha-card">
      <div class="qvha-card-title">Video Analyzer</div>
      <div class="qvha-field">
        <label>YouTube Video URL / ID *</label>
        <input type="text" id="qvha-vid-input" placeholder="e.g. https://youtu.be/dQw4w9WgXcQ" />
        <div class="hint">Full URL ya video ID dono chalega</div>
      </div>
      <button class="qvha-btn qvha-btn-primary" id="qvha-vid-go">🎥 Analyze Video</button>
      <div id="qvha-vid-out"></div>
    </div></div>`;
  }
  function panelComp() {
    return `<div class="qvha-panel" data-panel="comp"><div class="qvha-card">
      <div class="qvha-card-title">Competitor Analyzer</div>
      <div class="qvha-field">
        <label>Your Niche / Focus *</label>
        <input type="text" id="qvha-comp-niche" placeholder="e.g. personal finance for Indian audience" />
      </div>
      <div class="qvha-field">
        <label>Competitor Channel URL / Handle *</label>
        <input type="text" id="qvha-comp-input" placeholder="e.g. @FinanceWithSharan" />
      </div>
      <button class="qvha-btn qvha-btn-primary" id="qvha-comp-go">🥊 Analyze Competitor</button>
      <div id="qvha-comp-out"></div>
    </div></div>`;
  }

  function wireTabs() {
    document.querySelectorAll('.qvha-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.qvha-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.qvha-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
      });
    });
  }

  function wirePanels() {
    // Channel
    const chBtn = document.getElementById('qvha-ch-go');
    if (chBtn) chBtn.addEventListener('click', async () => {
      const input = (document.getElementById('qvha-ch-input').value || '').trim();
      const out = document.getElementById('qvha-ch-out');
      if (!input) { QVH.toast('Channel URL ya handle daalo', 'error'); return; }
      const parsed = parseChannelInput(input);
      if (!parsed) { QVH.toast('Invalid channel input', 'error'); return; }

      out.innerHTML = loadingHTML('Channel data fetch ho raha hai...');
      chBtn.disabled = true;
      try {
        // 1. Fetch channel
        const chResp = await ytApi('channel', { [parsed.type === 'id' ? 'id' : parsed.type]: parsed.value });
        const channel = chResp.items?.[0];
        if (!channel) throw new Error('Channel nahi mila. URL/handle check karo.');

        const uploadsPlaylist = channel.contentDetails?.relatedPlaylists?.uploads;

        // 2. Fetch recent videos
        let recentVideos = [];
        if (uploadsPlaylist) {
          try {
            const vidResp = await ytApi('playlist', { playlistId: uploadsPlaylist, maxResults: 15 });
            recentVideos = (vidResp.items || []).map(it => ({
              videoId: it.contentDetails?.videoId,
              title: it.snippet?.title,
              publishedAt: it.snippet?.publishedAt,
              thumbnail: it.snippet?.thumbnails?.medium?.url
            })).filter(v => v.videoId);
          } catch (e) { console.warn('Videos fetch failed:', e); }
        }

        // 3. Get stats of those videos
        let videoStats = [];
        if (recentVideos.length) {
          try {
            const ids = recentVideos.slice(0, 15).map(v => v.videoId).join(',');
            const vResp = await ytApi('video', { id: ids }); // Note: ytApi 'video' takes single id, we'll call individually below if needed
            // fallback: skip
          } catch (e) {}
        }

        // Show basic data
        out.innerHTML = renderChannelBasic(channel, recentVideos);

        // 4. AI analysis
        const aiOut = document.createElement('div');
        aiOut.innerHTML = loadingHTML('AI analysis soch raha hai...');
        out.appendChild(aiOut);

        const stats = channel.statistics || {};
        const prompt = `Analyze this YouTube channel and give structured feedback.

CHANNEL:
- Name: ${channel.snippet?.title || ''}
- Handle: ${channel.snippet?.customUrl || ''}
- Description: ${(channel.snippet?.description || '').slice(0, 400)}
- Country: ${channel.snippet?.country || 'unknown'}
- Subscribers: ${stats.subscriberCount || 'hidden'}
- Total Views: ${stats.viewCount || 'unknown'}
- Total Videos: ${stats.videoCount || 'unknown'}
- Created: ${channel.snippet?.publishedAt || 'unknown'}

RECENT VIDEOS (last ${recentVideos.length}):
${recentVideos.slice(0, 10).map((v, i) => `${i+1}. "${v.title}" — ${fmtDate(v.publishedAt)}`).join('\n') || 'No recent videos found'}

Provide structured analysis with these EXACT sections:

## Channel Health
(2-3 lines overall assessment)

## Content Strengths
(3-5 bullet points)

## Weaknesses / Opportunities
(3-5 bullet points)

## Content Pattern
(what they post, consistency, format mix)

## Upload Consistency
(how regular, gaps, frequency)

## Best Performing Topics (Guess)
(3-4 topics that seem to work based on titles)

## Recommended Next Videos
(5 specific video ideas they should make next)

## Growth Suggestions
(3-5 actionable steps)

Rules:
- Be honest but constructive
- No fake metrics — only infer from public data
- Do NOT invent CTR, retention, or impressions numbers
- Keep each section concise

Return ONLY the analysis in markdown format.`;

        const analysis = await callAI(prompt, { systemPrompt: 'You are a YouTube channel growth analyst. Return only the structured analysis.', temperature: 0.7, maxTokens: 2500 });
        aiOut.innerHTML = renderAnalysis(analysis, 'qvha-ch-analysis');

      } catch (e) {
        out.innerHTML = `<div class="qvha-error">❌ ${esc(e.message || 'Failed')}</div>`;
      } finally { chBtn.disabled = false; }
    });

    // Video
    const vidBtn = document.getElementById('qvha-vid-go');
    if (vidBtn) vidBtn.addEventListener('click', async () => {
      const input = (document.getElementById('qvha-vid-input').value || '').trim();
      const out = document.getElementById('qvha-vid-out');
      if (!input) { QVH.toast('Video URL daalo', 'error'); return; }
      const videoId = parseVideoInput(input);
      if (!videoId) { QVH.toast('Invalid video URL/ID', 'error'); return; }

      out.innerHTML = loadingHTML('Video data fetch ho raha hai...');
      vidBtn.disabled = true;
      try {
        const vResp = await ytApi('video', { id: videoId });
        const video = vResp.items?.[0];
        if (!video) throw new Error('Video nahi mila. URL check karo.');

        out.innerHTML = renderVideoBasic(video);

        const aiOut = document.createElement('div');
        aiOut.innerHTML = loadingHTML('AI analysis soch raha hai...');
        out.appendChild(aiOut);

        const s = video.statistics || {};
        const prompt = `Analyze this YouTube video and give SEO + content feedback.

VIDEO:
- Title: ${video.snippet?.title || ''}
- Channel: ${video.snippet?.channelTitle || ''}
- Description: ${(video.snippet?.description || '').slice(0, 600)}
- Tags: ${(video.snippet?.tags || []).slice(0, 20).join(', ') || 'none'}
- Published: ${video.snippet?.publishedAt || ''}
- Duration: ${video.contentDetails?.duration || ''}
- Views: ${s.viewCount || 'unknown'}
- Likes: ${s.likeCount || 'unknown'}
- Comments: ${s.commentCount || 'unknown'}

Provide structured analysis:

## Title Analysis
(2-3 lines about SEO, CTR potential, clarity)

## SEO Analysis
(keywords, description quality, tags usage — 3-4 bullets)

## Engagement Analysis
(views/likes/comments ratio interpretation — 2-3 lines)

## Content Suggestions
(3-5 bullets to improve future videos)

## Thumbnail Suggestions
(3-4 bullets, infer from title)

## Improvement Suggestions
(3-5 actionable bullets)

Rules:
- Do NOT invent CTR, retention, impressions, watch time
- Base only on public data
- Be honest but constructive

Return ONLY the analysis in markdown.`;

        const analysis = await callAI(prompt, { systemPrompt: 'You are a YouTube video SEO analyst. Return only structured analysis.', temperature: 0.7, maxTokens: 2000 });
        aiOut.innerHTML = renderAnalysis(analysis, 'qvha-vid-analysis');

      } catch (e) {
        out.innerHTML = `<div class="qvha-error">❌ ${esc(e.message || 'Failed')}</div>`;
      } finally { vidBtn.disabled = false; }
    });

    // Competitor
    const compBtn = document.getElementById('qvha-comp-go');
    if (compBtn) compBtn.addEventListener('click', async () => {
      const niche = (document.getElementById('qvha-comp-niche').value || '').trim();
      const input = (document.getElementById('qvha-comp-input').value || '').trim();
      const out = document.getElementById('qvha-comp-out');
      if (!niche) { QVH.toast('Apna niche daalo', 'error'); return; }
      if (!input) { QVH.toast('Competitor channel daalo', 'error'); return; }
      const parsed = parseChannelInput(input);
      if (!parsed) { QVH.toast('Invalid competitor input', 'error'); return; }

      out.innerHTML = loadingHTML('Competitor data fetch ho raha hai...');
      compBtn.disabled = true;
      try {
        const chResp = await ytApi('channel', { [parsed.type === 'id' ? 'id' : parsed.type]: parsed.value });
        const channel = chResp.items?.[0];
        if (!channel) throw new Error('Competitor channel nahi mila.');

        const uploadsPlaylist = channel.contentDetails?.relatedPlaylists?.uploads;
        let recentVideos = [];
        if (uploadsPlaylist) {
          try {
            const vidResp = await ytApi('playlist', { playlistId: uploadsPlaylist, maxResults: 15 });
            recentVideos = (vidResp.items || []).map(it => ({
              videoId: it.contentDetails?.videoId,
              title: it.snippet?.title,
              publishedAt: it.snippet?.publishedAt,
              thumbnail: it.snippet?.thumbnails?.medium?.url
            })).filter(v => v.videoId);
          } catch (e) {}
        }

        out.innerHTML = renderChannelBasic(channel, recentVideos);

        const aiOut = document.createElement('div');
        aiOut.innerHTML = loadingHTML('AI comparison soch raha hai...');
        out.appendChild(aiOut);

        const stats = channel.statistics || {};
        const prompt = `Analyze this competitor YouTube channel and help a creator learn from it.

MY NICHE: ${niche}

COMPETITOR CHANNEL:
- Name: ${channel.snippet?.title || ''}
- Description: ${(channel.snippet?.description || '').slice(0, 400)}
- Subscribers: ${stats.subscriberCount || 'hidden'}
- Total Views: ${stats.viewCount || 'unknown'}
- Total Videos: ${stats.videoCount || 'unknown'}
- Created: ${channel.snippet?.publishedAt || ''}

RECENT VIDEOS:
${recentVideos.slice(0, 12).map((v, i) => `${i+1}. "${v.title}" — ${fmtDate(v.publishedAt)}`).join('\n') || 'No recent videos'}

Provide:

## What They're Doing Well
(3-5 bullets, based on public data)

## Title Patterns Observed
(3-4 bullets — what title styles they use)

## Content Patterns
(3-4 bullets — formats, topics, series)

## Upload Frequency
(analysis of how often they post, based on dates)

## What I Can Learn
(3-5 actionable bullets for my channel)

## Content Gaps / Opportunities
(3-5 topics they're missing OR angles to differentiate)

## 5 Video Ideas Inspired by Their Success
(but unique angles — 5 specific video ideas)

Rules:
- No fake metrics
- Do NOT assume their CTR, retention, watch time
- Be specific and honest
- No plagiarism advice — focus on learning

Return ONLY the analysis in markdown.`;

        const analysis = await callAI(prompt, { systemPrompt: 'You are a YouTube competitor research analyst. Return only structured markdown.', temperature: 0.75, maxTokens: 2500 });
        aiOut.innerHTML = renderAnalysis(analysis, 'qvha-comp-analysis');

      } catch (e) {
        out.innerHTML = `<div class="qvha-error">❌ ${esc(e.message || 'Failed')}</div>`;
      } finally { compBtn.disabled = false; }
    });
  }

  function loadingHTML(msg) {
    return `<div class="qvha-loading"><div class="qvha-spinner"></div>${esc(msg || 'Loading...')}</div>`;
  }

  function renderChannelBasic(channel, videos) {
    const s = channel.statistics || {};
    const sn = channel.snippet || {};
    const thumb = sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || '';
    const subText = s.hiddenSubscriberCount ? 'Hidden' : fmtNum(s.subscriberCount);
    return `
      <div class="qvha-channel-head">
        ${thumb ? `<img src="${esc(thumb)}" alt="avatar" />` : ''}
        <div class="qvha-ch-info">
          <div class="qvha-ch-name">${esc(sn.title || 'Unknown')}</div>
          <div class="qvha-ch-handle">${esc(sn.customUrl || '')}</div>
        </div>
      </div>
      <div class="qvha-stats-grid">
        <div class="qvha-stat"><div class="qvha-stat-num">${esc(subText)}</div><div class="qvha-stat-label">Subscribers</div></div>
        <div class="qvha-stat"><div class="qvha-stat-num">${esc(fmtNum(s.viewCount))}</div><div class="qvha-stat-label">Total Views</div></div>
        <div class="qvha-stat"><div class="qvha-stat-num">${esc(fmtNum(s.videoCount))}</div><div class="qvha-stat-label">Videos</div></div>
      </div>
      ${videos.length ? `
        <div class="qvha-card-title">Recent Videos</div>
        <div class="qvha-video-list">
          ${videos.slice(0, 10).map(v => `
            <div class="qvha-video-item">
              ${v.thumbnail ? `<img class="qvha-video-thumb" src="${esc(v.thumbnail)}" alt="" />` : ''}
              <div class="qvha-video-info">
                <div class="qvha-video-title">${esc(v.title || '')}</div>
                <div class="qvha-video-meta">${esc(fmtDate(v.publishedAt))}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  function renderVideoBasic(video) {
    const sn = video.snippet || {};
    const s = video.statistics || {};
    const thumb = sn.thumbnails?.maxres?.url || sn.thumbnails?.high?.url || sn.thumbnails?.medium?.url || '';
    return `
      ${thumb ? `<div style="margin-bottom:12px;border-radius:12px;overflow:hidden"><img src="${esc(thumb)}" style="width:100%;display:block" alt="" /></div>` : ''}
      <div style="font-size:15px;font-weight:800;color:var(--text);line-height:1.35;margin-bottom:6px">${esc(sn.title || 'Unknown')}</div>
      <div style="font-size:12px;color:var(--text-3);margin-bottom:12px">${esc(sn.channelTitle || '')} • ${esc(fmtDate(sn.publishedAt))}</div>
      <div class="qvha-stats-grid">
        <div class="qvha-stat"><div class="qvha-stat-num">${esc(fmtNum(s.viewCount))}</div><div class="qvha-stat-label">Views</div></div>
        <div class="qvha-stat"><div class="qvha-stat-num">${esc(fmtNum(s.likeCount))}</div><div class="qvha-stat-label">Likes</div></div>
        <div class="qvha-stat"><div class="qvha-stat-num">${esc(fmtNum(s.commentCount))}</div><div class="qvha-stat-label">Comments</div></div>
      </div>
    `;
  }

  function renderAnalysis(md, id) {
    const html = simpleMarkdown(md);
    return `
      <div class="qvha-analysis" id="${id}">${html}</div>
      <div class="qvha-actions-row">
        <button class="qvha-action" data-act="copy-analysis" data-target="${id}"><span class="ico">📋</span>Copy</button>
        <button class="qvha-action" data-act="save-analysis" data-target="${id}"><span class="ico">💾</span>Save</button>
        <button class="qvha-action" data-act="print-analysis" data-target="${id}" data-title="YouTube Analytics Report"><span class="ico">🖨️</span>Print</button>
      </div>
    `;
  }

  function simpleMarkdown(md) {
    if (!md) return '';
    let html = esc(md);
    // Headers
    html = html.replace(/^## (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h4 style="font-size:12px">$1</h4>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Bullets
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    // Numbered
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, (m) => {
      return '<ul>' + m.split('</li>').filter(Boolean).map(x => x + '</li>').join('') + '</ul>';
    });
    // Paragraphs
    html = html.split('\n').map(line => {
      const t = line.trim();
      if (!t) return '';
      if (t.startsWith('<h4') || t.startsWith('<ul') || t.startsWith('<li') || t.startsWith('</ul>')) return t;
      return '<p>' + t + '</p>';
    }).join('');
    return html;
  }

  /* Delegated events */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (!btn.closest('.qvha-wrap')) return;
    const act = btn.dataset.act;
    const target = btn.dataset.target;
    if (!target) return;
    const el = document.getElementById(target);
    if (!el) return;
    const text = (el.innerText || el.textContent || '').trim();

    if (act === 'copy-analysis') { copyText(text); return; }
    if (act === 'save-analysis') { saveAnalysis(text); return; }
    if (act === 'print-analysis') { printAnalysis(text, btn.dataset.title || 'Analytics Report'); return; }
  });

  function saveAnalysis(text) {
    const KEY = 'qvh_workspace_v1';
    let data = { ideas: [], titles: [], scripts: [] };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        data = { ideas: Array.isArray(p.ideas) ? p.ideas : [], titles: Array.isArray(p.titles) ? p.titles : [], scripts: Array.isArray(p.scripts) ? p.scripts : [] };
      }
    } catch (err) {}
    const title = 'Analytics — ' + new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    data.scripts.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), title, notes: text, ts: Date.now() });
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      QVH.toast('Saved to Script Vault ✅', 'success');
    } catch (err) { QVH.toast('Save failed', 'error'); }
  }

  function themeColors() {
    const cs = getComputedStyle(document.body);
    function safe(v, fb) { let val = (cs.getPropertyValue(v) || '').trim(); if (!val || val.startsWith('var(') || val.length > 60) return fb; return val; }
    return { bg: safe('--bg', '#0a0e27'), surface: safe('--surface', '#151a3d'), border: safe('--border-strong', 'rgba(255,255,255,0.14)'), text: safe('--text', '#eef1ff'), text2: safe('--text-2', '#a8b0d8'), text3: safe('--text-3', '#6b74a0') };
  }

  function buildReportHTML(content, heading) {
    const c = themeColors();
    const now = new Date().toLocaleString('en-IN');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Qunverio — ${heading}</title><style>
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;background:${c.bg};color:${c.text};padding:40px 32px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .wrap{max-width:720px;margin:0 auto}.brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:3px solid #06b6d4;margin-bottom:24px}.brand-logo{display:flex;align-items:center;gap:10px}.brand-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#06b6d4,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:20px}.brand-name{font-size:22px;font-weight:900;color:#06b6d4}.brand-meta{font-size:12px;color:${c.text2};text-align:right}
      .doc-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:${c.text3};margin-bottom:8px}.content{background:${c.surface};border:1px solid ${c.border};border-radius:14px;padding:18px 20px;font-size:14px;line-height:1.7;color:${c.text};white-space:pre-wrap;word-break:break-word}
      .footer{margin-top:26px;padding-top:18px;border-top:1px solid ${c.border};text-align:center;font-size:11.5px;color:${c.text3}}
      @media print{body{background:${c.bg} !important;padding:20px 16px}.wrap{max-width:100%}}@page{margin:14mm;size:A4}
    </style></head><body><div class="wrap">
      <div class="brand"><div class="brand-logo"><div class="brand-icon">⚡</div><div class="brand-name">Qunverio</div></div><div class="brand-meta">Analytics<br>${now}</div></div>
      <div class="doc-title">${heading}</div>
      <div class="content">${esc(content)}</div>
      <div class="footer">Generated by <strong style="color:${c.text2};">Qunverio Creator Hub</strong> • qunverio.vercel.app</div>
    </div></body></html>`;
  }

  function printAnalysis(content, heading) {
    const html = buildReportHTML(content, heading);
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => { try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) {} setTimeout(() => { if (iframe.parentNode) document.body.removeChild(iframe); }, 1500); }, 700);
  }

  QVH.registerRenderer('analytics', render);
  console.log('%c✅ Analytics registered', 'color:#06b6d4;font-weight:bold');
})();