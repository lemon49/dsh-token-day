/**
 * Client 半边（lib/client.js）的加载契约测试。
 *
 * DSH 的 client bundle 契约是 `window.__ModuleLoader__.load({ id, factory })`，
 * 其中 `id` 必须等于包名，`factory(require)` 返回带 `apply`/`inject` 的模块。
 * 这里用假的 `__ModuleLoader__`、`document` 与宿主模块表把 bundle 跑一遍，
 * 确认它注册正确、把「设置 → 通用」那一行挂上去，并且组件能渲染不抛异常。
 */

const registrations = []
globalThis.window = {
  __ModuleLoader__: { load: (registration) => { registrations.push(registration) } },
}

const styleTags = []
globalThis.document = {
  querySelector: () => null,
  createElement: () => ({ dataset: {}, textContent: '' }),
  head: { appendChild: (tag) => { styleTags.push(tag) } },
}

/** 最小 React 替身：组件只要求 useState/useEffect/useCallback。 */
const reactStub = {
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useEffect: () => {},
  useCallback: (fn) => fn,
  createElement: () => null,
  Fragment: Symbol('Fragment'),
}
const jsxStub = {
  jsx: (type, props) => ({ type, props }),
  jsxs: (type, props) => ({ type, props }),
}

const require = (spec) => {
  if (spec === 'react') return reactStub
  if (spec === 'react/jsx-runtime') return jsxStub
  throw new Error(`unexpected external: ${spec}`)
}

await import(new URL('../lib/client.js', import.meta.url).href)

const results = []
results.push(['bundle registers through __ModuleLoader__.load', registrations.length === 1])
const registration = registrations[0]
results.push(['module id equals the package name', registration && registration.id === 'dsh-hot-restart'])
results.push(['factory is callable', typeof registration?.factory === 'function'])

const mod = registration.factory(require)
// 样式注入发生在 factory 内部，所以只能在这里之后断言。
results.push(['styles are injected once', styleTags.length === 1])
results.push(['exports.apply is a function', typeof mod.apply === 'function'])
results.push([
  'exports.inject lists slots and locale',
  Array.isArray(mod.inject) && mod.inject.includes('slots') && mod.inject.includes('locale'),
])

const calls = []
const registeredComponents = []
const ctx = {
  effect: (fn) => { fn(); return () => {} },
  locale: {
    register: (ns, dicts) => { calls.push(['locale.register', ns, Object.keys(dicts)]) },
    bind: () => (key) => key,
  },
  slots: {
    inject: (name, cb) => { calls.push(['slots.inject', name]); cb() },
    register: (opts, component) => {
      calls.push(['slots.register', opts.name, opts.id])
      registeredComponents.push(component)
      return () => {}
    },
  },
}
mod.apply(ctx)

const seat = calls.find((c) => c[0] === 'slots.register')
results.push(['registers into settings.general.item', seat !== undefined && seat[1] === 'settings.general.item'])
results.push(['registration id is hot-restart', seat !== undefined && seat[2] === 'hot-restart'])
results.push(['injects the settings.general.item seat', calls.some((c) => c[0] === 'slots.inject' && c[1] === 'settings.general.item')])
results.push([
  'registers zh and en dictionaries',
  calls.some((c) => c[0] === 'locale.register' && c[2].includes('zh') && c[2].includes('en')),
])

const component = registeredComponents[0]
results.push(['registers a component', typeof component === 'function'])
try {
  const tree = component({ t: (key) => key })
  results.push(['component renders without throwing', tree !== null && typeof tree === 'object'])
} catch (error) {
  results.push(['component renders without throwing', false])
  console.log('render threw:', error)
}

let failed = 0
for (const [label, ok] of results) {
  if (!ok) failed += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
}
console.log(failed === 0 ? 'ALL PASS' : `${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)