import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the REST API lesson. Wire text (methods, paths, JSON)
 * is shared across locales — only the explanations are translated.
 */

export type CallId = 'list' | 'read' | 'create' | 'update' | 'delete';
export type ConditionId =
  | 'ok'
  | 'noToken'
  | 'overQuota'
  | 'malformed'
  | 'notOwner'
  | 'missing'
  | 'serverError';
export type StopAt = 'gateway' | 'service' | 'db';
export type ResourceId = 'tweets' | 'users';
export type PageMode = 'offset' | 'cursor';

export type CallWire = {
  method: string;
  path: string;
  body?: string;
  okCode: number;
  okBody: string;
};

/** The five calls the playground can send. */
export const callWire: Record<CallId, CallWire> = {
  list: {
    method: 'GET',
    path: '/v1/tweets?limit=2',
    okCode: 200,
    okBody: `{
  "data": [
    { "id": "t_901", "text": "Shipped the outbox pattern.", "likes": 42 },
    { "id": "t_900", "text": "Cache invalidation, again.", "likes": 17 }
  ],
  "nextCursor": "t_899"
}`,
  },
  read: {
    method: 'GET',
    path: '/v1/tweets/t_901',
    okCode: 200,
    okBody: `{
  "id": "t_901",
  "text": "Shipped the outbox pattern.",
  "authorId": "u_42",
  "likes": 42,
  "createdAt": "2026-09-01T09:12:00Z"
}`,
  },
  create: {
    method: 'POST',
    path: '/v1/tweets',
    body: `{ "text": "REST is an architectural style." }`,
    okCode: 201,
    okBody: `HTTP/1.1 201 Created
Location: /v1/tweets/t_902

{
  "id": "t_902",
  "text": "REST is an architectural style.",
  "likes": 0
}`,
  },
  update: {
    method: 'PATCH',
    path: '/v1/tweets/t_901',
    body: `{ "text": "Shipped the outbox pattern. Finally." }`,
    okCode: 200,
    okBody: `{
  "id": "t_901",
  "text": "Shipped the outbox pattern. Finally.",
  "likes": 42
}`,
  },
  delete: {
    method: 'DELETE',
    path: '/v1/tweets/t_901',
    okCode: 204,
    okBody: `HTTP/1.1 204 No Content`,
  },
};

export type ConditionWire = { code: number; stopAt: StopAt; body: string };

/** Failure modes, each rejected at a different point in the chain. */
export const conditionWire: Record<Exclude<ConditionId, 'ok'>, ConditionWire> = {
  noToken: {
    code: 401,
    stopAt: 'gateway',
    body: `{
  "error": "unauthorized",
  "message": "Missing or invalid access token"
}`,
  },
  overQuota: {
    code: 429,
    stopAt: 'gateway',
    body: `HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Remaining: 0

{ "error": "rate_limited" }`,
  },
  malformed: {
    code: 400,
    stopAt: 'service',
    body: `{
  "error": "validation_failed",
  "fields": { "text": "must be a string of 1..280 characters" }
}`,
  },
  notOwner: {
    code: 403,
    stopAt: 'service',
    body: `{
  "error": "forbidden",
  "message": "You may only modify your own tweets"
}`,
  },
  missing: {
    code: 404,
    stopAt: 'db',
    body: `{
  "error": "not_found",
  "message": "No tweet with id t_901"
}`,
  },
  serverError: {
    code: 500,
    stopAt: 'db',
    body: `{
  "error": "internal_error",
  "traceId": "6f1c9a2b"
}`,
  },
};

export type EndpointRow = {
  method: string;
  path: string;
  what: string;
  safe: boolean;
  idempotent: boolean;
};

export type RestContent = {
  shared: {
    send: string;
    sending: string;
    reset: string;
    client: string;
    gateway: string;
    service: string;
    database: string;
    yes: string;
    no: string;
  };
  playground: {
    title: string;
    subtitle: string;
    callLabel: string;
    conditionLabel: string;
    calls: { id: CallId; label: string; note: string }[];
    conditions: { id: ConditionId; label: string; codeText: string; explain: string }[];
    requestTitle: string;
    responseTitle: string;
    waiting: string;
    stoppedAt: string;
    stops: Record<StopAt, string>;
    logLabel: string;
    logEmpty: string;
    note: string;
  };
  resources: {
    title: string;
    subtitle: string;
    resourceLabel: string;
    resources: { id: ResourceId; label: string; noun: string; rows: EndpointRow[] }[];
    safeLabel: string;
    idempotentLabel: string;
    safeHelp: string;
    idempotentHelp: string;
    putPatchTitle: string;
    putPatch: string[];
    note: string;
  };
  collections: {
    title: string;
    subtitle: string;
    limitLabel: string;
    filterLabel: string;
    modeLabel: string;
    modes: { id: PageMode; label: string; explain: string }[];
    filters: { id: string; label: string; query: string }[];
    limits: number[];
    urlLabel: string;
    responseLabel: string;
    versionTitle: string;
    versionSubtitle: string;
    versions: { id: string; label: string; sample: string; pro: string; con: string }[];
    proLabel: string;
    conLabel: string;
    note: string;
  };
};

const en: RestContent = {
  shared: {
    send: 'Send request',
    sending: 'Sending…',
    reset: 'Reset',
    client: 'Client',
    gateway: 'Gateway',
    service: 'Tweet service',
    database: 'Database',
    yes: 'yes',
    no: 'no',
  },
  playground: {
    title: 'REST request playground',
    subtitle:
      'Pick a call, then pick what goes wrong. Watch where the request dies and which status code comes back — the status is the API telling you whose fault it was.',
    callLabel: 'Call',
    conditionLabel: 'Condition',
    calls: [
      {
        id: 'list',
        label: 'List',
        note: 'Reading a collection. Returns a page of resources plus a cursor for the next page — never the whole table.',
      },
      {
        id: 'read',
        label: 'Read one',
        note: 'Reading a single resource by id. Safe and cacheable: the same call can be repeated as often as you like.',
      },
      {
        id: 'create',
        label: 'Create',
        note: 'POST creates a new resource. The answer is 201 with a Location header pointing at what was just created. Send it twice and you get two tweets — POST is not idempotent.',
      },
      {
        id: 'update',
        label: 'Update',
        note: 'PATCH sends only the fields that change. PUT would replace the whole resource — including the fields you left out.',
      },
      {
        id: 'delete',
        label: 'Delete',
        note: 'DELETE removes the resource. 204 means "done, nothing to say". Deleting twice is still a deleted tweet, so it is idempotent.',
      },
    ],
    conditions: [
      {
        id: 'ok',
        label: 'Everything fine',
        codeText: '',
        explain: 'Valid token, valid body, within quota, resource exists. The request reaches the database and comes back with data.',
      },
      {
        id: 'noToken',
        label: 'No token',
        codeText: 'Unauthorized',
        explain: '401 — the API does not know who you are. Rejected at the edge, before any business code runs.',
      },
      {
        id: 'overQuota',
        label: 'Over quota',
        codeText: 'Too Many Requests',
        explain: '429 — you are known and allowed, but you called too often. Good APIs also send Retry-After so the client knows when to come back.',
      },
      {
        id: 'malformed',
        label: 'Malformed body',
        codeText: 'Bad Request',
        explain: '400 — the request itself is wrong: missing field, wrong type, text too long. Fixing the request is the client’s job.',
      },
      {
        id: 'notOwner',
        label: 'Not the owner',
        codeText: 'Forbidden',
        explain: '403 — the API knows exactly who you are and still says no. 401 means "log in"; 403 means "logging in will not help".',
      },
      {
        id: 'missing',
        label: 'Resource missing',
        codeText: 'Not Found',
        explain: '404 — the endpoint exists, the resource does not. The service had to ask storage before it could know.',
      },
      {
        id: 'serverError',
        label: 'Service failure',
        codeText: 'Server Error',
        explain: '500 — nothing was wrong with your request; something broke on the other side. Never leak stack traces here, just a trace id.',
      },
    ],
    requestTitle: 'Request',
    responseTitle: 'Response',
    waiting: 'waiting…',
    stoppedAt: 'Stopped at',
    stops: {
      gateway: 'the gateway — before any business logic',
      service: 'the service — the rules said no',
      db: 'the data layer — the record decided the answer',
    },
    logLabel: 'Recent calls',
    logEmpty: 'No calls yet. Send one.',
    note: 'Status codes are part of the contract. A client that only checks "did it return JSON" will treat a 403 as data — and quietly do the wrong thing.',
  },
  resources: {
    title: 'Resources, endpoints and what each method promises',
    subtitle:
      'REST models the domain as nouns. The method is the verb, and each verb comes with a promise clients rely on when they retry.',
    resourceLabel: 'Resource',
    resources: [
      {
        id: 'tweets',
        label: 'Tweets',
        noun: '/v1/tweets',
        rows: [
          { method: 'GET', path: '/v1/tweets', what: 'A page of tweets', safe: true, idempotent: true },
          { method: 'GET', path: '/v1/tweets/{id}', what: 'One tweet', safe: true, idempotent: true },
          { method: 'POST', path: '/v1/tweets', what: 'Create a tweet', safe: false, idempotent: false },
          { method: 'PUT', path: '/v1/tweets/{id}', what: 'Replace the whole tweet', safe: false, idempotent: true },
          { method: 'PATCH', path: '/v1/tweets/{id}', what: 'Change some fields', safe: false, idempotent: false },
          { method: 'DELETE', path: '/v1/tweets/{id}', what: 'Remove the tweet', safe: false, idempotent: true },
        ],
      },
      {
        id: 'users',
        label: 'Users',
        noun: '/v1/users',
        rows: [
          { method: 'GET', path: '/v1/users/{id}', what: 'One profile', safe: true, idempotent: true },
          { method: 'GET', path: '/v1/users/{id}/tweets', what: 'That user’s tweets', safe: true, idempotent: true },
          { method: 'POST', path: '/v1/users/{id}/follow', what: 'Follow the user', safe: false, idempotent: false },
          { method: 'DELETE', path: '/v1/users/{id}/follow', what: 'Unfollow the user', safe: false, idempotent: true },
          { method: 'PATCH', path: '/v1/users/me', what: 'Edit your own profile', safe: false, idempotent: false },
        ],
      },
    ],
    safeLabel: 'Safe',
    idempotentLabel: 'Idempotent',
    safeHelp: 'Safe = changes nothing. A crawler can call it a thousand times and the system is untouched.',
    idempotentHelp:
      'Idempotent = calling it again lands in the same final state. That is what makes a retry after a timeout survivable.',
    putPatchTitle: 'PUT and PATCH are not the same thing',
    putPatch: [
      'PUT replaces the resource with what you sent. Fields you omit are gone — that is the contract, not a bug.',
      'PATCH applies a partial change. Only the fields present are touched.',
      'PUT is idempotent (send it twice, same final state). A naive PATCH like "increment likes" is not.',
      'For retry-safe writes, add an idempotency key: the server remembers the key and returns the first answer instead of doing the work twice.',
    ],
    note: 'REST is an architectural style, not a protocol. There is no compiler enforcing any of this — consistency is a team discipline, which is exactly why big APIs publish design guidelines.',
  },
  collections: {
    title: 'Collections: pagination, filtering and versioning',
    subtitle:
      'Build the URL and see what comes back. Every real list endpoint answers three questions: how many, which ones, and which version of the contract.',
    limitLabel: 'Page size',
    filterLabel: 'Filter',
    modeLabel: 'Paging',
    modes: [
      {
        id: 'offset',
        label: 'page & limit',
        explain:
          'Easy to reason about and lets you jump to any page. But it re-counts rows as you go deeper, and new items shift everything — readers see duplicates or gaps.',
      },
      {
        id: 'cursor',
        label: 'cursor',
        explain:
          'The server hands you an opaque pointer to "where you stopped". Stable while items are inserted and cheap at any depth — but no jumping to page 40.',
      },
    ],
    filters: [
      { id: 'none', label: 'None', query: '' },
      { id: 'author', label: 'By author', query: 'authorId=u_42' },
      { id: 'hashtag', label: 'By hashtag', query: 'hashtag=systemdesign' },
    ],
    limits: [2, 5, 10],
    urlLabel: 'Request URL',
    responseLabel: 'Response',
    versionTitle: 'Three ways to version the same API',
    versionSubtitle:
      'You cannot change a published contract under people’s feet. You can only offer a new one and keep the old one alive for a while.',
    versions: [
      {
        id: 'path',
        label: 'In the path',
        sample: 'GET /v2/tweets',
        pro: 'Impossible to miss, trivial to route, easy to cache and to document.',
        con: 'Duplicated routes and often duplicated code while both versions live.',
      },
      {
        id: 'header',
        label: 'In a header',
        sample: 'Accept: application/vnd.tweets.v2+json',
        pro: 'URLs stay stable, so a resource keeps one address forever.',
        con: 'Invisible in a browser and easy to forget — debugging gets harder.',
      },
      {
        id: 'query',
        label: 'In the query',
        sample: 'GET /tweets?version=2',
        pro: 'Quick to introduce without touching routing.',
        con: 'Mixes contract selection with filtering, and caches key on it by accident.',
      },
    ],
    proLabel: 'Good',
    conLabel: 'Costs',
    note: 'The cheapest version is the one you never publish: add fields instead of renaming them, and never repurpose an existing field’s meaning.',
  },
};

const ptBR: RestContent = {
  shared: {
    send: 'Enviar requisição',
    sending: 'Enviando…',
    reset: 'Reiniciar',
    client: 'Cliente',
    gateway: 'Gateway',
    service: 'Serviço de tweets',
    database: 'Banco',
    yes: 'sim',
    no: 'não',
  },
  playground: {
    title: 'Playground de requisições REST',
    subtitle:
      'Escolha uma chamada e depois escolha o que dá errado. Veja onde a requisição morre e qual status volta — o status é a API dizendo de quem foi a culpa.',
    callLabel: 'Chamada',
    conditionLabel: 'Condição',
    calls: [
      {
        id: 'list',
        label: 'Listar',
        note: 'Leitura de uma coleção. Devolve uma página de recursos mais um cursor para a próxima — nunca a tabela inteira.',
      },
      {
        id: 'read',
        label: 'Ler um',
        note: 'Leitura de um recurso por id. Seguro e cacheável: a mesma chamada pode ser repetida à vontade.',
      },
      {
        id: 'create',
        label: 'Criar',
        note: 'POST cria um recurso novo. A resposta é 201 com o cabeçalho Location apontando para o que acabou de nascer. Envie duas vezes e você tem dois tweets — POST não é idempotente.',
      },
      {
        id: 'update',
        label: 'Atualizar',
        note: 'PATCH envia só os campos que mudam. PUT substituiria o recurso inteiro — inclusive os campos que você deixou de fora.',
      },
      {
        id: 'delete',
        label: 'Excluir',
        note: 'DELETE remove o recurso. 204 significa "feito, nada a dizer". Excluir de novo continua dando um tweet excluído, então é idempotente.',
      },
    ],
    conditions: [
      {
        id: 'ok',
        label: 'Tudo certo',
        codeText: '',
        explain: 'Token válido, corpo válido, dentro da cota, recurso existe. A requisição chega ao banco e volta com dado.',
      },
      {
        id: 'noToken',
        label: 'Sem token',
        codeText: 'Unauthorized',
        explain: '401 — a API não sabe quem é você. Recusado na borda, antes de qualquer código de negócio rodar.',
      },
      {
        id: 'overQuota',
        label: 'Acima da cota',
        codeText: 'Too Many Requests',
        explain: '429 — você é conhecido e permitido, mas chamou demais. APIs boas mandam também Retry-After para o cliente saber quando voltar.',
      },
      {
        id: 'malformed',
        label: 'Corpo inválido',
        codeText: 'Bad Request',
        explain: '400 — a requisição é que está errada: campo faltando, tipo errado, texto grande demais. Corrigir é papel do cliente.',
      },
      {
        id: 'notOwner',
        label: 'Não é o dono',
        codeText: 'Forbidden',
        explain: '403 — a API sabe exatamente quem você é e mesmo assim diz não. 401 é "faça login"; 403 é "fazer login não vai ajudar".',
      },
      {
        id: 'missing',
        label: 'Recurso inexistente',
        codeText: 'Not Found',
        explain: '404 — o endpoint existe, o recurso não. O serviço precisou perguntar ao armazenamento para descobrir.',
      },
      {
        id: 'serverError',
        label: 'Falha no serviço',
        codeText: 'Server Error',
        explain: '500 — não havia nada de errado com a sua requisição; algo quebrou do outro lado. Nunca vaze stack trace aqui, só um id de rastreio.',
      },
    ],
    requestTitle: 'Requisição',
    responseTitle: 'Resposta',
    waiting: 'aguardando…',
    stoppedAt: 'Parou em',
    stops: {
      gateway: 'no gateway — antes de qualquer lógica de negócio',
      service: 'no serviço — as regras disseram não',
      db: 'na camada de dados — o registro decidiu a resposta',
    },
    logLabel: 'Chamadas recentes',
    logEmpty: 'Nenhuma chamada ainda. Envie uma.',
    note: 'Códigos de status fazem parte do contrato. Um cliente que só verifica "voltou JSON?" trata um 403 como dado — e faz a coisa errada em silêncio.',
  },
  resources: {
    title: 'Recursos, endpoints e o que cada método promete',
    subtitle:
      'REST modela o domínio como substantivos. O método é o verbo, e cada verbo carrega uma promessa em que os clientes confiam na hora de repetir a chamada.',
    resourceLabel: 'Recurso',
    resources: [
      {
        id: 'tweets',
        label: 'Tweets',
        noun: '/v1/tweets',
        rows: [
          { method: 'GET', path: '/v1/tweets', what: 'Uma página de tweets', safe: true, idempotent: true },
          { method: 'GET', path: '/v1/tweets/{id}', what: 'Um tweet', safe: true, idempotent: true },
          { method: 'POST', path: '/v1/tweets', what: 'Criar um tweet', safe: false, idempotent: false },
          { method: 'PUT', path: '/v1/tweets/{id}', what: 'Substituir o tweet inteiro', safe: false, idempotent: true },
          { method: 'PATCH', path: '/v1/tweets/{id}', what: 'Alterar alguns campos', safe: false, idempotent: false },
          { method: 'DELETE', path: '/v1/tweets/{id}', what: 'Remover o tweet', safe: false, idempotent: true },
        ],
      },
      {
        id: 'users',
        label: 'Usuários',
        noun: '/v1/users',
        rows: [
          { method: 'GET', path: '/v1/users/{id}', what: 'Um perfil', safe: true, idempotent: true },
          { method: 'GET', path: '/v1/users/{id}/tweets', what: 'Os tweets desse usuário', safe: true, idempotent: true },
          { method: 'POST', path: '/v1/users/{id}/follow', what: 'Seguir o usuário', safe: false, idempotent: false },
          { method: 'DELETE', path: '/v1/users/{id}/follow', what: 'Deixar de seguir', safe: false, idempotent: true },
          { method: 'PATCH', path: '/v1/users/me', what: 'Editar o próprio perfil', safe: false, idempotent: false },
        ],
      },
    ],
    safeLabel: 'Seguro',
    idempotentLabel: 'Idempotente',
    safeHelp: 'Seguro = não muda nada. Um crawler pode chamar mil vezes e o sistema continua intacto.',
    idempotentHelp:
      'Idempotente = chamar de novo leva ao mesmo estado final. É isso que torna sobrevivível uma retentativa depois de timeout.',
    putPatchTitle: 'PUT e PATCH não são a mesma coisa',
    putPatch: [
      'PUT substitui o recurso pelo que você mandou. Campos omitidos somem — isso é o contrato, não um bug.',
      'PATCH aplica uma alteração parcial. Só os campos presentes são tocados.',
      'PUT é idempotente (mande duas vezes, mesmo estado final). Um PATCH ingênuo do tipo "incrementar likes" não é.',
      'Para escritas seguras de repetir, use uma chave de idempotência: o servidor guarda a chave e devolve a primeira resposta em vez de refazer o trabalho.',
    ],
    note: 'REST é um estilo arquitetural, não um protocolo. Não existe compilador cobrando nada disso — consistência é disciplina de time, e é por isso que APIs grandes publicam guias de design.',
  },
  collections: {
    title: 'Coleções: paginação, filtro e versionamento',
    subtitle:
      'Monte a URL e veja o que volta. Todo endpoint de listagem responde a três perguntas: quantos, quais e qual versão do contrato.',
    limitLabel: 'Tamanho da página',
    filterLabel: 'Filtro',
    modeLabel: 'Paginação',
    modes: [
      {
        id: 'offset',
        label: 'page & limit',
        explain:
          'Fácil de entender e permite pular para qualquer página. Mas reconta linhas conforme você avança, e itens novos deslocam tudo — o leitor vê duplicatas ou buracos.',
      },
      {
        id: 'cursor',
        label: 'cursor',
        explain:
          'O servidor devolve um ponteiro opaco para "onde você parou". Estável mesmo com inserções e barato em qualquer profundidade — mas sem pular para a página 40.',
      },
    ],
    filters: [
      { id: 'none', label: 'Nenhum', query: '' },
      { id: 'author', label: 'Por autor', query: 'authorId=u_42' },
      { id: 'hashtag', label: 'Por hashtag', query: 'hashtag=systemdesign' },
    ],
    limits: [2, 5, 10],
    urlLabel: 'URL da requisição',
    responseLabel: 'Resposta',
    versionTitle: 'Três formas de versionar a mesma API',
    versionSubtitle:
      'Você não pode mudar um contrato publicado embaixo dos pés de quem usa. Só dá para oferecer um novo e manter o antigo vivo por um tempo.',
    versions: [
      {
        id: 'path',
        label: 'No caminho',
        sample: 'GET /v2/tweets',
        pro: 'Impossível não ver, trivial de rotear, fácil de cachear e documentar.',
        con: 'Rotas duplicadas e, muitas vezes, código duplicado enquanto as duas versões vivem.',
      },
      {
        id: 'header',
        label: 'Em um cabeçalho',
        sample: 'Accept: application/vnd.tweets.v2+json',
        pro: 'As URLs ficam estáveis: o recurso mantém um endereço para sempre.',
        con: 'Invisível no navegador e fácil de esquecer — depurar fica mais difícil.',
      },
      {
        id: 'query',
        label: 'Na query string',
        sample: 'GET /tweets?version=2',
        pro: 'Rápido de introduzir sem mexer no roteamento.',
        con: 'Mistura escolha de contrato com filtro, e caches passam a chavear nisso sem querer.',
      },
    ],
    proLabel: 'Ganha',
    conLabel: 'Custa',
    note: 'A versão mais barata é a que você nunca publica: adicione campos em vez de renomear, e nunca reaproveite o significado de um campo existente.',
  },
};

export const restContent: Record<Locale, RestContent> = { en, 'pt-BR': ptBR };
