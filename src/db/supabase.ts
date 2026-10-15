import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment, AuditEvent, JournalEntry, UserProfile } from '../types/index.ts';
import { SafetyRule, CLINICAL_SAFETY_RULES } from '../utils/triage.ts';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    console.log('[Supabase] Initialized client for:', supabaseUrl);
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
    supabase = null;
  }
} else {
  console.log('[Supabase] No valid SUPABASE_URL and SUPABASE_ANON_KEY found. Running in hybrid local mode with database migration readiness.');
}

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

export interface StoredUser extends UserProfile {
  password?: string;
  otp?: string;
}

/**
 * Supabase Database Repository
 * Interacts with PostgreSQL tables in Supabase when credentials exist,
 * with seamless fallback to in-memory store so the app always stays functional.
 */
export const SupabaseDb = {
  async checkTablesHealth(): Promise<Record<string, { exists: boolean; rowCount?: number; message?: string }>> {
    const tableNames = ['users', 'appointments', 'safety_rules', 'health_journal', 'audit_logs'];
    const report: Record<string, { exists: boolean; rowCount?: number; message?: string }> = {};

    if (!supabase) {
      for (const t of tableNames) {
        report[t] = { exists: false, message: 'Supabase client not configured in environment' };
      }
      return report;
    }

    for (const t of tableNames) {
      try {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (error) {
          report[t] = { exists: false, message: error.message };
        } else {
          report[t] = { exists: true, rowCount: data?.length || 0 };
        }
      } catch (err: any) {
        report[t] = { exists: false, message: err.message };
      }
    }
    return report;
  },

  // -------------------------------------------------------------
  // APPOINTMENTS TABLE
  // -------------------------------------------------------------
  async getAppointments(doctorId?: string): Promise<Appointment[]> {
    if (supabase) {
      try {
        let query = supabase.from('appointments').select('*').order('created_at', { ascending: false });
        if (doctorId) {
          query = query.eq('doctor_id', doctorId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(row => ({
            id: row.id,
            bookingReference: row.booking_reference,
            doctorId: row.doctor_id,
            doctorName: row.doctor_name,
            doctorSpecialty: row.doctor_specialty,
            doctorPhoto: row.doctor_photo,
            patientId: row.patient_id,
            patientName: row.patient_name,
            patientPhone: row.patient_phone,
            patientEmail: row.patient_email,
            date: row.date,
            timeSlot: row.time_slot,
            consultationMode: row.consultation_mode,
            consultationType: row.consultation_type || row.consultation_mode,
            sessionFee: row.session_fee,
            platformFee: row.platform_fee,
            totalPaid: row.total_paid,
            paymentStatus: row.payment_status,
            paymentMethod: row.payment_method,
            paymentTransactionId: row.payment_transaction_id,
            status: row.status,
            meetingToken: row.meeting_token,
            symptomsReported: row.symptoms_reported,
            doctorNotes: row.doctor_notes,
            languagePreference: row.language_preference,
            createdAt: row.created_at
          }));
        }
      } catch (err) {
        console.warn('[Supabase] Error querying appointments table:', err);
      }
    }
    return [];
  },

  async insertAppointment(appt: Appointment): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase.from('appointments').insert({
          id: appt.id,
          booking_reference: appt.bookingReference,
          doctor_id: appt.doctorId,
          doctor_name: appt.doctorName,
          doctor_specialty: appt.doctorSpecialty,
          doctor_photo: appt.doctorPhoto,
          patient_id: appt.patientId,
          patient_name: appt.patientName,
          patient_phone: appt.patientPhone,
          patient_email: appt.patientEmail,
          date: appt.date,
          time_slot: appt.timeSlot,
          consultation_mode: appt.consultationMode,
          consultation_type: appt.consultationType || appt.consultationMode,
          session_fee: appt.sessionFee,
          platform_fee: appt.platformFee,
          total_paid: appt.totalPaid,
          payment_status: appt.paymentStatus,
          payment_method: appt.paymentMethod,
          payment_transaction_id: appt.paymentTransactionId,
          status: appt.status,
          meeting_token: appt.meetingToken,
          symptoms_reported: appt.symptomsReported,
          doctor_notes: appt.doctorNotes,
          language_preference: appt.languagePreference,
          created_at: appt.createdAt || new Date().toISOString()
        });
        if (error) {
          console.warn('[Supabase] Failed to insert appointment:', error.message);
          return false;
        }
        return true;
      } catch (err) {
        console.warn('[Supabase] Exception inserting appointment:', err);
      }
    }
    return false;
  },

  async cancelAppointment(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'cancelled', payment_status: 'refunded' })
          .eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('[Supabase] Failed to cancel appointment in db:', err);
      }
    }
    return false;
  },

  // -------------------------------------------------------------
  // USERS TABLE
  // -------------------------------------------------------------
  async findUser(identifier: string): Promise<StoredUser | null> {
    if (supabase) {
      try {
        const clean = identifier.trim().toLowerCase();
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`email.ilike.${clean},phone.ilike.%${clean.replace(/\D/g, '')}%`)
          .limit(1);

        if (!error && data && data.length > 0) {
          const u = data[0];
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            languagePreference: u.language_preference,
            age: u.age,
            password: u.password,
            otp: u.otp
          };
        }
      } catch (err) {
        console.warn('[Supabase] Error finding user:', err);
      }
    }
    return null;
  },

  async insertUser(user: StoredUser): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase.from('users').insert({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          language_preference: user.languagePreference,
          password: user.password,
          created_at: new Date().toISOString()
        });
        if (!error) return true;
        console.warn('[Supabase] User insert error:', error.message);
      } catch (err) {
        console.warn('[Supabase] Exception inserting user:', err);
      }
    }
    return false;
  },

  // -------------------------------------------------------------
  // SAFETY RULES TABLE
  // -------------------------------------------------------------
  async getSafetyRules(): Promise<SafetyRule[] | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('safety_rules').select('*');
        if (!error && data && data.length > 0) {
          return data.map(r => ({
            id: r.id,
            name: r.name,
            category: r.category,
            keywords: Array.isArray(r.keywords) ? r.keywords : (r.keywords ? JSON.parse(r.keywords) : []),
            description: r.description,
            urgentAction: r.urgent_action,
            severity: r.severity,
            version: r.version
          }));
        }
      } catch (err) {
        console.warn('[Supabase] Error querying safety_rules table:', err);
      }
    }
    return null;
  },

  async upsertSafetyRule(rule: SafetyRule): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase.from('safety_rules').upsert({
          id: rule.id,
          name: rule.name,
          category: rule.category,
          keywords: rule.keywords,
          description: rule.description,
          urgent_action: rule.urgentAction,
          severity: rule.severity,
          version: rule.version,
          updated_at: new Date().toISOString()
        });
        if (!error) return true;
      } catch (err) {
        console.warn('[Supabase] Error upserting safety rule:', err);
      }
    }
    return false;
  },

  // -------------------------------------------------------------
  // AUDIT LOGS TABLE
  // -------------------------------------------------------------
  async getAuditLogs(): Promise<AuditEvent[] | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(a => ({
            id: a.id,
            timestamp: a.timestamp,
            action: a.action,
            performedBy: a.performed_by,
            details: a.details,
            category: a.category
          }));
        }
      } catch (err) {
        console.warn('[Supabase] Error getting audit logs:', err);
      }
    }
    return null;
  },

  async insertAuditLog(event: AuditEvent): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase.from('audit_logs').insert({
          id: event.id,
          timestamp: event.timestamp,
          action: event.action,
          performed_by: event.performedBy,
          details: event.details,
          category: event.category
        });
        if (!error) return true;
      } catch (err) {
        console.warn('[Supabase] Error inserting audit log:', err);
      }
    }
    return false;
  }
};
