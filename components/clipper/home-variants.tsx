"use client";

import { BookingFlow } from "@/components/clipper/booking-flow";

export function PrismaticFlowHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9fc] text-[#0a2540]">
      <div className="relative isolate">
        <div aria-hidden="true" className="absolute -right-[22rem] -top-[34rem] -z-10 h-[70rem] w-[65rem] rotate-[28deg] bg-[linear-gradient(135deg,#ffdb80_4%,#ff8f70_28%,#d783ff_52%,#7a73ff_72%,#68d5ff_92%)] opacity-90 blur-[2px]" />
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
          <a href="#" className="text-2xl font-black tracking-[-0.07em]">clipper</a>
          <nav className="flex items-center gap-3 sm:gap-6"><a href="/appointments" className="text-sm font-semibold text-[#0a2540] hover:text-[#635bff]">Appointments</a><a href="#book-prism" className="rounded-full bg-[#635bff] px-4 py-2.5 text-sm font-bold !text-white shadow-[0_6px_18px_rgba(99,91,255,.25)] hover:bg-[#0a2540] sm:px-5">Book a visit ›</a></nav>
        </header>

        <section className="mx-auto grid min-h-[44rem] max-w-7xl items-center gap-12 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:pb-32 lg:pt-24">
          <div className="relative z-10">
            <h1 className="max-w-4xl text-[clamp(3.7rem,7.6vw,7.2rem)] font-bold leading-[0.93] tracking-[-0.065em]">A calmer way to care for your favorite pet.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#425466]">Clipper coordinates trusted groomers, neighborhood routes, and your pet’s routine—so a full salon arrives at your door exactly when you need it.</p>
            <div className="mt-9"><a href="#book-prism" className="inline-flex rounded-full bg-[#0a2540] px-6 py-3 text-sm font-bold !text-white hover:bg-[#635bff]">Find a time ›</a></div>
          </div>
          <div className="relative min-h-[31rem] lg:min-h-[38rem]">
            <div className="absolute left-[4%] top-[8%] w-[84%] rounded-2xl bg-white/95 p-5 shadow-[0_30px_80px_rgba(50,50,93,.24)] ring-1 ring-[#0a2540]/5 sm:p-6">
              <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-[#635bff]">UPCOMING VISIT</p><p className="mt-2 text-2xl font-bold tracking-[-0.04em]">Luna’s Full Groom</p></div><span className="rounded-full bg-[#e7f8f1] px-3 py-1 text-xs font-bold text-[#08775d]">Confirmed</span></div>
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#e6ebf1] pt-5 text-sm"><Detail label="WHEN" value="Fri, Aug 21 · 10:00" /><Detail label="GROOMER" value="Ava Choi" /><Detail label="NEIGHBORHOOD" value="Hannam-dong" /><Detail label="TOTAL" value="₩95,000" /></div>
            </div>
            <div className="absolute bottom-[4%] right-0 w-[76%] rounded-2xl bg-[#0a2540] p-5 text-white shadow-[0_28px_70px_rgba(10,37,64,.32)] sm:p-6"><p className="text-xs font-bold text-[#80e9ff]">ROUTE MATCH</p><div className="mt-4 flex items-center justify-between gap-4"><div><p className="font-bold">Ava → Hannam</p><p className="mt-1 text-sm text-[#adbdcc]">12 min away · supplies packed</p></div><span className="grid size-10 place-items-center rounded-full bg-[#635bff] font-bold">A</span></div><div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#80e9ff,#d783ff)]" /></div></div>
          </div>
        </section>
      </div>

      <BookingFlow sectionId="book-prism" variant="prism" />
      <Footer className="border-[#d9e2ec] bg-white text-[#425466]" />
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-[0.6rem] font-bold tracking-[0.14em] text-[#8898aa]">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function Footer({ className }: { className: string }) { return <footer className={`border-t px-5 py-8 sm:px-8 lg:px-12 ${className}`}><div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs font-semibold sm:flex-row sm:items-center sm:justify-between"><span>Clipper · Seoul, 2015</span><span>Thoughtful grooming, coordinated.</span></div></footer>; }
