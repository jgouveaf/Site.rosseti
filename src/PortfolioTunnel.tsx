import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import tunnel from "./data/tunnel.json";

type Stop = { year: number; title: string; image: string; events: string[] };

const stops: Stop[] = tunnel.stops;

function NeonBar({ position, length, vertical = false, color = "#b63887" }: { position: [number, number, number]; length: number; vertical?: boolean; color?: string }) {
  return <group position={position} rotation={[0, 0, vertical ? Math.PI / 2 : 0]}>
    <mesh><boxGeometry args={[length, 0.026, 0.025]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
    <mesh><boxGeometry args={[length, 0.15, 0.08]} /><meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
  </group>;
}

function Frame({ index, stop, compact }: { index: number; stop: Stop; compact: boolean }) {
  const texture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + stop.image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const ratio = (texture.image?.width || 4) / (texture.image?.height || 3);
  const width = Math.min(compact ? 3.45 : 5.4, (compact ? 3 : 4.35) * ratio);
  const height = width / ratio;
  const side = index % 2 ? 1 : -1;
  const z = (compact ? -10 : -8) - index * 13;
  return <group position={[compact ? 0 : side * 3.15, compact ? 0.85 : 0.05, z]} rotation={[0, compact ? 0 : side * -0.12, 0]}>
    <mesh position={[0, 0, -0.12]}><planeGeometry args={[width + 0.42, height + 0.42]} /><meshBasicMaterial color="#11171a" side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0, -0.09]}><planeGeometry args={[width + 0.22, height + 0.22]} /><meshBasicMaterial color="#cfff00" side={THREE.DoubleSide} /></mesh>
    <mesh><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} /></mesh>
    <NeonBar position={[0, -height / 2 - 0.24, 0.02]} length={width + 0.55} color="#cfff00" />
    <mesh position={[-width / 2 - 0.13, height / 2 + 0.15, 0]}><sphereGeometry args={[0.075, 10, 10]} /><meshBasicMaterial color="#cfff00" toneMapped={false} /></mesh>
  </group>;
}

const sideImages = tunnel.sideImages;

function SidePanel({ index, compact }: { index: number; compact: boolean }) {
  const texture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + sideImages[index]);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const ratio = (texture.image?.width || 1) / (texture.image?.height || 1);
  const height = compact ? 2.3 : 3;
  const width = Math.min(2.9, height * ratio);
  const side = index % 2 ? -1 : 1;
  return <group position={[compact ? 0 : side * 4.05, compact ? 1.1 : 0.35, -15 - index * 13]} rotation={[0, compact ? 0 : side * -0.2, 0]}>
    <mesh position={[0, 0, -0.06]}><planeGeometry args={[width + 0.17, height + 0.17]} /><meshBasicMaterial color="#c355a5" side={THREE.DoubleSide} /></mesh>
    <mesh><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} /></mesh>
    <NeonBar position={[0, -height / 2 - 0.16, 0]} length={width + 0.28} color="#d2549d" />
  </group>;
}

function Alien({ x, z, seed, compact }: { x: number; z: number; seed: number; compact: boolean }) {
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  useFrame(({ clock, pointer }, delta) => {
    const time = clock.elapsedTime + seed;
    if (body.current) body.current.position.y = -1.38 + Math.sin(time * 1.2) * 0.09;
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, pointer.x * 0.25 + Math.sin(time * 0.5) * 0.1, 2, delta);
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -pointer.y * 0.1, 2, delta);
    }
    if (ring.current) ring.current.rotation.z = time * 0.25;
  });
  const skin = "#9cbca7";
  return <group position={[compact ? Math.sign(x) * 1.35 : x, compact ? -1.85 : -0.9, z]} scale={compact ? 0.5 : 0.75}>
    <mesh position={[0, -3.35, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.55, 32]} /><meshBasicMaterial color="#70ff7a" transparent opacity={0.11} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    <group ref={ring} position={[0, -3.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><torusGeometry args={[1.35, 0.018, 6, 48]} /><meshBasicMaterial color="#cfff00" toneMapped={false} /></mesh>
      <mesh><torusGeometry args={[1.62, 0.013, 6, 48]} /><meshBasicMaterial color="#64cc80" transparent opacity={0.62} /></mesh>
    </group>
    <pointLight color="#cfff80" intensity={3.4} distance={5} position={[0, 1.5, 1.4]} />
    <group ref={body} position={[0, -1.38, 0]}>
      <mesh position={[0, 0.08, 0]} scale={[0.85, 1.15, 0.62]}><capsuleGeometry args={[0.5, 0.72, 6, 12]} /><meshStandardMaterial color={skin} roughness={0.46} metalness={0.16} emissive="#244a33" emissiveIntensity={0.25} /></mesh>
      <mesh position={[0, 0.82, 0]}><cylinderGeometry args={[0.17, 0.2, 0.36, 10]} /><meshStandardMaterial color={skin} /></mesh>
      {[-1, 1].map(side => <group key={side}>
        <mesh position={[side * 0.72, -0.38, 0]} rotation={[0, 0, side * 0.2]}><capsuleGeometry args={[0.13, 1.15, 4, 8]} /><meshStandardMaterial color={skin} roughness={0.5} /></mesh>
        <mesh position={[side * 0.28, -1.37, 0]} rotation={[0, 0, side * 0.08]}><capsuleGeometry args={[0.17, 0.92, 4, 8]} /><meshStandardMaterial color={skin} roughness={0.5} /></mesh>
      </group>)}
      <group ref={head} position={[0, 1.56, 0]}>
        <mesh scale={[0.88, 1.08, 0.7]}><sphereGeometry args={[0.83, 24, 18]} /><meshStandardMaterial color={skin} roughness={0.48} metalness={0.14} emissive="#244a33" emissiveIntensity={0.25} /></mesh>
        {[-1, 1].map(side => <mesh key={side} position={[side * 0.32, 0.04, 0.53]} rotation={[0, 0, side * -0.24]} scale={[0.18, 0.31, 0.085]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#0b1413" metalness={0.55} roughness={0.16} /></mesh>)}
        <mesh position={[0, -0.39, 0.58]} scale={[0.13, 0.018, 0.018]}><sphereGeometry args={[1, 8, 6]} /><meshBasicMaterial color="#32463b" /></mesh>
      </group>
    </group>
  </group>;
}

function TunnelArchitecture({ compact }: { compact: boolean }) {
  const radius = compact ? tunnel.structure.mobileRadius : tunnel.structure.desktopRadius;
  const length = tunnel.structure.length;
  const wallTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = tunnel.palette.walls;
      context.fillRect(0, 0, 256, 256);
      for (let index = 0; index < 480; index++) {
        const x = (index * 97.13) % 256;
        const y = (index * 53.71) % 256;
        context.fillStyle = index % 5 ? "#5f3c5890" : "#a75a8955";
        context.fillRect(x, y, index % 7 ? 1 : 12, index % 7 ? 1 : 2);
      }
      context.strokeStyle = "#9a59704f";
      context.lineWidth = 1.5;
      for (let index = 0; index < 12; index++) {
        const y = (index * 79) % 256;
        context.beginPath();
        context.moveTo(0, y);
        context.bezierCurveTo(80, y - 12, 170, y + 18, 256, y - 8);
        context.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => wallTexture.dispose(), [wallTexture]);
  return <>
    <mesh position={[0, 0, -40]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[radius, radius, length, 40, 1, true]} />
      <meshBasicMaterial map={wallTexture} side={THREE.BackSide} />
    </mesh>
    {Array.from({ length: tunnel.structure.ringCount }, (_, index) => {
      const z = -index * tunnel.structure.ringSpacing;
      const accent = index % 6 === 0;
      return <group key={index} position={[0, 0, z]}>
        <mesh><torusGeometry args={[radius - 0.12, accent ? 0.075 : 0.035, 6, 48]} /><meshBasicMaterial color={accent ? tunnel.palette.neonAccent : tunnel.palette.neon} toneMapped={false} transparent opacity={accent ? 0.9 : 0.6} /></mesh>
        {accent && <mesh position={[0, 0, -0.1]}><torusGeometry args={[radius - 0.12, 0.2, 4, 32]} /><meshBasicMaterial color={tunnel.palette.neonAccent} transparent opacity={0.06} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>}
        {index % 3 === 0 && <mesh rotation={[0, 0, index * 0.32]}><torusGeometry args={[radius - 0.55, 0.018, 5, 48]} /><meshBasicMaterial color="#fff2fc" transparent opacity={0.24} /></mesh>}
      </group>;
    })}
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * radius * 0.64, radius * 0.69, -40]}><boxGeometry args={[0.035, 0.035, length]} /><meshBasicMaterial color={tunnel.palette.neon} transparent opacity={0.55} /></mesh>
      <mesh position={[side * radius * 0.91, -1.55, -40]}><boxGeometry args={[0.045, 0.045, length]} /><meshBasicMaterial color={tunnel.palette.neonAccent} transparent opacity={0.45} /></mesh>
    </group>)}
  </>;
}

function Corridor({ progress }: { progress: MutableRefObject<number> }) {
  const compact = useThree(state => state.size.width < 700);
  const width = compact ? 5.9 : 13.8;
  const stars = useMemo(() => {
    const points: number[] = [];
    for (let index = 0; index < 180; index++) {
      const seed = Math.sin(index * 41.71) * 10000;
      const x = (seed - Math.floor(seed)) * 20 - 10;
      const offset = Math.sin(index * 13.13) * 10000;
      const y = (offset - Math.floor(offset)) * 7 + 0.5;
      points.push(x, y, -index * 0.43);
    }
    return new Float32Array(points);
  }, []);
  useFrame(({ camera, pointer }, delta) => {
    const target = -2 - progress.current * (stops.length - 1) * 13;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target, 3.4, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, Math.sin(progress.current * Math.PI * 3) * 0.25 + pointer.x * 0.2, 2.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.1, 2.2, delta);
    camera.lookAt(camera.position.x * 0.12, -0.05, camera.position.z - 12);
  });
  return <>
    <color attach="background" args={[tunnel.palette.background]} />
    <fog attach="fog" args={[tunnel.palette.background, 17, 67]} />
    <ambientLight intensity={0.85} />
    <TunnelArchitecture compact={compact} />
    <mesh position={[0, -3.5, -40]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[width, 105]} /><meshBasicMaterial color="#190506" side={THREE.DoubleSide} /></mesh>
    <gridHelper args={[105, 53, "#8d181e", "#490e18"]} position={[0, -3.47, -40]} />
    <mesh position={[0, -3.4, -40]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[compact ? 2.8 : 6.5, 105]} /><meshBasicMaterial color="#8f0b17" transparent opacity={0.075} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /></bufferGeometry><pointsMaterial color="#cc75a3" size={0.035} transparent opacity={0.52} sizeAttenuation /></points>
    {stops.map((stop, index) => <Frame key={stop.year} stop={stop} index={index} compact={compact} />)}
    {sideImages.map((_, index) => <SidePanel key={index} index={index} compact={compact} />)}
    {tunnel.aliens.map(alien => <Alien key={alien.z} {...alien} compact={compact} />)}
  </>;
}

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
      progress.current = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
      root.current.style.setProperty("--journey-progress", String(progress.current));
      setActive(Math.min(stops.length - 1, Math.round(progress.current * (stops.length - 1))));
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request);
    return () => { removeEventListener("scroll", request); removeEventListener("resize", request); cancelAnimationFrame(frame); };
  }, []);
  const jump = (index: number) => {
    if (!root.current) return;
    const top = root.current.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + index / (stops.length - 1) * (root.current.offsetHeight - innerHeight), behavior: "smooth" });
  };
  return <section className="pf-journey" ref={root} data-photo-side={active % 2 ? "right" : "left"} aria-label="Trajetória em um túnel de fotos">
    <div className="pf-journey-stage">
      <div className="pf-journey-world" aria-hidden="true">
        {!reduced ? <Suspense fallback={<div className="pf-journey-fallback" />}><Canvas fallback={<div className="pf-journey-fallback" />} dpr={[1, 1.5]} camera={{ position: [0, 0, 3], fov: 68, near: 0.1, far: 100 }} gl={{ antialias: false, powerPreference: "high-performance" }}><Corridor progress={progress} /></Canvas></Suspense> : <img src={import.meta.env.BASE_URL + stops[active].image} alt="" />}
      </div>
      <div className="pf-journey-scan" aria-hidden="true" />
      <div className="pf-journey-vignette" aria-hidden="true" />
      <div className="pf-journey-top"><span>JG / TRAJETÓRIA</span><span>ROLE PARA AVANÇAR ↓</span></div>
      <div className="pf-journey-copy" aria-live="polite" key={active}>
        <span className="pf-journey-index">{String(active + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")} · ARQUIVO PESSOAL</span>
        <strong>{stops[active].year}</strong>
        <h2>{stops[active].title}</h2>
        <p>{stops[active].events.join(" · ")}</p>
      </div>
      <nav className="pf-journey-nav" aria-label="Ir para um ano da trajetória">
        {stops.map((stop, index) => <button key={stop.year} type="button" className={index === active ? "is-active" : ""} onClick={() => jump(index)} aria-label={`Ir para ${stop.year}`} aria-current={index === active ? "step" : undefined}><span>{stop.year}</span></button>)}
      </nav>
      <div className="pf-journey-progress" aria-hidden="true"><i /></div>
    </div>
  </section>;
}
