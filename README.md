# Neymar Júnior — A arte de ser único

Experiência visual de fã, não oficial, inspirada na composição editorial de https://rafaelrossetti.com.br/. O usuário navega pelo scroll nativo e abre imagens com clique direto. Não há botões de navegação.

## Executar

Requer Node.js 20.19+. Execute npm ci e npm run dev. Tanto / quanto /exploracao/ exibem a experiência do Neymar; a segunda rota foi preservada para os links já existentes.

## Interação

O scroll percorre a capa, o manifesto e a galeria fotográfica horizontal fixada na tela. As fotos respondem ao cursor, revelam cor e abrem uma leitura ampliada com créditos. A foto de capa também é interativa. Clique na foto ampliada ou fora do conteúdo para voltar; Escape funciona pelo teclado.

## Estrutura

- src/NeymarExperience.tsx: página, scroll, galeria e leitura ampliada.
- src/neymar.css: composição responsiva, tipografia, movimento e estados de interação.
- src/data/neymar.json: conteúdo e metadados/créditos das fotografias.
- design-system.neymar.json: cores integradas ao componente, tipografia e interação.
- public/images/neymar/: fotos licenciadas, recorte e CREDITS.md.
- src/ObsidianApp.tsx e componentes anteriores: implementação OBSIDIAN preservada como fonte, sem ser carregada pelo site atual.

## Build e publicação

npm run build valida TypeScript e gera dist. npm run preview serve a produção. O workflow GitHub Pages mantém o prefixo /Site.rosseti/ e publica após push autorizado a main. Esta alteração não foi publicada automaticamente.

## Imagens

Créditos e licenças aparecem em cada foto aberta e em public/images/neymar/CREDITS.md. A capa usa um recorte assistido por IA do retrato de Lucho Vidales. O projeto não indica vínculo oficial com Neymar, clubes ou fotógrafos.
