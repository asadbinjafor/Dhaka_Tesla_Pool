'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from './session-provider';
import { useView } from './view-provider';
import { Preferences } from './preferences';
import { errorText } from '@/i18n/catalog';
import { isLocale } from '@dtp/contracts';

export function AccountScreen(){
  const {dictionary:t,locale}=useView();
  const session=useSession();const router=useRouter();
  useEffect(()=>{if(!session.loading && !session.user)router.replace(`/${locale}/sign-in`);},[session.loading,session.user,locale,router]);
  if(session.loading || !session.user)return <main id="main-content" tabIndex={-1} className="p-8">{t.loading}</main>;
  return <main id="main-content" tabIndex={-1} className="mx-auto min-h-dvh max-w-5xl p-6 md:p-12">
    <header className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-xl font-bold">{t.brand}</h1><Preferences/></header>
    <section className="mt-12 rounded-2xl border border-line bg-panel p-8">
      <h2 className="text-2xl font-bold">{t.yourAccount}</h2>
      <dl className="mt-6 space-y-4"><div><dt className="text-muted">{t.name}</dt><dd>{session.user.displayName}</dd></div><div><dt className="text-muted">{t.email}</dt><dd className="break-all">{session.user.email}</dd></div><div><dt className="text-muted">{t.accountRole}</dt><dd>{session.user.role==='DRIVER'?t.driverRole:t.passengerRole}</dd></div></dl>
      <p className="mt-6 text-muted">{t.accountPrivacy}</p>
      <button className="control mt-6 px-5" disabled={session.authPending} onClick={async()=>{try{await session.logout();const current=window.location.pathname.split('/')[1];router.replace(`/${isLocale(current)?current:locale}/sign-in`);}catch{}}}>{session.authPending?t.working:t.signOut}</button>
      {session.authError && <p role="alert" className="mt-4">{errorText(locale,session.authError)}</p>}
    </section>
  </main>;
}
