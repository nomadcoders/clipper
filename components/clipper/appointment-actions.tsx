"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, Button } from "@/components/ui";
import { buildSampleSlots } from "@/lib/clipper/sample-slots";

type AppointmentActionsProps = {
  reference: string;
  /** False once the visit is cancelled, completed or in the past. */
  canChange: boolean;
};

type Mode = "idle" | "reschedule" | "cancel";

const slotLabel = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function AppointmentActions({ reference, canChange }: AppointmentActionsProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [slots] = useState(() => buildSampleSlots());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);
  const firstControlRef = useRef<HTMLDivElement>(null);

  // Move focus to the result (or the opened panel) so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (success) statusRef.current?.focus();
  }, [success]);

  useEffect(() => {
    if (mode !== "idle") firstControlRef.current?.focus();
  }, [mode]);

  async function send(body: Record<string, string>, successMessage: string) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(reference)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(data?.error ?? "We couldn’t update that visit. Please try again.");
        return;
      }
      setMode("idle");
      setSuccess(successMessage);
      router.refresh();
    } catch {
      setError("We couldn’t reach Clipper. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <p ref={statusRef} tabIndex={-1} role="status" className="rounded-2xl border border-(--bd-bfe8db) bg-(--bg-e7f8f1) px-5 py-4 text-sm font-semibold text-(--fg-08775d) outline-none">
        {success}
      </p>
    );
  }

  if (!canChange) return null;

  return (
    <div className="rounded-2xl border border-(--bd-dbe3ef) bg-(--bg-ffffff) px-5 py-5 text-sm text-(--fg-53627a) sm:px-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-(--fg-0a2540)">Change this visit</p>
          <p className="mt-1">Pick a new time or cancel. Rescheduling may change your groomer.</p>
        </div>
        {mode === "idle" && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setMode("reschedule")}>Reschedule</Button>
            <Button type="button" variant="outline" onClick={() => setMode("cancel")}>Cancel visit</Button>
          </div>
        )}
      </div>

      {error && <Alert className="mt-4 border-(--bd-f3aaa0) bg-(--bg-fff3f0) text-(--fg-8f3d30)"><AlertDescription>{error}</AlertDescription></Alert>}

      {mode === "reschedule" && (
        <fieldset className="mt-5" disabled={busy}>
          <legend className="mb-3 font-semibold text-(--fg-0a2540)">Choose a new arrival time</legend>
          <div ref={firstControlRef} tabIndex={-1} className="grid gap-2 outline-none sm:grid-cols-2">
            {slots.map((slot) => (
              <label key={slot.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-(--bd-dbe3ef) px-3 py-3 has-[:checked]:border-(--bd-635bff) has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-(--bd-635bff)">
                <input type="radio" name="new-slot" value={slot.startsAt} checked={selectedSlot === slot.startsAt} onChange={() => { setSelectedSlot(slot.startsAt); setError(""); }} />
                <span>{slotLabel.format(new Date(slot.startsAt))}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" disabled={!selectedSlot || busy} onClick={() => send({ action: "reschedule", startsAt: selectedSlot }, "Your visit has been rescheduled.")}>{busy ? "Saving…" : "Confirm new time"}</Button>
            <Button type="button" variant="ghost" onClick={() => { setMode("idle"); setError(""); }}>Keep current time</Button>
          </div>
        </fieldset>
      )}

      {mode === "cancel" && (
        <div className="mt-5">
          <div ref={firstControlRef} tabIndex={-1} className="font-semibold text-(--fg-0a2540) outline-none">Cancel this visit? This can’t be undone.</div>
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="destructive" disabled={busy} onClick={() => send({ action: "cancel" }, "Your visit has been cancelled.")}>{busy ? "Cancelling…" : "Yes, cancel visit"}</Button>
            <Button type="button" variant="ghost" disabled={busy} onClick={() => { setMode("idle"); setError(""); }}>Keep visit</Button>
          </div>
        </div>
      )}
    </div>
  );
}
