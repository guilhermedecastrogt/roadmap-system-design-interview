---
title: Cache
slug: caching
description: "Um armazenamento pequeno e rápido que mantém cópias de dados quentes por perto — trocando um pouco de atualidade por muita velocidade."
category: blocos-fundamentais
order: 40
difficulty: intermediate
status: published
tags: [cache, performance, redis, http, infrastructure]
updatedAt: "2026-06-07"
beginnerSummary: >-
  Um cache é um armazenamento pequeno, rápido (e mais caro) que mantém cópias de dados
  usados com frequência perto de onde são necessários — assim você evita trabalho lento e
  repetido, como consultas ao banco ou idas entre regiões. O porém: cópias em cache podem
  ficar desatualizadas, então o cache troca um pouco de atualidade por muita velocidade.
glossary:
  - term: Cache hit / miss
    definition: "Um hit é servido pelo cache; um miss significa que o dado não está em cache, então recorre-se à fonte (e normalmente o guarda)."
  - term: TTL
    definition: "Time To Live — por quanto tempo uma entrada em cache pode ser reutilizada antes de expirar e precisar ser atualizada."
  - term: Cache-aside
    definition: "A app checa o cache e, no miss, lê o banco e preenche o cache ela mesma."
  - term: Read / Write-through
    definition: "O cache fica entre a app e o banco; leituras e escritas passam pelo cache, que se mantém populado."
  - term: Cache-Control
    definition: "Header HTTP que define por quanto tempo navegadores e CDNs podem reutilizar uma resposta (ex.: max-age para o navegador, s-maxage para a CDN)."
  - term: ETag
    definition: "Uma impressão digital da versão de uma resposta. O navegador revalida com If-None-Match; o servidor responde 304 Not Modified se nada mudou."
  - term: Vary
    definition: "Diz aos caches quais headers da requisição mudam a resposta (ex.: Vary: Accept-Encoding), para não servir a variante errada."
  - term: Evicção
    definition: "Quando o cache enche, uma política (ex.: LRU — menos usado recentemente) decide quais entradas descartar."
references:
  - label: "Cloudflare — O que é caching?"
    url: https://www.cloudflare.com/learning/cdn/what-is-caching/
  - label: "Redis — Padrões de cache"
    url: https://redis.io/docs/latest/develop/use/patterns/
  - label: "MDN — Cache HTTP"
    url: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Caching
---

> Use a aula interativa acima para **sentir a diferença**: ligue o cache e veja a latência e
> a carga do banco despencarem, rode cache-aside vs read/write-through e veja onde os caches
> vivem. As notas abaixo são a referência rápida.

## O que é

Um **cache** é um armazenamento temporário e rápido que guarda cópias de dados que você, de
outra forma, recomputaria ou buscaria de novo. Acertar o cache pula o caminho lento — uma
consulta ao banco, uma ida entre regiões ou uma computação pesada.

## Por que importa

A memória de cache é **menor, mais rápida, mais cara e não serve para armazenamento de longo
prazo** — e é justamente esse o ponto. Uma leitura da memória é ordens de grandeza mais
rápida que uma do disco ou pela rede. Cada hit:

- **economiza recursos** e permite **atender mais clientes**,
- **melhora a responsividade**, e
- **reduz a pressão** sobre o backend e o banco de dados.

## O problema da latência

Um cliente em **São Paulo** acessa um backend e banco em **us-east-1**. Sem cache, toda
requisição cruza o continente para consultar o banco — facilmente **100–300 ms**. Um cache
perto do cliente (ou do backend) serve leituras repetidas em **poucos milissegundos**. *(Use
o laboratório acima para ver.)*

## Onde os caches vivem

Cache não é uma caixa só — acontece em **cada salto**:

- **Cache do navegador** — ativos estáticos guardados no dispositivo (sem rede).
- **Cache de borda (CDN)** — imagens, vídeo e assets de um edge próximo.
- **Cache de backend** — um armazenamento em memória como **Redis / Memcached** para dados
  quentes, sessões e consultas caras, perto do backend ou como serviço gerenciado.

## Cache hit vs miss

- **Hit** — o dado está no cache → retorna na hora.
- **Miss** — não está → busca na fonte, guarda e retorna. A próxima leitura é um hit.

## O que cachear (e o que não)

Bons candidatos: **dados lidos com frequência, computações caras, ativos estáticos** e, às
vezes, **checagens de sessão/auth**. Evite cachear **tudo**, **dados muito sensíveis** sem
cuidado, dados **raramente usados** ou dados que **ficam velhos na hora** sem plano.

## Cache-aside

O padrão mais comum. A app está no comando:

1. A requisição pelo produto X chega ao backend.
2. O backend checa o cache (ex.: Redis).
3. **Hit** → retorna. **Miss** → lê o banco, **preenche o cache** e então retorna.

## Read-through / write-through

O cache fica **entre** a app e o banco:

- **Read-through** — a app lê só do cache; no miss, o **cache** busca no banco e o guarda.
- **Write-through** — as escritas passam pelo cache até o banco juntas, então o cache fica
  consistente (ao custo de escritas mais lentas).

## Controles de cache HTTP

Para conteúdo web, o cache é controlado por headers:

- **`Cache-Control: public, max-age=60, s-maxage=3600`** — navegador cacheia 60s, CDN cacheia 1h.
- **`ETag`** — uma impressão digital da versão; o navegador revalida com `If-None-Match` e
  recebe um barato `304 Not Modified` se nada mudou.
- **`Vary`** — diz aos caches quais headers da requisição mudam a resposta (ex.:
  `Vary: Accept-Encoding`), para não servir a variante errada.

## Trade-offs

Cache **não** é só "armazenamento mais rápido" — ele adiciona trade-offs reais:

- **Velocidade vs atualidade** — dados em cache podem estar **desatualizados**; TTLs limitam isso.
- **Invalidação é difícil** — saber *quando* descartar ou atualizar uma entrada é um dos
  problemas clássicos difíceis.
- **Consistência** — mais cópias dos dados significam mais chances de divergirem.
- **Complexidade** — todo cache é mais uma peça móvel e mais um modo de falha.

## Relevância em entrevistas

- **Por que ajuda** — menos idas lentas; **leituras servidas da memória**.
- **Como protege o banco** — hits nunca chegam ao banco (veja o contador de BD no laboratório).
- **O que cachear** — dados quentes, intensivos em leitura e caros; não tudo.
- **Dados velhos e invalidação** — nomeie o trade-off; cite TTLs e purge.
- **CDN vs cache de backend** — CDN para conteúdo estático/de borda; Redis para dados dinâmicos quentes.

## Notas de aula

- "Intensivo em leitura" é a palavra-gatilho para cache — comece por isso.
- Cache-aside = a app preenche o cache; read/write-through = a camada de cache faz isso.
- Nunca suba um cache sem um plano de atualidade (TTL + invalidação).
