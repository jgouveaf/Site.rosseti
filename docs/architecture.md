# Arquitetura V2

O projeto preserva React, TypeScript, Vite, React Three Fiber e Rapier. Há duas entradas HTML: `/` e `/exploracao/`. O componente de exploração é importado sob demanda; portanto o runtime de física não roda na narrativa.

Na Experience, a câmera percorre uma curva Catmull–Rom entre seis posições e seis alvos. A rolagem controla diretamente o parâmetro da curva. A luz solar e a iluminação ambiente variam com esse progresso. A geometria 3D permanece montada entre cenas, mantendo a continuidade espacial. Em movimento reduzido, a câmera responde mais diretamente e animações ornamentais são limitadas.

O mundo compartilhado inclui terreno com alturas e cores por vértice, rochas instanciadas, monólito com nervuras e bases, observatório em escala arquitetônica, arquivo rebaixado, núcleo emissivo, ruínas e poeira. Materiais PBR usam mapas procedurais de normal e rugosidade produzidos localmente. As texturas são descartadas quando o canvas desmonta.

Na Exploração, Rapier simula um corpo rígido dinâmico e colisores estáticos. Velocidade, direção, frenagem, reset, limites da área, câmera de perseguição e descobertas são controlados nessa página. Ao retornar, a posição de rolagem da narrativa é recuperada da sessão.

`design-system.json` fornece tokens importados por `src/design.ts`, que alimenta CSS Custom Properties e materiais 3D. O build Vite usa duas entradas e prefixo de assets para o GitHub Pages.
