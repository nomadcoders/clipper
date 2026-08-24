import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "@/db/schema";

let client: ReturnType<typeof drizzle<typeof schema>> | undefined;

/**
 * Returns a Drizzle client bound to the Worker's D1 binding. The binding is
 * stable for the isolate's lifetime, so the client is built once and reused.
 */
export function getDatabase() {
  if (!client) {
    const bindings = env as unknown as Record<string, D1Database>;
    client = drizzle(bindings.DB, { schema });
  }

  return client;
}
