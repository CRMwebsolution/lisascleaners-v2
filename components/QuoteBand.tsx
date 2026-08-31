import Link from "next/link";
import { CTA_LABEL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { QUOTE_REASSURANCE } from "@/lib/publicCopy";

export default function QuoteBand({ tone = "soft" }: { tone?: "soft" | "navy" }) {
  const navy = tone === "navy";
  return (
    <section className={navy ? "bg-purple-dark text-white" : "bg-cream"}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`font-display text-2xl font-semibold ${navy ? "text-white" : "text-purple-dark"}`}>Ready for a custom quote?</h2>
          <p className={`mt-1 text-sm ${navy ? "text-white/80" : ""}`}>{QUOTE_REASSURANCE}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/request-a-quote" className={`tap inline-flex items-center justify-center rounded-full px-5 text-sm font-semibold ${navy ? "bg-white text-purple-dark hover:bg-cream" : "bg-purple-mid text-white hover:bg-purple-dark"}`}>{CTA_LABEL}</Link>
          <a href={`tel:${PHONE_TEL}`} className={`tap inline-flex items-center justify-center rounded-full border-2 px-5 text-sm font-semibold ${navy ? "border-white text-white" : "border-purple-dark text-purple-dark"}`}>Call {PHONE_DISPLAY}</a>
        </div>
      </div>
    </section>
  );
}
