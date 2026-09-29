import {test,expect} from '@playwright/test';
test('separate real passenger/driver accounts reserve quantity, keep private fare and cancel last membership',async({page,browser,baseURL})=>{
  const driverContext=await browser.newContext({baseURL});const driver=await driverContext.newPage();
  try{
    await page.goto('/en/sign-up');await page.getByLabel('Your name',{exact:true}).fill('Quantity passenger');await page.getByLabel('Email address',{exact:true}).fill(`quantity-${Date.now()}@test.invalid`);await page.getByLabel('Password',{exact:true}).fill('Quantity-test-password-2026');await page.getByLabel('Confirm password',{exact:true}).fill('Quantity-test-password-2026');await page.getByRole('button',{name:'Create an account',exact:true}).click();await expect(page).toHaveURL('/en/account');
    await page.goto('/en/passenger/book');await page.getByLabel('Passenger seats',{exact:true}).selectOption('2');await page.getByRole('button',{name:'Calculate fare',exact:true}).click();await expect(page.getByRole('heading',{name:'Your fare quote'})).toBeVisible();await page.getByRole('button',{name:'Confirm ride request',exact:true}).click();await expect(page).toHaveURL(/\/passenger\/rides\/[0-9a-f-]+$/);
    const rideId=page.url().split('/').pop();
    await driver.goto('/en/sign-in');await driver.getByLabel('Email address',{exact:true}).fill('jashim@demo.dhaka.test');await driver.getByLabel('Password',{exact:true}).fill(process.env.E2E_PASSWORD!);await driver.getByRole('button',{name:'Sign in',exact:true}).click();await expect(driver).toHaveURL('/en/account');
    await driver.goto('/en/driver/requests');if(await driver.getByRole('button',{name:'Go online',exact:true}).isVisible())await driver.getByRole('button',{name:'Go online',exact:true}).click();
    await driver.getByRole('article').filter({has:driver.getByRole('heading',{name:'Quantity passenger',exact:true})}).getByRole('button',{name:'Accept request',exact:true}).click();await expect(driver).toHaveURL(/\/driver\/pools\/[0-9a-f-]+$/);
    const poolId=driver.url().split('/').pop();await expect(driver.getByText('Reserved passenger seats: 2/3',{exact:true})).toBeVisible();
    await expect(page.getByText('Driver accepted',{exact:true})).toBeVisible();
    const own=(await (await page.request.get('/api/v1/ride-requests/'+rideId)).json()).data;expect(own.seats).toBe(2);expect(own.fare.totalPoysha).toBe(8000);expect(own.pool.reservedSeats).toBe(2);expect(own.pool).not.toHaveProperty('members');
    expect((await page.request.get('/api/v1/driver/pools/'+poolId)).status()).toBe(403);
    await page.getByRole('button',{name:'Cancel ride',exact:true}).click();await page.getByLabel('Cancellation reason',{exact:true}).fill('No longer needed');await page.getByRole('button',{name:'Confirm cancellation',exact:true}).click();await expect(page.getByText('Cancelled',{exact:true})).toBeVisible();
    await expect(driver.getByRole('heading',{name:'Bullet · Cancelled',exact:true})).toBeVisible();await driver.reload();await expect(driver.getByRole('heading',{name:'Bullet · Cancelled',exact:true})).toBeVisible();
    expect((await (await driver.request.get('/api/v1/driver/pools/current')).json()).data).toBeNull();
  }finally{await driverContext.close();}
});
