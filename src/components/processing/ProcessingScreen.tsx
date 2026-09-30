'use client';

import React from 'react';
import {
  FileText,
  Sparkles,
  GitFork,
  Share2,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Layers,
  Cpu,
} from 'lucide-react';
import { ProcessingUpdate } from '@/lib/ai/pipeline';

interface ProcessingScreenProps {
  fileName: string;
  update: ProcessingUpdate;
}

export default function ProcessingScreen({ fileName, update }: ProcessingScreenProps) {
  const stages = [
    { key: 'reading', label: 'DOCUMENT', icon: FileText },
    { key: 'extracting_concepts', label: 'CONCEPTS', icon: Sparkles },
    { key: 'discovering_relations', label: 'RELATIONSHIPS', icon: GitFork },
    { key: 'building_graph', label: 'KNOWLEDGE GRAPH', icon: Share2 },
  ];

  const getStageIndex = (stageKey: string) => {
    switch (stageKey) {
      case 'reading':
        return 0;
      case 'extracting_concepts':
        return 1;
      case 'discovering_relations':
        return 2;
      case 'building_graph':
      case 'completed':
        return 3;
      default:
        return 0;
    }
  };

  const currentStageIdx = getStageIndex(update.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#050816] text-[#F8FAFC] overflow-hidden stem-grid-bg">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#6C63FF]/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-4xl glass-panel-elevated rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header with Title and File */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C63FF]/20 text-[#22D3EE] text-xs font-mono mb-2 border border-[#6C63FF]/40">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>SYNTHESIZING KNOWLEDGE GRAPH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AI Concept Mapping Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
              Source file: <span className="text-slate-200 font-mono">{fileName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-3xl font-mono font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
              {update.progress}%
            </span>
          </div>
        </div>

        {/* 4-Stage Visual Pipeline Ribbon */}
        <div className="py-6 border-b border-white/5">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
            {stages.map((st, idx) => {
              const Icon = st.icon;
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <div
                  key={st.key}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all ${
                    isCurrent
                      ? 'bg-[#6C63FF]/15 border border-[#6C63FF]/50 shadow-lg shadow-[#6C63FF]/20 scale-105'
                      : isPast
                      ? 'bg-white/[0.03] border border-[#34D399]/30 text-slate-300'
                      : 'bg-white/[0.01] border border-white/5 opacity-40'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                      isCurrent
                        ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/40'
                        : isPast
                        ? 'bg-[#34D399]/20 text-[#34D399]'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono font-semibold tracking-wider text-slate-300">
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Smooth animated progress line */}
          <div className="w-full bg-white/5 h-2 rounded-full mt-5 overflow-hidden p-[1px] border border-white/10">
            <div
              className="bg-gradient-to-r from-[#6C63FF] via-[#22D3EE] to-[#34D399] h-full rounded-full transition-all duration-300 ease-out shadow-lg shadow-[#22D3EE]/30"
              style={{ width: `${update.progress}%` }}
            />
          </div>

          <div className="text-xs text-slate-300 font-mono mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-ping" />
            <span>{update.statusMessage}</span>
          </div>
        </div>

        {/* Live Discovered Entities Grid */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* Discovered Concepts Appearing Gradually */}
          {update.discoveredConcepts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>Identified Concepts ({update.discoveredConcepts.length})</span>
                </span>
                <span className="text-[11px] text-[#34D399] font-mono">Stream Active</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {update.discoveredConcepts.map((concept) => (
                  <div
                    key={concept.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#6C63FF]/40 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#6C63FF]" />
                    <span className="font-semibold text-white">{concept.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                      {concept.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discovered Relationships Forming */}
          {update.discoveredRelationships.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Forming Relationships ({update.discoveredRelationships.length})</span>
                </span>
                <span className="text-[11px] text-[#8B5CF6] font-mono">
                  Confidence &gt; 90%
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {update.discoveredRelationships.slice(-6).map((rel) => {
                  const sourceConcept = update.discoveredConcepts.find(
                    (c) => c.id === rel.source
                  );
                  const targetConcept = update.discoveredConcepts.find(
                    (c) => c.id === rel.target
                  );
                  return (
                    <div
                      key={rel.id}
                      className="p-2.5 rounded-xl bg-[#0B1020] border border-white/10 flex items-center justify-between text-xs animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-medium text-[#22D3EE] truncate">
                          {sourceConcept?.label || rel.source}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#6C63FF]/20 text-[10px] font-mono text-[#F8FAFC] border border-[#6C63FF]/30">
                          {rel.relation}
                        </span>
                        <span className="font-medium text-[#8B5CF6] truncate">
                          {targetConcept?.label || rel.target}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#34D399] ml-2 shrink-0">
                        {(rel.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
