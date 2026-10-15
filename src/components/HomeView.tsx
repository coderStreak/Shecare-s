import React, { useState } from 'react';
import {
  Heart,
  Activity,
  BookOpen,
  MapPin,
  Stethoscope,
  ShieldCheck,
  Languages,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Award
} from 'lucide-react';
import { SupportedLanguage, UserProfile } from '../types';

interface HomeViewProps {
  onNavigate: (tab: string, initialQuery?: string) => void;
  language: SupportedLanguage;
  currentUser?: UserProfile | null;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, language, currentUser }) => {
  const [quickInput, setQuickInput] = useState('');

  const i18n = {
    en: {
      badge: "Multilingual Menstrual & PCOS Health Navigator",
      heading1: "Describe your symptoms in ",
      headingSpan: "everyday words",
      subheading: "Get medically reviewed guidance on PCOS, cycle regularity, and hormonal health in English, Kannada (ಕನ್ನಡ), or Hindi (हिंदी). Discover verified nearby care and book doctor consultations with transparent per-session pricing.",
      placeholder: "Type in Kannada, Hindi, or English (e.g., 'periods late ide mathu acne')...",
      analyzeBtn: "Analyze Symptoms",
      trySample: "Try sample:",
      nonDiagnostic: "Strict Non-Diagnostic Safety",
      languages: "English • ಕನ್ನಡ • हिंदी",
      triageChecklist: "Pre-screened Triage Checklist"
    },
    kn: {
      badge: "ಬಹುಭಾಷಾ ಮುಟ್ಟು ಮತ್ತು ಪಿಸಿಒಎಸ್ (PCOS) ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶಿ",
      heading1: "ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ",
      headingSpan: "ಸಾಮಾನ್ಯ ಆಡುಮಾತಿನಲ್ಲಿ ವಿವರಿಸಿ",
      subheading: "ಪಿಸಿಒಎಸ್, ಮುಟ್ಟಿನ ದಿನಚರಿ ಮತ್ತು ಹಾರ್ಮೋನ್ ಆರೋಗ್ಯದ ಕುರಿತು ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ ಪಡೆಯಿರಿ. ನಂಬಿಕಸ್ಥ ಸಮೀಪದ ಆಸ್ಪತ್ರೆಗಳನ್ನು ಗುರುತಿಸಿ ಮತ್ತು ಪಾರದರ್ಶಕ ಶುಲ್ಕದಲ್ಲಿ ತಜ್ಞ ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗಿ.",
      placeholder: "ಕನ್ನಡದಲ್ಲಿ ಮುಕ್ತವಾಗಿ ಬರೆಯಿರಿ (ಉದಾ: 'ಮುಟ್ಟು ತಡವಾಗಿದೆ ಮತ್ತು ಮುಖದಲ್ಲಿ ಮೊಡವೆ ಇದೆ')...",
      analyzeBtn: "ಲಕ್ಷಣಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ",
      trySample: "ಮಾದರಿ ಪ್ರಶ್ನೆಗಳು:",
      nonDiagnostic: "ಸುರಕ್ಷಿತ ವೈದ್ಯಕೀಯ ನಿಯಮಗಳು",
      languages: "ಕನ್ನಡ • English • हिंदी",
      triageChecklist: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ ರಕ್ಷಣೆ"
    },
    hi: {
      badge: "बहुभाषी मासिक धर्म व पीसीओएस (PCOS) स्वास्थ्य मार्गदर्शक",
      heading1: "अपने लक्षणों को ",
      headingSpan: "सरल बोलचाल की भाषा में बताएं",
      subheading: "पीसीओएस, मासिक चक्र और हॉर्मोनल स्वास्थ्य के बारे में हिंदी, कन्नड़ या अंग्रेजी में चिकित्सकीय रूप से समीक्षित मार्गदर्शन प्राप्त करें। प्रमाणित नजदीकी अस्पताल खोजें और पारदर्शी शुल्क पर डॉक्टरों से परामर्श लें।",
      placeholder: "हिंदी में लिखें (जैसे: '2 महीने से पीरियड्स लेट हैं और चेहरे पर मुँहासे हैं')...",
      analyzeBtn: "लक्षणों का विश्लेषण करें",
      trySample: "उदाहरण प्रश्न:",
      nonDiagnostic: "सख्त गैर-निदान सुरक्षा नियम",
      languages: "हिंदी • English • ಕನ್ನಡ",
      triageChecklist: "आपातकालीन ट्राइएज जांच"
    }
  };

  const t = i18n[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'];

  const samplePrompts = language === 'kn' ? [
    { text: 'ಮುಟ್ಟು ತಡವಾಗಿದೆ ಮತ್ತು ಮುಖದಲ್ಲಿ ಮೊಡವೆಗಳು ಹೆಚ್ಚಾಗಿವೆ', lang: 'kn', desc: 'Kannada script' },
    { text: 'periods late agide mathu pimples jasthi ide', lang: 'kn', desc: 'Kanglish' },
    { text: 'ಹೊಟ್ಟೆ ನೋವಿಲ್ಲ ಆದರೆ ತೂಕ ಹೆಚ್ಚಾಗುತ್ತಿದೆ', lang: 'kn', desc: 'Kannada negation' }
  ] : language === 'hi' ? [
    { text: '2 महीने से पीरियड्स नहीं आए और वजन बढ़ रहा है', lang: 'hi', desc: 'Hindi script' },
    { text: '2 mahine se periods nahi aaye aur vajan badh raha hai', lang: 'hi', desc: 'Hinglish' },
    { text: 'अनियमित पीरियड्स हैं लेकिन पेट में दर्द नहीं है', lang: 'hi', desc: 'Hindi negation' }
  ] : [
    { text: 'Periods late agide mathu pimples jasthi ide', lang: 'kn', desc: 'Kannada transliteration' },
    { text: '2 mahine se periods nahi aaye aur vajan badh raha hai', lang: 'hi', desc: 'Hindi transliteration' },
    { text: 'Irregular cycles for 4 months with facial hair, but no pelvic pain', lang: 'en', desc: 'English with negation' }
  ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onNavigate('symptoms', quickInput.trim());
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 bg-gradient-to-b from-rose-100/60 via-purple-50/40 to-transparent border-b border-rose-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* User-Friendly Greeting & Auth Callout Bar */}
          <div className="mb-6 max-w-2xl">
            {currentUser ? (
              <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-rose-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">Welcome back, {currentUser.name}!</span>
                    <span className="text-[10px] text-slate-500 capitalize">{currentUser.role} Account • {currentUser.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('journal')}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors text-[11px]"
                  >
                    My Health Journal
                  </button>
                  <button
                    onClick={() => onNavigate('appointments')}
                    className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-lg transition-colors text-[11px]"
                  >
                    Appointments
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-rose-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="p-1 rounded-lg bg-rose-100 text-rose-700">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[11px] sm:text-xs">
                    Guest Mode: Exploring freely. Want to save your personal symptom history & appointments?
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[11px] transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="px-3 py-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold rounded-xl text-[11px] transition-all hover:scale-105 shadow-2xs"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-200/50 border border-rose-300/60 text-rose-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>{t.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                {t.heading1}<span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">{t.headingSpan}</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {t.subheading}
              </p>

              {/* Quick Input Bar */}
              <div className="bg-white rounded-3xl p-3 shadow-xl shadow-rose-900/5 border border-rose-100 max-w-2xl">
                <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder={t.placeholder}
                    className="flex-1 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/70 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-rose-400 border border-slate-200/80"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <span>{t.analyzeBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Sample Prompt Chips */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium mr-1 text-[11px]">{t.trySample}</span>
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => onNavigate('symptoms', p.text)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-[11px] font-medium transition-colors border border-slate-200/60"
                    >
                      {p.text.length > 32 ? p.text.substring(0, 32) + '...' : p.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guarantees */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.nonDiagnostic}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-purple-600" />
                  <span>{t.languages}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>{t.triageChecklist}</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Highlights Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-900/10 border border-rose-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Clinical Guidance Active</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full">
                    WHO & ACOG Aligned
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70">
                    <div className="flex items-center gap-2 font-bold text-rose-950 text-sm mb-1">
                      <Activity className="w-4 h-4 text-rose-600" />
                      <span>Multilingual Normalization</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Accepts native Kannada, Devanagari Hindi, English, and Romanized script. Accurately preserves negations like <em>"no pain"</em> or <em>"novu illa"</em>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/70">
                    <div className="flex items-center gap-2 font-bold text-teal-950 text-sm mb-1">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span>Transparent Per-Session Care</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Consult verified gynecologists starting at ₹399 per session. Zero recurring subscriptions, clear fees, and 100% refund up to 2 hours before your appointment.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/70">
                    <div className="flex items-center gap-2 font-bold text-purple-950 text-sm mb-1">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>Doctor-Ready Summary Export</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Track cycles and generate a concise, printable clinical report with symptom patterns ready for your physician.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('pcos-guide')}
                    className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <span>Read the Rotterdam PCOS Clinical Guide</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 Core Pillars Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Explore The Platform</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Four Steps to Understand & Navigate Your Health
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            From everyday symptom understanding to verified hospital discovery and one-on-one specialist care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div
            onClick={() => onNavigate('symptoms')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-rose-100 shadow-md shadow-rose-900/5 hover:shadow-xl hover:border-rose-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                Understand Symptoms
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Describe in Kannada, Hindi, or English. Get structured summaries, non-diagnostic guidance, and clinical questions for your doctor.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
              <span>Start Checker</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigate('pcos-guide')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-purple-100 shadow-md shadow-purple-900/5 hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                PCOS & Hormone Guide
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Medically reviewed breakdown of the Rotterdam criteria, ultrasound findings, differential diagnoses, and evidence-based myth busting.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>Explore Guide</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigate('hospitals')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-teal-100 shadow-md shadow-teal-900/5 hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Find Nearby Hospitals
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Find verified gynecological emergency casualty centers, women's clinics, and ultrasound centers with direct calling and directions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
              <span>Locate Centers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onNavigate('doctors')}
            className="group cursor-pointer bg-white rounded-3xl p-6 border border-pink-100 shadow-md shadow-pink-900/5 hover:shadow-xl hover:border-pink-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-pink-700 transition-colors">
                Consult a Doctor
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Book verified obstetricians and gynecologists with transparent per-session pricing (₹399–₹650). Video or audio with private links.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-pink-600">
              <span>View Doctors</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* Patient Privacy & Safety Commitment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-pink-400">Our Clinical Integrity Promise</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Evidence-based healthcare that respects your dignity and autonomy.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We never collect Aadhaar numbers or sell sensitive health queries. Symptom understanding runs through safety rules verified by clinicians. If warning signs are detected, we immediately escalate you to local emergency care.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate('journal')}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                Log Menstrual Journal
              </button>
              <button
                onClick={() => onNavigate('privacy')}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
              >
                Read Privacy & Clinical Boundaries
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
