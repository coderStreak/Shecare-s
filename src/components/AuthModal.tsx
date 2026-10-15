import React, { useState } from 'react';
import {
  Heart,
  Mail,
  Lock,
  Phone,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  Languages,
  Sparkles,
  Stethoscope,
  Send,
  KeyRound
} from 'lucide-react';
import { UserProfile, SupportedLanguage } from '../types';
import { isValidEmail, isValidPassword } from '../utils/authValidation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  // Login inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  // Signup inputs
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'patient' | 'doctor'>('patient');
  const [signupLanguage, setSignupLanguage] = useState<SupportedLanguage>('en');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Forgot password input
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // General state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1-Click Fast Demo Login
  const handleQuickDemo = (email: string, pass: string) => {
    setLoginIdentifier(email);
    setLoginPassword(pass);
    setLoginMethod('password');
    executeLogin(email, pass, 'password');
  };

  const handleRequestOtp = async () => {
    if (!loginIdentifier || loginIdentifier.length < 8) {
      setErrorMessage('Please enter a valid mobile number first');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginIdentifier })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setOtpSent(true);
      setLoginOtp(data.testOtp || '1234');
      setOtpMessage(data.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to dispatch verification SMS.');
    } finally {
      setLoading(false);
    }
  };

  const executeLogin = async (idVal?: string, passVal?: string, methodVal?: 'password' | 'otp') => {
    setLoading(true);
    setErrorMessage(null);

    const identifier = idVal || loginIdentifier;
    const password = passVal || loginPassword;
    const method = methodVal || loginMethod;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password: method === 'password' ? password : undefined,
          otp: method === 'otp' ? loginOtp : undefined,
          loginMethod: method
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      setSuccessMessage(`Welcome back, ${data.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          phone: signupPhone,
          password: signupPassword,
          role: signupRole,
          languagePreference: signupLanguage,
          agreedToTerms: agreedTerms
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setSuccessMessage(data.message);
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request.');

      setForgotSuccess(data.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Weak (min 6 chars)', color: 'bg-red-400' };
    if (pass.length < 8 || !/\d/.test(pass)) return { score: 2, label: 'Fair', color: 'bg-amber-400' };
    return { score: 3, label: 'Strong & Secure', color: 'bg-emerald-500' };
  };

  const passStrength = getPasswordStrength(signupPassword);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border-b border-rose-100/70 relative">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-5 top-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <Heart className="w-5 h-5 fill-white/30" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 block">
                NariCare AI Account
              </span>
              <h2 id="auth-modal-title" className="text-xl font-black text-slate-900">
                {mode === 'login' ? 'Sign In to Your Account' : mode === 'signup' ? 'Create Your Account' : 'Reset Password'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {mode === 'login'
              ? 'Access your private symptom records, scheduled appointments, and health journal.'
              : mode === 'signup'
              ? 'Private, dignified women’s health tracking. We never share or sell sensitive personal data.'
              : 'Enter your registered email address to receive password recovery instructions.'}
          </p>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="flex p-1 bg-white/80 backdrop-blur-xs rounded-2xl border border-rose-200/60 mt-4 text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  mode === 'login' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  mode === 'signup' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1-Click Fast Demo Login Chips (High User-Friendliness) */}
          {mode === 'login' && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                <span className="flex items-center gap-1 text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Instant 1-Click Demo Profiles:</span>
                </span>
                <span className="text-[10px] text-slate-400">Click to fill & log in</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('kavya@example.com', 'Password123')}
                  className="p-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl text-center text-slate-800 transition-colors"
                >
                  <span className="font-bold block text-[11px] truncate">Patient Kavya</span>
                  <span className="text-[9px] text-slate-400">Patient Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('priya.rao@naricare.org', 'Doctor@123')}
                  className="p-2 bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-300 rounded-xl text-center text-slate-800 transition-colors"
                >
                  <span className="font-bold block text-[11px] truncate">Dr. Priya Rao</span>
                  <span className="text-[9px] text-slate-400">Doctor Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@naricare.org', 'Admin@123')}
                  className="p-2 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-center text-slate-800 transition-colors"
                >
                  <span className="font-bold block text-[11px] truncate">Dr. Radhika</span>
                  <span className="text-[9px] text-slate-400">Admin Mode</span>
                </button>
              </div>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={(e) => { e.preventDefault(); executeLogin(); }} className="space-y-4">
              
              {/* Login Method Toggle: Password vs OTP */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-700">Sign in using:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('password'); setErrorMessage(null); }}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      loginMethod === 'password' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('otp'); setErrorMessage(null); }}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      loginMethod === 'otp' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Mobile OTP
                  </button>
                </div>
              </div>

              {/* Identifier (Email / Phone) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {loginMethod === 'password' ? 'Email Address or Mobile Number' : 'Mobile Number'}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-400">
                    {loginMethod === 'password' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={loginMethod === 'password' ? 'e.g. kavya@example.com or 9886012345' : 'e.g. 98860 12345'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-400 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              {loginMethod === 'password' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-400 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP field */}
              {loginMethod === 'otp' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">4-Digit Verification Code</label>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loading || !loginIdentifier}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline disabled:opacity-50"
                    >
                      {otpSent ? 'Resend Code' : 'Send Code via SMS'}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      placeholder="Enter 4-digit code (e.g. 1234)"
                      className="w-full p-2.5 text-center tracking-widest text-base font-black bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-400 font-mono"
                      required
                    />
                  </div>

                  {otpMessage && (
                    <p className="text-[11px] text-emerald-700 font-medium">{otpMessage}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              
              {/* Full Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Kavya Narayan"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-400"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="kavya@example.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Number (Optional)</label>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+91 98860 12345"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Create Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupPassword && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${passStrength.color} transition-all`} style={{ width: `${(passStrength.score / 3) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">{passStrength.label}</span>
                  </div>
                )}
              </div>

              {/* Role & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Type</label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="patient">Patient / Health Seeker</option>
                    <option value="doctor">Gynecologist / Clinician</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preferred Language</label>
                  <select
                    value={signupLanguage}
                    onChange={(e) => setSignupLanguage(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="en">English</option>
                    <option value="kn">Kannada (ಕನ್ನಡ)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                  </select>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 mt-0.5 w-4 h-4 shrink-0"
                />
                <span className="text-[11px] text-slate-600 leading-snug">
                  I understand that NariCare AI provides educational guidance and care navigation, not medical diagnoses. I agree to the <span className="text-rose-600 underline font-semibold">Terms & Privacy Policy</span>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !agreedTerms}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {forgotSuccess ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">{forgotSuccess}</p>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setForgotSuccess(null); }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Registered Email Address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="kavya@example.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs"
                    >
                      Send Reset Instructions
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Privacy & Guest Exploration Guarantee */}
          <div className="pt-3 border-t border-slate-100 text-center space-y-2">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold underline"
            >
              Continue exploring as guest (no sign in required)
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Aadhaar collection • End-to-end encrypted sessions</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
