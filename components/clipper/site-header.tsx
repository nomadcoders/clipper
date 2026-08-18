import Link from "next/link";

import { BrandMark } from "@/components/clipper/brand-mark";

export function SiteHeader({ bookingId = "book", howItWorksId = "how-it-works" }: { bookingId?: string; howItWorksId?: string }) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <Link href="/" aria-label="Clipper home" className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b58]">
        <BrandMark />
      </Link>
      <nav className="hidden items-center gap-7 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#686157] sm:flex">
        <a className="transition-colors hover:text-[#ff6b58]" href={`#${howItWorksId}`}>How it works</a>
        <a className="transition-colors hover:text-[#ff6b58]" href={`#${bookingId}`}>Book a visit</a>
      </nav>
      <a href={`#${bookingId}`} className="rounded-full border border-[#25231e] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#25231e] transition-colors hover:bg-[#25231e] hover:text-[#fff8e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b58] sm:px-5">
        Book now <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
