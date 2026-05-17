console.log("Pushing schema to database...");
try {
  const drizzleKit = await import("npm:drizzle-kit");
  await drizzleKit.push({})(Deno.env.get("DATABASE_URL")!);
  console.log("Done.");
} catch (e) {
  console.error("Push failed:", e.message);
  Deno.exit(1);
}
