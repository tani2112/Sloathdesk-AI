from typing import List
from fastapi import APIRouter
from ..database.models import HistoryBatchItem, UndoResponse
from ..services.history_service import get_activity_history, undo_batch_operations

router = APIRouter(prefix="/history", tags=["Activity History & Undo"])

@router.get("", response_model=List[HistoryBatchItem])
async def get_history(limit: int = 50):
    return get_activity_history(limit=limit)

@router.post("/undo/{batch_id}", response_model=UndoResponse)
async def undo_batch(batch_id: str):
    return undo_batch_operations(batch_id)
