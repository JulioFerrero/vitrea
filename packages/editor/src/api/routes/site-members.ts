import { Hono } from "hono";
import { db, siteMembers, user } from "@vitrea/database";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { requireAdmin, type AuthVariables } from "@vitrea/auth/middleware";

export const siteMembersRoute = new Hono<{
  Variables: AuthVariables;
}>();

siteMembersRoute.get("/", async (c) => {
  const siteId = c.req.query("siteId");
  if (!siteId) return c.json({ error: "siteId required" }, 400);

  const rows = await db
    .select({
      id: siteMembers.id,
      userId: siteMembers.userId,
      userName: user.name,
      userEmail: user.email,
    })
    .from(siteMembers)
    .innerJoin(user, eq(siteMembers.userId, user.id))
    .where(eq(siteMembers.siteId, siteId));

  return c.json(rows);
});

siteMembersRoute.post("/", requireAdmin, async (c) => {
  const { siteId, userId } = await c.req.json();
  if (!siteId || !userId)
    return c.json({ error: "siteId and userId required" }, 400);

  const [existing] = await db
    .select()
    .from(siteMembers)
    .where(
      and(eq(siteMembers.siteId, siteId), eq(siteMembers.userId, userId))
    )
    .limit(1);
  if (existing) return c.json(existing);

  const [row] = await db
    .insert(siteMembers)
    .values({ id: nanoid(), siteId, userId })
    .returning();
  return c.json(row, 201);
});

siteMembersRoute.delete("/:id", requireAdmin, async (c) => {
  const id = c.req.param("id");
  if (!id) return c.json({ error: "id required" }, 400);
  const [row] = await db
    .delete(siteMembers)
    .where(eq(siteMembers.id, id))
    .returning();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});
