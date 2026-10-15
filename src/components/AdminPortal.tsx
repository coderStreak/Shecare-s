import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit2,
  FileCheck,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';
import { SafetyRule } from '../utils/triage';
import { AuditEvent, Doctor } from '../types';

export const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'doctors' | 'audit' | 'stats'>('rules');
  const [safetyRules, setSafetyRules] = useState<SafetyRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // New Rule Form
  const [editingRule, setEditingRule] = useState<SafetyRule | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleKeywords, setRuleKeywords] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [ruleAction, setRuleAction] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, auditsRes, docsRes] = await Promise.all([
        fetch('/api/admin/safety-rules'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/doctors')
      ]);

      if (rulesRes.ok) {
        const d = await rulesRes.json();
        setSafetyRules(d.rules || []);
      }
      if (auditsRes.ok) {
        const d = await auditsRes.json();
        setAuditLogs(d || []);
      }
      if (docsRes.ok) {
        const d = await docsRes.json();
        setDoctors(d || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditRule = (rule: SafetyRule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleKeywords(rule.keywords.join(', '));
    setRuleDesc(rule.description);
    setRuleAction(rule.urgentAction);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName || !ruleKeywords) return;

    const keywordsArray = ruleKeywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    const updated: SafetyRule = {
      id: editingRule ? editingRule.id : `rule_${Date.now()}`,
      name: ruleName,
      category: editingRule ? editingRule.category : 'gynecological_emergency',
      keywords: keywordsArray,
      description: ruleDesc,
      urgentAction: ruleAction,
      severity: 'emergency',
      version: editingRule ? editingRule.version : 1
    };

    try {
      const res = await fetch('/api/admin/safety-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule: updated, author: 'Dr. Radhika Rao (Medical Safety Director)' })
      });

      if (res.ok) {
        setSaveStatus(`Rule "${ruleName}" successfully updated with clinical audit log.`);
        setEditingRule(null);
        fetchData();
        setTimeout(() => setSaveStatus(null), 3500);
      }
    } catch (err) {
      alert('Error updating rule');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-1">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Authorized Medical Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Clinical Safety & Practice Governance
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'rules' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Safety Rules ({safetyRules.length})
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'doctors' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doctor Verifications
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'stats' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Operational Stats
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Safety Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Deterministic Clinical Triage Rules</h2>
              <p className="text-xs text-slate-500">Every user symptom submission executes against these rules prior to AI generation.</p>
            </div>
            <button
              onClick={() => {
                setEditingRule(null);
                setRuleName('');
                setRuleKeywords('');
                setRuleDesc('');
                setRuleAction('');
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Safety Rule
            </button>
          </div>

          {/* Edit Rule Drawer / Form */}
          {(editingRule !== null || ruleName !== '') && (
            <form onSubmit={handleSaveRule} className="bg-white rounded-3xl p-6 border-2 border-rose-300 shadow-xl space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingRule ? `Edit Rule: ${editingRule.name} (v${editingRule.version})` : 'New Clinical Safety Rule'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g. Ruptured Ovarian Cyst / Torsion"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Keywords (Comma separated, multilingual)</label>
                  <input
                    type="text"
                    value={ruleKeywords}
                    onChange={(e) => setRuleKeywords(e.target.value)}
                    placeholder="severe pain, unbearable, tumba novu, tez dard"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">Clinical Rationale</label>
                <input
                  type="text"
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  placeholder="Why this is considered a red flag..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">Urgent Clinical Escalation Action</label>
                <input
                  type="text"
                  value={ruleAction}
                  onChange={(e) => setRuleAction(e.target.value)}
                  placeholder="Immediate emergency room triage instructions..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRule(null);
                    setRuleName('');
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Save & Log Audit Trail
                </button>
              </div>
            </form>
          )}

          {/* Rules List */}
          <div className="space-y-3">
            {safetyRules.map(rule => (
              <div key={rule.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    <h3 className="font-bold text-slate-900 text-sm">{rule.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                      v{rule.version || 1}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEditRule(rule)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600">{rule.description}</p>

                <div className="flex flex-wrap gap-1 text-[11px]">
                  {rule.keywords.map((k, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-800 rounded-md font-medium border border-red-100">
                      "{k}"
                    </span>
                  ))}
                </div>

                <div className="text-[11px] font-semibold text-slate-700 pt-2 border-t border-slate-100">
                  Escalation Action: <span className="text-red-700">{rule.urgentAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Verifications Tab */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Registered Clinicians & Per-Session Price Approvals</h2>
          <div className="space-y-3">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={doc.photoUrl} alt={doc.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> License Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{doc.qualifications} • Reg: {doc.registrationNumber} ({doc.medicalCouncil})</p>
                    <p className="text-[11px] text-slate-400">{doc.hospitalAffiliation}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900 text-sm">₹{doc.perSessionFee}</div>
                  <span className="text-[10px] text-slate-400">{doc.durationMinutes} min session</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operational Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-900">Privacy-Preserving Platform Metrics</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-5 bg-white rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold uppercase block">Symptom Inquiries</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">1,482</span>
              <span className="text-[10px] text-emerald-600 font-semibold">100% Non-Diagnostic</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold uppercase block">Emergency Escalations</span>
              <span className="text-3xl font-black text-red-600 mt-1 block">47</span>
              <span className="text-[10px] text-slate-500 font-semibold">Routed to 108/112</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold uppercase block">Consultations Completed</span>
              <span className="text-3xl font-black text-rose-600 mt-1 block">284</span>
              <span className="text-[10px] text-slate-500 font-semibold">Zero recurring charges</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold uppercase block">Verified Doctors</span>
              <span className="text-3xl font-black text-teal-600 mt-1 block">12</span>
              <span className="text-[10px] text-slate-500 font-semibold">KMC/MMC/DMC verified</span>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Immutable Audit Trail Log</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Operator</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.performedBy}</td>
                    <td className="p-3 text-slate-500">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
