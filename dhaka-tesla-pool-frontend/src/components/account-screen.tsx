'use client';
import { useRouter } from 'next/navigation';
import { useSession } from './session-provider';
import { useView } from './view-provider';
import {ProductShell} from './product-shell';
import { errorText } from '@/i18n/catalog';
import { isLocale } from '@/lib/contracts';

export function AccountScreen(){
  const {dictionary:t,locale}=useView();
  const session=useSession();const router=useRouter();
  if(session.loading || !session.user)return <ProductShell><p>{t.loading}</p></ProductShell>;
  return <ProductShell><h1 className="text-3xl font-bold">{t.yourAccount}</h1>
    <section className="mt-6 max-w-3xl rounded-2xl border border-line bg-panel p-6">
      <dl className="mt-6 space-y-4"><div><dt className="text-muted">{t.name}</dt><dd>{session.user.displayName}</dd></div><div><dt className="text-muted">{t.email}</dt><dd className="break-all">{session.user.email}</dd></div><div><dt className="text-muted">{t.accountRole}</dt><dd>{session.user.role==='DRIVER'?t.driverRole:t.passengerRole}</dd></div></dl>
      <p className="mt-6 text-muted">{t.accountPrivacy}</p>
      <button className="control mt-6 px-5" disabled={session.authPending} onClick={async()=>{try{await session.logout();const current=window.location.pathname.split('/')[1];router.replace(`/${isLocale(current)?current:locale}/sign-in`);}catch{}}}>{session.authPending?t.working:t.signOut}</button>
      {session.authError && <p role="alert" className="mt-4">{errorText(locale,session.authError)}</p>}
    </section>
  </ProductShell>;
}
