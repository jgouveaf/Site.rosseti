# Entrega — portfólio João Gouvêa

## Implementado

- Entrada principal adaptada para João, mantendo React/Vite e as experiências existentes em rotas separadas.
- 28 fotografias selecionadas e tratadas convencionalmente, com 56 arquivos WebP (miniatura + versão ampliada).
- 13 representações digitais de certificados em pilha animada pela rolagem, ampliação e navegação por setas.
- 35 registros de conquistas, filtros por categoria e linha do tempo de 2017 a 2026.
- Sobre, projetos, esporte, galeria pessoal e vídeo FECART original (14,119 s, 1920×1080).
- Galeria com categoria Infância, datas não confirmadas explicitadas, textos alternativos e carregamento adiado.
- Modal com Escape, foco contido pelo diálogo nativo, retorno de foco e navegação circular.
- Layout móvel e suporte a movimento reduzido.

## Testes executados

`npm run build` passou (TypeScript + Vite). Há aviso de tamanho no chunk Three.js legado, carregado apenas sob demanda.

29 verificações Playwright/Chromium passaram sobre o build de produção: nome/título, 35 conquistas, seis filtros, identificação de representações, discrepância Poliedro, navegação circular, Escape/foco, 82 URLs de imagens, reprodução real do vídeo, sticky, ausência de overflow em 1440/768/390/320 px, menu móvel, movimento reduzido, filtro Infância, abertura pelo teclado, rotas Neymar/OBSIDIAN e ausência de erros JavaScript não tratados. Capturas desktop, mobile e certificados foram inspecionadas. Isso não substitui teste em celulares físicos.

## Fidelidade e pendências de conteúdo

- ZIP de certificados informa explicitamente que são recriações gráficas. As peças não são apresentadas como originais oficiais.
- Canguru: histórico informado é honra ao mérito 2022/2023, bronze 2024 e prata 2025. Material de referência menciona honra ao mérito 2024; explicação aparece no modal.
- Poliedro: histórico informado é bronze 2024 e prata 2025. Material de referência menciona prata 2024 e menção honrosa 2023; ambos são preservados e diferenciados.
- ACSI não recebe ano na conquista: o nome do arquivo contém 2022, mas o briefing pede confirmação antes de atribuir ano.
- Medalha Canguru com inscrição 2022 aparece como fotografia da medalha, sem transformar sua aparência em resultado informado.
- Não foram inventadas imagens oficiais para OBA 2022/2025, OBI, Games Levels 1–3 ou resultados sem documento identificado. Os registros textuais permanecem.
- 28 fotos foram selecionadas dos materiais; duplicatas, colagens redundantes e arquivos sem associação suficiente ficaram fora da galeria.
- `IMG_20261018_201959_962.webp`, com marca Meta AI, não foi usado; uma fotografia real de tênis de mesa foi escolhida.
- Um teste ImageGen de restauração alterou detalhes e foi rejeitado. Nenhuma saída generativa desse teste foi incorporada ao repositório. Após autorização explícita, o tratamento foi feito com Pillow, preservando rostos, roupas e inscrições.
- Sem ampliação artificial, sem imagens de skate e sem alteração dos arquivos originais.

## Principais arquivos

`src/App.tsx`, `src/Portfolio.tsx`, `src/portfolio.css`, `src/data/portfolio.json`, `public/media/`, `index.html`, `exploracao/index.html`, `neymar/index.html`, `vite.config.ts`, scripts de preparação/verificação e documentação.
