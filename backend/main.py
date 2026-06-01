from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as api_router
from database.config import settings
from database.session import Base, SessionLocal, engine
from models import entities  # noqa: F401
from scheduler.jobs import create_scheduler, simulation_job
from services.seed import seed_database
from websocket.routes import router as websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
    await simulation_job()
    scheduler = create_scheduler()
    scheduler.start()
    app.state.scheduler = scheduler
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(
    title="Smart Grid Digital Twin Backend",
    version="0.1.0",
    description="Rule-based FastAPI backend for a transformer digital twin platform.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(websocket_router)


@app.get("/healthz", tags=["health"])
def healthz():
    return {"status": "ok"}
