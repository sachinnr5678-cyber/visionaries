'use client';

import React from 'react';
import { Filter, X, Check, RotateCcw, Sparkles } from 'lucide-react';
import { ConceptType, RelationType } from '@/types/graph';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTypes: ConceptType[];
  onToggleType: (type: ConceptType) => void;
  selectedRelations: RelationType[];
  onToggleRelation: (rel: RelationType) => void;
  onlyHighlyConnected: boolean;
  onToggleHighlyConnected: () => void;
  onlyPrerequisites: boolean;
  onTogglePrerequisites: () => void;
  onResetFilters: () => void;
}

const ALL_CONCEPT_TYPES: ConceptType[] = [
  'Definition',
  'Theorem',
  'Algorithm',
  'Model',
  'Function',
  'Process',
  'Application',
];

const ALL_RELATIONS: RelationType[] = [
  'represents',
  'operates on',
  'associated with',
  'contains',
  'minimizes',
  'transforms',
  'uses',
  'derived from',
];

export default function FilterPanel({
  isOpen,
  onClose,
  selectedTypes,
  onToggleType,
  selectedRelations,
  onToggleRelation,
  onlyHighlyConnected,
  onToggleHighlyConnected,
  onlyPrerequisites,
  onTogglePrerequisites,
  onResetFilters,
}: FilterPanelProps) {
  if (!isOpen) return null;

  const activeFiltersCount =
    (selectedTypes.length > 0 ? selectedTypes.length : 0) +
    (selectedRelations.length > 0 ? selectedRelations.length : 0) +
    (onlyHighlyConnected ? 1 : 0) +
    (onlyPrerequisites ? 1 : 0);

  return (
    <div className="fixed top-20 right-4 z-40 w-80 glass-panel-elevated rounded-3xl p-5 flex flex-col shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#22D3EE]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Graph Filters
          </h3>
          {activeFiltersCount > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6C63FF]/30 text-[#22D3EE] border border-[#6C63FF]/40">
              {activeFiltersCount} Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="py-4 space-y-5 overflow-y-auto max-h-[70vh] pr-1">
        {/* Toggle options */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Display Mode
          </div>

          <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 cursor-pointer text-xs">
            <span className="text-slate-300">Only highly connected (≥ 8)</span>
            <input
              type="checkbox"
              checked={onlyHighlyConnected}
              onChange={onToggleHighlyConnected}
              className="accent-[#6C63FF] rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 cursor-pointer text-xs">
            <span className="text-slate-300">Prerequisite pathways only</span>
            <input
              type="checkbox"
              checked={onlyPrerequisites}
              onChange={onTogglePrerequisites}
              className="accent-[#22D3EE] rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Concept Types */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Concept Categories
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CONCEPT_TYPES.map((type) => {
              const isChecked = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => onToggleType(type)}
                  className={`text-xs px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1.5 ${
                    isChecked
                      ? 'bg-[#6C63FF]/30 border-[#6C63FF] text-white shadow-sm'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 text-[#22D3EE]" />}
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Relationship Types */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Relationship Types
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_RELATIONS.map((rel) => {
              const isChecked = selectedRelations.includes(rel);
              return (
                <button
                  key={rel}
                  onClick={() => onToggleRelation(rel)}
                  className={`text-xs px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1.5 ${
                    isChecked
                      ? 'bg-[#8B5CF6]/30 border-[#8B5CF6] text-white shadow-sm'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 text-[#8B5CF6]" />}
                  <span className="font-mono text-[11px]">{rel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
