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
  const [foregroundColor, setForegroundColor] = useState("#000000");

  // Get computed foreground color for animations
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateForegroundColor = () => {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        const foregroundHSL = computedStyle
          .getPropertyValue("--foreground")
          .trim();

        // Convert HSL to a format Framer Motion can animate
        // For light mode this is typically something like "0 0% 3.9%"
        // For dark mode this is typically something like "0 0% 98%"
        if (foregroundHSL) {
          // Parse the HSL values and create a proper HSL string
          const [h, s, l] = foregroundHSL.split(" ");
          const hslString = `hsl(${h}, ${s}, ${l})`;
          setForegroundColor(hslString);
        }
      };

      updateForegroundColor();

      // Update on theme changes
      const observer = new MutationObserver(updateForegroundColor);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });

      return () => observer.disconnect();
    }
  }, []);

  // Animate percentage changes
  useEffect(() => {
    if (percentage !== displayPercentage) {
      // Check if progress increased (not just initial load)
      if (current > prevCurrent && prevCurrent > 0) {
        setShouldPulse(true);
        setTimeout(() => setShouldPulse(false), 600);
      }
      setPrevCurrent(current);

      // Smooth percentage transition
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage);
      }, 50);

      return () => clearTimeout(timer);
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
          <Progress value={displayPercentage} className="w-full h-2" />
        </motion.div>

        {/* Animated Counter */}
        <motion.div
          className="text-lg font-bold text-foreground"
          animate={
            shouldPulse
              ? {
                  scale: [1, 1.1, 1],
                  color: [foregroundColor, "#10b981", foregroundColor],
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
              {current} / {total}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
