console.log("Generating migration files...");
try {
  const drizzleKit = await import("npm:drizzle-kit");
  await drizzleKit.generate({})(Deno.env.get("DATABASE_URL")!);
  console.log("Done.");
} catch (e) {
  console.error("Generate failed:", e.message);
  Deno.exit(1);
}
