import Link from "next/link";

import { ThemeToggle } from "@/components/clipper/theme-toggle";
import { getAppointments } from "@/lib/clipper/data";
import { getStatusStyle } from "@/lib/clipper/status";

export const dynamic = "force-dynamic";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(value: string) {
  const date = new Date(value);
  const hours = date.getHours();
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()} · ${hour12}:${String(date.getMinutes()).padStart(2, "0")} ${suffix}`;
}

function formatMoney(cents: number) {
  return `₩${cents.toLocaleString("ko-KR")}`;
}

export default async function AppointmentsPage() {
  const appointments = await getAppointments();
  const now = Date.now();
  const upcomingCount = appointments.filter(
    (appointment) => (appointment.status === "confirmed" || appointment.status === "pending") && new Date(appointment.startsAt).getTime() > now,
  ).length;

  return (
    <main className="min-h-screen bg-(--bg-f7f9fc) text-(--fg-0a2540)">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="text-2xl font-black tracking-[-0.07em]">clipper</Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/#book-prism" className="rounded-full bg-(--bg-635bff) px-5 py-2.5 text-sm font-bold !text-white">Book a visit ›</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <p className="text-sm font-bold text-(--fg-635bff)">Your visits · {upcomingCount} upcoming</p>
        <h1 className="mt-3 text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.95] tracking-[-0.065em]">Appointments</h1>

        {appointments.length ? (
          <div className="mt-12 overflow-hidden rounded-2xl border border-(--bd-dbe3ef) bg-(--bg-ffffff) shadow-[0_28px_80px_rgb(38_46_77/10%)]">
            {appointments.map((appointment) => (
              <Link key={appointment.id} href={`/appointments/${appointment.reference}`} className="grid gap-4 border-b border-(--bd-e6ebf1) p-5 last:border-b-0 hover:bg-(--bg-f7f9fc) sm:grid-cols-[1.25fr_1fr_auto] sm:items-center sm:p-7">
                <div><p className="text-xl font-bold tracking-[-0.035em]">{appointment.pet.name} · {appointment.package.name}</p><p className="mt-1 text-sm text-(--fg-53627a)">{appointment.neighborhood} · {appointment.groomer?.name ?? "Groomer pending"}</p></div>
                <div><p className="text-sm font-semibold">{formatDate(appointment.startsAt)}</p><span className={`mt-1.5 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusStyle(appointment.status).className}`}>{getStatusStyle(appointment.status).label}</span></div>
                <div className="flex items-center justify-between gap-5 sm:block sm:text-right"><span className="font-bold">{formatMoney(appointment.priceCents)}</span><span className="ml-4 text-(--fg-635bff)">›</span></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-(--bd-dbe3ef) bg-(--bg-ffffff) p-8 sm:p-12"><h2 className="text-2xl font-bold tracking-[-0.04em]">No appointments yet.</h2><p className="mt-3 text-(--fg-53627a)">When you book a visit, it will appear here.</p><Link href="/#book-prism" className="mt-7 inline-flex rounded-full bg-(--bg-0a2540) px-6 py-3 text-sm font-bold !text-white">Book your first visit ›</Link></div>
        )}
      </section>
    </main>
  );
}
