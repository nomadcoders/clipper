import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";

import { appointments, groomingPackages } from "@/db/schema";
import { findAvailableGroomer } from "@/lib/clipper/data";
import { getDatabase } from "@/lib/clipper/db";

type ChangeRequest = {
  action?: unknown;
  startsAt?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  let input: ChangeRequest;

  try {
    input = (await request.json()) as ChangeRequest;
  } catch {
    return Response.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const db = getDatabase();
  const [row] = await db
    .select({
      appointment: appointments,
      durationMinutes: groomingPackages.durationMinutes,
    })
    .from(appointments)
    .innerJoin(groomingPackages, eq(appointments.packageId, groomingPackages.id))
    .where(eq(appointments.bookingReference, reference))
    .limit(1);

  if (!row) {
    return Response.json(
      { ok: false, error: "Appointment was not found." },
      { status: 404 },
    );
  }

  const { appointment } = row;
  const isOpen =
    appointment.status === "confirmed" || appointment.status === "pending";

  if (!isOpen || appointment.startsAt.getTime() <= Date.now()) {
    return Response.json(
      { ok: false, error: "Only upcoming visits can be changed." },
      { status: 409 },
    );
  }

  const now = new Date();

  if (input.action === "cancel") {
    await db
      .update(appointments)
      .set({ status: "cancelled", updatedAt: now })
      .where(eq(appointments.id, appointment.id));

    return Response.json({ ok: true, status: "cancelled" });
  }

  if (input.action !== "reschedule") {
    return Response.json(
      { ok: false, error: "action must be \"cancel\" or \"reschedule\"." },
      { status: 400 },
    );
  }

  const startsAt = new Date(
    typeof input.startsAt === "string" ? input.startsAt : Number.NaN,
  );

  if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
    return Response.json(
      { ok: false, error: "startsAt must be a valid future date." },
      { status: 400 },
    );
  }

  const endsAt = new Date(startsAt.getTime() + row.durationMinutes * 60 * 1000);
  const groomerId = await findAvailableGroomer(
    appointment.neighborhood,
    startsAt,
    endsAt,
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

  // Move the visit only if the groomer is still free, in one statement, so a
  // concurrent booking cannot land on the same slot.
  const result = await env.DB.prepare(
    `UPDATE appointments
     SET starts_at = ?, ends_at = ?, groomer_id = ?, updated_at = ?
     WHERE id = ?
       AND status IN ('confirmed', 'pending')
       AND NOT EXISTS (
         SELECT 1 FROM appointments
         WHERE groomer_id = ?
           AND id <> ?
           AND starts_at < ?
           AND ends_at > ?
           AND status <> 'cancelled'
       )`,
  )
    .bind(
      startsAt.getTime(),
      endsAt.getTime(),
      groomerId,
      now.getTime(),
      appointment.id,
      groomerId,
      appointment.id,
      endsAt.getTime(),
      startsAt.getTime(),
    )
    .run();

  if (result.meta.changes === 0) {
    return Response.json(
      {
        ok: false,
        error: "No groomer is available for that neighborhood and time.",
      },
      { status: 409 },
    );
  }

  return Response.json({ ok: true, startsAt: startsAt.toISOString() });
}
