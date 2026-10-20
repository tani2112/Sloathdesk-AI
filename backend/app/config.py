import os
from pathlib import Path
from pydantic import BaseModel

class AppSettings(BaseModel):
    app_name: str = "SlothDesk AI"
    version: str = "1.0.0"
    ollama_url: str = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
    ai_model: str = os.getenv("SLOTH_AI_MODEL", "qwen2.5:1.5b")
    ai_timeout_seconds: float = float(os.getenv("AI_TIMEOUT", "20.0"))
    db_path: Path = Path(os.getenv("SLOTHDESK_DB_PATH", Path.home() / ".slothdesk" / "slothdesk.db"))
    
    # Safe folders allowed by default: User's home subfolders
    default_allowed_roots: list[str] = [
        str(Path.home() / "Downloads"),
        str(Path.home() / "Documents"),
        str(Path.home() / "Desktop"),
        str(Path.home() / "Pictures"),
        str(Path.home() / "Videos"),
        str(Path.home() / "Music"),
    ]

settings = AppSettings()

# Ensure ~/.slothdesk directory exists
settings.db_path.parent.mkdir(parents=True, exist_ok=True)
