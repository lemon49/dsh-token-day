/**
 * 测试用假服务：监听一个回环端口，应答自己的 pid 与身份标签。
 * 20 秒后自退，避免测试泄漏进程。
 */
import { createServer } from 'node:http'

const port = Number(process.argv[2])
const tag = String(process.argv[3] ?? 'unknown')

const server = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ ok: true, pid: process.pid, tag }))
})

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`[${tag}] listening on ${port} pid=${process.pid}\n`)
})

setTimeout(() => process.exit(0), 20000)