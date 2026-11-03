import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import tunnelData from "./data/tunnel.json";
import { createHoyojerezTunnel, type TunnelGeometryData } from "./TunnelGenerator";

type Stop = {
  year: number;
  t: number;
  title: string;
  image: string;
  events: string[];
};

const stops: Stop[] = tunnelData.stops;
const sideImages: string[] = tunnelData.sideImages;
const {
  desktopRadius,
  mobileRadius,
  tubularSegments,
  radialSegments,
  length: tunnelLength,
  bloomStrength,
  bloomRadius,
  bloomThreshold,
} = tunnelData.structure;

const {
  background,
  neonPrimary,
  neonSecondary,
  neonAccent,
  neonDeep,
  fog: fogColor,
  aura,
} = tunnelData.palette;

/** UnrealBloom Postprocessing Pass for the authentic burning red/rose neon look */
function PostProcessingBloom() {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const comp = new EffectComposer(gl);
    comp.renderToScreen = true;
    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );
    comp.addPass(bloom);

    const outputPass = new OutputPass();
    comp.addPass(outputPass);

    return comp;
  }, [gl, scene, camera, size.width, size.height]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
}

/** Procedural wireframe tunnel mesh (rails, rib rings, and translucent membrane) */
function WireframeTunnelStructure({
  tunnelData,
}: {
  tunnelData: TunnelGeometryData;
}) {
  const { longitudinalGeometry, ringGeometries, tubeGeometry } = tunnelData;

  const longMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: neonPrimary,
        toneMapped: false,
        transparent: true,
        opacity: 0.85,
      }),
    []
  );

  const ringMatA = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: neonSecondary,
        toneMapped: false,
        transparent: true,
        opacity: 0.95,
      }),
    []
  );

  const ringMatB = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: neonPrimary,
        toneMapped: false,
        transparent: true,
        opacity: 0.75,
      }),
    []
  );

  const ringMatC = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: neonAccent,
        toneMapped: false,
        transparent: true,
        opacity: 0.85,
      }),
    []
  );

  const membraneMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#180209",
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => {
    return () => {
      longMat.dispose();
      ringMatA.dispose();
      ringMatB.dispose();
      ringMatC.dispose();
      membraneMat.dispose();
    };
  }, [longMat, ringMatA, ringMatB, ringMatC, membraneMat]);

  return (
    <group>
      {/* Translucent depth membrane */}
      <mesh geometry={tubeGeometry} material={membraneMat} />

      {/* Longitudinal converging rails */}
      <lineSegments geometry={longitudinalGeometry} material={longMat} />

      {/* Transverse rib rings encircling the spline */}
      {ringGeometries.map((geo, idx) => (
        <lineLoop
          key={`ring-${idx}`}
          geometry={geo}
          material={idx % 3 === 0 ? ringMatA : idx % 3 === 1 ? ringMatB : ringMatC}
        />
      ))}
    </group>
  );
}

/** Floating holographic milestone card attached tangentially to the tunnel wall */
function MilestoneExhibit({
  stop,
  index,
  tunnelData,
  compact,
}: {
  stop: Stop;
  index: number;
  tunnelData: TunnelGeometryData;
  compact: boolean;
}) {
  const texture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + stop.image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const ratio = (texture.image?.width || 4) / (texture.image?.height || 3);
  const width = Math.min(compact ? 2.5 : 3.8, (compact ? 2.1 : 3.0) * ratio);
  const height = width / ratio;

  const side = index % 2 === 0 ? 1 : -1;
  const radius = compact ? mobileRadius : desktopRadius;

  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);

  // Compute position & orientation along CatmullRomCurve3
  const { position, rotation } = useMemo(() => {
    const curve = tunnelData.curve;
    const t = stop.t;
    const center = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    // Normal & Binormal
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    // Wall offset on normal
    const pos = new THREE.Vector3()
      .copy(center)
      .addScaledVector(normal, side * (radius * 0.70))
      .addScaledVector(binormal, 0.08);

    // Orient facing towards tunnel center and oncoming camera
    const lookTarget = new THREE.Vector3()
      .copy(center)
      .addScaledVector(tangent, -1.8);

    const dummy = new THREE.Object3D();
    dummy.position.copy(pos);
    dummy.up.copy(binormal);
    dummy.lookAt(lookTarget);
    const rot = dummy.rotation.clone();

    return { position: pos, rotation: rot };
  }, [tunnelData, stop.t, side, radius]);

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    const camDist = camera.position.distanceTo(position);

    // Smooth reveal when approaching
    const approach = THREE.MathUtils.smoothstep(32 - camDist, 0, 20);
    const leave = THREE.MathUtils.smoothstep(camDist, -5, 2);
    const visibility = approach * leave;

    groupRef.current.visible = visibility > 0.02;

    const baseScale = 0.88 + visibility * 0.12;
    const targetScale = hovered ? baseScale * 1.06 : baseScale;
    groupRef.current.scale.set(targetScale, targetScale, 1);

    if (matRef.current) {
      matRef.current.opacity = Math.min(1, visibility * 1.8);
    }
  });

  const borderAccent = hovered ? "#ffffff" : index % 2 === 0 ? neonPrimary : neonSecondary;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Dark backplate */}
      <mesh position={[0, 0, -0.09]}>
        <boxGeometry args={[width + 0.32, height + 0.38, 0.14]} />
        <meshBasicMaterial color="#090104" />
      </mesh>

      {/* Glowing neon border plate */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width + 0.14, height + 0.14]} />
        <meshBasicMaterial color={borderAccent} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* High-res exhibit image */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial ref={matRef} map={texture} transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Under-card red laser bar */}
      <mesh position={[0, -height / 2 - 0.11, 0.02]}>
        <boxGeometry args={[width + 0.22, 0.025, 0.025]} />
        <meshBasicMaterial color={neonPrimary} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Ambient archival panel displays interspersed between milestones */
function AmbientExhibit({
  imageSrc,
  index,
  totalCount,
  tunnelData,
  compact,
}: {
  imageSrc: string;
  index: number;
  totalCount: number;
  tunnelData: TunnelGeometryData;
  compact: boolean;
}) {
  const texture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + imageSrc);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const ratio = (texture.image?.width || 1) / (texture.image?.height || 1);
  const height = compact ? 1.6 : 2.2;
  const width = Math.min(compact ? 2.2 : 2.9, height * ratio);

  // Distribute along curve parameters smoothly
  const t = 0.05 + (index / Math.max(1, totalCount - 1)) * 0.90;
  const side = index % 2 === 0 ? -1 : 1;
  const radius = compact ? mobileRadius : desktopRadius;
  const yOffset = ((index % 3) - 1) * 0.22;

  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const { position, rotation } = useMemo(() => {
    const curve = tunnelData.curve;
    const center = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    // Wall offset on normal
    const pos = new THREE.Vector3()
      .copy(center)
      .addScaledVector(normal, side * (radius * 0.70))
      .addScaledVector(binormal, yOffset);

    // Orient facing towards tunnel center and oncoming camera
    const lookTarget = new THREE.Vector3().copy(center).addScaledVector(tangent, -1.8);
    const dummy = new THREE.Object3D();
    dummy.position.copy(pos);
    dummy.up.copy(binormal);
    dummy.lookAt(lookTarget);
    const rot = dummy.rotation.clone();

    return { position: pos, rotation: rot };
  }, [tunnelData, t, side, radius, yOffset]);

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    const camDist = camera.position.distanceTo(position);
    // Smooth reveal when approaching
    const approach = THREE.MathUtils.smoothstep(32 - camDist, 0, 18);
    const leave = THREE.MathUtils.smoothstep(camDist, -5, 2);
    const visibility = approach * leave;

    groupRef.current.visible = visibility > 0.02;
    if (matRef.current) {
      matRef.current.opacity = Math.min(1, visibility * 1.6);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Dark backplate */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[width + 0.14, height + 0.14]} />
        <meshBasicMaterial color="#090104" side={THREE.DoubleSide} />
      </mesh>
      {/* Glowing neon border */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width + 0.06, height + 0.06]} />
        <meshBasicMaterial
          color={index % 2 === 0 ? neonSecondary : neonDeep}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Exhibit image */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial ref={matRef} map={texture} transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** 3D cyber dust floating through the curved tunnel */
function CurvedCyberParticles({
  tunnelData,
  compact,
}: {
  tunnelData: TunnelGeometryData;
  compact: boolean;
}) {
  const count = 320;
  const radius = compact ? mobileRadius : desktopRadius;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const curve = tunnelData.curve;

    for (let i = 0; i < count; i++) {
      const u = (i / count);
      const center = curve.getPointAt(u);
      const angle = (i * 17.31) % (Math.PI * 2);
      const r = 0.4 + (i % 7) * (radius * 0.11);
      arr[i * 3] = center.x + Math.cos(angle) * r;
      arr[i * 3 + 1] = center.y + Math.sin(angle) * r;
      arr[i * 3 + 2] = center.z;
    }
    return arr;
  }, [tunnelData, radius]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={neonSecondary}
        size={compact ? 0.038 : 0.046}
        transparent
        opacity={0.65}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

/** Camera flight controller moving continuously down the CatmullRomCurve3 spline */
function CameraFlightController({
  progress,
  tunnelData,
}: {
  progress: MutableRefObject<number>;
  tunnelData: TunnelGeometryData;
}) {
  const compact = useThree((state) => state.size.width < 700);
  const prevProgress = useRef(0);
  const velocity = useRef(0);
  const currentT = useRef(0);

  useFrame(({ camera, pointer }, delta) => {
    const safeDelta = Math.max(0.008, Math.min(0.05, delta));
    const vel = Math.abs(progress.current - prevProgress.current) / safeDelta;
    prevProgress.current = progress.current;
    velocity.current = THREE.MathUtils.damp(velocity.current, vel, 3.5, safeDelta);

    // Target spline parameter t in [0.001, 0.995]
    const targetT = Math.max(0.001, Math.min(0.995, progress.current));

    // Smooth physical damping
    currentT.current = THREE.MathUtils.damp(currentT.current, targetT, 4.5, safeDelta);
    const t = currentT.current;

    const curve = tunnelData.curve;
    const center = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    // Camera rides along center + subtle mouse parallax
    const targetPos = new THREE.Vector3()
      .copy(center)
      .addScaledVector(normal, pointer.x * (compact ? 0.12 : 0.28))
      .addScaledVector(binormal, pointer.y * (compact ? 0.08 : 0.18));

    camera.position.copy(targetPos);

    // Look ahead down the curve tangent
    const lookT = Math.min(0.999, t + 0.035);
    const lookCenter = curve.getPointAt(lookT);
    camera.lookAt(lookCenter);

    // FPV Banking roll
    const curveRoll = Math.sin(t * Math.PI * 4) * 0.06 - pointer.x * 0.02;
    camera.rotation.z += curveRoll;

    // Dynamic FOV warp on scroll speed
    if (camera instanceof THREE.PerspectiveCamera) {
      const warpFov = 68 + Math.min(10, velocity.current * 7.5);
      camera.fov = THREE.MathUtils.damp(camera.fov, warpFov, 3.0, safeDelta);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

/** Main Three.js Scene Composition */
function HoyojerezScene({
  progress,
}: {
  progress: MutableRefObject<number>;
}) {
  const compact = useThree((state) => state.size.width < 700);

  // Generate procedural organic CatmullRomCurve3 tunnel geometry
  const tunnelData = useMemo(() => {
    const radius = compact ? mobileRadius : desktopRadius;
    return createHoyojerezTunnel(radius, tubularSegments, radialSegments, tunnelLength);
  }, [compact]);

  useEffect(() => {
    return () => {
      tunnelData.tubeGeometry.dispose();
      tunnelData.longitudinalGeometry.dispose();
      tunnelData.ringGeometries.forEach((g) => g.dispose());
    };
  }, [tunnelData]);

  return (
    <>
      <color attach="background" args={[background]} />
      <fogExp2 attach="fog" args={[fogColor, 0.016]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 1]} intensity={2.6} distance={30} color={neonPrimary} />

      {/* Camera Flight along CatmullRomCurve3 */}
      <CameraFlightController progress={progress} tunnelData={tunnelData} />

      {/* Hoyojerez Wireframe Tubular Structure */}
      <WireframeTunnelStructure tunnelData={tunnelData} />

      {/* Swirling Cyber Dust */}
      <CurvedCyberParticles tunnelData={tunnelData} compact={compact} />

      {/* 6 Milestone Exhibits */}
      {stops.map((stop, idx) => (
        <MilestoneExhibit
          key={stop.year}
          stop={stop}
          index={idx}
          tunnelData={tunnelData}
          compact={compact}
        />
      ))}

      {/* Ambient Archival Panels */}
      {sideImages.map((src, idx) => (
        <AmbientExhibit
          key={`ambient-${idx}`}
          imageSrc={src}
          index={idx}
          totalCount={sideImages.length}
          tunnelData={tunnelData}
          compact={compact}
        />
      ))}

      {/* UnrealBloom Postprocessing Pass */}
      <PostProcessingBloom />
    </>
  );
}

/** User-Facing Hoyojerez 3D Procedural Tunnel Component */
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

      // Calculate active milestone based on curve t parameter
      let currentIdx = 0;
      for (let i = 0; i < stops.length; i++) {
        if (p >= stops[i].t - 0.08) {
          currentIdx = i;
        }
      }
      setActive(currentIdx);
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
      aria-label="Trajetória em um túnel 3D procedural estilo Hoyojerez"
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
                dpr={[1, 1.75]}
                camera={{ position: [0, 0, 2], fov: 68, near: 0.1, far: 180 }}
                gl={{
                  antialias: true,
                  powerPreference: "high-performance",
                  toneMapping: THREE.ACESFilmicToneMapping,
                  toneMappingExposure: 1.15,
                }}
              >
                <HoyojerezScene progress={progress} />
              </Canvas>
            </Suspense>
          ) : (
            <img src={import.meta.env.BASE_URL + stops[active].image} alt="" />
          )}
        </div>

        {/* Ambient Subtle Aura and Scanlines */}
        <div className="pf-journey-aura" aria-hidden="true" />
        <div className="pf-journey-scan" aria-hidden="true" />
        <div className="pf-journey-flash" aria-hidden="true" key={active} />
        <div className="pf-journey-vignette" aria-hidden="true" />

        {/* Top telemetry header */}
        <div className="pf-journey-top">
          <span>JG / TRAJETÓRIA PROCEDURAL 3D</span>
          <span>ROLE PARA NAVEGAR NO TÚNEL ↓</span>
        </div>

        {/* Active Milestone HUD Card (anchored at bottom-left in translucent glass) */}
        <div className="pf-journey-copy" aria-live="polite" key={active}>
          <span className="pf-journey-index">
            {String(active + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")} · ARQUIVO PESSOAL
          </span>
          <strong>{stops[active].year}</strong>
          <h2>{stops[active].title}</h2>
          <p>{stops[active].events.join(" · ")}</p>
        </div>

        {/* Bottom progress line */}
        <div className="pf-journey-progress" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}
