import json
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from ..config import settings
from ..database.db import get_app_setting, set_app_setting
from ..services.ai_service import check_ollama_status

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingsUpdatePayload(BaseModel):
    ollama_url: Optional[str] = None
    selected_model: Optional[str] = None
    ai_timeout_seconds: Optional[float] = None
    allowed_folders: Optional[List[str]] = None
    theme_accent: Optional[str] = None

@router.get("")
async def get_settings():
    saved_url = get_app_setting("ollama_url", settings.ollama_url)
    saved_model = get_app_setting("selected_model", settings.ai_model)
    saved_timeout = get_app_setting("ai_timeout_seconds", str(settings.ai_timeout_seconds))
    saved_folders_json = get_app_setting("allowed_folders")
    saved_theme = get_app_setting("theme_accent", "purple")
    
    if saved_folders_json:
        try:
            allowed_folders = json.loads(saved_folders_json)
        except Exception:
            allowed_folders = settings.default_allowed_roots
    else:
        allowed_folders = settings.default_allowed_roots
        
    ai_status = await check_ollama_status()
    
    return {
        "ollama_url": saved_url,
        "selected_model": saved_model,
        "ai_timeout_seconds": float(saved_timeout),
        "allowed_folders": allowed_folders,
        "theme_accent": saved_theme,
        "ai_status": ai_status
    }

@router.post("")
async def update_settings(payload: SettingsUpdatePayload):
    if payload.ollama_url is not None:
        set_app_setting("ollama_url", payload.ollama_url.strip())
        settings.ollama_url = payload.ollama_url.strip()
        
    if payload.selected_model is not None:
        set_app_setting("selected_model", payload.selected_model.strip())
        settings.ai_model = payload.selected_model.strip()
        
    if payload.ai_timeout_seconds is not None:
        set_app_setting("ai_timeout_seconds", str(payload.ai_timeout_seconds))
        settings.ai_timeout_seconds = payload.ai_timeout_seconds
        
    if payload.allowed_folders is not None:
        set_app_setting("allowed_folders", json.dumps(payload.allowed_folders))
        
    if payload.theme_accent is not None:
        set_app_setting("theme_accent", payload.theme_accent)
        
    return {"status": "success", "message": "Settings updated successfully."}
