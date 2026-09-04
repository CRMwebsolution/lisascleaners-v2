"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { DEFAULT_LISA_BUSINESS_ID, JOB_SERVICE_TYPES } from "@/lib/site";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import type { JobWithAssignments, LisaProfile } from "@/lib/types";

const inputCls = "w-full rounded-md border border-purple-light px-3 py-2 text-sm";

function cleanText(value: string | null | undefined) {
  const text = String(value ?? "").trim();
  if (!text || text.toLowerCase() === "null" || text.toLowerCase() === "undefined") return "";
  return text;
}

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
  profiles = [],
  onClose,
  onUpdated,
  onDeleted,
}: {
  job: JobWithAssignments;
  isAdmin: boolean;
  currentUserId: string;
  profiles?: LisaProfile[];
  onClose: () => void;
  onUpdated: () => Promise<void> | void;
  onDeleted?: () => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [people, setPeople] = useState<LisaProfile[]>(profiles);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    customer_name: cleanText(job.customer_name),
    customer_phone: cleanText(job.customer_phone),
    customer_email: cleanText(job.customer_email),
    address: cleanText(job.address),
    type_of_clean: job.type_of_clean || JOB_SERVICE_TYPES[0],
    job_date: String(job.job_date ?? "").slice(0, 10),
    job_time: job.job_time ? String(job.job_time).slice(0, 5) : "",
    notes: cleanText(job.notes),
    price: job.price != null ? String(job.price) : "",
    status: job.status || "scheduled",
    assignee_ids: job.job_assignments.map((row) => row.assignee_id),
  });

  useEffect(() => {
    if (profiles.length) {
      setPeople(profiles);
      return;
    }
    if (!isAdmin) return;
    getSupabaseBrowser().from("lisa_profiles").select("*").order("full_name").then(({ data }) => {
      setPeople((data as LisaProfile[]) ?? []);
    });
  }, [isAdmin, profiles]);

  const serviceOptions = useMemo(() => {
    const current = job.type_of_clean;
    return current && !(JOB_SERVICE_TYPES as readonly string[]).includes(current)
      ? [current, ...JOB_SERVICE_TYPES]
      : [...JOB_SERVICE_TYPES];
  }, [job.type_of_clean]);

  const mine = job.job_assignments.find((row) => row.assignee_id === currentUserId);
  const done = job.status === "completed" || job.job_assignments.some((row) => row.marked_complete_at);
  const phone = cleanText(job.customer_phone);
  const email = cleanText(job.customer_email);
  const visibleNotes = cleanText(job.notes);

  async function markComplete() {
    setSaving(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    if (isAdmin) {
      const { error: updateError } = await supabase.from("lisa_jobs").update({ status: "completed" }).eq("id", job.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else if (mine) {
      const { error: updateError } = await supabase.from("lisa_job_assignments").update({
        marked_complete_at: new Date().toISOString(),
        employee_notes: notes || null,
      }).eq("id", mine.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
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
    if (updateError) { setError(updateError.message); setSaving(false); return; }
    await onUpdated();
    onClose();
    setSaving(false);
  }

  async function deleteJob() {
    setSaving(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    await supabase.from("lisa_job_assignments").delete().eq("job_id", job.id);
    const { error: deleteError } = await supabase.from("lisa_jobs").delete().eq("id", job.id);
    if (deleteError) { setError(deleteError.message); setSaving(false); return; }
    setSaving(false);
    await (onDeleted ? onDeleted() : onUpdated());
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error: updateError } = await supabase.from("lisa_jobs").update({
      customer_name: cleanText(form.customer_name),
      customer_phone: cleanText(form.customer_phone) || null,
      customer_email: cleanText(form.customer_email) || null,
      address: cleanText(form.address),
      type_of_clean: form.type_of_clean,
      job_date: form.job_date,
      job_time: form.job_time.length === 5 ? `${form.job_time}:00` : form.job_time,
      notes: cleanText(form.notes) || null,
      price: form.price ? Number(form.price) : null,
      status: form.status,
    }).eq("id", job.id);
    if (updateError) { setError(updateError.message); setSaving(false); return; }
    const current = new Set(job.job_assignments.map((row) => row.assignee_id));
    const next = new Set(form.assignee_ids);
    const removeIds = job.job_assignments.filter((row) => !next.has(row.assignee_id)).map((row) => row.id);
    const addIds = form.assignee_ids.filter((id) => !current.has(id));
    if (removeIds.length) {
      const { error: deleteError } = await supabase.from("lisa_job_assignments").delete().in("id", removeIds);
      if (deleteError) { setError(deleteError.message); setSaving(false); return; }
    }
    if (addIds.length) {
      const business_id = job.business_id || process.env.NEXT_PUBLIC_LISA_BUSINESS_ID || DEFAULT_LISA_BUSINESS_ID;
      const { error: insertError } = await supabase.from("lisa_job_assignments").insert(addIds.map((assignee_id) => ({ job_id: job.id, assignee_id, business_id })));
      if (insertError) { setError(insertError.message); setSaving(false); return; }
    }
    await onUpdated();
    setEditing(false);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-purple-dark">{form.customer_name || job.customer_name}</h2>
              {done ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Complete</span> : null}
              {job.status === "cancelled" ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Cancelled</span> : null}
            </div>
            <p className="mt-0.5 text-sm text-gray-500">{form.type_of_clean || job.type_of_clean}</p>
          </div>
          <button type="button" className="text-sm text-purple-mid" onClick={onClose}>Close</button>
        </div>
        <div className="space-y-4 overflow-y-auto p-5 text-sm">
          {isAdmin && editing ? (
            <form noValidate onSubmit={saveEdit} className="space-y-3">
              <input className={inputCls} required placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              <input className={inputCls} placeholder="Phone (optional)" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
              <input className={inputCls} placeholder="Email (optional)" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
              <input className={inputCls} required placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <select className={inputCls} value={form.type_of_clean} onChange={(e) => setForm({ ...form, type_of_clean: e.target.value })}>
                {serviceOptions.map((label) => <option key={label}>{label}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} type="date" required value={form.job_date} onChange={(e) => setForm({ ...form, job_date: e.target.value })} />
                <input className={inputCls} type="time" required value={form.job_time} onChange={(e) => setForm({ ...form, job_time: e.target.value })} />
              </div>
              <input className={inputCls} type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="scheduled">scheduled</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
              <textarea className={inputCls} rows={3} placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <p className="text-xs font-semibold uppercase text-gray-500">Assigned to</p>
              {people.map((person) => {
                const checked = form.assignee_ids.includes(person.id);
                return (
                  <label key={person.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={checked} onChange={() => setForm((prev) => ({ ...prev, assignee_ids: checked ? prev.assignee_ids.filter((id) => id !== person.id) : [...prev.assignee_ids, person.id] }))} />
                    {person.full_name} ({person.role})
                  </label>
                );
              })}
              {error ? <p className="text-red-700">{error}</p> : null}
              <div className="flex gap-2">
                <button type="button" className="tap flex-1 rounded-md bg-gray-100 py-2" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" disabled={saving} className="tap flex-1 rounded-md bg-purple-mid py-2 font-semibold text-white">{saving ? "Saving\u2026" : "Save changes"}</button>
              </div>
            </form>
          ) : (
            <>
              <p><span className="text-xs font-semibold uppercase text-gray-500">Date & time</span><br />{whenLabel(job)}</p>
              {phone ? <p><span className="text-xs font-semibold uppercase text-gray-500">Phone</span><br /><a className="text-purple-mid" href={`tel:${phone}`}>{phone}</a></p> : null}
              <p><span className="text-xs font-semibold uppercase text-gray-500">Address</span><br />{job.address}</p>
              {email ? <p><span className="text-xs font-semibold uppercase text-gray-500">Email</span><br /><a className="text-purple-mid" href={`mailto:${email}`}>{email}</a></p> : null}
              {visibleNotes ? <p className="whitespace-pre-wrap"><span className="text-xs font-semibold uppercase text-gray-500">Notes</span><br />{visibleNotes}</p> : null}
              {isAdmin ? <p><span className="text-xs font-semibold uppercase text-gray-500">Price</span><br />{job.price != null ? `$${Number(job.price).toFixed(2)}` : "\u2014"}</p> : null}
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Assigned to</p>
                {job.job_assignments.length === 0 ? <p className="mt-1">None</p> : null}
                {job.job_assignments.map((row) => (
                  <p key={row.id} className="mt-1">{row.profile?.full_name ?? "Staff"}{row.marked_complete_at ? " · Done" : ""}{isAdmin && row.employee_notes ? ` — ${row.employee_notes}` : ""}</p>
                ))}
              </div>
              {error ? <p className="text-red-700">{error}</p> : null}
              {isAdmin ? <button type="button" className="tap w-full rounded-md bg-purple-mid py-2 font-semibold text-white" onClick={() => setEditing(true)}>Edit job</button> : null}
              {!isAdmin && mine && !done ? (
                <div className="border-t border-gray-100 pt-4">
                  <textarea className="w-full rounded-md border border-purple-light px-3 py-2" rows={3} placeholder="Optional completion notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <button type="button" className="tap mt-3 w-full rounded-md bg-green-600 py-2 font-semibold text-white" disabled={saving} onClick={markComplete}>{saving ? "Saving\u2026" : "Mark as Complete"}</button>
                </div>
              ) : null}
              {isAdmin ? (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {job.status !== "completed" ? (
                    <button type="button" className="tap w-full rounded-md bg-green-600 py-2 font-semibold text-white" disabled={saving} onClick={markComplete}>{saving ? "Saving\u2026" : "Mark Job as Complete"}</button>
                  ) : (
                    <button type="button" className="tap w-full rounded-md bg-gray-100 py-2 font-semibold text-gray-700" disabled={saving} onClick={reopen}>{saving ? "Reopening\u2026" : "Reopen Job"}</button>
                  )}
                  {confirmDelete ? (
                    <div className="rounded-md bg-red-50 p-3">
                      <p className="mb-2">Delete this job? This cannot be undone.</p>
                      <div className="flex gap-2">
                        <button type="button" className="tap flex-1 rounded-md bg-white py-2" onClick={() => setConfirmDelete(false)}>Keep job</button>
                        <button type="button" className="tap flex-1 rounded-md bg-red-700 py-2 font-semibold text-white" disabled={saving} onClick={() => void deleteJob()}>{saving ? "Deleting\u2026" : "Delete job"}</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="tap w-full rounded-md bg-white py-2 font-semibold text-red-700" onClick={() => setConfirmDelete(true)}>Delete job</button>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
