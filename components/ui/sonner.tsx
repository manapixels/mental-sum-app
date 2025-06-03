"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--color-gray-800)",
          "--normal-text": "var(--color-gray-200)",
          "--normal-border": "var(--color-gray-800)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
