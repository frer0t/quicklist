import { supabase } from "@/lib/supabase";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import { router, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { isDark } = useTheme();
  const segments = useSegments();
  const isAuth = segments[0] === "auth";
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const inAuthGroup = segments[0] === "auth";

      if (session && inAuthGroup) {
        router.replace("/(tabs)");
      } else if (!session && !inAuthGroup) {
        router.replace("/auth/sign-in");
      }
    });
    supabase.auth.onAuthStateChange((_, session) => {
      if (session && isAuth) {
        router.replace("/(tabs)");
      } else if (!session && !isAuth) {
        router.replace("/auth/sign-in");
      }
    });
  }, [segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: "Oops!" }} />
        <Stack.Screen name="help-support" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}
