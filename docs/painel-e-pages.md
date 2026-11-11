# Painel e GitHub Pages

[Voltar ao README](../README.md)

## Editar a interface local

`painel.html` concentra HTML, CSS e JavaScript. O servidor lê o arquivo ao atender `GET /`, então uma alteração no arquivo servido aparece após recarregar a página no Chrome. Abra [http://127.0.0.1:8765/](http://127.0.0.1:8765/) para validar as chamadas à API.

| Trecho | O que editar |
| --- | --- |
| `<style>` | Tipografia, cores, espaçamento e comportamento em telas estreitas |
| Cabeçalho, filtros e diálogos no HTML | Textos, controles e estrutura |
| Funções de renderização no JavaScript | Cartões, filtros, ordenação e paginação |
| Consulta de histórico | Exibição de cada combinação de produto, SKU e vendedor |
| Modelo e ação do WhatsApp | Texto da mensagem e link para abrir o aplicativo |

O servidor substitui `__TOKEN__` ao servir o HTML. Preserve o marcador para que o botão de coleta e as preferências continuem funcionando localmente. Teste busca, histórico e filtro por tamanho no endereço do servidor depois de editar.

## Vitrine agrupada

A vitrine do GitHub Pages está em `index.html`. Ela reúne as ofertas em **um cartão por produto**. O cartão destaca o menor preço elegível da rodada mais recente e abre tamanhos, cores, disponibilidade, preços e ações por variação. Ao escolher tamanho M, o preço mostrado no cartão vem de uma oferta M. A seção **Destaques** mostra o maior desconto anunciado a partir de 30% e uma oferta que igualou ou bateu seu mínimo histórico. Cada destaque abre a variação que gerou o preço exibido. A série completa de observações pode ser consultada no painel local.

O visual usa preto, branco e cinza, cartões arredondados, abas em pílula e fotos da loja. O agrupamento por categoria usa os caminhos disponíveis no catálogo e complementa a classificação pelo nome quando necessário. Favoritos da vitrine são salvos no navegador. [Referência visual da loja](https://store.botafogo.com.br/)

Ofertas **Mizuno 26/27 com desconto anunciado de 50% ou mais** ocupam o primeiro destaque e aparecem primeiro na ordenação por Destaques. O filtro **Mizuno 26/27 · 50% ou mais** reúne todas as variações que atendem ao critério de preço e estoque. A vitrine reconhece a marca como Mizuno ou Mzn e identifica a temporada no nome, endereço ou categorias do produto.

Em **Ordenar → Maior desconto**, a grade segue o percentual de desconto anunciado, do maior para o menor. O cartão mostra o preço e o tamanho da oferta que determina sua posição. A ordenação usa as variações que passam pelos filtros e considera descontos de ofertas confirmadas em estoque.

## Sincronização com GitHub Pages

O [site público](https://rodrigoaraujoufrj-bit.github.io/botafogo_store/) carrega `catalogo.json`. Quando o HTML é aberto como arquivo local, ele usa o endereço público do catálogo. Se a primeira fonte falhar, tenta o arquivo diretamente no GitHub. O catálogo tem a versão do formato, a rodada, o estado de cobertura e as ofertas por produto, SKU e vendedor. O campo `previous_historical_low` contém o menor preço positivo anterior observado em estoque para a mesma oferta. Ele é nulo na primeira leitura válida. [Como funciona o GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

1. A coleta do Radar grava as observações no PostgreSQL. Rodadas completas ou parciais com ofertas disparam a exportação para `main` pela chave SSH da conta Windows.
2. O exportador muda somente `catalogo.json` e preserva o restante da branch. A hora exibida no site é a da coleta. A atualização do Pages pode levar alguns minutos depois do commit.
3. Para reenviar a última rodada com ofertas, execute `pwsh -NoProfile -File .\Iniciar.ps1 -PublishOnly -NoBrowser` na pasta local. Consulte `publicacao.log` para ver o número da rodada, o commit ou a causa de falha.
4. Quando a máquina está desligada ou a coleta falha, a página continua exibindo o último catálogo publicado. A tarefa automática retoma a exportação na próxima rodada que grave ofertas.

O repositório é público. A exportação inclui dados das ofertas e métricas derivadas. Credenciais, preferências locais, mensagens personalizadas e dumps do PostgreSQL ficam fora do arquivo público.
