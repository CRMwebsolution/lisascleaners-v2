import type { Metadata } from "next";
import Link from "next/link";
import {
  ADDRESS_LINE,
  BUSINESS_NAME,
  CTA_LABEL,
  EMAIL,
  HOURS_DISPLAY,
  PHONE_DISPLAY,
  PHONE_TEL,
  TOWNS,
} from "@/lib/site";

export const metadata: Metadata = {
  title: `About Lisa McNamara Cleaning Service in Newport, NC`,
  description:
    "I’m Lisa McNamara. I clean homes, offices, and vacation rentals in Newport and nearby coastal towns.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-purple-dark sm:text-4xl">
        About {BUSINESS_NAME} in Newport, NC
      </h1>
      <p className="mt-4 max-w-2xl text-lg">
        I’m Lisa. I run {BUSINESS_NAME} from {ADDRESS_LINE}. I clean homes, offices, and
        vacation rentals in {TOWNS.slice(0, -1).join(", ")}, and {TOWNS[TOWNS.length - 1]}.
      </p>
      <p className="mt-4 max-w-2xl">
        If you need a quote, use the form on this site. That is a request, not a booking. I do
        not take payments here. I’ll follow up by phone or email.
      </p>
      <p className="mt-4 max-w-2xl">
        Hours: {HOURS_DISPLAY}
      </p>
      <p className="mt-4 max-w-2xl">
        Call{" "}
        <a className="font-semibold text-purple-mid" href={`tel:${PHONE_TEL}`}>
          {PHONE_DISPLAY}
        </a>{" "}
        or email{" "}
        <a className="font-semibold text-purple-mid" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        .
      </p>
      <Link
        href="/request-a-quote"
        className="tap mt-8 inline-flex items-center justify-center rounded-md bg-purple-mid px-5 text-base font-semibold text-white hover:bg-purple-dark"
      >
        {CTA_LABEL}
      </Link>
    </main>
  );
}
