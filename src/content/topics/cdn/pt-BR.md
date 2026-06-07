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

1. A origem registra seu conteúdo no sistema de roteamento.
2. O sistema de distribuição replica o conteúdo para os edges.
3. O cliente pergunta ao roteamento o melhor destino → recebe o edge mais próximo.
4. A requisição passa pelos scrubbers, chega ao edge, e o edge devolve o conteúdo.

*(Toque em cada componente no diagrama acima para ver o que ele faz.)* Um CDN pode dar
suporte a operações como **retrieve, request, deliver, search, update e delete** no conteúdo.

## Push vs Pull

- **Push CDN** — você empurra o conteúdo aos edges proativamente. Melhor para ativos
  **conhecidos, populares e estáticos** que dá para pré-carregar.
- **Pull CDN** — o edge busca da origem na **primeira requisição** e depois faz cache. Melhor
  para conteúdo **imprevisível**; o primeiro acesso é um miss, os demais são rápidos.

## Hierárquica vs horizontal

- **Horizontal** — a origem replica para muitos edges no **mesmo nível**. Simples e plano.
- **Hierárquica** — **origem → servidores pai → servidores filho**. As camadas absorvem carga
  e mantêm o conteúdo perto; os filhos servem os usuários enquanto os pais protegem a origem.

## Trade-offs & notas práticas

- **Latência e carga na origem** caem — mas você adiciona **mais infraestrutura** para operar
  e pagar.
- **Atualidade do cache** vira uma preocupação: os edges podem servir conteúdo **desatualizado**
  até expirar ou ser purgado (TTLs e invalidação de cache importam).
- **Controle operacional e segurança** melhoram com um sistema de gerenciamento e scrubbers —
  mas ambos são peças extras (e opcionais).
- **Custo** escala com o tráfego e a abrangência; ótimo para cargas intensivas em leitura e
  conteúdo estático.

## Relevância em entrevistas

Espere ter que **explicar**, não só citar nomes:

- **Por que um CDN reduz latência** (distância menor) e a **carga na origem** (o edge absorve leituras).
- **Quando usar push vs pull** (previsível/popular → push; imprevisível → pull).
- **Como o cache no edge muda o tráfego** (o primeiro miss preenche o cache; hits seguintes pulam a origem).
- **Por que roteamento e replicação importam** (rotear ao edge saudável mais próximo; manter cópias perto).
- **Quais trade-offs mais componentes trazem** (complexidade, custo, atualidade do cache, segurança).

## Notas de aula

- CDN = guardar conteúdo em cache **perto dos usuários** → menor latência, menos carga na origem.
- **Push** = pré-carregar ativos conhecidos; **Pull** = cachear na primeira requisição.
- Mais edges/camadas ajudam a escalar, mas cuidado com a **atualidade do cache** e o aumento de **complexidade/custo**.
