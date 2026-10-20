import pytest
import tempfile
from pathlib import Path
from backend.app.config import settings
from backend.app.database.db import init_db

@pytest.fixture(autouse=True)
def setup_test_environment(monkeypatch):
    # Create a separate isolated temp directory just for the db
    temp_dir = tempfile.mkdtemp()
    test_db = Path(temp_dir) / "test_slothdesk.db"
    monkeypatch.setattr(settings, "db_path", test_db)
    init_db()
    yield
