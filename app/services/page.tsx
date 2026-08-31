import type { Metadata } from "next";
import Link from "next/link";
import QuoteBand from "@/components/QuoteBand";
import ServiceIcon from "@/components/ServiceIcon";
import { SERVICE_BENEFITS } from "@/lib/publicCopy";
import { BUSINESS_NAME, CTA_LABEL, SERVICES } from "@/lib/site";

export const metadata: Metadata = {
  title: `Residential, Office & Vacation Rental Cleaning in Newport, NC`,
  description: "Residential, office, deep clean, move in/out, recurring, window and floor, and vacation rental cleaning in Newport and nearby coastal towns.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <main id="main">
      <div className="bg-purple-soft">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="font-display text-4xl font-semibold text-purple-dark sm:text-5xl">Cleaning services in Newport and nearby coastal towns</h1>
          <p className="mt-4 max-w-2xl text-lg">I’m Lisa. Here’s the work I do for homes, offices, and vacation rentals. If you’re not sure which one fits, tell me in the quote form and I’ll follow up.</p>
        </div>
      </div>
      <ul className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2">
        {SERVICES.map((service) => (
          <li key={service.slug} id={service.slug} className={`rounded-2xl border p-6 ${service.slug === "vacation-rental" ? "border-purple-mid bg-cream sm:col-span-2" : "border-purple-light bg-white"}`}>
            <ServiceIcon slug={service.slug} />
            <h2 className="mt-3 font-display text-2xl font-semibold text-purple-dark">{service.label}</h2>
            <p className="mt-2">{SERVICE_BENEFITS[service.slug] ?? service.summary}</p>
          </li>
        ))}
      </ul>
      <p className="mx-auto max-w-6xl px-4 pb-8">{BUSINESS_NAME} does not take payments on this site. Request a quote and I’ll get back to you.</p>
      <div className="mx-auto max-w-6xl px-4 pb-10">
        <Link href="/request-a-quote" className="tap inline-flex items-center justify-center rounded-full bg-purple-mid px-5 text-base font-semibold text-white hover:bg-purple-dark">{CTA_LABEL}</Link>
      </div>
      <QuoteBand tone="navy" />
    </main>
  );
}
