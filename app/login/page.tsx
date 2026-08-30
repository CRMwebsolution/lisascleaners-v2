import type { Metadata } from "next";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Staff login`,
  description: "Staff login is not available on this public site.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-purple-dark sm:text-4xl">Staff login</h1>
      <p className="mt-4 text-lg">
        This page is a stub. Staff login is not available here yet.
      </p>
      <p className="mt-4">
        If you need me, call{" "}
        <a className="font-semibold text-purple-mid" href={`tel:${PHONE_TEL}`}>
          {PHONE_DISPLAY}
        </a>{" "}
        or email{" "}
        <a className="font-semibold text-purple-mid" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        .
      </p>
    </main>
  );
}
