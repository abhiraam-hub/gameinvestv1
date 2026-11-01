# 🕵️ AI Mystery Room — Full-Stack Interactive Detective Experience

An immersive, generative murder mystery and crime scene deduction web application built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB / Mongoose**, and **Google GenAI (Gemini 2.5 Flash)**.

---

## 🌟 Key Features

1. **Procedural Mystery Generation (Gemini 2.5 Flash / Smart Generator Fallback)**:
   - Dynamic case generation based on custom user premises or curated classic presets.
   - Strict adherence to difficulty specifications:
     - **Easy**: 3 suspects, 5 clues, 2 hints (+100 base score for correct accusation).
     - **Medium**: 4 suspects, 7 clues, 3 hints (+150 base score for correct accusation).
     - **Hard**: 5 suspects, 9 clues, 3 hints (+200 base score for correct accusation).
   - Validated server-side via **Zod** schema enforcement.
   - Resilient design: runs seamlessly with `GEMINI_API_KEY` or uses procedural generative fallback if key is missing or quota is exhausted.

2. **Strict Cryptographic Security & Solution Secrecy**:
   - The culprit identity (`solution.culpritId`), solution explanation, and suspect `isCulprit` flags are **never leaked** to the client during active investigations.
   - Only unsealed and returned upon formal accusation submission or final verdict lookup.

3. **Interactive Investigation Room & Crime Scene**:
   - **Score & Progress HUD**: Live tracking of points, clues discovered ratio, hints used, and dynamic Detective Rank.
   - **Suspect Lineup & Interrogation**: Detailed suspect dossiers, alibi inspection, and suspicion pinning.
   - **Evidence Board (Pinboard)**: Interactive physical forensic traces with "+5 pts" reward and discovery animations.
   - **Police Dispatch Hints**: Progressive consultation notes with "-10 pts" deduction penalty warning and confirmation modal.
   - **Procedural Sound Engine**: Zero-asset Web Audio API synthesizers for evidence chimes, warning tones, courtroom gavel strikes, and victory fanfare.

4. **Courtroom Accusation & Case Resolution**:
   - High-stakes final warrant modal with suspect selection.
   - Celebratory confetti effects and dramatic verdict banners.
   - Complete deductive chain explanation exposing the true sequence of events.
   - Detailed Score Breakdown table with rank certification.

---

## 🛠️ Architecture & Tech Stack

```
invest_v1/
├── package.json              # Root workspace orchestrator (concurrently)
├── server/                   # Backend Express & MongoDB API
│   ├── src/
│   │   ├── config/db.js      # MongoDB connection with auto in-memory fallback
│   │   ├── models/Case.js    # Mongoose Case Schema & public/result serializers
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── services/         # Gemini API service (@google/genai) & fallback generator
│   │   ├── controllers/      # REST API handlers
│   │   ├── routes/           # Express router endpoints
│   │   └── index.js          # Express app entrypoint
│   └── .env                  # Backend environment variables
└── client/                   # Frontend Vite + React + Tailwind CSS
    ├── src/
    │   ├── api/axiosClient.js# Axios client with x-gemini-api-key support
    │   ├── utils/soundEffects.js # Web Audio API procedural sound synthesizer
    │   ├── components/       # Navbar, ScoreHUD, SuspectCard, ClueItem, HintSection, AccusationModal, LoadingDossier
    │   ├── pages/            # HomePage, InvestigationPage, ResultsPage
    │   └── App.jsx           # React Router routes
    ├── tailwind.config.js    # Custom Noir detective color palette & styling
    └── vite.config.js        # Vite build tool with proxy config
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection URI (falls back to In-Memory MongoDB if offline) | `mongodb://localhost:27017/ai_mystery_room` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` (Optional, UI also supports custom key entry) |
| `CLIENT_URL` | Frontend URL allowed by CORS | `http://localhost:5173` |
| `NODE_ENV` | Runtime environment | `development` |

---

## 🚀 Running the Project

### 1. Install All Dependencies
```bash
npm run install:all
```

### 2. Start Both Server & Client Concurrently
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 Backend API Endpoints

- `POST /api/cases`: Generates structured mystery case matching difficulty specs via Gemini API / Zod validation. Returns public case data (solution strictly hidden).
- `GET /api/cases/:id`: Retrieves active mystery case data (solution and `isCulprit` flags stripped).
- `POST /api/cases/:id/clues/:clueId/discover`: Marks clue as discovered and updates score (+5 pts).
- `POST /api/cases/:id/hints`: Marks next hint as used and updates score (-10 pts, floored at 0).
- `POST /api/cases/:id/accuse`: Submits formal suspect accusation, computes final score, seals case, and returns true culprit and solution explanation.
- `GET /api/cases/:id/result`: Retrieves completed case results, score ledger, and deductive explanation.
- `GET /api/cases`: Lists recent case files for resuming or reviewing.

---

## 🏆 Scoring Rules

$$\text{Final Score} = \max\Big(0, \text{Accusation Base} + (\text{Clues Discovered} \times 5) - (\text{Hints Used} \times 10)\Big)$$

- **Accusation Base Points**:
  - Easy: **+100 pts** (if correct)
  - Medium: **+150 pts** (if correct)
  - Hard: **+200 pts** (if correct)
  - Incorrect: **0 pts**
- **Clue Discovery Bonus**: **+5 pts** per verified clue.
- **Police Dispatch Hint Penalty**: **-10 pts** per unlocked hint.
