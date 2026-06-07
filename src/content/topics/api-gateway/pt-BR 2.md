---
title: API Gateway
slug: api-gateway
description: Um único ponto de entrada gerenciado que cuida de roteamento, autenticação, rate limiting e preocupações transversais na frente de vários serviços.
category: high-level-design
order: 30
difficulty: intermediate
status: in-progress
tags: [api, security, microservices]
updatedAt: 2026-01-24
beginnerSummary: >-
  Um API gateway é a porta de entrada única para um sistema feito de muitos serviços. Em
  vez de cada cliente conhecer cada serviço, todos falam com o gateway, que os autentica,
  aplica limites e roteia cada requisição para o serviço certo nos bastidores.
glossary:
  - term: Preocupação transversal
    definition: Uma responsabilidade compartilhada por muitos serviços (auth, logging, rate limiting) que o gateway centraliza para que cada serviço não a reimplemente.
  - term: Rate limiting
    definition: Limitar quantas requisições um cliente pode fazer em uma janela para proteger o sistema de abuso e sobrecarga.
  - term: BFF
    definition: Backend for Frontend — uma camada semelhante a um gateway, feita sob medida para um cliente (web, mobile), que agrega e molda as respostas para ele.
references:
  - label: "Microsoft — Padrão API Gateway"
    url: https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway
  - label: "Kong — O que é um API gateway?"
    url: https://konghq.com/learning-center/api-gateway
---

## O que é

Um **API gateway** é um servidor que é o ponto de entrada único para um conjunto de
serviços de backend. Os clientes enviam requisições ao gateway, que cuida das preocupações
transversais — autenticação, rate limiting, roteamento, terminação TLS, logging — e
encaminha cada requisição ao serviço apropriado. É o "proxy reverso com cérebro" na frente
de um sistema de microsserviços.

## Por que importa

Sem um gateway, todo cliente precisa conhecer o endereço de todo serviço, e todo serviço
precisa reimplementar auth, throttling e logging. Um gateway puxa essas preocupações
compartilhadas para um único lugar, simplificando clientes e serviços, e dando a você um
ponto único para aplicar segurança e observabilidade.

## Conceitos-chave

- **Roteamento** — mapear um caminho de entrada (`/orders`) para o serviço de backend certo.
- **Autenticação e autorização** — verificar um token uma vez, na borda, antes que o tráfego
  chegue aos serviços.
- **Rate limiting e throttling** — proteger os serviços de clientes abusivos ou descontrolados.
- **Agregação** — combinar várias chamadas de backend em uma resposta para o cliente (muitas vezes via um BFF).
- **Observabilidade** — um ponto de estrangulamento natural para logging, tracing e métricas.

## Discussão de arquitetura

```
                        ┌──────────────┐──▶ users-service
 cliente ─▶ API Gateway ─│  auth, rate  │──▶ orders-service
                        │  limit, rota │──▶ payments-service
                        └──────────────┘──▶ search-service
```

O gateway fica logo atrás do balanceador de carga (ou tem um balanceador na frente para sua
própria escala). Ele deve permanecer fino e rápido — lógica de negócio pesada pertence aos
serviços, não ao gateway.

## Componentes

- **Roteador** — casa requisições com backends por caminho, host ou cabeçalho.
- **Filtro de auth** — valida tokens/chaves e rejeita requisições não autorizadas cedo.
- **Rate limiter** — conta requisições por cliente (frequentemente com Redis por trás).
- **Transformador / agregador** — reescreve requisições/respostas ou distribui para vários serviços.

## Interfaces

- **Cliente ↔ Gateway** — uma única API pública estável (REST/GraphQL).
- **Gateway ↔ Serviços** — chamadas internas pela rede privada a cada serviço.
- **Gateway ↔ Auth/identidade** — validação de token contra um serviço de auth ou via JWTs assinados.

## Fluxos

1. O cliente envia uma requisição com um token de auth ao gateway.
2. O gateway valida o token e checa o rate limit do cliente.
3. O gateway roteia a requisição ao serviço correspondente (opcionalmente agregando vários).
4. O gateway retorna a resposta (possivelmente remodelada) e registra métricas/traces.

## Perspectiva de engenharia de software

- **Mantenha-o sem estado e fino** para que escale horizontalmente como qualquer camada web.
- **Centralize, não monopolize** — preocupações compartilhadas vivem aqui; regras de negócio não.
- **Planeje-o como ponto único de falha** — rode múltiplas instâncias atrás de um balanceador;
  uma queda do gateway derruba tudo.

## Trade-offs

- **Simplicidade para clientes vs um novo salto** — uma porta de entrada, mas latência
  adicional e uma camada para operar.
- **Controle centralizado vs risco de gargalo** — ótimo para políticas, perigoso se virar um
  ponto de estrangulamento frágil.
- **Agregação vs acoplamento** — combinar chamadas ajuda os clientes, mas pode acoplar o
  gateway aos detalhes internos dos serviços.

## Relevância em entrevistas

- Introduza um gateway quando passar de um monólito para **múltiplos serviços**.
- Use-o para responder "onde acontece **auth / rate limiting**?" — na borda, no gateway.
- Reconheça-o como um **ponto único de falha** e replique-o.
- Distinga-o de um simples balanceador: o gateway adiciona preocupações de **nível de aplicação**.

## Exemplos práticos

- Um produto mobile + web usa um gateway **BFF** por cliente para agregar serviços de perfil,
  feed e notificações em uma resposta.
- Uma plataforma de API pública usa o gateway para **chaves de API, cotas e rate limits por plano**.

## Notas de aula

> Este tópico está **em andamento** — as seções de componentes e fluxos poderiam ganhar um
> diagrama concreto e um exemplo de agregação resolvido. Contribuições bem-vindas.

- Gateway = proxy reverso + auth + rate limiting + roteamento, tudo na borda.
- Não o confunda com um balanceador de carga; o gateway é ciente da aplicação.
