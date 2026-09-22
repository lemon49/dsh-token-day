/**
 * Host 半边（lib/index.js）的 HTTP 层测试：不依赖真实 dsh，用假 cordis 上下文
 * 验证路由注册、status 应答、同源防护、方法校验与错误分支。
 *
 * 唯一会真的派生进程的分支用超长 `exitDelayMs` 拖住，拿到 202 后立刻杀掉
 * helper —— 否则它会在本测试退出后拉起一个新测试进程，无限递归。
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// apply() 会把"本进程是怎么起来的"记进缓存目录，好让前台启动器无参数复现它。
// 测试进程绝不能往用户的真实缓存里写 —— 否则以后无参数启动复现出来的会是
// `node test/host.test.mjs` 这种东西。
process.env.DSH_HOME = join(tmpdir(), `dsh-toolbox-test-home-${process.pid}`)

const mod = await import(new URL('../lib/index.js', import.meta.url).href)

const routes = []
const webServer = {
  port: 3080,
  register(spec) {
    routes.push(spec)
    return () => {}
  },
}
const webCtx = { webServer, effect: (fn) => fn() }
const ctx = {
  logger: { info: () => {}, warn: () => {} },
  get: () => undefined,
  inject: (names, cb) => { cb(webCtx) },
}

mod.apply(ctx, { exitDelayMs: 600000, waitForExitMs: 2000, hardExitMs: 600000 })

function makeRes() {
  const out = { status: 0, headers: {}, body: '' }
  return {
    setHeader(k, v) { out.headers[String(k).toLowerCase()] = v },
    writeHead(s) { out.status = s; return this },
    end(b) { out.body = b === undefined ? '' : Buffer.from(b).toString('utf8') },
    _out: out,
  }
}

const route = routes[0]
console.log('registered routes:', routes.map((r) => `${r.kind} ${r.path}`).join(', '))

async function call(method, url, headers = {}, remoteAddress = '127.0.0.1') {
  const res = makeRes()
  await route.handler(
    { method, url, headers: { host: '127.0.0.1:3080', ...headers }, socket: { remoteAddress } },
    res,
  )
  return { status: res._out.status, json: res._out.body === '' ? null : JSON.parse(res._out.body) }
}

const results = []

const status = await call('GET', '/api/toolbox/status')
results.push(['status 200', status.status === 200 && status.json.ok === true])
results.push(['status carries pid', status.json.value.pid === process.pid])
results.push(['status carries argv', Array.isArray(status.json.value.argv)])
results.push(['status carries execArgv', Array.isArray(status.json.value.execArgv)])
console.log('status ->', status.status, JSON.stringify(status.json.value))

const crossOrigin = await call('POST', '/api/toolbox/restart', { origin: 'http://evil.example' })
results.push(['cross-origin rejected 403', crossOrigin.status === 403 && crossOrigin.json.error.code === 'origin-rejected'])
console.log('cross-origin ->', crossOrigin.status, crossOrigin.json.error.code)

const noOrigin = await call('POST', '/api/toolbox/restart')
results.push(['origin-less rejected 403', noOrigin.status === 403])
console.log('origin-less ->', noOrigin.status)

// DNS rebinding：Origin 与 Host 都指向攻击者域名，同源检查会放行，必须靠
// "Host 得是字面量地址" 这一层挡下。
const rebind = await call(
  'POST',
  '/api/toolbox/restart',
  { host: 'evil.example:3080', origin: 'http://evil.example:3080' },
)
results.push(['dns-rebinding host rejected 403', rebind.status === 403 && rebind.json.error.code === 'origin-rejected'])
console.log('rebinding host ->', rebind.status, rebind.json.error.code)

// LAN 上的未认证调用：同源可伪造，因此必须是回环来源。
const remote = await call(
  'POST',
  '/api/toolbox/restart',
  { origin: 'http://127.0.0.1:3080' },
  '192.168.1.50',
)
results.push(['non-loopback caller rejected 403', remote.status === 403 && remote.json.error.code === 'remote-rejected'])
console.log('non-loopback caller ->', remote.status, remote.json.error.code)

const wrongMethod = await call('GET', '/api/toolbox/restart')
results.push(['GET restart rejected 405', wrongMethod.status === 405])
console.log('GET restart ->', wrongMethod.status)

const unknown = await call('GET', '/api/toolbox/nope')
results.push(['unknown route 404', unknown.status === 404])
console.log('unknown route ->', unknown.status)

const sameOrigin = await call('POST', '/api/toolbox/restart', { origin: 'http://127.0.0.1:3080' })
results.push(['same-origin accepted 202', sameOrigin.status === 202 && sameOrigin.json.ok === true])
results.push(['response carries oldPid', sameOrigin.json.value.oldPid === process.pid])
results.push(['response carries helperPid', Number.isInteger(sameOrigin.json.value.helperPid)])
console.log('same-origin ->', sameOrigin.status, JSON.stringify(sameOrigin.json.value))

if (Number.isInteger(sameOrigin.json.value.helperPid)) {
  try {
    process.kill(sameOrigin.json.value.helperPid, 'SIGKILL')
    console.log('helper killed:', sameOrigin.json.value.helperPid)
  } catch (e) {
    console.log('helper kill failed:', String(e.message))
  }
}

const again = await call('POST', '/api/toolbox/restart', { origin: 'http://127.0.0.1:3080' })
results.push(['duplicate rejected 409', again.status === 409 && again.json.error.code === 'already-restarting'])
console.log('duplicate ->', again.status, again.json.error.code)

// ---------- 前台启动器托管模式 ----------

// 上面那个实例已经在重启中，这里另起一个模块实例（query 破 ESM 缓存）。
const supervisedMod = await import(new URL('../lib/index.js?supervised', import.meta.url).href)

const sessionDir = join(tmpdir(), `dsh-toolbox-supervisor-test-${process.pid}`)
mkdirSync(sessionDir, { recursive: true })
const requestPath = join(sessionDir, 'restart.request')
const supervisorJsonPath = join(sessionDir, 'supervisor.json')
// 故意带上 BOM：Windows PowerShell 5.1 的 UTF8 输出就是这样的，插件要照样认。
writeFileSync(supervisorJsonPath, `\uFEFF${JSON.stringify({ pid: process.pid })}`, 'utf8')
process.env.DSH_TOOLBOX_REQUEST = requestPath

const supervisedRoutes = []
const supervisedWebCtx = {
  webServer: {
    port: 3080,
    register(spec) { supervisedRoutes.push(spec); return () => {} },
  },
  effect: (fn) => fn(),
}
supervisedMod.apply({
  logger: { info: () => {}, warn: () => {} },
  get: () => undefined,
  inject: (names, cb) => { cb(supervisedWebCtx) },
}, { exitDelayMs: 600000, hardExitMs: 600000 })

const supervisedRoute = supervisedRoutes[0]
async function supervisedCall(method, url, headers = {}) {
  const res = makeRes()
  await supervisedRoute.handler(
    { method, url, headers: { host: '127.0.0.1:3080', ...headers }, socket: { remoteAddress: '127.0.0.1' } },
    res,
  )
  return { status: res._out.status, json: res._out.body === '' ? null : JSON.parse(res._out.body) }
}

const supervisedStatus = await supervisedCall('GET', '/api/toolbox/status')
results.push(['status reports supervised mode', supervisedStatus.json.value.supervised === true])
console.log('supervised status ->', supervisedStatus.status, supervisedStatus.json.value.supervised)

const supervisedRestart = await supervisedCall('POST', '/api/toolbox/restart', { origin: 'http://127.0.0.1:3080' })
console.log('supervised restart ->', supervisedRestart.status, JSON.stringify(supervisedRestart.json.value))
results.push(['supervised restart accepted 202',
  supervisedRestart.status === 202 && supervisedRestart.json.value.supervised === true])
results.push(['supervised restart names the supervisor pid',
  supervisedRestart.json.value.supervisorPid === process.pid])
// 托管路径不派生任何助手 —— 新进程由终端里那层壳负责。
results.push(['supervised restart spawns no helper',
  supervisedRestart.json.value.helperPid === undefined])
results.push(['supervised restart writes the request file',
  JSON.parse(readFileSync(requestPath, 'utf8')).pid === process.pid])

// 启动器已经被 Ctrl+C 关掉（或窗口被关）：这时再"退出等人拉起"就永远起不来了，
// 必须认出来并回落到分离助手。
rmSync(supervisorJsonPath)
const orphaned = await supervisedCall('GET', '/api/toolbox/status')
results.push(['supervised mode is dropped once the supervisor is gone',
  orphaned.json.value.supervised === false])
console.log('orphaned status ->', orphaned.status, orphaned.json.value.supervised)

delete process.env.DSH_TOOLBOX_REQUEST
rmSync(sessionDir, { recursive: true, force: true })

let failed = 0
for (const [label, ok] of results) {
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
}
console.log(failed === 0 ? 'ALL PASS' : `${failed} FAILED`)

// apply() 留下的长延时定时器会拖住事件循环，这里显式收尾。
process.exit(failed === 0 ? 0 : 1)