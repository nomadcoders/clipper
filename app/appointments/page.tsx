import Link from "next/link";

import { getAppointments } from "@/lib/clipper/data";
import { formatDate, formatMoney, formatTime } from "@/lib/clipper/format";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const appointments = await getAppointments();
  const upcomingCount = appointments.filter((appointment) => appointment.status !== "cancelled").length;

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#0a2540]">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-8 sm:py-6">
        <Link href="/" className="text-2xl font-black tracking-[-0.07em]">clipper</Link>
        <Link href="/#book-prism" className="shrink-0 rounded-full bg-[#635bff] px-4 py-2.5 text-sm font-bold !text-white sm:px-5">Book a visit ›</Link>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-20">
        <p className="text-sm font-bold text-[#635bff]">Your visits · {upcomingCount} upcoming</p>
        <h1 className="mt-2 text-[clamp(2.5rem,7vw,6rem)] font-bold leading-[0.95] tracking-[-0.055em] sm:mt-3 sm:tracking-[-0.065em]">Appointments</h1>

        {appointments.length ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#dbe3ef] bg-white shadow-[0_28px_80px_rgb(38_46_77/10%)] sm:mt-12">
            {appointments.map((appointment) => (
              <Link key={appointment.id} href={`/appointments/${appointment.reference}`} className="grid gap-3 border-b border-[#e6ebf1] p-5 last:border-b-0 hover:bg-[#f7f9fc] active:bg-[#eef1f7] sm:grid-cols-[1.25fr_1fr_auto] sm:items-center sm:gap-4 sm:p-7">
                <div><p className="text-lg font-bold tracking-[-0.035em] sm:text-xl">{appointment.pet.name} · {appointment.package.name}</p><p className="mt-1 text-sm text-[#53627a]">{appointment.neighborhood} · {appointment.groomer?.name ?? "Groomer pending"}</p></div>
                <div><p className="text-sm font-semibold">{`${formatDate(appointment.startsAt)} · ${formatTime(appointment.startsAt)}`}</p><p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#08775d]">{appointment.status}</p></div>
                <div className="flex items-center justify-between gap-5 sm:block sm:text-right"><span className="font-bold">{formatMoney(appointment.priceCents)}</span><span className="ml-4 text-[#635bff]">›</span></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#dbe3ef] bg-white p-6 sm:mt-12 sm:p-12"><h2 className="text-2xl font-bold tracking-[-0.04em]">No appointments yet.</h2><p className="mt-3 text-[#53627a]">When you book a visit, it will appear here.</p><Link href="/#book-prism" className="mt-7 inline-flex rounded-full bg-[#0a2540] px-6 py-3 text-sm font-bold !text-white">Book your first visit ›</Link></div>
        )}
      </section>
    </main>
  );
}
