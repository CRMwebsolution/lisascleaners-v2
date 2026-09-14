"use client";

import { FormEvent, useMemo, useState } from "react";
import { INITIAL_ADMIN_EMAILS } from "@/lib/site";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import type { JobWithAssignments, LisaProfile, StaffRole } from "@/lib/types";

const inputCls = "w-full rounded-md border border-purple-light px-3 py-2 text-sm";

function jobTimeLabel(value: string | null | undefined) {
  return value ? String(value).slice(0, 5) : "";
}

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isUpcomingJob(job: JobWithAssignments, assigneeId: string, today: string) {
  return job.job_date > today && job.status === "scheduled" && job.job_assignments.some((row) => row.assignee_id === assigneeId);
}

function defaultReassignId(profiles: LisaProfile[], currentUserId: string) {
  const lisa = profiles.find((person) => person.role === "admin" && person.full_name.trim().toLowerCase() === "lisa");
  return lisa?.id || currentUserId;
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M3 13h18" />
    </svg>
  );
}

export default function Staff({
  profiles, jobs, currentUserId, onSaved, onError, onNotice,
}: {
  profiles: LisaProfile[];
  jobs: JobWithAssignments[];
  currentUserId: string;
  onSaved: () => Promise<void>;
  onError: (message: string | null) => void;
  onNotice: (message: string | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<LisaProfile | null>(null);
  const [reassignTo, setReassignTo] = useState(defaultReassignId(profiles, currentUserId));
  const upcomingById = useMemo(() => {
    const today = todayIso();
    const counts = new Map<string, number>();
    for (const person of profiles) {
      counts.set(person.id, jobs.filter((job) => isUpcomingJob(job, person.id, today)).length);
    }
    return counts;
  }, [jobs, profiles]);
  const futureForPending = useMemo(() => {
    if (!pending) return [];
    const today = todayIso();
    return jobs.filter((job) => job.job_date >= today && job.status !== "cancelled" && job.job_assignments.some((row) => row.assignee_id === pending.id));
  }, [jobs, pending]);
  async function addPerson(event: FormEvent) {
    event.preventDefault();
    const { data: sessionData } = await getSupabaseBrowser().auth.getSession();
    const accessToken = sessionData.session?.access_token;
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ email, full_name: fullName, role: "staff", password, access_token: accessToken }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return onError(body.error || "Could not add staff.");
    setEmail(""); setFullName(""); setPassword(""); onError(null); onNotice(`${fullName} added as staff.`); await onSaved();
  }
  async function changeRole(id: string, nextRole: StaffRole) {
    const { error } = await getSupabaseBrowser().from("lisa_profiles").update({ role: nextRole }).eq("id", id);
    if (error) onError(error.message); else await onSaved();
  }
  async function confirmDelete() {
    if (!pending) return;
    const { data: sessionData } = await getSupabaseBrowser().auth.getSession();
    const accessToken = sessionData.session?.access_token;
    const res = await fetch("/api/staff", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ id: pending.id, reassign_to: reassignTo, access_token: accessToken }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return onError(body.error || "Could not delete staff.");
    onError(null);
    onNotice(futureForPending.length ? `${pending.full_name} deleted. ${futureForPending.length} future job(s) moved.` : `${pending.full_name} deleted.`);
    setPending(null);
    await onSaved();
  }
  return (
    <section>
      <h1 className="text-2xl font-bold text-purple-dark">Staff</h1>
      <p className="mt-1 text-sm">Seed admins: {INITIAL_ADMIN_EMAILS.join(" and ")}. New people are added as staff.</p>
      <form onSubmit={addPerson} className="mt-4 grid gap-3 rounded-md bg-white p-4 sm:grid-cols-2">
        <input className={inputCls} required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className={inputCls} required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={`${inputCls} sm:col-span-2`} required type="password" minLength={6} placeholder="Temporary password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="tap rounded-md bg-purple-mid px-3 py-2 text-sm font-semibold text-white sm:col-span-2">Add person</button>
      </form>
      <ul className="mt-4 space-y-2">
        {profiles.map((person) => {
          const upcoming = upcomingById.get(person.id) ?? 0;
          return (
            <li key={person.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white p-3 text-sm">
              <span>{person.full_name} {person.email ? `· ${person.email}` : ""}</span>
              <div className="flex items-center gap-2">
                {upcoming > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-soft px-2.5 py-1 text-xs font-medium text-purple-dark">
                    <BriefcaseIcon />
                    {upcoming} upcoming
                  </span>
                ) : null}
                <select className="rounded-md border border-purple-light px-2 py-1" value={person.role} onChange={(e) => changeRole(person.id, e.target.value as StaffRole)}>
                  <option value="admin">admin</option>
                  <option value="staff">staff</option>
                </select>
                {person.id !== currentUserId ? (
                  <button type="button" className="tap rounded-md px-2 py-1 text-red-700" onClick={() => { setPending(person); setReassignTo(defaultReassignId(profiles, currentUserId)); }}>Delete</button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {pending ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5">
            <h2 className="text-lg font-semibold text-purple-dark">Delete {pending.full_name}?</h2>
            {futureForPending.length ? (
              <>
                <p className="mt-2 text-sm">This person has {futureForPending.length} future job(s). Reassign them before deleting.</p>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
                  {futureForPending.map((job) => (
                    <li key={job.id}>{job.job_date} {jobTimeLabel(job.job_time)} · {job.customer_name}</li>
                  ))}
                </ul>
                <label className="mt-3 block text-sm font-semibold text-purple-dark" htmlFor="reassign-to">Move jobs to</label>
                <select id="reassign-to" className={inputCls} value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
                  {profiles.filter((person) => person.id !== pending.id).map((person) => (
                    <option key={person.id} value={person.id}>{person.full_name} ({person.role})</option>
                  ))}
                </select>
              </>
            ) : (
              <p className="mt-2 text-sm">No future jobs are assigned to this person.</p>
            )}
            <div className="mt-4 flex gap-2">
              <button type="button" className="tap flex-1 rounded-md bg-gray-100 py-2" onClick={() => setPending(null)}>Cancel</button>
              <button type="button" className="tap flex-1 rounded-md bg-red-700 py-2 font-semibold text-white" onClick={() => void confirmDelete()}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
