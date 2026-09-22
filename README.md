# dsh-toolbox

> DSH 工具箱：一键热重启服务 + 待处理交互提醒。设置集中在**「设置 → 工具箱」独立页面**，不挤在「通用」里。

## 功能

### 一、服务重启

用**完全相同的启动命令**重启 dsh 服务，新进程就绪后页面自动刷新。

| 能力 | 说明 |
| --- | --- |
| **原样复活** | `process.execPath` + `process.execArgv` + `process.argv.slice(1)` + 原 cwd + 原 env。源码模式（`node --import tsx/esm apps/cli/src/bin.ts web`）、自定义端口、包装脚本——都能忠实复现，不写死 `dsh web`。 |
| **不撞端口** | 分离路径下，重启助手等旧进程真正消失、并确认端口释放后才启动新进程，避免 `EADDRINUSE`。 |
| **页面自动重连** | 前端轮询状态端点，等新进程应答再自动刷新。 |
| **可诊断** | 全过程写进日志；重启标记（`DSH_TOOLBOX_TOKEN`）让"新进程确实起来了"有据可查。 |
| **两种托管方式** | 新进程由谁拉起，决定它重启后还属不属于你的终端——见下。 |

#### 重启之后，新 dsh 还在你的终端里吗？

进程的 console 归属在**创建时**就定死了，事后没法"回到"原来的窗口 —— 一个 `detached` 起来的进程不可能重新长回你的 PowerShell。所以这里分两条路，`lib/index.js` 按环境自动选：

| | 分离进程（默认） | 前台启动器托管 |
| --- | --- | --- |
| 怎么进入 | 直接 `node --import tsx/esm apps/cli/src/bin.ts web` | 用 `scripts/dsh-foreground.ps1` 启动 |
| 谁拉起新进程 | 本进程派出的 detached 助手（`lib/relaunch.js`） | 终端里那层壳（启动器脚本） |
| 新进程与终端的关系 | **脱离** —— 关掉那个终端它照样跑 | 仍是那个终端的子进程 —— 关窗口 / Ctrl+C 就停 |
| 面板显示 | 「重启方式：分离进程」 | 「重启方式：前台启动器托管」 |

托管路径下本进程**不 spawn 任何东西**：它往启动器留下的请求文件里写一张"请重启"的字条然后退出，启动器看见字条就在**同一个终端**里原样再跑一遍命令。请求文件旁边还有一份 `supervisor.json`（写着启动器的 PID），本进程**只在那个 PID 仍然存活时**才认托管 —— 启动器被 Ctrl+C 关掉之后再点重启，会自动回落到分离助手，而不是退出到一个没人接的地方。

**为什么不走 `ctx.subprocess`**：DSH 用自己的 Windows Job Object 管理它 spawn 的命令（`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`，见 `packages/subprocess/win32-process/src/process.ts`），从那条路出去的助手会随进程一起被收割——那样谁也重启不了。分离路径因此用 `node:child_process` 直接 spawn 并以 `detached` 脱离；托管路径干脆不 spawn。

#### 让它留在你的终端里

```powershell
# 第一次：把命令整条交给启动器（带引号，"--import" 才不会被 PowerShell 当参数名吃掉）
.\scripts\dsh-foreground.ps1 -Launch 'node --import tsx/esm D:\deepseek-harness\apps\cli\src\bin.ts web' -WorkingDirectory D:\deepseek-harness

# 之后：不给参数，复现插件记下的上一次启动命令
.\scripts\dsh-foreground.ps1
```

不带参数时启动器读 `~/.dsh/cache/dsh-toolbox/last-launch.json` —— 插件每次启动都会把 `execPath / execArgv / argv / cwd` 记进去，所以"原样复活"在托管路径上同样成立，只是执行者从助手换成了你的终端。`-Launch` 收的是**一整条命令的字符串**（用 PowerShell 自己的解析器拆分），不是数组：`-Launch a b c` 那种写法 PowerShell 绑不过去。

### 二、待处理提醒

出现**审批 / 提问 / 计划复核**时弹一条系统通知（Web Notification），浏览器最小化也能看见，点一下回到窗口。

**通知里写的是这条请求本身**，不是笼统的"有人找你"——提醒的全部价值就是让人不必切回页面就知道要批什么、答什么：

| 请求 | 通知标题 | 通知正文 |
| --- | --- | --- |
| 审批工具调用 | `需要审批` | `请求调用 Bash — 需要删掉构建产物` |
| 提问 | `需要回答` | 问题原文，如 `配置写到哪个文件？` |
| 计划复核 | `需要复核` | 复核问题原文 |

内容读自 `PendingApproval.toolName` / `reason` 与 `PendingQuestion.questions[0].question`；字段缺失时退回笼统文案——宁可少说，不编造内容。

标题里**只有请求类型，不带会话标题**。会话标题由 dsh 自动生成、还会随会话内容变，粘到通知标题后面，用户看到的往往是一条已经过期的旧标题（甚至属于别的会话），反而要猜这条提醒是给谁的；正文已经把"批什么、答什么"说清楚了，标题再补一个会话名没有信息增量。所以 client 半边不注入 `sessions` 服务，`describePending()` 只产出标题与正文两段文字。

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
| **重启后仍在原终端里** | ✅ 用 `scripts/dsh-foreground.ps1` 启动；直接 `node ... bin.ts web` 启动则是 ❌（新进程脱离终端） |

要覆盖"浏览器关掉也要提醒"，得在 `lib/index.js` 里加 host 逻辑弹 PowerShell 原生 toast——host 侧的 `ctx.on` 支持 `{ prepend: true }`，能插到 `ui-approval` 前面去。需要时再说。

## 一个必须复现的细节：`execArgv`

dsh 的启动命令是：

```sh
node --import tsx/esm apps/cli/src/bin.ts web
```

`--import tsx/esm` 只存在于 **`process.execArgv`**，**不在 `process.argv` 里**。助手若只复现
`execPath + argv`，新进程就会退化成裸 node 去跑 `.ts`，走 **Node 原生 type stripping**——那是
纯语法擦除、不做类型分析，于是 `vendor/cordis` 的 `export const enum FiberState` 不会被内联
擦除，ESM 链接当场失败：

```
SyntaxError: The requested module '@deepseek-ai/cordis' does not provide an export named 'FiberState'
```

现象就是**点了重启，服务再也没起来**。所以 payload 一定带上 `execArgv`，助手按
`[...execArgv, ...argv]` 拉起新进程；`GET /api/toolbox/status` 也会回报它，`relaunch.log` 里
连完整命令一起记，方便事后核对。

## 结构

```
lib/index.js                 host 半边：HTTP 路由（/api/toolbox/status、/api/toolbox/restart）+ 两条重启路径
lib/relaunch.js              分离路径的重启助手：等旧进程消失、等端口释放、按 execArgv + argv 原样拉起新进程
lib/client.js                浏览器半边：「工具箱」设置页 + 两个面板 + 提醒观察逻辑
scripts/dsh-foreground.ps1   前台启动器：留在终端里跑 dsh，收到请求就在同一窗口重新拉起
cordis.patch.yml             插入 host 行
test/host.test.mjs           HTTP 层与两种托管模式 20 项断言
test/client.test.mjs         加载契约与提醒行为 40 项断言
test/engine.test.mjs         分离路径端到端 4 项断言
test/supervisor.test.mjs     前台启动器端到端 7 项断言
```

## 测试

```sh
node test/host.test.mjs && node test/client.test.mjs && node test/engine.test.mjs && node test/supervisor.test.mjs
```

四个测试都不碰真实 dsh 进程。`supervisor.test.mjs` 会真的起一个 PowerShell 来跑 `scripts/dsh-foreground.ps1`，并断言"第二次启动的父进程仍然是启动器" —— 也就是整个功能的那句承诺；机器上没有可用的 PowerShell 时它会跳过。

## License

MIT