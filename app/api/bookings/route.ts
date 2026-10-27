import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";

import { groomingPackages } from "@/db/schema";
import { findAvailableGroomer } from "@/lib/clipper/data";
import { getDatabase } from "@/lib/clipper/db";

// 32 characters, so a random byte masked to 5 bits maps without modulo bias.
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateBookingReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const code = Array.from(bytes, (byte) => REFERENCE_ALPHABET[byte & 31]);

  return `CLP-${code.join("")}`;
}

type BookingRequest = {
  petName?: unknown;
  petBreed?: unknown;
  packageId?: unknown;
  neighborhood?: unknown;
  address?: unknown;
  startsAt?: unknown;
};

export async function POST(request: Request) {
  let input: BookingRequest;

  try {
    input = (await request.json()) as BookingRequest;
  } catch {
    return Response.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const requiredFields = [
    "petName",
    "petBreed",
    "packageId",
    "neighborhood",
    "address",
    "startsAt",
  ] as const;
  const missingFields = requiredFields.filter((field) => {
    const value = input[field];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missingFields.length > 0) {
    return Response.json(
      {
        ok: false,
        error: `Missing required fields: ${missingFields.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const petName = input.petName as string;
  const petBreed = input.petBreed as string;
  const packageId = input.packageId as string;
  const neighborhood = input.neighborhood as string;
  const address = input.address as string;
  const startsAt = new Date(input.startsAt as string);

  if (Number.isNaN(startsAt.getTime())) {
    return Response.json(
      { ok: false, error: "startsAt must be a valid date." },
      { status: 400 },
    );
  }

  const db = getDatabase();
  const [groomingPackage] = await db
    .select()
    .from(groomingPackages)
    .where(eq(groomingPackages.id, packageId))
    .limit(1);

  if (!groomingPackage) {
    return Response.json(
      { ok: false, error: "Grooming package was not found." },
      { status: 404 },
    );
  }

  const endsAt = new Date(
    startsAt.getTime() + groomingPackage.durationMinutes * 60 * 1000,
  );
  const groomerId = await findAvailableGroomer(
    neighborhood,
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

  const now = new Date();
  const bookingReference = generateBookingReference();
  const appointmentId = `apt_${crypto.randomUUID()}`;

  // Insert only if the groomer is still free, in one statement, so two
  // concurrent requests cannot double-book the same slot.
  const result = await env.DB.prepare(
    `INSERT INTO appointments (
       id, booking_reference, pet_name, pet_breed, groomer_id, package_id,
       address, neighborhood, starts_at, ends_at, status, price_cents,
       notes, created_at, updated_at
     )
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, NULL, ?, ?
     WHERE NOT EXISTS (
       SELECT 1 FROM appointments
       WHERE groomer_id = ?
         AND starts_at < ?
         AND ends_at > ?
         AND status <> 'cancelled'
     )`,
  )
    .bind(
      appointmentId,
      bookingReference,
      petName.trim(),
      petBreed.trim(),
      groomerId,
      packageId,
      address.trim(),
      neighborhood.trim(),
      startsAt.getTime(),
      endsAt.getTime(),
      groomingPackage.priceCents,
      now.getTime(),
      now.getTime(),
      groomerId,
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

  console.info(
    JSON.stringify({ message: "booking created", bookingReference, appointmentId }),
  );

  return Response.json({ ok: true, reference: bookingReference });
}
