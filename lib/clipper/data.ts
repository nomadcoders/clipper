import {
  and,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  lte,
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
import type { AppointmentDetails, BookingOption } from "./types";

/** The three-table shape every appointment query selects. */
const appointmentSelection = {
  appointment: appointments,
  groomer: groomers,
  groomingPackage: groomingPackages,
};

type AppointmentRow = {
  appointment: typeof appointments.$inferSelect;
  groomer: typeof groomers.$inferSelect | null;
  groomingPackage: typeof groomingPackages.$inferSelect;
};

function toAppointmentDetails(row: AppointmentRow): AppointmentDetails {
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

export async function getBookingOptions(): Promise<BookingOption> {
  const db = getDatabase();

  const [packages, neighborhoodRows] = await Promise.all([
    db.select().from(groomingPackages),
    db
      .selectDistinct({ neighborhood: groomerServiceAreas.neighborhood })
      .from(groomerServiceAreas)
      .orderBy(groomerServiceAreas.neighborhood),
  ]);

  return {
    packages,
    neighborhoods: neighborhoodRows.map((row) => row.neighborhood),
  };
}

export async function getAppointmentByReference(
  reference: string,
): Promise<AppointmentDetails | null> {
  const db = getDatabase();
  const rows = await db
    .select(appointmentSelection)
    .from(appointments)
    .leftJoin(groomers, eq(appointments.groomerId, groomers.id))
    .innerJoin(
      groomingPackages,
      eq(appointments.packageId, groomingPackages.id),
    )
    .where(eq(appointments.bookingReference, reference))
    .limit(1);

  const row = rows[0];
  return row ? toAppointmentDetails(row) : null;
}

export async function getAppointments(): Promise<AppointmentDetails[]> {
  const db = getDatabase();
  const rows = await db
    .select(appointmentSelection)
    .from(appointments)
    .leftJoin(groomers, eq(appointments.groomerId, groomers.id))
    .innerJoin(groomingPackages, eq(appointments.packageId, groomingPackages.id))
    .orderBy(desc(appointments.startsAt));

  return rows.map(toAppointmentDetails);
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

  const candidates = await db
    .select({ groomerId: groomers.id })
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
        // "HH:MM" sorts lexicographically, so D1 can apply the window itself.
        lte(groomerSchedules.startTime, requestedStart),
        gte(groomerSchedules.endTime, requestedEnd),
      ),
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

/**
 * Outcome of a customer-driven change to an existing appointment.
 *
 * The `reason` values are stable strings so the API routes can map them onto
 * HTTP statuses without re-deriving the failure.
 */
export type AppointmentChangeResult =
  | { ok: true; appointment: AppointmentDetails }
  | {
      ok: false;
      reason: "not_found" | "already_cancelled" | "past" | "unavailable";
      message: string;
    };

export async function cancelAppointment(
  reference: string,
): Promise<AppointmentChangeResult> {
  const db = getDatabase();
  const [existing] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.bookingReference, reference))
    .limit(1);

  if (!existing) {
    return {
      ok: false,
      reason: "not_found",
      message: "We could not find an appointment with that reference.",
    };
  }
  if (existing.status === "cancelled") {
    return {
      ok: false,
      reason: "already_cancelled",
      message: "That appointment is already cancelled.",
    };
  }
  if (existing.startsAt.getTime() <= Date.now()) {
    return {
      ok: false,
      reason: "past",
      message: "Past appointments can no longer be cancelled.",
    };
  }

  await db
    .update(appointments)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(appointments.id, existing.id));

  const appointment = await getAppointmentByReference(reference);
  return appointment
    ? { ok: true, appointment }
    : {
        ok: false,
        reason: "not_found",
        message: "We could not find an appointment with that reference.",
      };
}

/**
 * Moves an appointment to a new start time, keeping the original groomer.
 *
 * The new window has to sit inside that groomer's schedule for the weekday and
 * must not overlap another live appointment of theirs. Times are compared in
 * UTC to match `findAvailableGroomer`.
 */
export async function rescheduleAppointment(
  reference: string,
  startsAt: Date,
): Promise<AppointmentChangeResult> {
  const db = getDatabase();
  const [existing] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.bookingReference, reference))
    .limit(1);

  if (!existing) {
    return {
      ok: false,
      reason: "not_found",
      message: "We could not find an appointment with that reference.",
    };
  }
  if (existing.status === "cancelled") {
    return {
      ok: false,
      reason: "already_cancelled",
      message: "Cancelled appointments cannot be moved. Please book a new visit.",
    };
  }
  if (existing.startsAt.getTime() <= Date.now()) {
    return {
      ok: false,
      reason: "past",
      message: "Past appointments can no longer be moved.",
    };
  }
  if (startsAt.getTime() <= Date.now()) {
    return {
      ok: false,
      reason: "past",
      message: "Please choose a time in the future.",
    };
  }
  if (!existing.groomerId) {
    return {
      ok: false,
      reason: "unavailable",
      message: "This appointment has no groomer assigned yet.",
    };
  }

  const [groomingPackage] = await db
    .select()
    .from(groomingPackages)
    .where(eq(groomingPackages.id, existing.packageId))
    .limit(1);

  if (!groomingPackage) {
    return {
      ok: false,
      reason: "not_found",
      message: "Grooming package was not found.",
    };
  }

  const endsAt = new Date(
    startsAt.getTime() + groomingPackage.durationMinutes * 60 * 1000,
  );

  const workingHours = await db
    .select({ id: groomerSchedules.id })
    .from(groomerSchedules)
    .where(
      and(
        eq(groomerSchedules.groomerId, existing.groomerId),
        eq(groomerSchedules.weekday, startsAt.getUTCDay()),
        eq(groomerSchedules.available, true),
        lte(groomerSchedules.startTime, timeOfDay(startsAt)),
        gte(groomerSchedules.endTime, timeOfDay(endsAt)),
      ),
    )
    .limit(1);

  if (workingHours.length === 0) {
    return {
      ok: false,
      reason: "unavailable",
      message: "Your groomer does not work at that time. Please pick another slot.",
    };
  }

  const conflicts = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(
      and(
        eq(appointments.groomerId, existing.groomerId),
        ne(appointments.id, existing.id),
        ne(appointments.status, "cancelled"),
        lt(appointments.startsAt, endsAt),
        gt(appointments.endsAt, startsAt),
      ),
    )
    .limit(1);

  if (conflicts.length > 0) {
    return {
      ok: false,
      reason: "unavailable",
      message: "Your groomer is already booked then. Please pick another slot.",
    };
  }

  await db
    .update(appointments)
    .set({ startsAt, endsAt, updatedAt: new Date() })
    .where(eq(appointments.id, existing.id));

  const appointment = await getAppointmentByReference(reference);
  return appointment
    ? { ok: true, appointment }
    : {
        ok: false,
        reason: "not_found",
        message: "We could not find an appointment with that reference.",
      };
}

function timeOfDay(date: Date): string {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
    date.getUTCMinutes(),
  ).padStart(2, "0")}`;
}
