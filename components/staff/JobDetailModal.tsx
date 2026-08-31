"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import type { JobWithAssignments } from "@/lib/types";

function whenLabel(job: JobWithAssignments) {
  const date = String(job.job_date ?? "").slice(0, 10);
  const time = job.job_time ? String(job.job_time).slice(0, 8) : "00:00:00";
  const parsed = parseISO(`${date}T${time}`);
  if (Number.isNaN(parsed.getTime())) return `${job.job_date ?? ""} ${job.job_time ?? ""}`.trim();
  return format(parsed, "MMM d, yyyy · h:mm a");
}

export default function JobDetailModal({
  job,
  isAdmin,
  currentUserId,
  onClose,
  onUpdated,
}: {
  job: JobWithAssignments;
  isAdmin: boolean;
  currentUserId: string;
  onClose: () => void;
  onUpdated: () => Promise<void> | void;
}) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mine = job.job_assignments.find((row) => row.assignee_id === currentUserId);
  const done = job.status === "completed" || job.job_assignments.some((row) => row.marked_complete_at);

  async function markComplete() {
    setSaving(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    if (isAdmin) {
      const { error: updateError } = await supabase.from("lisa_jobs").update({ status: "completed" }).eq("id", job.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else if (mine) {
      const { error: updateError } = await supabase.from("lisa_job_assignments").update({
        marked_complete_at: new Date().toISOString(),
        employee_notes: notes || null,
      }).eq("id", mine.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
      await supabase.from("lisa_jobs").update({ status: "completed" }).eq("id", job.id);
    }
    await onUpdated();
    onClose();
    setSaving(false);
  }

  async function reopen() {
    setSaving(true);
    setError(null);
    const { error: updateError } = await getSupabaseBrowser().from("lisa_jobs").update({ status: "scheduled" }).eq("id", job.id);
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    await onUpdated();
    onClose();
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-purple-dark">{job.customer_name}</h2>
              {done ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Complete</span> : null}
              {job.status === "cancelled" ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Cancelled</span> : null}
            </div>
            <p className="mt-0.5 text-sm text-gray-500">{job.type_of_clean}</p>
          </div>
          <button type="button" className="text-sm text-purple-mid" onClick={onClose}>Close</button>
        </div>
        <div className="space-y-4 overflow-y-auto p-5 text-sm">
          <p><span className="text-xs font-semibold uppercase text-gray-500">Date & time</span><br />{whenLabel(job)}</p>
          {job.customer_phone ? <p><span className="text-xs font-semibold uppercase text-gray-500">Phone</span><br /><a className="text-purple-mid" href={`tel:${job.customer_phone}`}>{job.customer_phone}</a></p> : null}
          <p><span className="text-xs font-semibold uppercase text-gray-500">Address</span><br />{job.address}</p>
          {job.customer_email ? <p><span className="text-xs font-semibold uppercase text-gray-500">Email</span><br /><a className="text-purple-mid" href={`mailto:${job.customer_email}`}>{job.customer_email}</a></p> : null}
          {job.notes ? <p className="whitespace-pre-wrap"><span className="text-xs font-semibold uppercase text-gray-500">Notes</span><br />{job.notes}</p> : null}
          {isAdmin ? <p><span className="text-xs font-semibold uppercase text-gray-500">Price</span><br />{job.price != null ? `$${Number(job.price).toFixed(2)}` : "—"}</p> : null}
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Assigned to</p>
            {job.job_assignments.length === 0 ? <p className="mt-1">None</p> : null}
            {job.job_assignments.map((row) => (
              <p key={row.id} className="mt-1">
                {row.profile?.full_name ?? "Staff"}
                {row.marked_complete_at ? " · Done" : ""}
                {isAdmin && row.employee_notes ? ` — ${row.employee_notes}` : ""}
              </p>
            ))}
          </div>
          {error ? <p className="text-red-700">{error}</p> : null}
          {!isAdmin && mine && !done ? (
            <div className="border-t border-gray-100 pt-4">
              <textarea className="w-full rounded-md border border-purple-light px-3 py-2" rows={3} placeholder="Optional completion notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <button type="button" className="tap mt-3 w-full rounded-md bg-green-600 py-2 font-semibold text-white" disabled={saving} onClick={markComplete}>
                {saving ? "Saving…" : "Mark as Complete"}
              </button>
            </div>
          ) : null}
          {isAdmin ? (
            <div className="border-t border-gray-100 pt-4">
              {!done ? (
                <button type="button" className="tap w-full rounded-md bg-green-600 py-2 font-semibold text-white" disabled={saving} onClick={markComplete}>
                  {saving ? "Saving…" : "Mark Job as Complete"}
                </button>
              ) : (
                <button type="button" className="tap w-full rounded-md bg-gray-100 py-2 font-semibold text-gray-700" disabled={saving} onClick={reopen}>
                  {saving ? "Reopening…" : "Reopen Job"}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
