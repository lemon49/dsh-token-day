/** Token billing dashboard and conversation manager registered into Web Settings. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { TokenUsageSection } from './TokenUsageSection.tsx'
import { SessionManagerSection } from './SessionManagerSection.tsx'
import {
  en, MANAGER_NS, managerEn, managerZh, NS, zh,
  type ConversationManagerLocaleKey, type TokenUsageLocaleKey,
} from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Token billing dashboard copy. */
    'settings.tokenDay': TokenUsageLocaleKey
    /** Conversation manager copy. */
    'settings.conversationManager': ConversationManagerLocaleKey
  }
}

/** Client services required by the Settings contributions. */
export const inject = ['slots', 'locale', 'sessions']

/** Contribute a localized Token billing page and the conversation manager to Settings. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'token-day: dictionaries')
  ctx.effect(() => ctx.locale.register(MANAGER_NS, { zh: managerZh, en: managerEn }),
    'token-day: conversation-manager dictionaries')

  const tokenDayT = ctx.locale.bind(NS)
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'token-day',
    order: 30,
    label: () => tokenDayT('nav'),
    locale: NS,
  }, TokenUsageSection))

  const managerT = ctx.locale.bind(MANAGER_NS)
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'conversation-manager',
    order: 40,
    label: () => managerT('nav'),
    locale: MANAGER_NS,
  }, SessionManagerSection))
}
