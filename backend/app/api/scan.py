from fastapi import APIRouter
from ..database.models import ScanRequest, ScanResponse
from ..security.path_validator import validate_folder_access
from ..services.file_scanner import scan_directory

router = APIRouter(prefix="/scan", tags=["Scanning"])

@router.post("", response_model=ScanResponse)
async def scan_folder_endpoint(req: ScanRequest):
    folder = validate_folder_access(req.folder_path)
    return scan_directory(
        folder_path=folder,
        recursive=req.recursive,
        include_hidden=req.include_hidden
    )
