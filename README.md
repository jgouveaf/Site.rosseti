# OBSIDIAN V2 — The Forgotten Civilization

Experiência cinematográfica 3D original sobre uma civilização alienígena perdida. A narrativa principal e a exploração com veículo são páginas independentes.

## Desenvolvimento

Requer Node.js 20.19+.

```bash
npm ci
npm run dev
```

Abra `/` para a narrativa e `/exploracao/` para o mundo explorável. Vite, módulos ES e Rapier exigem servidor local; `file://` não é suportado.

## Produção

```bash
npm run build
npm run preview
```

O build gera `dist/index.html` e `dist/exploracao/index.html`. O workflow `.github/workflows/pages.yml` publica ambas no GitHub Pages após um push autorizado ao branch `main`. O caminho base de produção é `/Site.rosseti/`.

## Uso

Na página Experience, role para acompanhar seis cenas e use o menu para navegar. Na última cena, escolha reiniciar ou entrar na exploração. A aba Exploração também está sempre disponível no menu superior.

Na exploração, dirija com WASD ou setas, freie com espaço, reinicie com R e volte à narrativa com Escape. No celular, há controles de toque. O retorno restaura a posição anterior da narrativa. O áudio ambiente só inicia depois de selecionar SOUND ON.

## Arquitetura

- `src/App.tsx`: rotas, narrativa, navegação e controles de interface.
- `src/experience/Experience.tsx`: câmera cinematográfica e canvas principal, sem física.
- `src/experience/Exploration.tsx`: mundo explorável com Rapier e veículo.
- `src/experience/World.tsx`: terreno, estruturas, luzes e partículas procedurais compartilhadas.
- `src/experience/surface.ts`: mapas de normal e rugosidade originais gerados em memória.
- `design-system.json` e `src/design.ts`: tokens centrais de cor, material e movimento.

Consulte `docs/implementation-status.md` para limites e validação restante.
