import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Utensils, BarChart, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FeedbackReview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  // Fetch feedback data
  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ["/api/feedback"],
  });

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Render stars for rating
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Filter feedback data
  const filteredFeedback = feedbackData
    ? feedbackData.filter((feedback: any) => {
        // Filter by search query
        const matchesSearch = searchQuery
          ? feedback.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            feedback.comment?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        
        // Filter by rating
        const matchesRating =
          ratingFilter === "all" ? true : Number(ratingFilter) === feedback.rating;
        
        return matchesSearch && matchesRating;
      })
    : [];

  // Calculate rating statistics
  const calculateStats = () => {
    if (!feedbackData || feedbackData.length === 0) {
      return {
        averageRating: 0,
        totalFeedback: 0,
        ratingDistribution: Array(5).fill(0),
        positivePercentage: 0,
        recentTrend: 0
      };
    }

    const totalFeedback = feedbackData.length;
    const totalRating = feedbackData.reduce((sum: number, item: any) => sum + item.rating, 0);
    const averageRating = Number((totalRating / totalFeedback).toFixed(1));
    
    // Calculate distribution of ratings
    const ratingDistribution = Array(5).fill(0);
    feedbackData.forEach((item: any) => {
      ratingDistribution[item.rating - 1]++;
    });
    
    // Calculate positive feedback percentage (ratings 4 and 5)
    const positiveRatings = feedbackData.filter((item: any) => item.rating >= 4).length;
    const positivePercentage = Math.round((positiveRatings / totalFeedback) * 100);
    
    // Calculate recent trend (compare last 5 vs previous 5)
    const sortedFeedback = [...feedbackData].sort(
      (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (sortedFeedback.length >= 10) {
      const recentFive = sortedFeedback.slice(0, 5);
      const previousFive = sortedFeedback.slice(5, 10);
      
      const recentAvg = recentFive.reduce((sum: number, item: any) => sum + item.rating, 0) / 5;
      const previousAvg = previousFive.reduce((sum: number, item: any) => sum + item.rating, 0) / 5;
      
      const trend = Number((recentAvg - previousAvg).toFixed(1));
      return {
        averageRating,
        totalFeedback,
        ratingDistribution,
        positivePercentage,
        recentTrend: trend
      };
    }
    
    return {
      averageRating,
      totalFeedback,
      ratingDistribution,
      positivePercentage,
      recentTrend: 0
    };
  };

  const stats = calculateStats();

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
              <h1 className="text-2xl font-bold tracking-tight">Feedback Review</h1>
              <p className="text-gray-500">
                Review and analyze customer feedback
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">{stats.averageRating}</span>
                    <span className="text-sm text-gray-500">/ 5</span>
                  </div>
                  <div className="mt-2 flex">
                    {renderRatingStars(Math.round(stats.averageRating))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Total Feedback</h3>
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">{stats.totalFeedback}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    From all customers
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Positive Feedback</h3>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">{stats.positivePercentage}%</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    4-5 star ratings
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Recent Trend</h3>
                    {stats.recentTrend > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : stats.recentTrend < 0 ? (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    ) : (
                      <BarChart className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex items-end gap-1">
                    <span className={`text-3xl font-bold ${
                      stats.recentTrend > 0 
                        ? "text-green-500" 
                        : stats.recentTrend < 0 
                        ? "text-red-500" 
                        : ""
                    }`}>
                      {stats.recentTrend > 0 ? "+" : ""}{stats.recentTrend}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Last 5 vs previous 5 ratings
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-lg">All Customer Feedback</CardTitle>
                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    placeholder="Search by name or comment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-60"
                  />
                  <Select
                    defaultValue="all"
                    onValueChange={(value) => setRatingFilter(value)}
                  >
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading feedback...</p>
                  </div>
                ) : filteredFeedback.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFeedback.map((feedback: any) => (
                      <div
                        key={feedback.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(feedback.user?.fullName || "User")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{feedback.user?.fullName || "Unknown"}</div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(feedback.date), "MMMM d, yyyy 'at' h:mm a")}
                              </div>
                            </div>
                          </div>
                          {feedback.menuId && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Utensils className="h-3 w-3" />
                              <span>Menu #{feedback.menuId}</span>
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1">{renderRatingStars(feedback.rating)}</div>
                        {feedback.comment && (
                          <p className="mt-3 text-gray-700">{feedback.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-gray-300 rounded-md">
                    <p className="text-gray-500">No feedback found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
