import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the Rate Limiting lesson. Same convention as the
 * other topics: long-form prose lives in the Markdown file; the strings that
 * drive the traffic simulator, the "no limit vs limit" meltdown, the four
 * algorithm playgrounds, and the placement map live here — typed & bilingual.
 */

type Shared = {
  run: string;
  pause: string;
  send: string;
  burst: string;
  reset: string;
  allowed: string;
  blocked: string;
  blockRate: string;
  rate: string;
  perSec: string;
  state: string;
  verdict: string;
  keeps: string;
  decides: string;
  goodFor: string;
  tradeoff: string;
};

export type DimensionCard = {
  id: string;
  label: string;
  example: string;
  note: string;
};

export type PlacementLayer = {
  id: 'client' | 'gateway' | 'proxy' | 'backend';
  label: string;
  tag: string;
  detail: string;
  pro: string;
  con: string;
};

export type AlgoMeta = {
  id: 'fixed' | 'sliding' | 'token' | 'leaky';
  name: string;
  tagline: string;
  keeps: string;
  decides: string;
  goodFor: string;
  tradeoff: string;
};

export type RateLimitContent = {
  shared: Shared;

  traffic: {
    title: string;
    subtitle: string;
    client: string;
    limiter: string;
    server: string;
    keyedBy: string;
    dimensions: { id: string; label: string; sample: string; note: string }[];
    limitLabel: string;
    sent: string;
    idleHint: string;
    overLimitNote: string;
    note: string;
  };

  meltdown: {
    title: string;
    subtitle: string;
    fire: string;
    firing: string;
    reset: string;
    noLimit: string;
    withLimit: string;
    noLimitSub: string;
    withLimitSub: string;
    healthy: string;
    degraded: string;
    down: string;
    shed: string;
    served: string;
    dropped: string;
    load: string;
    meltNote: string;
    protectNote: string;
    note: string;
  };

  dimensions: {
    title: string;
    subtitle: string;
    cards: DimensionCard[];
    combo: string;
  };

  algos: {
    title: string;
    subtitle: string;
    meta: AlgoMeta[];
    fixed: {
      windowLabel: string;
      countLabel: string;
      resetIn: string;
      resetFlash: string;
      burstWarn: string;
      hint: string;
    };
    sliding: {
      windowLabel: string;
      inWindow: string;
      timeline: string;
      hint: string;
    };
    token: {
      bucketLabel: string;
      tokens: string;
      refill: string;
      empty: string;
      hint: string;
    };
    leaky: {
      bucketLabel: string;
      queue: string;
      leak: string;
      overflow: string;
      outRate: string;
      hint: string;
    };
  };

  placement: {
    title: string;
    subtitle: string;
    layers: PlacementLayer[];
    proLabel: string;
    conLabel: string;
    tapHint: string;
  };
};

const en: RateLimitContent = {
  shared: {
    run: 'Run',
    pause: 'Pause',
    send: 'Send 1',
    burst: 'Burst +8',
    reset: 'Reset',
    allowed: 'allowed',
    blocked: 'blocked',
    blockRate: 'block rate',
    rate: 'Request rate',
    perSec: '/s',
    state: 'State it keeps',
    verdict: 'Decisions',
    keeps: 'Keeps',
    decides: 'Decides',
    goodFor: 'Good for',
    tradeoff: 'Trade-off',
  },

  traffic: {
    title: 'Traffic simulator — allow or block',
    subtitle:
      'Drag the request rate past the limit and watch the limiter shield the server. Green requests pass through; red ones get a 429 and bounce off.',
    client: 'Client',
    limiter: 'Rate limiter',
    server: 'Server',
    keyedBy: 'Keyed by',
    dimensions: [
      { id: 'ip', label: 'IP', sample: '203.0.113.7', note: 'One budget per source IP — the default for anonymous / public endpoints.' },
      { id: 'user', label: 'User ID', sample: 'user_8412', note: 'One budget per logged-in account — fair even behind shared IPs.' },
      { id: 'endpoint', label: 'Endpoint', sample: 'POST /login', note: 'A tighter budget for one sensitive route, like login or password reset.' },
    ],
    limitLabel: 'Limit',
    sent: 'sent',
    idleHint: 'Press Run to start a stream of requests, or tap Send.',
    overLimitNote: 'Rate is above the limit — excess requests are rejected with 429.',
    note: 'The limit is enforced per key. Raise the rate above the limit and the extra requests never reach the server.',
  },

  meltdown: {
    title: 'No rate limit vs rate limit',
    subtitle:
      'Fire the same flood of requests at two servers. The left one has no protection; the right one sheds anything over its limit.',
    fire: 'Fire a flood',
    firing: 'Flooding…',
    reset: 'Reset',
    noLimit: 'No rate limit',
    withLimit: 'With rate limit',
    noLimitSub: 'accepts everything',
    withLimitSub: 'sheds the excess',
    healthy: 'Healthy',
    degraded: 'Degraded',
    down: 'Overloaded',
    shed: 'shedding',
    served: 'served',
    dropped: 'rejected (429)',
    load: 'load',
    meltNote: 'Every request is accepted, load climbs past capacity, and the server falls over — for everyone.',
    protectNote: 'Traffic over the limit is rejected fast and cheap, so the server stays inside its capacity and keeps serving.',
    note: 'A 429 is a feature: rejecting excess early protects the requests that matter and keeps the system up.',
  },

  dimensions: {
    title: 'What can we limit on?',
    subtitle:
      'A rate limit always counts against a key. Choosing the key decides who shares a budget — and who can starve whom.',
    cards: [
      { id: 'ip', label: 'IP address', example: '203.0.113.7', note: 'Great against anonymous floods; but shared NATs and proxies make many users look like one.' },
      { id: 'user', label: 'User ID', example: 'user_8412', note: 'Fair per account, survives IP changes — needs the request to be authenticated.' },
      { id: 'email', label: 'Email', example: 'a@ex.com', note: 'Handy on signup / password-reset flows before a user id exists.' },
      { id: 'endpoint', label: 'Endpoint / route', example: 'POST /login', note: 'Give expensive or sensitive routes their own, tighter budget.' },
      { id: 'apikey', label: 'API key / token', example: 'sk_live_…', note: 'The standard for public APIs and billing tiers — free vs pro get different caps.' },
      { id: 'combo', label: 'Combination', example: 'IP + route', note: 'Compose keys (e.g. IP + endpoint) for precise, targeted limits.' },
    ],
    combo: 'Tip: real systems often key on a combination — e.g. "5 login attempts per IP + email per 15 min".',
  },

  algos: {
    title: 'Algorithm playground',
    subtitle:
      'Same traffic, four different strategies. Pick one, run it, and watch how it decides — and how each one handles a burst.',
    meta: [
      {
        id: 'fixed',
        name: 'Fixed window',
        tagline: 'Count per clock window',
        keeps: 'One counter + the current window',
        decides: 'Allow while the counter is below the limit; reset to 0 at each window boundary.',
        goodFor: 'Simple, cheap, easy to explain. Fine for coarse limits.',
        tradeoff: 'A burst straddling a boundary can push through up to 2× the limit in a short span.',
      },
      {
        id: 'sliding',
        name: 'Sliding window',
        tagline: 'Count over the last N seconds',
        keeps: 'Timestamps (or weighted counts) of recent requests',
        decides: 'Allow if the count within the trailing window is below the limit; old entries expire continuously.',
        goodFor: 'Smooth, accurate limiting with no boundary burst.',
        tradeoff: 'More state and bookkeeping than a fixed window.',
      },
      {
        id: 'token',
        name: 'Token bucket',
        tagline: 'Spend tokens, refill over time',
        keeps: 'A token count + last refill time',
        decides: 'Each request spends a token; refill at a steady rate; block when the bucket is empty.',
        goodFor: 'Allows controlled bursts up to bucket size while capping the average rate.',
        tradeoff: 'Two knobs to tune (capacity vs refill rate); bursts are allowed by design.',
      },
      {
        id: 'leaky',
        name: 'Leaky bucket',
        tagline: 'Queue in, drain at a fixed rate',
        keeps: 'A queue (bucket) of pending requests',
        decides: 'Requests fill the bucket and drain at a constant rate; when the bucket is full, extras overflow and drop.',
        goodFor: 'Forcing a perfectly smooth, constant output rate downstream.',
        tradeoff: 'Adds queueing latency; no bursts — even when there is spare capacity.',
      },
    ],
    fixed: {
      windowLabel: 'Current window',
      countLabel: 'Count',
      resetIn: 'resets in',
      resetFlash: 'Window reset → counter back to 0',
      burstWarn: 'Watch the boundary: fill the window, wait for reset, fill again — 2× the limit in seconds.',
      hint: 'Requests fill the window until the counter hits the limit; at the boundary it snaps back to 0.',
    },
    sliding: {
      windowLabel: 'Trailing window',
      inWindow: 'in window',
      timeline: 'Last requests on the timeline',
      hint: 'The window slides with time. A request is allowed only if fewer than the limit sit inside it right now.',
    },
    token: {
      bucketLabel: 'Token bucket',
      tokens: 'tokens',
      refill: 'refill',
      empty: 'Bucket empty — requests blocked until a token drips in.',
      hint: 'Tokens drip in at a steady rate. Each request spends one; an empty bucket blocks until it refills.',
    },
    leaky: {
      bucketLabel: 'Leaky bucket',
      queue: 'in bucket',
      leak: 'leak',
      overflow: 'Bucket full — extra requests overflow and are dropped.',
      outRate: 'output',
      hint: 'Requests pour in and leak out at a fixed rate. A full bucket overflows — but the output stays perfectly smooth.',
    },
  },

  placement: {
    title: 'Where does the limit live?',
    subtitle:
      'The same request passes through many layers. A rate limit can sit at any of them — each with a different reach and cost.',
    layers: [
      {
        id: 'client',
        label: 'Client / frontend',
        tag: 'UX guardrail',
        detail: 'Disable the button, debounce, back off on 429. Improves UX but is trivially bypassed — never a security boundary.',
        pro: 'Instant feedback, saves a round-trip',
        con: 'Untrusted — anyone can skip it',
      },
      {
        id: 'gateway',
        label: 'API gateway',
        tag: 'central policy',
        detail: 'The common home for limits: one place to enforce per-key quotas across every service, with shared counters.',
        pro: 'Central, consistent, before your code runs',
        con: 'Needs shared/distributed state to stay accurate',
      },
      {
        id: 'proxy',
        label: 'Reverse proxy',
        tag: 'nginx / edge',
        detail: 'nginx, Envoy or a CDN edge can cap requests per IP right at the door — cheap and very fast.',
        pro: 'Blocks floods before they touch your app',
        con: 'Coarser keys (mostly IP); harder per-user logic',
      },
      {
        id: 'backend',
        label: 'Backend service',
        tag: 'fine-grained',
        detail: 'In-app limits (often Redis-backed) key on user, plan, or business rules the edge cannot see.',
        pro: 'Richest context; per-user / per-feature rules',
        con: 'Runs after the request already reached you',
      },
    ],
    proLabel: 'Strength',
    conLabel: 'Watch out',
    tapHint: 'Tap a layer to see its role',
  },
};

const ptBR: RateLimitContent = {
  shared: {
    run: 'Rodar',
    pause: 'Pausar',
    send: 'Enviar 1',
    burst: 'Rajada +8',
    reset: 'Reiniciar',
    allowed: 'permitidas',
    blocked: 'bloqueadas',
    blockRate: 'taxa de bloqueio',
    rate: 'Taxa de requisições',
    perSec: '/s',
    state: 'Estado que guarda',
    verdict: 'Decisões',
    keeps: 'Guarda',
    decides: 'Decide',
    goodFor: 'Bom para',
    tradeoff: 'Trade-off',
  },

  traffic: {
    title: 'Simulador de tráfego — permitir ou bloquear',
    subtitle:
      'Arraste a taxa de requisições acima do limite e veja o limitador proteger o servidor. Requisições verdes passam; as vermelhas levam 429 e ricocheteiam.',
    client: 'Cliente',
    limiter: 'Rate limiter',
    server: 'Servidor',
    keyedBy: 'Chave',
    dimensions: [
      { id: 'ip', label: 'IP', sample: '203.0.113.7', note: 'Um orçamento por IP de origem — o padrão para endpoints anônimos / públicos.' },
      { id: 'user', label: 'ID de usuário', sample: 'user_8412', note: 'Um orçamento por conta logada — justo mesmo atrás de IPs compartilhados.' },
      { id: 'endpoint', label: 'Endpoint', sample: 'POST /login', note: 'Um orçamento mais apertado para uma rota sensível, como login ou reset de senha.' },
    ],
    limitLabel: 'Limite',
    sent: 'enviadas',
    idleHint: 'Aperte Rodar para iniciar um fluxo de requisições, ou toque em Enviar.',
    overLimitNote: 'A taxa está acima do limite — as requisições excedentes são rejeitadas com 429.',
    note: 'O limite é aplicado por chave. Suba a taxa acima do limite e as requisições extras nunca chegam ao servidor.',
  },

  meltdown: {
    title: 'Sem rate limit vs com rate limit',
    subtitle:
      'Dispare a mesma enxurrada de requisições contra dois servidores. O da esquerda não tem proteção; o da direita descarta tudo acima do limite.',
    fire: 'Disparar enxurrada',
    firing: 'Inundando…',
    reset: 'Reiniciar',
    noLimit: 'Sem rate limit',
    withLimit: 'Com rate limit',
    noLimitSub: 'aceita tudo',
    withLimitSub: 'descarta o excesso',
    healthy: 'Saudável',
    degraded: 'Degradado',
    down: 'Sobrecarregado',
    shed: 'descartando',
    served: 'atendidas',
    dropped: 'rejeitadas (429)',
    load: 'carga',
    meltNote: 'Toda requisição é aceita, a carga passa da capacidade e o servidor cai — para todo mundo.',
    protectNote: 'O tráfego acima do limite é rejeitado rápido e barato, então o servidor fica dentro da capacidade e segue atendendo.',
    note: 'Um 429 é uma feature: rejeitar o excesso cedo protege as requisições que importam e mantém o sistema de pé.',
  },

  dimensions: {
    title: 'Sobre o que podemos limitar?',
    subtitle:
      'Um rate limit sempre conta contra uma chave. Escolher a chave decide quem compartilha um orçamento — e quem pode prejudicar quem.',
    cards: [
      { id: 'ip', label: 'Endereço IP', example: '203.0.113.7', note: 'Ótimo contra enxurradas anônimas; mas NATs e proxies fazem muitos usuários parecerem um só.' },
      { id: 'user', label: 'ID de usuário', example: 'user_8412', note: 'Justo por conta, sobrevive a troca de IP — exige requisição autenticada.' },
      { id: 'email', label: 'E-mail', example: 'a@ex.com', note: 'Útil em cadastro / reset de senha antes de existir um id de usuário.' },
      { id: 'endpoint', label: 'Endpoint / rota', example: 'POST /login', note: 'Dê às rotas caras ou sensíveis um orçamento próprio e mais apertado.' },
      { id: 'apikey', label: 'API key / token', example: 'sk_live_…', note: 'O padrão para APIs públicas e planos de cobrança — free e pro têm limites diferentes.' },
      { id: 'combo', label: 'Combinação', example: 'IP + rota', note: 'Componha chaves (ex.: IP + endpoint) para limites precisos e direcionados.' },
    ],
    combo: 'Dica: sistemas reais costumam chavear por combinação — ex.: "5 tentativas de login por IP + e-mail a cada 15 min".',
  },

  algos: {
    title: 'Playground de algoritmos',
    subtitle:
      'Mesmo tráfego, quatro estratégias diferentes. Escolha uma, rode e veja como ela decide — e como cada uma lida com uma rajada.',
    meta: [
      {
        id: 'fixed',
        name: 'Fixed window',
        tagline: 'Conta por janela de relógio',
        keeps: 'Um contador + a janela atual',
        decides: 'Permite enquanto o contador está abaixo do limite; zera a cada virada de janela.',
        goodFor: 'Simples, barato e fácil de explicar. Bom para limites grosseiros.',
        tradeoff: 'Uma rajada em cima da virada pode passar até 2× o limite num intervalo curto.',
      },
      {
        id: 'sliding',
        name: 'Sliding window',
        tagline: 'Conta nos últimos N segundos',
        keeps: 'Timestamps (ou contagens ponderadas) das requisições recentes',
        decides: 'Permite se a contagem dentro da janela móvel estiver abaixo do limite; entradas antigas expiram continuamente.',
        goodFor: 'Limitação suave e precisa, sem a rajada de virada.',
        tradeoff: 'Mais estado e contabilidade que a fixed window.',
      },
      {
        id: 'token',
        name: 'Token bucket',
        tagline: 'Gasta tokens, reabastece com o tempo',
        keeps: 'Um contador de tokens + hora do último refill',
        decides: 'Cada requisição gasta um token; reabastece num ritmo constante; bloqueia quando o balde esvazia.',
        goodFor: 'Permite rajadas controladas até o tamanho do balde, limitando a média.',
        tradeoff: 'Dois botões para ajustar (capacidade vs ritmo de refill); rajadas são permitidas por design.',
      },
      {
        id: 'leaky',
        name: 'Leaky bucket',
        tagline: 'Enfileira na entrada, escoa num ritmo fixo',
        keeps: 'Uma fila (balde) de requisições pendentes',
        decides: 'Requisições enchem o balde e escoam num ritmo constante; balde cheio transborda e descarta.',
        goodFor: 'Forçar uma saída perfeitamente suave e constante lá na frente.',
        tradeoff: 'Adiciona latência de fila; sem rajadas — mesmo havendo folga.',
      },
    ],
    fixed: {
      windowLabel: 'Janela atual',
      countLabel: 'Contagem',
      resetIn: 'zera em',
      resetFlash: 'Janela virou → contador de volta a 0',
      burstWarn: 'Olho na virada: encha a janela, espere zerar, encha de novo — 2× o limite em segundos.',
      hint: 'As requisições enchem a janela até o contador bater no limite; na virada ele volta a 0.',
    },
    sliding: {
      windowLabel: 'Janela móvel',
      inWindow: 'na janela',
      timeline: 'Últimas requisições na linha do tempo',
      hint: 'A janela desliza com o tempo. Uma requisição só passa se houver menos que o limite dentro dela agora.',
    },
    token: {
      bucketLabel: 'Balde de tokens',
      tokens: 'tokens',
      refill: 'refill',
      empty: 'Balde vazio — requisições bloqueadas até pingar um token.',
      hint: 'Tokens pingam num ritmo constante. Cada requisição gasta um; balde vazio bloqueia até reabastecer.',
    },
    leaky: {
      bucketLabel: 'Balde furado',
      queue: 'no balde',
      leak: 'vazão',
      overflow: 'Balde cheio — requisições extras transbordam e são descartadas.',
      outRate: 'saída',
      hint: 'As requisições entram e vazam num ritmo fixo. Um balde cheio transborda — mas a saída fica perfeitamente suave.',
    },
  },

  placement: {
    title: 'Onde o limite fica?',
    subtitle:
      'A mesma requisição passa por várias camadas. Um rate limit pode ficar em qualquer uma — cada uma com alcance e custo diferentes.',
    layers: [
      {
        id: 'client',
        label: 'Cliente / frontend',
        tag: 'guarda de UX',
        detail: 'Desabilita o botão, faz debounce, recua no 429. Melhora a UX mas é trivial de burlar — nunca é fronteira de segurança.',
        pro: 'Feedback imediato, evita uma ida ao servidor',
        con: 'Não confiável — qualquer um pula',
      },
      {
        id: 'gateway',
        label: 'API gateway',
        tag: 'política central',
        detail: 'A casa comum dos limites: um lugar para aplicar cotas por chave em todos os serviços, com contadores compartilhados.',
        pro: 'Central, consistente, antes do seu código rodar',
        con: 'Precisa de estado compartilhado/distribuído para ser preciso',
      },
      {
        id: 'proxy',
        label: 'Reverse proxy',
        tag: 'nginx / edge',
        detail: 'nginx, Envoy ou um edge de CDN limitam requisições por IP logo na porta — barato e muito rápido.',
        pro: 'Barra enxurradas antes de tocar sua aplicação',
        con: 'Chaves mais grosseiras (quase só IP); lógica por usuário é difícil',
      },
      {
        id: 'backend',
        label: 'Serviço backend',
        tag: 'granular',
        detail: 'Limites na aplicação (muitas vezes com Redis) chaveiam por usuário, plano ou regras de negócio que o edge não enxerga.',
        pro: 'Contexto mais rico; regras por usuário / por feature',
        con: 'Roda depois que a requisição já chegou em você',
      },
    ],
    proLabel: 'Força',
    conLabel: 'Atenção',
    tapHint: 'Toque numa camada para ver o papel dela',
  },
};

export const rateLimitContent: Record<Locale, RateLimitContent> = {
  en,
  'pt-BR': ptBR,
};
