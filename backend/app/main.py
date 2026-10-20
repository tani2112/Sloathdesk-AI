import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .config import settings
from .database.db import init_db
from .services.watchdog_service import watcher_manager
from .api import (
    health,
    folders,
    scan,
    organize,
    rename,
    search,
    cleanup,
    history,
    settings as settings_api,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("slothdesk")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SlothDesk AI database...")
    init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down folder watcher...")
    watcher_manager.stop_watching()
    logger.info("SlothDesk AI backend stopped.")

app = FastAPI(
    title="SlothDesk AI API",
    description="Privacy-First Desktop Productivity Assistant powered by Local AI & Ollama",
    version=settings.version,
    lifespan=lifespan
)

# Enable CORS for local dev server and deployed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(health.router, prefix="/api")
app.include_router(folders.router, prefix="/api")
app.include_router(scan.router, prefix="/api")
app.include_router(organize.router, prefix="/api")
app.include_router(rename.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(cleanup.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(settings_api.router, prefix="/api")

# Check for production frontend build (e.g. on Render or Docker)
dist_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if dist_dir.exists() and (dist_dir / "index.html").exists():
    logger.info(f"Serving production frontend from {dist_dir}")
    if (dist_dir / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api/") or full_path == "api" or full_path.startswith("docs") or full_path == "openapi.json":
            raise HTTPException(status_code=404, detail="Not Found")
            
        target_file = dist_dir / full_path
        if target_file.exists() and target_file.is_file():
            return FileResponse(str(target_file))
        return FileResponse(str(dist_dir / "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": "SlothDesk AI",
            "tagline": "Work less. Let your sloth handle the boring stuff.",
            "docs_url": "/docs",
            "status": "online",
            "frontend": "Dev server on port 5173"
        }
