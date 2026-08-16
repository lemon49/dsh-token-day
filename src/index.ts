/** Host projection and history warm-up for persistent Token billing records. */

import type { Context } from '@deepseek-ai/cordis'
import type { SessionRecord } from '@deepseek-ai/dsh-session-query'
import type {} from '@deepseek-ai/dsh-session-persistence'
import type {} from '@deepseek-ai/dsh-session-projection-cache'
import { tokenDayProjectionDefinition } from './projection.ts'
import { setupSessionArchive } from './session-archive.ts'

/** Cordis plugin name. */
export const name = 'token-day-recorder'

/** Host services required for core projection registration and historical replay. */
export const inject = [
  'sessionProjections',
  'sessionProjectionCache',
  'sessionQuery',
  'sessions',
]

/** Refresh one readable session without letting an operational failure stop later records or leave an attach race stale. */
async function warmRecord(ctx: Context, record: SessionRecord, signal: AbortSignal): Promise<void> {
  try {
    const live = ctx.sessions.get(record.header.id)
    if (live !== undefined) {
      await ctx.sessionProjectionCache.write(live)
    } else if (record.persisted) {
      await ctx.sessionProjectionCache.coldSnapshot(record.header.id, signal)
      if (signal.aborted) return
      const attached = ctx.sessions.get(record.header.id)
      if (attached !== undefined) await ctx.sessionProjectionCache.write(attached)
    }
  } catch (error) {
    if (signal.aborted) return
    ctx.logger.warn(`token day: failed to refresh session "${record.header.id}": ${String(error)}`)
  }
}

/** Populate the new projection's cache sequentially without delaying plugin activation. */
async function warmHistory(ctx: Context, signal: AbortSignal): Promise<void> {
  let records: SessionRecord[]
  try {
    records = await ctx.sessionQuery.listSessions(signal)
  } catch (error) {
    if (signal.aborted) return
    ctx.logger.warn(`token day: failed to list historical sessions: ${String(error)}`)
    return
  }

  for (const record of records) {
    if (signal.aborted) return
    await warmRecord(ctx, record, signal)
  }
}

/** Register the projection, start cancellable fail-soft history warming, and set up the session archive. */
export function apply(ctx: Context): void {
  ctx.sessionProjections.register(tokenDayProjectionDefinition)
  ctx.effect(() => {
    const controller = new AbortController()
    const operation = warmHistory(ctx, controller.signal)
    return async () => {
      controller.abort(new Error('token day plugin disposed'))
      await operation
    }
  }, 'token day: warm historical projections')
  setupSessionArchive(ctx)
}
