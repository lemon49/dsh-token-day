/**
 * dsh-hot-restart — detached relaunch helper.
 *
 * 由 host 半边以 `detached: true` 派生，独立于即将退出的 dsh 进程运行。它做四
 * 件事，然后自己退出：
 *
 *   1. 等旧进程真正消失（轮询 `process.kill(pid, 0)`），必要时强杀；
 *   2. 等它监听的端口释放（否则新进程会撞上 EADDRINUSE）；
 *   3. 用 host 传来的 execPath + argv + cwd + env **原样**拉起新进程；
 *   4. 把诊断写进日志文件，供事后排查。
 *
 * payload 通过**文件**而不是命令行传递：`process.env` 序列化后很容易超过
 * Windows 32767 字符的命令行上限。
 *
 * 用法：`node relaunch.js <payload-json-path>`
 * @module dsh-hot-restart/relaunch
 */

import { spawn } from 'node:child_process'
import { appendFileSync, openSync, readFileSync, rmSync } from 'node:fs'
import { connect } from 'node:net'

/** 睡一会儿。 */
function sleep(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms) })
}

/** 目标进程是否还活着（Windows 也适用）。 */
function alive(target) {
  try {
    process.kill(target, 0)
    return true
  } catch {
    return false
  }
}

/** 回环端口是否仍被监听。超时按"占用"处理，宁可多等一会儿。 */
function portBusy(port) {
  return new Promise((resolve) => {
    const socket = connect({ port, host: '127.0.0.1' })
    const settle = (busy) => {
      socket.destroy()
      resolve(busy)
    }
    socket.setTimeout(400)
    socket.once('connect', () => { settle(true) })
    socket.once('timeout', () => { settle(true) })
    socket.once('error', () => { settle(false) })
  })
}

const payloadPath = process.argv[2]
if (typeof payloadPath !== 'string' || payloadPath === '') {
  console.error('[dsh-hot-restart] relaunch helper: missing payload path')
  process.exit(1)
}

let payload
try {
  payload = JSON.parse(readFileSync(payloadPath, 'utf8'))
  rmSync(payloadPath, { force: true })
} catch (error) {
  console.error('[dsh-hot-restart] relaunch helper: unreadable payload:', error)
  process.exit(1)
}

const { pid, execPath, argv, cwd, env, port, logPath } = payload
if (!Number.isInteger(pid)
  || typeof execPath !== 'string' || execPath === ''
  || !Array.isArray(argv) || argv.length === 0
  || typeof cwd !== 'string' || cwd === '') {
  console.error('[dsh-hot-restart] relaunch helper: malformed payload')
  process.exit(1)
}

const waitForExitMs = Number.isFinite(payload.waitForExitMs) ? payload.waitForExitMs : 120000
const killOnTimeout = payload.killOnTimeout !== false

/** 追加一行诊断日志；日志不可写不致命。 */
function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`
  if (typeof logPath === 'string' && logPath !== '') {
    try {
      appendFileSync(logPath, line, 'utf8')
      return
    } catch {
      /* 落到 stderr */
    }
  }
  try {
    process.stderr.write(`[dsh-hot-restart] ${line}`)
  } catch {
    /* noop */
  }
}

log(`relaunch helper started: oldPid=${pid} port=${port ?? '-'} waitForExitMs=${waitForExitMs}`)

// 1. 等旧进程退出。
const deadline = Date.now() + waitForExitMs
while (alive(pid) && Date.now() < deadline) await sleep(200)

if (alive(pid)) {
  if (killOnTimeout) {
    log(`old process ${pid} still alive after ${waitForExitMs}ms — terminating it`)
    try {
      process.kill(pid, 'SIGKILL')
    } catch (error) {
      log(`terminate failed: ${error instanceof Error ? error.message : String(error)}`)
    }
    for (let i = 0; i < 50 && alive(pid); i += 1) await sleep(100)
    log(`old process ${pid} alive=${String(alive(pid))}`)
  } else {
    log(`old process ${pid} still alive after ${waitForExitMs}ms — starting anyway (killOnTimeout=false)`)
  }
} else {
  log(`old process ${pid} exited`)
}

// 2. 等端口释放，避免新进程 EADDRINUSE。
if (Number.isInteger(port) && port > 0) {
  const portDeadline = Date.now() + 15000
  while (Date.now() < portDeadline && await portBusy(port)) await sleep(200)
  log(`port ${port} released=${String(!(await portBusy(port)))}`)
}

// 3. 起新进程。stdout/stderr 进日志文件，避免重启后的输出无处可看。
let stdio = 'ignore'
if (typeof logPath === 'string' && logPath !== '') {
  try {
    const fd = openSync(logPath, 'a')
    stdio = ['ignore', fd, fd]
  } catch {
    stdio = 'ignore'
  }
}

try {
  const child = spawn(execPath, argv, {
    cwd,
    detached: true,
    stdio,
    windowsHide: true,
    env: env ?? process.env,
  })
  child.unref()
  log(`new process spawned: pid=${child.pid ?? '?'} argv=${JSON.stringify(argv)}`)
} catch (error) {
  log(`FATAL: failed to spawn new process: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}

process.exit(0)