import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import tunnel from "./data/tunnel.json";

type Stop = { year: number; title: string; image: string; events: string[] };

const stops: Stop[] = tunnel.stops;
const sideImages: string[] = tunnel.sideImages;
const { segmentLength, segmentCount, desktopRadius, mobileRadius, radialSegments, totalTravelZ } = tunnel.structure;
const { background, walls, neonPrimary, neonSecondary, neonAccent, aura } = tunnel.palette;

/** Computes the procedural 3D tunnel centerline at any depth Z */
function getTunnelCenter(z: number, compact: boolean): [number, number] {
  const curveX = Math.sin(z * 0.035) * (compact ? 0.75 : 1.35);
  const curveY = Math.cos(z * 0.028) * (compact ? 0.45 : 0.85);
  return [curveX, curveY];
}

/** Procedural repeating cyber-grid tunnel segments with object pooling */
function ProceduralTunnelWalls({ compact }: { compact: boolean }) {
  const radius = compact ? mobileRadius : desktopRadius;
  const segmentRefs = useRef<(THREE.Group | null)[]>([]);

  // Procedural futuristic cyber texture with glowing grid lines
  const cyberTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Dark deep base
      ctx.fillStyle = walls;
      ctx.fillRect(0, 0, 512, 512);

      // Longitudinal guide lines
      ctx.strokeStyle = "rgba(0, 240, 255, 0.14)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= 512; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      // Latitudinal ribs
      ctx.strokeStyle = "rgba(207, 255, 0, 0.12)";
      ctx.lineWidth = 2;
      for (let y = 0; y <= 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Subtle tech details
      ctx.fillStyle = "rgba(255, 42, 157, 0.18)";
      for (let i = 0; i < 40; i++) {
        const px = ((i * 127) % 512);
        const py = ((i * 73) % 512);
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

  // Cylinder geometry with inside visible (BackSide)
  const cylinderGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(radius, radius, segmentLength, radialSegments, 1, true);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, [radius]);

  // Neon portal ring
  const ringGeo = useMemo(() => {
    return new THREE.TorusGeometry(radius - 0.06, compact ? 0.032 : 0.048, 8, radialSegments);
  }, [radius, compact]);

  // Rails along tunnel walls (ceiling, floor, left, right)
  const railGeo = useMemo(() => {
    return new THREE.BoxGeometry(0.04, 0.04, segmentLength);
  }, []);

  useEffect(() => {
    return () => {
      cylinderGeo.dispose();
      ringGeo.dispose();
      railGeo.dispose();
    };
  }, [cylinderGeo, ringGeo, railGeo]);

  const neonColors = [neonPrimary, neonSecondary, neonAccent];

  // Procedural recycling loop: segments ahead are continuously repositioned
  useFrame(({ camera }) => {
    const currentDist = -camera.position.z;
    const startIdx = Math.floor((currentDist - 8) / segmentLength);

    for (let i = 0; i < segmentCount; i++) {
      const seg = segmentRefs.current[i];
      if (!seg) continue;
      const z = -((startIdx + i) * segmentLength);
      seg.position.z = z;

      const [cx, cy] = getTunnelCenter(z, compact);
      seg.position.x = cx;
      seg.position.y = cy;
      seg.rotation.z = Math.sin(z * 0.035) * 0.12;
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
                color="#808ca0"
              />
            </mesh>

            {/* Glowing neon portal ring at segment junction */}
            <mesh geometry={ringGeo} position={[0, 0, segmentLength / 2]}>
              <meshBasicMaterial
                color={ringColor}
                toneMapped={false}
              />
            </mesh>

            {/* Longitudinal neon laser rails */}
            <mesh geometry={railGeo} position={[0, radius * 0.94, 0]}>
              <meshBasicMaterial color={neonPrimary} toneMapped={false} transparent opacity={0.65} />
            </mesh>
            <mesh geometry={railGeo} position={[0, -radius * 0.94, 0]}>
              <meshBasicMaterial color={neonSecondary} toneMapped={false} transparent opacity={0.65} />
            </mesh>
            <mesh geometry={railGeo} position={[-radius * 0.94, 0, 0]}>
              <meshBasicMaterial color={neonAccent} toneMapped={false} transparent opacity={0.5} />
            </mesh>
            <mesh geometry={railGeo} position={[radius * 0.94, 0, 0]}>
              <meshBasicMaterial color={neonPrimary} toneMapped={false} transparent opacity={0.5} />
            </mesh>
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
  const width = Math.min(compact ? 3.4 : 5.8, (compact ? 2.8 : 4.4) * ratio);
  const height = width / ratio;

  const side = index % 2 === 0 ? 1 : -1;
  const radius = compact ? mobileRadius : desktopRadius;
  const targetZ = -14 - index * 21;

  const cardRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ camera, clock }) => {
    if (!cardRef.current) return;
    const [cx, cy] = getTunnelCenter(targetZ, compact);
    const distance = camera.position.z - targetZ;

    // Smooth reveal when approaching
    const approach = THREE.MathUtils.smoothstep(32 - distance, 0, 22);
    const leave = THREE.MathUtils.smoothstep(distance, -6, 2);
    const visibility = approach * leave;

    cardRef.current.visible = visibility > 0.02;

    // Positioned along the curved tunnel wall
    const wallOffset = side * (radius * (compact ? 0.55 : 0.64));
    cardRef.current.position.x = cx + wallOffset;
    cardRef.current.position.y = cy + (compact ? 0.35 : 0.15) + Math.sin(clock.elapsedTime * 0.8 + index) * 0.03;
    cardRef.current.position.z = targetZ;

    // Inward facing angle towards center
    cardRef.current.rotation.y = side * -0.26;
    cardRef.current.rotation.z = Math.sin(targetZ * 0.035) * 0.08;

    // Scale pop and brightness pulse
    const scale = 0.82 + visibility * 0.18;
    cardRef.current.scale.set(scale, scale, 1);

    if (matRef.current) {
      matRef.current.opacity = Math.min(1, visibility * 1.8);
    }
  });

  const frameAccent = index % 2 === 0 ? neonPrimary : neonSecondary;

  return (
    <group ref={cardRef}>
      {/* Dark backplate */}
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[width + 0.45, height + 0.52, 0.22]} />
        <meshBasicMaterial color="#0c0e18" />
      </mesh>

      {/* Glowing neon border plate */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[width + 0.16, height + 0.16]} />
        <meshBasicMaterial color={frameAccent} toneMapped={false} />
      </mesh>

      {/* High-res photo */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial ref={matRef} map={texture} transparent toneMapped={false} />
      </mesh>

      {/* Cyber highlight bottom laser bar */}
      <mesh position={[0, -height / 2 - 0.16, 0.04]}>
        <boxGeometry args={[width + 0.24, 0.03, 0.03]} />
        <meshBasicMaterial color={neonPrimary} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Ambient side panel displays interspersed between milestones */
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
  const height = compact ? 2.0 : 2.7;
  const width = Math.min(3.2, height * ratio);

  const side = index % 2 === 0 ? -1 : 1;
  const radius = compact ? mobileRadius : desktopRadius;
  const targetZ = -24 - index * 16;

  const panelRef = useRef<THREE.Group>(null);

  useFrame(({ camera, clock }) => {
    if (!panelRef.current) return;
    const [cx, cy] = getTunnelCenter(targetZ, compact);
    const distance = camera.position.z - targetZ;

    const visible = distance > -5 && distance < 38;
    panelRef.current.visible = visible;
    if (!visible) return;

    const wallOffset = side * (radius * (compact ? 0.62 : 0.72));
    panelRef.current.position.x = cx + wallOffset;
    panelRef.current.position.y = cy + (compact ? -0.4 : -0.2) + Math.cos(clock.elapsedTime * 0.7 + index) * 0.025;
    panelRef.current.position.z = targetZ;

    panelRef.current.rotation.y = side * -0.32;
    panelRef.current.rotation.z = Math.sin(targetZ * 0.035) * 0.06;
  });

  return (
    <group ref={panelRef}>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[width + 0.12, height + 0.12]} />
        <meshBasicMaterial color={index % 2 === 0 ? neonSecondary : neonAccent} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** 3D cyber dust particles floating in the tunnel */
function CyberParticles() {
  const count = 240;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 * 7;
      const r = 0.8 + Math.random() * 3.6;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = Math.sin(angle) * r;
      arr[i * 3 + 2] = -Math.random() * (totalTravelZ + 25);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={neonPrimary}
        size={0.045}
        transparent
        opacity={0.55}
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

    // Target Z position from scroll
    const targetZ = -progress.current * totalTravelZ;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4.2, safeDelta);

    const curZ = camera.position.z;
    const [curveX, curveY] = getTunnelCenter(curZ, compact);

    // Camera travels down center of curved tunnel + mouse parallax
    const targetX = curveX + pointer.x * (compact ? 0.16 : 0.42);
    const targetY = curveY + pointer.y * (compact ? 0.12 : 0.26);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.8, safeDelta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.8, safeDelta);

    // Look ahead down the curving wormhole
    const lookAheadZ = curZ - 18;
    const [lookX, lookY] = getTunnelCenter(lookAheadZ, compact);
    camera.lookAt(lookX, lookY, lookAheadZ);

    // FPV Banking roll on turns
    camera.rotation.z += Math.sin(curZ * 0.035) * 0.08 - pointer.x * 0.025;

    // Warp speed dynamic FOV
    if (camera instanceof THREE.PerspectiveCamera) {
      const warpFov = 68 + Math.min(10, velocity.current * 7.5);
      camera.fov = THREE.MathUtils.damp(camera.fov, warpFov, 3.0, safeDelta);
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[background, 14, 90]} />
      <ambientLight intensity={0.9} />
      <pointLight position={[0, 0, 2]} intensity={2.2} distance={32} color={neonPrimary} />

      {/* Infinite Procedural Tunnel Walls */}
      <ProceduralTunnelWalls compact={compact} />

      {/* Floating Cyber Dust */}
      <CyberParticles />

      {/* 6 Milestone Exhibit Cards */}
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

/** User-facing Hoyojerez-style Trajectory Tunnel Component */
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

  const jump = (index: number) => {
    if (!root.current) return;
    const top = root.current.getBoundingClientRect().top + scrollY;
    scrollTo({
      top: top + (index / (stops.length - 1)) * (root.current.offsetHeight - innerHeight),
      behavior: "smooth",
    });
  };

  const activeAura = aura[active % aura.length] || neonPrimary;

  return (
    <section
      className="pf-journey"
      ref={root}
      data-photo-side={active % 2 ? "right" : "left"}
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

        {/* Ambient Hologram Overlays */}
        <div className="pf-journey-aura" aria-hidden="true" />
        <div className="pf-journey-scan" aria-hidden="true" />
        <div className="pf-journey-flash" aria-hidden="true" key={active} />
        <div className="pf-journey-vignette" aria-hidden="true" />

        {/* Top telemetry header */}
        <div className="pf-journey-top">
          <span>JG / TRAJETÓRIA PROCEDURAL 3D</span>
          <span>ROLE PARA NAVEGAR NO TÚNEL ↓</span>
        </div>

        {/* Active Milestone Card Information */}
        <div className="pf-journey-copy" aria-live="polite" key={active}>
          <span className="pf-journey-index">
            {String(active + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")} · ARQUIVO PESSOAL
          </span>
          <strong>{stops[active].year}</strong>
          <h2>{stops[active].title}</h2>
          <p>{stops[active].events.join(" · ")}</p>
        </div>

        {/* Interactive Year Navigation Pills */}
        <nav className="pf-journey-nav" aria-label="Navegar pelos anos da trajetória">
          {stops.map((stop, index) => (
            <button
              key={stop.year}
              type="button"
              className={index === active ? "is-active" : ""}
              onClick={() => jump(index)}
              aria-label={`Ir para ${stop.year}`}
              aria-current={index === active ? "step" : undefined}
            >
              <span>{stop.year}</span>
            </button>
          ))}
        </nav>

        {/* Bottom progress laser line */}
        <div className="pf-journey-progress" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}
