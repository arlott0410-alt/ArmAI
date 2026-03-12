/**
 * Cache API helpers for GET responses. TTL 1h, stale-while-revalidate via Cache-Control.
 */
const CACHE_TTL_SEC = 3600
const STALE_WHILE_REVALIDATE_SEC = 300

export function cacheControlHeaders(): Record<string, string> {
  return {
    'Cache-Control': `public, max-age=${CACHE_TTL_SEC}, s-maxage=${CACHE_TTL_SEC}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SEC}`,
  }
}

/**
 * Try to get a cached response for the given request URL.
 * Returns the cached Response or null if miss.
 */
export async function getCachedResponse(requestUrl: string): Promise<Response | null> {
  try {
    const cache = caches.default as Cache
    const req = new Request(requestUrl, { method: 'GET' })
    const cached = await cache.match(req)
    return cached ?? null
  } catch {
    return null
  }
}

/**
 * Store a response in the cache. Clones the response and adds Cache-Control.
 * Does not await in the critical path if you want fire-and-forget.
 */
export async function setCachedResponse(
  requestUrl: string,
  response: Response,
  ttlSec: number = CACHE_TTL_SEC
): Promise<void> {
  try {
    const cache = caches.default as Cache
    const req = new Request(requestUrl, { method: 'GET' })
    const headers = new Headers(response.headers)
    headers.set(
      'Cache-Control',
      `public, max-age=${ttlSec}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SEC}`
    )
    const toCache = new Response(response.body, { status: response.status, headers })
    await cache.put(req, toCache)
  } catch {
    // ignore cache write errors
  }
}
