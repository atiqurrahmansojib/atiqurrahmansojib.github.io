import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Every entry is published on the public site. `visibility` says whether the source repository is public.
 * A "private" project shows no repository link and says so on the page. Private projects are only added
 * when the owner asks for them (BikeHub, 2026-10-12) or has made the repository private (RMGFlow).
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().max(90),
    summary: z.string().max(240),
    order: z.number().int(),
    tier: z.enum(['flagship', 'major', 'standard']).default('standard'),
    visibility: z.enum(['public', 'private']),
    status: z.enum(['active', 'complete', 'learning']),
    stack: z.array(z.string()).min(1),
    /** Only for projects whose repository is public. */
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
