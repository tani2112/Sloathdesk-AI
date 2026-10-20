#!/usr/bin/env bash
set -e

echo "=== Building SlothDesk AI for Production / Render ==="

# 1. Install Backend Dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# 2. Build Frontend
echo "Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "=== Build Complete! Frontend bundle ready in frontend/dist ==="
