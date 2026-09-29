import {test,expect} from '@playwright/test';import AxeBuilder from '@axe-core/playwright';
import en from '../../apps/web/src/i18n/messages/en.json';import bn from '../../apps/web/src/i18n/messages/bn.json';
import {fixtureSession} from './fixture-session';
for(const actor of ['nusrat','jashim'] as const)for(const [locale,theme] of [['en','dark'],['en','light'],['bn','dark'],['bn','light']] as const)test(`principal views, widths, accessibility and screenshots ${actor}/${locale}/${theme}`,async({page},info)=>{
  test.setTimeout(240000);const t=locale==='bn'?bn:en;const role=actor==='jashim'?'driver':'passenger';const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(`/${locale}/sign-in`);if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:theme==='dark'?t.switchDark:t.switchLight,exact:true}).click();
  await fixtureSession(page,actor);await page.goto(`/${locale}/account`);await expect(page.getByRole('main').getByRole('heading',{level:1})).toBeVisible();
  const paths=[`/${role}`,`/${role}/${role==='driver'?'requests':'book'}`,`/${role}/${role==='driver'?'pool':'ride'}`,`/${role}/history`,`/${role}/activity`,'/account','/guide',...(role==='driver'?['/driver/vehicle']:[])];
  const measurements=[];
  for(const width of [360,390,768,1024,1440])for(const path of paths){
    await page.setViewportSize({width,height:900});await page.goto(`/${locale}${path}`);await expect(page.getByRole('main').getByRole('heading',{level:1})).toBeVisible();
    await expect(page.getByRole('main').getByText(t.loading,{exact:true})).toHaveCount(0);
    await page.evaluate(()=>document.fonts.ready);
    expect(await page.locator('html').getAttribute('lang')).toBe(locale);expect(await page.locator('html').getAttribute('data-theme')).toBe(theme);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`${path}/${width} outer overflow`).toBeLessThanOrEqual(1);
    if(path.endsWith('/activity'))await expect(page.locator('svg text').first()).toBeVisible();const chartLabelMinHeight=path.endsWith('/activity')?await page.locator('svg text').evaluateAll(nodes=>Math.min(...nodes.map(node=>node.getBoundingClientRect().height))):null;if(chartLabelMinHeight!==null){expect(Number.isFinite(chartLabelMinHeight)).toBe(true);expect(chartLabelMinHeight,`${path}/${width} rendered chart labels`).toBeGreaterThanOrEqual(10);}
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    await info.attach(`${width}-${path.replaceAll('/','_')}-a11y`,{body:JSON.stringify({path,width,violations:scan.violations,incomplete:scan.incomplete.map(x=>x.id)}),contentType:'application/json'});expect(scan.violations).toEqual([]);
    await info.attach(`${width}-${path.replaceAll('/','_')}`,{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
    measurements.push({path,width,overflow,violations:scan.violations.length,chartLabelMinHeight});
  }
  await page.goto(`/${locale}/${role}`);const skip=page.getByRole('link',{name:t.skip,exact:true});await skip.focus();await expect(skip).toBeFocused();await page.keyboard.press('Enter');await expect(page.getByRole('main')).toBeFocused();
  if(locale==='bn')expect(await page.evaluate(()=>document.fonts.check('16px "Noto Sans Bengali"'))).toBe(true);
  expect(errors).toEqual([]);await info.attach('actual-view-matrix',{body:JSON.stringify(measurements,null,2),contentType:'application/json'});
});
