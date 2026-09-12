import type { Metadata } from "next";
import Link from "next/link";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import QuoteBand from "@/components/QuoteBand";
import { galleryDisplayItems, loadGalleryItems, publicObjectUrl } from "@/lib/gallery";
import { CTA_LABEL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Cleaning Job Photos in Newport and Nearby Coastal Towns`,
  description: "Photo gallery for Lisa McNamara Cleaning Service in Newport, NC. Finished job photos from coastal homes and rentals.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const items = galleryDisplayItems(await loadGalleryItems());
  return (
    <main id="main">
      <div className="bg-purple-soft">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="font-display text-4xl font-semibold text-purple-dark sm:text-5xl">Cleaning job photos from Newport and nearby coastal towns</h1>
          <p className="mt-4 max-w-2xl text-lg">These are finished-job photos from Lisa’s work. Drag the slider on before-and-after photos to see the change.</p>
        </div>
      </div>
      <ul className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <figure className="overflow-hidden rounded-2xl bg-cream">
              {item.after_path ? (
                <BeforeAfterSlider beforeUrl={publicObjectUrl(item.path)} afterUrl={publicObjectUrl(item.after_path)} alt={item.alt || "Before and after"} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publicObjectUrl(item.path)} alt={item.alt} className="aspect-[4/3] w-full object-cover" />
              )}
              <figcaption className="p-3 text-sm text-purple-dark">{item.caption || item.alt}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div className="mx-auto max-w-6xl px-4 pb-10">
        <Link href="/request-a-quote" className="tap inline-flex items-center justify-center rounded-full bg-purple-mid px-5 text-base font-semibold text-white hover:bg-purple-dark">{CTA_LABEL}</Link>
      </div>
      <QuoteBand />
    </main>
  );
}
