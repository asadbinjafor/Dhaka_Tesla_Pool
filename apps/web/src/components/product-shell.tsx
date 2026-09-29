'use client';
import {useEffect} from 'react';
import type {ReactNode} from 'react';
import Link from 'next/link';
import {useRouter,usePathname} from 'next/navigation';
import {Preferences} from './preferences';
import {useView} from './view-provider';
import {useSession} from './session-provider';
import {useRideUI} from './ride-ui-provider';
import {errorText} from '@/i18n/catalog';

export function ProductShell({children,role}:{children:ReactNode;role?:'PASSENGER'|'DRIVER'}){
  const {dictionary:t,locale}=useView();const session=useSession();const ui=useRideUI();const router=useRouter();const path=usePathname();
  useEffect(()=>{if(!session.loading&&!session.user)router.replace(`/${locale}/sign-in`);},[session.loading,session.user,router,locale]);
  if(session.loading||!session.user)return <main id="main-content" tabIndex={-1} className="p-8">{t.loading}</main>;
  if(role&&session.user.role!==role)return <main id="main-content" tabIndex={-1} className="p-8">{errorText(locale,'FORBIDDEN_ROLE')} <Link href={`/${locale}/account`}>{t.yourAccount}</Link></main>;
  const driver=session.user.role==='DRIVER';
  const links=driver?[['/driver',t.overview],['/driver/requests',t.requests],['/driver/pool',t.currentTrip],['/driver/history',t.history],['/driver/activity',t.activity],['/driver/vehicle',t.vehicle]]:
    [['/passenger',t.overview],['/passenger/book',t.bookRide],['/passenger/ride',t.currentTrip],['/passenger/history',t.history],['/passenger/activity',t.activity]];
  links.push(['/account',t.yourAccount]);links.push(['/guide',t.guide]);
  return <div className="min-h-dvh">
    <header className="border-b border-line bg-panel px-5 py-5 lg:px-10"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><Link className="flex items-center gap-3 text-lg font-bold" href={`/${locale}/${driver?'driver':'passenger'}`}><span className="brand-mark" aria-hidden>ϟ</span>{t.brand}</Link><Preferences/></div></header>
    <div className="mx-auto grid max-w-7xl lg:grid-cols-[220px_1fr]">
      <nav aria-label={t.navigation} className="flex gap-2 overflow-x-auto border-b border-line p-4 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0 lg:p-6">
        {links.map(([href,label])=><Link key={href} href={`/${locale}${href}`} aria-current={path===`/${locale}${href}`?'page':undefined} className="control shrink-0 justify-start px-4 aria-[current=page]:border-accent aria-[current=page]:text-accent">{label}</Link>)}
        <p className="mt-8 hidden break-words text-sm text-muted lg:block">{session.user.displayName}<br/>{driver?t.driverRole:t.passengerRole}</p>
      </nav>
      <main id="main-content" tabIndex={-1} className="min-w-0 p-5 md:p-8">
        {ui.error&&<p role="alert" className="mb-4 rounded-xl border border-line bg-panel p-4">{errorText(locale,ui.error)}</p>}
        {ui.intent&&<section aria-live="polite" className="mb-4 rounded-xl border border-accent p-4"><p>{t.pendingRecovery}</p><button className="control mt-3 px-4" disabled={ui.busy} onClick={()=>void ui.retry()}>{ui.busy?t.working:t.retrySameCommand}</button></section>}
        {children}
      </main>
    </div>
  </div>;
}
