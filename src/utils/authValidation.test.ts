import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  validateSignup,
  validateLogin,
  generateTestOtp
} from './authValidation.ts';

test('validates correct email formats', () => {
  assert.equal(isValidEmail('kavya@example.com'), true);
  assert.equal(isValidEmail('priya.rao@naricare.org'), true);
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(isValidEmail('missing@domain'), false);
  assert.equal(isValidEmail(''), false);
});

test('validates Indian and international phone formats', () => {
  assert.equal(isValidPhone('9886012345'), true);
  assert.equal(isValidPhone('+919886012345'), true);
  assert.equal(isValidPhone('919886012345'), true);
  assert.equal(isValidPhone('12345'), false);
  assert.equal(isValidPhone('abcdefghij'), false);
});

test('validates password strength rules', () => {
  assert.equal(isValidPassword('short').isValid, false);
  assert.equal(isValidPassword('SecurePass123').isValid, true);
});

test('validates signup payload requiring agreement to terms', () => {
  const resultInvalid = validateSignup({
    name: 'Kavya',
    email: 'kavya@example.com',
    password: 'Password123',
    agreedToTerms: false
  });
  assert.equal(resultInvalid.isValid, false);
  assert.ok(resultInvalid.errors.terms);

  const resultValid = validateSignup({
    name: 'Kavya Narayan',
    email: 'kavya@example.com',
    password: 'Password123',
    agreedToTerms: true
  });
  assert.equal(resultValid.isValid, true);
});

test('validates login payload with password or otp methods', () => {
  const resultPass = validateLogin({
    identifier: 'kavya@example.com',
    password: 'Password123',
    loginMethod: 'password'
  });
  assert.equal(resultPass.isValid, true);

  const resultOtp = validateLogin({
    identifier: '9886012345',
    otp: '1234',
    loginMethod: 'otp'
  });
  assert.equal(resultOtp.isValid, true);
});

test('generates valid 4-digit OTP', () => {
  const otp = generateTestOtp();
  assert.match(otp, /^\d{4}$/);
});
