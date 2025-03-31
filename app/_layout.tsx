import { supabase } from "@/lib/supabase";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import { Asset } from "expo-asset";
import { router, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Image, View } from "react-native";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

const cacheImages = (images: (string | number)[]): Promise<any>[] => {
  return images.map((image) => {
    if (typeof image === "string") {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        const imageAssets = cacheImages([
          require("../assets/images/pen-paper.avif"),
        ]);

        await Promise.all([...imageAssets]);
      } catch (e) {
        console.warn("Error loading assets:", e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <RootLayoutNav />
      </View>
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
