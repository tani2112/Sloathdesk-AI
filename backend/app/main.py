import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Enable CORS for local dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(health.router, prefix="/api")
app.include_router(folders.router, prefix="/api")
app.include_router(scan.router, prefix="/api")
app.include_router(organize.router, prefix="/api")
app.include_router(rename.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(cleanup.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(settings_api.router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "SlothDesk AI",
        "tagline": "Work less. Let your sloth handle the boring stuff.",
        "docs_url": "/docs",
        "status": "online"
    }
