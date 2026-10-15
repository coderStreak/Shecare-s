import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import {
  ROTTERDAM_CRITERIA,
  DIFFERENTIAL_DIAGNOSES,
  MYTHS_AND_FACTS,
  QUESTIONS_FOR_GYNECOLOGIST,
  REVIEWED_MEDICAL_CITATIONS
} from '../data/medicalKnowledge';

export const PcosGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rotterdam' | 'symptoms' | 'differentials' | 'myths' | 'questions'>('rotterdam');
  const [copied, setCopied] = useState(false);

  const handleCopyQuestions = () => {
    const text = QUESTIONS_FOR_GYNECOLOGIST.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Evidence-Based PCOS Clinical Guide</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Understanding Polycystic Ovary Syndrome (PCOS)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          Grounded in the 2023 International Evidence-Based PCOS Guidelines, WHO, and ACOG standards. Learn how clinicians evaluate PCOS, dispel common myths, and prepare for your doctor visit.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl max-w-3xl mx-auto text-xs font-bold">
        {[
          { id: 'rotterdam', label: 'Rotterdam Criteria' },
          { id: 'symptoms', label: 'Symptom Spectrum' },
          { id: 'differentials', label: 'Other Explanations' },
          { id: 'myths', label: 'Myths vs Facts' },
          { id: 'questions', label: 'Questions for Doctor' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-slate-600 hover:text-purple-700 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xl shadow-purple-900/5">
        
        {/* Rotterdam Criteria Tab */}
        {activeTab === 'rotterdam' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs uppercase font-extrabold text-purple-600 tracking-wider">Clinical Standard</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">The Rotterdam Diagnostic Criteria (2003 / 2023 Update)</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Globally recognized by WHO and ACOG. A clinical diagnosis of PCOS requires meeting at least <strong>two out of the three</strong> following criteria, after ruling out other causes of irregular cycles:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROTTERDAM_CRITERIA.map((pillar, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm">
                      {idx + 1}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{pillar.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
                  </div>
                  <div className="pt-2 border-t border-purple-200/60 text-[11px] font-semibold text-purple-900">
                    💡 Clinical note: {pillar.clinicalNote}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-950 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Important Clinical Caveat for Adolescents:</strong>
                <span>Ultrasound findings of multi-follicular ovaries are normal during puberty. Clinical guidelines recommend that ultrasound not be used to diagnose PCOS in adolescents within 8 years of their first period.</span>
              </div>
            </div>
          </div>
        )}

        {/* Symptoms Spectrum */}
        {activeTab === 'symptoms' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs uppercase font-extrabold text-rose-600 tracking-wider">Phenotypic Diversity</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">How PCOS Symptoms Manifest and Vary</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                PCOS is not a single identical disease—it is a spectrum condition. No two individuals experience identical manifestations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
                <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Menstrual & Ovulatory Patterns
                </h3>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Cycles exceeding 35 days (oligomenorrhea)</li>
                  <li>No period for 3 or more consecutive months (amenorrhea)</li>
                  <li>Unpredictable, prolonged spotting or heavy bleeding</li>
                  <li>Difficulty predicting fertile windows without ovulation test strips</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                <h3 className="font-bold text-purple-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Androgenic (Hormonal) Symptoms
                </h3>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Excess dark, coarse hair on upper lip, chin, chest, or abdomen (hirsutism)</li>
                  <li>Persistent cystic acne along jawline and neck</li>
                  <li>Female pattern scalp hair thinning (androgenetic alopecia)</li>
                  <li>Oily skin resistant to routine topical cleansers</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-2">
                <h3 className="font-bold text-teal-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Metabolic & Endocrine Features
                </h3>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Insulin resistance (present in up to 75% of women with PCOS)</li>
                  <li>Difficulty losing weight, particularly visceral central adiposity</li>
                  <li>Dark, velvety skin patches on the neck or armpits (Acanthosis Nigricans)</li>
                  <li>Intense sugar and refined carbohydrate cravings</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Emotional & Physical Fatigue
                </h3>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Heightened susceptibility to anxiety, mood swings, and depressive symptoms</li>
                  <li>Chronic midday fatigue linked to glucose crashes</li>
                  <li>Disrupted sleep patterns or sleep apnea</li>
                  <li>Body image distress related to skin and hair changes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Differential Diagnoses */}
        {activeTab === 'differentials' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs uppercase font-extrabold text-teal-600 tracking-wider">Clinical Ruling Out</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Other Conditions That Mimic PCOS</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Before confirming PCOS, clinical guidelines mandate ruling out other endocrine disorders that share overlapping symptoms:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DIFFERENTIAL_DIAGNOSES.map((diff, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-sm">{diff.condition}</div>
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-700">Overlapping Symptoms: </span>
                    {diff.symptomsOverlap}
                  </div>
                  <div className="p-2.5 bg-teal-50 rounded-xl text-teal-900 font-medium">
                    <span className="font-bold">Distinguishing Blood Test: </span>
                    {diff.distinguishingTest}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Myths vs Facts */}
        {activeTab === 'myths' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs uppercase font-extrabold text-rose-600 tracking-wider">Evidence vs Stigma</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">PCOS Myths vs. Scientific Evidence</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Debunking misconceptions that create unnecessary anxiety and shame for women seeking care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MYTHS_AND_FACTS.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-black text-[10px] uppercase">Myth</span>
                      <h3 className="font-bold text-red-950 text-xs sm:text-sm line-through decoration-red-400">{item.myth}</h3>
                    </div>
                    <div className="pt-2 space-y-1">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px] uppercase">Medical Fact</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{item.fact}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-semibold">
                    Citation: {item.evidence}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions for Doctor */}
        {activeTab === 'questions' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-purple-600 tracking-wider">Patient Empowerment</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Questions to Ask Your Gynecologist</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Take these structured, clinician-reviewed questions to your consultation.
                </p>
              </div>
              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={handleCopyQuestions}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy List'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Checklist</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {QUESTIONS_FOR_GYNECOLOGIST.map((q, idx) => (
                <div key={idx} className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-950 font-medium leading-relaxed">
                    {q}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Guidelines References Footer */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
        <span className="font-bold text-slate-700">Clinical Knowledge Sources: </span>
        <span>
          World Health Organization (WHO), American College of Obstetricians and Gynecologists (ACOG Practice Bulletin 194), Monash International Guidelines (2023), and FOGSI India Guidelines.
        </span>
      </div>

    </div>
  );
};
