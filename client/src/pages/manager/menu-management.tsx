import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, startOfWeek } from "date-fns";
import { Coffee, Utensils, Moon, Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Form schema for menu
const menuSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.string().min(1, "Meal type is required"),
  items: z.string().min(1, "Menu items are required"),
  description: z.string().optional(),
});

type MenuFormValues = z.infer<typeof menuSchema>;

export default function MenuManagement() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentMenuId, setCurrentMenuId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
  const { data: weeklyMenus = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/menus?startDate=${startDate}&endDate=${endDate}`],
  });

  // Form for creating/editing menu
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      date: format(today, "yyyy-MM-dd"),
      type: "breakfast",
      items: "",
      description: "",
    },
  });

  // Create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert items string to array and ensure date is a proper Date object
      // The server expects items to be a valid JSON array
      const itemsArray = data.items.split('\n').filter((item: string) => item.trim() !== "");
      
      const formattedData = {
        date: new Date(data.date),
        type: data.type,
        items: itemsArray,
        description: data.description || null,
      };
      
      console.log("Sending menu data:", formattedData);
      const res = await apiRequest("POST", "/api/menus", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu created",
        description: "The menu has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/menus?startDate=${startDate}&endDate=${endDate}`] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating menu",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      // Convert items string to array and ensure date is a proper Date object
      const itemsArray = data.items.split('\n').filter((item: string) => item.trim() !== "");
      
      const formattedData = {
        date: new Date(data.date),
        type: data.type,
        items: itemsArray,
        description: data.description || null,
      };
      
      console.log("Updating menu data:", formattedData);
      const res = await apiRequest("PUT", `/api/menus/${id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu updated",
        description: "The menu has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/menus?startDate=${startDate}&endDate=${endDate}`] });
      setIsDialogOpen(false);
      form.reset();
      setIsEditing(false);
      setCurrentMenuId(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating menu",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/menus/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Menu deleted",
        description: "The menu has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/menus?startDate=${startDate}&endDate=${endDate}`] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting menu",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get icon for meal type
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
    return weeklyMenus.filter((menu: any) => 
      format(new Date(menu.date), "yyyy-MM-dd") === date
    );
  };

  // Handle form submission
  const onSubmit = (data: MenuFormValues) => {
    if (isEditing && currentMenuId) {
      updateMenuMutation.mutate({ id: currentMenuId, data });
    } else {
      createMenuMutation.mutate(data);
    }
  };

  // Edit menu handler
  const handleEdit = (menu: any) => {
    setIsEditing(true);
    setCurrentMenuId(menu.id);
    
    form.reset({
      date: format(new Date(menu.date), "yyyy-MM-dd"),
      type: menu.type,
      items: menu.items.join('\n'),
      description: menu.description || "",
    });
    
    setIsDialogOpen(true);
  };

  // Delete menu handler
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this menu?")) {
      deleteMenuMutation.mutate(id);
    }
  };

  // Add new menu handler
  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentMenuId(null);
    form.reset({
      date: format(today, "yyyy-MM-dd"),
      type: "breakfast",
      items: "",
      description: "",
    });
    setIsDialogOpen(true);
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Menu Management</h1>
                <p className="text-gray-500">
                  Create and manage daily menus for the mess
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Menu
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>
                      {isEditing ? "Edit Menu" : "Create New Menu"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meal Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select meal type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="breakfast">Breakfast</SelectItem>
                                  <SelectItem value="lunch">Lunch</SelectItem>
                                  <SelectItem value="dinner">Dinner</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="items"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Menu Items (one per line)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter menu items, one per line"
                                className="h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any additional notes about the menu"
                                className="h-20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" type="button">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button 
                          type="submit" 
                          disabled={createMenuMutation.isPending || updateMenuMutation.isPending}
                        >
                          {isEditing ? "Update Menu" : "Create Menu"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
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
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">
                        {day.isToday ? "Today's Menu" : `Menu for ${day.dayName}`}
                      </CardTitle>
                      <Button onClick={() => {
                        form.reset({
                          date: day.formattedDate,
                          type: "breakfast",
                          items: "",
                          description: "",
                        });
                        setIsEditing(false);
                        setCurrentMenuId(null);
                        setIsDialogOpen(true);
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add for {day.dayShort}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="text-center py-6">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                          <p className="mt-2 text-gray-500">Loading menus...</p>
                        </div>
                      ) : (
                        <>
                          {getMenusForDay(day.formattedDate).length > 0 ? (
                            <div className="space-y-6">
                              {getMenusForDay(day.formattedDate).map((menu: any) => (
                                <div key={menu.id} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {getMealIcon(menu.type)}
                                      <h3 className="font-medium capitalize">{menu.type}</h3>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleEdit(menu)}
                                      >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDelete(menu.id)}
                                        disabled={deleteMenuMutation.isPending}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
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
                            <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
                              <p className="text-gray-500">No menu created for this day</p>
                              <Button 
                                variant="outline" 
                                className="mt-4"
                                onClick={() => {
                                  form.reset({
                                    date: day.formattedDate,
                                    type: "breakfast",
                                    items: "",
                                    description: "",
                                  });
                                  setIsEditing(false);
                                  setCurrentMenuId(null);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Menu
                              </Button>
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
