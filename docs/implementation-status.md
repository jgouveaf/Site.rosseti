# Estado da implementação — V2

## Concluído

- Experience com seis cenas, narrativa editorial e câmera contínua vinculada ao scroll.
- Exploração em página independente com veículo, aceleração, frenagem, colisões, câmera de perseguição, controles de toque e quatro pontos de interesse.
- Física carregada somente na exploração.
- Terreno 3D procedural, rochas instanciadas, monólito detalhado, observatório, arquivo rebaixado, núcleo animado, ruínas, poeira e iluminação variável.
- Materiais PBR com microtexturas procedurais de normal e rugosidade.
- Navegação por teclado/toque, fallback sem WebGL, preferência por movimento reduzido e áudio iniciado apenas após interação.
- Design system JSON integrado ao CSS e a materiais; build TypeScript e Vite com duas entradas.

## Limites atuais

- Os objetos são procedurais e estilizados; ainda não há modelagem autoral de alta densidade, texturas escaneadas, HDR environment ou pós-processamento de bloom. A proximidade artística com Igloo depende de revisão visual humana.
- A física do veículo usa um corpo rígido simplificado; as rodas não têm suspensão física independente. O terreno visual tem relevo mais detalhado que o colisor plano.
- A cena do arquivo é um átrio rebaixado, não um interior fechado com arquitetura completa.
- Metas de 60 FPS em desktop e 30 FPS em celular não foram medidas em hardware real.
- A checagem de interface em navegador e console ainda não foi concluída: o controle de computador foi encerrado por não identificar a URL ativa com segurança. Build e rotas HTTP locais foram verificados separadamente.
