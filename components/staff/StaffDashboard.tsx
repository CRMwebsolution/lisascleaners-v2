"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import type { JobWithAssignments, LisaProfile } from "@/lib/types";

export default function StaffDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<LisaProfile | null>(null);
  const [jobs, setJobs] = useState<JobWithAssignments[]>([]);
  const [note, setNote] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  const load = useCallback(async (userId: string) => {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase
      .from("lisa_jobs")
      .select("id, business_id, customer_name, customer_phone, customer_email, address, type_of_clean, job_date, job_time, status, notes, source_request_id, created_by, created_at, job_assignments:lisa_job_assignments(*, profile:lisa_profiles(*))")
      .order("job_date", { ascending: true });
    const rows = ((data as JobWithAssignments[]) ?? []).filter((job) =>
      job.job_assignments?.some((assignment) => assignment.assignee_id === userId),
    );
    setJobs(rows);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase.from("lisa_profiles").select("*").eq("id", session.user.id).maybeSingle();
      const next = data as LisaProfile | null;
      if (next?.role === "admin") {
        router.replace("/admin");
        return;
      }
      if (next?.role !== "staff") {
        router.replace("/login");
        return;
      }
      setProfile(next);
      await load(next.id);
      setReady(true);
    });
  }, [load, router]);

  async function complete(job: JobWithAssignments) {
    if (!profile) return;
    const assignment = job.job_assignments.find((row) => row.assignee_id === profile.id);
    if (!assignment) return;
    await getSupabaseBrowser()
      .from("lisa_job_assignments")
      .update({
        marked_complete_at: new Date().toISOString(),
        employee_notes: note[job.id] || null,
      })
      .eq("id", assignment.id);
    await getSupabaseBrowser().from("lisa_jobs").update({ status: "completed" }).eq("id", job.id);
    await load(profile.id);
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-soft">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-dark">My jobs</h1>
          <p className="text-sm">{profile?.full_name}</p>
        </div>
        <button
          type="button"
          className="tap text-sm text-purple-mid"
          onClick={async () => {
            await getSupabaseBrowser().auth.signOut();
            router.replace("/login");
          }}
        >
          Sign out
        </button>
      </div>
      <ul className="mt-6 space-y-3">
        {jobs.length === 0 ? <li className="rounded-md bg-white p-4 text-sm">No jobs assigned to you.</li> : null}
        {jobs.map((job) => (
          <li key={job.id} className="rounded-md border border-purple-light bg-white p-4">
            <p className="font-semibold text-purple-dark">{job.customer_name}</p>
            <p className="text-sm">
              {job.job_date} {job.job_time.slice(0, 5)} · {job.type_of_clean}
            </p>
            <p className="text-sm">{job.address}</p>
            <p className="text-sm">{job.customer_phone}</p>
            {job.notes ? <p className="mt-2 text-sm">{job.notes}</p> : null}
            <p className="mt-2 text-sm">
              Also on this job:{" "}
              {job.job_assignments.map((assignment) => assignment.profile?.full_name ?? "Staff").join(", ")}
            </p>
            <textarea
              className="mt-3 w-full rounded-md border border-purple-light px-3 py-2 text-sm"
              placeholder="Optional note"
              value={note[job.id] ?? ""}
              onChange={(e) => setNote((prev) => ({ ...prev, [job.id]: e.target.value }))}
            />
            <button type="button" className="tap mt-3 rounded-md bg-purple-mid px-3 text-sm font-semibold text-white" onClick={() => complete(job)}>
              Mark complete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
