import re
import json
import httpx
from typing import Optional, List, Dict, Any
from ..config import settings
from ..database.models import OllamaStatusResponse, OllamaModelInfo, SearchFilterParsed
from ..database.db import get_app_setting

def get_current_model() -> str:
    saved = get_app_setting("selected_model")
    return saved if saved else settings.ai_model

def get_current_ollama_url() -> str:
    saved = get_app_setting("ollama_url")
    return saved if saved else settings.ollama_url

def format_bytes_str(size: Optional[int]) -> str:
    if size is None:
        return "Unknown"
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"

async def check_ollama_status() -> OllamaStatusResponse:
    url = get_current_ollama_url()
    selected_model = get_current_model()
    
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"{url}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                models_data = data.get("models", [])
                models: List[OllamaModelInfo] = []
                for m in models_data:
                    details = m.get("details", {})
                    models.append(OllamaModelInfo(
                        name=m.get("name", "unknown"),
                        size=m.get("size"),
                        size_formatted=format_bytes_str(m.get("size")),
                        parameter_size=details.get("parameter_size"),
                        family=details.get("family")
                    ))
                
                # Check if selected model is present, if not pick first available
                model_names = [m.name for m in models]
                active_model = selected_model
                if model_names and selected_model not in model_names:
                    # check if tag match like qwen2.5:1.5b in qwen2.5:1.5b
                    for m_name in model_names:
                        if m_name.startswith(selected_model) or selected_model.startswith(m_name):
                            active_model = m_name
                            break
                    else:
                        active_model = model_names[0]
                
                return OllamaStatusResponse(
                    is_running=True,
                    url=url,
                    available_models=models,
                    selected_model=active_model,
                    active=len(models) > 0,
                    error=None
                )
            else:
                return OllamaStatusResponse(
                    is_running=True,
                    url=url,
                    available_models=[],
                    selected_model=selected_model,
                    active=False,
                    error=f"Ollama returned HTTP status {resp.status_code}"
                )
    except Exception as e:
        return OllamaStatusResponse(
            is_running=False,
            url=url,
            available_models=[],
            selected_model=selected_model,
            active=False,
            error=f"Could not connect to Ollama at {url}: {str(e)}"
        )

async def call_ollama_chat(prompt: str, system_prompt: str = "") -> Optional[str]:
    """
    Calls local Ollama instance with timeout and returns text response.
    Never sends data outside localhost.
    """
    status = await check_ollama_status()
    if not status.is_running or not status.active:
        return None
        
    url = status.url
    model = status.selected_model
    
    payload = {
        "model": model,
        "prompt": f"{system_prompt}\n\n{prompt}" if system_prompt else prompt,
        "stream": False,
        "options": {
            "temperature": 0.2, # Low temperature for structured, reliable output
            "num_predict": 256,
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=settings.ai_timeout_seconds) as client:
            resp = await client.post(f"{url}/api/generate", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("response", "").strip()
    except Exception:
        return None
    return None

def heuristic_sanitize_name(name: str, style: str = "kebab-case") -> str:
    """
    Cleans up noisy filenames when AI is offline or unavailable.
    Removes random hashes, duplicate tags like (1), timestamps, and formats cleanly.
    """
    # Remove extension first
    parts = name.rsplit(".", 1)
    base = parts[0]
    ext = f".{parts[1]}" if len(parts) > 1 else ""
    
    # Remove copy tags like (1), [1], _copy, etc.
    base = re.sub(r'[\(\[\{]\d+[\)\]\}]', '', base)
    base = re.sub(r'(?:[-_]copy|\bcopy\b)', '', base, flags=re.IGNORECASE)
    # Remove long hex hashes (e.g. 7f3b8a1c990)
    base = re.sub(r'[a-f0-9]{8,}', '', base, flags=re.IGNORECASE)
    # Replace separators with spaces
    base = re.sub(r'[_\-\s\.]+', ' ', base).strip()
    
    if not base:
        base = "document"
        
    if style == "snake_case":
        formatted = re.sub(r'\s+', '_', base.lower())
    elif style == "Title_Case":
        formatted = "_".join(word.capitalize() for word in base.split())
    else: # default kebab-case
        formatted = re.sub(r'\s+', '-', base.lower())
        
    return f"{formatted}{ext}"

async def suggest_ai_filename(original_name: str, snippet: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None, style: str = "kebab-case") -> tuple[str, str, bool]:
    """
    Suggests a concise, professional filename based on content snippet or metadata.
    Returns: (suggested_name, reason, was_ai_used)
    """
    # Extract extension
    parts = original_name.rsplit(".", 1)
    ext = f".{parts[1]}" if len(parts) > 1 else ""
    
    system_prompt = (
        "You are SlothDesk AI, an expert file organization assistant. "
        "Your task is to suggest a concise, professional, descriptive filename for a file. "
        "Rules:\n"
        "1. Do NOT change or remove the file extension.\n"
        f"2. Use {style} formatting.\n"
        "3. Output ONLY a valid JSON object: {\"suggested_name\": \"...\", \"reason\": \"...\"}\n"
        "4. Do not include markdown codeblocks or extra conversational text."
    )
    
    prompt = f"Original filename: '{original_name}'\nExtension: '{ext}'\n"
    if snippet:
        # truncate snippet to first 600 chars for speed
        prompt += f"Document content excerpt:\n\"\"\"{snippet[:600]}\"\"\"\n"
    if metadata:
        prompt += f"File metadata:\n{json.dumps(metadata)}\n"
        
    ai_resp = await call_ollama_chat(prompt, system_prompt)
    if ai_resp:
        try:
            # Clean possible markdown block
            clean_json = re.sub(r'^```json\s*|\s*```$', '', ai_resp.strip(), flags=re.MULTILINE).strip()
            data = json.loads(clean_json)
            s_name = data.get("suggested_name", "").strip()
            reason = data.get("reason", "Suggested by local AI based on document contents")
            if s_name:
                # Guarantee original extension is preserved
                if ext and not s_name.lower().endswith(ext.lower()):
                    s_name = f"{s_name.rsplit('.', 1)[0] if '.' in s_name else s_name}{ext}"
                return s_name, reason, True
        except Exception:
            pass
            
    # Fallback heuristic
    fallback = heuristic_sanitize_name(original_name, style)
    return fallback, "Cleaned filename using rule-based heuristics", False

async def parse_natural_language_search(query: str) -> SearchFilterParsed:
    """
    Interprets natural language queries like:
    - 'Find my operating systems assignment'
    - 'Show PDFs I downloaded recently'
    - 'Find Python files in my project folder'
    Uses Ollama when available, falls back to regex parser.
    """
    system_prompt = (
        "You are SlothDesk AI file search query parser. "
        "Extract search filters from the user query into a JSON object with fields:\n"
        "- keywords: list of search terms (e.g. ['operating systems', 'assignment'])\n"
        "- extensions: list of file extensions without dot (e.g. ['pdf', 'py'])\n"
        "- categories: list from ['Documents', 'Images', 'Videos', 'Audio', 'Archives', 'Code']\n"
        "- date_filter: 'today' | 'recent' | 'last_week' | 'last_month' | null\n"
        "- min_size_mb: number or null\n"
        "- ai_interpretation: short explanation\n"
        "Output ONLY raw JSON."
    )
    
    ai_resp = await call_ollama_chat(f"User search query: '{query}'", system_prompt)
    if ai_resp:
        try:
            clean_json = re.sub(r'^```json\s*|\s*```$', '', ai_resp.strip(), flags=re.MULTILINE).strip()
            data = json.loads(clean_json)
            return SearchFilterParsed(
                keywords=data.get("keywords", []),
                extensions=[e.lstrip(".").lower() for e in data.get("extensions", [])],
                categories=data.get("categories", []),
                date_filter=data.get("date_filter"),
                min_size_mb=data.get("min_size_mb"),
                max_size_mb=data.get("max_size_mb"),
                ai_interpretation=data.get("ai_interpretation", "Parsed with local Ollama")
            )
        except Exception:
            pass
            
    # Offline Fallback Parser
    keywords: List[str] = []
    extensions: List[str] = []
    categories: List[str] = []
    date_filter: Optional[str] = None
    
    q_lower = query.lower()
    
    # Extension heuristics
    ext_matches = re.findall(r'\b(pdf|docx?|xlsx?|pptx?|txt|csv|png|jpe?g|svg|mp4|mov|mp3|wav|zip|tar|gz|py|js|ts|html|css|json|md)\b', q_lower)
    for ext in ext_matches:
        extensions.append(ext)
        
    # Category heuristics
    if any(w in q_lower for w in ["document", "docs", "notes", "assignment", "paper", "report"]):
        categories.append("Documents")
    if any(w in q_lower for w in ["photo", "image", "picture", "screenshot", "pic"]):
        categories.append("Images")
    if any(w in q_lower for w in ["video", "movie", "clip", "recording"]):
        categories.append("Videos")
    if any(w in q_lower for w in ["audio", "song", "music", "podcast"]):
        categories.append("Audio")
    if any(w in q_lower for w in ["code", "script", "program", "python", "javascript", "react"]):
        categories.append("Code")
    if any(w in q_lower for w in ["zip", "archive", "compressed", "tar"]):
        categories.append("Archives")
        
    # Date heuristics
    if "today" in q_lower:
        date_filter = "today"
    elif any(w in q_lower for w in ["recent", "recently", "latest"]):
        date_filter = "recent"
    elif "week" in q_lower:
        date_filter = "last_week"
    elif "month" in q_lower:
        date_filter = "last_month"
        
    # Stop words extraction for keywords
    stop_words = {"find", "my", "show", "me", "get", "where", "are", "is", "the", "files", "file", "downloaded", "in", "folder", "all", "recently"}
    words = re.findall(r'[a-zA-Z0-9_\-]+', query)
    cleaned_keywords = [w for w in words if w.lower() not in stop_words and w.lower() not in extensions]
    if cleaned_keywords:
        keywords = cleaned_keywords
    elif not extensions and not categories:
        keywords = [query.strip()]
        
    return SearchFilterParsed(
        keywords=keywords,
        extensions=list(set(extensions)),
        categories=list(set(categories)),
        date_filter=date_filter,
        ai_interpretation="Parsed using offline rule-based parser"
    )
