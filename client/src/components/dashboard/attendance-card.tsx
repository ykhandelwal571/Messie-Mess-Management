import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function AttendanceCard() {
  const { toast } = useToast();
  const [isPresent, setIsPresent] = useState<boolean | null>(null);

  // Fetch today's attendance for current user
  const { data: attendance, isLoading } = useQuery({
    queryKey: ["/api/attendance/today"],
  });

  // Set initial state based on fetched data
  useState(() => {
    if (attendance) {
      setIsPresent(attendance.status);
    }
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (status: boolean) => {
      const res = await apiRequest("POST", "/api/attendance", { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/me"] });
      toast({
        title: "Attendance marked",
        description: `You have been marked as ${isPresent ? "present" : "absent"} for today.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error marking attendance",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAttendance = (status: boolean) => {
    setIsPresent(status);
    markAttendanceMutation.mutate(status);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Daily Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 mb-4">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </div>

        <div className="flex flex-col space-y-4">
          <div className="text-center py-2 rounded-md bg-gray-50">
            {isLoading ? (
              <div className="animate-pulse h-6 w-32 bg-gray-200 rounded mx-auto"></div>
            ) : attendance ? (
              <div className="flex items-center justify-center gap-2">
                <span>
                  {attendance.status ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </span>
                <span>
                  You are marked as{" "}
                  <span className={attendance.status ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {attendance.status ? "present" : "absent"}
                  </span>{" "}
                  today
                </span>
              </div>
            ) : (
              <span className="text-amber-500">Attendance not marked yet</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={isPresent ? "default" : "outline"}
              className={isPresent ? "bg-green-500 hover:bg-green-600" : ""}
              onClick={() => handleAttendance(true)}
              disabled={markAttendanceMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Present
            </Button>
            <Button
              variant={isPresent === false ? "default" : "outline"}
              className={isPresent === false ? "bg-red-500 hover:bg-red-600" : ""}
              onClick={() => handleAttendance(false)}
              disabled={markAttendanceMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Absent
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
