import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  ShieldCheck,
  AlertCircle,
  FileText,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Printer
} from 'lucide-react';
import { Appointment } from '../types';

interface AppointmentsViewProps {
  onJoinRoom: (appointmentId: string) => void;
  onBookNew: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  onJoinRoom,
  onBookNew
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment? You will receive a 100% refund of the consultation fee.')) {
      return;
    }

    setCancellingId(id);
    setCancelMessage(null);

    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setCancelMessage(data.message);
        fetchAppointments();
      } else {
        alert(data.error || 'Failed to cancel appointment');
      }
    } catch (err) {
      alert('Error connecting to cancellation service');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Consultation Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Doctor Appointments
          </h1>
        </div>

        <button
          onClick={onBookNew}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-105"
        >
          Book New Consultation
        </button>
      </div>

      {cancelMessage && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{cancelMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(n => (
            <div key={n} className="bg-white rounded-3xl p-6 h-36 border border-slate-100"></div>
          ))}
        </div>
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map(appt => (
            <div
              key={appt.id}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-md shadow-slate-900/5 ${
                appt.status === 'cancelled'
                  ? 'border-slate-200 opacity-60'
                  : 'border-pink-100 hover:border-pink-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Doctor and Date Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={appt.doctorPhoto || 'https://images.unsplash.com/photo-1594824813583-9b93566141a4?auto=format&fit=crop&q=80&w=400'}
                    alt={appt.doctorName}
                    className="w-16 h-16 rounded-2xl object-cover border border-pink-100 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{appt.doctorName}</h3>
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                        appt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : appt.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {appt.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-pink-700">{appt.doctorSpecialty}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {appt.date}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {appt.timeSlot} IST
                      </span>
                      <span className="flex items-center gap-1 font-medium capitalize">
                        {appt.consultationMode === 'video' ? <Video className="w-3.5 h-3.5 text-purple-500" /> : <Phone className="w-3.5 h-3.5 text-purple-500" />}
                        {appt.consultationMode}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono pt-1">
                      Ref: {appt.bookingReference} • Fee Paid: ₹{appt.totalPaid} ({appt.paymentStatus})
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                  {appt.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => onJoinRoom(appt.id)}
                        className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-105"
                      >
                        <Video className="w-4 h-4" />
                        <span>Enter Room</span>
                      </button>

                      <button
                        onClick={() => handleCancelAppointment(appt.id)}
                        disabled={cancellingId === appt.id}
                        className="text-xs font-semibold text-slate-500 hover:text-red-600 py-1 transition-colors"
                      >
                        {cancellingId === appt.id ? 'Processing Refund...' : 'Cancel (100% Refund)'}
                      </button>
                    </>
                  )}

                  {appt.status === 'cancelled' && (
                    <span className="text-xs text-red-600 font-semibold">
                      Refund Processed to {appt.paymentMethod}
                    </span>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Consultation Appointments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any upcoming doctor appointments. You can browse certified gynecologists and book a session anytime.
          </p>
          <button
            onClick={onBookNew}
            className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
          >
            Find a Doctor
          </button>
        </div>
      )}

      {/* Booking & Refund Policy Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700">Patient Cancellation & Attendance Policy: </span>
          <span>
            You can reschedule or cancel with a 100% full refund up to 2 hours prior to the session time. In case of emergency or connection failure, our patient coordination desk will facilitate free rescheduling.
          </span>
        </div>
      </div>

    </div>
  );
};
