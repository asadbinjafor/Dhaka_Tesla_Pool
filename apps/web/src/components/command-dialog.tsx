'use client';
import {useEffect,useRef,useState} from 'react';import {useView} from './view-provider';import {useRideUI} from './ride-ui-provider';
import {Preferences} from './preferences';
export function CommandDialog(){
  const {dictionary:t}=useView();const ui=useRideUI();const dialog=useRef<HTMLDialogElement>(null);const [invalid,setInvalid]=useState(false);
  useEffect(()=>{if(ui.confirmation&&!dialog.current?.open)dialog.current?.showModal();else if(!ui.confirmation)dialog.current?.close();},[ui.confirmation]);
  return <dialog ref={dialog} aria-labelledby="command-dialog-title" onCancel={()=>ui.closeConfirmation()} className="w-[calc(100%-32px)] max-w-lg rounded-2xl border border-line bg-panel p-6 text-ink backdrop:bg-black/70">
    {ui.confirmation&&<form noValidate onSubmit={e=>{e.preventDefault();if(ui.confirmation!.needsReason&&(!ui.reason.trim()||ui.reason.trim().length>200)){setInvalid(true);return;}setInvalid(false);void ui.execute(ui.confirmation!.target,ui.confirmation!.needsReason?{reason:ui.reason.trim()}:{});}}>
      <Preferences/><h2 id="command-dialog-title" className="mt-4 text-xl font-bold">{t[ui.confirmation.label]}</h2><p className="mt-3 text-muted">{t.actionConfirmHelp}</p>
      {ui.confirmation.needsReason&&<><label htmlFor="cancel-reason" className="field-label mt-4">{t.reason}</label><textarea id="cancel-reason" value={ui.reason} maxLength={200} onChange={e=>ui.setReason(e.target.value)} autoFocus/>{invalid&&<p role="alert">{t.reasonRequired}</p>}</>}
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" className="control px-4" onClick={()=>ui.closeConfirmation()}>{t.goBack}</button><button className="primary-action" disabled={ui.busy||!!ui.intent}>{ui.busy?t.working:ui.confirmation.needsReason?t.confirmCancel:t.confirmAction}</button></div>
    </form>}
  </dialog>;
}
