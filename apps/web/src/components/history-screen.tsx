'use client';
import Link from 'next/link';import {useRouter,useSearchParams} from 'next/navigation';import type {HistoryPage,RideDetail,PoolDetail} from '@dtp/contracts';
import {ProductShell} from './product-shell';import {useView} from './view-provider';import {useOwnedQuery} from './use-owned-query';import {useRideUI} from './ride-ui-provider';import {errorText} from '@/i18n/catalog';import {zoneLabel,dateTime,money} from '@/i18n/format';import {statusLabel} from './ride-screen';
export function HistoryScreen({driver=false}:{driver?:boolean}){
  const {dictionary:t,locale}=useView();const params=useSearchParams();const router=useRouter();const ui=useRideUI();
  const query=useOwnedQuery<HistoryPage<RideDetail|PoolDetail>>((driver?'/driver/trip-history':'/ride-history')+'?'+params.toString());
  const draft=ui.historyDraft??{status:params.get('status')??'ALL',search:params.get('search')??''};const base=`/${locale}/${driver?'driver':'passenger'}/history`;
  function pageUrl(cursor?:string){const next=new URLSearchParams(params);if(cursor)next.set('cursor',cursor);else next.delete('cursor');return base+'?'+next.toString();}
  return <ProductShell role={driver?'DRIVER':'PASSENGER'}><h1 className="text-3xl font-bold">{t.history}</h1><p className="mt-2 text-muted">{t.historyHelp}</p>
    <form noValidate onSubmit={e=>{e.preventDefault();const next=new URLSearchParams({status:draft.status,search:draft.search});router.replace(base+'?'+next);}} className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-line bg-panel p-5"><div className="min-w-36"><label htmlFor="history-status" className="field-label">{t.filterStatus}</label><select id="history-status" value={draft.status} onChange={e=>ui.setHistoryDraft({...draft,status:e.target.value})}><option value="ALL">{t.allStatuses}</option><option value="COMPLETED">{t.statusCOMPLETED}</option><option value="CANCELLED">{t.statusCANCELLED}</option></select></div><div className="min-w-0 grow"><label htmlFor="history-search" className="field-label">{t.searchHistory}</label><input id="history-search" value={draft.search} maxLength={100} onChange={e=>ui.setHistoryDraft({...draft,search:e.target.value})}/></div><button className="primary-action">{t.applyFilters}</button></form>
    {!query.loaded?<p className="mt-6">{t.loading}</p>:query.error?<p role="alert" className="mt-6">{errorText(locale,query.error)} <button onClick={query.refresh} className="control px-4">{t.retry}</button></p>:<>
      {!query.data?.items.length?<p className="mt-6">{t.emptyHistory}</p>:<div className="mt-6 grid gap-4 xl:grid-cols-2">{query.data.items.map(item=>{
        const ride='fare' in item?item:null,pool='members' in item?item:null;
        return <article key={item.id} className="rounded-2xl border border-line bg-panel p-5"><p className="text-accent">{statusLabel(t,item.status)}</p><h2 className="mt-2 text-lg font-bold">{ride?`${zoneLabel(locale,ride.route.pickupId)} → ${zoneLabel(locale,ride.route.destinationId)}`:t.sharedTrip}</h2>{item.endedAt&&<p className="mt-2 text-sm text-muted">{dateTime(locale,item.endedAt)}</p>}
          {ride&&<p className="mt-3">{ride.status==='CANCELLED'?t.noCharge:t.finalFare}: {money(locale,ride.fare.chargePoysha??ride.fare.totalPoysha)}</p>}
          {pool&&<p className="mt-3">{t.passengerRoster}: {pool.members.map(m=>m.displayName).join(', ')}</p>}
          <Link className="control mt-4 px-4" href={`/${locale}/${driver?'driver/pools':'passenger/rides'}/${item.id}`}>{t.openDetails}</Link>
        </article>;
      })}</div>}
      <div className="mt-6 flex flex-wrap gap-3">{params.has('cursor')&&<Link className="control px-4" href={pageUrl()}>{t.firstPage}</Link>}{query.data?.nextCursor?<Link className="primary-action" href={pageUrl(query.data.nextCursor)}>{t.olderTrips}</Link>:query.data?.items.length?<p className="text-muted">{t.endOfHistory}</p>:null}</div>
    </>}
  </ProductShell>;
}
