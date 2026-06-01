# Smart Grid Digital Twin Backend

FastAPI backend for the React smart-grid dashboard. It uses PostgreSQL, SQLAlchemy, APScheduler, deterministic rule engines, and WebSockets.

## Run With Docker

```bash
docker compose up --build
```

Backend: `http://localhost:8000`

OpenAPI docs: `http://localhost:8000/docs`

## Local Run

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

The backend seeds 5 transformers on startup and then runs a 5-second deterministic simulation cycle.
