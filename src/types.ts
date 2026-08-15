/** Disjoint provider-reported token buckets. */
export interface TokenUsageBuckets {
  uncachedInputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
}

/** Per-UTC-day request counters. */
export interface DailyRequests {
  /** Assistant request attempts, including retries that produced no usage. */
  assistant: number
  /** Context compaction requests. */
  compaction: number
  /** Requests that produced non-zero provider-reported usage. */
  billed: number
}

/** Usage attributed to one provider/model route. */
export interface ModelTokenUsageRecord {
  provider: string
  model: string
  /** Assistant request attempts (including retries with no usage). */
  assistantRequests: number
  /** Context compaction requests. */
  compactionRequests: number
  /** Requests on this route that produced non-zero usage. */
  billedRequests: number
  usage: TokenUsageBuckets
}

/** Token usage attributed to one UTC calendar date. */
export interface DailyTokenUsageRecord {
  /** Calendar date in YYYY-MM-DD form. */
  date: string
  requests: DailyRequests
  usage: TokenUsageBuckets
}

/** Durable per-session usage record served to Host and Web projection consumers. */
export interface TokenDayProjection {
  /** All assistant request attempts, including retries with no usage. */
  assistantRequests: number
  /** Context compaction requests. */
  compactionRequests: number
  /** Requests that produced non-zero provider-reported usage. */
  billedRequests: number
  /** Exact provider-reported usage spent by context compaction summaries. */
  compactionUsage: TokenUsageBuckets
  usage: TokenUsageBuckets
  models: readonly ModelTokenUsageRecord[]
  days: readonly DailyTokenUsageRecord[]
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Provider usage, including ordinary assistant requests and compaction summaries. */
    tokenDay: TokenDayProjection
  }
}
