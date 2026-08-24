import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppointmentCard } from "@/components/clipper/appointment-card";
import { BookingConfirmation } from "@/components/clipper/booking-confirmation";
import { ManageAppointment } from "@/components/clipper/manage-appointment";
import { ThemeToggle } from "@/components/clipper/theme-toggle";
import { getAppointmentByReference } from "@/lib/clipper/data";

type AppointmentPageProps = {
  params: Promise<{ reference: string }>;
};

export const dynamic = "force-dynamic";

export default async function AppointmentPage({ params }: AppointmentPageProps) {
  const { reference } = await params;
  const appointment = await getAppointmentByReference(reference);

  if (!appointment) {
    notFound();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas text-ink">
      <div aria-hidden="true" className="absolute -right-[28rem] -top-[35rem] h-[62rem] w-[62rem] rotate-[24deg] bg-[linear-gradient(135deg,#ffdb80,#ff8f70_28%,#d783ff_52%,#7a73ff_74%,#68d5ff)] opacity-55 blur-[3px] dark:opacity-25" />
      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:px-12">
        <header className="relative flex items-center justify-between py-6 sm:py-8">
          <Link href="/" className="text-2xl font-black tracking-[-0.07em] text-ink">clipper</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/#book-prism" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold !text-white transition-colors hover:bg-ink hover:!text-canvas">
              Book another visit <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </header>

        <div className="relative mx-auto max-w-4xl pt-8 sm:pt-14">
          <Link href="/appointments" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-ink-3 transition-colors hover:text-accent">
            <ArrowLeft aria-hidden="true" className="size-4" /> All appointments
          </Link>
          <BookingConfirmation appointment={appointment} />

          <div className="mt-7">
            <AppointmentCard appointment={appointment} />
          </div>

          <ManageAppointment appointment={appointment} />
        </div>

        <footer className="relative mx-auto mt-16 flex max-w-4xl flex-col gap-2 border-t border-line pt-5 text-xs text-ink-4 sm:flex-row sm:items-center sm:justify-between">
          <span>Clipper · Seoul, Korea</span>
          <span>Thoughtful grooming, right at home.</span>
        </footer>
      </div>
    </main>
  );
}
