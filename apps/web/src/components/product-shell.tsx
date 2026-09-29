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
import {CommandDialog} from './command-dialog';

export function ProductShell({children,role}:{children:ReactNode;role?:'PASSENGER'|'DRIVER'}){
  const {dictionary:t,locale}=useView();const session=useSession();const ui=useRideUI();const router=useRouter();const path=usePathname();
  useEffect(()=>{if(!session.loading&&(!session.user||session.reauthRequired)&&!session.authPending)router.replace(`/${locale}/sign-in`);},[session.loading,session.user,session.reauthRequired,session.authPending,router,locale]);
  useEffect(()=>{if(ui.receipt?.action==='CREATE_REQUEST'||ui.receipt?.action==='ACCEPT'){const receipt=ui.receipt;ui.clearReceipt();router.push(`/${locale}/${receipt.action==='CREATE_REQUEST'?'passenger/rides':'driver/pools'}/${receipt.resourceId}`);}},[ui,router,locale]);
  if(session.loading||session.authPending||!session.user||session.reauthRequired)return <main id="main-content" tabIndex={-1} className="p-8">{t.loading}</main>;
  if(role&&session.user.role!==role)return <main id="main-content" tabIndex={-1} className="p-8">{errorText(locale,'FORBIDDEN_ROLE')} <Link href={`/${locale}/account`}>{t.yourAccount}</Link></main>;
  const driver=session.user.role==='DRIVER';
  const links=driver?[['/driver',t.overview],['/driver/requests',t.requests],['/driver/pool',t.currentTrip],['/driver/history',t.history],['/driver/activity',t.activity],['/driver/vehicle',t.vehicle]]:
    [['/passenger',t.overview],['/passenger/book',t.bookRide],['/passenger/ride',t.currentTrip],['/passenger/history',t.history],['/passenger/activity',t.activity]];
  links.push(['/account',t.yourAccount]);links.push(['/guide',t.guide]);
  const brand=<Link className="flex items-center gap-3 text-lg font-bold leading-tight" href={`/${locale}/${driver?'driver':'passenger'}`}><span className="brand-mark" aria-hidden>↝</span><span>{t.brand}<small className="mt-2 block text-xs font-normal tracking-wider text-muted">{t.brandTagline}</small></span></Link>;
  return <div className="min-h-dvh">
    <aside className="product-sidebar hidden border-r border-line p-5 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[236px] lg:flex-col">
      {brand}<p className="eyebrow mt-10 mb-3">{driver?t.driverWorkspace:t.passengerWorkspace}</p>
      <nav aria-label={t.navigation} className="flex flex-col gap-1">{links.map(([href,label])=><Link key={href} href={`/${locale}${href}`} aria-current={path===`/${locale}${href}`?'page':undefined} className="product-nav-link">{label}</Link>)}</nav>
      <Link className="mt-auto border-t border-line pt-5 text-sm text-muted" href={`/${locale}/account`}>{session.user.displayName} · {driver?t.driverRole:t.passengerRole}</Link>
    </aside>
    <div className="lg:ml-[236px]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-5 md:px-8"><div className="lg:hidden">{brand}</div><p className="hidden text-sm text-muted lg:block">{driver?t.driverWorkspace:t.passengerWorkspace} · {t.dhakaTime}</p><Preferences/></header>
      <nav aria-label={t.navigation} className="flex gap-2 overflow-x-auto border-b border-line p-4 lg:hidden">{links.map(([href,label])=><Link key={href} href={`/${locale}${href}`} aria-current={path===`/${locale}${href}`?'page':undefined} className="control shrink-0 px-4 aria-[current=page]:border-accent aria-[current=page]:text-accent">{label}</Link>)}</nav>
      <main id="main-content" tabIndex={-1} className="mx-auto min-w-0 max-w-[1570px] p-5 md:p-8">
        {ui.error&&<p role="alert" className="mb-4 rounded-xl border border-line bg-panel p-4">{errorText(locale,ui.error)}</p>}
        {ui.intent&&<section aria-live="polite" className="mb-4 rounded-xl border border-accent p-4"><p>{t.pendingRecovery}</p><button className="control mt-3 px-4" disabled={ui.busy} onClick={()=>void ui.retry()}>{ui.busy?t.working:t.retrySameCommand}</button></section>}
        {children}
        <CommandDialog/>
      </main>
    </div>
  </div>;
}
