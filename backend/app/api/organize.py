from fastapi import APIRouter
from ..database.models import (
    OrganizePreviewRequest,
    OrganizePreviewResponse,
    OrganizeExecuteRequest,
    OrganizeExecuteResponse,
)
from ..security.path_validator import validate_folder_access
from ..services.organizer_service import generate_organize_preview, execute_organize_batch

router = APIRouter(prefix="/organize", tags=["Organizer"])

@router.post("/preview", response_model=OrganizePreviewResponse)
async def preview_organization(req: OrganizePreviewRequest):
    folder = validate_folder_access(req.folder_path)
    return generate_organize_preview(
        folder_path=folder,
        custom_rules=req.custom_rules,
        use_ai=req.use_ai
    )

@router.post("/execute", response_model=OrganizeExecuteResponse)
async def execute_organization(req: OrganizeExecuteRequest):
    folder = validate_folder_access(req.folder_path)
    return execute_organize_batch(
        folder_path=folder,
        moves=req.moves,
        batch_description=req.batch_description or "Organized files by category"
    )
