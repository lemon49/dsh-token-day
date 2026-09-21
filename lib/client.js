/**
 * dsh-hot-restart — client half (Web profile).
 *
 * 在「设置 → 通用」最底部贡献一行「热重启 DSH 服务」：显示当前进程事实，
 * 一个按钮就能重启后端。点击后轮询 host 的 `/api/hot-restart/status`，
 * 等服务重新应答（即新进程起来了）再自动刷新页面 —— 这就是"热"字的全部
 * 含义：用户不需要自己去猜什么时候刷新。
 *
 * 这是手写的 `__ModuleLoader__` 工厂（不经打包）：DSH 的 client bundle 契约
 * 就是 `window.__ModuleLoader__.load({ id, factory })`，`id` 必须等于包名，
 * 外部依赖经 `require(...)` 从宿主模块表取得。
 * @module dsh-hot-restart/client
 */

window.__ModuleLoader__.load({
  id: 'dsh-hot-restart',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    let react = require('react')
    let react_jsx_runtime = require('react/jsx-runtime')

    //#region styles
    const CSS = [
      '.hr_row{display:flex;align-items:center;gap:14px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.25));background:var(--dsw-alias-bg-layer-3,transparent);border-radius:12px}',
      '.hr_main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}',
      '.hr_title{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,inherit)}',
      '.hr_desc{font-size:11px;line-height:17px;color:var(--dsw-alias-label-tertiary,#888)}',
      '.hr_side{display:flex;align-items:center;gap:10px;flex:none}',
      '.hr_btn{cursor:pointer;border:1px solid rgba(229,72,77,.45);background:var(--dsw-specific-tip,transparent);color:#e5484d;border-radius:8px;height:28px;padding:0 12px;font-size:12px;line-height:26px;white-space:nowrap}',
      '.hr_btn:hover{background:rgba(229,72,77,.12)}',
      '.hr_btn:disabled{opacity:.45;cursor:default}',
      '.hr_msg{font-size:11px;line-height:17px;max-width:36ch}',
      '.hr_ok{color:#30a46c}',
      '.hr_err{color:var(--dsw-state-error-primary,#d9534f)}',
      '.hr_idle{color:var(--dsw-alias-label-tertiary,#888);font-size:11px;white-space:nowrap;font-variant-numeric:tabular-nums}',
    ].join('')
    const TAG_ID = 'dsh-hot-restart/hot-restart.css'
    if (typeof document !== 'undefined'
      && document.querySelector('style[data-plugin-css=' + JSON.stringify(TAG_ID) + ']') === null) {
      const tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-hot-restart'
      tag.dataset.pluginCss = TAG_ID
      tag.textContent = CSS
      document.head.appendChild(tag)
    }
    const cls = {
      row: 'hr_row',
      main: 'hr_main',
      title: 'hr_title',
      desc: 'hr_desc',
      side: 'hr_side',
      btn: 'hr_btn',
      msg: 'hr_msg',
      ok: 'hr_ok',
      err: 'hr_err',
      idle: 'hr_idle',
    }
    //#endregion

    //#region locales
    const NS = 'hotRestart'
    const zh = {
      'title': '热重启 DSH 服务',
      'desc': '先用原启动命令拉起新进程，页面会自动等待并重连。正在运行的任务会被中断，会话记录与历史都会保留。',
      'restart': '立即重启',
      'restarting': '正在重启…',
      'waiting': '等待新进程启动…',
      'done': '重启完成（PID {pid}），正在刷新页面…',
      'confirm': '确定要重启 DSH 服务吗？\n\n正在运行的任务会被中断，但会话内容与历史都会保留。',
      'timeout': '等待超时：新进程可能启动失败，请查看重启日志。',
      'failed': '重启请求失败',
      'idle': '运行中 · PID {pid} · 已运行 {uptime}',
      'loading': '读取进程状态…',
      'uptime.sec': '{n} 秒',
      'uptime.min': '{n} 分钟',
      'uptime.hour': '{n} 小时',
      'uptime.day': '{n} 天',
    }
    const en = {
      'title': 'Hot restart the DSH service',
      'desc': 'Spawns a fresh process with the exact original command; the page waits and reconnects by itself. Running tasks are interrupted, sessions and history are kept.',
      'restart': 'Restart now',
      'restarting': 'Restarting…',
      'waiting': 'Waiting for the new process…',
      'done': 'Restarted (PID {pid}), reloading…',
      'confirm': 'Restart the DSH service now?\n\nRunning tasks will be interrupted; sessions and history are kept.',
      'timeout': 'Timed out: the new process may have failed to start — check the relaunch log.',
      'failed': 'Restart request failed',
      'idle': 'Running · PID {pid} · up {uptime}',
      'loading': 'Reading process state…',
      'uptime.sec': '{n}s',
      'uptime.min': '{n}m',
      'uptime.hour': '{n}h',
      'uptime.day': '{n}d',
    }
    //#endregion

    //#region api
    const API = '/api/hot-restart'

    /** 同源请求 host 的重启端点；任何失败都收敛成 `{ ok: false }`。 */
    function api(path, method) {
      return fetch(API + path, { method: method || 'GET' })
        .then((r) => r.json())
        .catch((e) => ({ ok: false, error: { message: String((e && e.message) || e) } }))
    }

    const sleep = (ms) => new Promise((r) => { setTimeout(r, ms) })

    /** 把秒数写成一句人话。 */
    function humanUptime(sec, t) {
      if (!Number.isFinite(sec) || sec < 0) return ''
      if (sec < 60) return t('uptime.sec', { n: String(Math.round(sec)) })
      if (sec < 3600) return t('uptime.min', { n: String(Math.floor(sec / 60)) })
      if (sec < 86400) return t('uptime.hour', { n: String(Math.floor(sec / 3600)) })
      return t('uptime.day', { n: String(Math.floor(sec / 86400)) })
    }
    //#endregion

    //#region RestartRow (settings.general.item)
    /** 「设置 → 通用」里的一行：进程事实 + 一键重启 + 重启后的等待/重连。 */
    function RestartRow(props) {
      const t = props.t
      const [phase, setPhase] = react.useState('idle')
      const [facts, setFacts] = react.useState(null)
      const [message, setMessage] = react.useState('')
      const [failed, setFailed] = react.useState(false)

      react.useEffect(() => {
        let active = true
        api('/status').then((r) => {
          if (!active) return
          if (r && r.ok && r.value) setFacts(r.value)
        })
        return () => { active = false }
      }, [])

      const busy = phase === 'restarting' || phase === 'waiting'

      const begin = react.useCallback(async () => {
        if (busy) return
        const confirmed = typeof window.confirm === 'function' ? window.confirm(t('confirm')) : true
        if (!confirmed) return
        setMessage('')
        setFailed(false)
        setPhase('restarting')

        const res = await api('/restart', 'POST')
        if (!res || !res.ok) {
          setPhase('failed')
          setFailed(true)
          setMessage((res && res.error && (res.error.message || res.error.code)) || t('failed'))
          return
        }

        const oldPid = res.value && res.value.oldPid
        setPhase('waiting')

        // 服务会先断开、再由新进程重新应答。必须等"断过又重新应答"才算重启完成 ——
        // 只看单次成功会在旧进程尚未退出时误判成完成。
        const deadline = Date.now() + 180000
        let sawDown = false
        while (Date.now() < deadline) {
          await sleep(1000)
          const st = await api('/status')
          if (!st || !st.ok) {
            sawDown = true
            continue
          }
          const pid = st.value && st.value.pid
          if (sawDown || (pid !== undefined && pid !== oldPid)) {
            setMessage(t('done', { pid: String(pid === undefined ? '?' : pid) }))
            setFailed(false)
            setPhase('done')
            await sleep(600)
            try { location.reload() } catch (e) { /* 页面已在刷新 */ }
            return
          }
        }

        setPhase('failed')
        setFailed(true)
        setMessage(t('timeout'))
      }, [busy, t])

      const status = (() => {
        if (busy) return { text: phase === 'restarting' ? t('restarting') : t('waiting'), kind: '' }
        if (message !== '') return { text: message, kind: failed ? cls.err : cls.ok }
        if (facts === null) return { text: t('loading'), kind: '' }
        return { text: t('idle', { pid: String(facts.pid), uptime: humanUptime(facts.uptimeSec, t) }), kind: cls.idle }
      })()

      return (0, react_jsx_runtime.jsxs)('div', {
        className: cls.row,
        'data-hot-restart-row': true,
        children: [
          (0, react_jsx_runtime.jsxs)('div', {
            className: cls.main,
            children: [
              (0, react_jsx_runtime.jsx)('div', { className: cls.title, children: t('title') }),
              (0, react_jsx_runtime.jsx)('div', { className: cls.desc, children: t('desc') }),
            ],
          }),
          (0, react_jsx_runtime.jsxs)('div', {
            className: cls.side,
            children: [
              status.text === ''
                ? null
                : (0, react_jsx_runtime.jsx)('span', {
                  className: status.kind === '' ? cls.msg + ' ' + cls.idle : cls.msg + ' ' + status.kind,
                  children: status.text,
                }),
              (0, react_jsx_runtime.jsx)('button', {
                type: 'button',
                className: cls.btn,
                disabled: busy,
                onClick: () => { void begin() },
                children: busy ? t('waiting') : t('restart'),
              }),
            ],
          }),
        ],
      })
    }
    //#endregion

    //#region client entry
    const inject = ['slots', 'locale']

    /** 注册字典并把自己挂进「设置 → 通用」的底部。 */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-hot-restart: dictionaries')
      const t = ctx.locale.bind(NS)
      ctx.slots.inject('settings.general.item', () => ctx.slots.register({
        name: 'settings.general.item',
        id: 'hot-restart',
        order: 90,
        locale: NS,
      }, (slotProps) => RestartRow({ ...slotProps, t })))
    }
    //#endregion

    exports.RestartRow = RestartRow
    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})