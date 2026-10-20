#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "🦥 Starting SlothDesk AI Backend on http://127.0.0.1:8000..."

if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install --upgrade pip
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

PYTHONPATH=. ./backend/venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
