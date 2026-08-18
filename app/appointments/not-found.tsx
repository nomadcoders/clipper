import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function AppointmentNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f0e6] px-5 py-12 text-[#202321]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#ded2c2] bg-[#fffaf3] px-6 py-10 text-center shadow-[0_18px_45px_rgba(74,56,36,0.08)] sm:px-10">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-[#f4e2d6] text-[#b94f3e]">
          <SearchX aria-hidden="true" className="size-6" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b94f3e]">That link wandered off</p>
        <h1 className="mt-3 font-serif text-4xl tracking-[-0.05em]">We can&apos;t find that visit.</h1>
        <p className="mt-4 text-sm leading-6 text-[#766b61]">Check the booking reference and try again, or start a fresh Clipper booking.</p>
        <Link href="/#book" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#202321] px-5 py-3 text-sm font-bold text-[#fffaf3] transition-transform hover:-translate-y-0.5">
          <ArrowLeft aria-hidden="true" className="size-4" /> Back to booking
        </Link>
      </section>
    </main>
  );
}
