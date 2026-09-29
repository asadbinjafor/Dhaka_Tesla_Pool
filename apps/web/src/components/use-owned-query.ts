'use client';
import {useCallback,useEffect,useState} from 'react';
import {ApiError,useSession} from './session-provider';
interface Versioned {id?:string;version?:number;representationVersion?:{request:number;pool:number}}
export function useOwnedQuery<T>(path:string,poll=false){
  const {call,epoch,user}=useSession();
  const [snapshot,setSnapshot]=useState<{path:string;epoch:number;data:T|null;error:string|null;loaded:boolean}|null>(null);const [revision,setRevision]=useState(0);
  const refresh=useCallback(()=>setRevision(x=>x+1),[]);
  useEffect(()=>{
    let current=true;let timer:ReturnType<typeof setTimeout>;const controller=new AbortController();
    async function load(){
      if(!user)return;
      try{const next=await call<T>(path,'GET',undefined,undefined,controller.signal);if(!current)return;setSnapshot(previous=>{
        const prior=previous?.path===path&&previous.epoch===epoch?previous.data:null;
        const p=prior as Versioned|null,n=next as Versioned|null,a=p?.representationVersion,b=n?.representationVersion;
        const stale=p?.id===n?.id&&(a&&b&&(a.request>b.request||a.pool>b.pool)||p?.version!==undefined&&n?.version!==undefined&&p.version>n.version);
        return {path,epoch,data:stale?prior:next,error:null,loaded:true};
      });}
      catch(cause){if(current&&!(cause instanceof ApiError&&cause.code==='STALE_RESPONSE'))setSnapshot(previous=>({path,epoch,data:previous?.path===path&&previous.epoch===epoch?previous.data:null,error:cause instanceof ApiError?cause.code:'INTERNAL_ERROR',loaded:true}));}
      finally{if(current&&poll)timer=setTimeout(()=>void load(),2500);}
    }
    void load();return()=>{current=false;clearTimeout(timer);controller.abort();};
  },[path,call,epoch,user,poll,revision]);
  const owned=snapshot?.path===path&&snapshot.epoch===epoch?snapshot:null;
  return {data:owned?.data??null,error:owned?.error??null,loaded:owned?.loaded??false,refresh};
}
