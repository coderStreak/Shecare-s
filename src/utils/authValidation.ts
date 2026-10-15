/**
 * NariCare AI - Authentication & Input Validation Utilities
 * Pure logic for validating email, phone, passwords, and OTPs.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface SignupInput {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role?: 'patient' | 'doctor';
  agreedToTerms: boolean;
}

export interface LoginInput {
  identifier: string; // email or phone
  password?: string;
  otp?: string;
  loginMethod: 'password' | 'otp';
}

/**
 * Validates email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validates Indian or international phone numbers (e.g. 9886012345 or +919886012345)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Match 10 digits or 10 digits with optional +91 or 91 prefix
  const re = /^(?:\+?91)?[6-9]\d{9}$/;
  return re.test(cleaned);
}

/**
 * Validates password strength (minimum 6 characters)
 */
export function isValidPassword(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  return { isValid: true };
}

/**
 * Validates signup form data
 */
export function validateSignup(input: SignupInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'Please enter your full name (minimum 2 characters)';
  }

  if (!input.email || !isValidEmail(input.email)) {
    errors.email = 'Please enter a valid email address (e.g. name@example.com)';
  }

  if (input.phone && !isValidPhone(input.phone)) {
    errors.phone = 'Please enter a valid 10-digit mobile number';
  }

  if (!input.password) {
    errors.password = 'Please create a password';
  } else {
    const passCheck = isValidPassword(input.password);
    if (!passCheck.isValid && passCheck.message) {
      errors.password = passCheck.message;
    }
  }

  if (!input.agreedToTerms) {
    errors.terms = 'Please accept the medical disclaimer and terms to continue';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates login form data
 */
export function validateLogin(input: LoginInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.identifier || input.identifier.trim().length === 0) {
    errors.identifier = 'Please enter your email address or mobile number';
  } else {
    const isEmail = input.identifier.includes('@');
    if (isEmail && !isValidEmail(input.identifier)) {
      errors.identifier = 'Please enter a valid email address';
    } else if (!isEmail && !isValidPhone(input.identifier)) {
      errors.identifier = 'Please enter a valid 10-digit mobile number';
    }
  }

  if (input.loginMethod === 'password') {
    if (!input.password || input.password.length === 0) {
      errors.password = 'Please enter your password';
    }
  } else if (input.loginMethod === 'otp') {
    if (!input.otp || !/^\d{4,6}$/.test(input.otp.trim())) {
      errors.otp = 'Please enter the 4-digit verification code sent to your phone';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Generates simulated 4-digit OTP for testing
 */
export function generateTestOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
