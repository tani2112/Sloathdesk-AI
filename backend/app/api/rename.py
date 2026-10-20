from fastapi import APIRouter
from ..database.models import (
    RenamePreviewRequest,
    RenamePreviewResponse,
    RenameExecuteRequest,
    RenameExecuteResponse,
)
from ..security.path_validator import validate_folder_access
from ..services.renamer_service import generate_rename_proposals, execute_rename_batch

router = APIRouter(prefix="/rename", tags=["AI Renamer"])

@router.post("/preview", response_model=RenamePreviewResponse)
async def preview_renames(req: RenamePreviewRequest):
    folder = validate_folder_access(req.folder_path)
    return await generate_rename_proposals(
        folder_path=folder,
        file_paths=req.file_paths,
        use_ai=req.use_ai,
        naming_style=req.naming_style
    )

@router.post("/execute", response_model=RenameExecuteResponse)
async def execute_renames(req: RenameExecuteRequest):
    folder = validate_folder_access(req.folder_path)
    return execute_rename_batch(
        folder_path=folder,
        proposals=req.proposals
    )
