import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  FileText,
  Copy,
  Check,
  Calendar,
  HardDrive,
  Tag,
  CornerDownRight,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { SearchResponse, SearchResultItem } from '../types';

interface FindFilesPageProps {
  activeFolder: string;
  showToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

export const FindFilesPage: React.FC<FindFilesPageProps> = ({ activeFolder, showToast }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [searchContent, setSearchContent] = useState(true);

  const sampleQueries = [
    'Find my operating systems assignment',
    'Show PDFs I downloaded recently',
    'Find Python files in my folder',
    'Where are my notes?',
  ];

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.searchFiles(activeFolder, queryText.trim(), searchContent, true);
      setSearchResponse(res);
      if (res.total_results === 0) {
        showToast('info', 'No matching files', 'Try broader keywords or checking another folder.');
      }
    } catch (err: any) {
      showToast('error', 'Search failed', err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
    showToast('success', 'Path copied', path);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Find My Files</h2>
          <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 text-xs font-semibold">
            Natural Language & Content
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Ask questions naturally. SlothDesk AI interprets categories, dates, and searches document text locally.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="sloth-card p-4 border border-[#23304c] rounded-2xl space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'Find my operating systems assignment' or 'Show PDFs from this week'..."
              className="w-full bg-[#0d1320] border border-[#23304c] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSearching ? 'Thinking...' : 'Search'}</span>
          </button>
        </form>

        {/* Options & Sample Query Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 mr-1">Try asking:</span>
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#162032] hover:bg-[#1f2d46] text-slate-300 text-[11px] border border-[#23334e] transition-colors"
              >
                &quot;{sq}&quot;
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={searchContent}
              onChange={(e) => setSearchContent(e.target.checked)}
              className="rounded bg-[#0d1320] border-slate-700 text-purple-600 focus:ring-0"
            />
            <span>Search file content text</span>
          </label>
        </div>
      </div>

      {/* AI Interpretation Badge */}
      {searchResponse && (
        <div className="p-4 rounded-xl bg-[#121929] border border-[#202c44] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-slate-300">
              AI Query Interpretation: <strong className="text-teal-300">{searchResponse.parsed_filters.ai_interpretation || 'Parsed query'}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {searchResponse.parsed_filters.categories.map((c, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-semibold">
                Category: {c}
              </span>
            ))}
            {searchResponse.parsed_filters.extensions.map((ext, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                .{ext}
              </span>
            ))}
            {searchResponse.parsed_filters.date_filter && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                Date: {searchResponse.parsed_filters.date_filter}
              </span>
            )}
            <span className="text-slate-400">
              Found <strong>{searchResponse.total_results}</strong> file(s)
            </span>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResponse && (
        <div className="sloth-card border border-[#23304c] rounded-2xl overflow-hidden">
          {searchResponse.results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No files matched your query in this folder.
            </div>
          ) : (
            <div className="divide-y divide-[#1b253b]">
              {searchResponse.results.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 hover:bg-[#121929] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-sm font-semibold text-white truncate">{res.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {res.category}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          res.match_type === 'content'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                            : 'bg-teal-500/15 text-teal-300 border border-teal-500/20'
                        }`}
                      >
                        Matched {res.match_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[11px] truncate max-w-sm">
                        <CornerDownRight className="w-3 h-3 text-slate-500" />
                        {res.path}
                      </span>
                      <span>{res.size_formatted}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {res.modified_formatted}
                      </span>
                    </div>

                    {res.snippet && (
                      <div className="text-[11px] text-slate-300 font-mono bg-[#0c121e] p-2.5 rounded-lg border border-[#1e293b]">
                        Snippet: &quot;{res.snippet}&quot;
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(res.path)}
                      className="px-3 py-1.5 rounded-lg bg-[#182132] hover:bg-[#222f46] text-slate-300 text-xs font-medium border border-[#2b3a54] flex items-center gap-1.5 transition-colors"
                      title="Copy full path"
                    >
                      {copiedPath === res.path ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Path</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
