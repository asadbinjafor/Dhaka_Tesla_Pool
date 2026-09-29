import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import type { ReactNode } from 'react';
import { isLocale, isTheme } from '@dtp/contracts';
import { ViewProvider } from '@/components/view-provider';
import { SkipLink } from '@/components/skip-link';
import './globals.css';

export const metadata: Metadata = { title: 'Dhaka Tesla Pool' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  const requestHeaders = await headers();
  const routeLocale = requestHeaders.get('x-dtp-locale');
  const preferenceLocale = store.get('dtp-locale')?.value;
  const locale = isLocale(routeLocale) ? routeLocale : isLocale(preferenceLocale) ? preferenceLocale : 'en';
  const preferenceTheme = store.get('dtp-theme')?.value;
  const theme = isTheme(preferenceTheme) ? preferenceTheme : 'dark';
  return <html lang={locale} dir="ltr" data-theme={theme}>
    <body><ViewProvider initialLocale={locale} initialTheme={theme}><SkipLink/>{children}</ViewProvider></body>
  </html>;
}
