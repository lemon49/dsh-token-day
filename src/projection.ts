import { z } from 'zod'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import { isReplacementSurfaceEvent, type SessionEvent } from '@deepseek-ai/dsh-session'
import type { TokenUsage } from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-compaction'
import type {} from '@deepseek-ai/dsh-llm-retry'
import type {
  DailyRequests,
  DailyTokenUsageRecord,
  ModelDailyTokenUsageRecord,
  ModelTokenUsageRecord,
  TokenDayProjection,
  TokenUsageBuckets,
} from './types.ts'

interface Route {
  provider: string
  model: string
}

/** Per-UTC-day contribution of one model route (internal reducer shape). */
interface ModelDayState {
  assistant: number
  compaction: number
  billed: number
  usage: TokenUsageBuckets
}

/** One model route's full reducer state. */
interface ModelState {
  provider: string
  model: string
  assistantRequests: number
  compactionRequests: number
  billedRequests: number
  usage: TokenUsageBuckets
  days: Record<string, ModelDayState>
}

interface AssistantSample {
  turn: number
  step: number
  route: Route
  day: string
  usage: TokenUsageBuckets
  billed: boolean
}

interface RecorderState {
  route: Route | null
  assistantRequests: number
  compactionRequests: number
  billedRequests: number
  compactionUsage: TokenUsageBuckets
  usage: TokenUsageBuckets
  models: Record<string, ModelState>
  days: Record<string, { requests: DailyRequests; usage: TokenUsageBuckets }>
  lastAssistant: AssistantSample | null
}

const bucketsSchema = z.object({
  uncachedInputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  cacheReadTokens: z.number().int().nonnegative(),
  cacheWriteTokens: z.number().int().nonnegative(),
}).strict()

const requestsSchema: z.ZodType<DailyRequests> = z.object({
  assistant: z.number().int().nonnegative(),
  compaction: z.number().int().nonnegative(),
  billed: z.number().int().nonnegative(),
}).strict()

const projectionSchema: z.ZodType<TokenDayProjection> = z.object({
  assistantRequests: z.number().int().nonnegative(),
  compactionRequests: z.number().int().nonnegative(),
  billedRequests: z.number().int().nonnegative(),
  compactionUsage: bucketsSchema,
  usage: bucketsSchema,
  models: z.array(z.object({
    provider: z.string(),
    model: z.string(),
    assistantRequests: z.number().int().nonnegative(),
    compactionRequests: z.number().int().nonnegative(),
    billedRequests: z.number().int().nonnegative(),
    usage: bucketsSchema,
    days: z.array(z.object({
      date: z.string(),
      requests: requestsSchema,
      usage: bucketsSchema,
    }).strict()),
  }).strict()),
  days: z.array(z.object({
    date: z.string(),
    requests: requestsSchema,
    usage: bucketsSchema,
  }).strict()),
}).strict()

/** Create detached zero buckets for projection state. */
function zeroBuckets(): TokenUsageBuckets {
  return {
    uncachedInputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  }
}

/** Create detached zero per-day request counters. */
function zeroRequests(): DailyRequests {
  return { assistant: 0, compaction: 0, billed: 0 }
}

/** Normalize optional provider fields into the four disjoint buckets. */
function bucketsFrom(usage: TokenUsage): TokenUsageBuckets {
  return {
    uncachedInputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cacheReadTokens: usage.cacheReadTokens ?? 0,
    cacheWriteTokens: usage.cacheWriteTokens ?? 0,
  }
}

/** Compare buckets without counting reasoning output a second time. */
function bucketsEqual(left: TokenUsageBuckets, right: TokenUsageBuckets): boolean {
  return left.uncachedInputTokens === right.uncachedInputTokens
    && left.outputTokens === right.outputTokens
    && left.cacheReadTokens === right.cacheReadTokens
    && left.cacheWriteTokens === right.cacheWriteTokens
}

/** Add or subtract one bucket set. */
function addBuckets(
  current: TokenUsageBuckets,
  value: TokenUsageBuckets,
  direction: 1 | -1,
): TokenUsageBuckets {
  return {
    uncachedInputTokens: current.uncachedInputTokens + direction * value.uncachedInputTokens,
    outputTokens: current.outputTokens + direction * value.outputTokens,
    cacheReadTokens: current.cacheReadTokens + direction * value.cacheReadTokens,
    cacheWriteTokens: current.cacheWriteTokens + direction * value.cacheWriteTokens,
  }
}

/** Add or subtract one request-counter set. */
function addRequests(
  current: DailyRequests,
  value: DailyRequests,
  direction: 1 | -1,
): DailyRequests {
  return {
    assistant: current.assistant + direction * value.assistant,
    compaction: current.compaction + direction * value.compaction,
    billed: current.billed + direction * value.billed,
  }
}

/** Stable UTC calendar day for one durable event timestamp. */
function dayKey(time: number): string {
  return new Date(time).toISOString().slice(0, 10)
}

/** Add or remove one usage sample from a daily aggregation table. */
function adjustDay(
  days: Record<string, { requests: DailyRequests; usage: TokenUsageBuckets }>,
  day: string,
  requests: DailyRequests,
  usage: TokenUsageBuckets,
  direction: 1 | -1,
): void {
  const current = days[day] ?? { requests: zeroRequests(), usage: zeroBuckets() }
  const nextRequests = addRequests(current.requests, requests, direction)
  const nextUsage = addBuckets(current.usage, usage, direction)
  if (nextRequests.assistant === 0 && nextRequests.compaction === 0 && nextRequests.billed === 0
    && bucketsEqual(nextUsage, zeroBuckets())) {
    delete days[day]
  } else {
    days[day] = { requests: nextRequests, usage: nextUsage }
  }
}

/** Stable collision-free object key for one provider/model pair. */
function routeKey(route: Route): string {
  return JSON.stringify([route.provider, route.model])
}

/** Whether a model day entry became empty after replacing its only sample. */
function modelDayEmpty(day: ModelDayState): boolean {
  return day.assistant === 0 && day.compaction === 0 && day.billed === 0
    && bucketsEqual(day.usage, zeroBuckets())
}

/** Whether a route record became empty after replacing its only sample. */
function recordEmpty(record: ModelState): boolean {
  return record.assistantRequests === 0
    && record.compactionRequests === 0
    && record.billedRequests === 0
    && bucketsEqual(record.usage, zeroBuckets())
    && Object.keys(record.days).length === 0
}

/** Apply one signed model-attributed usage sample to a cloned model table. */
function adjustModel(
  models: Record<string, ModelState>,
  route: Route,
  day: string,
  usage: TokenUsageBuckets,
  direction: 1 | -1,
  kind: 'assistant' | 'compaction',
  billed: boolean,
): void {
  const key = routeKey(route)
  const current = models[key] ?? {
    ...route,
    assistantRequests: 0,
    compactionRequests: 0,
    billedRequests: 0,
    usage: zeroBuckets(),
    days: {},
  }
  const dayState = current.days[day] ?? { assistant: 0, compaction: 0, billed: 0, usage: zeroBuckets() }
  const nextDay: ModelDayState = {
    assistant: dayState.assistant + (kind === 'assistant' ? direction : 0),
    compaction: dayState.compaction + (kind === 'compaction' ? direction : 0),
    billed: dayState.billed + (billed ? direction : 0),
    usage: addBuckets(dayState.usage, usage, direction),
  }
  const days = { ...current.days }
  if (modelDayEmpty(nextDay)) delete days[day]
  else days[day] = nextDay
  const next: ModelState = {
    ...current,
    assistantRequests: current.assistantRequests + (kind === 'assistant' ? direction : 0),
    compactionRequests: current.compactionRequests + (kind === 'compaction' ? direction : 0),
    billedRequests: current.billedRequests + (billed ? direction : 0),
    usage: addBuckets(current.usage, usage, direction),
    days,
  }
  if (recordEmpty(next)) delete models[key]
  else models[key] = next
}

/** Resolve the best durable route identity available on an assistant event. */
function assistantRoute(event: SessionEvent, fallback: Route | null): Route {
  if (event.type === 'assistant/message' && event.data.message.source.kind === 'model') {
    return {
      provider: event.data.message.source.provider,
      model: event.data.message.source.model,
    }
  }
  return fallback ?? { provider: 'unknown', model: 'unknown' }
}

/** Total billed tokens across the four disjoint buckets. */
function totalTokens(usage: TokenUsageBuckets): number {
  return usage.uncachedInputTokens
    + usage.cacheReadTokens
    + usage.cacheWriteTokens
    + usage.outputTokens
}

/** Durable all-request token usage projection, including context compactions. */
export const tokenDayProjectionDefinition:
ProjectionDefinition<'tokenDay', RecorderState> = {
  key: 'tokenDay',
  schema: projectionSchema,
  init: () => ({
    route: null,
    assistantRequests: 0,
    compactionRequests: 0,
    billedRequests: 0,
    compactionUsage: zeroBuckets(),
    usage: zeroBuckets(),
    models: {},
    days: {},
    lastAssistant: null,
  }),
  apply: (state, event) => {
    if (isReplacementSurfaceEvent(event)) return state
    if (event.type === 'request/context') {
      const route = { provider: event.data.provider, model: event.data.model }
      if (state.route?.provider === route.provider && state.route.model === route.model) return state
      return { ...state, route }
    }
    if (event.type === 'request/header') {
      const route = {
        provider: event.data.header.config.provider,
        model: event.data.header.config.model,
      }
      if (state.route?.provider === route.provider && state.route.model === route.model) return state
      return { ...state, route }
    }
    if (event.type === 'llm/retry') {
      const current = state.lastAssistant
      if (current !== null && current.turn === event.data.turn && current.step === event.data.step) {
        return { ...state, lastAssistant: null }
      }
      const models = { ...state.models }
      const day = dayKey(event.time)
      if (state.route !== null) adjustModel(models, state.route, day, zeroBuckets(), 1, 'assistant', false)
      const days = { ...state.days }
      adjustDay(days, day, { assistant: 1, compaction: 0, billed: 0 }, zeroBuckets(), 1)
      return { ...state, assistantRequests: state.assistantRequests + 1, models, days }
    }
    if (event.type === 'compaction/summary') {
      const compactionRequests = state.compactionRequests + 1
      const day = dayKey(event.time)
      const days = { ...state.days }
      if (event.data.usage === undefined) {
        const models = { ...state.models }
        adjustModel(models, { provider: event.data.provider, model: event.data.model }, day, zeroBuckets(), 1, 'compaction', false)
        adjustDay(days, day, { assistant: 0, compaction: 1, billed: 0 }, zeroBuckets(), 1)
        return { ...state, compactionRequests, models, days }
      }
      const usage = bucketsFrom(event.data.usage)
      const billed = totalTokens(usage) > 0
      const route = { provider: event.data.provider, model: event.data.model }
      const models = { ...state.models }
      adjustModel(models, route, day, usage, 1, 'compaction', billed)
      adjustDay(days, day, { assistant: 0, compaction: 1, billed: billed ? 1 : 0 }, usage, 1)
      return {
        ...state,
        compactionRequests,
        billedRequests: state.billedRequests + (billed ? 1 : 0),
        compactionUsage: addBuckets(state.compactionUsage, usage, 1),
        usage: addBuckets(state.usage, usage, 1),
        models,
        days,
      }
    }

    let turn: number
    let step: number
    let rawUsage: TokenUsage
    if (event.type === 'assistant/chunk' && event.data.chunk.type === 'usage') {
      turn = event.data.turn
      step = event.data.step
      rawUsage = event.data.chunk.usage
    } else if (event.type === 'assistant/message' && event.data.usage !== undefined) {
      turn = event.data.turn
      step = event.data.step
      rawUsage = event.data.usage
    } else {
      return state
    }

    const route = assistantRoute(event, state.route)
    const day = dayKey(event.time)
    const usage = bucketsFrom(rawUsage)
    const billed = totalTokens(usage) > 0
    const previous = state.lastAssistant !== null
      && state.lastAssistant.turn === turn
      && state.lastAssistant.step === step
      ? state.lastAssistant
      : null
    if (previous !== null
      && previous.route.provider === route.provider
      && previous.route.model === route.model
      && bucketsEqual(previous.usage, usage)) return state

    const models = { ...state.models }
    const days = { ...state.days }
    let total = state.usage
    if (previous !== null) {
      total = addBuckets(total, previous.usage, -1)
      adjustModel(models, previous.route, previous.day, previous.usage, -1, 'assistant', previous.billed)
      adjustDay(days, previous.day, zeroRequests(), previous.usage, -1)
    } else {
      adjustDay(days, day, { assistant: 1, compaction: 0, billed: billed ? 1 : 0 }, zeroBuckets(), 1)
    }
    total = addBuckets(total, usage, 1)
    adjustModel(models, route, day, usage, 1, 'assistant', billed)
    adjustDay(days, day, zeroRequests(), usage, 1)
    const billedDelta = previous === null
      ? (billed ? 1 : 0)
      : (billed !== previous.billed ? (billed ? 1 : -1) : 0)
    return {
      ...state,
      assistantRequests: state.assistantRequests + (previous === null ? 1 : 0),
      billedRequests: state.billedRequests + billedDelta,
      usage: total,
      models,
      days,
      lastAssistant: { turn, step, route, day, usage, billed },
    }
  },
  view: state => ({
    assistantRequests: state.assistantRequests,
    compactionRequests: state.compactionRequests,
    billedRequests: state.billedRequests,
    compactionUsage: state.compactionUsage,
    usage: state.usage,
    models: Object.values(state.models).map((model): ModelTokenUsageRecord => ({
      provider: model.provider,
      model: model.model,
      assistantRequests: model.assistantRequests,
      compactionRequests: model.compactionRequests,
      billedRequests: model.billedRequests,
      usage: model.usage,
      days: Object.entries(model.days)
        .map(([date, day]): ModelDailyTokenUsageRecord => ({
          date,
          requests: { assistant: day.assistant, compaction: day.compaction, billed: day.billed },
          usage: day.usage,
        }))
        .sort((left, right) => left.date.localeCompare(right.date)),
    })).sort((left, right) =>
      totalTokens(right.usage) - totalTokens(left.usage)
      || left.provider.localeCompare(right.provider)
      || left.model.localeCompare(right.model)),
    days: Object.entries(state.days)
      .map(([date, value]): DailyTokenUsageRecord => ({ date, requests: value.requests, usage: value.usage }))
      .sort((left, right) => left.date.localeCompare(right.date)),
  }),
  stateVersion: 8,
}

/** Fold one complete event sequence through the canonical persistent projection reducer. */
export function projectTokenUsage(events: readonly SessionEvent[]): TokenDayProjection {
  let state = tokenDayProjectionDefinition.init()
  for (const event of events) state = tokenDayProjectionDefinition.apply(state, event)
  return tokenDayProjectionDefinition.view(state)
}
