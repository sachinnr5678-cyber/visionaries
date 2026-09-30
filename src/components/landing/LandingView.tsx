'use client';

import React from 'react';
import Link from 'next/link';
import LandingHeroGraph3D from './LandingHeroGraph3D';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Upload,
  BookOpen,
  Share2,
  CheckCircle2,
  Layers,
  Cpu,
  ShieldCheck,
  Search,
  ExternalLink,
  User,
} from 'lucide-react';
import { AppAccountState } from '@/lib/services/trialService';

interface LandingViewProps {
  onStartDemo: () => void;
  onOpenUpload: () => void;
  onOpenWorkspace: () => void;
  account?: AppAccountState | null;
}

export default function LandingView({
  onStartDemo,
  onOpenUpload,
  onOpenWorkspace,
  account,
}: LandingViewProps) {
  return (
    <div className="relative min-h-screen bg-[#050816] text-[#F8FAFC] selection:bg-[#6C63FF]/30 selection:text-[#22D3EE] overflow-x-hidden">
      {/* 3D Knowledge Graph Background */}
      <LandingHeroGraph3D />

      {/* Futuristic Background Gradients and Grid */}
      <div className="absolute inset-0 stem-grid-bg pointer-events-none z-0 opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#6C63FF]/15 via-[#22D3EE]/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Top Navigation */}
      <header className="relative z-10 w-full border-b border-white/5 bg-[#050816]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#22D3EE] p-[1px] flex items-center justify-center shadow-lg shadow-[#6C63FF]/20">
              <div className="w-full h-full bg-[#0B1020] rounded-[11px] flex items-center justify-center">
                <Share2 className="w-5 h-5 text-[#22D3EE]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Visual Concept Mapper
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#6C63FF]/15 text-[#22D3EE] border border-[#6C63FF]/30">
                  STEM AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Interactive Textbook Knowledge Graph
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onOpenWorkspace}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
            >
              My Maps
            </button>
            <button
              onClick={onStartDemo}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors hover:bg-white/5 flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Explore Demo</span>
            </button>
            <button
              onClick={onOpenUpload}
              className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#6C63FF] hover:bg-[#5b51ff] text-white shadow-lg shadow-[#6C63FF]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Chapter</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        {/* Academic Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-slate-300 mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#22D3EE] animate-pulse" />
          <span className="font-mono text-[11px] text-[#22D3EE]">AI REVOLUTION FOR STEM</span>
          <span className="text-white/20">•</span>
          <span>From Dense Chapters to Connected Clarity</span>
        </div>

        {/* Primary Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
          See how your <br />
          <span className="bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#6C63FF] bg-clip-text text-transparent">
            textbook connects.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-10">
          Turn dense STEM chapters into interactive knowledge maps that reveal concepts,
          mathematical relationships, and hidden connections — backed by verifiable textbook evidence.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onOpenUpload}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#5b51ff] hover:to-[#7c4cf3] text-white shadow-xl shadow-[#6C63FF]/30 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 border border-white/15"
          >
            <Upload className="w-4 h-4 text-[#22D3EE]" />
            <span>Create a Concept Map</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-[#0B1020]/90 hover:bg-[#131b36] text-white border border-white/10 hover:border-[#6C63FF]/50 backdrop-blur-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg"
          >
            <Compass className="w-4 h-4 text-[#22D3EE]" />
            <span>Explore Demo</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
              Linear Alg → ML
            </span>
          </button>
        </div>

        {/* Live Interactive Preview Card Mockup */}
        <div className="relative mx-auto max-w-4xl rounded-2xl glass-panel-elevated p-2 sm:p-4 text-left mb-20 group cursor-pointer transition-all hover:border-[#6C63FF]/50"
             onClick={onStartDemo}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-400 font-mono ml-2">
                Strang_Linear_Algebra_Ch5.pdf → Knowledge Graph
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#22D3EE] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-ping" />
              <span>Interactive 3D Active</span>
            </div>
          </div>

          <div className="relative h-64 sm:h-80 rounded-xl bg-[#050816]/90 border border-white/5 overflow-hidden flex items-center justify-center">
            {/* Visual graph mockup representation */}
            <div className="absolute inset-0 stem-grid-bg opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#6C63FF]/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col items-center text-center p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="px-3.5 py-1.5 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/40 text-[#F8FAFC] text-xs font-mono font-medium shadow-lg shadow-[#6C63FF]/20">
                  Matrix [m × n]
                </div>
                <div className="h-[2px] w-12 bg-gradient-to-r from-[#6C63FF] to-[#22D3EE] relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#22D3EE]">
                    represents
                  </div>
                </div>
                <div className="px-3.5 py-1.5 rounded-lg bg-[#22D3EE]/20 border border-[#22D3EE]/40 text-[#F8FAFC] text-xs font-mono font-medium shadow-lg shadow-[#22D3EE]/20">
                  Linear Transformation
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="h-[2px] w-8 bg-slate-600" />
                <span className="text-[11px] text-slate-400 font-mono">
                  maps to → <span className="text-[#34D399]">Weight Matrix</span> → <span className="text-[#FBBF24]">Neural Network</span>
                </span>
                <div className="h-[2px] w-8 bg-slate-600" />
              </div>

              <p className="text-xs text-slate-300 max-w-md">
                Click anywhere on this preview to launch the full 3D interactive knowledge graph with textbook evidence verification.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-24">
          <div className="glass-panel p-6 rounded-2xl hover:border-[#6C63FF]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center mb-4 text-[#6C63FF]">
              <Layers className="w-5 h-5 text-[#22D3EE]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">3D & 2D Projection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore interconnected concept clusters in immersive 3D space or switch seamlessly to high-clarity 2D graph view.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover:border-[#6C63FF]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/15 border border-[#22D3EE]/30 flex items-center justify-center mb-4 text-[#22D3EE]">
              <ShieldCheck className="w-5 h-5 text-[#34D399]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Evidence-First Accuracy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every single node and connecting relationship traces back to verbatim textbook sentences with confidence scores and section badges.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover:border-[#6C63FF]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center mb-4 text-[#8B5CF6]">
              <Cpu className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Cross-Chapter Bridges</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Understand how mathematical foundations in Chapter 5 (matrices) bridge into applied deep learning in Chapter 7 (backpropagation).
            </p>
          </div>
        </div>

        {/* 4-Step Pipeline Flow */}
        <div className="glass-panel rounded-2xl p-8 text-left border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                How Concept Mapper Works
              </h2>
              <p className="text-xs text-slate-400">
                A transparent, evidence-first AI pipeline tailored for undergraduate STEM education.
              </p>
            </div>
            <button
              onClick={onOpenUpload}
              className="text-xs font-semibold text-[#22D3EE] hover:text-white flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Try it with your chapter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-xs font-mono text-[#22D3EE] font-medium">STEP 01</div>
              <h4 className="text-sm font-semibold text-white">Upload Textbook Chapter</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide any PDF, DOCX or TXT chapter up to 50MB. We parse notation, figures, and theorems.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-[#6C63FF] font-medium">STEP 02</div>
              <h4 className="text-sm font-semibold text-white">Concept Extraction</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The AI identifies definitions, algorithms, models, and theorems with hierarchical importance ratings.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-[#8B5CF6] font-medium">STEP 03</div>
              <h4 className="text-sm font-semibold text-white">Relationship Mapping</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Discovers directed relationships (represents, operates on, minimizes, contains) with confidence scores.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-[#34D399] font-medium">STEP 04</div>
              <h4 className="text-sm font-semibold text-white">Interactive Exploration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fly through the 3D graph, click any concept to inspect why it matters, and verify source evidence.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Visual Concept Mapper • AI-Powered STEM Knowledge Graph</p>
          <div className="flex items-center gap-6 text-slate-400">
            <button onClick={onStartDemo} className="hover:text-white transition-colors">
              Live Demo
            </button>
            <button onClick={onOpenUpload} className="hover:text-white transition-colors">
              Upload
            </button>
            <button onClick={onOpenWorkspace} className="hover:text-white transition-colors">
              Saved Maps
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
