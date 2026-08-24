import Link from "next/link";

import { BrandMark } from "@/components/clipper/brand-mark";
import { ThemeToggle } from "@/components/clipper/theme-toggle";

export function SiteHeader({ bookingId = "book", howItWorksId = "how-it-works" }: { bookingId?: string; howItWorksId?: string }) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <Link href="/" aria-label="Clipper home" className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
        <BrandMark />
      </Link>
      <nav className="hidden items-center gap-7 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-warm-ink-2 sm:flex">
        <a className="transition-colors hover:text-brand" href={`#${howItWorksId}`}>How it works</a>
        <a className="transition-colors hover:text-brand" href={`#${bookingId}`}>Book a visit</a>
      </nav>
      <div className="flex items-center gap-3">
        <ThemeToggle className="border-warm-line text-warm-ink-2 hover:border-brand hover:text-brand" />
        <a href={`#${bookingId}`} className="rounded-full border border-warm-ink px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-warm-ink transition-colors hover:bg-warm-ink hover:text-warm-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:px-5">
          Book now <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
