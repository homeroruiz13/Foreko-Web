"use client";

import { useEffect } from "react";
import { updateThemeMode, updateThemePreset } from "@/lib/theme-utils";

interface ThemeInitializerProps {
  themeMode: "light" | "dark";
  themePreset: string;
}

export function ThemeInitializer({ themeMode, themePreset }: ThemeInitializerProps) {
  useEffect(() => {
    // Initialize theme on client side only
    updateThemeMode(themeMode);
    updateThemePreset(themePreset);
  }, [themeMode, themePreset]);

  return null; // This component doesn't render anything
}
