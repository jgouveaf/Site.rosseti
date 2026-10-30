import { useEffect, useRef, useState } from "react";
import data from "./data/portfolio.json";
import "./portfolio.css";
import "./motion-design.css";
import "./editorial-redesign.css";
import "./brush-hero.css";
import "./portfolio-refresh.css";
import "./portfolio-overhaul.css";
import { usePortfolioMotion, AnimatedNumber } from "./usePortfolioMotion";
const url = (path: string) => import.meta.env.BASE_URL + path;
const photo = (id: string) => data.photos.find((p) => p.id === id)!;
const years = [
  ...new Set(data.achievements.flatMap((a) => (a.year ? [a.year] : []))),
].sort((a, b) => a - b);
const projects = [
  { n: "01", name: "VisionAI", kind: "INTELIGÊNCIA ARTIFICIAL / ROBÓTICA", body: "Projeto em desenvolvimento de inteligência artificial e robótica. Explora visão computacional e a integração entre software e robô móvel.", status: "Em desenvolvimento" },
  { n: "02", name: "Frequência Morta", kind: "GAMEDEV / UNITY", body: "Projeto pessoal de jogo em desenvolvimento. Um espaço para aplicar programação, construir experiências e explorar a narrativa interativa.", status: "Em desenvolvimento" },
  { n: "03", name: "ItalianWhey", kind: "COMUNICAÇÃO / CRIATIVIDADE", body: "Projeto vencedor em trabalho de Publicidade e Propaganda de Escolas, em 2025. Criatividade, comunicação e empreendedorismo.", status: "Vencedor · 2025" },
  { n: "04", name: "ACSI", kind: "PROJETOS / CONQUISTAS", body: "Projeto finalista em ACSI. Uma conquista da trajetória criativa de João.", status: "Finalista" },
];
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
  useEffect(() => {
    const section = document.querySelector<HTMLElement>(".pf-timeline");
    const rings = Array.from(document.querySelectorAll<HTMLElement>(".pf-tunnel i"));
    const yearDisplay = section?.querySelector<HTMLElement>(".pf-tunnel-current");
    const yearCards = Array.from(section?.querySelectorAll<HTMLElement>(".pf-year:not(.pf-year-undated)") ?? []);
    if (!section || !rings.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / Math.max(1, rect.height - innerHeight)));
      section.style.setProperty("--tunnel-progress", String(progress));
      rings.forEach((ring, index) => {
        const cycle = (index / rings.length + progress * 2.4) % 1;
        ring.style.transform = `translate(-50%, -50%) scale(${(.14 + cycle * 2.6).toFixed(3)}) rotate(${(progress * 36).toFixed(1)}deg)`;
        ring.style.opacity = String(Math.max(.15, 1 - cycle * .58));
      });
      const active = [...yearCards].reverse().find(card => card.getBoundingClientRect().top < innerHeight * .62) ?? yearCards[0];
      if (yearDisplay && active) yearDisplay.textContent = active.querySelector("h3 span")?.textContent ?? "2022";
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request);
    return () => { removeEventListener("scroll", request); removeEventListener("resize", request); cancelAnimationFrame(frame); };
  }, []);
  const picture = (id: string, className = "", eager = false) => {
    const p = photo(id);
    return (
      <figure
        className={"pf-photo " + className}
      >
        <img
          src={url(p.thumb)}
          srcSet={
            p.thumb === p.src
              ? undefined
              : `${url(p.thumb)} ${p.thumbWidth}w, ${url(p.src)} ${p.width}w`
          }
          sizes="(max-width: 700px) 90vw, 45vw"
          alt={p.title}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          width={p.width}
          height={p.height}
        />
        <span className="pf-photo-caption">
          {p.year || "MEMÓRIA"} / {p.title}
        </span>
      </figure>
    );
  };
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
                  { id: "podio", word: "COMPETIR", label: "01 / ESPORTE · 2024", src: "media/photos/joao-2024-podio.webp", alt: "João Gouvêa no pódio de tênis de mesa em 2024" },
                  { id: "tenis", word: "EVOLUIR", label: "02 / TREINO E COMPETIÇÃO", src: "media/photos/joao-saque.webp", alt: "João Gouvêa se preparando para sacar" },
                  {
                    id: "formatura",
                    word: "CRIAR",
                    label: "03 / FORMAÇÃO E IDEIAS",
                    src: "media/photos/joao-game-dev-full.webp",
                    alt: "João Gouvêa na formação em desenvolvimento de jogos",
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
            <div className="pf-project-grid">
              {projects.slice(2).map((project, index) => <article className="pf-project-card" key={project.n}><div className="pf-project-card-art">{index === 0 ? <img src={url("media/featured/italianwhey-capa.webp")} alt="Capa do projeto ItalianWhey" loading="lazy" /> : <span aria-hidden="true">ACSI</span>}<small>{project.n} / CRIAÇÃO</small></div><div className="pf-project-card-copy"><span>{project.kind}</span><h4><HoverLetters text={project.name} /></h4><p>{project.body}</p><strong>{project.status}</strong></div></article>)}
            </div>
          </div>
          <div className="pf-italian-gallery"><span>ITALIANWHEY / PROJETO VENCEDOR DE PUBLICIDADE</span><div>{[1, 2, 3, 4, 5, 6].map(index => <figure key={index}><img src={url(`media/featured/italianwhey-${index}.webp`)} alt={`Registro ${index} do projeto ItalianWhey`} loading="lazy" /><figcaption>REGISTRO 0{index}</figcaption></figure>)}</div></div>
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
            ].map((game, index) => <article className="pf-game" key={game.title}><div className={`pf-game-image ${game.image === "frequencia-morta" ? "pf-game-image-poster" : ""}`}><img src={url(`media/featured/${game.image}.webp`)} alt={game.note} loading="lazy" /></div><div className="pf-game-copy"><span>0{index + 1} / {game.status}</span><h3><HoverLetters text={game.title} /></h3><p>{game.note}</p></div></article>)}
          </div>
        </section>
        <section className="pf-sport">
          <div className="pf-sport-image">{picture("tenis")}</div>
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
          <div className="pf-sport-medals"><span>ARQUIVO / TÊNIS DE MESA</span><div>{["inicup", "liga-20", "matchpoint"].map(id => picture(id))}</div></div>
        </section>
        <section className="pf-swimming"><img src={url("media/featured/primeira-medalha.webp")} alt="João criança segurando a primeira medalha de natação" loading="lazy" /><div><span>ARQUIVO / NATAÇÃO</span><h2><HoverLetters text="16 medalhas." /></h2><p>Dezesseis conquistas de primeiro lugar na natação. A foto registra a primeira medalha.</p></div></section>
        <section className="pf-manifesto" aria-label="Esporte, tecnologia e criação">
          <span className="pf-manifesto-index">01 / 02 / 03 — EM MOVIMENTO</span>
          <p><HoverLetters text="IDEIAS EM CÓDIGO." /><br /><HoverLetters text="FOCO NO JOGO." /><br /><HoverLetters text="OLHOS NO FUTURO." /></p>
          <div className="pf-manifesto-bottom"><span>DA MESA AO LABORATÓRIO</span><span>↓ CONTINUE ROLANDO</span></div>
        </section>
        <section id="trajetoria" className="pf-section pf-timeline">
          <SectionLabel number="05">A história acontece enquanto você rola</SectionLabel>
          <div className="pf-timeline-grid">
            <div className="pf-timeline-title">
              <span className="pf-kicker">ARQUIVO / TRAJETÓRIA</span>
              <h2>UM PASSO<br />DE CADA <em>VEZ.</em></h2>
              <p>Esporte, olimpíadas, tecnologia e criação. Os marcos aparecem na sequência da jornada, sem precisar abrir nada.</p>
              <span>ROLE PARA EXPLORAR ↓</span>
            </div>
            <div className="pf-years"><div className="pf-tunnel" aria-hidden="true"><div className="pf-tunnel-grid" />{Array.from({length: 9}, (_, index) => <i key={index} />)}<div className="pf-tunnel-hud"><span>TRAJETÓRIA / EM CURSO</span><strong className="pf-tunnel-current">{years[0]}</strong><span>ROLE PARA AVANÇAR ↓</span><b /></div></div>
              {years.map((year) => (
                <article className="pf-year" key={year}>
                  <h3><span>{year}</span><small>{data.achievements.filter((a) => a.year === year).length.toString().padStart(2, "0")} MARCOS</small></h3>
                  <ul id={`year-${year}`}>
                    {data.achievements.filter((a) => a.year === year).map((a, index) => (
                      <li key={a.id} className="pf-history-item pf-reveal">
                        <span>{String(index + 1).padStart(2, "0")} / {a.category}</span>
                        <h4>{a.title}</h4>
                        <p>{a.result}</p>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
              <article className="pf-year pf-year-undated">
                <h3><span>SEM DATA</span><small>OUTROS MARCOS</small></h3>
                <ul>
                  {data.achievements.filter((a) => !a.year).map((a, index) => (
                    <li key={a.id} className="pf-history-item pf-reveal">
                      <span>{String(index + 1).padStart(2, "0")} / {a.category}</span>
                      <h4>{a.title}</h4>
                      <p>{a.result}</p>
                    </li>
                  ))}
                </ul>
              </article>
              <p className="pf-source-note">Histórico informado por João. Itens sem ano confirmado não receberam data presumida.</p>
            </div>
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
