"use client";

import { motion } from "framer-motion";
import { useSession } from "@/lib/contexts/session-context";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function SessionTimer() {
  const { timeRemaining } = useSession();

  const getTimerColor = (time: number, total: number = 30) => {
    const percentage = (time / total) * 100;
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getTimerBgColor = (time: number, total: number = 30) => {
    const percentage = (time / total) * 100;
    if (percentage > 50) return "bg-green-50 border-green-200";
    if (percentage > 20) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const formatTime = (seconds: number) => {
    if (seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Animation based on urgency
  const getAnimation = () => {
    if (timeRemaining <= 5) {
      return {
        scale: [1, 1.05, 1],
        transition: { duration: 0.5, repeat: Infinity },
      };
    } else if (timeRemaining <= 10) {
      return {
        scale: [1, 1.02, 1],
        transition: { duration: 1, repeat: Infinity },
      };
    }
    return {};
  };

  return (
    <motion.div animate={getAnimation()}>
      <Card
        className={`${getTimerBgColor(timeRemaining)} transition-colors duration-300 py-0`}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-center space-x-2">
            <Clock
              className={`h-4 w-4 sm:h-5 sm:w-5 ${getTimerColor(timeRemaining)}`}
            />
            <div
              className={`text-xl sm:text-2xl font-bold font-mono ${getTimerColor(timeRemaining)}`}
            >
              {formatTime(timeRemaining)}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
