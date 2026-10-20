import os
import time
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
from ..database.models import (
    FileItem,
    ScanResponse,
    CategorySummary,
    CATEGORY_DOCUMENTS,
    CATEGORY_IMAGES,
    CATEGORY_VIDEOS,
    CATEGORY_AUDIO,
    CATEGORY_ARCHIVES,
    CATEGORY_CODE,
    CATEGORY_OTHER,
    ALL_CATEGORIES,
)
from ..security.path_validator import validate_folder_access

# Extension mapping
EXTENSIONS_MAP: Dict[str, str] = {
    # Documents
    '.pdf': CATEGORY_DOCUMENTS,
    '.doc': CATEGORY_DOCUMENTS,
    '.docx': CATEGORY_DOCUMENTS,
    '.txt': CATEGORY_DOCUMENTS,
    '.rtf': CATEGORY_DOCUMENTS,
    '.odt': CATEGORY_DOCUMENTS,
    '.xls': CATEGORY_DOCUMENTS,
    '.xlsx': CATEGORY_DOCUMENTS,
    '.csv': CATEGORY_DOCUMENTS,
    '.ppt': CATEGORY_DOCUMENTS,
    '.pptx': CATEGORY_DOCUMENTS,
    '.md': CATEGORY_DOCUMENTS,
    '.epub': CATEGORY_DOCUMENTS,
    '.tex': CATEGORY_DOCUMENTS,
    '.pages': CATEGORY_DOCUMENTS,
    
    # Images
    '.png': CATEGORY_IMAGES,
    '.jpg': CATEGORY_IMAGES,
    '.jpeg': CATEGORY_IMAGES,
    '.gif': CATEGORY_IMAGES,
    '.webp': CATEGORY_IMAGES,
    '.svg': CATEGORY_IMAGES,
    '.bmp': CATEGORY_IMAGES,
    '.ico': CATEGORY_IMAGES,
    '.tiff': CATEGORY_IMAGES,
    '.raw': CATEGORY_IMAGES,
    '.heic': CATEGORY_IMAGES,
    
    # Videos
    '.mp4': CATEGORY_VIDEOS,
    '.mkv': CATEGORY_VIDEOS,
    '.mov': CATEGORY_VIDEOS,
    '.avi': CATEGORY_VIDEOS,
    '.webm': CATEGORY_VIDEOS,
    '.flv': CATEGORY_VIDEOS,
    '.wmv': CATEGORY_VIDEOS,
    '.m4v': CATEGORY_VIDEOS,
    
    # Audio
    '.mp3': CATEGORY_AUDIO,
    '.wav': CATEGORY_AUDIO,
    '.ogg': CATEGORY_AUDIO,
    '.flac': CATEGORY_AUDIO,
    '.aac': CATEGORY_AUDIO,
    '.m4a': CATEGORY_AUDIO,
    '.wma': CATEGORY_AUDIO,
    
    # Archives
    '.zip': CATEGORY_ARCHIVES,
    '.tar': CATEGORY_ARCHIVES,
    '.gz': CATEGORY_ARCHIVES,
    '.bz2': CATEGORY_ARCHIVES,
    '.7z': CATEGORY_ARCHIVES,
    '.rar': CATEGORY_ARCHIVES,
    '.xz': CATEGORY_ARCHIVES,
    '.iso': CATEGORY_ARCHIVES,
    
    # Code
    '.py': CATEGORY_CODE,
    '.js': CATEGORY_CODE,
    '.jsx': CATEGORY_CODE,
    '.ts': CATEGORY_CODE,
    '.tsx': CATEGORY_CODE,
    '.html': CATEGORY_CODE,
    '.css': CATEGORY_CODE,
    '.json': CATEGORY_CODE,
    '.sh': CATEGORY_CODE,
    '.bash': CATEGORY_CODE,
    '.c': CATEGORY_CODE,
    '.cpp': CATEGORY_CODE,
    '.h': CATEGORY_CODE,
    '.hpp': CATEGORY_CODE,
    '.java': CATEGORY_CODE,
    '.go': CATEGORY_CODE,
    '.rs': CATEGORY_CODE,
    '.sql': CATEGORY_CODE,
    '.yaml': CATEGORY_CODE,
    '.yml': CATEGORY_CODE,
    '.xml': CATEGORY_CODE,
    '.toml': CATEGORY_CODE,
}

IGNORE_DIRS = {
    'node_modules',
    '.git',
    '.venv',
    'venv',
    '__pycache__',
    '.pytest_cache',
    '.sloth_trash',
}

def format_size(bytes_val: int) -> str:
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_val < 1024.0:
            return f"{bytes_val:.1f} {unit}"
        bytes_val /= 1024.0
    return f"{bytes_val:.1f} TB"

def get_file_category(extension: str) -> str:
    ext_lower = extension.lower()
    return EXTENSIONS_MAP.get(ext_lower, CATEGORY_OTHER)

def scan_directory(
    folder_path: Path,
    recursive: bool = False,
    include_hidden: bool = False,
    max_files: int = 5000
) -> ScanResponse:
    files_list: List[FileItem] = []
    category_counts: Dict[str, int] = {cat: 0 for cat in ALL_CATEGORIES}
    category_bytes: Dict[str, int] = {cat: 0 for cat in ALL_CATEGORIES}
    total_bytes = 0
    
    walker = folder_path.rglob('*') if recursive else folder_path.iterdir()
    
    for item in walker:
        if len(files_list) >= max_files:
            break
            
        try:
            # Skip directories
            if not item.is_file():
                continue
                
            # Skip ignored directories if recursive
            if recursive and any(part in IGNORE_DIRS for part in item.parts):
                continue
                
            is_hidden = item.name.startswith('.')
            if is_hidden and not include_hidden:
                continue
                
            stat = item.stat()
            size = stat.st_size
            mtime = stat.st_mtime
            ext = item.suffix.lower()
            category = get_file_category(ext)
            
            # Format mtime
            mtime_dt = datetime.fromtimestamp(mtime)
            mtime_formatted = mtime_dt.strftime('%b %d, %Y %H:%M')
            
            file_item = FileItem(
                name=item.name,
                path=str(item.resolve()),
                size_bytes=size,
                size_formatted=format_size(size),
                extension=ext,
                category=category,
                modified_timestamp=mtime,
                modified_formatted=mtime_formatted,
                is_hidden=is_hidden
            )
            
            files_list.append(file_item)
            category_counts[category] += 1
            category_bytes[category] += size
            total_bytes += size
            
        except (PermissionError, FileNotFoundError, OSError):
            continue
            
    # Prepare summary
    cat_summaries: Dict[str, CategorySummary] = {}
    for cat in ALL_CATEGORIES:
        cat_summaries[cat] = CategorySummary(
            category=cat,
            count=category_counts[cat],
            total_bytes=category_bytes[cat],
            total_size_formatted=format_size(category_bytes[cat])
        )
        
    return ScanResponse(
        folder_path=str(folder_path.resolve()),
        total_files=len(files_list),
        total_bytes=total_bytes,
        total_size_formatted=format_size(total_bytes),
        categories=cat_summaries,
        files=files_list
    )
