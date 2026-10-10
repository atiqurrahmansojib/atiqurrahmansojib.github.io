import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Every entry is published on the public site. `visibility` is pinned to "public" on purpose:
 * a private repository cannot be added until the owner approves and this rule is changed deliberately.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().max(90),
    summary: z.string().max(240),
    order: z.number().int(),
    tier: z.enum(['flagship', 'major', 'standard']).default('standard'),
    visibility: z.literal('public'),
    status: z.enum(['active', 'complete', 'learning']),
    stack: z.array(z.string()).min(1),
    repo: z.url().optional(),
    live: z.url().optional(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    /** Numbers reported by the project's own README; `note` says which. */
    stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    highlights: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    /** An ordered flow shown as an interactive pipeline (only when the order is real). */
    flow: z.array(z.string()).default([]),
    /** Where each claim on the page was verified, for the owner's review. */
    verifiedFrom: z.string(),
  }),
});

export const collections = { projects };
