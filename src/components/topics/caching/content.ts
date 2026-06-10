import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the Cache lesson. Same convention as the other
 * topics: prose lives in the Markdown file; strings that drive the performance
 * lab, the cache-layers diagram, the strategy flows, and the do/don't lists
 * live here, typed & bilingual.
 */

export type CacheStratMode = 'cache-aside' | 'read-through' | 'write-through';
export type CacheNodeId = 'client' | 'backend' | 'cache' | 'database';

type StepText = { title: string; text: string };
type CompareRow = { aspect: string; a: string; b: string };

export type CacheContent = {
  lab: {
    title: string;
    subtitle: string;
    without: string;
    with: string;
    send: string;
    sending: string;
    reset: string;
    client: string;
    backend: string;
    cache: string;
    database: string;
    cached: string;
    miss: string;
    hit: string;
    ttl: string;
    total: string;
    dbQueries: string;
    hitRate: string;
    note: string;
    missText: string;
    hitText: string;
    withoutText: string;
  };
  layers: {
    title: string;
    subtitle: string;
    browser: string;
    browserNote: string;
    cdn: string;
    cdnNote: string;
    backend: string;
    backendNote: string;
    database: string;
    caption: string;
  };
  strategies: {
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
    packets: Record<string, string>;
    nodes: Record<CacheNodeId, { label: string; sublabel: string; detail: string }>;
    modes: Record<CacheStratMode, { label: string; hint: string; steps: StepText[] }>;
  };
  compare: {
    title: string;
    subtitle: string;
    aTitle: string;
    bTitle: string;
    rows: CompareRow[];
  };
  dodont: {
    title: string;
    subtitle: string;
    goodTitle: string;
    badTitle: string;
    good: string[];
    bad: string[];
  };
};

const en: CacheContent = {
  lab: {
    title: 'Performance lab',
    subtitle: 'Client in São Paulo, backend & database in us-east-1. Turn the cache on and watch the round-trip — and the database load — collapse.',
    without: 'Without cache',
    with: 'With cache',
    send: 'Send request',
    sending: 'Sending…',
    reset: 'Reset',
    client: 'Client · São Paulo',
    backend: 'Backend',
    cache: 'Cache · Redis',
    database: 'Database · us-east-1',
    cached: 'cached',
    miss: 'MISS',
    hit: 'HIT',
    ttl: 'TTL',
    total: 'requests',
    dbQueries: 'DB queries',
    hitRate: 'hit rate',
    note: 'Illustrative latencies — the pattern is what matters: a hit skips the backend round-trip and the database entirely.',
    missText: 'Cache miss → all the way to the database (then cached).',
    hitText: 'Cache hit → served from memory, the database is never touched.',
    withoutText: 'No cache → every request travels to the database in us-east-1.',
  },
  layers: {
    title: 'Where caches live',
    subtitle: 'Caching is not one box — it happens at every hop between the user and the data.',
    browser: 'Browser cache',
    browserNote: 'Static assets cached on the device — no network at all.',
    cdn: 'CDN edge cache',
    cdnNote: 'Images, video, and assets served from a nearby edge.',
    backend: 'Backend cache · Redis / Memcached',
    backendNote: 'In-memory cache for hot data, sessions, and expensive queries.',
    database: 'Database',
    caption: 'Each layer absorbs reads so fewer requests reach the database.',
  },
  strategies: {
    ui: {
      start: 'Run the flow',
      replay: 'Replay',
      step: 'Step',
      of: 'of',
      prev: 'Back',
      next: 'Next',
      tapHint: 'Tap any component to see its role',
      diagramTitle: 'Caching strategy',
    },
    packets: {
      get: 'GET product X',
      check: 'check',
      miss: 'miss',
      read: 'read',
      data: 'data',
      store: 'store',
      write: 'write X',
      ok: 'ok',
    },
    nodes: {
      client: {
        label: 'Client',
        sublabel: 'app / browser',
        detail: 'Asks for some data (e.g. product X). It only talks to the backend.',
      },
      backend: {
        label: 'Backend',
        sublabel: 'application',
        detail: 'Runs the application logic. Where it looks for data first — cache or database — depends on the strategy.',
      },
      cache: {
        label: 'Cache',
        sublabel: 'Redis (in-memory)',
        detail: 'Fast in-memory store. A hit returns instantly; a miss falls back to the database.',
      },
      database: {
        label: 'Database',
        sublabel: 'source of truth',
        detail: 'The durable source of truth — slower and more expensive to hit, so the cache shields it from repeated reads.',
      },
    },
    modes: {
      'cache-aside': {
        label: 'Cache-aside',
        hint: 'The app checks the cache, and on a miss reads the database and fills the cache itself.',
        steps: [
          { title: 'Client asks the backend', text: 'The client requests product X from the backend.' },
          { title: 'Backend checks the cache', text: 'The backend looks in the cache (e.g. Redis) first.' },
          { title: 'Cache miss', text: 'The value isn’t there — the cache reports a miss.' },
          { title: 'Backend reads the database', text: 'On a miss, the backend queries the database itself.' },
          { title: 'Database returns the data', text: 'The database responds with product X.' },
          { title: 'Backend fills the cache', text: 'The backend stores the value in the cache for next time.' },
          { title: 'Backend answers the client', text: 'The data is returned. The next read for X will be a hit.' },
        ],
      },
      'read-through': {
        label: 'Read-through',
        hint: 'The app only talks to the cache; the cache fetches from the database on a miss and caches it.',
        steps: [
          { title: 'Client asks the backend', text: 'The client requests product X.' },
          { title: 'Backend reads the cache', text: 'The backend asks only the cache — it never talks to the DB directly.' },
          { title: 'Cache fetches from the DB', text: 'On a miss, the cache itself reads from the database.' },
          { title: 'Database returns the data', text: 'The database responds to the cache.' },
          { title: 'Cache returns (and keeps) it', text: 'The cache stores the value and returns it to the backend.' },
          { title: 'Backend answers the client', text: 'The app got its data through the cache abstraction.' },
        ],
      },
      'write-through': {
        label: 'Write-through',
        hint: 'Writes go through the cache to the database together, so the cache is always up to date.',
        steps: [
          { title: 'Client writes via the backend', text: 'The client updates product X.' },
          { title: 'Backend writes to the cache', text: 'The write goes to the cache layer first.' },
          { title: 'Cache writes to the database', text: 'The cache writes through to the database, synchronously.' },
          { title: 'Database confirms', text: 'The database acknowledges the write.' },
          { title: 'Cache confirms', text: 'The cache (now up to date) confirms to the backend.' },
          { title: 'Backend answers the client', text: 'Cache and database stay consistent — at the cost of slower writes.' },
        ],
      },
    },
  },
  compare: {
    title: 'Cache-aside vs Read/Write-through',
    subtitle: 'Who owns the cache logic — your app, or the cache layer?',
    aTitle: 'Cache-aside',
    bTitle: 'Read / Write-through',
    rows: [
      { aspect: 'Who fills the cache', a: 'The application code', b: 'The cache layer itself' },
      { aspect: 'App talks to', a: 'Cache and database', b: 'Only the cache' },
      { aspect: 'On a miss', a: 'App reads DB, then caches', b: 'Cache reads DB, then caches' },
      { aspect: 'Trade-off', a: 'Flexible, but logic is in every caller', b: 'Clean abstraction, but less control & can cache unused data' },
    ],
  },
  dodont: {
    title: 'What to cache (and what not to)',
    subtitle: 'Caching everything is a mistake — be selective.',
    goodTitle: 'Good candidates',
    badTitle: 'Be careful with',
    good: [
      'Frequently read, rarely changed data',
      'Expensive computations & query results',
      'Static assets (CSS, JS, images, video)',
      'Session / auth checks, when appropriate',
    ],
    bad: [
      'Everything — caching has a cost too',
      'Highly sensitive data (without real care)',
      'Rarely accessed, low-value data',
      'Data that goes stale instantly with no invalidation plan',
    ],
  },
};

const ptBR: CacheContent = {
  lab: {
    title: 'Laboratório de performance',
    subtitle: 'Cliente em São Paulo, backend e banco em us-east-1. Ligue o cache e veja a ida-e-volta — e a carga no banco — despencarem.',
    without: 'Sem cache',
    with: 'Com cache',
    send: 'Enviar requisição',
    sending: 'Enviando…',
    reset: 'Reiniciar',
    client: 'Cliente · São Paulo',
    backend: 'Backend',
    cache: 'Cache · Redis',
    database: 'Banco · us-east-1',
    cached: 'em cache',
    miss: 'MISS',
    hit: 'HIT',
    ttl: 'TTL',
    total: 'requisições',
    dbQueries: 'consultas ao BD',
    hitRate: 'taxa de hit',
    note: 'Latências ilustrativas — o que importa é o padrão: um hit pula a ida ao backend e o banco por completo.',
    missText: 'Cache miss → vai até o banco (e então é cacheado).',
    hitText: 'Cache hit → servido da memória, o banco nem é tocado.',
    withoutText: 'Sem cache → toda requisição viaja até o banco em us-east-1.',
  },
  layers: {
    title: 'Onde os caches vivem',
    subtitle: 'Cache não é uma caixa só — acontece em cada salto entre o usuário e os dados.',
    browser: 'Cache do navegador',
    browserNote: 'Ativos estáticos guardados no dispositivo — sem rede nenhuma.',
    cdn: 'Cache de borda (CDN)',
    cdnNote: 'Imagens, vídeo e assets servidos de um edge próximo.',
    backend: 'Cache de backend · Redis / Memcached',
    backendNote: 'Cache em memória para dados quentes, sessões e consultas caras.',
    database: 'Banco de dados',
    caption: 'Cada camada absorve leituras para que menos requisições cheguem ao banco.',
  },
  strategies: {
    ui: {
      start: 'Rodar o fluxo',
      replay: 'Repetir',
      step: 'Passo',
      of: 'de',
      prev: 'Voltar',
      next: 'Próximo',
      tapHint: 'Toque em um componente para ver o papel dele',
      diagramTitle: 'Estratégia de cache',
    },
    packets: {
      get: 'GET produto X',
      check: 'checar',
      miss: 'miss',
      read: 'ler',
      data: 'dados',
      store: 'guardar',
      write: 'gravar X',
      ok: 'ok',
    },
    nodes: {
      client: {
        label: 'Cliente',
        sublabel: 'app / navegador',
        detail: 'Pede algum dado (ex.: produto X). Ele só conversa com o backend.',
      },
      backend: {
        label: 'Backend',
        sublabel: 'aplicação',
        detail: 'Roda a lógica da aplicação. Onde ele procura os dados primeiro — cache ou banco — depende da estratégia.',
      },
      cache: {
        label: 'Cache',
        sublabel: 'Redis (em memória)',
        detail: 'Armazenamento rápido em memória. Um hit responde na hora; um miss recorre ao banco.',
      },
      database: {
        label: 'Banco de dados',
        sublabel: 'fonte da verdade',
        detail: 'A fonte da verdade durável — mais lenta e cara de acessar, então o cache a protege de leituras repetidas.',
      },
    },
    modes: {
      'cache-aside': {
        label: 'Cache-aside',
        hint: 'A app checa o cache e, no miss, lê o banco e preenche o cache ela mesma.',
        steps: [
          { title: 'Cliente pede ao backend', text: 'O cliente pede o produto X ao backend.' },
          { title: 'Backend checa o cache', text: 'O backend olha primeiro no cache (ex.: Redis).' },
          { title: 'Cache miss', text: 'O valor não está lá — o cache reporta um miss.' },
          { title: 'Backend lê o banco', text: 'No miss, o próprio backend consulta o banco.' },
          { title: 'Banco devolve os dados', text: 'O banco responde com o produto X.' },
          { title: 'Backend preenche o cache', text: 'O backend guarda o valor no cache para a próxima vez.' },
          { title: 'Backend responde ao cliente', text: 'Os dados voltam. A próxima leitura de X será um hit.' },
        ],
      },
      'read-through': {
        label: 'Read-through',
        hint: 'A app só fala com o cache; o cache busca no banco no miss e guarda.',
        steps: [
          { title: 'Cliente pede ao backend', text: 'O cliente pede o produto X.' },
          { title: 'Backend lê o cache', text: 'O backend pergunta só ao cache — nunca fala direto com o banco.' },
          { title: 'Cache busca no banco', text: 'No miss, o próprio cache lê do banco.' },
          { title: 'Banco devolve os dados', text: 'O banco responde ao cache.' },
          { title: 'Cache retorna (e guarda)', text: 'O cache armazena o valor e o devolve ao backend.' },
          { title: 'Backend responde ao cliente', text: 'A app obteve os dados pela abstração do cache.' },
        ],
      },
      'write-through': {
        label: 'Write-through',
        hint: 'As escritas passam pelo cache até o banco juntas, então o cache fica sempre atualizado.',
        steps: [
          { title: 'Cliente escreve via backend', text: 'O cliente atualiza o produto X.' },
          { title: 'Backend grava no cache', text: 'A escrita vai primeiro para a camada de cache.' },
          { title: 'Cache grava no banco', text: 'O cache escreve até o banco, de forma síncrona.' },
          { title: 'Banco confirma', text: 'O banco confirma a escrita.' },
          { title: 'Cache confirma', text: 'O cache (já atualizado) confirma ao backend.' },
          { title: 'Backend responde ao cliente', text: 'Cache e banco ficam consistentes — ao custo de escritas mais lentas.' },
        ],
      },
    },
  },
  compare: {
    title: 'Cache-aside vs Read/Write-through',
    subtitle: 'Quem é dono da lógica de cache — sua app ou a camada de cache?',
    aTitle: 'Cache-aside',
    bTitle: 'Read / Write-through',
    rows: [
      { aspect: 'Quem preenche o cache', a: 'O código da aplicação', b: 'A própria camada de cache' },
      { aspect: 'A app fala com', a: 'Cache e banco', b: 'Só o cache' },
      { aspect: 'No miss', a: 'A app lê o BD e então cacheia', b: 'O cache lê o BD e então cacheia' },
      { aspect: 'Trade-off', a: 'Flexível, mas a lógica fica em cada chamador', b: 'Abstração limpa, mas menos controle e pode cachear dado não usado' },
    ],
  },
  dodont: {
    title: 'O que cachear (e o que não)',
    subtitle: 'Cachear tudo é um erro — seja seletivo.',
    goodTitle: 'Bons candidatos',
    badTitle: 'Cuidado com',
    good: [
      'Dados lidos com frequência e que mudam pouco',
      'Computações caras e resultados de consultas',
      'Ativos estáticos (CSS, JS, imagens, vídeo)',
      'Checagens de sessão / auth, quando apropriado',
    ],
    bad: [
      'Tudo — cachear também tem custo',
      'Dados muito sensíveis (sem real cuidado)',
      'Dados raramente acessados e de baixo valor',
      'Dados que ficam velhos na hora sem plano de invalidação',
    ],
  },
};

export const cacheContent: Record<Locale, CacheContent> = { en, 'pt-BR': ptBR };
