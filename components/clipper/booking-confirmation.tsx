import { Check, Heart, Sparkles } from "lucide-react";

import { getStatusStyle } from "@/lib/clipper/status";
import type { AppointmentDetails } from "@/lib/clipper/types";

type BookingConfirmationProps = {
  appointment: AppointmentDetails;
};

type ConfirmationDetails = {
  reference?: string | null;
  bookingReference?: string;
  startsAt?: Date | number | string | null;
  status?: string | null;
  pet?: { name?: string | null } | null;
};

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function asDate(value: Date | number | string | null | undefined) {
  const date = value instanceof Date ? value : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function formatDate(value: Date | number | string | null | undefined) {
  const date = asDate(value);
  if (!date) return "your chosen day";
  return `${weekdays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function getCopy(details: ConfirmationDetails, petName: string) {
  const date = formatDate(details.startsAt);
  const startsAt = asDate(details.startsAt);
  const isPast = startsAt ? startsAt.getTime() < Date.now() : false;

  switch (details.status) {
    case "cancelled":
      return {
        heading: `${petName}’s visit was cancelled.`,
        body: "No charge was made. Book another visit whenever you’re ready.",
      };
    case "completed":
      return {
        heading: `${petName}’s visit is complete.`,
        body: `Thanks for choosing Clipper. We hope ${petName} enjoyed it on ${date}.`,
      };
    case "pending":
      return {
        heading: `We’re lining up ${petName}’s visit.`,
        body: `We’ll confirm your groomer for ${date} shortly.`,
      };
    case "confirmed":
      if (isPast) {
        return {
          heading: `${petName}’s visit was on ${date}.`,
          body: "Book another visit whenever you’re ready.",
        };
      }
      return {
        heading: `${petName} is on the books.`,
        body: `We’ll see you on ${date}. Your groomer will bring the good towels—and a little extra patience.`,
      };
    default:
      return {
        heading: `${petName}’s visit is booked.`,
        body: `We’ll see you on ${date}.`,
      };
  }
}

export function BookingConfirmation({ appointment }: BookingConfirmationProps) {
  const details = appointment as unknown as ConfirmationDetails;
  const petName = details.pet?.name ?? "your pet";
  const status = getStatusStyle(details.status);
  const StatusIcon = status.icon;
  const copy = getCopy(details, petName);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-(--bg-0a2540) px-5 py-8 text-white shadow-[0_28px_80px_rgba(10,37,64,0.24)] sm:px-8 sm:py-10">
      <div className="relative max-w-xl">
        <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-(--bg-ffffff) text-(--fg-635bff) shadow-sm">
          <StatusIcon aria-hidden="true" className="size-6" strokeWidth={3} />
        </div>
        <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-(--fg-80e9ff)">
          <Sparkles aria-hidden="true" className="size-3.5" /> {status.label}
        </p>
        <h1 className="max-w-lg text-4xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
          {copy.heading}
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-(--fg-adbdcc) sm:text-lg">
          {copy.body}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-(--fg-d6e2ec)">
          <span className="inline-flex items-center gap-2"><Heart aria-hidden="true" className="size-4 fill-current" /> Made for good pets</span>
          <span className="font-mono text-xs tracking-[0.14em] text-(--fg-80e9ff)">{details.reference ?? details.bookingReference ?? "CLP—"}</span>
        </div>
      </div>
    </section>
  );
}
