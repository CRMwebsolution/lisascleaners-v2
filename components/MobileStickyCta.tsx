"use client";

import Link from "next/link";
import { CTA_LABEL, PHONE_TEL } from "@/lib/site";

export default function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-purple-light bg-white/95 p-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-6xl gap-2">
        <a href={`tel:${PHONE_TEL}`} className="tap inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-purple-dark px-3 text-sm font-semibold text-purple-dark">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 4 H10 L11 8 L9 9.5 C10.5 12.5 13 15 16 16.5 L17.5 14.5 L21.5 15.5 V19.5 C21.5 20.5 20.5 21 19.5 21 C11 21 4 14 4 5.5 C4 4.5 4.5 3.5 5.5 3.5" /></svg>
          Call
        </a>
        <Link href="/request-a-quote" className="tap inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-purple-mid px-3 text-sm font-semibold text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 6 H19 V18 H5 Z M8 10 H16 M8 14 H13" /></svg>
          {CTA_LABEL}
        </Link>
      </div>
    </div>
  );
}
