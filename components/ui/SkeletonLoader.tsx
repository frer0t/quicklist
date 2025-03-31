import { useTheme } from "@/lib/ThemeContext";
import React, { useEffect } from "react";
import { DimensionValue, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonLoaderProps) => {
  const { colors, isDark } = useTheme();
  // Use Reanimated shared value instead of Animated.Value
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    // Create repeating animation sequence with Reanimated
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1 // Infinite repeat
    );

    return () => {
      // Cleanup animation on unmount
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width,
      height,
      borderRadius,
      backgroundColor: isDark ? colors.border : "#E1E9F2",
      opacity: opacity.value,
    };
  });
  return <Animated.View style={[styles.skeleton, animatedStyle, style]} />;
};

interface SkeletonListItemProps {
  lines?: number;
  withCheckbox?: boolean;
}

export const SkeletonListItem = ({
  lines = 1,
  withCheckbox = true,
}: SkeletonListItemProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.listItem,
        { borderBottomColor: colors.border, borderBottomWidth: 1 },
      ]}
    >
      {withCheckbox && (
        <SkeletonLoader
          width={24}
          height={24}
          borderRadius={12}
          style={styles.checkbox}
        />
      )}
      <View style={styles.content}>
        <SkeletonLoader width="80%" height={18} />
        {lines > 1 && (
          <SkeletonLoader width="60%" height={14} style={styles.subtitle} />
        )}
      </View>
    </View>
  );
};

export const SkeletonCard = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <SkeletonLoader width="60%" height={20} style={styles.cardTitle} />
      <SkeletonLoader width="100%" height={16} style={styles.cardContent} />
      <SkeletonLoader width="90%" height={16} style={styles.cardContent} />
      <SkeletonLoader width="40%" height={16} style={styles.cardContent} />
    </View>
  );
};

interface SkeletonSectionProps {
  itemCount?: number;
}

export const SkeletonSection: React.FC<SkeletonSectionProps> = ({
  itemCount = 3,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.card,
          shadowColor: colors.text,
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <SkeletonLoader width={120} height={20} />
        <SkeletonLoader width={60} height={16} />
      </View>

      {Array.from({ length: itemCount }).map((_, index) => (
        <SkeletonListItem key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  checkbox: {
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    marginBottom: 12,
  },
  cardContent: {
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
});
