"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { ProblemDisplay } from "./problem-display";
import { SessionProgress } from "./session-progress";
import { SessionTimer } from "./session-timer";
import { SessionControls } from "./session-controls";
import { SessionResults } from "./session-results";
import { AnswerFeedback } from "./answer-feedback";
import { SessionCelebration } from "./session-celebration";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/contexts/session-context";
import { useUser } from "@/lib/contexts/user-context";
import { ArrowLeft, Play } from "lucide-react";

type FeedbackType = "correct" | "incorrect" | "timeout" | null;

export function SessionInterface() {
  const router = useRouter();
  const { currentUser } = useUser();
  const {
    currentSession,
    currentProblem,
    problemIndex,
    isActive,
    isPaused,
    hasTimedOut,
    startSession,
    submitAnswer,
    getSessionProgress,
    nextProblem,
    clearTimeout,
  } = useSession();

  const [userAnswer, setUserAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [feedbackData, setFeedbackData] = useState<{
    correctAnswer?: number;
    userAnswer?: number;
  }>({});

  // Track when we're expecting a natural session completion
  const sessionJustCompletedRef = useRef(false);

  // Watch for timeout
  useEffect(() => {
    if (
      hasTimedOut &&
      currentProblem &&
      isActive &&
      currentSession &&
      !currentSession.completed
    ) {
      setFeedbackType("timeout");
      setFeedbackData({
        correctAnswer: currentProblem.correctAnswer,
        userAnswer: undefined,
      });
      clearTimeout(); // Clear the timeout flag
    }
  }, [hasTimedOut, currentProblem, isActive, currentSession, clearTimeout]);

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
      // Reset celebration and results state when starting a new session
      setShowCelebration(false);
      setShowResults(false);
      sessionJustCompletedRef.current = false;
      startSession();
    }
  }, [currentUser, currentSession, isActive, startSession]);

  // Show celebration when session naturally completes
  useEffect(() => {
    if (currentSession?.completed && !showCelebration && !showResults) {
      // Only show celebration if this session just completed naturally
      if (sessionJustCompletedRef.current) {
        setShowCelebration(true);
        sessionJustCompletedRef.current = false; // Reset the flag
      }
    }
  }, [currentSession, showCelebration, showResults]);

  const handleSubmitAnswer = () => {
    const answer = parseInt(userAnswer.trim());

    if (!isNaN(answer) && currentProblem) {
      const isCorrect = answer === currentProblem.correctAnswer;

      // Set feedback type and data
      const newFeedbackType = isCorrect ? "correct" : "incorrect";

      setFeedbackType(newFeedbackType);
      setFeedbackData({
        correctAnswer: currentProblem.correctAnswer,
        userAnswer: answer,
      });

      // Submit the answer (this will handle the session logic)
      submitAnswer(answer);
      // Don't clear the answer here - wait until feedback completes
    }
  };

  const handleFeedbackComplete = () => {
    setFeedbackType(null);
    setFeedbackData({});

    // Clear the answer when moving to next question
    setUserAnswer("");

    // Check if this is the last problem - if so, mark that session is about to complete naturally
    if (currentSession && problemIndex === currentSession.problems.length - 1) {
      sessionJustCompletedRef.current = true;
    }

    // Advance to next problem after feedback animation
    setTimeout(() => {
      nextProblem();
    }, 100); // Small delay to ensure smooth transition
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setShowResults(true);
  };

  // Number keypad handlers
  const handleNumberPress = (number: string) => {
    if (feedbackType === null) {
      // Only allow input when not showing feedback
      setUserAnswer((prev) => prev + number);
    }
  };

  const handleBackspace = () => {
    if (feedbackType === null) {
      setUserAnswer((prev) => prev.slice(0, -1));
    }
  };

  const handleKeypadSubmit = () => {
    if (userAnswer.trim() && feedbackType === null) {
      handleSubmitAnswer();
    }
  };

  // Desktop keyboard handler
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
              setShowCelebration(false);
              setFeedbackType(null);
              setFeedbackData({});
              setUserAnswer("");
              sessionJustCompletedRef.current = false;
              startSession();
            }}
          />
        </div>
      </MainLayout>
    );
  }

  // Session not started state (but don't show this if we have a completed session)
  if ((!currentSession || !isActive) && !currentSession?.completed) {
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
      <div className="max-w-2xl mx-auto space-y-2 sm:space-y-4 pb-16">
        {/* Compact Header with progress */}
        <div className="flex justify-center py-2">
          <SessionProgress
            current={progress.completed}
            total={progress.total}
            percentage={progress.percentage}
          />
        </div>

        {/* Problem display with integrated answer input */}
        <div className="flex justify-center py-2">
          {currentProblem && (
            <ProblemDisplay
              problem={currentProblem}
              showStrategy={currentUser.preferences.showStrategies}
              userAnswer={userAnswer}
              onAnswerChange={setUserAnswer}
              onSubmit={handleSubmitAnswer}
              onKeyPress={handleKeyPress}
              onNumberPress={handleNumberPress}
              onBackspace={handleBackspace}
              onKeypadSubmit={handleKeypadSubmit}
              onFeedbackComplete={handleFeedbackComplete}
              disabled={isPaused}
              feedbackType={feedbackType}
            />
          )}
        </div>

        {/* Compact Session controls */}
        <div className="pt-2">
          <SessionControls />
        </div>
      </div>

      {/* Session Celebration */}
      {currentSession && (
        <SessionCelebration
          session={currentSession}
          show={showCelebration}
          onComplete={handleCelebrationComplete}
        />
      )}

      {/* Answer Feedback Overlay - Only for desktop */}
      {typeof window !== "undefined" && window.innerWidth >= 768 && (
        <AnswerFeedback
          type={feedbackType}
          correctAnswer={feedbackData.correctAnswer}
          userAnswer={feedbackData.userAnswer}
          onComplete={handleFeedbackComplete}
        />
      )}

      {/* Bottom Timer Progress Bar */}
      <SessionTimer />
    </MainLayout>
  );
}
