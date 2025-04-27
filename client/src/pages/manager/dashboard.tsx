import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Users, CalendarCheck, MessageSquare, Utensils } from "lucide-react";
import { Star } from "lucide-react"; // Added this import for the Star component
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const today = new Date();
  const yesterday = subDays(today, 1);

  // Fetch customers
  const { data: customers } = useQuery({
    queryKey: ["/api/users?role=customer"],
  });

  // Fetch today's attendance
  const { data: todayAttendance } = useQuery({
    queryKey: [`/api/attendance?startDate=${format(today, "yyyy-MM-dd")}`],
  });

  // Fetch yesterday's attendance for comparison
  const { data: yesterdayAttendance } = useQuery({
    queryKey: [`/api/attendance?startDate=${format(yesterday, "yyyy-MM-dd")}`],
  });

  // Fetch recent feedback
  const { data: feedback } = useQuery({
    queryKey: ["/api/feedback"],
  });

  // Get initials from user's full name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Calculate stats
  const calculateStats = () => {
    const totalCustomers = customers?.length || 0;
    const presentToday = todayAttendance?.filter((a: any) => a.status).length || 0;
    const presentYesterday = yesterdayAttendance?.filter((a: any) => a.status).length || 0;
    const attendanceChangeValue = presentToday - presentYesterday;
    const attendanceRate = totalCustomers ? Math.round((presentToday / totalCustomers) * 100) : 0;
    
    const totalFeedback = feedback?.length || 0;
    const averageRating = totalFeedback 
      ? Number((feedback.reduce((sum: number, item: any) => sum + item.rating, 0) / totalFeedback).toFixed(1))
      : 0;
    
    return {
      totalCustomers,
      presentToday,
      attendanceChangeValue,
      attendanceRate,
      totalFeedback,
      averageRating
    };
  };

  const stats = calculateStats();

  // Get most recent feedback (last 5)
  const recentFeedback = feedback 
    ? [...feedback]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    : [];

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
              <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>
              <p className="text-gray-500">
                Overview of mess operations and statistics
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <StatsCard
                title="Total Customers"
                value={stats.totalCustomers}
                icon={Users}
                iconColor="text-blue-500"
                iconBgColor="bg-blue-100"
              />
              <StatsCard
                title="Today's Attendance"
                value={stats.presentToday}
                icon={CalendarCheck}
                iconColor="text-green-500"
                iconBgColor="bg-green-100"
                change={{
                  value: Math.abs(stats.attendanceChangeValue),
                  positive: stats.attendanceChangeValue >= 0
                }}
                progress={{
                  value: stats.presentToday,
                  total: stats.totalCustomers,
                  color: "bg-green-500"
                }}
              />
              <StatsCard
                title="Average Rating"
                value={stats.averageRating}
                description={`From ${stats.totalFeedback} feedbacks`}
                icon={MessageSquare}
                iconColor="text-yellow-500"
                iconBgColor="bg-yellow-100"
              />
              <StatsCard
                title="Attendance Rate"
                value={`${stats.attendanceRate}%`}
                icon={Users}
                iconColor="text-indigo-500"
                iconBgColor="bg-indigo-100"
                progress={{
                  value: stats.attendanceRate,
                  total: 100,
                  color: "bg-indigo-500"
                }}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todayAttendance && todayAttendance.length > 0 ? (
                          todayAttendance.slice(0, 5).map((attendance: any) => (
                            <TableRow key={attendance.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {getInitials(attendance.user?.fullName || "User")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{attendance.user?.fullName || "Unknown"}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={attendance.status ? "default" : "destructive"}>
                                  {attendance.status ? "Present" : "Absent"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-500">
                                {format(new Date(attendance.date), "h:mm a")}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                              No attendance records for today
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentFeedback.length > 0 ? (
                      recentFeedback.map((item: any) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(item.user?.fullName || "User")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{item.user?.fullName || "Unknown"}</div>
                                <div className="text-xs text-gray-500">
                                  {format(new Date(item.date), "MMM d, yyyy")}
                                </div>
                              </div>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {item.comment && (
                            <p className="text-sm text-gray-700">{item.comment}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No feedback available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}