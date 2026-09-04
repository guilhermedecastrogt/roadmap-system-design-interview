---
title: "O que é uma API?"
slug: what-is-an-api
description: "O contrato que permite dois sistemas conversarem — o que é de fato uma API, o que trafega no fio e como REST, webhooks e GraphQL se encaixam em volta disso."
category: blocos-fundamentais
order: 82
difficulty: beginner
status: published
tags: [api, http, contrato, integracao, arquitetura]
updatedAt: "2026-09-03"
beginnerSummary: >-
  Uma API é um contrato entre dois softwares: um lado promete "me chame assim que eu respondo
  assado", e o outro programa em cima dessa promessa. Um cliente envia uma requisição — um
  endereço, um verbo, alguns cabeçalhos, às vezes um corpo — e recebe de volta um código de
  status e uma resposta. O que acontece no meio (qual linguagem, quantos servidores, qual
  banco) fica escondido de propósito, e é justamente isso que dá valor ao contrato: qualquer
  um dos lados pode ser reconstruído sem o outro perceber. HTTP e JSON são o formato comum,
  mas não são a definição. Em cima dessa ideia existem três estilos do dia a dia: REST, em que
  o cliente pede recursos; GraphQL, em que o cliente pede exatamente os campos de que precisa;
  e webhooks, em que o provedor chama você quando um evento acontece. Não são rivais — um
  mesmo produto normalmente oferece os três.
glossary:
  - term: API
    definition: "Application Programming Interface — um contrato combinado que permite a um software usar outro sem saber como ele é construído."
  - term: Cliente e servidor
    definition: "Quem chama e quem responde. Os papéis são por chamada, não permanentes: um servidor que chama outro serviço é cliente naquela troca."
  - term: Requisição
    definition: "O que o chamador envia: um método, um endpoint, cabeçalhos e às vezes um corpo."
  - term: Resposta
    definition: "O que volta: um código de status, cabeçalhos e normalmente um corpo no formato combinado."
  - term: Endpoint
    definition: "Um endereço específico que a API expõe. Junto com o método, identifica uma operação do contrato."
  - term: Código de status
    definition: "Um resumo de três dígitos do desfecho. 2xx deu certo, 4xx a requisição estava errada, 5xx o servidor quebrou."
  - term: Payload / corpo
    definition: "O dado carregado pela requisição ou resposta — comumente JSON, mas o formato é uma escolha, não uma regra."
  - term: Autenticação
    definition: "Provar quem está chamando, normalmente com um token ou chave de API. Falhar devolve 401."
  - term: Autorização
    definition: "Decidir se aquele chamador conhecido pode fazer aquilo especificamente. Falhar devolve 403."
  - term: Contrato
    definition: "A promessa publicada: endpoints, formatos, padrão de erro e garantias em que os clientes podem confiar. Mudar isso sem aviso é o que significa 'quebrar uma API'."
  - term: API pública / de parceiros / interna
    definition: "Quem tem permissão de chamar. O público define quanta documentação, versionamento e defesa a API precisa."
  - term: API gateway
    definition: "Infraestrutura que fica na frente de uma ou mais APIs para autenticar, limitar e rotear. Ele fica na frente do contrato; ele não é o contrato."
references:
  - label: "MDN — Uma visão geral do HTTP"
    url: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Overview
  - label: "RFC 9110 — HTTP Semantics"
    url: https://www.rfc-editor.org/rfc/rfc9110.html
  - label: "MDN — Códigos de status HTTP"
    url: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status
  - label: "Google — Guia de design de APIs"
    url: https://cloud.google.com/apis/design
  - label: "Especificação OpenAPI"
    url: https://spec.openapis.org/oas/latest.html
---

> Esta é a **base de uma trilha de quatro aulas**. Use as simulações acima para enviar uma
> requisição atravessando um sistema inteiro, desmontar uma requisição e uma resposta peça por
> peça e ver quem tem permissão de chamar uma API. Depois siga o mapa para as três formas de
> usá-la: **[REST](/pt-BR/topics/rest-api)**, **[Webhooks](/pt-BR/topics/webhooks)** e
> **[GraphQL](/pt-BR/topics/graphql)**.

## O que é

Uma **API** — Application Programming Interface — é um **contrato entre dois softwares**. Um
lado publica as regras: estes são os endereços, é assim que você pergunta, é isso que volta,
os erros têm essa cara. O outro lado escreve código em cima dessas regras.

O contrato é o ponto central. Ele não diz nada sobre como o trabalho é feito, e esse silêncio é
proposital: quem fornece pode reescrever o serviço em outra linguagem, quebrá-lo em dez
serviços ou trocar o banco e, enquanto a promessa se mantiver, **nenhum chamador precisa mudar
uma linha**.

Duas coisas decorrem disso, e iniciantes costumam perder as duas:

- Uma API pode expor **dados** ("me dê o usuário 42") *e* **ações** ("seguir este usuário",
  "iniciar o estorno"). Não é só um jeito de ler uma tabela.
- **HTTP e JSON são o caso comum, não a definição.** Uma API pode falar gRPC sobre HTTP/2,
  MQTT sobre TCP ou um protocolo binário num socket, e continua sendo uma API.

## A viagem de ida e volta

*(Rode a simulação acima.)* Uma chamada é uma viagem com paradas:

**Cliente → API → serviço → banco → serviço → API → cliente**

1. **O cliente envia a requisição** montada segundo as regras da API: endereço, método,
   cabeçalhos, corpo.
2. **A API confere quem chamou** — o token é válido, a requisição está bem formada — antes de
   qualquer trabalho de negócio.
3. **O serviço aplica as regras** — esse chamador pode fazer isso, o que deve ser lido ou
   alterado.
4. **O armazenamento é lido ou gravado.**
5. **A resposta volta** como um código de status mais um corpo.

O cliente só enxerga o passo 1 e o passo 5. Todo o meio é problema de quem fornece — e manter
assim é o que torna o contrato valioso.

## Anatomia de uma chamada

*(Toque nas partes no inspetor acima.)*

**A requisição carrega:**

- **Método** — o verbo: ler, criar, substituir, remover. Intenção, antes de qualquer outra
  coisa ser lida.
- **Endpoint** — o endereço. Método mais endpoint identificam uma operação.
- **Cabeçalhos** — metadados: credenciais, tipo de conteúdo, ids de rastreio, dicas de cache.
- **Corpo** — o payload, normalmente JSON. Leituras costumam não ter; escritas quase sempre têm.

**A resposta carrega:**

- **Código de status** — a resposta curta. `2xx` deu certo, `4xx` a sua requisição estava
  errada, `5xx` o servidor quebrou. As duas famílias importam: `4xx` significa *não repita sem
  mudar nada*; `5xx` muitas vezes significa *tente de novo depois*.
- **Cabeçalhos** — tipo de conteúdo, tempo de cache, contadores de rate limit, links de
  paginação.
- **Corpo** — o dado, no formato prometido. Os clientes fazem parse disso, então mudar o
  formato quebra gente.

## Quem tem permissão de chamar

A mesma tecnologia atende públicos bem diferentes, e é o público — não o código — que define
quanta liberdade você mantém:

- **Pública** — qualquer pessoa que se cadastre. Você não muda à vontade; toda quebra exige
  versão nova e janela de migração.
- **De parceiros** — um conjunto nomeado de empresas. Público pequeno, aposta alta: uma quebra
  atinge uma relação comercial, não uma fila de suporte.
- **Interna** — outros times da sua empresa. Interna não é sinônimo de segura; confiar em tudo
  que está na rede é como um serviço comprometido vira dez.
- **Privada / do próprio produto** — seus clientes web e mobile. Você controla os dois lados e
  pode andar rápido, mas versões antigas do app seguem chamando o contrato antigo por meses.

## Como REST, webhooks e GraphQL se relacionam

Os três ficam **em cima** da ideia acima; a diferença está em **quem começa a conversa** e
**quem decide o formato da resposta**:

| | Quem começa | Direção | Formato da resposta |
|---|---|---|---|
| **REST** | O cliente | Cliente → servidor | Do servidor, por endpoint |
| **GraphQL** | O cliente | Cliente → servidor | Do cliente, campo a campo |
| **Webhooks** | O provedor, após um evento | Provedor → receptor | Um payload de evento |

A frase que vale decorar: **REST e GraphQL são pull, webhooks são push.** E eles convivem
tranquilamente — um provedor de pagamento normalmente oferece uma API REST para cobrar o
cartão, webhooks para avisar que a cobrança foi aprovada e talvez GraphQL para o próprio painel.

Cada estilo tem sua própria aula: **[REST](/pt-BR/topics/rest-api)** ·
**[Webhooks](/pt-BR/topics/webhooks)** · **[GraphQL](/pt-BR/topics/graphql)**.

## Onde entra o API gateway

Um **[API gateway](/pt-BR/topics/api-gateway) não é a API.** O gateway é infraestrutura
colocada *na frente* de uma ou mais APIs: termina TLS, autentica, aplica limites de taxa e
roteia para o serviço certo. A API é a promessa contra a qual o cliente programa.

Um jeito útil de separar: se você apagasse o gateway, o contrato continuaria existindo — você
só teria que aplicar as regras dele em outro lugar.

## Trade-offs e preocupações comuns

- **Acoplamento vs estabilidade** — a API desacopla times, mas o próprio contrato vira um
  compromisso. Todo campo publicado é um campo do qual alguém vai depender.
- **Excesso de chamadas** — uma tela montada com seis chamadas parece lenta em rede móvel. O
  remédio é design (agregar, paginar, cachear), não culpar a rede.
- **Versionamento** — no instante em que outra pessoa depende de você, renomear um campo deixa
  de ser possível. Adicione, não reaproveite.
- **Segurança** — todo endpoint público é uma porta de entrada: autenticação, autorização,
  validação de entrada, cotas e nunca confiar no que o cliente manda.
- **Falha é normal** — timeouts, falhas parciais e retentativas também fazem parte do contrato.
  Diga o que é seguro repetir.
- **Documentação faz parte do produto** — uma API sem documentação é um jogo de adivinhação;
  especificações legíveis por máquina (OpenAPI, um schema GraphQL) mantêm doc e realidade
  juntas.

## Relevância em entrevista

- **Diga o que é uma API em uma frase** — "um contrato entre sistemas": interface, não
  implementação. Esse enquadramento deixa o resto da resposta limpo.
- **Não confunda API com HTTP** — cite que HTTP/JSON é o caso comum e depois diga o que usaria
  internamente e por quê.
- **Não confunda API com API gateway** — o gateway é um componente no seu diagrama, a API é o
  contrato na borda dele.
- **Escolha o estilo de propósito** — "REST para a API pública, GraphQL para o nosso mobile,
  webhooks para avisar parceiros" é uma resposta forte e realista.
- **Traga o custo do contrato** — versionamento, depreciação e compatibilidade. Entrevistadores
  notam quando o candidato lembra que clientes sobrevivem a deploys.

## Notas de aula

- API = **contrato**. O cliente pergunta, o servidor responde, a implementação fica escondida.
- Anatomia: **método, endpoint, cabeçalhos, corpo** → **status, cabeçalhos, corpo**.
- **4xx** significa que a requisição estava errada; **5xx**, que o servidor estava. A política
  de retentativa segue disso.
- O público define a liberdade: APIs públicas e de parceiros são promessas; as privadas são
  acordos com você mesmo.
- Três estilos sobre uma ideia — pull com **REST**, pull com formato próprio com **GraphQL**,
  push com **webhooks**.
