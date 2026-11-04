/**
 * @fileoverview Interactive 3D Particle Wave Background
 *
 * Uses Three.js to render a grid of golden particles that undulate like a
 * wave. The camera responds subtly to mouse movement. Cleans up WebGL
 * contexts on unmount to prevent memory leaks.
 *
 * Path: apps/web/components/shared/ParticleBackground.jsx
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParticleBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ── 1. Setup Scene, Camera, Renderer ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 750;
    camera.position.y = 300;
    camera.rotation.x = -0.3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // ── 2. Create the Particle Grid ──
    const numParticles = 1400;
    const positions = new Float32Array(numParticles * 3);
    
    let i = 0;
    const amountX = 40;
    const amountY = 35;
    const separation = 80;

    for (let ix = 0; ix < amountX; ix++) {
      for (let iy = 0; iy < amountY; iy++) {
        positions[i] = ix * separation - ((amountX * separation) / 2); // x
        positions[i + 1] = 0; // y
        positions[i + 2] = iy * separation - ((amountY * separation) / 2); // z
        i += 3;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xF59E0B, // Brand Gold
      size: 3.5,
      transparent: true,
      opacity: 0.7,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ── 3. Interaction State ──
    let count = 0;
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let animationFrameId;

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onDocumentMouseMove = (event) => {
      mouse.targetX = (event.clientX - window.innerWidth / 2) * 0.2;
      mouse.targetY = (event.clientY - window.innerHeight / 2) * 0.2;
    };

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onDocumentMouseMove);

    // ── 4. Animation Loop ──
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      camera.position.x = mouse.x;
      camera.position.y = 300 - mouse.y;
      camera.lookAt(0, 0, 0);

      const pos = particles.geometry.attributes.position.array;
      let k = 0;

      for (let ix = 0; ix < amountX; ix++) {
        for (let iy = 0; iy < amountY; iy++) {
          pos[k + 1] = (Math.sin((ix + count) * 0.3) * 35) + (Math.sin((iy + count) * 0.5) * 35);
          k += 3;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      count += 0.08;
      renderer.render(scene, camera);
    };

    animate();

    // ── 5. Cleanup on Unmount ──
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      
      geometry.dispose();
      material.dispose();
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-screen h-screen z-0 pointer-events-none" 
      aria-hidden="true" 
    />
  );
};

export default ParticleBackground;