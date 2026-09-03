import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { DEFAULT_LISA_BUSINESS_ID, INITIAL_ADMIN_EMAILS } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Missing Supabase public env on this deploy." }, { status: 500 });
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const authed = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await authed.auth.getUser(token);
  if (userError || !userData.user?.id) {
    return NextResponse.json({ error: "Session expired. Sign in again." }, { status: 401 });
  }

  const email = (userData.user.email ?? "").trim().toLowerCase();
  const client = serviceKey ? createClient(supabaseUrl, serviceKey) : authed;
  const { data: existing } = await client.from("lisa_profiles").select("*").eq("id", userData.user.id).maybeSingle();
  if (existing) return NextResponse.json({ profile: existing });

  if (!INITIAL_ADMIN_EMAILS.includes(email as (typeof INITIAL_ADMIN_EMAILS)[number])) {
    return NextResponse.json({ error: "This login is not set up for the staff portal yet." }, { status: 403 });
  }
  if (!serviceKey) {
    return NextResponse.json({ error: "Add SUPABASE_SERVICE_ROLE_KEY in Vercel so the admin profile can be created." }, { status: 501 });
  }

  const row = {
    id: userData.user.id,
    business_id: process.env.LISA_BUSINESS_ID || process.env.NEXT_PUBLIC_LISA_BUSINESS_ID || DEFAULT_LISA_BUSINESS_ID,
    full_name: (userData.user.user_metadata?.full_name as string | undefined) || "Cody",
    role: "admin",
    email,
  };
  const { data, error } = await client.from("lisa_profiles").upsert(row as never, { onConflict: "id" }).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ profile: data ?? row });
}
