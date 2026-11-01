import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
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
  const width = Math.min(compact ? 3.55 : 6.2, (compact ? 3.1 : 4.75) * ratio);
  const height = width / ratio;
  const side = index % 2 ? 1 : -1;
  const z = (compact ? -10 : -8) - index * 13;
  return <group position={[compact ? 0 : side * 3.15, compact ? 0.85 : 0.05, z]} rotation={[0, compact ? 0 : side * -0.12, 0]}>
    <mesh position={[0, 0, -0.24]}><boxGeometry args={[width + 0.58, height + 0.66, 0.34]} /><meshBasicMaterial color="#17171d" /></mesh>
    <mesh position={[0, 0, -0.055]}><planeGeometry args={[width + 0.17, height + 0.17]} /><meshBasicMaterial color="#a6377d" side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0, 0.005]}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} /></mesh>
    <mesh position={[-width / 2 - 0.15, height / 2 + 0.16, -0.02]}><sphereGeometry args={[0.055, 10, 10]} /><meshBasicMaterial color="#cfff00" toneMapped={false} /></mesh>
    <mesh position={[width / 2 + 0.14, -height / 2 - 0.18, -0.02]}><circleGeometry args={[0.07, 16]} /><meshBasicMaterial color="#cfff00" toneMapped={false} /></mesh>
    <mesh position={[width / 2 - 0.07, -height / 2 - 0.18, -0.02]}><circleGeometry args={[0.045, 16]} /><meshBasicMaterial color="#804c84" /></mesh>
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
  const texture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + tunnel.alienImage);
  texture.colorSpace = THREE.SRGBColorSpace;
  const figure = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  useFrame(({ clock, camera, pointer }) => {
    const time = clock.elapsedTime + seed;
    if (figure.current) {
      figure.current.position.y = (compact ? -1.9 : -1.15) + Math.sin(time * 1.2) * 0.12;
      figure.current.quaternion.copy(camera.quaternion);
      figure.current.rotateZ(pointer.x * 0.025 + Math.sin(time * 0.42) * 0.018);
    }
    if (ring.current) ring.current.rotation.z = time * 0.25;
  });
  return <group position={[compact ? Math.sign(x) * 1.4 : x, 0, z]}>
    <mesh position={[0, -3.45, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[compact ? 0.9 : 1.3, 32]} /><meshBasicMaterial color="#a1ff6e" transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    <group ref={ring} position={[0, -3.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><torusGeometry args={[compact ? 0.8 : 1.2, 0.018, 6, 48]} /><meshBasicMaterial color="#cfff00" toneMapped={false} /></mesh>
      <mesh><torusGeometry args={[compact ? 1 : 1.45, 0.013, 6, 48]} /><meshBasicMaterial color="#d652a6" transparent opacity={0.7} /></mesh>
    </group>
    <group ref={figure}>
      <mesh><planeGeometry args={[compact ? 2.25 : 3.3, compact ? 3.4 : 4.95]} /><meshBasicMaterial map={texture} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>
    </group>
  </group>;
}

function TunnelArchitecture({ compact }: { compact: boolean }) {
  const radius = compact ? tunnel.structure.mobileRadius : tunnel.structure.desktopRadius;
  const length = tunnel.structure.length;
  const cave = useMemo(() => {
    const radial = 48;
    const depth = 70;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (let row = 0; row <= depth; row++) {
      const z = 8 - row / depth * length;
      for (let column = 0; column <= radial; column++) {
        const angle = column / radial * Math.PI * 2;
        const bend = Math.sin(z * .075) * .28 + Math.cos(z * .17) * .11;
        const shape = 1 + Math.sin(angle * 5 + z * .23) * .065 + Math.cos(angle * 9 - z * .12) * .035;
        const r = radius * shape + Math.sin(z * .21 + angle * 2) * .21;
        positions.push(Math.cos(angle) * r + bend, Math.sin(angle) * r * .86, z);
        uvs.push(column / radial * 4, row / depth * 10);
        if (row < depth && column < radial) {
          const a = row * (radial + 1) + column;
          indices.push(a, a + radial + 1, a + 1, a + 1, a + radial + 1, a + radial + 2);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, [radius, length]);
  useEffect(() => () => cave.dispose(), [cave]);
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
    <mesh geometry={cave}>
      <meshBasicMaterial map={wallTexture} side={THREE.BackSide} color="#a88a9e" />
    </mesh>
    {Array.from({ length: tunnel.structure.ringCount }, (_, index) => {
      const z = 1 - index * tunnel.structure.ringSpacing;
      const accent = index % 4 === 0;
      const scale = 1 + Math.sin(index * 2.7) * .045;
      return <group key={index} position={[Math.sin(z * .075) * .28, 0, z]} scale={[scale, scale * .86, 1]}>
        <mesh><torusGeometry args={[radius - 0.14, accent ? 0.045 : 0.022, 5, 48]} /><meshBasicMaterial color={accent ? tunnel.palette.neonAccent : tunnel.palette.neon} toneMapped={false} transparent opacity={accent ? .68 : .4} /></mesh>
        {accent && <mesh rotation={[0, 0, index * .54]}><torusGeometry args={[radius - .48, .014, 5, 48, Math.PI * 1.15]} /><meshBasicMaterial color="#fff2fc" transparent opacity={.35} /></mesh>}
      </group>;
    })}
    {Array.from({ length: 34 }, (_, index) => {
      const z = -3 - index * 2.55;
      const side = index % 2 ? 1 : -1;
      const x = side * radius * (.38 + (index % 3) * .17);
      const height = .45 + (index % 5) * .22;
      return <group key={`rock-${index}`} position={[x, index % 3 ? radius * .65 : -3.28, z]} rotation={[index * 1.1, index * .7, index * .27]}>
        <mesh scale={[.4 + index % 3 * .2, height, .42]}><dodecahedronGeometry args={[1, 0]} /><meshBasicMaterial color={index % 4 ? "#321e30" : "#5e314c"} /></mesh>
        {index % 5 === 0 && <mesh position={[0, 0, .5]} scale={[.2, .24, .13]}><dodecahedronGeometry args={[1, 0]} /><meshBasicMaterial color="#bf3c85" /></mesh>}
      </group>;
    })}
    {Array.from({ length: 17 }, (_, index) => <group key={`lamp-${index}`} position={[(index % 2 ? 1 : -1) * radius * .73, radius * .42, -4 - index * 5.2]} rotation={[0, 0, (index % 2 ? -1 : 1) * .28]}>
      <mesh><boxGeometry args={[.95, .08, .08]} /><meshBasicMaterial color={index % 3 ? "#df47a4" : "#cfff00"} toneMapped={false} /></mesh>
      <mesh position={[0, 0, -.06]}><boxGeometry args={[1.2, .24, .08]} /><meshBasicMaterial color={index % 3 ? "#df47a4" : "#cfff00"} transparent opacity={.12} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    </group>)}
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * radius * 0.64, radius * 0.69, -40]}><boxGeometry args={[0.035, 0.035, length]} /><meshBasicMaterial color={tunnel.palette.neon} transparent opacity={0.55} /></mesh>
      <mesh position={[side * radius * 0.91, -1.55, -40]}><boxGeometry args={[0.045, 0.045, length]} /><meshBasicMaterial color={tunnel.palette.neonAccent} transparent opacity={0.45} /></mesh>
    </group>)}
  </>;
}

function TunnelFloor({ compact }: { compact: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#100b12";
      context.fillRect(0, 0, 256, 256);
      for (let index = 0; index < 2200; index++) {
        const x = (index * 139.13) % 256;
        const y = (index * 87.77) % 256;
        context.fillStyle = index % 6 ? "#64415225" : "#a35a7124";
        context.fillRect(x, y, 1 + index % 4, 1 + index % 3);
      }
      context.strokeStyle = "#70253966";
      context.lineWidth = 1.1;
      for (let index = 0; index < 8; index++) {
        const x = (index * 91) % 256;
        const y = (index * 53) % 256;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 13, y + 19);
        context.lineTo(x - 7, y + 42);
        context.stroke();
      }
    }
    const result = new THREE.CanvasTexture(canvas);
    result.wrapS = result.wrapT = THREE.RepeatWrapping;
    result.repeat.set(compact ? 2 : 4, 15);
    result.colorSpace = THREE.SRGBColorSpace;
    return result;
  }, [compact]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group>
    <mesh position={[0, -3.5, -40]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[compact ? 5.9 : 13.8, 105]} /><meshBasicMaterial map={texture} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, -3.48, -40]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[compact ? 1.6 : 3.4, 105]} /><meshBasicMaterial color="#9c0924" transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
  </group>;
}

function Corridor({ progress }: { progress: MutableRefObject<number> }) {
  const compact = useThree(state => state.size.width < 700);
  const previousProgress = useRef(0);
  const momentum = useRef(0);
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
    const velocity = Math.abs(progress.current - previousProgress.current) / Math.max(delta, 0.016);
    previousProgress.current = progress.current;
    momentum.current = THREE.MathUtils.damp(momentum.current, Math.min(1, velocity * 0.48), 2.5, delta);
    const target = -2 - progress.current * (stops.length - 1) * 13;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target, 3.8, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, Math.sin(progress.current * Math.PI * 4) * (compact ? 0.38 : 0.9) + pointer.x * 0.22, 2.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, Math.sin(progress.current * Math.PI * 8) * 0.18 + pointer.y * 0.1, 2.2, delta);
    camera.lookAt(camera.position.x * 0.2, -0.05, camera.position.z - 12);
    camera.rotation.z += Math.sin(progress.current * Math.PI * 4) * (compact ? 0.025 : 0.065) + momentum.current * 0.035;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(camera.fov, 68 + momentum.current * 11, 3, delta);
      camera.updateProjectionMatrix();
    }
  });
  return <>
    <color attach="background" args={[tunnel.palette.background]} />
    <fog attach="fog" args={[tunnel.palette.background, 17, 67]} />
    <ambientLight intensity={0.85} />
    <TunnelArchitecture compact={compact} />
    <TunnelFloor compact={compact} />
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
  const colors = ["#733cba", "#f15b6c", "#6446e8", "#1a9ac0", "#a2b635"];
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
    <div className="pf-journey-stage" style={{ "--journey-aura": colors[active] } as CSSProperties}>
      <div className="pf-journey-world" aria-hidden="true">
        {!reduced ? <Suspense fallback={<div className="pf-journey-fallback" />}><Canvas fallback={<div className="pf-journey-fallback" />} dpr={[1, 1.5]} camera={{ position: [0, 0, 3], fov: 68, near: 0.1, far: 100 }} gl={{ antialias: false, powerPreference: "high-performance" }}><Corridor progress={progress} /></Canvas></Suspense> : <img src={import.meta.env.BASE_URL + stops[active].image} alt="" />}
      </div>
      <div className="pf-journey-aura" aria-hidden="true" />
      <div className="pf-journey-scan" aria-hidden="true" />
      <div className="pf-journey-flash" aria-hidden="true" key={active} />
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
