---
title: "Data Storage"
slug: data-storage
description: "Where large files really live — why databases are not the best home for videos, photos, and binary blobs, and how file systems and object storage (S3-style buckets, often behind a CDN) fill that role."
category: blocos-fundamentais
order: 100
difficulty: beginner
status: published
tags: [data-storage, object-storage, file-system, blob, s3, buckets, cdn, uploads, media]
updatedAt: "2026-07-17"
beginnerSummary: >-
  Not all data belongs in a database. Small, structured data you query — users, orders,
  balances — fits databases perfectly. But large binary files — videos, photos, audio, log
  archives — are usually better stored elsewhere, with the database keeping only a pointer
  and some metadata. The two main options are: a file system (a familiar hierarchy of folders
  and files, often on a network-mounted server like NFS, Amazon EFS, or Azure Files — simple
  and intuitive, but harder to scale to cloud size) and object storage (Amazon S3, Azure Blob
  Storage, Google Cloud Storage, MinIO — every file becomes an object made of the binary data
  plus metadata plus a unique ID, stored in a bucket with a flat namespace and accessed over
  HTTP). Object storage is the default choice for user uploads and media because it is
  massively scalable, durable, and cheap — and it pairs naturally with a CDN so files are
  delivered quickly anywhere in the world.
glossary:
  - term: Blob (binary large object)
    definition: "A chunk of binary data treated as a single unit — an image, a video, an archive. Stored and served whole; never queried 'inside' like database rows."
  - term: File system
    definition: "Storage organized as a hierarchy of folders and files, often on another server mounted over the network. Simple mental model; harder to scale to cloud size."
  - term: Network file share (NFS/SMB)
    definition: "Protocols that let servers mount a remote file system as if it were a local disk. Managed versions include Amazon EFS, Azure Files, and Google Cloud Filestore."
  - term: Object storage
    definition: "Storage that keeps each file as an object — data + metadata + unique ID — inside a bucket, accessed over HTTP/REST. Examples: S3, Azure Blob Storage, GCS, MinIO."
  - term: Object
    definition: "The unit of object storage: the binary payload, its metadata (content-type, created_at, custom fields), and a unique key/ID that addresses it."
  - term: Metadata
    definition: "Data about the object — content-type, size, creation time, custom tags like user_id. Lets systems handle files correctly without opening the bytes."
  - term: Object ID / key
    definition: "The unique name that addresses an object in a bucket (a UUID or a path-looking string). The database stores this pointer instead of the file bytes."
  - term: Bucket
    definition: "The container that holds objects in object storage. Its namespace is flat — object keys may look like paths, but there are no real folders."
  - term: Flat namespace
    definition: "All object keys live at one level; 'uploads/2026/photo.jpg' is one single key string, not a photo inside nested folders."
  - term: Presigned URL
    definition: "A temporary, signed link that lets a client upload or download an object directly from the bucket without passing the bytes through your app servers."
  - term: CDN (Content Delivery Network)
    definition: "A network of edge caches (e.g. CloudFront) placed in front of an origin — often an object-storage bucket — so files are served near the user instead of across the globe."
  - term: Origin
    definition: "The authoritative source a CDN fetches from on a cache miss. For media and static assets, the origin is typically the object-storage bucket."
references:
  - label: "Amazon S3 — documentation"
    url: https://docs.aws.amazon.com/s3/
  - label: "Azure Blob Storage — introduction"
    url: https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction
  - label: "Google Cloud Storage — documentation"
    url: https://cloud.google.com/storage/docs
  - label: "MinIO — open-source object storage"
    url: https://min.io/
  - label: "Amazon CloudFront with S3 — serving content"
    url: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html
  - label: "AWS — When to use Amazon EFS"
    url: https://docs.aws.amazon.com/efs/latest/ug/whentochoose.html
---

> Use the lab above to **build the intuition by hand**: match each kind of data to the store
> that fits it, flip the same six files between a folder tree and a flat bucket, open an
> object to see its data + metadata + ID, then upload a file and download it from three
> continents with the CDN on and off. The notes below are the quick reference.

## What it is

"Data storage" here means the layer where **file-like data** lives: videos, photos, audio,
log archives, JSON exports, HTML pages, and other **binary blobs**. Databases remain the
home of structured records — but for large files, two other models do the heavy lifting:
**file systems** and **object storage**.

## Why databases are not always the best fit

Databases *can* store binary data — the point is not that they "don't work", but that they
are often **not the best primary storage for large binaries**:

- A 2 GB video inside a table bloats **storage, backups, and replication** for data the
  database can never query "inside".
- Databases shine at **small, structured, frequently queried rows** — not at streaming
  gigabytes to a phone.
- The proven pattern: store the file elsewhere and keep in the database only its **object
  key/URL plus searchable metadata** (owner, size, content-type).

## File system

The familiar model: a **hierarchy of folders and files**, often on a dedicated server
mounted over the network (**NFS**, **SMB**) or a managed file share (**Amazon EFS**,
**Azure Files**, **Google Cloud Filestore**).

- **Strengths** — simple, intuitive mental model; clear directory organization; applications
  use it like a local disk.
- **Limits** — scaling beyond one server/volume gets hard; not designed for HTTP access from
  anywhere; capacity and throughput ceilings of the share.

Great for many workloads (shared configs, legacy apps, lift-and-shift) — but cloud-native
systems serving millions of uploads eventually outgrow it.

## Object storage

The cloud-native model: each file is stored as an **object** inside a **bucket** and
accessed over **HTTP / REST**. Examples: **Amazon S3, Azure Blob Storage, Google Cloud
Storage, MinIO** (self-hosted).

### Object anatomy

An object has exactly three parts *(open one in the explorer above)*:

- **Data** — the binary payload itself (the blob): image bytes, video bytes, a gzip archive.
- **Metadata** — data about the data: `content-type`, size, `created_at`, and custom fields
  like `user_id`.
- **Object ID / key** — a unique identifier (a UUID or a chosen key) that addresses the
  object.

### Buckets and the flat namespace

Objects live in buckets — and a bucket is **conceptually flat**. A key like
`uploads/2026/03/beach.jpg` is **one single string**, not a file inside nested folders: the
slashes are just characters that make listings look tidy. There are no real directories to
create, move, or run out of.

### Why it wins at scale

- **Massively scalable** — billions of objects; no volume to outgrow.
- **Durable and low cost** — designed for many copies across hardware, priced for bulk.
- **HTTP-native** — every object is addressable by URL, from anywhere.
- **Perfect for user uploads** — media, backups, and large static content served directly
  or through a CDN.

## File system vs object storage

- **Hierarchy vs flat** — real nested directories vs one flat key space per bucket.
- **Access** — mounted like a disk (open/read/write) vs HTTP/REST requests.
- **Mental model** — file system is simpler locally; object storage fits distributed,
  cloud-scale systems better.
- **Scale & cost** — file shares hit server/volume ceilings; object stores scale
  horizontally at low cost.
- **When each** — file system for shared-disk semantics and legacy compatibility; object
  storage for uploads, media, backups, and anything served over the web.

## The user-upload pipeline

The standard flow *(run it in the upload lab above)*:

1. The user uploads a photo or video to the application.
2. The app streams the bytes into the **bucket** (or hands the client a **presigned URL**
   to upload directly).
3. The object is stored with its **metadata**, and an **object ID/key** identifies it.
4. The **database stores only the key + metadata** — never the bytes.
5. Later, the file is served straight from object storage — usually **through a CDN**.

## CDN integration

Object storage pairs naturally with a CDN (e.g. **CloudFront** in front of S3):

- The bucket is the **origin**; the CDN keeps copies at **edge locations** worldwide.
- First request in a region: **MISS** — the edge fetches from the bucket and caches it.
- Every request after: **HIT** — served from nearby, cutting latency from ~200 ms to
  ~25 ms and removing load from the origin.

This is how avatars, product images, and video segments reach users fast everywhere.

## Trade-offs

- **Simplicity vs scale** — the file-system model is easier to reason about; object storage
  trades familiarity for effectively unlimited scale.
- **Latency profile** — local/network disks win at tiny random reads; object storage wins
  at streaming large files over the web.
- **Semantics** — file systems offer locking and in-place edits; object storage replaces
  whole objects and offers no real folders.
- **Cost** — object storage is usually the cheapest durable option for bulk data; file
  shares cost more per GB but behave like disks.

## Interview relevance

- **Say the pattern out loud**: "Media goes to object storage; the database keeps the
  object key and metadata." This one sentence covers most upload questions.
- **Justify why** — large binaries bloat database storage, backups, and replication, and
  databases can't query inside them anyway.
- **Know the anatomy** — object = data + metadata + unique ID, in a bucket, flat namespace,
  accessed over HTTP. Metadata (content-type) is what lets browsers render the file; the ID
  is what the database points to.
- **Complete the delivery story** — bucket as CDN origin: first fetch per region is a MISS,
  then edge HITs serve users nearby. Uploads via presigned URLs keep bytes off your app
  servers.
- **Name the products** — S3 / Azure Blob / GCS / MinIO for objects; NFS / SMB / EFS /
  Azure Files / Cloud Filestore for file shares. (And if document databases come up:
  Firestore is a document database, not file storage.)

## Class notes

- Rule of thumb: **if you'd never write a WHERE clause about its contents, it probably
  doesn't belong in the database.**
- The bucket illusion to kill: keys look like paths, but the namespace is **flat** — no
  real folders.
- Default architecture for uploads: **object storage + key in the database + CDN in
  front**.
- File shares are not obsolete — they are the right tool when apps genuinely need
  disk-like, shared access.
