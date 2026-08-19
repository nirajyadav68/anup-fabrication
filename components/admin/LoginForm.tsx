"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [resetSent, setResetSent] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

 if (signInError) {
  console.error("Login error:", signInError);
  setError(`Login error: ${signInError.message}`);
  return;
}

    router.push(redirectTo);
    router.refresh();
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setLoading(false);

   if (resetError) {
  console.error("Password reset error:", resetError);
  setError(`Reset error: ${resetError.message}`);
  return;
}

    setResetSent(true);
  }

  if (mode === "forgot") {
    return (
      <form onSubmit={handleForgotPassword} className="space-y-5">
        {resetSent ? (
          <p className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            If an account exists for that email, a password reset link is on its way.
          </p>
        ) : (
          <>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-white">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-navy-600 bg-navy-800 px-3.5 py-2.5 text-sm text-white placeholder:text-steel-500 focus:border-signal-500"
                placeholder="admin@example.com"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-3 text-sm font-semibold text-white hover:bg-signal-600 disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Reset Link
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError(null);
            setResetSent(false);
          }}
          className="w-full text-center text-sm text-steel-300 hover:text-white"
        >
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-navy-600 bg-navy-800 px-3.5 py-2.5 text-sm text-white placeholder:text-steel-500 focus:border-signal-500"
          placeholder="admin@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-navy-600 bg-navy-800 px-3.5 py-2.5 text-sm text-white placeholder:text-steel-500 focus:border-signal-500"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-3 text-sm font-semibold text-white hover:bg-signal-600 disabled:opacity-70"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <button
        type="button"
        onClick={() => setMode("forgot")}
        className="w-full text-center text-sm text-steel-300 hover:text-white"
      >
        Forgot password?
      </button>
    </form>
  );
}
