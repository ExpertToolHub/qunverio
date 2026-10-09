/* ============================================================
   QUNVERIO — AI STUDY NOTES API PROXY
   File: api/study-notes-ai.js
   Full Final Working Code
   ============================================================ */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { topic, level = 'medium', subject = '', language = 'english' } = req.body || {};

    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const apiKey = process.env.GEMINI_KEY_2 || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Server API key not configured'
      });
    }

    // Level-specific instructions
    const levelInstructions = {
      short: 'Write concise notes in about 150-200 words. Only key points.',
      medium: 'Write detailed notes in about 350-450 words. Main concepts with examples.',
      detailed: 'Write comprehensive notes in about 700-900 words. All concepts, definitions, examples, diagrams.'
    };

    // Language-specific instructions
    const languageInstructions = {
      english: 'Respond ONLY in English.',
      hindi: 'Respond ONLY in Hindi (Devanagari script).',
      hinglish: 'Respond in Hinglish (Hindi words written in English letters, mixed with English).'
    };

    const subjectLine = subject ? `Subject: ${subject}` : '';

    const prompt = `You are an expert teacher creating handwritten-style study notes.

Topic: ${topic}
${subjectLine}
Detail Level: ${level}
${levelInstructions[level] || levelInstructions.medium}

${languageInstructions[language] || languageInstructions.english}

FORMAT RULES (STRICTLY FOLLOW):
1. Start with "# ${topic}" as chapter title.
2. Use "## " for section headings.
3. Use "- " for bullet points.
4. Use "Definition: ..." for key definitions.
5. Use "$$formula$$" for important formulas.
6. You can include diagrams using: [DIAGRAM: name]
   Allowed diagram names: solar_panel, circuit, graph, flowchart, microscope, atom, plant, human_heart, dna, water_cycle
7. Keep language simple and student-friendly.
8. Do NOT use markdown bold (**text**) or italic (*text*).
9. Output ONLY the notes content, no extra explanation.

Generate the study notes now:`;

    // CONFIRMED WORKING MODELS (aapki API key ke liye)
    const models = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest',
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
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
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