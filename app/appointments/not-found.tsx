import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/clipper/theme-toggle";

export default function AppointmentNotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-warm-canvas px-5 py-12 text-warm-ink">
      <ThemeToggle tone="warm" className="absolute right-5 top-5" />
      <section className="w-full max-w-md rounded-[2rem] border border-warm-line bg-warm-surface px-6 py-10 text-center shadow-[var(--warm-shadow)] sm:px-10">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-warm-line text-warm-brand">
          <SearchX aria-hidden="true" className="size-6" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-brand">
          That link wandered off
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-[-0.05em]">
          We can&apos;t find that visit.
        </h1>
        <p className="mt-4 text-sm leading-6 text-warm-ink-muted">
          Check the booking reference and try again, or start a fresh Clipper
          booking.
        </p>
        <Link
          href="/#book"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-warm-ink px-5 py-3 text-sm font-bold text-warm-surface transition-transform hover:-translate-y-0.5"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Back to booking
        </Link>
      </section>
    </main>
  );
}
