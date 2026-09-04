import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the Webhooks lesson. Payloads and headers are shared
 * across locales; only the explanations are translated.
 */

export type EventId = 'payment' | 'upload' | 'tweet';
export type OutcomeId = 'ok' | 'timeout' | 'error500' | 'badSignature' | 'duplicate';
export type DeliveryStage =
  | 'event'
  | 'payload'
  | 'sign'
  | 'post'
  | 'verify'
  | 'ack'
  | 'process'
  | 'retry'
  | 'dlq';
export type GuardId = 'signature' | 'fastAck' | 'async' | 'dedupe' | 'order';

export type EventWire = {
  name: string;
  id: string;
  payload: string;
};

/** The three events the simulator can fire. */
export const eventWire: Record<EventId, EventWire> = {
  payment: {
    name: 'payment.succeeded',
    id: 'evt_8f21c0',
    payload: `{
  "id": "evt_8f21c0",
  "type": "payment.succeeded",
  "createdAt": "2026-09-03T14:22:07Z",
  "data": {
    "paymentId": "pay_5512",
    "orderId": "ord_309",
    "amount": 12990,
    "currency": "BRL"
  }
}`,
  },
  upload: {
    name: 'image.uploaded',
    id: 'evt_3b90aa',
    payload: `{
  "id": "evt_3b90aa",
  "type": "image.uploaded",
  "createdAt": "2026-09-03T14:24:31Z",
  "data": {
    "assetId": "img_771",
    "bucket": "user-uploads",
    "bytes": 2481203
  }
}`,
  },
  tweet: {
    name: 'tweet.created',
    id: 'evt_c1d704',
    payload: `{
  "id": "evt_c1d704",
  "type": "tweet.created",
  "createdAt": "2026-09-03T14:26:02Z",
  "data": {
    "tweetId": "t_902",
    "authorId": "u_42"
  }
}`,
  },
};

/** Headers the provider sends with every delivery. */
export function deliveryHeaders(event: EventWire, attempt: number, valid: boolean): string {
  return `POST /webhooks/provider HTTP/1.1
Host: shop.example.com
Content-Type: application/json
X-Event-Id: ${event.id}
X-Event-Type: ${event.name}
X-Timestamp: 1772806927
X-Signature: sha256=${valid ? '4f2a9c7e1b…' : '00000000dead…'}
X-Delivery-Attempt: ${attempt}`;
}

export type WebhooksContent = {
  shared: {
    provider: string;
    receiver: string;
    queue: string;
    reset: string;
    trigger: string;
    running: string;
  };
  polling: {
    title: string;
    subtitle: string;
    runLabel: string;
    runningLabel: string;
    pollingTitle: string;
    webhookTitle: string;
    pollingSub: string;
    webhookSub: string;
    asking: string;
    nothingNew: string;
    gotIt: string;
    idle: string;
    delivered: string;
    eventHappens: string;
    wastedLabel: string;
    latencyLabel: string;
    seconds: string;
    note: string;
  };
  delivery: {
    title: string;
    subtitle: string;
    eventLabel: string;
    outcomeLabel: string;
    events: { id: EventId; label: string }[];
    outcomes: { id: OutcomeId; label: string; explain: string }[];
    stages: { id: DeliveryStage; label: string }[];
    attemptLabel: string;
    backoffLabel: string;
    headersTitle: string;
    payloadTitle: string;
    timelineTitle: string;
    timelineEmpty: string;
    dlqTitle: string;
    dlqEmpty: string;
    dlqNote: string;
    ackedNote: string;
    note: string;
  };
  receiver: {
    title: string;
    subtitle: string;
    onLabel: string;
    offLabel: string;
    guards: {
      id: GuardId;
      label: string;
      does: string;
      risk: string;
    }[];
    healthyTitle: string;
    healthy: string;
    riskTitle: string;
    note: string;
  };
  neighbours: {
    title: string;
    subtitle: string;
    items: { id: string; label: string; what: string; when: string }[];
    whatLabel: string;
    whenLabel: string;
    note: string;
  };
};

const en: WebhooksContent = {
  shared: {
    provider: 'Provider',
    receiver: 'Your app',
    queue: 'Queue',
    reset: 'Reset',
    trigger: 'Trigger event',
    running: 'Delivering…',
  },
  polling: {
    title: 'Polling vs webhooks',
    subtitle:
      'Same event, same minute, two ways of learning about it. Run both clocks and watch how many calls it takes to find out something happened.',
    runLabel: 'Run 60 seconds',
    runningLabel: 'Running…',
    pollingTitle: 'Polling',
    webhookTitle: 'Webhook',
    pollingSub: 'Your app asks every 10s: anything new?',
    webhookSub: 'The provider calls you the moment it happens.',
    asking: 'GET /payments?since=…',
    nothingNew: 'nothing new',
    gotIt: 'found it',
    idle: 'quiet',
    delivered: 'POST /webhooks · delivered',
    eventHappens: 'payment succeeds here',
    wastedLabel: 'Calls that found nothing',
    latencyLabel: 'Delay until you knew',
    seconds: 's',
    note: 'Polling is not wrong — it is simple, and it works through firewalls that block inbound calls. It is just expensive when events are rare and you want to know fast.',
  },
  delivery: {
    title: 'Webhook delivery simulator',
    subtitle:
      'Fire an event and choose how the receiver behaves. Delivery is a network call like any other — it can be slow, fail, arrive twice, or arrive forged.',
    eventLabel: 'Event',
    outcomeLabel: 'Receiver responds with',
    events: [
      { id: 'payment', label: 'payment.succeeded' },
      { id: 'upload', label: 'image.uploaded' },
      { id: 'tweet', label: 'tweet.created' },
    ],
    outcomes: [
      {
        id: 'ok',
        label: '200 OK',
        explain:
          'The receiver verified the signature and answered fast. The provider marks the delivery as done and moves on — the heavy work happens after the response, not before it.',
      },
      {
        id: 'timeout',
        label: 'Timeout',
        explain:
          'The receiver took too long — usually because it did the real work before answering. The provider cannot tell "slow" from "lost", so it will retry, and your job may run twice.',
      },
      {
        id: 'error500',
        label: '500 error',
        explain:
          'The receiver is broken right now. Retries with growing backoff give it time to recover; after the last attempt the event lands in a dead-letter store for humans.',
      },
      {
        id: 'badSignature',
        label: 'Invalid signature',
        explain:
          'The payload does not match the signature, so this delivery is not trustworthy. Reject it. Anyone on the internet can POST to a public URL — the signature is what proves the sender.',
      },
      {
        id: 'duplicate',
        label: 'Duplicate delivery',
        explain:
          'The same event id arrives again — a retry of something already processed. A receiver that keys on the event id ignores it; one that does not ships the order twice.',
      },
    ],
    stages: [
      { id: 'event', label: 'Event happens' },
      { id: 'payload', label: 'Payload built' },
      { id: 'sign', label: 'Signed' },
      { id: 'post', label: 'POST to callback URL' },
      { id: 'verify', label: 'Signature verified' },
      { id: 'ack', label: 'Acknowledged (2xx)' },
      { id: 'process', label: 'Processed asynchronously' },
      { id: 'retry', label: 'Retrying with backoff' },
      { id: 'dlq', label: 'Moved to dead-letter store' },
    ],
    attemptLabel: 'Attempt',
    backoffLabel: 'backoff',
    headersTitle: 'Request headers',
    payloadTitle: 'Event payload',
    timelineTitle: 'Delivery timeline',
    timelineEmpty: 'No deliveries yet. Trigger an event.',
    dlqTitle: 'Dead-letter store',
    dlqEmpty: 'Empty.',
    dlqNote: 'Nothing was lost — but nothing was processed either. Someone has to replay it.',
    ackedNote: 'Acknowledged in time. The provider stops here; your queue does the rest.',
    note: 'No provider promises exactly-once delivery. They promise to keep trying — which means at-least-once, which means your handler must be idempotent.',
  },
  receiver: {
    title: 'Building a receiver that survives reality',
    subtitle:
      'Five guards. Switch one off to see what it was protecting you from — every one of these is a real production incident.',
    onLabel: 'on',
    offLabel: 'off',
    guards: [
      {
        id: 'signature',
        label: 'Verify the signature',
        does: 'Recompute the HMAC over the raw body with the shared secret and compare it in constant time.',
        risk: 'Anyone who learns your callback URL can POST fake events. "Payment succeeded" is a fun one to forge.',
      },
      {
        id: 'fastAck',
        label: 'Answer 2xx quickly',
        does: 'Acknowledge as soon as the event is safely stored — target well under the provider’s timeout.',
        risk: 'Slow answers look like failures. The provider retries, and the same event is processed again while the first run is still going.',
      },
      {
        id: 'async',
        label: 'Do the work asynchronously',
        does: 'Persist the event, push it to a queue, and let a worker do the expensive part.',
        risk: 'Any slow downstream call — email, PDF, third-party API — turns into a webhook timeout and a retry storm.',
      },
      {
        id: 'dedupe',
        label: 'Deduplicate by event id',
        does: 'Store processed event ids and drop repeats before they reach business logic.',
        risk: 'Retries and duplicate deliveries get processed twice: two shipments, two refunds, two emails.',
      },
      {
        id: 'order',
        label: 'Do not assume order',
        does: 'Use the event timestamp or a version field and ignore updates older than what you already applied.',
        risk: 'A retried "created" arrives after "updated" and overwrites fresh data with stale data.',
      },
    ],
    healthyTitle: 'All guards on',
    healthy:
      'Forged events are rejected, retries are absorbed, duplicates are ignored, and slow work never threatens the delivery. This is the boring, correct receiver.',
    riskTitle: 'What you just exposed yourself to',
    note: 'A webhook endpoint is a public, unauthenticated door into your system that strangers can knock on. Treat it with the same suspicion as any other public input.',
  },
  neighbours: {
    title: 'Webhooks, APIs and queues — related, not interchangeable',
    subtitle: 'They are often used together, and confusing them is a classic interview stumble.',
    items: [
      {
        id: 'api',
        label: 'Request/response API',
        what: 'You ask, the other side answers, and you hold the result in your hand.',
        when: 'You need data now, and you are the one who knows when you need it.',
      },
      {
        id: 'webhook',
        label: 'Webhook',
        what: 'Someone else’s system calls yours when something happened over there.',
        when: 'You need to react to events in a system you do not control, without polling it.',
      },
      {
        id: 'queue',
        label: 'Message queue',
        what: 'Durable infrastructure you own: producers write, consumers read at their own pace.',
        when: 'You need buffering, ordering guarantees, replay, and back-pressure inside your own system.',
      },
    ],
    whatLabel: 'What it is',
    whenLabel: 'Reach for it when',
    note: 'The common production shape is both: the webhook endpoint only validates and enqueues; the queue and its workers do the real work and own the retries.',
  },
};

const ptBR: WebhooksContent = {
  shared: {
    provider: 'Provedor',
    receiver: 'Seu app',
    queue: 'Fila',
    reset: 'Reiniciar',
    trigger: 'Disparar evento',
    running: 'Entregando…',
  },
  polling: {
    title: 'Polling vs webhooks',
    subtitle:
      'O mesmo evento, no mesmo minuto, descoberto de duas formas. Rode os dois relógios e veja quantas chamadas custa saber que algo aconteceu.',
    runLabel: 'Rodar 60 segundos',
    runningLabel: 'Rodando…',
    pollingTitle: 'Polling',
    webhookTitle: 'Webhook',
    pollingSub: 'Seu app pergunta a cada 10s: tem novidade?',
    webhookSub: 'O provedor chama você no instante em que acontece.',
    asking: 'GET /payments?since=…',
    nothingNew: 'nada novo',
    gotIt: 'achei',
    idle: 'silêncio',
    delivered: 'POST /webhooks · entregue',
    eventHappens: 'o pagamento acontece aqui',
    wastedLabel: 'Chamadas que não acharam nada',
    latencyLabel: 'Atraso até você saber',
    seconds: 's',
    note: 'Polling não é errado — é simples e funciona atrás de firewalls que bloqueiam chamadas de entrada. Só fica caro quando os eventos são raros e você quer saber rápido.',
  },
  delivery: {
    title: 'Simulador de entrega de webhook',
    subtitle:
      'Dispare um evento e escolha como o receptor se comporta. Entrega é uma chamada de rede como qualquer outra — pode demorar, falhar, chegar duas vezes ou chegar forjada.',
    eventLabel: 'Evento',
    outcomeLabel: 'O receptor responde',
    events: [
      { id: 'payment', label: 'payment.succeeded' },
      { id: 'upload', label: 'image.uploaded' },
      { id: 'tweet', label: 'tweet.created' },
    ],
    outcomes: [
      {
        id: 'ok',
        label: '200 OK',
        explain:
          'O receptor validou a assinatura e respondeu rápido. O provedor marca a entrega como concluída e segue em frente — o trabalho pesado acontece depois da resposta, não antes.',
      },
      {
        id: 'timeout',
        label: 'Timeout',
        explain:
          'O receptor demorou demais — normalmente porque fez o trabalho de verdade antes de responder. O provedor não distingue "lento" de "perdido", então vai repetir, e seu job pode rodar duas vezes.',
      },
      {
        id: 'error500',
        label: 'Erro 500',
        explain:
          'O receptor está quebrado agora. Retentativas com backoff crescente dão tempo de ele se recuperar; depois da última tentativa o evento cai num armazenamento de falhas para humanos.',
      },
      {
        id: 'badSignature',
        label: 'Assinatura inválida',
        explain:
          'O payload não bate com a assinatura, então essa entrega não é confiável. Recuse. Qualquer um na internet pode fazer POST numa URL pública — a assinatura é o que prova quem enviou.',
      },
      {
        id: 'duplicate',
        label: 'Entrega duplicada',
        explain:
          'O mesmo id de evento chega de novo — retentativa de algo já processado. Um receptor que chaveia pelo id ignora; um que não chaveia envia o pedido duas vezes.',
      },
    ],
    stages: [
      { id: 'event', label: 'O evento acontece' },
      { id: 'payload', label: 'Payload montado' },
      { id: 'sign', label: 'Assinado' },
      { id: 'post', label: 'POST na callback URL' },
      { id: 'verify', label: 'Assinatura verificada' },
      { id: 'ack', label: 'Confirmado (2xx)' },
      { id: 'process', label: 'Processado de forma assíncrona' },
      { id: 'retry', label: 'Repetindo com backoff' },
      { id: 'dlq', label: 'Movido para o armazenamento de falhas' },
    ],
    attemptLabel: 'Tentativa',
    backoffLabel: 'backoff',
    headersTitle: 'Cabeçalhos da requisição',
    payloadTitle: 'Payload do evento',
    timelineTitle: 'Linha do tempo da entrega',
    timelineEmpty: 'Nenhuma entrega ainda. Dispare um evento.',
    dlqTitle: 'Armazenamento de falhas',
    dlqEmpty: 'Vazio.',
    dlqNote: 'Nada se perdeu — mas nada foi processado também. Alguém precisa reprocessar.',
    ackedNote: 'Confirmado a tempo. O provedor para por aqui; sua fila faz o resto.',
    note: 'Nenhum provedor promete entrega exatamente-uma-vez. Eles prometem continuar tentando — ou seja, pelo menos uma vez, ou seja, seu handler precisa ser idempotente.',
  },
  receiver: {
    title: 'Construindo um receptor que sobrevive à realidade',
    subtitle:
      'Cinco defesas. Desligue uma para ver do que ela protegia — todas elas são incidentes reais de produção.',
    onLabel: 'ligada',
    offLabel: 'desligada',
    guards: [
      {
        id: 'signature',
        label: 'Verificar a assinatura',
        does: 'Recalcular o HMAC sobre o corpo cru com o segredo compartilhado e comparar em tempo constante.',
        risk: 'Qualquer um que descobrir sua callback URL pode enviar eventos falsos. "Pagamento aprovado" é um bom candidato a forjar.',
      },
      {
        id: 'fastAck',
        label: 'Responder 2xx rápido',
        does: 'Confirmar assim que o evento estiver guardado com segurança — bem abaixo do timeout do provedor.',
        risk: 'Resposta lenta parece falha. O provedor repete, e o mesmo evento é processado de novo enquanto o primeiro ainda roda.',
      },
      {
        id: 'async',
        label: 'Fazer o trabalho de forma assíncrona',
        does: 'Persistir o evento, jogar numa fila e deixar um worker fazer a parte cara.',
        risk: 'Qualquer chamada lenta lá na frente — e-mail, PDF, API de terceiro — vira timeout de webhook e tempestade de retentativas.',
      },
      {
        id: 'dedupe',
        label: 'Deduplicar pelo id do evento',
        does: 'Guardar os ids já processados e descartar repetições antes de chegarem à lógica de negócio.',
        risk: 'Retentativas e entregas duplicadas são processadas duas vezes: dois envios, dois estornos, dois e-mails.',
      },
      {
        id: 'order',
        label: 'Não assumir ordem',
        does: 'Usar o timestamp do evento ou um campo de versão e ignorar atualizações mais antigas do que a já aplicada.',
        risk: 'Um "created" repetido chega depois do "updated" e sobrescreve dado novo com dado velho.',
      },
    ],
    healthyTitle: 'Todas as defesas ligadas',
    healthy:
      'Eventos forjados são recusados, retentativas são absorvidas, duplicatas são ignoradas e o trabalho lento nunca ameaça a entrega. É o receptor chato e correto.',
    riskTitle: 'A que você acabou de se expor',
    note: 'Um endpoint de webhook é uma porta pública e não autenticada do seu sistema, na qual estranhos podem bater. Trate com a mesma desconfiança de qualquer outra entrada pública.',
  },
  neighbours: {
    title: 'Webhooks, APIs e filas — parentes, não intercambiáveis',
    subtitle: 'São usados juntos com frequência, e confundi-los é um tropeço clássico de entrevista.',
    items: [
      {
        id: 'api',
        label: 'API requisição/resposta',
        what: 'Você pergunta, o outro lado responde, e você fica com o resultado na mão.',
        when: 'Você precisa do dado agora, e é você quem sabe quando precisa.',
      },
      {
        id: 'webhook',
        label: 'Webhook',
        what: 'O sistema de outra pessoa chama o seu quando algo aconteceu lá.',
        when: 'Você precisa reagir a eventos de um sistema que não controla, sem ficar consultando.',
      },
      {
        id: 'queue',
        label: 'Fila de mensagens',
        what: 'Infraestrutura durável que é sua: produtores escrevem, consumidores leem no ritmo deles.',
        when: 'Você precisa de buffer, garantias de ordem, reprocessamento e back-pressure dentro do seu sistema.',
      },
    ],
    whatLabel: 'O que é',
    whenLabel: 'Use quando',
    note: 'O formato comum em produção é usar os dois: o endpoint de webhook só valida e enfileira; a fila e seus workers fazem o trabalho e cuidam das retentativas.',
  },
};

export const webhooksContent: Record<Locale, WebhooksContent> = { en, 'pt-BR': ptBR };
