import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3001",
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
