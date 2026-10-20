#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "=========================================================="
echo "🦥  SlothDesk AI — Work less. Let your sloth handle it.  "
echo "=========================================================="

trap 'echo ""; echo "Shutting down SlothDesk AI..."; kill $(jobs -p) 2>/dev/null; exit 0' SIGINT SIGTERM

./scripts/start_backend.sh &
BACKEND_PID=$!

sleep 2

./scripts/start_frontend.sh &
FRONTEND_PID=$!

echo ""
echo "✨ SlothDesk AI is up and running!"
echo "   ➜ Frontend: http://127.0.0.1:5173"
echo "   ➜ Backend:  http://127.0.0.1:8000"
echo "   ➜ API Docs: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C at any time to stop both servers."

wait
