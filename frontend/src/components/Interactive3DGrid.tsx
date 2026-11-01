'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/context/ThemeContext';

export const Interactive3DGrid: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Wireframe geometric mesh representing DOM topology
    const geometry = new THREE.IcosahedronGeometry(5, 2);
    const wireframe = new THREE.WireframeGeometry(geometry);

    const wireColor = theme === 'light' ? 0x0891b2 : 0x06b6d4;
    const lineMaterial = new THREE.LineBasicMaterial({
      color: wireColor,
      transparent: true,
      opacity: theme === 'light' ? 0.35 : 0.45,
    });
    const line = new THREE.LineSegments(wireframe, lineMaterial);
    scene.add(line);

    // Inner orbiting core
    const coreGeo = new THREE.OctahedronGeometry(2, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: theme === 'light' ? 0x0f172a : 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Dynamic Nodes / Particles along vertices
    const particlesCount = 80;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 5.2 + Math.random() * 0.4;
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.14,
      color: theme === 'light' ? 0x0891b2 : 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = (y / rect.height) * 2;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation loop (60 FPS)
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      line.rotation.y += 0.003;
      line.rotation.x = targetY * 0.4;
      line.rotation.z = targetX * 0.4;

      core.rotation.y -= 0.006;
      core.rotation.x -= 0.004;

      particleSystem.rotation.y += 0.003;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      lineMaterial.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[360px] sm:h-[440px] relative pointer-events-none select-none flex items-center justify-center"
    />
  );
};
