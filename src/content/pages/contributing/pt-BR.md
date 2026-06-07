## Você é muito bem-vindo aqui

Este projeto cresce com contribuições. Você não precisa ser especialista em sistemas
distribuídos — esclarecer uma frase, corrigir um erro de digitação ou traduzir um
parágrafo são contribuições genuinamente valiosas.

## Formas de contribuir

- **Explicações** — torne uma seção confusa mais clara ou adicione um exemplo.
- **Correções** — corrija erros técnicos, de digitação ou links quebrados.
- **Diagramas** — adicione diagramas em ASCII ou imagem para ilustrar fluxos e arquiteturas.
- **Exemplos** — contribua com cenários práticos no estilo de entrevista.
- **Traduções** — mantenha as versões em inglês e português-BR sincronizadas, ou comece um novo idioma.

## Adicionando ou editando um tópico

Cada tópico é um arquivo Markdown em:

```
src/content/topics/<slug>/<locale>.md
```

Por exemplo, o tópico de balanceador de carga fica em
`src/content/topics/load-balancer/en.md` e `.../pt-BR.md`.

O frontmatter no topo do arquivo é **tipado e validado**. Copie um tópico existente como
modelo e mantenha estes campos:

```yaml
---
title: Balanceador de Carga
slug: load-balancer
description: Resumo de uma frase exibido nos cards.
category: blocos-fundamentais   # introducao | blocos-fundamentais | topicos-de-entrevista | exemplos-praticos
order: 10                     # posição dentro do estágio
difficulty: beginner          # beginner | intermediate | advanced
status: published             # planned | in-progress | published
tags: [networking, availability]
updatedAt: 2026-01-15         # AAAA-MM-DD
beginnerSummary: Uma explicação curta e amigável em um parágrafo.
glossary:
  - term: Health check
    definition: Uma verificação periódica que diz ao balanceador se um servidor está vivo.
references:
  - label: Referência de exemplo
    url: https://example.com
---
```

O corpo usa cabeçalhos de seção padronizados com `## `. Mantenha-os nesta ordem para que
todos os tópicos sejam lidos de forma consistente:

`## What it is` · `## Why it matters` · `## Key concepts` · `## Architecture discussion` ·
`## Components` · `## Modules` · `## Interfaces` · `## Flows` ·
`## Software engineering perspective` · `## Trade-offs` · `## Interview relevance` ·
`## Practical examples` · `## Class notes`

> Dica: nas traduções em português, você pode traduzir os títulos das seções normalmente
> (ex.: `## O que é`). O sumário lateral é gerado a partir dos cabeçalhos `##` do arquivo.

Um tópico não precisa de todas as seções — comece pelo que você sabe e deixe o resto para
o próximo contribuidor.

## Ambiente local

```bash
npm install
npm run dev          # inicia o servidor em http://localhost:3000
npm run validate:content   # valida o frontmatter de todos os tópicos
npm run typecheck    # TypeScript
npm run build        # build de produção completo
```

## Checklist do pull request

1. `npm run validate:content` passa.
2. `npm run build` é bem-sucedido.
3. Se você editou a versão em inglês de um tópico, indique no PR se a versão em português
   ainda precisa ser atualizada (e vice-versa).
4. Mantenha um tópico / uma ideia por PR quando possível — facilita a revisão.

Obrigado por ajudar outros desenvolvedores a aprender. 💚
