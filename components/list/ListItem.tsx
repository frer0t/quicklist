import { useTheme } from "@/lib/ThemeContext";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Checkbox } from "../ui/Checkbox";

interface ListItemProps {
  title: string;
  description?: React.ReactNode;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  style?: ViewStyle;
}

export const ListItem = ({
  title,
  description,
  checked,
  onToggle,
  onPress,
  rightElement,
  leftElement,
  style,
}: ListItemProps) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      onToggle(!checked);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {leftElement ? (
        leftElement
      ) : (
        <Checkbox
          checked={checked}
          onChange={onToggle}
          color={colors.primary}
        />
      )}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: colors.text },
            checked && [styles.titleCompleted, { color: colors.textSecondary }],
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {description &&
          (typeof description === "string" ? (
            <Text
              style={[
                styles.description,
                { color: colors.textSecondary },
                checked && [
                  styles.descriptionCompleted,
                  { color: colors.textSecondary },
                ],
              ]}
              numberOfLines={1}
            >
              {description}
            </Text>
          ) : (
            description
          ))}
      </View>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  titleCompleted: {
    textDecorationLine: "line-through",
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  descriptionCompleted: {
    textDecorationLine: "line-through",
  },
  rightElement: {
    marginLeft: 8,
  },
});
