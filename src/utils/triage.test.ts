import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSafetyTriage, CLINICAL_SAFETY_RULES } from './triage.ts';

test('detects severe sudden pelvic pain as an emergency', () => {
  const result = evaluateSafetyTriage('I have sudden severe pelvic pain on my right side');
  assert.equal(result.isEmergency, true);
  assert.equal(result.urgencyLevel, 'emergency');
  assert.ok(result.flaggedRules.length > 0);
  assert.match(result.flaggedRules[0].name, /Pelvic/i);
});

test('detects multilingual Kannada transliteration emergency (tumba hotte novu)', () => {
  const result = evaluateSafetyTriage('nanage tumba hotte novu ide mathu tale tirugide');
  assert.equal(result.isEmergency, true);
  assert.equal(result.urgencyLevel, 'emergency');
  assert.ok(result.flaggedRules.some(r => r.id === 'rule_severe_pelvic_pain' || r.id === 'rule_fainting_syncope'));
});

test('detects Hindi emergency for fainting with heavy bleeding', () => {
  const result = evaluateSafetyTriage('bahut jyada bleeding ho rahi hai aur behoshi aa gayi');
  assert.equal(result.isEmergency, true);
  assert.ok(result.flaggedRules.some(r => r.id === 'rule_hemorrhage_heavy_bleeding' || r.id === 'rule_fainting_syncope'));
});

test('handles non-emergency routine/timely symptoms safely without false emergency alarms', () => {
  const result = evaluateSafetyTriage('I have missed period for 2 months and noticed some acne on my jawline');
  assert.equal(result.isEmergency, false);
  assert.equal(result.urgencyLevel, 'timely');
  assert.equal(result.flaggedRules.length, 0);
  assert.ok(result.recommendedActions.length > 0);
});

test('detects native Kannada script emergency for severe pain and fainting', () => {
  const result = evaluateSafetyTriage('ತೀವ್ರ ಹೊಟ್ಟೆ ನೋವು ಇದೆ ಮತ್ತು ಪ್ರಜ್ಞೆ ತಪ್ಪಿದೆ');
  assert.equal(result.isEmergency, true);
  assert.equal(result.urgencyLevel, 'emergency');
  assert.ok(result.flaggedRules.length > 0);
});

test('detects native Hindi Devanagari script emergency for heavy bleeding and severe pain', () => {
  const result = evaluateSafetyTriage('अत्यधिक रक्तस्राव हो रहा है और तेज पेट दर्द है');
  assert.equal(result.isEmergency, true);
  assert.equal(result.urgencyLevel, 'emergency');
  assert.ok(result.flaggedRules.length > 0);
});
