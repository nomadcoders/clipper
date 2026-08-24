"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription, Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

type PackageOption = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
};

type NeighborhoodOption = string | { id?: string; name: string };

type ApiSlot = {
  id?: string;
  startsAt?: string | number;
  endsAt?: string | number;
  date?: string;
  time?: string;
  label?: string;
  groomerName?: string;
};

type BookingOptionsResponse = {
  packages: PackageOption[];
  neighborhoods: NeighborhoodOption[];
  availableSlots?: ApiSlot[];
  slots?: ApiSlot[];
};

type SlotOption = {
  id: string;
  startsAt: string;
  endsAt?: string | number;
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
  groomerName?: string;
};

function formatMoney(cents: number) {
  return `₩${cents.toLocaleString("ko-KR")}`;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function normalizeSlot(slot: ApiSlot, index: number): SlotOption | null {
  const startsAt = slot.startsAt ?? (slot.date && slot.time ? `${slot.date}T${slot.time}` : undefined);
  if (!startsAt) return null;
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return null;
  return {
    id: slot.id ?? `slot-${index}-${date.toISOString()}`,
    startsAt: String(startsAt),
    endsAt: slot.endsAt,
    dateKey: date.toISOString().slice(0, 10),
    dateLabel: formatDateLabel(date),
    timeLabel: slot.label ?? formatTimeLabel(date),
    groomerName: slot.groomerName,
  };
}

function mergeOptions(current: BookingOptionsResponse, incoming: Partial<BookingOptionsResponse>): BookingOptionsResponse {
  return {
    ...current,
    ...incoming,
    packages: incoming.packages?.length ? incoming.packages : current.packages,
    neighborhoods: incoming.neighborhoods?.length ? incoming.neighborhoods : current.neighborhoods,
    availableSlots: incoming.availableSlots?.length ? incoming.availableSlots : current.availableSlots,
    slots: incoming.slots?.length ? incoming.slots : current.slots,
  };
}

export function BookingFlow({ sectionId = "book", variant = "prism", theme = { ink: "var(--ink)", accent: "var(--accent)" } }: { sectionId?: string; variant?: "prism"; theme?: { ink: string; accent: string } }) {
  const fallbackOptions: BookingOptionsResponse = {
    packages: [
      { id: "pkg_bath_brush", name: "Bath & Brush", description: "A refreshing bath, blow dry, brush-out, and nail trim.", durationMinutes: 60, priceCents: 65000 },
      { id: "pkg_full_groom", name: "Full Groom", description: "Bath, brush-out, haircut, nail trim, and ear cleaning.", durationMinutes: 90, priceCents: 95000 },
      { id: "pkg_deluxe", name: "Deluxe Spa", description: "Full grooming plus teeth brushing and a soothing paw treatment.", durationMinutes: 120, priceCents: 135000 },
    ],
    neighborhoods: ["Hannam-dong", "Yeonnam-dong", "Seongsu-dong", "Itaewon", "Gangnam", "Mangwon-dong"],
    availableSlots: [
      { id: "fallback-fri-10", startsAt: "2026-08-21T10:00:00Z", label: "10:00 AM" },
      { id: "fallback-fri-13", startsAt: "2026-08-21T13:00:00Z", label: "1:00 PM" },
      { id: "fallback-sat-11", startsAt: "2026-08-22T11:00:00Z", label: "11:00 AM" },
      { id: "fallback-sat-14", startsAt: "2026-08-22T14:00:00Z", label: "2:00 PM" },
    ],
  };

  const [options, setOptions] = useState<BookingOptionsResponse>(fallbackOptions);
  const [petName, setPetName] = useState("Luna");
  const [petBreed, setPetBreed] = useState("Miniature Poodle");
  const [selectedPackageId, setSelectedPackageId] = useState("pkg_full_groom");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Itaewon");
  const [address, setAddress] = useState("42 Itaewon-ro 27ga-gil");
  const [selectedSlotId, setSelectedSlotId] = useState("fallback-fri-10");
  const [totalPrice, setTotalPrice] = useState(95000);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const selectedPackage = options.packages.find((pkg) => pkg.id === selectedPackageId);
  const neighborhoods = options.neighborhoods.map((neighborhood) => typeof neighborhood === "string" ? neighborhood : neighborhood.name);
  const slots = (options.availableSlots ?? options.slots ?? []).map(normalizeSlot).filter((slot): slot is SlotOption => Boolean(slot));
  const groupedSlots = slots.reduce<Record<string, SlotOption[]>>((groups, slot) => {
    groups[slot.dateKey] = [...(groups[slot.dateKey] ?? []), slot];
    return groups;
  }, {});
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);

  useEffect(() => {
    let cancelled = false;
    setLoadingOptions(true);
    fetch("/api/booking-options")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load booking options");
        return response.json() as Promise<BookingOptionsResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setOptions((current) => mergeOptions(current, data));
        const firstSlot = data.availableSlots?.[0] ?? data.slots?.[0] ?? options.availableSlots?.[0] ?? options.slots?.[0];
        setSelectedSlotId(firstSlot?.id ?? "");
      })
      .catch(() => {
        // Keep the local booking options available when the API is offline.
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setTotalPrice(selectedPackage?.priceCents ?? 0);
    setDurationMinutes(selectedPackage?.durationMinutes ?? 0);
  }, [selectedPackage]);

  function validateAndSubmit() {
    if (!petName.trim() || !petBreed || !selectedPackageId || !selectedNeighborhood || !address || !selectedSlot) {
      setFormError("Please complete each step before booking your Clipper visit.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petName: petName.trim(), petBreed, packageId: selectedPackageId, neighborhood: selectedNeighborhood, address, startsAt: selectedSlot.startsAt, endsAt: selectedSlot.endsAt, priceCents: totalPrice, durationMinutes }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not create booking");
        return response.json() as Promise<{ reference?: string; bookingReference?: string }>;
      })
      .then((data) => {
        const reference = data.reference ?? data.bookingReference;
        if (!reference) throw new Error("Booking reference missing");
        window.location.assign(`/appointments/${encodeURIComponent(reference)}`);
      })
      .catch(() => {
        setSubmitting(false);
        setFormError("We couldn’t save that visit. Please check your details and try again.");
      });
  }

  const prism = true;
  const ink = theme.ink;
  const accent = theme.accent;

  return (
      <section id={sectionId} className={cn("clipper-booking scroll-mt-5", `clipper-booking--${variant}`)}>
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
          <div className={cn("mb-10 max-w-3xl", prism ? "pt-2" : "pt-4")}>
            <p className="text-sm font-bold" style={{ color: accent }}>{prism ? "Book a Clipper visit" : "Create an appointment"}</p>
            <h2 className="mt-3 text-[clamp(2.7rem,6vw,5.25rem)] font-bold leading-[0.95] tracking-[-0.06em]" style={{ color: ink }}>
              {prism ? "Everything your pet needs. One calm visit." : "Build the right grooming visit."}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink-3">Choose the pet, service, location, and time. We’ll match the route with a trusted Seoul groomer.</p>
          </div>

          <div className={cn("overflow-hidden border bg-surface", prism ? "rounded-2xl border-line shadow-[0_32px_90px_rgb(38_46_77/12%)]" : "rounded-xl border-line shadow-[0_32px_90px_rgb(66_35_45/10%)] lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]")}>
            <div className={cn("grid", prism ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : "lg:grid-cols-[minmax(0,1fr)_19rem]")}>
              <div className="space-y-10 p-5 sm:p-8 lg:p-10">
                {formError && <Alert className="border-err-line bg-err-bg text-err"><AlertDescription>{formError}</AlertDescription></Alert>}
                {loadingOptions && <p className="text-xs font-semibold text-ink-4">Checking this week’s available routes…</p>}

                <fieldset>
                  <legend className="mb-4 text-lg font-bold tracking-[-0.025em]" style={{ color: ink }}>1. Who are we grooming?</legend>
                  <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-ink-3">Pet name<Input aria-label="Pet name" value={petName} onChange={(event) => setPetName(event.target.value)} placeholder="e.g. Luna" className="mt-2 h-12 rounded-md border-line bg-surface px-4 text-base font-normal text-ink focus-visible:ring-accent" /></label><label className="text-xs font-bold text-ink-3">Breed<select aria-label="Breed" value={petBreed} onChange={(event) => setPetBreed(event.target.value)} className="mt-2 h-12 w-full rounded-md border border-line bg-surface px-4 text-base font-normal text-ink outline-none focus:border-accent"><option value="">Choose a breed</option><option>Golden Retriever</option><option>Labrador Retriever</option><option>French Bulldog</option><option>German Shepherd</option><option>Poodle</option><option>Miniature Poodle</option><option>Pomeranian</option><option>Shiba Inu</option><option>Welsh Corgi</option><option>Yorkshire Terrier</option><option>Mixed Breed</option></select></label></div>
                </fieldset>

                <fieldset>
                  <legend className="mb-4 text-lg font-bold tracking-[-0.025em]" style={{ color: ink }}>2. Choose a service</legend>
                  <div className="divide-y divide-line-2 border-y border-line-2">{options.packages.map((pkg) => <button type="button" key={pkg.id} onClick={() => { setSelectedPackageId(pkg.id); setFormError(""); }} className={cn("grid w-full grid-cols-[1fr_auto] items-center gap-5 px-1 py-5 text-left", selectedPackageId === pkg.id ? "" : "opacity-70 hover:opacity-100")}><span><span className="flex items-center gap-2 font-bold" style={{ color: ink }}><span className="size-2 rounded-full" style={{ background: selectedPackageId === pkg.id ? accent : "var(--line)" }} />{pkg.name}</span><span className="mt-1 block pl-4 text-xs leading-5 text-ink-4">{pkg.description}</span></span><span className="text-right"><span className="block font-bold" style={{ color: ink }}>{formatMoney(pkg.priceCents)}</span><span className="text-xs text-ink-4">{pkg.durationMinutes} min</span></span></button>)}</div>
                </fieldset>

                <fieldset>
                  <legend className="mb-4 text-lg font-bold tracking-[-0.025em]" style={{ color: ink }}>3. Where should we arrive?</legend>
                  <div className="grid gap-3 sm:grid-cols-[1.25fr_0.75fr]"><Input aria-label="Street address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street address" className="h-12 rounded-md border-line bg-surface px-4 text-ink focus-visible:ring-accent" /><select aria-label="Neighborhood" value={selectedNeighborhood} onChange={(event) => setSelectedNeighborhood(event.target.value)} className="h-12 rounded-md border border-line bg-surface px-4 text-sm text-ink outline-none"><option value="">Neighborhood</option>{neighborhoods.map((neighborhood) => <option key={neighborhood} value={neighborhood}>{neighborhood}</option>)}</select></div>
                  <Input placeholder="Apartment, floor, or gate code (optional)" className="mt-3 h-11 rounded-md border-line bg-surface px-4 text-ink" />
                </fieldset>

                <fieldset>
                  <legend className="mb-1 text-lg font-bold tracking-[-0.025em]" style={{ color: ink }}>4. Pick an arrival time</legend>
                  <p className="mb-4 text-xs text-ink-4">All times KST · matched against live groomer routes</p>
                  <div className="grid gap-5 sm:grid-cols-2">{Object.entries(groupedSlots).map(([dateKey, dateSlots]) => <div key={dateKey}><p className="mb-2 text-sm font-bold" style={{ color: ink }}>{dateSlots[0]?.dateLabel}</p><div className="grid grid-cols-2 gap-2">{dateSlots.map((slot) => <button type="button" key={slot.id} onClick={() => { setSelectedSlotId(slot.id); setFormError(""); }} className={cn("rounded-md border px-3 py-3 text-sm font-bold", selectedSlotId === slot.id ? "border-transparent text-white" : "border-line bg-surface text-ink-2")} style={selectedSlotId === slot.id ? { background: accent, borderColor: accent } : undefined}>{slot.timeLabel}</button>)}</div></div>)}{!slots.length && <p className="text-sm text-ink-3">No routes are open for this address yet.</p>}</div>
                </fieldset>
              </div>

              <aside className={cn("border-t p-5 sm:p-7 lg:border-l lg:border-t-0", "border-line-2 bg-surface-alt")}>
                <div className="lg:sticky lg:top-6">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-4">Visit summary</p>
                  <p className="mt-5 text-2xl font-bold tracking-[-0.04em]" style={{ color: ink }}>{petName || "Your pet"}</p>
                  <p className="mt-1 text-sm text-ink-3">{selectedPackage?.name ?? "Choose a service"}</p>
                  <dl className="mt-7 space-y-4 border-y border-line py-5 text-sm"><div className="flex justify-between gap-3"><dt className="text-ink-4">Arrival</dt><dd className="text-right font-semibold" style={{ color: ink }}>{selectedSlot ? `${selectedSlot.dateLabel}, ${selectedSlot.timeLabel}` : "Not selected"}</dd></div><div className="flex justify-between"><dt className="text-ink-4">Duration</dt><dd className="font-semibold" style={{ color: ink }}>{durationMinutes} min</dd></div><div className="flex justify-between"><dt className="text-ink-4">Neighborhood</dt><dd className="font-semibold" style={{ color: ink }}>{selectedNeighborhood || "Not selected"}</dd></div></dl>
                  <div className="my-6 flex items-end justify-between"><span className="text-sm font-semibold text-ink-3">Total</span><span className="text-3xl font-bold tracking-[-0.05em]" style={{ color: ink }}>{formatMoney(totalPrice)}</span></div>
                  <Button type="button" onClick={validateAndSubmit} disabled={submitting || loadingOptions} className="h-12 w-full rounded-md text-sm font-bold !text-white shadow-none" style={{ background: accent }}>{submitting ? "Saving your spot…" : "Confirm visit →"}</Button>
                  <p className="mt-3 text-center text-[0.68rem] leading-5 text-ink-4">No charge until your groomer is confirmed.</p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
  );
}
