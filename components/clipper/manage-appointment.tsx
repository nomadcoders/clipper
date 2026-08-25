"use client";

import { CalendarClock, Phone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatShortDate, formatTime } from "@/lib/clipper/format";
import type { AppointmentDetails } from "@/lib/clipper/types";
import { cn } from "@/lib/utils";

type ManageAppointmentProps = {
  appointment: AppointmentDetails;
};

type Slot = {
  startsAt: string;
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
};

/**
 * Stand-in arrival times, same as the booking flow: there is no slots endpoint,
 * and the availability check in lib/clipper/data.ts reads these as UTC. The
 * server still validates the choice against the groomer's real schedule.
 */
const SLOT_HOURS = [9, 11, 13, 15];
const SLOT_DAYS = 10;

function buildSlots(from: Date): Slot[] {
  const slots: Slot[] = [];
  for (let dayOffset = 1; dayOffset <= SLOT_DAYS; dayOffset += 1) {
    const day = new Date(from);
    day.setUTCDate(day.getUTCDate() + dayOffset);
    for (const hour of SLOT_HOURS) {
      const start = new Date(
        Date.UTC(
          day.getUTCFullYear(),
          day.getUTCMonth(),
          day.getUTCDate(),
          hour,
          0,
          0,
        ),
      );
      const startsAt = start.toISOString();
      slots.push({
        startsAt,
        dateKey: startsAt.slice(0, 10),
        dateLabel: formatShortDate(startsAt),
        timeLabel: formatTime(startsAt),
      });
    }
  }
  return slots;
}

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
    const groups = new Map<string, Slot[]>();
    for (const slot of buildSlots(new Date())) {
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
    <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="font-semibold text-ink">
            Need to change something?
          </p>
          <p className="mt-1 text-sm text-ink-3">
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
            className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-ink"
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
              className="rounded-full bg-accent px-5 text-sm font-bold !text-white hover:opacity-90"
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
              className="rounded-full border-line px-5 text-sm font-bold text-err hover:bg-err-bg hover:text-err"
            >
              <X aria-hidden="true" className="size-4" />
              Cancel visit
            </Button>
          </div>
        )}
      </div>

      {mode === "reschedule" && !locked ? (
        <div className="border-t border-line-2 bg-surface-alt px-5 py-6 sm:px-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-4">
            Pick a new time with {appointment.groomer?.name ?? "your groomer"}
          </p>
          <p className="mt-2 text-sm text-ink-3">
            Currently {formatShortDate(appointment.startsAt)} ·{" "}
            {formatTime(appointment.startsAt)}
          </p>

          <div className="mt-5 space-y-4">
            {groupedSlots.map(([dateKey, slots]) => (
              <div key={dateKey}>
                <p className="mb-2 text-sm font-semibold text-ink">
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
                            ? "border-accent bg-accent !text-white"
                            : "border-line bg-surface text-ink-3 hover:border-accent hover:text-ink",
                        )}
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
              className="rounded-full bg-ink px-6 text-sm font-bold !text-white hover:opacity-90"
            >
              {pending ? "Moving your visit…" : "Confirm new time"}
            </Button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="text-sm font-semibold text-ink-3 hover:text-ink"
            >
              Never mind
            </button>
          </div>
        </div>
      ) : null}

      {mode === "cancel" && !locked ? (
        <div className="border-t border-line-2 bg-err-bg px-5 py-6 sm:px-7">
          <p className="font-semibold text-ink">
            Cancel {appointment.pet.name}&apos;s visit?
          </p>
          <p className="mt-1 text-sm text-ink-3">
            The {formatShortDate(appointment.startsAt)} ·{" "}
            {formatTime(appointment.startsAt)} slot will be released to another
            pet. This cannot be undone.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={pending}
              onClick={() => submit("cancel")}
              className="rounded-full bg-err px-6 text-sm font-bold !text-white hover:bg-err/90"
            >
              {pending ? "Cancelling…" : "Yes, cancel this visit"}
            </Button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="text-sm font-semibold text-ink-3 hover:text-ink"
            >
              Keep my appointment
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="border-t border-line-2 px-5 py-4 sm:px-7">
          <Alert className="border-err-line bg-err-bg text-err">
            <AlertDescription className="text-err">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
    </div>
  );
}
