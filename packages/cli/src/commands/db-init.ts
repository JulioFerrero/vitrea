console.log("Running database migrations + seed...");

const { db } = await import("@hi/database/client");

try {
  const drizzleKit = await import("npm:drizzle-kit");
  await drizzleKit.push({})(Deno.env.get("DATABASE_URL")!);
  console.log("Migrations applied.");
} catch (e) {
  console.error("Migration failed:", e.message);
}

await import("@hi/database/seed");
