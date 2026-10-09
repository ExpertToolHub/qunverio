/* ============================================================
   QUNVERIO — AI STUDY NOTES API PROXY
   File: api/study-notes-ai.js
   Final Version (v11) — Updated models + working
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
      topic = '',
      fullPrompt = '',
      previousContent = '',
      partNumber = 1,
      level = 'medium',
      depth = 'standard',
      language = 'english'
    } = req.body || {};

    if (!topic && !fullPrompt) {
      return res.status(400).json({ success: false, error: 'Topic or prompt is required' });
    }

    const apiKey = process.env.GEMINI_KEY_2 || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'Server API key not configured' });
    }

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

    const userRequest = fullPrompt.trim() || topic.trim();
    const firstLine = userRequest.split('\n')[0].trim();
    const chapterTitle = firstLine.slice(0, 100);

    let prompt;

    if (partNumber === 1) {
      prompt = `You are an expert teacher creating handwritten-style study notes.

USER'S REQUEST:
${userRequest}

DEPTH: ${depth} — ${depthInstructions[depth]}
LANGUAGE: ${languageInstructions[language]}

=== YOUR TASK ===

Generate PART 1 of study notes.

- Start DIRECTLY with # ${chapterTitle}
- Cover the FIRST major topics from the user's request
- Be detailed and thorough
- End at a natural section break (after completing a topic)
- Do NOT try to cover everything — this is PART 1

=== FORMATTING RULES (STRICTLY FOLLOW) ===

1. START with # heading (chapter title)
2. Use ## for section headings
3. Use ### for sub-sections
4. Use "- " for bullet points ONLY
5. For definitions: "Definition: ..."
6. For formulas: $$formula$$ on its OWN line
7. For diagrams: [DIAGRAM: name] on its OWN line
   Allowed: solar_panel, circuit, graph, flowchart, microscope, atom, plant, human_heart, dna, water_cycle
8. NEVER use bold (**text**) or italics (*text*)
9. NEVER write any thinking, reasoning, or meta-commentary
10. Start directly with # heading. No preamble.

Generate PART 1 now:`;
    } else {
      const prevTail = previousContent.slice(-3000);

      prompt = `You are continuing to create study notes. This is PART ${partNumber}.

USER'S ORIGINAL REQUEST:
${userRequest}

DEPTH: ${depth} — ${depthInstructions[depth]}
LANGUAGE: ${languageInstructions[language]}

=== PREVIOUSLY COVERED (DO NOT REPEAT ANY OF THIS) ===

${prevTail}

=== END PREVIOUS CONTENT ===

=== YOUR TASK ===

Generate PART ${partNumber} — CONTINUE from where the previous part ended.

CRITICAL RULES:
- DO NOT repeat anything from the previous content
- DO NOT repeat definitions already given
- DO NOT repeat formulas already shown
- Start with a ## heading for the NEXT UNCOVERED topic
- Continue naturally from the last section
- Cover the NEXT major topics from the user's request that haven't been covered yet
- End at a natural section break
- If ALL topics from the request are already covered, write ONLY: "ALL_TOPICS_COVERED"

=== FORMATTING RULES ===

1. Use ## for main sections, ### for sub-sections
2. Use "- " for bullet points
3. For definitions: "Definition: ..."
4. For formulas: $$formula$$ on its OWN line
5. For diagrams: [DIAGRAM: name] on its OWN line
6. NEVER use bold (**text**) or italics (*text*)
7. NEVER write any thinking, reasoning, or meta-commentary
8. Start directly with ## heading. No preamble.

Generate PART ${partNumber} now (continue from previous, no repeats):`;
    }

    const models = [
      'gemini-flash-latest',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
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
              maxOutputTokens: 6000,
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

        const trimmedText = text.trim();
        const allCovered = /^ALL_TOPICS_COVERED\s*$/i.test(trimmedText);

        return res.status(200).json({
          success: true,
          partNumber,
          model,
          text: allCovered ? '' : trimmedText,
          allCovered
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