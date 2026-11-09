/**
 * Database client — a single shared Drizzle/postgres.js connection.
 *
 * In development we cache the client on `globalThis` so Next.js hot-reloads
 * don't open a new pool on every change.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://discoball:discoball@localhost:5432/discoball";

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.client ??
  postgres(connectionString, {
    max: 10,
    // Required when DATABASE_URL points at a PgBouncer transaction-mode
    // pooler (e.g. Neon's "-pooler" endpoint): prepared statements aren't
    // safe to reuse across pooled connections, so postgres.js must issue
    // plain queries instead.
    prepare: false,
  });
if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
export { schema };
