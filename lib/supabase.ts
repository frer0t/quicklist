import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Ensure environment variables are defined
if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing environment variable: EXPO_PUBLIC_SUPABASE_URL");
}

if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing environment variable: EXPO_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Create Supabase client
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
