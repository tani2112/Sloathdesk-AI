from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..config import settings
from ..security.path_validator import validate_folder_access, normalize_path
from ..services.watchdog_service import watcher_manager

router = APIRouter(prefix="/folders", tags=["Folders"])

class ValidateFolderRequest(BaseModel):
    folder_path: str

class FolderValidationResponse(BaseModel):
    valid: bool
    path: str
    name: str
    exists: bool
    is_dir: bool
    is_safe: bool
    error: str = ""

@router.get("/defaults")
async def get_default_folders():
    defaults = []
    candidates = [
        ("Downloads", Path.home() / "Downloads"),
        ("Documents", Path.home() / "Documents"),
        ("Desktop", Path.home() / "Desktop"),
        ("Pictures", Path.home() / "Pictures"),
        ("Videos", Path.home() / "Videos"),
        ("Music", Path.home() / "Music"),
    ]
    for label, p in candidates:
        if p.exists() and p.is_dir():
            defaults.append({
                "label": label,
                "path": str(p.resolve()),
                "exists": True
            })
            
    # Include current user home
    return {
        "home_dir": str(Path.home().resolve()),
        "default_folders": defaults,
        "recommended": str((Path.home() / "Downloads").resolve()) if (Path.home() / "Downloads").exists() else str(Path.home().resolve())
    }

@router.post("/validate", response_model=FolderValidationResponse)
async def validate_folder(req: ValidateFolderRequest):
    try:
        resolved = validate_folder_access(req.folder_path)
        # Start watchdog observer on this validated folder
        watcher_manager.start_watching(str(resolved))
        
        return FolderValidationResponse(
            valid=True,
            path=str(resolved),
            name=resolved.name or str(resolved),
            exists=True,
            is_dir=True,
            is_safe=True
        )
    except HTTPException as e:
        return FolderValidationResponse(
            valid=False,
            path=req.folder_path,
            name="",
            exists=False,
            is_dir=False,
            is_safe=False,
            error=str(e.detail)
        )
    except Exception as e:
        return FolderValidationResponse(
            valid=False,
            path=req.folder_path,
            name="",
            exists=False,
            is_dir=False,
            is_safe=False,
            error=str(e)
        )
