import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useFocusEffect } from "expo-router";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import our custom components
import { TextInput } from "@/components/forms/TextInput";
import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { ListItem } from "@/components/list/ListItem";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonListItem } from "@/components/ui/SkeletonLoader";
import { useTheme } from "@/lib/ThemeContext";

type ShoppingItem = Database["public"]["Tables"]["shopping_items"]["Row"];

const ShoppingPage = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const { colors, isDark } = useTheme();

  const fetchItems = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("shopping_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      setItems(data || []);
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch shopping items"
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
      return () => {};
    }, [fetchItems])
  );

  useEffect(() => {
    setLoading(true);
    fetchItems().finally(() => setLoading(false));

    const shoppingChannelName = `shopping_screen_${Date.now()}`;
    const shoppingChannel = supabase.channel(shoppingChannelName);
    shoppingChannel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shopping_items",
        },
        () => {
          fetchItems();
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
              setItems((current) =>
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
            setItems((current) =>
              current.filter((item) => item.id !== deletedId)
            );
          }
        }
      )
      .subscribe();

    return () => {
      shoppingChannel.unsubscribe();
    };
  }, [fetchItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchItems();
    } finally {
      setRefreshing(false);
    }
  }, [fetchItems]);

  const addItem = async () => {
    if (!newItem.trim() || addingItem) return;

    try {
      setError(null);
      setAddingItem(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const itemName = newItem.trim();
      setNewItem("");

      const { data, error: insertError } = await supabase
        .from("shopping_items")
        .insert([
          {
            name: itemName,
            user_id: user.id,
          },
        ])
        .select();

      if (insertError) throw insertError;

      if (data && data.length > 0) {
        setItems((currentItems) => [data[0] as ShoppingItem, ...currentItems]);
      } else {
        fetchItems();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setAddingItem(false);
    }
  };

  const toggleItem = async (item: ShoppingItem) => {
    try {
      setError(null);
      setItems((current) =>
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
      setItems((current) => current.map((i) => (i.id === item.id ? item : i)));
    }
  };

  const updateQuantity = async (item: ShoppingItem, increment: boolean) => {
    try {
      setError(null);
      const newQuantity = increment
        ? (item.quantity || 0) + 1
        : Math.max(1, (item.quantity || 1) - 1);

      setItems((current) =>
        current.map((i) =>
          i.id === item.id ? { ...i, quantity: newQuantity } : i
        )
      );

      const { error: updateError } = await supabase
        .from("shopping_items")
        .update({ quantity: newQuantity })
        .eq("id", item.id);

      if (updateError) throw updateError;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update quantity"
      );
      setItems((current) => current.map((i) => (i.id === item.id ? item : i)));
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setError(null);
      setItems((current) => current.filter((i) => i.id !== id));

      const { error: deleteError } = await supabase
        .from("shopping_items")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
      const itemToRestore = items.find((i) => i.id === id);
      if (itemToRestore) {
        setItems((current) => [...current, itemToRestore]);
      }
    }
  };

  const renderQuantityControl = (item: ShoppingItem) => (
    <View style={styles.quantityContainer}>
      <TouchableOpacity
        style={[styles.quantityButton, { backgroundColor: colors.background }]}
        onPress={() => updateQuantity(item, false)}
      >
        <Minus size={16} color={colors.primary} />
      </TouchableOpacity>
      <Badge
        label={String(item.quantity || 1)}
        variant="secondary"
        size="medium"
        style={styles.quantityBadge}
      />
      <TouchableOpacity
        style={[styles.quantityButton, { backgroundColor: colors.background }]}
        onPress={() => updateQuantity(item, true)}
      >
        <Plus size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderShoppingItem = ({ item }: { item: ShoppingItem }) => (
    <ListItem
      title={item.name}
      description={
        <Text style={{ color: colors.textSecondary }}>
          {item.quantity || 1} item(s)
        </Text>
      }
      checked={item.completed as boolean}
      onToggle={() => toggleItem(item)}
      rightElement={
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteItem(item.id)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Trash2 size={20} color={colors.danger} />
        </TouchableOpacity>
      }
      leftElement={renderQuantityControl(item)}
    />
  );

  const renderSkeletonContent = () => {
    return (
      <>
        <View style={styles.inputContainer}>
          <TextInput
            value=""
            onChangeText={() => {}}
            placeholder="Add a shopping item..."
            clearable
            editable={false}
            rightIcon={
              <Button
                title="Add"
                size="small"
                onPress={() => {}}
                disabled={true}
                leftIcon={<Plus size={16} color="#FFFFFF" />}
              />
            }
          />
        </View>
        <View style={styles.list}>
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonListItem key={index} lines={2} />
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
          <Header title="Shopping List" />
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
              value={newItem}
              onChangeText={setNewItem}
              placeholder="Add a shopping item..."
              clearable
              rightIcon={
                <Button
                  title="Add"
                  size="small"
                  onPress={addItem}
                  disabled={!newItem.trim()}
                  leftIcon={<Plus size={16} color="#FFFFFF" />}
                />
              }
              onSubmitEditing={addItem}
            />
          </View>
        )}

        {loading || refreshing ? (
          renderSkeletonContent()
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderShoppingItem}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              items.length === 0 && styles.emptyList,
            ]}
            ListEmptyComponent={
              <EmptyState
                title="No items yet"
                description="Add items to your shopping list"
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

export default ShoppingPage;

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
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityBadge: {
    marginHorizontal: 8,
    minWidth: 30,
  },
  skeletonListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 15,
  },
  skeletonTitle: {
    width: "80%",
    height: 18,
    borderRadius: 4,
  },
  skeletonSubtitle: {
    width: "60%",
    height: 14,
    borderRadius: 4,
    marginTop: 4,
  },
  skeletonCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 8,
  },
  skeletonBadge: {
    width: 30,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 8,
  },
});
