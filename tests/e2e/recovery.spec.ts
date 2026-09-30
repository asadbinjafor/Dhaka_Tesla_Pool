import {test,expect} from '@playwright/test';
import bn from '../../dhaka-tesla-pool-frontend/src/i18n/messages/bn.json';
test('lost successful booking reconciles original key after same-account reauthentication; logout clears all prior private intent',async({page,context})=>{
  const email=`recovery-${Date.now()}@test.invalid`,password='Recovery-fixture-password-2026';
  await page.goto('/en/sign-up');await page.getByLabel('Your name',{exact:true}).fill('Recovery passenger');await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByLabel('Confirm password',{exact:true}).fill(password);await page.getByRole('button',{name:'Create an account',exact:true}).click();await expect(page).toHaveURL('/en/account');
  await page.goto('/en/passenger/book');await page.getByRole('button',{name:'Calculate fare',exact:true}).click();await expect(page.getByRole('heading',{name:'Your fare quote'})).toBeVisible();
  const keys:string[]=[];let committedId='';let drop=true;
  await page.route('**/api/v1/ride-requests',async route=>{if(route.request().method()!=='POST')return route.continue();keys.push(route.request().headers()['idempotency-key']!);if(drop){drop=false;const response=await route.fetch();committedId=(await response.json()).data.resourceId;await route.abort('failed');}else await route.continue();});
  await page.getByRole('button',{name:'Confirm ride request',exact:true}).click();await expect(page.getByRole('button',{name:'Retry original command',exact:true})).toBeVisible();expect(committedId).toMatch(/^[0-9a-f-]{36}$/);
  await page.getByRole('button',{name:'Change language to Bangla',exact:true}).click();await page.getByRole('button',{name:bn.switchLight,exact:true}).click();await expect(page.getByRole('button',{name:bn.retrySameCommand,exact:true})).toBeVisible();expect(keys.length).toBe(1);expect(await page.locator('html').getAttribute('data-theme')).toBe('light');
  await context.clearCookies({name:'dtp-session'});await page.getByRole('button',{name:bn.retrySameCommand,exact:true}).click();await expect(page).toHaveURL('/bn/sign-in');
  await page.getByLabel(bn.email,{exact:true}).fill(email);await page.getByLabel(bn.password,{exact:true}).fill(password);await page.getByRole('button',{name:bn.signIn,exact:true}).click();await expect(page).toHaveURL('/bn/account');
  await expect(page.getByRole('button',{name:bn.retrySameCommand,exact:true})).toBeVisible();await page.getByRole('button',{name:bn.retrySameCommand,exact:true}).click();await expect(page).toHaveURL('/bn/passenger/rides/'+committedId);
  expect(keys.length).toBe(3);expect(new Set(keys).size).toBe(1);expect((await (await page.request.get('/api/v1/ride-requests/current')).json()).data.id).toBe(committedId);
  await page.goto('/bn/account');await page.getByRole('button',{name:bn.signOut,exact:true}).click();await expect(page).toHaveURL('/bn/sign-in');
  await page.getByLabel(bn.email,{exact:true}).fill('shirin@demo.dhaka.test');await page.getByLabel(bn.password,{exact:true}).fill(process.env.E2E_PASSWORD!);await page.getByRole('button',{name:bn.signIn,exact:true}).click();await expect(page).toHaveURL('/bn/account');expect(await page.getByRole('button',{name:bn.retrySameCommand,exact:true}).count()).toBe(0);expect(await page.getByText('Recovery passenger',{exact:true}).count()).toBe(0);
});
