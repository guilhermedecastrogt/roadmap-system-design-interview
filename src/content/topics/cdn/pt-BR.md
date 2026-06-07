---
title: CDN
slug: cdn
description: "Uma rede de servidores que guarda seu conteúdo em cache perto dos usuários — reduzindo latência e aliviando a origem."
category: blocos-fundamentais
order: 20
difficulty: beginner
status: published
tags: [cdn, networking, caching, performance, infrastructure]
updatedAt: "2026-06-07"
beginnerSummary: >-
  Um CDN (Content Delivery Network) é um conjunto de servidores espalhados pelo mundo que
  guardam seu conteúdo em cache perto dos usuários. Em vez de toda requisição viajar até uma
  origem distante, o usuário acessa um servidor de edge próximo — o que significa menor
  latência, menos carga na origem e melhor uso da capacidade regional.
glossary:
  - term: Origem
    definition: "Seu data center principal — a fonte da verdade de todo o conteúdo. O CDN existe para que a maioria dos usuários nunca chegue até ela."
  - term: Servidor de edge / proxy
    definition: "Um cache perto do usuário que serve o conteúdo diretamente, reduzindo latência e carga na origem."
  - term: Sistema de roteamento
    definition: "Sabe onde está o conteúdo e aponta cada cliente para o melhor edge (geralmente o mais próximo)."
  - term: Sistema de distribuição
    definition: "Replica o conteúdo da origem para os servidores de edge."
  - term: Scrubbers
    definition: "Filtram o tráfego malicioso (ex.: DDoS) antes que chegue ao edge. Opcionais, mas sem eles o edge fica mais exposto."
  - term: Push CDN
    definition: "O conteúdo é empurrado aos edges com antecedência — bom para ativos estáticos conhecidos e populares."
  - term: Pull CDN
    definition: "O edge busca o conteúdo da origem na primeira requisição e depois faz cache — bom para conteúdo imprevisível."
  - term: Cache hit / miss no edge
    definition: "Um hit é servido pelo edge; um miss faz o edge buscar da origem primeiro e então guardar em cache."
  - term: TTL & Cache-Control
    definition: "Quanto tempo navegadores e CDNs podem reutilizar uma resposta em cache (ex.: max-age para o navegador, s-maxage para a CDN)."
  - term: Invalidação de cache
    definition: "Purgar ou versionar o conteúdo (ex.: um hash no nome do arquivo) para que os usuários recebam a nova versão antes do TTL expirar."
references:
  - label: "Cloudflare — O que é um CDN?"
    url: https://www.cloudflare.com/learning/cdn/what-is-a-cdn/
  - label: "AWS — O que é um CDN?"
    url: https://aws.amazon.com/what-is/cdn/
  - label: "MDN — CDN"
    url: https://developer.mozilla.org/en-US/docs/Glossary/CDN
---

> Use a aula interativa acima para **ver funcionando**: ligue o CDN e veja a latência
> encolher, simule o fluxo completo da requisição, compare push vs pull e trace topologias
> hierárquica vs horizontal. As notas abaixo são a referência rápida.

## O que é

Um **CDN (Content Delivery Network)** é um grupo de servidores geograficamente distribuídos
que guardam cópias do seu conteúdo em cache perto dos usuários. O usuário busca de um
**servidor de edge** próximo em vez da **origem** distante.

Ele pode servir quase tudo que é estático ou cacheável: **vídeo, imagens, áudio, HTML, sites
estáticos, assets e arquivos para download** — ou apenas parte de uma página.

CDNs modernas também **aceleram conteúdo dinâmico** (TLS termination, HTTP/2·3, compressão,
roteamento na borda) e adicionam **segurança** (WAF, proteção DDoS, edge functions) — mas
cachear conteúdo estático/cacheável é a ideia central.

## Por que importa

- **Menor latência** — o conteúdo percorre uma distância menor.
- **Menos carga na origem** — a maioria das requisições é absorvida pelo edge.
- **Melhor localidade** — os usuários são atendidos a partir da própria região.
- **Capacidade regional** — o tráfego se distribui por vários data centers em vez de um só.

## Motivação do mundo real

Um usuário na **Europa** quer assistir à **Netflix**, mas o servidor principal está nos
**EUA**. Mandar cada byte através do Atlântico significa alta latência e uma origem
sobrecarregada. Um CDN coloca uma cópia do vídeo em um **edge na Europa**, então o usuário
assiste de perto. (Use o laboratório de latência acima para sentir a diferença.)

## Como a requisição flui

As peças principais são a **origem**, o **sistema de roteamento**, o **sistema de
distribuição**, os **servidores de edge / proxy**, os **scrubbers** e um **sistema de
gerenciamento**. Em resumo:

1. Você configura a CDN com um **origin e regras de cache**, então ela sabe onde buscar.
2. O sistema de distribuição replica o conteúdo para os edges.
3. O cliente pergunta ao roteamento o melhor destino → recebe o **melhor edge** (geralmente o
   mais próximo e saudável — escolhido por latência/carga, não só por distância).
4. A requisição passa pelos scrubbers, chega ao edge, e o edge devolve o conteúdo.

*(Toque em cada componente no diagrama acima para ver o que ele faz.)* Um CDN pode dar
suporte a operações como **retrieve, request, deliver, search, update e delete** no conteúdo.

## Push vs Pull

- **Pull CDN** — o edge busca da origem na **primeira requisição** e depois faz cache. É o
  **padrão mais comum**: o primeiro acesso é um miss, os demais são rápidos. Assets estáticos
  populares funcionam muito bem aqui também (ficam em cache após o primeiro miss).
- **Push CDN** — você **pré-carrega** o conteúdo nos edges com antecedência. Vale a pena para
  **lançamentos, arquivos grandes/vídeo e evitar um primeiro acesso lento** — mas é mais para gerenciar.

## Hierárquica vs horizontal

- **Horizontal** — a origem replica para muitos edges no **mesmo nível**. Simples e plano.
- **Hierárquica** — **origem → servidores pai → servidores filho**. As camadas absorvem carga
  e mantêm o conteúdo perto; os filhos servem os usuários enquanto os pais protegem a origem.

## Atualidade do cache (TTL e invalidação)

O trade-off clássico de CDN — **atualidade vs performance**:

- **TTL alto** → mais rápido e barato, mas os usuários podem receber conteúdo **desatualizado**.
- **TTL baixo** → mais fresco, mas mais requisições voltam à origem.
- **Purge / invalidação** força a CDN a remover ou atualizar o conteúdo antes do TTL expirar.
- **Versione as URLs dos assets** (`app.v123.js` ou um hash) para que um novo deploy não sirva
  um arquivo antigo do cache.
- Os headers HTTP controlam isso, ex.: `Cache-Control: public, max-age=60, s-maxage=3600` → o
  navegador cacheia 60s, a CDN cacheia 1h.

## Trade-offs & notas práticas

- **Latência e carga na origem** caem — mas você adiciona **mais infraestrutura** para operar
  e pagar.
- **Atualidade do cache** vira uma preocupação: os edges podem servir conteúdo **desatualizado**
  até expirar ou ser purgado (TTLs e invalidação de cache importam).
- **Segurança** (WAF, proteção DDoS, scrubbers) é um **add-on** comum, não parte do conceito
  básico de CDN — útil, mas são peças extras.
- **Custo** escala com o tráfego e a abrangência; ótimo para cargas intensivas em leitura e
  conteúdo estático.

## Relevância em entrevistas

Espere ter que **explicar**, não só citar nomes:

- **Por que um CDN reduz latência** (distância menor) e a **carga na origem** (o edge absorve leituras).
- **Quando usar push vs pull** (pull é o padrão; push para pré-aquecer lançamentos/arquivos grandes).
- **Como o cache no edge muda o tráfego** (o primeiro miss preenche o cache; hits seguintes pulam a origem).
- **Por que roteamento e replicação importam** (rotear para o **melhor** edge — geralmente o
  mais próximo e saudável, por latência/carga — e manter cópias perto).
- **Atualidade do cache** (TTL vs desatualização, purge e URLs de asset versionadas).
- **Quais trade-offs mais componentes trazem** (complexidade, custo, atualidade do cache, segurança).

## Notas de aula

- CDN = guardar conteúdo em cache **perto dos usuários** → menor latência, menos carga na origem.
- **Pull** = cachear na primeira requisição (o padrão); **Push** = pré-carregar para lançamentos/arquivos grandes.
- Rotear para o **melhor** edge (latência/saúde), não só o geograficamente mais próximo.
- Mais edges/camadas ajudam a escalar, mas cuidado com a **atualidade do cache** (TTL, purge, versionamento) e o **custo**.
