import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useFocusEffect, useRouter } from "expo-router";
import { ArrowRight, ListChecks, ShoppingBag } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Section } from "@/components/layout/Section";
import { ListItem } from "@/components/list/ListItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonSection } from "@/components/ui/SkeletonLoader";
import { useTheme } from "@/lib/ThemeContext";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type ShoppingItem = Database["public"]["Tables"]["shopping_items"]["Row"];

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { height } = useWindowDimensions();

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([fetchTasks(), fetchShoppingItems()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => {};
    }, [fetchData])
  );

  useEffect(() => {
    const homeTasksChannel = `home_tasks_${Date.now()}`;
    const homeShoppingChannel = `home_shopping_${Date.now()}`;

    const tasksChannel = supabase.channel(homeTasksChannel);
    tasksChannel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          payload.errors;
          fetchTasks(); // Refresh tasks on insert
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
        },
        (
          payload: RealtimePostgresChangesPayload<{
            [key: string]: any;
          }>
        ) => {
          if (payload.new) {
            const updatedTask = payload.new as Record<string, any>;
            if (typeof updatedTask.id === "string") {
              setTasks((current) =>
                current.map((task) =>
                  task.id === updatedTask.id ? (updatedTask as Task) : task
                )
              );
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tasks",
        },
        (
          payload: RealtimePostgresChangesPayload<{
            [key: string]: any;
          }>
        ) => {
          const oldRecord = payload.old as Record<string, any> | undefined;
          if (oldRecord && typeof oldRecord.id === "string") {
            const deletedId = oldRecord.id;
            setTasks((current) =>
              current.filter((task) => task.id !== deletedId)
            );
          }
        }
      )
      .subscribe();

    const shoppingChannel = supabase.channel(homeShoppingChannel);
    shoppingChannel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shopping_items",
        },
        (payload) => {
          payload.errors;
          fetchShoppingItems(); // Refresh shopping items on insert
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shopping_items",
        },
        (
          payload: RealtimePostgresChangesPayload<{
            [key: string]: any;
          }>
        ) => {
          if (payload.new) {
            const updatedItem = payload.new as Record<string, any>;
            if (typeof updatedItem.id === "string") {
              setShoppingItems((current) =>
                current.map((item) =>
                  item.id === updatedItem.id
                    ? (updatedItem as ShoppingItem)
                    : item
                )
              );
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "shopping_items",
        },
        (
          payload: RealtimePostgresChangesPayload<{
            [key: string]: any;
          }>
        ) => {
          const oldRecord = payload.old as Record<string, any> | undefined;
          if (oldRecord && typeof oldRecord.id === "string") {
            const deletedId = oldRecord.id;
            setShoppingItems((current) =>
              current.filter((item) => item.id !== deletedId)
            );
          }
        }
      )
      .subscribe();

    // Clean up subscriptions when component unmounts
    return () => {
      tasksChannel.unsubscribe();
      shoppingChannel.unsubscribe();
    };
  }, []);

  const fetchTasks = async () => {
    const { data, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    if (fetchError) throw fetchError;
    setTasks(data || []);
    return data;
  };

  const fetchShoppingItems = async () => {
    const { data, error: fetchError } = await supabase
      .from("shopping_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    if (fetchError) throw fetchError;
    setShoppingItems(data || []);
    return data;
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  const toggleTask = async (task: Task) => {
    try {
      setError(null);
      setTasks((current) =>
        current.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      );
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", task.id);
      if (updateError) throw updateError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      // Revert UI if there was an error
      setTasks((current) => current.map((t) => (t.id === task.id ? task : t)));
    }
  };

  const toggleShoppingItem = async (item: ShoppingItem) => {
    try {
      setError(null);

      setShoppingItems((current) =>
        current.map((i) =>
          i.id === item.id ? { ...i, completed: !i.completed } : i
        )
      );

      const { error: updateError } = await supabase
        .from("shopping_items")
        .update({ completed: !item.completed })
        .eq("id", item.id);
      if (updateError) throw updateError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
      // Revert UI if there was an error
      setShoppingItems((current) =>
        current.map((i) => (i.id === item.id ? item : i))
      );
    }
  };

  const renderSkeletonContent = () => (
    <SafeAreaView
      style={[styles.loadingContainer, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { height: height * 0.25 }]}>
          <View
            style={[
              styles.overlay,
              { backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7" },
            ]}
          />
          <View style={styles.headerContent}>
            <View style={styles.skeletonTitleContainer}>
              <View
                style={[
                  styles.skeletonTitle,
                  { backgroundColor: isDark ? "#38383A" : "#E1E9F2" },
                ]}
              />
              <View
                style={[
                  styles.skeletonSubtitle,
                  { backgroundColor: isDark ? "#38383A" : "#E1E9F2" },
                ]}
              />
            </View>
          </View>
        </View>

        <SkeletonSection itemCount={3} />
        <SkeletonSection itemCount={3} />
      </ScrollView>
    </SafeAreaView>
  );

  if (loading || refreshing) {
    return renderSkeletonContent();
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={[styles.header, { height: height * 0.25 }]}>
          <Image
            source={require("@/assets/images/pen-paper.avif")}
            blurRadius={10}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: isDark
                  ? "rgba(0, 0, 0, 0.6)"
                  : "rgba(0, 0, 0, 0.4)",
              },
            ]}
          />
          <Text style={styles.title}>QuickList</Text>
          <Text style={styles.subtitle}>Organize your life, effortlessly</Text>
        </View>

        {error && (
          <Section
            style={{
              borderWidth: 1,
              marginHorizontal: 20,
              marginBottom: 20,
              backgroundColor: isDark ? "#391414" : "#FFE5E5",
              borderColor: colors.danger,
            }}
          >
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </Text>
          </Section>
        )}

        <Section
          title="Recent Tasks"
          icon={<ListChecks size={24} color={colors.primary} />}
          rightElement={
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push("/(tabs)/tasks")}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          }
        >
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              buttonTitle="Add Your First Task"
              onButtonPress={() => router.push("/(tabs)/tasks")}
            />
          ) : (
            tasks.map((task) => (
              <ListItem
                key={task.id}
                title={task.title}
                checked={task.completed as boolean}
                onToggle={() => toggleTask(task)}
              />
            ))
          )}
        </Section>

        <Section
          title="Shopping List"
          icon={<ShoppingBag size={24} color={colors.primary} />}
          rightElement={
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push("/(tabs)/shopping")}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          }
        >
          {shoppingItems.length === 0 ? (
            <EmptyState
              title="No items in your shopping list"
              buttonTitle="Add Your First Item"
              onButtonPress={() => router.push("/(tabs)/shopping")}
            />
          ) : (
            shoppingItems.map((item) => (
              <ListItem
                key={item.id}
                title={`${item.name} (${item.quantity})`}
                checked={item.completed as boolean}
                onToggle={() => toggleShoppingItem(item)}
              />
            ))
          )}
        </Section>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    marginRight: 4,
  },
  errorSection: {
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },
  headerContent: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  skeletonTitleContainer: {
    alignItems: "center",
  },
  skeletonTitle: {
    width: 180,
    height: 34,
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonSubtitle: {
    width: 240,
    height: 16,
    borderRadius: 4,
  },
});
