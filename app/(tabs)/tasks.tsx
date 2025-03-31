import { TextInput } from "@/components/forms/TextInput";
import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { ListItem } from "@/components/list/ListItem";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonListItem } from "@/components/ui/SkeletonLoader";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import type { Database } from "@/types/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useFocusEffect } from "expo-router";
import { Plus, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingTask, setAddingTask] = useState(false);
  const { colors, isDark } = useTheme();

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      setTasks(data || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      return () => {};
    }, [fetchTasks])
  );

  useEffect(() => {
    setLoading(true);
    fetchTasks().finally(() => setLoading(false));

    const taskChannelName = `tasks_screen_${Date.now()}`;
    const tasksChannel = supabase.channel(taskChannelName);
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
          fetchTasks();
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

    return () => {
      tasksChannel.unsubscribe();
    };
  }, [fetchTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchTasks();
    } finally {
      setRefreshing(false);
    }
  }, [fetchTasks]);

  const addTask = async () => {
    if (!newTask.trim() || addingTask) return;

    try {
      setError(null);
      setAddingTask(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const taskTitle = newTask.trim();
      setNewTask("");

      const { data, error: insertError } = await supabase
        .from("tasks")
        .insert([
          {
            title: taskTitle,
            user_id: user.id,
          },
        ])
        .select();

      if (insertError) throw insertError;

      if (data && data.length > 0) {
        setTasks((currentTasks) => [data[0] as Task, ...currentTasks]);
      } else {
        fetchTasks();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    } finally {
      setAddingTask(false);
    }
  };

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
      setTasks((current) => current.map((t) => (t.id === task.id ? task : t)));
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setError(null);
      setTasks((current) => current.filter((t) => t.id !== id));
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      const taskToRestore = tasks.find((t) => t.id === id);
      if (taskToRestore) {
        setTasks((current) => [...current, taskToRestore]);
      }
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <ListItem
      title={item.title}
      checked={item.completed as boolean}
      onToggle={() => toggleTask(item)}
      rightElement={
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTask(item.id)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Trash2 size={20} color={colors.danger} />
        </TouchableOpacity>
      }
    />
  );

  const renderSkeletonContent = () => {
    return (
      <>
        <View style={styles.inputContainer}>
          <TextInput
            value=""
            onChangeText={() => {}}
            placeholder="Add a new task..."
            clearable
            rightIcon={
              <Button
                title="Add"
                size="small"
                onPress={() => {}}
                disabled={true}
                leftIcon={<Plus size={16} color="#FFFFFF" />}
              />
            }
            editable={false}
          />
        </View>
        <View style={styles.list}>
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonListItem key={index} />
          ))}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.headerContainer}>
          <Header title="Tasks" />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Section
              style={{
                borderWidth: 1,
                backgroundColor: isDark ? "#391414" : "#FFE5E5",
                borderColor: colors.danger,
              }}
            >
              {error}
            </Section>
          </View>
        )}

        {!loading && !refreshing && (
          <View style={styles.inputContainer}>
            <TextInput
              value={newTask}
              onChangeText={setNewTask}
              placeholder="Add a new task..."
              clearable
              rightIcon={
                <Button
                  title="Add"
                  size="small"
                  onPress={addTask}
                  disabled={!newTask.trim()}
                  leftIcon={<Plus size={16} color="#FFFFFF" />}
                />
              }
              onSubmitEditing={addTask}
            />
          </View>
        )}

        {loading || refreshing ? (
          renderSkeletonContent()
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskItem}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              tasks.length === 0 && styles.emptyList,
            ]}
            ListEmptyComponent={
              <EmptyState
                title="No tasks yet"
                description="Add a task to get started"
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default TasksPage;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 5,
  },
  container: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  errorContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    padding: 5,
  },
});
