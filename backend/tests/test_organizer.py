from pathlib import Path
from backend.app.services.organizer_service import (
    generate_organize_preview,
    execute_organize_batch,
    get_safe_destination,
)

def test_preview_does_not_modify_files(tmp_path):
    f1 = tmp_path / "thesis.pdf"
    f1.write_text("my thesis")
    
    preview = generate_organize_preview(tmp_path)
    assert preview.total_files == 1
    assert preview.planned_moves[0].target_folder == "Documents"
    assert f1.exists(), "Original file must still exist after preview!"
    assert not (tmp_path / "Documents" / "thesis.pdf").exists()

def test_execute_organize_with_collision_safety(tmp_path):
    f1 = tmp_path / "report.pdf"
    f1.write_text("first report")
    
    # Pre-create Documents/report.pdf to force a collision
    docs_dir = tmp_path / "Documents"
    docs_dir.mkdir()
    existing = docs_dir / "report.pdf"
    existing.write_text("existing file")
    
    preview = generate_organize_preview(tmp_path)
    assert len(preview.planned_moves) == 1
    # Check that collision is detected
    assert preview.planned_moves[0].conflict_resolved is True
    assert preview.planned_moves[0].target_filename == "report (1).pdf"
    
    # Execute batch
    result = execute_organize_batch(tmp_path, preview.planned_moves)
    assert result.success_count == 1
    assert result.failed_count == 0
    assert existing.read_text() == "existing file", "Existing file must NEVER be overwritten!"
    assert (docs_dir / "report (1).pdf").read_text() == "first report"
