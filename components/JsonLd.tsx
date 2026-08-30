import {
  ADDRESS_LOCALITY,
  ADDRESS_POSTAL_CODE,
  ADDRESS_REGION,
  BUSINESS_NAME,
  EMAIL,
  PHONE_TEL,
  SERVICES,
  SITE_URL,
  TOWNS,
} from "@/lib/site";

export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BUSINESS_NAME,
    url: SITE_URL,
    telephone: PHONE_TEL,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      addressLocality: ADDRESS_LOCALITY,
      addressRegion: ADDRESS_REGION,
      postalCode: ADDRESS_POSTAL_CODE,
      addressCountry: "US",
    },
    areaServed: TOWNS.map((town) => ({
      "@type": "City",
      name: town,
      containedInPlace: {
        "@type": "State",
        name: "North Carolina",
      },
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "09:00",
        closes: "16:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cleaning services",
      itemListElement: SERVICES.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.label,
          description: service.summary,
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
