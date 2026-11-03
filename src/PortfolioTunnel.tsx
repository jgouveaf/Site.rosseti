import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import tunnel from "./data/tunnel.json";

type Stop = { year: number; title: string; image: string; events: string[] };

const stops: Stop[] = tunnel.stops;
const sideImages: string[] = tunnel.sideImages;
const { segmentLength, segmentCount, desktopRadius, mobileRadius, radialSegments, totalTravelZ } = tunnel.structure;
const { background, walls, neonPrimary, neonSecondary, neonAccent, aura } = tunnel.palette;

/** Procedural 3D tunnel centerline at depth Z (tight, focused curvature) */
function getTunnelCenter(z: number, compact: boolean): [number, number] {
  const curveX = Math.sin(z * 0.032) * (compact ? 0.45 : 0.75);
  const curveY = Math.cos(z * 0.026) * (compact ? 0.35 : 0.55);
  return [curveX, curveY];
}

/** Enclosed procedural tunnel walls with 360-degree laser rails and portal rings */
function ProceduralTunnelWalls({ compact }: { compact: boolean }) {
  const radius = compact ? mobileRadius : desktopRadius;
  const segmentRefs = useRef<(THREE.Group | null)[]>([]);

  // High-tech procedural cyber-grid texture
  const cyberTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = walls;
      ctx.fillRect(0, 0, 512, 512);

      // Symmetrical longitudinal guide lines
      ctx.strokeStyle = "rgba(0, 240, 255, 0.16)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= 512; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      // Circular rib markings
      ctx.strokeStyle = "rgba(207, 255, 0, 0.14)";
      ctx.lineWidth = 2;
      for (let y = 0; y <= 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Cyber tech telemetry dots
      ctx.fillStyle = "rgba(255, 42, 157, 0.22)";
      for (let i = 0; i < 48; i++) {
        const px = (i * 131) % 512;
        const py = (i * 79) % 512;
        ctx.fillRect(px, py, 6, 2);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  useEffect(() => () => cyberTexture.dispose(), [cyberTexture]);

  // Cylinder with inner side rendered (THREE.BackSide)
  const cylinderGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(radius, radius, segmentLength, radialSegments, 1, true);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, [radius]);

  // Neon portal ring encircling the cylinder
  const ringGeo = useMemo(() => {
    return new THREE.TorusGeometry(radius - 0.05, compact ? 0.026 : 0.038, 8, radialSegments);
  }, [radius, compact]);

  // Laser rail running down the cylinder length
  const railGeo = useMemo(() => {
    return new THREE.BoxGeometry(0.03, 0.03, segmentLength);
  }, []);

  useEffect(() => {
    return () => {
      cylinderGeo.dispose();
      ringGeo.dispose();
      railGeo.dispose();
    };
  }, [cylinderGeo, ringGeo, railGeo]);

  const neonColors = [neonPrimary, neonSecondary, neonAccent];

  // Procedural continuous recycling loop
  useFrame(({ camera }) => {
    const currentDist = -camera.position.z;
    const startIdx = Math.floor((currentDist - 6) / segmentLength);

    for (let i = 0; i < segmentCount; i++) {
      const seg = segmentRefs.current[i];
      if (!seg) continue;
      const z = -((startIdx + i) * segmentLength);
      seg.position.z = z;

      const [cx, cy] = getTunnelCenter(z, compact);
      seg.position.x = cx;
      seg.position.y = cy;
      seg.rotation.z = Math.sin(z * 0.032) * 0.08;
    }
  });

  return (
    <>
      {Array.from({ length: segmentCount }).map((_, i) => {
        const ringColor = neonColors[i % neonColors.length];
        return (
          <group
            key={`seg-${i}`}
            ref={(el) => {
              segmentRefs.current[i] = el;
            }}
          >
            {/* Cylinder inner wall */}
            <mesh geometry={cylinderGeo}>
              <meshBasicMaterial
                map={cyberTexture}
                side={THREE.BackSide}
                color="#8592a8"
              />
            </mesh>

            {/* Glowing 360-degree portal ring */}
            <mesh geometry={ringGeo} position={[0, 0, segmentLength / 2]}>
              <meshBasicMaterial color={ringColor} toneMapped={false} />
            </mesh>

            {/* 8 Symmetrical laser rails surrounding the entire tube (360 degrees) */}
            {Array.from({ length: 8 }).map((_, rIdx) => {
              const ang = (rIdx / 8) * Math.PI * 2;
              const rx = Math.cos(ang) * (radius * 0.94);
              const ry = Math.sin(ang) * (radius * 0.94);
              const color =
                rIdx % 4 === 0
                  ? neonPrimary
                  : rIdx % 4 === 2
                  ? neonSecondary
                  : neonAccent;
              return (
                <mesh
                  key={`rail-${rIdx}`}
                  geometry={railGeo}
                  position={[rx, ry, 0]}
                  rotation={[0, 0, ang]}
                >
                  <meshBasicMaterial
                    color={color}
                    toneMapped={false}
                    transparent
                    opacity={0.65}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </>
  );
}

/** Milestone photo card mounted on tunnel wall */
function MilestoneCard({
  index,
  stop,
  compact,
}: {
  index: number;
  stop: Stop;
  compact: boolean;
}) {
  const texture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + stop.image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const ratio = (texture.image?.width || 4) / (texture.image?.height || 3);
  const width = Math.min(compact ? 2.5 : 3.8, (compact ? 2.1 : 3.0) * ratio);
  const height = width / ratio;

  // Alternate sides symmetrically: 0=right, 1=left, 2=right, 3=left...
  const side = index % 2 === 0 ? 1 : -1;
  const radius = compact ? mobileRadius : desktopRadius;
  const targetZ = -14 - index * 21;

  const cardRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ camera, clock }) => {
    if (!cardRef.current) return;
    const [cx, cy] = getTunnelCenter(targetZ, compact);
    const distance = camera.position.z - targetZ;

    const approach = THREE.MathUtils.smoothstep(28 - distance, 0, 18);
    const leave = THREE.MathUtils.smoothstep(distance, -5, 2);
    const visibility = approach * leave;

    cardRef.current.visible = visibility > 0.02;

    const wallOffset = side * (radius * (compact ? 0.60 : 0.68));
    cardRef.current.position.x = cx + wallOffset;
    cardRef.current.position.y = cy + (compact ? 0.25 : 0.1) + Math.sin(clock.elapsedTime * 0.8 + index) * 0.025;
    cardRef.current.position.z = targetZ;

    // Angled towards the center
    cardRef.current.rotation.y = side * -0.28;
    cardRef.current.rotation.z = Math.sin(targetZ * 0.032) * 0.06;

    const scale = 0.85 + visibility * 0.15;
    cardRef.current.scale.set(scale, scale, 1);

    if (matRef.current) {
      matRef.current.opacity = Math.min(1, visibility * 1.8);
    }
  });

  const frameAccent = index % 2 === 0 ? neonPrimary : neonSecondary;

  return (
    <group ref={cardRef}>
      {/* Backplate */}
      <mesh position={[0, 0, -0.12]}>
        <boxGeometry args={[width + 0.35, height + 0.42, 0.18]} />
        <meshBasicMaterial color="#080a14" />
      </mesh>

      {/* Glowing frame border */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[width + 0.14, height + 0.14]} />
        <meshBasicMaterial color={frameAccent} toneMapped={false} />
      </mesh>

      {/* Photo */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial ref={matRef} map={texture} transparent toneMapped={false} />
      </mesh>

      {/* Cyber highlight bottom bar */}
      <mesh position={[0, -height / 2 - 0.12, 0.03]}>
        <boxGeometry args={[width + 0.2, 0.025, 0.025]} />
        <meshBasicMaterial color={neonPrimary} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Ambient side panel displays on alternating walls */
function AmbientPanel({
  index,
  compact,
}: {
  index: number;
  compact: boolean;
}) {
  const texture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + sideImages[index]);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const ratio = (texture.image?.width || 1) / (texture.image?.height || 1);
  const height = compact ? 1.7 : 2.2;
  const width = Math.min(2.4, height * ratio);

  // Alternate symmetrically with milestones
  const side = index % 2 === 0 ? -1 : 1;
  const radius = compact ? mobileRadius : desktopRadius;
  const targetZ = -24 - index * 16;

  const panelRef = useRef<THREE.Group>(null);

  useFrame(({ camera, clock }) => {
    if (!panelRef.current) return;
    const [cx, cy] = getTunnelCenter(targetZ, compact);
    const distance = camera.position.z - targetZ;

    const visible = distance > -5 && distance < 35;
    panelRef.current.visible = visible;
    if (!visible) return;

    const wallOffset = side * (radius * (compact ? 0.65 : 0.72));
    panelRef.current.position.x = cx + wallOffset;
    panelRef.current.position.y = cy + (compact ? -0.3 : -0.15) + Math.cos(clock.elapsedTime * 0.7 + index) * 0.02;
    panelRef.current.position.z = targetZ;

    panelRef.current.rotation.y = side * -0.32;
    panelRef.current.rotation.z = Math.sin(targetZ * 0.032) * 0.05;
  });

  return (
    <group ref={panelRef}>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[width + 0.1, height + 0.1]} />
        <meshBasicMaterial color={index % 2 === 0 ? neonSecondary : neonAccent} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** 3D cyber dust particles floating evenly throughout the tunnel volume */
function CyberParticles({ compact }: { compact: boolean }) {
  const count = 280;
  const radius = compact ? mobileRadius : desktopRadius;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * (radius * 0.85);
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = Math.sin(angle) * r;
      arr[i * 3 + 2] = -Math.random() * (totalTravelZ + 20);
    }
    return arr;
  }, [radius]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={neonPrimary}
        size={compact ? 0.035 : 0.042}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/** Master 3D scene with camera flight choreography */
function ProceduralCorridor({ progress }: { progress: MutableRefObject<number> }) {
  const compact = useThree((state) => state.size.width < 700);
  const prevProgress = useRef(0);
  const velocity = useRef(0);

  useFrame(({ camera, pointer }, delta) => {
    const safeDelta = Math.max(0.008, Math.min(0.05, delta));
    const vel = Math.abs(progress.current - prevProgress.current) / safeDelta;
    prevProgress.current = progress.current;
    velocity.current = THREE.MathUtils.damp(velocity.current, vel, 3.5, safeDelta);

    const targetZ = -progress.current * totalTravelZ;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4.2, safeDelta);

    const curZ = camera.position.z;
    const [curveX, curveY] = getTunnelCenter(curZ, compact);

    // Camera travels in center of enclosed tunnel + gentle mouse parallax
    const targetX = curveX + pointer.x * (compact ? 0.12 : 0.28);
    const targetY = curveY + pointer.y * (compact ? 0.08 : 0.18);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 4.0, safeDelta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 4.0, safeDelta);

    // Look ahead down tunnel centerline
    const lookAheadZ = curZ - 16;
    const [lookX, lookY] = getTunnelCenter(lookAheadZ, compact);
    camera.lookAt(lookX, lookY, lookAheadZ);

    // Subtle banking roll
    camera.rotation.z += Math.sin(curZ * 0.032) * 0.06 - pointer.x * 0.02;

    // Speed FOV warp
    if (camera instanceof THREE.PerspectiveCamera) {
      const warpFov = 68 + Math.min(10, velocity.current * 7.5);
      camera.fov = THREE.MathUtils.damp(camera.fov, warpFov, 3.0, safeDelta);
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[background, 10, 85]} />
      <ambientLight intensity={0.95} />
      <pointLight position={[0, 0, 1]} intensity={2.4} distance={28} color={neonPrimary} />

      {/* Enclosed Procedural Tunnel Walls with 360-degree laser rails */}
      <ProceduralTunnelWalls compact={compact} />

      {/* Floating Cyber Dust */}
      <CyberParticles compact={compact} />

      {/* 6 Milestone Exhibit Cards on alternating walls */}
      {stops.map((stop, index) => (
        <MilestoneCard key={stop.year} stop={stop} index={index} compact={compact} />
      ))}

      {/* Ambient Archival Panels */}
      {sideImages.map((_, index) => (
        <AmbientPanel key={`ambient-${index}`} index={index} compact={compact} />
      ))}
    </>
  );
}

/** User-facing Hoyojerez-style Trajectory Tunnel Component (clean, button-free) */
export function PortfolioTunnel() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!root.current) return;
      const rect = root.current.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
      progress.current = p;
      root.current.style.setProperty("--journey-progress", String(p));
      const stopIndex = Math.min(stops.length - 1, Math.max(0, Math.round(p * (stops.length - 1))));
      setActive(stopIndex);
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request);
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
      cancelAnimationFrame(frame);
    };
  }, []);

  const activeAura = aura[active % aura.length] || neonPrimary;

  return (
    <section
      className="pf-journey"
      ref={root}
      aria-label="Trajetória em um túnel 3D procedural"
    >
      <div
        className="pf-journey-stage"
        style={{ "--journey-aura": activeAura } as CSSProperties}
      >
        <div className="pf-journey-world" aria-hidden="true">
          {!reduced ? (
            <Suspense fallback={<div className="pf-journey-fallback" />}>
              <Canvas
                fallback={<div className="pf-journey-fallback" />}
                dpr={[1, 1.5]}
                camera={{ position: [0, 0, 2], fov: 68, near: 0.1, far: 110 }}
                gl={{ antialias: true, powerPreference: "high-performance" }}
              >
                <ProceduralCorridor progress={progress} />
              </Canvas>
            </Suspense>
          ) : (
            <img src={import.meta.env.BASE_URL + stops[active].image} alt="" />
          )}
        </div>

        {/* Subtle Symmetrical Ambient Overlays (no one-sided blackout) */}
        <div className="pf-journey-aura" aria-hidden="true" />
        <div className="pf-journey-scan" aria-hidden="true" />
        <div className="pf-journey-flash" aria-hidden="true" key={active} />
        <div className="pf-journey-vignette" aria-hidden="true" />

        {/* Top telemetry header */}
        <div className="pf-journey-top">
          <span>JG / TRAJETÓRIA</span>
          <span>ROLE PARA AVANÇAR NO TÚNEL ↓</span>
        </div>

        {/* Active Milestone Card Information (clean bottom HUD) */}
        <div className="pf-journey-copy" aria-live="polite" key={active}>
          <span className="pf-journey-index">
            {String(active + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")} · ARQUIVO PESSOAL
          </span>
          <strong>{stops[active].year}</strong>
          <h2>{stops[active].title}</h2>
          <p>{stops[active].events.join(" · ")}</p>
        </div>

        {/* Bottom progress laser line */}
        <div className="pf-journey-progress" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}
