import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  ChefHat,
  Home,
  MessageSquare,
  Utensils,
} from "lucide-react";

export function MobileNav() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const isCustomer = user.role === "customer";

  const customerNav = [
    {
      title: "Home",
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
      title: "Home",
      icon: <Home className="h-5 w-5" />,
      href: "/manager/dashboard",
    },
    {
      title: "Menu",
      icon: <ChefHat className="h-5 w-5" />,
      href: "/manager/menu-management",
    },
    {
      title: "Attendance",
      icon: <CalendarCheck className="h-5 w-5" />,
      href: "/manager/attendance-records",
    },
    {
      title: "Feedback",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/manager/feedback-review",
    },
  ];

  const navigation = isCustomer ? customerNav : managerNav;

  return (
    <div className="md:hidden bg-white shadow-md border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "py-3 flex flex-col items-center",
              location === item.href
                ? "text-primary"
                : "text-gray-500"
            )}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
