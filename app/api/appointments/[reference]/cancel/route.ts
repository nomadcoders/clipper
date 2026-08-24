import { cancelAppointment } from "@/lib/clipper/data";

import { statusForReason } from "../status";

type RouteContext = { params: Promise<{ reference: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { reference } = await context.params;
  const result = await cancelAppointment(reference);

  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.message },
      { status: statusForReason(result.reason) },
    );
  }

  return Response.json({ ok: true, appointment: result.appointment });
}
