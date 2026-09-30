import type { Locale } from '@/lib/contracts';
import en from './messages/en.json';
import bn from './messages/bn.json';

export function errorText(locale:'en'|'bn',code:string):string {
  const catalog:Record<string,string>=locale==='bn'?bn:en;
  return catalog['error'+code] ?? catalog.errorINTERNAL_ERROR!;
}

export type MessageKey = keyof typeof en;
export function messages(locale: Locale): typeof en {
  return locale === 'bn' ? bn : en;
}
