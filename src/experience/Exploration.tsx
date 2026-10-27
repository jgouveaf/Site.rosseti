import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { palette } from '../design';
import { World } from './World';

export type KeyState = Record<string, boolean>;

function Rover({ keys, onDiscovery }: { keys: React.RefObject<KeyState>; onDiscovery: (name: string) => void }) {
  const body = useRef<RapierRigidBody>(null);
  const wheels = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const heading = useRef(Math.PI);
  const speed = useRef(0);
  const discoveries = useRef(new Set<string>());
  const follow = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    const rb = body.current;
    if (!rb) return;
    const input = keys.current;
    if (input.KeyR) {
      rb.setTranslation({ x: 0, y: 1.1, z: 21 }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      speed.current = 0;
      heading.current = Math.PI;
      input.KeyR = false;
    }
    const throttle = Number(!!(input.KeyW || input.ArrowUp)) - Number(!!(input.KeyS || input.ArrowDown));
    const steering = Number(!!(input.KeyA || input.ArrowLeft)) - Number(!!(input.KeyD || input.ArrowRight));
    const drag = input.Space ? 5.4 : throttle === 0 ? 1.2 : .26;
    speed.current = THREE.MathUtils.clamp(speed.current + throttle * 8.8 * delta - speed.current * Math.min(1, drag * delta), -5, 13);
    heading.current += steering * Math.min(1, Math.abs(speed.current) / 6) * delta * 1.4 * Math.sign(speed.current || 1);
    const position = rb.translation();
    const velocity = rb.linvel();
    if (Math.hypot(position.x, position.z) > 58) {
      follow.set(-position.x, 0, -position.z).normalize();
      rb.setLinvel({ x: follow.x * 3, y: velocity.y, z: follow.z * 3 }, true);
      speed.current = 0;
    } else rb.setLinvel({ x: Math.sin(heading.current) * speed.current, y: velocity.y, z: Math.cos(heading.current) * speed.current }, true);
    const visualHeading = heading.current - Math.PI;
    rb.setRotation({ x: 0, y: Math.sin(visualHeading / 2), z: 0, w: Math.cos(visualHeading / 2) }, true);
    if (wheels.current) wheels.current.children.forEach(wheel => { wheel.rotation.x += speed.current * delta * .75; });
    follow.set(position.x - Math.sin(heading.current) * 8.5, 5.5, position.z - Math.cos(heading.current) * 8.5);
    camera.position.lerp(follow, 1 - Math.exp(-3.5 * delta));
    look.set(position.x + Math.sin(heading.current) * 4, 1.6, position.z + Math.cos(heading.current) * 4);
    camera.lookAt(look);
    for (const [name, x, z, radius] of [['Monólito', 0, 0, 9], ['Observatório', 34, -31, 17], ['Arquivo submerso', -34, -23, 18], ['Vestígio oculto', -43, 31, 8]] as const) {
      if (!discoveries.current.has(name) && Math.hypot(position.x - x, position.z - z) < radius) {
        discoveries.current.add(name);
        onDiscovery(name);
      }
    }
  });
  return <RigidBody ref={body} type="dynamic" colliders={false} position={[0, 1.1, 21]} enabledRotations={[false, false, false]} friction={1.2} restitution={.06} linearDamping={.45}>
    <CuboidCollider args={[.92, .4, 1.45]} />
    <group>
      <mesh castShadow><boxGeometry args={[1.7, .45, 2.55]} /><meshStandardMaterial color="#6e706f" metalness={.77} roughness={.42} /></mesh>
      <mesh position={[0, .42, -.18]} castShadow><boxGeometry args={[1.17, .58, 1.28]} /><meshStandardMaterial color="#1c2529" metalness={.68} roughness={.3} /></mesh>
      <mesh position={[0, .68, -.25]}><boxGeometry args={[.8, .08, .96]} /><meshStandardMaterial color={palette.metal} metalness={.8} roughness={.44} /></mesh>
      {[-1, 1].map(side => <group key={side}>
        <mesh position={[side * .72, .18, -.98]} castShadow><boxGeometry args={[.12, .25, .38]} /><meshStandardMaterial color={palette.stone} metalness={.65} roughness={.42} /></mesh>
        <mesh position={[side * .68, .02, -1.32]}><boxGeometry args={[.36, .12, .08]} /><meshStandardMaterial color={palette.signal} emissive={palette.signal} emissiveIntensity={.7} /></mesh>
      </group>)}
      <mesh position={[0, .08, 1.35]}><boxGeometry args={[1.3, .1, .08]} /><meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={.2} /></mesh>
      <group ref={wheels}>{[-1, 1].flatMap(x => [-1, 1].map(z => <group key={`${x}-${z}`} position={[x * .94, -.3, z * .91]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.43, .43, .26, 18]} /><meshStandardMaterial color="#151719" roughness={.94} /></mesh>
        <mesh position={[x * .15, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.22, .22, .27, 12]} /><meshStandardMaterial color="#77746e" metalness={.73} roughness={.51} /></mesh>
      </group>))}</group>
    </group>
  </RigidBody>;
}

function Obstacles() {
  return <>
    <CuboidCollider args={[75, .3, 75]} position={[0, -.3, 0]} friction={1.5} />
    <CuboidCollider args={[3.6, 12, 3.6]} position={[0, 12, 0]} />
    <CuboidCollider args={[14, 4, 14]} position={[34, 4, -31]} />
    <CuboidCollider args={[9, 2, 9]} position={[-34, -6, -23]} />
    {[-1, 1].map(side => <CuboidCollider key={side} args={[1.2, 3.5, 1.2]} position={[side * 12, 3.5, 18]} />)}
  </>;
}

export function Exploration({ keys, onDiscovery, reducedMotion }: { keys: React.RefObject<KeyState>; onDiscovery: (name: string) => void; reducedMotion: boolean }) {
  const mobile = window.innerWidth < 760;
  return <Canvas className="world-canvas" shadows dpr={mobile ? [1, 1.15] : [1, 1.55]} camera={{ position: [0, 5.5, 30], fov: 48, near: .1, far: 210 }} gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.06 }}>
    <Suspense fallback={null}>
      <World activated={false} onActivate={() => {}} reducedMotion={reducedMotion} exploration />
      <Physics gravity={[0, -18, 0]} interpolate>
        <Obstacles />
        <Rover keys={keys} onDiscovery={onDiscovery} />
      </Physics>
    </Suspense>
  </Canvas>;
}
