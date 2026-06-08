"use client";

import { useEffect, useState } from "react";
import { useSession } from "@vitrea/auth/client";
import { LoginPage } from "./login-page";
import { SetupPage } from "./setup-page";
import { Spinner } from "@vitrea/editor-ui/spinner";

interface AuthGateProps {
  children: React.ReactNode;
  api: { fetch: (path: string, init?: RequestInit) => Promise<unknown> };
}

export function AuthGate({ children, api }: Readonly<AuthGateProps>) {
  const { data: session, isPending, refetch } = useSession();
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);

  async function handleSetupDone() {
    setHasUsers(true);
    await refetch();
  }

  useEffect(() => {
    async function check() {
      try {
        const result = await api.fetch("/auth/has-users");
        setHasUsers((result as { exists: boolean }).exists);
      } catch {
        setHasUsers(true);
      }
    }
    check();
  }, [api]);

  if (isPending || hasUsers === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!hasUsers) {
    return <SetupPage onDone={handleSetupDone} />;
  }

  if (!session) {
    return <LoginPage onSuccess={refetch} />;
  }

  return <>{children}</>;
}
