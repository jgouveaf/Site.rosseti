import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { World } from './World';

export type ExperienceMode = 'story' | 'expedition';
export type KeyState = Record<string, boolean>;

const shots = [
  { at: 0, position: [0, 7.7, 26], target: [0, 6, 0] },
  { at: .22, position: [5, 5.6, 13], target: [0, 7, 0] },
  { at: .43, position: [27, 12, 7], target: [20, 8, -16] },
  { at: .59, position: [13, 6, 16], target: [10, 4, 3] },
  { at: .82, position: [-14, 9, 4], target: [-22, 5, -16] },
  { at: 1, position: [0, 33, 50], target: [0, 3, -2] },
] as const;

function StoryCamera({ progress, mode, reducedMotion }: { progress: React.RefObject<number>; mode: ExperienceMode; reducedMotion: boolean }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    if (mode === 'expedition') return;
    const p = Math.max(0, Math.min(1, progress.current));
    const found = shots.findIndex((shot, i) => i < shots.length - 1 && p >= shot.at && p <= shots[i + 1].at);
    const index = found < 0 ? shots.length - 2 : found;
    const a = shots[index];
    const b = shots[index + 1];
    const t = (p - a.at) / (b.at - a.at);
    const eased = t * t * (3 - 2 * t);
    desired.set(a.position[0], a.position[1], a.position[2]).lerp(new THREE.Vector3(b.position[0], b.position[1], b.position[2]), eased);
    target.set(a.target[0], a.target[1], a.target[2]).lerp(new THREE.Vector3(b.target[0], b.target[1], b.target[2]), eased);
    const speed = reducedMotion ? 20 : 3.6;
    camera.position.lerp(desired, 1 - Math.exp(-speed * delta));
    camera.lookAt(target);
  });
  return null;
}

function Rover({ keys, mode, onDiscovery }: { keys: React.RefObject<KeyState>; mode: ExperienceMode; onDiscovery: (name: string) => void }) {
  const body = useRef<RapierRigidBody>(null);
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const heading = useRef(Math.PI);
  const speed = useRef(0);
  const discoveries = useRef(new Set<string>());
  const follow = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (mode === 'expedition') {
      body.current?.setTranslation({ x: 0, y: 1.1, z: 13 }, true);
      body.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
      speed.current = 0;
      heading.current = Math.PI;
    }
  }, [mode]);

  useFrame((_, delta) => {
    const rb = body.current;
    if (!rb || mode !== 'expedition') return;
    const input = keys.current;
    if (input.KeyR) {
      rb.setTranslation({ x: 0, y: 1.1, z: 13 }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      speed.current = 0;
      heading.current = Math.PI;
      input.KeyR = false;
    }
    const throttle = Number(!!(input.KeyW || input.ArrowUp)) - Number(!!(input.KeyS || input.ArrowDown));
    const steering = Number(!!(input.KeyA || input.ArrowLeft)) - Number(!!(input.KeyD || input.ArrowRight));
    const drag = input.Space ? 5 : throttle === 0 ? 1.5 : .28;
    speed.current += throttle * 8.8 * delta;
    speed.current -= speed.current * Math.min(1, drag * delta);
    speed.current = THREE.MathUtils.clamp(speed.current, -5, 13);
    heading.current += steering * Math.min(1, Math.abs(speed.current) / 6) * delta * 1.45 * Math.sign(speed.current || 1);
    const position = rb.translation();
    const velocity = rb.linvel();
    const horizontal = Math.hypot(position.x, position.z);
    if (horizontal > 40) {
      const inward = new THREE.Vector3(-position.x, 0, -position.z).normalize();
      rb.setLinvel({ x: inward.x * 3, y: velocity.y, z: inward.z * 3 }, true);
      speed.current = 0;
    } else {
      rb.setLinvel({ x: Math.sin(heading.current) * speed.current, y: velocity.y, z: Math.cos(heading.current) * speed.current }, true);
    }
    rb.setRotation({ x: 0, y: Math.sin(heading.current / 2), z: 0, w: Math.cos(heading.current / 2) }, true);
    if (group.current) group.current.children.forEach(wheel => { wheel.rotation.x += speed.current * delta * .75; });
    follow.set(position.x - Math.sin(heading.current) * 8, 5, position.z - Math.cos(heading.current) * 8);
    camera.position.lerp(follow, 1 - Math.exp(-3.5 * delta));
    look.set(position.x + Math.sin(heading.current) * 3, 1.4, position.z + Math.cos(heading.current) * 3);
    camera.lookAt(look);
    for (const [name, x, z, radius] of [['Monólito', 0, 0, 7], ['Observatório', 20, -16, 13], ['Núcleo', -22, -16, 9]] as const) {
      if (!discoveries.current.has(name) && Math.hypot(position.x - x, position.z - z) < radius) {
        discoveries.current.add(name);
        onDiscovery(name);
      }
    }
  });

  return <RigidBody ref={body} type="dynamic" colliders={false} position={[0, 1.1, 13]} enabledTranslations={[true, true, true]} enabledRotations={[false, false, false]} friction={1.3} restitution={.08} linearDamping={.5}>
    <CuboidCollider args={[.85, .35, 1.35]} />
    <group visible={mode === 'expedition'}>
      <mesh castShadow><boxGeometry args={[1.5, .5, 2.5]} /><meshStandardMaterial color="#74726d" metalness={.83} roughness={.28} /></mesh>
      <mesh position={[0, .4, -.15]} castShadow><boxGeometry args={[1.08, .55, 1.25]} /><meshStandardMaterial color="#171e23" metalness={.75} roughness={.24} /></mesh>
      <mesh position={[0, .02, -1.35]}><boxGeometry args={[1.2, .13, .13]} /><meshBasicMaterial color="#79B8C8" /></mesh>
      <mesh position={[0, .02, 1.35]}><boxGeometry args={[1.2, .12, .12]} /><meshBasicMaterial color="#C99D70" /></mesh>
      <group ref={group}>{[-1, 1].flatMap(x => [-1, 1].map(z => <group key={`${x}-${z}`} position={[x * .85, -.24, z * .85]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.42, .42, .22, 16]} /><meshStandardMaterial color="#141719" roughness={.88} /></mesh>
      </group>))}</group>
    </group>
  </RigidBody>;
}

function Obstacles() {
  return <>
    <CuboidCollider args={[60, .3, 60]} position={[0, -.3, 0]} friction={1.5} />
    <CuboidCollider args={[2.2, 7, 2.2]} position={[0, 7, 0]} />
    <CuboidCollider args={[11, 3, 11]} position={[20, 2, -16]} />
    <CuboidCollider args={[7, 2, 7]} position={[-22, 1, -16]} />
    {[-1, 1].map(side => <CuboidCollider key={side} args={[.6, 2.5, .6]} position={[side * 7, 2.5, 12]} />)}
  </>;
}

export function Experience({ progress, mode, keys, activated, onActivate, onDiscovery, reducedMotion }: {
  progress: React.RefObject<number>;
  mode: ExperienceMode;
  keys: React.RefObject<KeyState>;
  activated: boolean;
  onActivate: () => void;
  onDiscovery: (name: string) => void;
  reducedMotion: boolean;
}) {
  return <Canvas className="world-canvas" shadows dpr={[1, 1.7]} camera={{ position: [0, 7.7, 26], fov: 48, near: .1, far: 180 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <Suspense fallback={null}>
      <World activated={activated} onActivate={onActivate} reducedMotion={reducedMotion} />
      <Physics gravity={[0, -18, 0]} interpolate>
        <Obstacles />
        <Rover keys={keys} mode={mode} onDiscovery={onDiscovery} />
      </Physics>
      <StoryCamera progress={progress} mode={mode} reducedMotion={reducedMotion} />
    </Suspense>
  </Canvas>;
}
