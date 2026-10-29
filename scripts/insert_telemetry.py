with open(r'D:\Site.rosseti\src\Portfolio.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """            <div className="pf-hero-footer">
              <span>01 — EM CONSTANTE EVOLUÇÃO</span>
              <span>APRENDER É SÓ O COMEÇO ↗</span>
            </div>
          </div>
        </section>
        <div className="pf-ticker" aria-hidden="true">"""

replacement = """            <div className="pf-hero-footer">
              <span>01 — EM CONSTANTE EVOLUÇÃO</span>
              <span>APRENDER É SÓ O COMEÇO ↗</span>
            </div>
          </div>
        </section>
        <div className="pf-telemetry-hud" aria-label="Telemetria e Status">
          <div className="pf-telemetry-item">
            <span className="pf-telemetry-indicator" />
            <span className="pf-telemetry-label">STATUS:</span>
            <strong className="pf-telemetry-value">ATIVO / EM EVOLUÇÃO</strong>
          </div>
          <div className="pf-telemetry-item">
            <span className="pf-telemetry-label">DISCIPLINA:</span>
            <strong className="pf-telemetry-value">IA &amp; ROBÓTICA · FECAP</strong>
          </div>
          <div className="pf-telemetry-item">
            <span className="pf-telemetry-label">ATLETISMO:</span>
            <strong className="pf-telemetry-value">TÊNIS DE MESA &amp; NATAÇÃO</strong>
          </div>
          <div className="pf-telemetry-item">
            <span className="pf-telemetry-label">MARCOS:</span>
            <strong className="pf-telemetry-value">26+ MEDALHAS &amp; PRÊMIOS</strong>
          </div>
        </div>
        <div className="pf-ticker" aria-hidden="true">"""

if target in content:
    content = content.replace(target, replacement)
    with open(r'D:\Site.rosseti\src\Portfolio.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Telemetry HUD inserted into Portfolio.tsx")
else:
    # let's find pf-hero-footer
    idx = content.find('pf-hero-footer')
    print("target not exact match, snippet:", repr(content[idx:idx+250]))
