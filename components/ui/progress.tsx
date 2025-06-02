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
        "bg-gray-700/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <motion.div
        className="h-full rounded-full"
        initial={{
          width: "0%",
          background: "var(--color-gray-700)",
        }}
        animate={{
          width: `${progressValue}%`,
          background:
            progressValue > 80
              ? "linear-gradient(90deg, var(--color-gray-700), #10b981)"
              : "var(--color-gray-700)",
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
