import time
from pathlib import Path
from backend.app.services.cleanup_service import (
    find_duplicates,
    scan_cleanup_recommendations,
    execute_cleanup,
)
from backend.app.services.file_scanner import scan_directory

def test_duplicate_detection(tmp_path):
    # Two identical files of exactly 50 bytes
    content1 = b"Identical binary data for duplicate testing 123456"
    f1 = tmp_path / "original.pdf"
    f2 = tmp_path / "copy.pdf"
    f1.write_bytes(content1)
    f2.write_bytes(content1)
    
    # Different file with exact same 50 bytes size
    content2 = b"Different binary data for duplicate testing ABCDEF"
    f3 = tmp_path / "different.pdf"
    f3.write_bytes(content2)
    assert len(content1) == len(content2) == 50
    
    scan_res = scan_directory(tmp_path)
    dup_groups, wasted = find_duplicates(scan_res.files)
    
    assert len(dup_groups) == 1
    assert len(dup_groups[0].files) == 2
    paths = [Path(f.path).name for f in dup_groups[0].files]
    assert "original.pdf" in paths
    assert "copy.pdf" in paths
    assert "different.pdf" not in paths
    assert wasted == len(content1)

def test_safe_trash_cleanup(tmp_path):
    f = tmp_path / "useless.tmp"
    f.write_text("temporary data")
    
    # Safe cleanup (moves to .sloth_trash)
    res = execute_cleanup(tmp_path, [str(f)], delete_permanently=False)
    assert res.success_count == 1
    assert not f.exists()
    assert (tmp_path / ".sloth_trash" / "useless.tmp").exists()
