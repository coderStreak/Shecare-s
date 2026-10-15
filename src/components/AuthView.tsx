import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  ShieldCheck,
  Languages,
  Sparkles,
  Stethoscope,
  Send,
  ArrowLeft,
  Calendar,
  LockKeyhole,
  Check,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { UserProfile, SupportedLanguage, UserRole } from '../types';
import { isValidEmail, isValidPhone, isValidPassword } from '../utils/authValidation';

interface AuthViewProps {
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
  currentUser: UserProfile | null;
  onLogout?: () => void;
  language: SupportedLanguage;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onNavigateHome,
  currentUser,
  onLogout,
  language
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'patient' | 'doctor'>('patient');
  const [signupLanguage, setSignupLanguage] = useState<SupportedLanguage>(language);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync initial mode if parent prop updates
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Fast 1-Click Demo Login
  const handleQuickDemo = (email: string, pass: string) => {
    setLoginIdentifier(email);
    setLoginPassword(pass);
    setLoginMethod('password');
    executeLogin(email, pass, 'password');
  };

  const handleRequestOtp = async () => {
    if (!loginIdentifier || loginIdentifier.trim().length < 8) {
      setErrorMessage('Please enter a valid 10-digit mobile number to receive your code.');
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
      if (!res.ok) throw new Error(data.error || 'Failed to send verification SMS.');

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

    if (!identifier) {
      setErrorMessage(method === 'password' ? 'Please enter your email address or mobile number.' : 'Please enter your mobile number.');
      setLoading(false);
      return;
    }

    if (method === 'password' && !password) {
      setErrorMessage('Please enter your account password.');
      setLoading(false);
      return;
    }

    if (method === 'otp' && !loginOtp) {
      setErrorMessage('Please enter the 4-digit verification code.');
      setLoading(false);
      return;
    }

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

      setSuccessToast(`Welcome back, ${data.user.name}! Accessing your health dashboard...`);
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 750);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupName.trim() || signupName.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!signupEmail || !isValidEmail(signupEmail)) {
      setErrorMessage('Please enter a valid email address (e.g., name@example.com).');
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!agreedTerms) {
      setErrorMessage('Please check the box to agree to the medical disclaimer and terms.');
      return;
    }

    setLoading(true);

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

      setSuccessToast(`Welcome to SheCare's, ${data.user.name}! Your account is ready.`);
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 750);
    } catch (err: any) {
      setErrorMessage(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !isValidEmail(forgotEmail)) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit password reset request.');

      setForgotSuccess(data.message || 'Password reset link sent to your email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Weak (min 6 characters required)', color: 'bg-red-400' };
    if (pass.length < 8 || !/\d/.test(pass)) return { score: 2, label: 'Fair (add numbers or make longer)', color: 'bg-amber-400' };
    return { score: 3, label: 'Strong & Secure', color: 'bg-emerald-500' };
  };

  const passStrength = getPasswordStrength(signupPassword);

  // If user is already logged in, show a friendly profile management card
  if (currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-rose-100 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-rose-200">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Signed In as {currentUser.role}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{currentUser.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{currentUser.email} • {currentUser.phone}</p>
          </div>

          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 max-w-md mx-auto text-left text-xs space-y-2 text-slate-700">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Account Type:</span>
              <span className="font-bold capitalize">{currentUser.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Preferred Language:</span>
              <span className="font-bold">
                {currentUser.languagePreference === 'kn' ? 'Kannada (ಕನ್ನಡ)' : currentUser.languagePreference === 'hi' ? 'Hindi (हिंदी)' : 'English'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Data Privacy:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero Biometric Storage
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onNavigateHome}
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-500/20 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Go to Health Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl shadow-rose-900/10 border border-rose-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Informational & Trust Pillar Column (Desktop/Tablet) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Background Glow Circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Banner */}
          <div className="relative z-10 space-y-6">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs font-bold text-rose-100 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SheCare's Home</span>
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <Heart className="w-6 h-6 fill-white/40" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Dignified, Private Women’s Health
              </h1>
              <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
                Empowering every woman to understand symptoms, explore PCOS education, and consult verified gynecologists in complete confidence.
              </p>
            </div>

            {/* Core Privacy & Feature Highlights */}
            <div className="space-y-3.5 pt-4 text-xs">
              <div className="flex items-start gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-xs">
                <div className="p-1.5 rounded-lg bg-white/20 text-white shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">100% Confidential & Secure</h4>
                  <p className="text-rose-100 text-[11px] leading-snug">
                    Zero Aadhaar requirement, zero health-data selling. Your logs remain private to you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-xs">
                <div className="p-1.5 rounded-lg bg-white/20 text-white shrink-0 mt-0.5">
                  <Languages className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Everyday Multilingual Care</h4>
                  <p className="text-rose-100 text-[11px] leading-snug">
                    Communicate comfortably in English, Kannada (ಕನ್ನಡ), Hindi (हिंदी), or transliteration.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-xs">
                <div className="p-1.5 rounded-lg bg-white/20 text-white shrink-0 mt-0.5">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Transparent Per-Session Consults</h4>
                  <p className="text-rose-100 text-[11px] leading-snug">
                    Direct access to certified doctors without recurring monthly subscriptions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Stat & Emergency Callout */}
          <div className="relative z-10 pt-6 border-t border-white/20 space-y-2 text-[11px] text-rose-100">
            <p className="italic">
              “SheCare's gave me clarity on my irregular cycles and connected me with an understanding doctor.”
            </p>
            <div className="flex items-center justify-between text-[10px] text-white/80 font-semibold pt-1">
              <span>Verified Health Care Network</span>
              <span>Emergency Hotline: 108</span>
            </div>
          </div>

        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          
          <div>
            {/* Top Mode Selector Tabs */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 block">
                  {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? "New to SheCare's" : 'Account Recovery'}
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {mode === 'login' ? 'Sign In to Your Account' : mode === 'signup' ? 'Create Your Account' : 'Reset Password'}
                </h2>
              </div>

              {mode !== 'forgot' && (
                <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl transition-all ${
                      mode === 'login'
                        ? 'bg-white text-rose-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
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
                    className={`px-3.5 py-1.5 rounded-xl transition-all ${
                      mode === 'signup'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Error & Success Feedback Banners */}
            <div className="space-y-3 my-4">
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successToast && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{successToast}</span>
                </div>
              )}
            </div>

            {/* 1-CLICK INSTANT DEMO LOGIN BAR (High User-Friendliness for Instant Testing) */}
            {mode === 'login' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-rose-50/80 via-purple-50/60 to-pink-50/80 rounded-2xl border border-rose-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    <span>Instant 1-Click Demo Profiles</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Click to test instantly:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('kavya@example.com', 'Password123')}
                    className="p-2.5 bg-white hover:bg-rose-50 border border-rose-200/70 hover:border-rose-400 rounded-xl text-left transition-all hover:scale-[1.02] shadow-2xs group"
                  >
                    <span className="font-bold text-xs text-slate-900 group-hover:text-rose-700 block truncate">
                      🌸 Kavya Narayan
                    </span>
                    <span className="text-[10px] text-slate-500 block">Patient Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('priya.rao@naricare.org', 'Doctor@123')}
                    className="p-2.5 bg-white hover:bg-pink-50 border border-pink-200/70 hover:border-pink-400 rounded-xl text-left transition-all hover:scale-[1.02] shadow-2xs group"
                  >
                    <span className="font-bold text-xs text-slate-900 group-hover:text-pink-700 block truncate">
                      🩺 Dr. Priya Rao
                    </span>
                    <span className="text-[10px] text-slate-500 block">Doctor Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin@naricare.org', 'Admin@123')}
                    className="p-2.5 bg-white hover:bg-purple-50 border border-purple-200/70 hover:border-purple-400 rounded-xl text-left transition-all hover:scale-[1.02] shadow-2xs group"
                  >
                    <span className="font-bold text-xs text-slate-900 group-hover:text-purple-700 block truncate">
                      🛡️ Dr. Radhika Sen
                    </span>
                    <span className="text-[10px] text-slate-500 block">Admin Mode</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 1. SIGN IN FORM */}
            {/* ========================================================= */}
            {mode === 'login' && (
              <form onSubmit={(e) => { e.preventDefault(); executeLogin(); }} className="space-y-4">
                
                {/* Method Switcher: Password vs Mobile OTP */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Choose Sign-In Method:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('password'); setErrorMessage(null); }}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                        loginMethod === 'password'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Password
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('otp'); setErrorMessage(null); }}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                        loginMethod === 'otp'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Mobile OTP
                    </button>
                  </div>
                </div>

                {/* Email or Phone Identifier */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {loginMethod === 'password' ? 'Email Address or Mobile Number' : 'Mobile Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-slate-400">
                      {loginMethod === 'password' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </div>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={loginMethod === 'password' ? 'e.g., kavya@example.com or 9886012345' : 'e.g., 98860 12345'}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                {loginMethod === 'password' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setForgotEmail(loginIdentifier.includes('@') ? loginIdentifier : '');
                        }}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* OTP Input */}
                {loginMethod === 'otp' && (
                  <div className="space-y-2 bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">4-Digit SMS Code</label>
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={loading || !loginIdentifier}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 underline disabled:opacity-50"
                      >
                        {otpSent ? 'Resend SMS Code' : 'Send Code to Mobile'}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value)}
                        placeholder="Enter 4-digit code (e.g. 1234)"
                        className="w-full py-2.5 text-center tracking-widest text-lg font-black bg-white border border-rose-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-400 font-mono"
                        required
                      />
                    </div>

                    {otpMessage ? (
                      <p className="text-[11px] text-emerald-700 font-medium">{otpMessage}</p>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        Click 'Send Code' to receive your instant SMS simulation.
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing You In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Signup link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-600">
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); setErrorMessage(null); }}
                      className="font-bold text-rose-600 hover:text-rose-700 underline ml-1"
                    >
                      Create one in 30 seconds
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* 2. SIGN UP FORM */}
            {/* ========================================================= */}
            {mode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                
                {/* Account Type Cards */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Select Your Role:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSignupRole('patient')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        signupRole === 'patient'
                          ? 'border-rose-500 bg-rose-50/80 shadow-xs'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 font-bold text-xs text-slate-900">
                        <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600/30" />
                        <span>Patient / Seeker</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Track cycles, understand symptoms, book doctor sessions.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignupRole('doctor')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        signupRole === 'doctor'
                          ? 'border-pink-500 bg-pink-50/80 shadow-xs'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 font-bold text-xs text-slate-900">
                        <Stethoscope className="w-3.5 h-3.5 text-pink-600" />
                        <span>Doctor / Clinician</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Manage consultations, review patient health reports.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name *</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Kavya Narayan"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-rose-400 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Email & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address *</label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="kavya@example.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Mobile (For OTP & reminders)</label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="tel"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="98860 12345"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Strength Meter */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Create Password *</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {signupPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passStrength.color} transition-all`}
                          style={{ width: `${(passStrength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{passStrength.label}</span>
                    </div>
                  )}
                </div>

                {/* Preferred Language */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Preferred Consultation & Response Language</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignupLanguage('en')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                        signupLanguage === 'en'
                          ? 'border-rose-600 bg-rose-50 text-rose-700'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupLanguage('kn')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                        signupLanguage === 'kn'
                          ? 'border-rose-600 bg-rose-50 text-rose-700'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ಕನ್ನಡ (Kannada)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupLanguage('hi')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                        signupLanguage === 'hi'
                          ? 'border-rose-600 bg-rose-50 text-rose-700'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      हिंदी (Hindi)
                    </button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 mt-0.5 w-4 h-4 shrink-0"
                  />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    I understand that NariCare AI is an educational guidance and care navigation platform, not a replacement for clinical diagnosis. I accept the <span className="text-rose-600 font-bold underline">Terms & Privacy Policy</span>.
                  </span>
                </label>

                {/* Submit Signup */}
                <button
                  type="submit"
                  disabled={loading || !agreedTerms}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Your Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Login link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMessage(null); }}
                      className="font-bold text-rose-600 hover:text-rose-700 underline ml-1"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* 3. FORGOT PASSWORD FORM */}
            {/* ========================================================= */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotSuccess ? (
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-200 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="text-base font-bold text-emerald-950">Recovery Link Dispatched</h3>
                    <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">{forgotSuccess}</p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setForgotSuccess(null); }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Enter your registered email address and we will provide an instant password recovery link.
                    </p>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Registered Email Address</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-3 text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="kavya@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setErrorMessage(null); }}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-rose-500/20"
                      >
                        {loading ? 'Sending...' : 'Send Recovery Link'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

          </div>

          {/* Bottom Guest Option & Security Assurance */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-slate-500 hover:text-slate-900 font-semibold underline text-[11px]"
            >
              Continue exploring as guest (no sign-in required)
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit encryption • HIPAA aligned</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
