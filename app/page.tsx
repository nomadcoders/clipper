import { PrismaticFlowHome } from "@/components/clipper/home-variants";
import {
  FALLBACK_NEIGHBORHOODS,
  FALLBACK_PACKAGES,
} from "@/lib/clipper/booking-fallback";
import { getBookingOptions } from "@/lib/clipper/data";
import type { GroomingPackage } from "@/lib/clipper/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let packages: GroomingPackage[] = FALLBACK_PACKAGES;
  let neighborhoods: string[] = FALLBACK_NEIGHBORHOODS;

  try {
    const options = await getBookingOptions();
    if (options.packages.length) packages = options.packages;
    if (options.neighborhoods.length) neighborhoods = options.neighborhoods;
  } catch {
    // Keep the local booking options available when the database is offline.
  }

  return <PrismaticFlowHome packages={packages} neighborhoods={neighborhoods} />;
}
