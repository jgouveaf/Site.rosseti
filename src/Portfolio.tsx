import { useEffect, useRef, useState } from "react";
import data from "./data/portfolio.json";
import "./portfolio.css";
import "./motion-design.css";
import "./editorial-redesign.css";
import "./brush-hero.css";
import "./portfolio-refresh.css";
import "./portfolio-overhaul.css";
import "./portfolio-tunnel.css";
import { usePortfolioMotion, AnimatedNumber } from "./usePortfolioMotion";
import { PortfolioTunnel } from "./PortfolioTunnel";
const url = (path: string) => import.meta.env.BASE_URL + path;
const photo = (id: string) => data.photos.find((p) => p.id === id)!;
const achievements = [...data.achievements].sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
const years = [...new Set(achievements.flatMap((a) => a.year ? [a.year] : []))];
const projects = [
  { n: "01", name: "VisionAI", kind: "INTELIGÊNCIA ARTIFICIAL / ROBÓTICA", body: "Projeto em desenvolvimento de inteligência artificial e robótica. Explora visão computacional e a integração entre software e robô móvel.", status: "Em desenvolvimento" },
  { n: "02", name: "Frequência Morta", kind: "GAMEDEV / UNITY", body: "Projeto pessoal de jogo em desenvolvimento. Um espaço para aplicar programação, construir experiências e explorar a narrativa interativa.", status: "Em desenvolvimento" },
  { n: "03", name: "ItalianWhey", kind: "COMUNICAÇÃO / CRIATIVIDADE", body: "Projeto vencedor em trabalho de Publicidade e Propaganda de Escolas, em 2025. Criatividade, comunicação e empreendedorismo.", status: "Vencedor · 2025" },
  { n: "04", name: "ACSI", kind: "PROJETOS / CONQUISTAS", body: "Projeto finalista em ACSI. Uma conquista da trajetória criativa de João.", status: "Finalista" },
];
type Achievement = (typeof data.achievements)[number];
function AchievementCarousel() {
  const [active, setActive] = useState(0);
  const dragStart = useRef<number | null>(null);
  const suppressClickUntil = useRef(0);
  const current = achievements[active];
  const change = (direction: number) => setActive((index) => (index + direction + achievements.length) % achievements.length);
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const delta = event.clientX - dragStart.current;
    if (Math.abs(delta) > 45) {
      suppressClickUntil.current = performance.now() + 250;
      change(delta < 0 ? 1 : -1);
    }
    dragStart.current = null;
  };
  return <div className="pf-achievement-carousel" aria-label="Conquistas em carrossel" onKeyDown={(event) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.key === "ArrowRight") { event.preventDefault(); change(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); change(-1); }
  }}>
    <div className="pf-achievement-years" aria-label="Pular para um ano">
      {years.map((year) => <button key={year} type="button" className={current.year === year ? "is-active" : ""} onClick={() => setActive(achievements.findIndex((item) => item.year === year))}>{year}</button>)}
      <button type="button" className={!current.year ? "is-active" : ""} onClick={() => setActive(achievements.findIndex((item) => !item.year))}>Sem data</button>
    </div>
    <div className="pf-achievement-stage" onPointerDown={(event) => { if (event.isPrimary) dragStart.current = event.clientX; }} onPointerUp={endDrag} onPointerCancel={() => { dragStart.current = null; }} onClickCapture={(event) => { if (performance.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
      <span className="pf-achievement-watermark" aria-hidden="true">{current.year ?? "JG"}</span>
      <ul className="pf-achievement-deck">
        {achievements.map((achievement: Achievement, index) => {
          let offset = index - active;
          if (offset > achievements.length / 2) offset -= achievements.length;
          if (offset < -achievements.length / 2) offset += achievements.length;
          const visible = Math.abs(offset) <= 2;
          return <li key={achievement.id} className={`pf-history-item ${offset === 0 ? "is-active" : ""} ${visible ? "" : "is-hidden"}`} style={{ "--card-shift": `${offset * 82}%`, "--card-depth": `${offset === 0 ? 90 : Math.abs(offset) === 1 ? -35 : -120}px`, "--card-turn": `${offset === 0 ? 0 : offset < 0 ? 48 : -48}deg`, "--card-scale": offset === 0 ? 1 : Math.abs(offset) === 1 ? .84 : .7, "--card-opacity": visible ? 1 : 0, zIndex: 10 - Math.abs(offset) } as React.CSSProperties} aria-hidden={offset !== 0}>
            <button className="pf-history-card" type="button" tabIndex={offset === 0 ? 0 : -1} onClick={() => { if (offset !== 0) setActive(index); }}>
              <span className="pf-history-card-top"><span>{String(index + 1).padStart(2, "0")} / {String(achievements.length).padStart(2, "0")}</span><span>{achievement.year ?? "SEM DATA"}</span></span>
              <span className="pf-history-card-category">{achievement.category}</span>
              <strong>{achievement.title}</strong>
              <span className="pf-history-card-result">{achievement.result}</span>
              <span className="pf-history-card-bottom">JOÃO GOUVÊA <span aria-hidden="true">✳</span></span>
            </button>
          </li>;
        })}
      </ul>
    </div>
    <div className="pf-achievement-controls">
      <button type="button" onClick={() => change(-1)} aria-label="Conquista anterior">←</button>
      <div className="pf-achievement-progress"><span>{String(active + 1).padStart(2, "0")} / {String(achievements.length).padStart(2, "0")}</span><input type="range" min="0" max={achievements.length - 1} value={active} onChange={(event) => setActive(Number(event.target.value))} aria-label="Ir para uma conquista" /><span>ARRASTE OU DESLIZE</span></div>
      <button type="button" onClick={() => change(1)} aria-label="Próxima conquista">→</button>
    </div>
    <p className="pf-source-note">Histórico informado por João. Itens sem ano confirmado não receberam data presumida.</p>
  </div>;
}
function ItalianWheyCarousel() {
  const [active, setActive] = useState(0);
  const dragStart = useRef<number | null>(null);
  const suppressClickUntil = useRef(0);
  const change = (direction: number) => setActive((index) => (index + direction + 6) % 6);
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const delta = event.clientX - dragStart.current;
    if (Math.abs(delta) > 35) {
      suppressClickUntil.current = performance.now() + 250;
      change(delta < 0 ? 1 : -1);
    }
    dragStart.current = null;
  };
  return <div className="pf-italian-gallery" aria-label="Registros do projeto ItalianWhey" onKeyDown={(event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); change(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); change(-1); }
  }}>
    <span>REGISTROS DO PROJETO VENCEDOR</span>
    <div className="pf-italian-stage" onPointerDown={(event) => { if (event.isPrimary) dragStart.current = event.clientX; }} onPointerUp={endDrag} onPointerCancel={() => { dragStart.current = null; }} onClickCapture={(event) => { if (performance.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
      {[1, 2, 3, 4, 5, 6].map((image, index) => {
        let offset = index - active;
        if (offset > 3) offset -= 6;
        if (offset < -3) offset += 6;
        return <figure key={image} className={`${offset === 0 ? "is-active" : ""} ${Math.abs(offset) > 2 ? "is-hidden" : ""}`} style={{ "--iw-shift": `${offset * 77}%`, "--iw-turn": `${offset === 0 ? 0 : offset < 0 ? 43 : -43}deg`, "--iw-scale": offset === 0 ? 1 : Math.abs(offset) === 1 ? .83 : .68, zIndex: 10 - Math.abs(offset) } as React.CSSProperties} aria-hidden={offset !== 0}>
          <button type="button" tabIndex={offset === 0 ? 0 : -1} onClick={() => { if (offset !== 0) setActive(index); }} aria-label={`Ver registro ${image} do ItalianWhey`}><img src={url(`media/featured/italianwhey-${image}.webp`)} alt="" loading="lazy" /><span>REGISTRO 0{image}</span></button>
        </figure>;
      })}
    </div>
    <div className="pf-italian-controls"><button type="button" aria-label="Registro anterior" onClick={() => change(-1)}>←</button><span>{String(active + 1).padStart(2, "0")} / 06</span><button type="button" aria-label="Próximo registro" onClick={() => change(1)}>→</button></div>
  </div>;
}
function HoverLetters({ text }: { text: string }) {
  return <span className="pf-hover-word">
    <span className="pf-sr-only">{text}</span>
    {Array.from(text).map((letter, index) => <span className="pf-hover-letter" aria-hidden="true" key={`${index}-${letter}`}>{letter === " " ? "\u00a0" : letter}</span>)}
  </span>;
}
function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pf-label">
      <span>
        {number} / {children}
      </span>
      <span>JOÃO GOUVÊA · ARQUIVO PESSOAL</span>
    </div>
  );
}
export function Portfolio() {
  usePortfolioMotion();
  const [menu, setMenu] = useState(false);
  const fecartVideo = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const resume = () => {
      if (!document.hidden) void fecartVideo.current?.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", resume);
    resume();
    return () => document.removeEventListener("visibilitychange", resume);
  }, []);
  return (
    <div className="pf pf-v2">
      <div className="pf-scroll-progress" aria-hidden="true" />
      <a href="#conteudo" className="pf-skip">
        Pular para o conteúdo
      </a>
      <header className="pf-header">
        <a href="#inicio" className="pf-logo" aria-label="João Gouvêa, início">
          jg<span>✳</span>
        </a>
        <span className="pf-header-note">CURIOSIDADE EM MOVIMENTO</span>
        <button
          className="pf-menu"
          aria-expanded={menu}
          aria-controls="pf-nav"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Fechar ×" : "Menu +"}
        </button>
        <nav
          id="pf-nav"
          className={menu ? "open" : ""}
          aria-label="Navegação principal"
        >
          {[
            ["sobre", "Sobre"],
            ["momentos", "Momentos"],
            ["projetos", "Projetos"],
            ["jogos", "Jogos"],
            ["trajetoria", "Trajetória"],
            ["certificados", "Certificado OBI"],
          ].map(([id, title]) => (
            <a key={id} href={"#" + id} onClick={() => setMenu(false)}>
              {title}
            </a>
          ))}
        </nav>
      </header>
      <main id="conteudo">
        <section
          id="inicio"
          className="pf-hero-stage"
          aria-label="João Gouvêa, portfólio"
        >
          <div className="pf-hero pf-hero-cinema">
            <div className="pf-hero-title">
              <span className="pf-hero-intro">JOÃO GOUVÊA / PORTFÓLIO 2026</span>
              <h1>
                <span className="pf-name-first"><HoverLetters text="JOÃO" /></span>
                {" "}
                <span className="pf-name-last">
                  <HoverLetters text="GOUVÊA" /><span className="pf-name-dot">.</span>
                </span>
              </h1>
              <div className="pf-hero-copy">
                <span className="pf-kicker">INTELIGÊNCIA ARTIFICIAL · JOGOS · ESPORTE</span>
                <p>
                  Curiosidade para criar. Disciplina para ir além.
                </p>
                <div className="pf-hero-actions">
                  <a className="pf-hero-cta" href="#projetos">
                    CONHECER OS PROJETOS <span>↗</span>
                  </a>
                  <a className="pf-scroll-link" href="#sobre">
                    DESCOBRIR A HISTÓRIA ↓
                  </a>
                </div>
              </div>
            </div>
            <div className="pf-hero-image">
              <img src={url("media/photos/joao-janela-pb.webp")} alt="João Gouvêa em preto e branco, olhando pela janela" fetchPriority="high" />
            </div>
            <svg
              className="pf-wire"
              viewBox="0 0 600 600"
              fill="none"
              aria-hidden="true"
            >
              <g stroke="currentColor" strokeWidth=".6">
                {Array.from({ length: 12 }, (_, i) => (
                  <ellipse
                    key={i}
                    cx="300"
                    cy="300"
                    rx={50 + i * 18}
                    ry="245"
                    transform={`rotate(${i * 15} 300 300)`}
                  />
                ))}
              </g>
            </svg>
          </div>
        </section>
        <section id="sobre" className="pf-section pf-about pf-reveal">
          <SectionLabel number="01">Muito além de uma área</SectionLabel>
          <div className="pf-about-grid">
            <h2><HoverLetters text="Criar é" /><br /><em><HoverLetters text="investigar." /></em><br /><HoverLetters text="Evoluir é" /><br /><HoverLetters text="insistir." /></h2>
            <div>
              <figure className="pf-real-portrait"><img src={url("media/photos/joao-game-dev-full.webp")} alt="João Gouvêa com certificado de desenvolvimento de jogos em 2025" loading="lazy" width="1836" height="4080" /><figcaption>GAMEDEV / UNITY · 2025</figcaption></figure>
              <p className="pf-lead">
                {data.profile.name} é estudante de {data.profile.course} na {data.profile.school}.
              </p>
              <p>
                Desenvolve projetos que unem programação, jogos e robótica. A pesquisa e as olimpíadas acadêmicas ampliam esse trabalho.
              </p>
              <p>
                Compete no tênis de mesa por Itaim Keiko e FECAP. A experiência no esporte sustenta uma prática constante: testar, analisar e aprimorar.
              </p>
              <p className="pf-past-sport">Também jogou futsal no Kogachi e no Democrático Futsal.</p>
              <dl className="pf-profile">
                <div>
                  <dt>FORMAÇÃO</dt>
                  <dd>
                    {data.profile.schoolYear}
                    <br />
                    Técnico em {data.profile.course}
                  </dd>
                </div>
                <div>
                  <dt>IDIOMA</dt>
                  <dd>Inglês · {data.profile.english}</dd>
                </div>
                <div>
                  <dt>TÊNIS DE MESA · ATUAL</dt>
                  <dd>{data.sports.tableTennisTeams.join(" · ")}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="pf-stats">
            <div>
              <strong>
                <AnimatedNumber value={data.sports.swimmingMedals} />
                <sup>↗</sup>
              </strong>
              <span>NATAÇÃO <small>16 PRIMEIROS LUGARES</small></span>
            </div>
            <div>
              <strong>
                <AnimatedNumber value={data.sports.tableTennisMedals} />
                <sup>↗</sup>
              </strong>
              <span>TÊNIS DE MESA <small>MEDALHAS EM COMPETIÇÕES</small></span>
            </div>
            <div>
              <strong>
                <AnimatedNumber value={3} />
                <sup>↗</sup>
              </strong>
              <span>GAMEDEV <small>LEVELS CONCLUÍDOS</small></span>
            </div>
          </div>
        </section>
        <section id="momentos" className="pf-reel" aria-label="Três momentos em movimento">
          <div className="pf-reel-sticky">
            <div className="pf-reel-heading">
              <span className="pf-kicker">
                NENHUM CAMINHO É UMA LINHA RETA.
              </span>
              <h2>
                VÁRIAS VERSÕES.
                <br />
                <em>A MESMA VONTADE.</em>
              </h2>
              <span className="pf-reel-hint">ROLE OU DESLIZE PARA DESCOBRIR ↔</span>
            </div>
            <div className="pf-reel-window">
              <div className="pf-reel-track">
                {[
                  { id: "infancia", word: "COMEÇAR", label: "01 / PRIMEIROS PASSOS · FUTSAL", src: "media/photos/joao-infancia-futsal.webp", alt: "João Gouvêa criança com medalha em uma quadra de futsal" },
                  { id: "tenis", word: "EVOLUIR", label: "02 / TREINO E COMPETIÇÃO", src: "media/photos/joao-saque.webp", alt: "João Gouvêa se preparando para sacar" },
                  {
                    id: "desenho",
                    word: "IMAGINAR",
                    label: "03 / DESENHO E CRIAÇÃO",
                    src: "media/photos/desenho-olhos.webp",
                    alt: "Desenho em preto e branco com olhos em espiral",
                  },
                ].map((item) => (
                  <article key={item.id} className="pf-reel-card">
                    <span>{item.label}</span>
                    <figure className="pf-photo"><img src={url(item.src)} alt={item.alt} loading="lazy" /></figure>
                    <h3>
                      {item.word}
                      <span>↗</span>
                    </h3>
                  </article>
                ))}
              </div>
            </div>
            <div className="pf-reel-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </section>
        <section id="projetos" className="pf-section pf-projects">
          <SectionLabel number="02">Ideias que saem do papel</SectionLabel>
          <div className="pf-section-heading">
            <h2>
              Em
              <br />
              <em>construção.</em>
            </h2>
            <p>
              Projetos, experiências e novas formas
              <br />
              de conectar tecnologia e criatividade.
            </p>
          </div>
          <article className="pf-fecart">
            <div className="pf-video">
              <video
                ref={fecartVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback"
                onContextMenu={(e) => e.preventDefault()}
                onPause={(e) => { if (!document.hidden) void e.currentTarget.play().catch(() => {}); }}
                poster={url(photo("fecart").src)}
                aria-label="Vídeo do projeto FECART"
              >
                <source src={url("media/video/fecart.mp4")} type="video/mp4" />
                Seu navegador não suporta vídeo.{" "}
                <a href={url("media/video/fecart.mp4")}>Abrir vídeo FECART</a>
              </video>
            </div>
            <div className="pf-fecart-copy">
              <span className="pf-kicker">REGISTRO EM VÍDEO · LOOP SEM SOM</span>
              <h3>
                FECART<span>↗</span>
              </h3>
              <p>
                Tecnologia apresentada na prática. Um registro do projeto e da
                experiência na FECART.
              </p>
            </div>
          </article>
          <div className="pf-project-groups">
            <div className="pf-project-group-heading"><span>01 / TECNOLOGIA</span><h3>Pesquisa e protótipos</h3><p>Ideias em desenvolvimento, da visão computacional à experiência interativa.</p></div>
            <div className="pf-project-grid">
              {projects.slice(0, 2).map((project, index) => <article className="pf-project-card" key={project.n}><div className="pf-project-card-art" aria-hidden="true"><span>{index === 0 ? "◎" : "◈"}</span><small>{project.n} / LABORATÓRIO</small></div><div className="pf-project-card-copy"><span>{project.kind}</span><h4><HoverLetters text={project.name} /></h4><p>{project.body}</p><strong>{project.status}</strong></div></article>)}
            </div>
            <div className="pf-project-group-heading"><span>02 / COMUNICAÇÃO</span><h3>Conceito e impacto</h3><p>Projetos de criação apresentados em contextos acadêmicos.</p></div>
            <div className="pf-project-grid pf-project-grid-creative">
              {projects.slice(2).map((project, index) => <article className={`pf-project-card ${index === 0 ? "pf-project-card-italian" : ""}`} key={project.n}>
                <div className="pf-project-card-art">{index === 0 ? <img src={url("media/featured/italianwhey-capa.webp")} alt="Capa do projeto ItalianWhey" loading="lazy" /> : <span aria-hidden="true">ACSI</span>}<small>{project.n} / CRIAÇÃO</small></div>
                <div className="pf-project-card-copy"><span>{project.kind}</span><h4><HoverLetters text={project.name} /></h4><p>{project.body}</p><strong>{project.status}</strong></div>
                {index === 0 && <ItalianWheyCarousel />}
              </article>)}
            </div>
          </div>
        </section>
        <section id="jogos" className="pf-section pf-games">
          <SectionLabel number="03">Jogos criados e em desenvolvimento</SectionLabel>
          <div className="pf-section-heading"><h2>Universos <em>jogáveis.</em></h2><p>Protótipos, jogos e histórias desenvolvidos com Unity.</p></div>
          <div className="pf-games-grid">
            {[
              { title: "O CUBO", image: "o-cubo-gameplay", status: "Captura real do jogo", note: "Imagem capturada dentro da versão 0.0.5, durante uma fase jogável." },
              { title: "Bosque Invasor", image: "jogo-bosque", status: "Protótipo", note: "Recriação visual de uma cena de jogo perdido: um homem com charuto enfrenta aliens na floresta." },
              { title: "Eclipse: Defesa Dupla", image: "jogo-planeta", status: "Protótipo cooperativo", note: "Recriação visual de um jogo para dois jogadores com soldados robóticos em um planeta sombrio." },
              { title: "Frequência Morta", image: "frequencia-morta", status: "Em desenvolvimento", note: "Capa original do projeto de jogo Frequência Morta." },
            ].map((game, index) => <article className="pf-game" key={game.title}><div className={`pf-game-image pf-game-image-${game.image}`}><img src={url(`media/featured/${game.image}.webp`)} alt={game.note} loading="lazy" />{(game.image === "jogo-bosque" || game.image === "jogo-planeta") && <div className="pf-game-hud" aria-hidden="true"><span>{game.image === "jogo-bosque" ? "ONDA 03 / FLORESTA" : "CO-OP / 2 JOGADORES"}</span><i className="pf-game-reticle" /><b>{game.image === "jogo-bosque" ? "HP 100" : "SETOR 07"}</b></div>}</div><div className="pf-game-copy"><span>0{index + 1} / {game.status}</span><h3><HoverLetters text={game.title} /></h3><p>{game.note}</p></div></article>)}
          </div>
        </section>
        <section className="pf-sport">
          <div className="pf-sport-image"><img src={url("media/photos/tenis-2026-enhanced.webp")} alt="João Gouvêa em competição de tênis de mesa" loading="lazy" width="1476" height="1448" /></div>
          <div className="pf-sport-copy">
            <span className="pf-kicker">FOCO. REPETIÇÃO. EVOLUÇÃO.</span>
            <h2>
              <HoverLetters text="O próximo" />
              <br />
              <HoverLetters text="ponto começa" />
              <br />
              <em><HoverLetters text="agora." /></em>
            </h2>
            <p>
              No tênis de mesa, João representa Itaim Keiko e FECAP. Cada treino e
              competição fazem parte dessa história.
            </p>
            <a href="#trajetoria" className="pf-link">
              Percorrer trajetória <span>↗</span>
            </a>
          </div>
        </section>
        <section className="pf-swimming"><img src={url("media/featured/primeira-medalha.webp")} alt="João criança segurando a primeira medalha de natação" loading="lazy" /><div><span>ARQUIVO / NATAÇÃO</span><h2><HoverLetters text="16 medalhas." /></h2><p>Dezesseis conquistas de primeiro lugar na natação. A foto registra a primeira medalha.</p></div></section>
        <section className="pf-manifesto" aria-label="Esporte, tecnologia e criação">
          <span className="pf-manifesto-index">01 / 02 / 03 — EM MOVIMENTO</span>
          <p><HoverLetters text="IDEIAS EM CÓDIGO." /><br /><HoverLetters text="FOCO NO JOGO." /><br /><HoverLetters text="OLHOS NO FUTURO." /></p>
          <div className="pf-manifesto-bottom"><span>DA MESA AO LABORATÓRIO</span><span>↓ CONTINUE ROLANDO</span></div>
        </section>
        <section id="trajetoria" className="pf-timeline">
          <PortfolioTunnel />
          <div className="pf-section pf-timeline-archive">
            <SectionLabel number="05">Arquivo completo da trajetória</SectionLabel>
            <div className="pf-timeline-archive-heading">
              <span className="pf-kicker">DEPOIS DO TÚNEL</span>
              <h2>Cada etapa<br /><em>conta.</em></h2>
              <p>Explore as conquistas deslizando os cards. Selecione um ano para ir direto a essa etapa.</p>
            </div>
            <AchievementCarousel />
          </div>
        </section>
        <section id="certificados" className="pf-section pf-certificates">
          <SectionLabel number="06">Documento original</SectionLabel>
          <div className="pf-section-heading">
            <h2>
              OBI 2026,
              <br />
              um <em>marco real.</em>
            </h2>
            <p>
              Olimpíada Brasileira de Informática.
              <br />
              Modalidade Programação, Nível 1.
            </p>
          </div>
          <article className="pf-obi-feature pf-reveal">
            <div className="pf-obi-copy"><span className="pf-kicker">CERTIFICADO ORIGINAL · 2026</span><strong>146º <small>ENTRE 7.000 PARTICIPANTES DESDE A 1ª FASE</small></strong><p>Participação na XXVIII Olimpíada Brasileira de Informática, modalidade Programação Nível 1.</p><a className="pf-obi-link" href={url("media/certificates/obi-2026.pdf")} target="_blank" rel="noreferrer">Abrir certificado original (PDF) <span>↗</span></a></div>
            <a className="pf-obi-paper" href={url("media/certificates/obi-2026.pdf")} target="_blank" rel="noreferrer" aria-label="Abrir certificado original da OBI 2026 em PDF"><img src={url("media/certificates/obi-2026.webp")} alt="Prévia do certificado original da OBI 2026" loading="lazy" width="1684" height="1191" /></a>
          </article>
        </section>

      </main>
      <footer className="pf-footer">
        <a className="pf-logo" href="#inicio">
          jg<span>✳</span>
        </a>
        <span>
          JOÃO GOUVÊA © 2026
          <br />
          FEITO DE CURIOSIDADE.
        </span>
        <a href="https://github.com/jgouveaf" target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <a href="#inicio">Voltar ao topo ↑</a>
      </footer>
    </div>
  );
}
