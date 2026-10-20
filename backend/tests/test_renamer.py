import pytest
from pathlib import Path
from backend.app.services.ai_service import heuristic_sanitize_name
from backend.app.services.renamer_service import execute_rename_batch
from backend.app.database.models import RenameProposal

def test_heuristic_rename_sanitization():
    # Removes (1), copy, random hashes, spaces
    raw = "IMG_2026_01_15 (1) [copy] 7f3b8a1c990.png"
    clean_kebab = heuristic_sanitize_name(raw, style="kebab-case")
    assert clean_kebab.endswith(".png")
    assert "(1)" not in clean_kebab
    assert "copy" not in clean_kebab
    
    clean_snake = heuristic_sanitize_name("my rough document notes.pdf", style="snake_case")
    assert clean_snake == "my_rough_document_notes.pdf"
    
    clean_title = heuristic_sanitize_name("quarterly budget report.xlsx", style="Title_Case")
    assert clean_title == "Quarterly_Budget_Report.xlsx"

def test_rename_batch_execution(tmp_path):
    f = tmp_path / "messy-file-name (2).txt"
    f.write_text("sample content")
    
    prop = RenameProposal(
        original_path=str(f),
        original_name=f.name,
        proposed_name="clean-notes.txt",
        proposed_path=str(tmp_path / "clean-notes.txt"),
        reason="Rule cleaned",
        selected=True
    )
    
    res = execute_rename_batch(tmp_path, [prop])
    assert res.success_count == 1
    assert not f.exists()
    assert (tmp_path / "clean-notes.txt").exists()
    assert (tmp_path / "clean-notes.txt").read_text() == "sample content"
