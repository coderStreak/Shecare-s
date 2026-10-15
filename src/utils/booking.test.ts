import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSessionPricing, isSlotAvailable, generateBookingReference } from './booking.ts';
import type { BookedSlot } from './booking.ts';

test('calculates per-session pricing with zero hidden subscriptions', () => {
  const pricing = calculateSessionPricing(499, 25);
  assert.equal(pricing.baseSessionFee, 499);
  assert.equal(pricing.durationMinutes, 25);
  assert.equal(pricing.platformFee, 0);
  assert.equal(pricing.isSubscription, false);
  assert.equal(pricing.totalPayable, 499);
});

test('prevents double-booking same doctor at same date and time', () => {
  const existing: BookedSlot[] = [
    { id: '1', doctorId: 'doc_1', date: '2026-10-20', time: '10:00', status: 'confirmed' },
    { id: '2', doctorId: 'doc_1', date: '2026-10-20', time: '11:00', status: 'cancelled' }
  ];

  // Conflicted slot
  assert.equal(isSlotAvailable('doc_1', '2026-10-20', '10:00', existing), false);
  // Cancelled slot can be re-booked
  assert.equal(isSlotAvailable('doc_1', '2026-10-20', '11:00', existing), true);
  // Available new slot
  assert.equal(isSlotAvailable('doc_1', '2026-10-20', '14:00', existing), true);
  // Different doctor on same time is allowed
  assert.equal(isSlotAvailable('doc_2', '2026-10-20', '10:00', existing), true);
});

test('generates valid booking reference format', () => {
  const ref = generateBookingReference();
  assert.match(ref, /^NC-\d{4}-\d{4}$/);
});
