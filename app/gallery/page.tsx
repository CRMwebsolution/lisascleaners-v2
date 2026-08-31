import type { Metadata } from "next";
import Link from "next/link";
import QuoteBand from "@/components/QuoteBand";
import { GALLERY_PHOTOS } from "@/lib/publicCopy";
import { CTA_LABEL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Cleaning Job Photos in Newport and Nearby Coastal Towns`,
  description: "Photo gallery for Lisa McNamara Cleaning Service in Newport, NC. Finished job photos from coastal homes and rentals.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <main id="main">
      <div className="bg-purple-soft">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="font-display text-4xl font-semibold text-purple-dark sm:text-5xl">Cleaning job photos from Newport and nearby coastal towns</h1>
          <p className="mt-4 max-w-2xl text-lg">These are finished-job photos from Lisa’s work. More pictures will be added as they come in.</p>
        </div>
      </div>
      <ul className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2">
        {GALLERY_PHOTOS.map((photo) => (
          <li key={photo.url}>
            <figure className="overflow-hidden rounded-2xl bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.alt} className="aspect-[4/3] w-full object-cover" />
              <figcaption className="p-3 text-sm text-purple-dark">{photo.alt}</figcaption>
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
