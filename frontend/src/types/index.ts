export interface FileItem {
  name: string;
  path: string;
  size_bytes: number;
  size_formatted: string;
  extension: string;
  category: string;
  modified_timestamp: number;
  modified_formatted: string;
  is_hidden: boolean;
}

export interface CategorySummary {
  category: string;
  count: number;
  total_bytes: number;
  total_size_formatted: string;
}

export interface ScanResponse {
  folder_path: string;
  total_files: number;
  total_bytes: number;
  total_size_formatted: string;
  categories: Record<string, CategorySummary>;
  files: FileItem[];
}

export interface PlannedMove {
  source_path: string;
  source_filename: string;
  target_folder: string;
  target_path: string;
  target_filename: string;
  category: string;
  size_bytes: number;
  conflict_resolved: boolean;
  reason?: string;
}

export interface OrganizePreviewResponse {
  folder_path: string;
  total_files: number;
  planned_moves: PlannedMove[];
  affected_categories: string[];
}

export interface OrganizeExecuteResponse {
  batch_id: string;
  success_count: number;
  failed_count: number;
  errors: string[];
}

export interface RenameProposal {
  original_path: string;
  original_name: string;
  proposed_name: string;
  proposed_path: string;
  confidence: number;
  reason: string;
  selected: boolean;
  preview_snippet?: string;
}

export interface RenamePreviewResponse {
  proposals: RenameProposal[];
  ai_used: boolean;
}

export interface RenameExecuteResponse {
  batch_id: string;
  success_count: number;
  failed_count: number;
  errors: string[];
}

export interface SearchFilterParsed {
  keywords: string[];
  extensions: string[];
  categories: string[];
  date_filter?: string | null;
  min_size_mb?: number | null;
  max_size_mb?: number | null;
  ai_interpretation?: string | null;
}

export interface SearchResultItem {
  name: string;
  path: string;
  size_formatted: string;
  modified_formatted: string;
  category: string;
  snippet?: string | null;
  match_type: string;
  relevance_score: number;
}

export interface SearchResponse {
  query: string;
  folder_path: string;
  parsed_filters: SearchFilterParsed;
  total_results: number;
  results: SearchResultItem[];
}

export interface DuplicateGroup {
  file_hash: string;
  size_bytes: number;
  size_formatted: string;
  files: FileItem[];
}

export interface CleanupScanResponse {
  folder_path: string;
  duplicate_groups: DuplicateGroup[];
  total_duplicate_wasted_bytes: number;
  total_duplicate_wasted_formatted: string;
  large_files: FileItem[];
  old_files: FileItem[];
  temp_files: FileItem[];
  empty_folders: string[];
}

export interface CleanupExecuteResponse {
  batch_id: string;
  reclaimed_bytes: number;
  reclaimed_formatted: string;
  success_count: number;
  failed_count: number;
  errors: string[];
}

export interface FileOperationRow {
  id: number;
  batch_id: string;
  operation_type: string;
  original_path: string;
  new_path: string;
  file_size: number;
  timestamp: number;
  undone: number;
}

export interface HistoryBatchItem {
  batch_id: string;
  batch_type: string;
  folder_path: string;
  total_files: number;
  description: string;
  timestamp: number;
  timestamp_formatted: string;
  undone: boolean;
  operations: FileOperationRow[];
}

export interface UndoResponse {
  batch_id: string;
  undone_count: number;
  conflicts: string[];
  success: boolean;
  message: string;
}

export interface OllamaModelInfo {
  name: string;
  size?: number;
  size_formatted?: string;
  parameter_size?: string;
  family?: string;
}

export interface OllamaStatusResponse {
  is_running: boolean;
  url: string;
  available_models: OllamaModelInfo[];
  selected_model: string;
  active: boolean;
  error?: string | null;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  ai: {
    is_running: boolean;
    active: boolean;
    selected_model: string;
    models_available: number;
    url: string;
    error?: string | null;
  };
  stats: {
    total_organized_files: number;
  };
}

export interface SystemSettings {
  ollama_url: string;
  selected_model: string;
  ai_timeout_seconds: number;
  allowed_folders: string[];
  theme_accent: string;
  ai_status?: OllamaStatusResponse;
}
