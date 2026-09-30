'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, BookOpen, GitFork, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Concept, Relationship, ChapterOutline } from '@/types/graph';

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
  concepts: Concept[];
  relationships: Relationship[];
  chapters: ChapterOutline[];
  onSelectConcept: (conceptId: string) => void;
  onSelectRelationship: (rel: Relationship) => void;
}

export default function CommandSearch({
  isOpen,
  onClose,
  concepts,
  relationships,
  chapters,
  onSelectConcept,
  onSelectRelationship,
}: CommandSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global CMD+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Search results
  const matchedConcepts = concepts.filter(
    (c) =>
      c.label.toLowerCase().includes(normalizedQuery) ||
      c.description.toLowerCase().includes(normalizedQuery) ||
      c.type.toLowerCase().includes(normalizedQuery) ||
      c.section.toLowerCase().includes(normalizedQuery)
  );

  const matchedRelationships = relationships.filter(
    (r) =>
      r.relation.toLowerCase().includes(normalizedQuery) ||
      r.evidence.toLowerCase().includes(normalizedQuery) ||
      r.source.toLowerCase().includes(normalizedQuery) ||
      r.target.toLowerCase().includes(normalizedQuery)
  );

  const allResults = [
    ...matchedConcepts.map((c) => ({ type: 'concept' as const, data: c })),
    ...matchedRelationships.map((r) => ({ type: 'relationship' as const, data: r })),
  ];

  const handleSelectResult = (item: (typeof allResults)[0]) => {
    if (item.type === 'concept') {
      onSelectConcept(item.data.id);
    } else {
      onSelectRelationship(item.data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-3xl p-4 shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-white/10">
          <Search className="w-5 h-5 text-[#22D3EE] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search concepts, theorems, relationships, sections... (e.g. Matrix, Gradient, 5.2)"
            className="w-full bg-transparent border-none outline-none text-white text-sm placeholder:text-slate-500 font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-1">
          {allResults.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No mathematical concepts or relationships match &ldquo;{query}&rdquo;
            </div>
          ) : (
            allResults.slice(0, 15).map((item, idx) => {
              if (item.type === 'concept') {
                const c = item.data;
                return (
                  <button
                    key={`c-${c.id}`}
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left p-3 rounded-2xl hover:bg-[#6C63FF]/15 border border-transparent hover:border-[#6C63FF]/40 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center text-[#22D3EE] shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-xs sm:text-sm">
                            {c.label}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                            {c.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">
                          {c.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 group-hover:text-white shrink-0 ml-3">
                      <span className="text-[10px] font-mono">{c.section}</span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-[#22D3EE]" />
                    </div>
                  </button>
                );
              } else {
                const r = item.data;
                return (
                  <button
                    key={`r-${r.id}`}
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left p-3 rounded-2xl hover:bg-[#8B5CF6]/15 border border-transparent hover:border-[#8B5CF6]/40 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shrink-0">
                        <GitFork className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2 text-xs text-white">
                          <span className="font-semibold text-[#22D3EE]">{r.source}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#8B5CF6]">
                            {r.relation}
                          </span>
                          <span className="font-semibold text-[#8B5CF6]">{r.target}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-md mt-0.5 italic">
                          &ldquo;{r.evidence}&rdquo;
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 group-hover:text-white shrink-0 ml-3">
                      <span className="text-[10px] font-mono text-[#34D399]">
                        {(r.confidence * 100).toFixed(0)}%
                      </span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-[#22D3EE]" />
                    </div>
                  </button>
                );
              }
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Use &uarr; &darr; to navigate, Enter to select</span>
          <span>Global Search Active</span>
        </div>
      </div>
    </div>
  );
}
