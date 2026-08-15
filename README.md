# dsh-token-day

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）的 Token 用量与计费统计插件。基于 DSH 持久会话日志统计模型请求与 Token 用量，在 Web 设置页提供可视化看板。

## 功能特性

- **顶部统计卡**：请求总数、已计量、Token 总数、缓存命中 Token、活跃天数，支持**当日 / 7 天 / 30 天 / 90 天**范围切换
- **每日活动热力图**：最近 30 周每日请求活跃度，悬停查看当日 Token 明细
- **模型板块**：展示所选时间范围内全部模型路由（模型 / 提供方 / 请求数 / 已计量 / Token 数 / 占比进度条），随范围切换，模型多时表格可滚动
- **Tokens 堆叠柱状图**：按天展示输入（命中缓存 / 未命中缓存）与输出 Token；时间轴从左到右由远及近（最右为最新）；顶部显示范围总量，悬停查看当日三段明细
- **数据口径**：四桶 Token（uncachedInput / output / cacheRead / cacheWrite）；billed = 产生非零 usage 的请求

## 安装

### 方式一：GitHub 安装（推荐）

```sh
dsh plugin --profile web add github:lemon49/dsh-token-day
```

安装后重启 `dsh web` 即可使用。仓库已提交构建产物 `lib/`，无需任何构建授权。

### 方式二：本地目录引用（开发调试）

在 web profile（`~/.dsh/profiles/web`）中：

1. 编辑 `package.json`：

```json
{
  "dependencies": {
    "dsh-token-day": "link:D:/codex/dsh-token-day"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dsh-token-day"
      ]
    }
  }
}
```

2. 安装并重启：

```sh
pnpm install
dsh web
```

## 更新

通过 dsh 命令更新到最新提交：

```sh
dsh plugin --profile web update dsh-token-day
# 或重新安装拉取最新
dsh plugin --profile web add github:lemon49/dsh-token-day
```

更新后重启 `dsh web` 生效。若新版本变更了投影结构，插件会自动回放历史会话重建用量投影（耗时与历史会话量相关，后台渐进完成）。

## 构建

```sh
pnpm install
pnpm build          # 产出 lib/index.js（Host）与 lib/client.js（Client bundle）
pnpm typecheck      # host + client 类型检查
```

## 使用

1. 启动 DSH Web（`dsh web`），打开 http://127.0.0.1:3080
2. 进入 **设置 → Token 用量**
3. 首次启用时，插件会回放历史会话以重建用量投影（数据量大时后台渐进完成）

## 目录结构

```
dsh-token-day/
├── src/
│   ├── index.ts                 # Host 插件入口：投影注册 + 历史回放
│   ├── projection.ts            # tokenDay 投影（按模型/按天聚合，含请求计数）
│   ├── types.ts                 # 类型定义与 SessionProjectionMap 增强
│   └── client/
│       ├── index.ts             # Client 入口：设置页 slot 注册
│       ├── TokenUsageSection.tsx# 看板组件（统计卡/热力图/模型表/柱状图）
│       ├── locales.ts           # zh / en 文案
│       └── TokenUsageSection.module.css
├── tsdown.config.ts             # 自包含构建配置（含 CSS Modules 内联）
├── cordis.patch.yml             # bundle 层：挂载插件行
└── docs/PLAN.md                 # 改造计划文档
```

## 数据说明

- 全部数据来自 DSH 会话事件（`assistant/chunk`、`assistant/message`、`compaction/summary` 等），**不保存提示词或回复正文**
- 投影 key 为 `tokenDay`（stateVersion 8）
- 金额（消费金额/API 标价折算）相关展示不在本轮范围内，后续迭代补充

## 许可证

[MIT](LICENSE)
