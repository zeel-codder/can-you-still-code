import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * The site's own address, e.g. https://example.com, from the SITE_URL environment variable at build time.
 * Empty when unset, which leaves the link-preview URLs relative.
 */
function siteUrl(): string {
  return (process.env.SITE_URL ?? '').replace(/\/$/, '')
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Link-preview crawlers need absolute URLs, so fill the site's address into index.html at build time.
      name: 'site-origin',
      transformIndexHtml: (html) => html.replaceAll('__SITE_ORIGIN__', siteUrl()),
    },
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
