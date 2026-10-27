# OBSIDIAN — The Forgotten Civilization

Experiência web 3D original com narrativa por rolagem e uma expedição controlável. O mundo, o veículo, o monólito e as estruturas são geometria procedural criada neste projeto. Nenhum arquivo dos sites de referência é distribuído aqui.

## Executar

Requer Node.js 20.19+.

```bash
npm install
npm run dev
```

Abra o endereço local mostrado pelo Vite. O projeto usa módulos ES e WebAssembly para a física, portanto requer servidor local e não funciona por `file://`.

## Produção

```bash
npm run build
npm run preview
```

## Navegação

- Role a página para percorrer seis capítulos.
- Use MENU para saltar entre capítulos.
- Em Expedition, selecione ENTER EXPEDITION. Dirija com WASD ou setas, freie com espaço, reinicie com R e saia com Escape.
- Em dispositivos de toque, use os controles na parte inferior da tela.
- Ative o núcleo pelo botão no capítulo The Core ou clicando no objeto 3D.
- SOUND ON ativa um tom ambiente gerado no navegador; nenhum áudio inicia automaticamente.

## Estrutura

- `src/App.tsx`: narrativa, navegação, estados e interface.
- `src/experience/Experience.tsx`: cena, câmera, física, expedição e controles.
- `src/experience/World.tsx`: mundo 3D procedural.
- `src/styles.css`: layout, tipografia e adaptação móvel.
- `design-system.json`: tokens e diretrizes implementadas.

Mais detalhes e limites conhecidos estão em `docs/`.
