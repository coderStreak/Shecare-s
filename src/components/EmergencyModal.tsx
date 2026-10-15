import React from 'react';
import { AlertOctagon, PhoneCall, MapPin, X, ShieldAlert } from 'lucide-react';
import { SafetyRule } from '../utils/triage';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  flaggedRules: SafetyRule[];
  escalationMessage?: string | null;
  onFindHospitals: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  flaggedRules,
  escalationMessage,
  onFindHospitals
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="emergency-dialog-title">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-2 border-red-500 overflow-hidden">
        {/* Urgent Header */}
        <div className="bg-red-600 text-white px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-700/80 rounded-2xl">
              <AlertOctagon className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-red-200">Clinical Safety Escalation</span>
              <h2 id="emergency-dialog-title" className="text-xl font-bold">Urgent Medical Evaluation Required</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close emergency warning"
            className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-red-700/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-900 leading-relaxed font-medium">
              {escalationMessage || 'Critical warning signs detected in your symptoms. Please do not wait for an online appointment or rely on educational content.'}
            </div>
          </div>

          {flaggedRules.length > 0 && (
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2">Flagged Warning Signs</h3>
              <div className="space-y-2">
                {flaggedRules.map(rule => (
                  <div key={rule.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <div className="font-bold text-red-700 text-sm mb-0.5">{rule.name}</div>
                    <p className="text-slate-600 mb-1">{rule.description}</p>
                    <div className="font-semibold text-slate-900">Immediate Action: {rule.urgentAction}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Emergency Actions */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">Immediate Emergency Contacts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href="tel:108"
                className="flex items-center justify-between p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-xs transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" /> Ambulance: 108
                </span>
                <span className="text-xs font-normal opacity-90">Call Now</span>
              </a>
              <a
                href="tel:112"
                className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xs transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" /> Emergency: 112
                </span>
                <span className="text-xs font-normal opacity-90">Call Now</span>
              </a>
            </div>
          </div>

          {/* Find hospital action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onFindHospitals();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              <MapPin className="w-4 h-4" /> Find 24/7 Emergency Hospitals Near Me
            </button>
            <button
              onClick={onClose}
              className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
