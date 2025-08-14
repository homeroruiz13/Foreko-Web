"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { updateThemeMode } from "@/lib/theme-utils";
import { setValueToCookie } from "@/server/server-actions";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export function ThemeSwitcher() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleValueChange = async () => {
    if (!isClient) return;
    
    const newTheme = themeMode === "dark" ? "light" : "dark";
    updateThemeMode(newTheme);
    setThemeMode(newTheme);
    await setValueToCookie("theme_mode", newTheme);
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <Button size="icon" disabled>
        <Sun />
      </Button>
    );
  }

  return (
    <Button size="icon" onClick={handleValueChange}>
      {themeMode === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
