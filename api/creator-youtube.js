/* ============================================================
   Qunverio — Creator Hub YouTube Data API Proxy
   Path: /api/creator-youtube
   Keeps YOUTUBE_API_KEY server-side.
   Supports: channel, video, search, playlist, channelVideos
   ============================================================ */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const KEY = process.env.YOUTUBE_API_KEY;
  if (!KEY) {
    return res.status(500).json({
      error: 'YOUTUBE_API_KEY not configured on server.'
    });
  }

  try {
    const action = req.query.action || req.body?.action;
    const params = req.method === 'POST' ? (req.body || {}) : req.query;

    if (!action) {
      return res.status(400).json({
        error: 'Missing "action". Supported: channel, video, search, playlist, channelVideos'
      });
    }

    const base = 'https://www.googleapis.com/youtube/v3';
    let url = '';

    // ─────────────────────────────────────────────
    // ACTION: channel — by handle, id, or username
    // ─────────────────────────────────────────────
    if (action === 'channel') {
      const { handle, id, username } = params;
      if (id) {
        url = `${base}/channels?part=snippet,statistics,contentDetails,brandingSettings&id=${encodeURIComponent(id)}&key=${KEY}`;
      } else if (handle) {
        const cleanHandle = String(handle).replace(/^@/, '');
        url = `${base}/channels?part=snippet,statistics,contentDetails,brandingSettings&forHandle=${encodeURIComponent(cleanHandle)}&key=${KEY}`;
      } else if (username) {
        url = `${base}/channels?part=snippet,statistics,contentDetails,brandingSettings&forUsername=${encodeURIComponent(username)}&key=${KEY}`;
      } else {
        return res.status(400).json({ error: 'Provide handle, id, or username.' });
      }
    }

    // ─────────────────────────────────────────────
    // ACTION: video — by video id
    // ─────────────────────────────────────────────
    else if (action === 'video') {
      const { id } = params;
      if (!id) return res.status(400).json({ error: 'Provide video id.' });
      url = `${base}/videos?part=snippet,statistics,contentDetails&id=${encodeURIComponent(id)}&key=${KEY}`;
    }

    // ─────────────────────────────────────────────
    // ACTION: search — search videos by query or channel
    // ─────────────────────────────────────────────
    else if (action === 'search') {
      const { q, channelId, maxResults, order, type } = params;
      if (!q && !channelId) return res.status(400).json({ error: 'Provide q or channelId.' });
      const query = new URLSearchParams({
        part: 'snippet',
        maxResults: String(Math.min(parseInt(maxResults) || 10, 50)),
        order: order || 'relevance',
        type: type || 'video',
        key: KEY
      });
      if (q) query.set('q', q);
      if (channelId) query.set('channelId', channelId);
      url = `${base}/search?${query.toString()}`;
    }

    // ─────────────────────────────────────────────
    // ACTION: playlist — get items in a playlist
    // ─────────────────────────────────────────────
    else if (action === 'playlist') {
      const { playlistId, maxResults } = params;
      if (!playlistId) return res.status(400).json({ error: 'Provide playlistId.' });
      url = `${base}/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(playlistId)}&maxResults=${Math.min(parseInt(maxResults) || 20, 50)}&key=${KEY}`;
    }

    // ─────────────────────────────────────────────
    // ACTION: channelVideos — get recent videos of a channel
    // (channelId required — frontend can get it from 'channel' action first)
    // ─────────────────────────────────────────────
    else if (action === 'channelVideos') {
      const { channelId, maxResults } = params;
      if (!channelId) return res.status(400).json({ error: 'Provide channelId.' });
      // Step 1: get uploads playlist
      const chanUrl = `${base}/channels?part=contentDetails&id=${encodeURIComponent(channelId)}&key=${KEY}`;
      const chanRes = await fetch(chanUrl);
      const chanData = await chanRes.json();
      if (!chanRes.ok) {
        return res.status(chanRes.status).json({
          error: 'YouTube API error (channel lookup)',
          details: chanData?.error?.message || 'Unknown error'
        });
      }
      const uploads = chanData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploads) {
        return res.status(404).json({ error: 'Uploads playlist not found for this channel.' });
      }
      // Step 2: get videos from uploads playlist
      url = `${base}/playlistItems?part=snippet,contentDetails&playlistId=${uploads}&maxResults=${Math.min(parseInt(maxResults) || 20, 50)}&key=${KEY}`;
    }

    else {
      return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      console.error('YouTube API error:', data);
      return res.status(r.status).json({
        error: 'YouTube API error',
        details: data?.error?.message || 'Unknown error'
      });
    }

    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error('YouTube proxy exception:', err);
    return res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
}