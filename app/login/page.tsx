import type { Metadata } from "next";
import LoginForm from "@/components/staff/LoginForm";

export const metadata: Metadata = {
  title: "Staff login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-purple-soft px-4">
      <LoginForm />
    </main>
  );
}
