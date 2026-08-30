import type { Metadata } from "next";
import Link from "next/link";
import {
  ADDRESS_LINE,
  BUSINESS_NAME,
  CTA_LABEL,
  HOME_H1,
  HOURS_DISPLAY,
  PHONE_DISPLAY,
  PHONE_TEL,
  SERVICES,
  TOWNS,
} from "@/lib/site";

export const metadata: Metadata = {
  title: `House, Office & Vacation Rental Cleaning in Newport, NC | ${BUSINESS_NAME}`,
  description:
    "Cleaning for homes, offices, and vacation rentals in Newport and nearby coastal towns. Call Lisa or request a quote.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main id="main">
      <section className="bg-purple-soft">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-mid">
            {BUSINESS_NAME}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-purple-dark sm:text-4xl">
            {HOME_H1}
          </h1>
          <p className="mt-4 max-w-2xl text-lg">
            Hi, I’m Lisa. I clean homes, offices, and vacation rentals around Newport and the
            nearby coastal towns. Tell me what you need and I’ll follow up with a quote.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/request-a-quote"
              className="tap inline-flex items-center justify-center rounded-md bg-purple-mid px-5 text-base font-semibold text-white hover:bg-purple-dark"
            >
              {CTA_LABEL}
            </Link>
            <a
              href={`tel:${PHONE_TEL}`}
              className="tap inline-flex items-center justify-center rounded-md border-2 border-purple-dark px-5 text-base font-semibold text-purple-dark"
            >
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-purple-dark">How I can help</h2>
        <p className="mt-2 max-w-2xl">
          I offer residential, office, deep clean, move in/out, recurring, window and floor, and
          vacation rental cleaning.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <li
              key={service.slug}
              className="rounded-lg border border-purple-light bg-white p-5"
            >
              <h3 className="text-lg font-semibold text-purple-dark">{service.label}</h3>
              <p className="mt-2 text-sm">{service.summary}</p>
            </li>
          ))}
        </ul>
        <Link
          href="/services"
          className="tap mt-6 inline-flex items-center font-semibold text-purple-mid"
        >
          See all services
        </Link>
      </section>

      <section className="bg-purple-soft">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold text-purple-dark">Towns I serve</h2>
          <p className="mt-2 max-w-2xl">
            I’m based in {ADDRESS_LINE}. I clean in these coastal towns:
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {TOWNS.map((town) => (
              <li
                key={town}
                className="rounded-md bg-white px-3 py-3 text-sm font-medium text-purple-dark"
              >
                {town}
              </li>
            ))}
          </ul>
          <Link
            href="/areas"
            className="tap mt-6 inline-flex items-center font-semibold text-purple-mid"
          >
            See service areas
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-purple-dark">Hours</h2>
        <p className="mt-2">{HOURS_DISPLAY}</p>
        <p className="mt-4">
          This site is for quotes only. There is no public calendar hold and I do not take
          payments here.
        </p>
        <Link
          href="/request-a-quote"
          className="tap mt-6 inline-flex items-center justify-center rounded-md bg-purple-mid px-5 text-base font-semibold text-white hover:bg-purple-dark"
        >
          {CTA_LABEL}
        </Link>
      </section>
    </main>
  );
}
