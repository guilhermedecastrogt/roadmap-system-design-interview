---
title: "gRPC"
slug: grpc
description: "Chamadas de procedimento remoto tipadas sobre HTTP/2 — um contrato .proto gerando os dois lados, quatro modos de streaming, payload binário, deadlines e onde isso encaixa em relação ao REST."
category: blocos-fundamentais
order: 89
difficulty: intermediate
status: published
tags: [grpc, protobuf, http2, rpc, microservicos, streaming]
updatedAt: "2026-09-04"
beginnerSummary: >-
  gRPC faz chamar outro serviço parecer chamar uma função. Você descreve o serviço num arquivo
  .proto — os métodos, as entradas, as saídas — e um compilador gera um stub de cliente e uma
  interface de servidor a partir dele, nas linguagens que você usa. A chamada então viaja sobre
  HTTP/2 como uma mensagem binária compacta em vez de texto JSON, numa conexão que fica aberta
  e carrega várias chamadas ao mesmo tempo. Essa conexão também libera streaming em quatro
  formatos: um para um, streaming do servidor, streaming do cliente e os dois lados ao mesmo
  tempo. O preço é que gRPC não foi feito para navegadores nem para estranhos: o payload é
  ilegível sem o .proto, todo build precisa de um passo de geração de código, e um navegador
  precisa de gRPC-Web ou de um gateway traduzindo HTTP/JSON para gRPC. A resposta comum não é
  "gRPC ou REST" — é REST na borda, gRPC entre os seus próprios serviços.
glossary:
  - term: gRPC
    definition: "Um framework de chamada de procedimento remoto: métodos declarados num contrato, clientes e servidores gerados, e chamadas trafegando sobre HTTP/2 com payload binário."
  - term: RPC (chamada de procedimento remoto)
    definition: "Chamar uma função que roda em outra máquina. O estilo nomeia uma ação (GetUser) onde REST nomeia um recurso (/users/42)."
  - term: Protocol Buffers (protobuf)
    definition: "A linguagem de definição de interface e o formato binário de serialização que o gRPC usa por padrão. Compacto, tipado e ilegível sem o schema."
  - term: Arquivo .proto
    definition: "O contrato: serviços, métodos, mensagens e um número para cada campo. É a fonte única a partir da qual os dois lados são gerados."
  - term: Número do campo
    definition: "O inteiro depois do `=` num campo de mensagem. É ele — não o nome do campo — que trafega no fio, e por isso números nunca podem ser reaproveitados."
  - term: Stub
    definition: "O objeto cliente gerado, cujos métodos parecem locais mas fazem uma chamada de rede por baixo."
  - term: Multiplexação HTTP/2
    definition: "Vários streams independentes dividindo uma conexão TCP, sem bloquear uns aos outros. É isso que permite ao gRPC manter uma conexão e transmitir nela."
  - term: Chamada unária
    definition: "Uma requisição, uma resposta — o formato requisição/resposta de sempre."
  - term: Streaming do servidor
    definition: "Uma requisição, muitas respostas no mesmo stream, ao longo do tempo."
  - term: Streaming do cliente
    definition: "Muitas requisições de quem chama, uma resposta no final."
  - term: Streaming bidirecional
    definition: "Os dois lados enviam mensagens de forma independente numa conexão, em qualquer ordem."
  - term: Deadline
    definition: "O momento a partir do qual quem chamou para de esperar. O gRPC propaga o deadline pela cadeia de chamadas, para uma árvore inteira desistir junto."
  - term: Código de status do gRPC
    definition: "Os códigos próprios do gRPC, não os do HTTP: OK (0), DEADLINE_EXCEEDED (4), NOT_FOUND (5), PERMISSION_DENIED (7), UNAVAILABLE (14), UNAUTHENTICATED (16)."
  - term: gRPC-Web
    definition: "Uma variante compatível com navegador que usa outro enquadramento e precisa de um proxy, porque navegadores não controlam frames HTTP/2 crus."
  - term: Interceptor
    definition: "Middleware para chamadas gRPC — auth, log, tracing, retentativa — aplicado no lado do cliente ou do servidor."
references:
  - label: "gRPC — Introdução ao gRPC"
    url: https://grpc.io/docs/what-is-grpc/introduction/
  - label: "gRPC — Conceitos centrais, arquitetura e ciclo de vida"
    url: https://grpc.io/docs/what-is-grpc/core-concepts/
  - label: "gRPC — Códigos de status e seu uso"
    url: https://grpc.io/docs/guides/status-codes/
  - label: "Protocol Buffers — Guia da linguagem (proto 3)"
    url: https://protobuf.dev/programming-guides/proto3/
  - label: "gRPC — Deadlines"
    url: https://grpc.io/docs/guides/deadlines/
  - label: "gRPC-Web — Tutorial básico"
    url: https://grpc.io/docs/platforms/web/basics/
---

> Aula 5 da trilha de APIs, e a que trata do tráfego que seus usuários nunca veem. Comece por
> **[O que é uma API?](/pt-BR/topics/what-is-an-api)** para o mapa compartilhado. Acima: compile
> um `.proto` nos dois lados e chame, rode os quatro modos de streaming, veja o payload encolher
> para binário e coloque o gRPC ao lado do **[REST](/pt-BR/topics/rest-api)** na borda.

## O que é gRPC

gRPC é um framework de **chamada de procedimento remoto**. Onde REST pede que você pense em
recursos (`GET /v1/users/42`), gRPC pede que você pense em **métodos** (`GetUser(id: 42)`) — e
depois gera o código que faz essa chamada parecer local:

```protobuf
service Users {
  rpc GetUser (GetUserRequest) returns (User);
}
```

```ts
const user = await client.getUser({ id: 42 });
```

Três escolhas técnicas o definem:

- **Um contrato num arquivo `.proto`**, compilado em um stub de cliente e uma interface de
  servidor, em cada linguagem que você suporta.
- **Protocol Buffers no fio** — tipado, binário, compacto.
- **HTTP/2 como transporte** — uma conexão longa carregando vários streams multiplexados, que é
  o que torna o streaming possível.

## O contrato vem primeiro

O arquivo `.proto` não é documentação que se desatualiza — é a **fonte a partir da qual os dois
lados são gerados**. Mude um campo e quem chama para de compilar; essa falha acontece na sua
máquina em vez das 3 da manhã em produção.

É essa a diferença real para um cliente REST escrito à mão. Em REST, o contrato vive na
documentação, num arquivo OpenAPI e num cliente que alguém escreveu — três coisas que podem
discordar. Em gRPC existe um artefato só, e discordância é erro de build.

O custo é um **passo de geração de código** em todo build, para cada linguagem, mais a
disciplina que vem junto: números de campo são permanentes, e a mudança no `.proto` precisa
entrar antes do código que depende dela.

## Quatro tipos de chamada

*(Rode-os acima.)* Como o HTTP/2 multiplexa streams, o gRPC oferece mais que requisição/resposta:

| Modo | Assinatura | Use para |
|---|---|---|
| **Unária** | `rpc GetUser (Req) returns (User)` | Leituras e escritas comuns |
| **Streaming do servidor** | `returns (stream User)` | Atualizações ao vivo, acompanhar logs, resultado grande em partes |
| **Streaming do cliente** | `(stream User) returns (Summary)` | Upload em lote, métricas, importação em massa |
| **Bidirecional** | `(stream User) returns (stream User)` | Chat, sincronização em tempo real, coordenação longa |

Essa é a capacidade que REST não tem de fábrica — e o motivo de o gRPC exigir HTTP/2, que é
também o motivo de ele não rodar nativamente no navegador.

## Por que o payload é pequeno — e ilegível

JSON envia `{"id":42,"name":"Ada Lovelace"}`: os **nomes** dos campos, como texto, em toda
mensagem. Protobuf envia o **número do campo** mais um valor binário — `name` nunca trafega, só
o `2`.

Duas consequências, e são o mesmo fato visto de dois lados:

- **É pequeno e rápido de parsear.** Para tráfego interno frequente, medido em milhões de
  chamadas, isso é dinheiro e latência de verdade.
- **Você não consegue ler sem o `.proto`.** `curl` e devtools deixam de ajudar, e você precisa de
  `grpcurl` mais o schema (ou reflexão no servidor) para inspecionar uma chamada.

Isso também dita as regras de schema:

- **Adicionar um campo** com número novo é seguro — leitores antigos ignoram o que não conhecem.
- **Renomear um campo** é seguro no fio (nomes não são enviados); só quebra a compilação.
- **Mudar o número de um campo** quebra os pares *em silêncio* — código antigo vai ler o campo
  novo como se fosse o antigo.
- **Apagar um campo** significa marcar o número como `reserved`. Reaproveitar um número
  aposentado é a mesma corrupção silenciosa.

## Códigos de status, deadlines e retentativas

gRPC tem **códigos de status próprios**, não os do HTTP: `OK (0)`, `DEADLINE_EXCEEDED (4)`,
`NOT_FOUND (5)`, `PERMISSION_DENIED (7)`, `UNAVAILABLE (14)`, `UNAUTHENTICATED (16)`. A
distinção conhecida entre 401 e 403 sobrevive, com outro nome: `UNAUTHENTICATED` é "não sabemos
quem você é"; `PERMISSION_DENIED` é "sabemos e mesmo assim recusamos".

**Toda chamada deveria levar um deadline.** Não um timeout inventado por cliente, e sim um
deadline propagado pela cadeia: se quem chamou tem 300 ms restantes, tudo que ele chamar herda o
que sobrou, e a árvore inteira pode parar em vez de fazer um trabalho que ninguém vai ler. Sem
deadlines, uma dependência lenta esgota, em silêncio, pools de threads três serviços acima.

E vale a mesma regra de sempre: `DEADLINE_EXCEEDED` **não significa que o trabalho não
aconteceu** — só que você parou de esperar. Repita apenas o que é idempotente, e prefira
`UNAVAILABLE` (falha de conexão) como o caso repetível, com backoff.

## Onde encaixa

- **Na borda**, de frente para navegadores, apps mobile e terceiros: HTTP/JSON. Todo mundo fala,
  qualquer um depura, e ninguém precisa do seu `.proto`.
- **Por dentro**, entre serviços que são seus: gRPC. Quem chama são máquinas que você controla,
  as chamadas são frequentes e sensíveis a latência, e contratos tipados se pagam.

A ponte entre os dois é um **[API gateway](/pt-BR/topics/api-gateway)** fazendo tradução de
protocolo — HTTP/JSON na porta, gRPC atrás dela — ou gRPC-Web mais um proxy quando um navegador
precisa chamar gRPC diretamente.

Um detalhe operacional que vale saber: como o gRPC mantém **conexões HTTP/2 longas**, um
balanceador L4 comum vai grudar um cliente num backend e deixar suas réplicas ociosas. É preciso
um balanceador L7 que entenda HTTP/2, balanceamento no lado do cliente ou um service mesh. Veja
**[Load balancer](/pt-BR/topics/load-balancer)**.

## Trade-offs

- **Contratos tipados vs passo de build.** Codegen em cada linguagem, em cada pipeline.
- **Pequeno e rápido vs opaco.** Sem curl, sem devtools, sem olhar um payload no log.
- **Streaming vs complexidade operacional.** Streams longos exigem cuidado com balanceamento,
  reconexão e back-pressure.
- **Ótimo por dentro, desconfortável por fora.** Consumidores públicos esperam REST; pedir a um
  parceiro que instale um toolchain para mandar uma requisição é venda difícil.
- **Não é nativo do navegador.** gRPC-Web mais proxy, ou tradução no gateway.

## gRPC vs REST vs GraphQL

*(A tabela de comparação acima coloca os quatro estilos lado a lado.)*

- **REST** — recursos sobre HTTP, o padrão na borda, cacheável e entendido por todo mundo.
- **GraphQL** — o cliente escolhe os campos; mais forte para interfaces ricas com dados
  aninhados.
- **gRPC** — métodos tipados entre serviços; mais forte onde as chamadas são internas,
  frequentes e sensíveis a latência.
- **[Webhooks](/pt-BR/topics/webhooks)** — ortogonais aos três: o provedor empurra um evento, e
  você pode usar webhooks junto com qualquer um deles.

Uma arquitetura bem comum usa todos: REST na borda, gRPC por dentro, GraphQL para o app próprio
e webhooks para avisar parceiros.

## Relevância em entrevista

- **Diga "RPC" com intenção** — métodos, não recursos. Depois cite os três pilares: contrato
  `.proto`, binário protobuf, transporte HTTP/2.
- **Traga deadlines por conta própria.** Propagação de deadline é um sinal forte e específico.
- **Conheça os códigos de status** pelo menos por alto, e a separação `UNAUTHENTICATED` /
  `PERMISSION_DENIED`.
- **Cite a limitação do navegador** antes do entrevistador — gRPC-Web ou tradução no gateway.
- **Cite balanceamento L7** para conexões HTTP/2 longas. Pouquíssimos candidatos fazem isso.
- **Não venda demais.** "gRPC por dentro, REST na borda" é a resposta que soa a experiência de
  produção.

## Notas de aula

- gRPC = **um `.proto` → cliente e servidor gerados**, binário sobre HTTP/2.
- **Quatro formatos de chamada**: unária, streaming do servidor, do cliente e bidirecional.
- O fio carrega **números de campo, não nomes** — daí o payload pequeno e os números permanentes.
- Tem **códigos de status próprios**, mais deadlines propagados pela cadeia de chamadas.
- **Não é nativo do navegador**: gRPC-Web com proxy, ou um API gateway traduzindo na borda.
- Conexões HTTP/2 longas precisam de **balanceamento L7** ou no lado do cliente.
