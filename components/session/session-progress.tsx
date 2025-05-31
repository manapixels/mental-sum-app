"use client";

import { Progress } from "@/components/ui/progress";

interface SessionProgressProps {
  current: number;
  total: number;
  percentage: number;
}

export function SessionProgress({
  current,
  total,
  percentage,
}: SessionProgressProps) {
  return (
    <div className="text-center space-y-2 min-w-[120px]">
      <div className="text-sm font-medium text-muted-foreground">Progress</div>
      <div className="space-y-1">
        <div className="text-lg font-bold">
          {current} / {total}
        </div>
        <Progress value={percentage} className="w-full h-2" />
      </div>
    </div>
  );
}
