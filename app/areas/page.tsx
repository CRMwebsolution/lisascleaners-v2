import type { Metadata } from "next";
import Link from "next/link";
import { ADDRESS_LINE, CTA_LABEL, TOWNS } from "@/lib/site";

export const metadata: Metadata = {
  title: `Cleaning in Emerald Isle, Atlantic Beach, Morehead City & Nearby`,
  description:
    "Lisa McNamara Cleaning Service serves Emerald Isle, Atlantic Beach, Morehead City, Newport, Pine Knoll Shores, Beaufort, Cape Carteret, Indian Beach, Swansboro, and Harkers Island.",
  alternates: { canonical: "/areas" },
};

export default function AreasPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-purple-dark sm:text-4xl">
        Cleaning in Emerald Isle, Atlantic Beach, Morehead City, and nearby towns
      </h1>
      <p className="mt-4 max-w-2xl text-lg">
        I’m based in {ADDRESS_LINE}. I travel to homes, offices, and vacation rentals in these
        towns:
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOWNS.map((town) => (
          <li
            key={town}
            className="rounded-lg border border-purple-light bg-purple-soft px-4 py-4 text-lg font-semibold text-purple-dark"
          >
            {town}
          </li>
        ))}
      </ul>
      <p className="mt-8 max-w-2xl">
        If your job is in one of these towns, request a quote and I’ll follow up. This is not a
        booking.
      </p>
      <Link
        href="/request-a-quote"
        className="tap mt-6 inline-flex items-center justify-center rounded-md bg-purple-mid px-5 text-base font-semibold text-white hover:bg-purple-dark"
      >
        {CTA_LABEL}
      </Link>
    </main>
  );
}
