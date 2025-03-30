import { useTheme } from "@/lib/ThemeContext";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export const Header = ({
  title,
  showBackButton = false,
  onBackPress,
  rightElement,
  style,
  titleStyle,
}: HeaderProps) => {
  const router = useRouter();
  const { colors } = useTheme();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <Text
        style={[styles.title, { color: colors.text }, titleStyle]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={styles.rightContainer}>{rightElement}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftContainer: {
    width: 70,
    alignItems: "flex-start",
  },
  rightContainer: {
    width: 70,
    alignItems: "flex-end",
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    padding: 4,
  },
});
