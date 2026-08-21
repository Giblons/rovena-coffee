import { en, type TranslationKey } from './en';
import { id } from './id';
import type { LocaleCode } from '@/lib/site';

const dictionaries = { en, id } as const;

export function translate(
  locale: LocaleCode,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  const dict = dictionaries[locale] ?? en;
  let text: string = dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export type { TranslationKey };
