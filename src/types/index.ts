/**
 * NariCare AI - Core Types & Domain Interfaces
 */

export type SupportedLanguage = 'en' | 'kn' | 'hi' | 'mixed';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  languagePreference: SupportedLanguage;
  age?: number;
}

export interface MedicalCitation {
  id: string;
  sourceName: string;
  title: string;
  organization: string; // e.g. WHO, ACOG, RCOG, NHS, FOGSI
  url: string;
  publicationYear: number;
  reviewStatus: 'Peer-Reviewed' | 'Clinical Guideline' | 'Public Health Institution';
  relevantSummary: string;
}

export interface ExtractedSymptom {
  name: string;
  category: 'menstrual' | 'dermatological' | 'metabolic' | 'pain' | 'mood';
  isNegated: boolean;
  severity?: 'mild' | 'moderate' | 'severe';
  originalTerm: string;
}

export interface NormalizedSymptomSummary {
  reportedSymptoms: ExtractedSymptom[];
  negatedSymptoms: ExtractedSymptom[];
  duration: string | null;
  frequency: string | null;
  detectedLanguage: SupportedLanguage;
  uncertaintyNotes: string[];
  missingInformation: string[];
}

export interface AIAnalysisResponse {
  normalizedSummary: NormalizedSymptomSummary;
  educationalExplanation: string;
  potentialConsiderations: string[];
  whenToSeeDoctor: string[];
  questionsForGynecologist: string[];
  citations: MedicalCitation[];
  disclaimer: string;
  isEmergency: boolean;
}

export interface DoctorCredential {
  degree: string;
  institution: string;
  year: number;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  qualifications: string;
  credentials: DoctorCredential[];
  registrationNumber: string;
  medicalCouncil: string;
  experienceYears: number;
  languages: string[];
  perSessionFee: number;
  durationMinutes: number;
  consultationModes: ('video' | 'audio')[];
  rating: number;
  reviewCount: number;
  photoUrl: string;
  bio: string;
  hospitalAffiliation: string;
  city: string;
  isVerified: boolean;
  availableDays: string[];
  timeSlots: string[];
}

export interface Appointment {
  id: string;
  bookingReference: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorPhoto?: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  consultationMode: 'video' | 'audio' | 'clinic';
  consultationType?: 'video' | 'audio' | 'clinic';
  sessionFee: number;
  platformFee?: number;
  totalPaid?: number;
  paymentStatus?: 'paid' | 'pending' | 'refunded';
  paymentMethod?: string;
  paymentTransactionId?: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  meetingToken?: string;
  symptomsReported?: string;
  doctorNotes?: string;
  createdAt?: string;
  isEmergency?: boolean;
  languagePreference?: SupportedLanguage;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'Multispecialty Hospital' | 'Women & Child Care Clinic' | 'Government Hospital' | 'Diagnostic Center';
  address: string;
  city: string;
  pincode: string;
  distanceKm: number;
  phone: string;
  emergency24x7: boolean;
  services: string[];
  rating: number;
  lat: number;
  lng: number;
  verifiedStatus: 'Verified by NariCare' | 'Public Health Registry';
  openHours: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  isPeriodDay: boolean;
  flowIntensity?: 'light' | 'medium' | 'heavy' | 'spotting';
  painScore: number; // 0 - 10
  symptoms: string[];
  mood: string;
  notes?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
  category: 'safety_rule_update' | 'doctor_verification' | 'pricing_change' | 'data_deletion';
}
