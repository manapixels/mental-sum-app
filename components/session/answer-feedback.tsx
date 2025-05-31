"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Check, X, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type FeedbackType = "correct" | "incorrect" | "timeout" | null;

interface AnswerFeedbackProps {
  type: FeedbackType;
  correctAnswer?: number;
  userAnswer?: number;
  onComplete?: () => void;
}

export function AnswerFeedback({
  type,
  correctAnswer,
  userAnswer,
  onComplete,
}: AnswerFeedbackProps) {
  // Auto-dismiss after animation completes
  useEffect(() => {
    if (!type) return;

    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 2000); // 2 seconds for all feedback types

    return () => clearTimeout(timer);
  }, [type]); // Remove onComplete from dependencies to avoid re-creating timer

  if (!type) return null;

  const feedbackConfig = {
    correct: {
      icon: Check,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
      title: "Correct!",
      message: "Great job! 🎉",
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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={type}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
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
          {/* Add shake animation as separate motion.div */}
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
            <Card
              className={`max-w-sm mx-auto ${config.bgColor} border-2 shadow-xl`}
            >
              <CardContent className="p-8 text-center">
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
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
