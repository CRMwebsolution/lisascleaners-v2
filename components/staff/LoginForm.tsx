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
  return { profile: null, error: body.error || "This login is not set up for the staff portal yet." };
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const supabaseHost = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace("https://", "");

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
      const supabase = getSupabaseBrowser();
      const { data, error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signError) {
        const message = signError.message.toLowerCase();
        if (message.includes("email not confirmed")) {
          setError("This login exists but the email is not confirmed in Supabase Auth. Open Authentication > Users, select the account, and mark the email confirmed.");
        } else if (message.includes("invalid") || message.includes("credentials")) {
          setError("Supabase rejected that password. Do not use the dashboard Recover link. It sends you to carteretlocal.com. Use Forgot password on this page after the redirect URLs are added.");
        } else {
          setError(signError.message);
        }
        setSubmitting(false);
        return;
      }
      const userId = data.user?.id ?? data.session?.user.id;
      const token = data.session?.access_token;
      if (!userId || !token) {
        setError("Signed in, but no session came back. Redeploy Vercel after saving NEXT_PUBLIC_ keys. Those keys are baked in at build time.");
        setSubmitting(false);
        return;
      }
      const resolved = await resolveProfile(token, userId);
      if (resolved.profile?.role === "admin") router.replace("/admin");
      else if (resolved.profile?.role === "staff") router.replace("/dashboard");
      else setError(resolved.error || "This login is not set up for the staff portal yet.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach Supabase from this site.");
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
      <Link href="/login/reset" className="mt-4 inline-flex text-sm font-semibold text-purple-mid">Forgot password</Link>
      <p className="mt-3 text-xs text-purple-mid">Auth project: {supabaseHost || "missing NEXT_PUBLIC_SUPABASE_URL"}</p>
    </div>
  );
}
