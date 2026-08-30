export const BUSINESS_NAME = "Lisa McNamara Cleaning Service";

export const PHONE_DISPLAY = "(252) 659-1868";
export const PHONE_TEL = "+12526591868";
export const EMAIL = "info@lisascleaners.com";

export const ADDRESS_LOCALITY = "Newport";
export const ADDRESS_REGION = "NC";
export const ADDRESS_POSTAL_CODE = "28570";
export const ADDRESS_LINE = "Newport, NC 28570";

export const HOURS_WEEKDAY = "Mon–Fri 8:00am–6:00pm";
export const HOURS_WEEKEND = "Sat–Sun 9:00am–4:00pm";
export const HOURS_DISPLAY = `${HOURS_WEEKDAY}, ${HOURS_WEEKEND}`;

export const TOWNS = [
  "Emerald Isle",
  "Atlantic Beach",
  "Morehead City",
  "Newport",
  "Pine Knoll Shores",
  "Beaufort",
  "Cape Carteret",
  "Indian Beach",
  "Swansboro",
  "Harkers Island",
] as const;

export const SERVICES = [
  { slug: "residential", label: "Residential", summary: "Regular and one-time cleaning for homes." },
  { slug: "office", label: "Office", summary: "Cleaning for offices and small workplaces." },
  { slug: "deep-clean", label: "Deep clean", summary: "A thorough clean when a space needs extra attention." },
  { slug: "move-in-out", label: "Move in/out", summary: "Cleaning for move-in and move-out days." },
  { slug: "recurring", label: "Recurring", summary: "A regular schedule we set together." },
  { slug: "window-and-floor", label: "Window and floor", summary: "Window and floor cleaning." },
  { slug: "vacation-rental", label: "Vacation rental", summary: "Turnover cleaning for vacation rentals." },
] as const;

export type TypeOfClean = (typeof SERVICES)[number]["label"];

export const CTA_LABEL = "Request a Quote";

export const HOME_H1 =
  "Cleaning for homes, offices, and vacation rentals in Newport and nearby coastal towns.";

export const QUOTE_SUCCESS =
  "Got it. I have your request and I’ll follow up. If you need me sooner, call (252) 659-1868.";

export const QUOTE_ERROR =
  "That didn’t send. Call (252) 659-1868 or email info@lisascleaners.com.";

export const PREFERRED_DATE_HELPER = "This is not a booking.";

export const GALLERY_ALT = "Finished cleaning job photo — to be supplied";

export const SITE_URL = "https://lisascleaners.com";

export const DEFAULT_LISA_BUSINESS_ID = "2ab32295-5f15-4732-ac49-4419fe6d8356";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/areas", label: "Areas" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/request-a-quote", label: "Request a Quote" },
] as const;

export function isTypeOfClean(value: string): value is TypeOfClean {
  return SERVICES.some((service) => service.label === value);
}
