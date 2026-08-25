"use client";

import { CalendarClock, Phone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { buildFallbackSlots, type FallbackSlotDaySpec } from "@/lib/clipper/fallback-slots";
import { formatShortDate, formatTime } from "@/lib/clipper/format";
import type { AppointmentDetails } from "@/lib/clipper/types";
import { cn } from "@/lib/utils";

type ManageAppointmentProps = {
  appointment: AppointmentDetails;
};

const INK = "#0a2540";
const ACCENT = "#635bff";

/**
 * Stand-in arrival times, same as the booking flow: there is no slots endpoint,
 * and the availability check in lib/clipper/data.ts reads these as UTC. The
 * server still validates the choice against the groomer's real schedule.
 */
const SLOT_HOURS = [9, 11, 13, 15];
const SLOT_DAYS = 10;
const FALLBACK_SLOT_DAY_SPECS: FallbackSlotDaySpec[] = Array.from({ length: SLOT_DAYS }, (_, index) => ({
  dayOffset: index + 1,
  hours: SLOT_HOURS,
}));

export function ManageAppointment({ appointment }: ManageAppointmentProps) {
  const router = useRouter();

  const [mode, setMode] = useState<"idle" | "reschedule" | "cancel">("idle");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const isCancelled = appointment.status === "cancelled";
  const isPast = new Date(appointment.startsAt).getTime() <= Date.now();
  const locked = isCancelled || isPast;

  const groupedSlots = useMemo(() => {
    const groups = new Map<string, ReturnType<typeof buildFallbackSlots>>();
    for (const slot of buildFallbackSlots(new Date(), FALLBACK_SLOT_DAY_SPECS)) {
      if (slot.startsAt === appointment.startsAt) continue;
      const bucket = groups.get(slot.dateKey);
      if (bucket) bucket.push(slot);
      else groups.set(slot.dateKey, [slot]);
    }
    return [...groups.entries()];
  }, [appointment.startsAt]);

  async function submit(path: string, body?: Record<string, unknown>) {
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/appointments/${appointment.reference}/${path}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body ?? {}),
        },
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Something went wrong. Please try again.");
        return;
      }
      setMode("idle");
      setSelectedSlot("");
      router.refresh();
    } catch {
      setError("We could not reach Clipper. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-[#dbe3ef] bg-white">
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="font-semibold" style={{ color: INK }}>
            Need to change something?
          </p>
          <p className="mt-1 text-sm text-[#53627a]">
            {isCancelled
              ? "This visit is cancelled. Book a new one whenever you are ready."
              : isPast
                ? "This visit has already happened. Give us a call if something is off."
                : "Move it to another time or cancel it — no fee, no questions."}
          </p>
        </div>

        {locked ? (
          <a
            href="tel:+8225550142"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#635bff] hover:text-[#0a2540]"
          >
            <Phone aria-hidden="true" className="size-4" /> 02-555-0142
          </a>
        ) : (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                setError("");
                setMode(mode === "reschedule" ? "idle" : "reschedule");
              }}
              className="rounded-full px-5 text-sm font-bold !text-white hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              <CalendarClock aria-hidden="true" className="size-4" />
              Reschedule
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError("");
                setMode(mode === "cancel" ? "idle" : "cancel");
              }}
              className="rounded-full border-[#dbe3ef] px-5 text-sm font-bold text-[#9f3f38] hover:bg-[#fff0ef] hover:text-[#9f3f38]"
            >
              <X aria-hidden="true" className="size-4" />
              Cancel visit
            </Button>
          </div>
        )}
      </div>

      {mode === "reschedule" && !locked ? (
        <div className="border-t border-[#e6ebf1] bg-[#f7f9fc] px-5 py-6 sm:px-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8898aa]">
            Pick a new time with {appointment.groomer?.name ?? "your groomer"}
          </p>
          <p className="mt-2 text-sm text-[#53627a]">
            Currently {formatShortDate(appointment.startsAt)} ·{" "}
            {formatTime(appointment.startsAt)}
          </p>

          <div className="mt-5 space-y-4">
            {groupedSlots.map(([dateKey, slots]) => (
              <div key={dateKey}>
                <p className="mb-2 text-sm font-semibold" style={{ color: INK }}>
                  {slots[0].dateLabel}
                </p>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => {
                    const active = selectedSlot === slot.startsAt;
                    return (
                      <button
                        key={slot.startsAt}
                        type="button"
                        onClick={() => setSelectedSlot(slot.startsAt)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                          active
                            ? "border-transparent !text-white"
                            : "border-[#dbe3ef] bg-white text-[#53627a] hover:border-[#635bff] hover:text-[#0a2540]",
                        )}
                        style={active ? { backgroundColor: ACCENT } : undefined}
                        aria-pressed={active}
                      >
                        {slot.timeLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={pending || !selectedSlot}
              onClick={() => submit("reschedule", { startsAt: selectedSlot })}
              className="rounded-full px-6 text-sm font-bold !text-white hover:opacity-90"
              style={{ backgroundColor: INK }}
            >
              {pending ? "Moving your visit…" : "Confirm new time"}
            </Button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="text-sm font-semibold text-[#53627a] hover:text-[#0a2540]"
            >
              Never mind
            </button>
          </div>
        </div>
      ) : null}

      {mode === "cancel" && !locked ? (
        <div className="border-t border-[#e6ebf1] bg-[#fff8f7] px-5 py-6 sm:px-7">
          <p className="font-semibold" style={{ color: INK }}>
            Cancel {appointment.pet.name}&apos;s visit?
          </p>
          <p className="mt-1 text-sm text-[#53627a]">
            The {formatShortDate(appointment.startsAt)} ·{" "}
            {formatTime(appointment.startsAt)} slot will be released to another
            pet. This cannot be undone.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={pending}
              onClick={() => submit("cancel")}
              className="rounded-full bg-[#9f3f38] px-6 text-sm font-bold !text-white hover:bg-[#8a352f]"
            >
              {pending ? "Cancelling…" : "Yes, cancel this visit"}
            </Button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="text-sm font-semibold text-[#53627a] hover:text-[#0a2540]"
            >
              Keep my appointment
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="border-t border-[#e6ebf1] px-5 py-4 sm:px-7">
          <Alert className="border-[#f3c4c0] bg-[#fff0ef] text-[#9f3f38]">
            <AlertDescription className="text-[#9f3f38]">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
    </div>
  );
}
