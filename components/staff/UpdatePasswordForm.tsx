"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setError("This page needs the link from the reset email. If the email opened carteretlocal.com, the redirect URL is wrong.");
      setReady(true);
    });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    const { error: updateError } = await getSupabaseBrowser().auth.updateUser({ password });
    setSaving(false);
    if (updateError) setError(updateError.message);
    else router.replace("/login");
  }

  if (!ready) return <p className="text-sm text-purple-dark">Loading...</p>;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-purple-light bg-white p-8">
      <p className="text-sm font-semibold text-purple-mid">Staff portal</p>
      <h1 className="mt-1 text-xl font-bold text-purple-dark">Set a new password</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input className="tap w-full rounded-md border border-purple-light px-3" type="password" required minLength={6} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="tap w-full rounded-md border border-purple-light px-3" type="password" required minLength={6} placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error ? <p className="rounded-md bg-purple-soft p-2 text-sm text-purple-dark">{error}</p> : null}
        <button type="submit" disabled={saving} className="tap w-full rounded-md bg-purple-mid text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "Saving..." : "Save password"}
        </button>
      </form>
      <Link href="/login" className="mt-4 inline-flex text-sm font-semibold text-purple-mid">Back to sign in</Link>
    </div>
  );
}
