/**
 * Cloudflare Worker in front of the static site.
 *
 * Link-preview crawlers (WhatsApp, X, LinkedIn, …) don't run JavaScript and want absolute URLs in the
 * Open Graph tags. Instead of hard-coding a domain, index.html uses a placeholder that is filled in here
 * with the origin of whatever host served the page, so previews work on any domain the site is deployed to.
 */
import { fillOrigin } from './origin'

// Only the default export lives here: the Workers runtime treats every named export of this file as an entrypoint.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request)
    // Only full HTML pages need rewriting; scripts, images and 304s pass straight through.
    if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) return response

    const html = fillOrigin(await response.text(), new URL(request.url).origin)
    const headers = new Headers(response.headers)
    headers.delete('content-length') // the body changed
    headers.delete('etag') // and now depends on the host
    return new Response(html, { status: response.status, statusText: response.statusText, headers })
  },
}
