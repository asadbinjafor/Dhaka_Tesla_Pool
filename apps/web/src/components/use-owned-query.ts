'use client';
import {useCallback,useEffect,useState} from 'react';
import {ApiError,useSession} from './session-provider';
interface Versioned {representationVersion?:{request:number;pool:number}}
export function useOwnedQuery<T>(path:string,poll=false){
  const {call,epoch,user}=useSession();const [data,setData]=useState<T|null>(null);const [error,setError]=useState<string|null>(null);const [loaded,setLoaded]=useState(false);const [revision,setRevision]=useState(0);
  const refresh=useCallback(()=>setRevision(x=>x+1),[]);
  useEffect(()=>{
    let current=true;let timer:ReturnType<typeof setTimeout>;
    async function load(){
      if(!user)return;
      try{const next=await call<T>(path);if(!current)return;setData(previous=>{
        const a=(previous as Versioned|null)?.representationVersion,b=(next as Versioned|null)?.representationVersion;
        return a&&b&&(a.request>b.request||a.pool>b.pool)?previous:next;
      });setError(null);setLoaded(true);}
      catch(cause){if(current&&!(cause instanceof ApiError&&cause.code==='STALE_RESPONSE')){setError(cause instanceof ApiError?cause.code:'INTERNAL_ERROR');setLoaded(true);}}
      finally{if(current&&poll)timer=setTimeout(()=>void load(),2500);}
    }
    void load();return()=>{current=false;clearTimeout(timer);};
  },[path,call,epoch,user,poll,revision]);
  return {data,error,loaded,refresh};
}
