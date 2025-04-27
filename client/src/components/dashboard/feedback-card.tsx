import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function FeedbackCard() {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const feedbackMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      const res = await apiRequest("POST", "/api/feedback", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      // Reset form
      setRating(0);
      setComment("");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/me"] });
    },
    onError: (error) => {
      toast({
        title: "Error submitting feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }
    feedbackMutation.mutate({ rating, comment });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Share Your Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8",
                        (hoveredRating || rating) >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {rating > 0 ? (
                  <span>You rated: {rating} {rating === 1 ? "star" : "stars"}</span>
                ) : (
                  "Rate your experience"
                )}
              </p>
            </div>

            <Textarea
              placeholder="Share your thoughts about the food or service..."
              className="min-h-[100px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={feedbackMutation.isPending}
            >
              {feedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
