import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { material, palette } from '../design';
import { createSurfaceMaps } from './surface';

type WorldProps = {
  progress?: React.RefObject<number>;
  activated: boolean;
  onActivate: () => void;
  reducedMotion: boolean;
  exploration?: boolean;
};

const clamp = THREE.MathUtils.clamp;
const smooth = (value: number) => value * value * (3 - 2 * value);

function groundHeight(x: number, z: number) {
  const grain = Math.sin(x * .11 + Math.cos(z * .055) * 1.4) * 1.05
    + Math.sin(z * .18 + x * .045) * .42
    + Math.cos(x * .37 - z * .23) * .13;
  const clearing = Math.min(1, Math.hypot(x, z) / 19);
  const observatory = clamp((Math.hypot(x - 34, z + 31) - 15) / 10, 0, 1);
  const archiveDistance = Math.hypot(x + 34, z + 23);
  const archive = smooth(clamp((archiveDistance - 10) / 8, 0, 1));
  return grain * clearing * observatory * .7 * archive - 7.2 * (1 - archive);
}

function Terrain() {
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(220, 220, 128, 128);
    const position = plane.attributes.position;
    const colors = new Float32Array(position.count * 3);
    const dark = new THREE.Color('#252320');
    const light = new THREE.Color('#4b4039');
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = -position.getY(i);
      const height = groundHeight(x, z);
      position.setZ(i, height);
      const noise = Math.sin(x * .41 + z * .2) * Math.cos(z * .27) * .5 + .5;
      color.copy(dark).lerp(light, clamp(noise * .42 + Math.max(height, 0) * .06, 0, .75));
      color.toArray(colors, i * 3);
    }
    plane.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    plane.computeVertexNormals();
    return plane;
  }, []);
  return <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <meshStandardMaterial vertexColors roughness={material.sand.roughness} metalness={material.sand.metalness} />
  </mesh>;
}

function Geology() {
  const rocks = useRef<THREE.InstancedMesh>(null);
  const shapes = useMemo(() => Array.from({ length: 175 }, (_, i) => {
    const angle = i * 2.399963;
    const radius = 17 + Math.sqrt(i) * 5.5;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    return { x, z, scale: .35 + ((i * 37) % 19) * .09, angle };
  }), []);
  useEffect(() => {
    if (!rocks.current) return;
    const transform = new THREE.Object3D();
    const color = new THREE.Color();
    shapes.forEach((rock, i) => {
      transform.position.set(rock.x, groundHeight(rock.x, rock.z) + rock.scale * .25, rock.z);
      transform.rotation.set(.2, rock.angle, -.13);
      transform.scale.set(rock.scale * 1.3, rock.scale * .7, rock.scale);
      transform.updateMatrix();
      rocks.current!.setMatrixAt(i, transform.matrix);
      color.set(i % 5 === 0 ? '#514640' : '#34302e');
      rocks.current!.setColorAt(i, color);
    });
    rocks.current.instanceMatrix.needsUpdate = true;
    if (rocks.current.instanceColor) rocks.current.instanceColor.needsUpdate = true;
  }, [shapes]);
  return <instancedMesh ref={rocks} args={[undefined, undefined, shapes.length]} castShadow receiveShadow>
    <dodecahedronGeometry args={[1, 0]} />
    <meshStandardMaterial roughness={.94} flatShading />
  </instancedMesh>;
}

function Monolith({ progress, activated, surfaces }: { progress?: React.RefObject<number>; activated: boolean; surfaces: ReturnType<typeof createSurfaceMaps> }) {
  const seams = useRef<THREE.Group>(null);
  const energy = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const presence = smooth(clamp(((progress?.current ?? .45) - .12) / .28, 0, 1));
    if (seams.current) seams.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = .08 + presence * .26 + (activated ? .37 : 0) + Math.sin(clock.elapsedTime * 1.1 + i) * .025;
    });
    if (energy.current) energy.current.intensity = .4 + presence * 3 + (activated ? 8 : 0);
  });
  return <group position={[0, 0, 0]}>
    {[0, 1, 2].map(i => <mesh key={i} position={[0, -.32 + i * .24, 0]} rotation={[0, i * Math.PI / 12, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[7.3 - i * 1.15, 8.1 - i * 1.15, .5, 8]} />
      <meshStandardMaterial color={i === 1 ? '#3c3935' : palette.stone} metalness={.42} roughness={.74} />
    </mesh>)}
    <mesh position={[0, 11.7, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.75, 3.5, 23.4, 6, 4]} />
      <meshStandardMaterial color={palette.stone} roughness={material.obsidian.roughness * 2} metalness={material.obsidian.metalness} normalMap={surfaces.normalMap} roughnessMap={surfaces.roughnessMap} flatShading />
    </mesh>
    <mesh position={[0, 11.7, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
      <cylinderGeometry args={[1.58, 3.22, 23.1, 6, 5, true]} />
      <meshStandardMaterial color="#353535" side={THREE.DoubleSide} metalness={.36} roughness={.8} normalMap={surfaces.normalMap} roughnessMap={surfaces.roughnessMap} flatShading />
    </mesh>
    {[0, 1, 2, 3, 4, 5].map(i => {
      const a = i * Math.PI / 3;
      return <group key={i} rotation={[0, a, 0]}>
        <mesh position={[0, 10.5, 3.02]} rotation={[-.07, 0, 0]} castShadow>
          <boxGeometry args={[.22, 17, .36]} />
          <meshStandardMaterial color={palette.metal} metalness={.71} roughness={.5} />
        </mesh>
        <mesh position={[0, 1.8, 5.3]} rotation={[-.32, 0, 0]} castShadow>
          <boxGeometry args={[.72, 4.2, 1.3]} />
          <meshStandardMaterial color="#2b2d2e" metalness={.38} roughness={.74} />
        </mesh>
      </group>;
    })}
    <group ref={seams}>
      {[4.2, 8.2, 12.2, 16.2, 20.2].map((height, i) => <mesh key={i} position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.26 - height * .069, .035, 4, 6]} />
        <meshBasicMaterial color={palette.signal} transparent opacity={.1} depthWrite={false} />
      </mesh>)}
    </group>
    <pointLight ref={energy} position={[0, 15, 0]} color={palette.signal} intensity={1} distance={20} />
  </group>;
}

function Observatory({ reducedMotion, surfaces }: { reducedMotion: boolean; surfaces: ReturnType<typeof createSurfaceMaps> }) {
  const armature = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (armature.current && !reducedMotion) {
      armature.current.rotation.y = clock.elapsedTime * .035;
      armature.current.rotation.z = Math.sin(clock.elapsedTime * .16) * .07;
    }
  });
  return <group position={[34, 0, -31]}>
    <mesh position={[0, .9, 0]} castShadow receiveShadow><cylinderGeometry args={[13.6, 15.5, 2.2, 16]} /><meshStandardMaterial color={palette.stone} metalness={.46} roughness={.72} normalMap={surfaces.normalMap} /></mesh>
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => {
      const angle = i * Math.PI / 6;
      return <group key={i} position={[Math.sin(angle) * 12, 0, Math.cos(angle) * 12]} rotation={[0, angle, 0]}>
        <mesh position={[0, 6.1, 0]} castShadow><cylinderGeometry args={[.58, 1.2, 12.2, 5]} /><meshStandardMaterial color={palette.metal} metalness={.67} roughness={.52} flatShading /></mesh>
        <mesh position={[0, 11.6, 0]} rotation={[.25, 0, 0]}><boxGeometry args={[1.5, .22, 1.6]} /><meshStandardMaterial color="#786f63" roughness={.49} metalness={.73} /></mesh>
      </group>;
    })}
    <group ref={armature} position={[0, 13, 0]}>
      {[0, 1, 2].map(i => <mesh key={i} rotation={[Math.PI / 2.5 + i * .5, i * .65, 0]} castShadow>
        <torusGeometry args={[7.8 - i * 1.5, .42 - i * .06, 8, 64]} />
        <meshStandardMaterial color={i === 1 ? '#9c8266' : palette.metal} metalness={.75} roughness={.42} />
      </mesh>)}
      <mesh castShadow><icosahedronGeometry args={[2, 1]} /><meshStandardMaterial color={palette.stone} metalness={.52} roughness={.4} /></mesh>
    </group>
  </group>;
}

function Archive({ activated, onActivate, reducedMotion, surfaces }: { activated: boolean; onActivate: () => void; reducedMotion: boolean; surfaces: ReturnType<typeof createSurfaceMaps> }) {
  const core = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (core.current && !reducedMotion) {
      core.current.rotation.y = clock.elapsedTime * .14;
      core.current.children.forEach((child, i) => { child.rotation.z = Math.sin(clock.elapsedTime * (.2 + i * .07) + i) * .15; });
    }
    if (light.current) light.current.intensity = activated ? 14 + Math.sin(clock.elapsedTime * 1.7) * 2 : 2.1;
  });
  return <group position={[-34, 0, -23]}>
    <mesh position={[0, -7.25, 0]} receiveShadow><cylinderGeometry args={[11.4, 11.4, .4, 24]} /><meshStandardMaterial color="#1b1f21" metalness={.48} roughness={.75} normalMap={surfaces.normalMap} /></mesh>
    {[0, 1, 2].map(i => <mesh key={i} position={[0, -5.8 + i * 2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[11.9 + i * 1.45, .34, 6, 48]} />
      <meshStandardMaterial color={i === 1 ? '#554e47' : palette.metal} roughness={.61} metalness={.64} />
    </mesh>)}
    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
      const angle = i * Math.PI / 4;
      return <group key={i} position={[Math.sin(angle) * 10.4, -3.8, Math.cos(angle) * 10.4]} rotation={[0, angle, 0]}>
        <mesh castShadow><boxGeometry args={[1.2, 7, 1.7]} /><meshStandardMaterial color="#343638" metalness={.55} roughness={.63} /></mesh>
        <mesh position={[0, -1.8, -1.01]}><boxGeometry args={[.4, 2.5, .06]} /><meshStandardMaterial color={palette.signal} emissive={palette.signal} emissiveIntensity={activated ? .95 : .18} /></mesh>
      </group>;
    })}
    <mesh position={[0, -5.8, 0]}><cylinderGeometry args={[3.7, 4.2, 1.1, 12]} /><meshStandardMaterial color={palette.stone} metalness={.73} roughness={.52} /></mesh>
    <group ref={core} position={[0, -2, 0]}>
      {[0, 1, 2].map(i => <mesh key={i} rotation={[i * .54, i * .65, .3]}>
        <torusGeometry args={[3.4 - i * .62, .13, 6, 48]} />
        <meshStandardMaterial color={i === 1 ? palette.signal : palette.metal} metalness={.65} roughness={.35} emissive={i === 1 ? palette.signal : '#000000'} emissiveIntensity={activated ? .85 : .12} />
      </mesh>)}
    </group>
    <mesh position={[0, -2, 0]} onClick={onActivate}><icosahedronGeometry args={[1.25, 2]} /><meshStandardMaterial color="#41535a" metalness={.6} roughness={.3} emissive={palette.signal} emissiveIntensity={activated ? 2 : .18} /></mesh>
    <pointLight ref={light} position={[0, -2, 0]} color={palette.signal} distance={23} />
  </group>;
}

function Ruins() {
  return <group>
    {[-1, 1].map(side => <group key={side} position={[side * 12, 0, 18]}>
      <mesh position={[0, 3.4, 0]} rotation={[0, side * .15, side * .025]} castShadow><cylinderGeometry args={[.65, 1.7, 6.8, 5]} /><meshStandardMaterial color="#303132" roughness={.7} metalness={.33} flatShading /></mesh>
      <mesh position={[0, 6.8, 0]}><boxGeometry args={[1.2, .06, 1.2]} /><meshStandardMaterial color={palette.signal} emissive={palette.signal} emissiveIntensity={.4} /></mesh>
    </group>)}
    {[0, 1, 2, 3, 4, 5].map(i => <mesh key={i} position={[-23 + i * 4, .5, 18 + Math.sin(i) * 3]} rotation={[.3, i * .6, .25]} castShadow><boxGeometry args={[2.5, 1, 4]} /><meshStandardMaterial color="#353331" roughness={.82} metalness={.18} /></mesh>)}
  </group>;
}

function Dust({ reducedMotion }: { reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = reducedMotion ? 150 : 420;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      values[i * 3] = Math.sin(i * 37.7) * 63;
      values[i * 3 + 1] = 1 + ((i * 47) % 130) / 10;
      values[i * 3 + 2] = Math.cos(i * 19.3) * 63;
    }
    return values;
  }, [reducedMotion]);
  useFrame(({ clock }) => { if (points.current && !reducedMotion) points.current.rotation.y = clock.elapsedTime * .0018; });
  return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#bbab97" size={.055} sizeAttenuation transparent opacity={.35} depthWrite={false} /></points>;
}

export function World({ progress, activated, onActivate, reducedMotion, exploration = false }: WorldProps) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.HemisphereLight>(null);
  const surfaces = useMemo(createSurfaceMaps, []);
  useEffect(() => () => { surfaces.normalMap.dispose(); surfaces.roughnessMap.dispose(); }, [surfaces]);
  useFrame(() => {
    const p = progress?.current ?? .2;
    if (sun.current) sun.current.intensity = 2.5 - smooth(clamp((p - .48) / .26, 0, 1)) * .85 + smooth(clamp((p - .82) / .18, 0, 1)) * .6;
    if (ambient.current) ambient.current.intensity = 1.05 - smooth(clamp((p - .48) / .25, 0, 1)) * .37;
  });
  return <>
    <color attach="background" args={[palette.background]} />
    <fog attach="fog" args={[palette.background, 35, 145]} />
    <hemisphereLight ref={ambient} args={['#b8ada2', '#201c1c', 1]} />
    <directionalLight ref={sun} position={[-34, 36, 18]} color="#edc7a3" intensity={2.5} castShadow shadow-mapSize={exploration || window.innerWidth < 760 ? [1024, 1024] : [2048, 2048]} shadow-camera-left={-55} shadow-camera-right={55} shadow-camera-top={55} shadow-camera-bottom={-55} shadow-bias={-.0002} />
    <ambientLight intensity={.15} />
    <Terrain />
    <Geology />
    <Monolith progress={progress} activated={activated} surfaces={surfaces} />
    <Observatory reducedMotion={reducedMotion} surfaces={surfaces} />
    <Archive activated={activated} onActivate={onActivate} reducedMotion={reducedMotion} surfaces={surfaces} />
    <Ruins />
    <Dust reducedMotion={reducedMotion} />
  </>;
}
