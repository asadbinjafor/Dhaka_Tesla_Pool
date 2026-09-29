'use client';
import Link from 'next/link';
import { useView } from './view-provider';

export function NotFoundView() {
  const { dictionary: t, locale } = useView();
  return <main id="main-content" tabIndex={-1} className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center p-8">
    <h1 className="text-3xl font-bold">{t.notFoundTitle}</h1>
    <p className="my-5 text-muted">{t.notFoundDescription}</p>
    <Link className="primary-action w-fit" href={`/${locale}/sign-in`}>{t.backToSignIn}</Link>
  </main>;
}
