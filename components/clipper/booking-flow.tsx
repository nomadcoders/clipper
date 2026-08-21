"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  Alert,
  AlertDescription,
  Button,
  Calendar,
  Input,
} from "@/components/ui";
import {
  formatDate,
  formatDateKey,
  formatMoney,
  formatTime,
} from "@/lib/clipper/format";
import type { BookingOption, BookingSlot } from "@/lib/clipper/types";
import { cn } from "@/lib/utils";

type SlotOption = BookingSlot & {
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
};

const ink = "var(--ink)";
const accent = "var(--brand)";

function normalizeSlot(slot: BookingSlot): SlotOption {
  const date = new Date(slot.startsAt);
  return {
    ...slot,
    dateKey: formatDateKey(date),
    dateLabel: formatDate(date),
    timeLabel: slot.label ?? formatTime(date),
  };
}

export function BookingFlow({
  options,
  sectionId = "book",
}: {
  options: BookingOption;
  sectionId?: string;
}) {
  const router = useRouter();

  const { slots, groupedSlots } = useMemo(() => {
    const normalized = options.availableSlots.map(normalizeSlot);
    const grouped: Record<string, SlotOption[]> = {};
    normalized.forEach((slot) => {
      (grouped[slot.dateKey] ??= []).push(slot);
    });
    return { slots: normalized, groupedSlots: grouped };
  }, [options]);

  const { neighborhoods } = options;

  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState(
    () => options.packages[0]?.id ?? "",
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(
    () => neighborhoods[0] ?? "",
  );
  const [address, setAddress] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(
    () => slots[0]?.id ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const selectedPackage = options.packages.find(
    (pkg) => pkg.id === selectedPackageId,
  );
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
  const totalPrice = selectedPackage?.priceCents ?? 0;
  const durationMinutes = selectedPackage?.durationMinutes ?? 0;

  function validateAndSubmit() {
    if (
      !petName.trim() ||
      !petBreed ||
      !selectedPackageId ||
      !selectedNeighborhood ||
      !address ||
      !selectedSlot
    ) {
      setFormError(
        "Please complete each step before booking your Clipper visit.",
      );
      return;
    }
    setSubmitting(true);
    setFormError("");
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        petName: petName.trim(),
        petBreed,
        packageId: selectedPackageId,
        neighborhood: selectedNeighborhood,
        address: addressDetails.trim()
          ? `${address}, ${addressDetails.trim()}`
          : address,
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
        priceCents: totalPrice,
        durationMinutes,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not create booking");
        return response.json() as Promise<{
          reference?: string;
          bookingReference?: string;
        }>;
      })
      .then((data) => {
        const reference = data.reference ?? data.bookingReference;
        if (!reference) throw new Error("Booking reference missing");
        router.push(`/appointments/${encodeURIComponent(reference)}`);
      })
      .catch(() => {
        setSubmitting(false);
        setFormError(
          "We couldn’t save that visit. Please check your details and try again.",
        );
      });
  }

  return (
    <section
      id={sectionId}
      className="clipper-booking clipper-booking--prism scroll-mt-5"
    >
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12">
        <div className="mb-8 max-w-3xl pt-2 sm:mb-10">
          <p className="text-sm font-bold" style={{ color: accent }}>
            Book a Clipper visit
          </p>
          <h2
            className="mt-3 text-[clamp(2.1rem,6vw,5.25rem)] font-bold leading-[0.98] tracking-[-0.05em] sm:leading-[0.95] sm:tracking-[-0.06em]"
            style={{ color: ink }}
          >
            Everything your pet needs. One calm visit.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted sm:mt-5">
            Choose the pet, service, location, and time. We’ll match the route
            with a trusted Seoul groomer.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--card-shadow)]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-8 p-5 sm:space-y-10 sm:p-8 lg:p-10">
              {formError && (
                <Alert className="border-danger-line bg-danger-bg text-danger-ink">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <fieldset>
                <legend
                  className="mb-4 text-lg font-bold tracking-[-0.025em]"
                  style={{ color: ink }}
                >
                  1. Who are we grooming?
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="pet-name"
                      className="text-xs font-bold text-ink-muted"
                    >
                      Pet name
                    </label>
                    <Input
                      id="pet-name"
                      aria-describedby="pet-name-hint"
                      value={petName}
                      onChange={(event) => setPetName(event.target.value)}
                      placeholder="e.g. Luna"
                      className="mt-2 h-12 rounded-md border-line bg-surface px-4 text-base font-normal text-ink focus-visible:ring-brand"
                    />
                    <span id="pet-name-hint" className="sr-only">
                      The name your groomer will use for your pet
                    </span>
                  </div>
                  <div>
                    <label
                      htmlFor="pet-breed"
                      className="text-xs font-bold text-ink-muted"
                    >
                      Breed
                    </label>
                    <select
                      id="pet-breed"
                      aria-describedby="pet-breed-hint"
                      value={petBreed}
                      onChange={(event) => setPetBreed(event.target.value)}
                      className="mt-2 h-12 w-full rounded-md border border-line bg-surface px-4 text-base font-normal text-ink outline-none focus:border-brand"
                    >
                      <option value="">Choose a breed</option>
                      <option>Golden Retriever</option>
                      <option>Labrador Retriever</option>
                      <option>French Bulldog</option>
                      <option>German Shepherd</option>
                      <option>Poodle</option>
                      <option>Miniature Poodle</option>
                      <option>Pomeranian</option>
                      <option>Shiba Inu</option>
                      <option>Welsh Corgi</option>
                      <option>Yorkshire Terrier</option>
                      <option>Mixed Breed</option>
                    </select>
                    <span id="pet-breed-hint" className="sr-only">
                      Helps your groomer prepare the right tools
                    </span>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend
                  className="mb-4 text-lg font-bold tracking-[-0.025em]"
                  style={{ color: ink }}
                >
                  2. Choose a service
                </legend>
                <div className="divide-y divide-line-soft border-y border-line-soft">
                  {options.packages.map((pkg) => (
                    <button
                      type="button"
                      key={pkg.id}
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        setFormError("");
                      }}
                      className={cn(
                        "grid w-full grid-cols-[1fr_auto] items-center gap-5 px-1 py-5 text-left",
                        selectedPackageId === pkg.id
                          ? ""
                          : "opacity-70 hover:opacity-100",
                      )}
                    >
                      <span>
                        <span
                          className="flex items-center gap-2 font-bold"
                          style={{ color: ink }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              background:
                                selectedPackageId === pkg.id
                                  ? accent
                                  : "var(--line)",
                            }}
                          />
                          {pkg.name}
                        </span>
                        <span className="mt-1 block pl-4 text-xs leading-5 text-ink-subtle">
                          {pkg.description}
                        </span>
                      </span>
                      <span className="text-right">
                        <span
                          className="block font-bold"
                          style={{ color: ink }}
                        >
                          {formatMoney(pkg.priceCents)}
                        </span>
                        <span className="text-xs text-ink-subtle">
                          {pkg.durationMinutes} min
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend
                  className="mb-4 text-lg font-bold tracking-[-0.025em]"
                  style={{ color: ink }}
                >
                  3. Where should we arrive?
                </legend>
                <div className="grid gap-3 sm:grid-cols-[1.25fr_0.75fr]">
                  <div>
                    <label htmlFor="street-address" className="sr-only">
                      Street address
                    </label>
                    <Input
                      id="street-address"
                      aria-describedby="street-address-hint"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="Street address"
                      className="h-12 rounded-md border-line bg-surface px-4 text-base focus-visible:ring-brand sm:text-sm"
                    />
                    <span id="street-address-hint" className="sr-only">
                      We&apos;ll match a groomer whose route covers this
                      address
                    </span>
                  </div>
                  <div>
                    <label htmlFor="neighborhood" className="sr-only">
                      Neighborhood
                    </label>
                    <select
                      id="neighborhood"
                      aria-describedby="neighborhood-hint"
                      value={selectedNeighborhood}
                      onChange={(event) =>
                        setSelectedNeighborhood(event.target.value)
                      }
                      className="h-12 rounded-md border border-line bg-surface px-4 text-base outline-none sm:text-sm"
                    >
                      <option value="">Neighborhood</option>
                      {neighborhoods.map((neighborhood) => (
                        <option key={neighborhood} value={neighborhood}>
                          {neighborhood}
                        </option>
                      ))}
                    </select>
                    <span id="neighborhood-hint" className="sr-only">
                      Used to find groomers who serve your area
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="address-details" className="sr-only">
                    Apartment, floor, or gate code
                  </label>
                  <Input
                    id="address-details"
                    aria-describedby="address-details-hint"
                    value={addressDetails}
                    onChange={(event) =>
                      setAddressDetails(event.target.value)
                    }
                    placeholder="Apartment, floor, or gate code (optional)"
                    className="mt-3 h-11 rounded-md border-line bg-surface px-4 text-base sm:text-sm"
                  />
                  <span id="address-details-hint" className="sr-only">
                    Optional — helps your groomer find the door
                  </span>
                </div>
              </fieldset>

              <fieldset>
                <legend
                  className="mb-1 text-lg font-bold tracking-[-0.025em]"
                  style={{ color: ink }}
                >
                  4. Pick an arrival time
                </legend>
                <p className="mb-4 text-xs text-ink-subtle">
                  All times KST · matched against live groomer routes
                </p>
                <Calendar
                  mode="single"
                  selected={
                    selectedSlot ? new Date(selectedSlot.startsAt) : undefined
                  }
                  onSelect={(date) => {
                    if (!date) return;
                    const slotForDay = groupedSlots[formatDateKey(date)]?.[0];
                    if (slotForDay) {
                      setSelectedSlotId(slotForDay.id);
                      setFormError("");
                    }
                  }}
                  disabled={(date) => !groupedSlots[formatDateKey(date)]}
                  className="mb-5 rounded-md border border-line bg-surface"
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  {Object.entries(groupedSlots).map(([dateKey, dateSlots]) => (
                    <div key={dateKey}>
                      <p
                        className="mb-2 text-sm font-bold"
                        style={{ color: ink }}
                      >
                        {dateSlots[0]?.dateLabel}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {dateSlots.map((slot) => (
                          <button
                            type="button"
                            key={slot.id}
                            onClick={() => {
                              setSelectedSlotId(slot.id);
                              setFormError("");
                            }}
                            className={cn(
                              "rounded-md border px-3 py-3 text-sm font-bold",
                              selectedSlotId === slot.id
                                ? "text-white"
                                : "border-line bg-surface text-ink-body",
                            )}
                            style={
                              selectedSlotId === slot.id
                                ? { background: accent, borderColor: accent }
                                : undefined
                            }
                          >
                            {slot.timeLabel}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!slots.length && (
                    <p className="text-sm text-ink-muted">
                      No routes are open for this address yet.
                    </p>
                  )}
                </div>
              </fieldset>
            </div>

            <aside className="border-t border-line-soft bg-surface-2 p-5 sm:p-7 lg:border-l lg:border-t-0">
              <div className="lg:sticky lg:top-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-subtle">
                  Visit summary
                </p>
                <p
                  className="mt-5 text-2xl font-bold tracking-[-0.04em]"
                  style={{ color: ink }}
                >
                  {petName || "Your pet"}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {selectedPackage?.name ?? "Choose a service"}
                </p>
                <dl className="mt-7 space-y-4 border-y border-line py-5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-subtle">Arrival</dt>
                    <dd
                      className="text-right font-semibold"
                      style={{ color: ink }}
                    >
                      {selectedSlot
                        ? `${selectedSlot.dateLabel}, ${selectedSlot.timeLabel}`
                        : "Not selected"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-subtle">Duration</dt>
                    <dd className="font-semibold" style={{ color: ink }}>
                      {durationMinutes} min
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-subtle">Neighborhood</dt>
                    <dd className="font-semibold" style={{ color: ink }}>
                      {selectedNeighborhood || "Not selected"}
                    </dd>
                  </div>
                </dl>
                <div className="my-6 flex items-end justify-between">
                  <span className="text-sm font-semibold text-ink-muted">
                    Total
                  </span>
                  <span
                    className="text-3xl font-bold tracking-[-0.05em]"
                    style={{ color: ink }}
                  >
                    {formatMoney(totalPrice)}
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={validateAndSubmit}
                  disabled={submitting}
                  className="h-12 w-full rounded-md text-sm font-bold !text-white shadow-none"
                  style={{ background: accent }}
                >
                  {submitting ? "Saving your spot…" : "Confirm visit →"}
                </Button>
                <p className="mt-3 text-center text-[0.68rem] leading-5 text-ink-subtle">
                  No charge until your groomer is confirmed.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
