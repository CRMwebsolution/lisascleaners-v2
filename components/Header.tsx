"use client";

import Link from "next/link";
import { useState } from "react";
import BrandMark from "@/components/BrandMark";
import { BUSINESS_NAME, CTA_LABEL, NAV_LINKS, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-purple-light bg-white/95 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-purple-mid focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="tap inline-flex max-w-[70%] items-center gap-2 text-left sm:max-w-none">
          <BrandMark className="h-9 w-9 shrink-0" />
          <span className="text-sm font-semibold leading-tight text-purple-dark sm:text-base">{BUSINESS_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.filter((l) => l.href !== "/request-a-quote").map((link) => (
            <Link key={link.href} href={link.href} className="tap inline-flex items-center px-3 text-sm font-medium text-ink hover:text-purple-mid">{link.label}</Link>
          ))}
          <a href={`tel:${PHONE_TEL}`} className="tap inline-flex items-center px-3 text-sm font-semibold text-purple-mid">{PHONE_DISPLAY}</a>
          <Link href="/request-a-quote" className="tap inline-flex items-center rounded-full bg-purple-mid px-4 text-sm font-semibold text-white hover:bg-purple-dark">{CTA_LABEL}</Link>
        </nav>
        <div className="flex items-center gap-2 lg:hidden">
          <a href={`tel:${PHONE_TEL}`} className="tap inline-flex items-center justify-center rounded-full border border-purple-mid px-3 text-sm font-semibold text-purple-mid">Call</a>
          <button type="button" className="tap inline-flex items-center justify-center rounded-full border border-purple-dark px-3 text-sm font-semibold text-purple-dark" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Menu"}</button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-purple-light bg-white px-4 py-3 lg:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}><Link href={link.href} className="tap flex items-center rounded-md px-3 text-base font-medium text-ink hover:bg-purple-soft" onClick={() => setOpen(false)}>{link.label}</Link></li>
            ))}
            <li><a href={`tel:${PHONE_TEL}`} className="tap flex items-center rounded-md px-3 text-base font-semibold text-purple-mid">{PHONE_DISPLAY}</a></li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
