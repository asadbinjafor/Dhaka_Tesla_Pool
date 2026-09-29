'use client';
import {useEffect} from 'react';import {useRouter} from 'next/navigation';import {isLocale} from '@dtp/contracts';
import {ProductShell} from './product-shell';import {useView} from './view-provider';import {useRideUI} from './ride-ui-provider';import {useOwnedQuery} from './use-owned-query';import {errorText} from '@/i18n/catalog';import {zoneLabel,dateTime} from '@/i18n/format';
interface Dispatch {online:boolean;availableSeats:number;requests:{id:string;displayName:string;pickupId:string;destinationId:string;seats:number;createdAt:string;canFit:boolean}[]}
export function DriverRequestsScreen(){
  const {dictionary:t,locale}=useView();const ui=useRideUI();const query=useOwnedQuery<Dispatch>('/driver/requests',true);const router=useRouter();
  useEffect(()=>{const receipt=ui.receipt;if(!receipt)return;if(receipt.action==='ACCEPT'){const current=window.location.pathname.split('/')[1];ui.clearReceipt();router.push(`/${isLocale(current)?current:locale}/driver/pools/${receipt.resourceId}`);}else if(receipt.action==='SET_AVAILABILITY'){ui.clearReceipt();query.refresh();}},[ui,query,router,locale]);
  const data=query.data;
  return <ProductShell role="DRIVER"><h1 className="text-3xl font-bold">{t.requests}</h1><p className="mt-2 text-muted">{t.dispatchHelp}</p>
    {!query.loaded?<p className="mt-6">{t.loading}</p>:query.error?<p role="alert">{errorText(locale,query.error)} <button onClick={query.refresh} className="control px-4">{t.retry}</button></p>:data&&<>
      <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-panel p-5"><p>{data.online?t.online:t.offline} · {t.availableSeats}: {data.availableSeats}</p><button className="primary-action" disabled={ui.busy||!!ui.intent} onClick={()=>void ui.execute('/driver/availability',{online:!data.online},'PATCH')}>{ui.busy?t.working:data.online?t.goOffline:t.goOnline}</button></section>
      {!data.online?<p className="mt-6">{t.offlineHelp}</p>:!data.requests.length?<p className="mt-6">{t.noRequests}</p>:<div className="mt-6 grid gap-4 xl:grid-cols-2">{data.requests.map(r=><article key={r.id} className="rounded-2xl border border-line bg-panel p-5"><h2 className="text-xl font-bold">{r.displayName}</h2><p className="mt-2">{zoneLabel(locale,r.pickupId)} → {zoneLabel(locale,r.destinationId)}</p><p className="mt-2 text-muted">{t.seatQuantity}: {r.seats} · {dateTime(locale,r.createdAt)}</p><button className="primary-action mt-5" disabled={!r.canFit||ui.busy||!!ui.intent} onClick={()=>void ui.execute(`/driver/requests/${r.id}/accept`,{})}>{ui.busy?t.working:r.canFit?t.acceptRequest:t.notEnoughSeats}</button></article>)}</div>}
    </>}
  </ProductShell>;
}
