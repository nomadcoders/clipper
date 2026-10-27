const TIME_ZONE = "Asia/Seoul";

export type DateInput = Date | number | string | null | undefined;

function toDate(value: DateInput) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

/** Seoul calendar day as YYYY-MM-DD, for grouping slots by day. */
export function getDateKey(value: DateInput) {
  const date = toDate(value);
  return date ? dateKeyFormatter.format(date) : null;
}

/** e.g. "Fri, Aug 21" (short) or "Friday, August 21, 2026" (long), in Seoul time. */
export function formatDate(value: DateInput, style: "short" | "long" | "long-no-year" = "short") {
  const date = toDate(value);
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: style === "short" ? "short" : "long",
    month: style === "short" ? "short" : "long",
    day: "numeric",
    ...(style === "long" ? { year: "numeric" } : {}),
  }).format(date);
}

/** e.g. "10:00 AM", in Seoul time. */
export function formatTime(value: DateInput) {
  const date = toDate(value);
  return date ? timeFormatter.format(date) : null;
}

/** e.g. "Fri, Aug 21 · 10:00 AM", in Seoul time. */
export function formatDateTime(value: DateInput) {
  const date = formatDate(value);
  const time = formatTime(value);
  return date && time ? `${date} · ${time}` : null;
}

export function formatMoney(cents: number) {
  return `₩${cents.toLocaleString("ko-KR")}`;
}
