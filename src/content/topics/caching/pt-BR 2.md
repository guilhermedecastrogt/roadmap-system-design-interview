---
title: Cache
slug: caching
description: Guardar cópias de resultados caros perto de onde são necessários para reduzir latência e carga — e o custo de consistência que isso traz.
category: high-level-design
order: 20
difficulty: intermediate
status: published
tags: [performance, cache, consistency]
updatedAt: 2026-01-22
beginnerSummary: >-
  Um cache é um armazenamento pequeno e rápido que mantém cópias de dados que, de outra
  forma, você recomputaria ou buscaria de novo. Acertar o cache economiza uma ida lenta ao
  banco ou à rede. O porém é que cópias em cache podem ficar desatualizadas, então cache é,
  na verdade, uma troca entre velocidade e atualidade.
glossary:
  - term: Cache hit / miss
    definition: Um hit é quando o dado pedido está no cache; um miss significa recorrer à fonte da verdade.
  - term: TTL
    definition: Time to live — por quanto tempo uma entrada permanece válida antes de expirar e precisar ser buscada de novo.
  - term: Política de evicção
    definition: "A regra para descartar entradas quando o cache enche (ex.: LRU — menos usado recentemente)."
  - term: Cache stampede
    definition: Muitas requisições dando miss na mesma chave ao mesmo tempo e martelando a fonte; mitigado com locks ou coalescência de requisições.
references:
  - label: "AWS — Visão geral de cache"
    url: https://aws.amazon.com/caching/
  - label: "Redis — Padrões de cache"
    url: https://redis.io/docs/latest/develop/use/patterns/
---

## O que é

Um **cache** é um armazenamento rápido, geralmente em memória, que mantém cópias de dados
para que requisições futuras sejam atendidas sem repetir trabalho caro — uma consulta ao
banco, uma chamada de API ou uma computação pesada. Cache aparece em todas as camadas:
caches de CPU, o navegador, um CDN, um cache de aplicação como o Redis e dentro do próprio
banco.

## Por que importa

Cache é a ferramenta de desempenho de maior alavancagem na maioria dos sistemas. Uma
leitura servida da memória é ordens de grandeza mais rápida que uma do disco ou pela rede,
e todo cache hit é carga que nunca chega ao seu banco. Em uma entrevista, "adicionar um
cache" costuma ser o maior ganho que você pode propor para sistemas intensivos em leitura.

## Conceitos-chave

- **Onde fica** — cliente/navegador, CDN (borda), cache de aplicação (Redis/Memcached),
  cache de consulta do banco. Cada um é mais próximo do usuário e mais barato, mas mais
  difícil de invalidar.
- **Estratégias de leitura** — *cache-aside* (a app checa o cache, depois o BD, depois
  preenche o cache) é o padrão comum; *read-through* esconde isso atrás da biblioteca de cache.
- **Estratégias de escrita** — *write-through* (escreve cache + BD juntos), *write-back*
  (escreve no cache agora, no BD depois — rápido, mas mais arriscado), *write-around*
  (escreve no BD, pula o cache).
- **Expiração e evicção** — TTLs limitam a desatualização; políticas de evicção (LRU/LFU)
  decidem o que descartar quando enche.
- **Invalidação** — manter o cache em sincronia com a fonte da verdade. Notoriamente um dos
  dois problemas difíceis da computação.

## Discussão de arquitetura

```
cliente ─▶ CDN ─▶ balanceador ─▶ app ──(1) checa──▶ cache (Redis)
                                  │                    │ miss
                                  └──(2) no miss──▶ banco de dados
                                     (3) preenche cache ◀┘
```

Um serviço intensivo em leitura tipicamente coloca um CDN para conteúdo estático/de borda e
um cache de aplicação para dados dinâmicos "quentes". O banco continua sendo a fonte da
verdade; os caches absorvem a maior parte das leituras.

## Componentes

- **Armazenamento de cache** — o sistema chave/valor em memória (Redis, Memcached) ou os nós de borda do CDN.
- **Cliente / biblioteca de cache** — encapsula a estratégia de leitura/escrita na aplicação.
- **Lógica de invalidação** — TTLs, deletes explícitos na escrita ou invalidação por eventos.
- **Fonte da verdade** — o banco ou serviço que o cache protege.

## Interfaces

- **App ↔ Cache** — operações simples `get(key)` / `set(key, value, ttl)` / `delete(key)`.
- **App ↔ BD** — o caminho de fallback tomado em um miss.
- **Canal de invalidação** — nas escritas, a app (ou um stream de eventos/CDC) avisa o cache
  para descartar ou atualizar as chaves afetadas.

## Fluxos

Leitura cache-aside:

1. A app procura a chave no cache.
2. **Hit** → retorna o valor em cache.
3. **Miss** → lê do banco, armazena no cache com um TTL, retorna.

Escrita com invalidação:

1. A app escreve o novo valor no banco.
2. A app deleta (ou atualiza) a chave de cache correspondente.
3. A próxima leitura dá miss e repopula dados frescos.

## Perspectiva de engenharia de software

- **Escolha um esquema de chave** estável e sem colisões (ex.: `user:123:profile`).
- **Sempre defina um TTL**, mesmo quando invalida explicitamente — é sua rede de segurança
  contra bugs que deixam dados desatualizados.
- **Proteja-se contra stampedes** com um lock curto ou "single-flight" para que apenas uma
  requisição reconstrua uma chave quente no miss.
- **Decida o comportamento em falha**: se o cache cair, você recorre ao BD (mais lento, mas
  correto) ou falha rápido? Geralmente, recorra ao BD.

## Trade-offs

- **Velocidade vs atualidade** — a tensão central; TTLs menores são mais frescos, mas batem
  mais na fonte.
- **Custo vs taxa de hit** — mais memória significa mais hits, até retornos decrescentes.
- **Complexidade vs desempenho** — todo cache adiciona um caminho de invalidação que pode
  servir dados errados se você errar.
- **Write-back: throughput vs durabilidade** — escritas rápidas, mas dados podem ser
  perdidos se o cache morrer antes de descarregar.

## Relevância em entrevistas

- Use um cache no momento em que um sistema é **intensivo em leitura** ou tem um **conjunto
  de dados quente**.
- Diga a **estratégia** (cache-aside é um padrão seguro) e o plano de **invalidação** —
  respostas vagas de "vamos cachear" serão sondadas.
- Mencione **TTLs** e ao menos reconheça **stampede** e **dados desatualizados** como riscos.
- Saiba que um **CDN é um cache** para conteúdo estático e de borda — proponha-o para mídia
  e usuários geograficamente espalhados.

## Exemplos práticos

- **Perfis de usuário** — cache-aside no Redis com TTL de 5 minutos; delete a chave na
  atualização do perfil.
- **Catálogo de produtos** — CDN para imagens, cache de aplicação para o JSON do produto;
  invalide em mudanças de preço via evento.
- **Rate limiting / sessões** — Redis usado como o armazenamento compartilhado rápido que
  torna os app servers sem estado.

## Notas de aula

- "Intensivo em leitura" é a palavra-gatilho para cache — diga isso e os entrevistadores concordam.
- Nunca suba um cache sem TTL; a invalidação explícita acabará deixando passar um caso.
- Um CDN conta como cache — não esqueça a camada de borda para mídia e ativos estáticos.
