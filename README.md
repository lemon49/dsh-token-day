# dsh-hot-restart

> DSH 热重启插件：在「设置 → 通用」一键重启 dsh 服务。用**原启动命令**拉起新进程，页面自己等着重连。
> One-click hot restart for DeepSeek Harness (dsh): relaunches the exact original command and the browser reconnects by itself.

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 是一个长时间运行的 dsh Web 进程。"改完东西要重启"通常是件麻烦事：得回到终端、Ctrl-C、再敲一遍启动命令，浏览器页面还停在断掉的连接上。这个插件把它变成一个按钮。

---

## 特性

| 能力 | 说明 |
| --- | --- |
| **原样复活** | 用 `process.execPath` + `process.argv.slice(1)` + 原 cwd + 原 env 拉起新进程。源码模式（`node --import tsx/esm apps/cli/src/bin.ts web`）、自定义端口、包装脚本启动——都能忠实复现，不写死 `dsh web`。 |
| **不撞端口** | 重启助手等旧进程真正消失、并确认监听端口已释放，才启动新进程，避免 `EADDRINUSE`。 |
| **页面自动重连** | 前端点完按钮后轮询状态端点，等服务重新应答再自动刷新——你不用猜什么时候刷新。 |
| **收窄的入口** | 重启端点三层设防：只收同源 POST（校验 `Origin`/`Referer`）、Host 必须是字面量地址（挡 DNS rebinding）、调用者必须是回环来源（挡 LAN 上的未认证调用）。 |
| **可诊断** | 重启全过程写进日志文件；新进程的 stdout/stderr 也接进同一个文件，重启后的输出不会凭空消失。 |
| **零运行时依赖** | host 半边只用 `node:*` 内置模块；client 半边手写 `__ModuleLoader__` 工厂，不经打包、不拉依赖。 |

---

## 安装

```bash
dsh plugin --profile web add github:lemon49/dsh-token-day
```

或写进 profile 的 `package.json` 后重装：

```json
{
  "dependencies": { "dsh-hot-restart": "github:lemon49/dsh-token-day" },
  "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-hot-restart"] } }
}
```

装完**需要重启一次 dsh** 让它挂载（这是最后一次手动重启）。

本地开发时用 `link:`：

```bash
dsh plugin --profile web add link:D:\path\to\dsh-hot-restart
```

> 仓库名与包名不一致是历史原因（本仓库原为 `dsh-token-day`）。包名以 `package.json` 的 `name` 为准：`dsh-hot-restart`。

---

## 使用

打开 **设置 → 通用**，页面最底部是「热重启 DSH 服务」：

- 行内显示当前 `PID` 与已运行时长；
- 点「立即重启」→ 二次确认 → 后端安排重启；
- 状态依次变成「正在重启…」→「等待新进程启动…」→「重启完成（PID …），正在刷新页面…」，随后页面自动刷新。

**重启会中断正在运行的任务**（包括 agent 正在跑的回合）。会话记录、历史、目标状态都在磁盘上，不会丢；但正在执行的那一步会停在那里。

---

## 工作原理

```
浏览器                 旧 dsh 进程                       重启助手 (detached)         新 dsh 进程
  │                       │                                  │                        │
  ├─ POST /restart ──────►│                                  │                        │
  │                       ├─ spawn(detached, node relaunch) ─►│                        │
  │◄──── 202 + oldPid ────┤                                  │                        │
  │                       │                                  ├─ 等 PID 消失 ──────────┤
  │                       └─ ctx.appExit(0) ────────────────►│  (必要时强杀)           │
  │                                                          ├─ 等端口释放             │
  │  (轮询 /status 失败)                                     ├─ spawn(原样 argv) ─────►│
  │◄──── 200 + newPid ───────────────────────────────────────┼────────────────────────┤
  └─ location.reload()                                      └─ 退出
```

几个刻意的设计决定：

**为什么不走 `ctx.subprocess`。** DSH 用自己的 Windows Job Object 管理它 spawn 的命令（`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`，见 `packages/subprocess/win32-process/src/process.ts`）。从那条路出去的助手会随 dsh 进程一起被收割——谁也重启不了。这里用 `node:child_process` 直接 spawn，并以 `detached: true` + `unref()` 脱离。

**为什么 payload 走文件而不是命令行。** `process.env` 序列化后很容易越过 Windows 32767 字符的命令行上限，那样重启会在最需要它的时候静默失败。

**为什么不只用 `process.exit()`。** 优先走 `ctx.appExit`，让 launcher 的 bounded shutdown 正常释放端口、flush 会话；只有在它没能在兜底时限内生效时才硬退出。

---

## 配置

写在 profile 的 patch 层里即可覆盖：

```yaml
- id: hot-restart
  config:
    exitDelayMs: 1200      # 响应发出后、请求退出前的等待（100–60000）
    waitForExitMs: 120000  # 助手等旧进程退出的上限（1000–600000）
    killOnTimeout: true    # 超时后是否强杀旧进程
    hardExitMs: 20000      # 优雅退出失效后的硬退出兜底（1000–300000）
    allowHostnames: []     # 额外放行的域名（默认只认 IP 字面量与 localhost）
    allowRemote: false     # 是否允许非回环来源调用重启端点
```

### 为什么默认这么严

重启会打断进程内所有活动会话，而**本插件注册的路由不经过 DSH 那道 `/api` 认证栅栏**（`webServer.register` 挂上去的路由是裸的）。所以三道检查都在插件自己身上：

1. **同源**：浏览器对同源 fetch 必带 `Origin`（至少 `Referer`），两者皆无直接拒绝 —— 挡 CSRF。
2. **Host 必须是字面量地址**：攻击者把自己的域名解析到 `127.0.0.1`（DNS rebinding）时，`Origin` 与 `Host` 会同时是 `evil.example:3080`，同源检查会放行；这一层把它挡回去。确实需要走域名的部署，把域名写进 `allowHostnames`。
3. **调用者必须是回环**：LAN 上的调用方能直接伪造 `Origin` 与 `Host`，同源检查形同虚设；这一层要求来源地址是 `127.x`/`::1`。确有需要时用 `allowRemote: true` 放开。

---

## 日志与排查

重启日志：`$DSH_HOME/cache/dsh-hot-restart/relaunch.log`（`DSH_HOME` 不可写时退到系统临时目录）。

```text
[2026-09-21T11:18:42.186Z] relaunch helper started: oldPid=303936 port=3999 waitForExitMs=15000
[2026-09-21T11:18:43.426Z] old process 303936 exited
[2026-09-21T11:18:43.430Z] port 3999 released=true
[2026-09-21T11:18:43.440Z] new process spawned: pid=310168 argv=[...]
```

新进程的 stdout/stderr 也接进这个文件——重启后的 dsh 输出不会无处可看。

---

## 测试

```bash
node test/host.test.mjs     # HTTP 层：路由、status、同源防护、方法校验、重复请求
node test/engine.test.mjs   # 重启引擎：假服务 old → helper → new 接管同一端口
```

两个测试都不碰真实 dsh 进程。

---

## 已知限制

- 仅面向 **Web profile**（需要 `webServer` 服务）；其他 profile 下 host 半边静默不挂载。
- 重启是**进程替换**，不是零停机切换：从旧进程退出到新进程 bind 之间有几秒窗口，页面此时显示"等待中"。真正的零停机热重载属于 DSH 自带的 HMR/loader diff（改插件树，不换进程）；本插件负责的是那些**必须换进程**的场合。
- 首次安装仍需手动重启一次。

---

## License

MIT