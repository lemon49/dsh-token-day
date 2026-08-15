# DSH Token 计费插件（dsh-token-day）改造计划

> 状态：已批准。文档保存于 `D:\codex\dsh-token-day\docs\PLAN.md`。

## 1. 背景与目标

基于已安装的 `dsh-token-usage`（github:LeemanCheung/dsh-token-usage，v0.1.0）改造为专属插件 **`dsh-token-day`**，在本地 `D:\codex\dsh-token-day` 独立开发，由 web profile 直接引用（本地目录方式），与已装 github 版并存不冲突。

- **保留**：设置页中"token用量"入口块（settings.section 导航）
- **重做**：点开后的页面内容，依据参考图1 与参考图3 重新设计
- **删除**：API 标价折算等灰色块，以及预算/导出/会话列表/效率分析/AI 分析等多余模块
- **暂缓（本轮不做）**：图2 的消费金额(CNY)图与 API 请求次数面积图、"模型/API Key"切换（DSH 会话事件不含 API Key，无法按 Key 统计）

## 2. 页面结构（自上而下）

| 区块 | 来源 | 说明 |
|---|---|---|
| ① 顶部统计卡 ×6 | 图1 | 请求总数、已计量、Token 总数、缓存命中 Token、覆盖率、活跃天数；跟随 7/30/90 天范围切换 |
| ② 每日活动热力图 | 图1 | 日历热力图，强度指标按**当日请求数**，tooltip 显示当日 token 明细（输入/输出/缓存） |
| ③ 模型板块 | 图1 最下方 | **展示用户配置的全部模型**（投影记录中的每个 provider/model 路由各一行，不裁剪、不只显示单个模型），列：模型、提供方、请求数、已计量、Token 数、占比（进度条）；顶部搜索框过滤；默认按 Token 数降序 |
| ④ Tokens 堆叠柱状图 | 图3 | 按天三段堆叠：输入(命中缓存)=浅蓝 / 输入(未命中缓存)=中蓝 / 输出=深蓝；hover 显示当日三段明细；顶部显示区间总量 |
| ⑤ 其余模块 | — | 预算面板、导出、会话列表、效率/运行信号、AI 用量分析、轨迹分析、日详情下钻、pricingNotice、USD 估算卡：**全部裁剪** |

## 3. 数据层改造（Host 侧）

### 3.1 投影扩展（`src/projection.ts`、`src/types.ts`）
- 投影 key 改为专属 `tokenDay`，`stateVersion` 6 → 7（key 不同故不与 github 版缓存冲突；历史数据由启动时 `warmHistory` 冷回放重建）
- **按天请求数**：`days[]` 每条增加 `requests: { assistant, compaction, billed }`
- **已计量请求数**：汇总与模型记录各新增 `billedRequests`；`totalRequests = assistantRequests + compactionRequests`
- **口径**：
  - billed = 产生非零 usage（四桶合计 > 0）的请求
  - `llm/retry` 事件仅计入 assistantRequests（尝试），不计 billed
  - 同请求多事件去重沿用现有 `lastAssistant`(turn/step) 机制
- 覆盖率 = billedRequests / totalRequests；活跃天数 = 范围内有请求或 token 的天数

### 3.2 删除项（`src/index.ts`、`src/rpc.ts`、`src/budget-settings.ts` 等）
- RPC 端点全部删除：`budget/read`、`budget/write`、`analysis/models`、`usage/analyze`、`trajectory/analyze`（预算与 AI 分析随之裁剪）
- 删除 settings 命名空间注册、`budget-settings.ts`、`pricing.ts`（USD 表与成本估算 UI 已删，CNY 价格表留待后续金额图迭代）、`usage-analysis.ts`、`trajectory-analysis.ts`
- 注入精简：去掉 `llm`、`agentDefaultModel`、`settings`、`connection` 等不再需要的服务，保留 `sessionProjections`、`sessionProjectionCache`、`sessionQuery`、`sessions`
- 保留：投影注册、历史 warm-up（Client 数据经投影值直读，无需 RPC）

### 3.3 命名专属化
包名 `dsh-token-day`；插件 `name`（`token-day-recorder`）；投影 key `tokenDay`；`SessionProjectionMap` 类型增强；locale 命名空间（`settings.tokenDay`）；settings.section slot id（`token-day`）；导航文案保留"token用量"

## 4. UI 层改造（Client 侧）

重写 `src/client/TokenUsageSection.tsx` 主体（`TokenUsageSection.module.css` 精简并追加图表样式）：

1. **统计卡**：6 张（见上表①），删除估算成本/缓存节省/价格覆盖率/会话数卡
2. **热力图**：复用现有日历组件，强度改按请求数
3. **模型板块**：表格列出**投影记录的全部模型路由**（每行一个 provider/model，即使只用过一次也保留），列 = 模型、提供方、请求数、已计量、Token 数、占比（进度条）；搜索框按模型名/提供方过滤；默认按 Token 数降序；不截断、不预设单一模型；删除金额列与 cost 排序
4. **Tokens 堆叠柱状图**（图3）：SVG 自绘（不引入图表库依赖），按天三段堆叠 + hover tooltip 明细 + 区间总量；跟随范围切换
5. **删除**：BudgetPanel、ExportControls、EfficiencyPanel、OperationsPanel、UsageAnalysisPanel、TrajectoryAnalysisPanel、pricingNotice、DayDrilldown、会话表及其状态逻辑
6. **入口裁剪**（`src/client/index.ts`）：仅保留 slot 注册与渲染（`slots`/`locale`/`sessions` 注入），删除 budget/download/session-open/analysis 注入与 hooks

> 说明：若后续还需展示"已配置但从未产生请求"的模型（请求数/Token 数为 0 的空行），需接入 `llm` 模型目录服务（本轮不引入，默认仅展示有记录的路由，避免重新引入 llm 依赖与 RPC）。

## 5. 工程搭建与集成

1. 复制 github 版 `src/`、`assets/` 至 `D:\codex\dsh-token-day`（LICENSE/README 更换为专属）
2. 补齐构建配置：`tsdown.config.ts`（自包含，含 lightningcss CSS Modules 内联插件）、`tsconfig.host.json`、`tsconfig.client.json`，产出 `lib/index.js` + `lib/client.js`
3. `package.json`：`dsh.bundle.patch`、`dsh.client` 声明；peerDependencies 精简为实际所需 `@deepseek-ai/*`（cordis、dsh-session、dsh-session-projection、dsh-session-projection-cache、dsh-session-query、dsh-session-persistence、dsh-compaction、dsh-llm、dsh-llm-retry、dsh-client-runtime、dsh-client-connection、dsh-client-ui-slots、dsh-client-locale 等）
4. web profile 集成（**程序完成后执行**）：`profiles/web/package.json` dependencies 加 `"dsh-token-day": "link:D:/codex/dsh-token-day"`、bundles 加 `dsh-token-day`；`pnpm install`；重启 `dsh web`
5. 构建 → 重启 → 验证

## 6. 验证与验收

- `pnpm build`（Host+Client）、`typecheck`（host+client）通过
- 重启后 http://127.0.0.1:3080 设置页出现"token用量"入口；页面按第 2 节结构呈现
- 用真实会话核对：6 卡数值、热力图、模型板块（**全部模型路由均出现**）、Tokens 柱状图与投影数据一致；范围切换生效
- 与 github 版并存无冲突（投影 key 不同）；移除本地插件无残留
- 已知边界：历史会话首次启用时冷回放重建（量大时后台渐进）；Tokens 柱状图为自绘样式

## 7. 默认决策（实施时不再问，评审可调整）

- 插件/UI 名：`dsh-token-day`，导航显示"token用量"
- 热力图强度按请求数；统计卡与 Tokens 图跟随范围切换；模型板块显示全部模型路由（全量，不随范围）
- 消费金额图、请求次数图、"模型/API Key"切换：暂缓，后续迭代再加（届时补 CNY 价格表）
- 参考插件（若后续提供）到位后另做差异对照，不阻塞本计划
