import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Stop = { year: number; title: string; image: string; events: string[] };

const stops: Stop[] = [
  { year: 2017, title: "Primeiros passos", image: "media/photos/tunnel-2017.webp", events: ["Infância", "Esporte"] },
  { year: 2018, title: "O jogo começa", image: "media/photos/tunnel-2018.webp", events: ["Futsal", "Primeiras competições"] },
  { year: 2024, title: "Competir e evoluir", image: "media/photos/tunnel-2024.webp", events: ["Tênis de mesa", "Pódio"] },
  { year: 2025, title: "Criar também é jogar", image: "media/photos/tunnel-2025.webp", events: ["GameDev", "Projetos"] },
  { year: 2026, title: "Próxima fase", image: "media/photos/tunnel-2026.webp", events: ["Formação", "Novos caminhos"] },
];

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
    <color attach="background" args={["#030304"]} />
    <fog attach="fog" args={["#030304", 15, 62]} />
    <mesh position={[0, -3.5, -40]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[width, 105]} /><meshBasicMaterial color="#190506" side={THREE.DoubleSide} /></mesh>
    <gridHelper args={[105, 53, "#8d181e", "#490e18"]} position={[0, -3.47, -40]} />
    <mesh position={[0, -3.4, -40]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[compact ? 2.8 : 6.5, 105]} /><meshBasicMaterial color="#8f0b17" transparent opacity={0.075} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /></bufferGeometry><pointsMaterial color="#cc75a3" size={0.035} transparent opacity={0.52} sizeAttenuation /></points>
    {Array.from({ length: 22 }, (_, index) => {
      const z = -index * 3.5;
      const accent = index % 5 === 0;
      return <group key={index} position={[0, 0, z]}>
        <NeonBar position={[-width / 2, 0, 0]} length={7.1} vertical color={accent ? "#cfff00" : "#ab427d"} />
        <NeonBar position={[width / 2, 0, 0]} length={7.1} vertical color={accent ? "#cfff00" : "#ab427d"} />
        <NeonBar position={[0, 3.5, 0]} length={width} color={accent ? "#cfff00" : "#87416d"} />
        <NeonBar position={[0, -3.42, 0]} length={width} color="#a22c3f" />
        {index % 2 === 0 && <>
          <mesh position={[-width / 2 + 0.4, 3.1, -0.02]} rotation={[0, 0, -0.65]}><boxGeometry args={[0.035, 1.45, 0.035]} /><meshBasicMaterial color="#ae4481" /></mesh>
          <mesh position={[width / 2 - 0.4, 3.1, -0.02]} rotation={[0, 0, 0.65]}><boxGeometry args={[0.035, 1.45, 0.035]} /><meshBasicMaterial color="#ae4481" /></mesh>
        </>}
      </group>;
    })}
    {stops.map((stop, index) => <Frame key={stop.year} stop={stop} index={index} compact={compact} />)}
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
