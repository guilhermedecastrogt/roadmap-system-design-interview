import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the gRPC lesson — lesson 5 of the API communication
 * track. Proto files, generated call sites and status codes are shared across
 * locales; only the explanations are translated.
 */

export type CallOutcomeId = 'ok' | 'notFound' | 'denied' | 'deadline' | 'unavailable';
export type StreamModeId = 'unary' | 'serverStream' | 'clientStream' | 'bidi';
export type WireFieldId = 'id' | 'name' | 'email' | 'active';
export type EvolutionId = 'add' | 'rename' | 'renumber' | 'remove';

export const PROTO = `syntax = "proto3";
package users.v1;

service Users {
  rpc GetUser        (GetUserRequest)  returns (User);
  rpc WatchUser      (GetUserRequest)  returns (stream User);
  rpc ImportUsers    (stream User)     returns (ImportSummary);
  rpc SyncUsers      (stream User)     returns (stream User);
}

message GetUserRequest {
  int32 id = 1;
}

message User {
  int32  id     = 1;
  string name   = 2;
  string email  = 3;
  bool   active = 4;
}`;

export const CLIENT_CALL = `// Generated stub — no URL, no JSON parsing.
const user = await client.getUser(
  { id: 42 },
  { deadline: Date.now() + 300 },
);

console.log(user.name); // typed, autocompleted`;

export const SERVER_IMPL = `// Generated interface — the compiler
// enforces the same contract here.
async getUser(req: GetUserRequest): Promise<User> {
  const user = await repo.byId(req.id);
  if (!user) throw new RpcError(Status.NOT_FOUND);
  return user;
}`;

/** gRPC status codes used by the call lab. */
export const statusWire: Record<CallOutcomeId, { code: number; name: string }> = {
  ok: { code: 0, name: 'OK' },
  notFound: { code: 5, name: 'NOT_FOUND' },
  denied: { code: 7, name: 'PERMISSION_DENIED' },
  deadline: { code: 4, name: 'DEADLINE_EXCEEDED' },
  unavailable: { code: 14, name: 'UNAVAILABLE' },
};

/** Field tags and sample values used by the encoding lab. */
export const WIRE_FIELDS: {
  id: WireFieldId;
  tag: number;
  type: string;
  json: string;
  value: string;
  /** Bytes protobuf spends on this field: tag byte + payload. */
  protoBytes: number;
}[] = [
  { id: 'id', tag: 1, type: 'int32', json: 'id', value: '42', protoBytes: 2 },
  { id: 'name', tag: 2, type: 'string', json: 'name', value: '"Ada Lovelace"', protoBytes: 14 },
  { id: 'email', tag: 3, type: 'string', json: 'email', value: '"ada@example.com"', protoBytes: 17 },
  { id: 'active', tag: 4, type: 'bool', json: 'active', value: 'true', protoBytes: 2 },
];

/** How many messages travel each way in each streaming mode. */
export const STREAM_SHAPE: Record<StreamModeId, { up: number; down: number }> = {
  unary: { up: 1, down: 1 },
  serverStream: { up: 1, down: 4 },
  clientStream: { up: 4, down: 1 },
  bidi: { up: 3, down: 3 },
};

export type GrpcContent = {
  shared: {
    call: string;
    calling: string;
    reset: string;
    caller: string;
    callee: string;
    channel: string;
  };
  lab: {
    title: string;
    subtitle: string;
    outcomeLabel: string;
    outcomes: { id: CallOutcomeId; label: string; explain: string }[];
    protoTitle: string;
    clientTitle: string;
    serverTitle: string;
    generatedLabel: string;
    deadlineLabel: string;
    deadlineNote: string;
    statusLabel: string;
    stages: { id: string; label: string }[];
    note: string;
  };
  streaming: {
    title: string;
    subtitle: string;
    modes: {
      id: StreamModeId;
      label: string;
      signature: string;
      what: string;
      example: string;
    }[];
    playLabel: string;
    upLabel: string;
    downLabel: string;
    note: string;
  };
  wire: {
    title: string;
    subtitle: string;
    fieldsLabel: string;
    jsonLabel: string;
    protoLabel: string;
    bytesLabel: string;
    savingLabel: string;
    tagHint: string;
    evolutionTitle: string;
    evolution: { id: EvolutionId; label: string; verdict: 'safe' | 'danger'; what: string }[];
    safeLabel: string;
    dangerLabel: string;
    note: string;
  };
  fit: {
    title: string;
    subtitle: string;
    edgeTitle: string;
    edgeText: string;
    insideTitle: string;
    insideText: string;
    browserTitle: string;
    browserText: string;
    goodTitle: string;
    good: string[];
    costTitle: string;
    costs: string[];
    note: string;
  };
};

const en: GrpcContent = {
  shared: {
    call: 'Call GetUser',
    calling: 'Calling…',
    reset: 'Reset',
    caller: 'Orders service',
    callee: 'Users service',
    channel: 'HTTP/2 channel',
  },
  lab: {
    title: 'One contract, two generated sides',
    subtitle:
      'The `.proto` file is compiled into a client stub and a server interface. Calling a remote service becomes calling a method — with a deadline attached, because it is still the network.',
    outcomeLabel: 'What happens',
    outcomes: [
      {
        id: 'ok',
        label: 'Found',
        explain:
          'The stub serialized the request to binary, sent it over an existing HTTP/2 connection, and got a typed User back. No URL was built and no JSON was parsed on either side.',
      },
      {
        id: 'notFound',
        label: 'No such user',
        explain:
          'gRPC has its own status codes, not HTTP ones. NOT_FOUND (5) is the equivalent of a 404 — the call reached the service and the service answered.',
      },
      {
        id: 'denied',
        label: 'Not allowed',
        explain:
          'PERMISSION_DENIED (7) is the 403 of gRPC: the caller is known and still refused. UNAUTHENTICATED (16) is the 401 — do not mix them up.',
      },
      {
        id: 'deadline',
        label: 'Deadline exceeded',
        explain:
          'The client gave up before the answer arrived. Note what did *not* happen: the server may still be working. Deadlines are propagated down the call chain so the whole tree can stop, but a call that timed out is not a call that was undone.',
      },
      {
        id: 'unavailable',
        label: 'Service unavailable',
        explain:
          'UNAVAILABLE (14) means the connection failed or the service is down — one of the few codes that is safe to retry, ideally with backoff and only for idempotent calls.',
      },
    ],
    protoTitle: 'users.proto — the contract',
    clientTitle: 'Caller (generated stub)',
    serverTitle: 'Callee (generated interface)',
    generatedLabel: 'generated from the same file',
    deadlineLabel: 'Deadline',
    deadlineNote:
      'Every gRPC call should carry a deadline. Without one, a slow dependency quietly turns into an exhausted thread pool upstream.',
    statusLabel: 'Status',
    stages: [
      { id: 'serialize', label: 'Serialize to protobuf' },
      { id: 'send', label: 'Send over HTTP/2' },
      { id: 'handle', label: 'Server handler runs' },
      { id: 'return', label: 'Typed response back' },
    ],
    note: 'The win is not just speed. Both sides were generated from one file, so a field you renamed cannot silently disappear — it fails at build time instead of in production.',
  },
  streaming: {
    title: 'Four kinds of call on one connection',
    subtitle:
      'HTTP/2 multiplexes many streams over a single connection, so gRPC can offer more than request/response. Play each mode and watch the message flow.',
    modes: [
      {
        id: 'unary',
        label: 'Unary',
        signature: 'rpc GetUser (Req) returns (User)',
        what: 'One request, one response — the familiar shape, just typed and binary.',
        example: 'Read a user, charge a card, validate a token.',
      },
      {
        id: 'serverStream',
        label: 'Server streaming',
        signature: 'rpc WatchUser (Req) returns (stream User)',
        what: 'One request, many responses over time, on the same stream.',
        example: 'Live updates, tailing logs, sending a large result page by page.',
      },
      {
        id: 'clientStream',
        label: 'Client streaming',
        signature: 'rpc ImportUsers (stream User) returns (Summary)',
        what: 'Many requests, one answer at the end.',
        example: 'Uploading a batch, streaming metrics, bulk import.',
      },
      {
        id: 'bidi',
        label: 'Bidirectional',
        signature: 'rpc SyncUsers (stream User) returns (stream User)',
        what: 'Both sides send independently on the same connection, in any order.',
        example: 'Chat, real-time sync, long-lived coordination between services.',
      },
    ],
    playLabel: 'Play',
    upLabel: 'caller → callee',
    downLabel: 'callee → caller',
    note: 'This is the capability REST does not have out of the box. It is also why gRPC needs HTTP/2 — and why it does not run natively in a browser.',
  },
  wire: {
    title: 'Why the payload is so small',
    subtitle:
      'Protobuf sends field *numbers*, not field names, and encodes values in binary. Toggle fields and compare what goes on the wire.',
    fieldsLabel: 'Fields in the message',
    jsonLabel: 'JSON on the wire',
    protoLabel: 'Protobuf on the wire',
    bytesLabel: 'bytes',
    savingLabel: 'smaller',
    tagHint: 'The number after `=` in the .proto is the field identity on the wire.',
    evolutionTitle: 'Evolving the contract without breaking anybody',
    evolution: [
      {
        id: 'add',
        label: 'Add a new field',
        verdict: 'safe',
        what: 'Give it an unused number. Old readers ignore what they do not know, new readers get a default.',
      },
      {
        id: 'rename',
        label: 'Rename a field',
        verdict: 'safe',
        what: 'Names never travel on the wire — only numbers do. It is a source-code change, so it breaks compilation, not deployed peers.',
      },
      {
        id: 'renumber',
        label: 'Change a field number',
        verdict: 'danger',
        what: 'The number *is* the identity. Old peers will read the new field as the old one, silently, with garbage results.',
      },
      {
        id: 'remove',
        label: 'Delete and reuse a number',
        verdict: 'danger',
        what: 'Mark it `reserved`. Reusing a retired number makes an old peer interpret new data as the deleted field.',
      },
    ],
    safeLabel: 'safe',
    dangerLabel: 'breaks peers',
    note: 'The efficiency and the danger have the same root: the wire carries numbers, not names. That is why nobody debugs protobuf with curl — you need the .proto to read it.',
  },
  fit: {
    title: 'Where gRPC fits — and where it does not',
    subtitle: 'The usual answer is not "gRPC or REST". It is REST at the edge, gRPC behind it.',
    edgeTitle: 'At the edge — public traffic',
    edgeText:
      'Browsers, mobile apps and third parties speak HTTP/JSON. REST or GraphQL live here because everything understands them and anybody can debug them.',
    insideTitle: 'Inside — service to service',
    insideText:
      'Internal calls are frequent, latency-sensitive and made by machines you control. Typed contracts, binary payloads and streaming pay off, and nobody needs to read the traffic by hand.',
    browserTitle: 'The browser problem',
    browserText:
      'A browser cannot open a raw gRPC connection — it has no control over HTTP/2 frames. You need gRPC-Web plus a proxy, or an [API gateway](/en/topics/api-gateway) translating HTTP/JSON at the edge into gRPC inside.',
    goodTitle: 'What gRPC buys',
    good: [
      'A contract the compiler enforces on both sides, in any supported language',
      'Small binary payloads and one reused HTTP/2 connection instead of many',
      'Streaming in four shapes, including bidirectional',
      'Deadlines, cancellation and status codes as first-class parts of every call',
      'Generated clients — no hand-written HTTP plumbing to keep in sync',
    ],
    costTitle: 'What it costs',
    costs: [
      'Not browser-native: gRPC-Web and a proxy, or translation at the gateway',
      'Binary is unreadable without the .proto — curl and browser devtools stop helping',
      'A code-generation step in every build and every language you support',
      'Load balancing needs care: long-lived HTTP/2 connections do not spread across replicas by themselves',
      'Field numbers are forever — schema discipline is not optional',
    ],
    note: 'Choose it for the traffic between your own services. For a public API that strangers must integrate with in an afternoon, REST is still the kinder answer.',
  },
};

const ptBR: GrpcContent = {
  shared: {
    call: 'Chamar GetUser',
    calling: 'Chamando…',
    reset: 'Reiniciar',
    caller: 'Serviço de pedidos',
    callee: 'Serviço de usuários',
    channel: 'Canal HTTP/2',
  },
  lab: {
    title: 'Um contrato, dois lados gerados',
    subtitle:
      'O arquivo `.proto` é compilado em um stub de cliente e em uma interface de servidor. Chamar um serviço remoto vira chamar um método — com um deadline junto, porque continua sendo a rede.',
    outcomeLabel: 'O que acontece',
    outcomes: [
      {
        id: 'ok',
        label: 'Encontrado',
        explain:
          'O stub serializou a requisição em binário, enviou por uma conexão HTTP/2 já aberta e recebeu um User tipado de volta. Nenhuma URL foi montada e nenhum JSON foi parseado dos dois lados.',
      },
      {
        id: 'notFound',
        label: 'Usuário não existe',
        explain:
          'gRPC tem os próprios códigos de status, não os do HTTP. NOT_FOUND (5) é o equivalente ao 404 — a chamada chegou ao serviço e o serviço respondeu.',
      },
      {
        id: 'denied',
        label: 'Sem permissão',
        explain:
          'PERMISSION_DENIED (7) é o 403 do gRPC: o chamador é conhecido e mesmo assim recusado. UNAUTHENTICATED (16) é o 401 — não confunda os dois.',
      },
      {
        id: 'deadline',
        label: 'Deadline estourado',
        explain:
          'O cliente desistiu antes de a resposta chegar. Repare no que *não* aconteceu: o servidor pode continuar trabalhando. Deadlines são propagados pela cadeia de chamadas para a árvore inteira parar, mas uma chamada que estourou não é uma chamada desfeita.',
      },
      {
        id: 'unavailable',
        label: 'Serviço indisponível',
        explain:
          'UNAVAILABLE (14) significa que a conexão falhou ou o serviço está fora — um dos poucos códigos seguros de repetir, de preferência com backoff e só para chamadas idempotentes.',
      },
    ],
    protoTitle: 'users.proto — o contrato',
    clientTitle: 'Quem chama (stub gerado)',
    serverTitle: 'Quem atende (interface gerada)',
    generatedLabel: 'gerados do mesmo arquivo',
    deadlineLabel: 'Deadline',
    deadlineNote:
      'Toda chamada gRPC deveria levar um deadline. Sem ele, uma dependência lenta vira, em silêncio, um pool de threads esgotado lá em cima.',
    statusLabel: 'Status',
    stages: [
      { id: 'serialize', label: 'Serializar em protobuf' },
      { id: 'send', label: 'Enviar por HTTP/2' },
      { id: 'handle', label: 'Handler do servidor roda' },
      { id: 'return', label: 'Resposta tipada de volta' },
    ],
    note: 'O ganho não é só velocidade. Os dois lados foram gerados de um arquivo só, então um campo que você renomeou não some em silêncio — quebra no build, não em produção.',
  },
  streaming: {
    title: 'Quatro tipos de chamada em uma conexão',
    subtitle:
      'HTTP/2 multiplexa vários streams em uma única conexão, então gRPC pode oferecer mais que requisição/resposta. Rode cada modo e veja o fluxo de mensagens.',
    modes: [
      {
        id: 'unary',
        label: 'Unária',
        signature: 'rpc GetUser (Req) returns (User)',
        what: 'Uma requisição, uma resposta — o formato de sempre, só que tipado e binário.',
        example: 'Ler um usuário, cobrar um cartão, validar um token.',
      },
      {
        id: 'serverStream',
        label: 'Streaming do servidor',
        signature: 'rpc WatchUser (Req) returns (stream User)',
        what: 'Uma requisição, muitas respostas ao longo do tempo, no mesmo stream.',
        example: 'Atualizações ao vivo, acompanhar logs, mandar um resultado grande em partes.',
      },
      {
        id: 'clientStream',
        label: 'Streaming do cliente',
        signature: 'rpc ImportUsers (stream User) returns (Summary)',
        what: 'Muitas requisições, uma resposta no final.',
        example: 'Envio de lote, streaming de métricas, importação em massa.',
      },
      {
        id: 'bidi',
        label: 'Bidirecional',
        signature: 'rpc SyncUsers (stream User) returns (stream User)',
        what: 'Os dois lados enviam de forma independente na mesma conexão, em qualquer ordem.',
        example: 'Chat, sincronização em tempo real, coordenação longa entre serviços.',
      },
    ],
    playLabel: 'Rodar',
    upLabel: 'quem chama → quem atende',
    downLabel: 'quem atende → quem chama',
    note: 'Essa é a capacidade que REST não tem de fábrica. É também o motivo de gRPC exigir HTTP/2 — e de não rodar nativamente no navegador.',
  },
  wire: {
    title: 'Por que o payload é tão pequeno',
    subtitle:
      'Protobuf envia *números* de campo, não nomes, e codifica os valores em binário. Ligue e desligue campos e compare o que vai pelo fio.',
    fieldsLabel: 'Campos da mensagem',
    jsonLabel: 'JSON no fio',
    protoLabel: 'Protobuf no fio',
    bytesLabel: 'bytes',
    savingLabel: 'menor',
    tagHint: 'O número depois do `=` no .proto é a identidade do campo no fio.',
    evolutionTitle: 'Evoluir o contrato sem quebrar ninguém',
    evolution: [
      {
        id: 'add',
        label: 'Adicionar um campo novo',
        verdict: 'safe',
        what: 'Use um número não utilizado. Leitores antigos ignoram o que não conhecem, leitores novos recebem o valor padrão.',
      },
      {
        id: 'rename',
        label: 'Renomear um campo',
        verdict: 'safe',
        what: 'Nomes nunca trafegam no fio — só números. É mudança de código-fonte: quebra a compilação, não os pares já implantados.',
      },
      {
        id: 'renumber',
        label: 'Mudar o número de um campo',
        verdict: 'danger',
        what: 'O número *é* a identidade. Pares antigos vão ler o campo novo como se fosse o antigo, em silêncio, com resultado lixo.',
      },
      {
        id: 'remove',
        label: 'Apagar e reaproveitar um número',
        verdict: 'danger',
        what: 'Marque como `reserved`. Reaproveitar um número aposentado faz um par antigo interpretar dado novo como o campo apagado.',
      },
    ],
    safeLabel: 'seguro',
    dangerLabel: 'quebra os pares',
    note: 'A eficiência e o perigo têm a mesma raiz: o fio carrega números, não nomes. Por isso ninguém depura protobuf com curl — você precisa do .proto para ler.',
  },
  fit: {
    title: 'Onde gRPC encaixa — e onde não',
    subtitle: 'A resposta comum não é "gRPC ou REST". É REST na borda, gRPC atrás dela.',
    edgeTitle: 'Na borda — tráfego público',
    edgeText:
      'Navegadores, apps mobile e terceiros falam HTTP/JSON. REST ou GraphQL vivem aqui porque todo mundo entende e qualquer um consegue depurar.',
    insideTitle: 'Por dentro — serviço a serviço',
    insideText:
      'Chamadas internas são frequentes, sensíveis a latência e feitas por máquinas que você controla. Contratos tipados, payload binário e streaming se pagam, e ninguém precisa ler o tráfego na mão.',
    browserTitle: 'O problema do navegador',
    browserText:
      'Um navegador não consegue abrir uma conexão gRPC crua — ele não controla os frames HTTP/2. É preciso gRPC-Web mais um proxy, ou um [API gateway](/pt-BR/topics/api-gateway) traduzindo HTTP/JSON na borda para gRPC por dentro.',
    goodTitle: 'O que gRPC entrega',
    good: [
      'Um contrato que o compilador cobra dos dois lados, em qualquer linguagem suportada',
      'Payloads binários pequenos e uma conexão HTTP/2 reutilizada em vez de várias',
      'Streaming em quatro formatos, incluindo bidirecional',
      'Deadlines, cancelamento e códigos de status como parte nativa de toda chamada',
      'Clientes gerados — sem encanamento HTTP escrito à mão para manter sincronizado',
    ],
    costTitle: 'O que custa',
    costs: [
      'Não roda nativo no navegador: gRPC-Web e um proxy, ou tradução no gateway',
      'Binário é ilegível sem o .proto — curl e devtools deixam de ajudar',
      'Um passo de geração de código em todo build e em cada linguagem suportada',
      'Balanceamento exige cuidado: conexões HTTP/2 longas não se espalham sozinhas entre réplicas',
      'Números de campo são para sempre — disciplina de schema não é opcional',
    ],
    note: 'Escolha para o tráfego entre os seus próprios serviços. Para uma API pública que estranhos precisam integrar numa tarde, REST continua sendo a resposta mais gentil.',
  },
};

export const grpcContent: Record<Locale, GrpcContent> = { en, 'pt-BR': ptBR };
