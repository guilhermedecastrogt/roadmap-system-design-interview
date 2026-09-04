import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the "What is an API?" lesson — the hub of the API
 * communication track. Long-form prose stays in the Markdown file; the strings
 * that drive the request journey, the anatomy inspector and the audience
 * explorer live here, typed and bilingual.
 *
 * Wire text (methods, paths, JSON) is shared by both locales: code does not get
 * translated, only the explanations around it.
 */

export type StageId = 'send' | 'auth' | 'service' | 'db' | 'back';
export type ScenarioId = 'read' | 'action' | 'unauthorized';
export type PartId =
  | 'method'
  | 'endpoint'
  | 'headers'
  | 'body'
  | 'status'
  | 'resHeaders'
  | 'resBody';
export type AudienceId = 'public' | 'partner' | 'internal' | 'private';

export type WireScenario = {
  method: string;
  path: string;
  code: number;
  /** Stage the request dies at, or `null` when it completes. */
  failAt: StageId | null;
  request: string;
  response: string;
};

/** Method, path and payloads for each scenario — identical in every locale. */
export const wire: Record<ScenarioId, WireScenario> = {
  read: {
    method: 'GET',
    path: '/users/42',
    code: 200,
    failAt: null,
    request: `GET /users/42 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGci...
Accept: application/json`,
    response: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 42,
  "name": "Ada Lovelace",
  "handle": "@ada",
  "joinedAt": "2026-02-11"
}`,
  },
  action: {
    method: 'POST',
    path: '/users/42/follow',
    code: 201,
    failAt: null,
    request: `POST /users/42/follow HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{ "notify": true }`,
    response: `HTTP/1.1 201 Created
Content-Type: application/json

{
  "following": true,
  "since": "2026-09-03T12:04:11Z"
}`,
  },
  unauthorized: {
    method: 'GET',
    path: '/users/42',
    code: 401,
    failAt: 'auth',
    request: `GET /users/42 HTTP/1.1
Host: api.example.com
Accept: application/json`,
    response: `HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "missing_token",
  "message": "Authorization header required"
}`,
  },
};

export type ApiOverviewContent = {
  shared: {
    send: string;
    sending: string;
    reset: string;
    client: string;
    api: string;
    service: string;
    database: string;
  };
  journey: {
    title: string;
    subtitle: string;
    scenarioLabel: string;
    scenarios: { id: ScenarioId; label: string; codeText: string; note: string }[];
    stages: { id: StageId; label: string; detail: string }[];
    requestTitle: string;
    responseTitle: string;
    waiting: string;
    hint: string;
    note: string;
  };
  anatomy: {
    title: string;
    subtitle: string;
    tapHint: string;
    requestTitle: string;
    responseTitle: string;
    parts: { id: PartId; label: string; side: 'request' | 'response'; what: string }[];
    note: string;
  };
  audiences: {
    title: string;
    subtitle: string;
    tapHint: string;
    whoLabel: string;
    exampleLabel: string;
    accessLabel: string;
    watchLabel: string;
    items: {
      id: AudienceId;
      label: string;
      who: string;
      example: string;
      access: string;
      watch: string;
    }[];
    note: string;
  };
};

/** Request/response lines, tagged with the anatomy part each one belongs to. */
export const anatomyRequestLines: { part: PartId; text: string }[] = [
  { part: 'method', text: 'GET' },
  { part: 'endpoint', text: ' /users/42 HTTP/1.1' },
  { part: 'headers', text: '\nHost: api.example.com' },
  { part: 'headers', text: '\nAuthorization: Bearer eyJhbGci...' },
  { part: 'headers', text: '\nContent-Type: application/json' },
  { part: 'body', text: '\n\n{ "fields": ["name", "handle"] }' },
];

export const anatomyResponseLines: { part: PartId; text: string }[] = [
  { part: 'status', text: 'HTTP/1.1 200 OK' },
  { part: 'resHeaders', text: '\nContent-Type: application/json' },
  { part: 'resHeaders', text: '\nCache-Control: max-age=60' },
  { part: 'resBody', text: '\n\n{\n  "id": 42,\n  "name": "Ada Lovelace",\n  "handle": "@ada"\n}' },
];

const en: ApiOverviewContent = {
  shared: {
    send: 'Send request',
    sending: 'Sending…',
    reset: 'Reset',
    client: 'Client',
    api: 'API',
    service: 'Service',
    database: 'Database',
  },
  journey: {
    title: 'Watch one request make the round trip',
    subtitle:
      'An API call is not magic — it is a trip with stops. Send each scenario and follow the request from the app to the data and back.',
    scenarioLabel: 'Scenario',
    scenarios: [
      {
        id: 'read',
        label: 'Read data',
        codeText: 'OK',
        note: 'The classic read: the client asks for a user, the service fetches the row, the API answers with JSON. Nothing was changed — the same call can be repeated safely.',
      },
      {
        id: 'action',
        label: 'Trigger an action',
        codeText: 'Created',
        note: 'APIs expose actions too, not just data. Here the call creates a follow relationship: the database is written, and the answer describes the new state.',
      },
      {
        id: 'unauthorized',
        label: 'Missing credentials',
        codeText: 'Unauthorized',
        note: 'No token, no trip. The request is rejected at the door and never reaches the service — which is exactly why the contract includes authentication rules.',
      },
    ],
    stages: [
      {
        id: 'send',
        label: 'Client sends the request',
        detail: 'A web or mobile app builds a request that follows the rules the API published: address, method, headers, body.',
      },
      {
        id: 'auth',
        label: 'API checks the caller',
        detail: 'The API verifies who is calling and whether the request is well formed, before any business work starts.',
      },
      {
        id: 'service',
        label: 'Service applies the rules',
        detail: 'The service behind the API runs the actual logic: can this user do this, what should be read or changed.',
      },
      {
        id: 'db',
        label: 'Data is read or written',
        detail: 'The service touches storage — a query for a read, an insert or update for an action.',
      },
      {
        id: 'back',
        label: 'Response travels back',
        detail: 'The API answers with a status code and a body. The client never learns how any of it was implemented.',
      },
    ],
    requestTitle: 'Request',
    responseTitle: 'Response',
    waiting: 'waiting…',
    hint: 'The client only ever sees the two panels below. Everything between them is the provider’s business.',
    note: 'An API is a contract, not a machine: the same call could be served by one server or fifty, in any language, and the client would not notice.',
  },
  anatomy: {
    title: 'Anatomy of a request and a response',
    subtitle: 'Tap any part to see what it is for. These are the pieces every HTTP-style API call is made of.',
    tapHint: 'Tap a highlighted part — or a chip below',
    requestTitle: 'Request',
    responseTitle: 'Response',
    parts: [
      {
        id: 'method',
        label: 'Method',
        side: 'request',
        what: 'The verb — what you want done. Read, create, replace, remove. It tells the server the intent before it reads anything else.',
      },
      {
        id: 'endpoint',
        label: 'Endpoint',
        side: 'request',
        what: 'The address the request goes to. Together with the method it identifies the operation the contract offers.',
      },
      {
        id: 'headers',
        label: 'Headers',
        side: 'request',
        what: 'Metadata about the call: who you are (credentials), what format you send and accept, tracing ids, caching hints.',
      },
      {
        id: 'body',
        label: 'Request body',
        side: 'request',
        what: 'The payload you send along — usually JSON. Reads often have no body at all; writes almost always do.',
      },
      {
        id: 'status',
        label: 'Status code',
        side: 'response',
        what: 'The short answer: worked, your fault, or my fault. 2xx success, 4xx the request was wrong, 5xx the server broke.',
      },
      {
        id: 'resHeaders',
        label: 'Response headers',
        side: 'response',
        what: 'Metadata about the answer: content type, cache lifetime, rate-limit counters, pagination links.',
      },
      {
        id: 'resBody',
        label: 'Response body',
        side: 'response',
        what: 'The data itself, in the format the contract promised. Clients parse this — so changing its shape breaks people.',
      },
    ],
    note: 'HTTP and JSON are the common case, not the definition. An API can speak gRPC, MQTT, or a binary protocol over a socket, and it is still an API — the idea is the agreed contract, not the wire format.',
  },
  audiences: {
    title: 'Who is allowed to call it?',
    subtitle:
      'The same technology serves very different audiences, and the audience decides how much you must document, version and defend.',
    tapHint: 'Tap an audience',
    whoLabel: 'Who calls it',
    exampleLabel: 'Example',
    accessLabel: 'Access',
    watchLabel: 'Watch out for',
    items: [
      {
        id: 'public',
        label: 'Public',
        who: 'Anyone who signs up — developers you will never meet.',
        example: 'A payment provider’s API, a maps API, a weather API.',
        access: 'Self-service keys or OAuth, published docs, quotas per plan.',
        watch: 'You cannot change it freely. Every breaking change needs a version and a migration window.',
      },
      {
        id: 'partner',
        label: 'Partner',
        who: 'A named set of companies you have an agreement with.',
        example: 'A marketplace exposing stock and shipping to its logistics partners.',
        access: 'Credentials issued per partner, contract-level rate limits, often IP allow-lists.',
        watch: 'Small audience, high stakes: a break here reaches a business relationship, not a support ticket.',
      },
      {
        id: 'internal',
        label: 'Internal',
        who: 'Other teams in the same company.',
        example: 'The orders service calling the inventory service.',
        access: 'Service identities inside the network, not user tokens.',
        watch: 'Being internal is not being safe. Trusting anything on the network is how one compromised service becomes ten.',
      },
      {
        id: 'private',
        label: 'Private / first-party',
        who: 'Your own app — the web or mobile client you also ship.',
        example: 'The endpoints that power your product’s own screens.',
        access: 'User sessions or tokens issued by your auth service.',
        watch: 'You control both sides, so you can evolve fast — but old mobile versions keep calling it for months.',
      },
    ],
    note: 'An API gateway is not the API. The gateway is infrastructure in front of the contract — it can authenticate, rate-limit and route, but the API is the promise the client codes against.',
  },
};

const ptBR: ApiOverviewContent = {
  shared: {
    send: 'Enviar requisição',
    sending: 'Enviando…',
    reset: 'Reiniciar',
    client: 'Cliente',
    api: 'API',
    service: 'Serviço',
    database: 'Banco',
  },
  journey: {
    title: 'Veja uma requisição fazer a viagem de ida e volta',
    subtitle:
      'Uma chamada de API não é mágica — é uma viagem com paradas. Envie cada cenário e acompanhe o caminho do app até o dado e de volta.',
    scenarioLabel: 'Cenário',
    scenarios: [
      {
        id: 'read',
        label: 'Ler dados',
        codeText: 'OK',
        note: 'A leitura clássica: o cliente pede um usuário, o serviço busca o registro, a API responde em JSON. Nada foi alterado — a mesma chamada pode ser repetida sem risco.',
      },
      {
        id: 'action',
        label: 'Executar uma ação',
        codeText: 'Created',
        note: 'APIs também expõem ações, não só dados. Aqui a chamada cria um "seguir": o banco é escrito e a resposta descreve o novo estado.',
      },
      {
        id: 'unauthorized',
        label: 'Sem credencial',
        codeText: 'Unauthorized',
        note: 'Sem token, sem viagem. A requisição é recusada na porta e nunca chega ao serviço — por isso o contrato inclui as regras de autenticação.',
      },
    ],
    stages: [
      {
        id: 'send',
        label: 'O cliente envia a requisição',
        detail: 'Um app web ou mobile monta uma requisição seguindo as regras que a API publicou: endereço, método, cabeçalhos, corpo.',
      },
      {
        id: 'auth',
        label: 'A API confere quem chamou',
        detail: 'A API verifica quem está chamando e se a requisição está bem formada, antes de qualquer trabalho de negócio.',
      },
      {
        id: 'service',
        label: 'O serviço aplica as regras',
        detail: 'O serviço por trás da API executa a lógica de verdade: se esse usuário pode fazer isso, o que ler ou alterar.',
      },
      {
        id: 'db',
        label: 'O dado é lido ou gravado',
        detail: 'O serviço acessa o armazenamento — uma consulta na leitura, um insert ou update na ação.',
      },
      {
        id: 'back',
        label: 'A resposta volta',
        detail: 'A API responde com um status e um corpo. O cliente nunca fica sabendo como nada disso foi implementado.',
      },
    ],
    requestTitle: 'Requisição',
    responseTitle: 'Resposta',
    waiting: 'aguardando…',
    hint: 'O cliente só enxerga os dois painéis abaixo. Tudo entre eles é problema de quem fornece a API.',
    note: 'Uma API é um contrato, não uma máquina: a mesma chamada poderia ser atendida por um servidor ou por cinquenta, em qualquer linguagem, sem o cliente perceber.',
  },
  anatomy: {
    title: 'Anatomia de uma requisição e de uma resposta',
    subtitle: 'Toque em qualquer parte para ver para que ela serve. São as peças de toda chamada de API no estilo HTTP.',
    tapHint: 'Toque em uma parte destacada — ou em um chip abaixo',
    requestTitle: 'Requisição',
    responseTitle: 'Resposta',
    parts: [
      {
        id: 'method',
        label: 'Método',
        side: 'request',
        what: 'O verbo — o que você quer que seja feito. Ler, criar, substituir, remover. Diz a intenção antes de o servidor ler qualquer outra coisa.',
      },
      {
        id: 'endpoint',
        label: 'Endpoint',
        side: 'request',
        what: 'O endereço para onde a requisição vai. Junto com o método, identifica a operação que o contrato oferece.',
      },
      {
        id: 'headers',
        label: 'Cabeçalhos',
        side: 'request',
        what: 'Metadados da chamada: quem você é (credenciais), que formato envia e aceita, ids de rastreio, dicas de cache.',
      },
      {
        id: 'body',
        label: 'Corpo da requisição',
        side: 'request',
        what: 'O conteúdo que você envia junto — normalmente JSON. Leituras costumam não ter corpo; escritas quase sempre têm.',
      },
      {
        id: 'status',
        label: 'Código de status',
        side: 'response',
        what: 'A resposta curta: deu certo, culpa sua, ou culpa minha. 2xx sucesso, 4xx a requisição estava errada, 5xx o servidor quebrou.',
      },
      {
        id: 'resHeaders',
        label: 'Cabeçalhos da resposta',
        side: 'response',
        what: 'Metadados da resposta: tipo de conteúdo, tempo de cache, contadores de rate limit, links de paginação.',
      },
      {
        id: 'resBody',
        label: 'Corpo da resposta',
        side: 'response',
        what: 'O dado em si, no formato que o contrato prometeu. Os clientes fazem parse disso — mudar o formato quebra gente.',
      },
    ],
    note: 'HTTP e JSON são o caso comum, não a definição. Uma API pode falar gRPC, MQTT ou um protocolo binário sobre socket e continua sendo uma API — a ideia é o contrato combinado, não o formato do fio.',
  },
  audiences: {
    title: 'Quem tem permissão de chamar?',
    subtitle:
      'A mesma tecnologia atende públicos bem diferentes, e é o público que define quanto você precisa documentar, versionar e defender.',
    tapHint: 'Toque em um público',
    whoLabel: 'Quem chama',
    exampleLabel: 'Exemplo',
    accessLabel: 'Acesso',
    watchLabel: 'Fique de olho',
    items: [
      {
        id: 'public',
        label: 'Pública',
        who: 'Qualquer pessoa que se cadastre — devs que você nunca vai conhecer.',
        example: 'A API de um provedor de pagamento, de mapas, de clima.',
        access: 'Chaves self-service ou OAuth, documentação publicada, cotas por plano.',
        watch: 'Você não pode mudar à vontade. Toda quebra exige versão nova e janela de migração.',
      },
      {
        id: 'partner',
        label: 'De parceiros',
        who: 'Um conjunto nomeado de empresas com quem você tem acordo.',
        example: 'Um marketplace expondo estoque e frete para parceiros de logística.',
        access: 'Credenciais emitidas por parceiro, limites definidos em contrato, muitas vezes lista de IPs.',
        watch: 'Público pequeno, aposta alta: uma quebra aqui atinge uma relação comercial, não um ticket de suporte.',
      },
      {
        id: 'internal',
        label: 'Interna',
        who: 'Outros times da mesma empresa.',
        example: 'O serviço de pedidos chamando o serviço de estoque.',
        access: 'Identidade de serviço dentro da rede, não token de usuário.',
        watch: 'Ser interna não é ser segura. Confiar em tudo que está na rede é como um serviço comprometido vira dez.',
      },
      {
        id: 'private',
        label: 'Privada / do próprio produto',
        who: 'Seu próprio app — o cliente web ou mobile que você também publica.',
        example: 'Os endpoints que alimentam as telas do seu produto.',
        access: 'Sessões ou tokens de usuário emitidos pelo seu serviço de auth.',
        watch: 'Você controla os dois lados e evolui rápido — mas versões antigas do app continuam chamando por meses.',
      },
    ],
    note: 'API gateway não é a API. O gateway é a infraestrutura na frente do contrato — ele autentica, limita e roteia, mas a API é a promessa contra a qual o cliente programa.',
  },
};

export const apiOverviewContent: Record<Locale, ApiOverviewContent> = { en, 'pt-BR': ptBR };
