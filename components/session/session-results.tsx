"use client";

import { Session } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Clock,
  Target,
  Home,
  RotateCcw,
  TrendingUp,
} from "lucide-react";

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

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (accuracy: number) => {
    if (accuracy >= 95)
      return { text: "Excellent!", variant: "default" as const };
    if (accuracy >= 85)
      return { text: "Great!", variant: "secondary" as const };
    if (accuracy >= 70) return { text: "Good", variant: "secondary" as const };
    return { text: "Keep Practicing", variant: "outline" as const };
  };

  const performanceBadge = getPerformanceBadge(accuracyRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4">
            <Trophy className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl mb-2">
            Session Complete!
          </CardTitle>
          <Badge
            variant={performanceBadge.variant}
            className="text-lg px-4 py-1"
          >
            {performanceBadge.text}
          </Badge>
        </CardHeader>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div
              className={`text-2xl font-bold ${getPerformanceColor(accuracyRate)}`}
            >
              {accuracyRate}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
            <div className="text-xs text-muted-foreground mt-1">
              {correctAnswers}/{completedProblems.length} correct
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{averageTime}s</div>
            <div className="text-sm text-muted-foreground">Avg Time</div>
            <div className="text-xs text-muted-foreground mt-1">
              per problem
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{completedProblems.length}</div>
            <div className="text-sm text-muted-foreground">Problems</div>
            <div className="text-xs text-muted-foreground mt-1">completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Operation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance by Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["addition", "subtraction", "multiplication", "division"].map(
              (operation) => {
                const opProblems = completedProblems.filter(
                  (p) => p.operation === operation,
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
                      <span className="text-sm font-medium capitalize">
                        {operation}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({opProblems.length} problems)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${getPerformanceColor(opAccuracy)}`}
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

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Started:</span>
              <div className="font-medium">
                {session.startTime.toLocaleTimeString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Completed:</span>
              <div className="font-medium">
                {session.endTime?.toLocaleTimeString() || "In progress"}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Time:</span>
              <div className="font-medium">
                {session.endTime
                  ? Math.round(
                      (session.endTime.getTime() -
                        session.startTime.getTime()) /
                        1000 /
                        60,
                    ) + "m"
                  : "N/A"}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Problems/min:</span>
              <div className="font-medium">
                {session.endTime
                  ? Math.round(
                      (completedProblems.length /
                        ((session.endTime.getTime() -
                          session.startTime.getTime()) /
                          1000 /
                          60)) *
                        10,
                    ) / 10
                  : "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onNewSession} size="lg" className="flex-1 h-12">
          <RotateCcw className="mr-2 h-4 w-4" />
          New Session
        </Button>
        <Button
          variant="outline"
          onClick={onBackToHome}
          size="lg"
          className="flex-1 h-12"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
