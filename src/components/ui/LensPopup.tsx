import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { motion } from 'motion/react';
import { sound } from '../../utils/audio';
import { AQUILA_BG_CANVAS_ID } from '../aquila/ThreeCanvas';
import type { OriginRect } from './ExpandPopup';

/**
 * Jesper's "Profile" popup, rebuilt for Aquila: a glass object appears in the
 * middle of the screen and refracts the page behind it like a lens, with the
 * content floating inside. Here the object is Aquila's own capsule mark.
 *
 * How the lens works: the current page (3D background + logo) is snapshotted
 * into a texture, drawn full-screen in a WebGL scene, and a physically-based
 * glass capsule (transmission + IOR + iridescence) bends that texture.
 */

interface LensPopupProps {
  origin: OriginRect;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}

const OPEN_MS = 1100;
const CLOSE_MS = 650;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Stadium (pill) outline with a stadium hole: Aquila's capsule as a glass ring. */
function capsuleGeometry(width: number, height: number, wall: number) {
  const stadium = (w: number, h: number) => {
    const s = new THREE.Shape();
    const r = h / 2;
    const x = w / 2 - r;
    s.moveTo(-x, -r);
    s.lineTo(x, -r);
    s.absarc(x, 0, r, -Math.PI / 2, Math.PI / 2, false);
    s.lineTo(-x, r);
    s.absarc(-x, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
    return s;
  };
  const outer = stadium(width, height);
  const inner = stadium(width - wall * 2, height - wall * 2);
  outer.holes.push(new THREE.Path(inner.getPoints(96)));
  const geo = new THREE.ExtrudeGeometry(outer, {
    depth: wall * 0.9,
    bevelEnabled: true,
    bevelThickness: wall * 0.45,
    bevelSize: wall * 0.42,
    bevelSegments: 10,
    curveSegments: 64,
  });
  geo.center();
  return geo;
}

/** Copy what is currently on screen (WebGL background + the logo SVG) into a canvas. */
async function snapshotPage(width: number, height: number): Promise<HTMLCanvasElement> {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  // Every full-screen canvas on the page (home 3D background, Europe US map)
  const sources = Array.from(
    document.querySelectorAll<HTMLCanvasElement>(`#${AQUILA_BG_CANVAS_ID}, canvas[data-lens-source]`)
  );
  for (const src of sources) {
    try {
      const r = src.getBoundingClientRect();
      const sx = width / window.innerWidth;
      const sy = height / window.innerHeight;
      ctx.drawImage(src, r.left * sx, r.top * sy, r.width * sx, r.height * sy);
    } catch {
      /* ignore */
    }
  }
  // Dim veil over the map so the lens reads the same on every page
  if (document.querySelector('canvas[data-lens-source]')) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, width, height);
  }

  const svg = document.querySelector('[data-aquila-logo] svg') as SVGSVGElement | null;
  if (svg) {
    const rect = svg.getBoundingClientRect();
    const sx = width / window.innerWidth;
    const sy = height / window.innerHeight;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll('image').forEach((n) => n.remove()); // external photos would taint the canvas
    clone.setAttribute('width', String(rect.width));
    clone.setAttribute('height', String(rect.height));
    const markup = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, rect.left * sx, rect.top * sy, rect.width * sx, rect.height * sy);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    });
    URL.revokeObjectURL(url);
  }
  return c;
}

export const LensPopup: React.FC<LensPopupProps> = ({ origin, onClose, label, children }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const closingRef = useRef(false);
  const [closing, setClosing] = useState(false);
  const [inner, setInner] = useState({ w: 600, h: 300 });
  const [ready, setReady] = useState(false);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    sound.close();
    setClosing(true);
  };

  useLayoutEffect(() => {
    returnFocus.current = document.activeElement;
    sound.open();
    return () => (returnFocus.current as HTMLElement | null)?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let raf = 0;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Warm studio environment (soft room + golden light strips) for Jesper-like chrome highlights
    const envScene = new RoomEnvironment();
    const strip = (color: string, intensity: number, w: number, h: number, pos: [number, number, number], rotY = 0) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
      );
      m.position.set(...pos);
      m.rotation.y = rotY;
      envScene.add(m);
    };
    strip('#ffcf8a', 14, 16, 1.6, [0, 5.5, -6]);
    strip('#ffe7c2', 12, 1.6, 12, [-8, 1, -2], Math.PI / 2);
    strip('#ffb46a', 10, 1.6, 12, [8, 1, -2], -Math.PI / 2);
    strip('#ffffff', 8, 12, 0.8, [0, -4, 6], Math.PI);
    strip('#ffdcae', 9, 6, 6, [0, 0, 8], Math.PI);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(envScene, 0.02).texture;
    scene.environment = envTex;

    const camDist = 10;
    const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
    camera.position.z = camDist;
    const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(35 / 2)) * camDist;
    const viewW = viewH * (W / H);
    const pxPerUnit = H / viewH;

    // Backdrop: the snapshotted page, dimmed as the lens opens
    const backdropTex = new THREE.CanvasTexture(document.createElement('canvas'));
    backdropTex.colorSpace = THREE.SRGBColorSpace;
    const backdropMat = new THREE.MeshBasicMaterial({ map: backdropTex, toneMapped: false });
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(viewW, viewH), backdropMat);
    backdrop.position.z = -0.01;
    scene.add(backdrop);
    snapshotPage(Math.round(W * Math.min(dpr, 1.5)), Math.round(H * Math.min(dpr, 1.5))).then((c) => {
      if (disposed) return;
      backdropTex.image = c;
      backdropTex.needsUpdate = true;
      setReady(true);
    });

    // The capsule, sized to the viewport (vertical on portrait screens)
    const portrait = W / H < 0.85;
    const longSide = portrait ? Math.min(viewH * 0.78, viewW * 1.9) : Math.min(viewW * 0.74, viewH * 1.55);
    const shortSide = portrait ? Math.min(viewW * 0.86, longSide * 0.62) : Math.min(viewH * 0.66, longSide * 0.5);
    const wall = Math.min(longSide, shortSide) * 0.085;
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#fff3e2'),
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.96,
      thickness: wall * 3.2,
      ior: 1.6,
      dispersion: 0.5,
      iridescence: 0.25,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [250, 600],
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color('#e9c99b'),
      attenuationDistance: wall * 4,
      envMapIntensity: 2.5,
      specularIntensity: 1,
    });
    const capsule = new THREE.Mesh(capsuleGeometry(longSide, shortSide, wall), glassMat);
    if (portrait) capsule.rotation.z = Math.PI / 2;
    const group = new THREE.Group();
    group.add(capsule);
    scene.add(group);

    // Inner opening in CSS pixels, for the DOM content
    const innerLong = (longSide - wall * 2.6) * pxPerUnit;
    const innerShort = (shortSide - wall * 2.6) * pxPerUnit;
    setInner(portrait ? { w: innerShort, h: innerLong } : { w: innerLong * 0.8, h: innerShort });

    // Floating glass shards around the lens
    const shards: { mesh: THREE.Mesh; dir: THREE.Vector3; spin: THREE.Vector3 }[] = [];
    const shardGeo = new THREE.BoxGeometry(1, 1, 0.18);
    for (let i = 0; i < 7; i++) {
      const s = wall * (0.6 + Math.random() * 0.9);
      const m = new THREE.Mesh(shardGeo, glassMat);
      m.scale.setScalar(s);
      const a = (i / 7) * Math.PI * 2 + Math.random() * 0.5;
      const rr = 0.55 + Math.random() * 0.35;
      const dir = new THREE.Vector3(Math.cos(a) * longSide * rr * 0.6, Math.sin(a) * shortSide * rr * 0.75, 0.6 + Math.random());
      shards.push({ mesh: m, dir, spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.6) });
      scene.add(m);
    }

    // Lens flies from the clicked element to the centre
    const ox = ((origin.left + origin.width / 2) / W - 0.5) * viewW;
    const oy = -((origin.top + origin.height / 2) / H - 0.5) * viewH;

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / W) * 2 - 1;
      mouse.ty = (e.clientY / H) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);

    const start = performance.now();
    let closeStart = 0;
    const clock = new THREE.Clock();

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const time = clock.getElapsedTime();
      let p: number;
      if (closingRef.current) {
        if (!closeStart) closeStart = now;
        const c = reduce ? 1 : Math.min(1, (now - closeStart) / CLOSE_MS);
        p = 1 - easeInOutCubic(c);
        if (c >= 1) {
          cancelAnimationFrame(raf);
          onClose();
          return;
        }
      } else {
        p = reduce ? 1 : easeOutExpo(Math.min(1, (now - start) / OPEN_MS));
      }

      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      const dim = 1 - 0.55 * p;
      backdropMat.color.setRGB(dim, dim, dim);

      group.position.set(ox * (1 - p), oy * (1 - p), (1 - p) * -2);
      group.scale.setScalar(0.25 + 0.75 * p);
      group.rotation.x = (1 - p) * 1.1 + mouse.y * 0.12 + Math.sin(time * 0.6) * 0.02;
      group.rotation.y = (1 - p) * -0.8 + mouse.x * 0.16;

      shards.forEach(({ mesh, dir, spin }, i) => {
        mesh.position.set(dir.x * p, dir.y * p + Math.sin(time * 0.8 + i) * 0.08, dir.z * p);
        mesh.rotation.set(time * spin.x, time * spin.y, time * spin.z);
        mesh.visible = p > 0.02;
      });

      renderer.render(scene, camera);
    };
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      capsule.geometry.dispose();
      shardGeo.dispose();
      glassMat.dispose();
      backdrop.geometry.dispose();
      backdropMat.dispose();
      backdropTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={label}>
      <div ref={mountRef} className="absolute inset-0" style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.25s' }} />

      <button
        ref={closeRef}
        type="button"
        onClick={close}
        className="j-label absolute right-0 top-0 z-20 j-chrome cursor-pointer transition-opacity duration-300 hover:opacity-60 focus-visible:outline-none focus-visible:underline underline-offset-4"
        style={{ opacity: closing ? 0 : 1 }}
      >
        Fechar
      </button>

      {/* Click anywhere outside the content to close */}
      <div className="absolute inset-0 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && close()}>
        <motion.div
          className="flex flex-col items-center justify-center text-center overflow-y-auto overscroll-contain"
          style={{ width: inner.w, maxHeight: inner.h }}
          initial="hidden"
          animate={ready && !closing ? 'shown' : closing ? 'gone' : 'hidden'}
          variants={{
            hidden: {},
            shown: { transition: { staggerChildren: 0.07, delayChildren: 0.45 } },
            gone: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
          }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};
