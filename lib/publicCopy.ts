export const HERO_WORDS = ["home", "office", "rental"] as const;
export const HERO_LEDE = "Trusted local cleaning across Newport and nearby coastal towns.";
export const HERO_IMAGE =
  "https://fhyzsisluszpfhlngiyb.supabase.co/storage/v1/object/public/other_sites/lisascleners/4347.jpg";
export const HERO_IMAGE_ALT = "A sparkling clean home interior after a visit from Lisa";

export const TRUST_MARKERS = [
  "Locally owned",
  "Homes, offices, and vacation rentals",
  "Serving Newport and the Crystal Coast",
] as const;

export const LOCAL_LINE = "Based in Newport, proudly serving the Crystal Coast.";

export const QUOTE_REASSURANCE = "No obligation. Lisa will follow up with a custom quote.";

export const SERVICE_BENEFITS: Record<string, string> = {
  residential: "Reliable resets for your home between busy weeks.",
  office: "A tidy workspace that is ready for the next workday.",
  "deep-clean": "Extra care when a space needs more than a regular pass.",
  "move-in-out": "A thorough clean for move-in and move-out days.",
  recurring: "A regular schedule we set together.",
  "window-and-floor": "Clear glass and cared-for floors.",
  "vacation-rental": "Reliable turnovers so guests walk into a ready home.",
};

export const WHY_LISA = [
  { title: "Personalized quotes", body: "Tell Lisa what you need. She follows up herself. This site does not take payments or hold a calendar spot." },
  { title: "Dependable scheduling", body: "Hours are Monday-Friday 8-6 and Saturday-Sunday 9-4. Recurring visits can be weekly, bi-weekly, or monthly." },
  { title: "Detail-oriented work", body: "Homes, offices, deep cleans, move days, windows, floors, and vacation-rental turnovers." },
  { title: "Local Crystal Coast service", body: "Lisa is based in Newport and works the nearby coastal towns, including Emerald Isle and Atlantic Beach." },
] as const;

export const OG_FEATURES = [
  "Locally owned and operated",
  "Beach home specialists",
  "Flexible scheduling",
  "Licensed and insured",
] as const;

export const GALLERY_PHOTOS = [
  {
    url: "https://fhyzsisluszpfhlngiyb.supabase.co/storage/v1/object/public/other_sites/lisascleners/4345.jpg",
    alt: "Finished cleaning job, professional care in a coastal home",
  },
  {
    url: "https://fhyzsisluszpfhlngiyb.supabase.co/storage/v1/object/public/other_sites/lisascleners/4347.jpg",
    alt: "Sparkling clean home interior after a visit",
  },
  {
    url: "https://fhyzsisluszpfhlngiyb.supabase.co/storage/v1/object/public/other_sites/lisascleners/4375.jpg",
    alt: "Bathtub cleaned of orange staining",
  },
  {
    url: "https://fhyzsisluszpfhlngiyb.supabase.co/storage/v1/object/public/other_sites/lisascleners/4376.jpg",
    alt: "Shower and bath area after a detailed clean",
  },
] as const;
