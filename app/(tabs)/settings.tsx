import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/lib/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { CircleHelp as HelpCircle, LogOut, Moon } from "lucide-react-native";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

const SettingsPage = () => {
  const { isDark, toggleTheme, colors } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        router.replace("/auth/sign-in");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const goToHelpAndSupport = () => {
    router.push("/help-support");
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => (
    <Card
      padding="medium"
      elevation="none"
      rounded="none"
      onPress={onPress}
      style={{
        ...styles.settingItem,
        borderBottomColor: colors.border,
      }}
    >
      <View style={styles.settingLeft}>
        {icon}
        <Text style={{ ...styles.settingText, color: colors.text }}>
          {title}
        </Text>
      </View>
      {rightElement}
    </Card>
  );

  return (
    <SafeAreaView
      style={{ ...styles.safeArea, backgroundColor: colors.background }}
    >
      <View style={styles.headerContainer}>
        <Header
          title="Settings"
          style={{
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          }}
          titleStyle={{ color: colors.text }}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Section
            title="Preferences"
            style={{ ...styles.section, backgroundColor: colors.card }}
            titleStyle={{ color: colors.text }}
          >
            {renderSettingItem(
              <Moon size={24} color={colors.primary} />,
              "Dark Mode",
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: "#D1D1D6", true: "#34C759" }}
                thumbColor="#FFFFFF"
              />
            )}
          </Section>

          <Section
            title="About"
            style={{ ...styles.section, backgroundColor: colors.card }}
            titleStyle={{ color: colors.text }}
          >
            {renderSettingItem(
              <HelpCircle size={24} color={colors.primary} />,
              "Help & Support",
              undefined,
              goToHelpAndSupport
            )}
          </Section>

          <Section
            title="Account"
            style={{ ...styles.section, backgroundColor: colors.card }}
            titleStyle={{ color: colors.text }}
          >
            {renderSettingItem(
              <LogOut size={24} color={colors.danger || "#FF3B30"} />,
              "Sign Out",
              undefined,
              handleSignOut
            )}
          </Section>

          <View style={styles.footer}>
            <Text style={{ ...styles.version, color: colors.textSecondary }}>
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    width: "100%",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: 30,
  },
  section: {
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
  },
  footer: {
    alignItems: "center",
    padding: 20,
  },
  version: {
    fontSize: 14,
  },
});
