/**
 * Session archive viewer for the conversation manager.
 *
 * Read-only: serves the DSH native archive set (workspace registry
 * `archivedSessionIds`) through GET /plugins/dsh-token-day/archived, so the
 * settings page can render which sessions are archived. No storage domain is
 * involved — the endpoint always answers once the Web server binds, and
 * archiving/deleting sessions stays with DSH itself.
 */

import type { Context } from '@deepseek-ai/cordis'

/** Route prefix under which the archive endpoint is served. */
export const ARCHIVE_ROUTE_BASE = '/plugins/dsh-token-day'

interface HttpRequestLike {
  url?: string
}

interface HttpResponseLike {
  writeHead(status: number, headers: Record<string, string>): void
  end(body?: string): void
}

interface WebRouteLike {
  kind: 'exact' | 'prefix'
  path: string
  handler(req: HttpRequestLike, res: HttpResponseLike): void | Promise<void>
}

interface WebServerLike {
  register(route: WebRouteLike): () => void
}

/** Write one JSON response with no-store caching. */
function json(res: HttpResponseLike, status: number, body: unknown): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

const WEB_SERVER_KEYS = ['webServer', 'httpServer'] as const

/**
 * Register the read-only archive route for one plugin fiber. Fail-soft: when
 * no Web server service exists (headless profile) the route stays unregistered
 * and the plugin is inert.
 */
export function setupSessionArchive(ctx: Context): void {
  let webRegistered = false
  const registerWebSurface = (): void => {
    if (webRegistered) return
    const webServer = ctx.get(WEB_SERVER_KEYS[0]) ?? ctx.get(WEB_SERVER_KEYS[1])
    if (webServer === undefined) return
    webRegistered = true
    ctx.effect(() => (webServer as unknown as WebServerLike).register({
      kind: 'exact',
      path: `${ARCHIVE_ROUTE_BASE}/archived`,
      handler: async (_req, res) => {
        try {
          const registry = ctx.get('workspaceRegistry') as { archivedSessionIds?: readonly string[] } | undefined
          json(res, 200, { archivedSessionIds: [...(registry?.archivedSessionIds ?? [])] })
        } catch (error) {
          json(res, 500, { error: String(error) })
        }
      },
    }), 'token-day: session archive route')
  }
  registerWebSurface()
  ctx.on('internal/service', (name: string) => {
    if ((WEB_SERVER_KEYS as readonly string[]).includes(name)) registerWebSurface()
  })
}
