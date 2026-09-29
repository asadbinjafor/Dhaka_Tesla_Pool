import {test,expect} from '@playwright/test';
import {fixtureSession} from './fixture-session';
for(const [locale,theme] of [['en','dark'],['en','light'],['bn','dark'],['bn','light']] as const)test(`owned history and real graphs match gateway data ${locale}/${theme}`,async({page})=>{
  await page.goto(`/${locale}/sign-in`);if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:locale==='en'?'Switch to light mode':'লাইট মোড চালু করুন',exact:true}).click();
  await fixtureSession(page,'nusrat');await page.goto(`/${locale}/account`);await expect(page.getByRole('main').getByRole('heading',{level:1})).toBeVisible();
  await page.goto(`/${locale}/passenger/activity`);await expect(page.getByRole('table')).toBeVisible();
  const stats=(await (await page.request.get('/api/v1/statistics/passenger')).json()).data;
  expect(stats.population).toBe('COMPLETED_ONLY');expect(stats.totals.trips).toBeGreaterThanOrEqual(2);
  expect(await page.getByRole('table').locator('tbody tr').count()).toBe(stats.daily.length);
  for(let i=0;i<stats.daily.length;i++){const row=page.getByRole('table').locator('tbody tr').nth(i);const count=new Intl.NumberFormat(locale==='bn'?'bn-BD':'en-BD').format(stats.daily[i].trips);expect(await row.locator('td').nth(0).innerText()).toBe(count);}
  const bars=page.getByRole('img',{name:locale==='en'?'Completed rides by day':'প্রতিদিনের সম্পন্ন যাত্রা'}).locator('rect');expect(await bars.count()).toBe(stats.daily.length);
  for(let i=0;i<stats.daily.length;i++)expect(Number(await bars.nth(i).getAttribute('height'))>0).toBe(stats.daily[i].trips>0);
  await page.goto(`/${locale}/passenger/history?status=COMPLETED`);await expect(page.getByRole('article').first()).toBeVisible();
  const history=(await (await page.request.get('/api/v1/ride-history?status=COMPLETED')).json()).data;await expect(page.getByRole('article')).toHaveCount(history.items.length);
  const before=page.url();await page.getByRole('button',{name:locale==='en'?'Change language to Bangla':'ইংরেজি ভাষায় পরিবর্তন করুন',exact:true}).click();await expect(page).toHaveURL(before.replace(`/${locale}/`,`/${locale==='en'?'bn':'en'}/`));await expect(page.getByRole('article')).toHaveCount(history.items.length);
});
