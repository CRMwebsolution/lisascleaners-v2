import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";
import { EMAIL, HOURS_DISPLAY, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Request a Quote for Cleaning in Newport and Nearby Towns`,
  description:
    "Request a quote from Lisa McNamara Cleaning Service for homes, offices, and vacation rentals in Newport and nearby coastal towns. This is not a booking.",
  alternates: { canonical: "/request-a-quote" },
};

export default function RequestQuotePage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <h1 className="text-3xl font-bold text-purple-dark sm:text-4xl">
            Request a quote for cleaning in Newport and nearby coastal towns
          </h1>
          <p className="mt-4 text-lg">
            Tell me about the job and I’ll follow up. This is not a booking. I do not take
            payments on this form.
          </p>
          <div className="mt-8 rounded-lg border border-purple-light p-5 sm:p-8">
            <QuoteForm />
          </div>
        </div>
        <aside className="h-fit rounded-lg bg-purple-soft p-5 lg:sticky lg:top-24">
          <p className="font-semibold text-purple-dark">Call instead</p>
          <a className="tap mt-2 inline-flex font-semibold text-purple-mid" href={`tel:${PHONE_TEL}`}>
            {PHONE_DISPLAY}
          </a>
          <p className="mt-4 text-sm">{HOURS_DISPLAY}</p>
          <p className="mt-4 text-sm">
            Email{" "}
            <a className="font-semibold text-purple-mid" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </p>
        </aside>
      </div>
    </main>
  );
}
