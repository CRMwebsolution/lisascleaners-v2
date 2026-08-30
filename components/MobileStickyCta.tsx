"use client";

import Link from "next/link";
import { CTA_LABEL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

export default function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-purple-light bg-white p-3 lg:hidden">
      <div className="mx-auto flex max-w-6xl gap-2">
        <a
          href={`tel:${PHONE_TEL}`}
          className="tap inline-flex flex-1 items-center justify-center rounded-md border-2 border-purple-dark px-3 text-sm font-semibold text-purple-dark"
        >
          Call {PHONE_DISPLAY}
        </a>
        <Link
          href="/request-a-quote"
          className="tap inline-flex flex-1 items-center justify-center rounded-md bg-purple-mid px-3 text-sm font-semibold text-white"
        >
          {CTA_LABEL}
        </Link>
      </div>
    </div>
  );
}
