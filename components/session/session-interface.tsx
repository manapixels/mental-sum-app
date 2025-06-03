"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SessionLayout } from "@/components/layout/session-layout";
import { ProblemDisplay } from "./problem-display";
import { SessionProgress } from "./session-progress";
import { SessionTimer } from "./session-timer";
import { SessionControls } from "./session-controls";
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);

  const sessionJustCompletedRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const sessionStartSoundPlayedRef = useRef(false);
  const timerWarningTriggeredRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!currentUser) {
      router.replace("/");
      return;
    }
  }, [currentUser, router]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    if (currentSession?.id) {
      router.push(`/session/${currentSession.id}/results`);
    }
  }, [router, currentSession]);

  const handleNumberPress = (number: string) => {
    if (feedbackType === null) {
      setUserAnswer((prev) => prev + number);
    }
  };

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      if (currentSession && isActive) {
        clearSession();
      }
      setUserAnswer("");
      setShowCelebration(false);
      setFeedbackType(null);
      sessionJustCompletedRef.current = false;
      sessionStartSoundPlayedRef.current = false;
    }
  }, [currentSession, isActive, clearSession]);

  useEffect(() => {
    if (isActive && currentSession && !sessionStartSoundPlayedRef.current) {
      sessionStartSoundPlayedRef.current = true;
      playSessionStart();
    }
  }, [isActive, currentSession, playSessionStart]);

  useEffect(() => {
    if (
      hasTimedOut &&
      currentProblem &&
      isActive &&
      currentSession &&
      !currentSession.completed
    ) {
      setFeedbackType("timeout");
      clearTimeout();
    }
  }, [hasTimedOut, currentProblem, isActive, currentSession, clearTimeout]);

  useEffect(() => {
    if (currentUser && !currentSession && !isActive) {
      setShowCelebration(false);
      sessionJustCompletedRef.current = false;
      startSession();
    }
  }, [currentUser, currentSession, isActive, startSession]);

  useEffect(() => {
    if (
      currentSession?.completed &&
      !isActive &&
      !showCelebration &&
      currentSession.id
    ) {
      router.push(`/session/${currentSession.id}/results`);
    }
  }, [currentSession, isActive, showCelebration, router]);

  useEffect(() => {
    if (!isActive || isPaused || !currentSession) return;
    if (timeRemaining === (currentUser?.preferences.timeLimit || 30)) {
      timerWarningTriggeredRef.current.clear();
    }
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

  if (!currentUser) {
    return null;
  }

  const handleSubmitAnswer = () => {
    const answer = parseInt(userAnswer.trim());
    if (!isNaN(answer) && currentProblem) {
      const isCorrect = answer === currentProblem.correctAnswer;
      const newFeedbackType = isCorrect ? "correct" : "incorrect";
      setFeedbackType(newFeedbackType);
      submitAnswer(answer);
    }
  };

  const handleFeedbackComplete = () => {
    setFeedbackType(null);
    setUserAnswer("");

    if (
      currentSession &&
      currentSession.problems.length > 0 &&
      problemIndex >= currentSession.problems.length - 1 &&
      !currentSession.completed
    ) {
      sessionJustCompletedRef.current = true;
      setShowCelebration(true);
      nextProblem();
    } else if (currentSession && currentSession.completed) {
      sessionJustCompletedRef.current = true;
      setShowCelebration(true);
    } else {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userAnswer.trim()) {
      handleSubmitAnswer();
    }
  };

  const progress = getSessionProgress();

  if (!currentUser) {
    return (
      <SessionLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading session...</p>
          </div>
        </div>
      </SessionLayout>
    );
  }

  if ((!currentSession || !isActive) && !currentSession?.completed) {
    return (
      <SessionLayout>
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
      </SessionLayout>
    );
  }

  return (
    <SessionLayout>
      <div className="max-w-2xl mx-auto space-y-2 sm:space-y-4 pb-16">
        <div className="flex justify-center py-2">
          <SessionProgress
            current={progress.completed}
            total={progress.total}
            percentage={progress.percentage}
          />
        </div>
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
        <SessionControls />
      </div>
      <SoundToggleButton />
      {currentSession && (
        <SessionCelebration
          session={currentSession}
          show={showCelebration}
          onComplete={handleCelebrationComplete}
        />
      )}
      <SessionTimer />
    </SessionLayout>
  );
}
