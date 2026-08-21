import { cache } from "react";

import { and, desc, eq, gt, inArray, lt, ne } from "drizzle-orm";

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
  BookingSlot,
  GroomingPackage,
} from "./types";

// TODO: derive real slots from groomer_schedules minus booked appointments.
// Until then the booking form shows these fixed placeholder arrival times.
const PLACEHOLDER_SLOTS: BookingSlot[] = [
  {
    id: "placeholder-fri-10",
    startsAt: "2026-08-21T10:00:00Z",
    label: "10:00 AM",
  },
  {
    id: "placeholder-fri-13",
    startsAt: "2026-08-21T13:00:00Z",
    label: "1:00 PM",
  },
  {
    id: "placeholder-sat-11",
    startsAt: "2026-08-22T11:00:00Z",
    label: "11:00 AM",
  },
  {
    id: "placeholder-sat-14",
    startsAt: "2026-08-22T14:00:00Z",
    label: "2:00 PM",
  },
];

export const getBookingOptions = cache(async (): Promise<BookingOption> => {
  const db = getDatabase();

  const [packageRows, neighborhoodRows] = await Promise.all([
    db.select().from(groomingPackages),
    db
      .select({ neighborhood: groomerServiceAreas.neighborhood })
      .from(groomerServiceAreas),
  ]);

  const neighborhoods = [
    ...new Set(neighborhoodRows.map((row) => row.neighborhood)),
  ].sort();

  return {
    packages: packageRows,
    neighborhoods,
    availableSlots: PLACEHOLDER_SLOTS,
  };
});

export const getAppointmentByReference = cache(
  async (reference: string): Promise<AppointmentDetails | null> => {
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
  },
);

export const getAppointments = cache(
  async (): Promise<AppointmentDetails[]> => {
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
  },
);

/** Raw appointment row, for the write paths that need Date objects, not the view model. */
export async function getAppointmentRowByReference(reference: string) {
  const db = getDatabase();
  const [row] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.bookingReference, reference))
    .limit(1);

  return row ?? null;
}

/**
 * `excludeAppointmentId` keeps an appointment from blocking its own reschedule
 * when the new time overlaps the time it is being moved out of.
 */
export async function findAvailableGroomer(
  neighborhood: string,
  startsAt: Date,
  endsAt: Date,
  excludeAppointmentId?: string,
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
        ...(excludeAppointmentId
          ? [ne(appointments.id, excludeAppointmentId)]
          : []),
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
