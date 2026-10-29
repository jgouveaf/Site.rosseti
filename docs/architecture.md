# Arquitetura atual

`App.tsx` seleciona três entradas: portfólio na raiz, Neymar em `/neymar/` e OBSIDIAN em `/exploracao/`. O código e as mídias das experiências anteriores foram preservados. As cenas Three.js só são importadas nas rotas correspondentes.

`portfolio.json` centraliza perfil, conquistas e metadados das mídias. `Portfolio.tsx` deriva filtros e anos dessa fonte; datas nulas ficam fora da cronologia. Registros fotográficos não são usados para deduzir resultados de competições.

A direção visual desta versão combina uma abertura cinematográfica escura com a imagem preta e branca escolhida por João, contraste em verde-lima e composição editorial. `motion-design.css` acrescenta esses estilos à base existente. `usePortfolioMotion.tsx` mede a posição das seções em um único `requestAnimationFrame` por frame, atualiza as variáveis CSS da abertura, da faixa horizontal e do indicador de progresso, e revela elementos com `IntersectionObserver`. A faixa não intercepta o wheel: a rolagem vertical continua nativa. No celular, a faixa vira uma área horizontal com scroll-snap. Com movimento reduzido, as posições ficam estáticas e a faixa continua navegável.

A galeria usa miniaturas WebP e abre versões maiores. Certificados usam WebP na página e PNG no modal. O vídeo original MP4 usa `controls`, `playsInline`, `preload=none` e um pôster FECART; sem autoplay. O navegador validou decodificação e reprodução.

Certificados se sobrepõem com CSS sticky, sem listeners de scroll ou bibliotecas novas. `prefers-reduced-motion` torna a pilha estática e interrompe animações decorativas. `dialog.showModal()` fornece isolamento modal e contenção de foco; React mantém o índice e restaura o foco ao fechar.

O tratamento de fotos é convencional: orientação EXIF, autocontraste conservador, contraste +2,5%, mediana leve apenas em fotos de infância, nitidez limitada, redução de tamanho e WebP. Não há alteração dos arquivos de origem nem ampliação artificial. Nomes dos originais são registrados em `docs/media-sources.json`; caminhos locais não entram no bundle.

A publicação continua sendo GitHub Pages com o prefixo existente `/Site.rosseti/`. Não há backend nem migração de hospedagem.
