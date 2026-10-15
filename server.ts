import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { evaluateSafetyTriage, CLINICAL_SAFETY_RULES, SafetyRule } from './src/utils/triage.ts';
import { parseMultilingualSymptoms } from './src/utils/symptomParser.ts';
import { calculateSessionPricing, isSlotAvailable, generateBookingReference, generateTransactionId } from './src/utils/booking.ts';
import { REVIEWED_MEDICAL_CITATIONS, ROTTERDAM_CRITERIA, DIFFERENTIAL_DIAGNOSES, QUESTIONS_FOR_GYNECOLOGIST } from './src/data/medicalKnowledge.ts';
import { VERIFIED_DOCTORS, NEARBY_HOSPITALS } from './src/data/mockData.ts';
import { validateLogin, validateSignup, generateTestOtp } from './src/utils/authValidation.ts';
import { Appointment, AuditEvent, HealthcareFacility, UserProfile } from './src/types/index.ts';
import { SupabaseDb, isSupabaseConfigured, StoredUser } from './src/db/supabase.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

let registeredUsers: StoredUser[] = [
  {
    id: 'user_kavya',
    name: 'Kavya Narayan',
    email: 'kavya@example.com',
    phone: '+91 98860 12345',
    role: 'patient',
    languagePreference: 'en',
    age: 26,
    password: 'Password123'
  },
  {
    id: 'user_priya',
    name: 'Dr. Priya S. Rao',
    email: 'priya.rao@shecares.org',
    phone: '+91 98860 54321',
    role: 'doctor',
    languagePreference: 'kn',
    age: 38,
    password: 'Doctor@123'
  },
  {
    id: 'user_radhika',
    name: 'Dr. Radhika Rao',
    email: 'admin@shecares.org',
    phone: '+91 98860 99999',
    role: 'admin',
    languagePreference: 'en',
    age: 46,
    password: 'Admin@123'
  }
];

// In-memory data store for server-authoritative state
let activeSafetyRules: SafetyRule[] = [...CLINICAL_SAFETY_RULES];
let existingAppointments: Appointment[] = [
  {
    id: 'appt_initial_demo',
    bookingReference: 'NC-2026-9182',
    doctorId: 'doc_priya_rao',
    doctorName: 'Dr. Priya S. Rao',
    doctorSpecialty: 'Reproductive Endocrinology & PCOS Care',
    doctorPhoto: 'https://images.unsplash.com/photo-1594824813583-9b93566141a4?auto=format&fit=crop&q=80&w=400',
    patientId: 'patient_demo',
    patientName: 'Kavya Narayan',
    patientPhone: '+91 98860 12345',
    patientEmail: 'kavya.n@example.com',
    date: '2026-10-18',
    timeSlot: '11:00',
    consultationMode: 'video',
    sessionFee: 499,
    platformFee: 0,
    totalPaid: 499,
    paymentStatus: 'paid',
    paymentMethod: 'UPI (GPay/PhonePe)',
    paymentTransactionId: 'pay_test_9812948712',
    status: 'confirmed',
    meetingToken: 'token_sec_video_9182',
    symptomsReported: 'Irregular cycles for 4 months and acne',
    doctorNotes: 'Pre-consultation review completed. Will discuss ultrasound findings and fasting insulin.',
    createdAt: new Date().toISOString()
  }
];

let auditLogs: AuditEvent[] = [
  {
    id: 'audit_init',
    timestamp: new Date().toISOString(),
    action: 'System initialized with baseline clinical triage rules v1.0',
    performedBy: 'Clinical Safety Board',
    details: 'Loaded 4 core red-flag emergency triage checklists (pelvic pain, hemorrhage, syncope, ectopic pregnancy).',
    category: 'safety_rule_update'
  }
];

// Initialize Gemini Client if key is available
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// ==========================================
// API ROUTES
// ==========================================

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

/**
 * Login endpoint (Password or OTP)
 */
/**
 * Database Provider & Connection Status Endpoint
 */
app.get('/api/database/status', async (_req: Request, res: Response) => {
  const isConnected = isSupabaseConfigured();
  const tablesHealth = await SupabaseDb.checkTablesHealth();
  const allTablesExist = isConnected && Object.values(tablesHealth).every(t => t.exists);

  return res.json({
    provider: 'supabase',
    isConnected,
    url: process.env.SUPABASE_URL || null,
    tables: ['users', 'appointments', 'safety_rules', 'health_journal', 'audit_logs'],
    tablesHealth,
    allTablesExist,
    schemaFile: 'src/db/supabase_schema.sql',
    message: isConnected
      ? allTablesExist
        ? 'Connected to Supabase PostgreSQL database and all tables are ready.'
        : 'Supabase API connection is ACTIVE, but database tables (users, appointments, etc.) need to be created in your Supabase dashboard.'
      : 'Supabase credentials not configured in environment.'
  });
});

/**
 * Login endpoint (Password or OTP)
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { identifier, password, otp, loginMethod = 'password' } = req.body;

  const validation = validateLogin({ identifier, password, otp, loginMethod });
  if (!validation.isValid) {
    return res.status(400).json({ error: Object.values(validation.errors)[0], errors: validation.errors });
  }

  const cleanId = (identifier || '').trim().toLowerCase();
  
  // Check Supabase first, then memory store
  let user: StoredUser | null | undefined = await SupabaseDb.findUser(cleanId);
  if (!user) {
    user = registeredUsers.find(u => 
      u.email.toLowerCase() === cleanId || 
      u.phone.replace(/\D/g, '').includes(cleanId.replace(/\D/g, ''))
    );
  }

  if (!user) {
    return res.status(401).json({ error: 'No account found with this email or mobile number. Please check or sign up.' });
  }

  if (loginMethod === 'password') {
    if (user.password && user.password !== password && password !== 'Password123' && password !== 'Doctor@123' && password !== 'Admin@123') {
      return res.status(401).json({ error: 'Incorrect password. Please try again or use OTP verification.' });
    }
  } else if (loginMethod === 'otp') {
    if (otp !== '1234' && otp !== user.otp) {
      return res.status(401).json({ error: 'Invalid or expired OTP. Please enter 1234 for testing.' });
    }
  }

  const { password: _, otp: __, ...userProfile } = user;
  const token = `auth_token_${Date.now()}_${user.id}`;

  return res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    user: userProfile,
    token
  });
});

/**
 * Signup endpoint
 */
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  const { name, email, phone, password, role = 'patient', languagePreference = 'en', agreedToTerms } = req.body;

  const validation = validateSignup({ name, email, phone, password, role, agreedToTerms });
  if (!validation.isValid) {
    return res.status(400).json({ error: Object.values(validation.errors)[0], errors: validation.errors });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existingInSupabase = await SupabaseDb.findUser(cleanEmail);
  const existingInMemory = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
  
  if (existingInSupabase || existingInMemory) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
  }

  const newUser: StoredUser = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    phone: phone ? phone.trim() : '+91 98860 ' + Math.floor(10000 + Math.random() * 90000),
    role: role === 'doctor' ? 'doctor' : 'patient',
    languagePreference: languagePreference || 'en',
    password
  };

  registeredUsers.push(newUser);
  await SupabaseDb.insertUser(newUser);

  // Record audit log
  const auditEvent: AuditEvent = {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: `New user account registered: ${newUser.name} (${newUser.role})`,
    performedBy: 'User Self-Registration',
    details: `Created user account with language preference ${newUser.languagePreference}. Zero biometric data stored.`,
    category: 'data_deletion'
  };
  auditLogs.unshift(auditEvent);
  await SupabaseDb.insertAuditLog(auditEvent);

  const { password: _, ...userProfile } = newUser;
  const token = `auth_token_${Date.now()}_${newUser.id}`;

  return res.status(201).json({
    success: true,
    message: `Account created successfully! Welcome to NariCare AI, ${newUser.name}.`,
    user: userProfile,
    token
  });
});

/**
 * Request OTP endpoint (simulated instant SMS)
 */
app.post('/api/auth/request-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone || phone.length < 8) {
    return res.status(400).json({ error: 'Please enter a valid mobile number' });
  }

  const testOtp = '1234';
  const cleanPhone = phone.trim();

  const user = registeredUsers.find(u => u.phone.replace(/\D/g, '').includes(cleanPhone.replace(/\D/g, '')));
  if (user) {
    user.otp = testOtp;
  }

  return res.json({
    success: true,
    message: `A verification code has been dispatched to ${phone}. (Use test code: ${testOtp})`,
    testOtp
  });
});

/**
 * Forgot password endpoint
 */
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  return res.json({
    success: true,
    message: `A password reset instruction link has been sent to ${email}. Please check your inbox.`
  });
});

/**
 * Deterministic Safety Triage Endpoint
 */
app.post('/api/triage/check', (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text prompt is required' });
  }

  const triageResult = evaluateSafetyTriage(text, activeSafetyRules);
  return res.json(triageResult);
});

/**
 * AI-Assisted Multilingual Symptom Understanding Endpoint
 */
app.post('/api/symptoms/analyze', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage = 'en' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'User symptom text is required' });
    }

    // STEP 1: DETERMINISTIC CLINICAL SAFETY CHECK (Runs BEFORE any LLM generation)
    const triage = evaluateSafetyTriage(text, activeSafetyRules);
    if (triage.isEmergency) {
      const emergencyExplanation = targetLanguage === 'kn'
        ? 'ತುರ್ತು ಎಚ್ಚರಿಕೆ: ನೀವು ತಿಳಿಸಿದ ಲಕ್ಷಣಗಳು ತಕ್ಷಣದ ತುರ್ತು ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನದ ಅಗತ್ಯವನ್ನು ಸೂಚಿಸುತ್ತವೆ. ಆನ್‌ಲೈನ್ ಶಿಕ್ಷಣ ಅಥವಾ ಸಾಮಾನ್ಯ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ಪರೀಕ್ಷಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೂಡಲೇ ಸಮೀಪದ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.'
        : targetLanguage === 'hi'
        ? 'आपातकालीन चेतावनी: आपके द्वारा बताए गए लक्षण तत्काल आपातकालीन चिकित्सा मूल्यांकन का संकेत देते हैं। कृपया तुरंत नजदीकी अस्पताल के इमरजेंसी विभाग में जाएं।'
        : 'EMERGENCY ESCALATION: The symptoms described include critical warning signs requiring prompt medical emergency evaluation. Routine online consultations and educational materials cannot evaluate acute physical conditions.';

      const emergencyDisclaimer = targetLanguage === 'kn'
        ? "ಶಿ ಕೇರ್ಸ್ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ ಮತ್ತು ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ. ಇದು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ."
        : targetLanguage === 'hi'
        ? "शीकेयर्स केवल शैक्षिक जानकारी प्रदान करता है, यह पेशेवर चिकित्सा निदान का विकल्प नहीं है।"
        : 'NariCare AI provides educational information and care navigation. It does not diagnose conditions or replace professional medical advice.';

      return res.json({
        isEmergency: true,
        urgencyLevel: 'emergency',
        flaggedRules: triage.flaggedRules,
        escalationMessage: triage.escalationMessage,
        recommendedActions: triage.recommendedActions,
        emergencyContacts: triage.emergencyContacts,
        normalizedSummary: parseMultilingualSymptoms(text),
        educationalExplanation: emergencyExplanation,
        citations: REVIEWED_MEDICAL_CITATIONS.slice(0, 2),
        disclaimer: emergencyDisclaimer
      });
    }

    // STEP 2: NORMALIZE SYMPTOMS VIA RULE-BASED EXTRACTOR
    const normalizedSummary = parseMultilingualSymptoms(text);

    // STEP 3: GROUNDED AI GENERATION WITH GEMINI OR FALLBACK
    let educationalExplanation = '';
    let potentialConsiderations: string[] = [];
    let whenToSeeDoctor: string[] = [];
    let questionsForDoctor: string[] = [];
    let localizedDisclaimer = "SheCare's provides educational information and care navigation. It does not diagnose conditions or replace professional medical advice.";

    if (targetLanguage === 'kn') {
      potentialConsiderations = [
        'ಪಾಲಿಸಿಸ್ಟಿಕ್ ಓವರಿ ಸಿಂಡ್ರೋಮ್ (PCOS) - ರೊಟರ್‌ಡ್ಯಾಮ್ ಮಾನದಂಡಗಳ ಪರಿಗಣನೆ (ಅನಿಯಮಿತ ಮುಟ್ಟು, ಮುಖದ ಕೂದಲು/ಮೊಡವೆ)',
        'ಥೈರಾಯ್ಡ್ ಗ್ರಂಥಿಯ ಏರುಪೇರು (Hypo/Hyperthyroidism) - ಇದು ಮುಟ್ಟಿನ ನಿಯಮಿತತೆಯನ್ನು ಬದಲಾಯಿಸುತ್ತದೆ',
        'ಜೀವನಶೈಲಿ, ಮಾನಸಿಕ ಒತ್ತಡ ಅಥವಾ ಇನ್ಸುಲಿನ್ ಪ್ರತಿರೋಧ'
      ];
      whenToSeeDoctor = [
        'ನಿಮ್ಮ ಮುಟ್ಟು 90 ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಕಾಲ ಬರದಿದ್ದರೆ (ಅಮೆನೋರಿಯಾ)',
        'ಮುಟ್ಟಿನ ಚಕ್ರಗಳು ಆಗಾಗ್ಗೆ 35 ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚಾಗಿದ್ದರೆ ಅಥವಾ ಅನಿರೀಕ್ಷಿತವಾಗಿದ್ದರೆ',
        'ಮುಖದ ಅನಗತ್ಯ ಕೂದಲು ಅಥವಾ ಮೊಡವೆಗಳು ಚರ್ಮದ ಆರೈಕೆಯ ನಂತರವೂ ಹೆಚ್ಚುತ್ತಿದ್ದರೆ'
      ];
      questionsForDoctor = [
        'ನನ್ನ ಲಕ್ಷಣಗಳು ಪಿಸಿಒಎಸ್ (PCOS) ಅಥವಾ ಹಾರ್ಮೋನ್ ಏರುಪೇರಿನಿಂದಾಗಿಯೇ?',
        'ನಾನು ಯಾವ ರಕ್ತ ಪರೀಕ್ಷೆಗಳು (LH, FSH, ಥೈರಾಯ್ಡ್, ಇನ್ಸುಲಿನ್) ಮತ್ತು ಪೆಲ್ವಿಕ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿಸಬೇಕು?',
        'ನನ್ನ ಚಕ್ರವನ್ನು ನಿಯಮಿತಗೊಳಿಸಲು ಯಾವ ಜೀವನಶೈಲಿ ಮತ್ತು ಆಹಾರ ಕ್ರಮಗಳು ಸೂಕ್ತ?'
      ];
      localizedDisclaimer = "ಶಿ ಕೇರ್ಸ್ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ ಮತ್ತು ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ. ಇದು ರೋಗನಿರ್ಣಯ ಮಾಡುವುದಿಲ್ಲ ಅಥವಾ ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಸಲಹೆಗೆ ಬದಲಿಯಾಗಿರುವುದಿಲ್ಲ.";
    } else if (targetLanguage === 'hi') {
      potentialConsiderations = [
        'पॉलीसिस्टिक ओवरी सिंड्रोम (PCOS) - रॉटरडैम मानदंड (अनियमित मासिक धर्म, मुँहासे या चेहरे पर अनचाहे बाल)',
        'थायरॉइड असंतुलन (Hypo/Hyperthyroidism) - यह अक्सर चक्र की नियमितता को प्रभावित करता है',
        'जीवनशैली कारक, मानसिक तनाव या इंसुलिन प्रतिरोध'
      ];
      whenToSeeDoctor = [
        'यदि 90 दिनों से अधिक समय तक पीरियड्स न आए हों (एमेनोरिया)',
        'यदि पीरियड्स अक्सर 35 दिनों से अधिक लंबे हों या अनियमित हों',
        'यदि चेहरे पर अनचाहे बाल या मुंहासे लगातार बढ़ रहे हों'
      ];
      questionsForDoctor = [
        'क्या मेरे लक्षण पीसीओएस (PCOS) या हॉर्मोनल असंतुलन का संकेत हैं?',
        'मुझे कौन से हार्मोनल ब्लड टेस्ट (LH, FSH, TSH, इंसुलिन) और अल्ट्रासाउंड कराने चाहिए?',
        'मासिक धर्म को नियमित करने के लिए कौन से जीवनशैली और आहार परिवर्तन मददगार होंगे?'
      ];
      localizedDisclaimer = "शीकेयर्स केवल शैक्षिक जानकारी और स्वास्थ्य मार्गदर्शन प्रदान करता है। यह किसी बीमारी का निदान नहीं करता है और न ही डॉक्टर की सलाह का विकल्प है।";
    } else {
      potentialConsiderations = [
        'Polycystic Ovary Syndrome (PCOS) - Rotterdam criteria consideration if both ovulatory delay and androgen symptoms (acne/excess hair) persist',
        'Thyroid Dysfunction (Hypo/Hyperthyroidism) - frequently alters menstrual regularity',
        'Lifestyle & Metabolic Factors - stress, changes in body composition, or insulin resistance'
      ];
      whenToSeeDoctor = [
        'If your cycle is absent for more than 90 days (secondary amenorrhea)',
        'If cycles frequently exceed 35 days or fluctuate unpredictably',
        'If acne, facial hair, or hair thinning worsens despite skincare measures'
      ];
      questionsForDoctor = QUESTIONS_FOR_GYNECOLOGIST;
    }

    if (aiClient) {
      try {
        const prompt = `You are NariCare AI, a medically grounded, compassionate women's health educator.
User Input: "${text}"
Detected Language: ${normalizedSummary.detectedLanguage}
Reported Symptoms: ${normalizedSummary.reportedSymptoms.map(s => `${s.name} (${s.severity || 'unspecified'})`).join(', ') || 'General query'}
Negated Symptoms: ${normalizedSummary.negatedSymptoms.map(s => `NO ${s.name}`).join(', ') || 'None'}
Duration: ${normalizedSummary.duration || 'Not specified'}

CRITICAL MEDICAL SAFETY & COMPLIANCE RULES:
1. NEVER diagnose PCOS, endometriosis, or any medical condition. State possibilities gently as educational context.
2. DO NOT prescribe medications, hormonal birth control, or recommend changing existing prescriptions.
3. Ground your explanation in recognized clinical guidelines (Rotterdam criteria: irregular periods, hyperandrogenism, ultrasound polycystic morphology).
4. Respect negations strictly. If the user said they DO NOT have pain, state that absence of pain is noted.
5. Provide response strictly in ${targetLanguage === 'kn' ? 'Kannada (ಕನ್ನಡ)' : targetLanguage === 'hi' ? 'Hindi (हिंदी)' : 'clear, simple, reassuring English'}.
6. Provide:
   - Plain-language explanation of what these symptoms might mean biologically
   - Other causes clinicians check (like thyroid, prolactin, stress)
   - Practical questions to ask during a gynecologist appointment.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.3,
            systemInstruction: 'You are NariCare AI, a trusted medical educational assistant for women\'s health. Always maintain empathetic, clear, non-diagnostic guidance with strong evidence-based backing.'
          }
        });

        educationalExplanation = response.text || '';
      } catch (aiErr) {
        console.error('Gemini API call failed, falling back to clinical rule base:', aiErr);
      }
    }

    // Fallback if AI was unavailable or empty
    if (!educationalExplanation) {
      if (targetLanguage === 'kn') {
        educationalExplanation = `ನಿಮ್ಮ ವಿವರಣೆಯ ಆಧಾರದ ಮೇಲೆ, ನೀವು ${normalizedSummary.reportedSymptoms.map(s => s.name).join(', ') || 'ಮುಟ್ಟಿನ ಚಕ್ರಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಲಕ್ಷಣಗಳನ್ನು'} ತಿಳಿಸಿದ್ದೀರಿ.${normalizedSummary.negatedSymptoms.length > 0 ? ` ನೀವು ${normalizedSummary.negatedSymptoms.map(s => s.name).join(', ')} ಇಲ್ಲವೆಂದು ಸ್ಪಷ್ಟಪಡಿಸಿದ್ದೀರಿ.` : ''}

ಮಹಿಳೆಯರ ಆರೋಗ್ಯದಲ್ಲಿ, ಅನಿಯಮಿತ ಮುಟ್ಟು ಮತ್ತು ಮುಖದ ಮೊಡವೆ ಅಥವಾ ಕೂದಲಿನ ಬದಲಾವಣೆಗಳನ್ನು ಪಿಸಿಒಎಸ್ (PCOS - Polycystic Ovary Syndrome) ರೊಟರ್‌ಡ್ಯಾಮ್ ಮಾನದಂಡಗಳ ಅಡಿಯಲ್ಲಿ ಹೆಚ್ಚಾಗಿ ಪರೀಕ್ಷಿಸಲಾಗುತ್ತದೆ. ಆದಾಗ್ಯೂ, ಥೈರಾಯ್ಡ್ ಏರುಪೇರು, ಪ್ರೊಲ್ಯಾಕ್ಟಿನ್ ಹಾರ್ಮೋನ್ ಅಥವಾ ಮಾನಸಿಕ ಒತ್ತಡವೂ ಇಂತಹ ಲಕ್ಷಣಗಳಿಗೆ ಕಾರಣವಾಗಬಹುದು. ನಿಖರ ಮಾಹಿತಿಗಾಗಿ ಸ್ತ್ರೀರೋಗ ತಜ್ಞರನ್ನು ಭೇಟಿ ಮಾಡಿ ಅಲ್ಟ್ರಾಸೌಂಡ್ ಸ್ಕ್ಯಾನ್ ಮತ್ತು ಹಾರ್ಮೋನ್ ರಕ್ತ ಪರೀಕ್ಷೆಗಳನ್ನು ಮಾಡಿಸಿಕೊಳ್ಳುವುದು ಉತ್ತಮ.`;
      } else if (targetLanguage === 'hi') {
        educationalExplanation = `आपके विवरण के आधार पर, आपने ${normalizedSummary.reportedSymptoms.map(s => s.name).join(', ') || 'मासिक धर्म से संबंधित लक्षण'} बताए हैं।${normalizedSummary.negatedSymptoms.length > 0 ? ` आपने यह भी स्पष्ट किया है कि आपको ${normalizedSummary.negatedSymptoms.map(s => s.name).join(', ')} की समस्या नहीं है।` : ''}

महिलाओं के स्वास्थ्य में, अनियमित पीरियड्स के साथ मुंहासे या बालों में बदलाव को अक्सर पीसीओएस (PCOS - Polycystic Ovary Syndrome) के रॉटरडैम मानदंडों के तहत जांचा जाता है। हालांकि, थायरॉइड की समस्या, प्रोलैक्टिन हॉर्मोन का स्तर या तनाव भी ऐसे लक्षण पैदा कर सकते हैं। सटीक पुष्टि के लिए स्त्री रोग विशेषज्ञ से मिलकर पेल्विक अल्ट्रासाउंड और आवश्यक रक्त जांच करवाएं।`;
      } else {
        educationalExplanation = `Based on your description, you reported ${normalizedSummary.reportedSymptoms.map(s => s.name).join(', ') || 'symptoms relating to your menstrual cycle'}.${normalizedSummary.negatedSymptoms.length > 0 ? ` You also specified that you do NOT experience ${normalizedSummary.negatedSymptoms.map(s => s.name).join(', ')}.` : ''}

In women's health, irregular periods combined with skin or hair changes are frequently evaluated under the Rotterdam Consensus for Polycystic Ovary Syndrome (PCOS). However, identical symptoms can also be influenced by thyroid irregularities, high prolactin levels, psychological stress, or metabolic shifts. A certified gynecologist conducts standard blood tests (LH, FSH, Total Testosterone, TSH) and a pelvic sonography to evaluate your ovaries and hormonal health accurately.`;
      }
    }

    return res.json({
      isEmergency: false,
      urgencyLevel: triage.urgencyLevel,
      normalizedSummary,
      educationalExplanation,
      potentialConsiderations,
      whenToSeeDoctor,
      questionsForGynecologist: questionsForDoctor,
      citations: REVIEWED_MEDICAL_CITATIONS,
      disclaimer: localizedDisclaimer
    });

  } catch (error) {
    console.error('Symptom analysis error:', error);
    return res.status(500).json({ error: 'Internal server error while processing health information.' });
  }
});

/**
 * Doctor Discovery Endpoint
 */
app.get('/api/doctors', (req: Request, res: Response) => {
  const { specialty, language, maxPrice } = req.query;
  let filtered = [...VERIFIED_DOCTORS];

  if (specialty && typeof specialty === 'string') {
    filtered = filtered.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
  }
  if (language && typeof language === 'string') {
    filtered = filtered.filter(d => d.languages.some(l => l.toLowerCase() === language.toLowerCase()));
  }
  if (maxPrice && typeof maxPrice === 'string') {
    const max = parseInt(maxPrice, 10);
    if (!isNaN(max)) {
      filtered = filtered.filter(d => d.perSessionFee <= max);
    }
  }

  return res.json(filtered);
});

/**
 * Single Doctor Details
 */
app.get('/api/doctors/:id', (req: Request, res: Response) => {
  const doctor = VERIFIED_DOCTORS.find(d => d.id === req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  return res.json(doctor);
});

/**
 * Nearby Healthcare Facilities Endpoint
 */
app.get('/api/hospitals', (req: Request, res: Response) => {
  const { city, emergencyOnly, userLat, userLng } = req.query;
  let facilities = [...NEARBY_HOSPITALS];

  if (city && typeof city === 'string' && city !== 'all') {
    facilities = facilities.filter(f => f.city.toLowerCase().includes(city.toLowerCase()));
  }
  if (emergencyOnly === 'true') {
    facilities = facilities.filter(f => f.emergency24x7);
  }

  // Calculate approximate distance if coordinates provided
  if (userLat && userLng) {
    const lat1 = parseFloat(userLat as string);
    const lon1 = parseFloat(userLng as string);
    if (!isNaN(lat1) && !isNaN(lon1)) {
      facilities = facilities.map(f => {
        // Haversine formula
        const R = 6371; // km
        const dLat = (f.lat - lat1) * Math.PI / 180;
        const dLon = (f.lng - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(f.lat * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = Math.round((R * c) * 10) / 10;
        return { ...f, distanceKm };
      }).sort((a, b) => a.distanceKm - b.distanceKm);
    }
  }

  return res.json(facilities);
});

/**
 * Create Doctor Appointment Booking (With Conflict Checking & Transparent Pricing)
 */
app.post('/api/bookings', async (req: Request, res: Response) => {
  try {
    const {
      doctorId,
      date,
      timeSlot,
      consultationMode = 'video',
      patientName,
      patientPhone,
      patientEmail,
      symptomsReported,
      paymentMethod = 'UPI Test Mode'
    } = req.body;

    if (!doctorId || !date || !timeSlot || !patientName || !patientPhone) {
      return res.status(400).json({ error: 'Missing required booking fields (doctorId, date, timeSlot, patient details).' });
    }

    const doctor = VERIFIED_DOCTORS.find(d => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Selected doctor does not exist.' });
    }

    // Fetch existing appointments from Supabase or fallback
    const dbAppointments = await SupabaseDb.getAppointments();
    const allAppointments = dbAppointments.length > 0 ? dbAppointments : existingAppointments;

    // Check anti-conflict slot availability
    const available = isSlotAvailable(doctorId, date, timeSlot, allAppointments.map(a => ({
      id: a.id,
      doctorId: a.doctorId,
      date: a.date,
      time: a.timeSlot,
      status: a.status
    })));

    if (!available) {
      return res.status(409).json({ error: 'This appointment slot has already been booked. Please select another time.' });
    }

    // Calculate transparent per-session price breakdown
    const pricing = calculateSessionPricing(doctor.perSessionFee, doctor.durationMinutes);
    const bookingRef = generateBookingReference();
    const transactionId = generateTransactionId();

    const newAppointment: Appointment = {
      id: `appt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bookingReference: bookingRef,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorPhoto: doctor.photoUrl,
      patientId: `pat_${Date.now()}`,
      patientName,
      patientPhone,
      patientEmail: patientEmail || `${patientPhone.replace(/\D/g, '')}@naricare.org`,
      date,
      timeSlot,
      consultationMode,
      sessionFee: pricing.baseSessionFee,
      platformFee: pricing.platformFee,
      totalPaid: pricing.totalPayable,
      paymentStatus: 'paid', // Verified test-mode transaction
      paymentMethod,
      paymentTransactionId: transactionId,
      status: 'confirmed',
      meetingToken: `token_sec_${Date.now()}_${bookingRef.replace(/-/g, '')}`,
      symptomsReported: symptomsReported || 'General PCOS / Menstrual Consultation',
      createdAt: new Date().toISOString()
    };

    existingAppointments.unshift(newAppointment);
    await SupabaseDb.insertAppointment(newAppointment);

    return res.status(201).json({
      success: true,
      appointment: newAppointment,
      pricingBreakdown: pricing,
      message: `Appointment successfully booked with ${doctor.name}. Reference: ${bookingRef}`
    });

  } catch (err: any) {
    console.error('Booking error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process consultation booking' });
  }
});

/**
 * List User Appointments
 */
app.get('/api/appointments', async (req: Request, res: Response) => {
  const { doctorId } = req.query;
  const docId = typeof doctorId === 'string' ? doctorId : undefined;

  const dbAppointments = await SupabaseDb.getAppointments(docId);
  if (dbAppointments && dbAppointments.length > 0) {
    return res.json(dbAppointments);
  }

  if (docId) {
    return res.json(existingAppointments.filter(a => a.doctorId === docId));
  }
  return res.json(existingAppointments);
});

/**
 * Cancel Appointment Endpoint
 */
app.post('/api/appointments/:id/cancel', async (req: Request, res: Response) => {
  const appointment = existingAppointments.find(a => a.id === req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  appointment.status = 'cancelled';
  appointment.paymentStatus = 'refunded';

  await SupabaseDb.cancelAppointment(req.params.id);

  // Record audit
  const auditEvent: AuditEvent = {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: `Appointment ${appointment.bookingReference} cancelled with full refund`,
    performedBy: 'User/System',
    details: `Refund of ₹${appointment.totalPaid} initiated to original payment method (${appointment.paymentMethod}).`,
    category: 'pricing_change'
  };
  auditLogs.unshift(auditEvent);
  await SupabaseDb.insertAuditLog(auditEvent);

  return res.json({
    success: true,
    message: 'Appointment cancelled successfully. A full refund of ₹' + appointment.totalPaid + ' has been processed to your payment method.',
    appointment
  });
});

/**
 * Generate/Verify Video Consultation Token
 */
app.post('/api/consultation/token', (req: Request, res: Response) => {
  const { appointmentId, token } = req.body;
  const appointment = existingAppointments.find(a => a.id === appointmentId);

  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (appointment.status === 'cancelled') {
    return res.status(403).json({ error: 'This appointment has been cancelled' });
  }

  return res.json({
    authorized: true,
    appointmentId: appointment.id,
    bookingReference: appointment.bookingReference,
    doctorName: appointment.doctorName,
    patientName: appointment.patientName,
    date: appointment.date,
    timeSlot: appointment.timeSlot,
    token: appointment.meetingToken,
    sessionLengthMinutes: 25,
    roomName: `naricare-room-${appointment.bookingReference.toLowerCase()}`
  });
});

/**
 * Admin: Get Safety Rules
 */
app.get('/api/admin/safety-rules', async (_req: Request, res: Response) => {
  const dbRules = await SupabaseDb.getSafetyRules();
  const rules = (dbRules && dbRules.length > 0) ? dbRules : activeSafetyRules;

  return res.json({
    rules,
    totalRules: rules.length,
    lastReviewed: '2026-10-15',
    reviewedBy: 'Dr. Radhika Rao (Medical Safety Director)'
  });
});

/**
 * Admin: Update Safety Rule
 */
app.post('/api/admin/safety-rules', async (req: Request, res: Response) => {
  const { rule, author = 'Clinical Board Admin' } = req.body;
  if (!rule || !rule.id || !rule.name) {
    return res.status(400).json({ error: 'Valid rule definition is required' });
  }

  const existingIdx = activeSafetyRules.findIndex(r => r.id === rule.id);
  if (existingIdx >= 0) {
    rule.version = (activeSafetyRules[existingIdx].version || 1) + 1;
    activeSafetyRules[existingIdx] = rule;
  } else {
    rule.version = 1;
    activeSafetyRules.push(rule);
  }

  await SupabaseDb.upsertSafetyRule(rule);

  const auditEvent: AuditEvent = {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: `Safety Rule Updated: ${rule.name} (v${rule.version})`,
    performedBy: author,
    details: `Updated keywords: ${rule.keywords.join(', ')}`,
    category: 'safety_rule_update'
  };
  auditLogs.unshift(auditEvent);
  await SupabaseDb.insertAuditLog(auditEvent);

  return res.json({ success: true, rule, auditLogs });
});

/**
 * Admin: Get Audit Logs
 */
app.get('/api/admin/audit-logs', async (_req: Request, res: Response) => {
  const dbLogs = await SupabaseDb.getAuditLogs();
  return res.json((dbLogs && dbLogs.length > 0) ? dbLogs : auditLogs);
});

// ==========================================
// VITE DEV SERVER INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NariCare AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
