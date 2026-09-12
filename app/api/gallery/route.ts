import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { DEFAULT_LISA_BUSINESS_ID } from "@/lib/site";
import { asGalleryItem, GALLERY_BUCKET } from "@/lib/gallery";

export const runtime = "nodejs";

function env() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    service: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

async function requireAdmin(request: Request) {
  const { url, anon, service } = env();
  if (!url || !anon) return { error: NextResponse.json({ error: "Missing Supabase env" }, { status: 500 }) };
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!token) return { error: NextResponse.json({ error: "Sign in as an admin and try again." }, { status: 401 }) };
  if (!service) return { error: NextResponse.json({ error: "Add SUPABASE_SERVICE_ROLE_KEY to Vercel env, then redeploy." }, { status: 501 }) };
  const authed = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: userData, error: userError } = await authed.auth.getUser(token);
  if (userError || !userData.user) return { error: NextResponse.json({ error: "Session expired. Sign in again." }, { status: 401 }) };
  const admin = createClient(url, service);
  const { data: actor } = await admin.from("lisa_profiles").select("role").eq("id", userData.user.id).maybeSingle();
  if (actor?.role !== "admin") return { error: NextResponse.json({ error: "Admin only." }, { status: 403 }) };
  return { admin };
}

function extOf(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName) && fromName.length <= 5) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function uploadFile(admin: ReturnType<typeof createClient>, file: File, path: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from(GALLERY_BUCKET).upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  return error?.message ?? null;
}

export async function GET() {
  const { url, anon } = env();
  if (!url || !anon) return NextResponse.json({ items: [] });
  const supabase = createClient(url, anon);
  const { data, error } = await supabase.from("lisa_gallery_items").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message, items: [] }, { status: 400 });
  return NextResponse.json({ items: (data ?? []).map((row) => asGalleryItem(row as Record<string, unknown>)) });
}

export async function POST(request: Request) {
  const gate = await requireAdmin(request);
  if ("error" in gate && gate.error) return gate.error;
  const admin = gate.admin!;
  const form = await request.formData();
  const kind = String(form.get("kind") || "single") as "single" | "before_after" | "site";
  const siteKey = String(form.get("site_key") || "").trim() || null;
  const alt = String(form.get("alt") || "").trim();
  const caption = String(form.get("caption") || "").trim() || null;
  const image = form.get("image");
  const after = form.get("after_image");
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  }
  if (kind === "before_after" && (!(after instanceof File) || after.size === 0)) {
    return NextResponse.json({ error: "Before and after both need a photo." }, { status: 400 });
  }
  if (kind === "site" && !siteKey) {
    return NextResponse.json({ error: "Pick which site image to replace." }, { status: 400 });
  }

  const businessId = process.env.LISA_BUSINESS_ID || DEFAULT_LISA_BUSINESS_ID;
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const folder = kind === "site" ? `site/${siteKey}` : "gallery";
  const storagePath = `${folder}/${stamp}.${extOf(image)}`;
  const afterPath = kind === "before_after" && after instanceof File ? `${folder}/${stamp}-after.${extOf(after)}` : null;

  const uploadError = await uploadFile(admin, image, storagePath);
  if (uploadError) return NextResponse.json({ error: `Upload failed: ${uploadError}. Check the bucket name and that it is public.` }, { status: 400 });
  if (after instanceof File && afterPath) {
    const afterError = await uploadFile(admin, after, afterPath);
    if (afterError) return NextResponse.json({ error: `After photo failed: ${afterError}` }, { status: 400 });
  }

  if (kind === "site" && siteKey) {
    await admin.from("lisa_gallery_items").delete().eq("site_key", siteKey);
  }

  const row = {
    business_id: businessId,
    storage_path: storagePath,
    alt_text: alt || (kind === "site" ? `${siteKey} photo` : "Cleaning job photo"),
    kind,
    site_key: kind === "site" ? siteKey : null,
    after_path: afterPath,
    caption,
  };
  const insert = await admin.from("lisa_gallery_items").insert(row as never).select("*").single();
  if (insert.error) return NextResponse.json({ error: insert.error.message }, { status: 400 });
  return NextResponse.json({ ok: true, item: asGalleryItem((insert.data ?? {}) as Record<string, unknown>) });
}

export async function DELETE(request: Request) {
  const gate = await requireAdmin(request);
  if ("error" in gate && gate.error) return gate.error;
  const admin = gate.admin!;
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: "Photo id is required." }, { status: 400 });
  const { data } = await admin.from("lisa_gallery_items").select("*").eq("id", body.id).maybeSingle();
  const row = data as { storage_path?: string; path?: string; after_path?: string } | null;
  const paths = [row?.storage_path, row?.path, row?.after_path].filter(Boolean) as string[];
  if (paths.length) await admin.storage.from(GALLERY_BUCKET).remove(paths);
  const removed = await admin.from("lisa_gallery_items").delete().eq("id", body.id);
  if (removed.error) return NextResponse.json({ error: removed.error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
