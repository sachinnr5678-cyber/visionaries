'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Concept, Relationship } from '@/types/graph';

interface Graph3DProps {
  nodes: Concept[];
  edges: Relationship[];
  selectedConceptId: string | null;
  hoveredConceptId: string | null;
  onSelectConcept: (conceptId: string) => void;
  onHoverConcept: (conceptId: string | null) => void;
  onSelectRelationship: (rel: Relationship) => void;
  zoomLevel: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'core-math': '#22D3EE',
  transforms: '#8B5CF6',
  'ml-bridge': '#6C63FF',
  'deep-learning': '#34D399',
  optimization: '#FBBF24',
};

function makeTextSprite(message: string, colorHex: string) {
  if (typeof document === 'undefined') return new THREE.Sprite();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite();

  // Glass pill background
  ctx.fillStyle = 'rgba(11, 16, 32, 0.88)';
  ctx.beginPath();
  ctx.roundRect(16, 16, 480, 96, 24);
  ctx.fill();

  // Outer border with category accent
  ctx.lineWidth = 4;
  ctx.strokeStyle = colorHex;
  ctx.stroke();

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const display = message.length > 22 ? message.slice(0, 20) + '...' : message;
  ctx.fillText(display, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.2, 0.55, 1);
  return sprite;
}

export default function Graph3D({
  nodes,
  edges,
  selectedConceptId,
  hoveredConceptId,
  onSelectConcept,
  onHoverConcept,
  onSelectRelationship,
  zoomLevel,
}: Graph3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 14));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const [tooltipData, setTooltipData] = useState<{
    concept: Concept;
    x: number;
    y: number;
  } | null>(null);

  // Keep references to node meshes for raycasting
  const nodeMeshMap = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050816, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.copy(targetCameraPos.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x22d3ee, 2, 50);
    blueLight.position.set(-6, -6, 5);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 2, 50);
    purpleLight.position.set(6, 6, 5);
    scene.add(purpleLight);

    // Graph Root Group
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // Map of node positions
    const nodePositions = new Map<string, THREE.Vector3>();

    // 2. Build 3D Nodes with Anti-Collision Separation
    nodeMeshMap.current.clear();

    nodes.forEach((node) => {
      const posX = (node.x || 0) * 0.018;
      const posY = -(node.y || 0) * 0.018;
      const posZ = (node.z || 0) * 0.035;
      const pos = new THREE.Vector3(posX, posY, posZ);
      nodePositions.set(node.id, pos);
    });

    // 3D Anti-Collision Pass: Guarantee spheres never intersect or merge
    const min3DSep = 1.45;
    const posEntries = Array.from(nodePositions.entries());
    for (let step = 0; step < 25; step++) {
      for (let i = 0; i < posEntries.length; i++) {
        for (let j = i + 1; j < posEntries.length; j++) {
          const pA = posEntries[i][1];
          const pB = posEntries[j][1];
          const diff = new THREE.Vector3().subVectors(pB, pA);
          let dist = diff.length();
          if (dist < 1e-3) {
            diff.set((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
            dist = diff.length();
          }
          if (dist < min3DSep) {
            const overlap = (min3DSep - dist) * 0.5;
            const push = diff.normalize().multiplyScalar(overlap);
            pA.sub(push);
            pB.add(push);
          }
        }
      }
    }

    nodes.forEach((node) => {
      const pos = nodePositions.get(node.id) || new THREE.Vector3();
      const colorHex = CATEGORY_COLORS[node.category] || '#6C63FF';
      const radius = 0.28 + (node.importance / 10) * 0.22;

      // Sphere mesh
      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        emissive: new THREE.Color(colorHex),
        emissiveIntensity: 0.5,
        roughness: 0.15,
        metalness: 0.85,
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.copy(pos);
      mesh.userData = { id: node.id, concept: node };
      graphGroup.add(mesh);
      nodeMeshMap.current.set(node.id, mesh);

      // Subtle outer glow halo
      const haloGeo = new THREE.SphereGeometry(radius * 1.45, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.15,
        wireframe: true,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.set(0, 0, 0);
      haloMesh.raycast = () => {}; // Never intercept raycaster
      mesh.add(haloMesh);

      // Floating concept name billboard sprite in 3D
      const textSprite = makeTextSprite(node.label, colorHex);
      textSprite.position.set(pos.x, pos.y + radius + 0.42, pos.z);
      textSprite.raycast = () => {}; // Raycaster hits the sphere
      graphGroup.add(textSprite);
    });

    // 3. Build 3D Edges with Pulsing Lines and Dual Flow Energy Packets
    const edgeLines: {
      line: THREE.Line;
      material: THREE.LineBasicMaterial;
      edge: Relationship;
    }[] = [];

    // Particle packets that travel along edges
    const packetGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const packetMatCyan = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const packetMatViolet = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    const packetMeshes: {
      mesh: THREE.Mesh;
      p1: THREE.Vector3;
      p2: THREE.Vector3;
      speed: number;
      progress: number;
    }[] = [];

    edges.forEach((edge) => {
      const p1 = nodePositions.get(edge.source);
      const p2 = nodePositions.get(edge.target);
      if (!p1 || !p2) return;

      const points = [p1, p2];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.55,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      graphGroup.add(line);
      edgeLines.push({ line, material: lineMat, edge });

      // Staggered packet 1 (cyan)
      const packet1 = new THREE.Mesh(packetGeometry, packetMatCyan);
      packet1.position.copy(p1);
      graphGroup.add(packet1);
      packetMeshes.push({
        mesh: packet1,
        p1,
        p2,
        speed: 0.007 + Math.random() * 0.005,
        progress: Math.random(),
      });

      // Staggered packet 2 (violet, opposite phase)
      const packet2 = new THREE.Mesh(packetGeometry, packetMatViolet);
      packet2.position.copy(p1);
      graphGroup.add(packet2);
      packetMeshes.push({
        mesh: packet2,
        p1,
        p2,
        speed: 0.007 + Math.random() * 0.005,
        progress: (Math.random() + 0.5) % 1,
      });
    });

    // 4. Ambient Floating Dust Particles
    const dustCount = 180;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 30;
      dustPos[i + 1] = (Math.random() - 0.5) * 20;
      dustPos[i + 2] = (Math.random() - 0.5) * 16;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // 5. Raycasting for Interaction (Hover & Click)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        // Orbit camera around currentLookAt
        const rotSpeed = 0.005;
        const offset = camera.position.clone().sub(currentLookAt.current);

        // Horizontal orbit
        const radius = offset.length();
        let theta = Math.atan2(offset.x, offset.z);
        let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

        theta -= deltaX * rotSpeed;
        phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - deltaY * rotSpeed));

        offset.x = radius * Math.sin(phi) * Math.sin(theta);
        offset.y = radius * Math.cos(phi);
        offset.z = radius * Math.sin(phi) * Math.cos(theta);

        targetCameraPos.current.copy(currentLookAt.current).add(offset);
      } else {
        // Raycast hover check (non-recursive to only intersect parent node spheres)
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          Array.from(nodeMeshMap.current.values()),
          false
        );

        const hit = intersects.find((i) => (i.object as THREE.Mesh)?.userData?.concept);
        if (hit) {
          const hitMesh = hit.object as THREE.Mesh;
          const concept = hitMesh.userData.concept as Concept;
          if (concept && concept.id) {
            onHoverConcept(concept.id);
            setTooltipData({
              concept,
              x: e.clientX,
              y: e.clientY,
            });
            return;
          }
        }

        onHoverConcept(null);
        setTooltipData(null);
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        const delta = Math.hypot(e.clientX - prevMouseX, e.clientY - prevMouseY);
        isDragging = false;
        // If not dragged significantly, treat as click
        if (delta < 5) {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(
            Array.from(nodeMeshMap.current.values()),
            false
          );
          const hit = intersects.find((i) => (i.object as THREE.Mesh)?.userData?.id);
          if (hit) {
            const hitMesh = hit.object as THREE.Mesh;
            const conceptId = hitMesh.userData.id as string;
            if (conceptId) {
              onSelectConcept(conceptId);
            }
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.015;
      const offset = targetCameraPos.current.clone().sub(currentLookAt.current);
      const newLen = Math.max(4, Math.min(30, offset.length() + zoomFactor));
      offset.setLength(newLen);
      targetCameraPos.current.copy(currentLookAt.current).add(offset);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Handle Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 6. Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // Smooth camera lerp
      camera.position.lerp(targetCameraPos.current, 0.08);
      currentLookAt.current.lerp(targetLookAt.current, 0.08);
      camera.lookAt(currentLookAt.current);

      // Animate packet movements along edges
      packetMeshes.forEach((packet) => {
        packet.progress = (packet.progress + packet.speed) % 1;
        packet.mesh.position.lerpVectors(packet.p1, packet.p2, packet.progress);
      });

      // Subtle slow node hover bounce & pulse
      nodeMeshMap.current.forEach((mesh, id) => {
        const isHovered = hoveredConceptId === id;
        const isSelected = selectedConceptId === id;
        const mat = mesh.material as THREE.MeshStandardMaterial;

        if (isSelected) {
          mesh.scale.setScalar(1.35);
          mat.emissiveIntensity = 1.0;
        } else if (isHovered) {
          mesh.scale.setScalar(1.2);
          mat.emissiveIntensity = 0.85;
        } else {
          mesh.scale.setScalar(1.0);
          mat.emissiveIntensity = 0.45;
        }
      });

      // Pulse edge lines
      edgeLines.forEach(({ material, edge }, i) => {
        const isConnected =
          edge.source === selectedConceptId ||
          edge.target === selectedConceptId ||
          edge.source === hoveredConceptId ||
          edge.target === hoveredConceptId;

        if (isConnected) {
          material.color.setHex(0x22d3ee);
          material.opacity = 0.9;
        } else if (selectedConceptId || hoveredConceptId) {
          material.color.setHex(0x312e81);
          material.opacity = 0.15;
        } else {
          material.color.setHex(0x4f46e5);
          material.opacity = 0.35 + 0.15 * Math.sin(elapsed * 2 + i);
        }
      });

      // Ambient dust rotation
      dustPoints.rotation.y = elapsed * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [nodes, edges]);

  // Adjust camera when a node is selected (Smooth focus on node)
  useEffect(() => {
    if (selectedConceptId) {
      const selectedMesh = nodeMeshMap.current.get(selectedConceptId);
      if (selectedMesh) {
        const nodePos = selectedMesh.position.clone();
        targetLookAt.current.copy(nodePos);
        targetCameraPos.current.set(nodePos.x, nodePos.y, nodePos.z + 5.5);
      }
    }
  }, [selectedConceptId]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Node Hover Tooltip */}
      {tooltipData && (
        <div
          className="fixed pointer-events-none z-50 glass-panel-elevated p-3 rounded-2xl border border-[#6C63FF]/40 shadow-xl max-w-xs -translate-x-1/2 -translate-y-full mb-3 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y - 10}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white text-xs">
              {tooltipData.concept.label}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#22D3EE]">
              {tooltipData.concept.type}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug">
            {tooltipData.concept.description}
          </p>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10 text-[10px] font-mono text-slate-400">
            <span>Importance: {tooltipData.concept.importance}/10</span>
            <span className="text-[#34D399]">Click to inspect</span>
          </div>
        </div>
      )}
    </div>
  );
}
