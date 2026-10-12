import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * The site's own address, as Netlify reports it during the build: the production URL (custom domain if set)
 * or the branch / deploy-preview URL. Empty locally, which leaves the link-preview URLs relative.
 */
function netlifySiteUrl(): string {
  const { CONTEXT, URL, DEPLOY_PRIME_URL } = process.env
  return (CONTEXT === 'production' ? URL : (DEPLOY_PRIME_URL ?? URL)) ?? ''
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Link-preview crawlers need absolute URLs, so fill the site's address into index.html at build time.
      name: 'site-origin',
      transformIndexHtml: (html) => html.replaceAll('__SITE_ORIGIN__', netlifySiteUrl()),
    },
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
