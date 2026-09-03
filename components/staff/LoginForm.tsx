"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BUSINESS_NAME } from "@/lib/site";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import type { LisaProfile } from "@/lib/types";

async function resolveProfile(accessToken: string, userId: string) {
  const supabase = getSupabaseBrowser();
  const { data } = await supabase.from("lisa_profiles").select("*").eq("id", userId).maybeSingle();
  if (data) return { profile: data as LisaProfile, error: null };
  const res = await fetch("/api/ensure-profile", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = (await res.json().catch(() => ({}))) as { profile?: LisaProfile; error?: string };
  if (body.profile) return { profile: body.profile, error: null };
  return { profile: null, error: body.error || "Signed in, but no lisa_profiles row is tied to this user id." };
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const supabase = getSupabaseBrowser();
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session?.user) {
          setChecking(false);
          return;
        }
        const resolved = await resolveProfile(session.access_token, session.user.id);
        if (resolved.profile?.role === "admin") router.replace("/admin");
        else if (resolved.profile?.role === "staff") router.replace("/dashboard");
        setChecking(false);
      }).catch((err: Error) => {
        setError(err.message);
        setChecking(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login is missing its database keys.");
      setChecking(false);
    }
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string | null;
        status?: number;
        project?: string;
        session?: { access_token: string; refresh_token: string };
        user?: { id: string; email?: string | null };
      };
      if (!res.ok || !body.session) {
        setError([body.error || "Sign in failed", body.code ? `code ${body.code}` : null, body.project ? `project ${body.project}` : null].filter(Boolean).join(" | "));
        setSubmitting(false);
        return;
      }
      const supabase = getSupabaseBrowser();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: body.session.access_token,
        refresh_token: body.session.refresh_token,
      });
      if (sessionError) {
        setError(`Auth worked, but the browser could not store the session: ${sessionError.message}`);
        setSubmitting(false);
        return;
      }
      const resolved = await resolveProfile(body.session.access_token, body.user?.id ?? "");
      if (resolved.profile?.role === "admin") router.replace("/admin");
      else if (resolved.profile?.role === "staff") router.replace("/dashboard");
      else setError(resolved.error || "Signed in, but no staff profile is attached to this user.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the login API.");
    }
    setSubmitting(false);
  }

  if (checking) return <p className="text-sm text-purple-dark">Loading...</p>;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-purple-light bg-white p-8">
      <p className="text-sm font-semibold text-purple-mid">Staff portal</p>
      <h1 className="mt-1 text-xl font-bold text-purple-dark">{BUSINESS_NAME}</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="tap w-full rounded-md border border-purple-light px-3" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="tap w-full rounded-md border border-purple-light px-3" />
        </div>
        {error ? <p className="rounded-md bg-purple-soft p-2 text-sm text-purple-dark">{error}</p> : null}
        <button type="submit" disabled={submitting} className="tap w-full rounded-md bg-purple-mid text-sm font-semibold text-white hover:bg-purple-dark disabled:opacity-60">
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
