/**
 * Conversation manager settings page: a two-column read-only view of every
 * DSH session (title, session id, last-updated timestamp) with copy-id and
 * export-archived-ids actions.
 *
 * The session list comes from the standard `useSessions` store. The archive
 * column is read-only: it merges the plugin's legacy archive set with the DSH
 * native archive set (workspace registry), served by
 * GET /plugins/dsh-token-day/archived. Archiving/deleting sessions is left to
 * DSH itself; this page only displays and lets the user copy/export ids.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SessionSummary } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { MANAGER_NS } from './locales.ts'
import css from './SessionManagerSection.module.css'

/** Full props assembled by the root-scoped Settings section renderer. */
export type SessionManagerSectionProps = PropsRuntime<'settings.section'>
  & PropsLocale<typeof MANAGER_NS>

/** Route prefix served by the Host half of this plugin. */
const ARCHIVE_BASE = '/plugins/dsh-token-day'

/** Fetch the merged archive set (plugin legacy ∪ DSH native) from the Host. */
async function fetchArchivedIds(): Promise<string[]> {
  const res = await fetch(`${ARCHIVE_BASE}/archived`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: unknown = await res.json()
  if (typeof data !== 'object' || data === null) throw new Error('unexpected archive response')
  const archived = (data as { archivedSessionIds?: unknown }).archivedSessionIds
  if (!Array.isArray(archived) || archived.some(id => typeof id !== 'string')) {
    throw new Error('unexpected archive response')
  }
  return archived as string[]
}

/** Archive one session through the DSH-native Host route (one-way, hides from sidebar). */
async function mutateArchive(sessionId: string): Promise<void> {
  const res = await fetch(`${ARCHIVE_BASE}/archive?id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const data: unknown = await res.json()
      if (typeof data === 'object' && data !== null
        && typeof (data as { error?: unknown }).error === 'string') {
        message = (data as { error: string }).error
      }
    } catch {
      // Keep the HTTP status message when the body is not JSON.
    }
    throw new Error(message)
  }
}

/** Format an epoch-millis timestamp as YYYY/M/D HH:mm:ss in local time. */
function formatTime(value: number): string {
  const date = new Date(value)
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} `
    + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** One conversation row: title (+subagent tag), session id (with copy), timestamp, optional archive action. */
function SessionRow({
  summary,
  subagent,
  busy,
  actionLabel,
  onAction,
  t,
}: {
  summary: SessionSummary
  subagent: boolean
  busy: boolean
  actionLabel?: string
  onAction?(): void
  t: SessionManagerSectionProps['t']
}): ReactNode {
  const [copied, setCopied] = useState(false)
  const copyId = (): void => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(summary.id)
        setCopied(true)
        setTimeout(() => { setCopied(false) }, 1500)
      } catch {
        // Clipboard may be unavailable (permissions/iframe); the id stays selectable as a fallback.
      }
    })()
  }
  return (
    <li className={css.row}>
      <div className={css.rowMain}>
        <div className={css.rowTitleLine}>
          <strong className={css.rowTitle} title={summary.displayTitle}>{summary.displayTitle}</strong>
          {subagent ? <span className={css.subagentTag}>{t('subagent')}</span> : null}
        </div>
        <div className={css.rowIdLine}>
          <span className={css.rowMeta} title={summary.id}>{t('sessionIdLabel')}={summary.id}</span>
          <button
            type="button"
            className={css.copyButton}
            onClick={copyId}
            title={copied ? t('copied') : t('copyId')}
          >{copied ? t('copied') : t('copyId')}</button>
        </div>
        <span className={css.rowTime}>{formatTime(summary.updatedAt)}</span>
      </div>
      {actionLabel !== undefined && onAction !== undefined ? (
        <button
          type="button"
          className={css.action}
          disabled={busy}
          onClick={onAction}
        >{actionLabel}</button>
      ) : null}
    </li>
  )
}

/** Render the conversation manager with live and archived session columns. */
export function SessionManagerSection({
  useSessions,
  t,
}: SessionManagerSectionProps): ReactNode {
  const phase = useSessions(state => state.phase)
  const ids = useSessions(state => state.ids)
  const byId = useSessions(state => state.byId)
  const [archivedIds, setArchivedIds] = useState<readonly string[] | null>(null)
  const [error, setError] = useState<string>()
  const [busyId, setBusyId] = useState<string>()
  const [exported, setExported] = useState(false)

  const loadArchived = async (): Promise<void> => {
    try {
      const fetched = await fetchArchivedIds()
      setArchivedIds(fetched)
      setError(undefined)
    } catch (cause) {
      setError(t('loadFailed', { message: String(cause) }))
    }
  }

  useEffect(() => {
    void loadArchived()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-time load only
  }, [])

  /** Archive one session through the DSH-native route (one-way, hides from sidebar). */
  const runArchive = async (sessionId: string): Promise<void> => {
    setBusyId(sessionId)
    setError(undefined)
    try {
      await mutateArchive(sessionId)
      setArchivedIds(current => {
        if (current === null) return current
        return current.includes(sessionId) ? current : [...current, sessionId]
      })
    } catch (cause) {
      setError(t('opFailed', { message: String(cause) }))
    } finally {
      setBusyId(undefined)
    }
  }

  const groups = useMemo(() => {
    const archived = new Set(archivedIds ?? [])
    const active: SessionSummary[] = []
    const archivedList: SessionSummary[] = []
    const sorted = ids
      .map(id => byId[id])
      .filter((summary): summary is SessionSummary => summary !== undefined)
      .sort((left, right) => right.updatedAt - left.updatedAt)
    for (const summary of sorted) {
      if (archived.has(summary.id)) archivedList.push(summary)
      else active.push(summary)
    }
    return { active, archived: archivedList }
  }, [ids, byId, archivedIds])

  /** Export every archived session id as newline-separated text for local deletion. */
  const exportArchivedIds = (): void => {
    void (async () => {
      try {
        const list = groups.archived.map(summary => summary.id).join('\n')
        await navigator.clipboard.writeText(list)
        setExported(true)
        setTimeout(() => { setExported(false) }, 1500)
      } catch {
        // Clipboard unavailable; ids remain individually copyable.
      }
    })()
  }

  if (phase !== 'ready' && ids.length === 0) {
    return <p className={css.status}>{t('loading')}</p>
  }

  return (
    <section className={css.section}>
      <header className={css.header}>
        <div>
          <h2>{t('title')}</h2>
          <p>{t('intro')}</p>
        </div>
        <button type="button" className={css.refresh} onClick={() => { void loadArchived() }}>
          {t('refresh')}
        </button>
      </header>

      {error !== undefined ? <div className={css.error}>{error}</div> : null}

      <div className={css.columns}>
        <div className={css.column}>
          <div className={css.columnHead}>
            <h3>{t('conversations')}</h3>
            <span>{t('count', { count: groups.active.length })}</span>
          </div>
          {groups.active.length === 0 ? <p className={css.status}>{t('emptyConversations')}</p> : (
            <ul className={css.list}>
              {groups.active.map(summary => {
                const subagent = summary.origin === 'subagent'
                return (
                  <SessionRow
                    key={summary.id}
                    summary={summary}
                    subagent={subagent}
                    busy={busyId === summary.id}
                    // Subagent sessions are hidden from the DSH sidebar, so they
                    // need an archive entry point here; ordinary sessions archive
                    // through the DSH UI.
                    actionLabel={subagent ? t('archive') : undefined}
                    onAction={subagent ? () => { void runArchive(summary.id) } : undefined}
                    t={t}
                  />
                )
              })}
            </ul>
          )}
        </div>

        <div className={css.column}>
          <div className={css.columnHead}>
            <h3>{t('archived')}</h3>
            <span>{t('count', { count: groups.archived.length })}</span>
            {groups.archived.length > 0 ? (
              <button
                type="button"
                className={css.exportButton}
                onClick={exportArchivedIds}
                title={t('copyAllIdsTitle')}
              >{exported ? t('copied') : t('copyAllIds')}</button>
            ) : null}
          </div>
          {groups.archived.length === 0 ? <p className={css.status}>{t('emptyArchived')}</p> : (
            <ul className={css.list}>
              {groups.archived.map(summary => (
                <SessionRow
                  key={summary.id}
                  summary={summary}
                  subagent={summary.origin === 'subagent'}
                  busy={false}
                  t={t}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
