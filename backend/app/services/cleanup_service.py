import os
import time
import uuid
import hashlib
import shutil
from pathlib import Path
from typing import List, Dict
from ..database.models import (
    FileItem,
    DuplicateGroup,
    CleanupScanResponse,
    CleanupExecuteResponse,
)
from ..database.db import record_batch, record_operation
from ..security.path_validator import validate_folder_access, validate_child_file_path
from .file_scanner import scan_directory, format_size

def hash_file_header(file_path: Path, block_size: int = 8192) -> str:
    """Computes SHA256 of the first 8KB of a file for fast duplicate pre-filtering."""
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        data = f.read(block_size)
        h.update(data)
    return h.hexdigest()

def hash_file_full(file_path: Path, block_size: int = 65536) -> str:
    """Computes full SHA256 of a file."""
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(block_size):
            h.update(chunk)
    return h.hexdigest()

def find_duplicates(files: List[FileItem]) -> tuple[List[DuplicateGroup], int]:
    """
    Finds exact duplicate files using a 3-tier algorithm:
    1. Size bucket grouping
    2. 8KB header hash comparison
    3. Full SHA-256 hash comparison
    """
    # Group by size
    size_map: Dict[int, List[FileItem]] = {}
    for f in files:
        if f.size_bytes > 0: # skip zero byte files
            size_map.setdefault(f.size_bytes, []).append(f)
            
    # Filter candidates with same size
    candidates = [f_list for f_list in size_map.values() if len(f_list) > 1]
    
    # Header hash grouping
    header_map: Dict[tuple[int, str], List[FileItem]] = {}
    for group in candidates:
        for f in group:
            try:
                h_head = hash_file_header(Path(f.path))
                header_map.setdefault((f.size_bytes, h_head), []).append(f)
            except Exception:
                continue
                
    header_candidates = [f_list for f_list in header_map.values() if len(f_list) > 1]
    
    # Full hash confirmation
    full_hash_map: Dict[str, List[FileItem]] = {}
    for group in header_candidates:
        for f in group:
            try:
                full_h = hash_file_full(Path(f.path))
                full_hash_map.setdefault(full_h, []).append(f)
            except Exception:
                continue
                
    duplicate_groups: List[DuplicateGroup] = []
    total_wasted_bytes = 0
    
    for h, group in full_hash_map.items():
        if len(group) > 1:
            size = group[0].size_bytes
            wasted = size * (len(group) - 1)
            total_wasted_bytes += wasted
            duplicate_groups.append(DuplicateGroup(
                file_hash=h,
                size_bytes=size,
                size_formatted=format_size(size),
                files=group
            ))
            
    # Sort groups by wasted space descending
    duplicate_groups.sort(key=lambda g: g.size_bytes * (len(g.files) - 1), reverse=True)
    return duplicate_groups, total_wasted_bytes

def scan_cleanup_recommendations(folder_path: Path) -> CleanupScanResponse:
    scan_res = scan_directory(folder_path, recursive=True, include_hidden=False, max_files=2000)
    
    # 1. Duplicates
    dup_groups, wasted_bytes = find_duplicates(scan_res.files)
    
    # 2. Large files (> 50 MB)
    large_files = [f for f in scan_res.files if f.size_bytes >= 50 * 1024 * 1024]
    large_files.sort(key=lambda f: f.size_bytes, reverse=True)
    
    # 3. Old downloads (> 30 days)
    now = time.time()
    old_threshold = now - (30 * 86400)
    old_files = [f for f in scan_res.files if f.modified_timestamp < old_threshold]
    old_files.sort(key=lambda f: f.modified_timestamp)
    
    # 4. Temp files (.tmp, .crdownload, .part, .bak, etc.)
    temp_exts = {'.tmp', '.crdownload', '.part', '.bak', '.old', '.dmp'}
    temp_files = [f for f in scan_res.files if f.extension.lower() in temp_exts or f.name.endswith('~')]
    
    # 5. Empty folders
    empty_folders: List[str] = []
    for root, dirs, files in os.walk(str(folder_path), topdown=False):
        r_path = Path(root)
        if r_path == folder_path:
            continue
        if r_path.name.startswith('.') or r_path.name in {'node_modules', '.git', '.venv', '__pycache__'}:
            continue
        try:
            if not any(r_path.iterdir()):
                empty_folders.append(str(r_path.resolve()))
        except Exception:
            pass
            
    return CleanupScanResponse(
        folder_path=str(folder_path.resolve()),
        duplicate_groups=dup_groups,
        total_duplicate_wasted_bytes=wasted_bytes,
        total_duplicate_wasted_formatted=format_size(wasted_bytes),
        large_files=large_files[:50],
        old_files=old_files[:50],
        temp_files=temp_files,
        empty_folders=empty_folders[:30]
    )

def execute_cleanup(
    folder_path: Path,
    file_paths: List[str],
    delete_permanently: bool = False
) -> CleanupExecuteResponse:
    batch_id = f"batch_clean_{uuid.uuid4().hex[:10]}"
    success_count = 0
    failed_count = 0
    reclaimed_bytes = 0
    errors: List[str] = []
    
    trash_dir = folder_path / ".sloth_trash"
    if not delete_permanently:
        trash_dir.mkdir(parents=True, exist_ok=True)
        
    record_batch(
        batch_id=batch_id,
        batch_type="CLEANUP",
        folder_path=str(folder_path.resolve()),
        total_files=len(file_paths),
        description="Cleaned up files to trash" if not delete_permanently else "Permanently deleted selected files"
    )
    
    for p_str in file_paths:
        try:
            target = validate_child_file_path(folder_path, p_str)
            if not target.exists():
                failed_count += 1
                errors.append(f"File not found: {target.name}")
                continue
                
            file_size = target.stat().st_size
            
            if delete_permanently:
                # Permanent delete (only when explicitly requested)
                target.unlink()
                record_operation(
                    batch_id=batch_id,
                    operation_type="DELETE",
                    original_path=str(target.resolve()),
                    new_path="",
                    file_size=file_size
                )
            else:
                # Safe move to .sloth_trash
                trash_target = trash_dir / target.name
                counter = 1
                base = target.name.rsplit('.', 1)[0]
                ext = target.suffix
                while trash_target.exists():
                    trash_target = trash_dir / f"{base}_{counter}{ext}"
                    counter += 1
                    
                shutil.move(str(target), str(trash_target))
                record_operation(
                    batch_id=batch_id,
                    operation_type="TRASH",
                    original_path=str(target.resolve()),
                    new_path=str(trash_target.resolve()),
                    file_size=file_size
                )
                
            success_count += 1
            reclaimed_bytes += file_size
            
        except Exception as e:
            failed_count += 1
            errors.append(f"Could not clean {p_str}: {str(e)}")
            
    return CleanupExecuteResponse(
        batch_id=batch_id,
        reclaimed_bytes=reclaimed_bytes,
        reclaimed_formatted=format_size(reclaimed_bytes),
        success_count=success_count,
        failed_count=failed_count,
        errors=errors
    )
