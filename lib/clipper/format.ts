type DateInput = Date | number | string | null | undefined;
type DateStyle = "short" | "long" | "full";

const moneyFormatter = new Intl.NumberFormat("ko-KR");

const dateFormatters: Record<DateStyle, Intl.DateTimeFormat> = {
  short: new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }),
  long: new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }),
  full: new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
};
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});
const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toDate(value: DateInput) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatMoney(cents: number | null | undefined, fallback = "") {
  return typeof cents === "number"
    ? `₩${moneyFormatter.format(cents)}`
    : fallback;
}

export function formatDate(
  value: DateInput,
  style: DateStyle = "short",
  fallback = "",
) {
  const date = toDate(value);
  return date ? dateFormatters[style].format(date) : fallback;
}

export function formatTime(value: DateInput, fallback = "") {
  const date = toDate(value);
  return date ? timeFormatter.format(date) : fallback;
}

/** Local-timezone YYYY-MM-DD, for grouping slots by the day they display as. */
export function formatDateKey(value: DateInput, fallback = "") {
  const date = toDate(value);
  return date ? dateKeyFormatter.format(date) : fallback;
}
