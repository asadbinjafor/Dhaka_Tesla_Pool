import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isLocale } from '@/lib/contracts';

export function proxy(request: NextRequest) {
  const pathLocale = request.nextUrl.pathname.split('/')[1];
  const preference = request.cookies.get('dtp-locale')?.value;
  const locale = isLocale(pathLocale) ? pathLocale : isLocale(preference) ? preference : 'en';
  if (request.nextUrl.pathname === '/') return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
  const headers = new Headers(request.headers);
  headers.set('x-dtp-locale', locale); // overwrite client claims; never an identity header
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/((?!api(?:/|$)|_next(?:/|$)|images(?:/|$)|favicon.ico|robots.txt).*)'] };
