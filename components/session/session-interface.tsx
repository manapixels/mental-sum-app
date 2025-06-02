"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { ProblemDisplay } from "./problem-display";
import { SessionProgress } from "./session-progress";
import { SessionTimer } from "./session-timer";
import { SessionControls } from "./session-controls";
import { SessionResults } from "./session-results";
import { SessionCelebration } from "./session-celebration";
import { SoundToggleButton } from "./sound-toggle-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/contexts/session-context";
import { useUser } from "@/lib/contexts/user-context";
import { useSoundEffects } from "@/lib/hooks/use-audio";
import { ArrowLeft, Play } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useHaptic } from "@/lib/hooks/use-haptic";

type FeedbackType = "correct" | "incorrect" | "timeout" | null;

export function SessionInterface() {
  const router = useRouter();
  const { currentUser } = useUser();
  const { playSessionStart } = useSoundEffects();
  const { vibrateTimerWarning, vibrateTimerCritical } = useHaptic();
  const {
    currentSession,
    currentProblem,
    problemIndex,
    timeRemaining,
    isActive,
    isPaused,
    hasTimedOut,
    startSession,
    submitAnswer,
    getSessionProgress,
    nextProblem,
    clearTimeout,
    clearSession,
  } = useSession();

  const [userAnswer, setUserAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);

  // Track when we're expecting a natural session completion
  const sessionJustCompletedRef = useRef(false);
  // Track if this is a fresh page load to handle cleanup
  const isInitialLoadRef = useRef(true);
  // Track if session start sound has been played
  const sessionStartSoundPlayedRef = useRef(false);
  // Track timer warnings to prevent duplicate vibrations
  const timerWarningTriggeredRef = useRef<Set<number>>(new Set());

  // IMMEDIATE redirect check - prevents UI flash
  useEffect(() => {
    if (!currentUser) {
      router.replace("/");
      return;
    }
  }, [currentUser, router]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setShowResults(true);
  }, []); // Empty dependency array makes it stable

  // Number keypad handlers
  const handleNumberPress = (number: string) => {
    if (feedbackType === null) {
      // Only allow input when not showing feedback
      setUserAnswer((prev) => prev + number);
    }
  };

  // Clean up any stale session data on fresh page loads
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;

      // If we have an active session on page load, it means this is a refresh
      // Clear the session to prevent stale data issues
      if (currentSession && isActive) {
        clearSession();
      }

      // Reset all local state
      setUserAnswer("");
      setShowResults(false);
      setShowCelebration(false);
      setFeedbackType(null);
      sessionJustCompletedRef.current = false;
      sessionStartSoundPlayedRef.current = false;
    }
  }, [currentSession, isActive, clearSession]);

  // Play session start sound when session becomes active
  useEffect(() => {
    if (isActive && currentSession && !sessionStartSoundPlayedRef.current) {
      sessionStartSoundPlayedRef.current = true;
      playSessionStart();
    }
  }, [isActive, currentSession, playSessionStart]);

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
      clearTimeout(); // Clear the timeout flag
    }
  }, [hasTimedOut, currentProblem, isActive, currentSession, clearTimeout]);

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

  // Timer warning haptic feedback
  useEffect(() => {
    if (!isActive || isPaused || !currentSession) return;

    // Reset warnings when moving to a new problem
    if (timeRemaining === (currentUser?.preferences.timeLimit || 30)) {
      timerWarningTriggeredRef.current.clear();
    }

    // Trigger haptic feedback at specific time thresholds
    if (timeRemaining === 10 && !timerWarningTriggeredRef.current.has(10)) {
      vibrateTimerWarning();
      timerWarningTriggeredRef.current.add(10);
    } else if (
      timeRemaining === 5 &&
      !timerWarningTriggeredRef.current.has(5)
    ) {
      vibrateTimerCritical();
      timerWarningTriggeredRef.current.add(5);
    }
  }, [
    timeRemaining,
    isActive,
    isPaused,
    currentSession,
    currentUser,
    vibrateTimerWarning,
    vibrateTimerCritical,
  ]);

  // Early return if no user - prevents any UI rendering before redirect
  if (!currentUser) {
    return null; // Return nothing instead of loading spinner to prevent flash
  }

  const handleSubmitAnswer = () => {
    const answer = parseInt(userAnswer.trim());

    if (!isNaN(answer) && currentProblem) {
      const isCorrect = answer === currentProblem.correctAnswer;

      // Set feedback type
      const newFeedbackType = isCorrect ? "correct" : "incorrect";

      setFeedbackType(newFeedbackType);

      // Submit the answer (this will handle the session logic)
      submitAnswer(answer);
      // Don't clear the answer here - wait until feedback completes
    }
  };

  const handleFeedbackComplete = () => {
    setFeedbackType(null);
    setUserAnswer("");

    if (currentSession && problemIndex === currentSession.problems.length - 1) {
      // Last problem: show celebration and then formally end session
      setShowCelebration(true);
      // Delay ending session slightly to allow celebration UI to kick in
      setTimeout(() => {
        nextProblem(); // This will call endSession()
      }, 100);
    } else {
      // Not the last problem: advance to next problem
      setTimeout(() => {
        nextProblem();
      }, 100);
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
            <AnimatePresence>
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
            </AnimatePresence>
          )}
        </div>

        {/* Compact Session controls */}
        <SessionControls />
      </div>

      {/* Sound Toggle Button */}
      <SoundToggleButton />

      {/* Session Celebration */}
      {currentSession && (
        <SessionCelebration
          session={currentSession}
          show={showCelebration}
          onComplete={handleCelebrationComplete}
        />
      )}

      {/* Bottom Timer Progress Bar */}
      <SessionTimer />
    </MainLayout>
  );
}
