# Arquitetura atual

A entrada App renderiza NeymarExperience nas duas rotas Vite existentes. A implementação OBSIDIAN anterior foi preservada, mas não é importada pelo site ativo.

O percurso usa scroll nativo. A seção da galeria tem um contêiner sticky; um listener passivo, limitado por requestAnimationFrame, converte a posição de rolagem em translação horizontal das fotos. O cálculo usa as posições reais dos cartões e é refeito no resize.

Fotos são elementos focáveis com ativação por clique, Enter e espaço. A leitura ampliada usa um diálogo com foco contido, bloqueio da rolagem de fundo, retorno de foco e fechamento por Escape ou clique direto. Não há controles de caminhada nem runtime de física.

src/data/neymar.json centraliza o conteúdo e os créditos. design-system.neymar.json fornece as cores aplicadas como variáveis CSS no componente. Os arquivos de imagem são locais, com licenças registradas e retrato de capa derivado por recorte assistido por IA.

CSS responde ao tamanho da tela e à preferência por movimento reduzido. A publicação mantém as duas entradas e o base path já existente do GitHub Pages.
