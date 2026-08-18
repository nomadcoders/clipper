"use client";

import {
  CalendarDays,
  Check,
  Clock3,
  Dog,
  MapPin,
  Scissors,
  StickyNote,
  UserRound,
} from "lucide-react";

import type { AppointmentDetails } from "@/lib/clipper/types";

type AppointmentCardProps = {
  appointment: AppointmentDetails;
};

type DetailsForDisplay = {
  reference?: string | null;
  bookingReference?: string;
  address?: string | null;
  neighborhood?: string | null;
  startsAt?: Date | number | string | null;
  endsAt?: Date | number | string | null;
  status?: string | null;
  priceCents?: number | null;
  notes?: string | null;
  pet?: {
    name?: string | null;
    breed?: string | null;
  } | null;
  groomer?: { name?: string | null; bio?: string | null } | null;
  package?: {
    name?: string | null;
    description?: string | null;
    durationMinutes?: number | null;
  } | null;
  groomingPackage?: {
    name?: string | null;
    description?: string | null;
    durationMinutes?: number | null;
  } | null;
};

const statusLabels: Record<string, { label: string; className: string }> = {
  confirmed: {
    label: "Confirmed",
    className: "border-[#bfe8db] bg-[#e7f8f1] text-[#08775d]",
  },
  completed: {
    label: "Completed",
    className: "border-[#cbd8ff] bg-[#eef1ff] text-[#4353a3]",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-[#f3c4c0] bg-[#fff0ef] text-[#9f3f38]",
  },
  pending: {
    label: "Pending",
    className: "border-[#e4d5a3] bg-[#fff8dc] text-[#775d13]",
  },
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
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function formatDate(value: Date | number | string | null | undefined) {
  const date = asDate(value);
  if (!date || Number.isNaN(date.getTime())) return "Date to be confirmed";
  return `${weekdays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatTime(value: Date | number | string | null | undefined) {
  const date = asDate(value);
  if (!date || Number.isNaN(date.getTime())) return "Time to be confirmed";
  const hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, "0");
  const meridiem = hour >= 12 ? "PM" : "AM";
  const twelveHour = hour % 12 || 12;
  return `${twelveHour}:${minute} ${meridiem}`;
}

function formatPrice(priceCents: number | null | undefined) {
  if (typeof priceCents !== "number") return "Price to be confirmed";
  return `₩${priceCents.toLocaleString("ko-KR")}`;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const details = appointment as unknown as DetailsForDisplay;
  const service = details.package ?? details.groomingPackage;
  const status = statusLabels[details.status ?? ""] ?? {
    label: details.status ?? "Booked",
    className: "border-[#cbd8ff] bg-[#eef1ff] text-[#4353a3]",
  };
  const appointmentDate = formatDate(details.startsAt);
  const startTime = formatTime(details.startsAt);
  const endTime = formatTime(details.endsAt);
  const address = details.address ?? "Address to be confirmed";
  const neighborhood = details.neighborhood ? `, ${details.neighborhood}` : "";
  const petName = details.pet?.name ?? "Your pet";

  return (
    <section aria-labelledby="appointment-details-heading" className="overflow-hidden rounded-2xl border border-[#dbe3ef] bg-white shadow-[0_20px_60px_rgba(38,46,77,0.08)]">
      <div className="border-b border-[#e6ebf1] px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#635bff]">Your Clipper visit</p>
            <h2 id="appointment-details-heading" className="text-3xl font-bold leading-none tracking-[-0.04em] text-[#0a2540] sm:text-4xl">
              {petName}&apos;s appointment
            </h2>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}>
            <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
            {status.label}
          </span>
        </div>
      </div>

      <div className="grid gap-0 divide-y divide-[#e6ebf1] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-7">
          <DetailRow icon={<CalendarDays aria-hidden="true" />} label="When">
            <strong className="block font-semibold text-[#0a2540]">{appointmentDate}</strong>
            <span>{startTime} – {endTime}</span>
          </DetailRow>
          <DetailRow icon={<MapPin aria-hidden="true" />} label="Where">
            <strong className="block font-semibold text-[#0a2540]">At your home</strong>
            <span>{address}{neighborhood}</span>
          </DetailRow>
          <DetailRow icon={<Clock3 aria-hidden="true" />} label="Visit length">
            <strong className="block font-semibold text-[#0a2540]">{service?.durationMinutes ?? "—"} minutes</strong>
            <span>Our groomer brings everything</span>
          </DetailRow>
        </div>

        <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-7">
          <DetailRow icon={<Dog aria-hidden="true" />} label="Pet">
            <strong className="block font-semibold text-[#0a2540]">{petName}</strong>
            <span>{details.pet?.breed ?? "Breed not specified"}</span>
          </DetailRow>
          <DetailRow icon={<Scissors aria-hidden="true" />} label="Service">
            <strong className="block font-semibold text-[#0a2540]">{service?.name ?? "Grooming visit"}</strong>
            <span>{service?.description ?? "A thoughtful grooming visit, right at home."}</span>
          </DetailRow>
          <DetailRow icon={<UserRound aria-hidden="true" />} label="Your groomer">
            <strong className="block font-semibold text-[#0a2540]">{details.groomer?.name ?? "A Clipper groomer"}</strong>
            <span>{details.groomer?.bio ?? "A friendly professional from the Clipper team."}</span>
          </DetailRow>
        </div>
      </div>

      <div className="grid gap-0 border-t border-[#e6ebf1] bg-[#f7f9fc] sm:grid-cols-[1fr_auto]">
        <div className="px-5 py-5 sm:px-8">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8898aa]">Notes for your groomer</p>
          <p className="flex items-start gap-2 text-sm leading-6 text-[#53627a]">
            <StickyNote aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#635bff]" />
            <span>{details.notes ?? "No special notes added for this visit."}</span>
          </p>
        </div>
        <div className="border-t border-[#e6ebf1] px-5 py-5 sm:border-l sm:border-t-0 sm:px-8 sm:text-right">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8898aa]">Total</p>
          <p className="text-3xl font-bold tracking-[-0.04em] text-[#0a2540]">{formatPrice(details.priceCents)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6ebf1] px-5 py-4 text-xs text-[#8898aa] sm:px-8">
        <span>Booked with Clipper</span>
        <span className="font-mono tracking-[0.12em] text-[#53627a]">{details.reference ?? details.bookingReference ?? "CLP—"}</span>
      </div>
    </section>
  );
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef1ff] text-[#635bff] [&_svg]:size-4">{icon}</div>
      <div className="min-w-0 text-sm leading-6 text-[#53627a]">
        <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8898aa]">{label}</p>
        {children}
      </div>
    </div>
  );
}
