import { Mail } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/lib/ThemeContext";

export default function HelpSupportScreen() {
  const { colors } = useTheme();

  const handleContact = async () => {
    try {
      await Linking.openURL("mailto:support@quicklist.frerot.dev");
    } catch (error) {
      Alert.alert("Error", "Could not open contact method");
    }
  };

  const renderHelpItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    onPress?: () => void
  ) => (
    <Card
      padding="medium"
      style={{
        marginBottom: 12,
        backgroundColor: colors.card,
      }}
      onPress={onPress}
    >
      <View style={styles.helpItemHeader}>
        {icon}
        <Text style={{ ...styles.helpItemTitle, color: colors.text }}>
          {title}
        </Text>
      </View>
      <Text
        style={{ ...styles.helpItemDescription, color: colors.textSecondary }}
      >
        {description}
      </Text>
    </Card>
  );

  return (
    <SafeAreaView
      style={{ ...styles.safeArea, backgroundColor: colors.background }}
    >
      <View style={styles.headerContainer}>
        <Header
          title="Help & Support"
          showBackButton={true}
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
            title="Frequently Asked Questions"
            style={{ marginBottom: 20 }}
            titleStyle={{ color: colors.text }}
          >
            <Card padding="medium" style={{ backgroundColor: colors.card }}>
              <View style={styles.faqItem}>
                <Text style={{ ...styles.faqQuestion, color: colors.text }}>
                  How do I create a new task?
                </Text>
                <Text
                  style={{ ...styles.faqAnswer, color: colors.textSecondary }}
                >
                  Navigate to the Tasks tab and tap the "+" button at the bottom
                  right corner.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={{ ...styles.faqQuestion, color: colors.text }}>
                  How do I edit my shopping list?
                </Text>
                <Text
                  style={{ ...styles.faqAnswer, color: colors.textSecondary }}
                >
                  Go to the Shopping tab, tap on any item to edit it, or swipe
                  left to delete it.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={{ ...styles.faqQuestion, color: colors.text }}>
                  Can I sync across devices?
                </Text>
                <Text
                  style={{ ...styles.faqAnswer, color: colors.textSecondary }}
                >
                  Yes! All your data syncs automatically when you're signed in.
                </Text>
              </View>
            </Card>
          </Section>

          <Section
            title="Contact Us"
            style={{ marginBottom: 20 }}
            titleStyle={{ color: colors.text }}
          >
            {renderHelpItem(
              <Mail
                size={24}
                color={colors.primary}
                style={{ marginRight: 12 }}
              />,
              "Email Support",
              "Get help via email at support@quicklist.frerot.dev",
              () => handleContact()
            )}
          </Section>

          <View style={styles.footer}>
            <Text
              style={{ ...styles.versionText, color: colors.textSecondary }}
            >
              App version: 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  content: {
    flex: 1,
    padding: 16,
  },
  helpItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  helpItemTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  helpItemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
  },
});
