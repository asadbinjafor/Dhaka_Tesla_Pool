import {test,expect} from '@playwright/test';
test('lost successful booking reconciles original key after same-account reauthentication; logout clears all prior private intent',async({page,context})=>{
  const email=`recovery-${Date.now()}@test.invalid`,password='Recovery-fixture-password-2026';
  await page.goto('/en/sign-up');await page.getByLabel('Your name',{exact:true}).fill('Recovery passenger');await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByLabel('Confirm password',{exact:true}).fill(password);await page.getByRole('button',{name:'Create an account',exact:true}).click();await expect(page).toHaveURL('/en/account');
  await page.goto('/en/passenger/book');await page.getByRole('button',{name:'Calculate fare',exact:true}).click();await expect(page.getByRole('heading',{name:'Your fare quote'})).toBeVisible();
  const keys:string[]=[];let committedId='';let drop=true;
  await page.route('**/api/v1/ride-requests',async route=>{if(route.request().method()!=='POST')return route.continue();keys.push(route.request().headers()['idempotency-key']!);if(drop){drop=false;const response=await route.fetch();committedId=(await response.json()).data.resourceId;await route.abort('failed');}else await route.continue();});
  await page.getByRole('button',{name:'Confirm ride request',exact:true}).click();await expect(page.getByRole('button',{name:'Retry original command',exact:true})).toBeVisible();expect(committedId).toMatch(/^[0-9a-f-]{36}$/);
  await context.clearCookies({name:'dtp-session'});await page.getByRole('button',{name:'Retry original command',exact:true}).click();await expect(page).toHaveURL('/en/sign-in');
  await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page).toHaveURL('/en/account');
  await expect(page.getByRole('button',{name:'Retry original command',exact:true})).toBeVisible();await page.getByRole('button',{name:'Retry original command',exact:true}).click();await expect(page).toHaveURL('/en/passenger/rides/'+committedId);
  expect(keys.length).toBe(3);expect(new Set(keys).size).toBe(1);expect((await (await page.request.get('/api/v1/ride-requests/current')).json()).data.id).toBe(committedId);
  await page.goto('/en/account');await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page).toHaveURL('/en/sign-in');
  await page.getByLabel('Email address',{exact:true}).fill('shirin@demo.dhaka.test');await page.getByLabel('Password',{exact:true}).fill(process.env.E2E_PASSWORD!);await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page).toHaveURL('/en/account');expect(await page.getByRole('button',{name:'Retry original command',exact:true}).count()).toBe(0);expect(await page.getByText('Recovery passenger',{exact:true}).count()).toBe(0);
});
