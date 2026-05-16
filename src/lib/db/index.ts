import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Supabase Transaction Pooler (port 6543) + Vercel serverless:
// Setiap function invocation adalah proses baru — max: 1 mencegah connection exhaustion.
// Di development, max: 3 cukup untuk local postgres.
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === "production" ? 3 : 5,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
export type DbTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type DbLike = Database | DbTransaction;
