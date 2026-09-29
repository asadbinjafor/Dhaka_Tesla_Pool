import { test, expect } from '@playwright/test';
const password=process.env.E2E_PASSWORD;
if(!password)throw new Error('E2E_PASSWORD for the isolated demo fixture is required');

for(const [locale,theme] of [['en','dark'],['en','light'],['bn','dark'],['bn','light']] as const) {
  test(`real gateway identity and preferences ${locale}/${theme}`,async({page,context})=>{
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`/${locale}/sign-in`);
    if(await page.locator('html').getAttribute('data-theme')!==theme) await page.getByRole('button',{name:locale==='en'?(theme==='dark'?'Switch to dark mode':'Switch to light mode'):(theme==='dark'?'ডার্ক মোড চালু করুন':'লাইট মোড চালু করুন')}).click();
    await page.getByLabel(locale==='en'?'Email address':'ইমেইল ঠিকানা',{exact:true}).fill('nusrat@demo.dhaka.test');
    await page.getByLabel(locale==='en'?'Password':'পাসওয়ার্ড',{exact:true}).fill(password!);
    await page.getByRole('button',{name:locale==='en'?'Sign in':'সাইন ইন',exact:true}).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByText('Nusrat',{exact:true})).toBeVisible();
    const before=(await (await context.request.get('/api/v1/me')).json()).data;
    await page.getByRole('button',{name:locale==='en'?'Change language to Bangla':'ইংরেজি ভাষায় পরিবর্তন করুন'}).click();
    await expect(page).toHaveURL(`/${locale==='en'?'bn':'en'}/account`);
    const after=(await (await context.request.get('/api/v1/me')).json()).data;
    expect(after).toEqual(before);
    expect(JSON.stringify(after)).not.toMatch(/password|csrf|Rafiq|Shirin/);
    expect((await context.request.get('/api/v1/driver/vehicle')).status()).toBe(403);
    await page.reload();await expect(page.getByText('Nusrat',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:locale==='en'?'সাইন আউট':'Sign out',exact:true}).click();
    await expect(page).toHaveURL(/\/sign-in$/);
    expect((await context.request.get('/api/v1/me')).status()).toBe(401);
    expect(errors).toEqual([]);
  });
}

test('language/theme switch during real delayed login keeps credentials and one pending operation',async({page})=>{
  let complete!:()=>void;const release=new Promise<void>(resolve=>{complete=resolve;});let entered!:()=>void;const started=new Promise<void>(resolve=>{entered=resolve;});let count=0;
  await page.route('**/api/v1/auth/login',async route=>{count++;const response=await route.fetch();entered();await release;await route.fulfill({response});});
  await page.goto('/en/sign-in');
  await page.getByLabel('Email address',{exact:true}).fill('jashim@demo.dhaka.test');
  await page.getByLabel('Password',{exact:true}).fill(password!);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();await started;
  await page.getByRole('button',{name:'Change language to Bangla'}).click();
  await expect(page.getByLabel('ইমেইল ঠিকানা',{exact:true})).toHaveValue('jashim@demo.dhaka.test');
  await expect(page.getByLabel('পাসওয়ার্ড',{exact:true})).toHaveValue(password!);
  await expect(page.getByRole('button',{name:'কাজ চলছে…',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'লাইট মোড চালু করুন'}).click();
  complete();await expect(page).toHaveURL('/bn/account');
  await expect(page.getByText('Jashim',{exact:true})).toBeVisible();expect(count).toBe(1);
});
