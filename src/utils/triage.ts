/**
 * NariCare AI - Safety Triage Engine
 * Clinician-reviewed warning-sign checklist & deterministic triage rules.
 * This runs BEFORE any routine AI generation.
 */

export interface SafetyRule {
  id: string;
  name: string;
  category: 'gynecological_emergency' | 'obstetric_emergency' | 'severe_systemic';
  keywords: string[];
  description: string;
  urgentAction: string;
  severity: 'emergency' | 'urgent';
  version: number;
}

export interface TriageResult {
  isEmergency: boolean;
  urgencyLevel: 'emergency' | 'timely' | 'routine';
  flaggedRules: SafetyRule[];
  escalationMessage: string | null;
  recommendedActions: string[];
  emergencyContacts: {
    label: string;
    number: string;
    description: string;
  }[];
}

// Clinician-reviewed baseline emergency rules
export const CLINICAL_SAFETY_RULES: SafetyRule[] = [
  {
    id: 'rule_severe_pelvic_pain',
    name: 'Sudden or Severe Pelvic/Abdominal Pain',
    category: 'gynecological_emergency',
    keywords: [
      'severe pain', 'sudden pain', 'severe pelvic pain', 'sudden severe',
      'unbearable pain', 'sharp pelvic pain', 'agonizing pain', 'extreme abdominal pain',
      'extreme pelvic pain', 'can not stand pain', 'cannot bear pain',
      'tumba novu', 'tumba hotte novu', 'bahut tez dard', 'sahansheel nahi hai',
      'ತೀವ್ರ ಹೊಟ್ಟೆ ನೋವು', 'ತೀವ್ರ ನೋವು', 'ಅಸಹನೀಯ ನೋವು', 'ಅತಿಯಾದ ಹೊಟ್ಟೆ ನೋವು',
      'अत्यधिक पेट दर्द', 'तेज पेट दर्द', 'असहनीय दर्द', 'तीव्र पेल्विक दर्द'
    ],
    description: 'Sudden severe pelvic pain can indicate ovarian torsion, ruptured ovarian cyst, ectopic pregnancy, or acute pelvic inflammatory disease.',
    urgentAction: 'Immediate emergency room evaluation required. Do not delay or rely on routine online appointments.',
    severity: 'emergency',
    version: 1
  },
  {
    id: 'rule_fainting_syncope',
    name: 'Fainting, Dizziness, or Loss of Consciousness',
    category: 'severe_systemic',
    keywords: [
      'fainted', 'fainting', 'passed out', 'blackout', 'lost consciousness',
      'severe dizziness', 'behoshi', 'chakkar aakar gir gayi', 'tale tirugide', 'biddubitte',
      'ಪ್ರಜ್ಞೆ ತಪ್ಪಿದೆ', 'ತಲೆ ತಿರುಗಿ ಬಿದ್ದೆ', 'ಪ್ರಜ್ಞಾಹೀನ',
      'बेहोशी', 'चक्कर आना', 'बेहोश हो गई', 'होश खो बैठी'
    ],
    description: 'Syncope combined with pelvic symptoms or bleeding suggests hemodynamic instability or internal hemorrhage.',
    urgentAction: 'Urgent medical assessment at the nearest hospital emergency department.',
    severity: 'emergency',
    version: 1
  },
  {
    id: 'rule_hemorrhage_heavy_bleeding',
    name: 'Hemorrhage / Extremely Heavy Bleeding with Weakness',
    category: 'gynecological_emergency',
    keywords: [
      'soaking pad every hour', 'soaking pad an hour', 'large clots', 'golf ball clots',
      'bleeding heavily non stop', 'blood pouring', 'pale and weak',
      'bahut jyada bleeding', 'raktasrava', 'tumba blood hogtide',
      'ಅತಿಯಾದ ರಕ್ತಸ್ರಾವ', 'ರಕ್ತಸ್ರಾವ ನಿಲ್ಲುತ್ತಿಲ್ಲ', 'ದೊಡ್ಡ ರಕ್ತದ ಹೆಪ್ಪುಗಟ್ಟುವಿಕೆ',
      'अत्यधिक रक्तस्राव', 'खून बह रहा है', 'बहुत ज्यादा ब्लीडिंग', 'रक्त के थक्के'
    ],
    description: 'Soaking through one or more pads/tampons every hour for two consecutive hours or large clots with weakness suggests abnormal uterine hemorrhage.',
    urgentAction: 'Urgent in-person medical evaluation to prevent severe anemia or hypovolemia.',
    severity: 'emergency',
    version: 1
  },
  {
    id: 'rule_pregnancy_with_pain_bleeding',
    name: 'Possible Pregnancy with Pain or Bleeding',
    category: 'obstetric_emergency',
    keywords: [
      'pregnant with pain', 'pregnancy test positive bleeding', 'pregnant and bleeding',
      'pregnant severe cramps', 'garbhavati novu', 'garbh bleeding',
      'ಗರ್ಭಿಣಿ ರಕ್ತಸ್ರಾವ', 'ಗರ್ಭಿಣಿ ಹೊಟ್ಟೆ ನೋವು',
      'गर्भावस्था में दर्द', 'गर्भावस्था में रक्तस्राव', 'प्रेग्नेंट और ब्लीडिंग'
    ],
    description: 'Vaginal bleeding or one-sided pelvic pain in early pregnancy raises concern for ectopic pregnancy, a life-threatening emergency.',
    urgentAction: 'Immediate emergency ultrasound and clinical assessment for suspected ectopic pregnancy or miscarriage.',
    severity: 'emergency',
    version: 1
  }
];

export const EMERGENCY_CONTACTS = [
  { label: 'Emergency Services (India)', number: '112', description: 'National emergency response support system' },
  { label: 'Medical Ambulance', number: '108', description: 'Immediate emergency ambulance dispatch' },
  { label: 'Women Helpline', number: '181', description: '24/7 dedicated women health and safety helpline' }
];

/**
 * Deterministic Triage Evaluator
 * Runs synchronously across multilingual tokens and phrases
 */
export function evaluateSafetyTriage(inputText: string, activeRules: SafetyRule[] = CLINICAL_SAFETY_RULES): TriageResult {
  const normalizedText = (inputText || '').toLowerCase().trim();
  const flaggedRules: SafetyRule[] = [];

  for (const rule of activeRules) {
    const matched = rule.keywords.some(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      return normalizedText.includes(lowerKeyword);
    });

    if (matched) {
      flaggedRules.push(rule);
    }
  }

  const isEmergency = flaggedRules.some(r => r.severity === 'emergency');

  if (isEmergency) {
    return {
      isEmergency: true,
      urgencyLevel: 'emergency',
      flaggedRules,
      escalationMessage: 'Warning Signs Detected: Based on your description, this requires urgent in-person medical attention rather than educational advice or a routine teleconsultation.',
      recommendedActions: [
        'Go immediately to the nearest hospital emergency room or casualty ward.',
        'Contact emergency ambulance services (108 / 112) if you feel weak, dizzy, or unable to travel safely.',
        'Have a family member, partner, or companion accompany you.',
        'Do not take medications (like heavy painkillers or sedatives) without a doctor evaluating you first.'
      ],
      emergencyContacts: EMERGENCY_CONTACTS
    };
  }

  // Check for timely vs routine symptoms
  const timelyIndicators = [
    'missed period', 'no period for 3 months', 'irregular periods', 'facial hair',
    'excess hair', 'severe acne', 'hair loss', 'acanthosis', 'dark patches'
  ];
  const hasTimelyNeed = timelyIndicators.some(w => normalizedText.includes(w));

  return {
    isEmergency: false,
    urgencyLevel: hasTimelyNeed ? 'timely' : 'routine',
    flaggedRules: [],
    escalationMessage: null,
    recommendedActions: hasTimelyNeed ? [
      'Schedule a routine evaluation with a qualified gynecologist or endocrinologist.',
      'Maintain a 2-3 month symptom and cycle journal to share with your doctor.',
      'Discuss hormonal blood panels (LH, FSH, Free/Total Testosterone, TSH, Fasting Insulin) and pelvic ultrasound.'
    ] : [
      'Review educational guidelines on menstrual health and hormonal balance.',
      'Log symptoms in your health journal for regular pattern tracking.',
      'Seek clinical consultation if symptoms persist or interfere with your daily life.'
    ],
    emergencyContacts: EMERGENCY_CONTACTS
  };
}
