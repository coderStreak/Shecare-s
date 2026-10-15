import React, { useState } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  Video,
  FileText,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Phone,
  Mail,
  Edit3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Heart,
  Activity,
  Award,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Appointment, SupportedLanguage } from '../types';

interface DoctorPortalViewProps {
  onStartVideoConsultation: (apptId: string) => void;
  onNavigateToPatientPortal: () => void;
  language: SupportedLanguage;
}

interface DoctorSlot {
  time: string;
  isAvailable: boolean;
}

interface ClinicalPrescription {
  patientName: string;
  date: string;
  diagnosis: string;
  prescription: string;
  dietAdvice: string;
}

export const DoctorPortalView: React.FC<DoctorPortalViewProps> = ({
  onStartVideoConsultation,
  onNavigateToPatientPortal,
  language
}) => {
  const [activeDoctorTab, setActiveDoctorTab] = useState<'queue' | 'schedule' | 'records' | 'credentials'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDoctorAvailableOnline, setIsDoctorAvailableOnline] = useState(true);
  const [selectedApptForNotes, setSelectedApptForNotes] = useState<Appointment | null>(null);
  const [clinicalNotesInput, setClinicalNotesInput] = useState('');
  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Sample Doctor Queue (Isolated from patient portal)
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([
    {
      id: 'doc_appt_101',
      doctorId: 'doc_priya_rao',
      doctorName: 'Dr. Priya S. Rao',
      doctorSpecialty: 'Reproductive Medicine & PCOS Specialist',
      patientName: 'Deepa Hegde',
      patientPhone: '+91 98860 99999',
      patientEmail: 'deepa.hegde@example.com',
      date: '2026-10-15',
      timeSlot: '11:30 AM',
      consultationMode: 'video',
      consultationType: 'video',
      status: 'confirmed',
      sessionFee: 499,
      isEmergency: false,
      symptomsReported: 'Severe menstrual irregularity (45+ day cycles), facial acne flareups, ultrasound noted multifollicular ovaries',
      languagePreference: 'kn',
      bookingReference: 'SHC-DOC-8921-DH'
    },
    {
      id: 'doc_appt_102',
      doctorId: 'doc_priya_rao',
      doctorName: 'Dr. Priya S. Rao',
      doctorSpecialty: 'Reproductive Medicine & PCOS Specialist',
      patientName: 'Kavya Narayan',
      patientPhone: '+91 98860 12345',
      patientEmail: 'kavya@example.com',
      date: '2026-10-15',
      timeSlot: '02:00 PM',
      consultationMode: 'video',
      consultationType: 'video',
      status: 'confirmed',
      sessionFee: 499,
      isEmergency: false,
      symptomsReported: 'Pre-consultation review: Rotterdam criteria assessment, elevated fasting insulin questions',
      languagePreference: 'en',
      bookingReference: 'SHC-DOC-7742-KN'
    },
    {
      id: 'doc_appt_103',
      doctorId: 'doc_priya_rao',
      doctorName: 'Dr. Priya S. Rao',
      doctorSpecialty: 'Reproductive Medicine & PCOS Specialist',
      patientName: 'Sunita Verma',
      patientPhone: '+91 98110 55432',
      patientEmail: 'sunita.v@example.com',
      date: '2026-10-16',
      timeSlot: '10:00 AM',
      consultationMode: 'clinic',
      consultationType: 'clinic',
      status: 'confirmed',
      sessionFee: 499,
      isEmergency: false,
      symptomsReported: 'Adolescent dysmenorrhea and lifestyle counseling request in Hindi',
      languagePreference: 'hi',
      bookingReference: 'SHC-DOC-6612-SV'
    }
  ]);

  // Doctor daily schedule slots
  const [slots, setSlots] = useState<DoctorSlot[]>([
    { time: '09:30 AM', isAvailable: true },
    { time: '10:30 AM', isAvailable: false },
    { time: '11:30 AM', isAvailable: false }, // Booked by Deepa
    { time: '02:00 PM', isAvailable: false }, // Booked by Kavya
    { time: '03:30 PM', isAvailable: true },
    { time: '04:30 PM', isAvailable: true },
    { time: '05:30 PM', isAvailable: true }
  ]);

  const toggleSlotAvailability = (index: number) => {
    setSlots(prev => prev.map((slot, i) => i === index ? { ...slot, isAvailable: !slot.isAvailable } : slot));
  };

  const handleSaveNotes = () => {
    if (!selectedApptForNotes) return;
    setSaveSuccessMsg(`Clinical note & e-prescription saved for ${selectedApptForNotes.patientName}!`);
    setTimeout(() => {
      setSaveSuccessMsg('');
      setSelectedApptForNotes(null);
      setClinicalNotesInput('');
      setPrescriptionInput('');
    }, 1800);
  };

  const filteredAppointments = doctorAppointments.filter(appt =>
    appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appt.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (appt.symptomsReported ? appt.symptomsReported.toLowerCase().includes(searchQuery.toLowerCase()) : false)
  );

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      
      {/* Top Clinical Header Banner (Distinct from Patient Portal) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-950">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                    Physician Portal
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    KMC Verified • Reg #89421
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white mt-0.5">
                  Dr. Priya S. Rao, MS (OBGYN)
                </h1>
                <p className="text-xs text-slate-300">
                  SheCare's Senior Consultant Obstetrician & Reproductive Specialist
                </p>
              </div>
            </div>

            {/* Top Right Quick Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Online/Offline Status Toggle */}
              <button
                onClick={() => setIsDoctorAvailableOnline(!isDoctorAvailableOnline)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                  isDoctorAvailableOnline
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Toggle instant telemedicine availability"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${isDoctorAvailableOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{isDoctorAvailableOnline ? 'Teleconsult Online' : 'Taking Break / Offline'}</span>
              </button>

              {/* Portal Switcher */}
              <button
                onClick={onNavigateToPatientPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all shadow-xs"
                title="Return to SheCare's Patient Portal"
              >
                <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300/30" />
                <span>Switch to Patient Portal</span>
              </button>
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-indigo-900/60">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-[11px] text-slate-400 block font-medium">Today's Patients</span>
              <span className="text-lg font-bold text-white">3 Booked</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-[11px] text-slate-400 block font-medium">Session Rate</span>
              <span className="text-lg font-bold text-emerald-300">₹499 / 25 min</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-[11px] text-slate-400 block font-medium">Clinical Rating</span>
              <span className="text-lg font-bold text-amber-300">4.9 ★ (142 reviews)</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-[11px] text-slate-400 block font-medium">Compliance</span>
              <span className="text-lg font-bold text-indigo-300">NMC Telemed 100%</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Doctor Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Tabs for Doctor Portal */}
        <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveDoctorTab('queue')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeDoctorTab === 'queue'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Consultation Queue ({doctorAppointments.length})</span>
          </button>

          <button
            onClick={() => setActiveDoctorTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeDoctorTab === 'schedule'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Schedule & Slots</span>
          </button>

          <button
            onClick={() => setActiveDoctorTab('records')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeDoctorTab === 'records'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Clinical Records & Notes</span>
          </button>

          <button
            onClick={() => setActiveDoctorTab('credentials')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeDoctorTab === 'credentials'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Medical License & Standards</span>
          </button>
        </div>

        {/* Tab 1: Patient Consultation Queue */}
        {activeDoctorTab === 'queue' && (
          <div className="space-y-6">
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search patient name, reference, or symptoms..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Showing <strong className="text-slate-800">{filteredAppointments.length}</strong> patient consultations
              </div>
            </div>

            {/* Patient Cards */}
            <div className="grid grid-cols-1 gap-4">
              {filteredAppointments.map(appt => (
                <div
                  key={appt.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                        <User className="w-4 h-4 text-indigo-600" />
                        {appt.patientName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                        {appt.consultationType === 'video' ? 'Virtual Video Consult' : 'In-Clinic Appointment'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                        Ref: {appt.bookingReference}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold">
                        Lang: {appt.languagePreference?.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{appt.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{appt.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{appt.patientPhone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{appt.patientEmail}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-700">
                      <span className="font-bold text-slate-900 block mb-0.5">Reported Symptoms & Chief Complaint:</span>
                      <p>{appt.symptomsReported}</p>
                    </div>
                  </div>

                  {/* Doctor Action Buttons */}
                  <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => onStartVideoConsultation(appt.id)}
                      className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                    >
                      <Video className="w-4 h-4" />
                      <span>Start Video Consult</span>
                    </button>

                    <button
                      onClick={() => setSelectedApptForNotes(appt)}
                      className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Add Clinical Notes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 2: Schedule & Availability */}
        {activeDoctorTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Daily Slots Manager */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Teleconsultation Slots</h3>
                <p className="text-xs text-slate-500">Toggle slot availability for today and upcoming dates.</p>
              </div>

              <div className="space-y-2">
                {slots.map((slot, index) => (
                  <div
                    key={slot.time}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-slate-800 text-xs">{slot.time}</span>
                      <span className="text-[11px] text-slate-500">(25 mins)</span>
                    </div>

                    <button
                      onClick={() => toggleSlotAvailability(index)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        slot.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {slot.isAvailable ? 'Available for Patients' : 'Reserved / Blocked'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900">
                <span className="font-bold block mb-1">Anti-Conflict Locking Guarantee:</span>
                SheCare's engine locks reserved slots atomically to prevent double bookings across timezone shifts and simultaneous requests.
              </div>
            </div>

            {/* Pricing & Policy Settings */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Transparent Pricing Standards</h3>
                <p className="text-xs text-slate-500">SheCare's enforces transparent per-session pricing with zero hidden surcharges.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800">Standard Teleconsultation Fee</span>
                    <span className="text-sm font-extrabold text-emerald-700">₹499 / session</span>
                  </div>
                  <p className="text-[11px] text-slate-500">25 minutes video/audio consultation. Patient receives receipt and prescription immediately.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800">Platform Surcharges</span>
                    <span className="text-sm font-extrabold text-slate-700">₹0 (Zero)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">No subscription commitments required from either patient or physician.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800">Cancellation Window</span>
                    <span className="text-sm font-extrabold text-slate-700">100% Refund</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Patients can cancel up to 2 hours before scheduled slot for a full automated refund.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Clinical Records & Prescriptions */}
        {activeDoctorTab === 'records' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Completed Consultation Records & Prescriptions</h3>
              <p className="text-xs text-slate-500">Encrypted clinical summaries compliant with Indian Telemedicine Practice Guidelines.</p>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Patient: Ananya M. (Age 24)</span>
                  <span className="text-[11px] text-slate-400">Consulted: Oct 12, 2026</span>
                </div>
                <p className="text-xs text-slate-600"><strong>Assessment:</strong> Probable Phenotype A PCOS (oligomenorrhea + hyperandrogenism). Rotterdam criteria 2/3 met.</p>
                <p className="text-xs text-slate-600"><strong>Plan:</strong> Recommended pelvic ultrasound on Day 3-5, fasting insulin, low-glycemic Mediterranean nutrition guidance.</p>
              </div>

              <div className="py-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Patient: Shreya Patel (Age 28)</span>
                  <span className="text-[11px] text-slate-400">Consulted: Oct 09, 2026</span>
                </div>
                <p className="text-xs text-slate-600"><strong>Assessment:</strong> Secondary dysmenorrhea with heavy menstrual bleeding. Ruled out immediate red-flag ectopic.</p>
                <p className="text-xs text-slate-600"><strong>Plan:</strong> Prescribed mefenamic acid for symptom relief; referred for ultrasound to check adenomyosis.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Credentials & Guidelines */}
        {activeDoctorTab === 'credentials' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Medical Council Verified Credentials</h3>
                <p className="text-xs text-slate-500">Physician identity, credentials, and qualifications are validated prior to directory listing.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Registration Information</span>
                <p><span className="text-slate-500">Medical Council:</span> Karnataka Medical Council (KMC)</p>
                <p><span className="text-slate-500">Registration Number:</span> KMC-89421</p>
                <p><span className="text-slate-500">Year of Registration:</span> 2011</p>
                <p><span className="text-slate-500">Degrees:</span> MBBS, MS (Obstetrics & Gynecology), Fellowship in Reproductive Medicine</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Clinical Protocols Aligned</span>
                <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  WHO & Rotterdam 2003 PCOS Diagnostic Criteria
                </p>
                <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  NMC Telemedicine Practice Guidelines (India)
                </p>
                <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Strict Non-Diagnostic Safety & Triage Escalation
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Add Clinical Notes & Digital Prescription */}
      {selectedApptForNotes && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Doctor's Clinical Notes</h3>
                <p className="text-xs text-slate-500">Patient: <strong>{selectedApptForNotes.patientName}</strong> ({selectedApptForNotes.timeSlot})</p>
              </div>
              <button
                onClick={() => setSelectedApptForNotes(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                ✕
              </button>
            </div>

            {saveSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold text-center">
                ✓ {saveSuccessMsg}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clinical Findings & Diagnosis</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Discussed Rotterdam PCOS criteria, regularizing cycles, metabolic screening..."
                    value={clinicalNotesInput}
                    onChange={e => setClinicalNotesInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prescription & Lifestyle Advice</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Myo-inositol supplementation, daily 30-min brisk walk, blood glucose test in 4 weeks..."
                    value={prescriptionInput}
                    onChange={e => setPrescriptionInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedApptForNotes(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                  >
                    Save & Issue to Patient
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
