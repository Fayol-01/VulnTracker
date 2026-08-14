# VulnTracker

Full-stack vulnerability management platform. Track, triage, and remediate software vulnerabilities through a unified security dashboard backed by Supabase, with an AI assistant powered by Google Gemini.

## Features

- Dashboard for a unified view of the security posture
- Vulnerability management with CVE data, severity, and summaries
- Software and vendor inventory with associated patches
- Threat classification, linking vulnerabilities to active threats by type
- Patch tracking for the vulnerabilities they remediate
- Gemini AI chatbot for natural-language questions about the current data
- Supabase authentication for sign-up, sign-in, and protected routes

## Stack

- Backend: Python 3.11, Flask, Flask-CORS, Flask-Limiter, Marshmallow
- Database: Supabase (PostgreSQL) + Supabase Auth
- AI: Google Generative AI (Gemini)
- Frontend: React 19, Vite, React Router v7, Tailwind CSS
- HTTP client: Axios + supabase-js
- Deployment: Docker Compose, Render (Gunicorn)
- Observability: Structlog (JSON structured logging)

## Project Structure

```
VulnTracker/
├── docker-compose.yml            # Backend + frontend local orchestration
├── runtime.txt                   # Python version pin
├── docs/
│   └── roadmap.md                # Implementation plan
├── vulntracker-backend/          # Python / Flask API
│   ├── app.py                    # Routes, CORS, rate limiting
│   ├── auth.py                   # JWT validation for protected routes
│   ├── schemas.py                # Request/response schemas
│   ├── requirements.txt
│   ├── Procfile                  # web: gunicorn app:app
│   ├── Dockerfile
│   ├── .env.example
│   ├── routes/
│   │   └── chat.py               # POST /api/chat (Gemini assistant)
│   └── static/
└── vulntracker_frontend/         # React / Vite SPA
    ├── index.html
    ├── package.json
    ├── Dockerfile
    ├── .env.production.example
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── contexts/AuthContext.jsx
        ├── hooks/
        ├── services/             # api.js, supabase.js
        ├── components/           # Header, SideNav, ChatBot, Dashboard, ...
        └── pages/                # Vulnerabilities, Threats, Patches, Software, ...
```

## Getting Started

### Prerequisites

- Docker and Docker Compose (for the containerized setup)
- Or Python 3.11 and Node 20 if running manually

### Docker

```bash
docker compose up --build
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Manual

Backend:

```bash
cd vulntracker-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Frontend:

```bash
cd vulntracker_frontend
npm install
npm run dev
```

Then open http://localhost:5173.

You will need a Supabase project and a Google API key. Set the values in `vulntracker-backend/.env` (see `.env.example`) and confirm the Supabase URL/key in `vulntracker_frontend/src/services/supabase.js` and the API URL in the frontend `.env` (defaults to `http://localhost:5000/api`).

## Common Commands

Backend: `python app.py` (dev), `gunicorn app:app` (production).

Frontend: `npm run dev` (dev server), `npm run build` (production build), `npm run preview` (preview build), `npm run lint`.

## Deployment

### Render

- Backend: Web Service pointing at `vulntracker-backend`. `runtime.txt` pins Python to 3.11.8; the `Procfile` runs Gunicorn bound to `$PORT`. Buildpacks configuration is already present.
- Frontend: Static Site pointing at `vulntracker_frontend`, running `npm run build` and serving `dist/`. Set `VITE_API_URL` in `.env.production` to your deployed backend.

### Docker

Use the included Dockerfiles, or `docker compose up --build` for the full stack.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Implement changes following the conventions in `docs/roadmap.md`.
4. Open a pull request with a clear description.

## Repository

[https://github.com/evinbrijesh/VulnTracker](https://github.com/evinbrijesh/VulnTracker)