"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Problem, Session } from "@/lib/types";
import { ProblemGenerator } from "@/lib/problem-generator";
import { StorageManager } from "@/lib/storage";
import { useUser } from "./user-context";

interface SessionContextType {
  currentSession: Session | null;
  currentProblem: Problem | null;
  problemIndex: number;
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  hasTimedOut: boolean;
  startSession: () => void;
  submitAnswer: (answer: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  nextProblem: () => void;
  getSessionProgress: () => {
    completed: number;
    total: number;
    percentage: number;
  };
  clearTimeout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, updateUser } = useUser();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            // Time's up - automatically submit current answer as wrong
            handleTimeUp();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeRemaining]);

  // Automatic pause/resume based on window focus
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (isActive && !hasTimedOut) {
        setIsPaused(document.hidden);
      }
    };

    const handleWindowBlur = () => {
      if (isActive && !hasTimedOut) {
        setIsPaused(true);
      }
    };

    const handleWindowFocus = () => {
      if (isActive && !hasTimedOut) {
        setIsPaused(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isActive, hasTimedOut]);

  const currentProblem = currentSession?.problems[problemIndex] || null;

  const handleTimeUp = useCallback(() => {
    if (!currentProblem) return;

    // Set timeout flag for UI feedback
    setHasTimedOut(true);

    // Mark as incorrect due to timeout
    const timeLimit = currentUser?.preferences.timeLimit || 30;
    const updatedProblem: Problem = {
      ...currentProblem,
      userAnswer: -1, // Special value to indicate timeout
      isCorrect: false,
      timeSpent: timeLimit,
      completedAt: new Date(),
    };

    updateProblemInSession(updatedProblem);
    // Don't auto-advance here - let the UI handle it
  }, [currentProblem, currentUser]);

  const startSession = useCallback(() => {
    if (!currentUser) return;

    // Immediately clear any existing session to prevent UI glitches
    setCurrentSession(null);
    setIsActive(false);
    setIsPaused(false);
    setHasTimedOut(false);

    try {
      // Generate problems based on user preferences
      const problems = ProblemGenerator.generateSession(
        currentUser,
        currentUser.preferences.sessionLength,
      );

      // Create new session
      const session: Session = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        startTime: new Date(),
        problems: problems,
        completed: false,
        totalCorrect: 0,
        totalWrong: 0,
        averageTime: 0,
        sessionLength: problems.length,
      };

      setCurrentSession(session);
      setProblemIndex(0);
      setTimeRemaining(currentUser.preferences.timeLimit || 30);
      setIsActive(true);
      setIsPaused(false);
      setHasTimedOut(false);

      // Save session to storage
      StorageManager.createSession({
        userId: currentUser.id,
        startTime: new Date(),
        problems: problems,
        completed: false,
        totalCorrect: 0,
        totalWrong: 0,
        averageTime: 0,
        sessionLength: problems.length,
      });
    } catch (error) {
      console.error("Error starting session:", error);
    }
  }, [currentUser]);

  const updateProblemInSession = useCallback(
    (updatedProblem: Problem) => {
      if (!currentSession) return;

      const updatedProblems = [...currentSession.problems];
      updatedProblems[problemIndex] = updatedProblem;

      const updatedSession: Session = {
        ...currentSession,
        problems: updatedProblems,
      };

      setCurrentSession(updatedSession);
      StorageManager.updateSession(updatedSession.id, {
        problems: updatedProblems,
      });
    },
    [currentSession, problemIndex],
  );

  const submitAnswer = useCallback(
    (answer: number) => {
      if (!currentProblem || !currentSession) return;

      const isCorrect = answer === currentProblem.correctAnswer;
      const timeLimit = currentUser?.preferences.timeLimit || 30;
      const timeSpent = timeLimit - timeRemaining;

      const updatedProblem: Problem = {
        ...currentProblem,
        userAnswer: answer,
        isCorrect,
        timeSpent,
        completedAt: new Date(),
      };

      updateProblemInSession(updatedProblem);

      // Don't automatically advance - let the feedback component handle timing
    },
    [
      currentProblem,
      currentSession,
      timeRemaining,
      currentUser,
      updateProblemInSession,
    ],
  );

  const nextProblem = useCallback(() => {
    if (!currentSession) return;

    // Clear timeout flag for next problem
    setHasTimedOut(false);

    if (problemIndex < currentSession.problems.length - 1) {
      // Move to next problem
      setProblemIndex((prev) => prev + 1);
      setTimeRemaining(currentUser?.preferences.timeLimit || 30);
    } else {
      // Session complete
      endSession();
    }
  }, [currentSession, problemIndex, currentUser]);

  const pauseSession = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeSession = useCallback(() => {
    setIsPaused(false);
  }, []);

  const endSession = useCallback(() => {
    if (!currentSession || !currentUser) return;

    // Calculate session statistics
    const completedProblems = currentSession.problems.filter(
      (p) => p.completedAt,
    );
    const correctAnswers = completedProblems.filter((p) => p.isCorrect).length;
    const totalTime = completedProblems.reduce(
      (sum, p) => sum + p.timeSpent,
      0,
    );
    const averageTime =
      completedProblems.length > 0 ? totalTime / completedProblems.length : 0;

    // Update session
    const finalSession: Session = {
      ...currentSession,
      endTime: new Date(),
      completed: true,
      totalCorrect: correctAnswers,
      totalWrong: completedProblems.length - correctAnswers,
      averageTime,
    };

    setCurrentSession(finalSession);
    StorageManager.updateSession(finalSession.id, {
      endTime: new Date(),
      completed: true,
      totalCorrect: correctAnswers,
      totalWrong: completedProblems.length - correctAnswers,
      averageTime,
    });

    // Update user statistics
    const updatedStats = { ...currentUser.statistics };
    updatedStats.totalProblems += completedProblems.length;
    updatedStats.correctAnswers += correctAnswers;
    updatedStats.wrongAnswers += completedProblems.length - correctAnswers;
    updatedStats.totalSessions += 1;
    updatedStats.lastSessionDate = new Date();

    // Calculate new average time
    const totalProblemsWithTime = updatedStats.totalProblems;
    const newTotalTime =
      updatedStats.averageTimePerProblem *
        (totalProblemsWithTime - completedProblems.length) +
      totalTime;
    updatedStats.averageTimePerProblem =
      totalProblemsWithTime > 0 ? newTotalTime / totalProblemsWithTime : 0;

    // Update streak
    if (correctAnswers === completedProblems.length) {
      updatedStats.currentStreak += 1;
      updatedStats.bestStreak = Math.max(
        updatedStats.bestStreak,
        updatedStats.currentStreak,
      );
    } else {
      updatedStats.currentStreak = 0;
    }

    // Update operation-specific stats
    completedProblems.forEach((problem) => {
      const opStats = updatedStats.operationStats[problem.operation];
      opStats.attempted += 1;
      if (problem.isCorrect) {
        opStats.correct += 1;
      }
      opStats.averageTime =
        (opStats.averageTime * (opStats.attempted - 1) + problem.timeSpent) /
        opStats.attempted;
      opStats.fastestTime =
        opStats.fastestTime === 0
          ? problem.timeSpent
          : Math.min(opStats.fastestTime, problem.timeSpent);
    });

    updateUser(currentUser.id, { statistics: updatedStats });

    // Stop the session
    setIsActive(false);
    setIsPaused(false);
    setHasTimedOut(false);
  }, [currentSession, currentUser, updateUser]);

  const getSessionProgress = useCallback(() => {
    if (!currentSession) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = problemIndex + (currentProblem?.completedAt ? 1 : 0);
    const total = currentSession.sessionLength;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  }, [currentSession, problemIndex, currentProblem]);

  const clearTimeout = useCallback(() => {
    setHasTimedOut(false);
  }, []);

  const value: SessionContextType = {
    currentSession,
    currentProblem,
    problemIndex,
    timeRemaining,
    isActive,
    isPaused,
    hasTimedOut,
    startSession,
    submitAnswer,
    pauseSession,
    resumeSession,
    endSession,
    nextProblem,
    getSessionProgress,
    clearTimeout,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
