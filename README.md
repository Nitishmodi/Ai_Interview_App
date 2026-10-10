# DevPilot AI

A hiring screen for recruiters and candidates.

A recruiter writes a job post and chooses when it is visible. A candidate sees open roles ranked by the role they want, their experience, and their skills. Applying starts a screen that Gemini writes for that person: 20 skill questions, 5 recorded answers, and 5 communication answers. The answers are saved and scored. Both sides get the same scorecard, with charts and a PDF.

A proceed means above 80% in every section and above 80% overall. Anything short of that is marked not this time, and the candidate may be considered for a future role. The recruiter still makes the final call.

## Stack

- Next.js, React, Tailwind CSS
- Gemini API
- PostgreSQL with Drizzle

An attempt, its job, the candidate, and the scorecard are read in one join. Saving an answer checks ownership without loading the paper. Job lists return a short preview, and screen counts are aggregated in SQL. Indexes cover recruiter, job status, and candidate.

## Setup

```bash
git clone https://github.com/Nitishmodi/Ai_Interview_App
cd Ai_Interview_App/interview_app
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — a long random string
- `GEMINI_API_KEY` — from Google AI Studio
- `GEMINI_MODEL` — optional, defaults to `gemini-3.8-flash`

Tables are created the first time someone signs in. Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create a recruiter profile and a candidate profile. They land on different desks.

## Contact

nitishmodi200@gmail.com
