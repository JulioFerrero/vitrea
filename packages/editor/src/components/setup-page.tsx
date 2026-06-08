"use client";

import { useCallback, useEffect, useState } from "react";
import { signUp } from "@vitrea/auth/client";
import { Button } from "@vitrea/ui/button";
import { Input } from "@vitrea/ui/input";
import { Check } from "lucide-react";

interface SetupPageProps {
  onDone: () => void | Promise<void>;
}

export function SetupPage({ onDone }: Readonly<SetupPageProps>) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const finishSetup = useCallback(async () => {
    if (finishing) {
      return;
    }

    setFinishing(true);
    try {
      await onDone();
    } catch {
      setFinishing(false);
    }
  }, [finishing, onDone]);

  useEffect(() => {
    if (step !== "done") {
      return;
    }

    const timeout = globalThis.setTimeout(() => {
      void finishSetup();
    }, 500);

    return () => globalThis.clearTimeout(timeout);
  }, [finishSetup, step]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signUp.email({
      email,
      password,
      name,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Failed to create account");
      return;
    }

    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto px-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">You're all set!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your admin account has been created. Redirecting...
          </p>
          <Button className="mt-6" onClick={() => void finishSetup()} disabled={finishing}>
            {finishing ? "Opening Dashboard..." : "Go to Dashboard"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome to Web Builder</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your admin account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">
              Name
            </label>
            <Input
              type="text"
              placeholder="Admin"
              value={name}
              onChange={(e) => setName((e.target as HTMLInputElement).value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">
              Email
            </label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">
              Password
            </label>
            <Input
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading || password.length < 8}>
            {loading ? "Creating..." : "Create Admin Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
