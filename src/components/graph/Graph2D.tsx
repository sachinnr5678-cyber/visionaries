'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Concept, Relationship } from '@/types/graph';
import { Sparkles, Layers, ArrowRight, GitCommit, Cpu, Zap, Share2, Compass } from 'lucide-react';

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

  // Initialize node positions with collision-free physical separation
  useEffect(() => {
    const initialPos: Record<string, { x: number; y: number }> = {};
    const nList = [...nodes];
    
    nList.forEach((n, idx) => {
      if (n.x !== undefined && n.y !== undefined && (n.x !== 0 || n.y !== 0)) {
        initialPos[n.id] = {
          x: n.x * 1.15,
          y: n.y * 1.15,
        };
      } else {
        const theta = (idx / Math.max(1, nList.length)) * 2 * Math.PI;
        const rad = 280 + (idx % 3) * 60;
        initialPos[n.id] = {
          x: Math.cos(theta) * rad,
          y: Math.sin(theta) * rad,
        };
      }
    });

    // Anti-collision relaxation: enforce minimum 240px separation between all node cards
    const MIN_DIST = 240;
    for (let step = 0; step < 40; step++) {
      for (let i = 0; i < nList.length; i++) {
        for (let j = i + 1; j < nList.length; j++) {
          const idA = nList[i].id;
          const idB = nList[j].id;
          const posA = initialPos[idA];
          const posB = initialPos[idB];
          if (!posA || !posB) continue;

          let dx = posB.x - posA.x;
          let dy = posB.y - posA.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1e-3) {
            dx = (Math.random() - 0.5) * 10;
            dy = (Math.random() - 0.5) * 10;
            dist = Math.sqrt(dx * dx + dy * dy);
          }

          if (dist < MIN_DIST) {
            const overlap = (MIN_DIST - dist) * 0.5;
            const pushX = (dx / dist) * overlap;
            const pushY = (dy / dist) * overlap;
            posA.x -= pushX;
            posA.y -= pushY;
            posB.x += pushX;
            posB.y += pushY;
          }
        }
      }
    }

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
            <style>
              {`
                @keyframes flowLineAnimation {
                  from { stroke-dashoffset: 42; }
                  to { stroke-dashoffset: 0; }
                }
                .flow-dashes {
                  stroke-dasharray: 8 6;
                  animation: flowLineAnimation 1.6s linear infinite;
                }
                .flow-dashes-active {
                  stroke-dasharray: 10 5;
                  animation: flowLineAnimation 0.8s linear infinite;
                }
              `}
            </style>
            <filter id="packet-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
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
                  strokeWidth="20"
                  onClick={() => onSelectRelationship(edge)}
                />

                {/* Visible curved stroke with flowing dashed motion */}
                <path
                  d={pathString}
                  fill="none"
                  stroke={isConnected ? '#22D3EE' : '#6366F1'}
                  strokeWidth={isConnected ? '3' : '1.8'}
                  strokeOpacity={isDimmed ? 0.15 : isConnected ? 1 : 0.55}
                  markerEnd={isConnected ? 'url(#arrow-active)' : 'url(#arrow-marker)'}
                  className={isConnected ? 'flow-dashes-active transition-all' : 'flow-dashes transition-all'}
                />

                {/* Animated Luminous Traveling Energy Packets (Connection Flow) */}
                <circle
                  r={isConnected ? '5' : '3.6'}
                  fill={isConnected ? '#22D3EE' : '#38BDF8'}
                  filter="url(#packet-glow)"
                  opacity={isDimmed ? 0.2 : 0.95}
                >
                  <animateMotion
                    dur={isConnected ? '2s' : '3s'}
                    repeatCount="indefinite"
                    path={pathString}
                  />
                </circle>
                <circle
                  r={isConnected ? '4' : '2.8'}
                  fill="#A855F7"
                  filter="url(#packet-glow)"
                  opacity={isDimmed ? 0.15 : 0.85}
                >
                  <animateMotion
                    dur={isConnected ? '2s' : '3s'}
                    begin={isConnected ? '1s' : '1.5s'}
                    repeatCount="indefinite"
                    path={pathString}
                  />
                </circle>

                {/* Relationship label on curve midpoint */}
                <foreignObject
                  x={(p1.x + p2.x) / 2 - 58}
                  y={(p1.y + p2.y) / 2 - 14}
                  width="116"
                  height="28"
                  className="pointer-events-auto"
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRelationship(edge);
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono flex items-center justify-center gap-1 border transition-all cursor-pointer shadow-md ${
                      isConnected
                        ? 'bg-[#22D3EE]/25 text-[#22D3EE] border-[#22D3EE]/70 font-semibold shadow-lg shadow-[#22D3EE]/20'
                        : isDimmed
                        ? 'opacity-20 bg-black text-slate-500 border-white/5'
                        : 'bg-[#0B1020]/95 text-slate-300 border-white/10 hover:border-[#6C63FF]/60 hover:text-white backdrop-blur-md'
                    }`}
                  >
                    <span className="truncate">{edge.relation}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-[#22D3EE] shrink-0" />
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
          const sizeScale = 0.95 + (node.importance / 10) * 0.25;

          const connCount = edges.filter(
            (e) => e.source === node.id || e.target === node.id
          ).length;

          // Category icon selector
          const renderCategoryIcon = () => {
            switch (node.category) {
              case 'transforms':
                return <Layers className="w-3 h-3" />;
              case 'optimization':
                return <Zap className="w-3 h-3" />;
              case 'deep-learning':
                return <Cpu className="w-3 h-3" />;
              case 'ml-bridge':
                return <Share2 className="w-3 h-3" />;
              default:
                return <GitCommit className="w-3 h-3" />;
            }
          };

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
                className="relative rounded-2xl p-3.5 min-w-[150px] max-w-[210px] glass-panel-elevated border flex flex-col items-center text-center shadow-xl group overflow-hidden"
                style={{
                  backgroundColor: isSelected ? 'rgba(15, 23, 46, 0.98)' : theme.fill,
                  borderColor: isSelected ? '#22D3EE' : isHovered ? theme.text : theme.border,
                  boxShadow: isSelected
                    ? `0 0 30px ${theme.glow}, 0 10px 30px rgba(0,0,0,0.85)`
                    : isHovered
                    ? `0 0 20px ${theme.glow}`
                    : '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                {/* Luminous Top Color Strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ backgroundColor: theme.text }}
                />

                {/* Node category mini tag with STEM Icon */}
                <div className="flex items-center gap-1.5 mb-1.5 pt-0.5">
                  <span style={{ color: theme.text }}>
                    {renderCategoryIcon()}
                  </span>
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

                {/* Connection Flow & Importance Stats */}
                <div className="mt-2.5 pt-2 border-t border-white/5 w-full flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-[#22D3EE]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
                    <span>{connCount} {connCount === 1 ? 'link' : 'links'}</span>
                  </span>
                  <span className="font-semibold text-slate-200">
                    ★ {node.importance}/10
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
