/**
 * 假 dsh。只做真 dsh 会做的那两件与重启有关的事：
 *
 *   1. 启动时把"我是第几次启动、pid、ppid、有没有看到 DSH_TOOLBOX_REQUEST"追加进
 *      一个 JSONL —— 测试据此证明"重启后的新进程仍然是启动器的孩子"；
 *   2. 前 N 次启动模拟"用户点了重启"：往 `DSH_TOOLBOX_REQUEST` 指的请求文件写一张
 *      字条，然后退出。第 N+1 次起就老老实实待着（stayMs 后自然退出）。
 *
 * 这样不必真的开终端窗口，也能端到端验证 `scripts/dsh-foreground.ps1` 的循环。
 *
 * 用法：node fake-dsh.mjs <countPath> <restartRuns> <stayMs>
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'

const [countPath, restartRunsRaw, stayMsRaw] = process.argv.slice(2)
const restartRuns = Number(restartRunsRaw ?? '1')
const stayMs = Number(stayMsRaw ?? '5000')

const run = existsSync(countPath) ? Number(readFileSync(countPath, 'utf8')) + 1 : 1
writeFileSync(countPath, String(run), 'utf8')
appendFileSync(`${countPath}.jsonl`, `${JSON.stringify({
  run,
  pid: process.pid,
  ppid: process.ppid,
  // 启动器把一个字不差地把开关传给新进程 —— 这正是 execArgv 那个坑的看门断言。
  execArgv: process.execArgv,
  requestPath: process.env.DSH_TOOLBOX_REQUEST ?? null,
})}\n`, 'utf8')

if (run <= restartRuns) {
  const requestPath = process.env.DSH_TOOLBOX_REQUEST
  if (typeof requestPath === 'string' && requestPath !== '') {
    writeFileSync(requestPath, `${JSON.stringify({ pid: process.pid })}\n`, 'utf8')
  }
  process.exit(0)
}

setTimeout(() => { process.exit(0) }, stayMs)
