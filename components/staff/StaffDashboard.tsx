"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import type { JobWithAssignments, LisaProfile } from "@/lib/types";
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

  const load = useCallback(async () => {
    const { data } = await getSupabaseBrowser().auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      router.replace("/login");
      return;
    }
    const res = await fetch("/api/my-schedule", { headers: { Authorization: `Bearer ${token}` } });
    const body = (await res.json().catch(() => ({}))) as { jobs?: JobWithAssignments[]; profile?: LisaProfile; error?: string };
    if (!res.ok) {
      router.replace("/login");
      return;
    }
    if (body.profile?.role === "admin") {
      router.replace("/admin");
      return;
    }
    setProfile(body.profile ?? null);
    setJobs(body.jobs ?? []);
  }, [router]);

  useEffect(() => {
    load().finally(() => setReady(true));
  }, [load]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-soft">
        <p>Loading dashboard...</p>
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
          onUpdated={() => load()}
        />
      ) : null}
    </main>
  );
}
