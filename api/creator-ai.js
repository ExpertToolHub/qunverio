/* ============================================================
   Qunverio — Creator Hub AI Proxy
   Path: /api/creator-ai
   Keeps API keys server-side. Frontend never sees secrets.
   Uses GEMINI_KEY_2 (primary), OPENROUTER_API_KEY (fallback).
   ============================================================ */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { prompt, systemPrompt, temperature, maxTokens, provider } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "prompt" field.' });
    }

    const GEMINI_KEY = process.env.GEMINI_KEY_2 || process.env.GEMINI_API_KEY;
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

    if (!GEMINI_KEY && !OPENROUTER_KEY) {
      return res.status(500).json({
        error: 'No AI provider configured. Please set GEMINI_KEY_2 or OPENROUTER_API_KEY in Vercel env vars.'
      });
    }

    // ─────────────────────────────────────────────
    // Primary: Gemini (Google AI Studio)
    // ─────────────────────────────────────────────
    if (GEMINI_KEY && provider !== 'openrouter') {
      const model = 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;

      const body = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: typeof temperature === 'number' ? temperature : 0.8,
          maxOutputTokens: typeof maxTokens === 'number' ? maxTokens : 2048
        }
      };

      if (systemPrompt) {
        body.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await r.json();

      if (!r.ok) {
        console.error('Gemini error:', data);
        // Fallback to OpenRouter if available
        if (OPENROUTER_KEY) {
          return await callOpenRouter(OPENROUTER_KEY, prompt, systemPrompt, temperature, maxTokens, res);
        }
        return res.status(r.status).json({
          error: 'Gemini API error',
          details: data?.error?.message || 'Unknown error'
        });
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) {
        return res.status(500).json({ error: 'Empty response from Gemini.' });
      }

      return res.status(200).json({
        success: true,
        provider: 'gemini',
        text
      });
    }

    // ─────────────────────────────────────────────
    // Fallback: OpenRouter
    // ─────────────────────────────────────────────
    if (OPENROUTER_KEY) {
      return await callOpenRouter(OPENROUTER_KEY, prompt, systemPrompt, temperature, maxTokens, res);
    }

    return res.status(500).json({ error: 'No AI provider available.' });

  } catch (err) {
    console.error('AI proxy exception:', err);
    return res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
}

// ─────────────────────────────────────────────
// OpenRouter helper
// ─────────────────────────────────────────────
async function callOpenRouter(key, prompt, systemPrompt, temperature, maxTokens, res) {
  const model = 'meta-llama/llama-3.1-8b-instruct:free';
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://qunverio.vercel.app',
      'X-Title': 'Qunverio Creator Hub'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: typeof temperature === 'number' ? temperature : 0.8,
      max_tokens: typeof maxTokens === 'number' ? maxTokens : 2048
    })
  });

  const data = await r.json();

  if (!r.ok) {
    console.error('OpenRouter error:', data);
    return res.status(r.status).json({
      error: 'OpenRouter API error',
      details: data?.error?.message || 'Unknown error'
    });
  }

  const text = data?.choices?.[0]?.message?.content || '';
  if (!text) {
    return res.status(500).json({ error: 'Empty response from OpenRouter.' });
  }

  return res.status(200).json({
    success: true,
    provider: 'openrouter',
    text
  });
}