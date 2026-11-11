# Banco, coleta e API local

[Voltar ao README](../README.md)

## Estrutura do PostgreSQL

| Objeto | Papel | Chave ou vínculo |
| --- | --- | --- |
| `botafogo.runs` | Início, término, origem, situação, falhas e cobertura de uma coleta | `id` |
| `botafogo.observations` | Produto, variação, vendedor, preço, referência, disponibilidade, quantidade, imagens e categorias observados | `(run, product, sku, seller)`. `run` referencia `runs.id` |
| `botafogo.targets` | Meta em centavos, favorito e texto personalizado do WhatsApp | `(product, sku, seller)` |
| `botafogo.settings` | Configurações gerais, incluindo o modelo de mensagem do WhatsApp | `key` |
| `botafogo.vw_ultimas_ofertas` | Consulta pronta da última observação conhecida por variação e vendedor, com campos auxiliares de meta | View |

A lista de preços com datas usa `observations` e `runs`. `targets` e `settings` entram quando a interface precisa de personalização. A view é uma consulta armazenada. O agrupamento visual por produto pode ser feito no HTML ou numa exportação, usando `product` como chave e mantendo SKU e vendedor em cada variação.

A instalação usa `sql/01_schema_botafogo.sql` para inicializar o schema e `sql/03_cobertura_e_variacoes.sql` para acrescentar os campos de cobertura e os metadados das variações. A migração preserva as observações anteriores e sinaliza rodadas antigas como `legacy`. `sql/02_Consultas_DBeaver.sql` contém consultas de apoio.

Para consultar a lista sem as preferências de usuário, use as duas tabelas de origem. O exemplo seleciona a última observação de cada combinação antes de aplicar o filtro de disponibilidade. Isso evita recuperar uma oferta antiga em estoque quando uma leitura mais nova informou falta de estoque.

```sql
WITH ultimas AS (
    SELECT DISTINCT ON (product, sku, seller)
           run, product, sku, seller, name, size, color,
           image, link, price, list_price, available
    FROM botafogo.observations
    ORDER BY product, sku, seller, run DESC
)
SELECT u.product, u.sku, u.seller, u.name, u.size, u.color,
       u.image, u.link, u.price AS preco_centavos,
       u.list_price AS referencia_centavos, r.at AS observado_em
FROM ultimas u
JOIN botafogo.runs r ON r.id = u.run
WHERE u.available AND u.price > 0
ORDER BY u.name, u.price, u.sku, u.seller;
```

## Coleta

1. A coleta consulta intervalos de até 50 posições no endpoint `/api/catalog_system/pub/products/search` da Botafogo Store e usa o cabeçalho `resources` para estimar o total. A implementação percorre até 2.500 posições por rodada.
2. Falhas transitórias passam por até três tentativas por intervalo. Um HTTP 500 persistente divide o intervalo até isolar a posição que falhou. A rodada registra lacunas e divergências de contagem em `failures` e `coverage`.
3. A API fornece `productId`, `itemId` e `sellerId`. `commertialOffer.Price` e `ListPrice` viram centavos inteiros. `AvailableQuantity` informa estoque. Uma quantidade positiva com preço zero ou inválido é rejeitada. Uma quantidade explicitamente igual a zero registra indisponibilidade.
4. A chave por rodada e oferta impede duplicatas. O coletor grava as observações e o resultado final da rodada numa transação. Um bloqueio consultivo do PostgreSQL coordena coletas disparadas pelo painel e pelo Agendador.
5. Quando uma variação fica fora da coleta, o painel exibe sua última observação conhecida e pode sinalizar a falta de confirmação. Uma falha de coleta não é evidência de falta de estoque.

[Referência da API de busca VTEX](https://developers.vtex.com/docs/api-reference/search-api)

| Situação | Significado |
| --- | --- |
| `running` | Rodada iniciada |
| `complete` | Cobertura esperada sem falhas e com ofertas válidas |
| `partial` | Ofertas gravadas com lacunas, divergências ou itens inválidos |
| `failed` | Falha de execução ou ausência de ofertas válidas |
| `legacy` | Rodada anterior à migração |
| `interrupted` | Situação exibida pela API quando a rodada ainda aparece como iniciada e o processo já perdeu o bloqueio |

## Interpretação dos preços

- **Desconto anunciado** usa a diferença entre preço de referência e preço de venda da mesma observação.
- **Queda observada** compara o preço de venda atual com a última leitura válida e disponível da mesma variação e do mesmo vendedor. Preço igual e mudança isolada da referência não disparam alerta. Reposição aparece como um evento próprio.
- **Menor preço em 30 dias** considera observações com estoque e preço positivo. Frete, cupons, benefícios exclusivos e personalização ficam fora desse cálculo.

Por exemplo, com referência de R$ 399,99, a queda do preço de venda de R$ 299,99 para R$ 179,99 representa R$ 120,00 de economia adicional, cerca de 40% sobre o preço anterior. O desconto anunciado nesse exemplo é de cerca de 55% sobre a referência.

## Rotas locais

| Método e caminho | Resposta ou ação |
| --- | --- |
| `GET /` | Serve `painel.html` |
| `GET /api/status` | Estado da coleta, rodada e catálogo com métricas e preferências |
| `GET /api/history?product=…&sku=…&seller=…` | Histórico da oferta |
| `POST /api/scan` | Solicita coleta. Uma coleta em andamento retorna `409` |
| `POST /api/target` | Salva meta, favorito e mensagem por oferta |
| `POST /api/settings` | Salva o modelo geral do WhatsApp |

As rotas de escrita exigem `X-Monitor-Token`, fornecido pelo servidor ao HTML local. O mecanismo foi projetado para o servidor em loopback. Uma versão publicada que ofereça operações de escrita precisa de autenticação e autorização próprias.
