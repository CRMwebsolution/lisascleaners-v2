import type { Metadata } from "next";
import Link from "next/link";
import CoastalMap from "@/components/CoastalMap";
import GalleryPreview from "@/components/GalleryPreview";
import HeroHeadline from "@/components/HeroHeadline";
import QuoteBand from "@/components/QuoteBand";
import ServiceCards from "@/components/ServiceCards";
import WhyLisa from "@/components/WhyLisa";
import { HERO_IMAGE, HERO_IMAGE_ALT, HERO_LEDE, LOCAL_LINE, QUOTE_REASSURANCE, TRUST_MARKERS } from "@/lib/publicCopy";
import { BUSINESS_NAME, CTA_LABEL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

export const metadata: Metadata = {
  title: `House, Office & Vacation Rental Cleaning in Newport, NC | ${BUSINESS_NAME}`,
  description: "Cleaning for homes, offices, and vacation rentals in Newport and nearby coastal towns. Call Lisa or request a quote.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main id="main">
      <section className="grid min-h-[78vh] bg-purple-dark lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-14 sm:px-8 lg:px-12">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sand">{BUSINESS_NAME}</p>
            <HeroHeadline />
            <p className="mt-4 text-lg text-white/90">{HERO_LEDE}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/request-a-quote" className="tap inline-flex items-center justify-center rounded-full bg-purple-mid px-6 text-base font-semibold text-white hover:bg-white hover:text-purple-dark">{CTA_LABEL}</Link>
              <a href={`tel:${PHONE_TEL}`} className="tap inline-flex items-center justify-center rounded-full border-2 border-white px-6 text-base font-semibold text-white">Call Lisa, {PHONE_DISPLAY}</a>
            </div>
            <p className="mt-3 text-sm text-white/80">{QUOTE_REASSURANCE}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {TRUST_MARKERS.map((item) => (
                <li key={item} className="rounded-full bg-white/15 px-3 py-1 text-sm text-white">{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative min-h-[280px] bg-purple-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_IMAGE} alt={HERO_IMAGE_ALT} className="absolute inset-0 h-full w-full object-cover object-center" />
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-mid">How I can help</p>
          <h2 className="font-display mt-2 max-w-2xl text-3xl font-semibold text-purple-dark">Cleaning for homes, offices, and vacation rentals</h2>
          <ServiceCards />
          <Link href="/services" className="tap mt-8 inline-flex items-center font-semibold text-purple-mid">See all services</Link>
        </div>
      </section>
      <QuoteBand />
      <section className="bg-purple-soft">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-mid">Why choose Lisa</p>
          <h2 className="font-display mt-2 max-w-2xl text-3xl font-semibold text-purple-dark">A personable local service you can ask into your home</h2>
          <p className="mt-3 max-w-2xl">Hi, I am Lisa. I clean one job at a time and follow up on every quote myself. If you want a recent reference in your town, call and I will share one.</p>
          <div className="mt-8"><WhyLisa /></div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-mid">Service area</p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-purple-dark">{LOCAL_LINE}</h2>
            <p className="mt-3 max-w-xl">I travel to homes, offices, and rentals across these Crystal Coast towns.</p>
            <div className="mt-6"><CoastalMap /></div>
            <Link href="/areas" className="tap mt-6 inline-flex items-center font-semibold text-purple-mid">See service areas</Link>
          </div>
          <aside className="rounded-2xl bg-cream p-6">
            <h3 className="font-display text-xl font-semibold text-purple-dark">Recent work</h3>
            <p className="mt-2 text-sm">Photos from finished jobs. More will be added as new pictures come in.</p>
            <div className="mt-4"><GalleryPreview count={3} /></div>
            <Link href="/gallery" className="tap mt-5 inline-flex items-center font-semibold text-purple-mid">View cleaning gallery</Link>
          </aside>
        </div>
      </section>
      <QuoteBand tone="navy" />
    </main>
  );
}
