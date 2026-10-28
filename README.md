# João Gouvêa — portfólio pessoal

Portfólio em React + Vite, com fotografias reais, conquistas filtráveis, linha do tempo, certificados em camadas e vídeo FECART. A experiência anterior de Neymar foi preservada em `/neymar/`; o arquivo 3D OBSIDIAN está disponível em `/exploracao/`.

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

- `src/data/portfolio.json`: perfil, conquistas, fotos e representações de certificados.
- `src/Portfolio.tsx`: seções, filtros, modal acessível e navegação.
- `src/portfolio.css`: visual editorial, pilha sticky, responsividade e movimento reduzido.
- `public/media/`: fotos WebP, certificados WebP/PNG e vídeo original FECART.
- `docs/media-sources.json`: relação de fotos e arquivos de origem.
- `scripts/prepare-media.py`: tratamento convencional reproduzível (Pillow); requer os materiais locais nos caminhos indicados.
- `scripts/test-portfolio.py`: regressão de navegador (Python + Playwright + Chromium instalado).

O modal usa diálogo nativo: Escape fecha, setas navegam, foco fica contido e volta ao acionador. A pilha de certificados usa scroll nativo e CSS sticky; em movimento reduzido, vira uma lista estática. As experiências 3D usam importação sob demanda.

## Verificação

Depois do build, sirva com o base path acima e execute:

```sh
python scripts/test-portfolio.py http://127.0.0.1:4173/Site.rosseti/
```

Use a porta impressa pelo preview. Resultados e capturas são salvos em `docs/qa/` (ignorado pelo Git).

## Fidelidade dos materiais

As 13 peças do ZIP de certificados são representações digitais fornecidas pelo usuário, não documentos oficiais. A interface explicita isso e preserva as divergências de Canguru e Poliedro. Datas desconhecidas não são deduzidas a partir da digitalização. Não há reconstrução generativa de rostos nas fotos publicadas. Leia `docs/implementation-status.md` para cobertura e limites.
