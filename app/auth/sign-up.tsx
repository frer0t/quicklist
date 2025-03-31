import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
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
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [verificationSent, setVerificationSent] = useState(false);
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

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setVerificationSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background, padding: 20 },
        ]}
      >
        <Card style={styles.verificationCard} elevation="medium">
          <Text style={[styles.verificationTitle, { color: colors.text }]}>
            Verify Your Email
          </Text>
          <Text
            style={[styles.verificationText, { color: colors.textSecondary }]}
          >
            We've sent a verification link to:
          </Text>
          <Text style={[styles.emailText, { color: colors.primary }]}>
            {email}
          </Text>
          <Text
            style={[
              styles.verificationText,
              { color: colors.textSecondary, marginTop: 20 },
            ]}
          >
            Please check your inbox and click the verification link to complete
            your registration. After verification, you'll be redirected to the
            sign-in page.
          </Text>

          <Button
            title="Go to Sign In"
            onPress={() => router.replace("/auth/sign-in")}
            style={{ marginTop: 30 }}
            fullWidth
          />

          <TouchableOpacity
            onPress={() => setVerificationSent(false)}
            style={styles.linkContainer}
          >
            <Text style={[styles.link, { color: colors.primary }]}>
              Return to sign up
            </Text>
          </TouchableOpacity>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.keyboardAvoidingView,
        { backgroundColor: colors.background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 20}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
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
            <Text style={[styles.error, { color: colors.danger }]}>
              {error}
            </Text>
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
    </KeyboardAvoidingView>
  );
};
export default SignUpPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
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
  verificationCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  verificationText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  emailText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
});
