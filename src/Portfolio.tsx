import { useEffect, useRef, useState } from "react";
import data from "./data/portfolio.json";
import "./portfolio.css";
import "./motion-design.css";
import { usePortfolioMotion, AnimatedNumber } from "./usePortfolioMotion";
const url = (path: string) => import.meta.env.BASE_URL + path;
type Media = {
  id: string;
  title: string;
  category: string;
  year: number | null;
  src: string;
  thumb: string;
  note: string;
  representation?: boolean;
};
const photo = (id: string) => data.photos.find((p) => p.id === id)!;
const years = [
  ...new Set(data.achievements.flatMap((a) => (a.year ? [a.year] : []))),
].sort((a, b) => a - b);
const categories = [
  "Todas",
  "Olimpíadas",
  "Robótica",
  "Programação",
  "Esportes",
  "Arte",
  "Projetos",
];
const projects = [
  { n: "01", name: "VisionAI", kind: "INTELIGÊNCIA ARTIFICIAL / ROBÓTICA", body: "Projeto em desenvolvimento de inteligência artificial e robótica. Explora visão computacional e a integração entre software e robô móvel.", status: "Em desenvolvimento" },
  { n: "02", name: "Frequência Morta", kind: "GAMEDEV / UNITY", body: "Projeto pessoal de jogo em desenvolvimento. Um espaço para aplicar programação, construir experiências e explorar a narrativa interativa.", status: "Em desenvolvimento" },
  { n: "03", name: "ItalianWhey", kind: "COMUNICAÇÃO / CRIATIVIDADE", body: "Projeto vencedor em trabalho de Publicidade e Propaganda de Escolas, em 2025. Criatividade, comunicação e empreendedorismo.", status: "Vencedor · 2025" },
  { n: "04", name: "ACSI", kind: "PROJETOS / CONQUISTAS", body: "Projeto finalista em ACSI. Uma conquista que integra minha trajetória criativa.", status: "Finalista" },
];
const curatedPhotos = ["tenis-preto-branco", "infancia-futebol", "unity", "formatura", "tenis"].map(photo);
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
  const [filter, setFilter] = useState("Todas");
  const [achievementsExpanded, setAchievementsExpanded] = useState(false);
  const [selectedProject, setSelectedProject] = useState(0);
  const [selectedYear, setSelectedYear] = useState(years[years.length - 1]);
  const [modal, setModal] = useState<{ items: Media[]; index: number } | null>(
    null,
  );
  const [menu, setMenu] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const fecartVideo = useRef<HTMLVideoElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const current = modal?.items[modal.index];
  const featuredAchievements = categories.slice(1).flatMap((category) =>
    data.achievements.filter((a) => a.category === category).slice(0, 2),
  );
  const visibleAchievements = filter === "Todas"
    ? achievementsExpanded ? data.achievements : featuredAchievements
    : data.achievements.filter((a) => a.category === filter);
  const open = (items: Media[], index: number) => {
    returnFocus.current = document.activeElement as HTMLElement;
    setModal({ items, index });
  };
  const close = () => {
    dialog.current?.close();
    setModal(null);
    returnFocus.current?.focus({ preventScroll: true });
  };
  const move = (by: number) =>
    setModal((m) =>
      m
        ? { ...m, index: (m.index + by + m.items.length) % m.items.length }
        : null,
    );
  useEffect(() => {
    if (!modal) return;
    const d = dialog.current;
    d?.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
    };
  }, [!!modal]);
  useEffect(() => {
    const resume = () => {
      if (!document.hidden) void fecartVideo.current?.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", resume);
    resume();
    return () => document.removeEventListener("visibilitychange", resume);
  }, []);
  const picture = (id: string, className = "", eager = false) => {
    const p = photo(id);
    return (
      <button
        className={"pf-photo " + className}
        onClick={() => open(curatedPhotos, curatedPhotos.indexOf(p))}
        aria-label={"Ampliar: " + p.title}
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
          <b>↗</b>
        </span>
      </button>
    );
  };
  return (
    <div className="pf pf-v2">
      <div className="pf-scroll-progress" aria-hidden="true" />
      <div className="pf-pointer" aria-hidden="true">
        <span>VER ↗</span>
      </div>
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
            ["projetos", "Projetos"],
            ["trajetoria", "Trajetória"],
            ["certificados", "Certificado OBI"],
            ["momentos", "Momentos"],
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
            <div className="pf-hero-image">
              {picture("tenis-preto-branco", "pf-hero-photo", true)}
            </div>
            <div className="pf-hero-atmosphere" aria-hidden="true" />
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
            <div className="pf-hero-top">
              <span>
                <i /> PORTFÓLIO PESSOAL / 2026
              </span>
              <span>TECNOLOGIA × ESPORTE × CRIATIVIDADE</span>
            </div>
            <div className="pf-hero-title">
              <span className="pf-hero-intro">
                A PRÓXIMA IDEIA COMEÇA AQUI.
              </span>
              <h1>
                <span className="pf-name-first">JOÃO</span>
                <span className="pf-name-last">
                  GOUVÊA<span className="pf-name-dot">.</span>
                </span>
              </h1>
            </div>
            <div className="pf-hero-bottom">
              <div className="pf-hero-copy">
                <span className="pf-kicker">ESTUDANTE DE IA / FECAP</span>
                <p>
                  Feito de curiosidade.
                  <br />
                  Movido pelo <em>próximo desafio.</em>
                </p>
                <a className="pf-hero-cta" href="#projetos">
                  VER MEUS PROJETOS <span>↗</span>
                </a>
              </div>
              <a
                className="pf-scroll-orbit"
                href="#sobre"
                aria-label="Rolar para Sobre mim"
              >
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <defs>
                    <path
                      id="scroll-orbit"
                      d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0"
                    />
                  </defs>
                  <text>
                    <textPath href="#scroll-orbit">
                      ROLE PARA EXPLORAR · ROLE PARA EXPLORAR ·{" "}
                    </textPath>
                  </text>
                </svg>
                <span>↓</span>
              </a>
            </div>
            <div className="pf-hero-footer">
              <span>01 — EM CONSTANTE EVOLUÇÃO</span>
              <span>APRENDER É SÓ O COMEÇO ↗</span>
            </div>
          </div>
        </section>
        <div className="pf-ticker" aria-hidden="true">
          <span>
            APRENDER. CRIAR. EXPLORAR. <b>✳</b> APRENDER. CRIAR. EXPLORAR.{" "}
            <b>✳</b>
          </span>
        </div>
        <nav className="pf-route" aria-label="Atalhos para explorar o portfólio">
          <a href="#projetos"><span>01 / CRIAR</span><strong>Projetos</strong><i>↗</i></a>
          <a href="#trajetoria"><span>02 / EVOLUIR</span><strong>Trajetória</strong><i>↗</i></a>
          <a href="#certificados"><span>03 / CONQUISTAR</span><strong>OBI 2026</strong><i>↗</i></a>
        </nav>
        <section id="sobre" className="pf-section pf-about pf-reveal">
          <SectionLabel number="01">Muito além de uma área</SectionLabel>
          <div className="pf-about-grid">
            <h2>
              A curiosidade
              <br />é o meu
              <br />
              <em>ponto de partida.</em>
            </h2>
            <div>
              <p className="pf-lead">
                Sou {data.profile.name}. Tenho {data.profile.age} anos e estudo{" "}
                {data.profile.course} na {data.profile.school}.
              </p>
              <p>
                Gosto de entender como as coisas funcionam — e de descobrir o
                que posso criar com elas. Meu caminho passa pela programação,
                pelos jogos, pela robótica e pelas olimpíadas acadêmicas.
              </p>
              <p>
                Fora do código, encontro no esporte a disciplina para tentar de
                novo. Na arte e nos projetos criativos, espaço para
                experimentar.
              </p>
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
                  <dt>FUTSAL</dt>
                  <dd>{data.sports.futsalClubs.join(" · ")}</dd>
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
              <span>MEDALHAS NA NATAÇÃO</span>
            </div>
            <div>
              <strong>
                <AnimatedNumber value={data.sports.tableTennisMedals} />
                <sup>↗</sup>
              </strong>
              <span>MEDALHAS NO TÊNIS DE MESA</span>
            </div>
            <div>
              <strong>
                <AnimatedNumber value={3} />
                <sup>↗</sup>
              </strong>
              <span>LEVELS CONCLUÍDOS EM GAMES</span>
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
                  { id: "infancia-futebol", word: "COMEÇAR", label: "01 / PRIMEIROS PASSOS" },
                  { id: "unity", word: "CRIAR", label: "02 / APRENDER FAZENDO" },
                  {
                    id: "formatura",
                    word: "SEGUIR",
                    label: "03 / O PRÓXIMO CAPÍTULO",
                  },
                ].map((item) => (
                  <article key={item.id} className="pf-reel-card">
                    <span>{item.label}</span>
                    {picture(item.id)}
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
          <div className="pf-project-explorer">
            <div className="pf-project-tabs" role="tablist" aria-label="Escolher projeto">
              {projects.map((project, index) => (
                <button key={project.n} id={`project-tab-${index}`} role="tab" aria-selected={selectedProject === index} aria-controls="project-panel" tabIndex={selectedProject === index ? 0 : -1} onClick={() => setSelectedProject(index)} onKeyDown={(event) => {
                  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                  event.preventDefault();
                  const next = (index + (event.key === "ArrowRight" ? 1 : -1) + projects.length) % projects.length;
                  setSelectedProject(next);
                  document.getElementById(`project-tab-${next}`)?.focus();
                }}><span>{project.n}</span><strong>{project.name}</strong><i>↗</i></button>
              ))}
            </div>
            <article key={selectedProject} id="project-panel" className={`pf-project-stage pf-project-stage-${selectedProject}`} role="tabpanel" aria-labelledby={`project-tab-${selectedProject}`}>
              <div className="pf-project-stage-copy"><span>{projects[selectedProject].n} / {projects[selectedProject].kind}</span><h3>{projects[selectedProject].name}</h3><p>{projects[selectedProject].body}</p><small>{projects[selectedProject].status} ↗</small></div>
              <div className="pf-project-stage-art" aria-hidden="true"><span>{projects[selectedProject].n}</span><i /><b>{projects[selectedProject].name}</b></div>
            </article>
          </div>
        </section>
        <section className="pf-sport">
          <div className="pf-sport-image">{picture("tenis")}</div>
          <div className="pf-sport-copy">
            <span className="pf-kicker">FOCO. REPETIÇÃO. EVOLUÇÃO.</span>
            <h2>
              O próximo
              <br />
              ponto começa
              <br />
              <em>agora.</em>
            </h2>
            <p>
              Da piscina à mesa, o esporte faz parte de quem sou. Cada treino e
              cada competição entram nessa história.
            </p>
            <a href="#conquistas" className="pf-link">
              Explorar conquistas <span>↗</span>
            </a>
          </div>
        </section>
        <section id="conquistas" className="pf-section">
          <SectionLabel number="03">
            Pequenos passos. Grandes memórias.
          </SectionLabel>
          <div className="pf-section-heading">
            <h2>
              Uma coleção
              <br />
              de <em>conquistas.</em>
            </h2>
            <p>
              Ciência, tecnologia, arte e esporte.
              <br />
              Diferentes caminhos, a mesma vontade de aprender.
            </p>
          </div>
          <div className="pf-filters" aria-label="Filtrar conquistas">
            {categories.map((c) => (
              <button
                key={c}
                aria-pressed={filter === c}
                onClick={() => { setFilter(c); setAchievementsExpanded(false); }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="pf-achievement-grid" aria-live="polite">
            {visibleAchievements.map((a) => (
                <article className="pf-achievement" key={a.id}>
                  <div>
                    <span>{a.category}</span>
                    <span>{a.year || "SEM DATA CONFIRMADA"}</span>
                  </div>
                  <h3>{a.title}</h3>
                  <p>{a.result}</p>
                </article>
              ))}
          </div>
          {filter === "Todas" && <button className="pf-gallery-more" onClick={() => setAchievementsExpanded(!achievementsExpanded)} aria-expanded={achievementsExpanded}>{achievementsExpanded ? "Mostrar destaques" : `Ver todas as ${data.achievements.length} conquistas`} <span>{achievementsExpanded ? "↑" : "↓"}</span></button>}
          <p className="pf-source-note">
            Histórico informado por João. O certificado OBI original está disponível abaixo.
          </p>
        </section>
        <section id="trajetoria" className="pf-section pf-timeline">
          <SectionLabel number="04">O caminho até aqui</SectionLabel>
          <div className="pf-timeline-grid">
            <div className="pf-timeline-title">
              <h2>
                Tudo faz
                <br />
                parte da
                <br />
                <em>história.</em>
              </h2>
              <p>
                Escolha um ano para descobrir os acontecimentos. A trajetória continua.
              </p>
              <span>ESCOLHA UM ANO →</span>
            </div>
            <div className="pf-years">
              {years.map((year) => (
                <article className="pf-year" key={year}>
                  <h3><button aria-expanded={selectedYear === year} aria-controls={selectedYear === year ? `year-${year}` : undefined} onClick={() => setSelectedYear(year)}>{year}<span>{selectedYear === year ? "−" : "+"}</span></button></h3>
                  {selectedYear === year && <ul id={`year-${year}`}>
                    {data.achievements
                      .filter((a) => a.year === year)
                      .map((a) => (
                        <li key={a.id}>
                          <span>{a.category}</span>
                          <h4>{a.title}</h4>
                          <p>{a.result}</p>
                        </li>
                      ))}
                  </ul>}
                </article>
              ))}
              <article className="pf-year undated">
                <h3>Além das datas</h3>
                <p>
                  As conquistas sem ano confirmado permanecem na coleção, sem
                  atribuição de uma data presumida.
                </p>
              </article>
            </div>
          </div>
        </section>
        <section id="certificados" className="pf-section pf-certificates">
          <SectionLabel number="05">Documento original</SectionLabel>
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
            <div className="pf-obi-copy"><span className="pf-kicker">CERTIFICADO ORIGINAL · 2026</span><strong>146º <small>DE 2.923 PARTICIPANTES</small></strong><p>Participação na XXVIII Olimpíada Brasileira de Informática, modalidade Programação Nível 1.</p><a className="pf-obi-link" href={url("media/certificates/obi-2026.pdf")} target="_blank" rel="noreferrer">Abrir certificado original (PDF) <span>↗</span></a></div>
            <a className="pf-obi-paper" href={url("media/certificates/obi-2026.pdf")} target="_blank" rel="noreferrer" aria-label="Abrir certificado original da OBI 2026 em PDF"><img src={url("media/certificates/obi-2026.webp")} alt="Prévia do certificado original da OBI 2026" loading="lazy" width="1684" height="1191" /></a>
          </article>
        </section>
        <section className="pf-explore pf-section">
          <span className="pf-kicker">UM OUTRO JEITO DE EXPLORAR</span>
          <h2>
            A curiosidade
            <br />
            não termina <em>aqui.</em>
          </h2>
          <div>
            <a className="pf-pill" href={url("exploracao/")}>
              Entrar na exploração 3D ↗
            </a>
            <a className="pf-link" href={url("neymar/")}>
              Ver experiência Neymar ↗
            </a>
          </div>
          <p>Experiências interativas preservadas do projeto.</p>
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
      {current && (
        <dialog
          ref={dialog}
          className="pf-dialog"
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              move(1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              move(-1);
            }
          }}
          aria-labelledby="pf-dialog-title"
        >
          <div className="pf-modal-body">
            <div className="pf-modal-top">
              <span>
                {modal!.index + 1} / {modal!.items.length}
              </span>
              <button autoFocus onClick={close} aria-label="Fechar imagem">
                Fechar ×
              </button>
            </div>
            <img
              className="pf-modal-image"
              src={url(current.src)}
              alt={current.title}
            />
            <div className="pf-modal-info">
              <div>
                <small>
                  {current.category} · {current.year || "Data não confirmada"}
                </small>
                <h2 id="pf-dialog-title">{current.title}</h2>
                {current.representation && (
                  <strong>
                    Representação digital · não é documento oficial.
                  </strong>
                )}
                {current.note && <p>{current.note}</p>}
              </div>
              <a href={url(current.src)} target="_blank" rel="noreferrer">
                Abrir em alta resolução ↗
              </a>
            </div>
            <div className="pf-modal-controls">
              <button onClick={() => move(-1)} aria-label="Imagem anterior">
                ← Anterior
              </button>
              <span>USE AS SETAS DO TECLADO</span>
              <button onClick={() => move(1)} aria-label="Próxima imagem">
                Próxima →
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
