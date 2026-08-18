import {
  and,
  desc,
  eq,
  gt,
  inArray,
  lt,
  ne,
} from "drizzle-orm";

import {
  appointments,
  groomerSchedules,
  groomerServiceAreas,
  groomers,
  groomingPackages,
} from "@/db/schema";

import { getDatabase } from "./db";
import type {
  AppointmentDetails,
  BookingOption,
  GroomingPackage,
} from "./types";

export async function getBookingOptions(): Promise<BookingOption> {
  const db = getDatabase();

  const packageRows = await db.select().from(groomingPackages);
  const neighborhoodRows = await db
    .select({ neighborhood: groomerServiceAreas.neighborhood })
    .from(groomerServiceAreas);

  const neighborhoods = [
    ...new Set(neighborhoodRows.map((row) => row.neighborhood)),
  ].sort();

  return {
    packages: packageRows,
    neighborhoods,
  };
}

export async function getAppointmentByReference(
  reference: string,
): Promise<AppointmentDetails | null> {
  const db = getDatabase();
  const rows = await db
    .select({
      appointment: appointments,
      groomer: groomers,
      groomingPackage: groomingPackages,
    })
    .from(appointments)
    .leftJoin(groomers, eq(appointments.groomerId, groomers.id))
    .innerJoin(
      groomingPackages,
      eq(appointments.packageId, groomingPackages.id),
    )
    .where(eq(appointments.bookingReference, reference))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    ...row.appointment,
    reference: row.appointment.bookingReference,
    pet: { name: row.appointment.petName, breed: row.appointment.petBreed },
    groomer: row.groomer,
    package: row.groomingPackage,
    startsAt: row.appointment.startsAt.toISOString(),
    endsAt: row.appointment.endsAt.toISOString(),
    createdAt: row.appointment.createdAt.toISOString(),
    updatedAt: row.appointment.updatedAt.toISOString(),
  };
}

export async function getAppointments(): Promise<AppointmentDetails[]> {
  const db = getDatabase();
  const rows = await db
    .select({
      appointment: appointments,
      groomer: groomers,
      groomingPackage: groomingPackages,
    })
    .from(appointments)
    .leftJoin(groomers, eq(appointments.groomerId, groomers.id))
    .innerJoin(groomingPackages, eq(appointments.packageId, groomingPackages.id))
    .orderBy(desc(appointments.startsAt));

  return rows.map((row) => ({
    ...row.appointment,
    reference: row.appointment.bookingReference,
    pet: { name: row.appointment.petName, breed: row.appointment.petBreed },
    groomer: row.groomer,
    package: row.groomingPackage,
    startsAt: row.appointment.startsAt.toISOString(),
    endsAt: row.appointment.endsAt.toISOString(),
    createdAt: row.appointment.createdAt.toISOString(),
    updatedAt: row.appointment.updatedAt.toISOString(),
  }));
}

export async function findAvailableGroomer(
  neighborhood: string,
  startsAt: Date,
  endsAt: Date,
): Promise<string | null> {
  const db = getDatabase();
  const weekday = startsAt.getUTCDay();
  const requestedStart = timeOfDay(startsAt);
  const requestedEnd = timeOfDay(endsAt);

  const scheduledGroomers = await db
    .select({
      groomerId: groomers.id,
      startTime: groomerSchedules.startTime,
      endTime: groomerSchedules.endTime,
    })
    .from(groomers)
    .innerJoin(
      groomerServiceAreas,
      eq(groomerServiceAreas.groomerId, groomers.id),
    )
    .innerJoin(
      groomerSchedules,
      and(
        eq(groomerSchedules.groomerId, groomers.id),
        eq(groomerSchedules.weekday, weekday),
      ),
    )
    .where(
      and(
        eq(groomers.active, true),
        eq(groomerServiceAreas.neighborhood, neighborhood),
        eq(groomerSchedules.available, true),
      ),
    );

  const candidates = scheduledGroomers.filter(
    (groomer) =>
      groomer.startTime <= requestedStart && groomer.endTime >= requestedEnd,
  );
  if (candidates.length === 0) return null;

  const candidateIds = candidates.map((groomer) => groomer.groomerId);
  const conflictingAppointments = await db
    .select({ groomerId: appointments.groomerId })
    .from(appointments)
    .where(
      and(
        inArray(appointments.groomerId, candidateIds),
        lt(appointments.startsAt, endsAt),
        gt(appointments.endsAt, startsAt),
        ne(appointments.status, "cancelled"),
      ),
    );

  const busyGroomerIds = new Set(
    conflictingAppointments
      .map((appointment) => appointment.groomerId)
      .filter((groomerId): groomerId is string => Boolean(groomerId)),
  );

  return (
    candidates.find((groomer) => !busyGroomerIds.has(groomer.groomerId))
      ?.groomerId ?? null
  );
}

function timeOfDay(date: Date): string {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
    date.getUTCMinutes(),
  ).padStart(2, "0")}`;
}
