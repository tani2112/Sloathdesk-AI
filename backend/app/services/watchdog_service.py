import time
import logging
from pathlib import Path
from typing import Optional, Callable
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent

logger = logging.getLogger(__name__)

class SlothFolderHandler(FileSystemEventHandler):
    def __init__(self, callback: Optional[Callable[[str, str], None]] = None):
        super().__init__()
        self.callback = callback
        self.last_event_time = 0.0

    def on_any_event(self, event: FileSystemEvent):
        # Debounce quick repetitive events
        now = time.time()
        if now - self.last_event_time < 0.5:
            return
        self.last_event_time = now
        
        # Ignore trash / hidden
        if ".sloth_trash" in event.src_path:
            return
            
        if self.callback:
            try:
                self.callback(event.event_type, event.src_path)
            except Exception as e:
                logger.error(f"Error in watchdog callback: {e}")

class FolderWatcherManager:
    def __init__(self):
        self.observer: Optional[Observer] = None
        self.current_watched_folder: Optional[str] = None
        self.change_counter = 0

    def start_watching(self, folder_path: str):
        p = Path(folder_path)
        if not p.exists() or not p.is_dir():
            return
            
        if self.current_watched_folder == str(p.resolve()) and self.observer and self.observer.is_alive():
            return
            
        self.stop_watching()
        
        try:
            self.observer = Observer()
            handler = SlothFolderHandler(callback=self._on_change)
            self.observer.schedule(handler, str(p.resolve()), recursive=False)
            self.observer.start()
            self.current_watched_folder = str(p.resolve())
            logger.info(f"Watchdog started watching: {self.current_watched_folder}")
        except Exception as e:
            logger.warning(f"Could not start watchdog observer on {folder_path}: {e}")

    def _on_change(self, event_type: str, src_path: str):
        self.change_counter += 1

    def stop_watching(self):
        if self.observer and self.observer.is_alive():
            try:
                self.observer.stop()
                self.observer.join(timeout=1.0)
            except Exception:
                pass
        self.observer = None
        self.current_watched_folder = None

watcher_manager = FolderWatcherManager()
