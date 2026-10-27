import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { explorationData, memoryArtwork, type InteractiveRecord } from '../data/exploration';
import { palette } from '../design';

function MemoryImage({ record, active, onInteract, reducedMotion }: { record: InteractiveRecord; active: boolean; onInteract: (id: string) => void; reducedMotion: boolean }) {
  const texture = useLoader(THREE.TextureLoader, memoryArtwork(record));
  const image = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { texture.colorSpace = THREE.SRGBColorSpace; }, [texture]);
  useEffect(() => { if (!active) setHovered(false); }, [active]);
  useEffect(() => { if (active && hovered) { document.body.style.cursor = 'pointer'; return () => { document.body.style.cursor = ''; }; } }, [active, hovered]);
  useFrame(({ clock, camera }, delta) => {
    if (!image.current) return;
    image.current.quaternion.copy(camera.quaternion);
    image.current.scale.setScalar(THREE.MathUtils.damp(image.current.scale.x, hovered ? 1.2 : 1, 5, delta));
    image.current.position.y = record.position[1] + (reducedMotion ? 0 : Math.sin(clock.elapsedTime * .7) * .12);
  });
  return <group ref={image} position={record.position} visible={active} onPointerOver={event => { event.stopPropagation(); setHovered(true); }} onPointerOut={() => setHovered(false)} onClick={event => { event.stopPropagation(); if (event.delta < 8) onInteract(record.id); }}>
    <mesh><boxGeometry args={[5.4, 3.45, .12]} /><meshStandardMaterial color="#17242b" roughness={.25} metalness={.8} emissive={palette.signal} emissiveIntensity={hovered ? .5 : .12} /></mesh>
    <mesh position={[0, 0, .07]}><planeGeometry args={[5.15, 3.22]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    <pointLight color={palette.signal} intensity={4} distance={10} />
  </group>;
}

function GateLeaf({ side, open }: { side: number; open: boolean }) {
  const leaf = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (leaf.current) leaf.current.position.x = THREE.MathUtils.damp(leaf.current.position.x, -43 + side * (open ? 4.7 : 1.5), 3, delta); });
  return <group ref={leaf} position={[-43 + side * 1.5, 3, 34]}>
    <mesh castShadow><boxGeometry args={[3, 6, .55]} /><meshStandardMaterial color="#303538" metalness={.65} roughness={.48} /></mesh>
    <mesh position={[-side * 1.38, 0, -.29]}><boxGeometry args={[.06, 5.5, .03]} /><meshBasicMaterial color={open ? palette.signal : palette.accent} /></mesh>
  </group>;
}

function ArchiveShard({ index, active, reducedMotion }: { index: number; active: boolean; reducedMotion: boolean }) {
  const shard = useRef<THREE.Group>(null);
  const offset = useRef(0);
  useFrame(({ clock }, delta) => {
    if (!shard.current) return;
    offset.current = THREE.MathUtils.damp(offset.current, active ? 1 : 0, 2.5, delta);
    const a = index * Math.PI / 3 + (reducedMotion ? 0 : clock.elapsedTime * .12 * offset.current);
    const r = 5 + offset.current * 2;
    shard.current.position.set(-34 + Math.sin(a) * r, -5.8 + offset.current * (4 + index * .25), -23 + Math.cos(a) * r);
    shard.current.rotation.set(.25 * offset.current, -a, .1);
  });
  return <group ref={shard}><mesh castShadow><boxGeometry args={[1.25, .18, 2.4]} /><meshStandardMaterial color="#3d494c" metalness={.7} roughness={.4} /></mesh><mesh position={[0, .1, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.06, 1.9]} /><meshBasicMaterial color={palette.signal} /></mesh></group>;
}

export function InteractiveSites({ index, mechanisms, onInteract, reducedMotion }: { index: number; mechanisms: Set<string>; onInteract: (id: string) => void; reducedMotion: boolean }) {
  const open = mechanisms.has('buried-gate');
  return <>
    {explorationData.interactives.map((record, i) => <MemoryImage key={record.id} record={record} active={i === index} onInteract={onInteract} reducedMotion={reducedMotion} />)}
    {Array.from({ length: 6 }, (_, i) => <ArchiveShard key={i} index={i} active={mechanisms.has('archive-fragment')} reducedMotion={reducedMotion} />)}
    <group onClick={event => { event.stopPropagation(); if (event.delta < 8) onInteract('buried-gate'); }}>
      {[-1, 1].map(side => <mesh key={side} position={[-43 + side * 4.2, 3.5, 39.5]} castShadow><boxGeometry args={[1.4, 7, 13]} /><meshStandardMaterial color="#292f32" metalness={.4} roughness={.68} /></mesh>)}
      <mesh position={[-43, 7, 39.5]} castShadow><boxGeometry args={[9.8, 1, 13]} /><meshStandardMaterial color="#252b2d" roughness={.7} /></mesh>
      <mesh position={[-43, 3.5, 46]}><boxGeometry args={[9.8, 7, 1]} /><meshStandardMaterial color="#252b2d" roughness={.7} /></mesh>
      <GateLeaf side={-1} open={open} /><GateLeaf side={1} open={open} />
    </group>
    <pointLight position={[-43, 5, 40]} color={palette.signal} intensity={open ? 32 : 3} distance={15} />
  </>;
}
