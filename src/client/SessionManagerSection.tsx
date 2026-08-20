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

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { SessionId, SessionSummary } from '@deepseek-ai/dsh-client-runtime/client'
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

/** Download a plain-text file through a temporary anchor element. */
function downloadTextFile(fileName: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Revoke only after the download had a chance to start.
  setTimeout(() => { URL.revokeObjectURL(url) }, 1000)
}

/** Timestamped export file name, e.g. dsh-archived-sessions-20260816-234230.txt. */
function exportFileName(date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0')
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
    + `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  return `dsh-archived-sessions-${stamp}.txt`
}

/**
 * Order archived ids for display and export exactly alike ("what you see is
 * what you export"): archived sessions that still have a live summary first,
 * newest first, then id-only archive entries (no session record) in archive
 * order. Exporting this exact list guarantees the txt file matches the
 * archive set one-to-one, so deleting from it never misses or mis-targets.
 */
function orderArchivedIds(
  ids: readonly SessionId[],
  byId: Record<SessionId, SessionSummary | undefined>,
  archivedIds: readonly string[],
): SessionId[] {
  const archived = new Set(archivedIds)
  const withSummary = ids
    .filter(id => archived.has(id))
    .map(id => byId[id])
    .filter((summary): summary is SessionSummary => summary !== undefined)
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .map(summary => summary.id)
  const withoutSummary = archivedIds.filter(id => byId[id as SessionId] === undefined) as SessionId[]
  return [...withSummary, ...withoutSummary]
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

/** One archive row whose session summary is no longer available (id still copyable). */
function PlaceholderRow({
  sessionId,
  t,
}: {
  sessionId: string
  t: SessionManagerSectionProps['t']
}): ReactNode {
  const [copied, setCopied] = useState(false)
  const copyId = (): void => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(sessionId)
        setCopied(true)
        setTimeout(() => { setCopied(false) }, 1500)
      } catch {
        // Clipboard may be unavailable (permissions/iframe); the id stays selectable as a fallback.
      }
    })()
  }
  return (
    <li className={`${css.row} ${css.rowPlaceholder}`}>
      <div className={css.rowMain}>
        <div className={css.rowTitleLine}>
          <span className={css.rowPlaceholderText}>{t('noRecord')}</span>
        </div>
        <div className={css.rowIdLine}>
          <span className={css.rowMeta} title={sessionId}>{t('sessionIdLabel')}={sessionId}</span>
          <button
            type="button"
            className={css.copyButton}
            onClick={copyId}
            title={copied ? t('copied') : t('copyId')}
          >{copied ? t('copied') : t('copyId')}</button>
        </div>
      </div>
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
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)
  // Guards against double-clicks / repeated clicks firing a second download
  // before React re-renders (state updates are async).
  const exportingRef = useRef(false)

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

  /** Active (non-archived) sessions, newest first. */
  const active = useMemo(() => {
    const archived = new Set(archivedIds ?? [])
    return ids
      .map(id => byId[id])
      .filter((summary): summary is SessionSummary => summary !== undefined)
      .filter(summary => !archived.has(summary.id))
      .sort((left, right) => right.updatedAt - left.updatedAt)
  }, [ids, byId, archivedIds])

  /** Archived ids in display order — exactly what the export txt contains. */
  const archivedOrder = useMemo(
    () => orderArchivedIds(ids, byId, archivedIds ?? []),
    [ids, byId, archivedIds],
  )

  /**
   * Export every archived session id as a txt file (one id per line). The id
   * list is re-fetched from the Host at export time so it matches the archive
   * registry exactly, never a stale or partial subset of it.
   */
  const exportArchivedIds = (): void => {
    if (exportingRef.current) return
    exportingRef.current = true
    void (async () => {
      setExporting(true)
      setError(undefined)
      try {
        const fresh = await fetchArchivedIds()
        setArchivedIds(fresh)
        const rows = orderArchivedIds(ids, byId, fresh)
        const text = rows.length > 0 ? `${rows.join('\n')}\n` : ''
        downloadTextFile(exportFileName(), text)
        setExported(true)
        setTimeout(() => { setExported(false) }, 2000)
      } catch (cause) {
        // Fall back to the clipboard so the ids remain obtainable.
        try {
          const rows = orderArchivedIds(ids, byId, archivedIds ?? [])
          await navigator.clipboard.writeText(rows.join('\n'))
          setExported(true)
          setTimeout(() => { setExported(false) }, 2000)
        } catch (clipCause) {
          setError(t('exportFailed', { message: String(clipCause) }))
        }
      } finally {
        exportingRef.current = false
        setExporting(false)
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
            <span>{t('count', { count: active.length })}</span>
          </div>
          {active.length === 0 ? <p className={css.status}>{t('emptyConversations')}</p> : (
            <ul className={css.list}>
              {active.map(summary => {
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
            <span>{t('count', { count: archivedIds?.length ?? 0 })}</span>
            {archivedIds !== null && archivedIds.length > 0 ? (
              <button
                type="button"
                className={css.exportButton}
                disabled={exporting || exported}
                onClick={exportArchivedIds}
                title={t('exportAllIdsTitle')}
              >{exporting ? t('exporting') : exported ? t('exported') : t('exportAllIds')}</button>
            ) : null}
          </div>
          {archivedIds === null || archivedIds.length === 0
            ? <p className={css.status}>{t('emptyArchived')}</p>
            : (
              <ul className={css.list}>
                {archivedOrder.map(id => {
                  const summary = byId[id]
                  if (summary === undefined) {
                    return <PlaceholderRow key={id} sessionId={id} t={t} />
                  }
                  return (
                    <SessionRow
                      key={summary.id}
                      summary={summary}
                      subagent={summary.origin === 'subagent'}
                      busy={false}
                      t={t}
                    />
                  )
                })}
              </ul>
            )}
        </div>
      </div>
    </section>
  )
}
