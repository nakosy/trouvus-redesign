import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const insights = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string(),
    lead: z.string(),
    author: z.string().default('Dr. Mitt Nowshade Kabir'),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    readTime: z.string(),
    tags: z.array(z.string()),
    cardLabel: z.string(),
    takeaway: z.string(),
    heroVariant: z.enum(['network', 'waves', 'pipeline']).default('waves'),
    visual: z.string().optional(),
    visualAlt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    ctaTitle: z.string(),
    ctaText: z.string(),
  }),
});

export const collections = { insights };
