import { describe, expect, it } from 'vitest'
import worker from '../worker'
import { ORIGIN_PLACEHOLDER, fillOrigin } from '../worker/origin'

const html = `<link rel="canonical" href="${ORIGIN_PLACEHOLDER}/" /><meta property="og:image" content="${ORIGIN_PLACEHOLDER}/og-image.png" />`

/** A fake static-assets binding that always answers with the given response. */
const assets = (response: Response) => ({ ASSETS: { fetch: async () => response.clone() } })

describe('worker', () => {
  it('fills every placeholder with the origin', () => {
    expect(fillOrigin(html, 'https://example.dev')).toBe(
      '<link rel="canonical" href="https://example.dev/" /><meta property="og:image" content="https://example.dev/og-image.png" />',
    )
  })

  it('uses the host that served the page, whatever the domain', async () => {
    const page = new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'content-length': '999', etag: '"abc"' } })
    for (const url of ['https://stillcode.modulezp.com/', 'https://my-fork.pages.dev/some/route', 'http://localhost:8787/']) {
      const res = await worker.fetch(new Request(url), assets(page))
      const body = await res.text()
      expect(body).toContain(`content="${new URL(url).origin}/og-image.png"`)
      expect(body).not.toContain(ORIGIN_PLACEHOLDER)
      expect(res.headers.get('content-length')).toBeNull()
      expect(res.headers.get('etag')).toBeNull()
    }
  })

  it('passes images, scripts and 304s through untouched', async () => {
    const png = new Response('PNG', { headers: { 'content-type': 'image/png' } })
    expect(await (await worker.fetch(new Request('https://x.dev/og-image.png'), assets(png))).text()).toBe('PNG')
    const notModified = new Response(null, { status: 304, headers: { 'content-type': 'text/html' } })
    expect((await worker.fetch(new Request('https://x.dev/'), assets(notModified))).status).toBe(304)
  })
})
