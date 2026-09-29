'use client';

import { usePathname, useRouter } from 'next/navigation';
import { localePath } from '@dtp/contracts';
import { rememberPreference, useView } from './view-provider';

export function Preferences() {
  const { locale, state, dictionary: t, setTheme } = useView();
  const pathname = usePathname();
  const router = useRouter();
  return <nav className="flex flex-wrap items-center justify-end gap-2" aria-label={t.preferences}>
    <button type="button" className="control px-4 font-semibold" aria-label={t.switchLanguage} onClick={() => {
      const nextLocale = locale === 'en' ? 'bn' : 'en';
      rememberPreference('dtp-locale', nextLocale);
      const stablePath = localePath(pathname, nextLocale);
      router.replace(stablePath + window.location.search, { scroll: false });
    }}>{locale === 'en' ? 'বাংলা' : 'English'}</button>
    <button type="button" className="control gap-2 px-3" aria-label={state.theme === 'dark' ? t.switchLight : t.switchDark}
      onClick={() => setTheme(state.theme === 'dark' ? 'light' : 'dark')}>
      <span aria-hidden="true">{state.theme === 'dark' ? '☀' : '☾'}</span>
      <span>{state.theme === 'dark' ? t.light : t.dark}</span>
    </button>
  </nav>;
}
