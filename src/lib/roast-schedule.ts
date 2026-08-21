export interface RoastScheduleCalculation {
  nextRoastDay: 'Monday' | 'Thursday';
  nextRoastDate: Date;
  dispatchDate: Date;
  hoursUntilCutoff: number;
  cutoffFormattedString: string;
  isRoastingToday: boolean;
  statusBadgeText: string;
}

/**
 * Calculates the next roast batch day and estimated dispatch date.
 * Roasting occurs every Monday and Thursday.
 * Monday roast order cutoff: Sunday 23:59
 * Thursday roast order cutoff: Wednesday 23:59
 * Dispatch occurs 1 business day post-roast (Tuesday for Monday batches, Friday for Thursday batches).
 */
export function calculateNextRoastBatch(
  currentDate: Date = new Date(),
  allowedRoastDays: ('Monday' | 'Thursday')[] = ['Monday', 'Thursday']
): RoastScheduleCalculation {
  const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const currentHour = currentDate.getHours();

  let targetRoastDay: 'Monday' | 'Thursday';
  let daysUntilRoast = 0;

  // If the coffee is only roasted on specific days (e.g. only Monday or only Thursday)
  if (allowedRoastDays.length === 1) {
    const onlyDay = allowedRoastDays[0];
    targetRoastDay = onlyDay;
    const targetDayIndex = onlyDay === 'Monday' ? 1 : 4;

    if (dayOfWeek === targetDayIndex && currentHour < 6) {
      daysUntilRoast = 0;
    } else {
      daysUntilRoast = (targetDayIndex - dayOfWeek + 7) % 7;
      if (daysUntilRoast === 0) daysUntilRoast = 7;
    }
  } else {
    // Both Monday & Thursday are available
    if (dayOfWeek === 0) {
      // Sunday -> Monday roast
      targetRoastDay = 'Monday';
      daysUntilRoast = 1;
    } else if (dayOfWeek === 1 && currentHour < 6) {
      // Early Monday morning -> Monday roast
      targetRoastDay = 'Monday';
      daysUntilRoast = 0;
    } else if (dayOfWeek === 1 || dayOfWeek === 2 || (dayOfWeek === 3 && currentHour < 24)) {
      // Monday after 6am, Tuesday, Wednesday -> Thursday roast
      targetRoastDay = 'Thursday';
      daysUntilRoast = (4 - dayOfWeek + 7) % 7;
    } else if (dayOfWeek === 4 && currentHour < 6) {
      // Early Thursday morning -> Thursday roast
      targetRoastDay = 'Thursday';
      daysUntilRoast = 0;
    } else {
      // Thursday after 6am, Friday, Saturday -> Next Monday roast
      targetRoastDay = 'Monday';
      daysUntilRoast = (1 - dayOfWeek + 7) % 7;
      if (daysUntilRoast === 0) daysUntilRoast = 7;
    }
  }

  const nextRoastDate = new Date(currentDate);
  nextRoastDate.setDate(currentDate.getDate() + daysUntilRoast);

  const dispatchDate = new Date(nextRoastDate);
  dispatchDate.setDate(nextRoastDate.getDate() + 1); // Dispatched next day post-QC

  const hoursUntilCutoff = Math.max(0, daysUntilRoast * 24 + (23 - currentHour));
  const isRoastingToday = daysUntilRoast === 0;

  const dispatchDayName = dispatchDate.toLocaleDateString('en-US', { weekday: 'long' });
  const cutoffFormattedString = isRoastingToday
    ? `Roasting today, dispatches ${dispatchDayName}`
    : `Roasting ${targetRoastDay}, dispatches ${dispatchDayName}`;

  return {
    nextRoastDay: targetRoastDay,
    nextRoastDate,
    dispatchDate,
    hoursUntilCutoff,
    cutoffFormattedString,
    isRoastingToday,
    statusBadgeText: `Fresh Roast: ${targetRoastDay}`,
  };
}

/**
 * Returns human readable degassing recommendations based on brew method and days.
 */
export function getDegasRecommendation(
  recommendedDays: { filter: number; espresso: number },
  isEspresso: boolean = false
): string {
  const days = isEspresso ? recommendedDays.espresso : recommendedDays.filter;
  return `Peak flavor achieved ${days} days post-roast date.`;
}
