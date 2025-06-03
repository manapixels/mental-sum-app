"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface SessionProgressProps {
  current: number;
  total: number;
  percentage: number;
}

export function SessionProgress({
  current,
  total,
  percentage,
}: SessionProgressProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [prevCurrent, setPrevCurrent] = useState(current);
  const [shouldPulse, setShouldPulse] = useState(false);

  // Animate percentage changes
  useEffect(() => {
    if (percentage !== displayPercentage) {
      // Check if progress increased (not just initial load)
      if (current > prevCurrent && prevCurrent > 0) {
        setShouldPulse(true);
        setTimeout(() => setShouldPulse(false), 600);
      }
      setPrevCurrent(current);

      // Update immediately for responsive progress bar
      setDisplayPercentage(percentage);
    }
  }, [percentage, displayPercentage, current, prevCurrent]);

  return (
    <div className="text-center space-y-2 min-w-[120px]">
      <div className="space-y-1">
        {/* Animated Progress Bar */}
        <motion.div
          animate={shouldPulse ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Progress
            value={displayPercentage}
            className="w-full h-3 min-w-[100px]"
          />
        </motion.div>

        {/* Animated Counter */}
        <motion.div
          className="text-lg font-bold text-foreground"
          animate={
            shouldPulse
              ? {
                  scale: [1, 1.1, 1],
                  color: ["#000000", "#10b981", "#000000"],
                }
              : {}
          }
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={`${current}-${total}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              Question {current + 1 > total ? total : current + 1}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
