# Estado da implementação

## Implementado

- Seis capítulos narrativos com progressão por rolagem e câmera 3D.
- Cena 3D original: terreno, monólito, observatório animado, núcleo interativo, ruínas, iluminação e partículas.
- Menu de capítulos, indicador de progresso, entrada e saída da expedição.
- Veículo 3D controlável com aceleração, ré, frenagem, colisores, câmera de perseguição, reinício e pontos de interesse.
- Controles de toque, modo de movimento reduzido, opção de áudio após interação e fallback quando WebGL está indisponível.
- Layout responsivo e build TypeScript/Vite.

## Limitações conhecidas

- A experiência usa geometria procedural estilizada; não há modelos esculpidos, texturas de alta resolução ou trilha sonora produzida.
- A física é de um corpo rígido simples, sem suspensão por rodas individuais.
- A ativação do núcleo muda iluminação e material; não há uma sequência subterrânea separada.
- Metas de 60/30 FPS ainda precisam ser medidas em hardware desktop e móvel reais.
- A validação visual, de console e de controles no navegador deve ser feita antes de afirmar aprovação final da experiência.
