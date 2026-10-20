from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# File Category Enum / Constants
CATEGORY_DOCUMENTS = "Documents"
CATEGORY_IMAGES = "Images"
CATEGORY_VIDEOS = "Videos"
CATEGORY_AUDIO = "Audio"
CATEGORY_ARCHIVES = "Archives"
CATEGORY_CODE = "Code"
CATEGORY_OTHER = "Other"

ALL_CATEGORIES = [
    CATEGORY_DOCUMENTS,
    CATEGORY_IMAGES,
    CATEGORY_VIDEOS,
    CATEGORY_AUDIO,
    CATEGORY_ARCHIVES,
    CATEGORY_CODE,
    CATEGORY_OTHER,
]

class FileItem(BaseModel):
    name: str
    path: str
    size_bytes: int
    size_formatted: str
    extension: str
    category: str
    modified_timestamp: float
    modified_formatted: str
    is_hidden: bool = False

class ScanRequest(BaseModel):
    folder_path: str
    recursive: bool = False
    include_hidden: bool = False

class CategorySummary(BaseModel):
    category: str
    count: int
    total_bytes: int
    total_size_formatted: str

class ScanResponse(BaseModel):
    folder_path: str
    total_files: int
    total_bytes: int
    total_size_formatted: str
    categories: Dict[str, CategorySummary]
    files: List[FileItem] = []

# Organize
class PlannedMove(BaseModel):
    source_path: str
    source_filename: str
    target_folder: str
    target_path: str
    target_filename: str
    category: str
    size_bytes: int
    conflict_resolved: bool = False
    reason: Optional[str] = None

class OrganizePreviewRequest(BaseModel):
    folder_path: str
    custom_rules: Optional[Dict[str, str]] = None # custom category mapping if desired
    use_ai: bool = False

class OrganizePreviewResponse(BaseModel):
    folder_path: str
    total_files: int
    planned_moves: List[PlannedMove]
    affected_categories: List[str]

class OrganizeExecuteRequest(BaseModel):
    folder_path: str
    moves: List[PlannedMove]
    batch_description: Optional[str] = "Organized files by category"

class OrganizeExecuteResponse(BaseModel):
    batch_id: str
    success_count: int
    failed_count: int
    errors: List[str] = []

# Rename
class RenameProposal(BaseModel):
    original_path: str
    original_name: str
    proposed_name: str
    proposed_path: str
    confidence: float = 1.0
    reason: str
    selected: bool = True
    preview_snippet: Optional[str] = None

class RenamePreviewRequest(BaseModel):
    folder_path: str
    file_paths: Optional[List[str]] = None
    use_ai: bool = True
    naming_style: str = "kebab-case" # "kebab-case", "snake_case", "Title_Case"

class RenamePreviewResponse(BaseModel):
    proposals: List[RenameProposal]
    ai_used: bool

class RenameExecuteRequest(BaseModel):
    folder_path: str
    proposals: List[RenameProposal]

class RenameExecuteResponse(BaseModel):
    batch_id: str
    success_count: int
    failed_count: int
    errors: List[str] = []

# Search
class SearchRequest(BaseModel):
    folder_path: str
    query: str
    search_content: bool = True
    use_ai: bool = True

class SearchFilterParsed(BaseModel):
    keywords: List[str] = []
    extensions: List[str] = []
    categories: List[str] = []
    date_filter: Optional[str] = None # "recent", "today", "last_week", "last_month"
    min_size_mb: Optional[float] = None
    max_size_mb: Optional[float] = None
    ai_interpretation: Optional[str] = None

class SearchResultItem(BaseModel):
    name: str
    path: str
    size_formatted: str
    modified_formatted: str
    category: str
    snippet: Optional[str] = None
    match_type: str = "filename" # "filename", "content", "keyword"
    relevance_score: float = 1.0

class SearchResponse(BaseModel):
    query: str
    folder_path: str
    parsed_filters: SearchFilterParsed
    total_results: int
    results: List[SearchResultItem]

# Cleanup
class DuplicateGroup(BaseModel):
    file_hash: str
    size_bytes: int
    size_formatted: str
    files: List[FileItem]

class CleanupScanResponse(BaseModel):
    folder_path: str
    duplicate_groups: List[DuplicateGroup]
    total_duplicate_wasted_bytes: int
    total_duplicate_wasted_formatted: str
    large_files: List[FileItem] # > 50MB
    old_files: List[FileItem]   # > 30 days
    temp_files: List[FileItem]  # .tmp, .crdownload, etc.
    empty_folders: List[str]

class CleanupExecuteRequest(BaseModel):
    folder_path: str
    file_paths_to_remove: List[str] # Safe move to _Sloth_Trash or safe unlink
    delete_permanently: bool = False # If false, moves to .sloth_trash/ within folder

class CleanupExecuteResponse(BaseModel):
    batch_id: str
    reclaimed_bytes: int
    reclaimed_formatted: str
    success_count: int
    failed_count: int
    errors: List[str] = []

# History
class FileOperationRow(BaseModel):
    id: int
    batch_id: str
    operation_type: str
    original_path: str
    new_path: str
    file_size: int
    timestamp: float
    undone: int

class HistoryBatchItem(BaseModel):
    batch_id: str
    batch_type: str
    folder_path: str
    total_files: int
    description: str
    timestamp: float
    timestamp_formatted: str
    undone: bool
    operations: List[FileOperationRow] = []

class UndoResponse(BaseModel):
    batch_id: str
    undone_count: int
    conflicts: List[str] = []
    success: bool
    message: str

# Settings & System Status
class OllamaModelInfo(BaseModel):
    name: str
    size: Optional[int] = None
    size_formatted: Optional[str] = None
    parameter_size: Optional[str] = None
    family: Optional[str] = None

class OllamaStatusResponse(BaseModel):
    is_running: bool
    url: str
    available_models: List[OllamaModelInfo] = []
    selected_model: str
    active: bool
    error: Optional[str] = None

class SystemSettings(BaseModel):
    ollama_url: str
    selected_model: str
    ai_timeout_seconds: float
    allowed_folders: List[str]
    theme_accent: str = "purple"
