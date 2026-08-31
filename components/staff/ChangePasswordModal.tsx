"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function save(event: FormEvent) {
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
    setError(null);
    const { error: updateError } = await getSupabaseBrowser().auth.updateUser({ password });
    setSaving(false);
    if (updateError) setError(updateError.message);
    else setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-purple-dark">Change password</h2>
          <button type="button" className="text-sm text-purple-mid" onClick={onClose}>Close</button>
        </div>
        {done ? (
          <div>
            <p className="text-sm text-green-700">Password updated.</p>
            <button type="button" className="tap mt-4 w-full rounded-md bg-purple-soft py-2 text-sm" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={save} className="space-y-3">
            <input className="w-full rounded-md border border-purple-light px-3 py-2 text-sm" type="password" required minLength={6} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input className="w-full rounded-md border border-purple-light px-3 py-2 text-sm" type="password" required minLength={6} placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <button type="submit" disabled={saving} className="tap w-full rounded-md bg-purple-mid py-2 text-sm font-semibold text-white">
              {saving ? "Saving\u2026" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
