import type { Metadata } from "next";
import { EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy`,
  description:
    "How Lisa McNamara Cleaning Service uses quote form information. No payment data is collected.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-purple-dark sm:text-4xl">Privacy</h1>
      <p className="mt-4 text-lg">
        When you submit the Request a Quote form, that information goes to me, Lisa McNamara.
        I store it so I can follow up with you.
      </p>
      <p className="mt-4">
        I do not collect payment data on this site. There is no public calendar hold and no
        online payment.
      </p>
      <p className="mt-4">
        The form asks for your name, phone, email, job address, type of clean, an optional
        preferred date, optional notes, and your consent to store the request.
      </p>
      <p className="mt-4">
        If you want me to delete your information, email{" "}
        <a className="font-semibold text-purple-mid" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        .
      </p>
    </main>
  );
}
