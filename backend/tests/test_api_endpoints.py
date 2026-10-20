import pytest
from starlette.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ai" in data
    assert "stats" in data

def test_folder_defaults():
    response = client.get("/api/folders/defaults")
    assert response.status_code == 200
    data = response.json()
    assert "default_folders" in data
    assert "home_dir" in data

def test_settings_flow():
    # Read settings
    res = client.get("/api/settings")
    assert res.status_code == 200
    data = res.json()
    assert "ollama_url" in data
    assert "selected_model" in data
    
    # Update settings
    update_res = client.post("/api/settings", json={"theme_accent": "teal"})
    assert update_res.status_code == 200
    
    # Verify update
    res2 = client.get("/api/settings")
    assert res2.json()["theme_accent"] == "teal"
