import test from 'node:test';import assert from 'node:assert/strict';import {money,dateTime,zoneLabel} from '../../dhaka-tesla-pool-frontend/src/i18n/format.ts';
test('BDT uses exact poysha, Bangla numerals and the same canonical value; Dhaka date crosses UTC midnight correctly',()=>{
  assert.equal(money('en',4000),'BDT 40.00');assert.match(money('bn',4000),/৪০\.০০/);assert.match(money('bn',0),/০\.০০/);
  assert.match(dateTime('en','2026-09-27T18:00:00Z'),/Sep 28/);assert.match(dateTime('bn','2026-09-27T18:00:00Z'),/২৮/);
  assert.equal(zoneLabel('bn','mohakhali'),'মহাখালী');assert.equal(zoneLabel('en','mohakhali'),'Mohakhali');
});
