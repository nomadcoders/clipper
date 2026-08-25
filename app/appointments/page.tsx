import Link from "next/link";

import { ThemeToggle } from "@/components/clipper/theme-toggle";
import { getAppointments } from "@/lib/clipper/data";
import { formatDateTime, formatMoney } from "@/lib/clipper/format";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const appointments = await getAppointments();
  const upcomingCount = appointments.filter((appointment) => appointment.status !== "cancelled").length;

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="text-2xl font-black tracking-[-0.07em]">clipper</Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/#book-prism" className="whitespace-nowrap rounded-full bg-accent px-4 py-2.5 text-xs font-bold !text-white sm:px-5 sm:text-sm">Book a visit ›</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-20">
        <p className="text-sm font-bold text-accent">Your visits · {upcomingCount} upcoming</p>
        <h1 className="mt-3 text-[clamp(2.5rem,9vw,6rem)] font-bold leading-[1] tracking-[-0.05em] sm:leading-[0.95] sm:tracking-[-0.065em]">Appointments</h1>

        {appointments.length ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_28px_80px_rgb(38_46_77/10%)] sm:mt-12">
            {appointments.map((appointment) => (
              <Link key={appointment.id} href={`/appointments/${appointment.reference}`} className="grid gap-4 border-b border-line-2 p-5 last:border-b-0 hover:bg-surface-alt sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_auto] sm:items-center sm:p-7">
                <div className="min-w-0"><p className="text-lg font-bold tracking-[-0.035em] sm:text-xl">{appointment.pet.name} · {appointment.package.name}</p><p className="mt-1 text-sm text-ink-3">{appointment.neighborhood} · {appointment.groomer?.name ?? "Groomer pending"}</p></div>
                <div><p className="text-sm font-semibold">{formatDateTime(appointment.startsAt)}</p><p className="mt-1 text-xs uppercase tracking-[0.1em] text-ok">{appointment.status}</p></div>
                <div className="flex items-center justify-between gap-5 sm:block sm:text-right"><span className="font-bold">{formatMoney(appointment.priceCents)}</span><span className="ml-4 text-accent">›</span></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:mt-12 sm:p-12"><h2 className="text-2xl font-bold tracking-[-0.04em]">No appointments yet.</h2><p className="mt-3 text-ink-3">When you book a visit, it will appear here.</p><Link href="/#book-prism" className="mt-7 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-bold text-canvas">Book your first visit ›</Link></div>
        )}
      </section>
    </main>
  );
}
