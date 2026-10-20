import uuid
import shutil
from pathlib import Path
from typing import List, Dict, Optional
from ..database.models import (
    PlannedMove,
    OrganizePreviewResponse,
    OrganizeExecuteResponse,
    FileItem,
)
from ..database.db import record_batch, record_operation
from ..security.path_validator import validate_folder_access, validate_child_file_path
from .file_scanner import scan_directory, get_file_category

def get_safe_destination(target_dir: Path, filename: str) -> tuple[Path, bool]:
    """
    Finds a safe destination path that avoids overwriting existing files.
    If 'report.pdf' exists, tries 'report (1).pdf', 'report (2).pdf', etc.
    Returns: (safe_path, was_conflict_resolved)
    """
    dest = target_dir / filename
    if not dest.exists():
        return dest, False
        
    parts = filename.rsplit('.', 1)
    base = parts[0]
    ext = f".{parts[1]}" if len(parts) > 1 else ""
    
    counter = 1
    while True:
        candidate_name = f"{base} ({counter}){ext}"
        candidate_path = target_dir / candidate_name
        if not candidate_path.exists():
            return candidate_path, True
        counter += 1

def generate_organize_preview(
    folder_path: Path,
    custom_rules: Optional[Dict[str, str]] = None,
    use_ai: bool = False
) -> OrganizePreviewResponse:
    # Scan files in the target directory (non-recursive to organize top-level files)
    scan_res = scan_directory(folder_path, recursive=False, include_hidden=False)
    
    planned_moves: List[PlannedMove] = []
    affected_categories = set()
    
    # We will simulate destination folder contents to detect intra-batch conflicts
    simulated_destinations: set[str] = set()
    
    for f in scan_res.files:
        category = f.category
        if custom_rules and f.extension in custom_rules:
            category = custom_rules[f.extension]
            
        target_dir = folder_path / category
        
        # Check safe target name
        src_path = Path(f.path)
        base_dest = target_dir / src_path.name
        
        # Conflict detection against filesystem + simulated batch
        conflict_resolved = False
        target_name = src_path.name
        candidate_dest = base_dest
        
        if candidate_dest.exists() or str(candidate_dest) in simulated_destinations:
            conflict_resolved = True
            parts = src_path.name.rsplit('.', 1)
            b = parts[0]
            ext = f".{parts[1]}" if len(parts) > 1 else ""
            counter = 1
            while True:
                new_name = f"{b} ({counter}){ext}"
                cand = target_dir / new_name
                if not cand.exists() and str(cand) not in simulated_destinations:
                    target_name = new_name
                    candidate_dest = cand
                    break
                counter += 1
                
        simulated_destinations.add(str(candidate_dest))
        affected_categories.add(category)
        
        planned_moves.append(PlannedMove(
            source_path=str(src_path.resolve()),
            source_filename=src_path.name,
            target_folder=category,
            target_path=str(candidate_dest.resolve()),
            target_filename=target_name,
            category=category,
            size_bytes=f.size_bytes,
            conflict_resolved=conflict_resolved,
            reason=f"Categorized as {category} based on extension {f.extension}"
        ))
        
    return OrganizePreviewResponse(
        folder_path=str(folder_path.resolve()),
        total_files=len(planned_moves),
        planned_moves=planned_moves,
        affected_categories=sorted(list(affected_categories))
    )

def execute_organize_batch(
    folder_path: Path,
    moves: List[PlannedMove],
    batch_description: str = "Organized files by category"
) -> OrganizeExecuteResponse:
    batch_id = f"batch_org_{uuid.uuid4().hex[:10]}"
    success_count = 0
    failed_count = 0
    errors: List[str] = []
    
    # Record batch entry
    record_batch(
        batch_id=batch_id,
        batch_type="ORGANIZE",
        folder_path=str(folder_path.resolve()),
        total_files=len(moves),
        description=batch_description
    )
    
    for move in moves:
        try:
            # Security checks: ensure both source and target are inside folder_path
            src = validate_child_file_path(folder_path, move.source_path)
            dest = validate_child_file_path(folder_path, move.target_path)
            
            if not src.exists():
                failed_count += 1
                errors.append(f"Source file not found: {src.name}")
                continue
                
            # If target already exists at runtime, resolve collision
            final_dest = dest
            if final_dest.exists() and final_dest.resolve() != src.resolve():
                final_dest, _ = get_safe_destination(final_dest.parent, final_dest.name)
                
            # Ensure target parent directory exists
            final_dest.parent.mkdir(parents=True, exist_ok=True)
            
            # Execute move
            shutil.move(str(src), str(final_dest))
            
            # Record operation in DB for undo
            record_operation(
                batch_id=batch_id,
                operation_type="MOVE",
                original_path=str(src.resolve()),
                new_path=str(final_dest.resolve()),
                file_size=move.size_bytes
            )
            success_count += 1
            
        except Exception as e:
            failed_count += 1
            errors.append(f"Failed to move {move.source_filename}: {str(e)}")
            
    return OrganizeExecuteResponse(
        batch_id=batch_id,
        success_count=success_count,
        failed_count=failed_count,
        errors=errors
    )
