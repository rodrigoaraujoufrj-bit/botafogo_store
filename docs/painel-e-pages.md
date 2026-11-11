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

A revisão visual foi preparada como um HTML separado para a instalação local. O desenho reúne as ofertas em **um cartão por produto**. O cartão mostra o menor preço elegível para os filtros atuais e abre tamanhos, cores, disponibilidade, preços e ações por variação. Assim, ao escolher tamanho M, o preço mostrado no cartão vem de uma oferta M. O histórico continua identificado por produto, SKU e vendedor.

O separador alvinegro e as abas de categorias se inspiram na Botafogo Store. O agrupamento por categoria usa os caminhos disponíveis no catálogo e complementa a classificação pelo nome quando necessário. [Referência visual da loja](https://store.botafogo.com.br/)

## Proposta para GitHub Pages

GitHub Pages hospeda HTML, CSS e JavaScript estáticos. Uma versão pública poderia servir **um HTML editável e um arquivo de dados exportado**, como `catalogo.json`, atualizado por um processo de coleta. O banco e o coletor continuam do lado do produtor dos dados. [Como funciona o GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

1. Gerar `catalogo.json` com os produtos, variações e ofertas selecionadas, incluindo a hora da observação, a referência e o estado de cobertura. Para disponibilizar histórico público, exportar os dados necessários em um arquivo separado ou por produto.
2. Adaptar o JavaScript para ler o arquivo por caminho relativo. Um site de projeto geralmente fica sob `/botafogo_store/`. Os caminhos relativos funcionam nesse endereço e numa prévia local.
3. Publicar os arquivos gerados e indicar a última atualização no painel. Uma coleta local pode enviar novas exportações quando a máquina estiver ligada. Para atualizar com o computador desligado, o coletor ou o processo de exportação precisa rodar em outro ambiente.
4. Definir se a versão pública é somente de consulta. Metas e favoritos compartilhados, coleta sob demanda e histórico consultado ao vivo exigem uma API própria. Para favoritos individuais, o navegador pode guardar preferências localmente.

O repositório é público. Publique somente os campos de catálogo e histórico escolhidos para exposição. Credenciais, tokens, configurações pessoais e dumps do PostgreSQL ficam fora da exportação.
