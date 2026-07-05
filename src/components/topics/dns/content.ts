import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the DNS lesson, kept next to the components.
 *
 * Convention for interactive topics: long-form prose lives in the topic's
 * Markdown file, while the strings that drive interactive widgets (node
 * labels, animated step descriptions, simulator copy) live in a typed,
 * bilingual `content.ts` like this one.
 */

export type DnsNodeId = 'browser' | 'resolver' | 'root' | 'tld' | 'auth';
export type SegmentId = 'root' | 'tld' | 'domain' | 'sub';
export type RecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'TXT';
export type CacheSource = 'browser' | 'resolver' | 'full';

type StepText = { title: string; text: string };
type CompareRow = { aspect: string; recursive: string; iterative: string };

export type DnsContent = {
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    tryLabel: string;
    recordTag: string;
    note: string;
    domains: { host: string; ip: string }[];
  };
  anatomy: {
    kicker: string;
    title: string;
    subtitle: string;
    mapHint: string;
    treeCaption: string;
    segments: Record<SegmentId, { text: string; tag: string; desc: string }>;
  };
  journey: {
    kicker: string;
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
      recursive: string;
      iterative: string;
      recursiveHint: string;
      iterativeHint: string;
    };
    packets: { query: string; referral: string; ip: string };
    nodes: Record<DnsNodeId, { label: string; sublabel: string; detail: string }>;
    iterative: StepText[];
    recursive: StepText[];
    compare: { title: string; subtitle: string; rows: CompareRow[] };
  };
  cache: {
    kicker: string;
    title: string;
    subtitle: string;
    resolveBtn: string;
    resolving: string;
    ttl: string;
    latency: string;
    unit: string;
    checking: string;
    hit: string;
    miss: string;
    emptyLayer: string;
    sources: Record<CacheSource, string>;
    layers: {
      browser: { label: string; sublabel: string };
      resolver: { label: string; sublabel: string };
      full: { label: string; sublabel: string };
    };
    logTitle: string;
    logEmpty: string;
    ttlNote: string;
    whoCaches: string;
  };
  records: {
    kicker: string;
    title: string;
    subtitle: string;
    zoneTitle: string;
    whatLabel: string;
    whenLabel: string;
    items: Record<RecordType, { name: string; ttl: number; value: string; what: string; when: string }>;
  };
};

const en: DnsContent = {
  hero: {
    kicker: '01 · The idea',
    title: 'The internet’s phonebook',
    subtitle:
      'Humans remember names; machines connect to numbers. DNS is the global directory that turns one into the other — billions of times a day.',
    tryLabel: 'Try a domain',
    recordTag: 'A record · IPv4',
    note: 'Illustrative IPs — real addresses change all the time.',
    domains: [
      { host: 'youtube.com', ip: '142.250.x.x' },
      { host: 'github.com', ip: '140.82.x.x' },
      { host: 'wikipedia.org', ip: '198.35.x.x' },
    ],
  },
  anatomy: {
    kicker: '02 · Anatomy',
    title: 'One name, a hierarchy in disguise',
    subtitle:
      'Read a domain right-to-left and the DNS tree reveals itself. Every level is owned and answered by a different set of servers.',
    mapHint: 'Click a part of the name — or a node on the map.',
    treeCaption: 'A domain name is a path through this tree, from the root to your host.',
    segments: {
      root: {
        text: '.',
        tag: 'root',
        desc: 'The invisible dot at the end of every domain. All lookups start here — 13 logical root server clusters, replicated worldwide, know where every TLD lives.',
      },
      tld: {
        text: 'com',
        tag: 'TLD',
        desc: 'The Top-Level Domain. Run by registries; its nameservers know which authoritative servers answer for every domain registered under it.',
      },
      domain: {
        text: 'youtube',
        tag: 'domain',
        desc: 'The registrable (second-level) domain. Whoever owns it controls the authoritative records for everything beneath it.',
      },
      sub: {
        text: 'www',
        tag: 'subdomain',
        desc: 'A host the owner defines freely — www, api, music… Each subdomain can point somewhere completely different.',
      },
    },
  },
  journey: {
    kicker: '03 · The lookup',
    title: 'The journey of a lookup',
    subtitle:
      'Play the flow and watch a query hop through the hierarchy — then switch modes and let the resolver do all the work.',
    ui: {
      start: 'Play the lookup',
      replay: 'Replay',
      step: 'Step',
      of: 'of',
      prev: 'Back',
      next: 'Next',
      tapHint: 'Tap any server to learn its role',
      diagramTitle: 'Live diagram',
      recursive: 'Recursive',
      iterative: 'Iterative',
      recursiveHint:
        'The client asks once; the resolver takes responsibility and returns the final answer.',
      iterativeHint:
        'The resolver walks the hierarchy step by step, following referrals to the authoritative answer.',
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
    compare: {
      title: 'Recursive vs Iterative',
      subtitle:
        'Two relationships inside one lookup — recursive is client ↔ resolver, iterative is resolver ↔ hierarchy.',
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
  },
  cache: {
    kicker: '04 · Speed',
    title: 'Cache & TTL lab',
    subtitle:
      'The full journey is expensive, so every layer remembers answers. Resolve repeatedly and watch where the answer comes from — and what happens when a TTL expires.',
    resolveBtn: 'Resolve youtube.com',
    resolving: 'Resolving…',
    ttl: 'TTL',
    latency: 'latency',
    unit: 'ms',
    checking: 'checking…',
    hit: 'hit',
    miss: 'miss',
    emptyLayer: 'empty',
    sources: {
      browser: 'Browser hit',
      resolver: 'Resolver hit',
      full: 'Full lookup',
    },
    layers: {
      browser: { label: 'Browser cache', sublabel: 'your device' },
      resolver: { label: 'Resolver cache', sublabel: 'ISP · 1.1.1.1 · 8.8.8.8' },
      full: { label: 'Full lookup', sublabel: 'root → TLD → authoritative' },
    },
    logTitle: 'Lookup log',
    logEmpty: 'No lookups yet — hit resolve to start.',
    ttlNote:
      'TTL (Time To Live) decides how long a cached answer can be reused before a fresh lookup is needed.',
    whoCaches:
      'Short TTLs let you change servers fast; long TTLs cut load and latency. Picking one is a real design decision.',
  },
  records: {
    kicker: '05 · The records',
    title: 'What DNS actually stores',
    subtitle:
      'A name doesn’t just map to an IP. Pick a record type and read the zone line it would produce.',
    zoneTitle: 'zone · youtube.com',
    whatLabel: 'What it is',
    whenLabel: 'Typical use',
    items: {
      A: {
        name: 'youtube.com.',
        ttl: 300,
        value: '142.250.x.x',
        what: 'Maps a name to an IPv4 address — the workhorse record of the web.',
        when: 'Websites, APIs — anything reachable over IPv4.',
      },
      AAAA: {
        name: 'youtube.com.',
        ttl: 300,
        value: '2607:f8b0:400a::x',
        what: 'Same idea as A, but for a 128-bit IPv6 address.',
        when: 'The IPv6 internet — usually published alongside A.',
      },
      CNAME: {
        name: 'www.youtube.com.',
        ttl: 3600,
        value: 'youtube.com.',
        what: 'An alias — points a name at another name instead of an IP.',
        when: 'www → apex, or pointing a host at a CDN hostname.',
      },
      MX: {
        name: 'youtube.com.',
        ttl: 3600,
        value: '10 smtp.google.com.',
        what: 'Mail exchanger — where e-mail for the domain is delivered, with a priority number.',
        when: 'Any domain that receives e-mail.',
      },
      NS: {
        name: 'youtube.com.',
        ttl: 86400,
        value: 'ns1.google.com.',
        what: 'Delegates the zone — names the authoritative servers for the domain.',
        when: 'Every registered domain publishes NS records.',
      },
      TXT: {
        name: 'youtube.com.',
        ttl: 3600,
        value: '"v=spf1 include:_spf.google.com ~all"',
        what: 'Free-form text attached to a name — machine-readable notes.',
        when: 'Domain verification, SPF/DKIM anti-spoofing policies.',
      },
    },
  },
};

const ptBR: DnsContent = {
  hero: {
    kicker: '01 · A ideia',
    title: 'A agenda telefônica da internet',
    subtitle:
      'Humanos lembram nomes; máquinas conectam por números. O DNS é o diretório global que transforma um no outro — bilhões de vezes por dia.',
    tryLabel: 'Teste um domínio',
    recordTag: 'Registro A · IPv4',
    note: 'IPs ilustrativos — endereços reais mudam o tempo todo.',
    domains: [
      { host: 'youtube.com', ip: '142.250.x.x' },
      { host: 'github.com', ip: '140.82.x.x' },
      { host: 'wikipedia.org', ip: '198.35.x.x' },
    ],
  },
  anatomy: {
    kicker: '02 · Anatomia',
    title: 'Um nome, uma hierarquia disfarçada',
    subtitle:
      'Leia um domínio da direita para a esquerda e a árvore do DNS se revela. Cada nível é controlado e respondido por um conjunto diferente de servidores.',
    mapHint: 'Clique em uma parte do nome — ou em um nó do mapa.',
    treeCaption: 'Um nome de domínio é um caminho nesta árvore, da raiz até o seu host.',
    segments: {
      root: {
        text: '.',
        tag: 'raiz',
        desc: 'O ponto invisível no final de todo domínio. Toda busca começa aqui — 13 clusters lógicos de servidores raiz, replicados pelo mundo, sabem onde vive cada TLD.',
      },
      tld: {
        text: 'com',
        tag: 'TLD',
        desc: 'O domínio de topo (Top-Level Domain). Operado por registries; seus nameservers sabem quais servidores autoritativos respondem por cada domínio registrado abaixo dele.',
      },
      domain: {
        text: 'youtube',
        tag: 'domínio',
        desc: 'O domínio registrável (segundo nível). Quem é dono dele controla os registros autoritativos de tudo que está abaixo.',
      },
      sub: {
        text: 'www',
        tag: 'subdomínio',
        desc: 'Um host que o dono define livremente — www, api, music… Cada subdomínio pode apontar para um lugar completamente diferente.',
      },
    },
  },
  journey: {
    kicker: '03 · A busca',
    title: 'A jornada de uma busca',
    subtitle:
      'Dê play e veja a consulta saltar pela hierarquia — depois troque o modo e deixe o resolver fazer todo o trabalho.',
    ui: {
      start: 'Rodar a busca',
      replay: 'Repetir',
      step: 'Passo',
      of: 'de',
      prev: 'Voltar',
      next: 'Próximo',
      tapHint: 'Toque em um servidor para ver o papel dele',
      diagramTitle: 'Diagrama ao vivo',
      recursive: 'Recursiva',
      iterative: 'Iterativa',
      recursiveHint:
        'O cliente pergunta uma vez; o resolver assume a responsabilidade e devolve a resposta final.',
      iterativeHint:
        'O resolver percorre a hierarquia passo a passo, seguindo encaminhamentos até a resposta autoritativa.',
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
    compare: {
      title: 'Recursiva vs Iterativa',
      subtitle:
        'Duas relações dentro de uma mesma busca — recursiva é cliente ↔ resolver, iterativa é resolver ↔ hierarquia.',
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
  },
  cache: {
    kicker: '04 · Velocidade',
    title: 'Laboratório de Cache & TTL',
    subtitle:
      'A jornada completa é cara, então cada camada memoriza respostas. Resolva várias vezes e veja de onde a resposta vem — e o que acontece quando um TTL expira.',
    resolveBtn: 'Resolver youtube.com',
    resolving: 'Resolvendo…',
    ttl: 'TTL',
    latency: 'latência',
    unit: 'ms',
    checking: 'verificando…',
    hit: 'hit',
    miss: 'miss',
    emptyLayer: 'vazio',
    sources: {
      browser: 'Hit no navegador',
      resolver: 'Hit no resolver',
      full: 'Busca completa',
    },
    layers: {
      browser: { label: 'Cache do navegador', sublabel: 'seu dispositivo' },
      resolver: { label: 'Cache do resolver', sublabel: 'ISP · 1.1.1.1 · 8.8.8.8' },
      full: { label: 'Busca completa', sublabel: 'root → TLD → autoritativo' },
    },
    logTitle: 'Histórico de buscas',
    logEmpty: 'Nenhuma busca ainda — clique em resolver para começar.',
    ttlNote:
      'O TTL (Time To Live) define por quanto tempo uma resposta em cache pode ser reutilizada antes de uma nova busca.',
    whoCaches:
      'TTL curto permite trocar de servidor rápido; TTL longo corta carga e latência. Escolher é uma decisão real de design.',
  },
  records: {
    kicker: '05 · Os registros',
    title: 'O que o DNS guarda de verdade',
    subtitle:
      'Um nome não aponta só para um IP. Escolha um tipo de registro e leia a linha de zona que ele produziria.',
    zoneTitle: 'zona · youtube.com',
    whatLabel: 'O que é',
    whenLabel: 'Uso típico',
    items: {
      A: {
        name: 'youtube.com.',
        ttl: 300,
        value: '142.250.x.x',
        what: 'Mapeia um nome para um endereço IPv4 — o registro mais usado da web.',
        when: 'Sites, APIs — qualquer coisa alcançável por IPv4.',
      },
      AAAA: {
        name: 'youtube.com.',
        ttl: 300,
        value: '2607:f8b0:400a::x',
        what: 'Mesma ideia do A, mas para um endereço IPv6 de 128 bits.',
        when: 'A internet IPv6 — normalmente publicado junto com o A.',
      },
      CNAME: {
        name: 'www.youtube.com.',
        ttl: 3600,
        value: 'youtube.com.',
        what: 'Um apelido — aponta um nome para outro nome, em vez de um IP.',
        when: 'www → domínio raiz, ou apontar um host para o hostname de um CDN.',
      },
      MX: {
        name: 'youtube.com.',
        ttl: 3600,
        value: '10 smtp.google.com.',
        what: 'Mail exchanger — para onde o e-mail do domínio é entregue, com um número de prioridade.',
        when: 'Qualquer domínio que recebe e-mail.',
      },
      NS: {
        name: 'youtube.com.',
        ttl: 86400,
        value: 'ns1.google.com.',
        what: 'Delegação da zona — nomeia os servidores autoritativos do domínio.',
        when: 'Todo domínio registrado publica registros NS.',
      },
      TXT: {
        name: 'youtube.com.',
        ttl: 3600,
        value: '"v=spf1 include:_spf.google.com ~all"',
        what: 'Texto livre associado a um nome — anotações legíveis por máquina.',
        when: 'Verificação de domínio, políticas anti-spoofing SPF/DKIM.',
      },
    },
  },
};

export const dnsContent: Record<Locale, DnsContent> = { en, 'pt-BR': ptBR };
