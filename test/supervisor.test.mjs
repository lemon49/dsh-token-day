/**
 * 前台启动器 `scripts/dsh-foreground.ps1` 的端到端测试（不需要真的开一个终端窗口）。
 *
 * 验的就是那句承诺 —— **重启之后 dsh 仍在同一个终端里**：
 *   - 启动器看到请求字条后会原样再跑一遍命令；
 *   - 第二次启动的父进程还是那个启动器进程（同一个 shell），不是别的什么东西；
 *   - dsh 能看到 `DSH_TOOLBOX_REQUEST`，也就是它自己认得出托管模式；
 *   - 反过来，启动器没了（Ctrl+C / 关窗口），它下面的 dsh 也活不成。
 *
 * 找不到 PowerShell 就跳过（Windows 才有这个脚本）。
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const SCRIPT = join(HERE, '..', 'scripts', 'dsh-foreground.ps1')
const FAKE = join(HERE, 'fixtures', 'fake-dsh.mjs')

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms) })

function findShell() {
  for (const candidate of ['pwsh', 'powershell']) {
    try {
      const probe = spawnSync(candidate, ['-NoProfile', '-Command', 'exit 0'], {
        stdio: 'ignore',
        windowsHide: true,
        timeout: 20000,
      })
      if (probe.status === 0) return candidate
      console.log(`  ${candidate} exit status: ${probe.status}${probe.error ? ` (${probe.error})` : ''}`)
    } catch (error) {
      console.log(`  ${candidate} probe failed: ${String(error?.message ?? error)}`)
    }
  }
  return null
}

const shell = findShell()
if (shell === null) {
  console.log('SKIP  could not start PowerShell here — skipping the supervisor end-to-end test')
  process.exit(0)
}
console.log(`shell = ${shell}`)

const workDir = join(tmpdir(), `dsh-toolbox-supervisor-e2e-${process.pid}`)
rmSync(workDir, { recursive: true, force: true })
mkdirSync(workDir, { recursive: true })
const countPath = join(workDir, 'runs')

function runs() {
  const file = `${countPath}.jsonl`
  if (!existsSync(file)) return []
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => JSON.parse(line))
}

function alive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error?.code === 'EPERM'
  }
}

// 第一次启动就"点重启"，第二次起待着。整条命令当一个字符串传（脚本自己用
// PowerShell 解析器拆），引号包裹路径也顺便验证了；顺手带一个 node 开关，
// 看它有没有原样落到进程的 execArgv 里。
const PROBE = '--title=dsh-toolbox-supervisor-probe'
const commandLine = `"${process.execPath}" ${PROBE} "${FAKE}" "${countPath}" 1 6000`
const child = spawn(shell, [
  '-NoProfile', '-File', SCRIPT,
  '-Launch', commandLine,
], { stdio: 'ignore', windowsHide: true })

const results = []
const deadline = Date.now() + 40000
while (runs().length < 2 && Date.now() < deadline) await sleep(200)

const observed = runs()
console.log('observed runs:', JSON.stringify(observed))
results.push(['the supervisor ran dsh more than once', observed.length >= 2])

const [first, second] = observed
if (first !== undefined && second !== undefined) {
  results.push(['the relaunched dsh got a new pid', first.pid !== second.pid])
  // 这一条就是全部意义所在：新进程的父进程仍然是启动器（用户的那个 shell）。
  results.push(['the relaunched dsh is still a child of the supervisor', second.ppid === child.pid])
  // 启动器把自己的 PID 写进 supervisor.json —— dsh 就是靠它判断"这层壳还在不在"。
  const sessionJson = join(dirname(second.requestPath), 'supervisor.json')
  const recorded = existsSync(sessionJson) ? JSON.parse(readFileSync(sessionJson, 'utf8')) : null
  results.push(['the script leaves its own pid for dsh to trust', recorded?.pid === child.pid])
}
results.push(['dsh sees the supervised-mode variable',
  observed.every((entry) => typeof entry.requestPath === 'string' && entry.requestPath !== '')])
results.push(['node flags survive the supervisor command line',
  observed.every((entry) => Array.isArray(entry.execArgv) && entry.execArgv.includes(PROBE))])

// 关掉启动器 = 关掉终端：它下面的 dsh 必须一起没。
let killed = false
if (second !== undefined) {
  const kill = spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
    stdio: 'ignore',
    windowsHide: true,
    timeout: 20000,
  })
  killed = kill.status === 0
  const gone = Date.now() + 10000
  while (alive(second.pid) && Date.now() < gone) await sleep(200)
  results.push(['closing the supervisor takes dsh down with it', !alive(second.pid)])
}
if (!killed) console.log('taskkill did not report success — see the previous assertion')

rmSync(workDir, { recursive: true, force: true })

let failed = 0
for (const [label, ok] of results) {
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
}
console.log(failed === 0 ? 'ALL PASS' : `${failed} FAILED`)

process.exit(failed === 0 ? 0 : 1)
