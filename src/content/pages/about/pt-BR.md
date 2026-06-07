## O que é isto

Este é um **diário público e open-source de estudos para entrevistas de design de
sistemas**. Ele começou como um conjunto de anotações pessoais feitas durante um curso
online e está sendo transformado em um roadmap estruturado e bilíngue do qual qualquer
pessoa pode aprender — ou para o qual pode contribuir.

O objetivo não é ser uma enciclopédia exaustiva, mas sim um **caminho claro e guiado**
para desenvolvedores iniciantes que querem chegar a uma entrevista de design de sistemas
com confiança sobre o vocabulário, os blocos de construção e a forma como os trade-offs
são discutidos.

## Para quem é

- Desenvolvedores se preparando para suas primeiras entrevistas de design de sistemas.
- Engenheiros autodidatas e de bootcamp que nunca tiveram uma disciplina formal de "sistemas distribuídos".
- Qualquer pessoa que aprende melhor com um roadmap do que com uma pilha de artigos soltos.

## Como está organizado

O conteúdo é agrupado em quatro seções que se constroem umas sobre as outras:

1. **Introdução** — o que é design de sistemas e como usar este roadmap.
2. **Blocos Fundamentais** — os componentes centrais de que todo sistema é feito: DNS, CDN, balanceadores de carga, caches, filas, bancos de dados e mais.
3. **Tópicos de Entrevista** — frameworks e o que os entrevistadores realmente procuram.
4. **Exemplos Práticos** — resoluções completas de questões clássicas.

Cada tópico segue a mesma estrutura — *o que é*, *por que importa*, *conceitos-chave*,
*discussão de arquitetura*, *trade-offs*, *relevância em entrevistas* e mais — então você
sempre sabe onde procurar.

## Como é construído

O site é uma aplicação Next.js (App Router) escrita em TypeScript, estilizada com Tailwind
CSS e localizada com next-intl. O conteúdo vive em arquivos Markdown com frontmatter
tipado e validado por zod, então o roadmap da página inicial é gerado automaticamente a
partir dos tópicos que existem — não há nada para manter sincronizado manualmente.

> Este é um documento vivo. Tópicos marcados como **planejado** ou **em andamento** são
> exatamente onde novas contribuições são mais bem-vindas.
