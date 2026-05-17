import { db } from "@hi/database";
import { eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export async function getById<T extends PgTable>(table: T, id: string) {
  const [row] = await db.select().from(table).where(eq((table as any).id, id));
  return row ?? null;
}

export async function updateById<T extends PgTable>(table: T, id: string, data: Record<string, unknown>) {
  const [row] = await db.update(table)
    .set({ ...data, updatedAt: new Date() })
    .where(eq((table as any).id, id))
    .returning();
  return row ?? null;
}

export async function deleteById<T extends PgTable>(table: T, id: string) {
  const [row] = await db.delete(table).where(eq((table as any).id, id)).returning();
  return row ?? null;
}
