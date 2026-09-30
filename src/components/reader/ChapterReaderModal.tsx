'use client';

import React from 'react';
import { X, BookOpen, Sparkles, CheckCircle2, Bookmark, FileText } from 'lucide-react';
import { SourceEvidence } from '@/types/graph';

interface ChapterReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: SourceEvidence | null;
  conceptTitle?: string;
}

export default function ChapterReaderModal({
  isOpen,
  onClose,
  evidence,
  conceptTitle,
}: ChapterReaderModalProps) {
  if (!isOpen || !evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel-elevated rounded-3xl p-6 sm:p-8 text-[#F8FAFC] border border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close reader"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/40 flex items-center justify-center text-[#22D3EE]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#6C63FF]/20 text-[#22D3EE] border border-[#6C63FF]/30">
                {evidence.chapter}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {evidence.section}
              </span>
              <span className="text-xs font-mono text-slate-500">
                • Page {evidence.pageNumber}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Textbook Evidence Verification
            </h3>
          </div>
        </div>

        {/* Content Body simulating textbook paper */}
        <div className="flex-1 overflow-y-auto py-6 space-y-5">
          {/* Metadata pill */}
          <div className="flex items-center justify-between text-xs bg-white/[0.03] p-3 rounded-xl border border-white/5 font-mono">
            <span className="text-slate-400">
              Concept Target: <strong className="text-white">{conceptTitle}</strong>
            </span>
            <span className="text-[#34D399] flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{(evidence.confidence * 100).toFixed(0)}% AI Extraction Confidence</span>
            </span>
          </div>

          {/* Textbook Passage View */}
          <div className="p-6 rounded-2xl bg-[#070b18] border border-white/10 font-serif leading-relaxed text-slate-300 text-sm sm:text-base relative">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-white/5 flex items-center justify-between">
              <span>Section Excerpt — Strang (5th Ed.)</span>
              <Bookmark className="w-4 h-4 text-[#6C63FF]" />
            </div>

            <p className="mb-4 text-slate-400 italic">
              "...To formalize how geometric operators behave under coordinate transitions, consider
              the fundamental structure theorem of transformations..."
            </p>

            {/* The highlighted sentence */}
            <div className="my-4 p-4 rounded-xl bg-[#6C63FF]/15 border-l-4 border-[#22D3EE] text-white font-sans text-sm sm:text-base">
              <div className="font-mono text-[10px] text-[#22D3EE] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Extracted Proof Sentence</span>
              </div>
              <p>
                &ldquo;{evidence.quote.split(evidence.highlightedPhrase)[0]}
                <mark className="bg-[#22D3EE]/30 text-[#22D3EE] font-semibold px-1 rounded border-b border-[#22D3EE]">
                  {evidence.highlightedPhrase}
                </mark>
                {evidence.quote.split(evidence.highlightedPhrase)[1] || ''}&rdquo;
              </p>
            </div>

            <p className="text-slate-400 italic">
              "...This formulation directly preserves eigenvalues across orthogonal basis rotations,
              providing the cornerstone for dimensional compression and machine learning layers."
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            Source: Authoritative Primary Curriculum
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
