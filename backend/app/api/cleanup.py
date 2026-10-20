from fastapi import APIRouter
from pydantic import BaseModel
from ..database.models import (
    CleanupScanResponse,
    CleanupExecuteRequest,
    CleanupExecuteResponse,
)
from ..security.path_validator import validate_folder_access
from ..services.cleanup_service import scan_cleanup_recommendations, execute_cleanup

router = APIRouter(prefix="/cleanup", tags=["Cleanup Assistant"])

class CleanupScanRequest(BaseModel):
    folder_path: str

@router.post("/scan", response_model=CleanupScanResponse)
async def scan_cleanup_endpoint(req: CleanupScanRequest):
    folder = validate_folder_access(req.folder_path)
    return scan_cleanup_recommendations(folder)

@router.post("/execute", response_model=CleanupExecuteResponse)
async def execute_cleanup_endpoint(req: CleanupExecuteRequest):
    folder = validate_folder_access(req.folder_path)
    return execute_cleanup(
        folder_path=folder,
        file_paths=req.file_paths_to_remove,
        delete_permanently=req.delete_permanently
    )
