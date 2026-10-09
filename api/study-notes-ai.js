/* ============================================================
   QUNVERIO — AI STUDY NOTES PROXY (v1.0)
   Path: api/study-notes-ai.js
   Server-side Gemini proxy for Study Notes Generator
   Keeps API key safe. Never expose to frontend.
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
    const { topic, level, subject, language } = req.body || {};

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Missing "topic" field.' });
    }

    const GEMINI_KEY = process.env.GEMINI_KEY_2 || process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      return res.status(500).json({ error: 'GEMINI_KEY_2 not configured.' });
    }

    const detailLevel = level || 'medium';
    const lang = language || 'English';
    const subj = subject || 'General';

    // Build prompt based on detail level
    const levelMap = {
      short: 'Concise bullet points, 3-5 key points per section. Total ~200-300 words.',
      medium: 'Balanced notes with headings, definitions, examples. Total ~500-700 words.',
      detailed: 'Comprehensive notes with detailed explanations, examples, formulas, MCQs, and revision points. Total ~1200-1500 words.'
    };
    const levelInstruction = levelMap[detailLevel] || levelMap.medium;

    const prompt = `You are an expert teacher and study material writer. Create structured study notes for a student.

TOPIC: "${topic}"
SUBJECT: ${subj}
LANGUAGE: ${lang}
DETAIL LEVEL: ${detailLevel.toUpperCase()}

INSTRUCTIONS:
1. Write detailed study notes in ${lang} language.
2. Use clear headings and subheadings.
3. Include the following sections (based on detail level):
   - Definition / Introduction
   - Key Concepts (with explanations)
   - Important Formulas (if applicable)
   - Examples / Applications
   - Comparison tables (if applicable)
   - Advantages & Disadvantages (if applicable)
   - Quick Revision Points
   ${detailLevel === 'detailed' ? '- MCQs with answers\n   - Short answer questions\n   - Summary' : ''}

4. For DIAGRAMS: If the topic needs a diagram, insert a placeholder using EXACTLY this format:
   [DIAGRAM: solar_panel]
   [DIAGRAM: circuit]
   [DIAGRAM: graph]
   [DIAGRAM: flowchart]
   [DIAGRAM: microscope]
   [DIAGRAM: atom]
   [DIAGRAM: plant]
   [DIAGRAM: human_heart]
   [DIAGRAM: dna]
   [DIAGRAM: water_cycle]
   Use only these pre-approved diagram names. If none fit, describe the diagram in text.

5. Length requirement: ${levelInstruction}

6. Return ONLY the notes content in clean markdown format. Use:
   - ## for main headings
   - ### for subheadings
   - - for bullet points
   - **bold** for important terms
   - > for definitions/quotes
   - No intro, no outro, no "here are your notes"

Return ONLY the markdown content.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
      }
    };

    // Try Gemini 2.5 Flash first, then fallback
    let text = '';
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    
    for (const model of models) {
      try {
        const mUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
        const r = await fetch(mUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await r.json();
        if (r.ok) {
          const t = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (t) { text = t; break; }
        }
        if (!r.ok) {
          const errMsg = data?.error?.message || '';
          if (/API key not valid|API_KEY_INVALID/i.test(errMsg)) break;
        }
      } catch (e) {
        console.error('Model', model, 'failed:', e.message);
      }
    }

    if (!text) {
      return res.status(500).json({ error: 'AI generation failed. Try again.' });
    }

    return res.status(200).json({
      success: true,
      topic,
      level: detailLevel,
      subject: subj,
      text
    });

  } catch (err) {
    console.error('Study notes AI exception:', err);
    return res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
}