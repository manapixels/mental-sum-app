"use client";

import { motion } from "framer-motion";
import { useSession } from "@/lib/contexts/session-context";
import { useUser } from "@/lib/contexts/user-context";
import { Pause } from "lucide-react";

export function SessionTimer() {
  const { timeRemaining, isPaused } = useSession();
  const { currentUser } = useUser();

  const timeLimit = currentUser?.preferences.timeLimit || 30;
  const progress = Math.max(0, (timeRemaining / timeLimit) * 100);

  const getProgressColor = () => {
    if (progress > 50) return "bg-gray-400";
    if (progress > 20) return "bg-gray-500";
    return "bg-gray-600";
  };

  const getBackgroundColor = () => {
    return "bg-gray-100";
  };

  const formatTime = (seconds: number) => {
    if (seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Timer text - subtle and small - above progress bar */}
      <div className={`text-center py-1 transition-colors duration-300`}>
        {isPaused ? (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
            <Pause className="h-3 w-3" />
            <span>PAUSED</span>
          </div>
        ) : (
          <div className="text-xs text-gray-600 font-mono">
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Progress bar background */}
      <div
        className={`h-2 ${getBackgroundColor()} transition-colors duration-300`}
      >
        {/* Progress bar fill */}
        <motion.div
          className={`h-full ${getProgressColor()} transition-colors duration-300`}
          style={{ width: `${progress}%` }}
          animate={{
            width: `${progress}%`,
            ...(progress <= 20 && !isPaused
              ? {
                  opacity: [1, 0.7, 1],
                }
              : {}),
          }}
          transition={{
            width: { duration: 1, ease: "linear" },
            opacity: { duration: 0.5, repeat: Infinity },
          }}
        />
      </div>
    </div>
  );
}
