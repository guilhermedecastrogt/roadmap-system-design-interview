---
title: "Rate Limiting"
slug: rate-limiting-throttling
description: "Limita a velocidade com que um cliente pode bater no seu sistema — rejeitando o excesso para proteger contra abuso, evitar sobrecarga, controlar custo e manter tudo justo."
category: blocos-fundamentais
order: 60
difficulty: intermediate
status: published
tags: [rate-limiting, throttling, seguranca, api, resiliencia, algoritmos]
updatedAt: "2026-07-02"
beginnerSummary: >-
  Rate limiting define um teto para quantas ações um cliente pode fazer numa janela de tempo — por
  exemplo, 100 requisições por minuto. Requisições abaixo do limite passam; o excesso é rejeitado
  rápido, normalmente com um HTTP 429 "Too Many Requests". É assim que um sistema se defende de
  ataques de força bruta, scripts descontrolados e picos de tráfego, impede que um cliente barulhento
  prejudique todo mundo e evita que uma enxurrada dispare a conta de infraestrutura. O limite é sempre
  contado contra uma chave (um IP, um id de usuário, uma API key, uma rota…), e há alguns algoritmos
  clássicos — fixed window, sliding window, token bucket, leaky bucket — que diferem principalmente em
  como lidam com rajadas.
glossary:
  - term: Rate limit
    definition: "Uma taxa máxima permitida para alguma ação — ex.: 100 requisições por minuto — numa janela de tempo definida. Requisições além dela são rejeitadas ou atrasadas."
  - term: Throttling
    definition: "Desacelerar um cliente quando ele passa da cota — rejeitando, atrasando ou enfileirando requisições — em vez de deixá-lo rodar sem limite."
  - term: 429 Too Many Requests
    definition: "O status HTTP padrão que o servidor retorna quando um cliente enviou requisições demais num intervalo. Costuma vir com o header Retry-After."
  - term: Chave / dimensão
    definition: "Sobre o que o limite é contado — um IP, id de usuário, e-mail, API key, endpoint ou combinação. Decide quem compartilha um orçamento."
  - term: Fixed window
    definition: "Conta requisições em janelas de relógio discretas (ex.: cada minuto) e zera o contador em cada virada. Simples, mas uma rajada em cima da virada pode permitir até 2× o limite."
  - term: Sliding window
    definition: "Conta requisições nos últimos N segundos em relação a agora, então a janela se move continuamente. Mais suave e precisa que a fixed window, ao custo de mais estado."
  - term: Token bucket
    definition: "Um balde reabastece com tokens num ritmo constante até uma capacidade; cada requisição gasta um token. Permite rajadas até o tamanho do balde limitando a média."
  - term: Leaky bucket
    definition: "As requisições enchem um balde que escoa (vaza) num ritmo fixo; um balde cheio transborda e descarta. Produz uma saída perfeitamente suave."
  - term: Rajada (burst)
    definition: "Um pico curto de requisições chegando muito mais rápido que o ritmo sustentado. Como cada algoritmo lida com rajadas é a principal diferença entre eles."
  - term: Rate limiting distribuído
    definition: "Aplicar um limite compartilhado em vários nós (ex.: várias instâncias de gateway). Exige estado compartilhado — comumente um contador em Redis — para manter as contagens consistentes."
references:
  - label: "MDN — 429 Too Many Requests"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429
  - label: "Cloudflare — What is rate limiting?"
    url: https://www.cloudflare.com/learning/bots/what-is-rate-limiting/
  - label: "Stripe — Rate limiters (engineering blog)"
    url: https://stripe.com/blog/rate-limiters
  - label: "NGINX — Rate limiting with the leaky bucket"
    url: https://www.nginx.com/blog/rate-limiting-nginx/
---

> Use o laboratório interativo acima para **ver o limitador funcionar**: empurre a taxa acima do
> limite e veja requisições levarem 429, inunde dois servidores e veja só o desprotegido derreter,
> depois percorra os quatro algoritmos e veja como cada um lida com uma rajada. As notas abaixo são a
> referência rápida.

## O que é

**Rate limiting** define uma **taxa máxima permitida** para alguma ação — requisições, logins,
chamadas de API, operações — numa **janela de tempo** definida. Por exemplo: *100 requisições por
minuto por usuário*. Requisições abaixo do teto passam; o **excesso é rejeitado** (normalmente com um
HTTP **429 Too Many Requests**) ou atrasado. **Throttling** é o ato geral de desacelerar um cliente
quando ele passa da cota.

## Por que importa

Rate limiting **não é só uma feature de segurança** — ele te dá quatro coisas de uma vez:

- **Proteção contra abuso e ataques** — força bruta de login, credential stuffing, scraping e
  enxurradas de bots dependem de enviar *muitas* requisições. Um limite os enfraquece.
- **Estabilidade sob carga** — impede que um pico (ou um cliente bugado num loop de retry) empurre um
  serviço além da capacidade e o derrube para todo mundo.
- **Controle de custo** — tráfego abusivo ou descontrolado dispara contas de compute, banda e APIs de
  terceiros. Rejeitar o excesso cedo limita o estrago.
- **Justiça** — um cliente barulhento não pode monopolizar um recurso compartilhado e prejudicar os
  usuários bem-comportados.

## Onde o rate limiting vive

A mesma requisição passa por várias camadas, e um limite pode ficar em **qualquer** uma delas — cada
uma com alcance e custo diferentes *(explore o mapa de posicionamento acima)*:

- **Cliente / frontend** — desabilita o botão, faz debounce, recua no 429. Bom para **UX**, mas
  trivial de burlar — **nunca** é fronteira de segurança.
- **API gateway** — a casa mais comum: um lugar central para aplicar cotas por chave em todos os
  serviços.
- **Reverse proxy (nginx / Envoy / edge de CDN)** — limita requisições por IP logo na porta; barato e
  muito rápido, mas com chaves mais grosseiras.
- **Serviço backend** — limites na aplicação (muitas vezes com Redis) que chaveiam por usuário, plano
  ou regras de negócio que o edge não enxerga.

Um sistema real costuma usar **vários ao mesmo tempo**: o edge descarta enxurradas óbvias por IP, o
gateway aplica cotas por usuário e o backend protege algumas operações caras.

## Sobre o que podemos limitar

Um limite é sempre contado contra uma **chave**. Escolher a chave decide **quem compartilha um
orçamento**:

- **Endereço IP** — ótimo contra enxurradas anônimas, mas NATs/proxies fazem muitos usuários
  parecerem um só.
- **Id de usuário** — justo por conta e sobrevive a troca de IP; exige requisição autenticada.
- **E-mail** — útil em cadastro / reset de senha antes de existir um id de usuário.
- **Endpoint / rota** — dê às rotas caras ou sensíveis (como `POST /login`) um orçamento próprio e
  mais apertado.
- **API key / token** — o padrão para APIs públicas e planos de cobrança (free e pro têm limites
  diferentes).
- **Combinação** — componha chaves para precisão, ex.: *5 tentativas de login por IP + e-mail a cada
  15 min*.

## Sem rate limit vs com rate limit

Dispare a mesma enxurrada contra dois servidores *(veja a comparação acima)*. **Sem limite**, toda
requisição é aceita, a carga passa da capacidade, a latência explode e o servidor **cai — para todo
mundo**. **Com limite**, o tráfego acima do teto é rejeitado **rápido e barato**, então o servidor
fica dentro da capacidade e segue atendendo as requisições que importam. Um **429 é uma feature**,
não uma falha.

## Os algoritmos

Os quatro respondem à mesma pergunta — *permitir ou bloquear esta requisição?* — mas guardam estado
diferente e lidam com **rajadas** de forma diferente.

### Fixed window

- **Exemplo:** 100 requisições por minuto por usuário, contadas em janelas discretas (0–60s,
  60–120s…).
- **Estado:** um único contador + a janela atual.
- **Decisão:** permite enquanto o contador está abaixo do limite; **zera** em cada virada.
- **Bom para:** simplicidade — barato e fácil de explicar.
- **Trade-off:** uma **rajada em cima da virada** pode passar até **2× o limite** num intervalo curto
  (encha a janela às 0:59, encha de novo às 1:00).

### Sliding window

- **Exemplo:** no máximo 100 requisições nos **últimos 60 segundos**, medido continuamente.
- **Estado:** timestamps das requisições recentes (um log), ou contagens ponderadas por janela.
- **Decisão:** permite se a contagem **dentro da janela móvel** estiver abaixo do limite; entradas
  antigas expiram conforme a janela desliza.
- **Bom para:** limitação suave e precisa, **sem a rajada de virada**.
- **Trade-off:** mais estado e contabilidade que a fixed window.

### Token bucket

- **Exemplo:** um balde guarda até N tokens e **reabastece num ritmo constante**; cada requisição
  gasta um token.
- **Estado:** um contador de tokens + a hora do último refill.
- **Decisão:** se há token, gasta e permite; senão **bloqueia** até o balde reabastecer.
- **Bom para:** permitir **rajadas controladas** até o tamanho do balde limitando a **média** — um
  ótimo encaixe para APIs.
- **Trade-off:** dois botões para ajustar (capacidade vs ritmo de refill); rajadas são permitidas por
  design.

### Leaky bucket

- **Exemplo:** as requisições despejam num balde que **escoa num ritmo fixo**; um **balde cheio
  transborda** e descarta o excesso.
- **Estado:** uma fila (o balde) de requisições pendentes.
- **Decisão:** enfileira se há espaço; **descarta** no transbordo. As requisições saem num ritmo
  **constante**.
- **Bom para:** forçar uma **saída perfeitamente suave** lá na frente — ótimo para proteger uma
  dependência frágil.
- **Trade-off:** adiciona latência de fila e não permite **rajada** nenhuma, mesmo havendo folga.

> **Regra de bolso:** token bucket quando você quer *permitir* rajadas curtas; leaky bucket quando
> quer *suavizá-las*; sliding window quando precisa de *precisão*; fixed window quando *simples e
> barato* já basta.

## In-memory vs distribuído

O limitador mais simples é um **contador em memória** dentro de um processo — rápido e trivial, mas
só conhece o **próprio nó**. Atrás de um load balancer com várias instâncias de gateway ou app, cada
uma aplicaria o limite **de forma independente**, então o teto real vira *limite × número de nós*.

Para aplicar **um limite compartilhado entre os nós**, você precisa de **estado compartilhado** —
comumente um **contador em Redis** (incrementos atômicos com TTL, ou um script de token bucket). Esse
é o modelo mental padrão: *in-memory para um único nó ou limites suaves; um store compartilhado como
Redis para limites distribuídos precisos.* O trade-off é um hop de rede a mais e uma dependência para
manter disponível.

## Trade-offs

- **Proteção vs experiência do usuário** — estrito demais e você dá 429 em usuários legítimos; frouxo
  demais e o abuso passa. Retorne **429 com `Retry-After`** para os clientes bons recuarem.
- **Performance vs complexidade** — um limite por IP no proxy é barato; limites por usuário
  distribuídos e precisos custam coordenação.
- **Precisão vs custo** — logs de sliding window são precisos, mas mais pesados que um contador de
  fixed window.
- **Global vs por usuário** — proteja o *sistema* como um todo e seja *justo* com os indivíduos; você
  costuma precisar dos dois.
- **In-memory vs distribuído** — simples e rápido vs consistente num cluster.

## Relevância em entrevista

- **Quando trazer o assunto** — qualquer **API pública**, **endpoint de login / auth**, operação cara
  ou prompt de "**proteger contra abuso / picos / custo**" deve mencionar rate limiting.
- **Onde colocar** — normalmente no **API gateway**; adicione um limite no **edge/proxy** para
  enxurradas por IP e limites no **backend** para algumas rotas sensíveis.
- **Qual algoritmo** — **token bucket** é o padrão seguro (permite rajadas, limita a média); vá de
  **sliding window** quando a precisão importa e **leaky bucket** para suavizar a saída.
- **Como escalar** — cite **rate limiting distribuído com um store compartilhado (Redis)** para os
  limites ficarem consistentes entre vários nós.
- **Diga a parte honesta** — escolha uma **chave** (IP / usuário / API key), retorne **429 +
  Retry-After** e note que rate limiting protege **estabilidade, custo e justiça** — não só
  segurança.

## Notas de aula

- Resposta padrão: **token bucket, chaveado por API key ou usuário, aplicado no gateway, com Redis,
  retornando 429 + Retry-After.**
- O defeito da fixed window é a **rajada de virada** — cite para mostrar profundidade.
- "Proteger o endpoint de login" → limite apertado **por IP + por e-mail** com lockout/backoff.
- Contadores em memória não sobrevivem a **múltiplos nós** — fale Redis assim que escala aparecer.
