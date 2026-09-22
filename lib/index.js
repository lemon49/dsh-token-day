/**
 * dsh-toolbox — host half.
 *
 * 一键热重启 dsh 服务。两条路径都"原样"复现启动命令（`process.execPath` +
 * `process.execArgv` + `process.argv.slice(1)` + 原 cwd + 原 env），新进程绑定同
 * 一个端口，浏览器页面由客户端半边（`lib/client.js`）轮询到新 PID 后自动刷新 ——
 * 所以对用户来说重启是"热"的。区别只在**新进程由谁拉起**：
 *
 *   1. 前台启动器托管（`scripts/dsh-foreground.ps1` 起的 dsh，env 里带着
 *      `DSH_TOOLBOX_REQUEST`）：本进程只留一张"请重启"的字条就退出，终端里那层
 *      壳在**同一个终端**里把它重新拉起来。新进程仍然是那个终端的子进程 ——
 *      Ctrl+C、关窗口照常生效，不会留下没人管的孤儿。
 *   2. 分离进程（直接 `node --import tsx/esm ... bin.ts web` 起的 dsh）：本进程退出
 *      前派一个 detached 的重启助手（`lib/relaunch.js`），助手等旧进程真正消失、
 *      端口释放之后再拉起新进程。这条路上新进程**脱离**了启动它的终端，关掉终端
 *      它也继续跑。
 *
 * 为什么不走 `ctx.subprocess`：DSH 用自己的 Windows Job Object 管理它 spawn
 * 的命令（`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`，见
 * `packages/subprocess/win32-process/src/process.ts`），从那条路出去的助手会
 * 随本进程一起被收割 —— 那样谁也重启不了。分离路径因此用 `node:child_process`
 * 直接 spawn 并以 `detached` 脱离；托管路径干脆不 spawn，交给终端里那层壳。
 *
 * 为什么不写死 `dsh web`：dsh 可能以源码模式启动
 * （`node --import tsx/esm apps/cli/src/bin.ts web`），或以某个包装脚本、
 * 另一个端口启动；忠实复现 `process.argv` 才是唯一正确的做法。
 * @module dsh-toolbox
 */

import { spawn } from 'node:child_process'
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Cordis plugin name。 */
export const name = 'dsh-toolbox'

/** 重启助手的绝对路径（随包发布的独立入口）。 */
const RELAUNCH_HELPER = fileURLToPath(new URL('./relaunch.js', import.meta.url))

/** 本插件 HTTP 路由前缀。 */
export const ROUTE_PREFIX = '/api/toolbox'

/**
 * 新进程携带的重启标记：host 把它塞进新进程的 env，新进程的插件实例据此
 * 在日志里记录"我是一次热重启的结果"，让重启成功与否可被事后确认。
 */
const RESTART_TOKEN_ENV = 'DSH_TOOLBOX_TOKEN'

/**
 * 前台启动器（`scripts/dsh-foreground.ps1`）注入的环境变量，值就是**重启请求文件**
 * 的路径。有这个变量，说明用户的终端里有一层壳在看着本进程：重启该做的是留一张
 * "请重启"的字条然后退出，让那层壳在同一个终端里把它拉起来 —— 而不是派一个脱离
 * 终端的助手，把进程和终端的关系弄断。
 */
const SUPERVISOR_ENV = 'DSH_TOOLBOX_REQUEST'

/** 进程启动时刻，用于上报 uptime。 */
const STARTED_AT = Date.now()

/**
 * 把一个数值夹到合法区间。
 * @param {unknown} value - 待收敛的配置值。
 * @param {number} low - 下界。
 * @param {number} high - 上界。
 * @param {number} fallback - 非法值时的默认值。
 * @returns {number} 合法的整数毫秒数。
 */
function clamp(value, low, high, fallback) {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback
  return Math.min(high, Math.max(low, Math.round(n)))
}

/**
 * 从插件配置解析出完整的重启策略。
 * @param {object} [config] - profile patch 提供的覆盖项。
 * @returns {{ exitDelayMs: number, waitForExitMs: number, killOnTimeout: boolean, hardExitMs: number, allowHostnames: string[], allowRemote: boolean }} 重启时序与访问策略。
 */
export function resolveOptions(config = {}) {
  return {
    exitDelayMs: clamp(config.exitDelayMs, 100, 60000, 1200),
    waitForExitMs: clamp(config.waitForExitMs, 1000, 600000, 120000),
    killOnTimeout: config.killOnTimeout !== false,
    hardExitMs: clamp(config.hardExitMs, 1000, 300000, 20000),
    allowHostnames: Array.isArray(config.allowHostnames)
      ? config.allowHostnames
        .filter((entry) => typeof entry === 'string')
        .map((entry) => entry.trim().toLowerCase())
        .filter((entry) => entry !== '')
      : [],
    allowRemote: config.allowRemote === true,
  }
}

/**
 * 写一个 JSON 响应。
 * @param {import('node:http').ServerResponse} res - 响应对象。
 * @param {number} status - HTTP 状态码。
 * @param {unknown} body - 要序列化的响应体。
 */
function sendJson(res, status, body) {
  const bytes = Buffer.from(JSON.stringify(body), 'utf8')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Length', String(bytes.length))
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.writeHead(status)
  res.end(bytes)
}

/**
 * 只接受同源发起的写请求，并要求 Host 是个可以直连的名字。
 *
 * 重启会打断进程内所有活动会话，所以它绝不能是 CSRF 的靶子：浏览器对同源
 * fetch 一定带上 Origin（或至少 Referer），两者都没有就直接拒绝。
 *
 * 光有同源还不够：攻击者可以把自己的域名解析到 127.0.0.1（DNS rebinding），
 * 此时 Origin 与 Host 都是 `evil.example:3080`，同源检查会放行。所以 Host 必须
 * 是 IP 字面量或 localhost —— 正常访问是 `127.0.0.1:3080`、`192.168.x.x:3080`
 * 这类直连地址，被 rebind 的是域名。确实需要走域名的部署可以把域名写进
 * `allowHostnames`。
 * @param {import('node:http').IncomingMessage} req - 请求对象。
 * @param {string[]} [allowHostnames] - 额外放行的 hostname（小写、不含端口）。
 * @returns {boolean} 是否可判定为同源且 Host 可信。
 */
export function sameOrigin(req, allowHostnames = []) {
  const host = req.headers?.host
  if (typeof host !== 'string' || host === '') return false
  if (!hostTrusted(host, allowHostnames)) return false
  for (const header of ['origin', 'referer']) {
    const raw = req.headers?.[header]
    if (typeof raw !== 'string' || raw === '') continue
    try {
      return new URL(raw).host === host
    } catch {
      return false
    }
  }
  return false
}

/** 无需配置就放行的回环 hostname 写法。 */
const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])

/**
 * hostname 是否是 IP 字面量（点分 IPv4 或任意 IPv6 写法）。
 * @param {string} hostname - 已去掉端口的 hostname。
 * @returns {boolean} 是否为字面量地址。
 */
function isIpLiteral(hostname) {
  const bare = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(bare)) return true
  return bare.includes(':')
}

/**
 * Host 头是否可信：字面量地址、回环名，或显式放行的域名。
 * @param {string} hostHeader - 原始 `Host` 头（含端口）。
 * @param {string[]} allowHostnames - 额外放行的 hostname。
 * @returns {boolean} 是否可信。
 */
function hostTrusted(hostHeader, allowHostnames) {
  let hostname
  try {
    hostname = new URL(`http://${hostHeader}`).hostname
  } catch {
    return false
  }
  if (isIpLiteral(hostname)) return true
  const lower = hostname.toLowerCase()
  if (LOOPBACK_HOSTNAMES.has(lower)) return true
  return allowHostnames.includes(lower)
}

/**
 * 请求是否来自本机回环。重启端点因此对 LAN 上的未认证调用保持关闭 ——
 * 那道认证栅栏护的是 `/api` 的其它路由，不覆盖本插件注册的这条。
 * @param {import('node:http').IncomingMessage} req - 请求对象。
 * @returns {boolean} 是否来自回环。
 */
function isLoopback(req) {
  const address = req.socket?.remoteAddress
  if (typeof address !== 'string' || address === '') return false
  return address === '::1'
    || address === '::ffff:127.0.0.1'
    || address.startsWith('127.')
}

/**
 * 解析本插件的缓存目录：优先 `DSH_HOME/cache/dsh-toolbox`，其次
 * `~/.dsh/cache/dsh-toolbox`，最后系统临时目录。日志、启动记录都放这里。
 * @returns {string} 目录绝对路径；都不可写时为空串。
 */
function resolveCacheDir() {
  const candidates = []
  const home = process.env.DSH_HOME
  if (typeof home === 'string' && home !== '') candidates.push(join(home, 'cache', 'dsh-toolbox'))
  // dsh 的 shellEnv 把 DSH_HOME 注入给**工具**环境，进程自身的 env 里往往没有，
  // 所以按约定回落到 ~/.dsh，最后才是系统临时目录。
  try {
    candidates.push(join(homedir(), '.dsh', 'cache', 'dsh-toolbox'))
  } catch {
    /* 取不到用户目录时忽略这个候选 */
  }
  candidates.push(join(tmpdir(), 'dsh-toolbox'))
  for (const dir of candidates) {
    try {
      mkdirSync(dir, { recursive: true })
      return dir
    } catch {
      /* 试下一个候选目录 */
    }
  }
  return ''
}

/**
 * 解析重启日志的落点。重启后的新进程 stdout/stderr 会接进这个文件，否则它们无处可看。
 * @returns {string} 日志文件绝对路径；目录不可写时为空串。
 */
function resolveLogPath() {
  const dir = resolveCacheDir()
  return dir === '' ? '' : join(dir, 'relaunch.log')
}

/**
 * 进程是否还活着。`signal 0` 不投递任何信号，只回答"存在且我碰得到"。
 * @param {number} pid - 目标进程。
 * @returns {boolean} 是否存活。
 */
function processAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    // EPERM：进程存在但属于别的账户 —— 对"启动器还在不在"这个问题仍是"在"。
    return error?.code === 'EPERM'
  }
}

/**
 * 前台启动器现在还在看着本进程吗？
 *
 * 只看环境变量不够：启动器可能已经被 Ctrl+C 停掉、或者终端窗口被关了，这时若还
 * 傻等它来拉起新进程，服务就再也起不来了。所以严格一点 —— 它必须在
 * `supervisor.json` 里留下一个**仍然存活**的 PID，才认这次托管。
 * @returns {{ active: boolean, requestPath: string, supervisorPid: number|null }} 托管状态。
 */
function supervision() {
  const requestPath = process.env[SUPERVISOR_ENV]
  if (typeof requestPath !== 'string' || requestPath === '') {
    return { active: false, requestPath: '', supervisorPid: null }
  }
  let pid = null
  try {
    // 启动器是 PowerShell 写的，Windows PowerShell 5.1 的 UTF8 输出可能带 BOM，
    // 而 JSON.parse 见到 BOM 会直接抛错 —— 先剥掉再说。
    const raw = readFileSync(join(dirname(requestPath), 'supervisor.json'), 'utf8').replace(/^\uFEFF/u, '')
    const record = JSON.parse(raw)
    if (Number.isInteger(record?.pid) && record.pid > 0) pid = record.pid
  } catch {
    /* 没有凭据文件、或内容坏了：一律当它不在 */
  }
  if (pid === null || !processAlive(pid)) {
    return { active: false, requestPath, supervisorPid: pid }
  }
  return { active: true, requestPath, supervisorPid: pid }
}

/**
 * 把"本进程是怎么起来的"记进缓存目录，供前台启动器**不带参数**时复现。
 * 记不下来不影响任何功能 —— 只是让用户少打一次长命令。
 */
function recordLaunch() {
  const dir = resolveCacheDir()
  if (dir === '') return
  try {
    writeFileSync(join(dir, 'last-launch.json'), `${JSON.stringify({
      execPath: process.execPath,
      execArgv: [...process.execArgv],
      argv: process.argv.slice(1),
      cwd: process.cwd(),
      recordedAt: new Date().toISOString(),
    }, null, 2)}\n`, 'utf8')
  } catch {
    /* 缓存目录不可写：跳过 */
  }
}

/**
 * 往重启日志追加一行；日志不可写绝不致命。
 * @param {string} message - 日志内容。
 */
function appendLog(message) {
  const path = resolveLogPath()
  if (path === '') return
  try {
    appendFileSync(path, `[${new Date().toISOString()}] ${message}\n`, 'utf8')
  } catch {
    /* 日志写不进去不影响重启本身 */
  }
}

/**
 * 面向浏览器与诊断的进程事实。
 * @param {object} [extra] - 附加字段。
 * @returns {object} 可 JSON 序列化的进程描述。
 */
function runtimeFacts(extra = {}) {
  return {
    name: 'dsh-toolbox',
    pid: process.pid,
    startedAt: new Date(STARTED_AT).toISOString(),
    uptimeSec: Math.round((Date.now() - STARTED_AT) / 1000),
    platform: process.platform,
    execPath: process.execPath,
    execArgv: [...process.execArgv],
    argv: process.argv.slice(1),
    cwd: process.cwd(),
    ...extra,
  }
}

/**
 * 把任意抛出物说成一行字。
 * @param {unknown} error - 捕获到的错误。
 * @returns {string} 可读信息。
 */
function describeError(error) {
  return error instanceof Error ? error.message : String(error)
}

/**
 * 请求进程退出，优先走 launcher 的 bounded shutdown（`ctx.appExit`），
 * 这样端口、会话与其它资源都按正常路径释放。
 * @param {object} ctx - 插件上下文。
 * @param {number} code - 退出码。
 */
function requestExit(ctx, code) {
  try {
    const exit = ctx.get?.('appExit')
    if (typeof exit === 'function') {
      exit(code)
      return
    }
  } catch {
    /* 落到硬退出 */
  }
  try {
    process.exit(code)
  } catch {
    /* 已经在退出路径上 */
  }
}

/**
 * 安排本进程退出：先走优雅关闭，兜底再硬退出。
 * @param {object} ctx - 插件上下文。
 * @param {{ exitDelayMs: number, hardExitMs: number }} options - 退出时序。
 */
function armExit(ctx, options) {
  setTimeout(() => { requestExit(ctx, 0) }, options.exitDelayMs)
  // 兜底：优雅关闭若被卡住（例如某个插件 dispose 不收敛），硬退出也一定要发生，
  // 否则接手的一方只能干等，用户看到的是"点了没反应"。
  setTimeout(() => {
    try {
      process.exit(0)
    } catch {
      /* noop */
    }
  }, options.exitDelayMs + options.hardExitMs)
}

/**
 * 安排一次重启：终端里有前台启动器就交给它，否则派分离助手。
 * @param {object} ctx - 插件上下文。
 * @param {{ exitDelayMs: number, waitForExitMs: number, killOnTimeout: boolean, hardExitMs: number }} options - 重启时序。
 * @param {{ restarting: boolean }} state - 本进程的重启状态。
 * @param {number|undefined} port - 当前监听端口，交给助手等它释放。
 * @returns {object} 给 HTTP 响应的结果体。
 */
function scheduleRestart(ctx, options, state, port) {
  if (state.restarting) {
    return { ok: false, error: { code: 'already-restarting', message: 'a restart is already scheduled' } }
  }
  state.restarting = true

  const logPath = resolveLogPath()
  const mode = supervision()

  // 终端里有一层壳看着本进程：不 spawn 任何东西，留张"请重启"的字条就退出，
  // 新进程由那层壳在**同一个终端**里拉起。这是唯一能让重启后的 dsh 仍然属于
  // 用户那个 PowerShell 窗口的做法 —— 进程的 console 归属在创建时就定死了，
  // 事后派一个 detached 进程是"回到"原终端去的。
  if (mode.active) {
    let staged = true
    try {
      writeFileSync(mode.requestPath, `${JSON.stringify({
        pid: process.pid,
        requestedAt: new Date().toISOString(),
      })}\n`, 'utf8')
    } catch (error) {
      // 字条递不出去就不能指望启动器来接；回落到分离助手 —— 宁可脱离终端，也别起不来。
      staged = false
      ctx.logger?.warn?.(`dsh-toolbox: could not stage the supervisor request: ${describeError(error)}`)
    }
    if (staged) {
      ctx.logger?.info?.(
        `dsh-toolbox: restart handed to the terminal supervisor (supervisor ${mode.supervisorPid}, exit in ${options.exitDelayMs}ms)`,
      )
      appendLog(`restart handed to the terminal supervisor: oldPid=${process.pid} supervisorPid=${mode.supervisorPid}`)
      armExit(ctx, options)
      return {
        ok: true,
        value: {
          oldPid: process.pid,
          supervised: true,
          supervisorPid: mode.supervisorPid,
          exitDelayMs: options.exitDelayMs,
          logPath,
        },
      }
    }
  }

  const payload = {
    pid: process.pid,
    execPath: process.execPath,
    // Node 自身的启动参数（`--import tsx/esm` 等）**不在** process.argv 里。
    // 漏掉它，新进程就退化到 Node 的原生 type stripping，而它不做类型分析，
    // 无法内联擦除 `export const enum FiberState`，新进程会当场崩在 ESM 链接。
    execArgv: [...process.execArgv],
    argv: process.argv.slice(1),
    cwd: process.cwd(),
    env: { ...process.env, [RESTART_TOKEN_ENV]: `${Date.now()}-${process.pid}` },
    port,
    logPath,
    waitForExitMs: options.waitForExitMs,
    killOnTimeout: options.killOnTimeout,
  }

  // payload 走文件而非命令行：process.env 序列化后轻易越过 Windows 的
  // 32767 字符命令行上限。
  let payloadPath
  try {
    payloadPath = join(tmpdir(), `dsh-toolbox-${process.pid}-${Date.now()}.json`)
    writeFileSync(payloadPath, JSON.stringify(payload), 'utf8')
  } catch (error) {
    state.restarting = false
    const message = describeError(error)
    ctx.logger?.warn?.(`dsh-toolbox: could not stage the relaunch payload: ${message}`)
    return { ok: false, error: { code: 'payload-write-failed', message } }
  }

  let helper
  try {
    helper = spawn(process.execPath, [RELAUNCH_HELPER, payloadPath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
      cwd: process.cwd(),
      env: process.env,
    })
    helper.unref()
  } catch (error) {
    state.restarting = false
    const message = describeError(error)
    ctx.logger?.warn?.(`dsh-toolbox: relaunch helper failed to start: ${message}`)
    return { ok: false, error: { code: 'helper-spawn-failed', message } }
  }

  ctx.logger?.info?.(
    `dsh-toolbox: restart scheduled (pid ${process.pid}, helper ${helper.pid ?? '?'}, exit in ${options.exitDelayMs}ms)`,
  )
  appendLog(`restart scheduled: oldPid=${process.pid} helperPid=${helper.pid ?? '?'} execArgv=${JSON.stringify(process.execArgv)} argv=${JSON.stringify(process.argv.slice(1))}`)

  armExit(ctx, options)

  return {
    ok: true,
    value: { oldPid: process.pid, helperPid: helper.pid ?? null, exitDelayMs: options.exitDelayMs, logPath },
  }
}

/**
 * 挂载热重启能力：`GET <prefix>/status` 上报进程事实，
 * `POST <prefix>/restart` 安排重启。
 * @param {object} ctx - 携带 `webServer` 的插件上下文。
 * @param {object} [config] - 可选的重启时序覆盖。
 */
export function apply(ctx, config = {}) {
  const options = resolveOptions(config)
  const state = { restarting: false }
  const logPath = resolveLogPath()
  // 若本进程是被上一次热重启拉起来的，标记只消费一次，并在日志里留下证据。
  const bootedByRestart = typeof process.env[RESTART_TOKEN_ENV] === 'string'
    && process.env[RESTART_TOKEN_ENV] !== ''
    ? process.env[RESTART_TOKEN_ENV]
    : ''
  if (bootedByRestart !== '') {
    appendLog(`restarted process is up: token=${bootedByRestart} pid=${process.pid}`)
    delete process.env[RESTART_TOKEN_ENV]
  }

  // 记下"这一次是怎么起来的"：前台启动器不带参数时就复现它。
  recordLaunch()

  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(() => webCtx.webServer.register({
      kind: 'prefix',
      path: ROUTE_PREFIX,
      handler: (req, res) => {
        const method = String(req.method ?? 'GET').toUpperCase()
        let path = ''
        try {
          path = new URL(req.url ?? '/', 'http://dsh.local').pathname
        } catch {
          sendJson(res, 400, { ok: false, error: { code: 'bad-url', message: 'malformed request url' } })
          return
        }

        if (path === `${ROUTE_PREFIX}/status`) {
          if (method !== 'GET') {
            sendJson(res, 405, { ok: false, error: { code: 'method-not-allowed', message: 'Use GET' } })
            return
          }
          sendJson(res, 200, {
            ok: true,
            value: runtimeFacts({
              restarting: state.restarting,
              logPath,
              bootedByRestart,
              // 现算而不是启动时算一次：启动器可能已经被 Ctrl+C 关掉了，
              // 面板要反映的是"此刻还有没有人在终端里看住我"。
              supervised: supervision().active,
            }),
          })
          return
        }

        if (path === `${ROUTE_PREFIX}/restart`) {
          if (method !== 'POST') {
            sendJson(res, 405, { ok: false, error: { code: 'method-not-allowed', message: 'Use POST' } })
            return
          }
          if (!sameOrigin(req, options.allowHostnames)) {
            sendJson(res, 403, { ok: false, error: { code: 'origin-rejected', message: 'same-origin POST required' } })
            return
          }
          if (!options.allowRemote && !isLoopback(req)) {
            sendJson(res, 403, { ok: false, error: { code: 'remote-rejected', message: 'restart is restricted to loopback callers' } })
            return
          }
          const result = scheduleRestart(ctx, options, state, webCtx.webServer.port)
          sendJson(res, result.ok === true ? 202 : 409, result)
          return
        }

        sendJson(res, 404, { ok: false, error: { code: 'not-found', message: `no route for ${method} ${path}` } })
      },
    }), 'dsh-toolbox: restart routes')
  })
}