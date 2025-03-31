import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";
type BadgeSize = "small" | "medium" | "large";

interface BadgeProps {
  label: string | number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export const Badge = ({
  label,
  variant = "primary",
  size = "medium",
  style,
}: BadgeProps) => {
  return (
    <View style={[styles.badge, styles[variant], styles[size], style]}>
      <Text
        style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
  small: {
    paddingVertical: 2,
    minWidth: 20,
  },
  medium: {
    paddingVertical: 4,
    minWidth: 24,
  },
  large: {
    paddingVertical: 6,
    minWidth: 28,
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
  // Variants
  primary: {
    backgroundColor: "#007AFF",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondary: {
    backgroundColor: "#E9EFF7",
  },
  secondaryText: {
    color: "#007AFF",
  },
  success: {
    backgroundColor: "#34C759",
  },
  successText: {
    color: "#FFFFFF",
  },
  warning: {
    backgroundColor: "#FF9500",
  },
  warningText: {
    color: "#FFFFFF",
  },
  danger: {
    backgroundColor: "#FF3B30",
  },
  dangerText: {
    color: "#FFFFFF",
  },
  info: {
    backgroundColor: "#5AC8FA",
  },
  infoText: {
    color: "#FFFFFF",
  },
});
