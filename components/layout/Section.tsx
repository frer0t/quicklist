import { useTheme } from "@/lib/ThemeContext";
import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

interface SectionProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

export const Section = ({
  title,
  icon,
  children,
  rightElement,
  style,
  contentStyle,
  titleStyle,
}: SectionProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          shadowColor: colors.text,
        },
        style,
      ]}
    >
      {(title || icon || rightElement) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {icon && <View style={styles.icon}>{icon}</View>}
            {title && (
              <Text style={[styles.title, { color: colors.text }, titleStyle]}>
                {title}
              </Text>
            )}
          </View>
          {rightElement && <View>{rightElement}</View>}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {},
});
