import { eq } from "drizzle-orm";

import { appointments, groomingPackages } from "@/db/schema";
import { loadChangeableAppointment } from "@/lib/clipper/appointment-changes";
import { findAvailableGroomer } from "@/lib/clipper/data";
import { getDatabase } from "@/lib/clipper/db";

type RescheduleRequest = {
  startsAt?: unknown;
};

type RouteContext = {
  params: Promise<{ reference: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { reference } = await context.params;
  const now = new Date();

  let input: RescheduleRequest;

  try {
    input = (await request.json()) as RescheduleRequest;
  } catch {
    return Response.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (typeof input.startsAt !== "string" || input.startsAt.trim().length === 0) {
    return Response.json(
      { ok: false, error: "Missing required fields: startsAt." },
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

  if (startsAt.getTime() <= now.getTime()) {
    return Response.json(
      { ok: false, error: "Pick an arrival time in the future." },
      { status: 400 },
    );
  }

  const result = await loadChangeableAppointment(reference, now);
  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.error },
      { status: result.status },
    );
  }

  const { appointment } = result;
  const db = getDatabase();
  const [groomingPackage] = await db
    .select()
    .from(groomingPackages)
    .where(eq(groomingPackages.id, appointment.packageId))
    .limit(1);

  if (!groomingPackage) {
    return Response.json(
      { ok: false, error: "Grooming package was not found." },
      { status: 404 },
    );
  }

  // duration stays server-derived from the booked package; price never moves
  const endsAt = new Date(
    startsAt.getTime() + groomingPackage.durationMinutes * 60 * 1000,
  );
  const groomerId = await findAvailableGroomer(
    appointment.neighborhood,
    startsAt,
    endsAt,
    appointment.id,
  );

  if (!groomerId) {
    return Response.json(
      {
        ok: false,
        error: "No groomer is available for that neighborhood and time.",
      },
      { status: 409 },
    );
  }

  await db
    .update(appointments)
    .set({ startsAt, endsAt, groomerId, updatedAt: now })
    .where(eq(appointments.id, appointment.id));

  // log it, don't make the customer wait for it
  Promise.resolve().then(() => {
    console.info("Clipper booking rescheduled", {
      bookingReference: appointment.bookingReference,
      startsAt: startsAt.toISOString(),
    });
  });

  return Response.json({
    ok: true,
    reference: appointment.bookingReference,
    groomerChanged: groomerId !== appointment.groomerId,
  });
}
