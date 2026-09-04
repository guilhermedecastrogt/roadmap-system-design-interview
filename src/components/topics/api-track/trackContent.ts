import { type Locale } from '@/i18n/routing';

/**
 * Shared content for the "API communication" mini-track: the track navigation,
 * the cross-topic communication map, and the interactive style comparison.
 * Every lesson in the track (What is an API?, REST API, Webhooks, GraphQL,
 * gRPC) renders these, so the strings live here instead of being duplicated in
 * each topic's own `content.ts`.
 */

export type TrackStyleId = 'rest' | 'webhooks' | 'graphql' | 'grpc';
export type TrackNodeId = 'overview' | TrackStyleId;

export type TrackStep = {
  id: TrackNodeId;
  slug: string;
  label: string;
  tagline: string;
};

/** One branch of the map: a communication style hanging off the API hub. */
export type MapBranch = {
  id: TrackStyleId;
  /** Node labels for the three-node mini flow, left to right. */
  nodes: [string, string, string];
  /** `forward` = left-to-right (client pulls); `push` = right-to-left. */
  motion: 'forward' | 'push';
  label: string;
  question: string;
  initiator: string;
  payload: string;
  oneLiner: string;
  wire: string;
};

export type CompareDimension = {
  id: string;
  label: string;
  values: Record<TrackStyleId, string>;
};

export type TrackContent = {
  steps: TrackStep[];
  nav: {
    trackLabel: string;
    stepOf: string;
    prev: string;
    next: string;
    hub: string;
  };
  map: {
    title: string;
    subtitle: string;
    hubLabel: string;
    hubSub: string;
    youAreHere: string;
    tapHint: string;
    openLesson: string;
    initiatorLabel: string;
    payloadLabel: string;
    wireLabel: string;
    branches: MapBranch[];
    note: string;
  };
  compare: {
    title: string;
    subtitle: string;
    styles: Record<TrackStyleId, string>;
    focusHint: string;
    allLabel: string;
    dimensions: CompareDimension[];
    note: string;
  };
};

const en: TrackContent = {
  steps: [
    {
      id: 'overview',
      slug: 'what-is-an-api',
      label: 'What is an API?',
      tagline: 'The contract between systems',
    },
    {
      id: 'rest',
      slug: 'rest-api',
      label: 'REST API',
      tagline: 'Resources over HTTP',
    },
    {
      id: 'webhooks',
      slug: 'webhooks',
      label: 'Webhooks',
      tagline: 'Events pushed to you',
    },
    {
      id: 'graphql',
      slug: 'graphql',
      label: 'GraphQL',
      tagline: 'Ask for exactly the fields',
    },
    {
      id: 'grpc',
      slug: 'grpc',
      label: 'gRPC',
      tagline: 'Typed calls between services',
    },
  ],
  nav: {
    trackLabel: 'API communication track',
    stepOf: 'Step {n} of {total}',
    prev: 'Previous',
    next: 'Next',
    hub: 'Back to the map',
  },
  map: {
    title: 'The API communication map',
    subtitle:
      'One contract, three common ways to use it. Tap a branch to see who starts the conversation and which way the data moves.',
    hubLabel: 'API',
    hubSub: 'the contract',
    youAreHere: 'you are here',
    tapHint: 'Tap a branch to replay its flow',
    openLesson: 'Open lesson',
    initiatorLabel: 'Who starts',
    payloadLabel: 'What travels',
    wireLabel: 'Usually over',
    branches: [
      {
        id: 'rest',
        nodes: ['Client', 'GET /tweets', 'Server'],
        motion: 'forward',
        label: 'REST',
        question: 'How does a client read or change a resource?',
        initiator: 'The client, whenever it needs data',
        payload: 'A resource the server decided the shape of',
        oneLiner: 'The client asks for a resource; the server answers with it.',
        wire: 'HTTP + JSON',
      },
      {
        id: 'webhooks',
        nodes: ['Receiver', 'POST /hooks', 'Provider'],
        motion: 'push',
        label: 'Webhooks',
        question: 'How does one system tell another that something happened?',
        initiator: 'The provider, right after an event happens',
        payload: 'An event describing what just happened',
        oneLiner: 'Nobody asks. The provider calls you when the event occurs.',
        wire: 'HTTP POST',
      },
      {
        id: 'graphql',
        nodes: ['Client', 'query { … }', 'Server'],
        motion: 'forward',
        label: 'GraphQL',
        question: 'How does a client get exactly the fields it needs?',
        initiator: 'The client, describing the shape it wants',
        payload: 'A response shaped by the query the client wrote',
        oneLiner: 'The client sends the shape; the server fills it in.',
        wire: 'HTTP, usually one endpoint',
      },
      {
        id: 'grpc',
        nodes: ['Service A', 'GetUser(id)', 'Service B'],
        motion: 'forward',
        label: 'gRPC',
        question: 'How do two services call each other cheaply and often?',
        initiator: 'The calling service — it looks like a local function call',
        payload: 'A typed message, encoded as compact binary',
        oneLiner: 'You call a method. Both sides were generated from the same contract.',
        wire: 'HTTP/2 + Protocol Buffers',
      },
    ],
    note: 'These are not rivals. A single product often exposes REST for public integrations, GraphQL for its own apps, webhooks to notify partners, and gRPC between its own services.',
  },
  compare: {
    title: 'Four styles, side by side',
    subtitle:
      'Same seven questions asked of each style. Focus one to mute the others — the differences that matter are in the first two rows.',
    styles: { rest: 'REST', webhooks: 'Webhooks', graphql: 'GraphQL', grpc: 'gRPC' },
    focusHint: 'Focus a style',
    allLabel: 'Show all',
    dimensions: [
      {
        id: 'pattern',
        label: 'Communication pattern',
        values: {
          rest: 'Request / response',
          webhooks: 'Event notification',
          graphql: 'Query & mutation, still request / response',
          grpc: 'Remote procedure call, with four streaming modes',
        },
      },
      {
        id: 'initiator',
        label: 'Who initiates',
        values: {
          rest: 'The client',
          webhooks: 'The provider, after an event',
          graphql: 'The client',
          grpc: 'The calling service; either side may then stream',
        },
      },
      {
        id: 'direction',
        label: 'Typical direction',
        values: {
          rest: 'Client → server',
          webhooks: 'Provider → receiver',
          graphql: 'Client → GraphQL server',
          grpc: 'Service → service, usually inside the network',
        },
      },
      {
        id: 'transport',
        label: 'Common transport',
        values: {
          rest: 'HTTP, JSON bodies, many endpoints',
          webhooks: 'HTTP POST to a URL you registered',
          graphql: 'HTTP, commonly a single endpoint',
          grpc: 'HTTP/2 with binary Protocol Buffers',
        },
      },
      {
        id: 'shape',
        label: 'Response shape',
        values: {
          rest: 'Defined by the server, per endpoint',
          webhooks: 'An event payload defined by the provider',
          graphql: 'Defined by the client, field by field',
          grpc: 'A typed message declared in the .proto contract',
        },
      },
      {
        id: 'fit',
        label: 'Best fit',
        values: {
          rest: 'Public APIs, CRUD on resources, cacheable reads',
          webhooks: 'Integrations that need to react soon after an event',
          graphql: 'Rich UIs and mobile screens with nested data needs',
          grpc: 'Chatty internal calls, low latency, streaming',
        },
      },
      {
        id: 'challenge',
        label: 'Main challenge',
        values: {
          rest: 'Consistent endpoint design and versioning over time',
          webhooks: 'Retries, duplicates, signature checks, idempotency',
          graphql: 'Query complexity, resolver performance, caching',
          grpc: 'Not browser-native, harder to inspect, needs codegen',
        },
      },
    ],
    note: 'Pick per need, not per fashion: the same backend can serve all three, and often does.',
  },
};

const ptBR: TrackContent = {
  steps: [
    {
      id: 'overview',
      slug: 'what-is-an-api',
      label: 'O que é uma API?',
      tagline: 'O contrato entre sistemas',
    },
    {
      id: 'rest',
      slug: 'rest-api',
      label: 'API REST',
      tagline: 'Recursos sobre HTTP',
    },
    {
      id: 'webhooks',
      slug: 'webhooks',
      label: 'Webhooks',
      tagline: 'Eventos enviados até você',
    },
    {
      id: 'graphql',
      slug: 'graphql',
      label: 'GraphQL',
      tagline: 'Peça exatamente os campos',
    },
    {
      id: 'grpc',
      slug: 'grpc',
      label: 'gRPC',
      tagline: 'Chamadas tipadas entre serviços',
    },
  ],
  nav: {
    trackLabel: 'Trilha de comunicação por API',
    stepOf: 'Passo {n} de {total}',
    prev: 'Anterior',
    next: 'Próximo',
    hub: 'Voltar ao mapa',
  },
  map: {
    title: 'O mapa da comunicação por API',
    subtitle:
      'Um contrato, três formas comuns de usá-lo. Toque em um ramo para ver quem começa a conversa e para onde os dados vão.',
    hubLabel: 'API',
    hubSub: 'o contrato',
    youAreHere: 'você está aqui',
    tapHint: 'Toque em um ramo para repetir o fluxo',
    openLesson: 'Abrir aula',
    initiatorLabel: 'Quem começa',
    payloadLabel: 'O que trafega',
    wireLabel: 'Normalmente sobre',
    branches: [
      {
        id: 'rest',
        nodes: ['Cliente', 'GET /tweets', 'Servidor'],
        motion: 'forward',
        label: 'REST',
        question: 'Como um cliente lê ou altera um recurso?',
        initiator: 'O cliente, sempre que precisa do dado',
        payload: 'Um recurso no formato que o servidor definiu',
        oneLiner: 'O cliente pede um recurso; o servidor responde com ele.',
        wire: 'HTTP + JSON',
      },
      {
        id: 'webhooks',
        nodes: ['Receptor', 'POST /hooks', 'Provedor'],
        motion: 'push',
        label: 'Webhooks',
        question: 'Como um sistema avisa o outro de que algo aconteceu?',
        initiator: 'O provedor, logo depois que o evento acontece',
        payload: 'Um evento descrevendo o que acabou de acontecer',
        oneLiner: 'Ninguém pergunta. O provedor chama você quando o evento ocorre.',
        wire: 'HTTP POST',
      },
      {
        id: 'graphql',
        nodes: ['Cliente', 'query { … }', 'Servidor'],
        motion: 'forward',
        label: 'GraphQL',
        question: 'Como o cliente recebe exatamente os campos de que precisa?',
        initiator: 'O cliente, descrevendo o formato que quer',
        payload: 'Uma resposta moldada pela query que o cliente escreveu',
        oneLiner: 'O cliente envia o formato; o servidor preenche.',
        wire: 'HTTP, geralmente um endpoint só',
      },
      {
        id: 'grpc',
        nodes: ['Serviço A', 'GetUser(id)', 'Serviço B'],
        motion: 'forward',
        label: 'gRPC',
        question: 'Como dois serviços se chamam de forma barata e frequente?',
        initiator: 'O serviço que chama — parece uma função local',
        payload: 'Uma mensagem tipada, codificada em binário compacto',
        oneLiner: 'Você chama um método. Os dois lados foram gerados do mesmo contrato.',
        wire: 'HTTP/2 + Protocol Buffers',
      },
    ],
    note: 'Não são rivais. Um mesmo produto costuma expor REST para integrações públicas, GraphQL para os próprios apps, webhooks para avisar parceiros e gRPC entre os próprios serviços.',
  },
  compare: {
    title: 'Quatro estilos, lado a lado',
    subtitle:
      'As mesmas sete perguntas para cada estilo. Foque um para silenciar os outros — as diferenças que mais importam estão nas duas primeiras linhas.',
    styles: { rest: 'REST', webhooks: 'Webhooks', graphql: 'GraphQL', grpc: 'gRPC' },
    focusHint: 'Focar um estilo',
    allLabel: 'Mostrar todos',
    dimensions: [
      {
        id: 'pattern',
        label: 'Padrão de comunicação',
        values: {
          rest: 'Requisição / resposta',
          webhooks: 'Notificação de evento',
          graphql: 'Query e mutation, ainda requisição / resposta',
          grpc: 'Chamada de procedimento remoto, com quatro modos de streaming',
        },
      },
      {
        id: 'initiator',
        label: 'Quem inicia',
        values: {
          rest: 'O cliente',
          webhooks: 'O provedor, após um evento',
          graphql: 'O cliente',
          grpc: 'O serviço que chama; depois qualquer lado pode transmitir',
        },
      },
      {
        id: 'direction',
        label: 'Direção típica',
        values: {
          rest: 'Cliente → servidor',
          webhooks: 'Provedor → receptor',
          graphql: 'Cliente → servidor GraphQL',
          grpc: 'Serviço → serviço, normalmente dentro da rede',
        },
      },
      {
        id: 'transport',
        label: 'Transporte comum',
        values: {
          rest: 'HTTP, corpo em JSON, vários endpoints',
          webhooks: 'HTTP POST para uma URL que você registrou',
          graphql: 'HTTP, normalmente um único endpoint',
          grpc: 'HTTP/2 com Protocol Buffers binário',
        },
      },
      {
        id: 'shape',
        label: 'Formato da resposta',
        values: {
          rest: 'Definido pelo servidor, por endpoint',
          webhooks: 'Um payload de evento definido pelo provedor',
          graphql: 'Definido pelo cliente, campo a campo',
          grpc: 'Uma mensagem tipada declarada no contrato .proto',
        },
      },
      {
        id: 'fit',
        label: 'Onde encaixa melhor',
        values: {
          rest: 'APIs públicas, CRUD de recursos, leituras cacheáveis',
          webhooks: 'Integrações que precisam reagir logo após um evento',
          graphql: 'Telas ricas e mobile com dados aninhados',
          grpc: 'Chamadas internas frequentes, baixa latência, streaming',
        },
      },
      {
        id: 'challenge',
        label: 'Principal desafio',
        values: {
          rest: 'Padronizar endpoints e versionar sem quebrar clientes',
          webhooks: 'Retentativas, duplicatas, assinatura, idempotência',
          graphql: 'Complexidade da query, performance dos resolvers, cache',
          grpc: 'Não roda nativo no navegador, difícil de inspecionar, exige codegen',
        },
      },
    ],
    note: 'Escolha por necessidade, não por moda: o mesmo backend pode servir os três — e normalmente serve.',
  },
};

export const trackContent: Record<Locale, TrackContent> = { en, 'pt-BR': ptBR };

/** Convenience: the step metadata for one node of the track. */
export function trackStep(locale: Locale, id: TrackNodeId): TrackStep {
  return trackContent[locale].steps.find((s) => s.id === id)!;
}
