#!/usr/bin/env bash
set -e

echo "🦥 Installing SlothDesk AI Prerequisites on Ubuntu Linux..."

# 1. System packages
sudo apt update
sudo apt install -y python3 python3-venv python3-pip curl git

# 2. Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 3. Check Ollama
if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama for local open-weight AI inference..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

echo "Pulling recommended lightweight open-weight model (Qwen 2.5 1.5B)..."
ollama pull qwen2.5:1.5b || echo "Could not pull model automatically. Run 'ollama pull qwen2.5:1.5b' once Ollama is started."

# 4. Backend venv
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "Setting up Python virtual environment..."
python3 -m venv backend/venv
./backend/venv/bin/pip install --upgrade pip
./backend/venv/bin/pip install -r backend/requirements.txt

# 5. Frontend dependencies
echo "Installing Node.js packages..."
cd frontend
npm install

echo "✨ All prerequisites installed! Start SlothDesk AI by running: ./scripts/start_all.sh"
