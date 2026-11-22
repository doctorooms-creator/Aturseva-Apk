/**
 * E2E static server (:8090) — serves the web export from dist/ and proxies
 * /api/* → https://aturseva.com/api/* (the EXPO_PUBLIC_API_BASE="" relative
 * same-origin law: the exported bundle queries same-origin, this server
 * forwards to the prod monolith; without the empty base the browser hangs
 * cross-origin — the H2 gotcha, honored here).
 *
 * Boot: bun tools/serve-e2e.mjs (background, auto-restart not needed).
 */
const DIST = new URL('../dist/', import.meta.url).pathname
const UPSTREAM = 'https://aturseva.com'

Bun.serve({
  port: 8090,
  async fetch(req) {
    const url = new URL(req.url)
    // Proxy BOTH the API and the website's static photo dir — with
    // EXPO_PUBLIC_API_BASE="" the photoUrl() resolver makes face paths
    // same-origin, so the curated faces (/website/photos/faces/*) must
    // forward to aturseva.com too (R49 catch: photos 404'd → gray
    // placeholder blocks in the first E2E round).
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/website/')) {
      const upstream = new URL(url.pathname + url.search, UPSTREAM)
      const headers = { Accept: req.headers.get('accept') ?? 'application/json' }
      const method = req.method
      const body = ['GET', 'HEAD'].includes(method) ? undefined : await req.text()
      try {
        const res = await fetch(upstream, { method, headers, body })
        // BINARY-SAFE passthrough (R49 catch #2: reading via .text()
        // round-trips bytes through UTF-8 and corrupts binaries — the
        // curated faces decoded to garbage, every RN-web Image went
        // ERRORED, avatars rendered as empty gray squares. ArrayBuffer
        // passthrough keeps every byte intact for both JSON and JPEG.)
        const buf = await res.arrayBuffer()
        const outHeaders = {
          'content-type': res.headers.get('content-type') ?? 'application/octet-stream',
        }
        if (res.headers.get('content-length')) {
          outHeaders['content-length'] = res.headers.get('content-length')
        }
        return new Response(buf, { status: res.status, headers: outHeaders })
      } catch (e) {
        return new Response(JSON.stringify({ error: 'proxy-fail', detail: String(e) }), {
          status: 502,
          headers: { 'content-type': 'application/json' },
        })
      }
    }
    // Static: dist/ with SPA fallback to index.html
    const filePath = url.pathname === '/' ? '/index.html' : url.pathname
    const file = Bun.file(DIST + filePath.replace(/^\/+/, ''))
    if (await file.exists()) return new Response(file)
    // expo-router web export: nested routes resolve via index.html
    const index = Bun.file(DIST + 'index.html')
    if (await index.exists()) return new Response(index)
    return new Response('not found', { status: 404 })
  },
})
console.log('E2E server on :8090 (dist + /api proxy → aturseva.com)')
