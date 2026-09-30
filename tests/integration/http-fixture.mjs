import { createApplication } from '../../dhaka-tesla-pool-backend/dist/bootstrap.js';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
export async function book(passenger,seats=1,destinationId='mohakhali'){
  const q=await passenger.call('/fare-quotes','POST',{pickupId:'banani',destinationId,seats});assert.equal(q.status,201);
  const response=await passenger.call('/ride-requests','POST',{quoteId:q.data.id,paymentMethod:'CASH'},randomUUID());assert.equal(response.status,201);return response.data.resourceId;
}
export async function httpApp(url) {
  const app=await createApplication(url); await app.listen(0,'127.0.0.1');
  const base=await app.getUrl();
  async function login(name) {
    const boot=await fetch(base+'/api/v1/auth/csrf');
    const headers={cookie:boot.headers.getSetCookie()[0].split(';')[0],origin:'http://127.0.0.1:3000','x-csrf-token':(await boot.json()).data.csrfToken,'content-type':'application/json'};
    const response=await fetch(base+'/api/v1/auth/login',{method:'POST',headers,body:JSON.stringify({email:name+'@demo.dhaka.test',password:'Nonsecret-test-fixture-2026'})});
    if(!response.ok) throw new Error('Test login failed: '+response.status);
    const auth=(await response.json()).data;
    headers.cookie=response.headers.getSetCookie()[0].split(';')[0]; headers['x-csrf-token']=auth.csrfToken;
    return {user:auth.user,headers,async call(path,method='GET',body,key) {
      const response=await fetch(base+'/api/v1'+path,{method,headers:{...headers,...(key?{'idempotency-key':key}:{})},body:body===undefined?undefined:JSON.stringify(body)});
      return {status:response.status,...await response.json()};
    }};
  }
  return {app,base,login,close:()=>app.close()};
}
