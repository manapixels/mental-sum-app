import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <motion.div
      className="relative"
      animate={
        isFocused
          ? {
              scale: 1.01,
            }
          : {
              scale: 1,
            }
      }
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-md"
        initial={{
          boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)",
          backgroundColor: "rgba(0, 0, 0, 0)",
        }}
        animate={
          isFocused
            ? {
                boxShadow: [
                  "0 0 0 0 rgba(59, 130, 246, 0)",
                  "0 0 0 4px rgba(59, 130, 246, 0.1)",
                  "0 0 20px 4px rgba(59, 130, 246, 0.15)",
                ],
                backgroundColor: "rgba(59, 130, 246, 0.05)",
              }
            : {
                boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)",
                backgroundColor: "rgba(0, 0, 0, 0)",
              }
        }
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        style={{
          background: isFocused
            ? "linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))"
            : "transparent",
        }}
      />

      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm relative z-10",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "hover:border-ring/60 hover:shadow-sm",
          className,
        )}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    </motion.div>
  );
}

export { Input };
