from fastapi import APIRouter
from ..database.models import SearchRequest, SearchResponse
from ..security.path_validator import validate_folder_access
from ..services.search_service import execute_natural_language_search

router = APIRouter(prefix="/search", tags=["Natural Language Search"])

@router.post("", response_model=SearchResponse)
async def search_files(req: SearchRequest):
    folder = validate_folder_access(req.folder_path)
    return await execute_natural_language_search(
        folder_path=folder,
        query=req.query,
        search_content=req.search_content,
        use_ai=req.use_ai
    )
