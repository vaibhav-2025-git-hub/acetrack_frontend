"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner"
import type { ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  let theme = "system";
  try {
    const themeContext = useTheme();
    theme = themeContext.theme || "system";
  } catch (e) {
    // next-themes not initialized or ThemeProvider missing
  }

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
