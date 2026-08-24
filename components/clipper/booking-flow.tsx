"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney, formatShortDate } from "@/lib/clipper/format";
import type { GroomingPackage } from "@/lib/clipper/types";
import { cn } from "@/lib/utils";

type SlotOption = {
  id: string;
  startsAt: string;
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
};

type BookingFlowProps = {
  packages: GroomingPackage[];
  neighborhoods: string[];
  sectionId?: string;
};

const INK = "#0a2540";
const ACCENT = "#635bff";

/**
 * Stand-in arrival times. There is no slots endpoint yet, and these are read as
 * UTC by the availability check in lib/clipper/data.ts — keep the times as-is.
 */
const SLOTS: SlotOption[] = [
  { id: "fallback-fri-10", startsAt: "2026-08-21T10:00:00Z", timeLabel: "10:00 AM" },
  { id: "fallback-fri-13", startsAt: "2026-08-21T13:00:00Z", timeLabel: "1:00 PM" },
  { id: "fallback-sat-11", startsAt: "2026-08-22T11:00:00Z", timeLabel: "11:00 AM" },
  { id: "fallback-sat-14", startsAt: "2026-08-22T14:00:00Z", timeLabel: "2:00 PM" },
].map((slot) => ({
  ...slot,
  dateKey: slot.startsAt.slice(0, 10),
  dateLabel: formatShortDate(slot.startsAt),
}));

const GROUPED_SLOT_ENTRIES = Object.entries(
  SLOTS.reduce<Record<string, SlotOption[]>>((groups, slot) => {
    (groups[slot.dateKey] ??= []).push(slot);
    return groups;
  }, {}),
);

export function BookingFlow({ packages, neighborhoods, sectionId = "book" }: BookingFlowProps) {
  const router = useRouter();

  const [petName, setPetName] = useState("Luna");
  const [petBreed, setPetBreed] = useState("Miniature Poodle");
  const [selectedPackageId, setSelectedPackageId] = useState("pkg_full_groom");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Itaewon");
  const [address, setAddress] = useState("42 Itaewon-ro 27ga-gil");
  const [selectedSlotId, setSelectedSlotId] = useState("fallback-fri-10");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId);
  const totalPrice = selectedPackage?.priceCents ?? 0;
  const durationMinutes = selectedPackage?.durationMinutes ?? 0;
  const selectedSlot = SLOTS.find((slot) => slot.id === selectedSlotId);

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
      body: JSON.stringify({ petName: petName.trim(), petBreed, packageId: selectedPackageId, neighborhood: selectedNeighborhood, address, startsAt: selectedSlot.startsAt }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not create booking");
        return response.json() as Promise<{ reference?: string; bookingReference?: string }>;
      })
      .then((data) => {
        const reference = data.reference ?? data.bookingReference;
        if (!reference) throw new Error("Booking reference missing");
        router.push(`/appointments/${encodeURIComponent(reference)}`);
      })
      .catch(() => {
        setSubmitting(false);
        setFormError("We couldn’t save that visit. Please check your details and try again.");
      });
  }

  const ink = INK;
  const accent = ACCENT;

  return (
      <section id={sectionId} className="clipper-booking clipper-booking--prism scroll-mt-5">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
          <div className="mb-10 max-w-3xl pt-2">
            <p className="text-sm font-bold" style={{ color: accent }}>Book a Clipper visit</p>
            <h2 className="mt-3 text-[clamp(2.7rem,6vw,5.25rem)] font-bold leading-[0.95] tracking-[-0.06em]" style={{ color: ink }}>
              Everything your pet needs. One calm visit.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#53627a]">Choose the pet, service, location, and time. We’ll match the route with a trusted Seoul groomer.</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#dbe3ef] bg-white shadow-[0_32px_90px_rgb(38_46_77/12%)]">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-10 p-5 sm:p-8 lg:p-10">
                {formError ? <Alert className="border-[#f3aaa0] bg-[#fff3f0] text-[#8f3d30]"><AlertDescription>{formError}</AlertDescription></Alert> : null}

                <fieldset>
                  <legend className="mb-4 text-lg font-bold tracking-[-0.025em]" style={{ color: ink }}>1. Who are we grooming?</legend>
                  <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-[#53627a]">Pet name<Input aria-label="Pet name" value={petName} onChange={(event) => setPetName(event.target.value)} placeholder="e.g. Luna" className="mt-2 h-12 rounded-md border-[#dbe3ef] bg-white px-4 text-base font-normal text-[#0a2540] focus-visible:ring-[#635bff]" /></label><label className="text-xs font-bold text-[#53627a]">Breed<select aria-label="Breed" value={petBreed} onChange={(event) => setPetBreed(event.target.value)} className="mt-2 h-12 w-full rounded-md border border-[#dbe3ef] bg-white px-4 text-base font-normal text-[#0a2540] outline-none focus:border-[#635bff]"><option value="">Choose a breed</option><option>Golden Retriever</option><option>Labrador Retriever</option><option>Chihuahua</option><option>French Bulldog</option><option>German Shepherd</option><option>Poodle</option><option>Miniature Poodle</option><option>Pitbull</option><option>Pomeranian</option><option>Shiba Inu</option><option>Welsh Corgi</option><option>Yorkshire Terrier</option><option>Mixed Breed</option></select></label></div>
                </fieldset>

                <fieldset>
                  <legend className="mb-4 text-lg font-bold tracking-[-0.025em]" style={{ color: ink }}>2. Choose a service</legend>
                  <div className="divide-y divide-[#e6ebf1] border-y border-[#e6ebf1]">{packages.map((pkg) => <button type="button" key={pkg.id} onClick={() => { setSelectedPackageId(pkg.id); setFormError(""); }} className={cn("grid w-full grid-cols-[1fr_auto] items-center gap-5 px-1 py-5 text-left", selectedPackageId === pkg.id ? "" : "opacity-70 hover:opacity-100")}><span><span className="flex items-center gap-2 font-bold" style={{ color: ink }}><span className="size-2 rounded-full" style={{ background: selectedPackageId === pkg.id ? accent : "#dbe3ef" }} />{pkg.name}</span><span className="mt-1 block pl-4 text-xs leading-5 text-[#8898aa]">{pkg.description}</span></span><span className="text-right"><span className="block font-bold" style={{ color: ink }}>{formatMoney(pkg.priceCents)}</span><span className="text-xs text-[#8898aa]">{pkg.durationMinutes} min</span></span></button>)}</div>
                </fieldset>

                <fieldset>
                  <legend className="mb-4 text-lg font-bold tracking-[-0.025em]" style={{ color: ink }}>3. Where should we arrive?</legend>
                  <div className="grid gap-3 sm:grid-cols-[1.25fr_0.75fr]"><Input aria-label="Street address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street address" className="h-12 rounded-md border-[#dbe3ef] bg-white px-4 focus-visible:ring-[#705cf6]" /><select aria-label="Neighborhood" value={selectedNeighborhood} onChange={(event) => setSelectedNeighborhood(event.target.value)} className="h-12 rounded-md border border-[#dbe3ef] bg-white px-4 text-sm outline-none"><option value="">Neighborhood</option>{neighborhoods.map((neighborhood) => <option key={neighborhood} value={neighborhood}>{neighborhood}</option>)}</select></div>
                  <Input placeholder="Apartment, floor, or gate code (optional)" className="mt-3 h-11 rounded-md border-[#dbe3ef] bg-white px-4" />
                </fieldset>

                <fieldset>
                  <legend className="mb-1 text-lg font-bold tracking-[-0.025em]" style={{ color: ink }}>4. Pick an arrival time</legend>
                  <p className="mb-4 text-xs text-[#8898aa]">All times KST · matched against live groomer routes</p>
                  <div className="grid gap-5 sm:grid-cols-2">{GROUPED_SLOT_ENTRIES.map(([dateKey, dateSlots]) => <div key={dateKey}><p className="mb-2 text-sm font-bold" style={{ color: ink }}>{dateSlots[0]?.dateLabel}</p><div className="grid grid-cols-2 gap-2">{dateSlots.map((slot) => <button type="button" key={slot.id} onClick={() => { setSelectedSlotId(slot.id); setFormError(""); }} className={cn("rounded-md border px-3 py-3 text-sm font-bold", selectedSlotId === slot.id ? "text-white" : "border-[#dbe3ef] bg-white text-[#425466]")} style={selectedSlotId === slot.id ? { background: accent, borderColor: accent } : undefined}>{slot.timeLabel}</button>)}</div></div>)}{SLOTS.length ? null : <p className="text-sm text-[#53627a]">No routes are open for this address yet.</p>}</div>
                </fieldset>
              </div>

              <aside className="border-t border-[#e6ebf1] bg-[#f7f9fc] p-5 sm:p-7 lg:border-l lg:border-t-0">
                <div className="lg:sticky lg:top-6">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8898aa]">Visit summary</p>
                  <p className="mt-5 text-2xl font-bold tracking-[-0.04em]" style={{ color: ink }}>{petName || "Your pet"}</p>
                  <p className="mt-1 text-sm text-[#53627a]">{selectedPackage?.name ?? "Choose a service"}</p>
                  <dl className="mt-7 space-y-4 border-y border-[#dbe3ef] py-5 text-sm"><div className="flex justify-between gap-3"><dt className="text-[#8898aa]">Arrival</dt><dd className="text-right font-semibold" style={{ color: ink }}>{selectedSlot ? `${selectedSlot.dateLabel}, ${selectedSlot.timeLabel}` : "Not selected"}</dd></div><div className="flex justify-between"><dt className="text-[#8898aa]">Duration</dt><dd className="font-semibold" style={{ color: ink }}>{durationMinutes} min</dd></div><div className="flex justify-between"><dt className="text-[#8898aa]">Neighborhood</dt><dd className="font-semibold" style={{ color: ink }}>{selectedNeighborhood || "Not selected"}</dd></div></dl>
                  <div className="my-6 flex items-end justify-between"><span className="text-sm font-semibold text-[#53627a]">Total</span><span className="text-3xl font-bold tracking-[-0.05em]" style={{ color: ink }}>{formatMoney(totalPrice)}</span></div>
                  <Button type="button" onClick={validateAndSubmit} disabled={submitting} className="h-12 w-full rounded-md text-sm font-bold !text-white shadow-none" style={{ background: accent }}>{submitting ? "Saving your spot…" : "Confirm visit →"}</Button>
                  <p className="mt-3 text-center text-[0.68rem] leading-5 text-[#8898aa]">No charge until your groomer is confirmed.</p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
  );
}
