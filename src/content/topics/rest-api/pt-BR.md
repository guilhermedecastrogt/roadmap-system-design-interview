---
title: "API REST"
slug: rest-api
description: "APIs orientadas a recursos sobre HTTP — métodos e o que cada um promete, códigos de status, paginação, versionamento e os trade-offs que REST pede que você aceite."
category: blocos-fundamentais
order: 84
difficulty: intermediate
status: published
tags: [rest, api, http, idempotencia, paginacao, versionamento]
updatedAt: "2026-09-03"
beginnerSummary: >-
  REST é a forma mais comum de desenhar uma API sobre HTTP: modelar o domínio como recursos —
  substantivos como tweets e usuários —, dar um endereço a cada um e usar os métodos HTTP como
  verbos. GET lê, POST cria, PUT substitui, PATCH altera parte, DELETE remove. Cada método
  carrega uma promessa em que os clientes confiam: GET não muda nada (seguro), e GET, PUT e
  DELETE levam ao mesmo estado se repetidos (idempotentes), que é o que torna sobrevivível uma
  retentativa depois de timeout. O código de status diz de quem foi a culpa: 2xx deu certo, 4xx
  a requisição estava errada, 5xx o servidor quebrou. Em volta desse núcleo ficam os detalhes
  chatos que decidem se a API ainda é agradável um ano depois: paginação, filtro,
  versionamento, autenticação e limites de taxa. REST é um estilo, não um protocolo — nada
  garante consistência além do seu time.
glossary:
  - term: REST
    definition: "Um estilo arquitetural para aplicações em rede: recursos com endereços, uma interface uniforme (métodos HTTP) e requisições sem estado. Não é protocolo nem especificação."
  - term: Recurso
    definition: "Um substantivo do domínio que a API expõe — um tweet, um usuário, uma relação de seguir. Endpoints são endereços de recursos, não nomes de funções."
  - term: Endpoint
    definition: "Um caminho que a API atende, como /v1/tweets/{id}. Método mais caminho identificam uma operação."
  - term: Método seguro
    definition: "Método que não muda nada no servidor. GET e HEAD são seguros: qualquer quantidade de chamadas deixa o sistema intacto."
  - term: Método idempotente
    definition: "Método em que repetir a mesma chamada leva ao mesmo estado final. GET, PUT e DELETE são; POST e um PATCH típico não são."
  - term: Chave de idempotência
    definition: "Um id gerado pelo cliente e enviado junto com uma escrita para o servidor reconhecer uma retentativa e devolver o primeiro resultado em vez de refazer o trabalho."
  - term: Ausência de estado (statelessness)
    definition: "Cada requisição carrega tudo que é necessário para ser atendida; o servidor não guarda sessão entre chamadas. É isso que permite qualquer instância responder qualquer requisição."
  - term: Paginação por offset
    definition: "Paginar com page e limit. Simples e permite pular para qualquer página, mas desloca quando itens são inseridos e fica cara no fundo da lista."
  - term: Paginação por cursor
    definition: "Paginar com um ponteiro opaco para o último item lido. Estável com inserções e barata em qualquer profundidade, mas sem pular para uma página arbitrária."
  - term: Filtro
    definition: "Reduzir uma coleção com parâmetros de query, por exemplo ?authorId=u_42. Filtros vão na query string, não em um endpoint novo por combinação."
  - term: Versionamento
    definition: "Oferecer um contrato novo sem quebrar o antigo — no caminho (/v2), em um cabeçalho ou em um parâmetro de query."
  - term: Rate limiting
    definition: "Limitar chamadas por cliente por janela; o excedente é recusado com 429 e, idealmente, um cabeçalho Retry-After."
  - term: 401 vs 403
    definition: "401 significa que a API não sabe quem você é; 403 significa que ela sabe e mesmo assim recusa. Fazer login resolve o primeiro, não o segundo."
references:
  - label: "Roy Fielding — Architectural Styles (capítulo 5, REST)"
    url: https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm
  - label: "MDN — Métodos de requisição HTTP"
    url: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Methods
  - label: "Microsoft — Design de APIs web RESTful"
    url: https://learn.microsoft.com/pt-br/azure/architecture/best-practices/api-design
  - label: "Google — Guia de design de APIs"
    url: https://cloud.google.com/apis/design
  - label: "Stripe — Requisições idempotentes"
    url: https://docs.stripe.com/api/idempotent_requests
---

> Aula 2 da trilha de APIs — comece por **[O que é uma API?](/pt-BR/topics/what-is-an-api)** se
> ainda não passou por lá. Use o playground acima para enviar chamadas e forçar cada falha:
> repare que cada código de status é produzido em uma **profundidade diferente do sistema**.
> Depois leia o mapa de recursos e monte uma URL paginada.

## O que é REST

REST modela o sistema como **recursos** — os substantivos do domínio —, cada um com um
endereço, todos manipulados pelo mesmo conjunto pequeno de métodos HTTP. `POST /v1/tweets` cria
um tweet; `GET /v1/tweets/t_901` lê um; `DELETE` remove.

Duas propriedades fazem a maior parte do trabalho:

- **Interface uniforme.** Qualquer pessoa que conheça HTTP já sabe chamar a sua API. Essa
  familiaridade é o motivo de REST seguir como padrão para APIs públicas.
- **Requisições sem estado.** Toda chamada carrega tudo que é necessário, então qualquer
  instância pode responder qualquer requisição. É isso que torna trivial escalar horizontalmente
  e balancear carga.

REST é um **estilo arquitetural, não um protocolo**. Não existe compilador verificando se seus
endpoints são consistentes — e é exatamente por isso que toda API grande publica um guia de
design.

## Recursos e endpoints

Modele substantivos, não funções. `POST /v1/users/u_42/follow` está ótimo — age sobre um
recurso de relacionamento. `POST /v1/executarAcaoDeSeguir` é uma chamada RPC fantasiada de REST.

```
GET    /v1/tweets              uma página de tweets
GET    /v1/tweets/{id}         um tweet
POST   /v1/tweets              criar um tweet
PATCH  /v1/tweets/{id}         alterar alguns campos
DELETE /v1/tweets/{id}         remover
GET    /v1/users/{id}/tweets   os tweets desse usuário
```

Aninhe só para expressar posse, e pare cedo:
`/v1/users/{id}/tweets/{tweetId}/replies/{replyId}` é um caminho que ninguém quer rotear,
cachear ou depurar.

## O que cada método promete

*(O mapa de recursos acima marca essas duas colunas por endpoint.)*

- **Seguro** — a chamada não muda nada. `GET` é seguro: um crawler pode bater mil vezes.
- **Idempotente** — repetir a chamada leva ao mesmo estado final. `GET`, `PUT` e `DELETE` são;
  `POST` não é, e um `PATCH` que diz "incrementar likes" também não.

Isso não é curiosidade. Quando um cliente sofre timeout, ele não sabe se a requisição chegou, e
as únicas opções são "repetir" ou "desistir". Idempotência é o que torna repetir seguro.

**PUT e PATCH não são a mesma coisa.** `PUT` substitui o recurso pelo que você mandou — campos
omitidos somem, e isso é o contrato, não um bug. `PATCH` aplica uma alteração parcial. Para
escritas que precisam sobreviver a retentativas, use uma **chave de idempotência**: o cliente
manda um id único, o servidor guarda, e uma repetição devolve o primeiro resultado em vez de
criar uma segunda cobrança.

## Códigos de status e de onde vêm as falhas

O código de status é a API dizendo de quem foi a culpa — e, de quebra, **até onde a requisição
chegou**:

| Código | Significado | Produzido por |
|---|---|---|
| `200` / `201` / `204` | Deu certo (leu / criou / nada a dizer) | O serviço, depois de fazer o trabalho |
| `400` | A requisição está malformada | Validação, antes da lógica de negócio |
| `401` | Não sabemos quem você é | A borda, antes de qualquer coisa rodar |
| `403` | Sabemos quem você é, e não | Autorização, dentro do serviço |
| `404` | O endpoint existe, o recurso não | Depois de uma busca no armazenamento |
| `429` | Chamadas demais | Rate limiting na borda |
| `500` | Nós quebramos | Em qualquer lugar atrás do contrato |

A regra para o cliente: **`4xx` significa não repetir sem mudar; `5xx` (e `429`) significam
repetir depois, com backoff.** Um cliente que só verifica "voltou JSON?" trata um `403` como
dado e faz a coisa errada em silêncio.

## Paginação, filtro e versionamento

*(Monte a URL no playground de coleções acima.)*

- **Nunca devolva uma coleção sem limite.** Sempre pagine e sempre limite o tamanho da página
  no servidor. Alguém vai tentar `?limit=10000`.
- **Paginação por offset** (`?page=3&limit=20`) é fácil e permite pular para qualquer lugar,
  mas os itens se deslocam quando novos entram — o leitor vê duplicatas e buracos — e páginas
  profundas ficam caras.
- **Paginação por cursor** (`?cursor=t_899`) devolve um ponteiro opaco para onde você parou:
  estável com inserções, barata em qualquer profundidade, mas sem pular para a página 40. Feeds
  usam cursor.
- **Filtro e ordenação vão na query string** (`?authorId=u_42&sort=-createdAt`), não em um
  endpoint novo por combinação.
- **Versionamento** oferece um contrato novo sem quebrar o antigo: no caminho (`/v2/tweets`,
  óbvio e fácil de rotear), num cabeçalho (`Accept: application/vnd.tweets.v2+json`, mantém as
  URLs estáveis mas fica invisível no navegador) ou num parâmetro de query (rápido, mas mistura
  escolha de contrato com filtro).

A versão mais barata é a que você nunca publica: **adicione campos em vez de renomear**, e nunca
reaproveite o significado de um campo existente.

## Segurança e cotas

- **Autentique na borda** — um token por requisição, validado antes da lógica de negócio.
- **Autorize no serviço** — "esse usuário pode alterar esse tweet" é regra de negócio e precisa
  do recurso em mãos.
- **Valide tudo** — tipos, tamanhos, faixas e o próprio tamanho do corpo.
- **Limite por cliente**, devolva `429` com `Retry-After` e publique os limites. Veja
  **[Rate limiting](/pt-BR/topics/rate-limiting-throttling)**.
- **Nunca vaze detalhes internos no erro** — um id de rastreio ajuda; uma stack trace é um
  presente para o atacante.

## Trade-offs

- **Um formato para todo cliente.** O endpoint devolve o que o servidor decidiu, então um card
  mobile baixa campos que não vai renderizar — *overfetching*.
- **Várias idas e voltas para telas ricas.** Uma lista mais uma chamada por autor é
  *underfetching*, e em rede móvel isso se sente. (É exatamente a dor que
  **[GraphQL](/pt-BR/topics/graphql)** ataca — e um endpoint feito sob medida para aquela tela
  resolve em REST também.)
- **Versionamento exige disciplina.** Depois de publicado, um contrato é um compromisso.
- **Consistência é manual.** Nada impede dois times de inventarem dois formatos de erro.
  Escreva um guia, revise e gere uma especificação OpenAPI.

Nada disso torna REST ultrapassado. Para APIs públicas, CRUD de recursos e leituras cacheáveis,
segue sendo o padrão sensato — ferramental maduro, depuração fácil e cache HTTP funcionando de
graça.

## Relevância em entrevista

- **Diga "estilo arquitetural", não "protocolo".** Depois desenhe os recursos em voz alta:
  substantivos, endereços, métodos.
- **Traga idempotência sem ser perguntado** quando o design envolve pagamentos, pedidos ou
  qualquer coisa que se repita. Cite chave de idempotência para `POST`.
- **Mapeie falhas para camadas** — 401 na borda, 403 no serviço, 404 depois do armazenamento,
  429 no limitador. Mostra que você pensa em onde o código roda.
- **Sempre pagine** e diga qual estratégia: cursor para feeds, offset para tabelas
  administrativas.
- **Compare com justiça.** "REST para a API pública; GraphQL onde muitas telas precisam de
  formatos diferentes" é melhor do que eleger um vencedor.

## Notas de aula

- Recursos são substantivos; métodos são verbos; códigos de status são o veredito.
- **Seguro** = não muda nada. **Idempotente** = repetir é inofensivo. Retentativas dependem dos
  dois.
- `PUT` substitui, `PATCH` altera parte, `POST` cria — e `POST` precisa de chave de idempotência
  para ser seguro de repetir.
- Pagine sempre; cursor para feeds, offset para tabelas com salto de página.
- Versione adicionando, não renomeando. O contrato sobrevive ao código.
