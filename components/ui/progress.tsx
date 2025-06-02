"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const progressValue = Math.max(0, Math.min(100, value || 0));

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-gray-700 h-full w-full flex-1 overflow-hidden rounded-full"
        style={{ transform: `translateX(-${100 - progressValue}%)` }}
      >
        <motion.div
          className="bg-primary h-full w-full"
          initial={{ width: 0 }}
          animate={{
            width: "100%",
            background:
              progressValue > 80
                ? "linear-gradient(90deg, hsl(var(--primary)), #10b981)"
                : undefined,
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0.0, 0.2, 1], // Custom cubic-bezier for smooth easing
            delay: 0.1,
          }}
          style={{
            background:
              progressValue > 80
                ? "linear-gradient(90deg, hsl(var(--primary)), #10b981)"
                : "hsl(var(--primary))",
          }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
}

export { Progress };
