import type { Metadata } from "next";
import Link from "next/link";
import CoastalMap from "@/components/CoastalMap";
import QuoteBand from "@/components/QuoteBand";
import { LOCAL_LINE } from "@/lib/publicCopy";
import { ADDRESS_LINE, CTA_LABEL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Cleaning in Emerald Isle, Atlantic Beach, Morehead City & Nearby`,
  description: "Lisa McNamara Cleaning Service serves Emerald Isle, Atlantic Beach, Morehead City, Newport, Pine Knoll Shores, Beaufort, Cape Carteret, Indian Beach, Swansboro, and Harkers Island.",
  alternates: { canonical: "/areas" },
};

export default function AreasPage() {
  return (
    <main id="main">
      <div className="bg-purple-soft">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="font-display text-4xl font-semibold text-purple-dark sm:text-5xl">Cleaning in Emerald Isle, Atlantic Beach, Morehead City, and nearby towns</h1>
          <p className="mt-4 max-w-2xl text-lg">{LOCAL_LINE}</p>
          <p className="mt-2 max-w-2xl">I’m based in {ADDRESS_LINE}.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <CoastalMap />
        <p className="mt-8 max-w-2xl">If your job is in one of these towns, request a quote and I’ll follow up. This is not a booking.</p>
        <Link href="/request-a-quote" className="tap mt-6 inline-flex items-center justify-center rounded-full bg-purple-mid px-5 text-base font-semibold text-white hover:bg-purple-dark">{CTA_LABEL}</Link>
      </div>
      <QuoteBand />
    </main>
  );
}
