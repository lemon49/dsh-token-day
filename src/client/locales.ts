import type {} from '@deepseek-ai/dsh-client-locale/client'

/** Dictionary namespace owned by the Token day dashboard. */
export const NS = 'settings.tokenDay'

/** Simplified Chinese dictionary and key source of truth. */
export const zh = {
  nav: 'Token 用量',
  title: 'Token 计费统计',
  intro: '基于 DSH 持久会话日志统计模型请求与 Token 用量，不保存提示词或回复正文。',
  rangeDays: '{count} 天',
  day3: '3 天',
  today: '当日',
  customRange: '自定义',
  startDate: '开始日期',
  endDate: '结束日期',
  applyRange: '应用',
  resetRange: '重置',
  invalidRange: '开始日期不能晚于结束日期',
  requests: '请求总数',
  billed: '已计量',
  totalTokens: 'Token 总数',
  cacheHitTokens: '缓存命中 Token',
  activeDays: '活跃天数',
  activity: '每日活动',
  activityIntro: '颜色越深表示当日请求数越高。悬停查看明细。',
  activityTooltip: '{date}\n请求 {requests}\n总计 {total} Token\n输入 {input} · 输出 {output}\n缓存：读 {cacheRead} · 写 {cacheWrite}',
  less: '少',
  more: '多',
  modelBreakdown: '模型',
  modelCol: '模型',
  providerCol: '提供方',
  requestsCol: '请求数',
  billedCol: '已计量',
  tokensCol: 'Token 数',
  shareCol: '占比',
  unknownRoute: '模型信息不可用',
  emptyModels: '该时间段内暂无模型用量记录。',
  tokensChart: 'Tokens',
  tokensChartIntro: '按天展示输入（命中缓存 / 未命中缓存）与输出 Token 用量。',
  chartRange: '{range}',
  cacheHitInput: '输入 (命中缓存)',
  cacheMissInput: '输入 (未命中缓存)',
  output: '输出',
  empty: '暂无 Token 使用记录。',
  loading: '正在读取会话统计…',
} satisfies Record<string, string>

/** Token day locale key union. */
export type TokenUsageLocaleKey = keyof typeof zh

/** English dictionary checked against the Chinese key set. */
export const en = {
  nav: 'Token usage',
  title: 'Token billing statistics',
  intro: 'Counts model requests and Token usage from durable DSH session logs without storing prompt or response text.',
  rangeDays: '{count} days',
  day3: '3 days',
  today: 'Today',
  customRange: 'Custom',
  startDate: 'Start date',
  endDate: 'End date',
  applyRange: 'Apply',
  resetRange: 'Reset',
  invalidRange: 'Start date cannot be later than end date.',
  requests: 'Total requests',
  billed: 'Billed',
  totalTokens: 'Total tokens',
  cacheHitTokens: 'Cache-hit tokens',
  activeDays: 'Active days',
  activity: 'Daily activity',
  activityIntro: 'Darker cells represent higher daily request counts. Hover for details.',
  activityTooltip: '{date}\nRequests {requests}\nTotal {total} tokens\nInput {input} · Output {output}\nCache: read {cacheRead} · write {cacheWrite}',
  less: 'Less',
  more: 'More',
  modelBreakdown: 'Models',
  modelCol: 'Model',
  providerCol: 'Provider',
  requestsCol: 'Requests',
  billedCol: 'Billed',
  tokensCol: 'Tokens',
  shareCol: 'Share',
  unknownRoute: 'Model unavailable',
  emptyModels: 'No model usage recorded in this period.',
  tokensChart: 'Tokens',
  tokensChartIntro: 'Daily input (cache-hit / cache-miss) and output token usage.',
  chartRange: '{range}',
  cacheHitInput: 'Input (cache hit)',
  cacheMissInput: 'Input (cache miss)',
  output: 'Output',
  empty: 'No token usage has been recorded.',
  loading: 'Reading session usage…',
} satisfies Record<TokenUsageLocaleKey, string>

/**
 * Conversation-manager dictionary namespace. Owned by the session management
 * settings page registered alongside the Token dashboard.
 */
export const MANAGER_NS = 'settings.conversationManager'

/** Simplified Chinese conversation-manager dictionary and key source of truth. */
export const managerZh = {
  nav: '对话管理',
  title: '对话管理',
  intro: '管理 DSH 会话：将对话归档（从列表隐藏），或在归档管理中恢复。归档状态保存在本插件的持久化存储中。',
  refresh: '刷新',
  conversations: '对话管理',
  archived: '归档管理',
  count: '共 {count} 个',
  delete: '删除',
  restore: '恢复',
  loading: '正在加载会话列表…',
  emptyConversations: '暂无会话',
  emptyArchived: '暂无归档会话',
  sessionIdLabel: 'session',
  copyId: '复制 id',
  copied: '已复制',
  loadFailed: '加载归档列表失败：{message}',
  opFailed: '操作失败：{message}',
} satisfies Record<string, string>

/** Conversation-manager locale key union. */
export type ConversationManagerLocaleKey = keyof typeof managerZh

/** English conversation-manager dictionary checked against the Chinese key set. */
export const managerEn = {
  nav: 'Conversations',
  title: 'Conversation management',
  intro: 'Manage DSH sessions: archive a conversation (hide it from the list) or restore it from the archive. Archive state lives in this plugin\'s durable storage.',
  refresh: 'Refresh',
  conversations: 'Conversations',
  archived: 'Archive',
  count: '{count} total',
  delete: 'Delete',
  restore: 'Restore',
  loading: 'Loading session list…',
  emptyConversations: 'No conversations',
  emptyArchived: 'No archived conversations',
  sessionIdLabel: 'session',
  copyId: 'Copy id',
  copied: 'Copied',
  loadFailed: 'Failed to load archive list: {message}',
  opFailed: 'Operation failed: {message}',
} satisfies Record<ConversationManagerLocaleKey, string>
