console.log("Running Drizzle migrations...");
try {
  const drizzleKit = await import("npm:drizzle-kit");
  await drizzleKit.migrate({})(Deno.env.get("DATABASE_URL")!);
  console.log("Done.");
} catch (e) {
  console.error("Migration failed:", e.message);
  Deno.exit(1);
}
