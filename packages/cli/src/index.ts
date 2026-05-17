const COMMANDS = ["dev", "build", "start", "db:init", "db:migrate", "db:seed", "db:push", "db:generate"] as const;

const args = Deno.args;
const command = args[0];

if (!command || !COMMANDS.includes(command as any)) {
  console.log(`Hi Editor CLI
  
Usage: hi <command>

Commands:
  dev           Start editor dev server with HMR
  build         Build editor SPA for production
  start         Start production editor server
  db:init       Run migrations + seed database
  db:migrate    Run Drizzle migrations
  db:seed       Seed the database
  db:push       Push schema to database
  db:generate   Generate migration files`);
  Deno.exit(command ? 1 : 0);
}

switch (command) {
  case "dev":
    await import("./commands/dev.ts");
    break;
  case "build":
    await import("./commands/build.ts");
    break;
  case "start":
    await import("./commands/start.ts");
    break;
  case "db:init":
    await import("./commands/db-init.ts");
    break;
  case "db:migrate":
    await import("./commands/db-migrate.ts");
    break;
  case "db:seed":
    await import("./commands/db-seed.ts");
    break;
  case "db:push":
    await import("./commands/db-push.ts");
    break;
  case "db:generate":
    await import("./commands/db-generate.ts");
    break;
}
