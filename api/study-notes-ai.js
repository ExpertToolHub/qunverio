/* ============================================================
   QUNVERIO — AI STUDY NOTES API PROXY
   File: api/study-notes-ai.js
   Final Version (v8) — 32K tokens, mega content
   ============================================================ */

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
      deep: 'Include full explanations, real-world examples, extra facts, interesting details. Be comprehensive.'
    };

    const pagesInstruction = maxPages === '10'
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

=== CRITICAL RULES (NEVER BREAK) ===

1. NEVER repeat the user's request or write meta-commentary in the output.
2. NEVER write any reasoning, thinking, self-check, or verification.
3. Output ONLY the final study notes. Nothing else.
4. START your response DIRECTLY with the chapter title using # symbol.
5. Use ## for section headings. Use ### for sub-headings.
6. Use "- " for bullet points ONLY. Never use * or ** or any other markdown.
7. For definitions, ALWAYS start the line with "Definition: "
8. For formulas, ALWAYS wrap in $$ on both sides with NOTHING else on the line.
9. For diagrams, write [DIAGRAM: name] on its OWN LINE with NOTHING else.
   Allowed names: solar_panel, circuit, graph, flowchart, microscope, atom, plant, human_heart, dna, water_cycle
10. NEVER use bold (**text**), italics (*text*), or any other markdown.
11. Write in natural teaching style. Explain concepts simply. Add examples.
12. Cover ALL topics mentioned in the user's request. Do not skip any.
13. Keep content CONSISTENT throughout — same style, same depth, same tone.
14. Organize into proper sections. Each section complete and self-contained.
15. DO NOT include any preamble. Start directly with # heading.

=== OUTPUT EXAMPLE ===

# Photosynthesis

## What is Photosynthesis?
Definition: Photosynthesis is the process by which green plants make their own food using sunlight.
- It occurs in the chloroplasts of plant cells.
- Requires sunlight, water, and carbon dioxide.
- Produces glucose and oxygen.

[DIAGRAM: plant]

## Chemical Equation
$$6CO_2 + 6H_2O → C_6H_{12}O_6 + 6O_2$$

## Key Steps
- Step 1: Light absorption by chlorophyll.
- Step 2: Water splitting (photolysis).
- Step 3: Carbon dioxide fixation.

=== END EXAMPLE ===

Now generate complete detailed notes. Start directly with # heading:`;

    const models = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest',
      'gemma-4-26b-a4b-it'
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
              maxOutputTokens: 32000,
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