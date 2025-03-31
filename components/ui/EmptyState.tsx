import { useTheme } from "@/lib/ThemeContext";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  buttonTitle?: string;
  onButtonPress?: () => void;
  style?: ViewStyle;
}

export const EmptyState = ({
  title,
  description,
  icon,
  buttonTitle,
  onButtonPress,
  style,
}: EmptyStateProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}
      {buttonTitle && onButtonPress && (
        <View style={styles.buttonContainer}>
          <Button
            title={buttonTitle}
            onPress={onButtonPress}
            variant="primary"
            size="medium"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
