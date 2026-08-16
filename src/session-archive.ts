/**
 * Durable session-archive management for the conversation manager.
 *
 * The DSH workspace registry exposes `archiveSession` but no unarchive, so the
 * conversation manager owns its own archive set in a private storage domain
 * (`dsh-token-day-session-archive`). Three Web routes expose the set:
 *
 *  - GET /plugins/dsh-token-day/archived  -> { archivedSessionIds: string[] }
 *  - GET /plugins/dsh-token-day/archive?id=...   -> { ok: true }
 *  - GET /plugins/dsh-token-day/restore?id=...   -> { ok: true }
 *
 * Routes are registered lazily once the Web server service binds, mirroring
 * the dsh-token-panel pattern; headless profiles keep the plugin inert.
 */

import { z } from 'zod'
import type { Context } from '@deepseek-ai/cordis'

/** Route prefix under which the archive endpoints are served. */
export const ARCHIVE_ROUTE_BASE = '/plugins/dsh-token-day'

/** Durable domain name owning the archive set. */
const ARCHIVE_DOMAIN = 'dsh-token-day-session-archive'

/**
 * Minimal structural types for the storage-domain and web-server services.
 * Kept local so the bundle needs no additional @deepseek-ai package dependency.
 */

interface ArchiveState {
  archivedSessionIds: string[]
}

interface ArchiveDomainGlobal {
  get(): ArchiveState
  set(value: ArchiveState): Promise<void>
}

interface ArchiveDomainHandle {
  readonly name: string
  readonly global: ArchiveDomainGlobal
  close(): Promise<void>
}

interface StorageDomainLike {
  open(spec: {
    name: string
    version: number
    global: {
      schema: { safeParse(input: unknown): { success: boolean } }
      initial: ArchiveState
    }
    tables: Record<string, unknown>
  }): Promise<ArchiveDomainHandle>
}

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

/** Durable boundary schema for the archive set (zod is already a dependency). */
const archiveStateSchema = z.object({
  archivedSessionIds: z.array(z.string()).default([]),
}).strict()

/** The private domain spec: one global singleton, no tables. */
const archiveDomainSpec = {
  name: ARCHIVE_DOMAIN,
  version: 1,
  global: {
    schema: archiveStateSchema,
    initial: { archivedSessionIds: [] as string[] },
  },
  tables: {},
}

/** Archive operations exposed to the Web routes. */
export interface SessionArchiveApi {
  archivedIds(): readonly string[]
  archive(sessionId: string): Promise<void>
  restore(sessionId: string): Promise<void>
}

/** Open the archive domain and build the serialized read/write facade. */
async function createSessionArchive(storageDomain: StorageDomainLike): Promise<{
  api: SessionArchiveApi
  dispose: () => Promise<void>
}> {
  const domain = await storageDomain.open(archiveDomainSpec)
  let closed = false
  const dispose = async (): Promise<void> => {
    if (closed) return
    closed = true
    await domain.close()
  }

  // Domain writes queue on their own chain, but each handler performs a
  // read-modify-write; a local tail serializes whole operations so concurrent
  // requests can never lose an update.
  let tail: Promise<void> = Promise.resolve()
  const enqueue = (operation: () => Promise<void>): Promise<void> => {
    const run = tail.then(operation, operation)
    tail = run.then(() => {}, () => {})
    return run
  }

  const api: SessionArchiveApi = {
    archivedIds(): readonly string[] {
      return domain.global.get().archivedSessionIds
    },
    archive(sessionId: string): Promise<void> {
      return enqueue(async () => {
        const state = domain.global.get()
        if (state.archivedSessionIds.includes(sessionId)) return
        await domain.global.set({
          ...state,
          archivedSessionIds: [...state.archivedSessionIds, sessionId],
        })
      })
    },
    restore(sessionId: string): Promise<void> {
      return enqueue(async () => {
        const state = domain.global.get()
        if (!state.archivedSessionIds.includes(sessionId)) return
        await domain.global.set({
          ...state,
          archivedSessionIds: state.archivedSessionIds.filter(id => id !== sessionId),
        })
      })
    },
  }

  return { api, dispose }
}

/** Write one JSON response with no-store caching. */
function json(res: HttpResponseLike, status: number, body: unknown): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

/** Extract the `id` query parameter from a request URL. */
function queryId(url: string | undefined): string {
  try {
    const parsed = new URL(url ?? '/', 'http://dsh.local')
    return (parsed.searchParams.get('id') ?? '').trim()
  } catch {
    return ''
  }
}

/** Build the three archive routes against a lazily-resolving API holder. */
function archiveRoutes(api: () => SessionArchiveApi | undefined): WebRouteLike[] {
  const notReady = (res: HttpResponseLike): void => {
    json(res, 503, { error: 'session archive store is not ready' })
  }
  return [
    {
      kind: 'exact',
      path: `${ARCHIVE_ROUTE_BASE}/archived`,
      handler: async (_req, res) => {
        const current = api()
        if (current === undefined) {
          notReady(res)
          return
        }
        try {
          json(res, 200, { archivedSessionIds: [...current.archivedIds()] })
        } catch (error) {
          json(res, 500, { error: String(error) })
        }
      },
    },
    {
      kind: 'exact',
      path: `${ARCHIVE_ROUTE_BASE}/archive`,
      handler: async (req, res) => {
        const current = api()
        if (current === undefined) {
          notReady(res)
          return
        }
        const sessionId = queryId(req.url)
        if (sessionId === '') {
          json(res, 400, { error: 'missing or empty "id" query parameter' })
          return
        }
        try {
          await current.archive(sessionId)
          json(res, 200, { ok: true })
        } catch (error) {
          json(res, 500, { error: String(error) })
        }
      },
    },
    {
      kind: 'exact',
      path: `${ARCHIVE_ROUTE_BASE}/restore`,
      handler: async (req, res) => {
        const current = api()
        if (current === undefined) {
          notReady(res)
          return
        }
        const sessionId = queryId(req.url)
        if (sessionId === '') {
          json(res, 400, { error: 'missing or empty "id" query parameter' })
          return
        }
        try {
          await current.restore(sessionId)
          json(res, 200, { ok: true })
        } catch (error) {
          json(res, 500, { error: String(error) })
        }
      },
    },
  ]
}

const WEB_SERVER_KEYS = ['webServer', 'httpServer'] as const

/**
 * Set up the durable archive domain and its Web routes for one plugin fiber.
 * Fail-soft: without a storage-domain or Web server service the feature stays
 * inert instead of breaking the plugin.
 */
export function setupSessionArchive(ctx: Context): void {
  const storageDomain = ctx.get('storageDomain')
  if (storageDomain === undefined) return

  let api: SessionArchiveApi | undefined
  let disposeDomain: (() => Promise<void>) | undefined
  const opened = (async () => {
    try {
      const created = await createSessionArchive(storageDomain as unknown as StorageDomainLike)
      api = created.api
      disposeDomain = created.dispose
    } catch (error) {
      ctx.logger.warn(`token day: session archive domain failed to open: ${String(error)}`)
    }
  })()

  ctx.effect(() => async () => {
    await opened.catch(() => {})
    if (disposeDomain !== undefined) await disposeDomain()
  }, 'token-day: session archive domain')

  let webRegistered = false
  const registerWebSurface = (): void => {
    if (webRegistered) return
    const webServer = ctx.get(WEB_SERVER_KEYS[0]) ?? ctx.get(WEB_SERVER_KEYS[1])
    if (webServer === undefined) return
    webRegistered = true
    const routes = archiveRoutes(() => api)
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
