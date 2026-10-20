import sqlite3
import time
from typing import Optional, List, Dict, Any
from pathlib import Path
from ..config import settings

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(settings.db_path))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        batch_type TEXT NOT NULL,
        folder_path TEXT NOT NULL,
        total_files INTEGER NOT NULL,
        description TEXT,
        timestamp REAL NOT NULL,
        undone INTEGER DEFAULT 0
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS file_operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id TEXT NOT NULL,
        operation_type TEXT NOT NULL,
        original_path TEXT NOT NULL,
        new_path TEXT NOT NULL,
        file_hash TEXT,
        file_size INTEGER DEFAULT 0,
        timestamp REAL NOT NULL,
        undone INTEGER DEFAULT 0,
        FOREIGN KEY (batch_id) REFERENCES batches(id)
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

def record_batch(batch_id: str, batch_type: str, folder_path: str, total_files: int, description: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO batches (id, batch_type, folder_path, total_files, description, timestamp, undone) VALUES (?, ?, ?, ?, ?, ?, 0)",
        (batch_id, batch_type, folder_path, total_files, description, time.time())
    )
    conn.commit()
    conn.close()

def record_operation(batch_id: str, operation_type: str, original_path: str, new_path: str, file_hash: str = "", file_size: int = 0):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO file_operations (batch_id, operation_type, original_path, new_path, file_hash, file_size, timestamp, undone) VALUES (?, ?, ?, ?, ?, ?, ?, 0)",
        (batch_id, operation_type, original_path, new_path, file_hash, file_size, time.time())
    )
    conn.commit()
    conn.close()

def get_recent_batches(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, batch_type, folder_path, total_files, description, timestamp, undone FROM batches ORDER BY timestamp DESC LIMIT ?",
        (limit,)
    )
    rows = cursor.fetchall()
    result = []
    for r in rows:
        result.append(dict(r))
    conn.close()
    return result

def get_operations_for_batch(batch_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, batch_id, operation_type, original_path, new_path, file_hash, file_size, timestamp, undone FROM file_operations WHERE batch_id = ? ORDER BY id ASC",
        (batch_id,)
    )
    rows = cursor.fetchall()
    result = [dict(r) for r in rows]
    conn.close()
    return result

def mark_operation_undone(op_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE file_operations SET undone = 1 WHERE id = ?", (op_id,))
    conn.commit()
    conn.close()

def mark_batch_undone(batch_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE batches SET undone = 1 WHERE id = ?", (batch_id,))
    cursor.execute("UPDATE file_operations SET undone = 1 WHERE batch_id = ?", (batch_id,))
    conn.commit()
    conn.close()

def get_app_setting(key: str, default: Optional[str] = None) -> Optional[str]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM app_settings WHERE key = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    return row["value"] if row else default

def set_app_setting(key: str, value: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()

def get_total_organized_count() -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM file_operations WHERE undone = 0 AND operation_type = 'MOVE'")
    row = cursor.fetchone()
    count = row["count"] if row else 0
    conn.close()
    return count
