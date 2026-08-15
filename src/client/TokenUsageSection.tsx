import { useMemo, useState, type ReactNode } from 'react'
import type { SessionSummary } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  DailyTokenUsageRecord,
  ModelTokenUsageRecord,
  TokenDayProjection,
  TokenUsageBuckets,
} from '../types.ts'
import { NS } from './locales.ts'
import css from './TokenUsageSection.module.css'

/** Full props assembled by the root-scoped Settings section renderer. */
export type TokenUsageSectionProps = PropsRuntime<'settings.section'>
  & PropsLocale<typeof NS>

/** Preset trailing-window sizes in UTC days. */
type PresetDays = 1 | 3 | 7 | 30 | 90

/** Selected date range: a preset trailing window or an explicit custom span. */
type RangeSelection =
  | { kind: 'preset'; days: PresetDays }
  | { kind: 'custom'; start: string; end: string }

interface SessionUsageRow {
  id: string
  assistantRequests: number
  compactionRequests: number
  billedRequests: number
  usage: TokenUsageBuckets
  models: readonly ModelTokenUsageRecord[]
  days: readonly DailyTokenUsageRecord[]
}

interface DashboardData {
  usage: TokenUsageBuckets
  assistantRequests: number
  compactionRequests: number
  billedRequests: number
  models: ModelTokenUsageRecord[]
  days: DailyTokenUsageRecord[]
}

/** Detached zero buckets for dashboard folds. */
function zeroBuckets(): TokenUsageBuckets {
  return {
    uncachedInputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  }
}

/** Add four disjoint token buckets. */
function addBuckets(left: TokenUsageBuckets, right: TokenUsageBuckets): TokenUsageBuckets {
  return {
    uncachedInputTokens: left.uncachedInputTokens + right.uncachedInputTokens,
    outputTokens: left.outputTokens + right.outputTokens,
    cacheReadTokens: left.cacheReadTokens + right.cacheReadTokens,
    cacheWriteTokens: left.cacheWriteTokens + right.cacheWriteTokens,
  }
}

/** Stable UTC day key used by durable Host records. */
function dayKey(time: number): string {
  return new Date(time).toISOString().slice(0, 10)
}

/** Prompt-side total across uncached input and cache traffic. */
export function inputTokens(usage: TokenUsageBuckets): number {
  return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens
}

/** Complete request/response total without double-counting reasoning output. */
export function totalTokens(usage: TokenUsageBuckets): number {
  return inputTokens(usage) + usage.outputTokens
}

/** Locale-aware exact integer formatting. */
function formatTokens(value: number): string {
  return new Intl.NumberFormat().format(value)
}

/** Format a ratio without implying fractional measurement precision. */
function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

/** Compact a token count with a stable K/M/B suffix for dense dashboard cells. */
function formatCompactTokens(value: number): string {
  const unit = [
    { divisor: 1_000_000_000, suffix: 'B' },
    { divisor: 1_000_000, suffix: 'M' },
    { divisor: 1_000, suffix: 'K' },
  ].find(candidate => value >= candidate.divisor)
  if (unit === undefined) return formatTokens(value)
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value / unit.divisor)}${unit.suffix}`
}

/** Stable provider/model identity for React lists and aggregation. */
function modelKey(model: Pick<ModelTokenUsageRecord, 'provider' | 'model'>): string {
  return JSON.stringify([model.provider, model.model])
}

/** Whether a dashboard-only row contains usage whose model route is unavailable. */
function isUnattributed(model: ModelTokenUsageRecord): boolean {
  return model.provider === '' && model.model === ''
}

/** Total request attempts recorded for one route. */
function recordedRequests(model: ModelTokenUsageRecord): number {
  return model.assistantRequests + model.compactionRequests
}

/** One session summary projected into a usage row, or null when it has no usage. */
function sessionRow(summary: SessionSummary): SessionUsageRow | null {
  const recorded: TokenDayProjection | undefined = summary.projectionValues?.tokenDay
  if (recorded === undefined) return null
  const usage = recorded.usage
  if (totalTokens(usage) === 0
    && recorded.assistantRequests === 0
    && recorded.compactionRequests === 0) return null
  return {
    id: summary.id,
    assistantRequests: recorded.assistantRequests,
    compactionRequests: recorded.compactionRequests,
    billedRequests: recorded.billedRequests,
    usage: { ...usage },
    models: recorded.models,
    days: recorded.days,
  }
}

/** Merge one model day entry into a map, returning the updated entry. */
function mergeModelDay(
  map: Map<string, ModelTokenUsageRecord['days'][number]>,
  day: ModelTokenUsageRecord['days'][number],
): void {
  const current = map.get(day.date)
  map.set(day.date, current === undefined
    ? day
    : {
      date: day.date,
      requests: {
        assistant: current.requests.assistant + day.requests.assistant,
        compaction: current.requests.compaction + day.requests.compaction,
        billed: current.requests.billed + day.requests.billed,
      },
      usage: addBuckets(current.usage, day.usage),
    })
}

/** Aggregate session summaries into totals and provider/model records. */
export function aggregateUsage(summaries: readonly SessionSummary[]): DashboardData {
  const models = new Map<string, ModelTokenUsageRecord>()
  const days = new Map<string, DailyTokenUsageRecord>()
  let usage = zeroBuckets()
  let assistantRequests = 0
  let compactionRequests = 0
  let billedRequests = 0

  for (const summary of summaries) {
    const row = sessionRow(summary)
    if (row === null) continue
    usage = addBuckets(usage, row.usage)
    assistantRequests += row.assistantRequests
    compactionRequests += row.compactionRequests
    billedRequests += row.billedRequests
    for (const day of row.days) {
      const current = days.get(day.date)
      days.set(day.date, current === undefined
        ? { date: day.date, requests: { ...day.requests }, usage: { ...day.usage } }
        : {
          date: day.date,
          requests: {
            assistant: current.requests.assistant + day.requests.assistant,
            compaction: current.requests.compaction + day.requests.compaction,
            billed: current.requests.billed + day.requests.billed,
          },
          usage: addBuckets(current.usage, day.usage),
        })
    }
    for (const model of row.models) {
      const key = modelKey(model)
      const current = models.get(key)
      if (current === undefined) {
        models.set(key, { ...model, usage: { ...model.usage }, days: [...model.days] })
        continue
      }
      const mergedDays = new Map(current.days.map(day => [day.date, day]))
      for (const day of model.days) mergeModelDay(mergedDays, day)
      models.set(key, {
        ...current,
        assistantRequests: current.assistantRequests + model.assistantRequests,
        compactionRequests: current.compactionRequests + model.compactionRequests,
        billedRequests: current.billedRequests + model.billedRequests,
        usage: addBuckets(current.usage, model.usage),
        days: [...mergedDays.values()].sort((left, right) => left.date.localeCompare(right.date)),
      })
    }
  }

  return {
    usage,
    assistantRequests,
    compactionRequests,
    billedRequests,
    models: [...models.values()].sort((left, right) =>
      totalTokens(right.usage) - totalTokens(left.usage)
      || left.provider.localeCompare(right.provider)
      || left.model.localeCompare(right.model)),
    days: [...days.values()].sort((left, right) => left.date.localeCompare(right.date)),
  }
}

/** Build a newest-inclusive UTC date range of `length` days. */
function datesEndingOn(now: number, length: number): string[] {
  const end = new Date(`${dayKey(now)}T00:00:00.000Z`)
  end.setUTCDate(end.getUTCDate() - length + 1)
  const dates: string[] = []
  for (let offset = 0; offset < length; offset += 1) {
    const date = new Date(end)
    date.setUTCDate(date.getUTCDate() + offset)
    dates.push(dayKey(date.getTime()))
  }
  return dates
}

/** Build an inclusive UTC date span, oldest first; empty when invalid. */
function datesBetween(startIso: string, endIso: string): string[] {
  const start = new Date(`${startIso}T00:00:00.000Z`)
  const end = new Date(`${endIso}T00:00:00.000Z`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return []
  const dates: string[] = []
  for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    dates.push(dayKey(cursor.getTime()))
  }
  return dates
}

/** Expand the active selection into an ordered date list, oldest first. */
function datesInRange(selection: RangeSelection, now = Date.now()): string[] {
  return selection.kind === 'preset'
    ? datesEndingOn(now, selection.days)
    : datesBetween(selection.start, selection.end)
}

/** Default custom-range draft: the trailing 7 days. */
function defaultCustomDraft(now = Date.now()): { start: string; end: string } {
  const end = dayKey(now)
  const start = new Date(`${end}T00:00:00.000Z`)
  start.setUTCDate(start.getUTCDate() - 6)
  return { start: dayKey(start.getTime()), end }
}

/** Human label for the active selection. */
function rangeLabelOf(selection: RangeSelection, t: TokenUsageSectionProps['t']): string {
  if (selection.kind === 'custom') return t('customRange')
  if (selection.days === 1) return t('today')
  if (selection.days === 3) return t('day3')
  return t('rangeDays', { count: selection.days })
}

/** Aggregate one fixed UTC date range from a daily lookup. */
function rangeAggregate(days: readonly DailyTokenUsageRecord[], dates: readonly string[]): {
  requests: number
  billed: number
  usage: TokenUsageBuckets
  activeDays: number
  records: DailyTokenUsageRecord[]
} {
  const byDate = new Map(days.map(day => [day.date, day]))
  let requests = 0
  let billed = 0
  let usage = zeroBuckets()
  let activeDays = 0
  const records: DailyTokenUsageRecord[] = []
  for (const date of dates) {
    const day = byDate.get(date)
    if (day === undefined) continue
    const dayRequests = day.requests.assistant + day.requests.compaction
    requests += dayRequests
    billed += day.requests.billed
    usage = addBuckets(usage, day.usage)
    if (dayRequests > 0 || totalTokens(day.usage) > 0) activeDays += 1
    records.push(day)
  }
  return { requests, billed, usage, activeDays, records }
}

/** Aggregate model routes scoped to one UTC date span. */
function rangeModels(models: readonly ModelTokenUsageRecord[], dateSet: ReadonlySet<string>): ModelTokenUsageRecord[] {
  const result: ModelTokenUsageRecord[] = []
  for (const model of models) {
    let assistant = 0
    let compaction = 0
    let billed = 0
    let usage = zeroBuckets()
    let hasAny = false
    for (const day of model.days) {
      if (!dateSet.has(day.date)) continue
      hasAny = true
      assistant += day.requests.assistant
      compaction += day.requests.compaction
      billed += day.requests.billed
      usage = addBuckets(usage, day.usage)
    }
    if (!hasAny) continue
    result.push({
      provider: model.provider,
      model: model.model,
      assistantRequests: assistant,
      compactionRequests: compaction,
      billedRequests: billed,
      usage,
      days: [],
    })
  }
  return result.sort((left, right) =>
    totalTokens(right.usage) - totalTokens(left.usage)
    || left.provider.localeCompare(right.provider)
    || left.model.localeCompare(right.model))
}

/** Render a summary metric card with exact values available on hover. */
function Metric({ label, value }: { label: string; value: number | string }): ReactNode {
  const display = typeof value === 'number' ? formatCompactTokens(value) : value
  const exact = typeof value === 'number' ? formatTokens(value) : undefined
  return (
    <div className={css.metric}>
      <span>{label}</span>
      <strong {...exact === undefined ? {} : { title: exact }}>{display}</strong>
    </div>
  )
}

interface ActivityCell {
  date: string
  requests: number
  tokens: number
  usage: TokenUsageBuckets
  level: 0 | 1 | 2 | 3 | 4
  empty: boolean
}

/** Build calendar cells for a fixed one-year heatmap, aligned to Monday-start weeks. */
function activityCalendar(days: readonly DailyTokenUsageRecord[], now = Date.now()): ActivityCell[] {
  const dates = datesEndingOn(now, 365)
  if (dates.length === 0) return []
  const byDate = new Map(days.map(day => [day.date, day]))
  const today = dayKey(now)
  const first = new Date(`${dates[0]}T00:00:00.000Z`)
  const leading = (first.getUTCDay() + 6) % 7
  const maximum = Math.max(0, ...dates
    .filter(date => date <= today)
    .map(date => {
      const day = byDate.get(date)
      return day === undefined ? 0 : day.requests.assistant + day.requests.compaction
    }))
  const cells: ActivityCell[] = []
  for (let index = 0; index < leading; index += 1) {
    cells.push({ date: '', requests: 0, tokens: 0, usage: zeroBuckets(), level: 0, empty: true })
  }
  for (const date of dates) {
    if (date > today) {
      cells.push({ date: '', requests: 0, tokens: 0, usage: zeroBuckets(), level: 0, empty: true })
      continue
    }
    const day = byDate.get(date)
    const requests = day === undefined ? 0 : day.requests.assistant + day.requests.compaction
    const usage = day === undefined ? zeroBuckets() : { ...day.usage }
    const tokens = day === undefined ? 0 : totalTokens(day.usage)
    const level = requests === 0 || maximum === 0 ? 0 : Math.ceil(requests / maximum * 4) as ActivityCell['level']
    cells.push({ date, requests, tokens, usage, level, empty: false })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: '', requests: 0, tokens: 0, usage: zeroBuckets(), level: 0, empty: true })
  }
  return cells
}

/** Render the fixed one-year calendar heatmap of daily request activity. */
function ActivityHeatmap({
  days,
  t,
}: {
  days: readonly DailyTokenUsageRecord[]
  t: TokenUsageSectionProps['t']
}): ReactNode {
  const calendar = useMemo(() => activityCalendar(days), [days])
  const weeks = Math.max(1, Math.ceil(calendar.length / 7))
  return (
    <div className={css.activity}>
      <div className={css.activityHead}>
        <div>
          <h3>{t('activity')}</h3>
          <p>{t('activityIntro')}</p>
        </div>
        <div className={css.activityLegend} aria-label={t('activity')}>
          <span>{t('less')}</span>
          {[0, 1, 2, 3, 4].map(level => <i key={level} data-level={level} />)}
          <span>{t('more')}</span>
        </div>
      </div>
      <div className={css.activityGrid} style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }} role="grid" aria-label={t('activity')}>
        {calendar.map((day, index) => {
          if (day.empty) {
            return <span key={`empty-${index}`} className={css.activityCell} data-empty="true" role="gridcell" />
          }
          const details = t('activityTooltip', {
            date: day.date,
            requests: formatTokens(day.requests),
            total: formatTokens(day.tokens),
            input: formatTokens(inputTokens(day.usage)),
            output: formatTokens(day.usage.outputTokens),
            cacheRead: formatTokens(day.usage.cacheReadTokens),
            cacheWrite: formatTokens(day.usage.cacheWriteTokens),
          })
          return (
            <button
              key={day.date}
              className={css.activityCell}
              type="button"
              role="gridcell"
              data-level={day.level}
              {...{ title: details, 'aria-label': details }}
            />
          )
        })}
      </div>
    </div>
  )
}

/** Render the model table scoped to the selected date range. */
function ModelTable({
  models,
  t,
}: {
  models: readonly ModelTokenUsageRecord[]
  t: TokenUsageSectionProps['t']
}): ReactNode {
  const total = models.reduce((sum, model) => sum + totalTokens(model.usage), 0)
  return (
    <div className={css.block}>
      <div className={css.blockHead}>
        <h3>{t('modelBreakdown')}</h3>
      </div>
      {models.length === 0 ? <p className={css.status}>{t('emptyModels')}</p> : (
        <div className={css.modelScroll}>
          <div className={css.tableWrap}>
            <table className={css.modelTable}>
              <thead>
                <tr>
                  <th>{t('modelCol')}</th>
                  <th>{t('providerCol')}</th>
                  <th>{t('requestsCol')}</th>
                  <th>{t('billedCol')}</th>
                  <th>{t('tokensCol')}</th>
                  <th>{t('shareCol')}</th>
                </tr>
              </thead>
              <tbody>
                {models.map(model => {
                  const share = total === 0 ? 0 : totalTokens(model.usage) / total
                  return (
                    <tr key={modelKey(model)}>
                      <td>
                        {isUnattributed(model)
                          ? <strong>{t('unknownRoute')}</strong>
                          : <strong>{model.model}</strong>}
                      </td>
                      <td><span className={css.providerCell}>{model.provider}</span></td>
                      <td>{formatTokens(recordedRequests(model))}</td>
                      <td>{formatTokens(model.billedRequests)}</td>
                      <td><span className={css.tokenValue} title={formatTokens(totalTokens(model.usage))}>{formatCompactTokens(totalTokens(model.usage))}</span></td>
                      <td>
                        <span className={css.shareCell}>
                          <span className={css.shareBar}>
                            <i style={{ width: `${Math.round(share * 100)}%` }} />
                          </span>
                          <em>{formatPercent(share)}</em>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/** One day slice for the stacked Tokens chart. */
interface TokenDaySlice {
  date: string
  hit: number
  miss: number
  output: number
  total: number
}

/** Build per-day three-segment slices from daily records, oldest first (left = earliest, right = today). */
function tokenSlices(records: readonly DailyTokenUsageRecord[]): TokenDaySlice[] {
  const sorted = records.slice().sort((left, right) => left.date.localeCompare(right.date))
  return sorted.map(day => {
    const hit = day.usage.cacheReadTokens
    const miss = day.usage.uncachedInputTokens + day.usage.cacheWriteTokens
    const output = day.usage.outputTokens
    return { date: day.date, hit, miss, output, total: hit + miss + output }
  })
}

/** Pick a readable axis maximum at a 1/2/2.5/5 step for the stacked chart. */
function niceMaximum(value: number): number {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * magnitude
    if (candidate >= value) return candidate
  }
  return 10 * magnitude
}

/** Format one ISO date as M/D without leading zeros (official style). */
function shortDate(iso: string): string {
  const [, month, day] = iso.split('-')
  return `${Number(month)}/${Number(day)}`
}

/** Render the stacked daily Tokens bar chart (cache hit / cache miss / output). */
function TokensChart({
  records,
  allDates,
  rangeLabel,
  t,
}: {
  records: readonly DailyTokenUsageRecord[]
  allDates: readonly string[]
  rangeLabel: string
  t: TokenUsageSectionProps['t']
}): ReactNode {
  const slices = useMemo(() => tokenSlices(records), [records])
  const sliceByDate = useMemo(() => new Map(slices.map(slice => [slice.date, slice])), [slices])
  const [hovered, setHovered] = useState<number>()
  const total = slices.reduce((sum, slice) => sum + slice.total, 0)
  if (allDates.length === 0 || slices.length === 0) {
    return <div className={css.block}><h3>{t('tokensChart')}</h3><p className={css.status}>{t('empty')}</p></div>
  }
  const maximum = niceMaximum(Math.max(...slices.map(slice => slice.total)))
  const width = 820
  const height = 264
  const padTop = 16
  const padRight = 10
  const padBottom = 30
  const padLeft = 56
  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom
  const column = plotWidth / allDates.length
  const barWidth = Math.min(52, Math.max(4, column * 0.68))
  const axisTicks = [0, 0.5, 1].map(ratio => maximum * ratio)
  const y = (value: number): number => padTop + plotHeight * (1 - value / maximum)
  const labelEvery = Math.max(1, Math.ceil(allDates.length / 7))
  return (
    <div className={css.block}>
      <div className={css.blockHead}>
        <div>
          <h3>{t('tokensChart')}</h3>
          <p>{t('tokensChartIntro')}</p>
        </div>
        <span className={css.chartTotalBlock}>
          <span className={css.chartTotalLabel}>{rangeLabel}</span>
          <strong className={css.chartTotal} title={formatTokens(total)}>{formatTokens(total)}</strong>
        </span>
      </div>
      <div className={css.chartLegend}>
        <span><i className={css.legendHit} />{t('cacheHitInput')}</span>
        <span><i className={css.legendMiss} />{t('cacheMissInput')}</span>
        <span><i className={css.legendOutput} />{t('output')}</span>
      </div>
      <div className={css.chartWrap}>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={t('tokensChart')} className={css.chartSvg}>
          {axisTicks.map(ratio => (
            <g key={ratio}>
              <line
                x1={padLeft} x2={width - padRight}
                y1={y(maximum * ratio)}
                y2={y(maximum * ratio)}
                className={css.chartGridLine}
              />
              <text x={padLeft - 8} y={y(maximum * ratio) + 4} textAnchor="end" className={css.chartAxisLabel}>
                {ratio === 0 ? '0' : formatCompactTokens(maximum * ratio)}
              </text>
            </g>
          ))}
          {allDates.map((date, index) => {
            const slice = sliceByDate.get(date)
            const x = padLeft + column * index + (column - barWidth) / 2
            const hover = hovered === index
            return (
              <g
                key={date}
                onMouseEnter={() => { setHovered(index) }}
                onMouseLeave={() => { setHovered(undefined) }}
              >
                <rect
                  x={padLeft + column * index}
                  y={padTop}
                  width={column}
                  height={plotHeight}
                  fill="transparent"
                />
                {slice !== undefined && slice.total > 0 ? <>
                  <rect x={x} y={y(slice.output)} width={barWidth} height={y(0) - y(slice.output)} className={css.barOutput} />
                  <rect x={x} y={y(slice.output + slice.miss)} width={barWidth} height={y(slice.output) - y(slice.output + slice.miss)} className={css.barMiss} />
                  <rect x={x} y={y(slice.total)} width={barWidth} height={y(slice.output + slice.miss) - y(slice.total)} className={css.barHit} />
                </> : null}
                {index % labelEvery === 0 ? (
                  <text x={padLeft + column * index + column / 2} y={height - 8} textAnchor="middle" className={css.chartAxisLabel}>
                    {shortDate(date)}
                  </text>
                ) : null}
                {hover ? <rect
                  x={padLeft + column * index}
                  y={padTop}
                  width={column}
                  height={plotHeight}
                  className={css.chartHoverZone}
                /> : null}
              </g>
            )
          })}
        </svg>
        {hovered === undefined ? null : (() => {
          const slice = sliceByDate.get(allDates[hovered]!)
          if (slice === undefined) return null
          return (
            <div className={css.chartTooltip} style={{ left: `${(padLeft + column * hovered + column / 2) / width * 100}%` }}>
              <strong>{shortDate(slice.date)}</strong>
              <span>{t('cacheHitInput')} · {formatTokens(slice.hit)}</span>
              <span>{t('cacheMissInput')} · {formatTokens(slice.miss)}</span>
              <span>{t('output')} · {formatTokens(slice.output)}</span>
              <em>{t('totalTokens')} · {formatTokens(slice.total)}</em>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

/** Render the preset tabs plus the custom date-range picker. */
function RangeControls({
  selection,
  draft,
  onSelect,
  onDraftChange,
  onApply,
  onReset,
  error,
  t,
}: {
  selection: RangeSelection
  draft: { start: string; end: string }
  onSelect(selection: RangeSelection): void
  onDraftChange(draft: { start: string; end: string }): void
  onApply(): void
  onReset(): void
  error: boolean
  t: TokenUsageSectionProps['t']
}): ReactNode {
  const presets: PresetDays[] = [1, 3, 7, 30, 90]
  return (
    <>
      <div className={css.rangeTabs} aria-label={t('customRange')}>
        {presets.map(days => {
          const active = selection.kind === 'preset' && selection.days === days
          const label = days === 1 ? t('today') : days === 3 ? t('day3') : t('rangeDays', { count: days })
          return (
            <button
              key={days}
              type="button"
              aria-pressed={active}
              onClick={() => { onSelect({ kind: 'preset', days }) }}
            >{label}</button>
          )
        })}
        <button
          type="button"
          aria-pressed={selection.kind === 'custom'}
          onClick={() => { onSelect({ kind: 'custom', start: draft.start, end: draft.end }) }}
        >{t('customRange')}</button>
      </div>
      {selection.kind === 'custom' ? (
        <div className={css.rangeCustom}>
          <label>
            <span>{t('startDate')}</span>
            <input type="date" value={draft.start} onChange={(event) => {
              onDraftChange({ ...draft, start: event.currentTarget.value })
            }} />
          </label>
          <label>
            <span>{t('endDate')}</span>
            <input type="date" value={draft.end} onChange={(event) => {
              onDraftChange({ ...draft, end: event.currentTarget.value })
            }} />
          </label>
          <button type="button" className={css.rangeApply} onClick={onApply}>{t('applyRange')}</button>
          <button type="button" className={css.rangeReset} onClick={onReset}>{t('resetRange')}</button>
          {error ? <span className={css.rangeError}>{t('invalidRange')}</span> : null}
        </div>
      ) : null}
    </>
  )
}

/** Render durable Token billing across all listed sessions. */
export function TokenUsageSection({
  useSessions,
  t,
}: TokenUsageSectionProps): ReactNode {
  const phase = useSessions(state => state.phase)
  const ids = useSessions(state => state.ids)
  const byId = useSessions(state => state.byId)
  const [selection, setSelection] = useState<RangeSelection>({ kind: 'preset', days: 30 })
  const [draft, setDraft] = useState<{ start: string; end: string }>(() => defaultCustomDraft())
  const [customError, setCustomError] = useState(false)

  const data = useMemo(
    () => aggregateUsage(ids.map(id => byId[id]).filter((value): value is SessionSummary => value !== undefined)),
    [byId, ids],
  )
  const dates = useMemo(() => datesInRange(selection), [selection])
  const dateSet = useMemo(() => new Set(dates), [dates])
  const period = useMemo(() => rangeAggregate(data.days, dates), [data.days, dates])
  const scopedModels = useMemo(() => rangeModels(data.models, dateSet), [data.models, dateSet])
  const rangeLabel = rangeLabelOf(selection, t)

  const applyCustom = (): void => {
    if (draft.start === '' || draft.end === '' || draft.start > draft.end) {
      setCustomError(true)
      return
    }
    setCustomError(false)
    setSelection({ kind: 'custom', start: draft.start, end: draft.end })
  }
  const resetCustom = (): void => {
    setCustomError(false)
    setDraft(defaultCustomDraft())
    setSelection({ kind: 'preset', days: 30 })
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
      </header>

      {data.days.length === 0 ? <p className={css.status}>{t('empty')}</p> : (
        <>
          <RangeControls
            selection={selection}
            draft={draft}
            onSelect={(next) => {
              setCustomError(false)
              setSelection(next)
            }}
            onDraftChange={(next) => {
              setCustomError(false)
              setDraft(next)
            }}
            onApply={applyCustom}
            onReset={resetCustom}
            error={customError}
            t={t}
          />

          <div className={css.metrics}>
            <Metric label={t('requests')} value={period.requests} />
            <Metric label={t('billed')} value={period.billed} />
            <Metric label={t('totalTokens')} value={totalTokens(period.usage)} />
            <Metric label={t('cacheHitTokens')} value={period.usage.cacheReadTokens} />
            <Metric label={t('activeDays')} value={`${period.activeDays}/${dates.length}`} />
          </div>

          <ActivityHeatmap days={data.days} t={t} />
          <ModelTable models={scopedModels} t={t} />
          <TokensChart records={period.records} allDates={dates} rangeLabel={rangeLabel} t={t} />
        </>
      )}
    </section>
  )
}
