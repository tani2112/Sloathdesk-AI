import os
from pathlib import Path
from typing import Optional, List
from fastapi import HTTPException
from ..config import settings

# Sensitive system directories that must NEVER be accessed, scanned, or modified
FORBIDDEN_ROOTS = [
    Path("/"),
    Path("/bin"),
    Path("/sbin"),
    Path("/usr"),
    Path("/etc"),
    Path("/var"),
    Path("/sys"),
    Path("/proc"),
    Path("/dev"),
    Path("/boot"),
    Path("/root"),
    Path("/opt"),
]

def normalize_path(path_str: str) -> Path:
    """
    Expands ~ and environment variables, resolves relative segments to absolute Path.
    """
    if not path_str or not path_str.strip():
        raise HTTPException(status_code=400, detail="Path cannot be empty.")
    
    expanded = os.path.expandvars(os.path.expanduser(path_str.strip()))
    resolved = Path(expanded).resolve()
    return resolved

def is_system_forbidden(path: Path) -> bool:
    """
    Checks if path is directly a forbidden root or system folder.
    """
    for forbidden in FORBIDDEN_ROOTS:
        try:
            if path == forbidden:
                return True
        except Exception:
            pass
    # Specifically forbid root directly
    if str(path) in ["/", "\\"]:
        return True
    return False

def validate_folder_access(folder_path_str: str, allowed_roots: Optional[List[str]] = None) -> Path:
    """
    Validates that a folder is safe to access:
    1. Not a forbidden system directory.
    2. Exists and is a directory.
    3. Normalizes path to prevent path traversal.
    """
    path = normalize_path(folder_path_str)
    
    if is_system_forbidden(path):
        raise HTTPException(
            status_code=403, 
            detail=f"Security violation: Access to system directory '{path}' is strictly forbidden."
        )
        
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Folder not found: '{path}'")
        
    if not path.is_dir():
        raise HTTPException(status_code=400, detail=f"Path is not a directory: '{path}'")
        
    # Check if user allowed roots are enforced
    if allowed_roots:
        allowed = False
        for root in allowed_roots:
            try:
                root_path = normalize_path(root)
                if path == root_path or root_path in path.parents:
                    allowed = True
                    break
            except Exception:
                continue
        if not allowed:
            raise HTTPException(
                status_code=403,
                detail=f"Folder '{path}' is not within authorized user directories."
            )
            
    return path

def validate_child_file_path(base_folder: Path, target_path_str: str) -> Path:
    """
    Ensures target_path_str is strictly inside base_folder.
    Prevents path traversal attacks (e.g., ../../etc/passwd).
    Prevents symlink escape.
    """
    target = normalize_path(target_path_str)
    
    # Must be relative to base_folder
    try:
        target.relative_to(base_folder)
    except ValueError:
        raise HTTPException(
            status_code=403,
            detail=f"Security violation: File path '{target}' escapes allowed folder '{base_folder}'"
        )
        
    # Check if target is a symlink pointing outside base_folder
    if target.is_symlink():
        real_target = target.resolve()
        try:
            real_target.relative_to(base_folder)
        except ValueError:
            raise HTTPException(
                status_code=403,
                detail=f"Security violation: Symlink '{target}' points outside base folder."
            )
            
    return target

def sanitize_filename(name: str) -> str:
    """
    Sanitizes filename removing hazardous characters, path separators, and null bytes.
    """
    # Remove slashes and null bytes
    cleaned = name.replace("/", "_").replace("\\", "_").replace("\0", "")
    # Remove control characters
    cleaned = "".join(ch for ch in cleaned if ord(ch) >= 32)
    # Strip whitespace, dots at end
    cleaned = cleaned.strip(". ")
    if not cleaned:
        cleaned = "unnamed_file"
    return cleaned
