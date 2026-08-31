import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { ADDRESS_LINE, BUSINESS_NAME, CTA_LABEL, EMAIL, HOURS_WEEKDAY, HOURS_WEEKEND, NAV_LINKS, PHONE_DISPLAY, PHONE_TEL, TOWNS } from "@/lib/site";
import { LOCAL_LINE } from "@/lib/publicCopy";

export default function Footer() {
  return (
    <footer className="border-t border-purple-light bg-purple-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-base font-semibold"><BrandMark className="h-8 w-8" />{BUSINESS_NAME}</p>
          <p className="mt-3 text-sm text-white/80">{LOCAL_LINE}</p>
          <p className="mt-2 text-sm text-white/80">{ADDRESS_LINE}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sand">Contact</p>
          <a href={`tel:${PHONE_TEL}`} className="tap mt-2 inline-flex items-center text-sm font-semibold text-white">{PHONE_DISPLAY}</a>
          <a href={`mailto:${EMAIL}`} className="tap mt-1 flex items-center text-sm text-white/80">{EMAIL}</a>
          <Link href="/request-a-quote" className="tap mt-4 inline-flex items-center rounded-full bg-white px-4 text-sm font-semibold text-purple-dark">{CTA_LABEL}</Link>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sand">Hours</p>
          <p className="mt-2 text-sm text-white/80">{HOURS_WEEKDAY}</p>
          <p className="mt-1 text-sm text-white/80">{HOURS_WEEKEND}</p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-sand">Towns</p>
          <p className="mt-2 text-sm text-white/80">{TOWNS.join(" \u00b7 ")}</p>
        </div>
        <nav aria-label="Footer">
          <p className="text-sm font-semibold uppercase tracking-wide text-sand">Explore</p>
          <ul className="mt-2 space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}><Link href={link.href} className="tap inline-flex items-center text-sm text-white/80 hover:text-white">{link.label}</Link></li>
            ))}
            <li><Link href="/privacy" className="tap inline-flex items-center text-sm text-white/80 hover:text-white">Privacy</Link></li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl justify-end px-4 pb-4">
        <Link href="/login" className="text-white opacity-20 hover:opacity-60" aria-label="Staff login">\u25cf</Link>
      </div>
    </footer>
  );
}
