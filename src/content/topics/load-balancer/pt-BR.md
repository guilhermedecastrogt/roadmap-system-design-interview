---
title: Load Balancer
slug: load-balancer
description: "Distribui o tráfego de entrada entre vários servidores para que nenhum fique sobrecarregado — a base de escalabilidade e disponibilidade."
category: blocos-fundamentais
order: 30
difficulty: beginner
status: published
tags: [load-balancer, networking, scalability, availability, infrastructure]
updatedAt: "2026-06-07"
beginnerSummary: >-
  Um balanceador de carga fica na frente de vários servidores e distribui as requisições
  entre eles, para que nenhum servidor fique sobrecarregado. Ele melhora escalabilidade,
  disponibilidade e tolerância a falhas — e, quando um servidor falha no health check, o
  balanceador simplesmente desvia o tráfego dele.
glossary:
  - term: Balanceador de carga
    definition: "Um componente que distribui as requisições entre um pool de servidores para melhorar escala, disponibilidade e tolerância a falhas."
  - term: Health check
    definition: "Uma verificação periódica que diz ao balanceador quais servidores estão saudáveis; os não saudáveis saem de rotação."
  - term: Round Robin
    definition: "Envia cada requisição ao próximo servidor na fila — simples e equilibrado quando os servidores são parecidos."
  - term: Least Connections
    definition: "Roteia para o servidor com menos conexões ativas no momento — adapta-se à carga real."
  - term: IP Hash
    definition: "Faz hash do IP do cliente para que o mesmo cliente sempre caia no mesmo servidor (afinidade de sessão)."
  - term: Sessão fixa (sticky)
    definition: "Prender um usuário a um servidor (via cookie ou IP hash) para que o estado da sessão fique no lugar."
  - term: L4 vs L7
    definition: "L4 roteia por IP e portas TCP/UDP; L7 lê caminho HTTP, host, headers e cookies."
  - term: TLS termination
    definition: "O balanceador descriptografa o HTTPS para que os backends falem HTTP simples internamente."
references:
  - label: "Cloudflare — O que é balanceamento de carga?"
    url: https://www.cloudflare.com/learning/performance/what-is-load-balancing/
  - label: "NGINX — HTTP load balancing"
    url: https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/
  - label: "AWS — Elastic Load Balancing"
    url: https://aws.amazon.com/elasticloadbalancing/
---

> Use a aula interativa acima para **rodar o tráfego**: troque o método de roteamento, veja
> as requisições se espalharem pelos servidores e clique em um servidor para derrubá-lo e
> ver o tráfego ser reroteado. As notas abaixo são a referência rápida.

## O que é

Um **balanceador de carga** fica na frente de um pool de servidores e distribui as
requisições entre eles. Para o cliente, parece um único endereço; por trás, vários
servidores idênticos dividem o trabalho.

## Por que um servidor não basta

Um único servidor tem dois limites rígidos: só aguenta um tanto de trabalho e, se cair,
**tudo** cai. Coloque um balanceador na frente de vários servidores e você ganha:

- **Escalabilidade** — adicione servidores para atender mais tráfego.
- **Disponibilidade e tolerância a falhas** — se um servidor cai, o tráfego vai para os outros.
- **Sustentabilidade** — nenhuma máquina fica sobrecarregada enquanto outras ficam ociosas.

## Onde ele se encaixa

Balanceadores não ficam só na porta de entrada — aparecem em **cada camada que escala**:

- **Na borda** — distribuindo os usuários pelos servidores web/frontend.
- **Entre serviços** — balanceando chamadas internas entre os microsserviços de backend.
- **Na camada de dados** — distribuindo **leituras** entre réplicas (escritas vão ao primário).

*(Veja o diagrama "onde os balanceadores vivem" acima.)*

## Métodos de roteamento

Como o próximo servidor é escolhido — teste cada um no laboratório acima:

- **Round Robin** — cada servidor na sua vez.
- **Weighted Round Robin** — servidores maiores recebem uma fatia maior (ex.: 3:2:1).
- **Least Connections** — quem tem menos conexões ativas agora.
- **Least Response Time** — o servidor saudável mais rápido (menor latência).
- **IP Hash** — mesmo IP do cliente → mesmo servidor (aderência).
- **URL Hash** — caminhos como `/video`, `/profile`, `/admin` caem em servidores fixos.

## Health checks e falhas

O balanceador faz **health check** dos servidores o tempo todo. Quando um para de responder,
ele é **removido da rotação** e o tráfego é redistribuído para os saudáveis — automaticamente,
sem impacto para o usuário. (Derrube um servidor no laboratório para ver isso acontecer.)

## Estático vs Dinâmico

- **Estático** — regras fixas que não conhecem o estado real (Round Robin, IP/URL Hash).
- **Dinâmico** — adapta-se ao estado ao vivo, como carga e latência (Least Connections, Least Response Time).

## Stateful vs Stateless

- **Stateful (sticky)** — o usuário fica preso a um servidor (cookie / IP hash) para manter o
  estado da sessão. App mais simples, mas carga desigual e failover mais difícil.
- **Stateless** — qualquer servidor atende qualquer requisição. Fácil de escalar e fazer
  failover, mas o estado da sessão precisa viver em um **armazenamento compartilhado**. Prefira este.

## L4 vs L7

- **L4 (transporte)** — roteia por **IP e portas TCP/UDP**. Rápido e agnóstico de protocolo.
- **L7 (aplicação)** — lê **caminho HTTP, host, headers, cookies**, então faz roteamento por
  path, TLS termination e cookies sticky. Um pouco mais de trabalho, bem mais esperto.

## Outras capacidades

- **Health checking** — saber quais servidores podem receber tráfego.
- **Provisionamento dinâmico** — lidar com pools que crescem/encolhem (autoscaling).
- **TLS termination** — descriptografar HTTPS na borda para os backends falarem HTTP simples.
- **Segurança** — ajudar com mitigação de DDoS e filtragem de tráfego.

## Trade-offs

- **Desempenho e disponibilidade** melhoram — mas o balanceador é uma **camada para operar e
  proteger**, e precisa ser **redundante** (ou vira o novo ponto único de falha).
- **Métodos dinâmicos** roteiam de forma mais esperta, mas adicionam overhead de **observabilidade**.
- **Sessões fixas** simplificam apps com estado, mas **desequilibram a carga** e complicam o failover.
- **L7** libera roteamento rico a um pequeno custo de **latência/custo**; **L4** é mais enxuto.

## Relevância em entrevistas

O balanceador é geralmente a **primeira caixa que você desenha** depois do cliente:

- Introduza-o no momento em que você escala além de um servidor, com app servers **stateless**.
- Escolha um método e justifique (Round Robin para trabalho uniforme; Least Connections para variável).
- Mencione **health checks** e que o **próprio balanceador deve ser redundante**.
- Cite **L4 vs L7** só quando importa (roteamento por path, TLS termination).

## Notas de aula

- Servidores stateless + um balanceador é o padrão de cavalo de batalha — comece por ele.
- Estático = regras fixas; Dinâmico = reage à carga/latência.
- Sempre replique o balanceador; um LB não replicado apenas move o ponto único de falha.
