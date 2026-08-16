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

/** Extract the `id` query parameter from a request URL. */
function queryId(url: string | undefined): string {
  try {
    const parsed = new URL(url ?? '/', 'http://dsh.local')
    return (parsed.searchParams.get('id') ?? '').trim()
  } catch {
    return ''
  }
}

/** Workspace-registry access face (read archive set, one-way archive). */
interface WorkspaceRegistryFace {
  archivedSessionIds?: readonly string[]
  archiveSession?(sessionId: string): Promise<void>
}

/**
 * Register the archive routes for one plugin fiber. Fail-soft: when no Web
 * server service exists (headless profile) the routes stay unregistered and
 * the plugin is inert.
 */
export function setupSessionArchive(ctx: Context): void {
  let webRegistered = false
  const registerWebSurface = (): void => {
    if (webRegistered) return
    const webServer = ctx.get(WEB_SERVER_KEYS[0]) ?? ctx.get(WEB_SERVER_KEYS[1])
    if (webServer === undefined) return
    webRegistered = true

    const registry = (): WorkspaceRegistryFace | undefined =>
      ctx.get('workspaceRegistry') as WorkspaceRegistryFace | undefined

    const routes: WebRouteLike[] = [
      {
        kind: 'exact',
        path: `${ARCHIVE_ROUTE_BASE}/archived`,
        handler: async (_req, res) => {
          try {
            json(res, 200, { archivedSessionIds: [...(registry()?.archivedSessionIds ?? [])] })
          } catch (error) {
            json(res, 500, { error: String(error) })
          }
        },
      },
      {
        kind: 'exact',
        path: `${ARCHIVE_ROUTE_BASE}/archive`,
        handler: async (req, res) => {
          const sessionId = queryId(req.url)
          if (sessionId === '') {
            json(res, 400, { error: 'missing or empty "id" query parameter' })
            return
          }
          try {
            const workspace = registry()
            if (workspace?.archiveSession === undefined) {
              json(res, 503, { error: 'workspace registry unavailable' })
              return
            }
            // DSH-native archive: hides the session from the sidebar too.
            // One-way (DSH has no unarchive API), so the UI offers no restore.
            await workspace.archiveSession(sessionId)
            json(res, 200, { ok: true })
          } catch (error) {
            json(res, 500, { error: String(error) })
          }
        },
      },
    ]
    for (const route of routes) {
      ctx.effect(() => (webServer as unknown as WebServerLike).register(route),
        'token-day: session archive route')
    }
  }
  registerWebSurface()
  ctx.on('internal/service', (name: string) => {
    if ((WEB_SERVER_KEYS as readonly string[]).includes(name)) registerWebSurface()
  })
}
