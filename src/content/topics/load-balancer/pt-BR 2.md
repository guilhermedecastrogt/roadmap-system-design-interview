---
title: Balanceador de Carga
slug: load-balancer
description: Como um único endpoint virtual distribui o tráfego entre vários servidores para ganhar escala e disponibilidade.
category: high-level-design
order: 10
difficulty: beginner
status: published
tags: [networking, availability, scalability]
updatedAt: 2026-01-20
beginnerSummary: >-
  Um balanceador de carga é o guarda de trânsito na frente dos seus servidores. Os
  clientes falam com um único endereço; o balanceador encaminha silenciosamente cada
  requisição para um entre vários servidores idênticos atrás dele. Isso permite adicionar
  servidores para atender mais usuários e continuar servindo tráfego mesmo quando um
  servidor falha.
glossary:
  - term: Health check
    definition: "Uma verificação periódica (ex.: uma requisição HTTP a /healthz) que o balanceador usa para decidir se um servidor deve receber tráfego."
  - term: Sessão fixa (sticky session)
    definition: Rotear um determinado cliente sempre para o mesmo servidor durante sua sessão, geralmente via cookie.
  - term: L4 vs L7
    definition: O balanceamento na camada 4 roteia por IP/porta (TCP/UDP); na camada 7 roteia por dados da aplicação, como o caminho HTTP ou cabeçalhos.
  - term: VIP
    definition: IP virtual — o único endereço ao qual os clientes se conectam, que o balanceador possui e mapeia para os backends reais.
references:
  - label: "AWS — O que é balanceamento de carga?"
    url: https://aws.amazon.com/what-is/load-balancing/
  - label: "NGINX — HTTP load balancing"
    url: https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/
  - label: "Cloudflare — O que é balanceamento de carga?"
    url: https://www.cloudflare.com/learning/performance/what-is-load-balancing/
---

## O que é

Um **balanceador de carga** fica entre os clientes e um pool de servidores. Os clientes
enviam toda requisição para um único endereço estável (um *IP virtual*), e o balanceador
decide qual servidor de backend realmente a atende. Para o mundo externo, o sistema parece
uma única máquina; por dentro, podem ser dois servidores ou dois mil.

É a resposta mais comum para a primeira pergunta de escala em uma entrevista:
*"Você tem mais tráfego do que um servidor aguenta — e agora?"*

## Por que importa

Um único servidor tem dois limites rígidos: ele só consegue fazer uma quantidade de
trabalho, e quando falha, tudo falha. Um balanceador ataca os dois:

- **Escalabilidade** — adicione mais servidores idênticos atrás do balanceador e a
  capacidade cresce de forma quase linear. Isso é *escala horizontal*.
- **Disponibilidade** — se um servidor para de responder aos health checks, o balanceador
  simplesmente para de enviar tráfego para ele. Os usuários nem percebem.
- **Operabilidade** — você pode tirar um servidor de rotação para fazer deploy ou patch e
  depois recolocá-lo, com zero downtime (deploys graduais).

## Conceitos-chave

- **Algoritmo de balanceamento** — como o próximo servidor é escolhido:
  - *Round robin* — cada servidor na sua vez. Simples, assume servidores iguais.
  - *Menos conexões* — o servidor com menos conexões ativas. Melhor quando as requisições
    têm custos diferentes.
  - *Ponderado (weighted)* — servidores maiores recebem uma fatia maior.
  - *Baseado em hash* — uma chave (ex.: IP do cliente) é mapeada por hash a um servidor,
    dando aderência (stickiness).
- **Health checks** — sondagens ativas decidem quais servidores estão elegíveis. Um
  servidor com falha é removido e readmitido automaticamente quando se recupera.
- **L4 vs L7** — L4 é rápido e agnóstico de protocolo; L7 entende HTTP e pode rotear por
  caminho, terminar TLS e reescrever cabeçalhos.
- **Ausência de estado** — o balanceamento é mais fácil quando qualquer servidor atende
  qualquer requisição, o que significa que o estado de sessão deve viver em um
  armazenamento compartilhado (cache/BD), não no servidor.

## Discussão de arquitetura

Em um sistema web típico, o balanceador é a porta de entrada:

```
            ┌──────────────┐
 cliente ──▶│ Balanceador  │──▶ app server 1
            │   (VIP)      │──▶ app server 2
            └──────┬───────┘──▶ app server 3
                   │  health checks ▲ ▲ ▲
                   ▼
        (o próprio balanceador é replicado para
         não ser um ponto único de falha)
```

O balanceador não pode virar o novo ponto único de falha, então, em produção, ele próprio
é redundante — por exemplo, duas instâncias compartilhando um IP flutuante, ou um serviço
gerenciado multi-AZ (AWS ELB, GCP Cloud Load Balancing). O DNS pode ficar na frente de
vários balanceadores em regiões diferentes para distribuição geográfica.

## Componentes

- **Listener / VIP** — o endereço e porta aos quais os clientes se conectam.
- **Pool de backend (target group)** — o conjunto de servidores elegíveis a receber tráfego.
- **Verificador de saúde (health checker)** — sonda os backends e atualiza o status de cada um.
- **Escalonador (scheduler)** — aplica o algoritmo de balanceamento para escolher um backend por requisição.
- **Terminador TLS** (L7) — descriptografa HTTPS para que os backends falem HTTP simples internamente.

## Interfaces

- **Cliente ↔ Balanceador** — TCP/HTTP(S) padrão; os clientes desconhecem os backends.
- **Balanceador ↔ Backend** — conexões encaminhadas, frequentemente com cabeçalhos
  `X-Forwarded-For` / `X-Forwarded-Proto` para que a aplicação ainda saiba o IP e o esquema
  reais do cliente.
- **Plano de controle** — uma API/configuração que registra e remove backends e define
  regras de health check; é com isso que o autoscaling e as ferramentas de deploy conversam.

## Fluxos

Uma requisição normal:

1. O cliente resolve o nome DNS do serviço para o VIP do balanceador.
2. O cliente abre uma conexão com o VIP.
3. O escalonador escolhe um backend saudável usando o algoritmo configurado.
4. O balanceador encaminha a requisição e transmite a resposta de volta.

Uma falha:

1. Um backend para de responder aos health checks (timeout ou resposta de erro).
2. O verificador o marca como *não saudável* e o remove do pool.
3. Novas requisições o ignoram; conexões existentes podem ser encerradas ou drenadas.
4. Quando ele passa nos health checks novamente, é readicionado — muitas vezes de forma gradual.

## Perspectiva de engenharia de software

Trate o balanceador como um contrato: *qualquer backend pode atender qualquer requisição*.
Manter esse contrato é o que mantém o design simples. Na prática:

- Mantenha os app servers **sem estado**; empurre os dados de sessão e de usuário para um
  cache ou BD compartilhado.
- Faça health checks **significativos** — verifique uma dependência real, não apenas "o
  processo está de pé", senão você roteará tráfego para servidores quebrados.
- Projete para **drenagem de conexões** para que as requisições em andamento terminem
  durante os deploys.

## Trade-offs

- **Escalabilidade vs complexidade** — você ganha escala horizontal, mas adiciona uma
  camada para operar, monitorar e proteger.
- **Recursos L7 vs custo/latência** — roteamento L7, terminação TLS e inspeção são
  poderosos, mas custam CPU e adicionam um pouco de latência em relação ao L4 puro.
- **Aderência vs balanceamento** — sessões fixas simplificam apps com estado, mas
  desequilibram a carga e prejudicam o failover; prefira estado compartilhado e dispense
  a aderência quando puder.
- **Custo vs disponibilidade** — rodar o balanceador de forma redundante entre zonas custa
  mais, mas o remove como ponto único de falha.

## Relevância em entrevistas

O balanceador de carga é quase sempre a **primeira caixa que você desenha** depois do
cliente. Uma boa resposta:

- Introduz o balanceador no momento em que você escala além de um servidor.
- Afirma que os app servers são sem estado, então qualquer servidor atende qualquer requisição.
- Menciona health checks e que o próprio balanceador deve ser redundante.
- Escolhe um algoritmo e o justifica (round robin para trabalho uniforme, menos conexões
  para trabalho variável).
- Cita L4 vs L7 apenas quando importa (ex.: roteamento por caminho, terminação TLS).

Perguntas comuns de acompanhamento: *"Como o balanceador sabe que um servidor caiu?"*
(health checks), *"O que acontece com as sessões no failover?"* (estado compartilhado) e
*"O balanceador não é um ponto único de falha?"* (replique-o / use um serviço gerenciado
multi-AZ).

## Exemplos práticos

- **Camada web** — um balanceador L7 na frente de uma frota de servidores de API sem
  estado, roteando `/api/*` para o pool de API e `/` para o pool web.
- **Leituras de banco** — um balanceador (ou cliente inteligente) distribuindo consultas
  de leitura entre réplicas de leitura, enquanto as escritas vão para o primário.
- **Global** — roteamento por DNS ou anycast envia os usuários ao balanceador regional mais
  próximo, que então balanceia localmente.

## Notas de aula

- "Servidores sem estado + um balanceador de carga" é o padrão de cavalo de batalha da
  camada web — comece por ele.
- Não esqueça de replicar o balanceador; um LB não replicado apenas move o ponto único de falha.
- Sessões fixas são um cheiro ruim: geralmente significam que o estado está no lugar errado.
