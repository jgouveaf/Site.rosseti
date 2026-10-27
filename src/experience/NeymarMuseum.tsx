import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import content from '../data/neymar.json';

type MuseumExhibit = typeof content.museumExhibits[number];

// 3D Pedestal and sculpture for each exhibit
function ExhibitMesh({
  exhibit,
  position,
  index,
  active,
  hovered,
  onHover,
  onSelect
}: {
  exhibit: MuseumExhibit;
  position: [number, number, number];
  index: number;
  active: boolean;
  hovered: boolean;
  onHover: (hover: boolean) => void;
  onSelect: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const jersey = useRef<THREE.Group>(null);
  const spotlight = useRef<THREE.SpotLight>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    // Gentle floating
    if (jersey.current) {
      jersey.current.position.y = 1.9 + Math.sin(t * 1.5 + index * 1.2) * 0.08;
      // Spring tilt towards pointer when hovered
      const rotY = hovered ? 0.35 * Math.sin(t * 2) : Math.sin(t * 0.6 + index) * 0.12;
      jersey.current.rotation.y = THREE.MathUtils.lerp(jersey.current.rotation.y, rotY, delta * 4);
      jersey.current.rotation.x = THREE.MathUtils.lerp(jersey.current.rotation.x, hovered ? 0.08 : 0, delta * 4);
    }

    if (spotlight.current) {
      const targetIntensity = active ? 4.5 : hovered ? 2.8 : 0.9;
      spotlight.current.intensity = THREE.MathUtils.lerp(spotlight.current.intensity, targetIntensity, delta * 3);
    }
  });

  const baseColor = useMemo(() => new THREE.Color(exhibit.color), [exhibit.color]);
  const accentColor = useMemo(() => new THREE.Color(exhibit.accentColor), [exhibit.accentColor]);

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
      }}
      onPointerOut={() => onHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Spotlight pointing to the pedestal */}
      <spotLight
        ref={spotlight}
        position={[0, 6, 2]}
        target-position={[0, 1.5, 0]}
        angle={0.45}
        penumbra={0.7}
        intensity={1}
        color={active ? '#ffffff' : exhibit.accentColor}
        distance={14}
      />

      {/* Modern museum pedestal */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.1, 0.9, 32]} />
        <meshStandardMaterial
          color="#161914"
          roughness={0.25}
          metalness={0.75}
        />
      </mesh>

      {/* Illuminated glass accent ring */}
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.06, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={active ? 1.4 : hovered ? 0.9 : 0.3}
          roughness={0.1}
        />
      </mesh>

      {/* Floating Jersey Sculpture */}
      <group ref={jersey} position={[0, 1.9, 0]}>
        {/* Torso */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.1, 1.35, 0.28]} />
          <meshStandardMaterial
            color={baseColor}
            roughness={0.5}
            metalness={0.15}
          />
        </mesh>

        {/* Shoulders / Sleeves */}
        <mesh position={[-0.72, 0.42, 0]} rotation={[0, 0, 0.35]} castShadow>
          <boxGeometry args={[0.5, 0.46, 0.26]} />
          <meshStandardMaterial color={baseColor} roughness={0.5} />
        </mesh>
        <mesh position={[0.72, 0.42, 0]} rotation={[0, 0, -0.35]} castShadow>
          <boxGeometry args={[0.5, 0.46, 0.26]} />
          <meshStandardMaterial color={baseColor} roughness={0.5} />
        </mesh>

        {/* Collar accent */}
        <mesh position={[0, 0.62, 0.02]}>
          <boxGeometry args={[0.42, 0.14, 0.28]} />
          <meshStandardMaterial color={accentColor} roughness={0.3} />
        </mesh>

        {/* Number badge back & front */}
        <mesh position={[0, 0.05, 0.15]}>
          <planeGeometry args={[0.48, 0.58]} />
          <meshBasicMaterial color={exhibit.numColor} />
        </mesh>
        <mesh position={[0, 0.05, -0.15]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.55, 0.65]} />
          <meshBasicMaterial color={exhibit.numColor} />
        </mesh>

        {/* Holographic trophy / aura ring */}
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.025, 16, 48]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={active ? 0.75 : hovered ? 0.5 : 0.2}
          />
        </mesh>
      </group>

      {/* Ground halo */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.45, 32]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={active ? 0.5 : 0.15}
        />
      </mesh>
    </group>
  );
}

// Embers / dust particles floating in the museum
function MuseumParticles() {
  const count = 120;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = Math.random() * 8 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 45;
    }
    return pos;
  }, []);

  const points = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.elapsedTime * 0.12;
    points.current.rotation.y = t * 0.2;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#cfed74"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Camera controller mapped to scroll progress (Igloo.inc style)
function MuseumCameraController({
  progress,
  exhibitPositions,
  onActiveExhibitChange
}: {
  progress: number;
  exhibitPositions: [number, number, number][];
  onActiveExhibitChange: (index: number) => void;
}) {
  const { camera } = useThree();

  // Create smooth spline camera track
  const { cameraCurve, targetCurve } = useMemo(() => {
    const camPts: THREE.Vector3[] = [];
    const targetPts: THREE.Vector3[] = [];

    exhibitPositions.forEach((pos, i) => {
      // Camera sits in front of each exhibit with slight diagonal offset
      const side = i % 2 === 0 ? 2.4 : -2.4;
      camPts.push(new THREE.Vector3(pos[0] + side, pos[1] + 2.5, pos[2] + 4.6));
      targetPts.push(new THREE.Vector3(pos[0], pos[1] + 1.8, pos[2]));
    });

    return {
      cameraCurve: new THREE.CatmullRomCurve3(camPts, false, 'centripetal'),
      targetCurve: new THREE.CatmullRomCurve3(targetPts, false, 'centripetal')
    };
  }, [exhibitPositions]);

  const currentLook = useRef(new THREE.Vector3());
  const nextPos = useRef(new THREE.Vector3());
  const nextTarget = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    cameraCurve.getPoint(p, nextPos.current);
    targetCurve.getPoint(p, nextTarget.current);

    camera.position.lerp(nextPos.current, delta * 3.5);
    currentLook.current.lerp(nextTarget.current, delta * 3.5);
    camera.lookAt(currentLook.current);

    // Calculate nearest exhibit index
    const activeIndex = Math.min(
      exhibitPositions.length - 1,
      Math.max(0, Math.round(p * (exhibitPositions.length - 1)))
    );
    onActiveExhibitChange(activeIndex);
  });

  return null;
}

export function NeymarMuseum({
  scrollProgress,
  onOpenMoment
}: {
  scrollProgress: number;
  onOpenMoment: (momentId: string) => void;
}) {
  const exhibits = content.museumExhibits;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Layout exhibits in an evocative zigzag gallery line
  const exhibitPositions: [number, number, number][] = useMemo(() => {
    return exhibits.map((_, i) => {
      const z = -i * 5.8;
      const x = (i % 2 === 0 ? -1.6 : 1.6);
      return [x, 0, z];
    });
  }, [exhibits]);

  const activeExhibit = exhibits[activeIndex] || exhibits[0];

  return (
    <div className="ney-museum-container">
      {/* 3D Canvas Viewport */}
      <div className="ney-museum-canvas-wrap">
        <Canvas
          shadows
          camera={{ position: [0, 2.5, 6], fov: 42, near: 0.1, far: 80 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2
          }}
        >
          <color attach="background" args={['#0e110c']} />
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[8, 14, 6]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          <Suspense fallback={null}>
            {/* Museum dark polished floor */}
            <mesh position={[0, -0.01, -16]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[45, 65]} />
              <meshStandardMaterial
                color="#0c0e0b"
                roughness={0.18}
                metalness={0.82}
              />
            </mesh>

            {/* Glowing guide strips along the runway */}
            <mesh position={[-3.6, 0.01, -16]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.08, 65]} />
              <meshBasicMaterial color="#cfed74" transparent opacity={0.3} />
            </mesh>
            <mesh position={[3.6, 0.01, -16]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.08, 65]} />
              <meshBasicMaterial color="#cfed74" transparent opacity={0.3} />
            </mesh>

            {/* Floating dust particles */}
            <MuseumParticles />

            {/* Exhibits */}
            {exhibits.map((exhibit, i) => (
              <ExhibitMesh
                key={exhibit.id}
                exhibit={exhibit}
                position={exhibitPositions[i]}
                index={i}
                active={i === activeIndex}
                hovered={i === hoveredIndex}
                onHover={(hover) => setHoveredIndex(hover ? i : null)}
                onSelect={() => onOpenMoment(exhibit.momentId)}
              />
            ))}

            {/* Camera navigation */}
            <MuseumCameraController
              progress={scrollProgress}
              exhibitPositions={exhibitPositions}
              onActiveExhibitChange={setActiveIndex}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Editorial HUD Overlay synced with 3D camera */}
      <div className="ney-museum-hud" pointer-events="none">
        <div className="ney-museum-hud-top">
          <div className="ney-museum-tag">
            <span>GALERIA 3D · RELÍQUIAS DE CARREIRA</span>
            <small>ROLE PARA PERCORRER · CLIQUE NAS RELÍQUIAS ↗</small>
          </div>
          <div className="ney-museum-badge" style={{ borderColor: activeExhibit.accentColor, color: activeExhibit.accentColor }}>
            {activeExhibit.badge}
          </div>
        </div>

        <div className="ney-museum-card">
          <div className="ney-museum-card-header">
            <span>0{activeIndex + 1} / 0{exhibits.length}</span>
            <span className="ney-museum-season">{activeExhibit.season}</span>
          </div>
          <h3 className="ney-museum-title">{activeExhibit.name}</h3>
          <h4>{activeExhibit.title}</h4>
          <p>{activeExhibit.detail}</p>
          <button
            type="button"
            className="ney-museum-action"
            onClick={() => onOpenMoment(activeExhibit.momentId)}
          >
            EXPLORAR HISTÓRIA COMPLETA ↗
          </button>
        </div>

        <div className="ney-museum-hud-bottom">
          <span>PROGRESSO DA GALERIA</span>
          <div className="ney-museum-progress-bar">
            <div
              className="ney-museum-progress-fill"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
          <span>0{activeIndex + 1} DE 0{exhibits.length}</span>
        </div>
      </div>
    </div>
  );
}
