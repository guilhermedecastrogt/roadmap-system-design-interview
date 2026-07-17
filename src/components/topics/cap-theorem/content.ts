import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the CAP Theorem lesson. Same convention as the
 * other topics: long-form prose lives in the Markdown file; the strings that
 * drive the trade-off triangle, the partition lab, and the use-case game live
 * here — typed & bilingual.
 */

export type CapLetter = 'c' | 'a' | 'p';
export type CapPair = 'ap' | 'cp' | 'ca';

export type CapLetterMeta = {
  name: string;
  tagline: string;
  definition: string;
  example: string;
};

export type CapPairMeta = {
  label: string;
  name: string;
  tagline: string;
  gives: string[];
  costs: string[];
  systems: string;
};

export type UseCase = {
  id: string;
  label: string;
  detail: string;
  answer: 'ap' | 'cp';
  why: string;
};

export type CapContent = {
  triangle: {
    title: string;
    subtitle: string;
    tapHint: string;
    pickTwo: string;
    letters: Record<CapLetter, CapLetterMeta>;
    pairsTitle: string;
    pairs: Record<CapPair, CapPairMeta>;
    givesLabel: string;
    costsLabel: string;
    systemsLabel: string;
    caWarning: string;
    note: string;
  };

  lab: {
    title: string;
    subtitle: string;
    steps: string[];
    modeLabel: string;
    modes: Record<CapPair, { label: string; note: string }>;
    createPartition: string;
    healPartition: string;
    reset: string;
    replicaA: string;
    replicaB: string;
    balanceLabel: string;
    writeBtn: string;
    readBtn: string;
    linkHealthy: string;
    linkBroken: string;
    staleBadge: string;
    freshBadge: string;
    divergedNote: string;
    convergedNote: string;
    caWarningTitle: string;
    caWarningBody: string;
    responses: {
      writeReplicated: string;
      writeLocalOnly: string;
      writeRejected: string;
      readFresh: string;
      readStale: string;
      readRejected: string;
      healing: string;
    };
  };

  useCases: {
    title: string;
    subtitle: string;
    question: string;
    apBtn: string;
    cpBtn: string;
    revealPrefix: string;
    correct: string;
    incorrect: string;
    cases: UseCase[];
    note: string;
  };
};

const en: CapContent = {
  triangle: {
    title: 'The trade-off triangle',
    subtitle:
      'Tap each corner to learn what C, A, and P really mean — then tap an edge to see what happens when a system leans on two of them.',
    tapHint: 'Tap a corner or an edge',
    pickTwo:
      'During a network partition, a distributed system cannot fully guarantee both consistency and availability — it must lean one way.',
    letters: {
      c: {
        name: 'Consistency',
        tagline: 'Everyone sees the latest write',
        definition:
          'Every client sees the most recent successful write, no matter which replica answers the request. Not "the data is correct" in general — specifically: no stale reads.',
        example:
          'You withdraw $100 and your balance drops to $900. If any replica still answers $1000 afterwards, the system was not consistent.',
      },
      a: {
        name: 'Availability',
        tagline: 'Every request gets a response',
        definition:
          'Every request receives a non-error response — even if it may not contain the most recent write. Availability is about answering, not about being up-to-date.',
        example:
          'During an outage between replicas, an available system still answers your read — possibly with slightly old data instead of an error.',
      },
      p: {
        name: 'Partition tolerance',
        tagline: 'Survives a network split',
        definition:
          'The system keeps operating even when nodes cannot talk to each other because the network between them failed. The nodes are alive — the messages between them are lost.',
        example:
          'A cable cut splits your cluster into two islands. Both islands still run — they just cannot coordinate until the network heals.',
      },
    },
    pairsTitle: 'The three stances',
    pairs: {
      ap: {
        label: 'AP',
        name: 'Availability + Partition tolerance',
        tagline: 'Keep answering, accept temporary staleness',
        gives: [
          'Every request gets a response, even mid-partition',
          'Low latency — replicas answer locally',
          'Great fit for data that tolerates brief disagreement',
        ],
        costs: [
          'Reads may return stale data during a partition',
          'Replicas diverge and must reconcile later',
        ],
        systems: 'DynamoDB (default reads), Cassandra, DNS, most caches and social feeds',
      },
      cp: {
        label: 'CP',
        name: 'Consistency + Partition tolerance',
        tagline: 'Never serve stale data, accept rejecting requests',
        gives: [
          'No stale reads — clients get fresh data or an error',
          'Safe for balances, inventory, and anything money-shaped',
          'Replicas never silently disagree',
        ],
        costs: [
          'Some requests fail or wait during a partition',
          'Coordination adds latency even on good days',
        ],
        systems: 'ZooKeeper, etcd, Google Spanner, most relational setups with synchronous replication',
      },
      ca: {
        label: 'CA',
        name: 'Consistency + Availability',
        tagline: 'Both guarantees — but only while the network never splits',
        gives: [
          'Fresh data and answers for everyone…',
          '…as long as all nodes can always talk to each other',
        ],
        costs: [
          'No plan for a partition — and real networks do partition',
          'When a split happens anyway, the system must give up C or A on the spot',
        ],
        systems: 'A single-node database, or systems where partition tolerance is out of scope',
      },
    },
    givesLabel: 'What you get',
    costsLabel: 'What it costs',
    systemsLabel: 'Where you see it',
    caWarning:
      'CA is mostly a conceptual corner: it only holds while no partition exists. Distributed systems must expect partitions, so the real-world choice is usually AP vs CP.',
    note: 'CAP is not "pick 2 of 3 forever". It says: when a partition happens, you cannot have perfect consistency and perfect availability at the same time. The rest of the time, you tune the trade-off with latency and replication settings.',
  },

  lab: {
    title: 'Partition lab — one balance, two replicas',
    subtitle:
      'Your account balance lives on replicas A and B. Cut the network between them, write to A, read from B — and watch how AP, CP, and CA answer differently.',
    steps: [
      'Pick a stance (AP / CP / CA)',
      'Create a partition',
      'Write to A (withdraw $100)',
      'Read from B and watch the response',
    ],
    modeLabel: 'Stance',
    modes: {
      ap: {
        label: 'AP',
        note: 'AP: both replicas keep answering during the partition. The write commits on A only, so B serves a stale $1000 until the network heals and replication catches up.',
      },
      cp: {
        label: 'CP',
        note: 'CP: rather than risk stale or diverging data, the system rejects writes and reads it cannot safely coordinate during the partition. Clients see errors — never a wrong balance.',
      },
      ca: {
        label: 'CA',
        note: 'CA: consistent and available — but only because the network is assumed to never split. Try creating a partition and see why this stance rarely survives the real world.',
      },
    },
    createPartition: 'Create partition',
    healPartition: 'Heal partition',
    reset: 'Reset',
    replicaA: 'Replica A',
    replicaB: 'Replica B',
    balanceLabel: 'balance',
    writeBtn: 'Write to A — withdraw $100',
    readBtn: 'Read from B',
    linkHealthy: 'replicating',
    linkBroken: 'partition — no messages get through',
    staleBadge: 'STALE',
    freshBadge: 'FRESH',
    divergedNote: 'Replicas disagree: A committed a write that B has never heard about.',
    convergedNote: 'Replicas agree — every read returns the latest write.',
    caWarningTitle: 'CA has no answer for this',
    caWarningBody:
      'CA assumes the network never partitions. When a partition happens anyway, the system is forced to give up consistency (behave like AP) or availability (behave like CP). That is why CA is rarely a practical stance for distributed systems.',
    responses: {
      writeReplicated: 'Write committed on A and replicated to B — both replicas agree.',
      writeLocalOnly: 'Write committed on A only. B is unreachable, so the replicas have diverged.',
      writeRejected: 'Write rejected: A cannot safely replicate during the partition. Consistency preserved, availability sacrificed.',
      readFresh: 'B answered with the latest committed value.',
      readStale: 'B answered — but with a stale value. It never heard about the write on A.',
      readRejected: 'Read rejected: B cannot prove its data is fresh, so it refuses to answer. No stale read — no answer either.',
      healing: 'Partition healed — replication catching up…',
    },
  },

  useCases: {
    title: 'AP or CP? You call it',
    subtitle:
      'For each system, decide what should win during a partition: keep answering (AP) or stay strictly fresh (CP).',
    question: 'During a partition, this system should…',
    apBtn: 'AP — keep answering',
    cpBtn: 'CP — stay consistent',
    revealPrefix: 'Usual choice:',
    correct: 'Good call!',
    incorrect: 'Reasonable — but most designs go the other way.',
    cases: [
      {
        id: 'feed',
        label: 'Social feed & like counts',
        detail: 'Timelines, likes, view counters',
        answer: 'ap',
        why: 'A like count that is briefly off by a few is invisible to users; a feed that errors out is not. Stale reads are harmless here, so availability wins.',
      },
      {
        id: 'bank',
        label: 'Bank balance & withdrawals',
        detail: 'Account balances, transfers',
        answer: 'cp',
        why: 'Serving a stale $1000 after a withdrawal invites double-spending. Better to reject or delay a request than to answer with money that is no longer there.',
      },
      {
        id: 'cart',
        label: 'Shopping cart',
        detail: 'Add/remove items before checkout',
        answer: 'ap',
        why: 'Losing a cart update or briefly showing an old cart is annoying but cheap; blocking shoppers is expensive. Classic AP — Amazon’s Dynamo was born for this. Checkout itself, though, flips to CP.',
      },
      {
        id: 'inventory',
        label: 'Flash-sale inventory (last item)',
        detail: 'Selling limited stock at checkout',
        answer: 'cp',
        why: 'Overselling the last item creates real-world pain: refunds, angry customers. At the moment of purchase you need the true count, even if some buyers must wait.',
      },
      {
        id: 'chat',
        label: 'Chat presence (online/offline dots)',
        detail: 'Who is online right now',
        answer: 'ap',
        why: 'A presence dot that lags a few seconds misleads no one for long. Nobody wants the whole chat UI to error because presence could not coordinate.',
      },
      {
        id: 'config',
        label: 'Leader election & cluster config',
        detail: 'Which node is primary, feature locks',
        answer: 'cp',
        why: 'Two nodes both believing they are the leader (split brain) corrupts data. Coordination systems like ZooKeeper and etcd choose CP: minority partitions stop answering.',
      },
    ],
    note: 'Notice the pattern: the same product uses both stances. Browsing and carts lean AP; payment and stock lean CP. You choose per data type, not per company.',
  },
};

const ptBR: CapContent = {
  triangle: {
    title: 'O triângulo de trade-offs',
    subtitle:
      'Toque em cada vértice para entender o que C, A e P realmente significam — depois toque em uma aresta para ver o que acontece quando um sistema se apoia em dois deles.',
    tapHint: 'Toque em um vértice ou aresta',
    pickTwo:
      'Durante uma partição de rede, um sistema distribuído não consegue garantir totalmente consistência e disponibilidade ao mesmo tempo — ele precisa pender para um lado.',
    letters: {
      c: {
        name: 'Consistência',
        tagline: 'Todos veem a escrita mais recente',
        definition:
          'Todo cliente vê a escrita bem-sucedida mais recente, não importa qual réplica responda. Não é "os dados estão corretos" em geral — é especificamente: nenhuma leitura desatualizada.',
        example:
          'Você saca R$ 100 e seu saldo cai para R$ 900. Se depois disso alguma réplica ainda responder R$ 1000, o sistema não foi consistente.',
      },
      a: {
        name: 'Disponibilidade',
        tagline: 'Toda requisição recebe resposta',
        definition:
          'Toda requisição recebe uma resposta sem erro — mesmo que ela possa não conter a escrita mais recente. Disponibilidade é sobre responder, não sobre estar atualizado.',
        example:
          'Durante uma falha entre réplicas, um sistema disponível ainda responde sua leitura — possivelmente com dados um pouco antigos em vez de um erro.',
      },
      p: {
        name: 'Tolerância a partição',
        tagline: 'Sobrevive a uma divisão da rede',
        definition:
          'O sistema continua operando mesmo quando os nós não conseguem se comunicar porque a rede entre eles falhou. Os nós estão vivos — as mensagens entre eles é que se perdem.',
        example:
          'Um cabo rompido divide seu cluster em duas ilhas. As duas ilhas continuam rodando — só não conseguem se coordenar até a rede se recuperar.',
      },
    },
    pairsTitle: 'As três posturas',
    pairs: {
      ap: {
        label: 'AP',
        name: 'Disponibilidade + Tolerância a partição',
        tagline: 'Continuar respondendo, aceitando dados temporariamente antigos',
        gives: [
          'Toda requisição recebe resposta, mesmo no meio da partição',
          'Latência baixa — réplicas respondem localmente',
          'Ótimo para dados que toleram divergência breve',
        ],
        costs: [
          'Leituras podem retornar dados desatualizados durante a partição',
          'Réplicas divergem e precisam se reconciliar depois',
        ],
        systems: 'DynamoDB (leituras padrão), Cassandra, DNS, a maioria dos caches e feeds sociais',
      },
      cp: {
        label: 'CP',
        name: 'Consistência + Tolerância a partição',
        tagline: 'Nunca servir dado desatualizado, aceitando rejeitar requisições',
        gives: [
          'Nenhuma leitura desatualizada — o cliente recebe dado fresco ou um erro',
          'Seguro para saldos, estoque e tudo que envolve dinheiro',
          'Réplicas nunca discordam silenciosamente',
        ],
        costs: [
          'Algumas requisições falham ou esperam durante a partição',
          'A coordenação adiciona latência mesmo nos dias bons',
        ],
        systems: 'ZooKeeper, etcd, Google Spanner, a maioria dos setups relacionais com replicação síncrona',
      },
      ca: {
        label: 'CA',
        name: 'Consistência + Disponibilidade',
        tagline: 'As duas garantias — mas só enquanto a rede nunca se divide',
        gives: [
          'Dados frescos e respostas para todos…',
          '…desde que todos os nós sempre consigam se falar',
        ],
        costs: [
          'Nenhum plano para partição — e redes reais particionam',
          'Quando a divisão acontece mesmo assim, o sistema precisa abrir mão de C ou de A na hora',
        ],
        systems: 'Um banco de dados de nó único, ou sistemas onde tolerância a partição está fora de escopo',
      },
    },
    givesLabel: 'O que você ganha',
    costsLabel: 'O que custa',
    systemsLabel: 'Onde aparece',
    caWarning:
      'CA é sobretudo um canto conceitual: só vale enquanto nenhuma partição existe. Sistemas distribuídos precisam esperar partições, então a escolha do mundo real costuma ser AP vs CP.',
    note: 'CAP não é "escolha 2 de 3 para sempre". Ele diz: quando uma partição acontece, você não pode ter consistência perfeita e disponibilidade perfeita ao mesmo tempo. No resto do tempo, você ajusta o trade-off com latência e configurações de replicação.',
  },

  lab: {
    title: 'Laboratório de partição — um saldo, duas réplicas',
    subtitle:
      'O saldo da sua conta vive nas réplicas A e B. Corte a rede entre elas, escreva em A, leia de B — e veja como AP, CP e CA respondem de forma diferente.',
    steps: [
      'Escolha uma postura (AP / CP / CA)',
      'Crie uma partição',
      'Escreva em A (saque de R$ 100)',
      'Leia de B e observe a resposta',
    ],
    modeLabel: 'Postura',
    modes: {
      ap: {
        label: 'AP',
        note: 'AP: as duas réplicas continuam respondendo durante a partição. A escrita confirma só em A, então B serve um R$ 1000 desatualizado até a rede se recuperar e a replicação alcançar.',
      },
      cp: {
        label: 'CP',
        note: 'CP: em vez de arriscar dados desatualizados ou divergentes, o sistema rejeita escritas e leituras que não consegue coordenar com segurança durante a partição. Clientes veem erros — nunca um saldo errado.',
      },
      ca: {
        label: 'CA',
        note: 'CA: consistente e disponível — mas só porque assume que a rede nunca se divide. Tente criar uma partição e veja por que essa postura raramente sobrevive ao mundo real.',
      },
    },
    createPartition: 'Criar partição',
    healPartition: 'Restaurar rede',
    reset: 'Reiniciar',
    replicaA: 'Réplica A',
    replicaB: 'Réplica B',
    balanceLabel: 'saldo',
    writeBtn: 'Escrever em A — sacar R$ 100',
    readBtn: 'Ler de B',
    linkHealthy: 'replicando',
    linkBroken: 'partição — nenhuma mensagem passa',
    staleBadge: 'ANTIGO',
    freshBadge: 'FRESCO',
    divergedNote: 'As réplicas discordam: A confirmou uma escrita que B nunca ficou sabendo.',
    convergedNote: 'As réplicas concordam — toda leitura retorna a escrita mais recente.',
    caWarningTitle: 'CA não tem resposta para isso',
    caWarningBody:
      'CA assume que a rede nunca particiona. Quando uma partição acontece mesmo assim, o sistema é forçado a abrir mão da consistência (agir como AP) ou da disponibilidade (agir como CP). Por isso CA raramente é uma postura prática em sistemas distribuídos.',
    responses: {
      writeReplicated: 'Escrita confirmada em A e replicada para B — as duas réplicas concordam.',
      writeLocalOnly: 'Escrita confirmada apenas em A. B está inalcançável, então as réplicas divergiram.',
      writeRejected: 'Escrita rejeitada: A não consegue replicar com segurança durante a partição. Consistência preservada, disponibilidade sacrificada.',
      readFresh: 'B respondeu com o valor confirmado mais recente.',
      readStale: 'B respondeu — mas com um valor desatualizado. Ele nunca soube da escrita em A.',
      readRejected: 'Leitura rejeitada: B não consegue provar que seu dado é fresco, então se recusa a responder. Sem leitura desatualizada — mas sem resposta também.',
      healing: 'Partição restaurada — replicação alcançando…',
    },
  },

  useCases: {
    title: 'AP ou CP? Você decide',
    subtitle:
      'Para cada sistema, decida o que deve vencer durante uma partição: continuar respondendo (AP) ou permanecer estritamente atualizado (CP).',
    question: 'Durante uma partição, este sistema deve…',
    apBtn: 'AP — continuar respondendo',
    cpBtn: 'CP — manter consistência',
    revealPrefix: 'Escolha usual:',
    correct: 'Boa escolha!',
    incorrect: 'Razoável — mas a maioria dos projetos vai para o outro lado.',
    cases: [
      {
        id: 'feed',
        label: 'Feed social e contagem de likes',
        detail: 'Timelines, likes, contadores de visualização',
        answer: 'ap',
        why: 'Uma contagem de likes brevemente errada por alguns é invisível para usuários; um feed que retorna erro não é. Leituras desatualizadas são inofensivas aqui, então disponibilidade vence.',
      },
      {
        id: 'bank',
        label: 'Saldo bancário e saques',
        detail: 'Saldos de conta, transferências',
        answer: 'cp',
        why: 'Servir um R$ 1000 desatualizado depois de um saque convida ao gasto duplo. Melhor rejeitar ou atrasar uma requisição do que responder com dinheiro que não existe mais.',
      },
      {
        id: 'cart',
        label: 'Carrinho de compras',
        detail: 'Adicionar/remover itens antes do checkout',
        answer: 'ap',
        why: 'Perder uma atualização do carrinho ou mostrar um carrinho antigo por instantes é chato mas barato; bloquear compradores é caro. AP clássico — o Dynamo da Amazon nasceu para isso. Já o checkout em si vira CP.',
      },
      {
        id: 'inventory',
        label: 'Estoque em promoção-relâmpago (último item)',
        detail: 'Vender estoque limitado no checkout',
        answer: 'cp',
        why: 'Vender além do último item cria dor no mundo real: reembolsos, clientes bravos. No momento da compra você precisa da contagem verdadeira, mesmo que alguns compradores esperem.',
      },
      {
        id: 'chat',
        label: 'Presença no chat (bolinha online/offline)',
        detail: 'Quem está online agora',
        answer: 'ap',
        why: 'Uma bolinha de presença atrasada alguns segundos não engana ninguém por muito tempo. Ninguém quer o chat inteiro dando erro porque a presença não conseguiu se coordenar.',
      },
      {
        id: 'config',
        label: 'Eleição de líder e config do cluster',
        detail: 'Qual nó é o primário, locks de features',
        answer: 'cp',
        why: 'Dois nós acreditando ao mesmo tempo que são o líder (split brain) corrompe dados. Sistemas de coordenação como ZooKeeper e etcd escolhem CP: partições minoritárias param de responder.',
      },
    ],
    note: 'Repare no padrão: o mesmo produto usa as duas posturas. Navegação e carrinho pendem para AP; pagamento e estoque pendem para CP. Você escolhe por tipo de dado, não por empresa.',
  },
};

export const capContent: Record<Locale, CapContent> = {
  en,
  'pt-BR': ptBR,
};
