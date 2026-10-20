#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR/frontend"

echo "🦥 Starting SlothDesk AI Frontend on http://127.0.0.1:5173..."

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

npm run dev -- --host 127.0.0.1
