import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import process from "node:process";

const connectionString = process.env.DATABASE_URL;

export default defineConfig({
  schema: "./packages/database/src/schema.ts",
  out: "./packages/database/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString!,
  },
});
