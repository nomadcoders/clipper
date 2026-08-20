import type { Appointment } from "@/db/schema";

import { getAppointmentRowByReference } from "./data";

/** Statuses a customer is still allowed to cancel or reschedule from. */
const CHANGEABLE_STATUSES = new Set(["confirmed", "pending"]);

type ChangeableResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; status: number; error: string };

/**
 * Shared gate for both customer-facing writes: the appointment has to exist,
 * still be open (cancelled and completed are terminal), and not have started.
 */
export async function loadChangeableAppointment(
  reference: string,
  now: Date,
): Promise<ChangeableResult> {
  const appointment = await getAppointmentRowByReference(reference);

  if (!appointment) {
    return { ok: false, status: 404, error: "That booking reference was not found." };
  }

  if (!CHANGEABLE_STATUSES.has(appointment.status)) {
    return {
      ok: false,
      status: 409,
      error: `This visit is ${appointment.status} and can no longer be changed.`,
    };
  }

  if (appointment.startsAt.getTime() <= now.getTime()) {
    return {
      ok: false,
      status: 409,
      error: "This visit has already started. Give us a call and we'll sort it out.",
    };
  }

  return { ok: true, appointment };
}

/** Same rule as the API guard, for deciding what the appointment page renders. */
export function isChangeable(
  appointment: { status: string; startsAt: string },
  now: Date,
): boolean {
  return (
    CHANGEABLE_STATUSES.has(appointment.status) &&
    new Date(appointment.startsAt).getTime() > now.getTime()
  );
}
