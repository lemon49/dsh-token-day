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
      models.set(key, current === undefined ? {
        ...model,
        usage: { ...model.usage },
      } : {
        ...current,
        assistantRequests: current.assistantRequests + model.assistantRequests,
        compactionRequests: current.compactionRequests + model.compactionRequests,
        billedRequests: current.billedRequests + model.billedRequests,
        usage: addBuckets(current.usage, model.usage),
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

/** Build a newest-inclusive UTC date range. */
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

/** Aggregate one fixed UTC date range from a daily lookup. */
function rangeAggregate(days: readonly DailyTokenUsageRecord[], range: number, now = Date.now()): {
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
  for (const date of datesEndingOn(now, range)) {
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

interface ActivityDay {
  date: string
  requests: number
  tokens: number
  usage: TokenUsageBuckets
  level: 0 | 1 | 2 | 3 | 4
  future: boolean
}

/** Build exactly 30 Monday-first calendar weeks, including blank future days this week. */
function activityCalendar(days: readonly DailyTokenUsageRecord[], now = Date.now()): ActivityDay[] {
  const byDate = new Map(days.map(day => [day.date, day]))
  const today = dayKey(now)
  const end = new Date(`${today}T00:00:00.000Z`)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7) - 29 * 7)

  const dates: string[] = []
  for (const cursor = new Date(start); dates.length < 30 * 7; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    dates.push(dayKey(cursor.getTime()))
  }
  const maximum = Math.max(0, ...dates
    .filter(date => date <= today)
    .map(date => {
      const day = byDate.get(date)
      return day === undefined ? 0 : day.requests.assistant + day.requests.compaction
    }))
  return dates.map((date) => {
    const future = date > today
    const day = byDate.get(date)
    const requests = future ? 0 : day === undefined ? 0 : day.requests.assistant + day.requests.compaction
    const tokens = future ? 0 : day === undefined ? 0 : totalTokens(day.usage)
    const usage = future ? zeroBuckets() : day === undefined ? zeroBuckets() : { ...day.usage }
    const level = requests === 0 || maximum === 0 ? 0 : Math.ceil(requests / maximum * 4) as ActivityDay['level']
    return { date, requests, tokens, usage, level, future }
  })
}

/** Render a GitHub-style calendar heatmap of daily request activity. */
function ActivityHeatmap({
  days,
  t,
}: {
  days: readonly DailyTokenUsageRecord[]
  t: TokenUsageSectionProps['t']
}): ReactNode {
  const calendar = useMemo(() => activityCalendar(days), [days])
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
      <div className={css.activityGrid} role="grid" aria-label={t('activity')}>
        {calendar.map((day) => {
          const details = day.future ? undefined : t('activityTooltip', {
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
              data-future={day.future ? 'true' : undefined}
              disabled={day.future}
              {...details === undefined ? {} : { title: details, 'aria-label': details }}
            />
          )
        })}
      </div>
    </div>
  )
}

/** Render the model table with all recorded provider/model routes. */
function ModelTable({
  models,
  query,
  onQueryChange,
  t,
}: {
  models: readonly ModelTokenUsageRecord[]
  query: string
  onQueryChange(value: string): void
  t: TokenUsageSectionProps['t']
}): ReactNode {
  const normalized = query.trim().toLocaleLowerCase()
  const filtered = useMemo(() => {
    if (normalized.length === 0) return models
    return models.filter(model =>
      model.model.toLocaleLowerCase().includes(normalized)
      || model.provider.toLocaleLowerCase().includes(normalized))
  }, [models, normalized])
  const total = models.reduce((sum, model) => sum + totalTokens(model.usage), 0)
  return (
    <div className={css.block}>
      <div className={css.blockHead}>
        <h3>{t('modelBreakdown')}</h3>
        <input
          type="search"
          value={query}
          placeholder={t('searchModels')}
          aria-label={t('searchModels')}
          onChange={(event) => { onQueryChange(event.currentTarget.value) }}
        />
      </div>
      {filtered.length === 0 ? <p className={css.status}>{t('emptyModels')}</p> : (
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
              {filtered.map(model => {
                const share = total === 0 ? 0 : totalTokens(model.usage) / total
                return (
                  <tr key={modelKey(model)}>
                    <td>
                      {isUnattributed(model)
                        ? <strong>{t('unknownRoute')}</strong>
                        : <strong>{model.model}</strong>}
                    </td>
                    <td>{model.provider}</td>
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

/** Build per-day three-segment slices from daily records. */
function tokenSlices(records: readonly DailyTokenUsageRecord[]): TokenDaySlice[] {
  return records.map(day => {
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

/** Render the stacked daily Tokens bar chart (cache hit / cache miss / output). */
function TokensChart({
  records,
  t,
}: {
  records: readonly DailyTokenUsageRecord[]
  t: TokenUsageSectionProps['t']
}): ReactNode {
  const slices = useMemo(() => tokenSlices(records), [records])
  const [hovered, setHovered] = useState<number>()
  const total = slices.reduce((sum, slice) => sum + slice.total, 0)
  if (slices.length === 0) {
    return <div className={css.block}><h3>{t('tokensChart')}</h3><p className={css.status}>{t('empty')}</p></div>
  }
  const maximum = niceMaximum(Math.max(...slices.map(slice => slice.total)))
  const width = 820
  const height = 260
  const padTop = 14
  const padRight = 10
  const padBottom = 30
  const padLeft = 56
  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom
  const column = plotWidth / slices.length
  const barWidth = Math.min(46, Math.max(3, column * 0.62))
  const axisTicks = [0, 0.5, 1].map(ratio => maximum * ratio)
  const y = (value: number): number => padTop + plotHeight * (1 - value / maximum)
  const labelEvery = Math.max(1, Math.ceil(slices.length / 7))
  return (
    <div className={css.block}>
      <div className={css.blockHead}>
        <div>
          <h3>{t('tokensChart')}</h3>
          <p>{t('tokensChartIntro')}</p>
        </div>
        <strong className={css.chartTotal} title={formatTokens(total)}>{formatCompactTokens(total)}</strong>
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
          {slices.map((slice, index) => {
            const x = padLeft + column * index + (column - barWidth) / 2
            const hover = hovered === index
            return (
              <g
                key={slice.date}
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
                {slice.total > 0 ? <>
                  <rect x={x} y={y(slice.output)} width={barWidth} height={y(0) - y(slice.output)} className={css.barOutput} />
                  <rect x={x} y={y(slice.output + slice.miss)} width={barWidth} height={y(slice.output) - y(slice.output + slice.miss)} className={css.barMiss} />
                  <rect x={x} y={y(slice.total)} width={barWidth} height={y(slice.output + slice.miss) - y(slice.total)} className={css.barHit} />
                </> : null}
                {index % labelEvery === 0 ? (
                  <text x={padLeft + column * index + column / 2} y={height - 8} textAnchor="middle" className={css.chartAxisLabel}>
                    {slice.date.slice(5)}
                  </text>
                ) : null}
                {hover ? (
                  <g>
                    <rect
                      x={padLeft + column * index}
                      y={padTop}
                      width={column}
                      height={plotHeight}
                      className={css.chartHoverZone}
                    />
                  </g>
                ) : null}
              </g>
            )
          })}
        </svg>
        {hovered === undefined ? null : (() => {
          const slice = slices[hovered]
          return (
            <div className={css.chartTooltip} style={{ left: `${(padLeft + column * hovered + column / 2) / width * 100}%` }}>
              <strong>{slice.date}</strong>
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

/** Render durable Token billing across all listed sessions. */
export function TokenUsageSection({
  useSessions,
  t,
}: TokenUsageSectionProps): ReactNode {
  const phase = useSessions(state => state.phase)
  const ids = useSessions(state => state.ids)
  const byId = useSessions(state => state.byId)
  const [range, setRange] = useState<7 | 30 | 90>(30)
  const [query, setQuery] = useState('')

  const data = useMemo(
    () => aggregateUsage(ids.map(id => byId[id]).filter((value): value is SessionSummary => value !== undefined)),
    [byId, ids],
  )
  const period = useMemo(() => rangeAggregate(data.days, range), [data.days, range])
  const coverage = period.requests === 0 ? undefined : period.billed / period.requests

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
          <div className={css.rangeTabs} aria-label={t('rangeDays', { count: range })}>
            {([7, 30, 90] as const).map(value => (
              <button
                key={value}
                type="button"
                aria-pressed={range === value}
                onClick={() => { setRange(value) }}
              >{t('rangeDays', { count: value })}</button>
            ))}
          </div>

          <div className={css.metrics}>
            <Metric label={t('requests')} value={period.requests} />
            <Metric label={t('billed')} value={period.billed} />
            <Metric label={t('totalTokens')} value={totalTokens(period.usage)} />
            <Metric label={t('cacheHitTokens')} value={period.usage.cacheReadTokens} />
            <Metric label={t('coverage')} value={coverage === undefined ? '—' : formatPercent(coverage)} />
            <Metric label={t('activeDays')} value={`${period.activeDays}/${range}`} />
          </div>

          <ActivityHeatmap days={data.days} t={t} />
          <ModelTable models={data.models} query={query} onQueryChange={setQuery} t={t} />
          <TokensChart records={period.records} t={t} />
        </>
      )}
    </section>
  )
}
