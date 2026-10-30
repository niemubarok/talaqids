---
name: cycle-math
description: Pure deterministic functions for calculating child age, current cycle month, and active Juz.
---

Ensure cycle calculation functions are deterministic, testable, and have zero side effects.

Reference implementation:

```typescript
export interface CycleStatus {
  totalDays: number;
  currentMonth: number;
  currentJuz: number;
  dayInCurrentCycle: number;
  daysRemainingInMonth: number;
  isConsolidationPhase: boolean; // true if age > 30 months
}

export function calculateCycleStatus(startDateStr: string, targetDateStr = new Date().toISOString()): CycleStatus {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  const diffTime = target.getTime() - start.getTime();
  const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const currentMonth = Math.floor(totalDays / 30) + 1;
  const dayInCurrentCycle = (totalDays % 30) + 1;
  const daysRemainingInMonth = 30 - dayInCurrentCycle;
  const isConsolidationPhase = currentMonth > 30;

  // Active Juz mapping (1 to 30)
  const currentJuz = isConsolidationPhase
    ? ((currentMonth - 1) % 30) + 1
    : currentMonth;

  return {
    totalDays,
    currentMonth,
    currentJuz,
    dayInCurrentCycle,
    daysRemainingInMonth,
    isConsolidationPhase,
  };
}
```