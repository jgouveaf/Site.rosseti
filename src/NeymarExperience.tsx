import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import content from './data/neymar.json';
import design from '../design-system.neymar.json';
import './neymar.css';

type Moment = typeof content.moments[number];
const image = (file: string) => import.meta.env.BASE_URL + 'images/neymar/' + file;
const momentById = (id: string) => content.moments.find(moment => moment.id === id)!;
const gallery = content.gallery.map(momentById);
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function NeymarExperience() {
  const page = useRef<HTMLDivElement>(null);
  const journey = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const [selected, setSelected] = useState<Moment | null>(null);
  const focusOrigin = useRef<HTMLElement | null>(null);
  const detail = useRef<HTMLElement>(null);
  const originImage = useRef<HTMLElement | null>(null);
  const [reducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const open = (moment: Moment, element: HTMLElement) => {
    focusOrigin.current = element;
    originImage.current = element.querySelector('img');
    if (!reducedMotion && document.startViewTransition && originImage.current) {
      originImage.current.style.viewTransitionName = 'ney-active-photo';
      const transition = document.startViewTransition(() => {
        if (originImage.current) originImage.current.style.viewTransitionName = '';
        flushSync(() => setSelected(moment));
      });
      void transition.finished.catch(() => {});
    } else setSelected(moment);
  };
  const closeDetail = () => {
    const origin = originImage.current;
    if (!reducedMotion && document.startViewTransition && origin) {
      const transition = document.startViewTransition(() => {
        flushSync(() => setSelected(null));
        origin.style.viewTransitionName = 'ney-active-photo';
      });
      void transition.finished.catch(() => {}).finally(() => { origin.style.viewTransitionName = ''; });
    } else setSelected(null);
  };
  const interact = (id: string) => ({
    role: 'button' as const, tabIndex: 0,
    onClick: (event: React.MouseEvent<HTMLElement>) => open(momentById(id), event.currentTarget),
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(momentById(id), event.currentTarget); } },
  });
  useEffect(() => {
    let frame = 0;
    const scenes = page.current?.querySelectorAll<HTMLElement>('[data-scroll-scene]') ?? [];
    const update = () => {
      frame = 0;
      if (!journey.current || !track.current) return;
      const bounds = journey.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -bounds.top / (bounds.height - innerHeight)));
      const cards = track.current.querySelectorAll<HTMLElement>('.ney-photo-card');
      const distance = cards.length ? cards[cards.length - 1].offsetLeft - cards[0].offsetLeft : 0;
      track.current.style.setProperty('--travel', -progress * distance + 'px');
      journey.current.style.setProperty('--journey-progress', String(progress));
      if (count.current) count.current.textContent = String(Math.round(progress * (gallery.length - 1)) + 1).padStart(2, '0');
      page.current?.style.setProperty('--hero-drift', (reducedMotion ? 0 : Math.min(scrollY * .14, 140)) + 'px');
      for (const scene of scenes) {
        const rect = scene.getBoundingClientRect();
        if (rect.top > innerHeight * 1.2 || rect.bottom < -innerHeight * .2) continue;
        const p = scene.dataset.scrollScene === 'pinned' ? clamp(-rect.top / Math.max(1, rect.height - innerHeight)) : clamp((innerHeight - rect.top) / (innerHeight + rect.height));
        scene.style.setProperty('--p', String(reducedMotion ? 1 : p));
      }
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    update();
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) entry.target.classList.add('is-revealed'); }, { threshold: .12 });
    page.current?.querySelectorAll('.ney-reveal').forEach(element => observer.observe(element));
    return () => { removeEventListener('scroll', queue); removeEventListener('resize', queue); cancelAnimationFrame(frame); observer.disconnect(); };
  }, [reducedMotion]);
  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    detail.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDetail();
      if (event.key === 'Tab' && detail.current) {
        const links = detail.current.querySelectorAll<HTMLElement>('a[href]');
        if (!links.length) { event.preventDefault(); return; }
        const first = links[0], last = links[links.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === detail.current)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; removeEventListener('keydown', close); focusOrigin.current?.focus({ preventScroll: true }); };
  }, [selected, reducedMotion]);
  return <div className="ney-page" ref={page} style={Object.fromEntries(Object.entries(design.colors).map(([key, value]) => ['--ney-' + key, value])) as CSSProperties}>
    <header className="ney-header"><span className="ney-monogram">nj<span>.</span></span><span className="ney-header-center">FUTEBOL · IDENTIDADE · LEGADO</span><span className="ney-fan-label">FAN EXPERIENCE <i /></span></header>
    <main inert={selected ? true : undefined}>
      <section className="ney-hero" aria-label="Neymar Júnior, uma experiência interativa" onPointerMove={event => {
        if (reducedMotion) return;
        event.currentTarget.style.setProperty('--pointer-x', ((event.clientX / innerWidth - .5) * 14) + 'px');
        event.currentTarget.style.setProperty('--pointer-y', ((event.clientY / innerHeight - .5) * 10) + 'px');
      }}>
        <div className="ney-orbit ney-orbit-left" aria-hidden="true" /><div className="ney-orbit ney-orbit-right" aria-hidden="true" />
        <div className="ney-hero-meta"><span>DO BRASIL PARA O MUNDO</span><span>UM ARQUIVO DE MOMENTOS / Nº 10</span></div>
        <h1 className="ney-hero-name"><span>NEYMAR</span><em>JÚNIOR<span>.</span></em></h1>
        <div className="ney-hero-portrait" role="button" tabIndex={0} aria-label="Revelar o retrato de Neymar" onClick={event => open(momentById('identidade'), event.currentTarget)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(momentById('identidade'), event.currentTarget); } }}>
          <img src={image('portrait-cutout.png')} alt="Neymar Júnior, em retrato de Lucho Vidales com fundo recortado" fetchPriority="high" />
          <span className="ney-portrait-hint">CLIQUE PARA REVELAR ↗</span>
        </div>
        <div className="ney-hero-copy"><h2>O talento é brasileiro.<br />A expressão é <em>única.</em></h2><p>Do improviso ao inesquecível.<br />Um olhar sobre o futebol, a história<br />e a identidade de Neymar Júnior.</p><span className="ney-scroll-hint">ROLE PARA DESCOBRIR <span>↓</span></span></div>
        <div className="ney-number-card"><span>BRASIL / 10</span><strong>10.</strong><small>CRIAR. OUSAR.<br />JOGAR DO SEU JEITO.</small></div>
        <span className="ney-floating-ball" aria-hidden="true">✳</span>
        <div className="ney-hero-bottom"><span>FUTEBOL É UMA FORMA DE ARTE.</span><span>A HISTÓRIA CONTINUA NO SCROLL ↓</span></div>
      </section>
      <section className="ney-manifesto ney-reveal" data-scroll-scene="reveal"><div className="ney-section-label"><span>01 / A ESSÊNCIA</span><span>MAIS QUE UM NÚMERO.</span></div><h2>O jogo muda.<br />A <em>ousadia</em><br />permanece<span>.</span></h2><div className="ney-manifesto-copy"><span className="ney-star">✳</span><p>Tem jogador que segue o jogo.<br />Tem jogador que inventa o próximo lance.</p><p>Uma trajetória contada em imagens.<br />Role para percorrer. Toque para descobrir.</p></div></section>
      <section className="ney-collage ney-motion" data-scroll-scene="pinned" aria-label="Colagem interativa de momentos">
        <div className="ney-collage-sticky">
          <div className="ney-collage-label"><span>UM JOGO. MUITAS VERSÕES.</span><span>CLIQUE NAS FOTOGRAFIAS ↗</span></div>
          <h2>OUSAR.<br /><em>SEMPRE.</em></h2>
          {content.collage.map((id, i) => { const moment = momentById(id); return <figure key={id} className={'ney-collage-photo ney-collage-photo-' + i} style={{ '--dx': [-24, -12, 20, 30, 3][i], '--dy': [-30, 28, -30, 24, 38][i], '--angle': [-12, 9, 12, -8, -3][i] + 'deg' } as CSSProperties} {...interact(id)} aria-label={'Revelar ' + moment.title}>
            <img src={image(moment.image)} alt={moment.imageCaption} loading="lazy" /><figcaption>{moment.year} / {moment.tag}</figcaption>
          </figure>; })}
          <span className="ney-collage-bottom">A MESMA IDENTIDADE. DIFERENTES MANEIRAS DE JOGAR.</span>
        </div>
      </section>
      <section className="ney-origin ney-reveal" data-scroll-scene="reveal">
        <div className="ney-origin-photo" {...interact('origem')} aria-label="Explorar as origens de Neymar"><img src={image('inicio-2012.jpg')} alt="Neymar em 2012, arquivo da primeira passagem pelo Santos" loading="lazy" /><span>ARQUIVO / 2012 · CLIQUE PARA REVELAR ↗</span></div>
        <div className="ney-origin-copy"><span className="ney-eyebrow">02 / DE ONDE VEM A OUSADIA</span><h2>Antes do mundo,<br />a <em>Vila.</em></h2><p>{content.bio.text}</p><dl><div><dt>NOME</dt><dd>{content.bio.name}</dd></div><div><dt>NASCIMENTO</dt><dd>{content.bio.born}</dd></div><div><dt>ORIGEM</dt><dd>{content.bio.hometown}</dd></div></dl><a className="ney-source-note" href={content.bio.source} target="_blank" rel="noreferrer">Fonte: Centro de Memória do Santos FC ↗</a></div>
      </section>
      <section className="ney-gold ney-motion" data-scroll-scene="pinned" aria-label="Uma memória que cresce com o scroll">
        <div className="ney-gold-sticky"><div className="ney-gold-photo" {...interact('brasil')} aria-label="Revelar o ouro olímpico de 2016"><img src={image('ouro-2016.jpg')} alt="Final olímpica entre Brasil e Alemanha no Maracanã, Rio 2016" loading="lazy" /></div><div className="ney-gold-title"><span>03 / O SONHO COLETIVO</span><h2>UM PAÍS.<br /><em>UM OURO.</em></h2><p>Rio de Janeiro, 2016.<br />Um capítulo escrito por uma equipe inteira.</p></div><span className="ney-gold-cue">CLIQUE NA FOTO PARA REVIVER ↗</span></div>
      </section>
      <section className="ney-journey" ref={journey} style={{ height: 'calc(100svh + ' + (gallery.length - 1) * 540 + 'px)' }} aria-label="Trajetória de Neymar, navegue rolando a página">
        <div className="ney-journey-sticky">
          <div className="ney-journey-heading"><div><span>04 / MEMÓRIAS EM MOVIMENTO</span><h2>Feito de <em>momentos.</em></h2></div><p>ROLE PARA VIAJAR.<br />CLIQUE NA IMAGEM PARA ENTRAR.</p></div>
          <div className="ney-photo-track" ref={track}>{gallery.map((moment, i) => <article key={moment.id} className="ney-photo-card" style={{ '--card-angle': [-4, 3, -3, 4][i % 4] + 'deg', '--photo-position': moment.position } as CSSProperties} {...interact(moment.id)} aria-label={'Explorar ' + moment.title}>
            <div className="ney-photo-image"><img src={image(moment.image)} alt={moment.imageCaption} loading="lazy" /><span className="ney-image-reveal">DESCOBRIR ↗</span><span className="ney-image-year">{moment.year}</span></div>
            <div className="ney-photo-caption"><span>{moment.number} / {moment.tag}</span><h3>{moment.title}</h3><span>{moment.place}</span></div>
          </article>)}</div>
          <div className="ney-journey-footer"><span>ARRASTE O TEMPO COM O SCROLL</span><div className="ney-progress-track"><i /></div><span ref={count}>01</span><span className="ney-progress-total">/ {String(gallery.length).padStart(2, '0')}</span></div>
        </div>
      </section>
      <section className="ney-language ney-motion" data-scroll-scene="reveal"><div className="ney-section-label"><span>05 / A LINGUAGEM DO JOGO</span><span>IMPROVISO É REPERTÓRIO.</span></div><div className="ney-language-layout"><div className="ney-language-words">{content.techniques.map((technique, i) => <div className="ney-technique ney-reveal" key={technique.word}><span>0{i + 1}</span><h2>{technique.word}</h2><p>{technique.text}</p></div>)}</div><figure className="ney-language-photo" {...interact('linguagem')} aria-label="Explorar a linguagem do jogo"><img src={image('brasil.jpg')} alt="Neymar com a seleção em 2016, imagem de arquivo" loading="lazy" /><figcaption>O JEITO É DELE. O JOGO É DE TODOS. ↗</figcaption><span className="ney-language-number" aria-hidden="true">10</span></figure></div></section>
      <section className="ney-timeline ney-reveal"><div className="ney-section-label"><span>06 / LINHA DO TEMPO</span><span>ALGUNS ANOS FICAM PARA SEMPRE.</span></div><h2>O tempo passa.<br />A memória <em>fica.</em></h2><ol>{content.milestones.map(milestone => <li className="ney-reveal" key={milestone.year}><span>{milestone.year}</span><p>{milestone.label}</p><i aria-hidden="true">↗</i></li>)}</ol><small>Marcos históricos. Fontes oficiais disponíveis nas memórias correspondentes.</small></section>
      <section className="ney-impact ney-reveal"><div className="ney-impact-poster" {...interact('instituto')} aria-label="Conhecer o Instituto Projeto Neymar Jr."><span>INSTITUTO PROJETO NEYMAR JR.</span><strong>JOGAR<br />É SÓ O<br /><em>COMEÇO.</em></strong><div className="ney-impact-lines" aria-hidden="true"><i /><i /><i /></div><span>CLIQUE PARA CONHECER O PROJETO ↗</span></div><div className="ney-impact-copy"><span className="ney-eyebrow">07 / ALÉM DAS QUATRO LINHAS</span><h2>Oportunidade<br />também é <em>legado.</em></h2><p>{momentById('instituto').text}</p><ul>{momentById('instituto').facts.map(fact => <li key={fact}>{fact}</li>)}</ul><a className="ney-source-note" href="https://institutoneymarjr.org.br/" target="_blank" rel="noreferrer">Conheça o site oficial do Instituto ↗</a></div></section>
      <footer className="ney-footer"><span className="ney-monogram">nj<span>.</span></span><h2>O próximo lance<br />ainda é <em>imprevisível.</em></h2><div><span>{content.project.label}</span><span>IMAGENS COM CRÉDITOS EM CADA MOMENTO.</span></div></footer>
    </main>
    {selected && <div className="ney-detail-backdrop" onClick={closeDetail}><article className="ney-detail" role="dialog" aria-modal="true" aria-label={selected.title} tabIndex={-1} ref={detail} onClick={event => event.stopPropagation()}>
      <div className="ney-detail-photo" onClick={closeDetail}>{selected.image ? <img src={image(selected.image)} alt={selected.imageCaption} style={{ objectPosition: selected.position, viewTransitionName: 'ney-active-photo' }} /> : <div className="ney-detail-poster">JOGAR<br />É SÓ O<br /><em>COMEÇO.</em></div>}<span>TOQUE NA IMAGEM PARA VOLTAR ↙</span></div>
      <div className="ney-detail-copy"><small>{selected.number} / {selected.tag} · {selected.year}</small><h2>{selected.title}</h2><p>{selected.text}</p><ul className="ney-detail-facts">{selected.facts.map(fact => <li key={fact}>{fact}</li>)}</ul><span className="ney-detail-place">{selected.place}</span><p className="ney-detail-image-caption">{selected.imageCaption}</p><div className="ney-content-sources"><small>FONTES DA HISTÓRIA</small>{selected.references.map(reference => <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer">{reference.label} ↗</a>)}</div><div className="ney-photo-credit">{selected.image ? 'Foto: ' : ''}{selected.credit}.<br /><a href={selected.source} target="_blank" rel="noreferrer">{selected.image ? 'Arquivo original' : 'Informações oficiais'} ↗</a> · <a href={selected.licenseUrl} target="_blank" rel="noreferrer">{selected.license}</a><br />{selected.image && 'Enquadramento e tratamento de cor na apresentação.'}{selected.id === 'identidade' && <><br />Na capa, recorte do retrato assistido por IA.</>}</div><small className="ney-detail-return">ESC, CLIQUE FORA OU TOQUE NA FOTO PARA VOLTAR.</small></div>
    </article></div>}
  </div>;
}
