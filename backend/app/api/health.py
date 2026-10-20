from fastapi import APIRouter
from ..config import settings
from ..services.ai_service import check_ollama_status
from ..database.db import get_total_organized_count
from ..database.models import OllamaStatusResponse

router = APIRouter(tags=["Health & AI Status"])

@router.get("/health")
async def health_check():
    ai_status = await check_ollama_status()
    total_organized = get_total_organized_count()
    
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.version,
        "ai": {
            "is_running": ai_status.is_running,
            "active": ai_status.active,
            "selected_model": ai_status.selected_model,
            "models_available": len(ai_status.available_models),
            "url": ai_status.url,
            "error": ai_status.error
        },
        "stats": {
            "total_organized_files": total_organized
        }
    }

@router.get("/ai/status", response_model=OllamaStatusResponse)
async def get_ai_status():
    return await check_ollama_status()
