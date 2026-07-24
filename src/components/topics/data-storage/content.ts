import { type Locale } from '@/i18n/routing';

/**
 * Interactive content for the Data Storage lesson. Same convention as the
 * other topics: long-form prose lives in the Markdown file; the strings that
 * drive the fit matrix, the file-system vs object-storage explorer, and the
 * upload + CDN lab live here — typed & bilingual.
 */

export type StoreKind = 'db' | 'fs' | 'obj';
export type Fit = 'best' | 'ok' | 'poor';
export type FileKind = 'img' | 'vid' | 'audio' | 'log' | 'json' | 'html';

export type CompareItem = {
  id: string;
  label: string;
  size: string;
  fit: Record<StoreKind, Fit>;
  why: string;
};

export type BucketObject = {
  key: string;
  kind: FileKind;
  size: string;
  contentType: string;
};

export type UploadChoice = {
  id: string;
  name: string;
  kind: FileKind;
  size: string;
  contentType: string;
};

export type DataStorageContent = {
  compare: {
    title: string;
    subtitle: string;
    tapHint: string;
    stores: Record<StoreKind, { label: string; tagline: string }>;
    fitLabels: Record<Fit, string>;
    items: CompareItem[];
    note: string;
  };

  explorer: {
    title: string;
    subtitle: string;
    fsTab: string;
    objTab: string;
    fs: {
      serverLabel: string;
      pathLabel: string;
      pros: string[];
      cons: string[];
      examples: string;
      note: string;
    };
    obj: {
      bucketLabel: string;
      tapHint: string;
      flatNote: string;
      keyLabel: string;
      idLabel: string;
      dataLabel: string;
      dataValue: string;
      metadataLabel: string;
      createdLabel: string;
      customLabel: string;
      customValue: string;
      pros: string[];
      cons: string[];
      examples: string;
      note: string;
    };
    prosLabel: string;
    consLabel: string;
    examplesLabel: string;
  };

  upload: {
    title: string;
    subtitle: string;
    pickLabel: string;
    choices: UploadChoice[];
    uploadBtn: string;
    reset: string;
    nodes: { user: string; app: string; bucket: string; cdn: string };
    steps: { toApp: string; toBucket: string; stamping: string; done: string };
    objectCard: {
      title: string;
      idLabel: string;
      dataLabel: string;
      metadataLabel: string;
      createdLabel: string;
    };
    cdnToggle: string;
    cdnOffNote: string;
    cdnOnNote: string;
    regionsTitle: string;
    regions: { id: string; label: string }[];
    downloadBtn: string;
    results: { origin: string; miss: string; hit: string };
    originBadge: string;
    missBadge: string;
    hitBadge: string;
    waitingNote: string;
    note: string;
  };
};

const en: DataStorageContent = {
  compare: {
    title: 'Where should this data live?',
    subtitle:
      'Databases are not the best home for everything. Tap each piece of data and see how well a relational database, a file share, and object storage fit it — and why.',
    tapHint: 'Tap a piece of data',
    stores: {
      db: { label: 'Database', tagline: 'rows, queries, transactions' },
      fs: { label: 'File system', tagline: 'folders on a shared server' },
      obj: { label: 'Object storage', tagline: 'objects in buckets, via HTTP' },
    },
    fitLabels: { best: 'great fit', ok: 'works', poor: 'poor fit' },
    items: [
      {
        id: 'record',
        label: 'User record (name, email)',
        size: '~1 KB',
        fit: { db: 'best', fs: 'poor', obj: 'poor' },
        why: 'Small, structured, queried and updated constantly — exactly what databases are built for. Files and objects cannot answer "find all users created this week".',
      },
      {
        id: 'photo',
        label: 'Profile photo',
        size: '~2 MB',
        fit: { db: 'poor', fs: 'ok', obj: 'best' },
        why: 'A binary blob the app never queries "inside" — it only stores and serves it. Keep the photo in object storage and save its URL/object ID in the database.',
      },
      {
        id: 'video',
        label: '4K video upload',
        size: '~2 GB',
        fit: { db: 'poor', fs: 'ok', obj: 'best' },
        why: 'Huge binaries bloat database storage, backups, and replication. Object storage is built for large objects and can stream them straight to users or a CDN.',
      },
      {
        id: 'audio',
        label: 'Podcast audio file',
        size: '~80 MB',
        fit: { db: 'poor', fs: 'ok', obj: 'best' },
        why: 'Same story as video: write once, read many times, never queried by content. Durable, cheap object storage plus CDN delivery is the standard setup.',
      },
      {
        id: 'log',
        label: 'Log archive (gzip)',
        size: '~500 MB/day',
        fit: { db: 'poor', fs: 'ok', obj: 'best' },
        why: 'Append-heavy, rarely read, kept for months. Object storage is cheap enough to retain them and analytics tools can read them directly from the bucket.',
      },
      {
        id: 'json',
        label: 'JSON export / HTML pages',
        size: '~5 MB',
        fit: { db: 'ok', fs: 'ok', obj: 'best' },
        why: 'File-like content served as-is. Small JSON the app queries belongs in a database; exports and static pages served over HTTP fit object storage naturally.',
      },
    ],
    note: 'The pattern: databases hold structured data you query; large binary assets — photos, videos, audio, archives — live outside, with the database keeping only a pointer (the object key or URL) plus searchable metadata.',
  },

  explorer: {
    title: 'Two ways to store files',
    subtitle:
      'The same uploaded files, seen through two models. Flip between the hierarchical file system and the flat object store — and notice the keys that only look like folders.',
    fsTab: 'File system',
    objTab: 'Object storage',
    fs: {
      serverLabel: 'storage server (network mount)',
      pathLabel: 'path',
      pros: [
        'Simple, familiar mental model — folders and files',
        'Clear directory organization',
        'Apps use it like a local disk (open, read, write)',
      ],
      cons: [
        'Scaling beyond one server/volume gets hard',
        'Not designed for HTTP access from anywhere',
        'Capacity and throughput limits of the mounted share',
      ],
      examples: 'NFS, SMB, Amazon EFS, Azure Files, Google Cloud Filestore',
      note: 'A file system organizes data as a hierarchy of folders and files, often on another server mounted over the network. Intuitive and great for many workloads — but cloud-scale systems eventually outgrow a single share.',
    },
    obj: {
      bucketLabel: 'bucket: app-uploads',
      tapHint: 'Tap an object to open it',
      flatNote:
        'The namespace is flat: "uploads/2026/03/beach.jpg" is not inside folders — it is one single key. The slashes are just characters that make listings look tidy.',
      keyLabel: 'object key',
      idLabel: 'object ID',
      dataLabel: 'data (blob)',
      dataValue: 'binary payload',
      metadataLabel: 'metadata',
      createdLabel: 'created_at',
      customLabel: 'custom',
      customValue: 'user_id=8134',
      pros: [
        'Massively scalable — billions of objects, no volume to outgrow',
        'Accessed over HTTP / REST from anywhere',
        'Low cost, high durability; pairs naturally with a CDN',
      ],
      cons: [
        'No real folders or file locking — different mental model',
        'Not a database: no queries over content, updates replace the object',
        'Latency higher than a local disk for tiny random reads',
      ],
      examples: 'Amazon S3, Azure Blob Storage, Google Cloud Storage, MinIO',
      note: 'Object storage keeps each file as an object — the binary data (blob) plus metadata plus a unique ID/key — inside a bucket, served over HTTP. It is the default home for user uploads, media, backups, and large static content.',
    },
    prosLabel: 'Strengths',
    consLabel: 'Limits',
    examplesLabel: 'Examples',
  },

  upload: {
    title: 'Upload lab — from device to the world',
    subtitle:
      'Pick a file and upload it: watch it land in the bucket, get its metadata and object ID stamped, then turn on the CDN and download it from three continents.',
    pickLabel: 'Pick a file',
    choices: [
      { id: 'photo', name: 'beach.jpg', kind: 'img', size: '2.4 MB', contentType: 'image/jpeg' },
      { id: 'video', name: 'trip.mp4', kind: 'vid', size: '1.8 GB', contentType: 'video/mp4' },
      { id: 'audio', name: 'episode-12.mp3', kind: 'audio', size: '82 MB', contentType: 'audio/mpeg' },
    ],
    uploadBtn: 'Upload file',
    reset: 'Reset',
    nodes: { user: 'User', app: 'App server', bucket: 'Bucket', cdn: 'CDN edge' },
    steps: {
      toApp: 'Uploading to the app server…',
      toBucket: 'App streams the file into the bucket…',
      stamping: 'Storing object: data + metadata + object ID…',
      done: 'Object stored. The database keeps only the object key and metadata — not the bytes.',
    },
    objectCard: {
      title: 'Stored object',
      idLabel: 'object ID',
      dataLabel: 'data',
      metadataLabel: 'metadata',
      createdLabel: 'created_at',
    },
    cdnToggle: 'Serve through CDN',
    cdnOffNote:
      'Without a CDN, every download travels to the bucket\'s home region. Users far away pay the full distance on every request.',
    cdnOnNote:
      'With a CDN (e.g. CloudFront) in front of the bucket, the first download in each region is a MISS that fills the edge cache — every download after that is served nearby.',
    regionsTitle: 'Download from around the world',
    regions: [
      { id: 'us', label: 'US user' },
      { id: 'eu', label: 'Europe user' },
      { id: 'br', label: 'Brazil user' },
    ],
    downloadBtn: 'Download',
    results: {
      origin: 'Served from the origin bucket across the globe.',
      miss: 'Edge cache MISS — fetched from the bucket, now cached at this edge.',
      hit: 'Edge cache HIT — served from the nearby CDN edge.',
    },
    originBadge: 'ORIGIN',
    missBadge: 'MISS',
    hitBadge: 'HIT',
    waitingNote: 'Upload a file first — then it can be downloaded here.',
    note: 'This is the standard media pipeline: users upload → app stores the object in the bucket and its key + metadata in the database → the file is served directly from object storage, usually through a CDN for fast global delivery.',
  },
};

const ptBR: DataStorageContent = {
  compare: {
    title: 'Onde este dado deve morar?',
    subtitle:
      'Bancos de dados não são o melhor lar para tudo. Toque em cada dado e veja como um banco relacional, um compartilhamento de arquivos e um object storage se encaixam — e por quê.',
    tapHint: 'Toque em um dado',
    stores: {
      db: { label: 'Banco de dados', tagline: 'linhas, consultas, transações' },
      fs: { label: 'Sistema de arquivos', tagline: 'pastas em um servidor compartilhado' },
      obj: { label: 'Object storage', tagline: 'objetos em buckets, via HTTP' },
    },
    fitLabels: { best: 'ótimo encaixe', ok: 'funciona', poor: 'encaixe ruim' },
    items: [
      {
        id: 'record',
        label: 'Registro de usuário (nome, e-mail)',
        size: '~1 KB',
        fit: { db: 'best', fs: 'poor', obj: 'poor' },
        why: 'Pequeno, estruturado, consultado e atualizado o tempo todo — exatamente para isso bancos de dados existem. Arquivos e objetos não respondem "encontre todos os usuários criados esta semana".',
      },
      {
        id: 'photo',
        label: 'Foto de perfil',
        size: '~2 MB',
        fit: { db: 'poor', fs: 'ok', obj: 'best' },
        why: 'Um blob binário que o app nunca consulta "por dentro" — só armazena e serve. Guarde a foto no object storage e salve a URL/ID do objeto no banco.',
      },
      {
        id: 'video',
        label: 'Upload de vídeo 4K',
        size: '~2 GB',
        fit: { db: 'poor', fs: 'ok', obj: 'best' },
        why: 'Binários enormes incham o armazenamento, os backups e a replicação do banco. Object storage foi feito para objetos grandes e consegue transmiti-los direto para usuários ou um CDN.',
      },
      {
        id: 'audio',
        label: 'Arquivo de áudio de podcast',
        size: '~80 MB',
        fit: { db: 'poor', fs: 'ok', obj: 'best' },
        why: 'Mesma história do vídeo: escreve uma vez, lê muitas vezes, nunca consulta pelo conteúdo. Object storage durável e barato mais entrega via CDN é o arranjo padrão.',
      },
      {
        id: 'log',
        label: 'Arquivo de logs (gzip)',
        size: '~500 MB/dia',
        fit: { db: 'poor', fs: 'ok', obj: 'best' },
        why: 'Muita escrita em append, leitura rara, retenção de meses. Object storage é barato o suficiente para guardar tudo, e ferramentas de análise leem direto do bucket.',
      },
      {
        id: 'json',
        label: 'Export JSON / páginas HTML',
        size: '~5 MB',
        fit: { db: 'ok', fs: 'ok', obj: 'best' },
        why: 'Conteúdo em formato de arquivo servido como está. JSON pequeno que o app consulta pertence ao banco; exports e páginas estáticas servidas por HTTP se encaixam naturalmente no object storage.',
      },
    ],
    note: 'O padrão: bancos de dados guardam dados estruturados que você consulta; assets binários grandes — fotos, vídeos, áudio, arquivos — vivem fora, com o banco guardando apenas um ponteiro (a chave do objeto ou URL) e metadados pesquisáveis.',
  },

  explorer: {
    title: 'Dois jeitos de guardar arquivos',
    subtitle:
      'Os mesmos arquivos enviados, vistos por dois modelos. Alterne entre o sistema de arquivos hierárquico e o object store plano — e repare nas chaves que só parecem pastas.',
    fsTab: 'Sistema de arquivos',
    objTab: 'Object storage',
    fs: {
      serverLabel: 'servidor de storage (montado via rede)',
      pathLabel: 'caminho',
      pros: [
        'Modelo mental simples e familiar — pastas e arquivos',
        'Organização clara em diretórios',
        'Apps usam como um disco local (abrir, ler, escrever)',
      ],
      cons: [
        'Escalar além de um servidor/volume fica difícil',
        'Não foi projetado para acesso HTTP de qualquer lugar',
        'Limites de capacidade e vazão do compartilhamento montado',
      ],
      examples: 'NFS, SMB, Amazon EFS, Azure Files, Google Cloud Filestore',
      note: 'Um sistema de arquivos organiza dados como uma hierarquia de pastas e arquivos, muitas vezes em outro servidor montado pela rede. Intuitivo e ótimo para muitos cenários — mas sistemas em escala de nuvem eventualmente superam um único compartilhamento.',
    },
    obj: {
      bucketLabel: 'bucket: app-uploads',
      tapHint: 'Toque em um objeto para abri-lo',
      flatNote:
        'O namespace é plano: "uploads/2026/03/praia.jpg" não está dentro de pastas — é uma única chave. As barras são só caracteres que deixam as listagens organizadas.',
      keyLabel: 'chave do objeto',
      idLabel: 'ID do objeto',
      dataLabel: 'dados (blob)',
      dataValue: 'payload binário',
      metadataLabel: 'metadados',
      createdLabel: 'created_at',
      customLabel: 'custom',
      customValue: 'user_id=8134',
      pros: [
        'Escala massivamente — bilhões de objetos, sem volume para estourar',
        'Acessado via HTTP / REST de qualquer lugar',
        'Custo baixo, alta durabilidade; combina naturalmente com CDN',
      ],
      cons: [
        'Sem pastas reais nem lock de arquivos — outro modelo mental',
        'Não é banco de dados: sem consultas pelo conteúdo, updates substituem o objeto',
        'Latência maior que disco local para leituras pequenas e aleatórias',
      ],
      examples: 'Amazon S3, Azure Blob Storage, Google Cloud Storage, MinIO',
      note: 'Object storage guarda cada arquivo como um objeto — os dados binários (blob) mais metadados mais um ID/chave único — dentro de um bucket, servido via HTTP. É o lar padrão de uploads de usuários, mídia, backups e conteúdo estático grande.',
    },
    prosLabel: 'Pontos fortes',
    consLabel: 'Limites',
    examplesLabel: 'Exemplos',
  },

  upload: {
    title: 'Laboratório de upload — do dispositivo para o mundo',
    subtitle:
      'Escolha um arquivo e faça o upload: veja-o chegar ao bucket, receber metadados e ID de objeto, depois ligue o CDN e baixe de três continentes.',
    pickLabel: 'Escolha um arquivo',
    choices: [
      { id: 'photo', name: 'praia.jpg', kind: 'img', size: '2,4 MB', contentType: 'image/jpeg' },
      { id: 'video', name: 'viagem.mp4', kind: 'vid', size: '1,8 GB', contentType: 'video/mp4' },
      { id: 'audio', name: 'episodio-12.mp3', kind: 'audio', size: '82 MB', contentType: 'audio/mpeg' },
    ],
    uploadBtn: 'Fazer upload',
    reset: 'Reiniciar',
    nodes: { user: 'Usuário', app: 'Servidor da app', bucket: 'Bucket', cdn: 'Edge do CDN' },
    steps: {
      toApp: 'Enviando para o servidor da app…',
      toBucket: 'A app transmite o arquivo para o bucket…',
      stamping: 'Gravando objeto: dados + metadados + ID do objeto…',
      done: 'Objeto gravado. O banco guarda apenas a chave do objeto e os metadados — não os bytes.',
    },
    objectCard: {
      title: 'Objeto armazenado',
      idLabel: 'ID do objeto',
      dataLabel: 'dados',
      metadataLabel: 'metadados',
      createdLabel: 'created_at',
    },
    cdnToggle: 'Servir via CDN',
    cdnOffNote:
      'Sem CDN, todo download viaja até a região de origem do bucket. Usuários distantes pagam a distância inteira em cada requisição.',
    cdnOnNote:
      'Com um CDN (ex.: CloudFront) na frente do bucket, o primeiro download em cada região é um MISS que enche o cache da borda — todo download seguinte é servido de perto.',
    regionsTitle: 'Baixe de vários lugares do mundo',
    regions: [
      { id: 'us', label: 'Usuário nos EUA' },
      { id: 'eu', label: 'Usuário na Europa' },
      { id: 'br', label: 'Usuário no Brasil' },
    ],
    downloadBtn: 'Baixar',
    results: {
      origin: 'Servido do bucket de origem atravessando o globo.',
      miss: 'MISS no cache da borda — buscado no bucket e agora cacheado neste edge.',
      hit: 'HIT no cache da borda — servido do edge do CDN ali perto.',
    },
    originBadge: 'ORIGEM',
    missBadge: 'MISS',
    hitBadge: 'HIT',
    waitingNote: 'Faça o upload de um arquivo primeiro — depois ele pode ser baixado aqui.',
    note: 'Esse é o pipeline padrão de mídia: usuário faz upload → a app grava o objeto no bucket e a chave + metadados no banco → o arquivo é servido direto do object storage, geralmente através de um CDN para entrega global rápida.',
  },
};

export const dataStorageContent: Record<Locale, DataStorageContent> = {
  en,
  'pt-BR': ptBR,
};
