import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
  interactive?: boolean;
}

/** Canvas id used by the glass-lens popup to sample the scene behind it. */
export const AQUILA_BG_CANVAS_ID = 'aquila-bg-canvas';

/**
 * Aquila's kinetic background: particle constellation, wireframe orbital and a
 * receding perspective floor grid (Jesper-style depth), with a camera that
 * drifts toward the cursor.
 */
export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ interactive = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 14, 46);

    const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0.6, 18);

    // preserveDrawingBuffer lets the lens popup copy this frame as its backdrop
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.id = AQUILA_BG_CANVAS_ID;
    currentMount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pointLight = new THREE.PointLight(0xffffff, 2.5, 30);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Particle constellation
    const particleCount = 320;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      fog: true,
    });
    const particles = new THREE.Points(geometry, pMaterial);
    scene.add(particles);

    // Wireframe orbital
    const torusGeo = new THREE.TorusGeometry(8.5, 0.015, 16, 120);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, wireframe: true });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 3;
    scene.add(torus);

    // Perspective floor grid, fading into the fog like Jesper's stage
    const grid = new THREE.GridHelper(120, 80, 0xffffff, 0xffffff);
    const gridMat = grid.material as THREE.LineBasicMaterial;
    gridMat.transparent = true;
    gridMat.opacity = 0.13;
    gridMat.fog = true;
    grid.position.y = -5.8;
    scene.add(grid);

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = currentMount.getBoundingClientRect();
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId = 0;
    const clock = new THREE.Clock();
    // Intro: camera glides in from further back on first load
    const introStart = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const intro = reduceMotion ? 1 : Math.min(1, (performance.now() - introStart) / 2600);
      const ease = 1 - Math.pow(1 - intro, 3);

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      pointLight.position.x = mouse.x * 12;
      pointLight.position.y = mouse.y * 8;

      camera.position.x = mouse.x * 1.4;
      camera.position.y = 0.6 + mouse.y * 0.8;
      camera.position.z = 30 - 12 * ease;
      camera.lookAt(0, -0.5, 0);

      torus.rotation.z = t * 0.04;
      torus.rotation.y = mouse.x * 0.3;
      torus.rotation.x = Math.PI / 3 + mouse.y * 0.2;

      particles.rotation.y = t * 0.015 + mouse.x * 0.15;
      particles.rotation.x = mouse.y * 0.1;

      // Floor slowly travels toward the viewer
      grid.position.z = reduceMotion ? 0 : (t * 0.6) % 1.5;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount.contains(renderer.domElement)) currentMount.removeChild(renderer.domElement);
      geometry.dispose();
      pMaterial.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      grid.geometry.dispose();
      gridMat.dispose();
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden opacity-90 transition-opacity duration-1000"
    />
  );
};
