import {expect} from '@playwright/test';import type {Page,BrowserContext} from '@playwright/test';
// Read-only screenshot/statistics checks reuse a real isolated fixture session in worker memory.
// Authentication E2E still tests the actual forms; production throttles stay enabled.
const sessions=new Map<string,Awaited<ReturnType<BrowserContext['cookies']>>>();
export async function fixtureSession(page:Page,actor:string){
  const stored=sessions.get(actor);if(stored)await page.context().addCookies(stored);else{
    const boot=await page.request.get('/api/v1/auth/csrf');expect(boot.status()).toBe(200);const token=(await boot.json()).data.csrfToken;
    const login=await page.request.post('/api/v1/auth/login',{headers:{origin:'http://127.0.0.1:3000','x-csrf-token':token},data:{email:actor+'@demo.dhaka.test',password:process.env.E2E_PASSWORD}});expect(login.status()).toBe(201);
    sessions.set(actor,(await page.context().cookies()).filter(cookie=>cookie.name==='dtp-session'));
  }
  const me=await page.request.get('/api/v1/me');expect(me.status()).toBe(200);expect((await me.json()).data.email).toBe(actor+'@demo.dhaka.test');
}
