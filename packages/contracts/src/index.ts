export const locales = ['en', 'bn'] as const;
export type Locale = (typeof locales)[number];
export type Theme = 'dark' | 'light';

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'bn';
}

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

export type ApiErrorCode = 'TEMPORARILY_UNAVAILABLE' | 'NOT_FOUND' | 'INVALID_INPUT' | 'INTERNAL_ERROR';
export interface ApiFailure {
  error: { code: ApiErrorCode; requestId?: string };
}

// These are client presentation containers, never a source of authorization or fares.
export interface ViewState {
  theme: Theme;
  authDraft: { name: string; email: string; password: string; confirm: string };
  bookingDraft: { pickupId: string; destinationId: string; seats: number };
  quoteId: string | null;
  currentRideId: string | null;
  pendingCommand: { key: string; target: string; body: Readonly<Record<string, unknown>> } | null;
  sessionGeneration: number;
}

export function withTheme(state: ViewState, theme: Theme): ViewState {
  return { ...state, theme };
}

export function clearPrivateView(state: ViewState): ViewState {
  return {
    ...state,
    authDraft: { name: '', email: '', password: '', confirm: '' },
    bookingDraft: { pickupId: '', destinationId: '', seats: 1 },
    quoteId: null,
    currentRideId: null,
    pendingCommand: null,
    sessionGeneration: state.sessionGeneration + 1,
  };
}

export function localePath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/');
  if (!isLocale(segments[1])) throw new Error('A locale-prefixed UI path is required');
  segments[1] = locale;
  return segments.join('/');
}
