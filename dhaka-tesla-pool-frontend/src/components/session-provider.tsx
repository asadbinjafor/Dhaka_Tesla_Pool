'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export interface User {id:string;displayName:string;email:string;role:'PASSENGER'|'DRIVER'}
export class ApiError extends Error {
  constructor(public readonly code:string, public readonly status=0) {super(code);}
}
interface SessionContextValue {
  user:User|null; loading:boolean; authPending:boolean; authError:string|null; epoch:number;reauthRequired:boolean;
  authenticate(mode:'login'|'register',body:Record<string,string>):Promise<void>;
  logout():Promise<void>;
  reportAuthError(code:string|null):void;
  call<T>(path:string,method?:string,body?:unknown,key?:string,signal?:AbortSignal):Promise<T>;
}
const Context=createContext<SessionContextValue|null>(null);
export function SessionProvider({children,onBoundary}:{children:ReactNode;onBoundary:()=>void}) {
  const [user,setUser]=useState<User|null>(null);
  const [loading,setLoading]=useState(true);
  const [authPending,setAuthPending]=useState(false);
  const [authError,setAuthError]=useState<string|null>(null);
  const [epoch,setEpoch]=useState(0);
  const [reauthRequired,setReauthRequired]=useState(false);
  const generation=useRef(0);
  const csrf=useRef<string|null>(null);
  const reads=useRef(new Set<AbortController>());
  const activeAuth=useRef(false);
  const boundary=useCallback((clearPrivate=true)=>{
    generation.current++;if(clearPrivate)setEpoch(generation.current);
    for(const controller of reads.current) controller.abort();
    reads.current.clear();
  },[]);

  const call=useCallback(async <T,>(path:string,method='GET',body?:unknown,key?:string,signal?:AbortSignal):Promise<T>=>{
    const captured=generation.current;
    const controller=new AbortController();
    const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)controller.abort();
    if(method==='GET') reads.current.add(controller);
    try {
      if(method!=='GET' && !csrf.current) {
        const bootstrap=await fetch('/api/v1/auth/csrf',{credentials:'same-origin',cache:'no-store',signal:controller.signal});
        const payload=await bootstrap.json();
        if(!bootstrap.ok) throw new ApiError(payload.error?.code ?? 'TEMPORARILY_UNAVAILABLE',bootstrap.status);
        if(captured!==generation.current) throw new ApiError('STALE_RESPONSE');
        csrf.current=payload.data.csrfToken;
      }
      const response=await fetch('/api/v1'+path,{method,credentials:'same-origin',cache:'no-store',signal:controller.signal,
        headers:{...(body===undefined?{}:{'content-type':'application/json'}),...(method==='GET'?{}:{'x-csrf-token':csrf.current!}),...(key?{'idempotency-key':key}:{})},
        body:body===undefined?undefined:JSON.stringify(body)});
      const payload=await response.json();
      if(captured!==generation.current) throw new ApiError('STALE_RESPONSE');
      if(!response.ok) {if(response.status===403 && payload.error?.code==='CSRF_REJECTED') csrf.current=null;if(response.status===401&&payload.error?.code==='AUTH_REQUIRED'){csrf.current=null;setReauthRequired(true);}throw new ApiError(payload.error?.code ?? 'INTERNAL_ERROR',response.status);}
      return payload.data as T;
    } catch(error) {
      if(error instanceof ApiError) throw error;
      if(captured!==generation.current) throw new ApiError('STALE_RESPONSE');
      throw new ApiError(method==='GET'?'TEMPORARILY_UNAVAILABLE':'COMMAND_OUTCOME_UNKNOWN');
    } finally {reads.current.delete(controller);signal?.removeEventListener('abort',abort);}
  },[]);

  useEffect(()=>{
    let mounted=true;
    const activeReads=reads.current;
    Promise.resolve().then(()=>call<User>('/me')).then(value=>{if(mounted)setUser(value);}).catch(error=>{if(mounted && error.code!=='AUTH_REQUIRED' && error.code!=='STALE_RESPONSE')setAuthError(error.code);}).finally(()=>{if(mounted)setLoading(false);});
    return()=>{mounted=false;for(const controller of activeReads)controller.abort();};
  },[call]);

  async function authenticate(mode:'login'|'register',body:Record<string,string>) {
    if(activeAuth.current) return;
    activeAuth.current=true;setAuthPending(true);setAuthError(null);boundary(false);
    try {
      const result=await call<{user:User;csrfToken:string}>(`/auth/${mode}`,'POST',body);
      csrf.current=result.csrfToken;
      // Same verified account can reconcile its unresolved command after session expiry.
      // A different account always remounts and clears all private state.
      if(!user||user.id!==result.user.id)setEpoch(generation.current);
      setReauthRequired(false);onBoundary();setUser(result.user);
    } catch(error) {const code=error instanceof ApiError?error.code:'INTERNAL_ERROR';setAuthError(code);throw error;}
    finally {activeAuth.current=false;setAuthPending(false);}
  }
  async function logout() {
    if(activeAuth.current)return;
    activeAuth.current=true;setAuthPending(true);setAuthError(null);boundary();onBoundary();
    try {await call('/auth/logout','POST',{});csrf.current=null;setReauthRequired(false);setUser(null);}
    catch(error){setAuthError(error instanceof ApiError?error.code:'INTERNAL_ERROR');throw error;}
    finally{activeAuth.current=false;setAuthPending(false);}
  }
  return <Context.Provider value={{user,loading,authPending,authError,epoch,reauthRequired,authenticate,logout,call,reportAuthError:setAuthError}}>{children}</Context.Provider>;
}
export function useSession(){const session=useContext(Context);if(!session)throw new Error('SessionProvider required');return session;}
