import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the GraphQL lesson. Schema text, field names and
 * sample values are shared across locales; only the explanations are
 * translated.
 */

export type FieldId =
  | 'id'
  | 'text'
  | 'likeCount'
  | 'createdAt'
  | 'name'
  | 'handle'
  | 'avatarUrl'
  | 'bio';
export type FetchModeId = 'overfetch' | 'underfetch' | 'graphql';
export type OperationId = 'query' | 'mutation' | 'subscription';
export type ResolverId = 'timeline' | 'author' | 'likeCount';

export type FieldDef = {
  id: FieldId;
  name: string;
  group: 'tweet' | 'author';
  /** JSON-encoded sample value, rendered verbatim in the response. */
  value: string;
};

export const FIELDS: FieldDef[] = [
  { id: 'id', name: 'id', group: 'tweet', value: '"t_901"' },
  { id: 'text', name: 'text', group: 'tweet', value: '"Shipped the outbox pattern."' },
  { id: 'likeCount', name: 'likeCount', group: 'tweet', value: '42' },
  { id: 'createdAt', name: 'createdAt', group: 'tweet', value: '"2026-09-01T09:12:00Z"' },
  { id: 'name', name: 'name', group: 'author', value: '"Ada Lovelace"' },
  { id: 'handle', name: 'handle', group: 'author', value: '"@ada"' },
  { id: 'avatarUrl', name: 'avatarUrl', group: 'author', value: '"https://cdn.example.com/u42.png"' },
  { id: 'bio', name: 'bio', group: 'author', value: '"Building reliable systems since 1843."' },
];

/** What each of the three fetching strategies costs for the same screen. */
export const fetchModes: Record<
  FetchModeId,
  { requests: number; bytes: number; sample: string }
> = {
  overfetch: {
    requests: 1,
    bytes: 1840,
    sample: `GET /v1/tweets?limit=10

{
  "data": [
    {
      "id": "t_901",
      "text": "Shipped the outbox pattern.",
      "likeCount": 42,
      "replyCount": 7,
      "retweetCount": 3,
      "viewCount": 1204,
      "language": "en",
      "source": "web",
      "createdAt": "2026-09-01T09:12:00Z",
      "editedAt": null,
      "authorId": "u_42"
    }
    // …9 more, every field, author still missing
  ]
}`,
  },
  underfetch: {
    requests: 3,
    bytes: 1120,
    sample: `GET /v1/tweets?limit=10        → 10 tweets with authorId
GET /v1/users/u_42             → one author
GET /v1/users/u_7              → another author
…one call per distinct author

// The screen cannot render until the last one returns.`,
  },
  graphql: {
    requests: 1,
    bytes: 420,
    sample: `POST /graphql

query Timeline {
  timeline(first: 10) {
    id
    text
    likeCount
    author { name avatarUrl }
  }
}`,
  },
};

export const SCHEMA_SDL = `type Query {
  timeline(first: Int = 10, after: String): [Tweet!]!
  tweet(id: ID!): Tweet
}

type Mutation {
  createTweet(text: String!): Tweet!
}

type Subscription {
  tweetLiked(tweetId: ID!): Tweet!
}

type Tweet {
  id: ID!
  text: String!
  likeCount: Int!
  createdAt: DateTime!
  author: User!
  replies(first: Int = 10): [Tweet!]!
}

type User {
  id: ID!
  name: String!
  handle: String!
  avatarUrl: String
  bio: String
  tweets(first: Int = 10): [Tweet!]!
}`;

export type GraphqlContent = {
  shared: {
    run: string;
    running: string;
    reset: string;
    requests: string;
    payload: string;
  };
  builder: {
    title: string;
    subtitle: string;
    tweetGroup: string;
    authorGroup: string;
    fieldNotes: Record<FieldId, string>;
    queryTitle: string;
    responseTitle: string;
    waiting: string;
    emptyQuery: string;
    selectedLabel: string;
    bytesLabel: string;
    hint: string;
    note: string;
  };
  fetching: {
    title: string;
    subtitle: string;
    modes: { id: FetchModeId; label: string; headline: string; explain: string }[];
    requestsLabel: string;
    bytesLabel: string;
    roundTripsLabel: string;
    note: string;
  };
  schema: {
    title: string;
    subtitle: string;
    sdlTitle: string;
    operationsTitle: string;
    operations: { id: OperationId; label: string; what: string; example: string }[];
    resolversTitle: string;
    resolvers: { id: ResolverId; label: string; what: string; watch: string }[];
    whatLabel: string;
    watchLabel: string;
    note: string;
  };
  guard: {
    title: string;
    subtitle: string;
    firstLabel: string;
    depthLabel: string;
    costLabel: string;
    limitLabel: string;
    accepted: string;
    rejected: string;
    acceptedNote: string;
    rejectedNote: string;
    depthNames: string[];
    tools: { id: string; label: string; what: string }[];
    note: string;
  };
};

const en: GraphqlContent = {
  shared: {
    run: 'Run query',
    running: 'Running…',
    reset: 'Reset',
    requests: 'requests',
    payload: 'payload',
  },
  builder: {
    title: 'Build the query the screen actually needs',
    subtitle:
      'A timeline card shows four things. Tick only those and watch the query — and the response — shrink to match.',
    tweetGroup: 'Tweet',
    authorGroup: 'Author (nested)',
    fieldNotes: {
      id: 'The key React needs for the list',
      text: 'The tweet body',
      likeCount: 'The number under the heart',
      createdAt: 'The "2h ago" label',
      name: 'Displayed above the tweet',
      handle: 'The @handle next to the name',
      avatarUrl: 'The little round picture',
      bio: 'Not shown on a timeline card',
    },
    queryTitle: 'Query the client sends',
    responseTitle: 'Response',
    waiting: 'Run the query to see the response.',
    emptyQuery: 'Select at least one field.',
    selectedLabel: 'Fields selected',
    bytesLabel: 'Response size',
    hint: 'Tick "bio" and watch bytes you will never render show up in the response — that is overfetching, made visible.',
    note: 'The client asked for the shape, so the server could not have sent less. That is the whole idea — and also why an unguarded server will happily answer a query that costs it a fortune.',
  },
  fetching: {
    title: 'Overfetching, underfetching, and asking precisely',
    subtitle:
      'The same timeline screen, fetched three ways. Compare round trips against bytes before deciding which problem you actually have.',
    modes: [
      {
        id: 'overfetch',
        label: 'REST · overfetching',
        headline: 'One call, far more data than the screen uses',
        explain:
          'The endpoint returns the full resource because it has to serve every client. A mobile card renders four fields and downloads eleven — and still lacks the author name.',
      },
      {
        id: 'underfetch',
        label: 'REST · underfetching',
        headline: 'The first call is not enough, so you call again',
        explain:
          'The list gives you authorId, not the author. Now the client fans out one request per author and waits for the slowest. On a mobile network this is where the screen feels sluggish.',
      },
      {
        id: 'graphql',
        label: 'GraphQL · selected fields',
        headline: 'One call, the exact shape, nested included',
        explain:
          'One round trip returns tweets with their authors and nothing else. The cost did not vanish — it moved to the server, which now resolves those nested fields for you.',
      },
    ],
    requestsLabel: 'Round trips',
    bytesLabel: 'Bytes over the wire',
    roundTripsLabel: 'Requests to render one screen',
    note: 'This is not "GraphQL is faster". A well-designed REST endpoint for this exact screen would match it. GraphQL wins when many different screens need many different shapes from the same graph.',
  },
  schema: {
    title: 'Schema, operations and resolvers',
    subtitle:
      'The schema is the contract: strongly typed and introspectable. Every field is backed by a function the server runs — which is where the performance story lives.',
    sdlTitle: 'Schema (SDL)',
    operationsTitle: 'Three kinds of operation',
    operations: [
      {
        id: 'query',
        label: 'Query',
        what: 'Read data. Safe by convention — the GraphQL equivalent of a GET.',
        example: 'query { timeline(first: 10) { id text } }',
      },
      {
        id: 'mutation',
        label: 'Mutation',
        what: 'Change data, then return the new state in the same round trip.',
        example: 'mutation { createTweet(text: "hi") { id likeCount } }',
      },
      {
        id: 'subscription',
        label: 'Subscription',
        what: 'A long-lived stream of updates, usually over WebSockets — for live counters and notifications.',
        example: 'subscription { tweetLiked(tweetId: "t_901") { likeCount } }',
      },
    ],
    resolversTitle: 'What runs behind three fields',
    resolvers: [
      {
        id: 'timeline',
        label: 'Query.timeline',
        what: 'Fetches a page of tweets — one database query for the whole list.',
        watch: 'Its `first` argument is the single biggest lever on cost. Give it a default and a maximum, or a client will ask for 10,000.',
      },
      {
        id: 'author',
        label: 'Tweet.author',
        what: 'Resolves the author of each tweet in the list.',
        watch: 'The classic N+1: ten tweets trigger ten author lookups. Batch them per request (a DataLoader-style loader) or the database pays for the client’s convenience.',
      },
      {
        id: 'likeCount',
        label: 'Tweet.likeCount',
        what: 'A counter that may live in a different store than the tweet itself.',
        watch: 'Authorization is per field, not per endpoint. A field that reads private data must check permissions in its own resolver — there is no URL to protect.',
      },
    ],
    whatLabel: 'What it does',
    watchLabel: 'Watch out',
    note: 'Because the schema is introspectable, clients and tools discover it automatically — a real ergonomic win, and a reason to disable introspection in production if your API is not public.',
  },
  guard: {
    title: 'Guarding the server from expensive queries',
    subtitle:
      'One endpoint that accepts arbitrary shapes needs a budget. Move the sliders and watch a legitimate-looking query blow past the limit.',
    firstLabel: 'Items per level (first:)',
    depthLabel: 'Nesting depth',
    costLabel: 'Estimated cost',
    limitLabel: 'Server limit',
    accepted: 'Accepted',
    rejected: 'Rejected before execution',
    acceptedNote:
      'Within budget. The server estimates cost from the query alone, before touching the database — rejecting early is what keeps one client from taking the API down.',
    rejectedNote:
      'This query nests deeply and asks for a large page at every level, so it multiplies out. Nothing malicious is needed: an innocent-looking query can ask for millions of records.',
    depthNames: ['timeline', 'author', 'tweets', 'replies', 'author'],
    tools: [
      { id: 'depth', label: 'Depth limit', what: 'Refuse queries nested beyond N levels. Cheap to add, catches the worst shapes.' },
      { id: 'cost', label: 'Cost analysis', what: 'Give fields weights, estimate before running, reject over budget.' },
      { id: 'persisted', label: 'Persisted queries', what: 'Only accept queries you shipped, referenced by hash. Arbitrary queries stop being possible.' },
      { id: 'timeout', label: 'Timeouts & pagination caps', what: 'Bound every list argument and stop any resolver that runs too long.' },
    ],
    note: 'REST endpoints have a fixed cost you can reason about; a GraphQL endpoint has the cost the client asks for. That freedom is the feature, and the budget is the price of it.',
  },
};

const ptBR: GraphqlContent = {
  shared: {
    run: 'Rodar query',
    running: 'Rodando…',
    reset: 'Reiniciar',
    requests: 'requisições',
    payload: 'payload',
  },
  builder: {
    title: 'Monte a query que a tela realmente precisa',
    subtitle:
      'Um card de timeline mostra quatro coisas. Marque só elas e veja a query — e a resposta — encolherem junto.',
    tweetGroup: 'Tweet',
    authorGroup: 'Autor (aninhado)',
    fieldNotes: {
      id: 'A chave que o React precisa na lista',
      text: 'O corpo do tweet',
      likeCount: 'O número embaixo do coração',
      createdAt: 'O rótulo "há 2h"',
      name: 'Mostrado acima do tweet',
      handle: 'O @ ao lado do nome',
      avatarUrl: 'A fotinha redonda',
      bio: 'Não aparece no card da timeline',
    },
    queryTitle: 'Query que o cliente envia',
    responseTitle: 'Resposta',
    waiting: 'Rode a query para ver a resposta.',
    emptyQuery: 'Selecione pelo menos um campo.',
    selectedLabel: 'Campos selecionados',
    bytesLabel: 'Tamanho da resposta',
    hint: 'Marque "bio" e veja aparecer na resposta um byte que você nunca vai renderizar — é overfetching, visível.',
    note: 'O cliente pediu o formato, então o servidor não teria como mandar menos. É essa a ideia — e também o motivo de um servidor sem proteção responder alegremente a uma query que lhe custa uma fortuna.',
  },
  fetching: {
    title: 'Overfetching, underfetching e pedir com precisão',
    subtitle:
      'A mesma tela de timeline, buscada de três formas. Compare idas e voltas contra bytes antes de decidir qual problema você tem de fato.',
    modes: [
      {
        id: 'overfetch',
        label: 'REST · overfetching',
        headline: 'Uma chamada, muito mais dado do que a tela usa',
        explain:
          'O endpoint devolve o recurso inteiro porque precisa atender a todos os clientes. Um card mobile renderiza quatro campos e baixa onze — e ainda fica sem o nome do autor.',
      },
      {
        id: 'underfetch',
        label: 'REST · underfetching',
        headline: 'A primeira chamada não basta, então você chama de novo',
        explain:
          'A lista entrega authorId, não o autor. Agora o cliente dispara uma requisição por autor e espera pela mais lenta. Em rede móvel, é aqui que a tela parece travada.',
      },
      {
        id: 'graphql',
        label: 'GraphQL · campos escolhidos',
        headline: 'Uma chamada, o formato exato, aninhado incluído',
        explain:
          'Uma ida e volta devolve os tweets com seus autores e nada além. O custo não sumiu — mudou de lugar: agora é o servidor que resolve esses campos aninhados para você.',
      },
    ],
    requestsLabel: 'Idas e voltas',
    bytesLabel: 'Bytes trafegados',
    roundTripsLabel: 'Requisições para renderizar uma tela',
    note: 'Isso não é "GraphQL é mais rápido". Um endpoint REST bem desenhado para exatamente essa tela empataria. GraphQL ganha quando muitas telas diferentes precisam de formatos diferentes do mesmo grafo.',
  },
  schema: {
    title: 'Schema, operações e resolvers',
    subtitle:
      'O schema é o contrato: tipado e passível de introspecção. Todo campo é sustentado por uma função que o servidor executa — e é aí que mora a história de performance.',
    sdlTitle: 'Schema (SDL)',
    operationsTitle: 'Três tipos de operação',
    operations: [
      {
        id: 'query',
        label: 'Query',
        what: 'Ler dados. Segura por convenção — o equivalente a um GET no GraphQL.',
        example: 'query { timeline(first: 10) { id text } }',
      },
      {
        id: 'mutation',
        label: 'Mutation',
        what: 'Alterar dados e devolver o novo estado na mesma ida e volta.',
        example: 'mutation { createTweet(text: "oi") { id likeCount } }',
      },
      {
        id: 'subscription',
        label: 'Subscription',
        what: 'Um fluxo contínuo de atualizações, normalmente sobre WebSockets — para contadores ao vivo e notificações.',
        example: 'subscription { tweetLiked(tweetId: "t_901") { likeCount } }',
      },
    ],
    resolversTitle: 'O que roda por trás de três campos',
    resolvers: [
      {
        id: 'timeline',
        label: 'Query.timeline',
        what: 'Busca uma página de tweets — uma consulta ao banco para a lista inteira.',
        watch: 'O argumento `first` é a maior alavanca de custo que existe. Dê a ele um padrão e um máximo, ou algum cliente vai pedir 10.000.',
      },
      {
        id: 'author',
        label: 'Tweet.author',
        what: 'Resolve o autor de cada tweet da lista.',
        watch: 'O clássico N+1: dez tweets disparam dez buscas de autor. Agrupe por requisição (um loader no estilo DataLoader) ou o banco paga pela conveniência do cliente.',
      },
      {
        id: 'likeCount',
        label: 'Tweet.likeCount',
        what: 'Um contador que pode viver em outro armazenamento, separado do tweet.',
        watch: 'Autorização é por campo, não por endpoint. Um campo que lê dado privado precisa checar permissão no próprio resolver — não existe URL para proteger.',
      },
    ],
    whatLabel: 'O que faz',
    watchLabel: 'Cuidado',
    note: 'Como o schema é introspectável, clientes e ferramentas o descobrem sozinhos — um ganho real de ergonomia, e um motivo para desligar introspecção em produção se a sua API não é pública.',
  },
  guard: {
    title: 'Protegendo o servidor de queries caras',
    subtitle:
      'Um endpoint que aceita formatos arbitrários precisa de orçamento. Mexa nos controles e veja uma query de aparência inocente estourar o limite.',
    firstLabel: 'Itens por nível (first:)',
    depthLabel: 'Profundidade do aninhamento',
    costLabel: 'Custo estimado',
    limitLabel: 'Limite do servidor',
    accepted: 'Aceita',
    rejected: 'Recusada antes de executar',
    acceptedNote:
      'Dentro do orçamento. O servidor estima o custo só pela query, antes de tocar no banco — recusar cedo é o que impede um cliente de derrubar a API.',
    rejectedNote:
      'Essa query aninha fundo e pede uma página grande em cada nível, então multiplica. Não precisa de má intenção: uma query de aparência inocente pode pedir milhões de registros.',
    depthNames: ['timeline', 'author', 'tweets', 'replies', 'author'],
    tools: [
      { id: 'depth', label: 'Limite de profundidade', what: 'Recuse queries aninhadas além de N níveis. Barato de adicionar e pega os piores formatos.' },
      { id: 'cost', label: 'Análise de custo', what: 'Dê pesos aos campos, estime antes de rodar e recuse acima do orçamento.' },
      { id: 'persisted', label: 'Queries persistidas', what: 'Aceite apenas as queries que você publicou, referenciadas por hash. Query arbitrária deixa de ser possível.' },
      { id: 'timeout', label: 'Timeouts e teto de paginação', what: 'Limite todo argumento de lista e interrompa qualquer resolver que demore demais.' },
    ],
    note: 'Endpoints REST têm um custo fixo sobre o qual você consegue raciocinar; um endpoint GraphQL tem o custo que o cliente pedir. Essa liberdade é a funcionalidade, e o orçamento é o preço dela.',
  },
};

export const graphqlContent: Record<Locale, GraphqlContent> = { en, 'pt-BR': ptBR };
