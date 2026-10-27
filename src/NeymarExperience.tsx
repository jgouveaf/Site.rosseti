import { useEffect, useRef, useState, Suspense, lazy, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import content from './data/neymar.json';
import design from '../design-system.neymar.json';
import './neymar.css';

// Lazy load 3D Museum component for optimal initial performance
const NeymarMuseum = lazy(() => import('./experience/NeymarMuseum').then(m => ({ default: m.NeymarMuseum })));

type Moment = typeof content.moments[number];
const image = (file: string) => import.meta.env.BASE_URL + 'images/neymar/' + file;
const momentById = (id: string) => content.moments.find(moment => moment.id === id) || content.moments[0];
const gallery = content.gallery.map(momentById);
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function NeymarExperience() {
  const page = useRef<HTMLDivElement>(null);
  const journey = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const museumSection = useRef<HTMLElement>(null);

  const [selected, setSelected] = useState<Moment | null>(null);
  const focusOrigin = useRef<HTMLElement | null>(null);
  const detail = useRef<HTMLElement>(null);
  const originImage = useRef<HTMLElement | null>(null);

  const [museumProgress, setMuseumProgress] = useState(0);
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' ? matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  const open = (moment: Moment, element?: HTMLElement) => {
    if (element) {
      focusOrigin.current = element;
      originImage.current = element.querySelector('img');
    }
    if (!reducedMotion && document.startViewTransition && originImage.current) {
      originImage.current.style.viewTransitionName = 'ney-active-photo';
      const transition = document.startViewTransition(() => {
        if (originImage.current) originImage.current.style.viewTransitionName = '';
        flushSync(() => setSelected(moment));
      });
      void transition.finished.catch(() => {});
    } else {
      setSelected(moment);
    }
  };

  const closeDetail = () => {
    const origin = originImage.current;
    if (!reducedMotion && document.startViewTransition && origin) {
      const transition = document.startViewTransition(() => {
        flushSync(() => setSelected(null));
        origin.style.viewTransitionName = 'ney-active-photo';
      });
      void transition.finished.catch(() => {}).finally(() => {
        origin.style.viewTransitionName = '';
      });
    } else {
      setSelected(null);
    }
  };

  const interact = (id: string) => ({
    role: 'button' as const,
    tabIndex: 0,
    onClick: (event: React.MouseEvent<HTMLElement>) => open(momentById(id), event.currentTarget),
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(momentById(id), event.currentTarget);
      }
    },
  });

  // Scroll listeners and scene updates
  useEffect(() => {
    let frame = 0;
    const scenes = page.current?.querySelectorAll<HTMLElement>('[data-scroll-scene]') ?? [];

    const update = () => {
      frame = 0;

      // 1. Horizontal Journey progress
      if (journey.current && track.current) {
        const bounds = journey.current.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -bounds.top / (bounds.height - innerHeight)));
        const cards = track.current.querySelectorAll<HTMLElement>('.ney-photo-card');
        const distance = cards.length ? cards[cards.length - 1].offsetLeft - cards[0].offsetLeft : 0;
        track.current.style.setProperty('--travel', -progress * distance + 'px');
        journey.current.style.setProperty('--journey-progress', String(progress));
        if (count.current) {
          count.current.textContent = String(Math.round(progress * (gallery.length - 1)) + 1).padStart(2, '0');
        }
      }

      // 2. 3D Museum scroll progress
      if (museumSection.current) {
        const mBounds = museumSection.current.getBoundingClientRect();
        const mProgress = clamp(-mBounds.top / Math.max(1, mBounds.height - innerHeight));
        setMuseumProgress(mProgress);
        museumSection.current.style.setProperty('--museum-p', String(mProgress));
      }

      // 3. Hero parallax drift
      page.current?.style.setProperty(
        '--hero-drift',
        (reducedMotion ? 0 : Math.min(scrollY * 0.14, 140)) + 'px'
      );

      // 4. Scroll scenes
      for (const scene of scenes) {
        const rect = scene.getBoundingClientRect();
        if (rect.top > innerHeight * 1.2 || rect.bottom < -innerHeight * 0.2) continue;
        const p =
          scene.dataset.scrollScene === 'pinned'
            ? clamp(-rect.top / Math.max(1, rect.height - innerHeight))
            : clamp((innerHeight - rect.top) / (innerHeight + rect.height));
        scene.style.setProperty('--p', String(reducedMotion ? 1 : p));
      }
    };

    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    update();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add('is-revealed');
        }
      },
      { threshold: 0.1 }
    );

    page.current?.querySelectorAll('.ney-reveal').forEach((el) => observer.observe(el));

    return () => {
      removeEventListener('scroll', queue);
      removeEventListener('resize', queue);
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reducedMotion]);

  // Trap focus and handle ESC when detail view is open
  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    detail.current?.focus();

    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDetail();
      if (event.key === 'Tab' && detail.current) {
        const links = detail.current.querySelectorAll<HTMLElement>('a[href], button');
        if (!links.length) {
          event.preventDefault();
          return;
        }
        const first = links[0];
        const last = links[links.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === detail.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = previous;
      removeEventListener('keydown', close);
      focusOrigin.current?.focus({ preventScroll: true });
    };
  }, [selected, reducedMotion]);

  return (
    <div
      className="ney-page"
      ref={page}
      style={
        Object.fromEntries(
          Object.entries(design.colors).map(([key, value]) => ['--ney-' + key, value])
        ) as CSSProperties
      }
    >
      {/* Top Header */}
      <header className="ney-header">
        <span className="ney-monogram">
          nj<span>.</span>
        </span>
        <span className="ney-header-center">FUTEBOL · IDENTIDADE · 2010—2026</span>
        <span className="ney-fan-label">
          EXPERIÊNCIA DE FÃ <i />
        </span>
      </header>

      <main inert={selected ? true : undefined}>
        {/* HERO SECTION */}
        <section
          className="ney-hero"
          aria-label="Neymar Júnior, uma experiência interativa"
          onPointerMove={(event) => {
            if (reducedMotion) return;
            event.currentTarget.style.setProperty(
              '--pointer-x',
              (event.clientX / innerWidth - 0.5) * 16 + 'px'
            );
            event.currentTarget.style.setProperty(
              '--pointer-y',
              (event.clientY / innerHeight - 0.5) * 12 + 'px'
            );
          }}
        >
          <div className="ney-orbit ney-orbit-left" aria-hidden="true" />
          <div className="ney-orbit ney-orbit-right" aria-hidden="true" />
          <div className="ney-hero-meta">
            <span>DO BRASIL PARA O MUNDO · 2010—2026</span>
            <span>ARQUIVO HISTÓRICO & MUSEU 3D</span>
          </div>

          <h1 className="ney-hero-name">
            <span>NEYMAR</span>
            <em>
              JÚNIOR<span>.</span>
            </em>
          </h1>

          <div
            className="ney-hero-portrait"
            role="button"
            tabIndex={0}
            aria-label="Revelar o retrato de Neymar"
            onClick={(event) => open(momentById('identidade'), event.currentTarget)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                open(momentById('identidade'), event.currentTarget);
              }
            }}
          >
            <img
              src={image('portrait-cutout.png')}
              alt="Neymar Júnior, em retrato de Lucho Vidales com fundo recortado"
              fetchPriority="high"
            />
            <span className="ney-portrait-hint">CLIQUE PARA REVELAR ↗</span>
          </div>

          <div className="ney-hero-copy">
            <h2>
              O talento é brasileiro.<br />
              A expressão é <em>única.</em>
            </h2>
            <p>
              Do improviso nas quadras aos maiores palcos do futebol mundial.<br />
              Uma jornada em imagens, relíquias e memórias.
            </p>
            <span className="ney-scroll-hint">
              ROLE PARA DESCOBRIR <span>↓</span>
            </span>
          </div>

          <div className="ney-number-card">
            <span>CAMISA 10</span>
            <strong>10.</strong>
            <small>
              SANTOS · BARÇA<br />
              BRASIL · PARIS
            </small>
          </div>

          <span className="ney-floating-ball" aria-hidden="true">
            ✳
          </span>

          <div className="ney-hero-bottom">
            <span>FUTEBOL É ARTE E IRREVERÊNCIA.</span>
            <span>A TRAJETÓRIA COMPLETA NO SCROLL ↓</span>
          </div>
        </section>

        {/* 01. O MANIFESTO */}
        <section className="ney-manifesto ney-reveal" data-scroll-scene="reveal">
          <div className="ney-section-label">
            <span>01 / A ESSÊNCIA</span>
            <span>MAIS QUE UM NÚMERO.</span>
          </div>
          <h2>
            O jogo muda.<br />
            A <em>ousadia</em><br />
            permanece<span>.</span>
          </h2>
          <div className="ney-manifesto-copy">
            <span className="ney-star">✳</span>
            <p>
              Tem jogador que segue o roteiro.<br />
              Tem jogador que inventa o próximo lance antes da marcação existir.
            </p>
            <p>
              Uma trajetória contada em fotografias históricas e relíquias 3D.<br />
              Role para percorrer. Toque nas imagens para descobrir os detalhes.
            </p>
          </div>
        </section>

        {/* 02. COLAGEM INTERATIVA EM PARALLAX */}
        <section
          className="ney-collage ney-motion"
          data-scroll-scene="pinned"
          aria-label="Colagem interativa de momentos"
        >
          <div className="ney-collage-sticky">
            <div className="ney-collage-label">
              <span>02 / ARQUIVO EM CAMADAS (2010—2026)</span>
              <span>CLIQUE NAS FOTOGRAFIAS PARA ABRIR ↗</span>
            </div>
            <h2>
              CRIAR.<br />
              <em>OUSAR.</em>
            </h2>
            {content.collage.map((id, i) => {
              const moment = momentById(id);
              const dxArr = [-26, -14, 22, 32, 2, -20, 18];
              const dyArr = [-32, 30, -32, 26, 38, -12, 10];
              const angleArr = [-12, 10, 12, -9, -4, 7, -6];
              return (
                <figure
                  key={id}
                  className={'ney-collage-photo ney-collage-photo-' + i}
                  style={
                    {
                      '--dx': dxArr[i % dxArr.length],
                      '--dy': dyArr[i % dyArr.length],
                      '--angle': angleArr[i % angleArr.length] + 'deg',
                    } as CSSProperties
                  }
                  {...interact(id)}
                  aria-label={'Revelar ' + moment.title}
                >
                  <img src={image(moment.image)} alt={moment.imageCaption} loading="lazy" />
                  <figcaption>
                    {moment.year} / {moment.tag}
                  </figcaption>
                </figure>
              );
            })}
            <span className="ney-collage-bottom">
              A MESMA IDENTIDADE. DIFERENTES CAMISAS E ÉPOCAS.
            </span>
          </div>
        </section>

        {/* 03. O MENINO DA VILA */}
        <section className="ney-origin ney-reveal" data-scroll-scene="reveal">
          <div
            className="ney-origin-photo"
            {...interact('origem')}
            aria-label="Explorar as origens de Neymar"
          >
            <img
              src={image('inicio-2012.jpg')}
              alt="Neymar em 2012, arquivo da primeira passagem pelo Santos"
              loading="lazy"
            />
            <span>ARQUIVO SANTOS FC · CLIQUE PARA REVELAR ↗</span>
          </div>
          <div className="ney-origin-copy">
            <span className="ney-eyebrow">03 / O MENINO DA VILA (2009—2010)</span>
            <h2>
              Antes do mundo,<br />a <em>Vila Belmiro.</em>
            </h2>
            <p>{momentById('origem').text}</p>
            <dl>
              <div>
                <dt>NOME</dt>
                <dd>{content.bio.name}</dd>
              </div>
              <div>
                <dt>ESTREIA</dt>
                <dd>07.03.2009 · Pacaembu (Santos 2x1 Oeste)</dd>
              </div>
              <div>
                <dt>PRIMEIRO TÍTULO</dt>
                <dd>Copa do Brasil 2010 (11 gols)</dd>
              </div>
            </dl>
            <a
              className="ney-source-note"
              href={content.bio.source}
              target="_blank"
              rel="noreferrer"
            >
              Fonte Oficial: Centro de Memória Santos FC ↗
            </a>
          </div>
        </section>

        {/* 04. A CONQUISTA DA AMÉRICA & O ENCONTRO COM MESSI */}
        <section className="ney-america ney-reveal" data-scroll-scene="reveal">
          <div className="ney-section-label">
            <span>04 / A GLÓRIA CONTINENTAL</span>
            <span>LIBERTADORES 2011 & O MUNDIAL</span>
          </div>
          <div className="ney-america-grid">
            <div className="ney-america-copy">
              <h2>
                A América aos pés.<br />
                O <em>mundo</em> no horizonte.
              </h2>
              <p>{momentById('libertadores').text}</p>
              <ul className="ney-america-facts">
                {momentById('libertadores').facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
            <div
              className="ney-america-photo"
              {...interact('libertadores')}
              aria-label="Ver encontro de Messi e Neymar em 2011"
            >
              <img
                src={image('messi-neymar-2011.jpg')}
                alt="Messi e Neymar se cumprimentam na final do Mundial de 2011"
                loading="lazy"
              />
              <span className="ney-america-cue">YOKOHAMA 2011 · CLIQUE PARA EXPANDIR ↗</span>
            </div>
          </div>
        </section>

        {/* 05. A FAIXA HORIZONTAL DE MOMENTOS (SCROLL-DRIVEN TRACK) */}
        <section
          className="ney-journey"
          ref={journey}
          style={{ height: 'calc(100svh + ' + (gallery.length - 1) * 580 + 'px)' }}
          aria-label="Trajetória de Neymar de 2010 a 2026, navegue rolando a página"
        >
          <div className="ney-journey-sticky">
            <div className="ney-journey-heading">
              <div>
                <span>05 / CRONOLOGIA COMPLETA (2010—2026)</span>
                <h2>
                  Feito de <em>momentos.</em>
                </h2>
              </div>
              <p>
                ROLE VERTICALMENTE PARA NAVEGAR NO TEMPO.<br />
                CLIQUE NA FOTOGRAFIA PARA ABRIR A HISTÓRIA.
              </p>
            </div>

            <div className="ney-photo-track" ref={track}>
              {gallery.map((moment, i) => (
                <article
                  key={moment.id}
                  className="ney-photo-card"
                  style={
                    {
                      '--card-angle': [-3, 3, -2, 4, -4, 2][i % 6] + 'deg',
                      '--photo-position': moment.position,
                    } as CSSProperties
                  }
                  {...interact(moment.id)}
                  aria-label={'Explorar ' + moment.title}
                >
                  <div className="ney-photo-image">
                    <img src={image(moment.image)} alt={moment.imageCaption} loading="lazy" />
                    <span className="ney-image-reveal">DESCOBRIR ↗</span>
                    <span className="ney-image-year">{moment.year}</span>
                    <span className="ney-image-badge">{moment.badge}</span>
                  </div>
                  <div className="ney-photo-caption">
                    <span>
                      {moment.number} / {moment.tag} · {moment.era}
                    </span>
                    <h3>{moment.title}</h3>
                    <span>{moment.place}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="ney-journey-footer">
              <span>ARRASTE O TEMPO COM O SCROLL</span>
              <div className="ney-progress-track">
                <i />
              </div>
              <span ref={count}>01</span>
              <span className="ney-progress-total">/ {String(gallery.length).padStart(2, '0')}</span>
            </div>
          </div>
        </section>

        {/* 06. O OURO OLÍMPICO NO MARACANÃ (EXPANDING MASK PHOTO) */}
        <section
          className="ney-gold ney-motion"
          data-scroll-scene="pinned"
          aria-label="Uma memória que cresce com o scroll"
        >
          <div className="ney-gold-sticky">
            <div
              className="ney-gold-photo"
              {...interact('ouro2016')}
              aria-label="Revelar o ouro olímpico de 2016"
            >
              <img
                src={image('ouro-2016-podio.jpg')}
                alt="Neymar e Gabigol mordem a medalha de ouro no pódio olímpico do Maracanã em 2016"
                loading="lazy"
              />
            </div>
            <div className="ney-gold-title">
              <span>06 / O OURO INÉDITO (RIO 2016)</span>
              <h2>
                UM PAÍS.<br />
                <em>O PRIMEIRO OURO.</em>
              </h2>
              <p>
                Maracanã lotado, cobrança de pênalti decisiva e a consagração definitiva.<br />
                A medalha que faltava à história do futebol brasileiro.
              </p>
            </div>
            <span className="ney-gold-cue">CLIQUE NA FOTO PARA REVIVER OS DETALHES ↗</span>
          </div>
        </section>

        {/* 07. O MUSEU 3D DO NEYMAR (INSPIRADO EM IGLOO.INC & BRUNO SIMON) */}
        <section
          className="ney-museum-section"
          ref={museumSection}
          style={{ height: 'calc(100svh + ' + (content.museumExhibits.length - 1) * 650 + 'px)' }}
          aria-label="Museu 3D interativo de relíquias do Neymar Júnior"
        >
          <div className="ney-museum-sticky">
            <Suspense
              fallback={
                <div className="ney-museum-fallback">
                  <h3>CARREGANDO O MUSEU 3D DO NEYMAR...</h3>
                </div>
              }
            >
              <NeymarMuseum
                scrollProgress={museumProgress}
                onOpenMoment={(momentId) => open(momentById(momentId))}
              />
            </Suspense>
          </div>
        </section>

        {/* 08. PARIS & O TRIO DAS ESTRELAS */}
        <section className="ney-paris ney-reveal" data-scroll-scene="reveal">
          <div className="ney-section-label">
            <span>08 / O PALCO EUROPEU</span>
            <span>PARIS SAINT-GERMAIN (2017—2023)</span>
          </div>
          <div className="ney-paris-layout">
            <div
              className="ney-paris-photo"
              {...interact('trio-mnm')}
              aria-label="Ver o trio Messi, Neymar e Mbappé no PSG"
            >
              <img
                src={image('psg-trio-mnm.jpg')}
                alt="Mbappé, Messi e Neymar no aquecimento do PSG"
                loading="lazy"
              />
              <span className="ney-photo-tag-chip">TRIO MNM · CLIQUE PARA ABRIR ↗</span>
            </div>
            <div className="ney-paris-copy">
              <h2>
                A Cidade Luz.<br />
                O <em>trio das estrelas.</em>
              </h2>
              <p>{momentById('trio-mnm').text}</p>
              <dl className="ney-stats-grid">
                <div>
                  <strong>173</strong>
                  <span>JOGOS OFICIAIS</span>
                </div>
                <div>
                  <strong>118</strong>
                  <span>GOLS MARCADOS</span>
                </div>
                <div>
                  <strong>70+</strong>
                  <span>ASSISTÊNCIAS</span>
                </div>
                <div>
                  <strong>13</strong>
                  <span>TÍTULOS NACIONAIS</span>
                </div>
              </dl>
              <small className="ney-stat-note">
                Dados oficiais do balanço histórico publicado pelo PSG em agosto de 2023.
              </small>
            </div>
          </div>
        </section>

        {/* 09. AS COPAS DO MUNDO & O RECORDE DE GOLS */}
        <section className="ney-record ney-reveal" data-scroll-scene="reveal">
          <div className="ney-record-header">
            <span className="ney-eyebrow">09 / O RECORDE DE PELÉ</span>
            <h2>
              79 GOLS.<br />
              O TOPO DA <em>HISTÓRIA.</em>
            </h2>
            <p>
              Em três edições de Copa do Mundo (2014, 2018 e 2022) e mais de uma década liderando a
              Seleção Brasileira, Neymar tornou-se o maior artilheiro da camisa canarinho pela
              contagem oficial da FIFA.
            </p>
          </div>
          <div className="ney-record-cards">
            <div
              className="ney-record-card"
              {...interact('copa2014')}
              aria-label="Copa do Mundo de 2014"
            >
              <img src={image('copa-2014.jpg')} alt="Neymar na Copa do Mundo 2014" loading="lazy" />
              <div className="ney-record-card-caption">
                <span>BRASIL 2014</span>
                <h4>4 Gols no Mundial</h4>
                <p>A estreia diante da torcida e a liderança ofensiva da Seleção.</p>
              </div>
            </div>
            <div
              className="ney-record-card"
              {...interact('copas-selecao')}
              aria-label="Copa do Mundo de 2018 e 2022"
            >
              <img src={image('copa-2018.jpg')} alt="Neymar na Copa do Mundo 2018" loading="lazy" />
              <div className="ney-record-card-caption">
                <span>RÚSSIA 2018 & CATAR 2022</span>
                <h4>A Pintura no Catar & o Recorde</h4>
                <p>O gol inesquecível contra a Croácia e a marca histórica de 79 gols oficiais.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 10. O RETORNO AO SANTOS COM A 10 DE PELÉ */}
        <section className="ney-return ney-reveal" data-scroll-scene="reveal">
          <div className="ney-return-container">
            <div
              className="ney-return-photo"
              {...interact('retorno')}
              aria-label="Neymar com a camisa 10 do Santos em 2025"
            >
              <img
                src={image('santos-2025-camisa.jpg')}
                alt="Neymar com a camisa do Santos em campo na Vila Belmiro em 2025"
                loading="lazy"
              />
              <span className="ney-return-badge">ANÚNCIO OFICIAL · 31.01.2025 ↗</span>
            </div>
            <div className="ney-return-copy">
              <span className="ney-eyebrow">10 / DE VOLTA À VILA (2025—2026)</span>
              <h2>
                \"Eu vou, mas<br />eu... <em>VOLTO!\"</em>
              </h2>
              <p>{momentById('retorno').text}</p>
              <div className="ney-return-quote">
                <blockquote>
                  \"Ídolo de uma geração e responsável por seguir com o legado de Rei Pelé, o craque
                  retorna à sua casa para tirar a sagrada camisa 10 do armário e encantar o planeta
                  novamente.\"
                </blockquote>
                <cite>— Santos Futebol Clube, comunicado oficial de 31 de janeiro de 2025</cite>
              </div>
            </div>
          </div>
        </section>

        {/* 11. A LINGUAGEM DO JOGO */}
        <section className="ney-language ney-motion" data-scroll-scene="reveal">
          <div className="ney-section-label">
            <span>11 / A LINGUAGEM DO JOGO</span>
            <span>DNA DO FUTEBOL BRASILEIRO</span>
          </div>
          <div className="ney-language-layout">
            <div className="ney-language-words">
              {content.techniques.map((technique, i) => (
                <div
                  className="ney-technique ney-reveal"
                  key={technique.word}
                  {...interact(technique.moment)}
                >
                  <span>0{i + 1}</span>
                  <h2>{technique.word}</h2>
                  <p>{technique.text}</p>
                  <small>CLIQUE PARA VER O LANCE ↗</small>
                </div>
              ))}
            </div>
            <figure
              className="ney-language-photo"
              {...interact('linguagem')}
              aria-label="Explorar a linguagem do jogo"
            >
              <img
                src={image('brasil.jpg')}
                alt="Neymar com a seleção em condução veloz"
                loading="lazy"
              />
              <figcaption>O REPERTÓRIO É DELE. O ESPETÁCULO É DE TODOS. ↗</figcaption>
              <span className="ney-language-number" aria-hidden="true">
                10
              </span>
            </figure>
          </div>
        </section>

        {/* 12. LINHA DO TEMPO */}
        <section className="ney-timeline ney-reveal">
          <div className="ney-section-label">
            <span>12 / LINHA DO TEMPO</span>
            <span>MARCOS HISTÓRICOS DE 2009 A 2025</span>
          </div>
          <h2>
            O tempo passa.<br />
            A memória <em>fica.</em>
          </h2>
          <ol>
            {content.milestones.map((milestone) => (
              <li
                className="ney-reveal"
                key={milestone.year}
                {...interact(milestone.moment)}
              >
                <span>{milestone.year}</span>
                <p>{milestone.label}</p>
                <i aria-hidden="true">↗</i>
              </li>
            ))}
          </ol>
          <small>
            Fontes oficiais: Santos FC, Confederação Brasileira de Futebol (CBF), FIFA, UEFA e
            Comitê Olímpico Internacional.
          </small>
        </section>

        {/* 13. O INSTITUTO PROJETO NEYMAR JR. */}
        <section className="ney-impact ney-reveal">
          <div
            className="ney-impact-poster"
            {...interact('instituto')}
            aria-label="Conhecer o Instituto Projeto Neymar Jr."
          >
            <span>INSTITUTO PROJETO NEYMAR JR.</span>
            <strong>
              JOGAR<br />
              É SÓ O<br />
              <em>COMEÇO.</em>
            </strong>
            <div className="ney-impact-lines" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <span>CLIQUE PARA CONHECER O PROJETO SOCIAL ↗</span>
          </div>
          <div className="ney-impact-copy">
            <span className="ney-eyebrow">13 / TRANSFORMAÇÃO SOCIAL</span>
            <h2>
              Oportunidade<br />
              também é <em>legado.</em>
            </h2>
            <p>{momentById('instituto').text}</p>
            <ul>
              {momentById('instituto').facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <a
              className="ney-source-note"
              href="https://institutoneymarjr.org.br/"
              target="_blank"
              rel="noreferrer"
            >
              Conheça o portal oficial do Instituto (Praia Grande · SP) ↗
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ney-footer">
          <span className="ney-monogram">
            nj<span>.</span>
          </span>
          <h2>
            O próximo lance<br />
            ainda é <em>imprevisível.</em>
          </h2>
          <div className="ney-footer-bottom">
            <span>{content.project.label}</span>
            <span>
              CONTEÚDO CHECADO EM FONTES OFICIAIS · FOTOGRAFIAS COM CRÉDITOS E LICENÇAS LIVRES.
            </span>
          </div>
        </footer>
      </main>

      {/* DETAILED READING MODAL (VIEW TRANSITION & ESC / BACKDROP CLOSE) */}
      {selected && (
        <div className="ney-detail-backdrop" onClick={closeDetail}>
          <article
            className="ney-detail"
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            tabIndex={-1}
            ref={detail}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ney-detail-photo" onClick={closeDetail}>
              {selected.image ? (
                <img
                  src={image(selected.image)}
                  alt={selected.imageCaption}
                  style={{
                    objectPosition: selected.position,
                    viewTransitionName: 'ney-active-photo',
                  }}
                />
              ) : (
                <div className="ney-detail-poster">
                  JOGAR<br />
                  É SÓ O<br />
                  <em>COMEÇO.</em>
                </div>
              )}
              <span>TOQUE NA IMAGEM OU CLIQUE FORA PARA VOLTAR ↙</span>
            </div>

            <div className="ney-detail-copy">
              <div className="ney-detail-tag-line">
                <small>
                  {selected.number} / {selected.tag} · {selected.year}
                </small>
                {selected.badge && <span className="ney-detail-badge">{selected.badge}</span>}
              </div>
              <h2>{selected.title}</h2>
              <p>{selected.text}</p>

              <ul className="ney-detail-facts">
                {selected.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>

              <span className="ney-detail-place">{selected.place}</span>
              <p className="ney-detail-image-caption">{selected.imageCaption}</p>

              <div className="ney-content-sources">
                <small>FONTES VERIFICADAS</small>
                {selected.references.map((reference) => (
                  <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer">
                    {reference.label} ↗
                  </a>
                ))}
              </div>

              <div className="ney-photo-credit">
                {selected.image ? 'Foto: ' : ''}
                {selected.credit}.<br />
                <a href={selected.source} target="_blank" rel="noreferrer">
                  {selected.image ? 'Arquivo original' : 'Informações oficiais'} ↗
                </a>{' '}
                ·{' '}
                <a href={selected.licenseUrl} target="_blank" rel="noreferrer">
                  {selected.license}
                </a>
                <br />
                {selected.image && 'Enquadramento e tratamento de cor na apresentação.'}
                {selected.id === 'identidade' && (
                  <>
                    <br />
                    Na capa, recorte do retrato assistido por IA.
                  </>
                )}
              </div>

              <small className="ney-detail-return">
                PRESSIONE ESC, CLIQUE FORA OU NA FOTO PARA VOLTAR.
              </small>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
