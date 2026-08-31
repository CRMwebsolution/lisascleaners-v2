"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LISA_BUSINESS_ID, INITIAL_ADMIN_EMAILS, JOB_SERVICE_TYPES } from "@/lib/site";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import type { JobAssignment, JobWithAssignments, LisaJob, LisaProfile, QuoteRequest, StaffRole } from "@/lib/types";
import JobCalendar, { type CalView } from "@/components/staff/JobCalendar";
import JobDetailModal from "@/components/staff/JobDetailModal";
import ChangePasswordModal from "@/components/staff/ChangePasswordModal";
import QuoteRequestsPanel from "@/components/staff/QuoteRequestsPanel";
import DocumentsPanel from "@/components/staff/DocumentsPanel";

type Section = "requests" | "calendar" | "jobs" | "staff" | "documents";
const inputCls = "w-full rounded-md border border-purple-light px-3 py-2 text-sm";

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

async function loadJobsWithAssignments() {
  const supabase = getSupabaseBrowser();
  const [{ data: jobRows, error: jobError }, { data: assignmentRows, error: assignError }, { data: people }] = await Promise.all([
    supabase.from("lisa_jobs").select("*").order("job_date", { ascending: false }),
    supabase.from("lisa_job_assignments").select("*"),
    supabase.from("lisa_profiles").select("*").order("full_name"),
  ]);
  const profiles = (people as LisaProfile[]) ?? [];
  const byId = new Map(profiles.map((person) => [person.id, person]));
  const grouped = new Map<string, JobAssignment[]>();
  for (const raw of assignmentRows ?? []) {
    const row = raw as JobAssignment;
    const list = grouped.get(row.job_id) ?? [];
    list.push({ ...row, profile: byId.get(row.assignee_id) ?? null });
    grouped.set(row.job_id, list);
  }
  const jobs = ((jobRows as LisaJob[]) ?? []).map((job) => ({
    ...job,
    job_assignments: grouped.get(job.id) ?? [],
  }));
  return { jobs, profiles, error: jobError?.message || assignError?.message || null };
}

export default function AdminApp() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<LisaProfile | null>(null);
  const [section, setSection] = useState<Section>("requests");
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [jobs, setJobs] = useState<JobWithAssignments[]>([]);
  const [profiles, setProfiles] = useState<LisaProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [calDate, setCalDate] = useState(new Date());
  const [calView, setCalView] = useState<CalView>("month");
  const [draft, setDraft] = useState<Partial<JobWithAssignments> | null>(null);
  const [sourceRequest, setSourceRequest] = useState<QuoteRequest | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobWithAssignments | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    const [{ data: reqs }, jobPack] = await Promise.all([
      supabase.from("lisa_quote_requests").select("*").order("created_at", { ascending: false }),
      loadJobsWithAssignments(),
    ]);
    setRequests((reqs as QuoteRequest[]) ?? []);
    setJobs(jobPack.jobs);
    setProfiles(jobPack.profiles);
    if (jobPack.error) setError(jobPack.error);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return router.replace("/login");
      const { data } = await supabase.from("lisa_profiles").select("*").eq("id", session.user.id).maybeSingle();
      const next = data as LisaProfile | null;
      if (next?.role !== "admin") return router.replace(next?.role === "staff" ? "/dashboard" : "/login");
      setProfile(next);
      await load();
      setReady(true);
    });
  }, [load, router]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-purple-soft">Loading admin…</div>;

  return (
    <div className="min-h-screen bg-purple-soft lg:flex">
      <aside className="border-b border-purple-light bg-white p-4 lg:w-56 lg:border-b-0 lg:border-r">
        <p className="text-sm font-semibold text-purple-dark">Lisa admin</p>
        <p className="text-xs text-purple-mid">{profile?.full_name}</p>
        <nav className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
          {(["requests", "calendar", "jobs", "staff", "documents"] as Section[]).map((id) => (
            <button key={id} type="button" onClick={() => setSection(id)} className={`tap rounded-md px-3 text-left text-sm capitalize ${section === id ? "bg-purple-mid text-white" : "bg-purple-soft text-purple-dark"}`}>{id}</button>
          ))}
        </nav>
        <button type="button" className="tap mt-4 block text-sm text-purple-mid" onClick={() => setShowPassword(true)}>Change password</button>
        <button type="button" className="tap mt-2 text-sm text-purple-mid" onClick={async () => { await getSupabaseBrowser().auth.signOut(); router.replace("/login"); }}>Sign out</button>
      </aside>
      <main className="flex-1 p-4 lg:p-6">
        {error ? <p className="mb-3 rounded-md bg-white p-3 text-sm text-red-700">{error}</p> : null}
        {section === "requests" ? (
          <QuoteRequestsPanel requests={requests} onStatus={async (id, status) => {
            const { error: updateError } = await getSupabaseBrowser().from("lisa_quote_requests").update({ status }).eq("id", id);
            if (updateError) setError(updateError.message); else await load();
          }} onCreate={(req) => {
            setSourceRequest(req);
            setDraft({
              customer_name: req.name, customer_phone: req.phone, customer_email: req.email, address: req.job_address,
              type_of_clean: req.type_of_clean, job_date: req.preferred_date ?? "",
              notes: [req.notes, req.quote_time ? `Quote time: ${req.quote_time}` : "", req.cleaning_schedule ? `Schedule: ${req.cleaning_schedule}` : "", req.cleaning_time ? `Cleaning time: ${req.cleaning_time}` : ""].filter(Boolean).join("\n"),
              source_request_id: req.id,
            });
            setSection("jobs");
          }} />
        ) : null}
        {section === "calendar" ? <JobCalendar jobs={jobs} calDate={calDate} calView={calView} onView={setCalView} onDate={setCalDate} onJobClick={setSelectedJob} /> : null}
        {section === "jobs" ? <Jobs jobs={jobs} profiles={profiles} draft={draft} sourceRequest={sourceRequest} currentUserId={profile?.id ?? ""} onError={setError} onOpenJob={setSelectedJob} onClear={() => { setDraft(null); setSourceRequest(null); }} onSaved={async () => { setDraft(null); setSourceRequest(null); await load(); }} /> : null}
        {section === "staff" ? <Staff profiles={profiles} onSaved={load} onError={setError} /> : null}
        {section === "documents" ? <DocumentsPanel jobs={jobs} requests={requests} /> : null}
        {selectedJob ? (
          <JobDetailModal job={selectedJob} isAdmin currentUserId={profile?.id ?? ""} onClose={() => setSelectedJob(null)} onUpdated={load} />
        ) : null}
        {showPassword ? <ChangePasswordModal onClose={() => setShowPassword(false)} /> : null}
      </main>
    </div>
  );
}

function Jobs({ jobs, profiles, draft, sourceRequest, currentUserId, onClear, onSaved, onError, onOpenJob }: { jobs: JobWithAssignments[]; profiles: LisaProfile[]; draft: Partial<JobWithAssignments> | null; sourceRequest: QuoteRequest | null; currentUserId: string; onClear: () => void; onSaved: () => Promise<void>; onError: (message: string | null) => void; onOpenJob: (job: JobWithAssignments) => void }) {
  const [form, setForm] = useState({
    customer_name: draft?.customer_name ?? "",
    customer_phone: draft?.customer_phone ?? "",
    customer_email: draft?.customer_email ?? "",
    address: draft?.address ?? "",
    type_of_clean: draft?.type_of_clean || JOB_SERVICE_TYPES[0],
    price: draft?.price != null ? String(draft.price) : "",
    job_date: draft?.job_date ?? "",
    job_time: draft?.job_time ? String(draft.job_time).slice(0, 5) : "",
    notes: draft?.notes ?? "",
    assignee_ids: [] as string[],
  });
  useEffect(() => {
    if (!draft) return;
    setForm((prev) => ({ ...prev, customer_name: draft.customer_name ?? "", customer_phone: draft.customer_phone ?? "", customer_email: draft.customer_email ?? "", address: draft.address ?? "", type_of_clean: draft.type_of_clean || prev.type_of_clean, job_date: draft.job_date ?? "", notes: draft.notes ?? "" }));
  }, [draft]);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (form.assignee_ids.length === 0) return onError("Assign at least one person.");
    const supabase = getSupabaseBrowser();
    const business_id = process.env.NEXT_PUBLIC_LISA_BUSINESS_ID || DEFAULT_LISA_BUSINESS_ID;
    const payload: Record<string, unknown> = {
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
    if (sourceRequest?.id) payload.source_request_id = sourceRequest.id;
    if (currentUserId) payload.created_by = currentUserId;
    let { data, error } = await supabase.from("lisa_jobs").insert(payload).select("id").single();
    if (error && /source_request_id|created_by/i.test(error.message)) {
      delete payload.source_request_id;
      delete payload.created_by;
      const retry = await supabase.from("lisa_jobs").insert(payload).select("id").single();
      data = retry.data;
      error = retry.error;
    }
    if (error || !data) return onError(error?.message ?? "Could not create job.");
    const { error: assignError } = await supabase.from("lisa_job_assignments").insert(form.assignee_ids.map((assignee_id) => ({ job_id: data.id, assignee_id, business_id })));
    if (assignError) return onError(assignError.message);
    if (sourceRequest?.id) await supabase.from("lisa_quote_requests").update({ status: "booked" }).eq("id", sourceRequest.id);
    onError(null);
    await onSaved();
  }
  return (
    <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form onSubmit={save} className="space-y-3 rounded-md bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-purple-dark">{draft ? "Create job from request" : "New job"}</h2>
          {draft ? <button type="button" className="text-sm text-purple-mid" onClick={onClear}>Clear</button> : null}
        </div>
        <input className={inputCls} required placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
        <input className={inputCls} required placeholder="Phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
        <input className={inputCls} required type="email" placeholder="Email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
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

function Staff({ profiles, onSaved, onError }: { profiles: LisaProfile[]; onSaved: () => Promise<void>; onError: (message: string | null) => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<StaffRole>("staff");
  const [password, setPassword] = useState("");
  async function addPerson(event: FormEvent) {
    event.preventDefault();
    const { data: sessionData } = await getSupabaseBrowser().auth.getSession();
    const accessToken = sessionData.session?.access_token;
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ email, full_name: fullName, role, password, access_token: accessToken }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return onError(body.error || "Could not add staff.");
    setEmail(""); setFullName(""); setPassword(""); onError(null); await onSaved();
  }
  async function changeRole(id: string, nextRole: StaffRole) {
    const { error } = await getSupabaseBrowser().from("lisa_profiles").update({ role: nextRole }).eq("id", id);
    if (error) onError(error.message); else await onSaved();
  }
  return (
    <section>
      <h1 className="text-2xl font-bold text-purple-dark">Staff</h1>
      <p className="mt-1 text-sm">Seed admins: {INITIAL_ADMIN_EMAILS.join(" and ")}. Roles can be changed here.</p>
      <form onSubmit={addPerson} className="mt-4 grid gap-3 rounded-md bg-white p-4 sm:grid-cols-2">
        <input className={inputCls} required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className={inputCls} required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={inputCls} required type="password" minLength={6} placeholder="Temporary password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as StaffRole)}><option value="staff">Staff</option><option value="admin">Admin</option></select>
        <button type="submit" className="tap rounded-md bg-purple-mid px-3 text-sm font-semibold text-white sm:col-span-2">Add person</button>
      </form>
      <ul className="mt-4 space-y-2">
        {profiles.map((person) => (
          <li key={person.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white p-3 text-sm">
            <span>{person.full_name} {person.email ? `· ${person.email}` : ""}</span>
            <select className="rounded-md border border-purple-light px-2 py-1" value={person.role} onChange={(e) => changeRole(person.id, e.target.value as StaffRole)}>
              <option value="admin">admin</option>
              <option value="staff">staff</option>
            </select>
          </li>
        ))}
      </ul>
    </section>
  );
}
