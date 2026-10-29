with open(r"D:\Site.rosseti\src\Portfolio.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update curatedPhotos to feature real photos of João
old_curated = 'const curatedPhotos = ["tenis-preto-branco", "infancia-futebol", "unity", "formatura", "tenis"].map(photo);'
new_curated = 'const curatedPhotos = ["joao-portrait", "joao-foco", "torneio-2026", "fecart", "esporte-2025", "formatura", "tenis"].map(photo);'
if old_curated in code:
    code = code.replace(old_curated, new_curated)
    print("Updated curatedPhotos!")

# 2. Update Hero section
old_hero = """        <section
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
                <span className="pf-name-first"><HoverLetters text="JOÃO" /></span>
                <span className="pf-name-last">
                  <HoverLetters text="GOUVÊA" /><span className="pf-name-dot">.</span>
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
        </section>"""

new_hero = """        <section
          id="inicio"
          className="pf-hero-stage"
          aria-label="João Gouvêa, portfólio"
        >
          <div className="pf-hero pf-hero-cinema">
            <div className="pf-hero-title">
              <span className="pf-hero-intro">
                A PRÓXIMA IDEIA COMEÇA AQUI.
              </span>
              <h1>
                <span className="pf-name-first"><HoverLetters text="JOÃO" /></span>
                {" "}
                <span className="pf-name-last">
                  <HoverLetters text="GOUVÊA" /><span className="pf-name-dot">.</span>
                </span>
              </h1>
              <div className="pf-hero-copy">
                <span className="pf-kicker">ESTUDANTE DE IA · FECAP · ATLETA FEDERADO</span>
                <p>
                  Feito de curiosidade.
                  <br />
                  Movido pelo <em>próximo desafio.</em>
                </p>
                <div className="pf-hero-actions">
                  <a className="pf-hero-cta" href="#projetos">
                    VER MEUS PROJETOS <span>↗</span>
                  </a>
                  <a className="pf-scroll-link" href="#sobre">
                    EXPLORAR TRAJETÓRIA ↓
                  </a>
                </div>
              </div>
            </div>
            <div className="pf-hero-image">
              {picture("joao-portrait", "pf-hero-photo", true)}
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
        </section>"""

if old_hero in code:
    code = code.replace(old_hero, new_hero)
    print("Replaced Hero section!")
else:
    print("Old hero not exact match, let's check difference")

# 3. Remove 3D Exploration section
explore_section = """        <section className="pf-explore pf-section">
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
        </section>"""

if explore_section in code:
    code = code.replace(explore_section, "")
    print("Removed 3D Exploration section successfully!")
else:
    print("Exploration section not exact match, checking index...")
    idx = code.find("pf-explore")
    if idx != -1:
        start = code.rfind("<section", 0, idx)
        end = code.find("</section>", idx) + len("</section>")
        code = code[:start] + code[end:]
        print("Removed 3D Exploration by bounds!")

with open(r"D:\Site.rosseti\src\Portfolio.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated Portfolio.tsx!")
