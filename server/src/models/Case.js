import mongoose from 'mongoose';

const suspectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    description: { type: String, required: true },
    isCulprit: { type: Boolean, required: true, default: false }
  },
  { _id: false }
);

const clueSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    discovered: { type: Boolean, default: false }
  },
  { _id: false }
);

const hintSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    used: { type: Boolean, default: false }
  },
  { _id: false }
);

const solutionSchema = new mongoose.Schema(
  {
    culpritId: { type: String, required: true },
    explanation: { type: String, required: true }
  },
  { _id: false }
);

const playerProgressSchema = new mongoose.Schema(
  {
    discoveredCluesCount: { type: Number, default: 0 },
    hintsUsedCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 }
  },
  { _id: false }
);

const accusationSchema = new mongoose.Schema(
  {
    suspectId: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    submittedAt: { type: Date, default: null }
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    story: { type: String, required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard']
    },
    suspects: { type: [suspectSchema], required: true },
    clues: { type: [clueSchema], required: true },
    hints: { type: [hintSchema], required: true },
    solution: { type: solutionSchema, required: true },
    playerProgress: {
      type: playerProgressSchema,
      default: () => ({ discoveredCluesCount: 0, hintsUsedCount: 0, score: 0 })
    },
    accusation: {
      type: accusationSchema,
      default: () => ({ suspectId: null, isCorrect: null, submittedAt: null })
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Method to return public case data (hiding solution and suspect culprit flags)
caseSchema.methods.toPublicCase = function () {
  const caseObj = this.toObject();
  delete caseObj.solution;
  if (Array.isArray(caseObj.suspects)) {
    caseObj.suspects = caseObj.suspects.map((s) => {
      const { isCulprit, ...safeSuspect } = s;
      return safeSuspect;
    });
  }
  return caseObj;
};

// Method to return result data (available once completed)
caseSchema.methods.toResultCase = function () {
  const caseObj = this.toObject();
  const culprit = caseObj.suspects.find((s) => s.id === caseObj.solution.culpritId);
  return {
    id: caseObj._id,
    title: caseObj.title,
    difficulty: caseObj.difficulty,
    status: caseObj.status,
    story: caseObj.story,
    playerProgress: caseObj.playerProgress,
    accusation: caseObj.accusation,
    solution: {
      culpritId: caseObj.solution.culpritId,
      culpritName: culprit ? culprit.name : 'Unknown',
      culpritRole: culprit ? culprit.role : '',
      explanation: caseObj.solution.explanation
    },
    suspects: caseObj.suspects,
    clues: caseObj.clues,
    hints: caseObj.hints,
    createdAt: caseObj.createdAt,
    completedAt: caseObj.accusation?.submittedAt || caseObj.updatedAt
  };
};

export const Case = mongoose.model('Case', caseSchema);
