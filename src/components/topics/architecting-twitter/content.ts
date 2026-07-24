import { type Locale } from '@/i18n/routing';

/**
 * All copy and structured data for the "Architecting Twitter" lesson, kept in
 * one place so the interactive components stay focused on behaviour and both
 * locales evolve side by side. Components read `twContent[locale].<section>`.
 */

/** The five backing stores the service inspector can open. */
export type StoreId = 'redis' | 'mongodb' | 'kafka' | 'elasticsearch' | 's3';

/** Requirement groups shown in the requirements board. */
export type ReqGroup = 'functional' | 'nonFunctional' | 'operational';

type Requirement = { title: string; desc: string };

type ServiceInfo = { id: StoreId; name: string; role: string; why: string; note: string };

type FlowStep = { id: string; label: string; detail: string };

type Locale2 = Locale;

const en = {
  requirements: {
    title: 'What are we actually building?',
    subtitle:
      'Before any boxes and arrows, pin down what the system must do and how well it must do it. Tap a lens to switch the board.',
    lenses: [
      { id: 'functional' as ReqGroup, label: 'Functional' },
      { id: 'nonFunctional' as ReqGroup, label: 'Non-functional' },
      { id: 'operational' as ReqGroup, label: 'Operational' },
    ],
    hint: 'The lens you pick reframes the whole design — features, qualities, or how you run it in production.',
    groups: {
      functional: [
        { title: 'Accounts & login', desc: 'Sign up, authenticate, and manage a profile.' },
        { title: 'Create / edit / delete tweets', desc: 'Post short messages, fix them, remove them.' },
        { title: 'Follow other users', desc: 'Build a social graph of who sees whom.' },
        { title: 'Home timeline', desc: 'A feed of recent tweets from everyone you follow.' },
        { title: 'Like, reply, retweet', desc: 'Engagement actions that ripple across the platform.' },
        { title: 'Search tweets & users', desc: 'Find people and content by keyword.' },
        { title: 'Upload media', desc: 'Attach images and video to tweets.' },
      ] as Requirement[],
      nonFunctional: [
        { title: 'Scale to 100M+ users', desc: 'Hundreds of millions of accounts, billions of reads a day.' },
        { title: 'High write volume', desc: 'Floods of tweets, likes, retweets, replies, and searches.' },
        { title: 'Highly available', desc: 'The feed stays up even as parts fail.' },
        { title: 'Low latency', desc: 'The home timeline must feel instant.' },
        { title: 'Security & privacy', desc: 'Protect accounts, tokens, and private data.' },
        { title: 'Observability & recovery', desc: 'See what is happening; recover fast when it breaks.' },
      ] as Requirement[],
      operational: [
        { title: 'Auth & authorization', desc: 'Who is calling, and are they allowed?' },
        { title: 'Rate limiting', desc: 'Absorb spikes and stop abuse at the edge.' },
        { title: 'Input validation', desc: 'Reject malformed or malicious payloads early.' },
        { title: 'Encryption', desc: 'TLS in transit; encryption at rest for stored data.' },
        { title: 'Logging & alerts', desc: 'Structured logs, metrics, and pages when SLOs slip.' },
        { title: 'Health checks', desc: 'Load balancers route only to healthy instances.' },
        { title: 'Load & automated testing', desc: 'Prove capacity and catch regressions before users do.' },
        { title: 'Backup & recovery', desc: 'Snapshots and replay so no data is lost for good.' },
      ] as Requirement[],
    },
  },

  architecture: {
    title: 'The high-level architecture',
    subtitle:
      'One request flows top to bottom: through the edge, past the gateway, into the services, out to the stores. Tap a store to see why it was picked.',
    pulseLabel: 'Trace a request',
    layers: [
      { id: 'client', label: 'Clients', items: ['Web', 'iOS', 'Android'] },
      { id: 'edge', label: 'Edge', items: ['CDN', 'Load balancer'] },
      { id: 'gateway', label: 'API Gateway', items: ['Auth check', 'Rate limit', 'Routing'] },
      {
        id: 'services',
        label: 'Services',
        items: ['Auth', 'Profile', 'Tweet', 'Reply', 'Timeline', 'Fanout', 'Follow', 'Like', 'Search', 'Media', 'Notify'],
      },
      { id: 'stores', label: 'Data & event backbone', items: ['Redis', 'MongoDB', 'Kafka', 'Elasticsearch', 'S3'] },
    ],
    inspectorHint: 'Tap a store',
    services: [
      {
        id: 'redis',
        name: 'Redis',
        role: 'Timeline cache & hot data',
        why: 'The home timeline is read far more than it is written. Redis keeps precomputed feeds, counters (likes, retweets), and hot lookups in memory so reads return in single-digit milliseconds.',
        note: 'A cache and hot-data layer — never the source of truth for tweets.',
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        role: 'Tweet & reply content',
        why: 'Tweets are document-shaped: text, author, timestamps, media refs, flexible fields. A document store fits that model and scales horizontally by sharding on tweet or author id.',
        note: 'Baseline choice here — other stores can work; media never lives inside it.',
      },
      {
        id: 'kafka',
        name: 'Kafka',
        role: 'Event backbone',
        why: 'Every write emits an event — tweet-created, like-created, follow-created. Kafka decouples the fast write path from slow downstream work (fanout, search indexing, notifications, counters).',
        note: 'Producers stay fast; consumers process asynchronously and independently.',
      },
      {
        id: 'elasticsearch',
        name: 'Elasticsearch',
        role: 'Search index',
        why: 'Full-text search over tweets and users needs an inverted index and relevance ranking — something a document or key-value store cannot do well at this scale.',
        note: 'A separate search layer, fed asynchronously — not coupled to the tweet DB.',
      },
      {
        id: 's3',
        name: 'Amazon S3',
        role: 'Media objects',
        why: 'Images and video are large binary blobs. S3 stores them durably and cheaply; the tweet document keeps only the object key. A CDN serves them fast worldwide.',
        note: 'Media must not live inside the tweet database.',
      },
    ] as ServiceInfo[],
  },

  write: {
    title: 'Write path — posting a tweet',
    subtitle:
      'Press Post and watch the tweet travel: authenticated at the gateway, persisted in MongoDB, then announced to the rest of the platform through Kafka.',
    post: 'Post tweet',
    posting: 'Posting…',
    reset: 'Reset',
    composerPlaceholder: 'Shipping the new timeline service today 🚀',
    nodes: {
      client: 'Client',
      gateway: 'API Gateway',
      tweet: 'Tweet Service',
      mongo: 'MongoDB',
      kafka: 'Kafka',
      fanout: 'Fanout',
      redis: 'Redis',
      search: 'Elasticsearch',
    },
    steps: [
      { id: 'gateway', label: 'Auth + rate limit', detail: 'The gateway authenticates the user, checks the rate limit, and validates the payload.' },
      { id: 'store', label: 'Persist in MongoDB', detail: 'The Tweet Service writes the tweet document — the source of truth — to MongoDB.' },
      { id: 'event', label: 'Publish tweet-created', detail: 'A tweet-created event is published to Kafka. The write path is now done; the client gets a fast OK.' },
      { id: 'fanout', label: 'Fanout to followers', detail: 'The fanout consumer pushes the tweet id into each follower’s cached timeline.' },
      { id: 'cache', label: 'Update Redis feeds', detail: 'Followers’ home timelines in Redis gain the new tweet at the top.' },
      { id: 'index', label: 'Index for search', detail: 'A search consumer indexes the tweet in Elasticsearch — asynchronously, off the write path.' },
    ] as FlowStep[],
    doneLabel: 'Tweet is live',
    asyncBadge: 'async',
    syncBadge: 'sync',
    note: 'Only two steps are synchronous — persist and publish. Everything after Kafka happens in the background, so the user never waits for fanout, cache, or search.',
  },

  timeline: {
    title: 'Read path — loading your home timeline',
    subtitle:
      'The feed is read constantly, so it must be cached. Load the timeline and see Redis answer instantly — or miss and rebuild from downstream data.',
    load: 'Load home timeline',
    loading: 'Loading…',
    invalidate: 'Expire cache',
    reset: 'Reset',
    nodes: {
      client: 'Client',
      timeline: 'Timeline Service',
      redis: 'Redis',
      mongo: 'MongoDB',
      follow: 'Follow graph',
    },
    hit: 'CACHE HIT',
    miss: 'CACHE MISS',
    hitText: 'Timeline served straight from Redis.',
    missText: 'Cache empty — rebuild from the tweet store, then repopulate Redis.',
    cachedBadge: 'warm',
    coldBadge: 'cold',
    statHits: 'Hits',
    statMisses: 'Misses',
    statHitRate: 'Hit rate',
    note: 'A warm cache turns a multi-store rebuild into one in-memory read. Cold caches, cache expiry, and invalidation after new tweets are the everyday reality of feed systems.',
    fanout: {
      title: 'Fanout on write vs fanout on read',
      subtitle:
        'Where does the work of building a timeline happen — when a tweet is posted, or when the feed is read? This is one of the hardest trade-offs in the whole system.',
      write: 'Fanout on write',
      read: 'Fanout on read',
      writeDesc:
        'When you post, the tweet id is pushed into every follower’s precomputed timeline. Reads are dirt cheap — just fetch a ready list from Redis.',
      readDesc:
        'Nothing is precomputed. When a user opens the app, the timeline is assembled on the fly by pulling recent tweets from everyone they follow.',
      writeCost: 'Cost: a celebrity with 50M followers triggers 50M writes per tweet (the “fanout of doom”).',
      readCost: 'Cost: every feed load fans out across many authors and merges results — slow and repeated for hot users.',
      hybrid:
        'Real systems go hybrid: fanout-on-write for most users, fanout-on-read (pulled at load time) for a handful of mega-accounts. Pick one baseline, then name the exception.',
    },
  },

  media: {
    title: 'Media path — upload to S3, deliver via CDN',
    subtitle:
      'Photos and video never touch the tweet database. They go to object storage and are served from the edge. Upload a file and watch it flow.',
    upload: 'Upload media',
    uploading: 'Uploading…',
    reset: 'Reset',
    nodes: {
      client: 'Client',
      media: 'Media Service',
      s3: 'Amazon S3',
      mongo: 'MongoDB',
      cdn: 'CDN edge',
      reader: 'Reader',
    },
    steps: [
      { id: 'upload', label: 'Upload bytes', detail: 'The client uploads the file to the Media Service (often via a presigned S3 URL — bytes skip the app tier).' },
      { id: 'store', label: 'Store object in S3', detail: 'The image/video is stored as an object in an S3 bucket and gets a durable object key.' },
      { id: 'link', label: 'Link the key', detail: 'Only the object key + metadata is saved on the tweet document in MongoDB — never the bytes.' },
      { id: 'serve', label: 'Serve via CDN', detail: 'Later readers fetch the media from the nearest CDN edge; S3 is the origin behind it.' },
    ] as FlowStep[],
    firstBadge: 'MISS → origin',
    edgeBadge: 'HIT → edge',
    doneLabel: 'Media delivered',
    note: 'Tweet content and media storage are different concerns. The database keeps a tiny pointer; the heavy bytes live in S3 and travel through the CDN.',
  },

  search: {
    title: 'Search path — querying Elasticsearch',
    subtitle:
      'Search is its own subsystem with its own index, kept in sync through Kafka. Type a query and route it to the search service.',
    placeholder: 'Search tweets and people…',
    searchBtn: 'Search',
    searching: 'Searching…',
    reset: 'Reset',
    suggestions: ['distributed systems', 'kafka', '@jack', 'timeline fanout'],
    nodes: {
      client: 'Client',
      gateway: 'API Gateway',
      search: 'Search Service',
      es: 'Elasticsearch',
    },
    resultsLabel: 'Top results',
    results: [
      { handle: '@dist_sys', text: 'Fanout on write vs read is the classic timeline trade-off…', score: '0.98' },
      { handle: '@kafka_dev', text: 'Every tweet becomes an event on the backbone…', score: '0.94' },
      { handle: '@scale_notes', text: 'Redis keeps the hot feed; MongoDB is the source of truth…', score: '0.89' },
    ],
    note: 'The tweet DB is never queried directly for search at scale. Writes flow into Elasticsearch asynchronously so the index can scale and be tuned for relevance on its own.',
  },
};

const ptBR: typeof en = {
  requirements: {
    title: 'O que estamos realmente construindo?',
    subtitle:
      'Antes de qualquer caixa e seta, defina o que o sistema precisa fazer e com que qualidade. Toque numa lente para trocar o quadro.',
    lenses: [
      { id: 'functional' as ReqGroup, label: 'Funcionais' },
      { id: 'nonFunctional' as ReqGroup, label: 'Não funcionais' },
      { id: 'operational' as ReqGroup, label: 'Operacionais' },
    ],
    hint: 'A lente escolhida reformula todo o design — funcionalidades, qualidades ou como você opera em produção.',
    groups: {
      functional: [
        { title: 'Contas e login', desc: 'Cadastrar, autenticar e gerenciar um perfil.' },
        { title: 'Criar / editar / excluir tweets', desc: 'Publicar mensagens curtas, corrigir, remover.' },
        { title: 'Seguir outros usuários', desc: 'Montar o grafo social de quem vê quem.' },
        { title: 'Timeline principal', desc: 'Um feed dos tweets recentes de quem você segue.' },
        { title: 'Curtir, responder, retweetar', desc: 'Ações de engajamento que se espalham pela plataforma.' },
        { title: 'Buscar tweets e usuários', desc: 'Encontrar pessoas e conteúdo por palavra-chave.' },
        { title: 'Enviar mídia', desc: 'Anexar imagens e vídeo aos tweets.' },
      ] as Requirement[],
      nonFunctional: [
        { title: 'Escalar para 100M+ usuários', desc: 'Centenas de milhões de contas, bilhões de leituras por dia.' },
        { title: 'Alto volume de escrita', desc: 'Enxurradas de tweets, curtidas, retweets, respostas e buscas.' },
        { title: 'Alta disponibilidade', desc: 'O feed continua no ar mesmo com partes falhando.' },
        { title: 'Baixa latência', desc: 'A timeline principal precisa parecer instantânea.' },
        { title: 'Segurança e privacidade', desc: 'Proteger contas, tokens e dados privados.' },
        { title: 'Observabilidade e recuperação', desc: 'Enxergar o que acontece; recuperar rápido quando quebra.' },
      ] as Requirement[],
      operational: [
        { title: 'Autenticação e autorização', desc: 'Quem está chamando e tem permissão?' },
        { title: 'Rate limiting', desc: 'Absorver picos e barrar abuso na borda.' },
        { title: 'Validação de entrada', desc: 'Rejeitar payloads malformados ou maliciosos cedo.' },
        { title: 'Criptografia', desc: 'TLS em trânsito; criptografia em repouso para dados armazenados.' },
        { title: 'Logs e alertas', desc: 'Logs estruturados, métricas e alertas quando o SLO escorrega.' },
        { title: 'Health checks', desc: 'O balanceador só roteia para instâncias saudáveis.' },
        { title: 'Testes de carga e automatizados', desc: 'Provar a capacidade e pegar regressões antes dos usuários.' },
        { title: 'Backup e recuperação', desc: 'Snapshots e replay para nenhum dado se perder de vez.' },
      ] as Requirement[],
    },
  },

  architecture: {
    title: 'A arquitetura de alto nível',
    subtitle:
      'Uma requisição flui de cima para baixo: pela borda, pelo gateway, para os serviços e até os stores. Toque num store para ver por que foi escolhido.',
    pulseLabel: 'Rastrear uma requisição',
    layers: [
      { id: 'client', label: 'Clientes', items: ['Web', 'iOS', 'Android'] },
      { id: 'edge', label: 'Borda', items: ['CDN', 'Load balancer'] },
      { id: 'gateway', label: 'API Gateway', items: ['Auth', 'Rate limit', 'Roteamento'] },
      {
        id: 'services',
        label: 'Serviços',
        items: ['Auth', 'Perfil', 'Tweet', 'Reply', 'Timeline', 'Fanout', 'Follow', 'Like', 'Busca', 'Mídia', 'Notif.'],
      },
      { id: 'stores', label: 'Dados e backbone de eventos', items: ['Redis', 'MongoDB', 'Kafka', 'Elasticsearch', 'S3'] },
    ],
    inspectorHint: 'Toque num store',
    services: [
      {
        id: 'redis',
        name: 'Redis',
        role: 'Cache da timeline e dados quentes',
        why: 'A timeline principal é lida muito mais do que escrita. O Redis mantém feeds pré-computados, contadores (curtidas, retweets) e buscas quentes em memória para leituras em milissegundos.',
        note: 'Uma camada de cache e dados quentes — nunca a fonte da verdade dos tweets.',
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        role: 'Conteúdo de tweets e respostas',
        why: 'Tweets têm formato de documento: texto, autor, timestamps, refs de mídia, campos flexíveis. Um banco de documentos encaixa nesse modelo e escala por sharding no id do tweet ou do autor.',
        note: 'Escolha base aqui — outros stores servem; mídia nunca fica dentro dele.',
      },
      {
        id: 'kafka',
        name: 'Kafka',
        role: 'Backbone de eventos',
        why: 'Toda escrita emite um evento — tweet-created, like-created, follow-created. O Kafka desacopla o caminho de escrita rápido do trabalho lento downstream (fanout, indexação de busca, notificações, contadores).',
        note: 'Produtores continuam rápidos; consumidores processam de forma assíncrona e independente.',
      },
      {
        id: 'elasticsearch',
        name: 'Elasticsearch',
        role: 'Índice de busca',
        why: 'Busca full-text em tweets e usuários precisa de índice invertido e ranqueamento por relevância — algo que um store de documentos ou chave-valor não faz bem nessa escala.',
        note: 'Uma camada de busca separada, alimentada de forma assíncrona — não acoplada ao banco de tweets.',
      },
      {
        id: 's3',
        name: 'Amazon S3',
        role: 'Objetos de mídia',
        why: 'Imagens e vídeo são blobs binários grandes. O S3 os guarda de forma durável e barata; o documento do tweet mantém só a chave do objeto. Uma CDN os entrega rápido no mundo todo.',
        note: 'Mídia não pode ficar dentro do banco de tweets.',
      },
    ] as ServiceInfo[],
  },

  write: {
    title: 'Caminho de escrita — publicando um tweet',
    subtitle:
      'Aperte Publicar e veja o tweet viajar: autenticado no gateway, persistido no MongoDB e anunciado ao resto da plataforma pelo Kafka.',
    post: 'Publicar tweet',
    posting: 'Publicando…',
    reset: 'Reiniciar',
    composerPlaceholder: 'Subindo o novo serviço de timeline hoje 🚀',
    nodes: {
      client: 'Cliente',
      gateway: 'API Gateway',
      tweet: 'Serviço de Tweet',
      mongo: 'MongoDB',
      kafka: 'Kafka',
      fanout: 'Fanout',
      redis: 'Redis',
      search: 'Elasticsearch',
    },
    steps: [
      { id: 'gateway', label: 'Auth + rate limit', detail: 'O gateway autentica o usuário, checa o rate limit e valida o payload.' },
      { id: 'store', label: 'Persistir no MongoDB', detail: 'O Serviço de Tweet grava o documento do tweet — a fonte da verdade — no MongoDB.' },
      { id: 'event', label: 'Publicar tweet-created', detail: 'Um evento tweet-created é publicado no Kafka. O caminho de escrita terminou; o cliente recebe um OK rápido.' },
      { id: 'fanout', label: 'Fanout para seguidores', detail: 'O consumidor de fanout empurra o id do tweet para a timeline em cache de cada seguidor.' },
      { id: 'cache', label: 'Atualizar feeds no Redis', detail: 'As timelines principais dos seguidores no Redis ganham o novo tweet no topo.' },
      { id: 'index', label: 'Indexar para busca', detail: 'Um consumidor de busca indexa o tweet no Elasticsearch — de forma assíncrona, fora do caminho de escrita.' },
    ] as FlowStep[],
    doneLabel: 'Tweet no ar',
    asyncBadge: 'assíncrono',
    syncBadge: 'síncrono',
    note: 'Só dois passos são síncronos — persistir e publicar. Tudo depois do Kafka acontece em segundo plano, então o usuário nunca espera fanout, cache ou busca.',
  },

  timeline: {
    title: 'Caminho de leitura — carregando sua timeline',
    subtitle:
      'O feed é lido o tempo todo, então precisa de cache. Carregue a timeline e veja o Redis responder na hora — ou dar miss e reconstruir a partir de dados downstream.',
    load: 'Carregar timeline',
    loading: 'Carregando…',
    invalidate: 'Expirar cache',
    reset: 'Reiniciar',
    nodes: {
      client: 'Cliente',
      timeline: 'Serviço de Timeline',
      redis: 'Redis',
      mongo: 'MongoDB',
      follow: 'Grafo de follow',
    },
    hit: 'CACHE HIT',
    miss: 'CACHE MISS',
    hitText: 'Timeline servida direto do Redis.',
    missText: 'Cache vazio — reconstruir do store de tweets e repovoar o Redis.',
    cachedBadge: 'quente',
    coldBadge: 'frio',
    statHits: 'Hits',
    statMisses: 'Misses',
    statHitRate: 'Taxa de hit',
    note: 'Um cache quente transforma uma reconstrução em vários stores numa única leitura em memória. Caches frios, expiração e invalidação após novos tweets são a realidade diária dos feeds.',
    fanout: {
      title: 'Fanout on write vs fanout on read',
      subtitle:
        'Onde o trabalho de montar a timeline acontece — quando o tweet é publicado ou quando o feed é lido? Este é um dos trade-offs mais difíceis do sistema todo.',
      write: 'Fanout on write',
      read: 'Fanout on read',
      writeDesc:
        'Ao publicar, o id do tweet é empurrado para a timeline pré-computada de cada seguidor. As leituras ficam baratíssimas — só buscar uma lista pronta no Redis.',
      readDesc:
        'Nada é pré-computado. Quando o usuário abre o app, a timeline é montada na hora, puxando tweets recentes de todos que ele segue.',
      writeCost: 'Custo: uma celebridade com 50M seguidores dispara 50M escritas por tweet (o “fanout do apocalipse”).',
      readCost: 'Custo: cada carregamento de feed espalha por muitos autores e junta resultados — lento e repetido para usuários quentes.',
      hybrid:
        'Sistemas reais são híbridos: fanout-on-write para a maioria, fanout-on-read (puxado no carregamento) para um punhado de megacontas. Escolha uma base e nomeie a exceção.',
    },
  },

  media: {
    title: 'Caminho de mídia — upload no S3, entrega pela CDN',
    subtitle:
      'Fotos e vídeo nunca tocam o banco de tweets. Vão para o object storage e são servidos da borda. Envie um arquivo e veja o fluxo.',
    upload: 'Enviar mídia',
    uploading: 'Enviando…',
    reset: 'Reiniciar',
    nodes: {
      client: 'Cliente',
      media: 'Serviço de Mídia',
      s3: 'Amazon S3',
      mongo: 'MongoDB',
      cdn: 'Borda CDN',
      reader: 'Leitor',
    },
    steps: [
      { id: 'upload', label: 'Enviar bytes', detail: 'O cliente envia o arquivo para o Serviço de Mídia (geralmente via URL S3 pré-assinada — os bytes pulam o app tier).' },
      { id: 'store', label: 'Guardar objeto no S3', detail: 'A imagem/vídeo é guardada como objeto num bucket S3 e recebe uma chave durável.' },
      { id: 'link', label: 'Vincular a chave', detail: 'Só a chave do objeto + metadados fica no documento do tweet no MongoDB — nunca os bytes.' },
      { id: 'serve', label: 'Servir pela CDN', detail: 'Leitores posteriores buscam a mídia na borda CDN mais próxima; o S3 é a origem por trás dela.' },
    ] as FlowStep[],
    firstBadge: 'MISS → origem',
    edgeBadge: 'HIT → borda',
    doneLabel: 'Mídia entregue',
    note: 'Conteúdo de tweet e armazenamento de mídia são preocupações diferentes. O banco guarda um ponteiro minúsculo; os bytes pesados vivem no S3 e viajam pela CDN.',
  },

  search: {
    title: 'Caminho de busca — consultando o Elasticsearch',
    subtitle:
      'A busca é um subsistema próprio, com índice próprio, mantido em sincronia pelo Kafka. Digite uma consulta e roteie para o serviço de busca.',
    placeholder: 'Buscar tweets e pessoas…',
    searchBtn: 'Buscar',
    searching: 'Buscando…',
    reset: 'Reiniciar',
    suggestions: ['sistemas distribuídos', 'kafka', '@jack', 'timeline fanout'],
    nodes: {
      client: 'Cliente',
      gateway: 'API Gateway',
      search: 'Serviço de Busca',
      es: 'Elasticsearch',
    },
    resultsLabel: 'Melhores resultados',
    results: [
      { handle: '@dist_sys', text: 'Fanout on write vs read é o trade-off clássico da timeline…', score: '0.98' },
      { handle: '@kafka_dev', text: 'Todo tweet vira um evento no backbone…', score: '0.94' },
      { handle: '@scale_notes', text: 'Redis mantém o feed quente; MongoDB é a fonte da verdade…', score: '0.89' },
    ],
    note: 'O banco de tweets nunca é consultado diretamente para busca em escala. As escritas fluem para o Elasticsearch de forma assíncrona para o índice escalar e ser ajustado por relevância sozinho.',
  },
};

export const twContent: Record<Locale2, typeof en> = {
  en,
  'pt-BR': ptBR,
};
