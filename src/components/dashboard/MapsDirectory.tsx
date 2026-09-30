'use client';

import React from 'react';
import {
  Share2,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  GitFork,
  Layers,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { samplePreloadedChapters } from '@/data/demoGraph';
import { KnowledgeGraphData } from '@/types/graph';

interface MapsDirectoryProps {
  onSelectMap: (graph: KnowledgeGraphData) => void;
  onNewMap: () => void;
  onBackToGraph: () => void;
  userMaps?: KnowledgeGraphData[];
}

export default function MapsDirectory({
  onSelectMap,
  onNewMap,
  onBackToGraph,
  userMaps = [],
}: MapsDirectoryProps) {
  return (
    <div className="min-h-screen bg-[#050816] text-[#F8FAFC] p-6 sm:p-10 stem-grid-bg">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#22D3EE] p-[1px] flex items-center justify-center">
              <div className="w-full h-full bg-[#0B1020] rounded-[11px] flex items-center justify-center">
                <Share2 className="w-5 h-5 text-[#22D3EE]" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                My Concept Maps
              </h1>
              <p className="text-xs text-slate-400">
                Saved textbook synthesis graphs &amp; curriculum models
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToGraph}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Back to Workspace
            </button>
            <button
              onClick={onNewMap}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6C63FF] hover:bg-[#5b51ff] text-white flex items-center gap-2 shadow-lg shadow-[#6C63FF]/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Concept Map</span>
            </button>
          </div>
        </div>

        {/* Maps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          {/* Real Extracted User Maps */}
          {userMaps.map((map) => (
            <div
              key={map.id}
              onClick={() => onSelectMap(map)}
              className="glass-panel-elevated rounded-3xl p-6 border border-[#22D3EE]/30 hover:border-[#22D3EE] cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group shadow-lg shadow-[#22D3EE]/10"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 font-bold">
                    YOUR AI EXTRACTION
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {map.sourceDocument}
                  </span>
                </div>

                {/* Miniature Graph Visual Wireframe */}
                <div className="h-32 rounded-2xl bg-[#050816] border border-[#22D3EE]/20 mb-4 relative overflow-hidden flex items-center justify-center p-4 group-hover:border-[#22D3EE]/50 transition-colors">
                  <div className="absolute inset-0 stem-grid-bg opacity-40" />
                  <div className="flex items-center gap-2.5 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#22D3EE]/25 border border-[#22D3EE]/60 flex items-center justify-center text-[10px] text-white font-mono shadow-md">
                      AI
                    </div>
                    <div className="w-8 h-[2px] bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6]" />
                    <div className="w-9 h-9 rounded-full bg-[#8B5CF6]/30 border border-[#8B5CF6]/70 flex items-center justify-center text-[11px] text-white font-bold shadow-lg shadow-[#8B5CF6]/30">
                      PDF
                    </div>
                    <div className="w-8 h-[2px] bg-gradient-to-r from-[#8B5CF6] to-[#34D399]" />
                    <div className="w-8 h-8 rounded-full bg-[#34D399]/25 border border-[#34D399]/60 flex items-center justify-center text-[10px] text-white font-mono shadow-md">
                      KG
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#22D3EE] transition-colors leading-snug">
                  {map.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono line-clamp-2">
                  {map.subtitle}
                </p>
              </div>

              {/* Stats Footer */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span>{map.nodes.length} Concepts</span>
                  <span>•</span>
                  <span>{map.edges.length} Relations</span>
                </div>
                <div className="flex items-center gap-1 text-[#22D3EE] font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Open Map</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

          {/* Preloaded Curricula Samples */}
          {samplePreloadedChapters.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectMap(item.graphData)}
              className="glass-panel-elevated rounded-3xl p-6 border border-white/10 hover:border-[#6C63FF]/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#6C63FF]/20 text-[#22D3EE] border border-[#6C63FF]/30 font-semibold">
                    {item.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    STEM Curricula
                  </span>
                </div>

                {/* Miniature Graph Visual Wireframe */}
                <div className="h-32 rounded-2xl bg-[#050816] border border-white/5 mb-4 relative overflow-hidden flex items-center justify-center p-4 group-hover:border-[#22D3EE]/30 transition-colors">
                  <div className="absolute inset-0 stem-grid-bg opacity-30" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#22D3EE]/20 border border-[#22D3EE]/50 flex items-center justify-center text-[10px] text-white font-mono shadow-md">
                      M
                    </div>
                    <div className="w-8 h-[2px] bg-gradient-to-r from-[#22D3EE] to-[#6C63FF]" />
                    <div className="w-9 h-9 rounded-full bg-[#6C63FF]/30 border border-[#6C63FF]/60 flex items-center justify-center text-[11px] text-white font-bold shadow-lg shadow-[#6C63FF]/30">
                      T
                    </div>
                    <div className="w-8 h-[2px] bg-gradient-to-r from-[#6C63FF] to-[#34D399]" />
                    <div className="w-8 h-8 rounded-full bg-[#34D399]/20 border border-[#34D399]/50 flex items-center justify-center text-[10px] text-white font-mono shadow-md">
                      NN
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#22D3EE] transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {item.author} • {item.subject}
                </p>
              </div>

              {/* Stats Footer */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span>{item.conceptsCount} Concepts</span>
                  <span>•</span>
                  <span>{item.relationsCount} Relations</span>
                </div>
                <div className="flex items-center gap-1 text-[#22D3EE] font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Open Map</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
