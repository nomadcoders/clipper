"use client";

import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription, Button } from "@/components/ui";
import type { BookingSlot } from "@/lib/clipper/types";
import { cn } from "@/lib/utils";

type AppointmentActionsProps = {
  reference: string;
  status: string;
  /** Already filtered server-side: future only, current arrival time removed. */
  slots: BookingSlot[];
  changeable: boolean;
};

type OpenPanel = "none" | "reschedule" | "cancel";

const accent = "var(--brand)";

export function AppointmentActions({
  reference,
  status,
  slots,
  changeable,
}: AppointmentActionsProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<OpenPanel>("none");
  const [selectedSlotId, setSelectedSlotId] = useState(() => slots[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);

  function openPanel(next: OpenPanel) {
    setPanel((current) => (current === next ? "none" : next));
    setError("");
  }

  async function submit(path: string, body?: Record<string, unknown>) {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/appointments/${encodeURIComponent(reference)}/${path}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body ?? {}),
        },
      );
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !data?.ok) {
        setError(
          data?.error ?? "Something went wrong. Please try again or give us a call.",
        );
        setSubmitting(false);
        return;
      }

      setPanel("none");
      setSubmitting(false);
      router.refresh();
    } catch {
      setError("We couldn’t reach Clipper just now. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-line bg-surface px-5 py-5 text-sm text-ink-muted sm:px-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-ink">Need to change something?</p>
          <p className="mt-1">
            {changeable
              ? "Move this visit to another time, or cancel it — no charge either way."
              : status === "cancelled"
                ? "This visit is cancelled. Book a new one whenever you’re ready."
                : "This visit can no longer be changed online."}
          </p>
        </div>

        {changeable ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => openPanel("reschedule")}
              disabled={submitting}
              className="h-11 rounded-full px-5 text-sm font-bold !text-white shadow-none"
              style={{ background: accent }}
            >
              Reschedule
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => openPanel("cancel")}
              disabled={submitting}
              className="h-11 rounded-full border-line px-5 text-sm font-bold text-ink-muted shadow-none hover:text-danger-ink"
            >
              Cancel visit
            </Button>
          </div>
        ) : (
          <a
            href="tel:+8225550142"
            className="inline-flex shrink-0 items-center gap-2 font-bold text-brand hover:text-ink"
          >
            <Phone aria-hidden="true" className="size-4" /> 02-555-0142
          </a>
        )}
      </div>

      {error && (
        <Alert className="mt-5 border-danger-line bg-danger-bg text-danger-ink">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {panel === "reschedule" && (
        <div className="mt-5 border-t border-line-soft pt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-subtle">
            Pick a new arrival time
          </p>

          {slots.length === 0 ? (
            <p className="mt-3">
              No other times are open online right now. Give us a call at{" "}
              <a href="tel:+8225550142" className="font-bold text-brand hover:text-ink">
                02-555-0142
              </a>{" "}
              and we’ll find one for you.
            </p>
          ) : (
            <>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot.id}
                    onClick={() => {
                      setSelectedSlotId(slot.id);
                      setError("");
                    }}
                    aria-pressed={selectedSlotId === slot.id}
                    className={cn(
                      "rounded-md border px-4 py-3 text-left text-sm font-bold",
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
                    {slot.label ?? slot.startsAt}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={() => submit("reschedule", { startsAt: selectedSlot?.startsAt })}
                  disabled={submitting || !selectedSlot}
                  className="h-11 rounded-full px-5 text-sm font-bold !text-white shadow-none"
                  style={{ background: accent }}
                >
                  {submitting ? "Moving your visit…" : "Confirm new time"}
                </Button>
                <button
                  type="button"
                  onClick={() => openPanel("none")}
                  disabled={submitting}
                  className="text-sm font-semibold text-ink-subtle hover:text-ink"
                >
                  Never mind
                </button>
              </div>
              <p className="mt-3 text-xs text-ink-subtle">
                We’ll re-match your route, so your groomer may change.
              </p>
            </>
          )}
        </div>
      )}

      {panel === "cancel" && (
        <div className="mt-5 border-t border-line-soft pt-5">
          <p className="font-semibold text-ink">Cancel this visit?</p>
          <p className="mt-1">
            Your groomer’s time opens back up right away. You can always book again later.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => submit("cancel")}
              disabled={submitting}
              className="h-11 rounded-full bg-[#9f3f38] px-5 text-sm font-bold !text-white shadow-none hover:bg-[#7f302a]"
            >
              {submitting ? "Cancelling…" : "Yes, cancel this visit"}
            </Button>
            <button
              type="button"
              onClick={() => openPanel("none")}
              disabled={submitting}
              className="text-sm font-semibold text-ink-subtle hover:text-ink"
            >
              Keep it
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
