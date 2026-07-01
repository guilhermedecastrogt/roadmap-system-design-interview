import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the Message Queue lesson. Same convention as the
 * other topics: long-form prose lives in the Markdown file; the strings that
 * drive the throughput lab, the image-processing flow, the fan-out diagram,
 * and the delivery-semantics / DLQ visual live here, typed & bilingual.
 */

export type MqImageNodeId = 'serverA' | 'bucket' | 'queue' | 'serverB';

type StepText = { title: string; text: string };
type CompareRow = { aspect: string; a: string; b: string };

export type DeliveryCard = {
  id: 'at-most' | 'at-least' | 'exactly';
  label: string;
  tagline: string;
  loss: string;
  dup: string;
  cost: string;
  when: string;
};

export type MessageQueueContent = {
  lab: {
    title: string;
    subtitle: string;
    producer: string;
    producerSub: string;
    queue: string;
    consumer: string;
    consumerSub: string;
    rate: string;
    consumerFixed: string;
    play: string;
    pause: string;
    burst: string;
    reset: string;
    produced: string;
    consumed: string;
    inQueue: string;
    peak: string;
    emptyHint: string;
    overflowNote: string;
    note: string;
  };
  imageFlow: {
    title: string;
    subtitle: string;
    ui: {
      start: string;
      replay: string;
      step: string;
      of: string;
      prev: string;
      next: string;
      tapHint: string;
      diagramTitle: string;
    };
    hint: string;
    packets: Record<string, string>;
    nodes: Record<MqImageNodeId, { label: string; sublabel: string; detail: string }>;
    steps: StepText[];
  };
  fanout: {
    title: string;
    subtitle: string;
    producer: string;
    queue: string;
    publish: string;
    publishing: string;
    reset: string;
    knockDown: string;
    restore: string;
    downBadge: string;
    okBadge: string;
    consumers: { id: string; label: string; sublabel: string }[];
    isolationNote: string;
    compare: {
      title: string;
      subtitle: string;
      aTitle: string;
      bTitle: string;
      rows: CompareRow[];
    };
  };
  delivery: {
    title: string;
    subtitle: string;
    rowLoss: string;
    rowDup: string;
    rowCost: string;
    rowWhen: string;
    cards: DeliveryCard[];
  };
  dlq: {
    title: string;
    subtitle: string;
    process: string;
    processing: string;
    reset: string;
    poisonOn: string;
    poisonOff: string;
    consumer: string;
    mainQueue: string;
    dlqLabel: string;
    attempt: string;
    of: string;
    delivered: string;
    failed: string;
    retrying: string;
    movedToDlq: string;
    idleHint: string;
    note: string;
  };
};

const en: MessageQueueContent = {
  lab: {
    title: 'Async systems lab — buffering & backpressure',
    subtitle:
      'The producer sends messages at the rate you pick. The consumer drains just 1/sec (like Server B compressing images). Push the producer past the consumer and watch the queue absorb the burst instead of dropping it.',
    producer: 'Producer',
    producerSub: 'Server A',
    queue: 'Queue',
    consumer: 'Consumer',
    consumerSub: 'Server B · 1 img/s',
    rate: 'Producer rate',
    consumerFixed: 'Consumer: 1 / s (fixed)',
    play: 'Run',
    pause: 'Pause',
    burst: 'Burst +8',
    reset: 'Reset',
    produced: 'produced',
    consumed: 'consumed',
    inQueue: 'in queue',
    peak: 'peak depth',
    emptyHint: 'Queue empty — producer and consumer are keeping pace.',
    overflowNote: 'Backlog growing — this is backpressure. In real life: add more consumers.',
    note: 'The queue never drops the burst — it holds a backlog and the consumer drains it at a safe, sustainable rate. That is buffering.',
  },
  imageFlow: {
    title: 'Image-processing flow',
    subtitle:
      'The right way to move a big payload through a queue: store the binary in a bucket, put only a pointer on the queue.',
    ui: {
      start: 'Run the flow',
      replay: 'Replay',
      step: 'Step',
      of: 'of',
      prev: 'Back',
      next: 'Next',
      tapHint: 'Tap any component to see its role',
      diagramTitle: 'Upload → bucket → queue → compress',
    },
    hint: 'Server A never waits on Server B. The message carries a pointer, not the image bytes.',
    packets: {
      image: 'image bytes',
      stored: 'object key',
      msg: 'msg · pointer',
      read: 'msg',
      fetch: 'get object',
      bytes: 'image bytes',
      compress: 'compress',
    },
    nodes: {
      serverA: {
        label: 'Server A',
        sublabel: 'producer',
        detail: 'Receives image uploads. Instead of calling Server B directly, it stores the image and enqueues a small message. Then it is free to accept the next upload.',
      },
      bucket: {
        label: 'Object storage',
        sublabel: 'bucket',
        detail: 'Holds the actual image bytes. Big binaries live here — never on the queue. Returns a key/URL that the message can reference.',
      },
      queue: {
        label: 'Queue',
        sublabel: 'e.g. Amazon SQS',
        detail: 'Buffers small messages, each carrying a pointer to the image plus metadata. Durable, external, and drained at the consumer’s pace.',
      },
      serverB: {
        label: 'Server B',
        sublabel: 'consumer · 1 img/s',
        detail: 'Reads a message, fetches the referenced image from the bucket, and compresses it — at its own sustainable rate.',
      },
    },
    steps: [
      { title: 'Upload the image', text: 'Server A stores the image bytes in the object-storage bucket.' },
      { title: 'Bucket returns a key', text: 'The bucket hands back an object key / URL for the stored image.' },
      { title: 'Enqueue a pointer', text: 'Server A sends a small message to the queue — a pointer to the image plus metadata, not the binary.' },
      { title: 'Consumer reads the message', text: 'Server B pulls the next message from the queue when it is ready.' },
      { title: 'Fetch from the bucket', text: 'Using the pointer, Server B requests the actual image bytes from the bucket.' },
      { title: 'Bucket returns the bytes', text: 'The image bytes travel to Server B.' },
      { title: 'Compress', text: 'Server B compresses the image — at 1/sec, while Server A kept accepting uploads the whole time.' },
    ],
  },
  fanout: {
    title: 'Fan-out & isolation',
    subtitle:
      'One event, many independent consumers. Knock one down and watch the others keep processing — the producer never notices.',
    producer: 'Producer',
    queue: 'Event pipeline',
    publish: 'Publish event',
    publishing: 'Publishing…',
    reset: 'Reset',
    knockDown: 'Knock down analytics',
    restore: 'Restore analytics',
    downBadge: 'DOWN',
    okBadge: 'ok',
    consumers: [
      { id: 'notify', label: 'Notifications', sublabel: 'sends emails / push' },
      { id: 'analytics', label: 'Analytics', sublabel: '~300 ms per event' },
      { id: 'search', label: 'Search index', sublabel: 'updates the index' },
    ],
    isolationNote:
      'Analytics is down, but notifications and search still process. Without a queue, Server A would call all three directly and get dragged down by the slowest and least reliable one.',
    compare: {
      title: 'Without MQ vs With MQ',
      subtitle: 'Who does the producer depend on?',
      aTitle: 'Without a queue',
      bTitle: 'With a queue',
      rows: [
        { aspect: 'Producer calls', a: 'Every downstream directly', b: 'The queue, once' },
        { aspect: 'One downstream is down', a: 'Producer retries, slows, may fail', b: 'Others keep working; producer unaffected' },
        { aspect: 'Coupled to', a: 'The slowest / least reliable dependency', b: 'Nothing — only the queue' },
        { aspect: 'Add a new consumer', a: 'Change the producer', b: 'Just subscribe to the queue' },
        { aspect: 'Style', a: 'Synchronous', b: 'Asynchronous' },
      ],
    },
  },
  delivery: {
    title: 'Delivery semantics',
    subtitle: 'How many times might a message be delivered? Pick your guarantee — each is a trade-off.',
    rowLoss: 'Can lose messages?',
    rowDup: 'Can duplicate?',
    rowCost: 'Cost / complexity',
    rowWhen: 'Use when',
    cards: [
      {
        id: 'at-most',
        label: 'At-most-once',
        tagline: 'Zero or one delivery',
        loss: 'Yes — may be lost',
        dup: 'No',
        cost: 'Lowest',
        when: 'An occasional dropped event is acceptable (e.g. some metrics).',
      },
      {
        id: 'at-least',
        label: 'At-least-once',
        tagline: 'One or more deliveries',
        loss: 'No',
        dup: 'Yes — may repeat',
        cost: 'Moderate',
        when: 'The common default. Make consumers idempotent to absorb duplicates.',
      },
      {
        id: 'exactly',
        label: 'Exactly-once',
        tagline: 'Effectively processed once',
        loss: 'No',
        dup: 'No',
        cost: 'Highest',
        when: 'You truly cannot tolerate loss or duplicates — usually at-least-once + dedup.',
      },
    ],
  },
  dlq: {
    title: 'Retries & the dead-letter queue',
    subtitle:
      'A message that keeps failing must not block the queue forever. After N retries it is moved aside to a dead-letter queue.',
    process: 'Process message',
    processing: 'Processing…',
    reset: 'Reset',
    poisonOn: 'Poison message: ON',
    poisonOff: 'Poison message: OFF',
    consumer: 'Consumer',
    mainQueue: 'Main queue',
    dlqLabel: 'Dead-letter queue',
    attempt: 'Attempt',
    of: 'of',
    delivered: 'Processed successfully',
    failed: 'Failed',
    retrying: 'Failed — retrying…',
    movedToDlq: 'Max retries hit → moved to the DLQ for inspection & replay.',
    idleHint: 'Toggle "poison message" to force failures, then process to watch the retries and the DLQ.',
    note: 'A DLQ parks poison messages so the main queue keeps flowing. You inspect, fix, and replay them later.',
  },
};

const ptBR: MessageQueueContent = {
  lab: {
    title: 'Laboratório de sistemas assíncronos — buffering e backpressure',
    subtitle:
      'O produtor envia mensagens no ritmo que você escolher. O consumidor drena só 1/s (como o Servidor B comprimindo imagens). Empurre o produtor além do consumidor e veja a fila absorver a rajada em vez de descartá-la.',
    producer: 'Produtor',
    producerSub: 'Servidor A',
    queue: 'Fila',
    consumer: 'Consumidor',
    consumerSub: 'Servidor B · 1 img/s',
    rate: 'Ritmo do produtor',
    consumerFixed: 'Consumidor: 1 / s (fixo)',
    play: 'Rodar',
    pause: 'Pausar',
    burst: 'Rajada +8',
    reset: 'Reiniciar',
    produced: 'produzidas',
    consumed: 'consumidas',
    inQueue: 'na fila',
    peak: 'pico de profundidade',
    emptyHint: 'Fila vazia — produtor e consumidor estão no mesmo ritmo.',
    overflowNote: 'Backlog crescendo — isto é backpressure. Na vida real: adicione mais consumidores.',
    note: 'A fila nunca descarta a rajada — ela segura um backlog e o consumidor o drena num ritmo seguro e sustentável. Isso é buffering.',
  },
  imageFlow: {
    title: 'Fluxo de processamento de imagens',
    subtitle:
      'O jeito certo de passar um payload grande por uma fila: guarde o binário num bucket e coloque só um ponteiro na fila.',
    ui: {
      start: 'Rodar o fluxo',
      replay: 'Repetir',
      step: 'Passo',
      of: 'de',
      prev: 'Voltar',
      next: 'Próximo',
      tapHint: 'Toque em um componente para ver o papel dele',
      diagramTitle: 'Upload → bucket → fila → comprimir',
    },
    hint: 'O Servidor A nunca espera pelo Servidor B. A mensagem carrega um ponteiro, não os bytes da imagem.',
    packets: {
      image: 'bytes da imagem',
      stored: 'chave do objeto',
      msg: 'msg · ponteiro',
      read: 'msg',
      fetch: 'buscar objeto',
      bytes: 'bytes da imagem',
      compress: 'comprimir',
    },
    nodes: {
      serverA: {
        label: 'Servidor A',
        sublabel: 'produtor',
        detail: 'Recebe uploads de imagens. Em vez de chamar o Servidor B diretamente, ele guarda a imagem e enfileira uma mensagem pequena. Então fica livre para aceitar o próximo upload.',
      },
      bucket: {
        label: 'Object storage',
        sublabel: 'bucket',
        detail: 'Guarda os bytes reais da imagem. Binários grandes ficam aqui — nunca na fila. Retorna uma chave/URL que a mensagem pode referenciar.',
      },
      queue: {
        label: 'Fila',
        sublabel: 'ex.: Amazon SQS',
        detail: 'Bufferiza mensagens pequenas, cada uma com um ponteiro para a imagem mais metadados. Durável, externa e drenada no ritmo do consumidor.',
      },
      serverB: {
        label: 'Servidor B',
        sublabel: 'consumidor · 1 img/s',
        detail: 'Lê uma mensagem, busca a imagem referenciada no bucket e a comprime — no seu próprio ritmo sustentável.',
      },
    },
    steps: [
      { title: 'Envia a imagem', text: 'O Servidor A guarda os bytes da imagem no bucket de object storage.' },
      { title: 'Bucket retorna uma chave', text: 'O bucket devolve uma chave/URL do objeto para a imagem guardada.' },
      { title: 'Enfileira um ponteiro', text: 'O Servidor A manda uma mensagem pequena para a fila — um ponteiro para a imagem mais metadados, não o binário.' },
      { title: 'Consumidor lê a mensagem', text: 'O Servidor B puxa a próxima mensagem da fila quando estiver pronto.' },
      { title: 'Busca no bucket', text: 'Usando o ponteiro, o Servidor B pede os bytes reais da imagem ao bucket.' },
      { title: 'Bucket retorna os bytes', text: 'Os bytes da imagem viajam até o Servidor B.' },
      { title: 'Comprime', text: 'O Servidor B comprime a imagem — a 1/s, enquanto o Servidor A seguiu aceitando uploads o tempo todo.' },
    ],
  },
  fanout: {
    title: 'Fan-out e isolamento',
    subtitle:
      'Um evento, muitos consumidores independentes. Derrube um e veja os outros continuarem processando — o produtor nem percebe.',
    producer: 'Produtor',
    queue: 'Pipeline de eventos',
    publish: 'Publicar evento',
    publishing: 'Publicando…',
    reset: 'Reiniciar',
    knockDown: 'Derrubar analytics',
    restore: 'Restaurar analytics',
    downBadge: 'FORA',
    okBadge: 'ok',
    consumers: [
      { id: 'notify', label: 'Notificações', sublabel: 'envia e-mails / push' },
      { id: 'analytics', label: 'Analytics', sublabel: '~300 ms por evento' },
      { id: 'search', label: 'Índice de busca', sublabel: 'atualiza o índice' },
    ],
    isolationNote:
      'O analytics está fora, mas notificações e busca continuam processando. Sem uma fila, o Servidor A chamaria os três diretamente e seria arrastado pelo mais lento e menos confiável.',
    compare: {
      title: 'Sem MQ vs Com MQ',
      subtitle: 'De quem o produtor depende?',
      aTitle: 'Sem uma fila',
      bTitle: 'Com uma fila',
      rows: [
        { aspect: 'Produtor chama', a: 'Cada downstream diretamente', b: 'A fila, uma vez' },
        { aspect: 'Um downstream cai', a: 'Produtor faz retry, fica lento, pode falhar', b: 'Os outros seguem; produtor não é afetado' },
        { aspect: 'Acoplado a', a: 'A dependência mais lenta / menos confiável', b: 'Nada — só à fila' },
        { aspect: 'Adicionar um consumidor', a: 'Mudar o produtor', b: 'Só assinar a fila' },
        { aspect: 'Estilo', a: 'Síncrono', b: 'Assíncrono' },
      ],
    },
  },
  delivery: {
    title: 'Semântica de entrega',
    subtitle: 'Quantas vezes uma mensagem pode ser entregue? Escolha sua garantia — cada uma é um trade-off.',
    rowLoss: 'Pode perder mensagens?',
    rowDup: 'Pode duplicar?',
    rowCost: 'Custo / complexidade',
    rowWhen: 'Use quando',
    cards: [
      {
        id: 'at-most',
        label: 'No máximo uma vez',
        tagline: 'Zero ou uma entrega',
        loss: 'Sim — pode perder',
        dup: 'Não',
        cost: 'O menor',
        when: 'Perder um evento de vez em quando é aceitável (ex.: algumas métricas).',
      },
      {
        id: 'at-least',
        label: 'Pelo menos uma vez',
        tagline: 'Uma ou mais entregas',
        loss: 'Não',
        dup: 'Sim — pode repetir',
        cost: 'Moderado',
        when: 'O padrão mais comum. Torne os consumidores idempotentes para absorver duplicatas.',
      },
      {
        id: 'exactly',
        label: 'Exatamente uma vez',
        tagline: 'Efetivamente processada uma vez',
        loss: 'Não',
        dup: 'Não',
        cost: 'O maior',
        when: 'Você realmente não tolera perda nem duplicata — normalmente at-least-once + dedup.',
      },
    ],
  },
  dlq: {
    title: 'Retries e a dead-letter queue',
    subtitle:
      'Uma mensagem que continua falhando não pode travar a fila para sempre. Após N tentativas, ela é movida para uma dead-letter queue.',
    process: 'Processar mensagem',
    processing: 'Processando…',
    reset: 'Reiniciar',
    poisonOn: 'Mensagem envenenada: LIGADA',
    poisonOff: 'Mensagem envenenada: DESLIGADA',
    consumer: 'Consumidor',
    mainQueue: 'Fila principal',
    dlqLabel: 'Dead-letter queue',
    attempt: 'Tentativa',
    of: 'de',
    delivered: 'Processada com sucesso',
    failed: 'Falhou',
    retrying: 'Falhou — tentando de novo…',
    movedToDlq: 'Máximo de tentativas → movida para a DLQ para inspeção e reprocessamento.',
    idleHint: 'Ligue a "mensagem envenenada" para forçar falhas, depois processe para ver os retries e a DLQ.',
    note: 'Uma DLQ estaciona mensagens envenenadas para a fila principal seguir fluindo. Você as inspeciona, corrige e reprocessa depois.',
  },
};

export const messageQueueContent: Record<Locale, MessageQueueContent> = {
  en,
  'pt-BR': ptBR,
};
