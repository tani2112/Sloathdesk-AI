import os
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any
from pypdf import PdfReader
from ..database.models import (
    RenameProposal,
    RenamePreviewResponse,
    RenameExecuteResponse,
)
from ..database.db import record_batch, record_operation
from ..security.path_validator import validate_folder_access, validate_child_file_path, sanitize_filename
from .ai_service import suggest_ai_filename, check_ollama_status
from .file_scanner import scan_directory, format_size

def extract_text_snippet(file_path: Path, max_chars: int = 1000) -> Optional[str]:
    """
    Extracts leading text preview from document or code files.
    """
    suffix = file_path.suffix.lower()
    
    # PDF extraction
    if suffix == '.pdf':
        try:
            reader = PdfReader(str(file_path))
            text = ""
            for i in range(min(2, len(reader.pages))):
                page_text = reader.pages[i].extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()[:max_chars] if text.strip() else None
        except Exception:
            return None
            
    # Plain text / code / markup / json / csv
    text_extensions = {
        '.txt', '.md', '.py', '.js', '.ts', '.html', '.css', '.json', '.csv', 
        '.sh', '.yaml', '.yml', '.rst', '.log', '.xml', '.sql', '.rtf'
    }
    if suffix in text_extensions:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read(max_chars)
                return content.strip() if content.strip() else None
        except Exception:
            return None
            
    return None

def extract_basic_metadata(file_path: Path) -> Dict[str, Any]:
    try:
        stat = file_path.stat()
        return {
            "size_bytes": stat.st_size,
            "size_formatted": format_size(stat.st_size),
            "modified": stat.st_mtime,
            "extension": file_path.suffix,
        }
    except Exception:
        return {}

async def generate_rename_proposals(
    folder_path: Path,
    file_paths: Optional[List[str]] = None,
    use_ai: bool = True,
    naming_style: str = "kebab-case"
) -> RenamePreviewResponse:
    # If file_paths is not provided, pick top-level non-hidden files in folder
    target_files: List[Path] = []
    if file_paths:
        for p in file_paths:
            try:
                valid_path = validate_child_file_path(folder_path, p)
                if valid_path.is_file():
                    target_files.append(valid_path)
            except Exception:
                continue
    else:
        for item in folder_path.iterdir():
            if item.is_file() and not item.name.startswith('.'):
                target_files.append(item)
                
    # Sort files
    target_files.sort(key=lambda p: p.name.lower())
    
    # Check Ollama status
    ai_status = await check_ollama_status()
    can_use_ai = use_ai and ai_status.is_running and ai_status.active
    
    proposals: List[RenameProposal] = []
    used_destinations: set[str] = set()
    
    for file_path in target_files:
        snippet = extract_text_snippet(file_path)
        metadata = extract_basic_metadata(file_path)
        
        # Suggest filename
        suggested_name, reason, was_ai = await suggest_ai_filename(
            original_name=file_path.name,
            snippet=snippet,
            metadata=metadata,
            style=naming_style
        )
        
        # Sanitize suggestion
        suggested_name = sanitize_filename(suggested_name)
        
        # Ensure original extension is preserved
        orig_ext = file_path.suffix
        if orig_ext and not suggested_name.lower().endswith(orig_ext.lower()):
            clean_base = suggested_name.rsplit('.', 1)[0] if '.' in suggested_name else suggested_name
            suggested_name = f"{clean_base}{orig_ext}"
            
        # Avoid collisions
        target_path = file_path.parent / suggested_name
        counter = 1
        base = suggested_name.rsplit('.', 1)[0]
        while (target_path.exists() and target_path != file_path) or str(target_path) in used_destinations:
            suggested_name = f"{base}-{counter}{orig_ext}"
            target_path = file_path.parent / suggested_name
            counter += 1
            
        used_destinations.add(str(target_path))
        
        proposals.append(RenameProposal(
            original_path=str(file_path.resolve()),
            original_name=file_path.name,
            proposed_name=suggested_name,
            proposed_path=str(target_path.resolve()),
            confidence=0.95 if was_ai else 0.75,
            reason=reason,
            selected=True,
            preview_snippet=snippet[:120] if snippet else None
        ))
        
    return RenamePreviewResponse(
        proposals=proposals,
        ai_used=can_use_ai
    )

def execute_rename_batch(
    folder_path: Path,
    proposals: List[RenameProposal]
) -> RenameExecuteResponse:
    batch_id = f"batch_ren_{uuid.uuid4().hex[:10]}"
    success_count = 0
    failed_count = 0
    errors: List[str] = []
    
    selected_proposals = [p for p in proposals if p.selected]
    
    record_batch(
        batch_id=batch_id,
        batch_type="RENAME",
        folder_path=str(folder_path.resolve()),
        total_files=len(selected_proposals),
        description="Renamed files with AI suggestions"
    )
    
    for item in selected_proposals:
        # If name didn't change, skip
        if item.original_name == item.proposed_name:
            continue
            
        try:
            src = validate_child_file_path(folder_path, item.original_path)
            dest = validate_child_file_path(folder_path, item.proposed_path)
            
            if not src.exists():
                failed_count += 1
                errors.append(f"File not found: {item.original_name}")
                continue
                
            # If target already exists and isn't the same file, avoid collision
            if dest.exists() and dest.resolve() != src.resolve():
                base = item.proposed_name.rsplit('.', 1)[0]
                ext = src.suffix
                c = 1
                while dest.exists():
                    dest = dest.parent / f"{base}-{c}{ext}"
                    c += 1
                    
            # Rename file
            src.rename(dest)
            
            # Record operation for undo
            stat = dest.stat()
            record_operation(
                batch_id=batch_id,
                operation_type="RENAME",
                original_path=str(src.resolve()),
                new_path=str(dest.resolve()),
                file_size=stat.st_size
            )
            success_count += 1
            
        except Exception as e:
            failed_count += 1
            errors.append(f"Failed to rename {item.original_name}: {str(e)}")
            
    return RenameExecuteResponse(
        batch_id=batch_id,
        success_count=success_count,
        failed_count=failed_count,
        errors=errors
    )
