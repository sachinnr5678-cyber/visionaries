'use client';

import React from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Layers,
  ChevronRight,
  GitCommit,
} from 'lucide-react';
import { Concept, Relationship } from '@/types/graph';

interface ConceptDetailPanelProps {
  concept: Concept | null;
  relationships: Relationship[];
  allConcepts: Concept[];
  onClose: () => void;
  onSelectConcept: (conceptId: string) => void;
  onViewInChapter: (concept: Concept) => void;
  onSelectRelationship: (rel: Relationship) => void;
}

export default function ConceptDetailPanel({
  concept,
  relationships,
  allConcepts,
  onClose,
  onSelectConcept,
  onViewInChapter,
  onSelectRelationship,
}: ConceptDetailPanelProps) {
  if (!concept) return null;

  // Filter edges where this concept is source or target
  const connectedEdges = relationships.filter(
    (e) => e.source === concept.id || e.target === concept.id
  );

  // Concept type badge color
  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Definition':
        return 'bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/30';
      case 'Theorem':
        return 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30';
      case 'Algorithm':
        return 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30';
      case 'Model':
        return 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30';
      case 'Process':
        return 'bg-[#F472B6]/15 text-[#F472B6] border-[#F472B6]/30';
      default:
        return 'bg-[#6C63FF]/15 text-[#6C63FF] border-[#6C63FF]/30';
    }
  };

  return (
    <div className="fixed top-20 right-4 bottom-4 w-full max-w-md z-40 glass-panel-elevated rounded-3xl p-6 flex flex-col shadow-2xl border border-white/10 animate-in slide-in-from-right-8 duration-300 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-start justify-between pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${getTypeBadgeStyle(
                concept.type
              )}`}
            >
              {concept.type}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {concept.section}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {concept.label}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close concept panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable details */}
      <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
        {/* Short AI explanation */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Definition &amp; Foundation</span>
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
            {concept.description}
          </p>
        </div>

        {/* Why it Matters */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Why it Matters</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#6C63FF]/5 p-3.5 rounded-2xl border border-[#6C63FF]/20">
            {concept.whyItMatters}
          </p>
        </div>

        {/* Source Evidence Card */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Verifiable Textbook Evidence</span>
            </h4>
            <span className="text-[10px] font-mono text-[#34D399]">
              {(concept.evidence.confidence * 100).toFixed(0)}% Match
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 space-y-3">
            <p className="text-xs text-slate-300 italic font-serif leading-relaxed">
              &ldquo;{concept.evidence.quote.split(concept.evidence.highlightedPhrase)[0]}
              <span className="bg-[#22D3EE]/25 text-[#22D3EE] font-semibold px-1 rounded">
                {concept.evidence.highlightedPhrase}
              </span>
              {concept.evidence.quote.split(concept.evidence.highlightedPhrase)[1] || ''}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
              <span className="font-mono">
                {concept.evidence.chapter} • {concept.evidence.section}
              </span>
              <button
                onClick={() => onViewInChapter(concept)}
                className="text-[#22D3EE] hover:text-white font-medium flex items-center gap-1 transition-colors"
              >
                <span>View in chapter</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Relationships Breakdown */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Active Relationships ({connectedEdges.length})</span>
          </h4>

          <div className="space-y-2">
            {connectedEdges.map((edge) => {
              const isSource = edge.source === concept.id;
              const otherNodeId = isSource ? edge.target : edge.source;
              const otherNode = allConcepts.find((c) => c.id === otherNodeId);

              return (
                <div
                  key={edge.id}
                  onClick={() => onSelectRelationship(edge)}
                  className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-[#6C63FF]/40 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-medium text-slate-300">
                      {isSource ? (
                        <>
                          <span className="text-white">{concept.label}</span>
                          <span className="text-[#22D3EE] mx-1.5 font-mono text-[11px]">
                            → {edge.relation} →
                          </span>
                          <span className="text-[#8B5CF6] font-semibold">
                            {otherNode?.label || otherNodeId}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[#8B5CF6] font-semibold">
                            {otherNode?.label || otherNodeId}
                          </span>
                          <span className="text-[#22D3EE] mx-1.5 font-mono text-[11px]">
                            → {edge.relation} →
                          </span>
                          <span className="text-white">{concept.label}</span>
                        </>
                      )}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Related Concepts (click to jump) */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
            Connected Concepts
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {connectedEdges.map((edge) => {
              const targetId = edge.source === concept.id ? edge.target : edge.source;
              const relatedNode = allConcepts.find((c) => c.id === targetId);
              if (!relatedNode) return null;

              return (
                <button
                  key={relatedNode.id}
                  onClick={() => onSelectConcept(relatedNode.id)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-[#6C63FF]/20 border border-white/10 hover:border-[#6C63FF]/40 text-slate-200 transition-all flex items-center gap-1.5"
                >
                  <span>{relatedNode.label}</span>
                  <ArrowRight className="w-3 h-3 text-[#22D3EE]" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
