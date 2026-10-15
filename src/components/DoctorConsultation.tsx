import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  Calendar,
  Clock,
  Video,
  Phone,
  Languages,
  CheckCircle2,
  X,
  CreditCard,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  Check
} from 'lucide-react';
import { Doctor, Appointment } from '../types';
import { calculateSessionPricing } from '../utils/booking';

interface DoctorConsultationProps {
  prefilledSymptoms?: string;
  onAppointmentBooked: (appt: Appointment) => void;
  onJoinRoom: (appointmentId: string) => void;
}

export const DoctorConsultation: React.FC<DoctorConsultationProps> = ({
  prefilledSymptoms = '',
  onAppointmentBooked,
  onJoinRoom
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchDoctor, setSearchDoctor] = useState('');

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [consultationMode, setConsultationMode] = useState<'video' | 'audio'>('video');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [symptomsNote, setSymptomsNote] = useState(prefilledSymptoms);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment_gateway' | 'confirmed'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (prefilledSymptoms) {
      setSymptomsNote(prefilledSymptoms);
    }
  }, [prefilledSymptoms]);

  const handleOpenBooking = (doc: Doctor) => {
    setBookingDoctor(doc);
    // Set default tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedTime(doc.timeSlots[0] || '10:00');
    setPaymentStep('details');
    setBookingError(null);
  };

  const handleProceedToPayment = () => {
    if (!patientName.trim() || !patientPhone.trim()) {
      setBookingError('Please enter your full name and contact phone number.');
      return;
    }
    setBookingError(null);
    setPaymentStep('payment_gateway');
  };

  const handleConfirmPaymentAndBook = async (paymentMethodSelected: string) => {
    if (!bookingDoctor || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: bookingDoctor.id,
          date: selectedDate,
          timeSlot: selectedTime,
          consultationMode,
          patientName,
          patientPhone,
          patientEmail,
          symptomsReported: symptomsNote,
          paymentMethod: paymentMethodSelected
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete booking.');
      }

      setConfirmedAppt(data.appointment);
      onAppointmentBooked(data.appointment);
      setPaymentStep('confirmed');
    } catch (err: any) {
      setBookingError(err.message || 'Booking conflict or server error. Please select another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    if (selectedSpecialty !== 'all' && !doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())) return false;
    if (selectedLanguage !== 'all' && !doc.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase())) return false;
    if (searchDoctor.trim()) {
      const q = searchDoctor.toLowerCase();
      return doc.name.toLowerCase().includes(q) || doc.hospitalAffiliation.toLowerCase().includes(q) || doc.city.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-bold">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Online Doctor Consultations</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Consult Certified Gynecologists & PCOS Specialists
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          Transparent per-session pricing starting at <strong>₹399</strong>. Verified Medical Council registration numbers, video or secure audio consultations, and 100% refund policy.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-xl shadow-pink-900/5 border border-pink-100 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              placeholder="Search doctor name or hospital..."
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
          >
            <option value="all">All Languages</option>
            <option value="kannada">Kannada (ಕನ್ನಡ)</option>
            <option value="hindi">Hindi (हिंदी)</option>
            <option value="english">English</option>
          </select>

          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
          >
            <option value="all">All Specialties</option>
            <option value="pcos">PCOS & Menstrual Regularity</option>
            <option value="endocrinology">Reproductive Endocrinology</option>
            <option value="endometriosis">Complex Gynecology & Endometriosis</option>
          </select>

        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map(n => (
            <div key={n} className="bg-white rounded-3xl p-6 h-64 border border-slate-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-6 border border-pink-100 shadow-md shadow-pink-900/5 hover:shadow-xl hover:border-pink-300 transition-all flex flex-col justify-between space-y-5"
            >
              {/* Doctor Header */}
              <div className="flex items-start gap-4">
                <img
                  src={doc.photoUrl}
                  alt={doc.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-sm border-2 border-pink-100 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                    <span title="Verified Medical License"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /></span>
                  </div>
                  <p className="text-xs font-semibold text-pink-700">{doc.title}</p>
                  <p className="text-[11px] text-slate-600">{doc.qualifications}</p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span>Reg: {doc.registrationNumber} ({doc.medicalCouncil})</span>
                  </div>
                </div>
              </div>

              {/* Badges & Languages */}
              <div className="space-y-2 text-xs">
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{doc.bio}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2.5 py-1 bg-pink-50 text-pink-800 rounded-lg text-[11px] font-semibold">
                    {doc.experienceYears} Years Experience
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1">
                    <Languages className="w-3 h-3" />
                    {doc.languages.join(', ')}
                  </span>
                </div>
              </div>

              {/* Per Session Price & Booking Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900">₹{doc.perSessionFee}</span>
                    <span className="text-xs text-slate-500 font-medium">/ session</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    {doc.durationMinutes} mins • 0 hidden fees
                  </span>
                </div>

                <button
                  onClick={() => handleOpenBooking(doc)}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-transform hover:scale-105"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-pink-100 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={bookingDoctor.photoUrl}
                  alt={bookingDoctor.name}
                  className="w-10 h-10 rounded-xl object-cover border border-rose-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{bookingDoctor.name}</h3>
                  <p className="text-[11px] text-slate-500">{bookingDoctor.specialty} • ₹{bookingDoctor.perSessionFee} per session</p>
                </div>
              </div>
              <button
                onClick={() => setBookingDoctor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {bookingError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* STEP 1: Details & Slot Selection */}
              {paymentStep === 'details' && (
                <div className="space-y-4 text-xs">
                  
                  {/* Mode Picker */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Consultation Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setConsultationMode('video')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-colors ${
                          consultationMode === 'video' ? 'bg-pink-50 border-pink-400 text-pink-800 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Video className="w-4 h-4 text-pink-600" />
                        <span>Private Video Call</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConsultationMode('audio')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-colors ${
                          consultationMode === 'audio' ? 'bg-pink-50 border-pink-400 text-pink-800 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Phone className="w-4 h-4 text-pink-600" />
                        <span>Secure Audio Call</span>
                      </button>
                    </div>
                  </div>

                  {/* Date & Time Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Select Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Available Slot ({bookingDoctor.durationMinutes} min)</label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                      >
                        {bookingDoctor.timeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot} IST</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-900 block">Patient Information</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="e.g. Kavya Narayan"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phone Number (for SMS & Video link) *</label>
                        <input
                          type="tel"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="+91 98860 12345"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Symptoms Note / Concerns for Doctor (Optional)</label>
                      <textarea
                        rows={2}
                        value={symptomsNote}
                        onChange={(e) => setSymptomsNote(e.target.value)}
                        placeholder="Any specific questions, cycle history, or symptoms to attach to doctor's chart..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                      />
                    </div>
                  </div>

                  {/* Transparent Cost Breakdown */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Doctor Consultation Fee ({bookingDoctor.durationMinutes} mins)</span>
                      <span>₹{bookingDoctor.perSessionFee}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Platform / Booking Fee</span>
                      <span className="text-emerald-700 font-bold">₹0 (Zero surcharge)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>GST / Taxes</span>
                      <span className="text-slate-500">₹0 (Healthcare exempt)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900 text-sm">
                      <span>Total Amount Payable</span>
                      <span className="text-pink-700">₹{bookingDoctor.perSessionFee}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 italic pt-1">
                      Guarantee: Charged strictly for this single session. No recurring memberships. 100% refund on cancellation up to 2 hours prior.
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:from-rose-700 hover:to-pink-700 transition-all shadow-md"
                  >
                    <span>Proceed to Secure Payment (₹{bookingDoctor.perSessionFee})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: Test Payment Sandbox Gateway */}
              {paymentStep === 'payment_gateway' && (
                <div className="space-y-4 text-xs animate-in fade-in duration-200">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block font-bold">Test Mode — Sandbox Payment Gateway</strong>
                      <span className="text-[11px] text-emerald-800">
                        Zero real money is charged. Real Razorpay/PG credentials will plug in without changing logic. You can simulate instant authorization.
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">Choose Simulated Payment Method</span>
                    
                    <button
                      onClick={() => handleConfirmPaymentAndBook('UPI (GPay/PhonePe)')}
                      disabled={isSubmitting}
                      className="w-full p-3 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between font-bold text-slate-800 transition-colors"
                    >
                      <span>Simulate UPI Payment (Google Pay / PhonePe / Paytm)</span>
                      <span className="text-pink-600 text-xs font-semibold">Pay ₹{bookingDoctor.perSessionFee}</span>
                    </button>

                    <button
                      onClick={() => handleConfirmPaymentAndBook('Debit/Credit Card (Visa/Mastercard)')}
                      disabled={isSubmitting}
                      className="w-full p-3 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between font-bold text-slate-800 transition-colors"
                    >
                      <span>Simulate Debit/Credit Card</span>
                      <span className="text-pink-600 text-xs font-semibold">Pay ₹{bookingDoctor.perSessionFee}</span>
                    </button>

                    <button
                      onClick={() => handleConfirmPaymentAndBook('Net Banking (SBI/HDFC/ICICI)')}
                      disabled={isSubmitting}
                      className="w-full p-3 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between font-bold text-slate-800 transition-colors"
                    >
                      <span>Simulate Net Banking</span>
                      <span className="text-pink-600 text-xs font-semibold">Pay ₹{bookingDoctor.perSessionFee}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setPaymentStep('details')}
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                  >
                    Back to Appointment Details
                  </button>
                </div>
              )}

              {/* STEP 3: Booking Confirmed */}
              {paymentStep === 'confirmed' && confirmedAppt && (
                <div className="space-y-4 text-center py-4 text-xs animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Confirmed & Verified</span>
                    <h3 className="text-lg font-black text-slate-900">Consultation Session Booked!</h3>
                    <p className="text-slate-600 text-xs">
                      Booking Reference: <strong className="text-rose-700 font-mono text-sm">{confirmedAppt.bookingReference}</strong>
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Doctor:</span>
                      <span className="font-bold text-slate-800">{confirmedAppt.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Time:</span>
                      <span className="font-bold text-slate-800">{confirmedAppt.date} at {confirmedAppt.timeSlot} IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mode:</span>
                      <span className="font-bold text-slate-800 capitalize">{confirmedAppt.consultationMode} Consultation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Paid:</span>
                      <span className="font-bold text-emerald-700">₹{confirmedAppt.totalPaid} (Paid via {confirmedAppt.paymentMethod})</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      onClick={() => {
                        setBookingDoctor(null);
                        onJoinRoom(confirmedAppt.id);
                      }}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Video className="w-4 h-4" />
                      <span>Enter Consultation Room</span>
                    </button>
                    <button
                      onClick={() => setBookingDoctor(null)}
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
