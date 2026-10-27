import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Experience } from './experience/Experience';
import type { KeyState } from './experience/Exploration';

const Exploration = lazy(() => import('./experience/Exploration').then(module => ({ default: module.Exploration })));
const base = import.meta.env.BASE_URL;
const storyUrl = base;
const explorationUrl = `${base}exploracao/`;

const chapters = [
  { id: 'arrival', number: '01', name: 'Arrival', eyebrow: 'THE FORGOTTEN CIVILIZATION', title: <>BEYOND<br /><em>THE KNOWN</em></>, body: 'Há mundos que não foram descobertos. Há mundos que escolheram ser esquecidos.', position: 'left' },
  { id: 'signal', number: '02', name: 'The Signal', eyebrow: 'ANOMALY / 001', title: <>The silence<br /><em>responds.</em></>, body: 'Um sinal atravessa a planície. A matéria antiga reage à presença de um visitante.', position: 'right' },
  { id: 'monolith', number: '03', name: 'The Monolith', eyebrow: 'STRUCTURE / 002', title: <>A form beyond<br /><em>memory.</em></>, body: 'Uma arquitetura colossal guarda as marcas de um conhecimento desaparecido.', position: 'left' },
  { id: 'archive', number: '04', name: 'The Archive', eyebrow: 'RECORD / 003', title: <>Beneath<br /><em>the surface.</em></>, body: 'Sob a areia negra, o arquivo conserva fragmentos de uma civilização silenciosa.', position: 'right' },
  { id: 'core', number: '05', name: 'The Core', eyebrow: 'ENERGY / 004', title: <>The heart<br /><em>still lives.</em></>, body: 'A fonte de energia permanece intacta. Uma única decisão pode reacender o mundo.', position: 'left' },
  { id: 'revelation', number: '06', name: 'The Revelation', eyebrow: 'TRANSMISSION / OPEN', title: <>We were<br /><em>never alone.</em></>, body: 'O que parecia ruína era apenas o primeiro sinal de algo imenso.', position: 'center' },
] as const;

function hasWebGL() {
  try { const canvas = document.createElement('canvas'); return !!(canvas.getContext('webgl2') || canvas.getContext('webgl')); }
  catch { return false; }
}

function Fallback() {
  return <div className="webgl-fallback"><span>OBSIDIAN</span><p>Seu navegador não oferece WebGL. A narrativa e a navegação continuam disponíveis sem a cena 3D.</p></div>;
}

function Header({ active, onChapter }: { active: 'story' | 'exploration'; onChapter?: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  useEffect(() => {
    if (!soundOn) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 48;
    gain.gain.value = .016;
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    return () => { oscillator.stop(); void context.close(); };
  }, [soundOn]);
  const selectChapter = (id: string) => { setMenuOpen(false); onChapter?.(id); };
  return <>
    <header className="site-header">
      <a className="brand" href={storyUrl} aria-label="OBSIDIAN, Experience"><span className="brand-mark">◈</span> OBSIDIAN</a>
      <span className="header-context">THE FORGOTTEN CIVILIZATION</span>
      <nav className="header-tabs" aria-label="Experiências">
        <a href={storyUrl} aria-current={active === 'story' ? 'page' : undefined}>EXPERIENCE</a>
        <a href={explorationUrl} aria-current={active === 'exploration' ? 'page' : undefined}>EXPLORAÇÃO</a>
      </nav>
      <div className="header-actions">
        <button className="sound-button" onClick={() => setSoundOn(value => !value)} aria-label={soundOn ? 'Desativar som' : 'Ativar som'}>SOUND {soundOn ? 'ON' : 'OFF'} <span className="sound-icon">{soundOn ? '◖))' : '◖'}</span></button>
        <button className="menu-toggle" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? 'CLOSE' : 'MENU'} <span>{menuOpen ? '×' : '☰'}</span></button>
      </div>
    </header>
    <nav className={`site-menu ${menuOpen ? 'is-open' : ''}`} aria-label="Navegação" aria-hidden={!menuOpen}>
      <span className="menu-kicker">{active === 'story' ? 'THE EXPERIENCE' : 'LEAVE THE EXPEDITION'}</span>
      {active === 'story' ? chapters.map(item => <button key={item.id} onClick={() => selectChapter(item.id)} tabIndex={menuOpen ? 0 : -1}><span>{item.number}</span>{item.name}<span>↗</span></button>) : <a className="menu-return" href={storyUrl}>RETURN TO EXPERIENCE <span>↗</span></a>}
      <a className="menu-return" href={active === 'story' ? explorationUrl : storyUrl}>{active === 'story' ? 'ENTER EXPLORATION' : 'BACK TO STORY'} <span>↗</span></a>
    </nav>
  </>;
}

function StoryPage() {
  const [chapter, setChapter] = useState(0);
  const [activated, setActivated] = useState(false);
  const [webgl] = useState(hasWebGL);
  const [reducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const progress = useRef(0);
  useEffect(() => {
    const remembered = Number(sessionStorage.getItem('obsidian-story-scroll') || 0);
    if (remembered > 0 && !location.hash) requestAnimationFrame(() => scrollTo(0, remembered));
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.current = max ? scrollY / max : 0;
      setChapter(Math.min(5, Math.floor(progress.current * 6)));
      sessionStorage.setItem('obsidian-story-scroll', String(scrollY));
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
    history.replaceState(null, '', `#${id}`);
  };
  return <>
    <div className="site-grain" aria-hidden="true" />
    <div className="scene-wrap" aria-label="Ambiente tridimensional de OBSIDIAN">
      {webgl ? <Experience progress={progress} activated={activated} onActivate={() => setActivated(true)} reducedMotion={reducedMotion} /> : <Fallback />}
    </div>
    <Header active="story" onChapter={goTo} />
    <aside className="chapter-rail" aria-label="Progresso narrativo"><span>00{chapter + 1} / 006</span><div className="rail-track"><span style={{ height: `${(chapter + 1) / 6 * 100}%` }} /></div><span className="rail-label">{chapters[chapter].name.toUpperCase()}</span></aside>
    <main className="story">
      {chapters.map((item, index) => <section className={`chapter chapter-${item.position} chapter-${item.id} ${chapter === index ? 'is-active' : ''}`} id={item.id} key={item.id}>
        {index === 0 && <div className="hero-topline"><span>AN EXPLORATION BEYOND MEMORY</span><span>01 — 06</span></div>}
        <div className="chapter-content">
          <div className="chapter-index"><span className="chapter-dash" /> {item.eyebrow} <span className="chapter-no">/ {item.number}</span></div>
          {index === 0 && <span className="hero-brand">OBSIDIAN</span>}
          <h1>{item.title}</h1>
          <p>{item.body}</p>
          {item.id === 'core' && <button className="primary-action" onClick={() => setActivated(true)} disabled={!webgl || activated}>{activated ? 'CORE ACTIVATED' : 'ACTIVATE THE CORE'} <span>◇</span></button>}
          {item.id === 'revelation' && <div className="final-actions"><button className="text-action" onClick={() => { sessionStorage.removeItem('obsidian-story-scroll'); goTo('arrival'); }}>RESTART EXPERIENCE <span>↗</span></button><a className="text-action" href={explorationUrl}>ENTER EXPLORATION <span>↗</span></a></div>}
        </div>
        {index === 0 && <div className="scroll-cue"><span>SCROLL TO DISCOVER</span><span className="scroll-line" /></div>}
        {index === 5 && <footer>OBSIDIAN © 2026 <span>AN ORIGINAL INTERACTIVE EXPERIENCE</span></footer>}
      </section>)}
    </main>
  </>;
}

function ExplorationPage() {
  const [webgl] = useState(hasWebGL);
  const [reducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [discovery, setDiscovery] = useState('');
  const keys = useRef<KeyState>({});
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
      if (event.code === 'Escape') { location.assign(storyUrl); return; }
      keys.current[event.code] = true;
    };
    const up = (event: KeyboardEvent) => { keys.current[event.code] = false; };
    const blur = () => { keys.current = {}; };
    addEventListener('keydown', down);
    addEventListener('keyup', up);
    addEventListener('blur', blur);
    return () => { removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('blur', blur); };
  }, []);
  const onDiscovery = useCallback((name: string) => {
    setDiscovery(name);
    setTimeout(() => setDiscovery(current => current === name ? '' : current), 3800);
  }, []);
  return <>
    <div className="site-grain" aria-hidden="true" />
    <div className="scene-wrap exploration-scene" aria-label="Mundo tridimensional explorável de OBSIDIAN">
      {webgl ? <Suspense fallback={<div className="experience-loading">PREPARING EXPEDITION</div>}><Exploration keys={keys} onDiscovery={onDiscovery} reducedMotion={reducedMotion} /></Suspense> : <Fallback />}
    </div>
    <Header active="exploration" />
    <div className="exploration-intro"><span>FIELD EXPEDITION / 001</span><h1>EXPLORE<br /><em>THE UNKNOWN</em></h1></div>
    <div className="expedition-ui" role="region" aria-label="Controles da exploração">
      <div className="expedition-top"><span>OBSIDIAN EXPEDITION <i /> LIVE</span><a href={storyUrl}>RETURN TO EXPERIENCE ↗</a></div>
      <div className="expedition-hint"><span>W A S D / ↑ ← ↓ →</span> DRIVE <span>SPACE</span> BRAKE <span>R</span> RESET <span>ESC</span> EXIT</div>
      <div className="touch-controls" aria-label="Controles de toque">{([['←', 'KeyA'], ['↑', 'KeyW'], ['↓', 'KeyS'], ['→', 'KeyD'], ['■', 'Space']] as const).map(([label, key]) => <button key={key} aria-label={key} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); keys.current[key] = true; }} onPointerUp={() => { keys.current[key] = false; }} onPointerCancel={() => { keys.current[key] = false; }}>{label}</button>)}</div>
      {discovery && <div className="discovery-toast"><small>POINT OF INTEREST DISCOVERED</small><strong>{discovery}</strong></div>}
    </div>
  </>;
}

export function App() { return /\/exploracao\/?$/.test(location.pathname) ? <ExplorationPage /> : <StoryPage />; }
