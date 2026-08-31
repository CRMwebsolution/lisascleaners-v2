"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import type { JobAssignment, JobWithAssignments, LisaJob, LisaProfile } from "@/lib/types";
import JobCalendar, { type CalView } from "@/components/staff/JobCalendar";
import JobDetailModal from "@/components/staff/JobDetailModal";
import ChangePasswordModal from "@/components/staff/ChangePasswordModal";

export default function StaffDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<LisaProfile | null>(null);
  const [jobs, setJobs] = useState<JobWithAssignments[]>([]);
  const [ready, setReady] = useState(false);
  const [calDate, setCalDate] = useState(new Date());
  const [calView, setCalView] = useState<CalView>("month");
  const [selectedJob, setSelectedJob] = useState<JobWithAssignments | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const load = useCallback(async (userId: string) => {
    const supabase = getSupabaseBrowser();
    const [{ data: jobRows }, { data: assignmentRows }, { data: people }] = await Promise.all([
      supabase.from("lisa_jobs").select("*").order("job_date", { ascending: false }),
      supabase.from("lisa_job_assignments").select("*"),
      supabase.from("lisa_profiles").select("*"),
    ]);
    const byId = new Map(((people as LisaProfile[]) ?? []).map((person) => [person.id, person]));
    const grouped = new Map<string, JobAssignment[]>();
    for (const raw of assignmentRows ?? []) {
      const row = raw as JobAssignment;
      const list = grouped.get(row.job_id) ?? [];
      list.push({ ...row, profile: byId.get(row.assignee_id) ?? null });
      grouped.set(row.job_id, list);
    }
    const rows = ((jobRows as LisaJob[]) ?? [])
      .map((job) => ({ ...job, job_assignments: grouped.get(job.id) ?? [] }))
      .filter((job) => job.job_assignments.some((assignment) => assignment.assignee_id === userId));
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

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-soft">
        <p>Loading dashboard\u2026</p>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-dark">My schedule</h1>
          <p className="text-sm">{profile?.full_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="tap text-sm text-purple-mid" onClick={() => setShowPassword(true)}>
            Change password
          </button>
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
      </div>
      <JobCalendar
        jobs={jobs}
        calDate={calDate}
        calView={calView}
        onView={setCalView}
        onDate={setCalDate}
        onJobClick={setSelectedJob}
      />
      {showPassword ? <ChangePasswordModal onClose={() => setShowPassword(false)} /> : null}
      {selectedJob ? (
        <JobDetailModal
          job={selectedJob}
          isAdmin={false}
          currentUserId={profile?.id ?? ""}
          onClose={() => setSelectedJob(null)}
          onUpdated={() => profile && load(profile.id)}
        />
      ) : null}
    </main>
  );
}
