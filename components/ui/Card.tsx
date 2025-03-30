import { useTheme } from "@/lib/ThemeContext";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";

type ElevationSize = "none" | "small" | "medium" | "large";
type PaddingSize = "none" | "small" | "medium" | "large";
type RoundedSize = "none" | "small" | "medium" | "large";

interface CardBasePropsWithoutStyle {
  children: React.ReactNode;
  elevation?: ElevationSize;
  padding?: PaddingSize;
  rounded?: RoundedSize;
}

interface StaticCardProps extends CardBasePropsWithoutStyle {
  style?: ViewStyle;
  onPress?: never;
}

interface TouchableCardProps
  extends CardBasePropsWithoutStyle,
    Omit<TouchableOpacityProps, "children"> {
  onPress: () => void;
}

type CardProps = TouchableCardProps | StaticCardProps;

const getStyleKey = (prefix: string, value: string): string => {
  return `${prefix}${capitalize(value)}`;
};

export const Card = ({
  children,
  style,
  elevation = "medium",
  padding = "medium",
  rounded = "medium",
  onPress,
  ...touchableProps
}: CardProps) => {
  const { colors } = useTheme();

  const cardStyles = [
    styles.card,
    { backgroundColor: colors.card, shadowColor: colors.text },
    styles[getStyleKey("elevation", elevation) as keyof typeof styles],
    styles[getStyleKey("padding", padding) as keyof typeof styles],
    styles[getStyleKey("rounded", rounded) as keyof typeof styles],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        activeOpacity={0.8}
        onPress={onPress}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: 10,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },
  elevationNone: {},
  elevationSmall: {
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  elevationMedium: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  elevationLarge: {
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  roundedNone: {
    borderRadius: 0,
  },
  roundedSmall: {
    borderRadius: 8,
  },
  roundedMedium: {
    borderRadius: 12,
  },
  roundedLarge: {
    borderRadius: 16,
  },
});
