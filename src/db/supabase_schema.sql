-- ==============================================================================
-- SheCare's / NariCare AI - Supabase Database Schema
-- Run this script in the Supabase SQL Editor to initialize all tables
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'kn', 'hi', 'mixed')),
  age INTEGER,
  password TEXT,
  otp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  booking_reference TEXT UNIQUE NOT NULL,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_specialty TEXT NOT NULL,
  doctor_photo TEXT,
  patient_id TEXT,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  consultation_mode TEXT NOT NULL CHECK (consultation_mode IN ('video', 'audio', 'clinic')),
  consultation_type TEXT,
  session_fee NUMERIC NOT NULL,
  platform_fee NUMERIC DEFAULT 0,
  total_paid NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'refunded')),
  payment_method TEXT DEFAULT 'UPI',
  payment_transaction_id TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'rescheduled')),
  meeting_token TEXT,
  symptoms_reported TEXT,
  doctor_notes TEXT,
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SAFETY RULES TABLE
CREATE TABLE IF NOT EXISTS safety_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('gynecological_emergency', 'obstetric_emergency', 'severe_systemic')),
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  urgent_action TEXT NOT NULL,
  severity TEXT DEFAULT 'emergency' CHECK (severity IN ('emergency', 'urgent')),
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HEALTH JOURNAL TABLE
CREATE TABLE IF NOT EXISTS health_journal (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  is_period_day BOOLEAN DEFAULT FALSE,
  flow_intensity TEXT CHECK (flow_intensity IN ('light', 'medium', 'heavy', 'spotting')),
  pain_score INTEGER DEFAULT 0 CHECK (pain_score >= 0 AND pain_score <= 10),
  symptoms JSONB DEFAULT '[]'::jsonb,
  mood TEXT DEFAULT 'Normal',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  details TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('safety_rule_update', 'doctor_verification', 'pricing_change', 'data_deletion'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_journal_user ON health_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read / service write policies
CREATE POLICY "Allow public read on safety rules" ON safety_rules FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read/write on appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow public read on audit logs" ON audit_logs FOR SELECT USING (true);
