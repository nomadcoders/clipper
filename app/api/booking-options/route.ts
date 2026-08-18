import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "@/db/schema";
import { groomerServiceAreas, groomingPackages } from "@/db/schema";

export async function GET() {
  try {
    const bindings = env as unknown as Record<string, D1Database>;
    const db = drizzle(bindings.DB, { schema });

    const packages = await db.select().from(groomingPackages);
    const areas = await db
      .select({ neighborhood: groomerServiceAreas.neighborhood })
      .from(groomerServiceAreas);

    return Response.json({
      packages,
      neighborhoods: [...new Set(areas.map((area) => area.neighborhood))].sort(),
    });
  } catch (error) {
    console.error("error");

    return Response.json(
      { ok: false, error: "We could not load booking options." },
      { status: 500 },
    );
  }
}
