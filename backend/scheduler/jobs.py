from apscheduler.schedulers.asyncio import AsyncIOScheduler

from database.config import settings
from database.session import SessionLocal
from services.grid_service import run_simulation_cycle
from websocket.manager import manager


def create_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(simulation_job, "interval", seconds=settings.simulation_interval_seconds, id="simulation-cycle", replace_existing=True)
    return scheduler


async def simulation_job() -> None:
    with SessionLocal() as db:
        updates = run_simulation_cycle(db)
    await manager.broadcast({"type": "transformer_update", "transformers": updates})
