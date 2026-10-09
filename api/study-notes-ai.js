/* ============================================================
   QUNVERIO — AI STUDY NOTES API PROXY
   File: api/study-notes-ai.js
   Final Version (v9) — 60s timeout + 16K tokens
   ============================================================ */

export const config = {
  maxDuration: 60
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      topic,
      level = 'medium',
      subject = '',
      language = 'english',
      depth = 'standard',
      maxPages = '2'
    } = req.body || {};

    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const apiKey = process.env.GEMINI_KEY_2 || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'Server API key not configured' });
    }

    const wordCount = {
      short: '400-500 words',
      medium: '800-1200 words',
      detailed: '1500-2500 words'
    };

    const languageInstructions = {
      english: 'Respond ONLY in English.',
      hindi: 'Respond ONLY in Hindi (Devanagari script).',
      hinglish: 'Respond in Hinglish (Hindi words in English letters, mixed with English).'
    };

    const depthInstructions = {
      basic: 'Keep content SIMPLE. Only key points. No extra explanations.',
      standard: 'Include examples for each concept. Student-friendly explanations.',
      deep: 'Include full explanations, real-world examples, extra facts. Be comprehensive.'
    };

    const pagesInstruction = maxPages === '15'
      ? 'Write as much as needed (no limit).'
      : `Limit content to approximately ${maxPages} A4 page(s) (about ${parseInt(maxPages) * 400} words maximum).`;

    const subjectLine = subject ? `SUBJECT: ${subject}` : '';

    const prompt = `You are an expert teacher creating handwritten study notes for students.

USER'S TOPIC / REQUEST:
${topic}
${subjectLine}

DETAIL LEVEL: ${level} (${wordCount[level]})
DEPTH: ${depth} — ${depthInstructions[depth]}
PAGES LIMIT: ${pagesInstruction}
LANGUAGE: ${languageInstructions[language]}

=== CRITICAL RULES ===

1. NEVER repeat the user's request or write meta-commentary.
2. NEVER write reasoning, thinking, self-check, or verification.
3. Output ONLY final study notes.
4. START DIRECTLY with # chapter title.
5. Use ## for sections, ### for sub-sections.
6. Use "- " for bullets ONLY. Never use * or **.
7. For definitions, start with "Definition: "
8. For formulas, wrap in $$ with NOTHING else on the line.
9. For diagrams, write [DIAGRAM: name] on its OWN LINE.
   Allowed: solar_panel, circuit, graph, flowchart, microscope, atom, plant, human_heart, dna, water_cycle
10. NEVER use bold (**), italics (*), or markdown.
11. Cover ALL topics mentioned. Do not skip.
12. DO NOT include preamble.

Generate the notes now. Start directly with # heading:`;

    const models = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.0-flash'
    ];

    let lastError = '';

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 16000,
              topP: 0.95
            }
          })
        });

        const data = await response.json();

        if (!response.ok) {
          lastError = (data && data.error && data.error.message) || ('HTTP ' + response.status);
          continue;
        }

        const text = data &&
          data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts[0] &&
          data.candidates[0].content.parts[0].text;

        if (!text) {
          lastError = 'Empty response from model';
          continue;
        }

        return res.status(200).json({
          success: true,
          topic,
          level,
          subject,
          language,
          depth,
          maxPages,
          model,
          text: text.trim()
        });

      } catch (err) {
        lastError = err.message;
        continue;
      }
    }

    return res.status(500).json({
      success: false,
      error: 'AI generation failed: ' + lastError
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server error: ' + err.message
    });
  }
}