import { waitUntil } from "cloudflare:workers";
import { eq } from "drizzle-orm";

import {
  appointments,
  groomingPackages,
} from "@/db/schema";
import { findAvailableGroomer } from "@/lib/clipper/data";
import { getDatabase } from "@/lib/clipper/db";

type BookingRequest = {
  petName?: unknown;
  petBreed?: unknown;
  packageId?: unknown;
  neighborhood?: unknown;
  address?: unknown;
  startsAt?: unknown;
};

const REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Unbiased random string over REFERENCE_ALPHABET (32 symbols, so 5 bits per byte via masking). */
function randomReferenceSuffix(length: number): string {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(length)),
    (byte) => REFERENCE_ALPHABET[byte & 31],
  ).join("");
}

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
  const bookingReference = `CLP-${randomReferenceSuffix(10)}`;
  const appointmentId = `apt_${crypto.randomUUID()}`;

  await db.insert(appointments).values({
    id: appointmentId,
    bookingReference,
    petName: petName.trim(),
    petBreed: petBreed.trim(),
    groomerId,
    packageId,
    address: address.trim(),
    neighborhood: neighborhood.trim(),
    startsAt,
    endsAt,
    status: "confirmed",
    priceCents: groomingPackage.priceCents,
    notes: null,
    createdAt: now,
    updatedAt: now,
  });

  // log it, don't make the customer wait for it
  waitUntil(
    Promise.resolve().then(() => {
      console.info("Clipper booking created", {
        bookingReference,
        petName: petName.trim(),
      });
    }),
  );

  return Response.json({ ok: true, reference: bookingReference });
}
