# AI Resume Analyzer

A full-stack portfolio project that reviews resumes, checks ATS-readability signals, and compares resume evidence with a pasted job description.

## Features
- PDF and DOCX upload with server-side text extraction
- AI-generated strengths, weaknesses, recommendations, bullet rewrites, and job-match analysis
- Transparent heuristic score breakdown (not a real employer ATS score)
- Optional MongoDB report history
- Demo mode works without an AI key, using a clearly labeled rule-based report
- React + Vite frontend and Express API

## Requirements
- Node.js 20+ recommended
- npm
- Optional: OpenAI API key
- Optional: MongoDB connection string

## Run locally

### 1. Server
```bash
cd server
npm install
copy .env.example .env
```
On macOS/Linux use `cp .env.example .env`. Edit `server/.env` and set `OPENAI_API_KEY` and/or `MONGODB_URI` if desired.

```bash
npm run dev
```
API runs at `http://localhost:5000`.

### 2. Client
Open a second terminal:
```bash
cd client
npm install
copy .env.example .env
npm run dev
```
On macOS/Linux use `cp .env.example .env`. Open the Vite URL, usually `http://localhost:5173`.

On Windows PowerShell, if script execution policy blocks `npm`, use `npm.cmd` instead.

## AI configuration
Set `OPENAI_API_KEY` in `server/.env`. The key must stay on the server and must never be placed in the React client or committed to GitHub. Set `OPENAI_MODEL` to a model available to your account. The server requests structured JSON output from the model. Without an API key, the app uses a basic rule-based demo analyzer.

AI API use may incur charges. Set provider-side spending limits and do not submit real personal resumes without understanding the provider's data policies.

## MongoDB (optional)
Set `MONGODB_URI` to your MongoDB Atlas connection string. If omitted, analysis still works, but reports are not saved. For a public production app, add authentication and user-level access control before saving sensitive reports.

## Deployment
- Frontend: deploy `client` to Vercel. Build command: `npm run build`; output directory: `dist`.
- Backend: deploy `server` to Render as a Node web service. Build command: `npm install`; start command: `npm start`.
- Set server environment variables in Render: `CLIENT_ORIGIN` (your deployed frontend URL), `OPENAI_API_KEY` (optional), `OPENAI_MODEL`, `MONGODB_URI` (optional), and `NODE_ENV=production`.
- Set `VITE_API_URL` in Vercel to your deployed backend URL plus `/api`, e.g. `https://your-service.onrender.com/api`, then redeploy the frontend.
- Use HTTPS URLs in production.

## API endpoints
- `GET /api/health`
- `POST /api/analyze` multipart form fields: `resume` (PDF/DOCX), `jobDescription` (optional text)
- `GET /api/reports` (only if MongoDB is configured; demo endpoint, not production-secured)
- `GET /api/reports/:id` (only if MongoDB is configured; demo endpoint, not production-secured)

## Important limitations
- This is a learning/portfolio tool, not an official ATS emulator or hiring decision system.
- A score is a heuristic estimate and does not predict actual shortlisting.
- Scanned/image-only PDFs may require OCR; this version will ask for a text-readable document.
- The starter intentionally does not implement authentication. Do not expose saved reports publicly until authentication and authorization are added.
- Uploaded files are processed in memory and are not stored on disk by this app.
