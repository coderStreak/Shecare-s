import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { EmergencyModal } from './components/EmergencyModal';
import { HomeView } from './components/HomeView';
import { SymptomChecker } from './components/SymptomChecker';
import { PcosGuide } from './components/PcosGuide';
import { HospitalFinder } from './components/HospitalFinder';
import { DoctorConsultation } from './components/DoctorConsultation';
import { VideoConsultationRoom } from './components/VideoConsultationRoom';
import { HealthJournal } from './components/HealthJournal';
import { AppointmentsView } from './components/AppointmentsView';
import { AdminPortal } from './components/AdminPortal';
import { PrivacySettings } from './components/PrivacySettings';
import { AuthView } from './components/AuthView';
import { DoctorPortalView } from './components/DoctorPortalView';
import { SupportedLanguage, UserRole, Appointment, UserProfile } from './types';
import { CLINICAL_SAFETY_RULES } from './utils/triage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [userRole, setUserRole] = useState<UserRole>('patient');
  const [activePortal, setActivePortal] = useState<'patient' | 'doctor'>('patient');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('naricare_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Keep userRole and activePortal in sync with currentUser if logged in
  useEffect(() => {
    if (currentUser?.role) {
      setUserRole(currentUser.role);
      if (currentUser.role === 'doctor') {
        setActivePortal('doctor');
      }
    }
  }, [currentUser]);

  // Emergency Modal State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Cross-screen state transfers
  const [initialSymptomQuery, setInitialSymptomQuery] = useState('');
  const [prefilledSymptomsForBooking, setPrefilledSymptomsForBooking] = useState('');
  const [activeConsultationApptId, setActiveConsultationApptId] = useState<string | null>(null);

  const handleNavigate = (tab: string, initialQuery?: string) => {
    setActivePortal('patient');
    if (initialQuery) {
      setInitialSymptomQuery(initialQuery);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('naricare_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Unable to persist user to localStorage', e);
    }
    setUserRole(user.role);
    if (user.languagePreference) {
      setLanguage(user.languagePreference);
    }
    if (user.role === 'doctor') {
      setActivePortal('doctor');
    } else if (user.role === 'admin') {
      setActivePortal('patient');
      setCurrentTab('admin');
    } else {
      setActivePortal('patient');
      setCurrentTab('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('naricare_user');
    } catch (e) {
      console.warn('Unable to remove user from localStorage', e);
    }
    setUserRole('patient');
    setActivePortal('patient');
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookDoctorFromSymptoms = (symptoms?: string) => {
    setActivePortal('patient');
    setPrefilledSymptomsForBooking(symptoms || initialSymptomQuery);
    setCurrentTab('doctors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJoinRoom = (appointmentId: string) => {
    setActiveConsultationApptId(appointmentId);
    setCurrentTab('video-room');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    if (role === 'doctor') {
      setActivePortal('doctor');
    } else if (role === 'admin') {
      setActivePortal('patient');
      setCurrentTab('admin');
    } else {
      setActivePortal('patient');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/40 text-slate-800">
      
      {/* Persistent Medical Disclaimer */}
      <DisclaimerBanner language={language} />

      {/* Navigation Bar with Unmerged Portal Switcher and Highlighted Menus */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setActivePortal('patient');
          if (tab === 'video-room') {
            setActiveConsultationApptId('appt_initial_demo');
          }
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onLanguageChange={setLanguage}
        userRole={userRole}
        onRoleChange={handleRoleChange}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        currentUser={currentUser}
        onOpenAuth={(mode) => handleNavigate(mode || 'login')}
        onLogout={handleLogout}
        activePortal={activePortal}
        onTogglePortal={(portal) => {
          setActivePortal(portal);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area: Unmerged Patient & Doctor Portals */}
      <main className="flex-1">
        {/* Dedicated Unmerged Doctor Portal */}
        {activePortal === 'doctor' ? (
          <DoctorPortalView
            onStartVideoConsultation={(apptId) => {
              setActiveConsultationApptId(apptId);
              setActivePortal('patient');
              setCurrentTab('video-room');
            }}
            onNavigateToPatientPortal={() => {
              setActivePortal('patient');
              setCurrentTab('home');
            }}
            language={language}
          />
        ) : (
          /* Dedicated Patient Portal */
          <>
            {currentTab === 'home' && (
              <HomeView
                onNavigate={handleNavigate}
                language={language}
                currentUser={currentUser}
              />
            )}

            {(currentTab === 'login' || currentTab === 'signup') && (
              <AuthView
                initialMode={currentTab === 'signup' ? 'signup' : 'login'}
                onLoginSuccess={handleLoginSuccess}
                onNavigateHome={() => handleNavigate('home')}
                currentUser={currentUser}
                onLogout={handleLogout}
                language={language}
              />
            )}

            {currentTab === 'symptoms' && (
              <SymptomChecker
                initialQuery={initialSymptomQuery}
                onBookDoctor={handleBookDoctorFromSymptoms}
                language={language}
              />
            )}

            {currentTab === 'pcos-guide' && <PcosGuide />}

            {currentTab === 'hospitals' && <HospitalFinder />}

            {currentTab === 'doctors' && (
              <DoctorConsultation
                prefilledSymptoms={prefilledSymptomsForBooking}
                onAppointmentBooked={(appt) => {
                  setActiveConsultationApptId(appt.id);
                }}
                onJoinRoom={handleJoinRoom}
              />
            )}

            {currentTab === 'video-room' && (
              <VideoConsultationRoom
                appointmentId={activeConsultationApptId || 'appt_initial_demo'}
                onExit={() => setCurrentTab('appointments')}
              />
            )}

            {currentTab === 'journal' && <HealthJournal />}

            {currentTab === 'appointments' && (
              <AppointmentsView
                onJoinRoom={handleJoinRoom}
                onBookNew={() => setCurrentTab('doctors')}
              />
            )}

            {currentTab === 'admin' && <AdminPortal />}

            {currentTab === 'privacy' && <PrivacySettings />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-base font-extrabold text-white">SheCare's</span>
              <p className="text-slate-400 mt-1 max-w-md">
                Dedicated to accessible, multilingual women's health understanding, PCOS education, and transparent doctor consultations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <button onClick={() => { setActivePortal('patient'); handleNavigate('home'); }} className="hover:text-white transition-colors">Patient Home</button>
              <button onClick={() => { setActivePortal('doctor'); }} className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold">Doctor Portal</button>
              <button onClick={() => { setActivePortal('patient'); handleNavigate('pcos-guide'); }} className="hover:text-white transition-colors">PCOS Guide</button>
              <button onClick={() => { setActivePortal('patient'); handleNavigate('hospitals'); }} className="hover:text-white transition-colors">Nearby Care</button>
              <button onClick={() => { setActivePortal('patient'); handleNavigate('doctors'); }} className="hover:text-white transition-colors">Book Doctors</button>
              <button onClick={() => { setActivePortal('patient'); handleNavigate('privacy'); }} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => { setActivePortal('patient'); handleNavigate('admin'); }} className="text-rose-400 hover:text-rose-300 transition-colors">Admin Safety</button>
              {!currentUser ? (
                <>
                  <button onClick={() => handleNavigate('login')} className="text-pink-400 hover:text-pink-300 font-bold transition-colors">Sign In</button>
                  <button onClick={() => handleNavigate('signup')} className="text-pink-400 hover:text-pink-300 font-bold transition-colors">Create Account</button>
                </>
              ) : (
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-bold transition-colors">Sign Out ({currentUser.name})</button>
              )}
            </div>
          </div>
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>© 2026 SheCare's Health Foundation. All rights reserved.</span>
            <span>Emergency Services in India: Call 112 / 108</span>
          </div>
        </div>
      </footer>

      {/* Emergency Interruption Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        flaggedRules={CLINICAL_SAFETY_RULES.slice(0, 2)}
        escalationMessage="Urgent medical warning sign check. If you are experiencing sudden severe pain, heavy bleeding, or fainting, seek emergency casualty care immediately."
        onFindHospitals={() => {
          setIsEmergencyModalOpen(false);
          setCurrentTab('hospitals');
        }}
      />

    </div>
  );
}
