"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import type { JobAssignment, JobWithAssignments, LisaJob, LisaProfile, QuoteRequest, RequestStatus } from "@/lib/types";
import JobCalendar, { type CalView } from "@/components/staff/JobCalendar";
import JobDetailModal from "@/components/staff/JobDetailModal";
import ChangePasswordModal from "@/components/staff/ChangePasswordModal";
import QuoteRequestsPanel from "@/components/staff/QuoteRequestsPanel";
import DocumentsPanel from "@/components/staff/DocumentsPanel";
import GalleryPanel from "@/components/staff/GalleryPanel";
import Jobs from "@/components/staff/JobsPanel";
import Staff from "@/components/staff/StaffPanel";

type Section = "requests" | "calendar" | "jobs" | "staff" | "documents" | "gallery";

function notesWithoutDecline(notes: string | null | undefined) {
  return (notes ?? "").replace(/^Decline reason:\s*.+$/m, "").trim();
}

async function updateRequestStatus(id: string, status: RequestStatus, current: QuoteRequest | undefined, reason?: string) {
  const supabase = getSupabaseBrowser();
  const payload: Record<string, unknown> = { status };
  if (status === "declined") {
    const cleaned = notesWithoutDecline(current?.notes);
    const line = reason?.trim() ? `Decline reason: ${reason.trim()}` : "";
    payload.decline_reason = reason?.trim() || null;
    payload.notes = [cleaned, line].filter(Boolean).join("\n") || null;
  }
  let { error } = await supabase.from("lisa_quote_requests").update(payload).eq("id", id);
  if (error && /decline_reason/i.test(error.message)) {
    delete payload.decline_reason;
    const retry = await supabase.from("lisa_quote_requests").update(payload).eq("id", id);
    error = retry.error;
  }
  return error?.message ?? null;
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
  const [notice, setNotice] = useState<string | null>(null);
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
          {(["requests", "calendar", "jobs", "staff", "documents", "gallery"] as Section[]).map((id) => (
            <button key={id} type="button" onClick={() => setSection(id)} className={`tap rounded-md px-3 text-left text-sm capitalize ${section === id ? "bg-purple-mid text-white" : "bg-purple-soft text-purple-dark"}`}>{id}</button>
          ))}
        </nav>
        <button type="button" className="tap mt-4 block text-sm text-purple-mid" onClick={() => setShowPassword(true)}>Change password</button>
        <button type="button" className="tap mt-2 text-sm text-purple-mid" onClick={async () => { await getSupabaseBrowser().auth.signOut(); router.replace("/login"); }}>Sign out</button>
      </aside>
      <main className="flex-1 p-4 lg:p-6">
        {error ? <p className="mb-3 rounded-md bg-white p-3 text-sm text-red-700">{error}</p> : null}
        {notice ? <p className="mb-3 rounded-md bg-green-50 p-3 text-sm text-green-800">{notice}</p> : null}
        {section === "requests" ? (
          <QuoteRequestsPanel requests={requests} onStatus={async (id, status, reason) => {
            const message = await updateRequestStatus(id, status, requests.find((row) => row.id === id), reason);
            if (message) setError(message); else { setError(null); await load(); }
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
        {section === "jobs" ? <Jobs jobs={jobs} profiles={profiles} draft={draft} sourceRequest={sourceRequest} onError={setError} onNotice={setNotice} onOpenJob={setSelectedJob} onClear={() => { setDraft(null); setSourceRequest(null); }} onSaved={async (message) => { setDraft(null); setSourceRequest(null); setNotice(message); await load(); }} /> : null}
        {section === "staff" ? <Staff profiles={profiles} jobs={jobs} currentUserId={profile?.id ?? ""} onSaved={load} onError={setError} onNotice={setNotice} /> : null}
        {section === "documents" ? <DocumentsPanel jobs={jobs} requests={requests} /> : null}
        {section === "gallery" ? <GalleryPanel /> : null}
        {selectedJob ? (
          <JobDetailModal job={selectedJob} isAdmin currentUserId={profile?.id ?? ""} onClose={() => setSelectedJob(null)} onUpdated={load} onDeleted={async () => { setSelectedJob(null); setNotice("Job deleted."); await load(); }} />
        ) : null}
        {showPassword ? <ChangePasswordModal onClose={() => setShowPassword(false)} /> : null}
      </main>
    </div>
  );
}
