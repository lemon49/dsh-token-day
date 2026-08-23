/** Token billing dashboard registered into Web Settings. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { TokenUsageSection } from './TokenUsageSection.tsx'
import { en, NS, zh, type TokenUsageLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Token billing dashboard copy. */
    'settings.tokenDay': TokenUsageLocaleKey
  }
}

/** Client services required by the Settings contribution. */
export const inject = ['slots', 'locale', 'sessions']

/** Contribute a localized Token billing page to Settings. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'token-day: dictionaries')

  const tokenDayT = ctx.locale.bind(NS)
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'token-day',
    order: 30,
    label: () => tokenDayT('nav'),
    locale: NS,
  }, TokenUsageSection))
}
