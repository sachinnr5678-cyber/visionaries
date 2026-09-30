'use client';

import React from 'react';
import { X, GitFork, ShieldCheck, BookOpen, ExternalLink } from 'lucide-react';
import { Relationship, Concept } from '@/types/graph';

interface RelationshipModalProps {
  relationship: Relationship | null;
  concepts: Concept[];
  onClose: () => void;
  onViewChapter: (section: string) => void;
}

export default function RelationshipModal({
  relationship,
  concepts,
  onClose,
  onViewChapter,
}: RelationshipModalProps) {
  if (!relationship) return null;

  const sourceNode = concepts.find((c) => c.id === relationship.source);
  const targetNode = concepts.find((c) => c.id === relationship.target);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl p-6 text-[#F8FAFC] border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close relationship modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
            RELATIONSHIP INSPECTOR
          </span>
          <span className="text-xs font-mono text-slate-400">
            {relationship.chapter} • {relationship.section}
          </span>
        </div>

        {/* Directed Relationship Visual Badge */}
        <div className="p-4 rounded-2xl bg-[#050816] border border-white/10 my-4 flex items-center justify-between text-sm sm:text-base font-semibold">
          <span className="text-[#22D3EE]">{sourceNode?.label || relationship.source}</span>
          <div className="flex flex-col items-center px-3">
            <span className="text-xs font-mono text-[#F8FAFC] bg-[#6C63FF]/30 px-2.5 py-0.5 rounded-full border border-[#6C63FF]/40 mb-1">
              {relationship.relation}
            </span>
            <div className="w-16 h-[2px] bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6]" />
          </div>
          <span className="text-[#8B5CF6]">{targetNode?.label || relationship.target}</span>
        </div>

        {/* Evidence Quote */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Source Textbook Evidence</span>
            </h4>
            <span className="text-xs font-mono text-[#34D399] font-semibold">
              {(relationship.confidence * 100).toFixed(0)}% Confidence
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-serif italic text-xs sm:text-sm text-slate-300 leading-relaxed">
            &ldquo;{relationship.evidence}&rdquo;
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            Category: {relationship.category}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
