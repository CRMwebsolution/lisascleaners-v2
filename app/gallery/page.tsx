import type { Metadata } from "next";
import Link from "next/link";
import { CTA_LABEL, GALLERY_ALT } from "@/lib/site";

export const metadata: Metadata = {
  title: `Cleaning Job Photos in Newport and Nearby Coastal Towns`,
  description:
    "Photo gallery for Lisa McNamara Cleaning Service in Newport, NC. Finished job photos will be added here.",
  alternates: { canonical: "/gallery" },
};

const PLACEHOLDERS = Array.from({ length: 6 }, (_, i) => i + 1);

export default function GalleryPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-purple-dark sm:text-4xl">
        Cleaning job photos from Newport and nearby coastal towns
      </h1>
      <p className="mt-4 max-w-2xl text-lg">
        I will add photos of finished jobs here. These tiles are placeholders until I have
        pictures ready.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDERS.map((n) => (
          <li key={n}>
            <figure
              role="img"
              aria-label={GALLERY_ALT}
              className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-purple-mid bg-purple-soft p-4 text-center"
            >
              <figcaption className="text-sm font-medium text-purple-dark">
                {GALLERY_ALT}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <Link
        href="/request-a-quote"
        className="tap mt-8 inline-flex items-center justify-center rounded-md bg-purple-mid px-5 text-base font-semibold text-white hover:bg-purple-dark"
      >
        {CTA_LABEL}
      </Link>
    </main>
  );
}
