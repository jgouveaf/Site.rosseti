import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { explorationData } from '../data/exploration';
import { World } from './World';
import { InteractiveSites } from './InteractiveSites';

function GalleryCamera({ index, detailOpen, reducedMotion }: { index: number; detailOpen: boolean; reducedMotion: boolean }) {
  const { camera, gl, pointer, size } = useThree();
  const look = useRef(new THREE.Vector3(0, 8, 0));
  const desired = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    const record = explorationData.interactives[index];
    const view = detailOpen ? record.detailCamera : record.camera;
    desired.set(...view.position);
    if (!reducedMotion) { desired.x += pointer.x * 1.2; desired.y += pointer.y * .6; }
    target.set(...view.target);
    if (size.width < 650 && !detailOpen) target.set(record.position[0], record.position[1] + 4, record.position[2]);
    const speed = reducedMotion ? 18 : 3;
    camera.position.lerp(desired, 1 - Math.exp(-speed * Math.min(delta, .1)));
    look.current.lerp(target, 1 - Math.exp(-speed * Math.min(delta, .1)));
    camera.lookAt(look.current);
    if (import.meta.env.DEV) gl.domElement.dataset.galleryView = record.id;
  });
  return null;
}

function GalleryGestures({ onNavigate, detailOpen }: { onNavigate: (direction: number) => void; detailOpen: boolean }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    let lastNavigation = 0;
    let wheelAmount = 0;
    let start: { x: number; y: number } | null = null;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      if (detailOpen) return;
      if (performance.now() - lastNavigation < 900) { wheelAmount = 0; return; }
      wheelAmount += event.deltaY;
      if (Math.abs(wheelAmount) > 55) { onNavigate(Math.sign(wheelAmount)); lastNavigation = performance.now(); wheelAmount = 0; }
    };
    const down = (event: PointerEvent) => { start = { x: event.clientX, y: event.clientY }; };
    const up = (event: PointerEvent) => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!detailOpen && Math.max(Math.abs(dx), Math.abs(dy)) > 65) onNavigate(Math.abs(dx) > Math.abs(dy) ? -Math.sign(dx) : -Math.sign(dy));
      start = null;
    };
    const cancel = () => { start = null; };
    canvas.addEventListener('wheel', wheel, { passive: false });
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', cancel);
    return () => { canvas.removeEventListener('wheel', wheel); canvas.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', cancel); };
  }, [gl, onNavigate, detailOpen]);
  return null;
}

export function Exploration({ index, detailOpen, mechanisms, onNavigate, onInteract, reducedMotion }: {
  index: number; detailOpen: boolean; mechanisms: Set<string>; onNavigate: (direction: number) => void; onInteract: (id: string) => void; reducedMotion: boolean;
}) {
  return <Canvas className="world-canvas" shadows dpr={[1, window.innerWidth < 760 ? 1.15 : 1.55]} camera={{ position: [13, 10, 30], fov: 48, near: .1, far: 210 }} gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.18 }}>
    <Suspense fallback={null}>
      <GalleryCamera index={index} detailOpen={detailOpen} reducedMotion={reducedMotion} />
      <GalleryGestures onNavigate={onNavigate} detailOpen={detailOpen} />
      <World activated={mechanisms.has('monolith-signal')} archiveActivated={mechanisms.has('archive-fragment')} observatoryAligned={mechanisms.has('observatory-orbit')} onActivate={() => onInteract('archive-fragment')} reducedMotion={reducedMotion} exploration />
      <InteractiveSites index={index} mechanisms={mechanisms} onInteract={onInteract} reducedMotion={reducedMotion} />
    </Suspense>
  </Canvas>;
}
