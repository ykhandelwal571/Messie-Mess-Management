import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfWeek } from "date-fns";
import { Coffee, Utensils, Moon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerMenu() {
  // Get dates for the week
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfCurrentWeek, i);
    return {
      date,
      formattedDate: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEEE"),
      dayShort: format(date, "EEE"),
      isToday: format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"),
    };
  });

  // Fetch weekly menu
  const startDate = format(weekDays[0].date, "yyyy-MM-dd");
  const endDate = format(weekDays[6].date, "yyyy-MM-dd");
  const { data: weeklyMenus, isLoading } = useQuery({
    queryKey: [`/api/menus?startDate=${startDate}&endDate=${endDate}`],
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

  // Get menus for a specific day
  const getMenusForDay = (date: string) => {
    if (!weeklyMenus) return [];
    return weeklyMenus.filter((menu: any) => 
      format(new Date(menu.date), "yyyy-MM-dd") === date
    );
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
              <h1 className="text-2xl font-bold tracking-tight">Weekly Menu</h1>
              <p className="text-gray-500">
                View the mess menu for the entire week
              </p>
            </div>

            <Tabs defaultValue={format(today, "yyyy-MM-dd")}>
              <TabsList className="w-full mb-6 overflow-x-auto flex justify-start p-0 border border-gray-200 rounded-lg">
                {weekDays.map((day) => (
                  <TabsTrigger
                    key={day.formattedDate}
                    value={day.formattedDate}
                    className={`flex-1 py-3 flex flex-col ${day.isToday ? 'font-semibold' : ''}`}
                  >
                    <span className="text-xs uppercase">{day.dayShort}</span>
                    <span className="text-sm">{format(day.date, "d")}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {weekDays.map((day) => (
                <TabsContent key={day.formattedDate} value={day.formattedDate}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {day.isToday ? "Today's Menu" : `Menu for ${day.dayName}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-6">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2">
                              <Skeleton className="h-6 w-32" />
                              <Skeleton className="h-20 w-full" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {getMenusForDay(day.formattedDate).length > 0 ? (
                            <div className="space-y-6">
                              {getMenusForDay(day.formattedDate).map((menu: any) => (
                                <div key={menu.id} className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    {getMealIcon(menu.type)}
                                    <h3 className="font-medium capitalize">{menu.type}</h3>
                                  </div>
                                  <div className="bg-gray-50 p-4 rounded-md">
                                    <ul className="space-y-2">
                                      {menu.items.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                    {menu.description && (
                                      <p className="mt-3 text-sm text-gray-500 border-t border-gray-200 pt-3">
                                        {menu.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-500">No menu available for this day</p>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
