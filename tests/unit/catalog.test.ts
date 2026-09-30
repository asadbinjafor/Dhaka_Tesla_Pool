import test from 'node:test';
import assert from 'node:assert/strict';
import en from '../../dhaka-tesla-pool-frontend/src/i18n/messages/en.json';
import bn from '../../dhaka-tesla-pool-frontend/src/i18n/messages/bn.json';

test('all implemented product copy has nonempty en/bn keys and matching placeholders', () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(bn).sort());
  for (const key of Object.keys(en) as (keyof typeof en)[]) {
    assert.ok(en[key].trim(), `English ${key}`);
    assert.ok(bn[key].trim(), `Bangla ${key}`);
    assert.deepEqual(en[key].match(/\{\w+\}/g) ?? [], bn[key].match(/\{\w+\}/g) ?? [], key);
  }
});
