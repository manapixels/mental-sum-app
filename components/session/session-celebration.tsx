"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Trophy, Star, Target } from "lucide-react";
import { Session } from "@/lib/types";
import { useSoundEffects } from "@/lib/hooks/use-audio";
import { useHaptic } from "@/lib/hooks/use-haptic";
import {
  PerformanceUtils,
  PERFORMANCE_THRESHOLDS,
} from "@/lib/performance-thresholds";

interface SessionCelebrationProps {
  session: Session;
  show: boolean;
  onComplete: () => void;
}

export function SessionCelebration({
  session,
  show,
  onComplete,
}: SessionCelebrationProps) {
  const { playAchievement, playPerfect, playSuccess } = useSoundEffects();
  const { vibrateSessionComplete, vibrateAchievement } = useHaptic();

  const [confettiPieces, setConfettiPieces] = useState<
    Array<{
      id: number;
      color: string;
      x: number;
      delay: number;
      duration: number;
    }>
  >([]);

  // Refs to track initialization and prevent duplicate effects
  const initializedRef = useRef(false);
  const soundPlayedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate performance metrics
  const completedProblems = session.problems.filter((p) => p.completedAt);
  const correctAnswers = session.totalCorrect;
  const accuracy =
    completedProblems.length > 0
      ? Math.round((correctAnswers / completedProblems.length) * 100)
      : 0;
  const averageTime = Math.round(session.averageTime * 10) / 10;

  const performanceMetrics = { accuracy, averageTime };

  // Use centralized performance thresholds for UI feedback
  const getPerformanceStars = (acc: number) => {
    return PerformanceUtils.getSessionStars(acc);
  };

  const getPerformanceUI = (acc: number) => {
    const stars = getPerformanceStars(acc);
    if (stars === 3) {
      return {
        message: "Outstanding! You're mastering mental math!",
        Icon: Trophy,
      };
    }
    if (stars === 2) {
      return {
        message: "Great job! Keep up the good work!",
        Icon: Star,
      };
    }
    return {
      message: "Good effort! Practice makes perfect!",
      Icon: Target,
    };
  };

  const performanceUI = getPerformanceUI(accuracy);

  // Single effect that only runs when show changes to true
  useEffect(() => {
    if (show && !initializedRef.current) {
      initializedRef.current = true;

      // Generate confetti
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        color: [
          "#10B981",
          "#3B82F6",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#F97316",
        ][i % 6],
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
      }));
      setConfettiPieces(pieces);

      // Play celebration sound only once
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;

        // Play sound without dependencies to avoid infinite loops
        const playCelebrationSound = async () => {
          const { accuracy } = performanceMetrics;
          try {
            // Use centralized thresholds for celebration sounds
            if (accuracy === 100) {
              await playPerfect();
              vibrateAchievement();
            } else if (
              accuracy >=
              PERFORMANCE_THRESHOLDS.SESSION_RATING.THREE_STARS * 100
            ) {
              await playAchievement();
              vibrateSessionComplete();
            } else {
              await playSuccess();
              vibrateSessionComplete();
            }
          } catch (error) {
            console.warn("Failed to play celebration sound:", error);
          }
        };

        playCelebrationSound();
      }

      // Auto-dismiss timer
      timerRef.current = setTimeout(() => {
        onComplete();
      }, 4000);
    } else if (!show) {
      // Reset when hiding
      initializedRef.current = false;
      soundPlayedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [show]); // Only depend on show

  // Handle onComplete changes without triggering infinite loops
  useEffect(() => {
    if (show && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onComplete();
      }, 4000);
    }
  }, [onComplete, show]);

  if (!show) return null;

  const { message, Icon } = performanceUI;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      >
        {/* Confetti */}
        {confettiPieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              y: -20,
              x: `${piece.x}vw`,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              y: "100vh",
              rotate: 360 * 3,
              opacity: 0,
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: "easeIn",
            }}
            className="absolute w-3 h-3 pointer-events-none"
            style={{
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}

        {/* Celebration Modal */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 300,
            delay: 0.2,
          }}
          className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full text-center relative overflow-hidden"
        >
          {/* Background glow effect */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 via-green-200/30 to-blue-200/30 rounded-2xl"
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: 1,
                rotate: 0,
              }}
              transition={{
                delay: 0.3,
                type: "spring",
                damping: 10,
                stiffness: 200,
              }}
              className="mx-auto mb-6 p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.6,
                  repeat: 2,
                  type: "tween",
                }}
                className="flex items-center justify-center"
              >
                <Icon className="h-12 w-12 text-white" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              Session Complete!
            </motion.h2>

            {/* Performance message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl font-semibold text-gray-600 mb-6"
            >
              {message}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {accuracy}%
                </div>
                <div className="text-sm text-green-700">Accuracy</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {averageTime}s
                </div>
                <div className="text-sm text-blue-700">Avg Time</div>
              </div>
            </motion.div>

            {/* Encouraging message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-gray-600"
            >
              <p className="text-sm">
                {session.totalCorrect} correct out of {session.problems.length}{" "}
                problems
              </p>
              <p className="text-xs mt-2 text-gray-500">
                Tap anywhere to continue
              </p>
            </motion.div>
          </div>

          {/* Click overlay */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={onComplete}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
