import type { Metadata } from "next";
import ResetForm from "@/components/staff/ResetForm";

export const metadata: Metadata = {
  title: "Reset staff password",
  robots: { index: false, follow: false },
};

export default function ResetPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-purple-soft px-4">
      <ResetForm />
    </main>
  );
}
