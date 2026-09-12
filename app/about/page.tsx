import type { Metadata } from "next";
import Link from "next/link";
import QuoteBand from "@/components/QuoteBand";
import WhyLisa from "@/components/WhyLisa";
import { loadGalleryItems, siteImageFrom } from "@/lib/gallery";
import { LOCAL_LINE } from "@/lib/publicCopy";
import { ADDRESS_LINE, BUSINESS_NAME, CTA_LABEL, EMAIL, HOURS_DISPLAY, PHONE_DISPLAY, PHONE_TEL, TOWNS } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `About Lisa McNamara Cleaning Service in Newport, NC`,
  description: "I’m Lisa McNamara. I clean homes, offices, and vacation rentals in Newport and nearby coastal towns.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const about = siteImageFrom(await loadGalleryItems(), "about", "", "Lisa McNamara");
  return (
    <main id="main">
      <div className="bg-purple-soft">
        <div className={`mx-auto grid max-w-6xl gap-10 px-4 py-16 ${about.url ? "lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center" : ""}`}>
          {about.url ? (
            <div className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={about.url} alt={about.alt} className="aspect-[4/5] w-full object-cover" />
            </div>
          ) : null}
          <div>
            <h1 className="font-display text-4xl font-semibold text-purple-dark sm:text-5xl">About {BUSINESS_NAME}</h1>
            <p className="mt-4 max-w-2xl text-lg">I’m Lisa. I run {BUSINESS_NAME} from {ADDRESS_LINE}. I clean homes, offices, and vacation rentals in {TOWNS.slice(0, -1).join(", ")}, and {TOWNS[TOWNS.length - 1]}.</p>
            <p className="mt-4 max-w-2xl">{LOCAL_LINE}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <WhyLisa />
        <p className="mt-8 max-w-2xl">If you need a quote, use the form on this site. That is a request, not a booking. I do not take payments here. I’ll follow up by phone or email.</p>
        <p className="mt-4 max-w-2xl">Hours: {HOURS_DISPLAY}</p>
        <p className="mt-4 max-w-2xl">Call <a className="font-semibold text-purple-mid" href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a> or email <a className="font-semibold text-purple-mid" href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
        <Link href="/request-a-quote" className="tap mt-8 inline-flex items-center justify-center rounded-full bg-purple-mid px-5 text-base font-semibold text-white hover:bg-purple-dark">{CTA_LABEL}</Link>
      </div>
      <QuoteBand tone="navy" />
    </main>
  );
}
