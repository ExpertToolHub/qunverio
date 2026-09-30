// api/ai.js — Vercel Serverless Function
// Gemini API proxy — API key server-side rehti hai
// Auto-fallback across multiple models with smart retry

export const config = {
  api: {
    bodyParser: { sizeLimit: '25mb' }
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY missing' });
  }

  const { contents, systemInstruction, generationConfig } = req.body || {};
  if (!contents) return res.status(400).json({ error: 'Missing "contents"' });

  // ============================================================
  // MODEL LIST — Ordered by availability (low traffic first)
  // Har model retry hoga agar busy mila. First working wins.
  // ============================================================
  const MODELS = [
    // Tier 1: Proven stable, lower traffic
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.6-flash-lite',

    // Tier 2: Newer, may have more traffic
    'gemini-3.7-flash',
    'gemini-3.7-flash-lite',
    'gemini-3.8-flash',

    // Tier 3: Aliases & older models
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-2.0-flash',
    'gemini-2.5-flash'
  ];

  const body = {
    contents,
    generationConfig: generationConfig || {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048
    }
  };
  if (systemInstruction) {
    body.system_instruction = { parts: [{ text: systemInstruction }] };
  }

  let lastError = null;
  const tried = [];

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    try {
      const controller = new AbortController();
      // 8s timeout to stay within Vercel free tier (10s limit)
      const timer = setTimeout(() => controller.abort(), 8000);

      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timer);

      const data = await upstream.json().catch(() => ({}));

      // ✅ SUCCESS
      if (upstream.ok) {
        return res.status(200).json({
          model,
          tried,
          candidates: data.candidates,
          promptFeedback: data.promptFeedback,
          usageMetadata: data.usageMetadata
        });
      }

      const errMsg = (data?.error?.message || '').toLowerCase();
      tried.push({ model, status: upstream.status, err: errMsg.slice(0, 120) });

      // ❌ API KEY INVALID — stop immediately, no point retrying
      if (errMsg.includes('api key not valid') || errMsg.includes('api key expired')) {
        return res.status(401).json({ error: 'Invalid API key on server' });
      }

      // ❌ BAD REQUEST (not model-not-found) — stop immediately
      if (upstream.status === 400 && !errMsg.includes('not found') && !errMsg.includes('not supported')) {
        return res.status(400).json({ error: data?.error?.message || 'Bad request' });
      }

      // ⏳ MODEL BUSY / OVERLOADED / NOT FOUND — retry with next model
      const isBusy =
        upstream.status === 503 ||
        upstream.status === 429 ||
        upstream.status === 500 ||
        upstream.status === 404 ||
        errMsg.includes('high demand') ||
        errMsg.includes('overloaded') ||
        errMsg.includes('temporarily') ||
        errMsg.includes('quota') ||
        errMsg.includes('no longer available') ||
        errMsg.includes('not found') ||
        errMsg.includes('not supported');

      // Wait 1.2s before trying next model (only if more models remain)
      if (isBusy && i < MODELS.length - 1) {
        await new Promise(r => setTimeout(r, 1200));
      }

      lastError = data?.error?.message || `HTTP ${upstream.status}`;

    } catch (e) {
      // Network error or timeout
      const errText = e.name === 'AbortError' ? 'Request timed out (8s)' : e.message;
      tried.push({ model, status: 0, err: errText });
      lastError = errText;

      // Small wait before next model
      if (i < MODELS.length - 1) {
        await new Promise(r => setTimeout(r, 800));
      }
    }
  }

  // All models exhausted
  return res.status(503).json({
    error: lastError || 'All Gemini models are currently busy. Please try again in a minute.',
    tried
  });
}