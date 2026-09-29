'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {isLocale} from '@dtp/contracts';
import {useRideUI} from './ride-ui-provider';
import {useView} from './view-provider';
import {ProductShell} from './product-shell';
import {money,zoneLabel} from '@/i18n/format';
export function BookingScreen(){
  const {dictionary:t,locale}=useView();const ui=useRideUI();const router=useRouter();
  useEffect(()=>{if(ui.receipt?.action==='CREATE_REQUEST'){const l=window.location.pathname.split('/')[1];const id=ui.receipt.resourceId;ui.clearReceipt();router.push(`/${isLocale(l)?l:locale}/passenger/rides/${id}`);}},[ui,router,locale]);
  return <ProductShell role="PASSENGER"><h1 className="text-3xl font-bold">{t.bookRide}</h1><p className="mt-2 text-muted">{t.bookingHelp}</p>
    <form noValidate onSubmit={e=>{e.preventDefault();void ui.getQuote();}} className="mt-6 max-w-xl rounded-2xl border border-line bg-panel p-6">
      <fieldset disabled={ui.busy||!!ui.intent} className="space-y-5"><div><label className="field-label" htmlFor="pickup">{t.pickup}</label><select id="pickup" value={ui.draft.pickupId} onChange={e=>ui.change({...ui.draft,pickupId:e.target.value})}><option value="banani">{zoneLabel(locale,'banani')}</option></select></div>
      <div><label className="field-label" htmlFor="destination">{t.destination}</label><select id="destination" value={ui.draft.destinationId} onChange={e=>ui.change({...ui.draft,destinationId:e.target.value})}>{['mohakhali','gulshan-1','gulshan-2'].map(id=><option key={id} value={id}>{zoneLabel(locale,id)}</option>)}</select></div>
      <div><label className="field-label" htmlFor="seats">{t.seatQuantity}</label><select id="seats" value={ui.draft.seats} onChange={e=>ui.change({...ui.draft,seats:Number(e.target.value)})}>{[1,2,3].map(n=><option key={n} value={n}>{new Intl.NumberFormat(locale==='bn'?'bn-BD':'en-BD').format(n)}</option>)}</select><p className="mt-2 text-sm text-muted">{t.quantityHelp}</p></div>
      <button className="primary-action w-full" type="submit">{ui.busy?t.working:t.getQuote}</button></fieldset>
    </form>
    {ui.quote&&<section className="mt-6 max-w-xl rounded-2xl border border-accent bg-panel p-6"><h2 className="text-xl font-bold">{t.yourQuote}</h2><dl className="mt-4 grid grid-cols-2 gap-3"><dt>{t.soloMaximum}</dt><dd>{money(locale,ui.quote.solo.totalPoysha)}</dd><dt>{t.pooledEstimate}</dt><dd>{money(locale,ui.quote.pooled.totalPoysha)}</dd></dl><p className="mt-4 text-sm text-muted">{t.quotePolicy}</p><p className="mt-2 text-muted">{t.cashOnly}</p><button className="primary-action mt-5 w-full" disabled={ui.busy||!!ui.intent} onClick={()=>void ui.execute('/ride-requests',{quoteId:ui.quote!.id,paymentMethod:'CASH'})}>{ui.busy?t.working:t.requestRide}</button></section>}
  </ProductShell>;
}
