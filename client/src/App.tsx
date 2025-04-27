import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";

// Customer pages
import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerMenu from "@/pages/customer/menu";
import CustomerFeedback from "@/pages/customer/feedback";

// Manager pages
import ManagerDashboard from "@/pages/manager/dashboard";
import MenuManagement from "@/pages/manager/menu-management";
import AttendanceRecords from "@/pages/manager/attendance-records";
import FeedbackReview from "@/pages/manager/feedback-review";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />

      {/* Customer routes */}
      <ProtectedRoute path="/customer/dashboard" component={CustomerDashboard} role="customer" />
      <ProtectedRoute path="/customer/menu" component={CustomerMenu} role="customer" />
      <ProtectedRoute path="/customer/feedback" component={CustomerFeedback} role="customer" />

      {/* Manager routes */}
      <ProtectedRoute path="/manager/dashboard" component={ManagerDashboard} role="manager" />
      <ProtectedRoute path="/manager/menu-management" component={MenuManagement} role="manager" />
      <ProtectedRoute path="/manager/attendance-records" component={AttendanceRecords} role="manager" />
      <ProtectedRoute path="/manager/feedback-review" component={FeedbackReview} role="manager" />

      {/* Default route - redirect based on role */}
      <ProtectedRoute path="/" component={() => {
        const userRole = localStorage.getItem("userRole");
        if (userRole === "manager") {
          window.location.href = "/manager/dashboard";
        } else {
          window.location.href = "/customer/dashboard";
        }
        return null;
      }} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
