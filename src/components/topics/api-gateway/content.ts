import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the API Gateway lesson. Same convention as the other
 * topics: long-form prose lives in the Markdown file; the strings that drive
 * the control tower, the before/after toggle, the responsibilities explorer,
 * the routing demo, and the protocol translation viz live here — typed &
 * bilingual.
 */

export type ServiceId = 'users' | 'payments' | 'orders';
export type CheckpointId = 'auth' | 'authz' | 'validation' | 'ratelimit' | 'routing';

export type TowerScenario = {
  id: string;
  label: string;
  method: string;
  path: string;
  /** Which checkpoint rejects the request; `null` means it passes all of them. */
  failAt: Exclude<CheckpointId, 'routing'> | null;
  /** Target service when the request passes. */
  service: ServiceId;
  /** HTTP status the client ends up seeing. */
  code: number;
  codeText: string;
  note: string;
};

export type Checkpoint = {
  id: CheckpointId;
  label: string;
  question: string;
};

export type Responsibility = {
  id: string;
  label: string;
  what: string;
  example: string;
  where: string;
};

export type RouteRule = {
  id: ServiceId;
  method: string;
  path: string;
  service: string;
};

export type GatewayContent = {
  shared: {
    send: string;
    sending: string;
    reset: string;
    client: string;
    gateway: string;
    passed: string;
    rejected: string;
    services: Record<ServiceId, string>;
  };

  tower: {
    title: string;
    subtitle: string;
    scenarioLabel: string;
    scenarios: TowerScenario[];
    checkpoints: Checkpoint[];
    logLabel: string;
    logEmpty: string;
    idleHint: string;
    note: string;
  };

  beforeAfter: {
    title: string;
    subtitle: string;
    withoutLabel: string;
    withLabel: string;
    withoutHeading: string;
    withHeading: string;
    withoutPoints: string[];
    withPoints: string[];
    duplicatedTag: string;
    centralizedTag: string;
    concerns: string[];
    note: string;
  };

  responsibilities: {
    title: string;
    subtitle: string;
    tapHint: string;
    whatLabel: string;
    exampleLabel: string;
    whereLabel: string;
    items: Responsibility[];
    warning: string;
  };

  routing: {
    title: string;
    subtitle: string;
    tableLabel: string;
    routes: RouteRule[];
    hitsLabel: string;
    tapHint: string;
    note: string;
  };

  protocol: {
    title: string;
    subtitle: string;
    send: string;
    edgeLabel: string;
    internalLabel: string;
    translating: string;
    requestTitle: string;
    responseTitle: string;
    whyTitle: string;
    why: string[];
    note: string;
  };
};

const en: GatewayContent = {
  shared: {
    send: 'Send request',
    sending: 'In flight…',
    reset: 'Reset',
    client: 'Frontend',
    gateway: 'API Gateway',
    passed: 'passed',
    rejected: 'rejected',
    services: {
      users: 'User service',
      payments: 'Payment service',
      orders: 'Order service',
    },
  },

  tower: {
    title: 'The control tower — follow a request through the gateway',
    subtitle:
      'Pick a scenario and send the request. Watch it enter the gateway, clear each checkpoint one by one, and either reach a service — or get bounced at the exact layer that failed.',
    scenarioLabel: 'Scenario',
    scenarios: [
      {
        id: 'ok',
        label: 'Valid request',
        method: 'GET',
        path: '/users/42',
        failAt: null,
        service: 'users',
        code: 200,
        codeText: 'OK',
        note: 'Token valid, permission granted, payload fine, under the rate limit — the gateway routes it to the user service and relays the response back.',
      },
      {
        id: 'auth',
        label: 'Expired token',
        method: 'GET',
        path: '/orders/9',
        failAt: 'auth',
        service: 'orders',
        code: 401,
        codeText: 'Unauthorized',
        note: 'The token is expired, so authentication fails at the very first checkpoint. No service ever sees this request — the gateway rejects it at the door.',
      },
      {
        id: 'authz',
        label: 'No permission',
        method: 'DELETE',
        path: '/payments/7',
        failAt: 'authz',
        service: 'payments',
        code: 403,
        codeText: 'Forbidden',
        note: 'The caller is authenticated (we know who they are) but not authorized (they may not delete payments). Identity passed; permission did not.',
      },
      {
        id: 'validation',
        label: 'Broken payload',
        method: 'POST',
        path: '/orders',
        failAt: 'validation',
        service: 'orders',
        code: 400,
        codeText: 'Bad Request',
        note: 'The body is malformed — a required field is missing. The gateway rejects it before wasting a service call on a request that could never succeed.',
      },
      {
        id: 'ratelimit',
        label: 'Too many requests',
        method: 'GET',
        path: '/users/42',
        failAt: 'ratelimit',
        service: 'users',
        code: 429,
        codeText: 'Too Many Requests',
        note: 'This client burned through its quota. The gateway sheds the excess with a 429 so the services behind it stay healthy.',
      },
    ],
    checkpoints: [
      { id: 'auth', label: 'Authentication', question: 'Who are you?' },
      { id: 'authz', label: 'Authorization', question: 'May you do this?' },
      { id: 'validation', label: 'Validation', question: 'Is the request well-formed?' },
      { id: 'ratelimit', label: 'Rate limit', question: 'Are you within quota?' },
      { id: 'routing', label: 'Routing', question: 'Which service handles this?' },
    ],
    logLabel: 'Gateway log',
    logEmpty: 'No requests yet — pick a scenario and hit Send.',
    idleHint: 'Every request runs the same gauntlet. A rejection at any layer stops it right there.',
    note: 'This is the core idea: the gateway is a policy pipeline, not just a router. Checks run once, at the edge, and only clean traffic reaches the services.',
  },

  beforeAfter: {
    title: 'Without a gateway vs with a gateway',
    subtitle:
      'Toggle the two architectures. Same frontend, same three services — what changes is who carries the cross-cutting work.',
    withoutLabel: 'Without gateway',
    withLabel: 'With gateway',
    withoutHeading: 'Frontend talks to every service directly',
    withHeading: 'Frontend talks to one front door',
    withoutPoints: [
      'The frontend must know the address of every service.',
      'Auth, validation, and rate limiting are re-implemented in each service.',
      'Every internal change (split a service, rename a route) can break clients.',
    ],
    withPoints: [
      'The frontend knows exactly one endpoint: the gateway.',
      'Auth, validation, and rate limiting are enforced once, at the edge.',
      'Services stay hidden and free to change behind a stable public API.',
    ],
    duplicatedTag: 'duplicated ×3',
    centralizedTag: 'enforced once',
    concerns: ['auth', 'validation', 'rate limit'],
    note: 'The gateway trades a hop of latency and one more component to run for simpler clients, hidden internals, and one place to enforce policy.',
  },

  responsibilities: {
    title: 'What the gateway can take on',
    subtitle:
      'Tap a responsibility to see what it does, a concrete example, and whether it belongs in the gateway or in the service.',
    tapHint: 'Tap a card to inspect it',
    whatLabel: 'What it does',
    exampleLabel: 'Example',
    whereLabel: 'Gateway or service?',
    items: [
      {
        id: 'auth',
        label: 'Authentication',
        what: 'Verifies who the caller is — validates the JWT, API key, or session before anything else runs.',
        example: 'Check the signature and expiry of a Bearer token; attach the user id to the request.',
        where: 'Gateway. Verify identity once at the edge instead of in every service.',
      },
      {
        id: 'authz',
        label: 'Authorization',
        what: 'Checks whether the authenticated caller is allowed to perform this action on this resource.',
        example: 'Only callers with the admin role may call DELETE /payments/:id.',
        where: 'Split. Coarse checks (role, scope) fit the gateway; fine-grained, data-dependent rules belong in the service.',
      },
      {
        id: 'approve',
        label: 'Approve / reject',
        what: 'The sum of all checks: every request is either forwarded downstream or rejected with a clear status code.',
        example: '401 unauthenticated, 403 forbidden, 400 invalid, 429 over quota — each rejection names its layer.',
        where: 'Gateway. Rejecting early is cheap; rejecting deep in a service wastes work.',
      },
      {
        id: 'validation',
        label: 'Validation',
        what: 'Rejects malformed requests — bad JSON, missing fields, wrong types — before they burn a service call.',
        example: 'POST /orders must carry items[] and a valid address; anything else is a 400.',
        where: 'Split. Schema/shape checks fit the gateway; business rules ("is this item in stock?") stay in the service.',
      },
      {
        id: 'ratelimit',
        label: 'Rate limiting',
        what: 'Caps how fast each client may call, per API key, user, or IP — shedding the excess with a 429.',
        example: 'Free tier: 100 req/min per API key; pro tier: 10,000 — one shared counter for all services.',
        where: 'Gateway. Quotas are a cross-service policy; one shared counter beats one per service.',
      },
      {
        id: 'protection',
        label: 'Protections',
        what: 'Front-line defenses: TLS termination, request size caps, timeouts, IP blocklists, basic bot filtering.',
        example: 'Drop bodies over 1 MB and requests from a blocklisted IP range before they touch anything.',
        where: 'Gateway (plus the edge). Services should never see obviously hostile traffic.',
      },
      {
        id: 'routing',
        label: 'Routing',
        what: 'Maps each request to the right backend service by path, method, host, or header.',
        example: '/users/** → user service, /payments/** → payment service, /orders/** → order service.',
        where: 'Gateway. This is its most basic job — but note it is the last step, after the policy checks.',
      },
      {
        id: 'protocol',
        label: 'Protocol translation',
        what: 'Speaks HTTP/JSON with the outside world and faster internal protocols (gRPC, etc.) with services.',
        example: 'Accept POST /orders as JSON, forward it as a gRPC CreateOrder call to the order service.',
        where: 'Gateway. Clients keep a friendly API; services keep an efficient one.',
      },
    ],
    warning:
      'The trap: the gateway should stay a thin policy layer. The moment business logic accumulates in it, you have rebuilt a monolith at the front door.',
  },

  routing: {
    title: 'One door, many services — path-based routing',
    subtitle:
      'The gateway holds a routing table. Fire a request at each path and watch it get dispatched to the matching service.',
    tableLabel: 'Routing table',
    routes: [
      { id: 'users', method: 'GET', path: '/users/42', service: 'user-service' },
      { id: 'payments', method: 'POST', path: '/payments', service: 'payment-service' },
      { id: 'orders', method: 'GET', path: '/orders/9', service: 'order-service' },
    ],
    hitsLabel: 'hits',
    tapHint: 'Tap a request to dispatch it',
    note: 'Clients never learn service addresses. Split the order service in two tomorrow, update one routing rule, and no client changes at all.',
  },

  protocol: {
    title: 'Protocol translation — HTTP outside, gRPC inside',
    subtitle:
      'Clients speak plain HTTP/JSON, which every browser and app understands. Internally, the gateway can forward the same request as gRPC — compact, binary, and fast.',
    send: 'Send request',
    edgeLabel: 'Public edge — HTTP/1.1 + JSON',
    internalLabel: 'Internal network — gRPC (HTTP/2 + protobuf)',
    translating: 'translating…',
    requestTitle: 'Request',
    responseTitle: 'Response',
    whyTitle: 'Why bother?',
    why: [
      'Browsers and third parties get a universal, debuggable JSON API.',
      'Internal calls get binary encoding, multiplexing, and typed contracts.',
      'Services can migrate protocols without any client noticing.',
    ],
    note: 'The gateway is the adapter between the friendly public API and the efficient internal one — each side uses what suits it best.',
  },
};

const ptBR: GatewayContent = {
  shared: {
    send: 'Enviar requisição',
    sending: 'Em voo…',
    reset: 'Reiniciar',
    client: 'Frontend',
    gateway: 'API Gateway',
    passed: 'aprovada',
    rejected: 'rejeitada',
    services: {
      users: 'Serviço de usuários',
      payments: 'Serviço de pagamentos',
      orders: 'Serviço de pedidos',
    },
  },

  tower: {
    title: 'A torre de controle — siga uma requisição pelo gateway',
    subtitle:
      'Escolha um cenário e envie a requisição. Veja-a entrar no gateway, passar por cada checkpoint um a um e chegar a um serviço — ou ser barrada exatamente na camada que falhou.',
    scenarioLabel: 'Cenário',
    scenarios: [
      {
        id: 'ok',
        label: 'Requisição válida',
        method: 'GET',
        path: '/users/42',
        failAt: null,
        service: 'users',
        code: 200,
        codeText: 'OK',
        note: 'Token válido, permissão concedida, payload ok, dentro do limite — o gateway roteia para o serviço de usuários e devolve a resposta ao cliente.',
      },
      {
        id: 'auth',
        label: 'Token expirado',
        method: 'GET',
        path: '/orders/9',
        failAt: 'auth',
        service: 'orders',
        code: 401,
        codeText: 'Unauthorized',
        note: 'O token está expirado, então a autenticação falha logo no primeiro checkpoint. Nenhum serviço chega a ver essa requisição — o gateway rejeita na porta.',
      },
      {
        id: 'authz',
        label: 'Sem permissão',
        method: 'DELETE',
        path: '/payments/7',
        failAt: 'authz',
        service: 'payments',
        code: 403,
        codeText: 'Forbidden',
        note: 'O chamador está autenticado (sabemos quem é), mas não autorizado (não pode apagar pagamentos). A identidade passou; a permissão não.',
      },
      {
        id: 'validation',
        label: 'Payload quebrado',
        method: 'POST',
        path: '/orders',
        failAt: 'validation',
        service: 'orders',
        code: 400,
        codeText: 'Bad Request',
        note: 'O corpo está malformado — falta um campo obrigatório. O gateway rejeita antes de gastar uma chamada de serviço com uma requisição que nunca teria sucesso.',
      },
      {
        id: 'ratelimit',
        label: 'Requisições demais',
        method: 'GET',
        path: '/users/42',
        failAt: 'ratelimit',
        service: 'users',
        code: 429,
        codeText: 'Too Many Requests',
        note: 'Este cliente estourou a cota. O gateway descarta o excesso com 429 para os serviços atrás dele continuarem saudáveis.',
      },
    ],
    checkpoints: [
      { id: 'auth', label: 'Autenticação', question: 'Quem é você?' },
      { id: 'authz', label: 'Autorização', question: 'Você pode fazer isso?' },
      { id: 'validation', label: 'Validação', question: 'A requisição está bem-formada?' },
      { id: 'ratelimit', label: 'Rate limit', question: 'Você está dentro da cota?' },
      { id: 'routing', label: 'Roteamento', question: 'Qual serviço atende isso?' },
    ],
    logLabel: 'Log do gateway',
    logEmpty: 'Nenhuma requisição ainda — escolha um cenário e aperte Enviar.',
    idleHint: 'Toda requisição passa pela mesma bateria de checagens. Uma rejeição em qualquer camada a interrompe ali mesmo.',
    note: 'Essa é a ideia central: o gateway é um pipeline de políticas, não só um roteador. As checagens rodam uma vez, na borda, e só tráfego limpo chega aos serviços.',
  },

  beforeAfter: {
    title: 'Sem gateway vs com gateway',
    subtitle:
      'Alterne entre as duas arquiteturas. Mesmo frontend, mesmos três serviços — o que muda é quem carrega o trabalho transversal.',
    withoutLabel: 'Sem gateway',
    withLabel: 'Com gateway',
    withoutHeading: 'O frontend fala com cada serviço diretamente',
    withHeading: 'O frontend fala com uma única porta de entrada',
    withoutPoints: [
      'O frontend precisa conhecer o endereço de cada serviço.',
      'Auth, validação e rate limiting são reimplementados em cada serviço.',
      'Qualquer mudança interna (dividir um serviço, renomear uma rota) pode quebrar clientes.',
    ],
    withPoints: [
      'O frontend conhece exatamente um endpoint: o gateway.',
      'Auth, validação e rate limiting são aplicados uma vez, na borda.',
      'Os serviços ficam escondidos e livres para mudar atrás de uma API pública estável.',
    ],
    duplicatedTag: 'duplicado ×3',
    centralizedTag: 'aplicado uma vez',
    concerns: ['auth', 'validação', 'rate limit'],
    note: 'O gateway troca um salto de latência e mais um componente para operar por clientes mais simples, internos escondidos e um único lugar para aplicar políticas.',
  },

  responsibilities: {
    title: 'O que o gateway pode assumir',
    subtitle:
      'Toque numa responsabilidade para ver o que ela faz, um exemplo concreto e se ela pertence ao gateway ou ao serviço.',
    tapHint: 'Toque num card para inspecionar',
    whatLabel: 'O que faz',
    exampleLabel: 'Exemplo',
    whereLabel: 'Gateway ou serviço?',
    items: [
      {
        id: 'auth',
        label: 'Autenticação',
        what: 'Verifica quem é o chamador — valida o JWT, a API key ou a sessão antes de qualquer outra coisa rodar.',
        example: 'Checar a assinatura e a validade de um Bearer token; anexar o id do usuário à requisição.',
        where: 'Gateway. Verifique a identidade uma vez na borda em vez de em cada serviço.',
      },
      {
        id: 'authz',
        label: 'Autorização',
        what: 'Checa se o chamador autenticado tem permissão para executar esta ação neste recurso.',
        example: 'Só chamadores com papel de admin podem chamar DELETE /payments/:id.',
        where: 'Dividido. Checagens grossas (papel, escopo) cabem no gateway; regras finas, dependentes de dados, ficam no serviço.',
      },
      {
        id: 'approve',
        label: 'Aprovar / rejeitar',
        what: 'A soma de todas as checagens: cada requisição é encaminhada adiante ou rejeitada com um status claro.',
        example: '401 não autenticada, 403 proibida, 400 inválida, 429 acima da cota — cada rejeição nomeia sua camada.',
        where: 'Gateway. Rejeitar cedo é barato; rejeitar no fundo de um serviço desperdiça trabalho.',
      },
      {
        id: 'validation',
        label: 'Validação',
        what: 'Rejeita requisições malformadas — JSON quebrado, campos faltando, tipos errados — antes de gastarem uma chamada de serviço.',
        example: 'POST /orders precisa levar items[] e um endereço válido; qualquer outra coisa é 400.',
        where: 'Dividido. Checagens de esquema/forma cabem no gateway; regras de negócio ("este item tem estoque?") ficam no serviço.',
      },
      {
        id: 'ratelimit',
        label: 'Rate limiting',
        what: 'Limita a velocidade de cada cliente, por API key, usuário ou IP — descartando o excesso com 429.',
        example: 'Plano free: 100 req/min por API key; plano pro: 10.000 — um contador compartilhado para todos os serviços.',
        where: 'Gateway. Cotas são política entre serviços; um contador compartilhado vale mais que um por serviço.',
      },
      {
        id: 'protection',
        label: 'Proteções',
        what: 'Defesas de linha de frente: terminação TLS, limite de tamanho de requisição, timeouts, blocklists de IP, filtro básico de bots.',
        example: 'Descartar corpos acima de 1 MB e requisições de uma faixa de IP bloqueada antes que toquem em qualquer coisa.',
        where: 'Gateway (e o edge). Serviços nunca deveriam ver tráfego obviamente hostil.',
      },
      {
        id: 'routing',
        label: 'Roteamento',
        what: 'Mapeia cada requisição para o serviço de backend certo por caminho, método, host ou cabeçalho.',
        example: '/users/** → serviço de usuários, /payments/** → pagamentos, /orders/** → pedidos.',
        where: 'Gateway. É o trabalho mais básico dele — mas note que é o último passo, depois das checagens de política.',
      },
      {
        id: 'protocol',
        label: 'Tradução de protocolo',
        what: 'Fala HTTP/JSON com o mundo externo e protocolos internos mais rápidos (gRPC etc.) com os serviços.',
        example: 'Aceitar POST /orders como JSON e encaminhar como uma chamada gRPC CreateOrder ao serviço de pedidos.',
        where: 'Gateway. Clientes ficam com uma API amigável; serviços, com uma eficiente.',
      },
    ],
    warning:
      'A armadilha: o gateway deve continuar uma camada fina de políticas. No momento em que lógica de negócio se acumula nele, você reconstruiu um monólito na porta de entrada.',
  },

  routing: {
    title: 'Uma porta, muitos serviços — roteamento por caminho',
    subtitle:
      'O gateway mantém uma tabela de rotas. Dispare uma requisição para cada caminho e veja-a ser despachada ao serviço correspondente.',
    tableLabel: 'Tabela de rotas',
    routes: [
      { id: 'users', method: 'GET', path: '/users/42', service: 'user-service' },
      { id: 'payments', method: 'POST', path: '/payments', service: 'payment-service' },
      { id: 'orders', method: 'GET', path: '/orders/9', service: 'order-service' },
    ],
    hitsLabel: 'chamadas',
    tapHint: 'Toque numa requisição para despachá-la',
    note: 'Clientes nunca aprendem endereços de serviços. Divida o serviço de pedidos em dois amanhã, atualize uma regra de rota, e nenhum cliente muda.',
  },

  protocol: {
    title: 'Tradução de protocolo — HTTP fora, gRPC dentro',
    subtitle:
      'Clientes falam HTTP/JSON puro, que todo navegador e app entende. Internamente, o gateway pode encaminhar a mesma requisição como gRPC — compacto, binário e rápido.',
    send: 'Enviar requisição',
    edgeLabel: 'Borda pública — HTTP/1.1 + JSON',
    internalLabel: 'Rede interna — gRPC (HTTP/2 + protobuf)',
    translating: 'traduzindo…',
    requestTitle: 'Requisição',
    responseTitle: 'Resposta',
    whyTitle: 'Por que fazer isso?',
    why: [
      'Navegadores e terceiros ganham uma API JSON universal e fácil de depurar.',
      'Chamadas internas ganham codificação binária, multiplexação e contratos tipados.',
      'Serviços podem migrar de protocolo sem nenhum cliente perceber.',
    ],
    note: 'O gateway é o adaptador entre a API pública amigável e a interna eficiente — cada lado usa o que lhe serve melhor.',
  },
};

export const gatewayContent: Record<Locale, GatewayContent> = {
  en,
  'pt-BR': ptBR,
};
