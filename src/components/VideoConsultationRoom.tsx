import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Clock,
  Shield,
  MessageSquare,
  FileText,
  AlertTriangle,
  Send,
  X,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { Appointment } from '../types';

interface VideoConsultationRoomProps {
  appointmentId: string;
  onExit: () => void;
}

export const VideoConsultationRoom: React.FC<VideoConsultationRoomProps> = ({
  appointmentId,
  onExit
}) => {
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Media Controls
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'symptoms'>('symptoms');

  // Consultation Timer
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60); // 25 mins

  // In-call chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'Dr. Priya S. Rao',
      text: 'Namaste! Welcome to your consultation. I am reviewing your symptom log right now.',
      time: '10:01'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/consultation/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointmentId })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to authenticate consultation room session.');
        }
        setTokenData(data);
      } catch (err: any) {
        setError(err.message || 'Unable to join consultation session');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [appointmentId]);

  // Handle local camera preview
  useEffect(() => {
    let localStream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && isVideoOn && !isAudioOnly) {
          localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setMediaStream(localStream);
          if (videoRef.current) {
            videoRef.current.srcObject = localStream;
          }
        }
      } catch (err) {
        console.warn('Camera/Mic permission access not granted or unavailable:', err);
      }
    };

    enableCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoOn, isAudioOnly]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    setChatMessages(prev => [...prev, { sender: 'You', text: chatInput.trim(), time: timeStr }]);
    setChatInput('');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Verifying private consultation room token...</p>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-red-200 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Room Access Denied</h2>
        <p className="text-xs text-slate-600 leading-relaxed">{error || 'This consultation link is invalid or expired.'}</p>
        <button
          onClick={onExit}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      
      {/* Consultation Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">Live Consultation Room</span>
              <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-300">
                Ref: {tokenData.bookingReference}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold">
              Consulting with {tokenData.doctorName}
            </h1>
          </div>
        </div>

        {/* Timer & Security */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl text-slate-200 border border-slate-700">
            <Clock className="w-4 h-4 text-rose-400" />
            <span>Time Left: {formatTimer(secondsRemaining)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-emerald-400 text-xs">
            <Shield className="w-4 h-4" />
            <span>Encrypted Room</span>
          </div>

          <button
            onClick={onExit}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave Session</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video Stream + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Video Container */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video shadow-2xl flex items-center justify-center border border-slate-800">
            
            {/* Doctor Simulated Feed */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
              <img
                src="https://images.unsplash.com/photo-1594824813583-9b93566141a4?auto=format&fit=crop&q=80&w=400"
                alt="Doctor Feed"
                className="w-24 h-24 rounded-full object-cover border-4 border-rose-500 shadow-xl mb-3"
              />
              <h3 className="text-base font-bold">{tokenData.doctorName}</h3>
              <p className="text-xs text-rose-300">Senior Consultant Obstetrician & Gynecologist</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-900/60 border border-emerald-500/40 rounded-full text-[11px] text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Doctor Connected & Listening</span>
              </div>
            </div>

            {/* Patient Self-View PIP */}
            <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-900">
              {isVideoOn && !isAudioOnly ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px]">
                  <VideoOff className="w-5 h-5 mb-1" />
                  <span>Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white/80 bg-black/60 px-1.5 py-0.5 rounded">
                You
              </div>
            </div>

            {/* In-Call Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-xl text-white transition-colors ${
                  isMicOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-700'
                }`}
                title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-xl text-white transition-colors ${
                  isVideoOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-700'
                }`}
                title={isVideoOn ? 'Turn camera off' : 'Turn camera on'}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsAudioOnly(!isAudioOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isAudioOnly ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Audio-Only
              </button>
            </div>

          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-center justify-between">
            <span className="font-medium">
              🔒 Privacy Protected: Consultations are not recorded. Video & audio are transmitted via secure peer-to-peer tokens.
            </span>
            <span className="text-[10px] font-bold text-rose-700 uppercase">HIPAA/DISHA Ready</span>
          </div>
        </div>

        {/* Right Sidebar: Chat / Symptoms / Clinical Notes */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[520px]">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`flex-1 py-3 text-center transition-colors ${
                activeTab === 'symptoms' ? 'bg-white text-rose-700 border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Symptoms
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-center transition-colors ${
                activeTab === 'chat' ? 'bg-white text-rose-700 border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Consult Chat
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 text-center transition-colors ${
                activeTab === 'notes' ? 'bg-white text-rose-700 border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Prescription
            </button>
          </div>

          {/* Panel Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
            {activeTab === 'symptoms' && (
              <div className="space-y-3">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">Reported Symptoms Attached</span>
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-rose-950 leading-relaxed font-medium">
                  {tokenData.symptomsReported || 'Menstrual irregularity for 3-4 months, jawline breakouts, no acute pain.'}
                </div>
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-purple-950 space-y-1">
                  <span className="font-bold block">Patient History:</span>
                  <p className="text-slate-600">Patient: {tokenData.patientName}</p>
                  <p className="text-slate-600">Scheduled: {tokenData.date} ({tokenData.timeSlot} IST)</p>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-2.5 overflow-y-auto pr-1">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`p-2.5 rounded-2xl text-xs ${msg.sender === 'You' ? 'bg-rose-500 text-white ml-6' : 'bg-slate-100 text-slate-800 mr-6'}`}>
                      <div className="flex items-center justify-between text-[10px] font-bold opacity-80 mb-0.5">
                        <span>{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="pt-2 flex gap-1.5 border-t border-slate-100 mt-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message to doctor..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                  />
                  <button type="submit" className="p-2 bg-rose-600 text-white rounded-xl">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-3">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">Doctor Clinical Summary & Rx</span>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-slate-700">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>Clinical Impressions (Draft)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    1. Suspected PCOS phenotype B (ovulatory dysfunction + clinical hyperandrogenism).<br />
                    2. Recommended Investigations:<br />
                    • Pelvic Ultrasound (TVS/TAS) for ovarian follicle count.<br />
                    • Blood hormonal panel (Day 2-3 FSH/LH, Free Testosterone, Fasting Insulin, TSH).<br />
                    3. First-line lifestyle management: balanced low-glycemic nutrition and 150 mins/week moderate exercise.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
