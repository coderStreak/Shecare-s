import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Globe,
  Calendar,
  BookOpen,
  MapPin,
  Stethoscope,
  Activity,
  Shield,
  Menu,
  X,
  PhoneCall,
  LogIn,
  LogOut,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  FileText,
  UserCheck
} from 'lucide-react';
import { SupportedLanguage, UserRole, UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenEmergency: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  activePortal?: 'patient' | 'doctor';
  onTogglePortal?: (portal: 'patient' | 'doctor') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange,
  userRole,
  onRoleChange,
  onOpenEmergency,
  currentUser,
  onOpenAuth,
  onLogout,
  activePortal = 'patient',
  onTogglePortal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [recordsMenuOpen, setRecordsMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setServicesMenuOpen(false);
        setRecordsMenuOpen(false);
        setLanguageMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setServicesMenuOpen(false);
        setRecordsMenuOpen(false);
        setLanguageMenuOpen(false);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const closeAllMenus = () => {
    setServicesMenuOpen(false);
    setRecordsMenuOpen(false);
    setLanguageMenuOpen(false);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleNavClick = (id: string) => {
    if (activePortal === 'doctor' && onTogglePortal) {
      onTogglePortal('patient');
    }
    onSelectTab(id);
    closeAllMenus();
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isServicesActive = ['symptoms', 'pcos-guide', 'doctors', 'hospitals'].includes(currentTab);
  const isRecordsActive = ['journal', 'appointments', 'privacy', 'admin'].includes(currentTab);

  const languageLabels: Record<SupportedLanguage, { short: string; full: string; native: string }> = {
    en: { short: 'EN', full: 'English', native: 'English' },
    kn: { short: 'KN', full: 'Kannada', native: 'ಕನ್ನಡ' },
    hi: { short: 'HI', full: 'Hindi', native: 'हिंदी' },
    mixed: { short: 'EN', full: 'English', native: 'English' }
  };

  return (
    <header ref={navRef} className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand: SheCare's */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden shrink-0"
              aria-label="SheCare's Home"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-400 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-white/30" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-rose-700 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                  SheCare's
                </span>
                <span className="block text-[10px] font-semibold text-rose-500 -mt-1 tracking-wider uppercase">
                  Women's Health Platform
                </span>
              </div>
            </button>

            {/* Unmerged Portal Switcher Badge */}
            <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shadow-inner">
              <button
                onClick={() => onTogglePortal && onTogglePortal('patient')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activePortal === 'patient'
                    ? 'bg-white text-rose-700 shadow-sm border border-rose-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to SheCare's Patient Portal"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Patient Portal</span>
              </button>
              
              <button
                onClick={() => onTogglePortal && onTogglePortal('doctor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activePortal === 'doctor'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-indigo-700'
                }`}
                title="Open Dedicated Doctor & Physician Portal"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Portal</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                  activePortal === 'doctor' ? 'bg-indigo-500 text-indigo-100' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  Clinical
                </span>
              </button>
            </div>

            {/* Simplified Desktop Menu Bar (菜单栏) */}
            <nav className="hidden xl:flex items-center gap-2" aria-label="Main Menu Bar">
              {/* 1. Home Link */}
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentTab === 'home' && activePortal === 'patient'
                    ? 'bg-rose-50 text-rose-700 shadow-2xs border border-rose-200/80 font-bold'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${currentTab === 'home' ? 'text-rose-600 fill-rose-600/20' : 'text-slate-400'}`} />
                <span>Home</span>
              </button>

              {/* 2. Highlighted Care & Services Dropdown Menu (高亮医疗服务) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setServicesMenuOpen(!servicesMenuOpen);
                    setRecordsMenuOpen(false);
                    setLanguageMenuOpen(false);
                    setUserDropdownOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                    isServicesActive || servicesMenuOpen
                      ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-900 border-2 border-rose-400 font-extrabold ring-2 ring-rose-200/60'
                      : 'bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 hover:from-rose-100 hover:to-pink-100 text-rose-800 border-2 border-rose-300 font-bold'
                  }`}
                  aria-expanded={servicesMenuOpen}
                >
                  <Activity className="w-3.5 h-3.5 text-rose-600" />
                  <span>Care Services</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-extrabold uppercase tracking-wider ml-0.5 shadow-2xs">
                    Featured
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${servicesMenuOpen ? 'rotate-180 text-rose-700' : 'text-rose-500'}`} />
                </button>

                {servicesMenuOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-rose-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Medical & Triage Services
                    </div>

                    <button
                      onClick={() => handleNavClick('doctors')}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                        currentTab === 'doctors' ? 'bg-rose-50 text-rose-800' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          Consult a Doctor
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Verified</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Virtual video & clinic bookings with top gynecologists</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavClick('symptoms')}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                        currentTab === 'symptoms' ? 'bg-rose-50 text-rose-800' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Understand Symptoms</div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Clinical triage & safe guidance in 3 languages</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavClick('pcos-guide')}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                        currentTab === 'pcos-guide' ? 'bg-rose-50 text-rose-800' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">PCOS & Hormonal Guide</div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Cycle tracking, diet plans & myth busters</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavClick('hospitals')}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                        currentTab === 'hospitals' ? 'bg-rose-50 text-rose-800' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Find Nearby Care</div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Hospitals, ultrasound clinics & maternity centers</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Highlighted My Health & Records Dropdown Menu (高亮个人健康) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setRecordsMenuOpen(!recordsMenuOpen);
                    setServicesMenuOpen(false);
                    setLanguageMenuOpen(false);
                    setUserDropdownOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                    isRecordsActive || recordsMenuOpen
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900 border-2 border-emerald-400 font-extrabold ring-2 ring-emerald-200/60'
                      : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-800 border-2 border-emerald-300 font-bold'
                  }`}
                  aria-expanded={recordsMenuOpen}
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>My Health</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold uppercase tracking-wider ml-0.5 shadow-2xs">
                    Personal
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${recordsMenuOpen ? 'rotate-180 text-emerald-700' : 'text-emerald-500'}`} />
                </button>

                {recordsMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-rose-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Personal Health Space
                    </div>

                    <button
                      onClick={() => handleNavClick('journal')}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                        currentTab === 'journal' ? 'bg-rose-50 text-rose-800' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Health Journal</div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Log daily symptoms, mood & cycle</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNavClick('appointments')}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                        currentTab === 'appointments' ? 'bg-rose-50 text-rose-800' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Appointments</div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Scheduled calls, clinic visits & tokens</p>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => handleNavClick('privacy')}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                        currentTab === 'privacy' ? 'bg-rose-50 text-rose-800' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Privacy & Settings</div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Confidentiality controls & security</p>
                      </div>
                    </button>

                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                          currentTab === 'admin' ? 'bg-rose-50 text-rose-800' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-amber-800">Admin Safety Rules</div>
                          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Clinical boundaries & protocols</p>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Action Bar - Simplified & Compact */}
          <div className="hidden sm:flex items-center gap-2">
            
            {/* Compact Language Selector Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setLanguageMenuOpen(!languageMenuOpen);
                  setServicesMenuOpen(false);
                  setRecordsMenuOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{languageLabels[language].short}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {(['en', 'kn', 'hi'] as SupportedLanguage[]).map((lng) => (
                    <button
                      key={lng}
                      onClick={() => {
                        onLanguageChange(lng);
                        setLanguageMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        language === lng ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{languageLabels[lng].native}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{lng}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Authenticated User Menu or Login/Signup */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setServicesMenuOpen(false);
                    setRecordsMenuOpen(false);
                    setLanguageMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 pr-2.5 bg-rose-50/90 hover:bg-rose-100 border border-rose-200 rounded-2xl transition-colors shadow-2xs"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white font-extrabold text-[11px] flex items-center justify-center shadow-2xs">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="text-left hidden md:block">
                    <span className="block text-xs font-bold text-slate-900 leading-tight max-w-[100px] truncate">
                      {currentUser.name}
                    </span>
                    <span className="block text-[9px] font-semibold text-rose-700 uppercase tracking-wider -mt-0.5">
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 text-xs">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                        {currentUser.role} Account
                      </span>
                    </div>

                    <div className="py-1 text-xs text-slate-700">
                      <button
                        onClick={() => handleNavClick('journal')}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4 text-rose-600" />
                        <span>My Health Journal</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('appointments')}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4 text-pink-600" />
                        <span>My Appointments</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 hover:border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs transition-all shadow-xs"
                >
                  Register
                </button>
              </div>
            )}

            {/* Compact Emergency Hotline Button */}
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-colors"
              title="Emergency Medical Triage & Ambulance"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span className="hidden xl:inline">Emergency</span>
              <span>108</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {!currentUser && (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200"
              >
                Sign In
              </button>
            )}
            <button
              onClick={onOpenEmergency}
              className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200"
              aria-label="Emergency help"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Simplified Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-rose-100 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          
          {/* Mobile Portal Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                if (onTogglePortal) onTogglePortal('patient');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activePortal === 'patient'
                  ? 'bg-white text-rose-700 shadow-sm border border-rose-100'
                  : 'text-slate-600'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Patient Portal</span>
            </button>
            <button
              onClick={() => {
                if (onTogglePortal) onTogglePortal('doctor');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activePortal === 'doctor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Portal</span>
            </button>
          </div>

          {/* User info on mobile */}
          {currentUser ? (
            <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">{currentUser.name}</span>
                <span className="text-[10px] text-slate-500 capitalize">{currentUser.role} Account • {currentUser.email}</span>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-600 font-bold underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                className="flex-1 py-2 rounded-xl border border-rose-300 text-rose-700 font-bold text-xs"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('signup'); }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Register
              </button>
            </div>
          )}

          {/* Compact Language Selector on Mobile */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              Language:
            </span>
            <div className="flex gap-1">
              {(['en', 'kn', 'hi'] as SupportedLanguage[]).map((lng) => (
                <button
                  key={lng}
                  onClick={() => onLanguageChange(lng)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
                    language === lng ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {languageLabels[lng].short}
                </button>
              ))}
            </div>
          </div>

          {/* Group 1: Care & Services */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
              Care & Services
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavClick('home')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 ${
                  currentTab === 'home' ? 'bg-rose-100 text-rose-800' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-600" />
                Home
              </button>
              <button
                onClick={() => handleNavClick('doctors')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 ${
                  currentTab === 'doctors' ? 'bg-rose-100 text-rose-800' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-rose-600" />
                Consult Doctor
              </button>
              <button
                onClick={() => handleNavClick('symptoms')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 ${
                  currentTab === 'symptoms' ? 'bg-rose-100 text-rose-800' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Activity className="w-4 h-4 text-pink-600" />
                Symptoms
              </button>
              <button
                onClick={() => handleNavClick('pcos-guide')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 ${
                  currentTab === 'pcos-guide' ? 'bg-rose-100 text-rose-800' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4 text-purple-600" />
                PCOS Guide
              </button>
              <button
                onClick={() => handleNavClick('hospitals')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 col-span-2 ${
                  currentTab === 'hospitals' ? 'bg-rose-100 text-rose-800' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <MapPin className="w-4 h-4 text-sky-600" />
                Find Nearby Care (Hospitals & Clinics)
              </button>
            </div>
          </div>

          {/* Group 2: My Health & Settings */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
              My Records & Settings
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavClick('journal')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 ${
                  currentTab === 'journal' ? 'bg-rose-100 text-rose-800' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Calendar className="w-4 h-4 text-rose-600" />
                Health Journal
              </button>
              <button
                onClick={() => handleNavClick('appointments')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 ${
                  currentTab === 'appointments' ? 'bg-rose-100 text-rose-800' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Clock className="w-4 h-4 text-pink-600" />
                Appointments
              </button>
              <button
                onClick={() => handleNavClick('privacy')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 col-span-2 ${
                  currentTab === 'privacy' ? 'bg-rose-50 text-rose-800' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Shield className="w-4 h-4 text-slate-600" />
                Privacy & Data Settings
              </button>
            </div>
          </div>

        </div>
      )}
    </header>
  );
};

