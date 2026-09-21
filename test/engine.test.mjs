/**
 * 重启引擎端到端测试（不碰真实 dsh 进程）：
 *   启动假服务 old → 派 relaunch helper → 杀掉 old → 验证 new 接管同一端口。
 *
 * 覆盖的关键行为：helper 等旧进程真正消失、等端口释放、用**原样 argv** 拉起
 * 新进程，并把过程写进日志。
 *
 * 子进程一律 `stdio: 'ignore'`：被 SIGKILL 的子进程若还挂着继承来的 stdio，
 * 会让 Node 在退出时踩到 libuv 的 handle 断言。
 */
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const HELPER = join(HERE, '..', 'lib', 'relaunch.js')
const SERVICE = join(HERE, 'fixtures', 'fake-service.mjs')
const PORT = 3999
const LOG = join(tmpdir(), 'dsh-toolbox-test.log')

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms) })

function probe() {
  return fetch(`http://127.0.0.1:${PORT}/`, { headers: { connection: 'close' } })
    .then((r) => r.json())
    .catch((e) => ({ error: String(e && e.message ? e.message : e) }))
}

const results = []

// 1. 旧进程
const oldProc = spawn(process.execPath, [SERVICE, String(PORT), 'old'], { stdio: 'ignore' })
await sleep(1500)
console.log(`old pid = ${oldProc.pid}`)
const before = await probe()
console.log('probe before:', JSON.stringify(before))
results.push(['old process serves the port', before.tag === 'old'])

// 2. payload —— 新进程用 tag 'new'，argv 与旧进程只差这一个参数
const payload = {
  pid: oldProc.pid,
  execPath: process.execPath,
  argv: [SERVICE, String(PORT), 'new'],
  cwd: process.cwd(),
  env: process.env,
  port: PORT,
  logPath: LOG,
  waitForExitMs: 15000,
  killOnTimeout: true,
}
const payloadPath = join(tmpdir(), 'dsh-toolbox-test-payload.json')
writeFileSync(payloadPath, JSON.stringify(payload), 'utf8')

// 3. 派 helper（detached，与 host 半边做法一致）
const helper = spawn(process.execPath, [HELPER, payloadPath], { detached: true, stdio: 'ignore' })
helper.unref()
console.log(`helper pid = ${helper.pid}`)

// 4. 杀旧进程，模拟 dsh 的优雅退出；并等它真的从内核里消失。
const exited = new Promise((resolve) => {
  if (oldProc.exitCode !== null || oldProc.signalCode !== null) { resolve(); return }
  oldProc.once('exit', () => { resolve() })
})
await sleep(1200)
console.log('killing old process...')
oldProc.kill('SIGKILL')
await Promise.race([exited, sleep(5000)])
oldProc.removeAllListeners()

// 5. 等新进程接管
await sleep(4000)
const after = await probe()
console.log('probe after:', JSON.stringify(after))
results.push(['new process took over the port', after.tag === 'new'])
results.push(['new process is a different pid', after.pid !== oldProc.pid])

let failed = 0
for (const [label, ok] of results) {
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
}
console.log(failed === 0 ? 'ALL PASS' : `${failed} FAILED`)

process.exitCode = failed === 0 ? 0 : 1