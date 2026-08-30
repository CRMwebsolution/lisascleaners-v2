import type { Metadata } from "next";
import { Geist } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import SiteChrome from "@/components/SiteChrome";
import { BUSINESS_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `House, Office & Vacation Rental Cleaning in Newport, NC | ${BUSINESS_NAME}`,
    template: `%s | ${BUSINESS_NAME}`,
  },
  description:
    "Cleaning for homes, offices, and vacation rentals in Newport and nearby coastal towns. Request a quote from Lisa McNamara Cleaning Service.",
  openGraph: {
    title: `Cleaning in Newport and nearby coastal towns | ${BUSINESS_NAME}`,
    description:
      "Cleaning for homes, offices, and vacation rentals in Newport, Emerald Isle, Atlantic Beach, Morehead City, and nearby towns.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} min-h-screen antialiased`}>
        <JsonLd />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
