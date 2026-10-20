import pytest
from pathlib import Path
from fastapi import HTTPException
from backend.app.security.path_validator import (
    validate_folder_access,
    validate_child_file_path,
    sanitize_filename,
    normalize_path,
)

def test_normalize_path(tmp_path):
    p = normalize_path(str(tmp_path))
    assert p == tmp_path.resolve()
    
    with pytest.raises(HTTPException):
        normalize_path("")

def test_system_forbidden_directories():
    for forbidden in ["/", "/etc", "/sys", "/proc", "/root", "/boot"]:
        with pytest.raises(HTTPException) as exc:
            validate_folder_access(forbidden)
        assert exc.value.status_code == 403

def test_nonexistent_directory(tmp_path):
    nonexistent = tmp_path / "does_not_exist_12345"
    with pytest.raises(HTTPException) as exc:
        validate_folder_access(str(nonexistent))
    assert exc.value.status_code == 404

def test_validate_child_file_path_success(tmp_path):
    child = tmp_path / "documents" / "test file.pdf"
    child.parent.mkdir()
    child.write_text("sample content")
    
    valid = validate_child_file_path(tmp_path, str(child))
    assert valid == child.resolve()

def test_path_traversal_prevention(tmp_path):
    traversal_path = str(tmp_path / ".." / ".." / "etc" / "passwd")
    with pytest.raises(HTTPException) as exc:
        validate_child_file_path(tmp_path, traversal_path)
    assert exc.value.status_code == 403

def test_sanitize_filename():
    assert sanitize_filename("bad/name\\test.txt") == "bad_name_test.txt"
    assert sanitize_filename("null\0byte.pdf") == "nullbyte.pdf"
    assert sanitize_filename("   spaced  name  .txt   ") == "spaced  name  .txt"
    assert sanitize_filename("...hidden...") == "hidden"
    assert sanitize_filename("normal_file.png") == "normal_file.png"
    # Unicode and spaces
    assert sanitize_filename("Résumé 2026.docx") == "Résumé 2026.docx"
