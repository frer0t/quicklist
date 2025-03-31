import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

import { TextInput } from "@/components/forms/TextInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/lib/ThemeContext";
import { Lock, Mail, ShieldCheck } from "lucide-react-native";

// Create a schema for sign-up validation
const SignUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleSignUp = async () => {
    try {
      setError(null);

      const validationResult = SignUpSchema.safeParse({
        email,
        password,
        confirmPassword,
      });

      if (!validationResult.success) {
        const errorMessage = validationResult.error.issues[0].message;
        setError(errorMessage);
        return;
      }

      setLoading(true);

      const { data, error: checkError } = await supabase.functions.invoke(
        "check-user-email",
        {
          method: "POST",
          body: { email },
        }
      );

      if (checkError) {
        throw checkError;
      }
      if (data.success) {
        setError("Email already exists. Please use a different email.");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      alert(
        "Sign up successful! Please check your email to confirm your account."
      );

      router.replace("/auth/sign-in");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/pen-paper.avif")}
          style={styles.headerImage}
        />
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: isDark
                ? "rgba(0, 0, 0, 0.6)"
                : "rgba(0, 0, 0, 0.4)",
            },
          ]}
        />
        <Text style={styles.title}>QuickList</Text>
        <Text style={styles.subtitle}>Create your account</Text>
      </View>

      <Card style={styles.form} elevation="medium">
        {error && (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        )}

        <TextInput
          label="Email"
          placeholder="Enter your email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={<Mail size={20} color={colors.textSecondary} />}
          clearable
        />

        <TextInput
          label="Password"
          placeholder="Choose a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon={<Lock size={20} color={colors.textSecondary} />}
        />

        <TextInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          leftIcon={<ShieldCheck size={20} color={colors.textSecondary} />}
        />

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Creating Account..." : "Sign Up"}
            onPress={handleSignUp}
            disabled={loading}
            loading={loading}
            fullWidth
          />
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/auth/sign-in")}
          style={styles.linkContainer}
        >
          <Text style={[styles.link, { color: colors.primary }]}>
            Already have an account? Sign in
          </Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};
export default SignUpPage;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  headerImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 10,
    textAlign: "center",
  },
  form: {
    padding: 24,
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 16,
  },
  error: {
    marginBottom: 15,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 16,
  },
  linkContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  link: {
    fontSize: 16,
  },
});
