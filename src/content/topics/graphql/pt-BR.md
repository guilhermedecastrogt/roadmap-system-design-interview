---
title: "GraphQL"
slug: graphql
description: "Uma linguagem de query para APIs em que o cliente pede exatamente os campos de que precisa — o schema, os resolvers, a armadilha do N+1 e o orçamento que um endpoint flexível exige."
category: blocos-fundamentais
order: 88
difficulty: intermediate
status: published
tags: [graphql, api, schema, resolvers, overfetching, performance]
updatedAt: "2026-09-03"
beginnerSummary: >-
  Com GraphQL o cliente envia uma query descrevendo o formato que quer, e o servidor responde
  nesse formato. Em vez de vários endpoints devolvendo cada um um objeto fixo, existe
  normalmente um endpoint e um schema tipado descrevendo tudo que pode ser pedido. Um card de
  timeline que precisa de quatro campos pede quatro campos — e ainda pode trazer dados
  aninhados, como o autor de cada tweet, na mesma ida e volta. Isso resolve dois incômodos do
  REST: baixar campos que você nunca renderiza (overfetching) e fazer chamadas extras para
  completar uma tela (underfetching). O custo, porém, não some — ele muda de lugar e vai para o
  servidor. Todo campo é sustentado por uma função resolver, então uma implementação ingênua
  dispara uma consulta por item (o problema N+1), a autorização precisa ser feita campo a campo,
  cache dá mais trabalho que em REST, e um endpoint que aceita qualquer formato precisa de
  orçamento: limite de profundidade, análise de custo e teto de paginação.
glossary:
  - term: GraphQL
    definition: "Uma linguagem de query para APIs e um runtime que executa essas queries contra os seus dados, em que o cliente especifica os campos que quer."
  - term: Schema
    definition: "O contrato tipado: todos os tipos, campos e operações que a API oferece. É introspectável, então clientes e ferramentas o descobrem sozinhos."
  - term: Query
    definition: "Uma operação de leitura. Segura por convenção — o equivalente a um GET no GraphQL."
  - term: Mutation
    definition: "Uma operação de escrita que altera dados e devolve o novo estado na mesma ida e volta."
  - term: Subscription
    definition: "Um fluxo contínuo de atualizações, normalmente sobre WebSockets, para contadores ao vivo e notificações."
  - term: Resolver
    definition: "A função que produz o valor de um campo. Todo campo do schema tem uma, e a performance dela é a performance da API."
  - term: Overfetching
    definition: "Baixar campos que a tela nunca renderiza, porque o endpoint devolve um formato fixo."
  - term: Underfetching
    definition: "Uma resposta não basta, então o cliente faz chamadas extras para completar a tela."
  - term: Problema N+1
    definition: "Uma consulta para a lista mais uma consulta por item para resolver um campo aninhado. Loaders com batching colapsam isso em uma busca por requisição."
  - term: Limite de profundidade
    definition: "Recusar queries aninhadas além de um número fixo de níveis — a defesa mais barata contra formatos patológicos."
  - term: Análise de custo
    definition: "Atribuir pesos aos campos, estimar o custo da query antes de executar e recusar o que passar do orçamento."
  - term: Queries persistidas
    definition: "Aceitar somente as queries que você publicou, referenciadas por hash, de modo que query arbitrária deixa de ser possível em produção."
  - term: Introspecção
    definition: "A capacidade nativa de consultar o próprio schema. Ótima para ferramentas; comumente desligada em produção para APIs não públicas."
references:
  - label: "GraphQL — Introdução ao GraphQL"
    url: https://graphql.org/learn/
  - label: "GraphQL — Boas práticas"
    url: https://graphql.org/learn/best-practices/
  - label: "GraphQL — Servindo sobre HTTP"
    url: https://graphql.org/learn/serving-over-http/
  - label: "Apollo — Controle de demanda e rate limiting"
    url: https://www.apollographql.com/docs/router/executing-operations/demand-control
  - label: "GraphQL Foundation — DataLoader"
    url: https://github.com/graphql/dataloader
---

> Aula 4 da trilha de APIs — aquela em que o cliente escreve o formato. Monte uma query campo a
> campo acima e veja a resposta encolher junto, compare a mesma tela buscada de três formas e
> depois empurre os controles de complexidade até o servidor recusar a sua query.

## O que é GraphQL

GraphQL é uma **linguagem de query para APIs mais um runtime que executa essas queries**. O
servidor publica um **schema tipado** com tudo que pode ser pedido; o cliente envia uma query
nomeando os campos que quer; a resposta volta exatamente nesse formato.

```graphql
query Timeline {
  timeline(first: 10) {
    id
    text
    likeCount
    author { name avatarUrl }
  }
}
```

Quatro consequências práticas:

- **Um endpoint é a norma** (`POST /graphql`), então é o *formato*, não a URL, que seleciona o
  que você recebe.
- **O cliente controla o formato da resposta** — nem mais nem menos do que pediu.
- **Dados aninhados vêm na mesma ida e volta**, e é isso que faz telas ricas parecerem rápidas.
- **O schema é a documentação.** É introspectável, então editores, clientes e ferramentas o
  descobrem automaticamente.

## Schema, operações, resolvers

O schema declara tipos e seus campos; três tipos de operação os acionam:

- **Query** — leitura. `query { timeline(first: 10) { id text } }`
- **Mutation** — escrita, devolvendo o novo estado. `mutation { createTweet(text: "oi") { id } }`
- **Subscription** — um fluxo ao vivo de atualizações, normalmente sobre WebSockets.

Por trás de cada campo existe um **resolver**: uma função que o servidor executa para produzir o
valor daquele campo. É a parte que iniciantes subestimam, porque é onde moram as histórias de
performance e de segurança:

- `Query.timeline` busca uma página — o argumento `first` é a maior alavanca de custo que
  existe. Dê a ele um padrão e um máximo, ou algum cliente vai pedir 10.000.
- `Tweet.author` resolve o autor *de cada tweet*. Ingenuamente, dez tweets significam dez buscas
  de autor — o **problema N+1**. Agrupe por requisição com um loader no estilo DataLoader e vira
  uma busca só.
- `Tweet.likeCount` pode ler de outro armazenamento, e se um campo expõe dado privado, **o
  próprio resolver dele precisa checar permissão** — não existe URL para proteger.

## Overfetching, underfetching e pedir com precisão

*(Compare os três modos acima.)*

- **Overfetching em REST** — uma chamada, mas o endpoint devolve o recurso inteiro porque
  precisa atender todo mundo. Um card mobile renderiza quatro campos e baixa onze.
- **Underfetching em REST** — a lista dá `authorId`, não o autor, então o cliente dispara uma
  chamada por autor e espera a mais lenta.
- **GraphQL** — uma chamada, os tweets com seus autores e nada além.

O enquadramento honesto: **GraphQL não é automaticamente mais rápido.** Um endpoint REST feito
sob medida para aquela tela empataria. O que GraphQL compra não é velocidade bruta, e sim **não
precisar de um endpoint novo toda vez que a tela muda** — por isso ele brilha quando muitos
clientes diferentes precisam de formatos diferentes do mesmo grafo.

## Protegendo um endpoint que aceita qualquer formato

*(Mexa nos controles acima e veja uma query plausível ser recusada.)*

Um endpoint REST tem um custo sobre o qual você raciocina de antemão. Um endpoint GraphQL tem **o
custo que o cliente pedir**, e aninhamento multiplica: `first: 100` em três níveis de lista dá
um milhão de registros. Não precisa de má intenção.

As defesas padrão:

- **Limite de profundidade** — recuse queries aninhadas além de N níveis. Barato e pega os
  piores formatos.
- **Análise de custo** — pese os campos, estime antes de executar, recuse acima do orçamento.
  Recusar *antes* de tocar no banco é o ponto.
- **Teto de paginação** — todo argumento de lista ganha padrão e máximo.
- **Queries persistidas** — em produção, aceite apenas as queries que você publicou, por hash.
  Query arbitrária deixa de ser possível.
- **Timeouts e limites por resolver** — nada roda para sempre.
- **Desligue a introspecção** em produção para APIs não públicas.

## Cache é diferente, não impossível

REST ganha cache HTTP quase de graça: um `GET` com uma URL é uma chave de cache, e CDNs,
navegadores e proxies entendem isso. GraphQL normalmente faz POST em uma URL só, então essa
camada não se aplica de imediato. O que entra no lugar:

- **Caches normalizados no cliente**, chaveados por id de objeto (`__typename` + `id`).
- **Cache no servidor por resolver ou por fonte de dados**, mais batching por requisição.
- **Queries persistidas via GET**, que trazem de volta uma URL cacheável.

Não é mais difícil em princípio — só é trabalho deliberado em vez de carona grátis.

## Trade-offs

- **Flexibilidade vs complexidade no servidor** — schema, resolvers, batching, limites de custo
  e mais uma camada para operar.
- **Menos idas e voltas vs cache mais difícil** — você ganha um salto e perde o cache HTTP
  padrão.
- **Autorização por campo** — uma vantagem real de precisão, mas você precisa realmente fazê-la
  em todo resolver que lê dado sensível.
- **Semântica de erro** — uma resposta GraphQL pode ser `200 OK` com um array `errors` e dado
  parcial. O cliente precisa checar o corpo, não só o status.
- **O time precisa aprender** — design de schema, loaders e observabilidade por resolver em vez
  de por endpoint.

GraphQL não substitui REST. Um arranjo muito comum e muito sensato é REST para a API pública,
GraphQL para os apps próprios e **[webhooks](/pt-BR/topics/webhooks)** para avisar parceiros.
Veja como os três se relacionam em **[O que é uma API?](/pt-BR/topics/what-is-an-api)**.

## Relevância em entrevista

- **Defina com precisão** — "linguagem de query e runtime; o cliente especifica os campos;
  normalmente um endpoint sobre HTTP".
- **Nunca diga "mais rápido que REST".** Diga que reduz overfetching e idas e voltas *para
  alguns clientes*, e que a performance depende da implementação.
- **Levante o N+1 você mesmo** e cite a solução (loaders com batching). É a pergunta que vem
  depois.
- **Cite controle de custo** — limite de profundidade, análise de custo, queries persistidas. É
  o sinal de maturidade.
- **Diga onde mora a autorização** — por campo e por resolver, não por URL.
- **Seja explícito sobre cache** e como você o recuperaria.

## Notas de aula

- O **cliente envia o formato**; o schema é o contrato tipado; os resolvers fazem o trabalho.
- Resolve **overfetching** e **underfetching** — movendo o custo para o servidor.
- **N+1** é o modo de falha padrão; loaders com batching são a solução padrão.
- Um endpoint que aceita qualquer query precisa de **orçamento**: profundidade, custo, teto de
  paginação, queries persistidas.
- `200 OK` com array `errors` é normal — o cliente precisa ler o corpo.
