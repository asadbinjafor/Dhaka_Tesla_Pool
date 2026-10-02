import { Inject, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomBytes, createHash } from 'node:crypto';
import argon2 from 'argon2';
import { csrfSync } from 'csrf-sync';
import { DatabaseService } from '../database/database.service.js';
import { passwordOptions } from '../database/seed.js';
import { fail } from '../common/business-error.js';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

export interface Identity { id: string; displayName: string; email: string; role: 'PASSENGER' | 'DRIVER' }
export interface Session { tokenHash: string; csrf: string; user: Identity | null }
export interface AuthRequest extends Request { authSession?: Session | null }
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const cookieName = 'dtp-session';
const csrf = csrfSync({
  size: 32,
  getTokenFromState: request => (request as AuthRequest).authSession?.csrf,
  storeTokenInState: (request, token) => { const session = (request as AuthRequest).authSession; if (session && token) session.csrf = token; },
});

@Injectable()
export class AuthService {
  private readonly dummyHash = argon2.hash(randomBytes(32).toString('hex'), passwordOptions);
  private readonly attempts = new Map<string, { count: number; until: number }>();
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService,
    @InjectRepository(User) private readonly users: Repository<User>) {}

  async load(request: AuthRequest): Promise<Session | null> {
    const raw = request.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    if (!raw || !/^[a-f0-9]{64}$/.test(raw)) return null;
    const result = await this.db.query(`SELECT s.token_hash,s.csrf_token,u.id,u.email,u.display_name,u.role
      FROM sessions s LEFT JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>clock_timestamp()`,[hash(raw)]);
    const row = result.rows[0];
    return row ? { tokenHash:row.token_hash, csrf:row.csrf_token, user:row.id ? {id:row.id,email:row.email,displayName:row.display_name,role:row.role} : null } : null;
  }

  checkCsrf(request: AuthRequest) {
    if (request.headers.origin !== (process.env.APP_ORIGIN ?? 'http://127.0.0.1:3000') || !csrf.isRequestValid(request)) fail('CSRF_REJECTED',403);
  }

  private cookie(response: Response, token: string, clear = false) {
    const secure = process.env.SESSION_COOKIE_SECURE === 'true' || !!process.env.APP_ORIGIN?.startsWith('https://');
    response.cookie(cookieName, token, {httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:clear ? 0 : 8*60*60*1000});
  }

  async bootstrap(request: AuthRequest, response: Response) {
    if (request.authSession) return {data:{csrfToken:request.authSession.csrf}};
    const token = randomBytes(32).toString('hex');
    const session: Session = {tokenHash:hash(token),csrf:'',user:null};
    request.authSession = session;
    csrf.generateToken(request,true);
    await this.db.query("INSERT INTO sessions(token_hash,csrf_token,expires_at) VALUES($1,$2,clock_timestamp()+interval '8 hours')",[session.tokenHash,session.csrf]);
    this.cookie(response,token);
    return {data:{csrfToken:session.csrf}};
  }

  limit(request: Request, email: string) {
    const now=Date.now();
    for (const [key,value] of this.attempts) if(value.until<now) this.attempts.delete(key);
    for (const [key,max] of [[`ip:${request.ip}`,100],[`account:${hash(email)}`,15]] as const) {
      const entry=this.attempts.get(key) ?? {count:0,until:now+15*60*1000};
      entry.count++; this.attempts.set(key,entry);
      if(entry.count>max || this.attempts.size>10000) fail('RATE_LIMITED',429);
    }
  }

  private async rotate(request: AuthRequest, response: Response, user: Identity) {
    const token=randomBytes(32).toString('hex');
    const next:Session={tokenHash:hash(token),csrf:'',user};
    const previous=request.authSession?.tokenHash;
    request.authSession=next; csrf.generateToken(request,true);
    await this.db.transaction(async client=>{
      if(previous) await client.query('DELETE FROM sessions WHERE token_hash=$1',[previous]);
      await client.query("INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at) VALUES($1,$2,$3,clock_timestamp()+interval '8 hours')",[next.tokenHash,user.id,next.csrf]);
    });
    this.cookie(response,token);
    return {data:{user,csrfToken:next.csrf}};
  }

  async register(request: AuthRequest,response: Response,input:{name:string;email:string;password:string}) {
    const email=input.email.trim().toLowerCase(); this.limit(request,email);
    const name=input.name.trim(); if(!name || name.length>100) fail('INVALID_INPUT',400);
    const passwordHash=await argon2.hash(input.password,passwordOptions);
    try {
      const row=await this.db.orm(()=>this.users.save(this.users.create({email,displayName:name,passwordHash,role:'PASSENGER'})));
      if(!row) fail('TEMPORARILY_UNAVAILABLE',503);
      return await this.rotate(request,response,{id:row.id,email:row.email,displayName:row.displayName,role:row.role});
    } catch(error) { if((error as {code?:string}).code==='23505') fail('ACCOUNT_EXISTS',409); throw error; }
  }

  async login(request: AuthRequest,response: Response,input:{email:string;password:string}) {
    const email=input.email.trim().toLowerCase(); this.limit(request,email);
    const row=await this.db.orm(()=>this.users.createQueryBuilder('user').addSelect('user.passwordHash').where('user.email = :email',{email}).getOne());
    const valid=await argon2.verify(row?.passwordHash ?? await this.dummyHash,input.password);
    if(!row || !valid) fail('INVALID_CREDENTIALS',401);
    return this.rotate(request,response,{id:row.id,email:row.email,displayName:row.displayName,role:row.role});
  }

  async logout(request: AuthRequest,response: Response) {
    if(request.authSession) await this.db.query('DELETE FROM sessions WHERE token_hash=$1',[request.authSession.tokenHash]);
    this.cookie(response,'',true); return {data:{signedOut:true}};
  }
}
