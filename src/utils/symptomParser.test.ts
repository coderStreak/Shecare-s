import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMultilingualSymptoms, detectLanguage } from './symptomParser.ts';

test('detects language accurately', () => {
  assert.equal(detectLanguage('I have irregular cycles'), 'en');
  assert.equal(detectLanguage('ನನಗೆ ಮುಟ್ಟಿನ ಸಮಸ್ಯೆ ಇದೆ'), 'kn');
  assert.equal(detectLanguage('mujhe 2 months se periods nahi aaye'), 'hi');
  assert.equal(detectLanguage('nanage tumba hotte novu ide'), 'kn');
});

test('extracts symptoms and preserves negations properly in English', () => {
  const result = parseMultilingualSymptoms('I have irregular periods and acne, but no pelvic pain');
  assert.ok(result.reportedSymptoms.some(s => s.name.includes('Irregular')));
  assert.ok(result.reportedSymptoms.some(s => s.name.includes('Acne')));
  assert.ok(result.negatedSymptoms.some(s => s.name.includes('Pelvic Pain')));
  assert.equal(result.negatedSymptoms[0].isNegated, true);
});

test('handles Kannada transliterated input (Kanglish)', () => {
  const result = parseMultilingualSymptoms('nanage 3 monthsinda periods late agide mathu mukhadalli pimples ide');
  assert.ok(result.reportedSymptoms.some(s => s.name.includes('Irregular')));
  assert.ok(result.reportedSymptoms.some(s => s.name.includes('Acne')));
  assert.equal(result.detectedLanguage, 'kn');
  assert.ok(result.duration?.includes('3 months'));
});

test('handles Hindi transliterated negation (pain nahi hai)', () => {
  const result = parseMultilingualSymptoms('periods late ho rahe hai par pet me dard nahi hai');
  assert.ok(result.reportedSymptoms.some(s => s.name.includes('Irregular')));
  assert.ok(result.negatedSymptoms.some(s => s.name.includes('Pelvic Pain')));
});

test('handles native Kannada script with symptoms and negation (ನೋವಿಲ್ಲ)', () => {
  const result = parseMultilingualSymptoms('ಮುಟ್ಟು ತಡವಾಗಿದೆ ಮತ್ತು ಮುಖದಲ್ಲಿ ಮೊಡವೆ ಇದೆ ಆದರೆ ಹೊಟ್ಟೆ ನೋವಿಲ್ಲ');
  assert.equal(result.detectedLanguage, 'kn');
  assert.ok(result.reportedSymptoms.some(s => s.name.includes('Irregular')));
  assert.ok(result.reportedSymptoms.some(s => s.name.includes('Acne')));
  assert.ok(result.negatedSymptoms.some(s => s.name.includes('Pelvic Pain')));
});

test('handles native Hindi Devanagari script with symptoms and negation (दर्द नहीं है)', () => {
  const result = parseMultilingualSymptoms('अनियमित पीरियड्स और चेहरे पर मुँहासे हैं लेकिन पेट में दर्द नहीं है');
  assert.equal(result.detectedLanguage, 'hi');
  assert.ok(result.reportedSymptoms.some(s => s.name.includes('Irregular')));
  assert.ok(result.reportedSymptoms.some(s => s.name.includes('Acne')));
  assert.ok(result.negatedSymptoms.some(s => s.name.includes('Pelvic Pain')));
});
