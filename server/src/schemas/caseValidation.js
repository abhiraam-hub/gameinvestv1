import { z } from 'zod';

export const DIFFICULTY_SPECS = {
  Easy: { suspects: 3, clues: 5, hints: 2, baseScore: 100 },
  Medium: { suspects: 4, clues: 7, hints: 3, baseScore: 150 },
  Hard: { suspects: 5, clues: 9, hints: 3, baseScore: 200 }
};

export const createCaseInputSchema = z.object({
  premise: z.string().trim().min(3, 'Premise must be at least 3 characters long'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
    errorMap: () => ({ message: "Difficulty must be 'Easy', 'Medium', or 'Hard'" })
  })
});

export const suspectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  description: z.string().min(5),
  isCulprit: z.boolean()
});

export const clueSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(5),
  discovered: z.boolean().optional().default(false)
});

export const hintSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(5),
  used: z.boolean().optional().default(false)
});

export const solutionSchema = z.object({
  culpritId: z.string().min(1),
  explanation: z.string().min(15)
});

export const generatedMysterySchema = z.object({
  title: z.string().min(3),
  story: z.string().min(20),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  suspects: z.array(suspectSchema),
  clues: z.array(clueSchema),
  hints: z.array(hintSchema),
  solution: solutionSchema
}).refine(
  (data) => {
    // Ensure the culpritId in solution points to an existing suspect who has isCulprit === true
    const culprit = data.suspects.find((s) => s.id === data.solution.culpritId);
    return !!culprit && culprit.isCulprit === true;
  },
  {
    message: 'Solution culpritId must match a suspect with isCulprit set to true',
    path: ['solution', 'culpritId']
  }
).refine(
  (data) => {
    // Ensure exactly one culprit exists
    const culprits = data.suspects.filter((s) => s.isCulprit);
    return culprits.length === 1;
  },
  {
    message: 'There must be exactly one culprit among suspects',
    path: ['suspects']
  }
);

export const accuseInputSchema = z.object({
  suspectId: z.string().min(1, 'Suspect ID is required')
});
