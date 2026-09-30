import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import { fail } from './business-error.js';

export interface Receipt { resourceId:string; action:string; appliedVersion:number }
function canonical(value:unknown):string {
  if(Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if(value && typeof value==='object') return `{${Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')}}`;
  return JSON.stringify(value);
}
export async function command(client:PoolClient,actor:string,action:string,key:string,target:string,body:object,apply:()=>Promise<Receipt>):Promise<Receipt> {
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key??'')) fail('INVALID_INPUT',400);
  const hash=createHash('sha256').update(canonical({action,target,body})).digest('hex');
  await client.query('INSERT INTO idempotency_keys(actor_id,action_scope,key,target_ref,request_hash) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',[actor,action,key,target,hash]);
  const row=(await client.query('SELECT request_hash,receipt FROM idempotency_keys WHERE actor_id=$1 AND action_scope=$2 AND key=$3 FOR UPDATE',[actor,action,key])).rows[0];
  if(row.request_hash!==hash) fail('IDEMPOTENCY_KEY_REUSED');
  if(row.receipt) return row.receipt as Receipt;
  const receipt=await apply();
  await client.query('UPDATE idempotency_keys SET receipt=$4 WHERE actor_id=$1 AND action_scope=$2 AND key=$3',[actor,action,key,receipt]);
  return receipt;
}
