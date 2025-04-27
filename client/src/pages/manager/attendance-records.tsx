import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DownloadIcon, 
  CalendarIcon, 
  CheckCircle, 
  XCircle, 
  ChevronDown,
  Filter
} from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ColumnDef } from "@tanstack/react-table";

export default function AttendanceRecords() {
  const [date, setDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<"today" | "thisWeek" | "custom">("today");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // Set dates based on range selection
  const handleDateRangeChange = (range: "today" | "thisWeek" | "custom") => {
    setDateRange(range);
    
    if (range === "today") {
      setStartDate(new Date());
      setEndDate(new Date());
    } else if (range === "thisWeek") {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });
      setStartDate(start);
      setEndDate(end);
    }
    // For custom, the dates are set via the calendar popover
  };

  // Format dates for API query
  const formattedStartDate = format(startDate, "yyyy-MM-dd");
  const formattedEndDate = format(endDate, "yyyy-MM-dd");

  // Fetch attendance data based on date range
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: [
      `/api/attendance?startDate=${formattedStartDate}${
        dateRange !== "today" ? `&endDate=${formattedEndDate}` : ""
      }`,
    ],
  });

  // Define columns for the data table
  const columns: ColumnDef<any>[] = [
    {
      id: "customer",
      header: "Customer",
      accessorFn: (row) => row.user?.fullName || "Unknown",
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) return "Unknown";
        
        // Get initials from name
        const initials = user.fullName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase();
        
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.fullName}</div>
              <div className="text-xs text-gray-500">{user.username}</div>
            </div>
          </div>
        );
      },
    },
    {
      id: "date",
      header: "Date",
      accessorFn: (row) => new Date(row.date),
      cell: ({ row }) => {
        return format(new Date(row.original.date), "MMM d, yyyy");
      },
    },
    {
      id: "time",
      header: "Time",
      accessorFn: (row) => new Date(row.date),
      cell: ({ row }) => {
        return format(new Date(row.original.date), "h:mm a");
      },
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => row.status,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status ? "default" : "destructive"}>
            {status ? (
              <span className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Present
              </span>
            ) : (
              <span className="flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                Absent
              </span>
            )}
          </Badge>
        );
      },
    },
  ];

  // Filter data based on search query
  const filteredData = attendanceData
    ? attendanceData.filter((record: any) => {
        if (!searchQuery) return true;
        
        const searchLower = searchQuery.toLowerCase();
        const userName = record.user?.fullName?.toLowerCase() || "";
        const userUsername = record.user?.username?.toLowerCase() || "";
        
        return userName.includes(searchLower) || userUsername.includes(searchLower);
      })
    : [];

  // Generate CSV data for export
  const exportToCSV = () => {
    if (!attendanceData || attendanceData.length === 0) return;
    
    const headers = ["Name", "Username", "Date", "Time", "Status"];
    
    const csvRows = [
      headers.join(","),
      ...filteredData.map((record: any) => {
        const rowData = [
          `"${record.user?.fullName || "Unknown"}"`,
          `"${record.user?.username || "Unknown"}"`,
          `"${format(new Date(record.date), "MMM d, yyyy")}"`,
          `"${format(new Date(record.date), "h:mm a")}"`,
          `"${record.status ? "Present" : "Absent"}"`,
        ];
        
        return rowData.join(",");
      }),
    ];
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_${formattedStartDate}_${dateRange !== "today" ? formattedEndDate : ""}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <h1 className="text-2xl font-bold tracking-tight">Attendance Records</h1>
              <p className="text-gray-500">
                View and export customer attendance data
              </p>
            </div>

            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-lg">
                  {dateRange === "today"
                    ? `Attendance for ${format(startDate, "MMMM d, yyyy")}`
                    : dateRange === "thisWeek"
                    ? `Attendance from ${format(startDate, "MMM d")} to ${format(endDate, "MMM d, yyyy")}`
                    : `Attendance from ${format(startDate, "MMM d")} to ${format(endDate, "MMM d, yyyy")}`}
                </CardTitle>
                <div className="flex flex-col md:flex-row gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="mr-2">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {dateRange === "today"
                          ? "Today"
                          : dateRange === "thisWeek"
                          ? "This Week"
                          : "Custom Range"}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Select Date Range</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDateRangeChange("today")}>
                        Today
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDateRangeChange("thisWeek")}>
                        This Week
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDateRange("custom");
                        }}
                      >
                        Custom Range
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {dateRange === "custom" && (
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            {format(startDate, "MMM d, yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => date && setStartDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <span className="self-center">to</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            {format(endDate, "MMM d, yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => date && setEndDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="ml-auto"
                    onClick={exportToCSV}
                    disabled={!attendanceData || attendanceData.length === 0}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by name or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <Select
                        defaultValue="all"
                        onValueChange={(value) => {
                          if (value === "present") {
                            setSearchQuery("present");
                          } else if (value === "absent") {
                            setSearchQuery("absent");
                          } else {
                            setSearchQuery("");
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center py-10">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading attendance records...</p>
                    </div>
                  ) : filteredData && filteredData.length > 0 ? (
                    <DataTable columns={columns} data={filteredData} />
                  ) : (
                    <div className="text-center py-10 border border-dashed border-gray-300 rounded-md">
                      <p className="text-gray-500">No attendance records found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
