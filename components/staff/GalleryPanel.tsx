"use client";

import { FormEvent, useEffect, useState } from "react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { GALLERY_BUCKET, SITE_IMAGE_OPTIONS, publicObjectUrl, type GalleryItem, type GalleryKind } from "@/lib/gallery";

const inputCls = "w-full rounded-md border border-purple-light px-3 py-2 text-sm";

export default function GalleryPanel() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [kind, setKind] = useState<GalleryKind>("single");
  const [siteKey, setSiteKey] = useState("about");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/gallery");
    const body = (await res.json().catch(() => ({}))) as { items?: GalleryItem[]; error?: string };
    setItems(body.items ?? []);
    if (body.error) setError(body.error);
  }

  useEffect(() => {
    void load();
  }, []);

  async function token() {
    const { data } = await getSupabaseBrowser().auth.getSession();
    return data.session?.access_token ?? "";
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const form = new FormData();
    form.set("kind", kind);
    form.set("alt", alt);
    form.set("caption", caption);
    if (kind === "site") form.set("site_key", siteKey);
    if (image) form.set("image", image);
    if (afterImage) form.set("after_image", afterImage);
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { Authorization: `Bearer ${await token()}` },
      body: form,
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) return setError(body.error || "Could not upload.");
    setAlt("");
    setCaption("");
    setImage(null);
    setAfterImage(null);
    setNotice(kind === "site" ? "Site image replaced." : "Photo added.");
    await load();
  }

  async function remove(id: string) {
    setBusy(true);
    const res = await fetch("/api/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify({ id }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) return setError(body.error || "Could not delete.");
    setNotice("Photo removed.");
    await load();
  }

  const gallery = items.filter((item) => item.kind !== "site");
  const site = items.filter((item) => item.kind === "site");

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form onSubmit={save} className="space-y-3 rounded-md bg-white p-4">
        <h2 className="font-semibold text-purple-dark">Upload photo</h2>
        <p className="text-sm text-purple-mid">Bucket: {GALLERY_BUCKET}</p>
        <label className="block text-sm font-medium">Type</label>
        <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as GalleryKind)}>
          <option value="single">Single photo</option>
          <option value="before_after">Before and after</option>
          <option value="site">Replace a site image</option>
        </select>
        {kind === "site" ? (
          <select className={inputCls} value={siteKey} onChange={(e) => setSiteKey(e.target.value)}>
            {SITE_IMAGE_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
        ) : null}
        <label className="block text-sm font-medium">{kind === "before_after" ? "Before photo" : "Photo"}</label>
        <input className={inputCls} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        {kind === "before_after" ? (
          <>
            <label className="block text-sm font-medium">After photo</label>
            <input className={inputCls} type="file" accept="image/*" onChange={(e) => setAfterImage(e.target.files?.[0] ?? null)} />
          </>
        ) : null}
        <input className={inputCls} placeholder="Short description" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <input className={inputCls} placeholder="Optional caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {notice ? <p className="text-sm text-green-800">{notice}</p> : null}
        <button type="submit" disabled={busy} className="tap w-full rounded-md bg-purple-mid text-sm font-semibold text-white">{busy ? "Uploading..." : "Save photo"}</button>
      </form>
      <div className="space-y-6">
        <div>
          <h2 className="font-semibold text-purple-dark">Site images</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {SITE_IMAGE_OPTIONS.map((option) => {
              const item = site.find((row) => row.site_key === option.key);
              return (
                <li key={option.key} className="rounded-md bg-white p-3 text-sm">
                  <p className="font-medium">{option.label}</p>
                  {item ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={publicObjectUrl(item.path)} alt={item.alt} className="mt-2 aspect-[4/3] w-full rounded object-cover" />
                      <button type="button" className="mt-2 text-red-700" onClick={() => void remove(item.id)}>Remove</button>
                    </>
                  ) : (
                    <p className="mt-2 text-purple-mid">Using the current default.</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-purple-dark">Gallery</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {gallery.length === 0 ? <li className="rounded-md bg-white p-3 text-sm">No gallery photos yet.</li> : null}
            {gallery.map((item) => (
              <li key={item.id} className="rounded-md bg-white p-3 text-sm">
                {item.after_path ? (
                  <BeforeAfterSlider beforeUrl={publicObjectUrl(item.path)} afterUrl={publicObjectUrl(item.after_path)} alt={item.alt || "Before and after"} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={publicObjectUrl(item.path)} alt={item.alt} className="aspect-[4/3] w-full rounded object-cover" />
                )}
                <p className="mt-2">{item.caption || item.alt || "Gallery photo"}</p>
                <button type="button" className="mt-1 text-red-700" onClick={() => void remove(item.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
