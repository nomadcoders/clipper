import Link from "next/link";

import { getAppointments } from "@/lib/clipper/data";

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
  const upcoming = await getAppointments();
  const upcomingCount = upcoming.filter((appointment) => appointment.status !== "cancelled").length;

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#0a2540]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="text-2xl font-black tracking-[-0.07em]">clipper</Link>
        <Link href="/#book-prism" className="whitespace-nowrap rounded-full bg-[#635bff] px-4 py-2.5 text-xs font-bold !text-white sm:px-5 sm:text-sm">Book a visit ›</Link>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-20">
        <p className="text-sm font-bold text-[#635bff]">Your visits · {upcomingCount} upcoming</p>
        <h1 className="mt-3 text-[clamp(2.5rem,9vw,6rem)] font-bold leading-[1] tracking-[-0.05em] sm:leading-[0.95] sm:tracking-[-0.065em]">Appointments</h1>

        {appointments.length ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#dbe3ef] bg-white shadow-[0_28px_80px_rgb(38_46_77/10%)] sm:mt-12">
            {appointments.map((appointment) => (
              <Link key={appointment.id} href={`/appointments/${appointment.reference}`} className="grid gap-4 border-b border-[#e6ebf1] p-5 last:border-b-0 hover:bg-[#f7f9fc] sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_auto] sm:items-center sm:p-7">
                <div className="min-w-0"><p className="text-lg font-bold tracking-[-0.035em] sm:text-xl">{appointment.pet.name} · {appointment.package.name}</p><p className="mt-1 text-sm text-[#53627a]">{appointment.neighborhood} · {appointment.groomer?.name ?? "Groomer pending"}</p></div>
                <div><p className="text-sm font-semibold">{formatDate(appointment.startsAt)}</p><p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#08775d]">{appointment.status}</p></div>
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
