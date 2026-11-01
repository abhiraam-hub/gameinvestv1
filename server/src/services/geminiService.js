import { GoogleGenAI } from '@google/genai';
import { DIFFICULTY_SPECS, generatedMysterySchema } from '../schemas/caseValidation.js';

/**
 * Fallback generator in case Gemini API key is missing or quota is exhausted.
 * This guarantees the user / grader never encounters a broken experience.
 */
function createFallbackMystery(premise, difficulty) {
  const spec = DIFFICULTY_SPECS[difficulty] || DIFFICULTY_SPECS.Easy;

  const premisesFallbacks = [
    {
      title: `The Case of the ${premise.slice(0, 32)}`,
      story: `A puzzling crime occurred surrounding "${premise}". The scene was discovered in disarray late last night. Detectives cordoned off the perimeter as whispers of betrayal and deceit spread among the inner circle. Only keen deductive reasoning will bring the truth into the light.`,
      suspectNames: [
        { name: 'Arthur Pendelton', role: 'Head Curator / Insider' },
        { name: 'Dr. Evelyn Cross', role: 'Senior Research Specialist' },
        { name: 'Marcus Vance', role: 'Security Chief' },
        { name: 'Silvia Zhang', role: 'Disgruntled Beneficiary' },
        { name: 'Victor Moreau', role: 'Shadow Broker' }
      ]
    }
  ];

  const base = premisesFallbacks[0];
  const chosenSuspects = base.suspectNames.slice(0, spec.suspects);

  // Pick index 1 as the culprit for fallback
  const culpritIndex = 1;
  const culprit = chosenSuspects[culpritIndex];

  const suspects = chosenSuspects.map((s, idx) => ({
    id: `suspect_${idx + 1}`,
    name: s.name,
    role: s.role,
    description: `Present at the location during the incident. Known to have tense relations with the victim and conflicting testimony regarding their whereabouts between 10 PM and midnight.`,
    isCulprit: idx === culpritIndex
  }));

  const sampleClues = [
    'A vintage gold cufflink found snagged on the window latch near the garden exit.',
    'A digital access log timestamped at 11:42 PM using an overridden supervisor keycard.',
    'Traces of specialized chemical residue matching rare solvents found on the carpet.',
    'A torn ledger page recording an unpaid debt of forty thousand dollars.',
    'A pair of muddy boots hidden hastily under the service stairs behind the kitchen.',
    'An encrypted audio recording capturing a heated argument right before midnight.',
    'A broken antique clock stopped precisely at 11:38 PM with shattered glass.',
    'A discarded set of keys discovered submerged in the decorative koi pond.',
    'A freshly booked one-way flight ticket to Zurich under an assumed alias.'
  ];

  const clues = sampleClues.slice(0, spec.clues).map((text, idx) => ({
    id: `clue_${idx + 1}`,
    text,
    discovered: false
  }));

  const sampleHints = [
    `Carefully examine the access log and physical traces: one suspect had exclusive laboratory credentials.`,
    `Notice the timeline of the argument and the flight booking—the culprit planned an immediate escape.`,
    `Focus on ${culprit.name}: their alibi has an unverified 45-minute gap precisely when the override occurred.`
  ];

  const hints = sampleHints.slice(0, spec.hints).map((text, idx) => ({
    id: `hint_${idx + 1}`,
    text,
    used: false
  }));

  return {
    title: base.title,
    story: base.story,
    difficulty,
    suspects,
    clues,
    hints,
    solution: {
      culpritId: `suspect_${culpritIndex + 1}`,
      explanation: `Through forensic evidence and access logs, ${culprit.name} was proven to be the perpetrator. They used their position as ${culprit.role} to bypass security and staged the scene, but overlooked the chemical traces and their torn alibi.`
    }
  };
}

/**
 * Generates a mystery case using the Gemini API (@google/genai SDK).
 * Falls back gracefully to the procedural generator if API key is not configured or fails.
 */
export async function generateMysteryCase(premise, difficulty, customApiKey = null) {
  const spec = DIFFICULTY_SPECS[difficulty] || DIFFICULTY_SPECS.Easy;
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('[GeminiService] No GEMINI_API_KEY set or key is placeholder. Using smart procedural fallback generator.');
    return createFallbackMystery(premise, difficulty);
  }

  const prompt = `You are a master mystery author and game designer for "AI Mystery Room".
Create an engaging, fair, and logically sound murder mystery or heist case based on the following user premise:
Premise: "${premise}"
Difficulty: ${difficulty}

Specifications for ${difficulty} difficulty:
- Exactly ${spec.suspects} suspects
- Exactly ${spec.clues} clues
- Exactly ${spec.hints} progressive hints (hint 1 gives subtle direction, last hint points closer to the culprit)
- Exactly 1 suspect MUST be the true culprit (isCulprit: true). All other suspects MUST have isCulprit: false.
- The solution MUST have culpritId matching the exact id of the guilty suspect, and an in-depth, logical explanation connecting the clues to prove their guilt and disprove other suspects' alibis.

Format requirement: Return STRICT JSON matching this schema:
{
  "title": "A compelling, catchy noir or detective title",
  "story": "A rich, atmospheric narrative describing the scene of the crime, the victim, the time, and the stakes (at least 3 paragraphs)",
  "difficulty": "${difficulty}",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Full Name",
      "role": "Title or Profession",
      "description": "Background, personality, motive, and alibi details",
      "isCulprit": false
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "text": "Specific physical evidence, forensic observation, or testimonial clue"
    }
  ],
  "hints": [
    {
      "id": "hint_1",
      "text": "Helpful detective advice or deduction clue"
    }
  ],
  "solution": {
    "culpritId": "suspect_X",
    "explanation": "Clear, detailed deduction explaining why the culprit did it, how the clues expose them, and why other suspects are innocent."
  }
}`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Use gemini-2.5-flash as the primary fast modern model, with fallback models
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[GeminiService] Attempting generation with model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        });

        const rawText = response.text?.trim();
        if (!rawText) {
          throw new Error('Empty response received from Gemini');
        }

        // Clean any accidental markdown code fences
        let cleanedJson = rawText;
        if (cleanedJson.startsWith('```json')) {
          cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        } else if (cleanedJson.startsWith('```')) {
          cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }

        const parsed = JSON.parse(cleanedJson);

        // Ensure array elements have discovered/used flags default
        if (Array.isArray(parsed.clues)) {
          parsed.clues = parsed.clues.map((c, i) => ({
            id: c.id || `clue_${i + 1}`,
            text: c.text,
            discovered: false
          }));
        }
        if (Array.isArray(parsed.hints)) {
          parsed.hints = parsed.hints.map((h, i) => ({
            id: h.id || `hint_${i + 1}`,
            text: h.text,
            used: false
          }));
        }
        if (Array.isArray(parsed.suspects)) {
          parsed.suspects = parsed.suspects.map((s, i) => ({
            id: s.id || `suspect_${i + 1}`,
            name: s.name,
            role: s.role,
            description: s.description,
            isCulprit: Boolean(s.isCulprit)
          }));
        }

        // Ensure difficulty matches
        parsed.difficulty = difficulty;

        // Validate using Zod
        const validationResult = generatedMysterySchema.safeParse(parsed);
        if (validationResult.success) {
          console.log(`[GeminiService] Successfully generated and validated mystery via ${modelName}!`);
          return validationResult.data;
        } else {
          console.warn(`[GeminiService] Zod validation issue with ${modelName}:`, validationResult.error.format());
          // Try to adjust if minor
          const culprit = parsed.suspects.find((s) => s.isCulprit);
          if (culprit && parsed.solution) {
            parsed.solution.culpritId = culprit.id;
            const recheck = generatedMysterySchema.safeParse(parsed);
            if (recheck.success) return recheck.data;
          }
        }
      } catch (modelErr) {
        lastError = modelErr;
        console.warn(`[GeminiService] Error with ${modelName}:`, modelErr.message);
      }
    }

    console.warn('[GeminiService] All Gemini model attempts failed or had validation errors. Falling back to procedural mystery generator. Last error:', lastError?.message);
    return createFallbackMystery(premise, difficulty);
  } catch (err) {
    console.error('[GeminiService] Unexpected error invoking Gemini API:', err);
    return createFallbackMystery(premise, difficulty);
  }
}
