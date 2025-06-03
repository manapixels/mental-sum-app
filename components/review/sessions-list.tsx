"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/contexts/user-context";
import { Session } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Eye,
  ListChecks,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface SessionsListProps {
  title?: string;
  description?: string;
  showEmptyState?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateButtonText?: string;
  emptyStateButtonAction?: () => void;
}

export function SessionsList({
  title = "Review Past Sessions",
  description = "Look back at your performance and identify areas for improvement.",
  showEmptyState = true,
  emptyStateTitle = "No Sessions Yet",
  emptyStateDescription = "You haven't completed any practice sessions. Start a new session to see your progress here.",
  emptyStateButtonText = "Start New Session",
  emptyStateButtonAction,
}: SessionsListProps) {
  const router = useRouter();
  const { currentUser, getSessionsForCurrentUser, isLoading } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (currentUser && getSessionsForCurrentUser) {
      const userSessions = getSessionsForCurrentUser();
      // Sort sessions by most recent first
      userSessions.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );
      setSessions(userSessions);
    }
  }, [currentUser, getSessionsForCurrentUser]);

  const handleEmptyStateAction = () => {
    if (emptyStateButtonAction) {
      emptyStateButtonAction();
    } else {
      router.push("/session");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading sessions...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-muted-foreground">No user selected</p>
      </div>
    );
  }

  if (sessions.length === 0 && showEmptyState) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        <div className="container mx-auto p-4 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                <ListChecks className="h-10 w-10 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-2xl mb-2">{emptyStateTitle}</CardTitle>
              <CardDescription className="mb-4">
                {emptyStateDescription}
              </CardDescription>
              <Button onClick={handleEmptyStateAction}>
                {emptyStateButtonText}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const requiresReview = (session: Session): boolean => {
    return session.totalWrong > 0;
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <div className="space-y-6">
        {sessions.map((session) => {
          const isReviewNeeded = requiresReview(session);
          const accuracy =
            session.problems.length > 0
              ? (session.totalCorrect / session.problems.length) * 100
              : 0;

          return (
            <Card
              key={session.id}
              className={`gap-2 overflow-hidden ${isReviewNeeded ? "border-red-500/50 dark:border-red-700/60" : ""}`}
            >
              <CardHeader
                className={`p-4 sm:p-6 ${isReviewNeeded ? "bg-red-500/5 dark:bg-red-900/10" : "bg-muted/20"}`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                  <div>
                    <CardTitle
                      className={`text-lg sm:text-xl ${isReviewNeeded ? "text-red-700 dark:text-red-400" : ""}`}
                    >
                      Session from{" "}
                      {new Date(session.startTime).toLocaleDateString()}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {new Date(session.startTime).toLocaleTimeString()} -{" "}
                      {session.problems.length} problems
                    </CardDescription>
                  </div>
                  {isReviewNeeded && (
                    <Badge variant="destructive" className="flex-shrink-0">
                      <AlertTriangle className="h-4 w-4 mr-1.5" />
                      Review Recommended
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 py-0 sm:p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {session.totalCorrect === session.problems.length &&
                  session.problems.length > 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <ListChecks className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-medium">{accuracy.toFixed(0)}%</span>{" "}
                    Accuracy
                    <p className="text-xs text-muted-foreground">
                      ({session.totalCorrect}/{session.problems.length} correct)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle
                    className={`h-5 w-5 flex-shrink-0 ${session.totalWrong > 0 ? "text-red-500" : "text-muted-foreground"}`}
                  />
                  <div>
                    <span className="font-medium">{session.totalWrong}</span>{" "}
                    Incorrect
                    <p className="text-xs text-muted-foreground">
                      out of {session.problems.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Eye className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    Avg. Time:{" "}
                    <span className="font-medium">
                      {(session.averageTime / 1000).toFixed(2)}s
                    </span>
                    <p className="text-xs text-muted-foreground">per problem</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 sm:p-6 bg-muted/20 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                <Button
                  variant={isReviewNeeded ? "destructive" : "default"}
                  onClick={() => router.push(`/session/${session.id}/results`)}
                  className="w-full sm:w-auto"
                >
                  <ListChecks className="mr-2 h-4 w-4" />
                  Review Session
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
