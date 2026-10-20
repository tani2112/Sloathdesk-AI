import shutil
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
from ..database.models import (
    HistoryBatchItem,
    FileOperationRow,
    UndoResponse,
)
from ..database.db import (
    get_recent_batches,
    get_operations_for_batch,
    mark_batch_undone,
    mark_operation_undone,
)

def get_activity_history(limit: int = 50) -> List[HistoryBatchItem]:
    raw_batches = get_recent_batches(limit)
    items: List[HistoryBatchItem] = []
    
    for b in raw_batches:
        b_id = b["id"]
        raw_ops = get_operations_for_batch(b_id)
        operations = [
            FileOperationRow(
                id=op["id"],
                batch_id=op["batch_id"],
                operation_type=op["operation_type"],
                original_path=op["original_path"],
                new_path=op["new_path"],
                file_size=op["file_size"],
                timestamp=op["timestamp"],
                undone=op["undone"]
            )
            for op in raw_ops
        ]
        
        dt = datetime.fromtimestamp(b["timestamp"])
        items.append(HistoryBatchItem(
            batch_id=b["id"],
            batch_type=b["batch_type"],
            folder_path=b["folder_path"],
            total_files=b["total_files"],
            description=b["description"] or "",
            timestamp=b["timestamp"],
            timestamp_formatted=dt.strftime('%b %d, %Y %I:%M %p'),
            undone=bool(b["undone"]),
            operations=operations
        ))
        
    return items

def undo_batch_operations(batch_id: str) -> UndoResponse:
    operations = get_operations_for_batch(batch_id)
    if not operations:
        return UndoResponse(
            batch_id=batch_id,
            undone_count=0,
            conflicts=["Batch not found or has no recorded operations."],
            success=False,
            message="No operations to undo."
        )
        
    undone_count = 0
    conflicts: List[str] = []
    
    # Process operations in reverse order
    for op in reversed(operations):
        if op["undone"] == 1:
            continue
            
        op_type = op["operation_type"]
        original = Path(op["original_path"])
        current = Path(op["new_path"])
        
        if op_type == "DELETE":
            conflicts.append(f"Permanent deletion of '{original.name}' cannot be undone.")
            continue
            
        if not current.exists():
            conflicts.append(f"File at '{current.name}' no longer exists; cannot restore to original location.")
            continue
            
        # Conflict check: does something already occupy original_path?
        if original.exists() and original.resolve() != current.resolve():
            conflicts.append(f"Conflict: Original path '{original}' is already occupied by another file.")
            continue
            
        try:
            # Ensure target parent folder exists
            original.parent.mkdir(parents=True, exist_ok=True)
            
            # Restore file
            shutil.move(str(current), str(original))
            mark_operation_undone(op["id"])
            undone_count += 1
        except Exception as e:
            conflicts.append(f"Failed restoring '{current.name}': {str(e)}")
            
    if undone_count > 0:
        mark_batch_undone(batch_id)
        
    success = undone_count > 0 and len(conflicts) == 0
    msg = f"Successfully undone {undone_count} file operation(s)."
    if conflicts:
        msg += f" Encountered {len(conflicts)} conflict(s)."
        
    return UndoResponse(
        batch_id=batch_id,
        undone_count=undone_count,
        conflicts=conflicts,
        success=success,
        message=msg
    )
