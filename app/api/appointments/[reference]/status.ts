import type { AppointmentChangeResult } from "@/lib/clipper/data";

type ChangeFailure = Extract<AppointmentChangeResult, { ok: false }>;

/** Maps a change failure onto the HTTP status the client should see. */
export function statusForReason(reason: ChangeFailure["reason"]): number {
  switch (reason) {
    case "not_found":
      return 404;
    case "past":
      return 400;
    default:
      return 409;
  }
}
