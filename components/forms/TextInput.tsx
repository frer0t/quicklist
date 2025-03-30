import { useTheme } from "@/lib/ThemeContext";
import { X } from "lucide-react-native";
import React, { useState } from "react";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface TextInputProps extends Omit<RNTextInputProps, "onChangeText"> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  containerStyle?: ViewStyle;
  onClear?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
}

export const TextInput = ({
  label,
  error,
  leftIcon,
  rightIcon,
  clearable = false,
  containerStyle,
  value,
  onChangeText,
  onClear,
  ...rest
}: TextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();

  const handleClear = () => {
    if (onChangeText) {
      onChangeText("");
    }
    if (onClear) {
      onClear();
    }
  };

  // Create input styles conditionally
  const inputStyles: Array<TextStyle | undefined> = [
    styles.input,
    { color: colors.text },
  ];
  if (leftIcon) inputStyles.push(styles.inputWithLeftIcon);
  if (rightIcon || (clearable && value))
    inputStyles.push(styles.inputWithRightIcon);

  // Create container styles conditionally
  const inputContainerStyles: Array<ViewStyle | undefined> = [
    styles.inputContainer,
    {
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
  ];
  if (isFocused) inputContainerStyles.push({ borderColor: colors.primary });
  if (error) inputContainerStyles.push({ borderColor: colors.danger });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View style={inputContainerStyles}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <RNTextInput
          style={inputStyles}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.textSecondary}
          {...rest}
        />
        {clearable && value ? (
          <TouchableOpacity style={styles.rightIcon} onPress={handleClear}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  error: {
    fontSize: 14,
    marginTop: 4,
  },
});
