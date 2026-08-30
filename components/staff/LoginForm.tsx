"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BUSINESS_NAME } from "@/lib/site";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import type { LisaProfile } from "@/lib/types";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setChecking(false);
        return;
      }
      const { data } = await supabase.from("lisa_profiles").select("*").eq("id", session.user.id).maybeSingle();
      const profile = data as LisaProfile | null;
      if (profile?.role === "admin") router.replace("/admin");
      else if (profile?.role === "staff") router.replace("/dashboard");
      setChecking(false);
    });
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
      if (signError) {
        setError("Invalid email or password.");
        setSubmitting(false);
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        setError("Invalid email or password.");
        setSubmitting(false);
        return;
      }
      const { data } = await supabase.from("lisa_profiles").select("*").eq("id", userId).maybeSingle();
      const profile = data as LisaProfile | null;
      if (profile?.role === "admin") router.replace("/admin");
      else if (profile?.role === "staff") router.replace("/dashboard");
      else setError("This login is not set up for Lisa’s staff portal yet.");
    } catch {
      setError("Invalid email or password.");
    }
    setSubmitting(false);
  }

  if (checking) return <p className="text-sm text-purple-dark">Loading…</p>;

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
