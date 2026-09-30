'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeroNode {
  name: string;
  pos: [number, number, number];
  color: string;
  size: number;
}

const HERO_NODES: HeroNode[] = [
  { name: 'Linear Algebra', pos: [0, 0.8, 0], color: '#6C63FF', size: 0.28 },
  { name: 'Matrices', pos: [-2.2, 0.4, 0.5], color: '#22D3EE', size: 0.24 },
  { name: 'Vectors', pos: [-3.2, -0.6, -0.2], color: '#38BDF8', size: 0.2 },
  { name: 'Transformations', pos: [-1.2, -1.2, 0.8], color: '#8B5CF6', size: 0.22 },
  { name: 'Eigenvalues', pos: [1.8, 1.4, -0.6], color: '#A78BFA', size: 0.23 },
  { name: 'Neural Networks', pos: [2.5, -0.4, 0.7], color: '#34D399', size: 0.28 },
  { name: 'Optimization', pos: [1.2, -1.6, -0.4], color: '#FBBF24', size: 0.22 },
  { name: 'Gradient Descent', pos: [3.4, -1.2, 0.2], color: '#F472B6', size: 0.21 },
  { name: 'Loss Function', pos: [2.2, -2.1, -0.8], color: '#EC4899', size: 0.19 },
];

const HERO_EDGES: [number, number][] = [
  [0, 1], // Linear Alg -> Matrices
  [1, 2], // Matrices -> Vectors
  [1, 3], // Matrices -> Transformations
  [0, 4], // Linear Alg -> Eigenvalues
  [0, 5], // Linear Alg -> Neural Networks
  [3, 5], // Transformations -> Neural Networks
  [5, 6], // Neural Networks -> Optimization
  [6, 7], // Optimization -> Gradient Descent
  [7, 8], // Gradient Descent -> Loss Function
  [4, 3], // Eigenvalues -> Transformations
];

export default function LandingHeroGraph3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050816, 0.12);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6c63ff, 3, 20);
    pointLight1.position.set(2, 4, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x22d3ee, 2, 20);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // Graph Root Group for subtle floating rotation
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // Create Nodes
    const nodeMeshes: THREE.Mesh[] = [];
    HERO_NODES.forEach((node) => {
      // Core sphere
      const geometry = new THREE.SphereGeometry(node.size, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.color),
        emissive: new THREE.Color(node.color),
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...node.pos);
      graphGroup.add(mesh);
      nodeMeshes.push(mesh);

      // Subtle glow outer halo
      const glowGeo = new THREE.SphereGeometry(node.size * 1.5, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        transparent: true,
        opacity: 0.18,
        wireframe: true,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.set(...node.pos);
      graphGroup.add(glowMesh);
    });

    // Create Animated Edges
    const lineMaterials: THREE.LineBasicMaterial[] = [];
    HERO_EDGES.forEach(([i1, i2]) => {
      const p1 = new THREE.Vector3(...HERO_NODES[i1].pos);
      const p2 = new THREE.Vector3(...HERO_NODES[i2].pos);

      const points = [p1, p2];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x4f46e5,
        transparent: true,
        opacity: 0.45,
      });
      lineMaterials.push(lineMaterial);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      graphGroup.add(line);
    });

    // Floating Ambient Dust Particles
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse Interaction Parallax
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      targetX = (event.clientX - windowHalfX) * 0.0006;
      targetY = (event.clientY - windowHalfY) * 0.0006;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Gentle floating rotation
      graphGroup.rotation.y = Math.sin(elapsedTime * 0.15) * 0.25;
      graphGroup.rotation.x = Math.cos(elapsedTime * 0.12) * 0.12;

      // Mouse Parallax Lerp
      camera.position.x += (targetX * 2 - camera.position.x) * 0.04;
      camera.position.y += (-targetY * 2 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Pulse edge opacity
      lineMaterials.forEach((mat, idx) => {
        mat.opacity = 0.3 + 0.3 * Math.sin(elapsedTime * 2 + idx);
      });

      // Slowly float particles
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-80"
      aria-hidden="true"
    />
  );
}
