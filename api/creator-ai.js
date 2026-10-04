/* ============================================================
   Qunverio — Creator Hub AI Proxy (v3.0 - BULLETPROOF)
   Path: /api/creator-ai
   Tries 8 Gemini models + 8 OpenRouter models. Never fails
   unless every provider + every model fails.
   ============================================================ */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { prompt, systemPrompt, temperature, maxTokens, provider } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing "prompt".' });
    }

    const GEMINI_KEY = process.env.GEMINI_KEY_2 || process.env.GEMINI_API_KEY;
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

    const temp = typeof temperature === 'number' ? temperature : 0.9;
    const maxTok = typeof maxTokens === 'number' ? maxTokens : 2048;

    const attempts = [];

    /* ═══════════════════════════════════════════════
       GEMINI — try multiple models in order
       ═══════════════════════════════════════════════ */
    if (GEMINI_KEY && provider !== 'openrouter') {
      const models = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash-lite',
        'gemini-flash-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-pro'
      ];

      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
          const body = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: temp, maxOutputTokens: maxTok }
          };
          if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] };

          const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await r.json();

          if (r.ok) {
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text) {
              return res.status(200).json({
                success: true,
                provider: 'gemini',
                model,
                attempted: attempts,
                text
              });
            }
            attempts.push(`${model}: empty response`);
          } else {
            const errMsg = data?.error?.message || `HTTP ${r.status}`;
            attempts.push(`${model}: ${errMsg}`);
            if (/API key not valid|API_KEY_INVALID/i.test(errMsg)) {
              break;
            }
          }
        } catch (e) {
          attempts.push(`${model}: ${e.message}`);
        }
      }
    }

    /* ═══════════════════════════════════════════════
       OPENROUTER — try multiple free + paid models
       ═══════════════════════════════════════════════ */
    if (OPENROUTER_KEY) {
      const orModels = [
        'meta-llama/llama-3.1-8b-instruct:free',
        'meta-llama/llama-3.2-3b-instruct:free',
        'google/gemma-2-9b-it:free',
        'mistralai/mistral-7b-instruct:free',
        'qwen/qwen-2.5-7b-instruct:free',
        'microsoft/phi-3-mini-128k-instruct:free',
        'meta-llama/llama-3.1-8b-instruct',
        'mistralai/mistral-7b-instruct'
      ];

      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      for (const model of orModels) {
        try {
          const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://qunverio.vercel.app',
              'X-Title': 'Qunverio Creator Hub'
            },
            body: JSON.stringify({
              model,
              messages,
              temperature: temp,
              max_tokens: maxTok
            })
          });
          const data = await r.json();

          if (r.ok) {
            const text = data?.choices?.[0]?.message?.content || '';
            if (text) {
              return res.status(200).json({
                success: true,
                provider: 'openrouter',
                model,
                attempted: attempts,
                text
              });
            }
            attempts.push(`OR:${model}: empty`);
          } else {
            const errMsg = data?.error?.message || `HTTP ${r.status}`;
            attempts.push(`OR:${model}: ${errMsg}`);
          }
        } catch (e) {
          attempts.push(`OR:${model}: ${e.message}`);
        }
      }
    }

    /* ═══════════════════════════════════════════════
       ALL FAILED
       ═══════════════════════════════════════════════ */
    return res.status(500).json({
      error: 'All AI models failed',
      hasGeminiKey: !!GEMINI_KEY,
      hasOpenRouterKey: !!OPENROUTER_KEY,
      attempted: attempts.slice(0, 12)
    });

  } catch (err) {
    console.error('AI proxy exception:', err);
    return res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
}