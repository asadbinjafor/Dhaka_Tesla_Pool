'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { isLocale, withTheme, clearPrivateView } from '@dtp/contracts';
import { SessionProvider } from './session-provider';
import type { Locale, Theme, ViewState } from '@dtp/contracts';
import { messages } from '@/i18n/catalog';

interface ViewContextValue {
  locale: Locale;
  state: ViewState;
  dictionary: ReturnType<typeof messages>;
  setTheme(theme: Theme): void;
  setAuthDraft(draft: ViewState['authDraft']): void;
}
const ViewContext = createContext<ViewContextValue | null>(null);

export function rememberPreference(name: 'dtp-theme' | 'dtp-locale', value: Theme | Locale) {
  document.cookie = `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

// Root layout owns this provider: changing /en to /bn must not remount private drafts/intents.
export function ViewProvider({ children, initialLocale, initialTheme }: {
  children: ReactNode; initialLocale: Locale; initialTheme: Theme;
}) {
  const pathname = usePathname();
  const routeLocale = pathname.split('/')[1];
  const locale = isLocale(routeLocale) ? routeLocale : initialLocale;
  const [state, setState] = useState<ViewState>(() => ({
    theme: initialTheme,
    authDraft: { name: '', email: '', password: '', confirm: '' },
    bookingDraft: { pickupId: '', destinationId: '', seats: 1 },
    quoteId: null,
    currentRideId: null,
    pendingCommand: null,
    sessionGeneration: 0,
  }));

  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => { document.documentElement.dataset.theme = state.theme; }, [state.theme]);
  const onBoundary=useCallback(()=>setState(current=>clearPrivateView(current)),[]);

  return <ViewContext.Provider value={{
    locale, state, dictionary: messages(locale),
    setTheme: theme => {
      rememberPreference('dtp-theme', theme);
      setState(current => withTheme(current, theme));
    },
    setAuthDraft: authDraft => setState(current => ({ ...current, authDraft })),
  }}><SessionProvider onBoundary={onBoundary}>{children}</SessionProvider></ViewContext.Provider>;
}

export function useView() {
  const context = useContext(ViewContext);
  if (!context) throw new Error('ViewProvider is required');
  return context;
}
