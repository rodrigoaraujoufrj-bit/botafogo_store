# Instruções para agentes que retomam o Radar Botafogo

Comece pelo [contexto do projeto](docs/contexto-do-projeto.md). Ele registra o objetivo, a experiência esperada, as regras de preços e a situação de cada parte. Use o [README](README.md) para localizar os guias técnicos.

- Consulte o estado real do código antes de editar. O `index.html` deste repositório serve a vitrine pública. A coleta e o painel administrativo rodam na instalação local.
- Para alterar a lista, mantenha o agrupamento por produto na interface e a comparação de preços por produto, SKU e vendedor. Confira o preço do cartão com filtro de tamanho e as variações que aparecem ao abri-lo.
- Para alterar a coleta ou o histórico, use as tabelas e as rotas descritas no [guia do banco](docs/banco-e-coleta.md). Valide o efeito em rodadas parciais e em ofertas indisponíveis.
- Trate o catálogo publicado no GitHub Pages como dados públicos. Para alterações na coleta e no PostgreSQL, use a instalação local.
- Atualize os guias afetados quando mudar um comportamento, uma configuração ou o estado de implantação.
