"use client";

import { Session } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Home, RotateCcw, TrendingUp, Star } from "lucide-react";

interface SessionResultsProps {
  session: Session;
  onBackToHome: () => void;
  onNewSession: () => void;
}

export function SessionResults({
  session,
  onBackToHome,
  onNewSession,
}: SessionResultsProps) {
  const completedProblems = session.problems.filter((p) => p.completedAt);
  const correctAnswers = session.totalCorrect;
  const accuracyRate =
    completedProblems.length > 0
      ? Math.round((correctAnswers / completedProblems.length) * 100)
      : 0;
  const averageTime = Math.round(session.averageTime * 10) / 10;

  // Standardized performance thresholds
  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceStars = (accuracy: number) => {
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    return 1;
  };

  const getPerformanceBadge = (accuracy: number) => {
    const stars = getPerformanceStars(accuracy);

    if (stars === 3) {
      return { text: "Excellent!", variant: "default" as const, stars: 3 };
    }
    if (stars === 2) {
      return { text: "Good", variant: "secondary" as const, stars: 2 };
    }
    return { text: "Keep Practicing", variant: "outline" as const, stars: 1 };
  };

  const performanceBadge = getPerformanceBadge(accuracyRate);

  // Component to render stars
  const StarRating = ({
    stars,
    className = "",
    size = "sm",
  }: {
    stars: number;
    className?: string;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    };

    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {[1, 2, 3].map((starNum) => (
          <Star
            key={starNum}
            className={`${sizeClasses[size]} ${
              starNum <= stars
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center py-6">
          <div className="flex flex-col items-center gap-2">
            <Badge variant={performanceBadge.variant} className="px-4 py-2">
              <StarRating stars={performanceBadge.stars} size="lg" />
            </Badge>
            <span className="text-2xl font-medium">
              {performanceBadge.text}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-blue-500" />
            <div
              className={`text-lg sm:text-2xl font-bold ${getPerformanceColor(accuracyRate)}`}
            >
              {accuracyRate}%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Accuracy
            </div>
            <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
              {correctAnswers}/{completedProblems.length} correct
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-green-500" />
            <div className="text-lg sm:text-2xl font-bold">{averageTime}s</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Avg Time
            </div>
            <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
              per problem
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-lg sm:text-2xl font-bold">
              {completedProblems.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Problems
            </div>
            <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
              completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operation Breakdown */}
      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-lg">Performance by Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["addition", "subtraction", "multiplication", "division"].map(
              (operation) => {
                const opProblems = completedProblems.filter(
                  (p) => p.type === operation,
                );
                const opCorrect = opProblems.filter((p) => p.isCorrect).length;
                const opAccuracy =
                  opProblems.length > 0
                    ? Math.round((opCorrect / opProblems.length) * 100)
                    : 0;

                if (opProblems.length === 0) return null;

                return (
                  <div
                    key={operation}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium capitalize">
                        {operation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating
                        stars={getPerformanceStars(opAccuracy)}
                        size="sm"
                      />
                      <span
                        className={`text-lg font-medium ${getPerformanceColor(opAccuracy)}`}
                      >
                        {opAccuracy}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {opCorrect}/{opProblems.length}
                      </span>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-row gap-3">
        <Button
          variant="outline"
          onClick={onBackToHome}
          size="lg"
          className="h-12 sm:h-auto px-6 sm:px-8 text-base"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <Button
          onClick={onNewSession}
          size="lg"
          className="flex-1 h-12 sm:h-auto px-6 sm:px-8 text-base bg-gray-800"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>
    </div>
  );
}
