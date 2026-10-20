from pathlib import Path
from backend.app.services.organizer_service import (
    generate_organize_preview,
    execute_organize_batch,
)
from backend.app.services.history_service import (
    get_activity_history,
    undo_batch_operations,
)

def test_history_and_undo_flow(tmp_path):
    f = tmp_path / "resume.pdf"
    f.write_text("my resume details")
    
    # Organize preview and execute
    preview = generate_organize_preview(tmp_path)
    exec_res = execute_organize_batch(tmp_path, preview.planned_moves)
    assert exec_res.success_count == 1
    
    # Target moved to Documents/resume.pdf
    dest = tmp_path / "Documents" / "resume.pdf"
    assert dest.exists()
    assert not f.exists()
    
    # Check history
    history = get_activity_history()
    assert len(history) >= 1
    assert history[0].batch_id == exec_res.batch_id
    
    # Undo batch
    undo_res = undo_batch_operations(exec_res.batch_id)
    assert undo_res.success is True
    assert undo_res.undone_count == 1
    assert f.exists()
    assert not dest.exists()
    assert f.read_text() == "my resume details"

def test_undo_conflict_detection(tmp_path):
    f = tmp_path / "project.py"
    f.write_text("print('version 1')")
    
    preview = generate_organize_preview(tmp_path)
    exec_res = execute_organize_batch(tmp_path, preview.planned_moves)
    assert exec_res.success_count == 1
    
    # Now simulate a conflict: user creates a NEW file at the original path project.py
    f.write_text("print('version 2 - newly created')")
    
    # Attempt undo
    undo_res = undo_batch_operations(exec_res.batch_id)
    assert len(undo_res.conflicts) > 0
    assert "Conflict" in undo_res.conflicts[0]
    # Verify new file was preserved and not clobbered
    assert f.read_text() == "print('version 2 - newly created')"
