import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { supabase } from "./supabase";

export const themes = {
  light: {
    background: "#F2F2F7",
    card: "#FFFFFF",
    text: "#000000",
    textSecondary: "#8E8E93",
    border: "#F2F2F7",
    primary: "#007AFF",
    success: "#34C759",
    warning: "#FF9500",
    danger: "#FF3B30",
    info: "#5AC8FA",
  },
  dark: {
    background: "#1C1C1E",
    card: "#2C2C2E",
    text: "#FFFFFF",
    textSecondary: "#AEAEB2",
    border: "#38383A",
    primary: "#0A84FF",
    success: "#30D158",
    warning: "#FF9F0A",
    danger: "#FF453A",
    info: "#64D2FF",
  },
};

export type ThemeType = "light" | "dark";
export type ThemeColors = typeof themes.light;

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  colors: themes.light,
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Get system color scheme
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(
    (deviceTheme as ThemeType) || "light"
  );

  // Load user preference from Supabase on mount
  useEffect(() => {
    const loadUserThemePreference = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("settings")
            .eq("id", user.id)
            .single();

          if (data?.settings?.theme) {
            setTheme(data.settings.theme);
          }
        }
      } catch (error) {
        console.log("Error loading theme preference:", error);
      }
    };

    loadUserThemePreference();
  }, []);

  // Save theme preference to Supabase when it changes
  const saveThemePreference = async (newTheme: ThemeType) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("settings")
          .eq("id", user.id)
          .single();

        const currentSettings = data?.settings || {};

        await supabase
          .from("profiles")
          .update({
            settings: { ...currentSettings, theme: newTheme },
          })
          .eq("id", user.id);
      }
    } catch (error) {
      console.log("Error saving theme preference:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    saveThemePreference(newTheme);
  };

  const updateTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    saveThemePreference(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: themes[theme],
        toggleTheme,
        setTheme: updateTheme,
        isDark: theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
