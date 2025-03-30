import { TextInput } from "@/components/forms/TextInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Lock, Mail, RefreshCw } from "lucide-react-native";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleSignIn = async () => {
    try {
      setFormErrors({});
      setError(null);
      setIsEmailUnconfirmed(false);

      // Validate form data with Zod
      const result = signInSchema.safeParse({ email, password });

      if (!result.success) {
        const errors: { [key: string]: string } = {};
        result.error.issues.forEach((issue) => {
          errors[issue.path[0].toString()] = issue.message;
        });
        setFormErrors(errors);
        return;
      }

      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes("email") &&
          error.message?.toLowerCase().includes("confirm")
        ) {
          setIsEmailUnconfirmed(true);
          throw new Error(
            "Email not confirmed. Please check your inbox or request a new confirmation link."
          );
        }

        throw error;
      }

      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    try {
      if (!email) {
        setError("Please enter your email address");
        return;
      }

      setResendingEmail(true);
      setError(null);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;

      setError("Confirmation email sent! Please check your inbox.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send confirmation email"
      );
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <>
      <StatusBar style="light" />
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
          <Text style={styles.subtitle}>Organize your life, effortlessly</Text>
        </View>

        <Card style={styles.form} elevation="medium">
          {error && (
            <View style={styles.errorContainer}>
              <Text
                style={[
                  styles.error,
                  {
                    color: error.includes("sent")
                      ? colors.success
                      : colors.danger,
                  },
                ]}
              >
                {error}
              </Text>

              {isEmailUnconfirmed && (
                <Button
                  title={
                    resendingEmail ? "Sending..." : "Resend confirmation email"
                  }
                  variant="secondary"
                  onPress={handleResendConfirmation}
                  disabled={resendingEmail}
                  loading={resendingEmail}
                  leftIcon={<RefreshCw size={16} color={colors.primary} />}
                  style={styles.resendButton}
                />
              )}
            </View>
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
            error={formErrors.email}
          />

          <TextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={colors.textSecondary} />}
            error={formErrors.password}
          />

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? "Signing In..." : "Sign In"}
              onPress={handleSignIn}
              disabled={loading || resendingEmail}
              loading={loading}
              fullWidth
            />

            <Button
              title="Create Account"
              variant="outline"
              onPress={() => router.push("/auth/sign-up")}
              disabled={loading || resendingEmail}
              fullWidth
              style={styles.createAccountButton}
            />
          </View>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 300,
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
  errorContainer: {
    marginBottom: 15,
  },
  error: {
    textAlign: "center",
    marginBottom: 10,
  },
  resendButton: {
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 16,
  },
  createAccountButton: {
    marginTop: 12,
  },
});
