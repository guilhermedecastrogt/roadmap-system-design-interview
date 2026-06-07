import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the DNS lesson, kept next to the component.
 *
 * Convention for interactive topics: long-form prose lives in the topic's
 * Markdown file, while the strings that drive interactive widgets (node labels,
 * animated step descriptions, comparison tables, simulator copy) live in a
 * typed, bilingual `content.ts` like this one. Future topics (Load Balancer,
 * Cache, …) should follow the same shape.
 */

export type DnsNodeId = 'browser' | 'resolver' | 'root' | 'tld' | 'auth';

type StepText = { title: string; text: string };

type ComparisonRow = { aspect: string; recursive: string; iterative: string };

export type DnsContent = {
  translator: { from: string; to: string; note: string };
  ui: {
    start: string;
    replay: string;
    reset: string;
    recursive: string;
    iterative: string;
    recursiveHint: string;
    iterativeHint: string;
    step: string;
    of: string;
    next: string;
    prev: string;
    tapHint: string;
    diagramTitle: string;
  };
  packets: { query: string; referral: string; ip: string };
  nodes: Record<DnsNodeId, { label: string; sublabel: string; detail: string }>;
  iterative: StepText[];
  recursive: StepText[];
  comparison: {
    title: string;
    subtitle: string;
    recursive: string;
    iterative: string;
    rows: ComparisonRow[];
  };
  cache: {
    title: string;
    subtitle: string;
    resolveBtn: string;
    resolving: string;
    miss: string;
    hit: string;
    missText: string;
    hitText: string;
    ttl: string;
    ttlExpired: string;
    ttlNote: string;
    unit: string;
    logTitle: string;
    empty: string;
    cachedRecord: string;
    whoCaches: string;
  };
};

const en: DnsContent = {
  translator: {
    from: 'youtube.com',
    to: '142.250.x.x',
    note: 'Illustrative example only — real IP addresses change and are not shown here.',
  },
  ui: {
    start: 'Start DNS lookup',
    replay: 'Replay',
    reset: 'Reset',
    recursive: 'Recursive',
    iterative: 'Iterative',
    recursiveHint:
      'The client asks once; the resolver takes responsibility and returns the final answer.',
    iterativeHint:
      'The resolver walks the hierarchy step by step, following referrals to the authoritative answer.',
    step: 'Step',
    of: 'of',
    next: 'Next',
    prev: 'Back',
    tapHint: 'Tap any server to learn its role',
    diagramTitle: 'The DNS journey',
  },
  packets: { query: 'query', referral: 'referral', ip: 'IP address' },
  nodes: {
    browser: {
      label: 'Browser',
      sublabel: 'client',
      detail:
        'Your browser needs an IP address to open a connection. It can’t use “youtube.com” directly, so it asks a DNS resolver to translate the name.',
    },
    resolver: {
      label: 'Resolver',
      sublabel: 'ISP / public DNS',
      detail:
        'Usually run by your ISP or a public DNS (like 1.1.1.1 or 8.8.8.8). It does the heavy lifting of finding the IP and caches answers to speed up future lookups.',
    },
    root: {
      label: 'Root',
      sublabel: '. (root nameserver)',
      detail:
        'The top of the hierarchy. It doesn’t know the IP — it points the resolver to the nameservers that handle each TLD (.com, .org…).',
    },
    tld: {
      label: 'TLD server',
      sublabel: '.com',
      detail:
        'Responsible for a top-level domain such as .com. It points the resolver to the authoritative server that owns the exact domain.',
    },
    auth: {
      label: 'Authoritative',
      sublabel: 'youtube.com',
      detail:
        'The source of truth for youtube.com. It holds the real DNS records and returns the requested one — for a website, usually an A/AAAA record with the IP.',
    },
  },
  iterative: [
    {
      title: 'You type youtube.com',
      text: 'Your browser needs an IP to connect, so it sends the domain to a DNS resolver.',
    },
    {
      title: 'Resolver asks the Root',
      text: 'The resolver doesn’t know the IP yet, so it asks a root nameserver where to look.',
    },
    {
      title: 'Root refers to the TLD',
      text: 'The root replies: “I don’t have the IP, but the .com TLD server can help.”',
    },
    {
      title: 'Resolver asks the TLD',
      text: 'The resolver asks the .com TLD server about youtube.com.',
    },
    {
      title: 'TLD refers to the authoritative',
      text: 'The TLD responds with the authoritative nameserver that owns youtube.com.',
    },
    {
      title: 'Resolver asks the authoritative',
      text: 'The resolver asks the authoritative server for the final answer.',
    },
    {
      title: 'Authoritative returns the record',
      text: 'The authoritative server responds with the record — for a website, the IP (e.g. 142.250.x.x).',
    },
    {
      title: 'Resolver answers your browser',
      text: 'The resolver sends the IP back to your browser, which can finally connect.',
    },
  ],
  recursive: [
    {
      title: 'Ask once, then wait',
      text: 'Your browser sends a single question to the resolver: “What’s the IP for youtube.com?”',
    },
    {
      title: 'The resolver takes over',
      text: 'The resolver takes full responsibility — it queries the root, TLD, and authoritative servers for you, behind the scenes.',
    },
    {
      title: 'You get the final answer',
      text: 'The resolver returns the finished IP to your browser. From your side, it was just one request.',
    },
  ],
  comparison: {
    title: 'Recursive vs Iterative',
    subtitle:
      'Two relationships inside one lookup — recursive is client ↔ resolver, iterative is resolver ↔ hierarchy.',
    recursive: 'Recursive',
    iterative: 'Iterative',
    rows: [
      {
        aspect: 'The relationship',
        recursive: 'Client → resolver',
        iterative: 'Resolver → root → TLD → authoritative',
      },
      {
        aspect: 'Who follows the chain',
        recursive: 'The resolver, on your behalf',
        iterative: 'The resolver itself, hop by hop',
      },
      {
        aspect: 'Reply to each query',
        recursive: 'The final answer (the record)',
        iterative: 'A referral to the next server, until the authoritative record',
      },
      {
        aspect: 'Who sees the referrals',
        recursive: 'You just get the answer',
        iterative: 'The resolver — not the client',
      },
    ],
  },
  cache: {
    title: 'Caching & TTL',
    subtitle:
      'The full journey is expensive, so answers get cached. Resolve twice and watch the difference.',
    resolveBtn: 'Resolve youtube.com',
    resolving: 'Resolving…',
    miss: 'Cache miss',
    hit: 'Cache hit',
    missText: 'Full lookup through the hierarchy',
    hitText: 'Served instantly from cache',
    ttl: 'TTL',
    ttlExpired: 'TTL expired — cache cleared',
    ttlNote:
      'TTL (Time To Live) decides how long a cached answer can be reused before a fresh lookup is needed.',
    unit: 'ms',
    logTitle: 'Lookup log',
    empty: 'No lookups yet — hit resolve to start.',
    cachedRecord: 'Cached record',
    whoCaches: 'Both your browser and the resolver can cache results.',
  },
};

const ptBR: DnsContent = {
  translator: {
    from: 'youtube.com',
    to: '142.250.x.x',
    note: 'Apenas um exemplo ilustrativo — endereços IP reais mudam e não são mostrados aqui.',
  },
  ui: {
    start: 'Iniciar busca DNS',
    replay: 'Repetir',
    reset: 'Reiniciar',
    recursive: 'Recursiva',
    iterative: 'Iterativa',
    recursiveHint:
      'O cliente pergunta uma vez; o resolver assume a responsabilidade e devolve a resposta final.',
    iterativeHint:
      'O resolver percorre a hierarquia passo a passo, seguindo encaminhamentos até a resposta autoritativa.',
    step: 'Passo',
    of: 'de',
    next: 'Próximo',
    prev: 'Voltar',
    tapHint: 'Toque em um servidor para ver o papel dele',
    diagramTitle: 'A jornada do DNS',
  },
  packets: { query: 'consulta', referral: 'encaminhamento', ip: 'endereço IP' },
  nodes: {
    browser: {
      label: 'Navegador',
      sublabel: 'cliente',
      detail:
        'Seu navegador precisa de um endereço IP para abrir uma conexão. Ele não consegue usar “youtube.com” diretamente, então pede a um resolver DNS para traduzir o nome.',
    },
    resolver: {
      label: 'Resolver',
      sublabel: 'ISP / DNS público',
      detail:
        'Geralmente operado pelo seu provedor (ISP) ou por um DNS público (como 1.1.1.1 ou 8.8.8.8). É ele que faz o trabalho pesado de encontrar o IP e guarda respostas em cache para acelerar buscas futuras.',
    },
    root: {
      label: 'Root',
      sublabel: '. (servidor raiz)',
      detail:
        'O topo da hierarquia. Ele não sabe o IP — aponta o resolver para os nameservers que cuidam de cada TLD (.com, .org…).',
    },
    tld: {
      label: 'Servidor TLD',
      sublabel: '.com',
      detail:
        'Responsável por um domínio de topo como o .com. Ele aponta o resolver para o servidor autoritativo que é dono do domínio exato.',
    },
    auth: {
      label: 'Autoritativo',
      sublabel: 'youtube.com',
      detail:
        'A fonte da verdade para youtube.com. Guarda os registros DNS reais e devolve o solicitado — para um site, geralmente um registro A/AAAA com o IP.',
    },
  },
  iterative: [
    {
      title: 'Você digita youtube.com',
      text: 'Seu navegador precisa de um IP para conectar, então envia o domínio a um resolver DNS.',
    },
    {
      title: 'Resolver pergunta ao Root',
      text: 'O resolver ainda não sabe o IP, então pergunta a um servidor raiz onde procurar.',
    },
    {
      title: 'Root encaminha para o TLD',
      text: 'O root responde: “Não tenho o IP, mas o servidor TLD .com pode ajudar.”',
    },
    {
      title: 'Resolver pergunta ao TLD',
      text: 'O resolver pergunta ao servidor TLD .com sobre o youtube.com.',
    },
    {
      title: 'TLD encaminha para o autoritativo',
      text: 'O TLD responde com o servidor autoritativo que é dono do youtube.com.',
    },
    {
      title: 'Resolver pergunta ao autoritativo',
      text: 'O resolver pede a resposta final ao servidor autoritativo.',
    },
    {
      title: 'Autoritativo devolve o registro',
      text: 'O servidor autoritativo responde com o registro — para um site, o IP (ex.: 142.250.x.x).',
    },
    {
      title: 'Resolver responde ao navegador',
      text: 'O resolver envia o IP de volta ao navegador, que finalmente pode conectar.',
    },
  ],
  recursive: [
    {
      title: 'Pergunte uma vez e espere',
      text: 'Seu navegador envia uma única pergunta ao resolver: “Qual é o IP do youtube.com?”',
    },
    {
      title: 'O resolver assume',
      text: 'O resolver assume total responsabilidade — ele consulta os servidores root, TLD e autoritativo por você, nos bastidores.',
    },
    {
      title: 'Você recebe a resposta final',
      text: 'O resolver devolve o IP pronto ao seu navegador. Do seu lado, foi apenas uma requisição.',
    },
  ],
  comparison: {
    title: 'Recursiva vs Iterativa',
    subtitle:
      'Duas relações dentro de uma mesma busca — recursiva é cliente ↔ resolver, iterativa é resolver ↔ hierarquia.',
    recursive: 'Recursiva',
    iterative: 'Iterativa',
    rows: [
      {
        aspect: 'A relação',
        recursive: 'Cliente → resolver',
        iterative: 'Resolver → root → TLD → autoritativo',
      },
      {
        aspect: 'Quem percorre a cadeia',
        recursive: 'O resolver, por você',
        iterative: 'O próprio resolver, salto a salto',
      },
      {
        aspect: 'Resposta de cada consulta',
        recursive: 'A resposta final (o registro)',
        iterative: 'Um encaminhamento ao próximo servidor, até o registro autoritativo',
      },
      {
        aspect: 'Quem vê os encaminhamentos',
        recursive: 'Você só recebe a resposta',
        iterative: 'O resolver — não o cliente',
      },
    ],
  },
  cache: {
    title: 'Cache & TTL',
    subtitle:
      'A jornada completa é cara, então as respostas vão para o cache. Resolva duas vezes e veja a diferença.',
    resolveBtn: 'Resolver youtube.com',
    resolving: 'Resolvendo…',
    miss: 'Cache miss',
    hit: 'Cache hit',
    missText: 'Busca completa pela hierarquia',
    hitText: 'Entregue instantaneamente do cache',
    ttl: 'TTL',
    ttlExpired: 'TTL expirou — cache limpo',
    ttlNote:
      'O TTL (Time To Live) define por quanto tempo uma resposta em cache pode ser reutilizada antes de uma nova busca.',
    unit: 'ms',
    logTitle: 'Histórico de buscas',
    empty: 'Nenhuma busca ainda — clique em resolver para começar.',
    cachedRecord: 'Registro em cache',
    whoCaches: 'Tanto o seu navegador quanto o resolver podem guardar resultados.',
  },
};

export const dnsContent: Record<Locale, DnsContent> = { en, 'pt-BR': ptBR };
