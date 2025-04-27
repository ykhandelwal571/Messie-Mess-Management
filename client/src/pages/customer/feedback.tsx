import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { FeedbackCard } from "@/components/dashboard/feedback-card";

export default function CustomerFeedback() {
  // Fetch user's feedback history
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ["/api/feedback/me"],
  });

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
              <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
              <p className="text-gray-500">
                Rate your experience and share your thoughts
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <FeedbackCard />
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Feedback History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-pulse space-y-3">
                          <div className="h-20 bg-gray-200 rounded"></div>
                          <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ) : feedbacks && feedbacks.length > 0 ? (
                      <div className="space-y-4">
                        {feedbacks.map((feedback: any) => (
                          <div
                            key={feedback.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="text-sm text-gray-500">
                                  {format(new Date(feedback.date), "MMMM d, yyyy 'at' h:mm a")}
                                </div>
                                {renderRatingStars(feedback.rating)}
                              </div>
                            </div>
                            {feedback.comment && (
                              <p className="text-gray-700 mt-2">{feedback.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">You haven't submitted any feedback yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
