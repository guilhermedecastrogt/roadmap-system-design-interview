---
title: "Webhooks"
slug: webhooks
description: "Callbacks HTTP orientados a eventos — como um sistema avisa o outro, e tudo que o receptor precisa sobreviver: retentativas, duplicatas, payloads forjados e eventos mortos."
category: blocos-fundamentais
order: 86
difficulty: intermediate
status: published
tags: [webhooks, eventos, integracao, idempotencia, retentativa, seguranca]
updatedAt: "2026-09-03"
beginnerSummary: >-
  Um webhook inverte a direção de uma chamada de API normal: em vez de o seu app ficar
  perguntando "aconteceu alguma coisa?", o outro sistema chama você no instante em que algo
  acontece. Você registra uma URL, o provedor envia um HTTP POST com o payload do evento e o
  seu app responde 2xx dizendo "recebi". Essa é a parte fácil. A parte difícil é tudo que pode
  dar errado numa rede: a entrega pode sofrer timeout, falhar, chegar duas vezes, chegar fora
  de ordem ou ser forjada por qualquer um que descubra sua URL. Por isso um receptor de verdade
  verifica a assinatura, responde rápido, guarda o evento, faz o trabalho pesado de forma
  assíncrona e ignora ids de evento já processados. Nenhum provedor promete entrega
  exatamente-uma-vez — eles prometem continuar tentando, o que significa que seu handler
  precisa ser idempotente.
glossary:
  - term: Webhook
    definition: "Um callback HTTP: o provedor envia uma requisição para uma URL que você registrou quando um evento acontece do lado dele."
  - term: Callback URL / endpoint
    definition: "O endereço público do seu sistema onde o provedor faz POST. É uma porta não autenticada na qual estranhos podem bater, então precisa de verificação."
  - term: Payload do evento
    definition: "O corpo da entrega: um id de evento, um tipo, um timestamp e os dados que descrevem o que aconteceu."
  - term: Id do evento
    definition: "O id único do evento — a chave pela qual você deduplica. O mesmo id chegando duas vezes é uma repetição, não um segundo evento."
  - term: Verificação de assinatura
    definition: "Recalcular um HMAC sobre o corpo cru com um segredo compartilhado e comparar em tempo constante, para provar que quem enviou é quem diz ser."
  - term: Confirmação (ack)
    definition: "A resposta 2xx dizendo ao provedor que o evento foi recebido. Envie assim que o evento estiver guardado com segurança, não depois de o trabalho terminar."
  - term: Política de retentativa
    definition: "Com que frequência e por quanto tempo um provedor repete uma entrega que falhou — tipicamente várias tentativas com backoff exponencial."
  - term: Entrega pelo menos uma vez
    definition: "A garantia realista: um evento pode chegar mais de uma vez, e duplicatas são normais, não excepcionais."
  - term: Handler idempotente
    definition: "Um handler em que processar o mesmo evento duas vezes tem o mesmo efeito de processar uma vez."
  - term: Armazenamento de falhas (dead-letter)
    definition: "Onde os eventos vão parar depois que todas as retentativas falharam, para que nada suma em silêncio e um humano possa reprocessar."
  - term: Polling
    definition: "A alternativa: o cliente pergunta repetidamente se algo mudou. Simples e amigável a firewall, mas desperdiça chamadas e reage mais devagar."
  - term: Ataque de replay
    definition: "Reenviar uma entrega válida capturada. Checagem de timestamp e janela de validade são o que limita isso."
references:
  - label: "Stripe — Receber eventos no seu endpoint de webhook"
    url: https://docs.stripe.com/webhooks
  - label: "GitHub — Boas práticas no uso de webhooks"
    url: https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks
  - label: "Standard Webhooks — especificação"
    url: https://www.standardwebhooks.com/
  - label: "MDN — Método HTTP POST"
    url: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Methods/POST
  - label: "AWS — Retentativas e backoff exponencial"
    url: https://docs.aws.amazon.com/general/latest/gr/api-retries.html
---

> Aula 3 da trilha de APIs — aquela em que o cliente para de perguntar. Use o simulador acima
> para disparar um evento e forçar cada falha: timeout, 500, assinatura forjada, duplicata.
> Depois desligue as defesas do receptor uma a uma e leia do que cada uma protegia você.

## O que é um webhook

Um **webhook** é um callback HTTP. Você registra uma URL num provedor; quando algo acontece do
lado dele, ele envia um `POST` para a sua URL com o payload do evento. Continua sendo HTTP —
mas o **modelo de comunicação está invertido**: ninguém perguntou, e o provedor é o cliente
nessa chamada.

```
O evento acontece no provedor
  → o provedor monta o payload do evento
  → o provedor assina e faz POST na sua callback URL
  → seu app verifica a assinatura
  → seu app responde 2xx imediatamente
  → seu app processa o evento de forma assíncrona
```

O exemplo canônico: um provedor de pagamento envia `payment.succeeded` para uma loja, e a loja
libera o pedido.

## Polling vs webhooks

*(Rode os dois relógios acima.)* Polling é perguntar "tem novidade?" de tempos em tempos. Em um
minuto com intervalo de 10 segundos, você faz seis chamadas, cinco não acham nada, e ainda
assim você descobre o evento com até dez segundos de atraso. O webhook faz uma chamada, no
momento que importa.

Polling não é errado — é simples, não exige endpoint público e funciona atrás de firewalls que
bloqueiam tráfego de entrada. Só fica caro quando os eventos são raros e você quer reagir
rápido. A regra prática: **empurre quando o provedor sabe primeiro, consulte quando você não
pode aceitar chamadas de entrada.**

## O que uma entrega carrega

```
POST /webhooks/provider
X-Event-Id: evt_8f21c0
X-Event-Type: payment.succeeded
X-Timestamp: 1772806927
X-Signature: sha256=4f2a9c7e1b…
X-Delivery-Attempt: 1

{ "id": "evt_8f21c0", "type": "payment.succeeded", "data": { … } }
```

Quatro campos importam mais que o resto:

- **Id do evento** — sua chave de deduplicação.
- **Tipo do evento** — o que aconteceu, para você rotear.
- **Timestamp** — permite recusar entregas velhas demais (proteção contra replay).
- **Assinatura** — um HMAC sobre o corpo cru com um segredo compartilhado. Compare em tempo
  constante e calcule sobre os **bytes crus**, antes de qualquer parse de JSON reformatar nada.

## Retentativas, duplicatas e idempotência

Uma entrega é uma chamada de rede, então pode falhar das formas de sempre — e uma delas é
traiçoeira: **um timeout não diz ao provedor se você processou o evento.** Sem saber, ele
repete. É essa a origem das duplicatas.

- Provedores repetem com **backoff exponencial** ao longo de minutos ou horas.
- A garantia realista é **pelo menos uma vez**. Ninguém promete exatamente-uma-vez — sobre uma
  rede não confiável, isso não é prometível de ponta a ponta.
- Portanto seu handler precisa ser **idempotente**: guarde os ids já processados e descarte
  repetições antes que cheguem à lógica de negócio. Duas entregas, um envio.
- **Ordem também não é garantida.** Um `created` repetido pode chegar depois do `updated`. Use
  o timestamp do evento ou um campo de versão e ignore qualquer coisa mais antiga do que já foi
  aplicado.

Quando todas as tentativas falham, um bom provedor estaciona o evento num **armazenamento de
falhas** e mostra num painel. Nada se perdeu — mas nada foi processado também, então alguém
precisa reprocessar.

## Construindo um receptor que sobrevive

*(Ligue e desligue cada defesa acima.)*

1. **Verifique a assinatura** — senão qualquer um que descubra sua URL pode forjar
   `payment.succeeded`.
2. **Responda 2xx rápido** — confirme assim que o evento estiver guardado, bem abaixo do
   timeout do provedor. Resposta lenta parece falha e dispara retentativas.
3. **Faça o trabalho de forma assíncrona** — persista, enfileire e deixe um worker cuidar da
   parte cara. Senão, uma chamada lenta a terceiros vira tempestade de retentativas.
4. **Deduplique pelo id do evento** — a linha de código que evita estorno duplicado.
5. **Não assuma ordem** — reconcilie com timestamp ou versão.

Mais duas que se pagam em produção: **registre toda entrega** (id, tipo, tentativa, resposta)
para conseguir responder "chegou?", e **exponha um endpoint de reprocessamento** para o suporte
reprocessar um evento guardado sem implorar ao provedor.

## Webhooks, APIs e filas

Os três movem mensagens, e confundi-los é um tropeço clássico de entrevista:

- Uma **API requisição/resposta** é você perguntando e ficando com a resposta. Você escolhe o
  momento.
- Um **webhook** é o sistema de outra pessoa chamando o seu porque algo aconteceu lá.
- Uma **[fila de mensagens](/pt-BR/topics/message-queue)** é infraestrutura durável *que é sua*,
  dando buffer, garantias de ordem, reprocessamento e back-pressure dentro do seu sistema.

O formato comum em produção usa dois juntos: o endpoint de webhook só verifica e enfileira; a
fila e seus workers fazem o trabalho e cuidam das retentativas.

## Trade-offs

- **Rápido e barato, mas sem garantia na primeira tentativa.** Você troca custo de polling por
  complexidade de entrega.
- **Você precisa expor um endpoint público** — mais uma superfície de ataque, e impossível em
  algumas redes.
- **O provedor controla o payload e a política de retentativa.** Você herda as escolhas dele.
- **A depuração é assíncrona.** Sem log de entregas dos dois lados, "nunca chegou" é
  infalsificável.
- **Payload magro vs payload gordo.** Mandar só ids obriga uma chamada de volta para buscar o
  dado (uma requisição a mais, mas sempre fresco e sem dado sensível em trânsito); mandar o
  objeto inteiro é mais rápido, mas pode chegar desatualizado e vaza mais se interceptado.

## Relevância em entrevista

- **Diga a direção em voz alta** — "o provedor chama a gente, então é push, não polling".
- **Traga idempotência e duplicatas antes de perguntarem.** É o sinal mais forte de que você já
  rodou webhooks em produção.
- **Nunca prometa exatamente-uma-vez.** Diga pelo menos uma vez mais handler idempotente — essa
  é a resposta correta.
- **Descreva o padrão de ack rápido** — verificar, guardar, 2xx, processar assíncrono.
- **Cite segurança de forma concreta** — assinatura sobre o corpo cru, comparação em tempo
  constante, janela de validade do timestamp, só HTTPS.
- **Saiba quando não usar** — se você não pode aceitar chamadas de entrada, ou precisa de ordem
  estrita e reprocessamento, uma fila ou uma API de feed consultada pode encaixar melhor.

## Notas de aula

- Webhook = **o provedor chama você** quando um evento acontece. Push, não pull.
- A entrega carrega **id, tipo, timestamp e assinatura** — verifique antes de confiar em nada.
- **Pelo menos uma vez** é a garantia real: retentativas e duplicatas são normais.
- Receita do receptor: **verificar → guardar → 2xx rápido → processar assíncrono → deduplicar
  pelo id**.
- Depois da última tentativa, os eventos caem no **armazenamento de falhas**; alguém precisa
  reprocessar.
