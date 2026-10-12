/** Placeholder used in index.html wherever the site's own absolute URL is needed. */
export const ORIGIN_PLACEHOLDER = '__SITE_ORIGIN__'

export function fillOrigin(html: string, origin: string): string {
  return html.replaceAll(ORIGIN_PLACEHOLDER, origin)
}
