import { waitUntil } from "cloudflare:workers";
import { eq } from "drizzle-orm";

import { appointments } from "@/db/schema";
import { loadChangeableAppointment } from "@/lib/clipper/appointment-changes";
import { getDatabase } from "@/lib/clipper/db";

type RouteContext = {
  params: Promise<{ reference: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { reference } = await context.params;
  const now = new Date();

  const result = await loadChangeableAppointment(reference, now);
  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.error },
      { status: result.status },
    );
  }

  const db = getDatabase();
  await db
    .update(appointments)
    .set({ status: "cancelled", updatedAt: now })
    .where(eq(appointments.id, result.appointment.id));

  // log it, don't make the customer wait for it
  waitUntil(
    Promise.resolve().then(() => {
      console.info("Clipper booking cancelled", {
        bookingReference: result.appointment.bookingReference,
      });
    }),
  );

  return Response.json({
    ok: true,
    reference: result.appointment.bookingReference,
  });
}
