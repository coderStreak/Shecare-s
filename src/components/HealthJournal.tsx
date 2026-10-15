import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Download,
  Printer,
  Sparkles,
  AlertCircle,
  Activity,
  Heart,
  FileText,
  ChevronRight,
  Clock
} from 'lucide-react';
import { JournalEntry } from '../types';
import { analyzeCycles, CycleEntry } from '../utils/cycleAnalytics';

export const HealthJournal: React.FC = () => {
  // Pre-seed with realistic patient entries
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: 'entry_1',
      date: '2026-07-15',
      isPeriodDay: true,
      flowIntensity: 'medium',
      painScore: 5,
      symptoms: ['Pelvic Cramps', 'Acne Breakout'],
      mood: 'Fatigued',
      notes: 'Period started after 42 days. Moderate cramping on day 1.'
    },
    {
      id: 'entry_2',
      date: '2026-08-25',
      isPeriodDay: true,
      flowIntensity: 'heavy',
      painScore: 6,
      symptoms: ['Pelvic Cramps', 'Mood Swings', 'Facial Hair'],
      mood: 'Anxious',
      notes: 'Cycle took 41 days. Heavy flow on day 2.'
    },
    {
      id: 'entry_3',
      date: '2026-10-02',
      isPeriodDay: true,
      flowIntensity: 'light',
      painScore: 3,
      symptoms: ['Acne Breakout', 'Severe Fatigue', 'Bloating'],
      mood: 'Low Energy',
      notes: 'Cycle interval 38 days. Very light flow and fatigue.'
    }
  ]);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPeriod, setIsPeriod] = useState(true);
  const [flow, setFlow] = useState<JournalEntry['flowIntensity']>('medium');
  const [pain, setPain] = useState<number>(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState('Neutral');
  const [notes, setNotes] = useState('');

  const availableSymptoms = [
    'Acne Breakout',
    'Excess Facial/Body Hair',
    'Pelvic Cramps',
    'Severe Fatigue',
    'Bloating',
    'Mood Swings',
    'Scalp Hair Thinning',
    'Sugar Cravings',
    'Mid-cycle Spotting'
  ];

  const handleToggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: JournalEntry = {
      id: `journal_${Date.now()}`,
      date: newDate,
      isPeriodDay: isPeriod,
      flowIntensity: isPeriod ? flow : undefined,
      painScore: pain,
      symptoms: selectedSymptoms,
      mood,
      notes: notes.trim() || undefined
    };

    setEntries(prev => [entry, ...prev]);
    setShowForm(false);
    setSelectedSymptoms([]);
    setNotes('');
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm('Permanently delete all journal entries from this device? This action is irreversible.')) {
      setEntries([]);
    }
  };

  // Run cycle analysis on period dates
  const periodEntries: CycleEntry[] = entries
    .filter(e => e.isPeriodDay)
    .map(e => ({
      id: e.id,
      startDate: e.date,
      symptoms: e.symptoms
    }));

  const cycleAnalysis = analyzeCycles(periodEntries);

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>My Health Journal & Cycle Tracker</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track Menstrual Patterns & Export for Your Doctor
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          Private, user-controlled cycle tracking. Discover your average cycle intervals, variation alerts, and generate a structured doctor-ready summary.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Close Form' : 'Log Period or Symptoms'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintSummary}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-rose-600" />
            <span>Print Doctor Summary</span>
          </button>

          {entries.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Permanently Delete All Entries"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Log Form Modal / Collapse */}
      {showForm && (
        <form onSubmit={handleAddEntry} className="bg-white rounded-3xl p-6 border border-rose-200 shadow-xl space-y-4 animate-in fade-in duration-200 no-print">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Add New Journal Record</h3>
            <span className="text-xs text-slate-500">Stored locally on your device</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Period Flow</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPeriod(!isPeriod)}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                    isPeriod ? 'bg-rose-100 border-rose-300 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {isPeriod ? '🩸 Period Day' : '⚪ Non-Period Day'}
                </button>
                {isPeriod && (
                  <select
                    value={flow}
                    onChange={(e) => setFlow(e.target.value as any)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="heavy">Heavy</option>
                    <option value="spotting">Spotting</option>
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Pain Intensity: <span className="text-rose-600 font-extrabold">{pain}/10</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={pain}
                onChange={(e) => setPain(parseInt(e.target.value, 10))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div>
            <label className="font-bold text-slate-700 block text-xs mb-1.5">Symptoms Experienced Today</label>
            <div className="flex flex-wrap gap-1.5">
              {availableSymptoms.map(sym => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleToggleSymptom(sym)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    selectedSymptoms.includes(sym)
                      ? 'bg-rose-600 border-rose-600 text-white shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {selectedSymptoms.includes(sym) ? '✓ ' : '+ '} {sym}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block text-xs mb-1">Notes / Observations</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Skipped gym due to cramps, unusual skin breakout..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* Cycle Analytics Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xl shadow-rose-900/5 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">Cycle Analytics & Clinical Summary</h2>
          </div>
          <span className="text-xs px-2.5 py-1 bg-rose-50 text-rose-800 rounded-full font-bold">
            {cycleAnalysis.totalLoggedCycles} Cycles Logged
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Average Interval</span>
            <span className="text-2xl font-black text-slate-900">
              {cycleAnalysis.averageCycleLengthDays ? `${cycleAnalysis.averageCycleLengthDays} d` : '--'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Typical: 21–35 days</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Shortest Interval</span>
            <span className="text-2xl font-black text-slate-900">
              {cycleAnalysis.shortestCycleLength ? `${cycleAnalysis.shortestCycleLength} d` : '--'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Longest Interval</span>
            <span className="text-2xl font-black text-rose-700">
              {cycleAnalysis.longestCycleLength ? `${cycleAnalysis.longestCycleLength} d` : '--'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Regularity Flag</span>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full inline-block mt-2 ${
              cycleAnalysis.isIrregular ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {cycleAnalysis.isIrregular ? 'Variation Detected' : 'Within Range'}
            </span>
          </div>
        </div>

        {/* Irregularity Warning Callout */}
        {cycleAnalysis.irregularityWarning && (
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Cycle Pattern Observation:</strong>
              <p className="leading-relaxed mt-0.5">{cycleAnalysis.irregularityWarning}</p>
            </div>
          </div>
        )}

        {/* Doctor Summary Section (Print-ready) */}
        <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-600" /> Doctor Discussion Summary
            </span>
            <span className="text-[10px] text-purple-700 font-semibold no-print">Format ready for doctor review</span>
          </div>
          <pre className="text-xs text-purple-950 font-mono whitespace-pre-wrap leading-relaxed bg-white/70 p-3.5 rounded-xl border border-purple-100">
            {cycleAnalysis.doctorDiscussionSummary}
          </pre>
        </div>
      </div>

      {/* Logged Entries Timeline */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Recorded Journal History</h3>
        
        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:border-rose-200 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{entry.date}</span>
                    {entry.isPeriodDay && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full">
                        🩸 Period ({entry.flowIntensity})
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                      Pain: {entry.painScore}/10
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
                      Mood: {entry.mood}
                    </span>
                  </div>

                  {entry.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {entry.symptoms.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.notes && (
                    <p className="text-xs text-slate-500 italic">"{entry.notes}"</p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="p-2 text-slate-300 hover:text-red-600 rounded-lg transition-colors self-end sm:self-center no-print"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-3xl border border-slate-100 p-6 space-y-2">
            <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No journal records logged yet. Click "Log Period or Symptoms" to begin tracking.</p>
          </div>
        )}
      </div>

    </div>
  );
};
