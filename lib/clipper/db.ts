import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "@/db/schema";

/**
 * Returns a Drizzle client bound to the Worker's D1 binding.
 */
export function getDatabase() {
  const bindings = env as unknown as Record<string, D1Database>;

  return drizzle(bindings.DB, { schema });
}
