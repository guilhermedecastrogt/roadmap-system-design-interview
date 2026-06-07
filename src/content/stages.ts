import { type Category } from './schema';
import { type Locale } from '@/i18n/routing';

/**
 * Roadmap stages drive both the homepage roadmap and the topics listing.
 * Labels are localized here (rather than in message files) so they stay
 * next to the content model they describe.
 *
 * Mirrors the course outline:
 *   1. Introdução
 *   2. Blocos Fundamentais
 *   3. Tópicos de Entrevista
 *   4. Exemplos Práticos
 */
export type Stage = {
  id: Category;
  order: number;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
};

export const stages: Stage[] = [
  {
    id: 'introducao',
    order: 0,
    label: { en: 'Introduction', 'pt-BR': 'Introdução' },
    description: {
      en: 'What system design is, how interviews work, and how to use this roadmap.',
      'pt-BR':
        'O que é design de sistemas, como funcionam as entrevistas e como usar este roadmap.',
    },
  },
  {
    id: 'blocos-fundamentais',
    order: 1,
    label: { en: 'Fundamental Building Blocks', 'pt-BR': 'Blocos Fundamentais' },
    description: {
      en: 'The core components every system is built from — DNS, CDN, load balancers, caches, queues, databases, and more.',
      'pt-BR':
        'Os componentes centrais com que todo sistema é construído — DNS, CDN, balanceadores, caches, filas, bancos de dados e mais.',
    },
  },
  {
    id: 'topicos-de-entrevista',
    order: 2,
    label: { en: 'Interview Topics', 'pt-BR': 'Tópicos de Entrevista' },
    description: {
      en: 'Frameworks, patterns, and what interviewers actually look for.',
      'pt-BR':
        'Frameworks, padrões e o que os entrevistadores realmente procuram.',
    },
  },
  {
    id: 'exemplos-praticos',
    order: 3,
    label: { en: 'Practical Examples', 'pt-BR': 'Exemplos Práticos' },
    description: {
      en: 'End-to-end walkthroughs of classic system design questions.',
      'pt-BR':
        'Resoluções completas de questões clássicas de design de sistemas.',
    },
  },
];

export const stagesById: Record<Category, Stage> = Object.fromEntries(
  stages.map((s) => [s.id, s]),
) as Record<Category, Stage>;
