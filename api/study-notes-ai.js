/* ============================================================
   QUNVERIO — AI STUDY NOTES API PROXY
   File: api/study-notes-ai.js
   Final Version (v4) — No thinkingConfig (model compatible)
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
      short: '300-400 words',
      medium: '600-800 words',
      detailed: '1000-1200 words'
    };

    const languageInstructions = {
      english: 'Respond ONLY in English.',
      hindi: 'Respond ONLY in Hindi (Devanagari script).',
      hinglish: 'Respond in Hinglish (Hindi words in English letters, mixed with English).'
    };

    const depthInstructions = {
      basic: 'Keep content SIMPLE. Only key points. No extra explanations.',
      standard: 'Include examples for each concept. Student-friendly explanations.',
      deep: 'Include full explanations, real-world examples, extra facts, interesting details.'
    };

    const pagesInstruction = maxPages === '10'
      ? 'Write as much as needed (no limit).'
      : `Limit content to approximately ${maxPages} A4 page(s) (about ${parseInt(maxPages) * 350} words maximum).`;

    const subjectLine = subject ? `SUBJECT: ${subject}` : '';

    const prompt = `You are an expert teacher creating handwritten study notes for students.

TOPIC: ${topic}
${subjectLine}

DETAIL LEVEL: ${level} (${wordCount[level]})
DEPTH: ${depth} — ${depthInstructions[depth]}
PAGES LIMIT: ${pagesInstruction}
LANGUAGE: ${languageInstructions[language]}

=== CRITICAL RULES (NEVER BREAK) ===

1. NEVER write any reasoning, thinking, self-check, verification, or meta-commentary.
   Forbidden phrases (DO NOT use any of these):
   - "Wait, I need to..."
   - "Check diagram names again..."
   - "Word Count Check..."
   - "Self-Correction during drafting..."
   - "Final Structure Verification..."
   - "Ensure no... are used..."
   - "Hinglish Check:"
   - "I will just write..."
   - "Instead of..."
   - "One detail..."
   - "Let me..."
   - "The content looks..."
   - "I initially thought..."
   - "I must ensure..."

2. Output ONLY the final study notes. Nothing else.

3. NEVER write meta information like "Topic:", "Detail Level:", "Word Count:", "Format:", "Section:" headers.

4. START your response DIRECTLY with the chapter title using # symbol:
   # ${topic}

5. Use ## for section headings.
   Use ### for sub-headings.

6. Use "- " for bullet points ONLY. Never use * or ** or any other markdown.

7. For definitions, ALWAYS start the line with "Definition: "

8. For formulas, ALWAYS wrap in $$ on both sides with NOTHING else on the line.

9. For diagrams, write [DIAGRAM: name] on its OWN LINE with NOTHING else.
   Allowed names: solar_panel, circuit, graph, flowchart, microscope, atom, plant, human_heart, dna, water_cycle

10. NEVER use bold (**text**), italics (*text*), or any other markdown.

11. Write in natural teaching style. Explain concepts simply. Add examples where helpful.

12. DO NOT include any preamble. Start directly with # ${topic}.

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

## Importance
- Provides oxygen for all living beings.
- Forms base of food chain.

=== END EXAMPLE ===

Now generate notes on "${topic}". Start directly with # ${topic}. DO NOT include any thinking, reasoning, or self-check content:`;

    const models = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.0-flash',
      'gemma-4-26b-a4b-it',
      'gemma-4-31b-it'
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
              maxOutputTokens: 8000,
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
          topic: topic,
          level: level,
          subject: subject,
          language: language,
          depth: depth,
          maxPages: maxPages,
          model: model,
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