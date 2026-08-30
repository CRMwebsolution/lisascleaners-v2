import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS_NAME, CTA_LABEL, SERVICES } from "@/lib/site";

export const metadata: Metadata = {
  title: `Residential, Office & Vacation Rental Cleaning in Newport, NC`,
  description:
    "Residential, office, deep clean, move in/out, recurring, window and floor, and vacation rental cleaning in Newport and nearby coastal towns.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-purple-dark sm:text-4xl">
        Cleaning services in Newport and nearby coastal towns
      </h1>
      <p className="mt-4 max-w-2xl text-lg">
        I’m Lisa. Here’s the work I do for homes, offices, and vacation rentals. If you’re not
        sure which one fits, tell me in the quote form and I’ll follow up.
      </p>
      <ul className="mt-10 space-y-6">
        {SERVICES.map((service) => (
          <li
            key={service.slug}
            id={service.slug}
            className="rounded-lg border border-purple-light p-6"
          >
            <h2 className="text-2xl font-semibold text-purple-dark">{service.label}</h2>
            <p className="mt-2">{service.summary}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        {BUSINESS_NAME} does not take payments on this site. Request a quote and I’ll get back
        to you.
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
