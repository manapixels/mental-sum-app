import React from "react";
import { StrategyId, StrategyMetrics } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HelpCircle } from "lucide-react";

interface StrategyProgressCardProps {
  strategyId: StrategyId;
  metrics: StrategyMetrics;
  strategyDisplayName: string;
  operationName: string;
  onPractice: (strategyId: StrategyId) => void;
  onLearnMore: (strategyId: StrategyId) => void;
}

export function StrategyProgressCard({
  strategyId,
  metrics,
  strategyDisplayName,
  operationName,
  onPractice,
  onLearnMore,
}: StrategyProgressCardProps) {
  const accuracy =
    metrics.totalAttempts > 0
      ? (metrics.correct / metrics.totalAttempts) * 100
      : 0;
  const accuracyText =
    metrics.totalAttempts > 0 ? `${accuracy.toFixed(0)}%` : "N/A";

  return (
    <Card className="py-4 gap-2">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex flex-row gap-2">
            <div>
              <CardTitle className="text-lg leading-tight">
                {strategyDisplayName}
              </CardTitle>
              <CardDescription>{operationName} Strategy</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLearnMore(strategyId)}
              className="rounded-full w-8 h-8 flex-shrink-0"
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <Button
            onClick={() => onPractice(strategyId)}
            variant="outline"
            size="sm"
          >
            Practice
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground mr-1">
              Accuracy:
            </span>
            <span
              className={`text-sm font-semibold ${metrics.totalAttempts === 0 ? "text-muted-foreground" : accuracy >= 75 ? "text-green-600 dark:text-green-400" : accuracy >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}
            >
              {accuracyText}
            </span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground mr-1">
              Attempts:
            </span>
            <span className="text-sm font-semibold">
              {metrics.totalAttempts}
            </span>
          </div>
        </div>
        {metrics.totalAttempts > 0 ? (
          <Progress value={accuracy} className="h-2" />
        ) : (
          <div className="h-2 bg-muted rounded-full" /> // Placeholder for progress bar if no attempts
        )}
      </CardContent>
    </Card>
  );
}
