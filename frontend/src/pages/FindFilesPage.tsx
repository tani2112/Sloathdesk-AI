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
          <h2 className="text-2xl font-black text-white tracking-tight">Find My Files</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 text-xs font-bold">
            Natural Language & Content
          </span>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Ask questions naturally. SlothDesk AI interprets categories, dates, and searches document text locally.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="sloth-card p-4 border border-[#252530] rounded-2xl space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'Find my operating systems assignment' or 'Show PDFs from this week'..."
              className="w-full bg-[#0a0a0d] border border-[#262632] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="sloth-btn-primary px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSearching ? 'Thinking...' : 'Search'}</span>
          </button>
        </form>

        {/* Options & Sample Query Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-400 mr-1 font-bold">Try asking:</span>
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#14141a] hover:bg-[#1d1d25] text-zinc-300 hover:text-yellow-300 text-[11px] font-semibold border border-[#252530] transition-colors"
              >
                &quot;{sq}&quot;
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-zinc-400 hover:text-yellow-300 cursor-pointer select-none font-bold">
            <input
              type="checkbox"
              checked={searchContent}
              onChange={(e) => setSearchContent(e.target.checked)}
              className="rounded bg-[#0d0d10] border-zinc-700 text-yellow-500 focus:ring-0"
            />
            <span>Search file content text</span>
          </label>
        </div>
      </div>

      {/* AI Interpretation Badge */}
      {searchResponse && (
        <div className="p-4 rounded-xl bg-[#111116] border border-[#252530] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-zinc-300">
              AI Query Interpretation: <strong className="text-yellow-300">{searchResponse.parsed_filters.ai_interpretation || 'Parsed query'}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {searchResponse.parsed_filters.categories.map((c, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold">
                Category: {c}
              </span>
            ))}
            {searchResponse.parsed_filters.extensions.map((ext, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                .{ext}
              </span>
            ))}
            {searchResponse.parsed_filters.date_filter && (
              <span className="px-2.5 py-0.5 rounded bg-orange-400/10 text-orange-300 border border-orange-400/30 text-[10px] font-bold">
                Date: {searchResponse.parsed_filters.date_filter}
              </span>
            )}
            <span className="text-zinc-400">
              Found <strong className="text-yellow-400 font-bold">{searchResponse.total_results}</strong> file(s)
            </span>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResponse && (
        <div className="sloth-card border border-[#252530] rounded-2xl overflow-hidden">
          {searchResponse.results.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No files matched your query in this folder.
            </div>
          ) : (
            <div className="divide-y divide-[#1c1c24]">
              {searchResponse.results.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 hover:bg-[#121217] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FileText className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span className="text-sm font-bold text-white truncate">{res.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold">
                        {res.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 font-bold">
                        Matched {res.match_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1 font-mono text-[11px] truncate max-w-sm text-zinc-400">
                        <CornerDownRight className="w-3 h-3 text-zinc-600" />
                        {res.path}
                      </span>
                      <span className="font-semibold text-zinc-300">{res.size_formatted}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-600" />
                        {res.modified_formatted}
                      </span>
                    </div>

                    {res.snippet && (
                      <div className="text-[11px] text-yellow-200/90 font-mono bg-[#09090c] p-2.5 rounded-lg border border-[#24242e]">
                        Snippet: &quot;{res.snippet}&quot;
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(res.path)}
                      className="px-3 py-1.5 rounded-lg bg-[#15151c] hover:bg-[#1e1e27] text-zinc-300 hover:text-yellow-400 text-xs font-bold border border-[#282834] flex items-center gap-1.5 transition-colors"
                      title="Copy full path"
                    >
                      {copiedPath === res.path ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-yellow-400">Copied</span>
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
