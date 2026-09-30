'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Link2,
  FolderTree,
  Filter,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { ChapterOutline, CrossChapterLink } from '@/types/graph';

interface ChapterSidebarProps {
  chapters: ChapterOutline[];
  crossChapterLinks: CrossChapterLink[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string | null, conceptIds: string[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChapterSidebar({
  chapters,
  crossChapterLinks,
  selectedSectionId,
  onSelectSection,
  isOpen,
  onToggle,
}: ChapterSidebarProps) {
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'ch-5': true,
    'ch-cross': true,
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  return (
    <aside
      className={`fixed top-20 left-4 bottom-4 z-40 w-72 glass-panel-elevated rounded-3xl p-4 flex flex-col shadow-2xl border border-white/10 transition-all duration-300 ${
        isOpen ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+2rem)] opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/40 flex items-center justify-center text-[#22D3EE]">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Curriculum Map
            </h3>
            <p className="text-[10px] text-slate-400">Sections &amp; Bridges</p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {/* Reset Selection Button */}
        {selectedSectionId && (
          <button
            onClick={() => onSelectSection(null, [])}
            className="w-full text-left px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#22D3EE] flex items-center justify-between border border-white/10 transition-colors"
          >
            <span>Reset Section Isolation</span>
            <span className="text-[10px] bg-[#22D3EE]/20 px-1.5 py-0.5 rounded text-white">
              Show All
            </span>
          </button>
        )}

        {chapters.map((chapter) => {
          const isExpanded = !!expandedChapters[chapter.id];

          return (
            <div key={chapter.id} className="space-y-1">
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/5 transition-colors text-xs font-semibold text-slate-200"
              >
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="w-3.5 h-3.5 text-[#6C63FF] shrink-0" />
                  <span className="truncate">{chapter.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="pl-3 space-y-1">
                  {chapter.sections.map((sec) => {
                    const isSelected = selectedSectionId === sec.id;

                    return (
                      <button
                        key={sec.id}
                        onClick={() =>
                          onSelectSection(
                            isSelected ? null : sec.id,
                            isSelected ? [] : sec.conceptIds
                          )
                        }
                        className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#6C63FF]/25 border border-[#6C63FF]/50 text-white font-medium shadow-md'
                            : 'hover:bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[11px] text-[#22D3EE]">
                            {sec.code}
                          </span>
                          <span className="truncate">{sec.title}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                          {sec.conceptIds.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Cross-Chapter Connection Card */}
        {crossChapterLinks.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <div className="text-[11px] font-mono text-[#8B5CF6] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Link2 className="w-3 h-3" />
              <span>Cross-Chapter Connections</span>
            </div>
            <div className="space-y-2">
              {crossChapterLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1"
                >
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-200">
                    <span className="text-[#22D3EE]">{link.bridgeConcept}</span>
                    <span className="text-slate-500 font-mono">→</span>
                    <span className="text-[#8B5CF6]">{link.targetConcept}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    {link.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
