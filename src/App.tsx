import { useCallback, useEffect, useRef, useState } from 'react';
import { Experience, type ExperienceMode, type KeyState } from './experience/Experience';

const chapters = [
  { id: 'arrival', number: '01', name: 'Arrival', eyebrow: 'COORDINATES / UNKNOWN', title: <>Beyond<br /><em>the known.</em></>, body: 'No horizonte de um mundo de areia negra, algo aguarda há milênios.', position: 'left' },
  { id: 'awakening', number: '02', name: 'The Awakening', eyebrow: 'SIGNAL / DETECTED', title: <>The silence<br /><em>is listening.</em></>, body: 'Uma presença altera o equilíbrio. A pedra desperta, e a memória da paisagem começa a pulsar.', position: 'right' },
  { id: 'structure', number: '03', name: 'The Ancient Structure', eyebrow: 'ARCHIVE / 003', title: <>A monument<br /><em>to absence.</em></>, body: 'Sob a poeira, um observatório ainda procura aquilo que seus criadores deixaram para trás.', position: 'left' },
  { id: 'expedition', number: '04', name: 'Expedition', eyebrow: 'ACCESS / GRANTED', title: <>Leave the path.<br /><em>Find the truth.</em></>, body: 'Assuma o controle do explorador. Cada ruína pode revelar um fragmento desta civilização.', position: 'right' },
  { id: 'core', number: '05', name: 'The Core', eyebrow: 'ENERGY / DORMANT', title: <>The heart<br /><em>remembers.</em></>, body: 'Nas profundezas, uma energia desconhecida continua à espera de uma escolha.', position: 'left' },
  { id: 'beyond', number: '06', name: 'Beyond', eyebrow: 'TRANSMISSION / OPEN', title: <>We were<br /><em>never alone.</em></>, body: 'O fim de uma civilização talvez seja apenas o início de outra história.', position: 'center' },
] as const;

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch { return false; }
}

export function App() {
  const [mode, setMode] = useState<ExperienceMode>('story');
  const [chapter, setChapter] = useState(0);
  const [activated, setActivated] = useState(false);
  const [discovery, setDiscovery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [webgl] = useState(hasWebGL);
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const progress = useRef(0);
  const keys = useRef<KeyState>({});
  const audio = useRef<{ context: AudioContext; oscillator: OscillatorNode; gain: GainNode } | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max ? window.scrollY / max : 0;
      setChapter(Math.min(5, Math.round(progress.current * 5)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('exploring', mode === 'expedition');
    return () => document.body.classList.remove('exploring');
  }, [mode]);

  const exitExpedition = useCallback(() => {
    setMode('story');
    keys.current = {};
  }, []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (mode !== 'expedition') return;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
      if (event.code === 'Escape') { exitExpedition(); return; }
      keys.current[event.code] = true;
    };
    const up = (event: KeyboardEvent) => { keys.current[event.code] = false; };
    const blur = () => { keys.current = {}; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [mode, exitExpedition]);

  useEffect(() => {
    if (!soundOn) {
      audio.current?.oscillator.stop();
      void audio.current?.context.close();
      audio.current = null;
      return;
    }
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = activated ? 67 : 48;
    gain.gain.value = .018;
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    audio.current = { context, oscillator, gain };
    return () => {
      oscillator.stop();
      void context.close();
      audio.current = null;
    };
  }, [soundOn, activated]);

  const onDiscovery = useCallback((name: string) => {
    setDiscovery(name);
    window.setTimeout(() => setDiscovery(current => current === name ? '' : current), 3800);
  }, []);

  const goTo = (id: string) => {
    exitExpedition();
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
    history.replaceState(null, '', `#${id}`);
  };

  return <>
    <div className="site-grain" aria-hidden="true" />
    <div className="scene-wrap" aria-label="Cenário tridimensional de OBSIDIAN">
      {webgl ? <Experience progress={progress} mode={mode} keys={keys} activated={activated} onActivate={() => setActivated(true)} onDiscovery={onDiscovery} reducedMotion={reducedMotion} /> :
        <div className="webgl-fallback"><span>OBSIDIAN</span><p>Seu navegador não oferece WebGL. A narrativa continua disponível sem a cena 3D.</p></div>}
    </div>
    <header className="site-header">
      <a className="brand" href="#arrival" onClick={event => { event.preventDefault(); goTo('arrival'); }} aria-label="OBSIDIAN, voltar ao início"><span className="brand-mark">◈</span> OBSIDIAN</a>
      <span className="header-context">THE FORGOTTEN CIVILIZATION <span>—</span> EXPERIENCE 001</span>
      <div className="header-actions">
        <button className="sound-button" onClick={() => setSoundOn(value => !value)} aria-label={soundOn ? 'Desativar som' : 'Ativar som'}>SOUND {soundOn ? 'ON' : 'OFF'} <span className="sound-icon">{soundOn ? '◖))' : '◖'}</span></button>
        <button className="menu-toggle" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? 'CLOSE' : 'MENU'} <span>{menuOpen ? '×' : '☰'}</span></button>
      </div>
    </header>
    <nav className={`site-menu ${menuOpen ? 'is-open' : ''}`} aria-label="Capítulos" aria-hidden={!menuOpen}>
      <span className="menu-kicker">CHOOSE A DESTINATION</span>
      {chapters.map(item => <button key={item.id} onClick={() => goTo(item.id)} tabIndex={menuOpen ? 0 : -1}><span>{item.number}</span>{item.name}<span>↗</span></button>)}
    </nav>
    <aside className="chapter-rail" aria-label="Progresso narrativo">
      <span>00{chapter + 1} / 006</span>
      <div className="rail-track"><span style={{ height: `${(chapter + 1) / 6 * 100}%` }} /></div>
      <span className="rail-label">{chapters[chapter].name.toUpperCase()}</span>
    </aside>
    <main aria-hidden={mode === 'expedition'}>
      {chapters.map((item, index) => <section className={`chapter chapter-${item.position} chapter-${item.id}`} id={item.id} key={item.id}>
        {index === 0 && <div className="hero-topline"><span>AN EXPLORATION BEYOND MEMORY</span><span>01 — 06</span></div>}
        <div className="chapter-content">
          <div className="chapter-index"><span className="chapter-dash" /> {item.eyebrow} <span className="chapter-no">/ {item.number}</span></div>
          {index === 0 && <span className="hero-brand">OBSIDIAN</span>}
          <h1>{item.title}</h1>
          <p>{item.body}</p>
          {item.id === 'expedition' && <button className="primary-action" onClick={() => setMode('expedition')} disabled={!webgl}>ENTER EXPEDITION <span>↗</span></button>}
          {item.id === 'core' && <button className="primary-action" onClick={() => setActivated(true)} disabled={!webgl || activated}>{activated ? 'CORE ACTIVATED' : 'ACTIVATE THE CORE'} <span>◇</span></button>}
          {item.id === 'beyond' && <button className="text-action" onClick={() => goTo('arrival')}>RESTART THE JOURNEY <span>↗</span></button>}
        </div>
        {index === 0 && <div className="scroll-cue"><span>SCROLL TO EXPLORE</span><span className="scroll-line" /></div>}
        {index === 5 && <footer>OBSIDIAN © 2026 <span>AN ORIGINAL INTERACTIVE EXPERIMENT</span></footer>}
      </section>)}
    </main>
    {mode === 'expedition' && <div className="expedition-ui" role="region" aria-label="Controles da expedição">
      <div className="expedition-top"><span>EXPLORATION MODE <i /> LIVE</span><button onClick={exitExpedition}>EXIT EXPEDITION ×</button></div>
      <div className="expedition-hint"><span>W A S D / ↑ ← ↓ →</span> DRIVE <span>SPACE</span> BRAKE <span>R</span> RESET <span>ESC</span> EXIT</div>
      <div className="touch-controls" aria-label="Controles de toque">
        {([['←', 'KeyA'], ['↑', 'KeyW'], ['↓', 'KeyS'], ['→', 'KeyD'], ['■', 'Space']] as const).map(([label, key]) => <button key={key} aria-label={key} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); keys.current[key] = true; }} onPointerUp={() => { keys.current[key] = false; }} onPointerCancel={() => { keys.current[key] = false; }}>{label}</button>)}
      </div>
      {discovery && <div className="discovery-toast"><small>POINT OF INTEREST DISCOVERED</small><strong>{discovery}</strong></div>}
    </div>}
  </>;
}
