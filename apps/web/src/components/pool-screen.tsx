'use client';
import {useEffect} from 'react';import Link from 'next/link';import type {PoolDetail} from '@dtp/contracts';
import {ProductShell} from './product-shell';import {useView} from './view-provider';import {useOwnedQuery} from './use-owned-query';import {errorText} from '@/i18n/catalog';import {money,zoneLabel,dateTime,displayNumber} from '@/i18n/format';import {statusLabel} from './ride-screen';
import {useRideUI} from './ride-ui-provider';
export function PoolScreen({id}:{id?:string}){
  const {dictionary:t,locale}=useView();const query=useOwnedQuery<PoolDetail>(id?`/driver/pools/${id}`:'/driver/pools/current',true);const p=query.data;
  const ui=useRideUI();
  useEffect(()=>{if(ui.receipt&&['ARRIVE','START','COMPLETE','DRIVER_CANCEL'].includes(ui.receipt.action)){ui.clearReceipt();query.refresh();}},[ui,query]);
  return <ProductShell role="DRIVER"><h1 className="text-3xl font-bold">{t.currentTrip}</h1>
    {!query.loaded?<p className="mt-6">{t.loading}</p>:query.error?<p role="alert">{errorText(locale,query.error)} <button onClick={query.refresh} className="control px-4">{t.retry}</button></p>:!p?<section className="mt-6 rounded-2xl border border-line bg-panel p-6"><p>{t.noActivePool}</p><Link className="primary-action mt-4" href={`/${locale}/driver/requests`}>{t.requests}</Link></section>:<>
      <section className="mt-6 rounded-2xl border border-accent bg-panel p-6"><h2 className="text-2xl font-bold">Bullet · {statusLabel(t,p.status)}</h2><p className="mt-3">{t.poolOccupancy}: {displayNumber(locale,p.reservedSeats)}/{displayNumber(locale,p.capacity)}</p><p className="mt-3 text-sm text-muted">{t.cashOnly}</p><p className="mt-3 text-sm text-muted">{t.createdAt}: {dateTime(locale,p.createdAt)}</p>{p.endedAt&&<p className="text-sm text-muted">{t.endedAt}: {dateTime(locale,p.endedAt)}</p>}
        {!id&&<Link className="control mt-5 px-4" href={`/${locale}/driver/pools/${p.id}`}>{t.openDetails}</Link>}
        <div className="mt-5 flex flex-wrap gap-3">{p.allowedActions.map(action=>{
          const label=action==='ARRIVE'?'driverArrive':action==='START'?'startTrip':action==='COMPLETE'?'completeTrip':'cancelPool';
          const verb=action==='ARRIVE'?'arrive':action==='START'?'start':action==='COMPLETE'?'complete':'cancel';
          return <button data-command-target={`/driver/pools/${p.id}/${verb}`} key={action} className={action==='CANCEL'?'control px-5':'primary-action'} disabled={ui.busy||!!ui.intent} onClick={()=>ui.confirm({target:`/driver/pools/${p.id}/${verb}`,label,needsReason:action==='CANCEL'})}>{t[label]}</button>;
        })}</div>
      </section>
      <h2 className="mt-8 text-xl font-bold">{t.passengerRoster}</h2><div className="mt-4 grid gap-4 xl:grid-cols-2">{p.members.map(m=><article key={m.id} className="rounded-2xl border border-line bg-panel p-5"><h3 className="text-lg font-bold">{m.displayName}</h3><p>{zoneLabel(locale,m.pickupId)} → {zoneLabel(locale,m.destinationId)}</p><p className="mt-2">{statusLabel(t,m.status)} · {t.seatQuantity}: {displayNumber(locale,m.seats)}</p><p className="mt-3">{m.fareKind==='FINAL'?t.finalFare:m.fareKind==='CANCELLED'?t.noCharge:t.fareEstimate}: {money(locale,m.fare)}</p>{m.historicalFinal&&<p className="mt-2 text-sm">{t.previousFinal}: {money(locale,m.historicalFinal.totalPoysha)}</p>}</article>)}</div>
    </>}
  </ProductShell>;
}
