"use client";

import { FormEvent, useEffect, useState } from "react";
import { DEFAULT_LISA_BUSINESS_ID, JOB_SERVICE_TYPES } from "@/lib/site";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import type { JobWithAssignments, LisaProfile, QuoteRequest } from "@/lib/types";

const inputCls = "w-full rounded-md border border-purple-light px-3 py-2 text-sm";
const emptyJobForm = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  address: "",
  type_of_clean: JOB_SERVICE_TYPES[0],
  price: "",
  job_date: "",
  job_time: "",
  notes: "",
  assignee_ids: [] as string[],
};

function jobTimeLabel(value: string | null | undefined) {
  return value ? String(value).slice(0, 5) : "";
}

function sortJobsNewestFirst(jobs: JobWithAssignments[]) {
  return [...jobs].sort((a, b) => {
    const left = `${a.job_date ?? ""} ${a.job_time ?? ""}`;
    const right = `${b.job_date ?? ""} ${b.job_time ?? ""}`;
    return right.localeCompare(left);
  });
}

export default function Jobs({
  jobs, profiles, draft, sourceRequest, onClear, onSaved, onError, onNotice, onOpenJob,
}: {
  jobs: JobWithAssignments[];
  profiles: LisaProfile[];
  draft: Partial<JobWithAssignments> | null;
  sourceRequest: QuoteRequest | null;
  onClear: () => void;
  onSaved: (message: string) => Promise<void>;
  onError: (message: string | null) => void;
  onNotice: (message: string | null) => void;
  onOpenJob: (job: JobWithAssignments) => void;
}) {
  const [form, setForm] = useState({ ...emptyJobForm, type_of_clean: draft?.type_of_clean || JOB_SERVICE_TYPES[0], customer_name: draft?.customer_name ?? "", customer_phone: draft?.customer_phone ?? "", customer_email: draft?.customer_email ?? "", address: draft?.address ?? "", job_date: draft?.job_date ?? "", notes: draft?.notes ?? "" });
  useEffect(() => {
    if (!draft) return;
    setForm((prev) => ({ ...prev, customer_name: draft.customer_name ?? "", customer_phone: draft.customer_phone ?? "", customer_email: draft.customer_email ?? "", address: draft.address ?? "", type_of_clean: draft.type_of_clean || prev.type_of_clean, job_date: draft.job_date ?? "", notes: draft.notes ?? "" }));
  }, [draft]);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (form.assignee_ids.length === 0) return onError("Assign at least one person.");
    const supabase = getSupabaseBrowser();
    const business_id = process.env.NEXT_PUBLIC_LISA_BUSINESS_ID || DEFAULT_LISA_BUSINESS_ID;
    const payload = {
      business_id,
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim() || null,
      customer_email: form.customer_email.trim() || null,
      address: form.address.trim(),
      type_of_clean: form.type_of_clean,
      price: form.price ? Number(form.price) : null,
      job_date: form.job_date,
      job_time: form.job_time.length === 5 ? `${form.job_time}:00` : form.job_time,
      notes: form.notes.trim() || null,
      status: "scheduled",
    };
    const { data, error } = await supabase.from("lisa_jobs").insert(payload).select("id").single();
    if (error || !data) return onError(error?.message ?? "Could not create job.");
    const { error: assignError } = await supabase.from("lisa_job_assignments").insert(form.assignee_ids.map((assignee_id) => ({ job_id: data.id, assignee_id, business_id })));
    if (assignError) return onError(assignError.message);
    if (sourceRequest?.id) await supabase.from("lisa_quote_requests").update({ status: "booked" }).eq("id", sourceRequest.id);
    const when = [form.job_date, form.job_time].filter(Boolean).join(" ");
    setForm({ ...emptyJobForm });
    onError(null);
    onNotice(null);
    await onSaved(`Job saved for ${form.customer_name.trim()}${when ? ` on ${when}` : ""}.`);
  }
  return (
    <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form noValidate onSubmit={save} className="space-y-3 rounded-md bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-purple-dark">{draft ? "Create job from request" : "New job"}</h2>
          {draft ? <button type="button" className="text-sm text-purple-mid" onClick={onClear}>Clear</button> : null}
        </div>
        <input className={inputCls} required placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
        <input className={inputCls} placeholder="Phone (optional)" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
        <input className={inputCls} placeholder="Email (optional)" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
        <input className={inputCls} required placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <select className={inputCls} value={form.type_of_clean} onChange={(e) => setForm({ ...form, type_of_clean: e.target.value })}>{JOB_SERVICE_TYPES.map((label) => <option key={label}>{label}</option>)}</select>
        <input className={inputCls} type="date" required value={form.job_date} onChange={(e) => setForm({ ...form, job_date: e.target.value })} />
        <input className={inputCls} type="time" required value={form.job_time} onChange={(e) => setForm({ ...form, job_time: e.target.value })} />
        <input className={inputCls} type="number" min="0" step="0.01" placeholder="Price (admin only)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <textarea className={inputCls} rows={3} placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <p className="text-sm font-medium">Assign to</p>
        {profiles.map((person) => {
          const checked = form.assignee_ids.includes(person.id);
          return (
            <label key={person.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={checked} onChange={() => setForm((prev) => ({ ...prev, assignee_ids: checked ? prev.assignee_ids.filter((id) => id !== person.id) : [...prev.assignee_ids, person.id] }))} />
              {person.full_name} ({person.role})
            </label>
          );
        })}
        <button type="submit" className="tap w-full rounded-md bg-purple-mid text-sm font-semibold text-white">Save job to calendar</button>
      </form>
      <div>
        <h2 className="font-semibold text-purple-dark">Jobs</h2>
        <ul className="mt-3 space-y-2">
          {sortJobsNewestFirst(jobs).map((job) => (
            <li key={job.id}>
              <button type="button" className="w-full rounded-md bg-white p-3 text-left text-sm" onClick={() => onOpenJob(job)}>
                <p className="font-semibold">{job.customer_name} · {job.status}</p>
                <p>{job.job_date} {jobTimeLabel(job.job_time)} · {job.type_of_clean}</p>
                <p>{job.address}</p>
                <p>Price: {job.price != null ? `$${job.price}` : "\u2014"}</p>
                <p>Assigned: {job.job_assignments?.map((assignment) => assignment.profile?.full_name ?? "Staff").join(", ") || "None"}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
