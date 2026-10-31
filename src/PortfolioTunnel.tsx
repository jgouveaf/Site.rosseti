import { Suspense, useEffect, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Stop = { year: number; title: string; image: string; alt: string; events: string[] };

const stops: Stop[] = [
  { year: 2017, title: "Primeiros passos", image: "media/photos/joao-infancia-futsal.webp", alt: "João criança em uma quadra de futsal", events: ["Kumon · Expo 2017"] },
  { year: 2018, title: "O esporte como escola", image: "media/photos/futebol-2018.webp", alt: "Registro de futsal na infância", events: ["Chute Inicial Ipiranga"] },
  { year: 2022, title: "Novos desafios", image: "media/photos/canguru-2022-small.webp", alt: "Registro de conquista acadêmica", events: ["Matemática", "Astronomia", "Robótica"] },
  { year: 2023, title: "Explorar e aprender", image: "media/photos/zoom-small.webp", alt: "Registro de projeto de robótica", events: ["Olimpíadas acadêmicas", "Robótica"] },
  { year: 2024, title: "Competir e evoluir", image: "media/photos/premiacao-2024-small.webp", alt: "João em premiação de tênis de mesa", events: ["Tênis de mesa", "Matemática", "Arte"] },
  { year: 2025, title: "Ideias em movimento", image: "media/photos/unity-small.webp", alt: "João com certificado de GameDev", events: ["GameDev", "OBI", "ItalianWhey"] },
  { year: 2026, title: "O próximo capítulo", image: "media/photos/fecart-small.webp", alt: "Registro do projeto FECART", events: ["FECART", "Projetos em desenvolvimento"] },
];

function Frame({ index, stop, compact }: { index: number; stop: Stop; compact: boolean }) {
  const texture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + stop.image);
  texture.colorSpace = THREE.SRGBColorSpace;
  const ratio = (texture.image?.width || 4) / (texture.image?.height || 3);
  const width = Math.min(compact ? 3.4 : 4.7, (compact ? 2.6 : 3.1) * ratio);
  const height = width / ratio;
  const side = index % 2 ? 1 : -1;
  const z = -8 - index * 10;
  return <group position={[compact ? 0 : side * 3.25, compact ? 1.1 : 0.1, z]} rotation={[0, compact ? 0 : side * -0.13, 0]}>
    <mesh position={[0, 0, -0.06]}><planeGeometry args={[width + 0.27, height + 0.27]} /><meshBasicMaterial color="#cfff00" /></mesh>
    <mesh><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} /></mesh>
    <mesh position={[0, -height / 2 - 0.19, 0]}><planeGeometry args={[width + 0.27, 0.16]} /><meshBasicMaterial color="#cfff00" /></mesh>
  </group>;
}

function Corridor({ progress }: { progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const compact = useThree(state => state.size.width < 700);
  useFrame(({ camera, pointer }, delta) => {
    const target = -2 - progress.current * (stops.length - 1) * 10;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target, 4, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.24, 2.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.12, 2.5, delta);
    camera.lookAt(camera.position.x * 0.15, 0, camera.position.z - 10);
    if (group.current) group.current.rotation.z = Math.sin(progress.current * Math.PI * 2) * 0.015;
  });
  return <>
    <color attach="background" args={["#030507"]} />
    <fog attach="fog" args={["#030507", 12, 52]} />
    <group ref={group}>
      <mesh position={[0, -3.75, -40]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[compact ? 6 : 14, 100]} /><meshBasicMaterial color="#11070d" side={THREE.DoubleSide} /></mesh>
      <gridHelper args={[100, 46, "#6c1935", "#3b1526"]} position={[0, -3.73, -40]} />
      {Array.from({ length: 23 }, (_, index) => <group key={index} position={[0, 0, -index * 3.6]}>
        <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(compact ? 5.8 : 13.7, 7.5, 0.02)]} /><lineBasicMaterial color={index % 3 === 0 ? "#cfff00" : "#8a426e"} transparent opacity={index % 3 === 0 ? 0.8 : 0.55} /></lineSegments>
        <mesh position={[compact ? -2.82 : -6.65, 0, 0]}><boxGeometry args={[0.035, 7.1, 0.035]} /><meshBasicMaterial color="#d351a0" /></mesh>
        <mesh position={[compact ? 2.82 : 6.65, 0, 0]}><boxGeometry args={[0.035, 7.1, 0.035]} /><meshBasicMaterial color="#d351a0" /></mesh>
      </group>)}
      {stops.map((stop, index) => <Frame key={stop.year} stop={stop} index={index} compact={compact} />)}
    </group>
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
