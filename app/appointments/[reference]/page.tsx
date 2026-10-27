import { ArrowLeft, ArrowUpRight, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppointmentCard } from "@/components/clipper/appointment-card";
import { BookingConfirmation } from "@/components/clipper/booking-confirmation";
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
    <main className="relative min-h-screen overflow-hidden bg-(--bg-f7f9fc) text-(--fg-0a2540)">
      <div aria-hidden="true" className="absolute -right-[28rem] -top-[35rem] h-[62rem] w-[62rem] rotate-[24deg] bg-[linear-gradient(135deg,#ffdb80,#ff8f70_28%,#d783ff_52%,#7a73ff_74%,#68d5ff)] opacity-55 dark:opacity-30 blur-[3px]" />
      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:px-12">
        <header className="relative flex items-center justify-between py-6 sm:py-8">
          <Link href="/" className="text-2xl font-black tracking-[-0.07em] text-(--fg-0a2540)">clipper</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle className="text-(--fg-0a2540)" />
            <Link href="/#book-prism" aria-label="Book another visit" className="inline-flex items-center gap-2 rounded-full bg-(--bg-635bff) px-5 py-2.5 text-sm font-bold !text-white transition-colors hover:bg-(--bg-0a2540)">
              Book<span className="hidden sm:inline"> another visit</span> <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </header>

        <div className="relative mx-auto max-w-4xl pt-8 sm:pt-14">
          <Link href="/appointments" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-(--fg-53627a) transition-colors hover:text-(--fg-635bff)">
            <ArrowLeft aria-hidden="true" className="size-4" /> All appointments
          </Link>
          <BookingConfirmation appointment={appointment} />

          <div className="mt-7">
            <AppointmentCard appointment={appointment} />
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-(--bd-dbe3ef) bg-(--bg-ffffff) px-5 py-5 text-sm text-(--fg-53627a) sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="font-semibold text-(--fg-0a2540)">Need to change something?</p>
              <p className="mt-1">Give our tiny team a call and we&apos;ll take care of it.</p>
            </div>
            <a href="tel:+8225550142" className="inline-flex items-center gap-2 font-bold text-(--fg-635bff) hover:text-(--fg-0a2540)">
              <Phone aria-hidden="true" className="size-4" /> 02-555-0142
            </a>
          </div>
        </div>

        <footer className="relative mx-auto mt-16 flex max-w-4xl flex-col gap-2 border-t border-(--bd-dbe3ef) pt-5 text-xs text-(--fg-8898aa) sm:flex-row sm:items-center sm:justify-between">
          <span>Clipper · Seoul, Korea</span>
          <span>Thoughtful grooming, right at home.</span>
        </footer>
      </div>
    </main>
  );
}
