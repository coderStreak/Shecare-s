import React, { useState, useEffect } from 'react';
import {
  Activity,
  Mic,
  MicOff,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  ExternalLink,
  BookOpen,
  RotateCcw,
  Languages,
  ShieldAlert,
  Calendar,
  AlertOctagon,
  PhoneCall
} from 'lucide-react';
import { SupportedLanguage, AIAnalysisResponse, MedicalCitation } from '../types';

interface SymptomCheckerProps {
  initialQuery?: string;
  onBookDoctor: (symptomSummary?: string) => void;
  language: SupportedLanguage;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  initialQuery = '',
  onBookDoctor,
  language: globalLang
}) => {
  const [inputText, setInputText] = useState(initialQuery);
  const [responseLanguage, setResponseLanguage] = useState<SupportedLanguage>(globalLang);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    setResponseLanguage(globalLang);
  }, [globalLang]);

  useEffect(() => {
    setInputText(initialQuery);
    if (initialQuery.trim()) {
      handleAnalyze(initialQuery.trim());
    }
  }, [initialQuery]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const handleVoiceToggle = () => {
    if (!speechSupported) {
      alert('Voice speech recognition is not supported in this browser version. You can type freely in Kannada, Hindi, or English.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    if (responseLanguage === 'kn') {
      recognition.lang = 'kn-IN';
    } else if (responseLanguage === 'hi') {
      recognition.lang = 'hi-IN';
    } else {
      recognition.lang = 'en-IN';
    }

    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleAnalyze = async (textToAnalyze?: string) => {
    const query = (textToAnalyze || inputText).trim();
    if (!query) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/symptoms/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: query,
          targetLanguage: responseLanguage
        })
      });

      if (!res.ok) {
        throw new Error('Server returned an error while analyzing symptoms.');
      }

      const data: AIAnalysisResponse = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to health navigation service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleClick = (sample: string) => {
    setInputText(sample);
    handleAnalyze(sample);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
          <Activity className="w-3.5 h-3.5" />
          <span>Multilingual Symptom Understanding</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Describe How You Are Feeling
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Type or speak naturally in <strong>Kannada, Hindi, English, or transliterated words</strong>. Our deterministic clinical safety engine checks warning signs before providing grounded guidance.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-rose-900/5 border border-rose-100 space-y-4">
        
        {/* Language & Voice Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-700">Response Language:</span>
            <div className="flex gap-1">
              {(['en', 'kn', 'hi'] as SupportedLanguage[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setResponseLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    responseLanguage === lang ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'kn' ? 'ಕನ್ನಡ' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>

          {speechSupported && (
            <button
              onClick={handleVoiceToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListening ? 'Listening (Speak now)...' : 'Use Voice Input'}</span>
            </button>
          )}
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your symptoms here... e.g.:
• 'Nanage 3 monthsinda period baralla, mukhadalli pimples ide but hotte novu illa' (Kannada transliteration)
• 'Mujhe 2 mahine se periods late hain aur chin par baal aa rahe hain' (Hindi transliteration)
• 'I missed my cycle for 60 days, facing cystic acne, but no pelvic cramps' (English)"
            className="w-full p-4 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/60 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400 resize-none font-medium leading-relaxed"
          />
        </div>

        {/* Action bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Quick tests:</span>
            <button
              onClick={() => handleSampleClick('nanage 3 monthsinda periods irregular agide, chin mele hair ide mathu acne ide')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-700 rounded-lg text-[11px]"
            >
              ಕನ್ನಡ (PCOS signs)
            </button>
            <button
              onClick={() => handleSampleClick('periods 2 mahine se late hain par pet me dard nahi hai')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-700 rounded-lg text-[11px]"
            >
              हिंदी (With negation)
            </button>
            <button
              onClick={() => handleSampleClick('Sudden severe pelvic pain on right side and I feel like fainting')}
              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[11px] font-bold"
            >
              🚨 Test Warning Escalation
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {inputText && (
              <button
                onClick={() => {
                  setInputText('');
                  setAnalysisResult(null);
                }}
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Clear input"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleAnalyze()}
              disabled={isLoading || !inputText.trim()}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Medically...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyze Symptoms</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-4 animate-pulse">
          <div className="h-4 bg-rose-100 rounded-md w-1/4"></div>
          <div className="h-6 bg-slate-100 rounded-md w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded-md"></div>
            <div className="h-4 bg-slate-100 rounded-md w-5/6"></div>
          </div>
          <div className="h-20 bg-rose-50/50 rounded-2xl"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-800 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Emergency Escalation Card (If triggered) */}
          {analysisResult.isEmergency ? (
            <div className="bg-red-50 rounded-3xl p-6 sm:p-8 border-2 border-red-500 shadow-xl space-y-5">
              <div className="flex items-center gap-3 text-red-700">
                <AlertOctagon className="w-8 h-8 text-red-600 animate-pulse shrink-0" />
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-red-500">Immediate Clinical Attention</span>
                  <h2 className="text-xl sm:text-2xl font-black text-red-900">Urgent Medical Warning Signs Detected</h2>
                </div>
              </div>

              <p className="text-sm text-red-950 font-medium leading-relaxed">
                The symptoms you described match acute clinical warning signs (such as potential ovarian torsion, internal hemorrhage, or acute ectopic emergency). Please do not wait for an online appointment or rely on educational content.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href="tel:108"
                  className="flex items-center justify-center gap-2 p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-md"
                >
                  <PhoneCall className="w-4 h-4" /> Call Medical Ambulance (108)
                </a>
                <a
                  href="tel:112"
                  className="flex items-center justify-center gap-2 p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-md"
                >
                  <PhoneCall className="w-4 h-4" /> Emergency Services (112)
                </a>
              </div>
            </div>
          ) : (
            /* Normal Grounded Guidance Flow */
            <>
              {/* Card 1: Normalized Symptom Summary */}
              <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-md shadow-rose-900/5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    <h2 className="text-base font-bold">Normalized Symptom Summary</h2>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold">
                    Detected Lang: {analysisResult.normalizedSummary.detectedLanguage.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Reported Symptoms */}
                  <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
                    <span className="font-bold text-rose-900 uppercase tracking-wider text-[10px]">Reported Symptoms</span>
                    {analysisResult.normalizedSummary.reportedSymptoms.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.normalizedSummary.reportedSymptoms.map((s, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-rose-200 text-rose-800 rounded-lg font-semibold flex items-center gap-1">
                            <span>{s.name}</span>
                            <span className="text-[10px] text-rose-500 font-normal">({s.severity || 'reported'})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No specific clinical symptoms identified from text.</p>
                    )}
                  </div>

                  {/* Negations Preserved */}
                  <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                    <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">Explicitly Negated (Absent)</span>
                    {analysisResult.normalizedSummary.negatedSymptoms.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.normalizedSummary.negatedSymptoms.map((s, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-lg font-semibold">
                            ✓ No {s.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No negated symptoms stated.</p>
                    )}
                  </div>
                </div>

                {/* Duration & Frequency */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700">Duration: </span>
                    <span>{analysisResult.normalizedSummary.duration || 'Not specifically mentioned'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Frequency: </span>
                    <span>{analysisResult.normalizedSummary.frequency || 'Intermittent'}</span>
                  </div>
                </div>

                {/* Missing Details Note */}
                {analysisResult.normalizedSummary.missingInformation.length > 0 && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Helpful details for your doctor: </span>
                      <span>{analysisResult.normalizedSummary.missingInformation.join('; ')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Grounded Educational Explanation */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-md shadow-purple-900/5 space-y-5">
                <div className="flex items-center gap-2 text-purple-900">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-bold">Medically Grounded Educational Guidance</h2>
                </div>

                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal space-y-3">
                  {analysisResult.educationalExplanation}
                </div>

                {/* Other possibilities */}
                {analysisResult.potentialConsiderations.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Related Clinical Considerations</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {analysisResult.potentialConsiderations.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Questions for doctor */}
                {analysisResult.questionsForGynecologist.length > 0 && (
                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Suggested Questions for Your Gynecologist</span>
                    <ul className="space-y-1.5 text-xs text-purple-950">
                      {analysisResult.questionsForGynecologist.slice(0, 3).map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-bold text-purple-600">Q{idx + 1}:</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Card 3: Reviewed Medical Citations */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Medically Reviewed Evidence Sources</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {analysisResult.citations.map(cit => (
                    <div key={cit.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-[11px] truncate">{cit.organization}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-semibold">
                          {cit.reviewStatus}
                        </span>
                      </div>
                      <a
                        href={cit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-rose-700 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{cit.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{cit.relevantSummary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Banner: Consult Doctor */}
              <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-bold">Ready to discuss this with a certified gynecologist?</h3>
                  <p className="text-xs text-rose-100 max-w-lg">
                    Book an online consultation with transparent per-session pricing (starting ₹399/session). Your symptom summary will be attached to your appointment.
                  </p>
                </div>
                <button
                  onClick={() => onBookDoctor(inputText)}
                  className="px-6 py-3 bg-white text-rose-700 hover:bg-rose-50 font-extrabold text-xs rounded-xl shadow-md whitespace-nowrap transition-transform hover:scale-105"
                >
                  Book Doctor Consultation
                </button>
              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
};
