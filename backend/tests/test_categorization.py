from pathlib import Path
from backend.app.services.file_scanner import scan_directory, get_file_category, format_size
from backend.app.database.models import (
    CATEGORY_DOCUMENTS,
    CATEGORY_IMAGES,
    CATEGORY_VIDEOS,
    CATEGORY_AUDIO,
    CATEGORY_ARCHIVES,
    CATEGORY_CODE,
    CATEGORY_OTHER,
)

def test_get_file_category():
    assert get_file_category(".pdf") == CATEGORY_DOCUMENTS
    assert get_file_category(".DOCX") == CATEGORY_DOCUMENTS
    assert get_file_category(".png") == CATEGORY_IMAGES
    assert get_file_category(".mp4") == CATEGORY_VIDEOS
    assert get_file_category(".mp3") == CATEGORY_AUDIO
    assert get_file_category(".zip") == CATEGORY_ARCHIVES
    assert get_file_category(".py") == CATEGORY_CODE
    assert get_file_category(".unknown_ext_xyz") == CATEGORY_OTHER

def test_scan_empty_directory(tmp_path):
    res = scan_directory(tmp_path)
    assert res.total_files == 0
    assert res.total_bytes == 0
    assert res.files == []

def test_scan_with_files(tmp_path):
    (tmp_path / "notes.txt").write_text("hello world")
    (tmp_path / "photo.jpg").write_bytes(b"\xff\xd8\xff")
    (tmp_path / "script.py").write_text("print('hi')")
    (tmp_path / ".hidden.pdf").write_text("secret")
    (tmp_path / "my assignment 2026 📁.pdf").write_text("college homework")
    
    # Non-hidden scan
    res = scan_directory(tmp_path, include_hidden=False)
    assert res.total_files == 4 # .hidden.pdf excluded
    assert res.categories[CATEGORY_DOCUMENTS].count == 2
    assert res.categories[CATEGORY_IMAGES].count == 1
    assert res.categories[CATEGORY_CODE].count == 1
    
    # Hidden scan
    res_hidden = scan_directory(tmp_path, include_hidden=True)
    assert res_hidden.total_files == 5
