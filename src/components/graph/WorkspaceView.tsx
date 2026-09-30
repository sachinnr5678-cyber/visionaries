'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Layers,
  FolderTree,
  Upload,
  ArrowLeft,
  Share2,
  Sparkles,
  BookOpen,
  Info,
  User,
} from 'lucide-react';
import Link from 'next/link';
import {
  KnowledgeGraphData,
  Concept,
  Relationship,
  ConceptType,
  RelationType,
  SourceEvidence,
} from '@/types/graph';
import Graph3D from './Graph3D';
import Graph2D from './Graph2D';
import GraphControls from './GraphControls';
import ConceptDetailPanel from '../concept-panel/ConceptDetailPanel';
import RelationshipModal from '../concept-panel/RelationshipModal';
import ChapterReaderModal from '../reader/ChapterReaderModal';
import ChapterSidebar from '../sidebar/ChapterSidebar';
import FilterPanel from '../filters/FilterPanel';
import CommandSearch from '../search/CommandSearch';

interface WorkspaceViewProps {
  graphData: KnowledgeGraphData;
  onBackToLanding: () => void;
  onOpenUpload: () => void;
  onOpenDirectory: () => void;
}

export default function WorkspaceView({
  graphData,
  onBackToLanding,
  onOpenUpload,
  onOpenDirectory,
}: WorkspaceViewProps) {
  // Graph Display Modes
  const [is3D, setIs3D] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Selection & Hover States
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [hoveredConceptId, setHoveredConceptId] = useState<string | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);

  // Reader Modal State
  const [readerEvidence, setReaderEvidence] = useState<SourceEvidence | null>(null);
  const [readerConceptTitle, setReaderConceptTitle] = useState<string>('');

  // Sidebar & Filter Drawer States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filter criteria
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isolatedConceptIds, setIsolatedConceptIds] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ConceptType[]>([]);
  const [selectedRelations, setSelectedRelations] = useState<RelationType[]>([]);
  const [onlyHighlyConnected, setOnlyHighlyConnected] = useState(false);
  const [onlyPrerequisites, setOnlyPrerequisites] = useState(false);

  // Filtered Nodes & Edges
  const filteredNodes = useMemo(() => {
    return graphData.nodes.filter((node) => {
      // Filter by isolated section
      if (isolatedConceptIds.length > 0 && !isolatedConceptIds.includes(node.id)) {
        return false;
      }
      // Filter by concept type
      if (selectedTypes.length > 0 && !selectedTypes.includes(node.type)) {
        return false;
      }
      // Filter by high connectivity (importance >= 8)
      if (onlyHighlyConnected && node.importance < 8) {
        return false;
      }
      return true;
    });
  }, [graphData.nodes, isolatedConceptIds, selectedTypes, onlyHighlyConnected]);

  const filteredEdges = useMemo(() => {
    const validNodeIds = new Set(filteredNodes.map((n) => n.id));
    return graphData.edges.filter((edge) => {
      if (!validNodeIds.has(edge.source) || !validNodeIds.has(edge.target)) {
        return false;
      }
      if (selectedRelations.length > 0 && !selectedRelations.includes(edge.relation)) {
        return false;
      }
      return true;
    });
  }, [graphData.edges, filteredNodes, selectedRelations]);

  const selectedConcept = useMemo(() => {
    return graphData.nodes.find((c) => c.id === selectedConceptId) || null;
  }, [graphData.nodes, selectedConceptId]);

  // Handle Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(2.5, prev * 1.25));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.4, prev * 0.8));
  const handleResetView = () => {
    setZoomLevel(1);
    setSelectedConceptId(null);
  };
  const handleCenterGraph = () => {
    setSelectedConceptId(null);
  };

  // Open Chapter Reader for a concept
  const handleViewInChapter = (concept: Concept) => {
    setReaderEvidence(concept.evidence);
    setReaderConceptTitle(concept.label);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedTypes([]);
    setSelectedRelations([]);
    setOnlyHighlyConnected(false);
    setOnlyPrerequisites(false);
    setSelectedSectionId(null);
    setIsolatedConceptIds([]);
  };

  const activeFiltersCount =
    (selectedTypes.length > 0 ? selectedTypes.length : 0) +
    (selectedRelations.length > 0 ? selectedRelations.length : 0) +
    (onlyHighlyConnected ? 1 : 0) +
    (onlyPrerequisites ? 1 : 0) +
    (selectedSectionId ? 1 : 0);

  return (
    <div className="relative w-screen h-screen bg-[#050816] text-[#F8FAFC] overflow-hidden flex flex-col">
      {/* Top Navigation Bar / Workspace Header */}
      {!isFocusMode && (
        <header className="relative z-30 w-full h-16 px-4 sm:px-6 bg-[#050816]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
          {/* Left: Back button + Graph Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Return to Landing Page"
              aria-label="Back to landing"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {graphData.title}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6C63FF]/20 text-[#22D3EE] border border-[#6C63FF]/30 hidden md:inline-block">
                  {filteredNodes.length} Concepts • {filteredEdges.length} Relations
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-sm hidden lg:block font-mono">
                {graphData.sourceDocument}
              </p>
            </div>
          </div>

          {/* Center: Command Search Button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-300 hover:text-white transition-all shadow-inner"
            >
              <Search className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="hidden sm:inline">Search graph...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/10 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Tools & Upload Actions */}
          <div className="flex items-center gap-2">
            {/* Sidebar toggle */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                isSidebarOpen
                  ? 'bg-[#6C63FF]/25 text-[#22D3EE] border border-[#6C63FF]/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Curriculum Sections Sidebar"
            >
              <FolderTree className="w-4 h-4" />
              <span className="hidden xl:inline text-xs font-mono">Sections</span>
            </button>

            {/* Filter toggle */}
            <button
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all relative ${
                isFilterOpen || activeFiltersCount > 0
                  ? 'bg-[#8B5CF6]/25 text-white border border-[#8B5CF6]/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Filter Concepts and Relations"
            >
              <Filter className="w-4 h-4 text-[#8B5CF6]" />
              <span className="hidden xl:inline text-xs font-mono">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#22D3EE] text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Account / Login */}
            <Link
              href="/login"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
              title="Account & Trial Profile"
            >
              <User className="w-4 h-4 text-[#22D3EE]" />
              <span className="hidden xl:inline text-xs font-mono">Account</span>
            </Link>

            {/* Upload Chapter CTA */}
            <button
              onClick={onOpenUpload}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#6C63FF] hover:bg-[#5b51ff] text-white flex items-center gap-1.5 shadow-md shadow-[#6C63FF]/30 transition-all hover:scale-[1.02]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Upload Chapter</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Canvas Area: 80%+ Viewport */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {is3D ? (
          <Graph3D
            nodes={filteredNodes}
            edges={filteredEdges}
            selectedConceptId={selectedConceptId}
            hoveredConceptId={hoveredConceptId}
            onSelectConcept={(id) => setSelectedConceptId(id)}
            onHoverConcept={(id) => setHoveredConceptId(id)}
            onSelectRelationship={(rel) => setSelectedRelationship(rel)}
            zoomLevel={zoomLevel}
          />
        ) : (
          <Graph2D
            nodes={filteredNodes}
            edges={filteredEdges}
            selectedConceptId={selectedConceptId}
            hoveredConceptId={hoveredConceptId}
            onSelectConcept={(id) => setSelectedConceptId(id)}
            onHoverConcept={(id) => setHoveredConceptId(id)}
            onSelectRelationship={(rel) => setSelectedRelationship(rel)}
            zoomLevel={zoomLevel}
            onResetView={handleResetView}
          />
        )}

        {/* Floating Graph Controls Dock */}
        <GraphControls
          is3D={is3D}
          onToggle3D={setIs3D}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onCenterGraph={handleCenterGraph}
          isFocusMode={isFocusMode}
          onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
        />

        {/* Section Isolation Banner if section active */}
        {selectedSectionId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass-panel-elevated px-4 py-2 rounded-full border border-[#22D3EE]/40 flex items-center gap-3 text-xs shadow-lg animate-in fade-in duration-200">
            <span className="text-[#22D3EE] font-mono font-semibold">
              Isolated Section: {selectedSectionId}
            </span>
            <button
              onClick={() => {
                setSelectedSectionId(null);
                setIsolatedConceptIds([]);
              }}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-[10px]"
            >
              Clear Filter
            </button>
          </div>
        )}
      </main>

      {/* Left Collapsible Curriculum Sidebar */}
      <ChapterSidebar
        chapters={graphData.chapters}
        crossChapterLinks={graphData.crossChapterLinks}
        selectedSectionId={selectedSectionId}
        onSelectSection={(secId, conceptIds) => {
          setSelectedSectionId(secId);
          setIsolatedConceptIds(conceptIds);
        }}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(false)}
      />

      {/* Right Concept Detail Drawer */}
      <ConceptDetailPanel
        concept={selectedConcept}
        relationships={filteredEdges}
        allConcepts={graphData.nodes}
        onClose={() => setSelectedConceptId(null)}
        onSelectConcept={(id) => setSelectedConceptId(id)}
        onViewInChapter={handleViewInChapter}
        onSelectRelationship={(rel) => setSelectedRelationship(rel)}
      />

      {/* Relationship Popover Modal */}
      <RelationshipModal
        relationship={selectedRelationship}
        concepts={graphData.nodes}
        onClose={() => setSelectedRelationship(null)}
        onViewChapter={() => {}}
      />

      {/* Chapter Reader Modal for Verbatim Proof */}
      <ChapterReaderModal
        isOpen={!!readerEvidence}
        onClose={() => setReaderEvidence(null)}
        evidence={readerEvidence}
        conceptTitle={readerConceptTitle}
      />

      {/* Filter Popover Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedTypes={selectedTypes}
        onToggleType={(t) =>
          setSelectedTypes((prev) =>
            prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
          )
        }
        selectedRelations={selectedRelations}
        onToggleRelation={(r) =>
          setSelectedRelations((prev) =>
            prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
          )
        }
        onlyHighlyConnected={onlyHighlyConnected}
        onToggleHighlyConnected={() => setOnlyHighlyConnected((prev) => !prev)}
        onlyPrerequisites={onlyPrerequisites}
        onTogglePrerequisites={() => setOnlyPrerequisites((prev) => !prev)}
        onResetFilters={handleResetFilters}
      />

      {/* Command Search (CMD+K) */}
      <CommandSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        concepts={graphData.nodes}
        relationships={graphData.edges}
        chapters={graphData.chapters}
        onSelectConcept={(id) => {
          setSelectedConceptId(id);
          setIsSearchOpen(false);
        }}
        onSelectRelationship={(rel) => {
          setSelectedRelationship(rel);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
}
