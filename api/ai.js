// api/ai.js — Vercel Serverless Function
// Gemini API proxy — API key server-side rehti hai

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

  const MODELS = [
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash'
  ];

  const body = {
    contents,
    generationConfig: generationConfig || {
      temperature: 0.7, topP: 0.95, maxOutputTokens: 2048
    }
  };
  if (systemInstruction) {
    body.system_instruction = { parts: [{ text: systemInstruction }] };
  }

  let lastError = null;

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 50000);

      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timer);

      const data = await upstream.json().catch(() => ({}));

      if (upstream.ok) {
        return res.status(200).json({
          model,
          candidates: data.candidates,
          promptFeedback: data.promptFeedback,
          usageMetadata: data.usageMetadata
        });
      }

      const errMsg = (data?.error?.message || '').toLowerCase();

      if (errMsg.includes('api key not valid') || errMsg.includes('api key expired')) {
        return res.status(401).json({ error: 'Invalid API key on server' });
      }
      if (upstream.status === 400 && !errMsg.includes('not found')) {
        return res.status(400).json({ error: data?.error?.message || 'Bad request' });
      }
      lastError = data?.error?.message || `HTTP ${upstream.status}`;
    } catch (e) {
      lastError = e.name === 'AbortError' ? 'Upstream timeout' : e.message;
    }
  }

  return res.status(503).json({ error: lastError || 'All models failed' });
}