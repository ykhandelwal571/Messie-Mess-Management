import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  ChefHat,
  Home,
  MessageSquare,
  Users,
  Utensils,
  FileText,
} from "lucide-react";

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;
  
  const isCustomer = user.role === "customer";

  const customerNav = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/customer/dashboard",
    },
    {
      title: "Menu",
      icon: <Utensils className="h-5 w-5" />,
      href: "/customer/menu",
    },
    {
      title: "Feedback",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/customer/feedback",
    },
  ];

  const managerNav = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/manager/dashboard",
    },
    {
      title: "Menu Management",
      icon: <ChefHat className="h-5 w-5" />,
      href: "/manager/menu-management",
    },
    {
      title: "Attendance Records",
      icon: <CalendarCheck className="h-5 w-5" />,
      href: "/manager/attendance-records",
    },
    {
      title: "Feedback Review",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/manager/feedback-review",
    },
  ];

  const navigation = isCustomer ? customerNav : managerNav;

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200 w-64">
      <div className="p-4">
        <div className="text-sm font-medium text-gray-500 mb-2">
          {isCustomer ? "CUSTOMER" : "MANAGER"} PORTAL
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === item.href
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="px-3 py-2 text-sm font-medium text-gray-700">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Logged in as</span>
            <span className="font-semibold">{user.fullName}</span>
            <span className="text-xs text-gray-500 capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
