import Link from "next/link";

import { ThemeToggle } from "@/components/clipper/theme-toggle";
import { getAppointments } from "@/lib/clipper/data";
import { formatDate, formatMoney, formatTime } from "@/lib/clipper/format";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const appointments = await getAppointments();
  const upcomingCount = appointments.filter((appointment) => appointment.status !== "cancelled").length;

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="text-2xl font-black tracking-[-0.07em]">clipper</Link>
        <div className="flex items-center gap-3"><Link href="/#book-prism" className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold !text-white">Book a visit ›</Link><ThemeToggle /></div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <p className="text-sm font-bold text-brand">Your visits · {upcomingCount} upcoming</p>
        <h1 className="mt-3 text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.95] tracking-[-0.065em]">Appointments</h1>

        {appointments.length ? (
          <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--card-shadow)]">
            {appointments.map((appointment) => (
              <Link key={appointment.id} href={`/appointments/${appointment.reference}`} className="grid gap-4 border-b border-line-soft p-5 last:border-b-0 hover:bg-surface-2 sm:grid-cols-[1.25fr_1fr_auto] sm:items-center sm:p-7">
                <div><p className="text-xl font-bold tracking-[-0.035em]">{appointment.pet.name} · {appointment.package.name}</p><p className="mt-1 text-sm text-ink-muted">{appointment.neighborhood} · {appointment.groomer?.name ?? "Groomer pending"}</p></div>
                <div><p className="text-sm font-semibold">{`${formatDate(appointment.startsAt)} · ${formatTime(appointment.startsAt)}`}</p><p className="mt-1 text-xs uppercase tracking-[0.1em] text-ok-ink">{appointment.status}</p></div>
                <div className="flex items-center justify-between gap-5 sm:block sm:text-right"><span className="font-bold">{formatMoney(appointment.priceCents)}</span><span className="ml-4 text-brand">›</span></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-line bg-surface p-8 sm:p-12"><h2 className="text-2xl font-bold tracking-[-0.04em]">No appointments yet.</h2><p className="mt-3 text-ink-muted">When you book a visit, it will appear here.</p><Link href="/#book-prism" className="mt-7 inline-flex rounded-full bg-deep px-6 py-3 text-sm font-bold !text-white">Book your first visit ›</Link></div>
        )}
      </section>
    </main>
  );
}
