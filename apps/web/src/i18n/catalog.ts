import type { Locale } from '@dtp/contracts';
import en from './messages/en.json';
import bn from './messages/bn.json';

export type MessageKey = keyof typeof en;
export function messages(locale: Locale): typeof en {
  return locale === 'bn' ? bn : en;
}
