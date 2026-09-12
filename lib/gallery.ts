import { createClient } from "@supabase/supabase-js";
import { GALLERY_PHOTOS, HERO_IMAGE, HERO_IMAGE_ALT, META_IMAGE, META_IMAGE_ALT } from "@/lib/publicCopy";
import { DEFAULT_LISA_BUSINESS_ID } from "@/lib/site";

export const GALLERY_BUCKET = process.env.NEXT_PUBLIC_LISA_GALLERY_BUCKET || "lisa-v2";

export type GalleryKind = "single" | "before_after" | "site";
export type SiteImageKey = "hero" | "about" | "meta";

export const SITE_IMAGE_OPTIONS: { key: SiteImageKey; label: string }[] = [
  { key: "hero", label: "Home hero" },
  { key: "about", label: "About photo" },
  { key: "meta", label: "Share / preview image" },
];

export type GalleryItem = {
  id: string;
  business_id: string;
  kind: GalleryKind;
  site_key: string | null;
  path: string;
  after_path: string | null;
  alt: string;
  caption: string | null;
  created_at: string;
};

export function publicObjectUrl(path: string | null | undefined) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rwmpqlnakmexugwihisy.supabase.co";
  return `${base}/storage/v1/object/public/${GALLERY_BUCKET}/${path.replace(/^\/+/, "")}`;
}

function asItem(row: Record<string, unknown>): GalleryItem {
  return {
    id: String(row.id ?? ""),
    business_id: String(row.business_id ?? ""),
    kind: (row.kind as GalleryKind) || (row.site_key ? "site" : row.after_path ? "before_after" : "single"),
    site_key: (row.site_key as string | null) ?? null,
    path: String(row.path ?? ""),
    after_path: (row.after_path as string | null) ?? null,
    alt: String(row.alt ?? ""),
    caption: (row.caption as string | null) ?? null,
    created_at: String(row.created_at ?? ""),
  };
}

export function fallbackGalleryItems(): GalleryItem[] {
  return GALLERY_PHOTOS.map((photo, index) => ({
    id: `fallback-${index}`,
    business_id: DEFAULT_LISA_BUSINESS_ID,
    kind: "single",
    site_key: null,
    path: photo.url,
    after_path: null,
    alt: photo.alt,
    caption: photo.alt,
    created_at: "",
  }));
}

export async function loadGalleryItems() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return fallbackGalleryItems();
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("lisa_gallery_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data?.length) return error ? fallbackGalleryItems() : [];
  return data.map((row) => asItem(row as Record<string, unknown>));
}

export function galleryDisplayItems(items: GalleryItem[]) {
  const live = items.filter((item) => item.kind !== "site");
  return live.length ? live : fallbackGalleryItems();
}

export function siteImageFrom(items: GalleryItem[], key: SiteImageKey, fallbackUrl: string, fallbackAlt: string) {
  const match = items.find((item) => item.kind === "site" && item.site_key === key && item.path);
  if (!match) return { url: fallbackUrl, alt: fallbackAlt };
  return { url: publicObjectUrl(match.path), alt: match.alt || fallbackAlt };
}
