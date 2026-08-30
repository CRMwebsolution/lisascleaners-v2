import Link from "next/link";
import {
  ADDRESS_LINE,
  BUSINESS_NAME,
  CTA_LABEL,
  EMAIL,
  HOURS_DISPLAY,
  NAV_LINKS,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-purple-light bg-purple-soft">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-purple-dark">{BUSINESS_NAME}</p>
          <p className="mt-2 text-sm">{ADDRESS_LINE}</p>
          <p className="mt-2 text-sm">{HOURS_DISPLAY}</p>
        </div>
        <div>
          <p className="font-semibold text-purple-dark">Contact</p>
          <a
            href={`tel:${PHONE_TEL}`}
            className="tap mt-2 inline-flex items-center text-sm font-semibold text-purple-mid"
          >
            {PHONE_DISPLAY}
          </a>
          <a href={`mailto:${EMAIL}`} className="tap mt-1 flex items-center text-sm text-purple-mid">
            {EMAIL}
          </a>
          <Link
            href="/request-a-quote"
            className="tap mt-4 inline-flex items-center rounded-md bg-purple-mid px-4 text-sm font-semibold text-white hover:bg-purple-dark"
          >
            {CTA_LABEL}
          </Link>
        </div>
        <nav aria-label="Footer">
          <p className="font-semibold text-purple-dark">Pages</p>
          <ul className="mt-2 space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="tap inline-flex items-center text-sm text-ink hover:text-purple-mid">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/privacy" className="tap inline-flex items-center text-sm text-ink hover:text-purple-mid">
                Privacy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl justify-end px-4 pb-4">
        <Link href="/login" className="text-purple-mid opacity-20 hover:opacity-60" aria-label="Staff login">
          ●
        </Link>
      </div>
    </footer>
  );
}
