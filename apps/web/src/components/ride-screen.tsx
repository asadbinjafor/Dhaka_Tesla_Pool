'use client';
import {useEffect} from 'react';
import Link from 'next/link';
import type {RideDetail} from '@dtp/contracts';
import {ProductShell} from './product-shell';
import {useView} from './view-provider';
import {useRideUI} from './ride-ui-provider';
import {useOwnedQuery} from './use-owned-query';
import {errorText,messages} from '@/i18n/catalog';
import {money,dateTime,zoneLabel,displayNumber} from '@/i18n/format';
export function statusLabel(t:ReturnType<typeof messages>,status:string){return t[`status${status}` as keyof typeof t]??status;}
export function RideScreen({id}:{id?:string}){
  const {dictionary:t,locale}=useView();const ui=useRideUI();const query=useOwnedQuery<RideDetail>(id?`/ride-requests/${id}`:'/ride-requests/current',true);
  useEffect(()=>{if(ui.receipt?.action==='PASSENGER_CANCEL'){ui.clearReceipt();query.refresh();}},[ui,query]);
  const r=query.data;
  return <ProductShell role="PASSENGER"><h1 className="text-3xl font-bold">{t.currentTrip}</h1>
    {!query.loaded?<p className="mt-6">{t.loading}</p>:query.error?<p role="alert" className="mt-6">{errorText(locale,query.error)} <button className="control px-4" onClick={query.refresh}>{t.retry}</button></p>:!r?<section className="mt-6 rounded-2xl border border-line bg-panel p-6"><p>{t.noActiveRide}</p><Link className="primary-action mt-4" href={`/${locale}/passenger/book`}>{t.bookRide}</Link></section>:
      <section className="mt-6 max-w-3xl rounded-2xl border border-line bg-panel p-6"><p className="text-accent">{statusLabel(t,r.status)}</p><h2 className="mt-3 text-2xl font-bold">{zoneLabel(locale,r.route.pickupId)} → {zoneLabel(locale,r.route.destinationId)}</h2>
        <p className="mt-2 text-muted">{t.seatQuantity}: {new Intl.NumberFormat(locale==='bn'?'bn-BD':'en-BD').format(r.seats)}</p>
        <p className="mt-4 text-sm text-muted">{t.demoGeography}</p>
        {r.status==='REQUESTED'&&<p className="mt-4 rounded-xl border border-line p-4">{t.waitingHelp}</p>}
        {r.matchingHint&&<p className="mt-3 text-muted">{r.matchingHint.state==='NO_ELIGIBLE_DRIVER'?t.noEligibleDriver:r.matchingHint.state==='WAITING_FOR_ACCEPTANCE'?t.waitingForDriver:t.matchingUnknown}</p>}
        {r.driver&&<p className="mt-4">{t.driverRole}: {r.driver.displayName} · {r.driver.vehicleName}</p>}
        {r.pool&&!r.endedAt&&<p className="mt-3">{t.poolOccupancy}: {displayNumber(locale,r.pool.reservedSeats)}/{displayNumber(locale,r.pool.capacity)}</p>}
        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5"><dt>{r.fare.kind==='CANCELLED'?t.noCharge:r.fare.kind==='FINAL'?t.finalFare:t.fareEstimate}</dt><dd className="text-right text-2xl font-bold text-accent">{money(locale,r.fare.chargePoysha??r.fare.totalPoysha)}</dd><dt>{t.baseFare}</dt><dd className="text-right">{money(locale,r.fare.basePoysha)}</dd><dt>{t.distanceFare}</dt><dd className="text-right">{money(locale,r.fare.distancePoysha)}</dd><dt>{t.poolingDiscount}</dt><dd className="text-right">{money(locale,r.fare.discountPoysha)}</dd></dl>
        {r.fare.historicalFinal&&<p className="mt-4">{t.previousFinal}: {money(locale,r.fare.historicalFinal.totalPoysha)}</p>}
        <p className="mt-4 text-sm text-muted">{t.cashOnly}</p><p className="mt-4 text-sm text-muted">{t.createdAt}: {dateTime(locale,r.createdAt)}</p>
        {r.endedAt&&<p className="text-sm text-muted">{t.endedAt}: {dateTime(locale,r.endedAt)}</p>}
        {r.cancellationReason&&<p className="mt-4">{t.reason}: {r.cancellationReason}</p>}
        {r.allowedActions.includes('CANCEL')&&<button data-command-target={`/ride-requests/${r.id}/cancel`} className="control mt-5 px-5" disabled={ui.busy||!!ui.intent} onClick={()=>ui.confirm({target:`/ride-requests/${r.id}/cancel`,label:'cancelRide',needsReason:true})}>{t.cancelRide}</button>}
        {!id&&<Link className="control mt-5 ml-3 px-4" href={`/${locale}/passenger/rides/${r.id}`}>{t.openDetails}</Link>}
      </section>}
  </ProductShell>;
}
