# Entrega — portfólio João Gouvêa

## Implementado

- Entrada principal adaptada para João, mantendo React/Vite e as experiências existentes em rotas separadas.
- 27 fotografias tratadas convencionalmente e a imagem estilizada em preto e branco usada na abertura a pedido de João. Apenas cinco imagens selecionadas aparecem na experiência atual.
- Certificado original da OBI 2026 em PDF, com prévia e link direto. As 13 representações digitais anteriores não aparecem mais na interface.
- 35 registros de conquistas, filtros por categoria e linha do tempo de 2017 a 2026.
- Sobre, projetos interativos, esporte, três momentos navegáveis e vídeo FECART original (14,119 s, 1920×1080).
- Cinco fotos selecionadas na página, com tratamento visual monocromático, textos alternativos e modal acessível. O arquivo de 29 fotos e o cartaz da OBI foram removidos da interface.
- Modal com Escape, foco contido pelo diálogo nativo, retorno de foco e navegação circular.
- Layout móvel e suporte a movimento reduzido.
- Abertura cinematográfica, texto e elementos reagindo à rolagem, contadores animados, revelação das seções, cursores contextuais, cartões com profundidade e faixa horizontal de memórias. No celular, a faixa aceita gesto de arrastar.
- Projetos com seletor por clique/teclado e arte gráfica em CSS; linha do tempo com anos expansíveis. Vídeo FECART em loop automático mudo e sem controles.

## Testes executados

`npm run build` passou (TypeScript + Vite). Há aviso de tamanho no chunk Three.js legado, carregado apenas sob demanda.

As verificações Playwright/Chromium cobrem nome/título, conquistas e filtros, seletor de projetos com teclado, linha do tempo, quantidade de imagens visíveis, certificado OBI, navegação circular, Escape/foco, URLs de imagens, reprodução do vídeo, ausência de overflow em telas móveis, menu, movimento reduzido e rotas Neymar/OBSIDIAN. Isso não substitui teste em celulares físicos.

Resultados detalhados da versão atual são gerados em `docs/qa/` durante os testes locais.

## Fidelidade e pendências de conteúdo

- ZIP anterior contém recriações gráficas. A seção pública agora usa apenas o PDF original OBI 2026 fornecido por João.
- Canguru: histórico informado é honra ao mérito 2022/2023, bronze 2024 e prata 2025. Material de referência menciona honra ao mérito 2024; a divergência permanece registrada nos dados históricos, fora da seção pública de certificados.
- Poliedro: histórico informado é bronze 2024 e prata 2025. Material de referência menciona prata 2024 e menção honrosa 2023; a divergência permanece registrada nos dados históricos, fora da seção pública de certificados.
- ACSI não recebe ano na conquista: o nome do arquivo contém 2022, mas o briefing pede confirmação antes de atribuir ano.
- A medalha Canguru com inscrição 2022 permanece no arquivo de origem, sem transformar sua aparência em resultado informado.
- Não foram inventadas imagens oficiais para OBA 2022/2025, Games Levels 1–3 ou resultados sem documento identificado. Os registros textuais permanecem.
- Cinco fotos foram escolhidas para a experiência visível; as demais permanecem no arquivo de origem.
- João pediu a imagem preta e branca do tênis de mesa (`IMG_20261018_201959_962.webp`) na abertura. O arquivo, com marca Meta AI, foi copiado sem alteração e é descrito na interface como imagem estilizada fornecida pelo autor. Uma foto real de tênis de mesa continua no arquivo pessoal.
- Um teste ImageGen de restauração alterou detalhes e foi rejeitado. Nenhuma saída generativa desse teste foi incorporada ao repositório. Após autorização explícita, o tratamento foi feito com Pillow, preservando rostos, roupas e inscrições.
- Sem ampliação artificial, sem imagens de skate e sem alteração dos arquivos originais.

## Principais arquivos

`src/App.tsx`, `src/Portfolio.tsx`, `src/portfolio.css`, `src/motion-design.css`, `src/usePortfolioMotion.tsx`, `src/data/portfolio.json`, `public/media/`, `index.html`, `exploracao/index.html`, `neymar/index.html`, `vite.config.ts`, scripts de preparação/verificação e documentação.

## Ajuste do cursor VER

A escala CSS do círculo ampliava também o deslocamento do cursor. O círculo agora usa uma única translação ancorada no centro, sem escala adicional. O teste Playwright compara o centro do botão com a posição real do mouse em quatro áreas, antes e depois da rolagem; também confere a ocultação fora das imagens e com movimento reduzido.
