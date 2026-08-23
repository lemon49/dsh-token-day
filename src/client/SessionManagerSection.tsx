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
 * Header written at the top of the exported txt. Each line starts with `#`
 * so scripts can skip them and still read one id per line. It names the two
 * deletion steps but deliberately avoids any machine-specific file path —
 * the DSH home directory differs per machine.
 */
function archiveExportHeader(total: number, withRecord: number, now = new Date()): string {
  const orphan = total - withRecord
  return [
    '# DSH 归档会话 id 导出（供本地删除使用）',
    `# 导出时间：${now.toISOString()}（UTC）`,
    `# 总数：${total} 个会话（有会话记录 ${withRecord} 个，无记录 ${orphan} 个）`,
    '#',
    '# 执行删除时请同时完成两步：',
    '# 1. 有会话记录的 id：删除本地会话文件，并从 DSH 工作区注册表（workspace registry）的 archivedSessionIds 中删除对应 id',
    '# 2. 无记录的 id（仅剩归档标记）：直接从 workspace registry 的 archivedSessionIds 中删除对应 id',
    '#    否则"对话管理"页面会残留无会话记录条目',
    '#',
    '',
  ].join('\n')
}

/**
 * Order archived ids for export: archived sessions that still have a live
 * summary first (newest first), then id-only archive entries (no session
 * record) in archive order. The UI shows only the with-summary subset, but
 * the export includes every id so orphaned registry entries can be cleaned
 * up too — the exported txt matches the archive set one-to-one.
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

  /** Archived sessions with a live summary — what the archive column shows. */
  const archivedVisible = useMemo(
    () => orderArchivedIds(ids, byId, archivedIds ?? []).filter(id => byId[id] !== undefined),
    [ids, byId, archivedIds],
  )

  /** Archived ids that no longer have a session file (orphan registry entries). */
  const orphanCount = useMemo(
    () => Math.max(0, (archivedIds?.length ?? 0) - archivedVisible.length),
    [archivedIds, archivedVisible],
  )

  /**
   * Export every archived session id as a txt file (one id per line). The id
   * list is re-fetched from the Host at export time so it matches the archive
   * registry exactly, never a stale or partial subset of it. Orphaned ids
   * (no session file) are exported too, so the executor can remove them from
   * the workspace registry and avoid "no session record" leftovers.
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
        const withRecord = rows.filter(id => byId[id] !== undefined).length
        const text = rows.length > 0 ? `${archiveExportHeader(rows.length, withRecord)}${rows.join('\n')}\n` : ''
        downloadTextFile(exportFileName(), text)
        setExported(true)
        setTimeout(() => { setExported(false) }, 2000)
      } catch (cause) {
        // Fall back to the clipboard so the ids remain obtainable.
        try {
          const rows = orderArchivedIds(ids, byId, archivedIds ?? [])
          const withRecord = rows.filter(id => byId[id] !== undefined).length
          await navigator.clipboard.writeText(rows.length > 0 ? `${archiveExportHeader(rows.length, withRecord)}${rows.join('\n')}\n` : '')
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
            <span>{t('count', { count: archivedVisible.length })}
              {orphanCount > 0 ? <em className={css.orphanHint}>{t('orphanHint', { count: orphanCount })}</em> : null}
            </span>
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
          {archivedIds === null || archivedVisible.length === 0
            ? <p className={css.status}>
                {archivedIds !== null && archivedIds.length > 0 ? t('emptyArchivedOrphans') : t('emptyArchived')}
              </p>
            : (
              <ul className={css.list}>
                {archivedVisible.map(id => {
                  const summary = byId[id]
                  if (summary === undefined) return null
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
