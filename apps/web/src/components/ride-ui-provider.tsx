'use client';
import { createContext,useContext,useEffect,useRef,useState } from 'react';
import type {ReactNode} from 'react';
import type {Quote,Receipt} from '@dtp/contracts';
import {ApiError,useSession} from './session-provider';

interface Intent {key:string;target:string;method:string;body:Readonly<Record<string,unknown>>}
interface Confirmation {target:string;label:'cancelRide'|'driverArrive'|'startTrip'|'completeTrip'|'cancelPool';needsReason:boolean}
interface UI {
  draft:{pickupId:string;destinationId:string;seats:number};quote:Quote|null;intent:Intent|null;busy:boolean;error:string|null;receipt:Receipt|null;
  confirmation:Confirmation|null;reason:string;setReason(reason:string):void;confirm(value:Confirmation):void;closeConfirmation():void;
  historyDraft:{status:string;search:string}|null;setHistoryDraft(value:{status:string;search:string}):void;
  statsDraft:{from:string;to:string}|null;setStatsDraft(value:{from:string;to:string}):void;
  change(draft:UI['draft']):void;getQuote():Promise<void>;
  execute(target:string,body:Record<string,unknown>,method?:string):Promise<Receipt|undefined>;
  retry():Promise<Receipt|undefined>;clearReceipt():void;
}
const Context=createContext<UI|null>(null);
export function RideUIProvider({children}:{children:ReactNode}) {
  const session=useSession();
  const [draft,setDraft]=useState({pickupId:'banani',destinationId:'mohakhali',seats:1});
  const [quote,setQuote]=useState<Quote|null>(null);const [intent,setIntent]=useState<Intent|null>(null);
  const [busy,setBusy]=useState(false);const [error,setError]=useState<string|null>(null);const [receipt,setReceipt]=useState<Receipt|null>(null);
  const [confirmation,setConfirmation]=useState<Confirmation|null>(null);const [reason,setReason]=useState('');
  const [historyDraft,setHistoryDraft]=useState<UI['historyDraft']>(null);const [statsDraft,setStatsDraft]=useState<UI['statsDraft']>(null);
  const running=useRef(false);const mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  async function run(next:Intent) {
    if(running.current)return;
    running.current=true;setBusy(true);setError(null);setIntent(next);
    try {const result=await session.call<Receipt>(next.target,next.method,next.body,next.key);if(!mounted.current)return;setReceipt(result);setIntent(null);setConfirmation(null);setReason('');return result;}
    catch(cause){if(!mounted.current)return;const code=cause instanceof ApiError?cause.code:'INTERNAL_ERROR';setError(code);
      // Unknown/temporary/auth outcomes retain this exact key/body for reconciliation.
      if(!['COMMAND_OUTCOME_UNKNOWN','TEMPORARILY_UNAVAILABLE','AUTH_REQUIRED','CSRF_REJECTED','RATE_LIMITED'].includes(code))setIntent(null);
    } finally {if(mounted.current){running.current=false;setBusy(false);}}
  }
  return <Context.Provider value={{draft,quote,intent,busy,error,receipt,confirmation,reason,setReason,historyDraft,setHistoryDraft,statsDraft,setStatsDraft,
    confirm(value){if(busy||intent)return;setReason('');setConfirmation(value);},closeConfirmation:()=>setConfirmation(null),
    change(next){if(busy||intent)return;setDraft(next);setQuote(null);setError(null);},
    async getQuote(){if(running.current||intent)return;running.current=true;setBusy(true);setError(null);
      try{const result=await session.call<Quote>('/fare-quotes','POST',draft);if(mounted.current)setQuote(result);}
      catch(cause){if(mounted.current)setError(cause instanceof ApiError?cause.code:'INTERNAL_ERROR');}
      finally{if(mounted.current){running.current=false;setBusy(false);}}
    },
    execute:async(target,body,method='POST')=>{if(intent){setError('PENDING_COMMAND');return;}return run({key:crypto.randomUUID(),target,body,method});},
    retry:()=>intent?run(intent):Promise.resolve(undefined),clearReceipt:()=>setReceipt(null),
  }}>{children}</Context.Provider>;
}
export function useRideUI(){const value=useContext(Context);if(!value)throw new Error('RideUIProvider required');return value;}
export function PrivateUIBoundary({children}:{children:ReactNode}){const {epoch}=useSession();return <RideUIProvider key={epoch}>{children}</RideUIProvider>;}
