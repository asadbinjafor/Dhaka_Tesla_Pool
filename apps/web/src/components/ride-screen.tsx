'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import type {RideDetail} from '@dtp/contracts';
import {ProductShell} from './product-shell';
import {useView} from './view-provider';
import {useRideUI} from './ride-ui-provider';
import {useOwnedQuery} from './use-owned-query';
import {errorText,messages} from '@/i18n/catalog';
import {money,dateTime,zoneLabel} from '@/i18n/format';
export function statusLabel(t:ReturnType<typeof messages>,status:string){return t[`status${status}` as keyof typeof t]??status;}
export function RideScreen({id}:{id?:string}){
  const {dictionary:t,locale}=useView();const ui=useRideUI();const query=useOwnedQuery<RideDetail>(id?`/ride-requests/${id}`:'/ride-requests/current',true);
  const dialog=useRef<HTMLDialogElement>(null);const [reason,setReason]=useState('');const [reasonError,setReasonError]=useState(false);
  useEffect(()=>{if(ui.receipt?.action==='PASSENGER_CANCEL'){ui.clearReceipt();query.refresh();dialog.current?.close();}},[ui,query]);
  const r=query.data;
  return <ProductShell role="PASSENGER"><h1 className="text-3xl font-bold">{t.currentTrip}</h1>
    {!query.loaded?<p className="mt-6">{t.loading}</p>:query.error?<p role="alert" className="mt-6">{errorText(locale,query.error)} <button className="control px-4" onClick={query.refresh}>{t.retry}</button></p>:!r?<section className="mt-6 rounded-2xl border border-line bg-panel p-6"><p>{t.noActiveRide}</p><Link className="primary-action mt-4" href={`/${locale}/passenger/book`}>{t.bookRide}</Link></section>:
      <section className="mt-6 max-w-3xl rounded-2xl border border-line bg-panel p-6"><p className="text-accent">{statusLabel(t,r.status)}</p><h2 className="mt-3 text-2xl font-bold">{zoneLabel(locale,r.route.pickupId)} → {zoneLabel(locale,r.route.destinationId)}</h2>
        <p className="mt-2 text-muted">{t.seatQuantity}: {new Intl.NumberFormat(locale==='bn'?'bn-BD':'en-BD').format(r.seats)}</p>
        <p className="mt-4 text-sm text-muted">{t.demoGeography}</p>
        {r.status==='REQUESTED'&&<p className="mt-4 rounded-xl border border-line p-4">{t.waitingHelp}</p>}
        {r.driver&&<p className="mt-4">{t.driverRole}: {r.driver.displayName} · {r.driver.vehicleName}</p>}
        {r.pool&&!r.endedAt&&<p className="mt-3">{t.poolOccupancy}: {r.pool.reservedSeats}/{r.pool.capacity}</p>}
        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5"><dt>{r.fare.kind==='CANCELLED'?t.noCharge:r.fare.kind==='FINAL'?t.finalFare:t.fareEstimate}</dt><dd className="text-right text-2xl font-bold text-accent">{money(locale,r.fare.chargePoysha??r.fare.totalPoysha)}</dd><dt>{t.baseFare}</dt><dd className="text-right">{money(locale,r.fare.basePoysha)}</dd><dt>{t.distanceFare}</dt><dd className="text-right">{money(locale,r.fare.distancePoysha)}</dd><dt>{t.poolingDiscount}</dt><dd className="text-right">{money(locale,r.fare.discountPoysha)}</dd></dl>
        {r.fare.historicalFinal&&<p className="mt-4">{t.previousFinal}: {money(locale,r.fare.historicalFinal.totalPoysha)}</p>}
        <p className="mt-4 text-sm text-muted">{t.cashOnly}</p><p className="mt-4 text-sm text-muted">{t.createdAt}: {dateTime(locale,r.createdAt)}</p>
        {r.endedAt&&<p className="text-sm text-muted">{t.endedAt}: {dateTime(locale,r.endedAt)}</p>}
        {r.cancellationReason&&<p className="mt-4">{t.reason}: {r.cancellationReason}</p>}
        {r.allowedActions.includes('CANCEL')&&<button className="control mt-5 px-5" disabled={ui.busy||!!ui.intent} onClick={()=>dialog.current?.showModal()}>{t.cancelRide}</button>}
        {!id&&<Link className="control mt-5 ml-3 px-4" href={`/${locale}/passenger/rides/${r.id}`}>{t.openDetails}</Link>}
      </section>}
    <dialog ref={dialog} className="w-[calc(100%-32px)] max-w-lg rounded-2xl border border-line bg-panel p-6 text-ink backdrop:bg-black/70"><form noValidate onSubmit={e=>{e.preventDefault();if(!reason.trim()||reason.trim().length>200){setReasonError(true);return;}setReasonError(false);if(r)void ui.execute(`/ride-requests/${r.id}/cancel`,{reason:reason.trim()});}}>
      <h2 className="text-xl font-bold">{t.cancelRide}</h2><label htmlFor="cancel-reason" className="field-label mt-4">{t.reason}</label><textarea id="cancel-reason" value={reason} maxLength={200} onChange={e=>setReason(e.target.value)} autoFocus/>{reasonError&&<p role="alert">{t.reasonRequired}</p>}
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" className="control px-4" onClick={()=>dialog.current?.close()}>{t.keepRide}</button><button className="primary-action" disabled={ui.busy||!!ui.intent}>{ui.busy?t.working:t.confirmCancel}</button></div>
    </form></dialog>
  </ProductShell>;
}
