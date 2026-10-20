# SlothDesk AI 🦥

> **“Work less. Let your sloth handle the boring stuff.”**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React + Vite + TypeScript](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TS-61DAFB.svg)](https://vitejs.dev/)
[![Ollama](https://img.shields.io/badge/AI%20Engine-Ollama%20(Local)-white.svg)](https://ollama.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)

SlothDesk AI is a **privacy-first desktop productivity assistant** built for the **“Slow and Steady” open-source AI challenge**. It brings open-weight local AI directly to your operating system to organize messy folders, suggest intelligent filenames based on document excerpts, search files through natural language queries, and prepare safe storage cleanup recommendations.

---

## 🌟 Key Features

### 🗂️ 1. Smart File Organizer
- **Safe Dry-Run Previews:** View an exact interactive preview table of where every file will be placed before anything moves.
- **Categorization Engine:** Groups clutter into `Documents`, `Images`, `Videos`, `Audio`, `Archives`, `Code`, and `Other`.
- **Zero Data Loss Guarantee:** Never overwrites files silently. Automatically resolves filename collisions (e.g. `report (1).pdf`).
- **Safety Boundary Checks:** Prevents path traversal and skips system directories (`/etc`, `/proc`, `node_modules`, `.git`).

### ✍️ 2. AI File Renamer
- **Content-Aware Document Analysis:** Uses local open-weight models (such as Qwen 2.5 or Llama 3.2) to read excerpts from PDFs, markdown, code, and text files.
- **Strict Extension Preservation:** Preserves original file extensions (`.pdf`, `.py`, `.docx`).
- **Multiple Naming Styles:** Switch effortlessly between `kebab-case`, `snake_case`, and `Title_Case`.
- **Interactive Review:** Review side-by-side diffs, view excerpt tooltips, and edit proposed names inline before batch applying.

### 🔍 3. Natural Language File Search
- **Conversational Queries:** Search using everyday language:
  - *“Find my operating systems assignment”*
  - *“Show PDFs I downloaded recently”*
  - *“Find Python files in my folder”*
  - *“Where are my college notes?”*
- **Local Indexing & Content Grep:** Translates queries into structured category, extension, and timeframe filters. Greps inside local document snippets without sending a single byte to the cloud.

### 🧹 4. Lazy Cleanup Assistant
- **Cryptographic Duplicate Detection:** Employs a 3-tier hashing algorithm (File size → 8KB header hash → full SHA-256) for instant, collision-free duplicate identification.
- **Large & Old File Hunter:** Flags files over 50MB, downloads older than 30 days, and broken temporary junk (`.tmp`, `.crdownload`, `.part`).
- **Safe Trash Staging:** Moves items to an isolated `.sloth_trash/` directory instead of destructive permanent removal unless explicitly confirmed.

### ⏪ 5. SQLite Activity History & Rollback Undo
- **Auditable Transaction Log:** Every batch operation is recorded with timestamps and file paths in local SQLite (`~/.slothdesk/slothdesk.db`).
- **Conflict-Protected Undo:** 1-click rollback restores files to their original names and locations while checking whether the original path has been occupied by another file.

### 🦥 6. Lovable Sloth Mascot & Premium UI
- **Animated Sloth Mascot (Barnaby):** Displays interactive states (sleeping, awake, analyzing files with glasses, sipping tea on break, and celebrating cleanups!).
- **Curated Dark Theme:** Dark charcoal/navy canvas (`#0b0f17`), soft purple (`#a855f7`), and calming teal (`#14b8a6`) accents.

---

## 🏛️ Open-Source AI Challenge Architecture

SlothDesk AI was built specifically to demonstrate that **open-weight, local AI is ready for everyday desktop operating systems**:

| Principle | Why It Matters |
| :--- | :--- |
| **100% Local Privacy** | File names, paths, notes, and document contents never leave `127.0.0.1`. No data is ever sent to OpenAI, Anthropic, or cloud providers. |
| **Zero Per-Request Fees** | Cloud AI APIs cost money on every API call. Local inference runs for free on your own hardware. |
| **Offline Independence** | Once dependencies and model weights are downloaded, SlothDesk AI functions without an internet connection. |
| **Model Portability** | Users can switch between ultra-light models (`qwen2.5:1.5b` for older laptops) or larger reasoning models (`qwen2.5:7b`, `llama3.2`) through Settings. |
| **Graceful Heuristic Fallback** | If Ollama is offline or not installed, the entire app falls back to rule-based tokenizers, heuristic cleaners, and SHA-256 hash engines. No fake features. |

---

## 💻 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Python 3.10+ / 3.14, FastAPI, Uvicorn, Pydantic v2
- **Local AI Engine:** Ollama (defaulting to `qwen2.5:1.5b` or `llama3.2:latest`)
- **File System Observer:** Python Watchdog
- **Database:** SQLite 3 (Standard Library)
- **Document Extractors:** `pypdf`, native UTF-8 streaming
- **Communication:** REST API via JSON on `http://127.0.0.1:8000`

---

## 🚀 Quick Setup on Ubuntu Linux

### Prerequisites
- Ubuntu 20.04 LTS / 22.04 LTS / 24.04 LTS or compatible Debian derivative
- Python 3.10+ (tested through Python 3.14)
- Node.js 18+ and npm
- Ollama

### Automated 1-Click Install
Run our setup script:
```bash
chmod +x scripts/install_ubuntu.sh
./scripts/install_ubuntu.sh
```

---

### Manual Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/tani2112/Sloathdesk-AI.git
cd Sloathdesk-AI
```

#### 2. Install & Start Ollama
Install Ollama via the official installation script:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Pull a fast, lightweight open-weight model:
```bash
ollama pull qwen2.5:1.5b
```

Ensure the Ollama service is running:
```bash
ollama serve
# Verify Ollama is reachable:
curl http://localhost:11434/api/tags
```

#### 3. Setup Python Backend
```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```

#### 4. Setup Frontend
```bash
cd frontend
npm install
npm run build # Validates TypeScript & builds production bundle
cd ..
```

---

## 🏃 Running SlothDesk AI

Start both frontend and backend with a single command:
```bash
./scripts/start_all.sh
```

Or start services individually in separate terminals:
```bash
# Terminal 1: Backend
./scripts/start_backend.sh

# Terminal 2: Frontend
./scripts/start_frontend.sh
```

- **Web Application UI:** [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **FastAPI Interactive Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🧪 Testing and Verification

Run the comprehensive pytest test suite covering path security, duplicate detection, dry-run guarantees, and collision safety:
```bash
PYTHONPATH=. ./backend/venv/bin/pytest backend/tests -v
```

All 20 unit, integration, and security tests pass:
```text
backend/tests/test_api_endpoints.py::test_health_endpoint PASSED
backend/tests/test_api_endpoints.py::test_folder_defaults PASSED
backend/tests/test_api_endpoints.py::test_settings_flow PASSED
backend/tests/test_categorization.py::test_get_file_category PASSED
backend/tests/test_categorization.py::test_scan_empty_directory PASSED
backend/tests/test_categorization.py::test_scan_with_files PASSED
backend/tests/test_cleanup_duplicates.py::test_duplicate_detection PASSED
backend/tests/test_cleanup_duplicates.py::test_safe_trash_cleanup PASSED
backend/tests/test_history_undo.py::test_history_and_undo_flow PASSED
backend/tests/test_history_undo.py::test_undo_conflict_detection PASSED
backend/tests/test_organizer.py::test_preview_does_not_modify_files PASSED
backend/tests/test_organizer.py::test_execute_organize_with_collision_safety PASSED
backend/tests/test_path_validator.py::test_normalize_path PASSED
backend/tests/test_path_validator.py::test_system_forbidden_directories PASSED
backend/tests/test_path_validator.py::test_nonexistent_directory PASSED
backend/tests/test_path_validator.py::test_validate_child_file_path_success PASSED
backend/tests/test_path_validator.py::test_path_traversal_prevention PASSED
backend/tests/test_path_validator.py::test_sanitize_filename PASSED
backend/tests/test_renamer.py::test_heuristic_rename_sanitization PASSED
backend/tests/test_renamer.py::test_rename_batch_execution PASSED
============================== 20 passed in 0.73s ==============================
```

---

## 🔒 Security & Safe Operation Principles

1. **Path Traversal Protection:** All input paths are strictly normalized and confined to the selected working folder (`Downloads`, `Documents`, etc.). Relative sequences like `../../` are rejected with HTTP 403.
2. **Forbidden System Paths:** Absolute roots and system folders (`/`, `/bin`, `/etc`, `/usr`, `/proc`, `/sys`) are blocked at the validator layer.
3. **Collision Avoidance:** If a file with the target name exists, SlothDesk AI appends an incremental number (`file (1).pdf`). Silent overwrites are prohibited.
4. **Symlink Isolation:** Resolves target symlinks and rejects any link that escapes the selected directory boundary.
5. **Reversibility:** Every move and rename is recorded in SQLite. The undo engine checks whether original destination paths are clear before reverting.

---

## 📜 Open-Source Licenses

- **SlothDesk AI:** [MIT License](LICENSE)
- **FastAPI / Starlette:** BSD License
- **React:** MIT License
- **Ollama:** MIT License
- **Qwen 2.5:** Apache 2.0 / Qwen Open License
- **Llama 3.2:** Llama 3.2 Community License
- **Watchdog:** Apache 2.0
- **Lucide Icons:** ISC License

---

## 🦥 Contributing & Challenge Submission

SlothDesk AI was created for the **Slow and Steady Open-Source AI Challenge**. Feedback, feature suggestions, and pull requests are welcomed!