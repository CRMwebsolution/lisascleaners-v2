import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({
      error: "This deploy is missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY at runtime.",
    }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json({
      error: error.message,
      code: error.code ?? null,
      status: error.status ?? 401,
      project: supabaseUrl.replace("https://", ""),
    }, { status: 401 });
  }
  if (!data.session || !data.user) {
    return NextResponse.json({ error: "Auth accepted the login but returned no session." }, { status: 500 });
  }
  return NextResponse.json({
    session: data.session,
    user: { id: data.user.id, email: data.user.email },
  });
}
