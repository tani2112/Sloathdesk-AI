import time
from pathlib import Path
from typing import List, Optional
from datetime import datetime
from ..database.models import (
    SearchRequest,
    SearchResponse,
    SearchResultItem,
    SearchFilterParsed,
)
from .ai_service import parse_natural_language_search
from .file_scanner import scan_directory, format_size, get_file_category
from .renamer_service import extract_text_snippet

def matches_date_filter(mtime: float, date_filter: Optional[str]) -> bool:
    if not date_filter:
        return True
    now = time.time()
    diff_seconds = now - mtime
    if date_filter == "today":
        return diff_seconds <= 86400
    elif date_filter in ("recent", "last_week"):
        return diff_seconds <= 7 * 86400
    elif date_filter == "last_month":
        return diff_seconds <= 30 * 86400
    return True

async def execute_natural_language_search(
    folder_path: Path,
    query: str,
    search_content: bool = True,
    use_ai: bool = True
) -> SearchResponse:
    # 1. Parse natural language query into structured filters
    parsed_filters: SearchFilterParsed = await parse_natural_language_search(query)
    
    # 2. Scan directory recursively for candidate files
    scan_res = scan_directory(folder_path, recursive=True, include_hidden=False, max_files=1000)
    
    results: List[SearchResultItem] = []
    
    keywords_lower = [k.lower() for k in parsed_filters.keywords if k]
    exts_lower = [e.lower() for e in parsed_filters.extensions if e]
    cats_lower = [c.lower() for c in parsed_filters.categories if c]
    
    for f in scan_res.files:
        file_path = Path(f.path)
        name_lower = f.name.lower()
        file_ext = f.extension.lstrip('.').lower()
        file_cat = f.category.lower()
        
        # Extension filter check
        if exts_lower and file_ext not in exts_lower:
            continue
            
        # Category filter check
        if cats_lower and file_cat not in cats_lower:
            continue
            
        # Date filter check
        if not matches_date_filter(f.modified_timestamp, parsed_filters.date_filter):
            continue
            
        # Size filters
        size_mb = f.size_bytes / (1024 * 1024)
        if parsed_filters.min_size_mb and size_mb < parsed_filters.min_size_mb:
            continue
        if parsed_filters.max_size_mb and size_mb > parsed_filters.max_size_mb:
            continue
            
        match_type = "filename"
        snippet = None
        relevance = 0.5
        
        # Match keywords in filename
        matched_kw_count = 0
        if keywords_lower:
            for kw in keywords_lower:
                if kw in name_lower:
                    matched_kw_count += 1
            if matched_kw_count > 0:
                relevance = 1.0 + (matched_kw_count * 0.5)
                match_type = "filename"
                
        # If no filename keyword match and content search enabled, search file text
        if keywords_lower and matched_kw_count == 0:
            if search_content and f.size_bytes < 5 * 1024 * 1024: # max 5MB for text grep
                content_text = extract_text_snippet(file_path, max_chars=3000)
                if content_text:
                    content_lower = content_text.lower()
                    for kw in keywords_lower:
                        idx = content_lower.find(kw)
                        if idx != -1:
                            start_idx = max(0, idx - 40)
                            end_idx = min(len(content_text), idx + len(kw) + 60)
                            snippet = f"...{content_text[start_idx:end_idx]}..."
                            relevance = 0.8
                            match_type = "content"
                            break
                            
            if relevance == 0.5: # neither filename nor content matched any keyword
                continue
        elif not keywords_lower:
            # Query was pure filter like "Show PDFs"
            relevance = 0.9
            
        results.append(SearchResultItem(
            name=f.name,
            path=f.path,
            size_formatted=f.size_formatted,
            modified_formatted=f.modified_formatted,
            category=f.category,
            snippet=snippet,
            match_type=match_type,
            relevance_score=relevance
        ))
        
    # Sort results by relevance descending, then modified date descending
    results.sort(key=lambda r: (r.relevance_score, r.name), reverse=True)
    
    return SearchResponse(
        query=query,
        folder_path=str(folder_path.resolve()),
        parsed_filters=parsed_filters,
        total_results=len(results),
        results=results[:100] # return top 100
    )
