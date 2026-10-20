import {
  HealthResponse,
  OllamaStatusResponse,
  ScanResponse,
  OrganizePreviewResponse,
  OrganizeExecuteResponse,
  RenamePreviewResponse,
  RenameExecuteResponse,
  SearchResponse,
  CleanupScanResponse,
  CleanupExecuteResponse,
  HistoryBatchItem,
  UndoResponse,
  SystemSettings,
  PlannedMove,
  RenameProposal,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      if (errData && errData.detail) {
        errorDetail = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Health & AI Status
  getHealth: () => fetchJson<HealthResponse>('/health'),
  getAiStatus: () => fetchJson<OllamaStatusResponse>('/ai/status'),

  // Folders
  getDefaultFolders: () =>
    fetchJson<{
      home_dir: string;
      default_folders: Array<{ label: string; path: string; exists: boolean }>;
      recommended: string;
    }>('/folders/defaults'),
    
  validateFolder: (folder_path: string) =>
    fetchJson<{
      valid: boolean;
      path: string;
      name: string;
      exists: boolean;
      is_dir: boolean;
      is_safe: boolean;
      error: string;
    }>('/folders/validate', {
      method: 'POST',
      body: JSON.stringify({ folder_path }),
    }),

  // Scan
  scanFolder: (folder_path: string, recursive = false, include_hidden = false) =>
    fetchJson<ScanResponse>('/scan', {
      method: 'POST',
      body: JSON.stringify({ folder_path, recursive, include_hidden }),
    }),

  // Organize
  previewOrganize: (folder_path: string, custom_rules?: Record<string, string>, use_ai = false) =>
    fetchJson<OrganizePreviewResponse>('/organize/preview', {
      method: 'POST',
      body: JSON.stringify({ folder_path, custom_rules, use_ai }),
    }),

  executeOrganize: (folder_path: string, moves: PlannedMove[], batch_description?: string) =>
    fetchJson<OrganizeExecuteResponse>('/organize/execute', {
      method: 'POST',
      body: JSON.stringify({ folder_path, moves, batch_description }),
    }),

  // Rename
  previewRename: (folder_path: string, file_paths?: string[], use_ai = true, naming_style = 'kebab-case') =>
    fetchJson<RenamePreviewResponse>('/rename/preview', {
      method: 'POST',
      body: JSON.stringify({ folder_path, file_paths, use_ai, naming_style }),
    }),

  executeRename: (folder_path: string, proposals: RenameProposal[]) =>
    fetchJson<RenameExecuteResponse>('/rename/execute', {
      method: 'POST',
      body: JSON.stringify({ folder_path, proposals }),
    }),

  // Search
  searchFiles: (folder_path: string, query: string, search_content = true, use_ai = true) =>
    fetchJson<SearchResponse>('/search', {
      method: 'POST',
      body: JSON.stringify({ folder_path, query, search_content, use_ai }),
    }),

  // Cleanup
  scanCleanup: (folder_path: string) =>
    fetchJson<CleanupScanResponse>('/cleanup/scan', {
      method: 'POST',
      body: JSON.stringify({ folder_path }),
    }),

  executeCleanup: (folder_path: string, file_paths_to_remove: string[], delete_permanently = false) =>
    fetchJson<CleanupExecuteResponse>('/cleanup/execute', {
      method: 'POST',
      body: JSON.stringify({ folder_path, file_paths_to_remove, delete_permanently }),
    }),

  // History & Undo
  getHistory: (limit = 50) => fetchJson<HistoryBatchItem[]>(`/history?limit=${limit}`),

  undoBatch: (batch_id: string) =>
    fetchJson<UndoResponse>(`/history/undo/${batch_id}`, {
      method: 'POST',
    }),

  // Settings
  getSettings: () => fetchJson<SystemSettings>('/settings'),

  updateSettings: (payload: Partial<SystemSettings>) =>
    fetchJson<{ status: string; message: string }>('/settings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
