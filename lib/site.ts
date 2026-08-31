export const BUSINESS_NAME = "Lisa's Cleaners";

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
//  { slug: "window-and-floor", label: "Window and floor", summary: "Window and floor cleaning." },
  { slug: "vacation-rental", label: "Vacation rental", summary: "Turnover cleaning for vacation rentals." },
] as const;

export const JOB_SERVICE_TYPES = [
  "Residential",
  "Office",
  "Deep clean",
  "Move in/out",
  "Recurring",
//  "Window and floor",
  "Vacation rental",
] as const;

export const QUOTE_TIME_OPTIONS = [
  { value: "morning", label: "Morning (8am - 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm - 4pm)" },
  { value: "evening", label: "Evening (4pm - 7pm)" },
] as const;

export const CLEANING_SCHEDULE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "other", label: "Other (specify in comments)" },
] as const;

/** Quote date is limited to Fri–Mon, matching the original form. */
export const QUOTE_ALLOWED_WEEKDAYS = [0, 1, 5, 6] as const;

export type TypeOfClean = (typeof SERVICES)[number]["label"] | "Other";

export const CTA_LABEL = "Request a Quote";

export const HOME_H1 =
  "Cleaning for homes, offices, and vacation rentals in Newport and nearby coastal towns.";

export const QUOTE_SUCCESS =
  "Got it. I have your request and I’ll follow up. If you need me sooner, call (252) 659-1868.";

export const QUOTE_ERROR =
  "That didn’t send. Call (252) 659-1868 or email info@lisascleaners.com.";

export const PREFERRED_DATE_HELPER =
  "This is not a booking. Quote dates are Friday, Saturday, Sunday, or Monday.";

export const GALLERY_ALT = "Finished cleaning job photo — to be supplied";

export const SITE_URL = "https://lisascleaners.com";

export const DEFAULT_LISA_BUSINESS_ID = "2ab32295-5f15-4732-ac49-4419fe6d8356";

/** Seed admins only. Roles stay on lisa_profiles so these can be changed in Staff. */
export const INITIAL_ADMIN_EMAILS = [
  "cody@southernautomate.com",
  "nyther1@gmail.com",
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/areas", label: "Areas" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/request-a-quote", label: "Request a Quote" },
] as const;

export function isTypeOfClean(value: string): value is TypeOfClean {
  return value === "Other" || SERVICES.some((service) => service.label === value);
}

export function isAllowedQuoteDate(isoDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  return (QUOTE_ALLOWED_WEEKDAYS as readonly number[]).includes(date.getDay());
}

export function isUsPhone(value: string) {
  return /^\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}$/.test(value.trim());
}
