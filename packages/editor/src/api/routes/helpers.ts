import { db } from "@vitrea/database";
import { eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

function getIdColumn(table: PgTable) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (table as any)["id"];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getById<T extends PgTable>(table: T, id: string): Promise<any> {
  const [row] = await db.select().from(table as any).where(eq(getIdColumn(table), id)); // eslint-disable-line @typescript-eslint/no-explicit-any
  return row ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateById<T extends PgTable>(table: T, id: string, data: Record<string, unknown>): Promise<any> {
  const setValues = { ...data, updatedAt: new Date() };
  const [row] = await db.update(table as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .set(setValues as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .where(eq(getIdColumn(table), id))
    .returning();
  return row ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deleteById<T extends PgTable>(table: T, id: string): Promise<any> {
  const [row] = await db.delete(table as any).where(eq(getIdColumn(table), id)).returning(); // eslint-disable-line @typescript-eslint/no-explicit-any
  return row ?? null;
}
