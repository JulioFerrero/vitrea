import process from "node:process";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db, user as userTable } from "@vitrea/database";
import { sql } from "drizzle-orm";

function env(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}

export const auth = betterAuth({
  basePath: "/auth",
  baseURL: env("BETTER_AUTH_URL", "http://localhost:3001"),
  trustedOrigins: [
    env("BETTER_AUTH_URL", "http://localhost:3001") ?? "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      cursorColor: {
        type: "string",
        required: false,
        defaultValue: "#7B61FF",
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const [row] = await db
            .select({ count: sql<number>`count(*)` })
            .from(userTable);

          const usersExist = (row?.count ?? 0) > 0;

          if (!usersExist) {
            return { data: { ...user, role: "admin" } };
          }

          const session = ctx?.context?.session;
          const sessionUser = session?.user as Record<string, unknown> | undefined;

          if (!session || sessionUser?.role !== "admin") {
            throw new APIError("FORBIDDEN", {
              message: "Sign-up is disabled. Only administrators can create new users.",
            });
          }

          return { data: user };
        },
        after: async (user) => {
          console.log(`New user registered: ${user.email} (role: ${(user as Record<string, unknown>).role})`);
        },
      },
      update: {
        before: async (data, ctx) => {
          const session = ctx?.context?.session;
          const sessionUser = session?.user as Record<string, unknown> | undefined;

          if (sessionUser?.role !== "admin") {
            if ((data as Record<string, unknown>).role !== undefined) {
              throw new APIError("FORBIDDEN", {
                message: "Only administrators can modify roles",
              });
            }
          }

          return { data };
        },
      },
      delete: {
        before: async (user, ctx) => {
          const session = ctx?.context?.session;
          const sessionUser = session?.user as Record<string, unknown> | undefined;

          if (sessionUser?.role !== "admin") {
            throw new APIError("FORBIDDEN", {
              message: "Only administrators can delete users",
            });
          }

          return true;
        },
      },
    },
  },
});

export type Auth = typeof auth;
