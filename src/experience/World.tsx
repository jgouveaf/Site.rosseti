import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const stone = '#111317';
const metal = '#45484D';
const signal = '#79B8C8';

function Terrain() {
  const geometry = useMemo(() => {
    const shape = new THREE.PlaneGeometry(180, 180, 96, 96);
    const positions = shape.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const distance = Math.hypot(x, y);
      const wave = Math.sin(x * .19 + Math.cos(y * .07)) * .32 + Math.cos(y * .13 + x * .05) * .25;
      positions.setZ(i, distance < 17 ? wave * .15 : wave * Math.min(1, (distance - 17) / 12));
    }
    shape.computeVertexNormals();
    return shape;
  }, []);
  return <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <meshStandardMaterial color="#24201f" roughness={1} flatShading />
  </mesh>;
}

function Monolith({ activated }: { activated: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * .12) * .035;
  });
  return <group ref={group} position={[0, 0, 0]}>
    <mesh position={[0, 7, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.25, 2.15, 14, 5]} />
      <meshStandardMaterial color={stone} metalness={.38} roughness={.27} flatShading />
    </mesh>
    <mesh position={[0, 7, 0]} rotation={[0, Math.PI / 5, 0]}>
      <cylinderGeometry args={[1.28, 2.18, 14.04, 5, 1, true]} />
      <meshStandardMaterial color="#7d6858" metalness={.75} roughness={.35} side={THREE.DoubleSide} wireframe transparent opacity={.19} />
    </mesh>
    {[3.1, 5.7, 8.3, 10.9].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.57 - y * .028, .016, 6, 5]} />
      <meshBasicMaterial color={signal} transparent opacity={activated ? .85 : .18} />
    </mesh>)}
    <pointLight position={[0, 8, 0]} color={signal} intensity={activated ? 18 : 1.2} distance={18} />
  </group>;
}

function Observatory({ activated }: { activated: boolean }) {
  const rings = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (rings.current) {
      rings.current.rotation.z = clock.elapsedTime * .055;
      rings.current.rotation.y = clock.elapsedTime * .04;
    }
  });
  return <group position={[20, 0, -16]}>
    <mesh position={[0, 1, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[11, 13, 2, 12]} />
      <meshStandardMaterial color={stone} metalness={.45} roughness={.65} />
    </mesh>
    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
      const a = i * Math.PI / 4;
      return <group key={i} position={[Math.sin(a) * 9, 0, Math.cos(a) * 9]}>
        <mesh position={[0, 4.2, 0]} castShadow>
          <boxGeometry args={[1.1, 8.4, 1.1]} />
          <meshStandardMaterial color={metal} metalness={.82} roughness={.4} />
        </mesh>
        <mesh position={[0, 8.45, 0]}>
          <boxGeometry args={[1.25, .09, 1.25]} />
          <meshBasicMaterial color={signal} transparent opacity={activated ? .75 : .22} />
        </mesh>
      </group>;
    })}
    <group ref={rings} position={[0, 9, 0]}>
      <mesh rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[5.1, .3, 8, 72]} />
        <meshStandardMaterial color={metal} metalness={.85} roughness={.25} />
      </mesh>
      <mesh rotation={[0, Math.PI / 3, 0]}>
        <torusGeometry args={[4.1, .16, 8, 72]} />
        <meshStandardMaterial color="#9a8066" metalness={.9} roughness={.27} />
      </mesh>
      <mesh><icosahedronGeometry args={[1.55, 1]} /><meshStandardMaterial color={stone} metalness={.6} roughness={.2} /></mesh>
    </group>
  </group>;
}

function EnergyCore({ activated, onActivate }: { activated: boolean; onActivate: () => void }) {
  const orb = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (orb.current) {
      orb.current.rotation.y += .003;
      orb.current.position.y = 5 + Math.sin(clock.elapsedTime * .9) * .25;
    }
  });
  return <group position={[-22, 0, -16]}>
    <mesh position={[0, .65, 0]} receiveShadow>
      <cylinderGeometry args={[7, 8, 1.3, 12]} />
      <meshStandardMaterial color={stone} metalness={.65} roughness={.4} />
    </mesh>
    {[0, 1, 2].map(i => <mesh key={i} position={[0, 2.4 + i * 1.1, 0]} rotation={[-Math.PI / 2, 0, i * .28]}>
      <torusGeometry args={[5.5 - i * 1.15, .24, 8, 80]} />
      <meshStandardMaterial color={i === 1 ? '#8d7057' : metal} metalness={.8} roughness={.35} />
    </mesh>)}
    <mesh ref={orb} position={[0, 5, 0]} onClick={onActivate} castShadow>
      <icosahedronGeometry args={[1.7, 2]} />
      <meshStandardMaterial color={activated ? signal : '#253c43'} emissive={signal} emissiveIntensity={activated ? 2.3 : .2} metalness={.55} roughness={.2} />
    </mesh>
    <pointLight position={[0, 5, 0]} color={signal} intensity={activated ? 28 : 3} distance={25} />
  </group>;
}

function Ruins() {
  const stones = useMemo(() => Array.from({ length: 48 }, (_, i) => {
    const angle = i * 2.39996;
    const radius = 17 + Math.sqrt(i) * 8;
    return { x: Math.sin(angle) * radius, z: Math.cos(angle) * radius, height: .8 + (i * 17 % 11) * .32, angle };
  }), []);
  return <group>
    {stones.map((rock, i) => <mesh key={i} position={[rock.x, rock.height / 2, rock.z]} rotation={[.06, rock.angle, -.04]} castShadow>
      <dodecahedronGeometry args={[rock.height, 0]} />
      <meshStandardMaterial color={i % 4 === 0 ? '#49403a' : '#302d2e'} roughness={.95} flatShading />
    </mesh>)}
    {[-1, 1].map(side => <group key={side} position={[side * 7, 0, 12]}>
      <mesh position={[0, 2.5, 0]} castShadow><boxGeometry args={[1.1, 5, 1.1]} /><meshStandardMaterial color={metal} metalness={.65} roughness={.5} /></mesh>
      <mesh position={[0, 5.05, 0]}><boxGeometry args={[1.2, .1, 1.2]} /><meshBasicMaterial color={signal} /></mesh>
    </group>)}
  </group>;
}

function Dust({ reducedMotion }: { reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const array = new Float32Array((reducedMotion ? 160 : 550) * 3);
    for (let i = 0; i < array.length; i += 3) {
      array[i] = Math.sin(i * 17.18) * 52;
      array[i + 1] = 1 + ((i * 23) % 150) / 10;
      array[i + 2] = Math.cos(i * 12.74) * 52;
    }
    return array;
  }, [reducedMotion]);
  useFrame(({ clock }) => { if (points.current && !reducedMotion) points.current.rotation.y = clock.elapsedTime * .002; });
  return <points ref={points}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial color="#c6a886" size={.055} sizeAttenuation transparent opacity={.48} depthWrite={false} />
  </points>;
}

export function World({ activated, onActivate, reducedMotion }: { activated: boolean; onActivate: () => void; reducedMotion: boolean }) {
  return <>
    <color attach="background" args={['#08090B']} />
    <fog attach="fog" args={['#08090B', 28, 118]} />
    <hemisphereLight args={['#b1aaa2', '#1b1415', 1.25]} />
    <directionalLight position={[-17, 25, 14]} intensity={3.1} color="#e3b995" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-45} shadow-camera-right={45} shadow-camera-top={45} shadow-camera-bottom={-45} />
    <ambientLight intensity={.25} />
    <Terrain />
    <Monolith activated={activated} />
    <Observatory activated={activated} />
    <EnergyCore activated={activated} onActivate={onActivate} />
    <Ruins />
    <Dust reducedMotion={reducedMotion} />
  </>;
}
