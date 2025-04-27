import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  change?: {
    value: string | number;
    positive: boolean;
  };
  progress?: {
    value: number;
    total: number;
    color?: string;
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  change,
  progress,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-500">{title}</h3>
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBgColor)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
        
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold font-heading text-gray-900">{value}</span>
          {change && (
            <span className={cn("flex items-center", change.positive ? "text-green-500" : "text-red-500")}>
              <span className="text-xs mr-1">{change.positive ? "↑" : "↓"}</span>
              <span className="text-sm">{change.value}</span>
            </span>
          )}
        </div>
        
        {progress && (
          <>
            <div className="mt-4 bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full", progress.color || "bg-primary")}
                style={{ width: `${(progress.value / progress.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{description || `${progress.value} of ${progress.total}`}</p>
          </>
        )}
        
        {!progress && description && (
          <p className="text-xs text-gray-500 mt-4">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
