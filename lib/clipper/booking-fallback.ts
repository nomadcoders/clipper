/**
 * Local booking options used when the database is unavailable or unseeded.
 *
 * This module must stay free of *runtime* imports so it can be pulled into both
 * the server component that reads D1 and the client component that renders the
 * form. Type-only imports are erased at build time and are fine.
 */

import type { GroomingPackage } from "./types";

export const FALLBACK_PACKAGES: GroomingPackage[] = [
  {
    id: "pkg_bath_brush",
    name: "Bath & Brush",
    description: "A refreshing bath, blow dry, brush-out, and nail trim.",
    durationMinutes: 60,
    priceCents: 65000,
  },
  {
    id: "pkg_full_groom",
    name: "Full Groom",
    description: "Bath, brush-out, haircut, nail trim, and ear cleaning.",
    durationMinutes: 90,
    priceCents: 95000,
  },
  {
    id: "pkg_deluxe",
    name: "Deluxe Spa",
    description:
      "Full grooming plus teeth brushing and a soothing paw treatment.",
    durationMinutes: 120,
    priceCents: 135000,
  },
];

export const FALLBACK_NEIGHBORHOODS: string[] = [
  "Hannam-dong",
  "Yeonnam-dong",
  "Seongsu-dong",
  "Itaewon",
  "Gangnam",
  "Mangwon-dong",
];
