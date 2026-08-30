import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Request a Quote for Cleaning in Newport and Nearby Towns`,
  description:
    "Request a quote from Lisa McNamara Cleaning Service for homes, offices, and vacation rentals in Newport and nearby coastal towns. This is not a booking.",
  alternates: { canonical: "/request-a-quote" },
};

export default function RequestQuotePage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-purple-dark sm:text-4xl">
        Request a quote for cleaning in Newport and nearby coastal towns
      </h1>
      <p className="mt-4 text-lg">
        Tell me about the job and I’ll follow up. This is not a booking. I do not take payments
        on this form.
      </p>
      <p className="mt-2">
        If you need me sooner, call{" "}
        <a className="font-semibold text-purple-mid" href={`tel:${PHONE_TEL}`}>
          {PHONE_DISPLAY}
        </a>
        .
      </p>
      <div className="mt-8 rounded-lg border border-purple-light p-5 sm:p-8">
        <QuoteForm />
      </div>
    </main>
  );
}
