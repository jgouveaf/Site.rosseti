# Arquitetura

O projeto usa Vite, React, TypeScript e React Three Fiber. Uma única cena WebGL persiste atrás das seis seções da narrativa. O progresso de rolagem interpola posições de câmera entre enquadramentos predefinidos; a expedição troca para câmera de perseguição.

`World.tsx` separa terreno, monólito, observatório, núcleo, ruínas e partículas. As formas são procedurais e usam materiais PBR. O custo gráfico é limitado por `dpr` máximo de 1.7, partículas reduzidas no modo de movimento reduzido e uma cena compartilhada.

`Experience.tsx` controla câmera e veículo. Rapier oferece corpo dinâmico e colisores estáticos; o controle aplica velocidade e direção a cada quadro. O veículo colide com estruturas centrais. A experiência tem limites exploráveis e três pontos de interesse. A física permanece carregada durante a narrativa, embora o veículo fique oculto.

`App.tsx` gerencia navegação, som, ativação do núcleo, suporte a teclado/toque e fallback sem WebGL. `design-system.json` reúne a paleta, materiais, tipografia e tempos usados na interface.
