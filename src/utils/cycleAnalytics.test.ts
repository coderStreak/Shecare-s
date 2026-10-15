import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCycles } from './cycleAnalytics.ts';
import type { CycleEntry } from './cycleAnalytics.ts';

test('flags irregular menstrual intervals when variation exceeds 9 days', () => {
  const entries: CycleEntry[] = [
    { id: '1', startDate: '2026-05-01', symptoms: ['cramps'] },
    { id: '2', startDate: '2026-06-10', symptoms: ['acne'] },     // 40 days interval
    { id: '3', startDate: '2026-07-05', symptoms: ['bloating'] }, // 25 days interval
  ];

  const analysis = analyzeCycles(entries);
  assert.equal(analysis.totalLoggedCycles, 3);
  assert.equal(analysis.isIrregular, true);
  assert.ok(analysis.irregularityWarning !== null);
  assert.match(analysis.irregularityWarning || '', /variation detected/i);
});

test('accurately summarizes typical 28-day cycle', () => {
  const entries: CycleEntry[] = [
    { id: '1', startDate: '2026-01-01', symptoms: ['mild fatigue'] },
    { id: '2', startDate: '2026-01-29', symptoms: ['mild cramps'] }, // 28 days
    { id: '3', startDate: '2026-02-26', symptoms: ['bloating'] }     // 28 days
  ];

  const analysis = analyzeCycles(entries);
  assert.equal(analysis.averageCycleLengthDays, 28);
  assert.equal(analysis.isIrregular, false);
});
