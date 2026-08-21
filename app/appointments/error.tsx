"use client";

import { RefreshCcw } from "lucide-react";

import { ThemeToggle } from "@/components/clipper/theme-toggle";

export default function AppointmentError({ reset }: { reset: () => void }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-warm-canvas px-5 py-12 text-warm-ink">
      <ThemeToggle tone="warm" className="absolute right-5 top-5" />
      <section className="w-full max-w-md rounded-[2rem] border border-warm-line bg-warm-surface px-6 py-10 text-center shadow-[var(--warm-shadow)] sm:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-brand">
          A small snag
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-[-0.05em]">
          We couldn&apos;t load that visit.
        </h1>
        <p className="mt-4 text-sm leading-6 text-warm-ink-muted">
          Something went wrong on our end. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-warm-ink px-5 py-3 text-sm font-bold text-warm-surface transition-transform hover:-translate-y-0.5"
        >
          <RefreshCcw aria-hidden="true" className="size-4" /> Try again
        </button>
      </section>
    </main>
  );
}
