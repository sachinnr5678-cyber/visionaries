'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Concept, Relationship } from '@/types/graph';
import { Sparkles, Layers, ArrowRight, GitCommit } from 'lucide-react';

interface Graph2DProps {
  nodes: Concept[];
  edges: Relationship[];
  selectedConceptId: string | null;
  hoveredConceptId: string | null;
  onSelectConcept: (conceptId: string) => void;
  onHoverConcept: (conceptId: string | null) => void;
  onSelectRelationship: (rel: Relationship) => void;
  zoomLevel: number;
  onResetView: () => void;
}

const CATEGORY_COLORS: Record<string, { fill: string; border: string; text: string; glow: string }> = {
  'core-math': {
    fill: 'rgba(34, 211, 238, 0.12)',
    border: 'rgba(34, 211, 238, 0.5)',
    text: '#22D3EE',
    glow: 'rgba(34, 211, 238, 0.3)',
  },
  transforms: {
    fill: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.5)',
    text: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.3)',
  },
  'ml-bridge': {
    fill: 'rgba(108, 99, 255, 0.12)',
    border: 'rgba(108, 99, 255, 0.5)',
    text: '#6C63FF',
    glow: 'rgba(108, 99, 255, 0.3)',
  },
  'deep-learning': {
    fill: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.5)',
    text: '#34D399',
    glow: 'rgba(52, 211, 153, 0.3)',
  },
  optimization: {
    fill: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.5)',
    text: '#FBBF24',
    glow: 'rgba(251, 191, 36, 0.3)',
  },
};

export default function Graph2D({
  nodes,
  edges,
  selectedConceptId,
  hoveredConceptId,
  onSelectConcept,
  onHoverConcept,
  onSelectRelationship,
  zoomLevel,
  onResetView,
}: Graph2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan and Zoom transform states
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Custom node positions allowing drag repositioning
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodeDragOffset, setNodeDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize node positions based on preset data
  useEffect(() => {
    const initialPos: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      initialPos[n.id] = {
        x: (n.x || 0) * 1.5,
        y: (n.y || 0) * 1.3,
      };
    });
    setNodePositions(initialPos);
  }, [nodes]);

  // Synchronize zoom level from props
  useEffect(() => {
    if (zoomLevel) {
      setScale(zoomLevel);
    }
  }, [zoomLevel]);

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  // Canvas Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.graph-node')) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      // Repositioning a specific node
      setNodePositions((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: (e.clientX - pan.x) / scale - nodeDragOffset.x,
          y: (e.clientY - pan.y) / scale - nodeDragOffset.y,
        },
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const startNodeDrag = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const pos = nodePositions[nodeId] || { x: 0, y: 0 };
    setDraggingNodeId(nodeId);
    setNodeDragOffset({
      x: (e.clientX - pan.x) / scale - pos.x,
      y: (e.clientY - pan.y) / scale - pos.y,
    });
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full overflow-hidden stem-grid-bg cursor-grab active:cursor-grabbing select-none"
    >
      {/* Visual Canvas World */}
      <div
        className="absolute top-1/2 left-1/2 transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        {/* SVG Bezier Edges */}
        <svg
          className="absolute -top-[3000px] -left-[3000px] w-[6000px] h-[6000px] pointer-events-none overflow-visible"
          style={{ transform: 'translate(3000px, 3000px)' }}
        >
          <defs>
            <marker
              id="arrow-marker"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6C63FF" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#22D3EE" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const p1 = nodePositions[edge.source] || { x: 0, y: 0 };
            const p2 = nodePositions[edge.target] || { x: 0, y: 0 };

            const isConnected =
              edge.source === selectedConceptId ||
              edge.target === selectedConceptId ||
              edge.source === hoveredConceptId ||
              edge.target === hoveredConceptId;

            const isDimmed =
              (selectedConceptId || hoveredConceptId) && !isConnected;

            // Compute curved bezier control points
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const cx1 = p1.x + dx * 0.5 - dy * 0.15;
            const cy1 = p1.y + dy * 0.5 + dx * 0.15;

            const pathString = `M ${p1.x} ${p1.y} Q ${cx1} ${cy1} ${p2.x} ${p2.y}`;

            return (
              <g key={edge.id} className="cursor-pointer pointer-events-auto">
                {/* Background wide hit area for easy clicking */}
                <path
                  d={pathString}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  onClick={() => onSelectRelationship(edge)}
                />

                {/* Visible curved stroke */}
                <path
                  d={pathString}
                  fill="none"
                  stroke={isConnected ? '#22D3EE' : '#6C63FF'}
                  strokeWidth={isConnected ? '2.5' : '1.5'}
                  strokeOpacity={isDimmed ? 0.15 : isConnected ? 0.95 : 0.45}
                  strokeDasharray={isConnected ? 'none' : '4 4'}
                  markerEnd={isConnected ? 'url(#arrow-active)' : 'url(#arrow-marker)'}
                  className="transition-all duration-200"
                />

                {/* Relationship label on curve midpoint */}
                <foreignObject
                  x={(p1.x + p2.x) / 2 - 45}
                  y={(p1.y + p2.y) / 2 - 14}
                  width="90"
                  height="28"
                  className="pointer-events-auto"
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRelationship(edge);
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono text-center truncate border transition-all cursor-pointer shadow-md ${
                      isConnected
                        ? 'bg-[#22D3EE]/25 text-[#22D3EE] border-[#22D3EE]/60 font-semibold'
                        : isDimmed
                        ? 'opacity-20 bg-black text-slate-500 border-white/5'
                        : 'bg-[#0B1020]/90 text-slate-300 border-white/10 hover:border-[#6C63FF]/60 hover:text-white'
                    }`}
                  >
                    {edge.relation}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => {
          const pos = nodePositions[node.id] || { x: 0, y: 0 };
          const isSelected = selectedConceptId === node.id;
          const isHovered = hoveredConceptId === node.id;

          const isConnected = edges.some(
            (e) =>
              (e.source === node.id && (e.target === selectedConceptId || e.target === hoveredConceptId)) ||
              (e.target === node.id && (e.source === selectedConceptId || e.source === hoveredConceptId))
          );

          const isDimmed =
            (selectedConceptId || hoveredConceptId) &&
            !isSelected &&
            !isHovered &&
            !isConnected;

          const theme = CATEGORY_COLORS[node.category] || CATEGORY_COLORS['core-math'];

          // Node width and height based on importance
          const sizeScale = 0.9 + (node.importance / 10) * 0.3;

          return (
            <div
              key={node.id}
              onMouseDown={(e) => startNodeDrag(e, node.id)}
              onClick={() => onSelectConcept(node.id)}
              onMouseEnter={() => onHoverConcept(node.id)}
              onMouseLeave={() => onHoverConcept(null)}
              className={`graph-node absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 select-none ${
                isDimmed ? 'opacity-25 blur-[0.5px]' : 'opacity-100'
              }`}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: `translate(-50%, -50%) scale(${
                  isSelected ? 1.15 : isHovered ? 1.08 : sizeScale
                })`,
                zIndex: isSelected ? 40 : isHovered ? 35 : 10,
              }}
            >
              <div
                className="relative rounded-2xl px-4 py-3 min-w-[140px] max-w-[200px] glass-panel-elevated border flex flex-col items-center text-center shadow-xl group"
                style={{
                  backgroundColor: isSelected ? 'rgba(15, 23, 46, 0.96)' : theme.fill,
                  borderColor: isSelected ? '#22D3EE' : isHovered ? theme.text : theme.border,
                  boxShadow: isSelected
                    ? `0 0 25px ${theme.glow}, 0 10px 30px rgba(0,0,0,0.8)`
                    : isHovered
                    ? `0 0 18px ${theme.glow}`
                    : '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                {/* Node category mini tag */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.text }}
                  />
                  <span
                    className="text-[9px] font-mono uppercase tracking-wider font-semibold"
                    style={{ color: theme.text }}
                  >
                    {node.type}
                  </span>
                </div>

                {/* Node Title */}
                <div className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight line-clamp-2">
                  {node.label}
                </div>

                {/* Importance score dot indicator */}
                <div className="mt-2 flex items-center gap-1 text-[9px] font-mono text-slate-400">
                  <span>Imp:</span>
                  <span className="font-semibold text-slate-200">{node.importance}/10</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
