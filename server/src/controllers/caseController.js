import { Case } from '../models/Case.js';
import {
  createCaseInputSchema,
  accuseInputSchema,
  DIFFICULTY_SPECS
} from '../schemas/caseValidation.js';
import { generateMysteryCase } from '../services/geminiService.js';

/**
 * POST /api/cases
 * Accepts { premise, difficulty }
 * Generates mystery using Gemini, saves to MongoDB, returns public case
 */
export const createCase = async (req, res) => {
  try {
    const parseResult = createCaseInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const { premise, difficulty } = parseResult.data;
    const customApiKey = req.headers['x-gemini-api-key'] || req.body.customApiKey || null;

    // Generate mystery via Gemini or fallback
    const mysteryData = await generateMysteryCase(premise, difficulty, customApiKey);

    // Create Mongoose document
    const newCase = new Case({
      title: mysteryData.title,
      story: mysteryData.story,
      difficulty: mysteryData.difficulty,
      suspects: mysteryData.suspects,
      clues: mysteryData.clues,
      hints: mysteryData.hints,
      solution: mysteryData.solution,
      playerProgress: {
        discoveredCluesCount: 0,
        hintsUsedCount: 0,
        score: 0
      },
      accusation: {
        suspectId: null,
        isCorrect: null,
        submittedAt: null
      },
      status: 'active'
    });

    const savedCase = await newCase.save();

    // Return strictly public case representation (no solution, no culprit flags)
    return res.status(201).json({
      message: 'Mystery case initialized successfully',
      case: savedCase.toPublicCase()
    });
  } catch (error) {
    console.error('[CaseController] createCase error:', error);
    return res.status(500).json({
      error: 'Failed to create mystery case',
      message: error.message
    });
  }
};

/**
 * GET /api/cases/:id
 * Retrieves active mystery data for the frontend, strictly excluding the solution object.
 */
export const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const mysteryCase = await Case.findById(id);

    if (!mysteryCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // If case is completed, user can still get the public case or call result endpoint
    return res.json({
      case: mysteryCase.toPublicCase()
    });
  } catch (error) {
    console.error('[CaseController] getCaseById error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve case',
      message: error.message
    });
  }
};

/**
 * POST /api/cases/:id/clues/:clueId/discover
 * Marks a clue as discovered and updates score (+5 points per clue).
 */
export const discoverClue = async (req, res) => {
  try {
    const { id, clueId } = req.params;
    const mysteryCase = await Case.findById(id);

    if (!mysteryCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (mysteryCase.status === 'completed') {
      return res.status(400).json({ error: 'Cannot discover clues on a completed case' });
    }

    const clue = mysteryCase.clues.find((c) => c.id === clueId);
    if (!clue) {
      return res.status(404).json({ error: 'Clue not found in this case' });
    }

    let pointsAwarded = 0;
    if (!clue.discovered) {
      clue.discovered = true;
      pointsAwarded = 5;
      mysteryCase.playerProgress.discoveredCluesCount = mysteryCase.clues.filter((c) => c.discovered).length;
      mysteryCase.playerProgress.score = (mysteryCase.playerProgress.score || 0) + pointsAwarded;
      await mysteryCase.save();
    }

    return res.json({
      message: pointsAwarded > 0 ? 'Clue discovered! +5 points awarded.' : 'Clue already discovered.',
      pointsAwarded,
      clue,
      playerProgress: mysteryCase.playerProgress,
      case: mysteryCase.toPublicCase()
    });
  } catch (error) {
    console.error('[CaseController] discoverClue error:', error);
    return res.status(500).json({
      error: 'Failed to discover clue',
      message: error.message
    });
  }
};

/**
 * POST /api/cases/:id/hints
 * Marks the next available hint as used and updates score (-10 points per hint, min score 0).
 */
export const useHint = async (req, res) => {
  try {
    const { id } = req.params;
    const mysteryCase = await Case.findById(id);

    if (!mysteryCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (mysteryCase.status === 'completed') {
      return res.status(400).json({ error: 'Cannot request hints on a completed case' });
    }

    // Find first unused hint
    const unusedHint = mysteryCase.hints.find((h) => !h.used);
    if (!unusedHint) {
      return res.status(400).json({
        error: 'No more hints available',
        message: 'All available hints for this case have already been unlocked.'
      });
    }

    unusedHint.used = true;
    const penalty = 10;
    mysteryCase.playerProgress.hintsUsedCount = mysteryCase.hints.filter((h) => h.used).length;
    mysteryCase.playerProgress.score = Math.max(0, (mysteryCase.playerProgress.score || 0) - penalty);

    await mysteryCase.save();

    return res.json({
      message: 'Hint revealed! -10 points deducted from score.',
      revealedHint: unusedHint,
      playerProgress: mysteryCase.playerProgress,
      case: mysteryCase.toPublicCase()
    });
  } catch (error) {
    console.error('[CaseController] useHint error:', error);
    return res.status(500).json({
      error: 'Failed to use hint',
      message: error.message
    });
  }
};

/**
 * POST /api/cases/:id/accuse
 * Accepts { suspectId }. Compares against the backend solution,
 * calculates final score (Easy: 100, Medium: 150, Hard: 200 for correct accusation
 * + clue points - hint penalties), updates status to 'completed', and returns verdict, true culprit, explanation.
 */
export const makeAccusation = async (req, res) => {
  try {
    const { id } = req.params;
    const parseResult = accuseInputSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const { suspectId } = parseResult.data;
    const mysteryCase = await Case.findById(id);

    if (!mysteryCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (mysteryCase.status === 'completed') {
      return res.status(400).json({
        error: 'Case is already completed',
        result: mysteryCase.toResultCase()
      });
    }

    const suspect = mysteryCase.suspects.find((s) => s.id === suspectId);
    if (!suspect) {
      return res.status(400).json({ error: 'Specified suspect does not exist in this case' });
    }

    const isCorrect = mysteryCase.solution.culpritId === suspectId;

    // Calculate score
    const spec = DIFFICULTY_SPECS[mysteryCase.difficulty] || DIFFICULTY_SPECS.Easy;
    const basePoints = isCorrect ? spec.baseScore : 0;
    const cluePoints = (mysteryCase.playerProgress.discoveredCluesCount || 0) * 5;
    const hintPenalties = (mysteryCase.playerProgress.hintsUsedCount || 0) * 10;

    const rawFinalScore = basePoints + cluePoints - hintPenalties;
    const finalScore = Math.max(0, rawFinalScore);

    // Update case
    mysteryCase.playerProgress.score = finalScore;
    mysteryCase.accusation = {
      suspectId,
      isCorrect,
      submittedAt: new Date()
    };
    mysteryCase.status = 'completed';

    await mysteryCase.save();

    const culprit = mysteryCase.suspects.find((s) => s.id === mysteryCase.solution.culpritId);

    return res.json({
      message: isCorrect ? 'Bravo! You correctly identified the culprit!' : 'Alas! You accused the wrong person!',
      verdict: {
        isCorrect,
        accusedSuspect: suspect,
        trueCulprit: culprit,
        solutionExplanation: mysteryCase.solution.explanation,
        scoreBreakdown: {
          difficulty: mysteryCase.difficulty,
          basePoints,
          cluePoints,
          hintPenalties,
          finalScore
        }
      },
      result: mysteryCase.toResultCase()
    });
  } catch (error) {
    console.error('[CaseController] makeAccusation error:', error);
    return res.status(500).json({
      error: 'Failed to process accusation',
      message: error.message
    });
  }
};

/**
 * GET /api/cases/:id/result
 * Retrieves completed game results including explanation and score.
 */
export const getCaseResult = async (req, res) => {
  try {
    const { id } = req.params;
    const mysteryCase = await Case.findById(id);

    if (!mysteryCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (mysteryCase.status !== 'completed') {
      return res.status(400).json({
        error: 'Case is still active',
        message: 'The case result and solution are classified until a formal accusation is submitted.'
      });
    }

    return res.json({
      result: mysteryCase.toResultCase()
    });
  } catch (error) {
    console.error('[CaseController] getCaseResult error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve case result',
      message: error.message
    });
  }
};

/**
 * GET /api/cases
 * Returns recent active/completed cases for replay or resuming
 */
export const listRecentCases = async (req, res) => {
  try {
    const cases = await Case.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id title difficulty status playerProgress createdAt updatedAt accusation');

    return res.json({
      cases
    });
  } catch (error) {
    console.error('[CaseController] listRecentCases error:', error);
    return res.status(500).json({
      error: 'Failed to list cases',
      message: error.message
    });
  }
};
