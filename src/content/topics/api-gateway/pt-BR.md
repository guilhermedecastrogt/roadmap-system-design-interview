---
title: "API Gateway"
slug: api-gateway
description: "A porta de entrada de uma arquitetura de serviços — um único ponto que autentica, valida, aplica rate limit e roteia cada requisição antes de ela chegar aos seus serviços."
category: blocos-fundamentais
order: 80
difficulty: intermediate
status: published
tags: [api-gateway, microservices, security, routing, api, architecture]
updatedAt: "2026-07-16"
beginnerSummary: >-
  Um API gateway é a porta de entrada única de um sistema feito de vários serviços. Em vez de o
  frontend conhecer e chamar cada serviço diretamente, ele envia toda requisição ao gateway, que
  roda um pipeline de checagens — quem é você (autenticação), você pode fazer isso (autorização),
  a requisição está bem-formada (validação), você está dentro da cota (rate limiting) — e só
  então a roteia para o serviço certo, às vezes traduzindo HTTP/JSON para um protocolo interno
  mais rápido, como gRPC, no caminho. Requisições que falham numa checagem são rejeitadas na
  porta com um status claro, e os serviços atrás do gateway ficam focados na lógica de negócio.
  É uma camada de política e controle, não só um roteador — mas deve continuar fina: lógica de
  negócio acumulada no gateway o transforma num gargalo.
glossary:
  - term: API gateway
    definition: "Um servidor que é o ponto de entrada único para um conjunto de serviços de backend. Aplica políticas compartilhadas (auth, validação, rate limits) e roteia cada requisição ao serviço certo."
  - term: Ponto de entrada único
    definition: "O padrão de expor um único endereço público para o sistema inteiro. Clientes nunca aprendem endereços internos, então os internos podem mudar livremente."
  - term: Autenticação (authn)
    definition: "Verificar quem é o chamador — validar um JWT, uma API key ou uma sessão. Falha com 401 Unauthorized."
  - term: Autorização (authz)
    definition: "Checar se o chamador autenticado pode executar esta ação neste recurso. Falha com 403 Forbidden."
  - term: Validação de requisição
    definition: "Rejeitar requisições malformadas (JSON quebrado, campos faltando, tipos errados) com 400 antes de chegarem a um serviço."
  - term: Rate limiting
    definition: "Limitar quantas requisições um cliente pode fazer numa janela de tempo; o excesso é rejeitado com 429 Too Many Requests."
  - term: Roteamento
    definition: "Mapear uma requisição de entrada para o serviço de backend certo — geralmente por prefixo de caminho (/users → serviço de usuários), mas também por método, host ou cabeçalho."
  - term: Tradução de protocolo
    definition: "Aceitar um protocolo na borda (HTTP/JSON) e falar outro internamente (gRPC, protobuf) — o gateway converte entre os dois."
  - term: gRPC
    definition: "Um protocolo RPC de alta performance construído sobre HTTP/2 e codificação binária protobuf, comum em chamadas serviço-a-serviço dentro da rede."
  - term: Preocupação transversal
    definition: "Uma responsabilidade que todo serviço duplicaria (auth, logging, rate limiting) e que o gateway centraliza num único lugar."
  - term: BFF (Backend for Frontend)
    definition: "Uma variante de gateway feita sob medida para um tipo de cliente (web, mobile), agregando e moldando respostas para as necessidades daquele cliente."
  - term: Ponto único de falha
    definition: "Um componente cuja queda derruba o sistema inteiro. Um gateway é um por design, então precisa ser replicado e mantido simples."
references:
  - label: "Microsoft — padrão API gateway"
    url: https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway
  - label: "NGINX — O que é um API gateway?"
    url: https://www.nginx.com/learn/api-gateway/
  - label: "Kong — O que é um API gateway?"
    url: https://konghq.com/learning-center/api-gateway/what-is-an-api-gateway
  - label: "microservices.io — padrão API Gateway"
    url: https://microservices.io/patterns/apigateway.html
  - label: "gRPC — Introdução"
    url: https://grpc.io/docs/what-is-grpc/introduction/
---

> Use a torre de controle acima para **ver as requisições atravessando o gateway**: envie uma
> requisição válida e siga-a checkpoint por checkpoint até um serviço, depois envie uma quebrada
> e veja exatamente qual camada a barra. Alterne a arquitetura com e sem gateway, despache
> requisições pela tabela de rotas e veja HTTP virar gRPC. As notas abaixo são a referência
> rápida.

## O que é

Um **API gateway** é uma **camada intermediária entre os clientes e os serviços de backend** —
a porta de entrada única do sistema. Toda requisição faz a mesma ida e volta:

**Frontend → API Gateway → serviço → API Gateway → frontend**

O gateway recebe cada requisição, roda um **pipeline de políticas** — autenticação, autorização,
validação, rate limiting — e só então a **roteia** para o serviço interno que deve atendê-la,
devolvendo a resposta ao cliente.

A nuance importante: um gateway **não é só um roteador**. É uma **camada de política e
controle**. O roteamento é o *último* passo; tudo antes dele é decidir se a requisição merece
chegar a um serviço.

## Por que importa

Sem um gateway, todo serviço precisa reimplementar o mesmo trabalho transversal, e todo cliente
precisa conhecer o endereço e as manias de cada serviço. Um gateway te dá:

- **Um único ponto de entrada** — clientes aprendem um endereço estável; os internos ficam
  escondidos.
- **Políticas compartilhadas num lugar só** — auth, validação e limites aplicados uma vez, na
  borda, em vez de duplicados (e divergindo) entre serviços.
- **Frontends mais simples** — uma API para chamar, um handshake de auth, um formato de erro.
- **Serviços focados** — lógica de negócio fica nos serviços; encanamento fica no gateway.
- **Rejeição cedo** — tráfego ruim é barrado na porta, barato, antes de gastar uma chamada de
  serviço.

## Sem gateway vs com gateway

*(Alterne a comparação acima.)*

- **Sem** — o frontend fala com cada serviço diretamente. Precisa conhecer três (depois dez,
  depois cinquenta) endereços; cada serviço duplica auth, validação e rate limiting; qualquer
  reorganização interna pode quebrar clientes.
- **Com** — o frontend fala com um gateway. As checagens rodam uma vez na borda; os serviços
  ficam escondidos atrás de uma API pública estável e livres para serem divididos, fundidos ou
  reescritos sem os clientes perceberem.

## Os checkpoints — o que o gateway pode fazer

Toda requisição passa pela mesma bateria de checagens *(veja na torre de controle acima)*:

1. **Autenticação — quem é você?** Validar o JWT / API key / sessão. Falhou → **401**.
2. **Autorização — você pode fazer isso?** Checar papéis e escopos contra a ação. Falhou →
   **403**.
3. **Validação — a requisição está bem-formada?** Esquema, campos obrigatórios, tipos, limites
   de tamanho. Falhou → **400**.
4. **Rate limit — você está dentro da cota?** Por API key, usuário ou IP. Falhou → **429**.
5. **Roteamento — quem atende isso?** Casar caminho/método e encaminhar ao serviço certo.

Além do pipeline, gateways costumam cuidar de **proteções** (terminação TLS, limite de tamanho
de requisição, timeouts, blocklists de IP, filtro básico de bots) e de **tradução de protocolo**
(abaixo). A soma das checagens é um contrato simples: toda requisição é **aprovada e
encaminhada** ou **rejeitada com um status claro** que nomeia a camada que falhou.

## Roteamento para os serviços

O gateway mantém uma **tabela de rotas** e despacha por prefixo de caminho (ou método, host,
cabeçalho):

```
/users/**     →  user-service
/payments/**  →  payment-service
/orders/**    →  order-service
```

Clientes nunca aprendem endereços internos. Divida o serviço de pedidos em dois amanhã,
atualize uma regra de rota, e **nenhum cliente muda** — essa indireção é o que compra a
liberdade interna.

## Tradução de protocolo — HTTP fora, gRPC dentro

Clientes falam **HTTP/JSON** porque tudo (navegadores, apps mobile, terceiros) entende e é
fácil de depurar. Internamente, os serviços muitas vezes preferem **gRPC** (HTTP/2 + protobuf):
binário, compacto, multiplexado e com contratos tipados.

O gateway é o **adaptador** entre os dois mundos: aceita `POST /orders` com corpo JSON e
encaminha como uma chamada gRPC `CreateOrder` ao serviço de pedidos — depois traduz a resposta
de volta para JSON. Cada lado usa o que lhe serve melhor, e os serviços podem migrar de
protocolo sem nenhum cliente perceber.

## Trade-offs

Um gateway não é de graça, e **nem todo sistema precisa de um**:

- **Clientes mais simples vs mais infraestrutura** — mais um componente para fazer deploy,
  monitorar e atualizar. Um monólito com três rotas não precisa dele.
- **Controle central vs gargalo em potencial** — toda requisição passa por ele; precisa ser
  escalado (várias instâncias sem estado atrás de um load balancer) ou vira o ponto de
  estrangulamento.
- **Consistência vs latência extra** — o salto adicional e as checagens somam alguns
  milissegundos a cada requisição.
- **Concentração de falhas** — um gateway mal configurado ou fora do ar derruba *tudo*.
  Replique-o e mantenha a configuração disciplinada.
- **A armadilha do gateway gordo** — o gateway deve continuar uma **camada fina de políticas**.
  Quando lógica de negócio se acumula nele, você reconstruiu um monólito na porta de entrada,
  sem dono e temido por todos.

**Regra de bolso para o que vai onde:** identidade, cotas, validação de forma/esquema e
roteamento pertencem ao gateway; regras de negócio ("este item tem estoque?", "este usuário
pode ver este documento?") pertencem aos serviços.

## Relevância em entrevistas

- **Quando trazer o assunto** — no momento em que o seu design tem **mais de um serviço de
  backend** e clientes externos. "Os clientes batem num API gateway" é a jogada de abertura
  padrão de um design de microsserviços.
- **O que ele te compra** — diga a lista: ponto de entrada único, auth/rate limiting central,
  internos escondidos, clientes mais simples, tradução de protocolo.
- **O que centralizar vs manter nos serviços** — política transversal no gateway; lógica de
  negócio nos serviços. Verbalizar essa divisão sinaliza maturidade.
- **Aponte os riscos sem ser perguntado** — ponto único de falha (rode réplicas), latência
  adicional (um salto) e o anti-padrão do gateway gordo.
- **Conheça os vizinhos** — vs um **load balancer** (distribui tráfego, sem política de
  aplicação), vs um **reverse proxy** (o gateway *é* um, mais política em nível de API), e a
  variante **BFF** (um gateway por tipo de cliente).

## Notas de aula

- Resposta padrão: **clientes → API gateway (auth, rate limit, validação) → serviços via
  gRPC**, gateway sem estado e replicado atrás de um load balancer.
- O gateway é um **pipeline de políticas que termina em roteamento** — não um roteador com
  extras.
- Rejeições mapeiam para camadas: **401** authn, **403** authz, **400** validação, **429**
  rate limit. Nomear esse mapeamento numa entrevista pega bem.
- Sistema pequeno, um serviço só? **Pule o gateway** — diga isso também; saber quando *não*
  usar um componente faz parte da resposta.
