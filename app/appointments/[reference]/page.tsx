import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppointmentActions } from "@/components/clipper/appointment-actions";
import { AppointmentCard } from "@/components/clipper/appointment-card";
import { BookingConfirmation } from "@/components/clipper/booking-confirmation";
import { isChangeable } from "@/lib/clipper/appointment-changes";
import { getAppointmentByReference, getBookingOptions } from "@/lib/clipper/data";
import { formatDate, formatTime } from "@/lib/clipper/format";
import type { BookingSlot } from "@/lib/clipper/types";

type AppointmentPageProps = {
  params: Promise<{ reference: string }>;
};

export const dynamic = "force-dynamic";

/**
 * The booking options still hand back fixed placeholder slots, so drop any that
 * have gone by and the one this appointment already sits on before offering them.
 */
async function getRescheduleSlots(
  currentStartsAt: string,
  now: Date,
): Promise<BookingSlot[]> {
  const { availableSlots } = await getBookingOptions();
  const currentTime = new Date(currentStartsAt).getTime();

  return availableSlots
    .filter((slot) => {
      const startsAt = new Date(slot.startsAt).getTime();
      return startsAt > now.getTime() && startsAt !== currentTime;
    })
    .map((slot) => ({
      ...slot,
      label: `${formatDate(slot.startsAt)} · ${slot.label ?? formatTime(slot.startsAt)}`,
    }));
}

export default async function AppointmentPage({ params }: AppointmentPageProps) {
  const { reference } = await params;
  const appointment = await getAppointmentByReference(reference);

  if (!appointment) {
    notFound();
  }

  const now = new Date();
  const changeable = isChangeable(appointment, now);
  const rescheduleSlots = changeable
    ? await getRescheduleSlots(appointment.startsAt, now)
    : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f9fc] text-[#0a2540]">
      <div aria-hidden="true" className="absolute -right-[28rem] -top-[35rem] h-[62rem] w-[62rem] rotate-[24deg] bg-[linear-gradient(135deg,#ffdb80,#ff8f70_28%,#d783ff_52%,#7a73ff_74%,#68d5ff)] opacity-55 blur-[3px]" />
      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:px-12">
        <header className="relative flex items-center justify-between py-6 sm:py-8">
          <Link href="/" className="text-2xl font-black tracking-[-0.07em] text-[#0a2540]">clipper</Link>
          <Link href="/#book-prism" className="inline-flex items-center gap-2 rounded-full bg-[#635bff] px-5 py-2.5 text-sm font-bold !text-white transition-colors hover:bg-[#0a2540]">
            Book another visit <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </header>

        <div className="relative mx-auto max-w-4xl pt-8 sm:pt-14">
          <Link href="/appointments" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#53627a] transition-colors hover:text-[#635bff]">
            <ArrowLeft aria-hidden="true" className="size-4" /> All appointments
          </Link>
          <BookingConfirmation appointment={appointment} />

          <div className="mt-7">
            <AppointmentCard appointment={appointment} />
          </div>

          <AppointmentActions
            reference={appointment.reference}
            status={appointment.status}
            slots={rescheduleSlots}
            changeable={changeable}
          />
        </div>

        <footer className="relative mx-auto mt-16 flex max-w-4xl flex-col gap-2 border-t border-[#dbe3ef] pt-5 text-xs text-[#8898aa] sm:flex-row sm:items-center sm:justify-between">
          <span>Clipper · Seoul, Korea</span>
          <span>Thoughtful grooming, right at home.</span>
        </footer>
      </div>
    </main>
  );
}
