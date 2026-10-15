/**
 * NariCare AI - Menstrual Cycle Analytics & Doctor-Ready Summary Generator
 * Computes average cycle duration, variation, and formats clinical visit summaries.
 */

export interface CycleEntry {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  flowIntensity?: 'light' | 'medium' | 'heavy' | 'spotting';
  painScale?: number; // 0-10
  symptoms: string[];
  notes?: string;
}

export interface CycleAnalysis {
  totalLoggedCycles: number;
  averageCycleLengthDays: number | null;
  shortestCycleLength: number | null;
  longestCycleLength: number | null;
  isIrregular: boolean;
  irregularityWarning: string | null;
  topReportedSymptoms: { symptom: string; count: number }[];
  doctorDiscussionSummary: string;
}

/**
 * Calculates cycle length statistics between consecutive period start dates
 */
export function analyzeCycles(entries: CycleEntry[]): CycleAnalysis {
  // Sort chronological
  const sorted = [...entries].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  if (sorted.length < 2) {
    const symptomMap: Record<string, number> = {};
    for (const e of sorted) {
      for (const s of e.symptoms) {
        symptomMap[s] = (symptomMap[s] || 0) + 1;
      }
    }
    const topSymptoms = Object.entries(symptomMap)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalLoggedCycles: sorted.length,
      averageCycleLengthDays: null,
      shortestCycleLength: null,
      longestCycleLength: null,
      isIrregular: false,
      irregularityWarning: 'At least 2 consecutive period dates are required to calculate cycle intervals accurately.',
      topReportedSymptoms: topSymptoms,
      doctorDiscussionSummary: 'Initial journal data logged. Share these initial observations with your physician.'
    };
  }

  const cycleLengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].startDate);
    const currDate = new Date(sorted[i].startDate);
    const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    cycleLengths.push(diffDays);
  }

  const sum = cycleLengths.reduce((acc, curr) => acc + curr, 0);
  const avg = Math.round(sum / cycleLengths.length);
  const shortest = Math.min(...cycleLengths);
  const longest = Math.max(...cycleLengths);

  // Clinical definition: normal cycle is usually 21 to 35 days; variation > 8-10 days indicates irregularity (oligomenorrhea / polymenorrhea)
  const isIrregular = shortest < 21 || longest > 35 || (longest - shortest >= 9);

  let irregularityWarning: string | null = null;
  if (isIrregular) {
    irregularityWarning = `Noticeable variation detected: your cycle intervals range from ${shortest} to ${longest} days (average ~${avg} days). Cycles exceeding 35 days or highly fluctuating suggest ovulatory irregularity that warrants clinical evaluation.`;
  }

  // Symptom aggregation
  const symptomMap: Record<string, number> = {};
  for (const e of sorted) {
    for (const s of e.symptoms) {
      symptomMap[s] = (symptomMap[s] || 0) + 1;
    }
  }
  const topReportedSymptoms = Object.entries(symptomMap)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count);

  const doctorDiscussionSummary = [
    `Patient Menstrual Journal Summary (Generated via NariCare AI):`,
    `- Total Cycles Recorded: ${sorted.length}`,
    `- Average Cycle Interval: ${avg} days (Range: ${shortest} to ${longest} days)`,
    `- Irregularity Flag: ${isIrregular ? 'Yes (Oligomenorrhea / Variation > 9 days)' : 'Within typical range (21-35 days)'}`,
    `- Frequently Logged Symptoms: ${topReportedSymptoms.slice(0, 4).map(s => `${s.symptom} (${s.count}x)`).join(', ') || 'None recorded'}`,
    `- Notice: Cycle estimates are mathematical aids and do not constitute a clinical diagnosis.`
  ].join('\n');

  return {
    totalLoggedCycles: sorted.length,
    averageCycleLengthDays: avg,
    shortestCycleLength: shortest,
    longestCycleLength: longest,
    isIrregular,
    irregularityWarning,
    topReportedSymptoms,
    doctorDiscussionSummary
  };
}
