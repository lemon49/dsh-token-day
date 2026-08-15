import type {} from '@deepseek-ai/dsh-client-locale/client'

/** Dictionary namespace owned by the Token billing dashboard. */
export const NS = 'settings.tokenDay'

/** Simplified Chinese dictionary and key source of truth. */
export const zh = {
  nav: 'Token 用量',
  title: 'Token 计费统计',
  intro: '基于 DSH 持久会话日志统计模型请求与 Token 用量，不保存提示词或回复正文。',
  rangeDays: '{count} 天',
  requests: '请求总数',
  billed: '已计量',
  totalTokens: 'Token 总数',
  cacheHitTokens: '缓存命中 Token',
  coverage: '覆盖率',
  activeDays: '活跃天数',
  activity: '每日活动',
  activityIntro: '最近 30 周，颜色越深表示当日请求数越高。悬停查看明细。',
  activityTooltip: '{date}\n请求 {requests}\n总计 {total} Token\n输入 {input} · 输出 {output}\n缓存：读 {cacheRead} · 写 {cacheWrite}',
  less: '少',
  more: '多',
  modelBreakdown: '模型',
  searchModels: '搜索模型...',
  modelCol: '模型',
  providerCol: '提供方',
  requestsCol: '请求数',
  billedCol: '已计量',
  tokensCol: 'Token 数',
  shareCol: '占比',
  unknownRoute: '模型信息不可用',
  emptyModels: '暂无模型用量记录。',
  tokensChart: 'Tokens',
  tokensChartIntro: '按天展示输入（命中缓存 / 未命中缓存）与输出 Token 用量。',
  cacheHitInput: '输入 (命中缓存)',
  cacheMissInput: '输入 (未命中缓存)',
  output: '输出',
  empty: '暂无 Token 使用记录。',
  loading: '正在读取会话统计…',
} satisfies Record<string, string>

/** Token billing locale key union. */
export type TokenUsageLocaleKey = keyof typeof zh

/** English dictionary checked against the Chinese key set. */
export const en = {
  nav: 'Token usage',
  title: 'Token billing statistics',
  intro: 'Counts model requests and Token usage from durable DSH session logs without storing prompt or response text.',
  rangeDays: '{count} days',
  requests: 'Total requests',
  billed: 'Billed',
  totalTokens: 'Total tokens',
  cacheHitTokens: 'Cache-hit tokens',
  coverage: 'Coverage',
  activeDays: 'Active days',
  activity: 'Daily activity',
  activityIntro: 'Last 30 weeks. Darker cells represent higher daily request counts. Hover for details.',
  activityTooltip: '{date}\nRequests {requests}\nTotal {total} tokens\nInput {input} · Output {output}\nCache: read {cacheRead} · write {cacheWrite}',
  less: 'Less',
  more: 'More',
  modelBreakdown: 'Models',
  searchModels: 'Search models...',
  modelCol: 'Model',
  providerCol: 'Provider',
  requestsCol: 'Requests',
  billedCol: 'Billed',
  tokensCol: 'Tokens',
  shareCol: 'Share',
  unknownRoute: 'Model unavailable',
  emptyModels: 'No model usage recorded.',
  tokensChart: 'Tokens',
  tokensChartIntro: 'Daily input (cache-hit / cache-miss) and output token usage.',
  cacheHitInput: 'Input (cache hit)',
  cacheMissInput: 'Input (cache miss)',
  output: 'Output',
  empty: 'No token usage has been recorded.',
  loading: 'Reading session usage…',
} satisfies Record<TokenUsageLocaleKey, string>
