/**
 * NariCare AI - Multilingual Symptom Parser & Normalizer
 * Extracts reported symptoms, respects negations, identifies duration/frequency/severity
 * in English, Kannada, Hindi, and transliterated Kannada/Hindi (Kanglish/Hinglish).
 */

export interface ExtractedSymptom {
  name: string;
  category: 'menstrual' | 'dermatological' | 'metabolic' | 'pain' | 'mood';
  isNegated: boolean;
  severity?: 'mild' | 'moderate' | 'severe';
  originalTerm: string;
}

export interface ParsedSymptomSummary {
  reportedSymptoms: ExtractedSymptom[];
  negatedSymptoms: ExtractedSymptom[];
  duration: string | null;
  frequency: string | null;
  detectedLanguage: 'en' | 'kn' | 'hi' | 'mixed';
  uncertaintyNotes: string[];
  missingInformation: string[];
}

// Symptom dictionary across English, Kannada, Hindi, and transliterations
interface SymptomDefinition {
  canonicalName: string;
  category: ExtractedSymptom['category'];
  terms: string[];
}

const SYMPTOM_DICTIONARY: SymptomDefinition[] = [
  {
    canonicalName: 'Irregular or Delayed Menstrual Cycles',
    category: 'menstrual',
    terms: [
      'irregular periods', 'delayed periods', 'late periods', 'missed period', 'amenorrhea',
      'cycle late', 'period illa', 'periods late agide', 'cycle sari illa', 'regular illa',
      'periods late ho rahe hai', 'period nahi aaya', 'cycle irregular', 'chhut gaya period',
      'ಮುಟ್ಟು ತಡವಾಗಿದೆ', 'ಮುಟ್ಟಿನ ಸಮಸ್ಯೆ', 'ಅನಿಯಮಿತ ಮುಟ್ಟು', 'ತಿಂಗಳು ಸರಿಯಾಗಿಲ್ಲ', 'ಮುಟ್ಟು ಬಂದಿಲ್ಲ',
      'अनियमित मासिक धर्म', 'मासिक धर्म में देरी', 'पीरियड्स में देरी', 'माहवारी समस्या', 'अनियमित पीरियड्स'
    ]
  },
  {
    canonicalName: 'Acne / Facial Breakouts',
    category: 'dermatological',
    terms: [
      'acne', 'pimples', 'breakouts', 'cystic acne', 'skin breakouts',
      'mukhadalli pimples', 'pimples ide', 'mukha kuruhu',
      'chehre par daane', 'muhase', 'pimples ho rahe hai',
      'ಮುಖದಲ್ಲಿ ಮೊಡವೆ', 'ಮೊಡವೆಗಳು', 'ಕುರುಗಳು', 'ಮೊಡವೆ',
      'चेहरे पर मुँहासे', 'मुँहासे', 'पिंपल्स', 'मुहासे'
    ]
  },
  {
    canonicalName: 'Hirsutism / Excess Facial or Body Hair',
    category: 'dermatological',
    terms: [
      'facial hair', 'excess hair', 'chin hair', 'hirsutism', 'upper lip hair',
      'mukhadalli koodalu', 'chin mele hair', 'excess koodalu',
      'chehre par baal', 'anchahe baal', 'chin par baal',
      'ಮುಖದಲ್ಲಿ ಕೂದಲು', 'ಗಲ್ಲದಲ್ಲಿ ಕೂದಲು', 'ಅನಗತ್ಯ ಕೂದಲು',
      'चेहरे पर अनचाहे बाल', 'अनचाहे बाल', 'दाढ़ी मूंछ के बाल'
    ]
  },
  {
    canonicalName: 'Pelvic Pain or Cramping',
    category: 'pain',
    terms: [
      'pelvic pain', 'cramps', 'stomach pain', 'abdominal pain', 'period pain', 'dysmenorrhea',
      'hotte novu', 'novu ide', 'periods novu', 'bennu novu', 'novilla', 'hotte novilla',
      'pet me dard', 'kamar dard', 'periods ka dard', 'dard ho raha hai', 'dard nahi', 'koi dard nahi',
      'ಹೊಟ್ಟೆ ನೋವು', 'ಮುಟ್ಟಿನ ನೋವು', 'ತೀವ್ರ ನೋವು', 'ಕಿಬ್ಬೊಟ್ಟೆ ನೋವು', 'ನೋವು', 'ಹೊಟ್ಟೆ ನೋವಿಲ್ಲ', 'ನೋವಿಲ್ಲ',
      'पेट में दर्द', 'मासिक धर्म दर्द', 'पेल्विक दर्द', 'कष्टार्तव', 'दर्द', 'दर्द नहीं'
    ]
  },
  {
    canonicalName: 'Hair Fall / Scalp Hair Thinning',
    category: 'dermatological',
    terms: [
      'hair fall', 'hair loss', 'scalp thinning', 'hair shedding',
      'koodalu uduruttide', 'tumba hair loss',
      'baal jhad rahe hai', 'baal gir rahe hai', 'hair fall ho raha',
      'ಕೂದಲು ಉದುರುವಿಕೆ', 'ತಲೆ ಕೂದಲು ಉದುರುವುದು', 'ಕೂದಲು ಉದುರುತ್ತಿದೆ',
      'बाल झड़ना', 'बाल गिरना', 'गंजापन', 'बालों का झड़ना'
    ]
  },
  {
    canonicalName: 'Unexplained Weight Gain / Difficulty Losing Weight',
    category: 'metabolic',
    terms: [
      'weight gain', 'gaining weight', 'cant lose weight', 'belly fat',
      'tumba weight jasthi', 'weight increase agide',
      'vajan badh raha hai', 'weight gain ho raha', 'vajan kam nahi ho raha',
      'ತೂಕ ಹೆಚ್ಚಳ', 'ತೂಕ ಇಳಿಯುತ್ತಿಲ್ಲ', 'ತೂಕ ಹೆಚ್ಚಾಗಿದೆ',
      'वजन बढ़ना', 'वजन कम न होना', 'वजन बढ़ रहा है'
    ]
  },
  {
    canonicalName: 'Mood Fluctuations or Fatigue',
    category: 'mood',
    terms: [
      'mood swings', 'fatigue', 'extreme tiredness', 'anxiety', 'irritability',
      'tumba susthu', 'mood sariyagilla', 'tumba tired',
      'bahut thakan', 'chidchidapan', 'mood kharab',
      'ಸುಸ್ತು', 'ಆಯಾಸ', 'ಮನಸ್ಥಿತಿ ಬದಲಾವಣೆ', 'ಆತಂಕ',
      'थकान', 'सुस्ती', 'मूड बदलना', 'चिड़चिड़ापन'
    ]
  }
];

// Negation patterns in EN, KN, HI
const NEGATION_PATTERNS = [
  'no ', 'not ', 'never ', 'dont have ', 'do not have ', 'without ',
  'illa', 'agilla', 'baralla', 'kooda illa', 'novilla',
  'ಇಲ್ಲ', 'ಆಗಿಲ್ಲ', 'ಬಂದಿಲ್ಲ', 'ನೋವಿಲ್ಲ', 'ಸಮಸ್ಯೆ ಇಲ್ಲ',
  'nahi hai', 'nahi hota', 'nahi', 'kuch nahi', 'mat', 'koi dard nahi',
  'नहीं है', 'नहीं होता', 'नहीं', 'नही', 'कोई दर्द नहीं'
];

/**
 * Checks if a specific symptom match in the text is preceded or succeeded by a negation
 * Respects clause boundaries (e.g. 'par', 'but', 'adare', commas, 'ಮತ್ತು', 'ಆದರೆ', 'लेकिन')
 */
function isTermNegated(fullText: string, term: string): boolean {
  // Inherently negated terms (e.g. 'novilla', 'ನೋವಿಲ್ಲ', 'dard nahi', 'ಹೊಟ್ಟೆ ನೋವಿಲ್ಲ')
  if (
    term.includes('ಇಲ್ಲ') || term.includes('ವಿಲ್ಲ') || term.includes('illa') ||
    term.includes('nahi') || term.includes('नहीं') || term.includes('novilla')
  ) {
    return true;
  }

  const lower = fullText.toLowerCase();
  const idx = lower.indexOf(term.toLowerCase());
  if (idx === -1) return false;

  // Window before term - boundary check
  const beforeText = lower.substring(0, idx);
  const clauseDelimiters = /[,.;\n]|(?:\b(but|and|par|lekin|adare|mathu|or)\b)|(?:ಮತ್ತು|ಆದರೆ|ಆದ್ರೂ|ಆದರೂ|ಆದ್ರೆ|ಆದರೆ|ಆದ್ರು|ಆಗಲಿ|लेकिन|पर|और|किंतु)/g;
  
  let lastMatchBefore: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;
  while ((match = clauseDelimiters.exec(beforeText)) !== null) {
    lastMatchBefore = match;
  }
  const windowBefore = lastMatchBefore ? beforeText.substring(lastMatchBefore.index + lastMatchBefore[0].length) : beforeText;

  // Window after term - stop at next clause delimiter
  const afterText = lower.substring(idx + term.length);
  clauseDelimiters.lastIndex = 0;
  const firstMatchAfter = clauseDelimiters.exec(afterText);
  const windowAfter = firstMatchAfter ? afterText.substring(0, firstMatchAfter.index) : afterText;

  // Negations before the term
  const negatedBefore = [
    /\bno\b/, /\bnot\b/, /\bdont have\b/, /\bdo not have\b/, /\bwithout\b/,
    /\bnahi\b/, /नहीं/, /नही/
  ].some(pattern => pattern.test(windowBefore));

  // Negations after the term
  const negatedAfter = [
    /\billa\b/, /\bagilla\b/, /\bbaralla\b/, /\bnahi hai\b/, /\bnahi hota\b/, /\bnahi\b/,
    /ಇಲ್ಲ/, /ಆಗಿಲ್ಲ/, /ಬಂದಿಲ್ಲ/, /ನೋವಿಲ್ಲ/, /ಸಮಸ್ಯೆ ಇಲ್ಲ/,
    /नहीं है/, /नहीं होता/, /नहीं/, /नही/
  ].some(pattern => pattern.test(windowAfter));

  // Dedicated pain negation check: 'ನೋವಿಲ್ಲ' or 'novilla' directly negates pain
  const isPainTerm = term.includes('novu') || term.includes('pain') || term.includes('dard') || term.includes('ನೋವು') || term.includes('दर्द');
  if (isPainTerm) {
    if (fullText.includes('ನೋವಿಲ್ಲ') || fullText.includes('novilla') || fullText.includes('dard nahi') || fullText.includes('दर्द नहीं')) {
      return true;
    }
  }

  return negatedBefore || negatedAfter;
}

/**
 * Detect language: English, Kannada, Hindi, or Mixed
 */
export function detectLanguage(text: string): 'en' | 'kn' | 'hi' | 'mixed' {
  const hasKannadaScript = /[\u0C80-\u0CFF]/.test(text);
  const hasDevanagariScript = /[\u0900-\u097F]/.test(text);

  if (hasKannadaScript && !hasDevanagariScript) return 'kn';
  if (hasDevanagariScript && !hasKannadaScript) return 'hi';

  // Check transliterated markers
  const lower = text.toLowerCase();
  const knTranslit = ['nanage', 'ide', 'illa', 'agide', 'tumba', 'sari', 'novu', 'koodalu', 'madabeku'];
  const hiTranslit = ['mujhe', 'mera', 'hai', 'nahi', 'bahut', 'dard', 'baal', 'karein', 'hote'];

  const knScore = knTranslit.filter(w => lower.includes(w)).length;
  const hiScore = hiTranslit.filter(w => lower.includes(w)).length;

  if (knScore > 0 && hiScore > 0) return 'mixed';
  if (knScore > 0) return 'kn';
  if (hiScore > 0) return 'hi';

  return 'en';
}

/**
 * Parses user input text into structured symptom data
 */
export function parseMultilingualSymptoms(userInput: string): ParsedSymptomSummary {
  const text = (userInput || '').trim();
  const lower = text.toLowerCase();
  const reported: ExtractedSymptom[] = [];
  const negated: ExtractedSymptom[] = [];

  const lang = detectLanguage(text);

  for (const def of SYMPTOM_DICTIONARY) {
    for (const term of def.terms) {
      if (lower.includes(term.toLowerCase())) {
        const isNeg = isTermNegated(lower, term);

        // Check severity words nearby
        let severity: ExtractedSymptom['severity'] = 'moderate';
        if (lower.includes('severe') || lower.includes('tumba') || lower.includes('bahut') || lower.includes('extreme')) {
          severity = 'severe';
        } else if (lower.includes('mild') || lower.includes('swalpa') || lower.includes('thoda') || lower.includes('slight')) {
          severity = 'mild';
        }

        const item: ExtractedSymptom = {
          name: def.canonicalName,
          category: def.category,
          isNegated: isNeg,
          severity,
          originalTerm: term
        };

        if (isNeg) {
          if (!negated.some(n => n.name === item.name)) negated.push(item);
        } else {
          if (!reported.some(r => r.name === item.name)) reported.push(item);
        }
        break; // Match once per canonical definition
      }
    }
  }

  // Duration extraction regexes (e.g. 3 months, 2 varsha, 6 mahine)
  let duration: string | null = null;
  const durationMatch = lower.match(/(\d+\s*(?:months?|weeks?|years?|days?|tingalu?|mahine?|saal?|varsha?))/);
  if (durationMatch) {
    duration = durationMatch[1];
  }

  // Missing info heuristics
  const missingInformation: string[] = [];
  if (!duration) {
    missingInformation.push('Duration of symptoms (e.g., how many weeks or months you have noticed this)');
  }
  if (!reported.some(s => s.category === 'menstrual')) {
    missingInformation.push('Date or regularity of your last menstrual period (LMP)');
  }

  const uncertaintyNotes: string[] = [];
  if (reported.length === 0 && text.length > 5) {
    uncertaintyNotes.push('No recognized clinical symptom terms directly matched. You can describe in more detail or use colloquial words.');
  }

  return {
    reportedSymptoms: reported,
    negatedSymptoms: negated,
    duration,
    frequency: lower.includes('daily') || lower.includes('pratidina') || lower.includes('roz') ? 'Daily' : 'Intermittent',
    detectedLanguage: lang,
    uncertaintyNotes,
    missingInformation
  };
}
