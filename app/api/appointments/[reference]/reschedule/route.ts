import { rescheduleAppointment } from "@/lib/clipper/data";

import { statusForReason } from "../status";

type RouteContext = { params: Promise<{ reference: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { reference } = await context.params;

  let input: { startsAt?: unknown };
  try {
    input = (await request.json()) as { startsAt?: unknown };
  } catch {
    return Response.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (typeof input.startsAt !== "string" || input.startsAt.trim() === "") {
    return Response.json(
      { ok: false, error: "startsAt is required." },
      { status: 400 },
    );
  }

  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return Response.json(
      { ok: false, error: "startsAt must be a valid date." },
      { status: 400 },
    );
  }

  const result = await rescheduleAppointment(reference, startsAt);

  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.message },
      { status: statusForReason(result.reason) },
    );
  }

  return Response.json({ ok: true, appointment: result.appointment });
}
