import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { DEFAULT_LISA_BUSINESS_ID } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Missing Supabase env" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    full_name?: string;
    role?: "admin" | "staff";
    access_token?: string;
  } | null;

  if (!body?.email || !body.password || !body.full_name || !body.role) {
    return NextResponse.json({ error: "Name, email, password, and role are required." }, { status: 400 });
  }
  if (!["admin", "staff"].includes(body.role)) {
    return NextResponse.json({ error: "Role must be admin or staff." }, { status: 400 });
  }

  const userClient = createClient(supabaseUrl, anonKey);
  const token = authHeader?.replace("Bearer ", "") || body.access_token;
  if (token) {
    const { data: userData } = await userClient.auth.getUser(token);
    if (userData.user) {
      const { data: profile } = await userClient.from("lisa_profiles").select("role").eq("id", userData.user.id).maybeSingle();
      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Admin only." }, { status: 403 });
      }
    }
  }

  if (!serviceKey) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set. Create the auth user in Supabase, then add the profile." }, { status: 501 });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { full_name: body.full_name, role: body.role },
  });
  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "Could not create user." }, { status: 400 });
  }

  const businessId = process.env.LISA_BUSINESS_ID || DEFAULT_LISA_BUSINESS_ID;
  const { error: profileError } = await admin.from("lisa_profiles").upsert({
    id: created.user.id,
    business_id: businessId,
    full_name: body.full_name,
    role: body.role,
    email: body.email,
  });
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: created.user.id });
}
