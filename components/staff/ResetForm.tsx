"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

export default function ResetForm() {
  const [email, setEmail] = useState("cody@southernautomate.com");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const redirectTo = `${window.location.origin}/login/update-password`;
    const { error: resetError } = await getSupabaseBrowser().auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setSubmitting(false);
    if (resetError) setError(`${resetError.message} If this mentions redirect, add ${redirectTo} under Supabase Authentication > URL Configuration > Redirect URLs.`);
    else setSent(true);
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-purple-light bg-white p-8">
      <p className="text-sm font-semibold text-purple-mid">Staff portal</p>
      <h1 className="mt-1 text-xl font-bold text-purple-dark">Reset password</h1>
      {sent ? (
        <p className="mt-4 text-sm">Check email for {email}. Open the link on this same site. If it still sends you to carteretlocal.com, the Supabase Site URL is still pointed there.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="tap w-full rounded-md border border-purple-light px-3" />
          </div>
          {error ? <p className="rounded-md bg-purple-soft p-2 text-sm text-purple-dark">{error}</p> : null}
          <button type="submit" disabled={submitting} className="tap w-full rounded-md bg-purple-mid text-sm font-semibold text-white disabled:opacity-60">
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
      <Link href="/login" className="mt-4 inline-flex text-sm font-semibold text-purple-mid">Back to sign in</Link>
    </div>
  );
}
