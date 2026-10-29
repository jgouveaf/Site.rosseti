# João Gouvêa — portfólio pessoal

Portfólio em React + Vite, com seleção de fotografias, conquistas filtráveis, linha do tempo, certificado original da OBI 2026 e vídeo FECART. A experiência anterior de Neymar foi preservada em `/neymar/`; o arquivo 3D OBSIDIAN está disponível em `/exploracao/`.

## Executar

Node.js 20.19+ (CI usa Node 24):

```sh
npm ci
npm run dev
npm run build
npm run preview -- --base /Site.rosseti/
```

A produção usa o prefixo `/Site.rosseti/`. O workflow `.github/workflows/pages.yml` publica os arquivos de `dist` após push em `main`.

## Conteúdo e manutenção

- `src/data/portfolio.json`: perfil, conquistas e arquivo de fotos. Dados antigos de certificados permanecem para rastreabilidade, mas não aparecem na página.
- `src/Portfolio.tsx`: seções, filtros, modal acessível e navegação.
- `src/portfolio.css` e `src/motion-design.css`: visual editorial, efeitos de interação e responsividade.
- `src/usePortfolioMotion.tsx`: animações de entrada, progresso e faixa horizontal com rolagem nativa.
- `public/media/`: fotos WebP, certificado original OBI em PDF, prévia WebP, imagens conceituais e vídeo original FECART em loop mudo.
- `docs/media-sources.json`: relação de fotos e arquivos de origem.
- `scripts/prepare-media.py`: tratamento convencional reproduzível (Pillow); requer os materiais locais nos caminhos indicados.
- `scripts/test-portfolio.py`: regressão de navegador (Python + Playwright + Chromium instalado).
- `scripts/test-motion.py`: verificação das animações, do teclado e da preferência de movimento reduzido.

O modal de fotos usa diálogo nativo: Escape fecha, setas navegam, foco fica contido e volta ao acionador. Conquistas e galeria começam com uma seleção; botões mostram o arquivo completo. As experiências 3D usam importação sob demanda.

A abertura usa a imagem estilizada em preto e branco do tênis de mesa escolhida por João, copiada sem alterações. Sua procedência é informada no modal.

## Verificação

Depois do build, sirva com o base path acima e execute:

```sh
python scripts/test-portfolio.py http://127.0.0.1:4173/Site.rosseti/
```

Use a porta impressa pelo preview. Resultados e capturas são salvos em `docs/qa/` (ignorado pelo Git).

## Fidelidade dos materiais

Somente o certificado original da OBI 2026 é exibido na seção de certificados. As 13 representações digitais do ZIP permanecem no repositório como material histórico, sem aparecer na página. A foto da medalha recebeu uma edição artística identificada como tal; a foto original continua acessível. A imagem abstrata de visão computacional é rotulada como conceito visual. Não há reconstrução generativa de rostos nas fotos publicadas. Leia `docs/implementation-status.md` para cobertura e limites.
