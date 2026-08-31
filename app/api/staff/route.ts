import { createClient, type User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { DEFAULT_LISA_BUSINESS_ID } from "@/lib/site";

export const runtime = "nodejs";

async function findAuthUserByEmail(admin: ReturnType<typeof createClient>, email: string) {
  const target = email.trim().toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const match = data.users.find((user) => (user.email ?? "").toLowerCase() === target);
    if (match) return match;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function saveProfile(admin: ReturnType<typeof createClient>, row: {
  id: string;
  business_id: string;
  full_name: string;
  role: "admin" | "staff";
  email: string;
}) {
  const payloads: Record<string, unknown>[] = [
    row,
    { id: row.id, business_id: row.business_id, full_name: row.full_name, role: row.role, email: row.email },
    { id: row.id, business_id: row.business_id, full_name: row.full_name, role: row.role },
    { id: row.id, full_name: row.full_name, role: row.role },
  ];
  let lastError = "Could not save staff profile.";
  for (const payload of payloads) {
    const insert = await admin.from("lisa_profiles").upsert(payload, { onConflict: "id" });
    if (!insert.error) return null;
    lastError = insert.error.message;
    if (/already exists|duplicate|unique/i.test(insert.error.message) && row.email) {
      const existing = await admin.from("lisa_profiles").select("id").eq("email", row.email).maybeSingle();
      if (existing.data?.id) {
        const update = await admin.from("lisa_profiles").update({
          full_name: row.full_name,
          role: row.role,
          business_id: row.business_id,
        }).eq("id", existing.data.id);
        if (!update.error) return null;
        lastError = update.error.message;
      }
    }
  }
  return lastError;
}

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

  const token = authHeader?.replace(/^Bearer\s+/i, "") || body.access_token;
  if (!token) {
    return NextResponse.json({ error: "Sign in as an admin and try again." }, { status: 401 });
  }
  if (!serviceKey) {
    return NextResponse.json({
      error: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local, then restart npm run dev.",
    }, { status: 501 });
  }

  const authed = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await authed.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Session expired. Sign in again." }, { status: 401 });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: actor } = await admin.from("lisa_profiles").select("role").eq("id", userData.user.id).maybeSingle();
  if (actor?.role !== "admin") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const email = body.email.trim();
  let user: User | null = await findAuthUserByEmail(admin, email);
  let reused = Boolean(user);

  if (!user) {
    const created = await admin.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: { full_name: body.full_name.trim(), role: body.role },
    });
    if (created.data.user) {
      user = created.data.user;
    } else if (/already|registered|exists|duplicate/i.test(created.error?.message ?? "")) {
      user = await findAuthUserByEmail(admin, email);
      reused = true;
    } else {
      return NextResponse.json({ error: created.error?.message ?? "Could not create login." }, { status: 400 });
    }
  }

  if (!user) {
    return NextResponse.json({ error: "Could not find or create that login." }, { status: 400 });
  }

  await admin.auth.admin.updateUserById(user.id, {
    password: body.password,
    email_confirm: true,
    user_metadata: { full_name: body.full_name.trim(), role: body.role },
  });

  const profileError = await saveProfile(admin, {
    id: user.id,
    business_id: process.env.LISA_BUSINESS_ID || DEFAULT_LISA_BUSINESS_ID,
    full_name: body.full_name.trim(),
    role: body.role,
    email,
  });
  if (profileError) {
    return NextResponse.json({ error: profileError }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: user.id, reused });
}
