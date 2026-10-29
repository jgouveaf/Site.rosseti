import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  const [galleryFilter, setGalleryFilter] = useState("Todas");
  const [modal, setModal] = useState<{ items: Media[]; index: number } | null>(
    null,
  );
  const [menu, setMenu] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const current = modal?.items[modal.index];
  const shown = data.photos.filter(
    (p) => galleryFilter === "Todas" || p.category === galleryFilter,
  );
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
  const picture = (id: string, className = "", eager = false) => {
    const p = photo(id);
    return (
      <button
        className={"pf-photo " + className}
        onClick={() => open(data.photos, data.photos.indexOf(p))}
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
            ["certificados", "Certificados"],
            ["galeria", "Galeria"],
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
                  EXPLORE MEU UNIVERSO <span>↗</span>
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
        <section className="pf-reel" aria-label="Momentos em movimento">
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
              <span className="pf-reel-hint">DESLIZE PARA DESCOBRIR ↔</span>
            </div>
            <div className="pf-reel-window">
              <div className="pf-reel-track">
                {[
                  { id: "tenis", word: "FOCO", label: "01 / DENTRO DO JOGO" },
                  { id: "fecart", word: "CRIAR", label: "02 / FORA DO ÓBVIO" },
                  {
                    id: "unity",
                    word: "EVOLUIR",
                    label: "03 / CÓDIGO EM AÇÃO",
                  },
                  {
                    id: "formatura",
                    word: "SEGUIR",
                    label: "04 / O PRÓXIMO CAPÍTULO",
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
                controls
                playsInline
                preload="none"
                poster={url(photo("fecart").src)}
                aria-label="Vídeo do projeto FECART"
              >
                <source src={url("media/video/fecart.mp4")} type="video/mp4" />
                Seu navegador não suporta vídeo.{" "}
                <a href={url("media/video/fecart.mp4")}>Abrir vídeo FECART</a>
              </video>
            </div>
            <div className="pf-fecart-copy">
              <span className="pf-kicker">REGISTRO EM VÍDEO · 2026</span>
              <h3>
                FECART<span>↗</span>
              </h3>
              <p>
                Tecnologia apresentada na prática. Um registro do projeto e da
                experiência na FECART.
              </p>
              <a
                className="pf-link"
                href={url("media/video/fecart.mp4")}
                target="_blank"
                rel="noreferrer"
              >
                Abrir vídeo <span>↗</span>
              </a>
            </div>
          </article>
          <div className="pf-project-grid">
            {[
              {
                n: "01",
                name: "VisionAI",
                kind: "INTELIGÊNCIA ARTIFICIAL / ROBÓTICA",
                body: "Projeto em desenvolvimento de inteligência artificial e robótica. Explora visão computacional e a integração entre software e robô móvel.",
                status: "Em desenvolvimento",
              },
              {
                n: "02",
                name: "Frequência Morta",
                kind: "GAMEDEV / UNITY",
                body: "Projeto pessoal de jogo em desenvolvimento. Um espaço para aplicar programação, construir experiências e explorar a narrativa interativa.",
                status: "Em desenvolvimento",
              },
              {
                n: "03",
                name: "ItalianWhey",
                kind: "COMUNICAÇÃO / CRIATIVIDADE",
                body: "Projeto vencedor em trabalho de Publicidade e Propaganda de Escolas, em 2025. Criatividade, comunicação e empreendedorismo.",
                status: "Vencedor · 2025",
              },
              {
                n: "04",
                name: "ACSI",
                kind: "PROJETOS / CONQUISTAS",
                body: "Projeto finalista em ACSI. Uma conquista que integra minha trajetória criativa.",
                status: "Finalista",
              },
            ].map((p) => (
              <article key={p.n} className="pf-project">
                <span>
                  {p.n} / {p.kind}
                </span>
                <h3>{p.name}</h3>
                <p>{p.body}</p>
                <small>{p.status} ↗</small>
              </article>
            ))}
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
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="pf-achievement-grid" aria-live="polite">
            {data.achievements
              .filter((a) => filter === "Todas" || a.category === filter)
              .map((a) => (
                <article className="pf-achievement" key={a.id}>
                  <div>
                    <span>{a.category}</span>
                    <span>{a.year || "SEM DATA CONFIRMADA"}</span>
                  </div>
                  {a.photo && picture(a.photo)}
                  <h3>{a.title}</h3>
                  <p>{a.result}</p>
                </article>
              ))}
          </div>
          <p className="pf-source-note">
            Histórico informado por João. Há divergências entre o histórico e
            alguns documentos de Canguru e Poliedro; os detalhes estão na seção
            de certificados.
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
                Dos primeiros registros às experiências mais recentes. Uma
                trajetória que continua.
              </p>
              <span>2017 — 2026 ↓</span>
            </div>
            <div className="pf-years">
              {years.map((year) => (
                <article className="pf-year" key={year}>
                  <h3>
                    {year}
                    <span>↗</span>
                  </h3>
                  <ul>
                    {data.achievements
                      .filter((a) => a.year === year)
                      .map((a) => (
                        <li key={a.id}>
                          <span>{a.category}</span>
                          <h4>{a.title}</h4>
                          <p>{a.result}</p>
                        </li>
                      ))}
                  </ul>
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
          <SectionLabel number="05">Aprendizado em camadas</SectionLabel>
          <div className="pf-section-heading">
            <h2>
              Cada página,
              <br />
              um <em>novo passo.</em>
            </h2>
            <p>
              Role para empilhar.
              <br />
              Toque para ampliar e navegar.
            </p>
          </div>
          <p className="pf-cert-note">
            As {data.certificates.length} peças abaixo são{" "}
            <strong>representações digitais de portfólio</strong> fornecidas no
            material. Não são documentos oficiais. Informações divergentes são
            explicadas ao abrir cada peça.
          </p>
          <div className="pf-cert-stack">
            {data.certificates.map((c, i) => (
              <article
                className="pf-cert-card"
                key={c.id}
                style={
                  {
                    "--card-index": i,
                    "--card-rotation": `${i % 2 ? 1.2 : -1.2}deg`,
                  } as CSSProperties
                }
              >
                <div className="pf-cert-meta">
                  <span>
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {String(data.certificates.length).padStart(2, "0")}
                  </span>
                  <span>REPRESENTAÇÃO DIGITAL</span>
                </div>
                <button
                  onClick={() => open(data.certificates, i)}
                  aria-label={"Ampliar: " + c.title}
                >
                  <img
                    src={url(c.thumb)}
                    alt={c.title + " — representação digital"}
                    loading="lazy"
                    width="2400"
                    height="1600"
                  />
                </button>
                <div className="pf-cert-footer">
                  <h3>{c.title}</h3>
                  <span>{c.year || "HISTÓRICO"} ↗</span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="galeria" className="pf-section pf-gallery">
          <SectionLabel number="06">O que fica</SectionLabel>
          <div className="pf-section-heading">
            <h2>
              Mais que fotos.
              <br />
              <em>Memórias.</em>
            </h2>
            <p>
              Infância, competições, cursos e encontros.
              <br />O arquivo pessoal por trás das conquistas.
            </p>
          </div>
          <div className="pf-filters" aria-label="Filtrar fotografias">
            {[
              "Todas",
              "Pessoal",
              "Infância",
              "Esportes",
              "Olimpíadas",
              "Robótica",
              "Programação",
            ].map((c) => (
              <button
                key={c}
                onClick={() => setGalleryFilter(c)}
                aria-pressed={galleryFilter === c}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="pf-gallery-grid">
            {shown.map((p) => (
              <button
                key={p.id}
                className="pf-gallery-card"
                onClick={() => open(shown, shown.indexOf(p))}
                aria-label={"Ampliar: " + p.title}
              >
                <img
                  src={url(p.thumb)}
                  alt={p.title}
                  loading="lazy"
                  width={p.width}
                  height={p.height}
                />
                <span>
                  <small>
                    {p.category} / {p.year || "ARQUIVO PESSOAL"}
                  </small>
                  <b>{p.title}</b>
                  <i>↗</i>
                </span>
              </button>
            ))}
          </div>
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
