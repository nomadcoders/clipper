const seoulDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export type SampleSlot = { id: string; startsAt: string };

/**
 * /api/booking-options returns no slots yet, so offer sample arrival times at
 * 10:00 and 14:00 Seoul time on each of the next two days.
 */
export function buildSampleSlots(now = Date.now()): SampleSlot[] {
  return [1, 2].flatMap((daysAhead) => {
    const day = seoulDay.format(new Date(now + daysAhead * 86400000));
    return ["10:00", "14:00"].map((time) => ({
      id: `${day}-${time}`,
      startsAt: `${day}T${time}:00+09:00`,
    }));
  });
}
