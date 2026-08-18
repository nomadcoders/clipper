import type { appointments, groomers, groomingPackages } from "@/db/schema";

export type GroomingPackage = typeof groomingPackages.$inferSelect;

export type BookingOption = {
  packages: GroomingPackage[];
  neighborhoods: string[];
};

export type AppointmentDetails = Omit<
  typeof appointments.$inferSelect,
  "startsAt" | "endsAt" | "createdAt" | "updatedAt"
> & {
  reference: string;
  pet: { name: string; breed: string };
  groomer: typeof groomers.$inferSelect | null;
  package: GroomingPackage;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
};
