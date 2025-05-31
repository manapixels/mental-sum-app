"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { ProblemDisplay } from "./problem-display";
import { AnswerInput } from "./answer-input";
import { SessionProgress } from "./session-progress";
import { SessionTimer } from "./session-timer";
import { SessionControls } from "./session-controls";
import { SessionResults } from "./session-results";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/contexts/session-context";
import { useUser } from "@/lib/contexts/user-context";
import { ArrowLeft, Play } from "lucide-react";

export function SessionInterface() {
  const router = useRouter();
  const { currentUser } = useUser();
  const {
    currentSession,
    currentProblem,
    isActive,
    isPaused,
    startSession,
    submitAnswer,
    getSessionProgress,
  } = useSession();

  const [userAnswer, setUserAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Redirect if no user
  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }
  }, [currentUser, router]);

  // Auto-start session if no current session
  useEffect(() => {
    if (currentUser && !currentSession && !isActive) {
      startSession();
    }
  }, [currentUser, currentSession, isActive, startSession]);

  // Show results when session is complete
  useEffect(() => {
    if (currentSession?.completed) {
      setShowResults(true);
    }
  }, [currentSession]);

  const handleSubmitAnswer = () => {
    const answer = parseInt(userAnswer.trim());
    if (!isNaN(answer)) {
      submitAnswer(answer);
      setUserAnswer("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userAnswer.trim()) {
      handleSubmitAnswer();
    }
  };

  const progress = getSessionProgress();

  // Loading state
  if (!currentUser) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading session...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show results screen
  if (showResults && currentSession) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <SessionResults
            session={currentSession}
            onBackToHome={() => router.push("/")}
            onNewSession={() => {
              setShowResults(false);
              startSession();
            }}
          />
        </div>
      </MainLayout>
    );
  }

  // Session not started state
  if (!currentSession || !isActive) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 sm:p-8">
            <CardContent className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Starting Session...
                </h2>
                <p className="text-muted-foreground">
                  Preparing {currentUser.preferences.sessionLength} problems for
                  you
                </p>
              </div>

              <div className="animate-pulse flex justify-center">
                <Play className="h-8 w-8 text-primary" />
              </div>

              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Active session state
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with back button and progress */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Home
          </Button>

          <SessionProgress
            current={progress.completed}
            total={progress.total}
            percentage={progress.percentage}
          />
        </div>

        {/* Timer */}
        <div className="flex justify-center">
          <SessionTimer />
        </div>

        {/* Problem display */}
        <div className="flex justify-center">
          {currentProblem && (
            <ProblemDisplay
              problem={currentProblem}
              showStrategy={currentUser.preferences.showStrategies}
            />
          )}
        </div>

        {/* Answer input */}
        <div className="space-y-4">
          <AnswerInput
            value={userAnswer}
            onChange={setUserAnswer}
            onKeyPress={handleKeyPress}
            disabled={isPaused}
            placeholder="Enter your answer"
          />

          <div className="flex justify-center">
            <Button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || isPaused}
              size="lg"
              className="w-full sm:w-auto px-8 h-12"
            >
              Submit Answer
            </Button>
          </div>
        </div>

        {/* Session controls */}
        <div className="pt-4">
          <SessionControls />
        </div>
      </div>
    </MainLayout>
  );
}
