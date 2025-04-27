import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AttendanceCard } from "@/components/dashboard/attendance-card";
import { MenuCard } from "@/components/dashboard/menu-card";
import { FeedbackCard } from "@/components/dashboard/feedback-card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function CustomerDashboard() {
  const { user } = useAuth();

  // Fetch mess info
  const { data: messInfo } = useQuery({
    queryKey: ["/api/mess-info"],
  });

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="container px-4 py-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.fullName}</h1>
              <p className="text-gray-500">
                Here's what's happening at the {messInfo?.name || "Campus Mess"} today
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AttendanceCard />
              <div className="md:col-span-1">
                <MenuCard />
              </div>
              <div className="md:col-span-1">
                <FeedbackCard />
              </div>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
