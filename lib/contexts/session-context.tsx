"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Problem, Session, StrategyId, UserStatistics } from "@/lib/types";
import { ProblemEngine } from "@/lib/problem-engine";
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
  startSession: (options?: { focusedStrategyId?: StrategyId | null }) => void;
  submitAnswer: (answer: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  clearSession: () => void;
  nextProblem: () => void;
  getSessionProgress: () => {
    completed: number;
    total: number;
    percentage: number;
  };
  clearTimeout: () => void;
  focusedStrategyId: StrategyId | null;
  setFocusedStrategy: (strategyId: StrategyId | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, updateUser, logProblemAttempt, updateStrategyMetrics } =
    useUser();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [focusedStrategyId, setFocusedStrategyId] = useState<StrategyId | null>(
    null,
  );

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

  const startSession = useCallback(
    (options?: { focusedStrategyId?: StrategyId | null }) => {
      if (!currentUser) return;

      const actualFocusIdForEngine =
        options?.focusedStrategyId !== undefined
          ? options.focusedStrategyId
          : options
            ? null
            : focusedStrategyId;

      setCurrentSession(null);
      setIsActive(false);
      setIsPaused(false);
      setHasTimedOut(false);
      setProblemIndex(0);

      try {
        const problems: Problem[] = [];
        const sessionLength = currentUser.preferences.sessionLength;
        for (let i = 0; i < sessionLength; i++) {
          const problem = ProblemEngine.generateProblem(
            currentUser.preferences,
            currentUser.statistics as UserStatistics,
            actualFocusIdForEngine,
          );
          if (problem) {
            problems.push(problem);
          } else {
            console.warn(
              "Failed to generate a problem, session might be shorter.",
            );
          }
        }

        if (problems.length === 0) {
          console.error("Could not generate any problems for the session.");
          return;
        }

        const newSessionData: Omit<Session, "id"> = {
          userId: currentUser.id,
          startTime: new Date(),
          problems: problems,
          completed: false,
          totalCorrect: 0,
          totalWrong: 0,
          averageTime: 0,
          sessionLength: problems.length,
        };

        const persistedSession = StorageManager.createSession(newSessionData);

        setCurrentSession(persistedSession);
        setTimeRemaining(currentUser.preferences.timeLimit || 30);
        setIsActive(true);
        setIsPaused(false);
        setHasTimedOut(false);
      } catch (error) {
        console.error("Error starting session:", error);
        setIsActive(false);
        setCurrentSession(null);
      }
    },
    [currentUser, focusedStrategyId, problemIndex],
  );

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
      if (!currentProblem || !currentSession || !currentUser) return;

      const isCorrect = answer === currentProblem.correctAnswer;
      const timeLimit = currentUser.preferences.timeLimit || 30;
      const timeSpent = Math.max(0, timeLimit - timeRemaining);

      const completedProblem: Problem = {
        ...currentProblem,
        userAnswer: answer,
        isCorrect,
        timeSpent,
        completedAt: new Date(),
      };

      updateProblemInSession(completedProblem);

      logProblemAttempt(completedProblem);
      updateStrategyMetrics(
        completedProblem.intendedStrategy,
        isCorrect,
        timeSpent,
      );
    },
    [
      currentProblem,
      currentSession,
      timeRemaining,
      currentUser,
      updateProblemInSession,
      logProblemAttempt,
      updateStrategyMetrics,
    ],
  );

  const pauseSession = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeSession = useCallback(() => {
    setIsPaused(false);
  }, []);

  const endSession = useCallback(() => {
    if (!currentSession || !currentUser || !updateUser) return;

    // Prevent multiple calls to endSession
    if (currentSession.completed) {
      console.log(
        "Session already completed, skipping duplicate endSession call",
        {
          sessionId: currentSession.id,
          totalCorrect: currentSession.totalCorrect,
          totalWrong: currentSession.totalWrong,
        },
      );
      return;
    }

    console.log("Starting endSession for session:", {
      sessionId: currentSession.id,
      problemsLength: currentSession.problems.length,
      currentIndex: problemIndex,
    });

    const completedProblems = currentSession.problems.filter(
      (p) => p.completedAt,
    );

    console.log("Completed problems count:", completedProblems.length);

    const correctAnswers = completedProblems.filter((p) => p.isCorrect).length;
    const totalTimeSpentOnCompleted = completedProblems.reduce(
      (sum, p) => sum + (p.timeSpent || 0),
      0,
    );
    const averageTime =
      completedProblems.length > 0
        ? totalTimeSpentOnCompleted / completedProblems.length
        : 0;

    const finalSession: Session = {
      ...currentSession,
      endTime: new Date(),
      completed: true,
      totalCorrect: correctAnswers,
      totalWrong: completedProblems.length - correctAnswers,
      averageTime: averageTime,
    };

    console.log("Final session stats:", {
      sessionId: finalSession.id,
      totalCorrect: finalSession.totalCorrect,
      totalWrong: finalSession.totalWrong,
      completedProblems: completedProblems.length,
    });

    setCurrentSession(finalSession);

    StorageManager.updateSession(finalSession.id, {
      endTime: finalSession.endTime,
      completed: finalSession.completed,
      totalCorrect: finalSession.totalCorrect,
      totalWrong: finalSession.totalWrong,
      averageTime: finalSession.averageTime,
      problems: finalSession.problems,
    });

    const oldUserStats = currentUser.statistics;
    const updatedGlobalStats: Partial<UserStatistics> = {
      totalProblems:
        (oldUserStats.totalProblems || 0) + completedProblems.length,
      correctAnswers: (oldUserStats.correctAnswers || 0) + correctAnswers,
      wrongAnswers:
        (oldUserStats.wrongAnswers || 0) +
        (completedProblems.length - correctAnswers),
      totalSessions: (oldUserStats.totalSessions || 0) + 1,
      lastSessionDate: new Date(),
    };

    const prevTotalProblemsWithTime =
      (oldUserStats.totalProblems || 0) -
      (oldUserStats.problemHistory?.filter(
        (p) => p.completedAt && p.timeSpent === undefined,
      ).length || 0);
    const prevTotalTimeSpent =
      (oldUserStats.averageTimePerProblem || 0) * prevTotalProblemsWithTime;
    const currentSessionTotalTime = totalTimeSpentOnCompleted;
    const newTotalProblemsWithTime =
      prevTotalProblemsWithTime + completedProblems.length;
    updatedGlobalStats.averageTimePerProblem =
      newTotalProblemsWithTime > 0
        ? (prevTotalTimeSpent + currentSessionTotalTime) /
          newTotalProblemsWithTime
        : 0;

    if (
      correctAnswers === completedProblems.length &&
      completedProblems.length > 0
    ) {
      updatedGlobalStats.currentStreak = (oldUserStats.currentStreak || 0) + 1;
    } else if (completedProblems.length > 0) {
      updatedGlobalStats.currentStreak = 0;
    }
    updatedGlobalStats.bestStreak = Math.max(
      oldUserStats.bestStreak || 0,
      updatedGlobalStats.currentStreak || 0,
    );

    updateUser(currentUser.id, {
      statistics: updatedGlobalStats as UserStatistics,
    });

    setIsActive(false);
    setIsPaused(false);
  }, [currentSession, currentUser, updateUser]);

  const nextProblem = useCallback(() => {
    if (!currentSession || !isActive || isPaused) return;

    if (problemIndex < currentSession.problems.length - 1) {
      setProblemIndex((prev) => prev + 1);
      setTimeRemaining(currentUser?.preferences.timeLimit || 30);
      setHasTimedOut(false);
    } else {
      endSession();
    }
  }, [
    currentSession,
    isActive,
    isPaused,
    problemIndex,
    currentUser,
    endSession,
  ]);

  const getSessionProgress = useCallback(() => {
    if (!currentSession) return { completed: 0, total: 0, percentage: 0 };
    const completed = problemIndex;
    const total = currentSession.sessionLength;
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [currentSession, problemIndex]);

  const clearTimeout = useCallback(() => {
    setHasTimedOut(false);
  }, []);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
    setProblemIndex(0);
    setIsActive(false);
    setIsPaused(false);
    setHasTimedOut(false);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && !isPaused && !currentProblem?.completedAt && !hasTimedOut) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setHasTimedOut(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, isPaused, currentProblem, hasTimedOut]);

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
    clearSession,
    nextProblem,
    getSessionProgress,
    clearTimeout,
    focusedStrategyId,
    setFocusedStrategy: setFocusedStrategyId,
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
