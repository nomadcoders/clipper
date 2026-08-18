import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const groomers = sqliteTable("groomers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  phone: text("phone"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const groomingPackages = sqliteTable("grooming_packages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  priceCents: integer("price_cents").notNull(),
});

export const groomerServiceAreas = sqliteTable(
  "groomer_service_areas",
  {
    groomerId: text("groomer_id")
      .notNull()
      .references(() => groomers.id),
    neighborhood: text("neighborhood").notNull(),
  },
  (table) => [primaryKey({ columns: [table.groomerId, table.neighborhood] })],
);

export const groomerSchedules = sqliteTable("groomer_schedules", {
  id: text("id").primaryKey(),
  groomerId: text("groomer_id")
    .notNull()
    .references(() => groomers.id),
  weekday: integer("weekday").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
});

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey(),
  bookingReference: text("booking_reference").notNull().unique(),
  petName: text("pet_name").notNull(),
  petBreed: text("pet_breed").notNull(),
  groomerId: text("groomer_id").references(() => groomers.id),
  packageId: text("package_id")
    .notNull()
    .references(() => groomingPackages.id),
  address: text("address").notNull(),
  neighborhood: text("neighborhood").notNull(),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
  endsAt: integer("ends_at", { mode: "timestamp_ms" }).notNull(),
  status: text("status").notNull().default("confirmed"),
  priceCents: integer("price_cents").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export type Groomer = typeof groomers.$inferSelect;
export type GroomingPackage = typeof groomingPackages.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
