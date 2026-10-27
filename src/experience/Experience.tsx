import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { World } from './World';

const positions = [
  [12, 8, 57],
  [10, 7, 30],
  [-8, 9, 15],
  [-27, 2.4, -10],
  [-34, -2.7, -12],
  [3, 34, 65],
] as const;

const targets = [
  [0, 10, -5],
  [0, 12, 0],
  [0, 11, 0],
  [-34, -3, -23],
  [-34, -2, -23],
  [0, 2, -20],
] as const;

function CameraPath({ progress, reducedMotion }: { progress: React.RefObject<number>; reducedMotion: boolean }) {
  const { camera } = useThree();
  const path = useMemo(() => new THREE.CatmullRomCurve3(positions.map(p => new THREE.Vector3(...p)), false, 'centripetal'), []);
  const gaze = useMemo(() => new THREE.CatmullRomCurve3(targets.map(p => new THREE.Vector3(...p)), false, 'centripetal'), []);
  const look = useMemo(() => new THREE.Vector3(...targets[0]), []);
  const nextPosition = useMemo(() => new THREE.Vector3(), []);
  const nextLook = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    const p = THREE.MathUtils.clamp(progress.current, 0, 1);
    path.getPoint(p, nextPosition);
    gaze.getPoint(p, nextLook);
    const ease = 1 - Math.exp(-(reducedMotion ? 18 : 3.4) * delta);
    camera.position.lerp(nextPosition, ease);
    look.lerp(nextLook, ease);
    camera.lookAt(look);
  });
  return null;
}

export function Experience({ progress, activated, onActivate, reducedMotion }: {
  progress: React.RefObject<number>;
  activated: boolean;
  onActivate: () => void;
  reducedMotion: boolean;
}) {
  const mobile = window.innerWidth < 760;
  return <Canvas className="world-canvas" shadows dpr={mobile ? [1, 1.25] : [1, 1.75]} camera={{ position: [...positions[0]], fov: 39, near: .1, far: 210 }} gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }}>
    <Suspense fallback={null}>
      <World progress={progress} activated={activated} onActivate={onActivate} reducedMotion={reducedMotion} />
      <CameraPath progress={progress} reducedMotion={reducedMotion} />
    </Suspense>
  </Canvas>;
}
