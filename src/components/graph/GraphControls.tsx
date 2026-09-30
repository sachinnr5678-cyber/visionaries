'use client';

import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Box,
  Layers,
  Sparkles,
  Eye,
  Crosshair,
} from 'lucide-react';

interface GraphControlsProps {
  is3D: boolean;
  onToggle3D: (val: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onCenterGraph: () => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
}

export default function GraphControls({
  is3D,
  onToggle3D,
  onZoomIn,
  onZoomOut,
  onResetView,
  onCenterGraph,
  isFocusMode,
  onToggleFocusMode,
}: GraphControlsProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel-elevated border border-white/10 shadow-2xl backdrop-blur-2xl">
      {/* 2D / 3D Switch */}
      <div className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/5 mr-1">
        <button
          onClick={() => onToggle3D(false)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
            !is3D
              ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2D Flow</span>
        </button>
        <button
          onClick={() => onToggle3D(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
            is3D
              ? 'bg-[#22D3EE] text-slate-950 shadow-md shadow-[#22D3EE]/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Space</span>
        </button>
      </div>

      <div className="h-5 w-[1px] bg-white/10" />

      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        title="Zoom In (+)"
        aria-label="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        title="Zoom Out (-)"
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Center Graph */}
      <button
        onClick={onCenterGraph}
        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        title="Center Graph"
        aria-label="Center Graph"
      >
        <Crosshair className="w-4 h-4" />
      </button>

      {/* Reset View */}
      <button
        onClick={onResetView}
        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        title="Reset Camera View"
        aria-label="Reset View"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <div className="h-5 w-[1px] bg-white/10" />

      {/* Focus Mode */}
      <button
        onClick={onToggleFocusMode}
        className={`px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all ${
          isFocusMode
            ? 'bg-[#8B5CF6]/30 text-[#8B5CF6] border border-[#8B5CF6]/40'
            : 'text-slate-400 hover:text-white hover:bg-white/10'
        }`}
        title={isFocusMode ? 'Exit Focus Mode' : 'Focus Mode (Immersive View)'}
      >
        {isFocusMode ? (
          <>
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Normal View</span>
          </>
        ) : (
          <>
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Focus Mode</span>
          </>
        )}
      </button>
    </div>
  );
}
