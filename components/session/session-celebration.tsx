"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Trophy, Star, Zap } from "lucide-react";
import { Session } from "@/lib/types";
import { useSoundEffects } from "@/lib/hooks/use-audio";

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
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{
      id: number;
      color: string;
      x: number;
      delay: number;
      duration: number;
    }>
  >([]);

  // Track if celebration sound has been played to prevent loops
  const soundPlayedRef = useRef(false);

  // Calculate performance metrics (needed early for sound selection)
  const accuracy =
    session.problems.length > 0
      ? Math.round((session.totalCorrect / session.problems.length) * 100)
      : 0;

  const averageTime = Math.round(session.averageTime * 10) / 10;

  // Standardized performance thresholds
  const getPerformanceStars = (accuracy: number) => {
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    return 1;
  };

  const getPerformanceMessage = () => {
    const stars = getPerformanceStars(accuracy);

    if (accuracy === 100) return "Perfect Score! 🌟";
    if (stars === 3) return "Outstanding! 🎯";
    if (stars === 2) return "Great Job! 👏";
    return "Keep Practicing! 📚";
  };

  const getPerformanceIcon = () => {
    const stars = getPerformanceStars(accuracy);

    if (accuracy === 100) return Star;
    if (stars === 3) return Trophy;
    return Zap;
  };

  // Generate confetti pieces and play celebration sound
  useEffect(() => {
    if (show) {
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

        const playCelebrationSound = async () => {
          if (accuracy === 100) {
            // Perfect score - special sound
            await playPerfect();
          } else if (accuracy >= 90) {
            // Great performance (3 stars) - achievement sound
            await playAchievement();
          } else {
            // General completion - success sound
            await playSuccess();
          }
        };

        playCelebrationSound();
      }

      // Auto-dismiss after celebration
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      // Reset sound played flag when not showing
      soundPlayedRef.current = false;
    }
  }, [show, onComplete, accuracy]); // Removed sound functions from dependencies

  if (!show) return null;

  const PerformanceIcon = getPerformanceIcon();

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
                <PerformanceIcon className="h-12 w-12 text-white" />
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
              {getPerformanceMessage()}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
