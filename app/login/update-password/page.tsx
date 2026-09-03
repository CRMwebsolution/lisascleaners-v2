import type { Metadata } from "next";
import UpdatePasswordForm from "@/components/staff/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Set a new staff password",
  robots: { index: false, follow: false },
};

export default function UpdatePasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-purple-soft px-4">
      <UpdatePasswordForm />
    </main>
  );
}
