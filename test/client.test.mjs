/**
 * dsh-toolbox client bundle 的加载契约与行为测试。
 *
 * 三件事必须成立，否则这个插件就是坏的：
 *   1. bundle 以包名注册，并贡献**一个独立设置分区**（不再是「通用」里的一行）；
 *   2. 分区下挂着「服务重启」和「待处理提醒」两个面板；
 *   3. 提醒的每一个时机分支都对 —— 弹错了是打扰，漏弹了是白装。
 */

// ---------- 浏览器替身 ----------

const registrations = []
const notifications = []
const docListeners = new Map()
const store = new Map()
const injectedStyles = []

class FakeNotification {
  static permission = 'granted'
  static requestPermission = async () => 'granted'
  constructor(title, options) {
    this.title = title
    this.options = options
    notifications.push(this)
  }
  close() {}
}

globalThis.window = {
  __ModuleLoader__: { load: (registration) => { registrations.push(registration) } },
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)) },
  },
  Notification: FakeNotification,
  focus: () => {},
}

globalThis.document = {
  querySelector: () => null,
  createElement: () => ({ dataset: {}, textContent: '' }),
  head: { appendChild: (tag) => { injectedStyles.push(tag) } },
  visibilityState: 'hidden',
  addEventListener: (type, listener) => { docListeners.set(type, listener) },
  removeEventListener: (type) => { docListeners.delete(type) },
}

// Node 24 的 globalThis.navigator 是只读 getter，只能这样替换。
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { permissions: { query: () => Promise.resolve({ onchange: null }) } },
})

// ---------- 加载 bundle ----------

await import(new URL('../lib/client.js', import.meta.url).href)

const reactStub = {
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useEffect: () => {},
  useCallback: (fn) => fn,
  createElement: () => null,
  Fragment: Symbol('Fragment'),
}
const jsxStub = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) }
const require = (spec) => {
  if (spec === 'react') return reactStub
  if (spec === 'react/jsx-runtime') return jsxStub
  throw new Error(`unexpected external: ${spec}`)
}

const results = []
const check = (label, ok) => { results.push([label, ok]) }

check('bundle registers through __ModuleLoader__.load', registrations.length === 1)
const registration = registrations[0]
check('module id equals the package name', registration?.id === 'dsh-toolbox')

const mod = registration.factory(require)
check('exports.apply is a function', typeof mod.apply === 'function')
check('injects uiSession/sessions/locale/slots',
  Array.isArray(mod.inject)
  && ['uiSession', 'sessions', 'locale', 'slots'].every((name) => mod.inject.includes(name)))
check('styles injected once', injectedStyles.length === 1)

// ---------- 假的 client 上下文 ----------

const state = new Map()
let statusListener = null
const slots = []
const locales = []
const rendered = []

const ctx = {
  effect: (fn) => fn(),
  locale: {
    register: (ns, dicts) => { locales.push([ns, Object.keys(dicts)]); return () => {} },
    bind: () => (key) => key,
  },
  slots: {
    inject: (name, cb) => { cb() },
    register: (options, component) => { slots.push([options, component]); return () => {} },
  },
  uiSession: {
    sessionStatus: {
      getSnapshot: () => state,
      subscribe: (listener) => { statusListener = listener; return () => { statusListener = null } },
    },
  },
  sessions: {
    list: { getSnapshot: () => ({ byId: { s1: { displayTitle: '会话一' } } }) },
  },
}

mod.apply(ctx)

check('registers zh and en dictionaries',
  locales.some(([, langs]) => langs.includes('zh') && langs.includes('en')))

// 关键断言：独立分区，而不是「通用」里的一行。
const section = slots.find(([options]) => options.name === 'settings.section')
check('registers its own settings section', section !== undefined)
check('section id is dsh-toolbox', section?.[0].id === 'dsh-toolbox')
check('section carries a nav label', typeof section?.[0].label === 'function')
check('section declares its child slot',
  section?.[0].children?.['toolbox.item']?.kind === 'list')
check('does NOT squeeze into settings.general.item',
  slots.every(([options]) => options.name !== 'settings.general.item'))

const items = slots.filter(([options]) => options.name === 'toolbox.item')
check('registers exactly two toolbox panels', items.length === 2)
check('registers the restart panel', items.some(([options]) => options.id === 'restart'))
check('registers the notify panel', items.some(([options]) => options.id === 'notify'))
check('subscription established without throwing', statusListener !== null)

// 分区外壳应当把子槽位渲出来。
const sectionComponent = section?.[1]
try {
  sectionComponent({ t: (key) => key, renderSlot: (name) => { rendered.push(name); return null } })
} catch (error) {
  console.log('section render threw:', error)
}
check('section renders its child slot', rendered.includes('toolbox.item'))

// 两个面板都能渲染。
for (const [options, component] of items) {
  let ok = false
  try {
    ok = component({ t: (key) => key }) !== null
  } catch (error) {
    console.log(`panel ${options.id} render threw:`, error)
  }
  check(`panel "${options.id}" renders without throwing`, ok)
}

// ---------- 提醒行为 ----------

/** 模拟一次"待处理交互出现"。 */
const appear = (key, kind, sessionId = 's1') => {
  state.set(sessionId, { pendingInteraction: { key, kind, sessionId } })
  statusListener()
}

appear('k1', 'approval')
check('alerts while the page is hidden', notifications.length === 1)
check('notification body carries the session title', String(notifications[0]?.options?.body).includes('会话一'))
check('notification tag is the pending key', notifications[0]?.options?.tag === 'k1')

appear('k1', 'approval')
check('does not repeat the same pending request', notifications.length === 1)

document.visibilityState = 'visible'
appear('k2', 'question')
check('stays silent while the page is visible', notifications.length === 1)

document.visibilityState = 'hidden'
docListeners.get('visibilitychange')?.()
check('catches up when the page goes back to the background', notifications.length === 2)

appear('k3', 'plan-review')
check('alerts for plan review', notifications.length === 3)

state.set('s1', { pendingInteraction: { key: 'k4', kind: 'something-else', sessionId: 's1' } })
statusListener()
check('ignores kinds outside the watch list', notifications.length === 3)

state.clear()
statusListener()
appear('k1', 'approval')
check('reclaims keys after settlement', notifications.length === 4)

FakeNotification.permission = 'denied'
appear('k5', 'approval')
check('stays silent without permission', notifications.length === 4)
FakeNotification.permission = 'granted'

let failed = 0
for (const [label, ok] of results) {
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
}
console.log(failed === 0 ? 'ALL PASS' : `${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)