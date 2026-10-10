import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Custom domain confirmed by the owner (2026-10-09). Override with SITE_URL when building.
const site = process.env.SITE_URL ?? 'https://atiqur-rahman.me';

export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
