import type { Metadata } from "next";
import StaffDashboard from "@/components/staff/StaffDashboard";

export const metadata: Metadata = {
  title: "Staff dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <StaffDashboard />;
}
