/**
 * Display formatters shared by every Clipper surface.
 *
 * All formatters are module-level `Intl` instances so they are built once per
 * isolate instead of once per render.
 */

const KRW = new Intl.NumberFormat("ko-KR");

const LONG_DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const LONG_DATE_NO_YEAR = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const TIME = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

type DateInput = Date | number | string | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function format(
  formatter: Intl.DateTimeFormat,
  value: DateInput,
  fallback: string,
) {
  const date = toDate(value);
  return date ? formatter.format(date) : fallback;
}

export function formatMoney(cents: number | null | undefined, fallback = "—") {
  return typeof cents === "number" ? `₩${KRW.format(cents)}` : fallback;
}

export function formatLongDate(value: DateInput, fallback = "—") {
  return format(LONG_DATE, value, fallback);
}

export function formatLongDateNoYear(value: DateInput, fallback = "—") {
  return format(LONG_DATE_NO_YEAR, value, fallback);
}

export function formatShortDate(value: DateInput, fallback = "—") {
  return format(SHORT_DATE, value, fallback);
}

export function formatTime(value: DateInput, fallback = "—") {
  return format(TIME, value, fallback);
}

export function formatDateTime(value: DateInput, fallback = "—") {
  const date = toDate(value);
  return date ? `${format(SHORT_DATE, date, fallback)} · ${format(TIME, date, fallback)}` : fallback;
}

export function formatTimeRange(start: DateInput, end: DateInput, fallback = "—") {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return fallback;
  return `${format(TIME, startDate, fallback)} – ${format(TIME, endDate, fallback)}`;
}
