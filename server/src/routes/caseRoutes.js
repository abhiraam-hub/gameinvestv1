import express from 'express';
import {
  createCase,
  getCaseById,
  discoverClue,
  useHint,
  makeAccusation,
  getCaseResult,
  listRecentCases
} from '../controllers/caseController.js';

const router = express.Router();

// List recent cases (convenience for dashboard)
router.get('/', listRecentCases);

// Generate new mystery case
router.post('/', createCase);

// Get specific case (solution hidden)
router.get('/:id', getCaseById);

// Discover clue (+5 points)
router.post('/:id/clues/:clueId/discover', discoverClue);

// Use next hint (-10 points)
router.post('/:id/hints', useHint);

// Submit accusation
router.post('/:id/accuse', makeAccusation);

// Get final result and solution
router.get('/:id/result', getCaseResult);

export default router;
