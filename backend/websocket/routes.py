from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from database.session import SessionLocal
from services.grid_service import latest_payloads
from websocket.manager import manager


router = APIRouter(tags=["websocket"])


@router.websocket("/ws/transformers")
async def transformer_stream(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        with SessionLocal() as db:
            await websocket.send_json({"type": "transformer_update", "transformers": latest_payloads(db)})
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
