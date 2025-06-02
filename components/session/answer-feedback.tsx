"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Check, X, Clock } from "lucide-react";
import { useSoundEffects } from "@/lib/hooks/use-audio";

type FeedbackType = "correct" | "incorrect" | "timeout" | null;

interface AnswerFeedbackProps {
  type: FeedbackType;
  correctAnswer?: number;
  userAnswer?: number;
  onComplete?: () => void;
  playSound?: boolean; // New prop to control sound playing
}

export function AnswerFeedback({
  type,
  correctAnswer,
  userAnswer,
  onComplete,
  playSound = true, // Default to true for backward compatibility
}: AnswerFeedbackProps) {
  const { playCorrect, playIncorrect, playTimeout } = useSoundEffects();
  const soundPlayedRef = useRef(false);

  // Use ref to store the latest onComplete callback to avoid dependency issues
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset sound played flag when type changes
  useEffect(() => {
    soundPlayedRef.current = false;
  }, [type]);

  // Play sound effect when feedback type changes (only if enabled)
  useEffect(() => {
    if (!type || !playSound || soundPlayedRef.current) return;

    // Mark sound as played to prevent duplicates
    soundPlayedRef.current = true;

    // Play appropriate sound effect
    const playSoundEffect = async () => {
      switch (type) {
        case "correct":
          await playCorrect();
          break;
        case "incorrect":
          await playIncorrect();
          break;
        case "timeout":
          await playTimeout();
          break;
      }
    };

    playSoundEffect();
  }, [type, playCorrect, playIncorrect, playTimeout, playSound]);

  // Auto-dismiss after animation completes
  useEffect(() => {
    if (!type) return;

    const timer = setTimeout(() => {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, 2000); // 2 seconds for all feedback types

    return () => clearTimeout(timer);
  }, [type]); // Only depend on type, not onComplete

  if (!type) return null;

  const feedbackConfig = {
    correct: {
      icon: Check,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
      title: "Correct!",
      message: "",
    },
    incorrect: {
      icon: X,
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
      title: "Not quite!",
      message: `The answer is ${correctAnswer}`,
    },
    timeout: {
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
      title: "Time's up!",
      message: `The answer was ${correctAnswer}`,
    },
  };

  const config = feedbackConfig[type];
  const IconComponent = config.icon;

  // Compact version for mobile, full-screen for desktop
  return (
    <>
      {/* Mobile Compact Version */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-xs mx-auto md:hidden"
      >
        <div
          className={`p-6 bg-gray-50 rounded-2xl border-2 ${config.bgColor.replace("bg-", "border-").replace("-50", "-200")} text-center`}
        >
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.1,
              type: "spring",
              damping: 10,
              stiffness: 200,
            }}
            className={`mx-auto mb-3 p-2 rounded-full ${config.bgColor} border-2 border-current flex items-center justify-center w-12 h-12`}
          >
            <IconComponent className={`h-6 w-6 ${config.color}`} />
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg font-bold mb-1 ${config.color}`}
          >
            {config.title}
          </motion.h3>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            {config.message}
          </motion.p>

          {/* Show user's answer for incorrect responses */}
          {type === "incorrect" && userAnswer !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-xs text-muted-foreground"
            >
              Your answer: {userAnswer}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Desktop Full-Screen Version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        className="fixed inset-0 z-50 hidden md:flex items-center justify-center bg-black/20 backdrop-blur-sm"
        onClick={() => {
          if (onComplete) {
            onComplete();
          }
        }}
      >
        <motion.div
          initial={{ y: 50, scale: 0.8 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: -50, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            animate={
              type === "incorrect" || type === "timeout"
                ? {
                    x: [0, -10, 10, -10, 10, 0],
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              type: "tween",
              ease: "easeInOut",
            }}
          >
            <div
              className={`max-w-sm mx-auto ${config.bgColor} border-2 shadow-xl rounded-lg`}
            >
              <div className="p-8 text-center">
                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    damping: 10,
                    stiffness: 200,
                  }}
                  className={`mx-auto mb-4 p-3 rounded-full ${config.bgColor} border-2 border-current flex items-center justify-center`}
                >
                  <motion.div
                    animate={
                      type === "correct"
                        ? {
                            scale: [1, 1.2, 1],
                          }
                        : {}
                    }
                    transition={{
                      delay: 0.4,
                      duration: 0.6,
                      type: "tween",
                      ease: "easeInOut",
                    }}
                    className="flex items-center justify-center"
                  >
                    <IconComponent className={`h-8 w-8 ${config.color}`} />
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-2xl font-bold mb-2 ${config.color}`}
                >
                  {config.title}
                </motion.h3>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-lg"
                >
                  {config.message}
                </motion.p>

                {/* Show user's answer for incorrect responses */}
                {type === "incorrect" && userAnswer !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 text-sm text-muted-foreground"
                  >
                    Your answer: {userAnswer}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
