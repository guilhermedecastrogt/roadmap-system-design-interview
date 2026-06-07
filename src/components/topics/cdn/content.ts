import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the CDN lesson. Same convention as DNS: long-form
 * prose lives in the Markdown file; the strings that drive the interactive
 * widgets (flow player, latency lab, push/pull, topology) live here, typed and
 * bilingual.
 */

export type CdnNodeId =
  | 'client'
  | 'routing'
  | 'distribution'
  | 'scrubbers'
  | 'edge'
  | 'origin'
  | 'management';

type StepText = { title: string; text: string };

export type CdnContent = {
  ui: {
    start: string;
    replay: string;
    step: string;
    of: string;
    prev: string;
    next: string;
    tapHint: string;
    diagramTitle: string;
    flowHint: string;
  };
  packets: {
    register: string;
    content: string;
    ask: string;
    dest: string;
    request: string;
    clean: string;
  };
  nodes: Record<CdnNodeId, { label: string; sublabel: string; detail: string }>;
  flow: StepText[];
  latency: {
    title: string;
    subtitle: string;
    run: string;
    running: string;
    without: string;
    with: string;
    user: string;
    origin: string;
    edge: string;
    note: string;
    rttOrigin: string;
    rttEdge: string;
  };
  pushpull: {
    title: string;
    subtitle: string;
    push: string;
    pull: string;
    pushHint: string;
    pullHint: string;
    pushBtn: string;
    pullBtn: string;
    pullAgainBtn: string;
    origin: string;
    edge: string;
    user: string;
    cached: string;
    pushed: string;
    pushCaption: string;
    pullMiss: string;
    pullHit: string;
  };
  topology: {
    title: string;
    subtitle: string;
    hierarchical: string;
    horizontal: string;
    hierHint: string;
    horizHint: string;
    trace: string;
    origin: string;
    parent: string;
    child: string;
    edge: string;
    users: string;
    hierCaption: string;
    horizCaption: string;
  };
};

const en: CdnContent = {
  ui: {
    start: 'Simulate request',
    replay: 'Replay',
    step: 'Step',
    of: 'of',
    prev: 'Back',
    next: 'Next',
    tapHint: 'Tap any component to see what it does',
    diagramTitle: 'The CDN request flow',
    flowHint: 'The CDN is configured with the origin & cache rules; the client is routed to the best nearby edge.',
  },
  packets: {
    register: 'content map',
    content: 'content',
    ask: 'where?',
    dest: 'best edge',
    request: 'request',
    clean: 'clean request',
  },
  nodes: {
    client: {
      label: 'Client',
      sublabel: 'end user',
      detail:
        "The end user's browser. It wants content fast, so it should be served from a nearby location instead of a distant origin.",
    },
    routing: {
      label: 'Routing',
      sublabel: 'find best edge',
      detail:
        'Knows where each content item lives and tells the client which edge server is best — usually the closest healthy one.',
    },
    distribution: {
      label: 'Distribution',
      sublabel: 'replication',
      detail:
        'Replicates content from the origin out to the edge servers, so copies sit close to users before they ask.',
    },
    scrubbers: {
      label: 'Scrubbers',
      sublabel: 'traffic filtering',
      detail:
        'Inspect incoming traffic and drop malicious requests (WAF / DDoS) before they reach the edge. A common security add-on — not part of the basic CDN concept.',
    },
    edge: {
      label: 'Edge / Proxy',
      sublabel: 'cache near user',
      detail:
        'A proxy cache close to the user that serves content directly — cutting latency and load on the origin.',
    },
    origin: {
      label: 'Origin',
      sublabel: 'main data center',
      detail:
        'Your main data center and the source of truth for all content. The CDN exists so most users never have to reach it.',
    },
    management: {
      label: 'Management',
      sublabel: 'orchestration',
      detail:
        'Handles orchestration, monitoring, and content control (cache purges, configs). Optional — but without it operations get manual and error-prone.',
    },
  },
  flow: [
    {
      title: 'Origin & cache rules configured',
      text: 'You point the CDN at your origin and set cache rules, so routing knows where to fetch content.',
    },
    {
      title: 'Content is replicated to the edge',
      text: 'The distribution system copies content from the origin out to edge servers.',
    },
    {
      title: 'Client asks for the best location',
      text: 'The client asks the routing system where to get the content.',
    },
    {
      title: 'Routing returns the best edge',
      text: 'The routing system replies with the best edge — usually the closest, healthy one.',
    },
    {
      title: 'Client sends the request',
      text: 'The client requests the content from that destination.',
    },
    {
      title: 'Scrubbers filter the traffic',
      text: 'The request passes through scrubbers, which drop malicious traffic.',
    },
    {
      title: 'Forwarded to the edge',
      text: 'Clean traffic is forwarded to the proxy edge server.',
    },
    {
      title: 'Edge returns the content',
      text: 'The edge serves the content directly — close, fast, and without touching the origin.',
    },
  ],
  latency: {
    title: 'Distance is latency',
    subtitle: 'A user in Europe, an origin in the US. Flip the CDN on and watch the round-trip shrink.',
    run: 'Send request',
    running: 'Sending…',
    without: 'Without CDN',
    with: 'With CDN',
    user: 'User · Europe',
    origin: 'Origin · US',
    edge: 'Edge · Europe',
    note: 'Illustrative latencies — real numbers vary, but the pattern holds: closer means faster.',
    rttOrigin: 'Round-trip all the way to the US origin',
    rttEdge: 'Round-trip to a nearby European edge',
  },
  pushpull: {
    title: 'Push vs Pull',
    subtitle: 'Two ways content reaches the edge.',
    push: 'Push CDN',
    pull: 'Pull CDN',
    pushHint: 'You pre-load (pre-warm) content to edges ahead of time. Good for launches, large files, and avoiding a slow first hit.',
    pullHint: 'The edge fetches from the origin on the first request, then caches it — the common default, great for most web assets.',
    pushBtn: 'Push content',
    pullBtn: 'Request content',
    pullAgainBtn: 'Request again',
    origin: 'Origin',
    edge: 'Edge',
    user: 'User',
    cached: 'cached',
    pushed: 'pre-loaded',
    pushCaption: 'Content is pre-loaded to every edge before users ask — first hit is already fast.',
    pullMiss: 'First request: cache miss → the edge fetches from the origin, then caches it.',
    pullHit: 'Next requests: cache hit → served straight from the edge.',
  },
  topology: {
    title: 'How edges are organized',
    subtitle: 'Scale out flat, or in tiers.',
    hierarchical: 'Hierarchical',
    horizontal: 'Horizontal',
    hierHint: 'Origin → parent servers → child servers. Tiers absorb load and keep content close to users.',
    horizHint: 'The origin replicates to many edges at the same level. Simple and flat.',
    trace: 'Trace path',
    origin: 'Origin',
    parent: 'Parent',
    child: 'Child',
    edge: 'Edge',
    users: 'Users',
    hierCaption: 'Children serve users; parents shield the origin from load.',
    horizCaption: 'Every edge pulls from the origin directly.',
  },
};

const ptBR: CdnContent = {
  ui: {
    start: 'Simular requisição',
    replay: 'Repetir',
    step: 'Passo',
    of: 'de',
    prev: 'Voltar',
    next: 'Próximo',
    tapHint: 'Toque em um componente para ver o que ele faz',
    diagramTitle: 'O fluxo de requisição do CDN',
    flowHint: 'A CDN é configurada com o origin e regras de cache; o cliente é roteado para o melhor edge próximo.',
  },
  packets: {
    register: 'mapa de conteúdo',
    content: 'conteúdo',
    ask: 'onde?',
    dest: 'melhor edge',
    request: 'requisição',
    clean: 'requisição limpa',
  },
  nodes: {
    client: {
      label: 'Cliente',
      sublabel: 'usuário final',
      detail:
        'O navegador do usuário final. Ele quer conteúdo rápido, então deve ser servido de um local próximo, em vez de uma origem distante.',
    },
    routing: {
      label: 'Roteamento',
      sublabel: 'acha o melhor edge',
      detail:
        'Sabe onde está cada item de conteúdo e diz ao cliente qual servidor de edge é o melhor — geralmente o mais próximo e saudável.',
    },
    distribution: {
      label: 'Distribuição',
      sublabel: 'replicação',
      detail:
        'Replica o conteúdo da origem para os servidores de edge, deixando cópias perto dos usuários antes mesmo de eles pedirem.',
    },
    scrubbers: {
      label: 'Scrubbers',
      sublabel: 'filtro de tráfego',
      detail:
        'Inspecionam o tráfego de entrada e descartam requisições maliciosas (WAF / DDoS) antes que cheguem ao edge. Um add-on de segurança comum — não faz parte do conceito básico de CDN.',
    },
    edge: {
      label: 'Edge / Proxy',
      sublabel: 'cache perto do usuário',
      detail:
        'Um cache proxy perto do usuário que serve o conteúdo diretamente — reduzindo latência e carga na origem.',
    },
    origin: {
      label: 'Origem',
      sublabel: 'data center principal',
      detail:
        'Seu data center principal e a fonte da verdade de todo o conteúdo. O CDN existe para que a maioria dos usuários nunca precise chegar até aqui.',
    },
    management: {
      label: 'Gerenciamento',
      sublabel: 'orquestração',
      detail:
        'Cuida de orquestração, monitoramento e controle de conteúdo (purga de cache, configs). Opcional — mas sem ele a operação fica manual e sujeita a erros.',
    },
  },
  flow: [
    {
      title: 'Origem e regras de cache configuradas',
      text: 'Você aponta a CDN para o origin e define regras de cache, então o roteamento sabe onde buscar o conteúdo.',
    },
    {
      title: 'O conteúdo é replicado ao edge',
      text: 'O sistema de distribuição copia o conteúdo da origem para os servidores de edge.',
    },
    {
      title: 'Cliente pergunta o melhor local',
      text: 'O cliente pergunta ao sistema de roteamento onde obter o conteúdo.',
    },
    {
      title: 'Roteamento devolve o melhor edge',
      text: 'O sistema de roteamento responde com o melhor edge — geralmente o mais próximo e saudável.',
    },
    {
      title: 'Cliente envia a requisição',
      text: 'O cliente pede o conteúdo a esse destino.',
    },
    {
      title: 'Scrubbers filtram o tráfego',
      text: 'A requisição passa pelos scrubbers, que descartam o tráfego malicioso.',
    },
    {
      title: 'Encaminhado ao edge',
      text: 'O tráfego limpo é encaminhado ao servidor de edge (proxy).',
    },
    {
      title: 'O edge devolve o conteúdo',
      text: 'O edge serve o conteúdo diretamente — perto, rápido e sem tocar na origem.',
    },
  ],
  latency: {
    title: 'Distância é latência',
    subtitle: 'Um usuário na Europa, uma origem nos EUA. Ative o CDN e veja a ida-e-volta encolher.',
    run: 'Enviar requisição',
    running: 'Enviando…',
    without: 'Sem CDN',
    with: 'Com CDN',
    user: 'Usuário · Europa',
    origin: 'Origem · EUA',
    edge: 'Edge · Europa',
    note: 'Latências ilustrativas — os números reais variam, mas o padrão se mantém: mais perto é mais rápido.',
    rttOrigin: 'Ida-e-volta até a origem nos EUA',
    rttEdge: 'Ida-e-volta até um edge europeu próximo',
  },
  pushpull: {
    title: 'Push vs Pull',
    subtitle: 'Duas formas de o conteúdo chegar ao edge.',
    push: 'Push CDN',
    pull: 'Pull CDN',
    pushHint: 'Você pré-carrega (pré-aquece) o conteúdo nos edges com antecedência. Bom para lançamentos, arquivos grandes e evitar um primeiro acesso lento.',
    pullHint: 'O edge busca da origem na primeira requisição e depois faz cache — o padrão mais comum, ótimo para a maioria dos assets web.',
    pushBtn: 'Empurrar conteúdo',
    pullBtn: 'Pedir conteúdo',
    pullAgainBtn: 'Pedir de novo',
    origin: 'Origem',
    edge: 'Edge',
    user: 'Usuário',
    cached: 'em cache',
    pushed: 'pré-carregado',
    pushCaption: 'O conteúdo é pré-carregado em todos os edges antes de os usuários pedirem — o primeiro acesso já é rápido.',
    pullMiss: 'Primeira requisição: cache miss → o edge busca da origem e guarda em cache.',
    pullHit: 'Próximas requisições: cache hit → servidas direto do edge.',
  },
  topology: {
    title: 'Como os edges se organizam',
    subtitle: 'Escale na horizontal, ou em camadas.',
    hierarchical: 'Hierárquica',
    horizontal: 'Horizontal',
    hierHint: 'Origem → servidores pai → servidores filho. As camadas absorvem carga e mantêm o conteúdo perto dos usuários.',
    horizHint: 'A origem replica para muitos edges no mesmo nível. Simples e plano.',
    trace: 'Traçar caminho',
    origin: 'Origem',
    parent: 'Pai',
    child: 'Filho',
    edge: 'Edge',
    users: 'Usuários',
    hierCaption: 'Os filhos servem os usuários; os pais protegem a origem da carga.',
    horizCaption: 'Cada edge puxa da origem diretamente.',
  },
};

export const cdnContent: Record<Locale, CdnContent> = { en, 'pt-BR': ptBR };
