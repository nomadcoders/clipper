import { Check, Heart, Sparkles } from "lucide-react";
import Link from "next/link";

import { formatLongDateNoYear } from "@/lib/clipper/format";
import type { AppointmentDetails } from "@/lib/clipper/types";

type BookingConfirmationProps = {
  appointment: AppointmentDetails;
};

const statusLabels: Record<string, string> = {
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  pending: "Pending",
};

export function BookingConfirmation({ appointment }: BookingConfirmationProps) {
  const petName = appointment.pet.name || "your pet";
  const status = statusLabels[appointment.status] ?? "Booked";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-deep px-5 py-8 text-deep-ink shadow-[0_28px_80px_rgba(10,37,64,0.24)] sm:px-8 sm:py-10">
      <div className="relative max-w-xl">
        <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-white text-accent shadow-sm">
          <Check aria-hidden="true" className="size-6" strokeWidth={3} />
        </div>
        <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan">
          <Sparkles aria-hidden="true" className="size-3.5" /> {status}
        </p>
        <h1 className="max-w-lg text-4xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
          {petName} is on the books.
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-deep-ink-2 sm:text-lg">
          We&apos;ll see you on {formatLongDateNoYear(appointment.startsAt, "your chosen day")}. Your groomer will bring the good towels—and a little extra patience.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-deep-ink-2">
          <span className="inline-flex items-center gap-2"><Heart aria-hidden="true" className="size-4 fill-current" /> Made for good pets</span>
          <span className="font-mono text-xs tracking-[0.14em] text-cyan">{appointment.reference || "CLP—"}</span>
        </div>
      </div>
    </section>
  );
}
