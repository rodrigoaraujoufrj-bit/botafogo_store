# Contexto do Radar Botafogo Store

[Voltar ao README](../README.md)

## Por que o projeto existe

O Radar é um monitor pessoal da [loja oficial do Botafogo](https://store.botafogo.com.br/). A ideia é acompanhar preços ao longo do tempo e descobrir **quando um produto que já estava em promoção fica ainda mais barato**. O desconto informado pela loja responde quanto a oferta está abaixo da referência atual. O histórico do Radar responde quanto o preço de venda caiu desde a observação anterior. Essas duas informações aparecem separadamente para ajudar a decidir se vale a pena comprar agora.

Por exemplo, uma camisa tinha referência de R$ 399,99 e custava R$ 299,99. Na rodada seguinte, passou a custar R$ 179,99. A mensagem deve dizer que ela já estava em promoção e ficou **R$ 120,00 mais barata**, uma queda adicional de aproximadamente **40%** sobre o preço anterior. Se a referência atual continuar em R$ 399,99, o desconto anunciado é de aproximadamente **55%**. Se a loja mudar a referência, use o valor da rodada atual para o desconto anunciado e preserve o valor anterior no histórico.

## O que o usuário quer ver

- Uma vitrine alvinegra organizada, com separadores e categorias inspirados na loja. A lista mostra **um cartão por produto**, com foto e preço inicial entre as ofertas elegíveis. Ao abrir o cartão, aparecem os tamanhos, as cores, a disponibilidade e os preços de cada variação. Se o filtro for tamanho M, o cartão usa o preço de uma oferta M.
- No detalhe da oferta, preço atual, referência, preço anterior, economia adicional, menor preço válido em 30 dias e histórico. Busca, filtros e o botão de verificação devem funcionar no computador e em tela estreita.
- Metas, favoritos e compartilhamento por WhatsApp por variação. O botão abre a mensagem pronta com produto, tamanho, preços, economia e link. O usuário escolhe o contato e confirma o envio.

## Regras de negócio que sustentam a vitrine

- Compare preços por **produto, SKU e vendedor**. Agrupar por produto na interface é uma decisão de apresentação. Cada oferta conserva sua identidade no banco.
- Uma primeira leitura inicia o histórico. Uma mudança apenas no preço de referência ou um preço de venda igual não dispara alerta. Uma reposição é um evento próprio. Preços zerados, ofertas inválidas e indisponibilidade não geram uma queda real.
- Registre preços e referências em centavos e acrescente uma observação por oferta e por rodada. Mantenha a última leitura conhecida quando a coleta falhar ou omitir uma oferta, indicando que ela ficou sem confirmação. Estoque zero recebido explicitamente indica indisponibilidade.
- A coleta deve rodar a cada duas horas com o navegador fechado. A coleta manual e a agendada compartilham um bloqueio para evitar concorrência. Em caso de HTTP 500 persistente, divida o intervalo e registre a cobertura da rodada. Frete, cupons, benefícios exclusivos e personalizações só entram nos cálculos se forem coletados e validados explicitamente.

## Estado da implementação

| Parte | Situação |
| --- | --- |
| Coletor e banco | Implementados na instalação local. Python consulta o catálogo VTEX e grava no schema `botafogo` do PostgreSQL. As tabelas `observations` e `runs` sustentam a lista e o histórico. |
| Agendamento | Tarefas do Windows foram registradas e uma rodada automática foi confirmada durante a instalação. Para checar a situação atual, consulte o Agendador e `botafogo.runs`. |
| Painel em uso | O servidor local serve `painel.html` em `http://127.0.0.1:8765/`. A versão instalada foi validada com a API local. |
| Vitrine com cartões agrupados | Revisão de HTML preparada à parte. Agrupamento, seleção de tamanho e abertura de variações foram testados com dados simulados. A instalação e a revisão visual no navegador ainda não foram confirmadas. |
| GitHub | Este repositório contém a documentação. Os scripts, o HTML e o banco ficam na instalação local. |
| Hospedagem | A decisão de operação é acesso local. GitHub Pages foi discutido como uma possível vitrine estática alimentada por exportação do catálogo. Vercel também foi avaliada. |

## Onde continuar

- Para mexer na aparência ou na navegação, comece pelo [guia do painel](painel-e-pages.md).
- Para mexer em preços, estoque, alertas, histórico ou exportação, comece pelo [guia do banco e da coleta](banco-e-coleta.md).
- Para iniciar o serviço ou verificar uma rodada, use o [guia de operação no Windows](operacao-local.md).

Ao retomar o projeto em outra IA, indique a tarefa que você quer fazer e aponte para este arquivo. Para uma alteração de código, forneça também acesso à pasta local ou uma cópia dos arquivos envolvidos. A documentação descreve como eles funcionam e ajuda a identificar os arquivos certos.
