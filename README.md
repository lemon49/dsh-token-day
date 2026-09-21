# dsh-toolbox

> DSH 工具箱：一键热重启服务 + 待处理交互提醒。设置集中在**「设置 → 工具箱」独立页面**，不挤在「通用」里。

## 功能

### 一、服务重启

用**完全相同的启动命令**重启 dsh 服务，新进程就绪后页面自动刷新。

| 能力 | 说明 |
| --- | --- |
| **原样复活** | `process.execPath` + `process.argv.slice(1)` + 原 cwd + 原 env。源码模式（`node --import tsx/esm apps/cli/src/bin.ts web`）、自定义端口、包装脚本——都能忠实复现，不写死 `dsh web`。 |
| **不撞端口** | 重启助手等旧进程真正消失、并确认端口释放后才启动新进程，避免 `EADDRINUSE`。 |
| **页面自动重连** | 前端轮询状态端点，等新进程应答再自动刷新。 |
| **可诊断** | 全过程写进日志；重启标记（`DSH_TOOLBOX_RESTART_TOKEN`）让"新进程确实起来了"有据可查。 |

**为什么不走 `ctx.subprocess`**：DSH 用自己的 Windows Job Object 管理它 spawn 的命令（`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`，见 `packages/subprocess/win32-process/src/process.ts`），从那条路出去的助手会随进程一起被收割——那样谁也重启不了。这里用 `node:child_process` 直接 spawn 并以 `detached` 脱离。

### 二、待处理提醒

出现**审批 / 提问 / 计划复核**时弹一条系统通知（Web Notification），浏览器最小化也能看见，点一下回到窗口。

**为什么不监听 `approval/request`**：它是 waterfall，内置的 `ui-approval` 排在前面且处理完**不调 `next()`**，排在它后面的监听器根本轮不到——而注册顺序由 bundle 加载顺序决定，用户插件插不到前面去。所以改读 `ctx.uiSession.sessionStatus`，它已经把三种交互统一投影成 `pendingInteraction`：

```ts
ctx.uiSession.sessionStatus          // HostObservable<Map<SessionId, SessionStatus>>
  → SessionStatus.pendingInteraction.kind ∈ 'approval' | 'question' | 'plan-review'
```

这是**纯观察**：不改审批流程、不依赖监听器顺序、不需要 host 逻辑。

**提醒时机**：

| 场景 | 行为 |
| --- | --- |
| 页面在后台（最小化 / 切标签） | 立刻弹通知 |
| 页面在前台 | 不弹 —— 你已经看得见审批面板 |
| 前台出现、之后你切到后台 | **补弹**，切走那一刻提醒 |
| 同一个待处理请求 | 只弹一次（按 `pending.key` 去重） |
| 请求被处理掉 | 回收 key |

第三行是刻意设计的：前台出现时就记成"已提醒"的话，你切到后台后将永远收不到通知——而那一瞬间正是最需要提醒的时候。所以前台只**跳过**、不记账，等 `visibilitychange` 变 hidden 时重扫补上。

## 为什么是独立页面而不是「通用」里的一行

`settings.general.item` 那一列只堆**单行偏好**（语言、主题、Enter 行为），契约里写明"the owner passes no props at all"——它装不下两个带状态、按钮、说明和日志路径的功能块。

所以改用 `settings.section` 注册一个**独立分区**（侧边栏一项 + 自己的内容列），下面挂两个面板。这也是 `dsh-undo-savepoint` 的做法。

## 安装

```sh
dsh plugin --profile web add link:D:\codex\dsh-toolbox
```

装完**重启一次 dsh**。

> 也可以从 GitHub 装（本仓库原为 `dsh-token-day`，包名以 `package.json` 的 `name` 为准）。

## 使用

**设置 → 工具箱**：

- **服务重启**：显示当前 PID 与运行时长，提供「重新检测」和「立即重启」（有二次确认）。
- **待处理提醒**：总开关、「申请通知权限」、「发送测试」、「仅当页面在后台时提醒」。

### 首次务必点一次「申请通知权限」

浏览器强制要求**用户手势**才能授予通知权限，插件没法自己弹授权框。未授权时通知会被静默丢弃——所以权限状态直接摊在面板里：未授权 → 黄色提示 + 申请按钮；被拒绝 → 红色提示告诉你去站点设置改；不支持 → 红色提示。**不静默失败。**

## 限制

| 场景 | 支持 |
| --- | --- |
| 浏览器最小化时收到审批提醒 | ✅ |
| **浏览器完全关闭**时收到审批提醒 | ❌ client 插件只活在页面里 |
| 重启时保住在跑的任务 | ❌ 重启就是换进程，正在执行的回合会停在那里（会话与历史在磁盘上，不会丢） |

要覆盖"浏览器关掉也要提醒"，得在 `lib/index.js` 里加 host 逻辑弹 PowerShell 原生 toast——host 侧的 `ctx.on` 支持 `{ prepend: true }`，能插到 `ui-approval` 前面去。需要时再说。

## 结构

```
lib/index.js         host 半边：HTTP 路由（/api/toolbox/status、/api/toolbox/restart）+ 重启调度
lib/relaunch.js      detached 重启助手：等旧进程消失、等端口释放、原样拉起新进程
lib/client.js        浏览器半边：「工具箱」设置页 + 两个面板 + 提醒观察逻辑
cordis.patch.yml     插入 host 行
test/host.test.mjs   HTTP 层 13 项断言
test/client.test.mjs 加载契约与提醒行为 28 项断言
test/engine.test.mjs 重启引擎端到端 3 项断言
```

## 测试

```sh
node test/host.test.mjs && node test/client.test.mjs && node test/engine.test.mjs
```

三个测试都不碰真实 dsh 进程。

## License

MIT