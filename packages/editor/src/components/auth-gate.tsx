"use client";

import { useEffect, useState } from "react";
import { useSession } from "@hi/auth/client";
import { LoginPage } from "./login-page";
import { SetupPage } from "./setup-page";
import { Spinner } from "@hi/editor-ui/spinner";

interface AuthGateProps {
  children: React.ReactNode;
  api: { fetch: (path: string, init?: RequestInit) => Promise<unknown> };
}

export function AuthGate({ children, api }: AuthGateProps) {
  const { data: session, isPending, refetch } = useSession();
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);

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
    return <SetupPage onDone={refetch} />;
  }

  if (!session) {
    return <LoginPage onSuccess={refetch} />;
  }

  return <>{children}</>;
}
