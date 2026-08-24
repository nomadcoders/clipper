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

import {
  formatLongDate,
  formatMoney,
  formatTime,
} from "@/lib/clipper/format";
import type { AppointmentDetails } from "@/lib/clipper/types";

type AppointmentCardProps = {
  appointment: AppointmentDetails;
};

const statusLabels: Record<string, { label: string; className: string }> = {
  confirmed: {
    label: "Confirmed",
    className: "border-ok-line bg-ok-bg text-ok",
  },
  completed: {
    label: "Completed",
    className: "border-accent-soft bg-accent-soft text-accent-soft-ink",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-err-line bg-err-bg text-err",
  },
  pending: {
    label: "Pending",
    className: "border-warn-line bg-warn-bg text-warn",
  },
};

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const service = appointment.package;
  const status = statusLabels[appointment.status] ?? {
    label: appointment.status || "Booked",
    className: "border-accent-soft bg-accent-soft text-accent-soft-ink",
  };
  const appointmentDate = formatLongDate(appointment.startsAt, "Date to be confirmed");
  const startTime = formatTime(appointment.startsAt, "Time to be confirmed");
  const endTime = formatTime(appointment.endsAt, "Time to be confirmed");
  const address = appointment.address ?? "Address to be confirmed";
  const neighborhood = appointment.neighborhood ? `, ${appointment.neighborhood}` : "";
  const petName = appointment.pet.name || "Your pet";

  return (
    <section aria-labelledby="appointment-details-heading" className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_rgba(38,46,77,0.08)]">
      <div className="border-b border-line-2 px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-5">
          <div className="min-w-0">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Your Clipper visit</p>
            <h2 id="appointment-details-heading" className="break-words text-2xl font-bold leading-tight tracking-[-0.04em] text-ink sm:text-4xl sm:leading-none">
              {petName}&apos;s appointment
            </h2>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}>
            <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
            {status.label}
          </span>
        </div>
      </div>

      <div className="grid gap-0 divide-y divide-line-2 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-7">
          <DetailRow icon={<CalendarDays aria-hidden="true" />} label="When">
            <strong className="block font-semibold text-ink">{appointmentDate}</strong>
            <span>{startTime} – {endTime}</span>
          </DetailRow>
          <DetailRow icon={<MapPin aria-hidden="true" />} label="Where">
            <strong className="block font-semibold text-ink">At your home</strong>
            <span>{address}{neighborhood}</span>
          </DetailRow>
          <DetailRow icon={<Clock3 aria-hidden="true" />} label="Visit length">
            <strong className="block font-semibold text-ink">{service?.durationMinutes ?? "—"} minutes</strong>
            <span>Our groomer brings everything</span>
          </DetailRow>
        </div>

        <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-7">
          <DetailRow icon={<Dog aria-hidden="true" />} label="Pet">
            <strong className="block font-semibold text-ink">{petName}</strong>
            <span>{appointment.pet.breed || "Breed not specified"}</span>
          </DetailRow>
          <DetailRow icon={<Scissors aria-hidden="true" />} label="Service">
            <strong className="block font-semibold text-ink">{service?.name ?? "Grooming visit"}</strong>
            <span>{service?.description ?? "A thoughtful grooming visit, right at home."}</span>
          </DetailRow>
          <DetailRow icon={<UserRound aria-hidden="true" />} label="Your groomer">
            <strong className="block font-semibold text-ink">{appointment.groomer?.name ?? "A Clipper groomer"}</strong>
            <span>{appointment.groomer?.bio ?? "A friendly professional from the Clipper team."}</span>
          </DetailRow>
        </div>
      </div>

      <div className="grid gap-0 border-t border-line-2 bg-surface-alt sm:grid-cols-[1fr_auto]">
        <div className="px-5 py-5 sm:px-8">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-4">Notes for your groomer</p>
          <p className="flex items-start gap-2 text-sm leading-6 text-ink-3">
            <StickyNote aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
            <span>{appointment.notes ?? "No special notes added for this visit."}</span>
          </p>
        </div>
        <div className="border-t border-line-2 px-5 py-5 sm:border-l sm:border-t-0 sm:px-8 sm:text-right">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-4">Total</p>
          <p className="text-3xl font-bold tracking-[-0.04em] text-ink">{formatMoney(appointment.priceCents, "Price to be confirmed")}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-2 px-5 py-4 text-xs text-ink-4 sm:px-8">
        <span>Booked with Clipper</span>
        <span className="font-mono tracking-[0.12em] text-ink-3">{appointment.reference || "CLP—"}</span>
      </div>
    </section>
  );
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent [&_svg]:size-4">{icon}</div>
      <div className="min-w-0 text-sm leading-6 text-ink-3">
        <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-4">{label}</p>
        {children}
      </div>
    </div>
  );
}
