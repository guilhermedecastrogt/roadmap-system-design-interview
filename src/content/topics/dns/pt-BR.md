---
title: DNS
slug: dns
description: "Como a internet transforma um nome de domínio como youtube.com em um endereço IP — e por que continua rápido."
category: blocos-fundamentais
order: 10
difficulty: beginner
status: published
tags: [dns, networking, caching, infrastructure]
updatedAt: "2026-06-06"
beginnerSummary: >-
  O DNS (Domain Name System) é a agenda de endereços da internet. Você digita um nome
  como youtube.com e o DNS encontra o endereço IP que seu navegador precisa para
  conectar. É uma hierarquia distribuída de servidores — e o cache com TTL mantém tudo
  rápido, então a maioria das buscas nem percorre a cadeia inteira.
glossary:
  - term: Resolver
    definition: "O servidor (geralmente seu provedor ou um DNS público como 1.1.1.1) que faz o trabalho de encontrar o IP e guardar a resposta em cache."
  - term: Servidor raiz (root)
    definition: "O topo da hierarquia DNS. Ele não conhece os IPs — aponta para os nameservers que cuidam de cada TLD (.com, .org)."
  - term: Servidor TLD
    definition: "Cuida de um domínio de topo como o .com e aponta o resolver para o servidor autoritativo do domínio exato."
  - term: Servidor autoritativo
    definition: "A fonte da verdade de um domínio (ex.: youtube.com). Guarda os registros reais e devolve o solicitado (geralmente um A/AAAA com o IP)."
  - term: Consulta recursiva
    definition: "O cliente pergunta uma vez e o resolver assume a responsabilidade de devolver a resposta final, já resolvida."
  - term: Consulta iterativa
    definition: "O próprio resolver percorre a hierarquia, seguindo encaminhamentos do root ao TLD e ao autoritativo."
  - term: TTL
    definition: "Time To Live — por quanto tempo uma resposta DNS em cache pode ser reutilizada antes de uma nova busca."
  - term: Cache de DNS
    definition: "Uma resposta guardada pelo navegador e pelo resolver para que buscas repetidas sejam instantâneas, sem refazer toda a jornada."
references:
  - label: "Cloudflare — O que é DNS?"
    url: https://www.cloudflare.com/learning/dns/what-is-dns/
  - label: "MDN — O que é um nome de domínio?"
    url: https://developer.mozilla.org/pt-BR/docs/Learn/Common_questions/Web_mechanics/What_is_a_domain_name
  - label: "AWS — O que é DNS?"
    url: https://aws.amazon.com/route53/what-is-dns/
  - label: "IANA — Servidores raiz"
    url: https://www.iana.org/domains/root/servers
---

> Use a aula interativa acima para **ver** uma busca de DNS percorrer a hierarquia,
> alternar entre os modos recursivo e iterativo, e perceber como o cache deixa a
> segunda busca instantânea. As seções abaixo são a referência rápida.

## O que é

**DNS (o Domain Name System)** é a agenda de endereços da internet. Os computadores se
conectam usando endereços IP, mas as pessoas preferem nomes — então o DNS traduz um nome
de domínio na localização do recurso que queremos acessar.

```
youtube.com  ->  142.250.x.x   (apenas ilustrativo -- IPs reais mudam)
```

Sem o DNS, você teria que memorizar um IP para cada site que visita.

## Por que importa

- **Pessoas usam nomes, máquinas usam IPs.** O DNS é a ponte entre os dois.
- **Geralmente é o primeiro passo de uma requisição** — antes de chegar a um balanceador,
  API ou banco de dados (e é pulado quando a resposta já está em cache ou a conexão ainda
  está aberta).
- **É distribuído globalmente e cacheado**, o que o mantém rápido e altamente disponível
  mesmo na escala da internet.

## DNS é uma hierarquia

O DNS não é um único servidor gigante — é uma árvore de responsabilidades, e é isso que
permite escalar para a internet inteira:

- **Resolver** — seu ponto de entrada (provedor ou DNS público). Coordena a busca e
  guarda os resultados em cache.
- **Servidor raiz (root)** — aponta para os nameservers que cuidam de cada TLD
  (`.com`, `.org`…).
- **Servidor TLD** — cuida de `.com`, `.org`, `.net`… e aponta para o servidor
  autoritativo.
- **Servidor autoritativo** — a fonte da verdade que devolve o registro solicitado
  (para um site, geralmente um A/AAAA com o IP).

Cada nível sabe apenas o suficiente para te levar um passo mais perto da resposta.

> Registros DNS não são só IPs: **A/AAAA** (IPv4/IPv6), **CNAME** (apelido), **MX**
> (e-mail), **TXT**… Para navegação web você normalmente termina em um registro **A/AAAA**.

## Recursiva vs iterativa

- **Recursiva:** o cliente pergunta uma vez ao resolver, e o resolver assume a
  responsabilidade de devolver a resposta final.
- **Iterativa:** o resolver fala com cada servidor passo a passo, seguindo
  encaminhamentos (root → TLD → autoritativo) até obter a resposta autoritativa.

Em uma linha: **recursiva** é a relação *cliente ↔ resolver*; **iterativa** é a relação
*resolver ↔ hierarquia*. Os encaminhamentos vão para o **resolver**, não para o navegador.

*(Alterne entre as duas no diagrama acima para ver a diferença.)*

## Cache & TTL

A jornada completa custa várias idas e voltas na rede, então as respostas vão para o
**cache**:

- O **navegador** pode guardar resultados de DNS, e o **resolver** também os guarda.
- Cada registro é armazenado com um **TTL (Time To Live)**.
- O TTL define por quanto tempo o resultado pode ser reutilizado antes de uma nova busca.
- Isso reduz a latência e evita repetir toda a resolução a cada vez.

## Trade-offs & notas práticas

- **O TTL é um trade-off:** um TTL *baixo* mantém os registros atualizados, mas gera mais
  buscas; um TTL *alto* é mais rápido e barato, mas faz mudanças (e failovers) se
  propagarem devagar.
- **Caches desatualizados atrapalham migrações:** se você mudar para onde um domínio
  aponta, registros em cache ainda podem mandar usuários para o endereço antigo até o TTL
  expirar.
- **O DNS é uma dependência que você não controla de ponta a ponta** — use resolvers
  confiáveis e múltiplos servidores autoritativos para ter resiliência.

## Relevância em entrevistas

O DNS é um aquecimento favorito por ser fundamental:

- É a resposta clássica para **"o que acontece quando você digita uma URL e aperta
  enter?"** — a resolução de DNS vem primeiro.
- Ele naturalmente traz **latência, cache, TTLs e disponibilidade** — temas que
  reaparecem por todo o design de sistemas.
- Ele enquadra como as requisições *começam*, antes de chegarem aos seus serviços de
  backend.

Você raramente projeta o DNS em si, mas mostrar que o entende sinaliza que você pensa em
todo o caminho da requisição, não só no servidor.

## Notas de aula

- DNS = nome → registro (geralmente um IP), resolvido por uma hierarquia (resolver → root → TLD → autoritativo).
- Recursiva = cliente ↔ resolver (o resolver faz o trabalho); iterativa = resolver ↔ hierarquia (segue encaminhamentos).
- Cache + TTL é *por que* o DNS parece instantâneo — a maioria das buscas nunca chega ao root.
