import { formatShortDate, formatTime } from "./format";

export type FallbackSlot = {
  startsAt: string;
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
};

export type FallbackSlotDaySpec = {
  dayOffset: number;
  hours: number[];
};

/**
 * Stand-in arrival times, generated relative to `from`. There is no slots
 * endpoint yet, and these are read as UTC by the availability check in
 * lib/clipper/data.ts — keep the times in UTC. The server still validates
 * the choice against the groomer's real schedule.
 */
export function buildFallbackSlots(from: Date, daySpecs: FallbackSlotDaySpec[]): FallbackSlot[] {
  const slots: FallbackSlot[] = [];
  for (const { dayOffset, hours } of daySpecs) {
    for (const hour of hours) {
      const start = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + dayOffset, hour, 0, 0));
      const startsAt = start.toISOString();
      slots.push({
        startsAt,
        dateKey: startsAt.slice(0, 10),
        dateLabel: formatShortDate(start),
        timeLabel: formatTime(start),
      });
    }
  }
  return slots;
}
