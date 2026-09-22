/**
 * dsh-toolbox — host half.
 *
 * 一键热重启 dsh 服务。思路是**自重启**（self-relaunch）：本进程退出之前先派
 * 一个 detached 的重启助手（`lib/relaunch.js`），助手等旧进程真正消失、监听
 * 端口释放之后，用**完全相同的启动命令**（`process.execPath` +
 * `process.argv.slice(1)` + 原 cwd + 原 env）拉起新进程。新进程绑定同一个
 * 端口，浏览器页面由客户端半边（`lib/client.js`）轮询后自动刷新，所以对用户
 * 来说重启是"热"的。
 *
 * 为什么不走 `ctx.subprocess`：DSH 用自己的 Windows Job Object 管理它 spawn
 * 的命令（`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`，见
 * `packages/subprocess/win32-process/src/process.ts`），从那条路出去的助手会
 * 随本进程一起被收割 —— 那样谁也重启不了。这里用 `node:child_process` 直接
 * spawn 并以 `detached` 脱离。
 *
 * 为什么不写死 `dsh web`：dsh 可能以源码模式启动
 * （`node --import tsx/esm apps/cli/src/bin.ts web`），或以某个包装脚本、
 * 另一个端口启动；忠实复现 `process.argv` 才是唯一正确的做法。
 * @module dsh-toolbox
 */

import { spawn } from 'node:child_process'
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
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
 * 解析重启日志的落点：优先 `DSH_HOME/cache/dsh-toolbox`，其次系统临时目录。
 * 重启后的新进程 stdout/stderr 会接进这个文件，否则它们无处可看。
 * @returns {string} 日志文件绝对路径；两处都不可写时为空串。
 */
function resolveLogPath() {
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
      return join(dir, 'relaunch.log')
    } catch {
      /* 试下一个候选目录 */
    }
  }
  return ''
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
 * 派发重启助手并安排本进程退出。
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
    const message = error instanceof Error ? error.message : String(error)
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
    const message = error instanceof Error ? error.message : String(error)
    ctx.logger?.warn?.(`dsh-toolbox: relaunch helper failed to start: ${message}`)
    return { ok: false, error: { code: 'helper-spawn-failed', message } }
  }

  ctx.logger?.info?.(
    `dsh-toolbox: restart scheduled (pid ${process.pid}, helper ${helper.pid ?? '?'}, exit in ${options.exitDelayMs}ms)`,
  )
  appendLog(`restart scheduled: oldPid=${process.pid} helperPid=${helper.pid ?? '?'} execArgv=${JSON.stringify(process.execArgv)} argv=${JSON.stringify(process.argv.slice(1))}`)

  setTimeout(() => { requestExit(ctx, 0) }, options.exitDelayMs)
  // 兜底：优雅关闭若被卡住（例如某个插件 dispose 不收敛），硬退出也一定要发生，
  // 否则助手只能等到 deadline 才强杀，用户看到的是"点了没反应"。
  setTimeout(() => {
    try {
      process.exit(0)
    } catch {
      /* noop */
    }
  }, options.exitDelayMs + options.hardExitMs)

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
          sendJson(res, 200, { ok: true, value: runtimeFacts({ restarting: state.restarting, logPath, bootedByRestart }) })
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