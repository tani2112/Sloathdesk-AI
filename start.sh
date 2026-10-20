#!/usr/bin/env bash
set -e

PORT="${PORT:-8000}"
echo "🦥 Starting SlothDesk AI on 0.0.0.0:${PORT}..."

exec uvicorn backend.app.main:app --host 0.0.0.0 --port "${PORT}"
