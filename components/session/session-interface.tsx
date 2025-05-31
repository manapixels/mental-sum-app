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
import { AnswerFeedback } from "./answer-feedback";
import { SessionCelebration } from "./session-celebration";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/contexts/session-context";
import { useUser } from "@/lib/contexts/user-context";
import { ArrowLeft, Play } from "lucide-react";
import { motion } from "framer-motion";

type FeedbackType = "correct" | "incorrect" | "timeout" | null;

export function SessionInterface() {
  const router = useRouter();
  const { currentUser } = useUser();
  const {
    currentSession,
    currentProblem,
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

  // Watch for timeout
  useEffect(() => {
    if (hasTimedOut && currentProblem) {
      setFeedbackType("timeout");
      setFeedbackData({
        correctAnswer: currentProblem.correctAnswer,
        userAnswer: undefined,
      });
      clearTimeout(); // Clear the timeout flag
    }
  }, [hasTimedOut, currentProblem, clearTimeout]);

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

  // Show celebration when session is complete, then results
  useEffect(() => {
    if (currentSession?.completed && !showCelebration && !showResults) {
      setShowCelebration(true);
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
      setUserAnswer("");
    }
  };

  // Debug feedback state changes
  useEffect(() => {
    console.log("Feedback state changed:", { feedbackType, feedbackData });
  }, [feedbackType, feedbackData]);

  // Debug session state
  useEffect(() => {
    console.log("Session state debug:", {
      hasCurrentSession: !!currentSession,
      isSessionCompleted: currentSession?.completed,
      isActive,
      showCelebration,
      showResults,
      problemsLength: currentSession?.problems?.length,
      totalCorrect: currentSession?.totalCorrect,
    });
  }, [currentSession, isActive, showCelebration, showResults]);

  const handleFeedbackComplete = () => {
    setFeedbackType(null);
    setFeedbackData({});

    // Advance to next problem after feedback animation
    setTimeout(() => {
      nextProblem();
    }, 100); // Small delay to ensure smooth transition
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setShowResults(true);
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
            disabled={isPaused || feedbackType !== null}
            placeholder="Enter your answer"
          />

          <div className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={handleSubmitAnswer}
                disabled={
                  !userAnswer.trim() || isPaused || feedbackType !== null
                }
                size="lg"
                className="w-full sm:w-auto px-8 h-12"
              >
                Submit Answer
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Session controls */}
        <div className="pt-4">
          <SessionControls />
        </div>
      </div>

      {/* Answer Feedback Overlay */}
      <AnswerFeedback
        type={feedbackType}
        correctAnswer={feedbackData.correctAnswer}
        userAnswer={feedbackData.userAnswer}
        onComplete={handleFeedbackComplete}
      />

      {/* Session Celebration */}
      {currentSession && (
        <SessionCelebration
          session={currentSession}
          show={showCelebration}
          onComplete={handleCelebrationComplete}
        />
      )}
    </MainLayout>
  );
}
