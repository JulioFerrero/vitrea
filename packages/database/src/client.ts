import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import process from "node:process";

function env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

const connectionString: string = env("DATABASE_URL");

export const queryClient = postgres(connectionString);
export const db: ReturnType<typeof drizzle> = drizzle(queryClient, { schema });
export type Database = typeof db;

export async function closeDatabase(): Promise<void> {
  await queryClient.end();
}
