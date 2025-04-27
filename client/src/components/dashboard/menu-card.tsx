import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Coffee, Utensils, Moon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface MenuCardProps {
  date?: Date;
}

export function MenuCard({ date = new Date() }: MenuCardProps) {
  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: menus, isLoading } = useQuery({
    queryKey: [`/api/menus?date=${formattedDate}`],
  });

  const getMealIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast':
        return <Coffee className="h-5 w-5 text-orange-500" />;
      case 'lunch':
        return <Utensils className="h-5 w-5 text-green-500" />;
      case 'dinner':
        return <Moon className="h-5 w-5 text-indigo-500" />;
      default:
        return <Utensils className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Today's Menu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 mb-4">
          {format(date, "EEEE, MMMM d, yyyy")}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : menus && menus.length > 0 ? (
          <div className="space-y-6">
            {menus.map((menu: any) => (
              <div key={menu.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  {getMealIcon(menu.type)}
                  <h3 className="font-medium capitalize">{menu.type}</h3>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <ul className="space-y-1">
                    {menu.items.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm">{item}</li>
                    ))}
                  </ul>
                  {menu.description && (
                    <p className="mt-2 text-sm text-gray-500">{menu.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No menu available for today</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
