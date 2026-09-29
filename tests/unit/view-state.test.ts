import test from 'node:test';
import assert from 'node:assert/strict';
import { clearPrivateView, isLocale, isTheme, localePath, withTheme } from '../../packages/contracts/src/index';
import type { ViewState } from '../../packages/contracts/src/index';

const state: ViewState = {
  theme: 'dark', authDraft: { name: 'Nusrat', email: 'fixture@example.com', password: 'memory-only-fixture', confirm: '' },
  bookingDraft: { pickupId: 'BANANI', destinationId: 'MOHAKHALI', seats: 2 },
  quoteId: 'quote-owned-fixture', currentRideId: 'ride-owned-fixture',
  pendingCommand: { key: 'same-command-fixture', target: 'ride:ride-owned-fixture', body: { quoteId: 'quote-owned-fixture' } },
  sessionGeneration: 3,
};

test('theme change retains valid form/quote/ride/pending command and session generation', () => {
  const changed = withTheme(state, 'light');
  assert.equal(changed.theme, 'light');
  assert.equal(changed.authDraft, state.authDraft);
  assert.equal(changed.bookingDraft, state.bookingDraft);
  assert.equal(changed.pendingCommand, state.pendingCommand);
  assert.equal(changed.quoteId, state.quoteId);
  assert.equal(changed.currentRideId, state.currentRideId);
  assert.equal(changed.sessionGeneration, state.sessionGeneration);
});

test('locale display path preserves exact stable ride ID, and cannot rewrite API paths', () => {
  assert.equal(localePath('/en/passenger/rides/same-opaque-id', 'bn'), '/bn/passenger/rides/same-opaque-id');
  assert.equal(localePath('/bn/driver/pools/same-pool-id', 'en'), '/en/driver/pools/same-pool-id');
  assert.throws(() => localePath('/api/v1/ride-requests', 'bn'));
  assert.throws(() => localePath('//outside.example', 'en'));
});

test('session boundary clears private drafts/intent while preserving appearance', () => {
  const changed = clearPrivateView(state);
  assert.equal(changed.theme, 'dark');
  assert.equal(changed.sessionGeneration, 4);
  assert.deepEqual(changed.authDraft, { name: '', email: '', password: '', confirm: '' });
  assert.equal(changed.pendingCommand, null);
  assert.equal(changed.quoteId, null);
  assert.equal(changed.currentRideId, null);
});

test('untrusted locale/theme values are allowlisted', () => {
  for (const value of ['en', 'bn']) assert.ok(isLocale(value));
  for (const value of ['dark', 'light']) assert.ok(isTheme(value));
  for (const value of ['../en', '__proto__', 'system', 'BN', null, {}]) {
    assert.equal(isLocale(value), false);
    assert.equal(isTheme(value), false);
  }
});
