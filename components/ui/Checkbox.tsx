import { Check } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  color?: string;
  style?: ViewStyle;
}

export const Checkbox = ({
  checked,
  onChange,
  disabled = false,
  size = "medium",
  color = "#007AFF",
  style,
}: CheckboxProps) => {
  const handlePress = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return { width: 20, height: 20, borderRadius: 10 };
      case "large":
        return { width: 28, height: 28, borderRadius: 14 };
      default:
        return { width: 24, height: 24, borderRadius: 12 };
    }
  };

  const getCheckSize = () => {
    switch (size) {
      case "small":
        return 12;
      case "large":
        return 20;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.7}
      style={[
        styles.container,
        getSizeStyle(),
        {
          borderColor: color,
          backgroundColor: checked ? color : "transparent",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      {checked && <Check size={getCheckSize()} color="#FFFFFF" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
});
