"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileStickyCta from "@/components/MobileStickyCta";

const STAFF_PREFIXES = ["/login", "/admin", "/dashboard"];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isStaff = STAFF_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isStaff) return <>{children}</>;

  return (
    <>
      <Header />
      <div className="pb-20 lg:pb-0">{children}</div>
      <Footer />
      <MobileStickyCta />
    </>
  );
}
