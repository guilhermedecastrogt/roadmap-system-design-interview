import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the Load Balancer lesson. Same convention as DNS/CDN:
 * prose lives in the Markdown file; strings that drive the simulator, the
 * architecture diagram, and the comparison modules live here, typed & bilingual.
 */

export type LbAlgo =
  | 'round-robin'
  | 'weighted'
  | 'least-conn'
  | 'least-response'
  | 'ip-hash'
  | 'url-hash';

type CompareRow = { aspect: string; a: string; b: string };
type Compare = {
  title: string;
  subtitle: string;
  aTitle: string;
  bTitle: string;
  rows: CompareRow[];
};

export type LbContent = {
  sim: {
    title: string;
    subtitle: string;
    start: string;
    stop: string;
    sendOne: string;
    reset: string;
    method: string;
    clients: string;
    lb: string;
    total: string;
    active: string;
    weight: string;
    ms: string;
    down: string;
    healthHint: string;
    algos: Record<LbAlgo, { name: string; blurb: string }>;
  };
  arch: {
    title: string;
    subtitle: string;
    lb: string;
    clients: string;
    web: string;
    services: string;
    db: string;
    dbPrimary: string;
    dbReplica: string;
    notes: { edge: string; service: string; data: string };
    caption: string;
  };
  staticDynamic: Compare;
  statefulStateless: Compare;
  l4l7: Compare;
};

const en: LbContent = {
  sim: {
    title: 'Traffic control lab',
    subtitle: 'Pick a routing method, start the traffic, and watch how requests spread across the servers. Click a server to take it down.',
    start: 'Start traffic',
    stop: 'Stop',
    sendOne: 'Send one',
    reset: 'Reset',
    method: 'Routing method',
    clients: 'Clients',
    lb: 'Load balancer',
    total: 'total',
    active: 'active',
    weight: 'weight',
    ms: 'ms',
    down: 'DOWN',
    healthHint: 'Tip: click a server’s status dot to fail or restore it — traffic reroutes instantly.',
    algos: {
      'round-robin': {
        name: 'Round Robin',
        blurb: 'Each server in turn. Simple and even when the servers are similar.',
      },
      weighted: {
        name: 'Weighted Round Robin',
        blurb: 'Bigger servers get a bigger share — here A:B:C weigh 3:2:1.',
      },
      'least-conn': {
        name: 'Least Connections',
        blurb: 'Send each request to whoever has the fewest active connections right now.',
      },
      'least-response': {
        name: 'Least Response Time',
        blurb: 'Send to the fastest (lowest-latency) healthy server. C is slow at 120 ms.',
      },
      'ip-hash': {
        name: 'IP Hash',
        blurb: 'Hash the client IP → the same client always sticks to the same server.',
      },
      'url-hash': {
        name: 'URL Hash',
        blurb: 'Hash the path → /video, /profile, /admin each map to a fixed server.',
      },
    },
  },
  arch: {
    title: 'Where load balancers live',
    subtitle: 'Not just one. They appear at every layer that needs to scale.',
    lb: 'Load balancer',
    clients: 'Clients',
    web: 'Web servers',
    services: 'Services',
    db: 'Database',
    dbPrimary: 'primary',
    dbReplica: 'read replica',
    notes: {
      edge: 'At the edge — spreads users across the web/frontend tier.',
      service: 'Between tiers — balances calls across backend services.',
      data: 'At the data layer — spreads reads across replicas (writes go to the primary).',
    },
    caption: 'Each tier scales independently behind its own balancer.',
  },
  staticDynamic: {
    title: 'Static vs Dynamic',
    subtitle: 'Does the balancer know the real server state?',
    aTitle: 'Static',
    bTitle: 'Dynamic',
    rows: [
      { aspect: 'Decides by', a: 'Fixed rules', b: 'Live server state' },
      { aspect: 'Knows health / load?', a: 'No', b: 'Yes — it adapts' },
      { aspect: 'Examples', a: 'Round Robin, IP / URL Hash', b: 'Least Connections, Least Response Time' },
      { aspect: 'Trade-off', a: 'Simple & predictable', b: 'Smarter, but more to monitor' },
    ],
  },
  statefulStateless: {
    title: 'Stateful vs Stateless',
    subtitle: 'Does a user stay pinned to one server?',
    aTitle: 'Stateful (sticky)',
    bTitle: 'Stateless',
    rows: [
      { aspect: 'Per user', a: 'Same user → same server', b: 'Each request routed independently' },
      { aspect: 'How', a: 'Cookie or IP hash (session affinity)', b: 'Any server can serve any request' },
      { aspect: 'Pro', a: 'Keeps in-server session data', b: 'Easy scaling & failover' },
      { aspect: 'Con', a: 'Uneven load, harder failover', b: 'Needs a shared session store' },
    ],
  },
  l4l7: {
    title: 'L4 vs L7',
    subtitle: 'How deep into the request can it look?',
    aTitle: 'L4 · transport',
    bTitle: 'L7 · application',
    rows: [
      { aspect: 'Sees', a: 'IP + TCP / UDP ports', b: 'HTTP path, host, headers, cookies' },
      { aspect: 'Decides by', a: 'Connection-level info', b: 'Application content' },
      { aspect: 'Can do', a: 'Fast, protocol-agnostic', b: 'Path routing, TLS termination, sticky cookies' },
      { aspect: 'Cost', a: 'Lower latency & overhead', b: 'Smarter routing, a bit more work' },
    ],
  },
};

const ptBR: LbContent = {
  sim: {
    title: 'Laboratório de tráfego',
    subtitle: 'Escolha um método de roteamento, inicie o tráfego e veja como as requisições se espalham pelos servidores. Clique em um servidor para derrubá-lo.',
    start: 'Iniciar tráfego',
    stop: 'Parar',
    sendOne: 'Enviar uma',
    reset: 'Reiniciar',
    method: 'Método de roteamento',
    clients: 'Clientes',
    lb: 'Balanceador',
    total: 'total',
    active: 'ativas',
    weight: 'peso',
    ms: 'ms',
    down: 'FORA',
    healthHint: 'Dica: clique no status de um servidor para derrubá-lo ou restaurá-lo — o tráfego é reroteado na hora.',
    algos: {
      'round-robin': {
        name: 'Round Robin',
        blurb: 'Cada servidor na sua vez. Simples e equilibrado quando os servidores são parecidos.',
      },
      weighted: {
        name: 'Weighted Round Robin',
        blurb: 'Servidores maiores recebem uma fatia maior — aqui A:B:C pesam 3:2:1.',
      },
      'least-conn': {
        name: 'Least Connections',
        blurb: 'Envia cada requisição para quem tem menos conexões ativas no momento.',
      },
      'least-response': {
        name: 'Least Response Time',
        blurb: 'Envia para o servidor saudável mais rápido (menor latência). O C é lento, 120 ms.',
      },
      'ip-hash': {
        name: 'IP Hash',
        blurb: 'Faz hash do IP do cliente → o mesmo cliente sempre cai no mesmo servidor.',
      },
      'url-hash': {
        name: 'URL Hash',
        blurb: 'Faz hash do caminho → /video, /profile, /admin caem em servidores fixos.',
      },
    },
  },
  arch: {
    title: 'Onde os balanceadores vivem',
    subtitle: 'Não é só um. Eles aparecem em cada camada que precisa escalar.',
    lb: 'Balanceador',
    clients: 'Clientes',
    web: 'Servidores web',
    services: 'Serviços',
    db: 'Banco de dados',
    dbPrimary: 'primário',
    dbReplica: 'réplica de leitura',
    notes: {
      edge: 'Na borda — distribui os usuários pela camada web/frontend.',
      service: 'Entre camadas — balanceia chamadas entre os serviços de backend.',
      data: 'Na camada de dados — distribui leituras entre réplicas (escritas vão ao primário).',
    },
    caption: 'Cada camada escala de forma independente atrás do seu próprio balanceador.',
  },
  staticDynamic: {
    title: 'Estático vs Dinâmico',
    subtitle: 'O balanceador conhece o estado real dos servidores?',
    aTitle: 'Estático',
    bTitle: 'Dinâmico',
    rows: [
      { aspect: 'Decide por', a: 'Regras fixas', b: 'Estado ao vivo dos servidores' },
      { aspect: 'Sabe saúde / carga?', a: 'Não', b: 'Sim — ele se adapta' },
      { aspect: 'Exemplos', a: 'Round Robin, IP / URL Hash', b: 'Least Connections, Least Response Time' },
      { aspect: 'Trade-off', a: 'Simples e previsível', b: 'Mais esperto, mas mais para monitorar' },
    ],
  },
  statefulStateless: {
    title: 'Stateful vs Stateless',
    subtitle: 'O usuário fica preso a um servidor?',
    aTitle: 'Stateful (sticky)',
    bTitle: 'Stateless',
    rows: [
      { aspect: 'Por usuário', a: 'Mesmo usuário → mesmo servidor', b: 'Cada requisição roteada de forma independente' },
      { aspect: 'Como', a: 'Cookie ou IP hash (afinidade de sessão)', b: 'Qualquer servidor atende qualquer requisição' },
      { aspect: 'Prós', a: 'Mantém a sessão no servidor', b: 'Escala e failover fáceis' },
      { aspect: 'Contras', a: 'Carga desigual, failover difícil', b: 'Precisa de sessão compartilhada' },
    ],
  },
  l4l7: {
    title: 'L4 vs L7',
    subtitle: 'Quão fundo ele consegue olhar na requisição?',
    aTitle: 'L4 · transporte',
    bTitle: 'L7 · aplicação',
    rows: [
      { aspect: 'Enxerga', a: 'IP + portas TCP / UDP', b: 'Caminho HTTP, host, headers, cookies' },
      { aspect: 'Decide por', a: 'Info de nível de conexão', b: 'Conteúdo da aplicação' },
      { aspect: 'Consegue', a: 'Rápido, agnóstico de protocolo', b: 'Roteamento por path, TLS termination, cookies sticky' },
      { aspect: 'Custo', a: 'Menor latência e overhead', b: 'Roteamento mais esperto, um pouco mais de trabalho' },
    ],
  },
};

export const lbContent: Record<Locale, LbContent> = { en, 'pt-BR': ptBR };
