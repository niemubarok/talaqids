/**
 * Determinisic cycle calculation based on Ustaz Adi Hidayat's 30-month Quran method.
 * Pure functions with zero side-effects.
 */

export interface CycleStatus {
  totalDays: number;
  currentMonth: number;
  currentJuz: number;
  dayInCurrentCycle: number;
  daysRemainingInMonth: number;
  isConsolidationPhase: boolean; // true if age > 30 months (post 30 juz initial cycle)
  isManuallyOverridden: boolean;
}

/**
 * Calculates current cycle status deterministically.
 * @param startDateStr Date child was born or custom start date in YYYY-MM-DD
 * @param manualJuzOverride Optional manual override for Juz (1-30)
 * @param targetDateStr Reference date (defaults to current date)
 */
export function calculateCycleStatus(
  startDateStr: string,
  manualJuzOverride?: number | null,
  targetDateStr = new Date().toISOString()
): CycleStatus {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  
  // Set both to start of day in UTC for deterministic day difference
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  
  const diffTime = targetUtc - startUtc;
  const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const currentMonth = Math.floor(totalDays / 30) + 1;
  const dayInCurrentCycle = (totalDays % 30) + 1;
  const daysRemainingInMonth = Math.max(0, 30 - dayInCurrentCycle);
  const isConsolidationPhase = currentMonth > 30;

  // Active Juz mapping (1 to 30)
  const autoJuz = isConsolidationPhase
    ? ((currentMonth - 1) % 30) + 1
    : Math.min(30, currentMonth);

  const isManuallyOverridden = typeof manualJuzOverride === 'number' && manualJuzOverride >= 1 && manualJuzOverride <= 30;
  const currentJuz = isManuallyOverridden ? manualJuzOverride : autoJuz;

  return {
    totalDays,
    currentMonth,
    currentJuz,
    dayInCurrentCycle,
    daysRemainingInMonth,
    isConsolidationPhase,
    isManuallyOverridden,
  };
}

/**
 * Human-friendly age helper from birth date
 */
export function formatChildAge(birthDateStr: string, targetDate = new Date()): string {
  const birth = new Date(birthDateStr);
  let months = (targetDate.getFullYear() - birth.getFullYear()) * 12 + (targetDate.getMonth() - birth.getMonth());
  if (targetDate.getDate() < birth.getDate()) {
    months -= 1;
  }
  
  if (months < 0) return 'Baru Lahir';
  if (months < 1) {
    const days = Math.max(0, Math.floor((targetDate.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)));
    return `${days} Hari`;
  }
  if (months < 12) {
    return `${months} Bulan`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0 ? `${years} Tahun ${remainingMonths} Bulan` : `${years} Tahun`;
}
