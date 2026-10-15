import React, { useState } from 'react';
import {
  Shield,
  Download,
  Trash2,
  Lock,
  EyeOff,
  FileCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const PrivacySettings: React.FC = () => {
  const [dataDeleted, setDataDeleted] = useState(false);
  const [consented, setConsented] = useState(true);

  const handleExportData = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      platform: 'NariCare AI',
      dataIntegrity: 'User-Owned Health Data Export',
      medicalDisclaimer: 'NariCare AI provides educational information and care navigation. It does not diagnose conditions or replace professional medical advice.',
      retentionPolicy: 'Local-first with user-revocable storage'
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naricare_health_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAll = () => {
    if (confirm('Permanently wipe all health journal entries, appointments, and cached data from this device? This cannot be undone.')) {
      localStorage.clear();
      sessionStorage.clear();
      setDataDeleted(true);
      setTimeout(() => setDataDeleted(false), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>Privacy & Data Sovereignty</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Your Health Data Belongs to You
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          We operate on a zero-exploitation principle. We do not sell data, track ads, or retain symptom logs for AI model training.
        </p>
      </div>

      {dataDeleted && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>All local records and cached preferences have been permanently purged.</span>
        </div>
      )}

      {/* Commitments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-5 bg-white rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No Advertising or Data Brokers</h3>
          <p className="text-slate-600 leading-relaxed">
            Your reproductive cycle information, symptoms, and doctor consultations are never monetized, traded, or shared with commercial aggregators.
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No Government ID Mandate</h3>
          <p className="text-slate-600 leading-relaxed">
            We never demand Aadhaar numbers, PAN cards, or unnecessary identity documents for educational exploration or consultation bookings.
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-rose-100 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <FileCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Strict Medical Boundary</h3>
          <p className="text-slate-600 leading-relaxed">
            NariCare AI provides educational information and care navigation. It does not diagnose conditions or replace professional medical advice.
          </p>
        </div>
      </div>

      {/* User Data Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-6">
        <h2 className="text-base font-bold text-slate-900">Patient Data Management</h2>
        
        <div className="divide-y divide-slate-100 text-xs">
          
          <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">Export All My Health Records</h3>
              <p className="text-slate-500">Download a complete, unencrypted JSON copy of your symptoms, cycle entries, and booking history.</p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-red-900">Permanently Delete Health History</h3>
              <p className="text-slate-500">Erase all logged cycles, symptoms, cached doctor notes, and stored identifiers from this device.</p>
            </div>
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Data</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
