import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { JobAssignment, LisaJob, LisaProfile } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon) return NextResponse.json({ error: "Missing Supabase env" }, { status: 500 });
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!token) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  if (!service) return NextResponse.json({ error: "Add SUPABASE_SERVICE_ROLE_KEY to Vercel env." }, { status: 501 });

  const authed = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: userData, error: userError } = await authed.auth.getUser(token);
  if (userError || !userData.user) return NextResponse.json({ error: "Session expired. Sign in again." }, { status: 401 });

  const admin = createClient(url, service);
  const { data: actor } = await admin.from("lisa_profiles").select("*").eq("id", userData.user.id).maybeSingle();
  const profile = actor as LisaProfile | null;
  if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Staff only." }, { status: 403 });
  }

  const [{ data: jobRows }, { data: assignmentRows }, { data: people }] = await Promise.all([
    admin.from("lisa_jobs").select("*").order("job_date", { ascending: false }),
    admin.from("lisa_job_assignments").select("*"),
    admin.from("lisa_profiles").select("*"),
  ]);

  const byId = new Map(((people as LisaProfile[]) ?? []).map((person) => [person.id, person]));
  const grouped = new Map<string, JobAssignment[]>();
  for (const raw of assignmentRows ?? []) {
    const row = raw as JobAssignment;
    const list = grouped.get(row.job_id) ?? [];
    list.push({ ...row, profile: byId.get(row.assignee_id) ?? null });
    grouped.set(row.job_id, list);
  }

  let jobs = ((jobRows as LisaJob[]) ?? []).map((job) => ({
    ...job,
    job_assignments: grouped.get(job.id) ?? [],
  }));
  if (profile.role !== "admin") {
    jobs = jobs.filter((job) => job.job_assignments.some((row) => row.assignee_id === profile.id));
  }
  return NextResponse.json({ jobs, profile });
}
