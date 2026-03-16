import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { ApiService } from "../services/api";
import { Product } from "../types/api";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../hooks/useAuth";
import BottomTab from "../components/BottomTab";
import { useFocusEffect } from "@react-navigation/native";
import { Alert } from "react-native";

type Props = StackScreenProps<RootStackParamList, "Favorites">;

const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const userId = currentUser?.id?.toString() || "guest";

  useFocusEffect(
    useCallback(() => {
      if (userId !== "guest") {
        fetchFavorites();
      } else {
        setLoading(false);
      }
    }, [userId])
  );

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getFavorites();
      if (res.success && res.data) {
        setFavorites(res.data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: number) => {
    try {
      const res = await ApiService.toggleFavorite(productId);
      if (res.success) {
        setFavorites(favorites.filter(p => p.id !== productId));
      } else {
        Alert.alert("Lỗi", "Không thể xóa sản phẩm khỏi danh sách.");
      }
    } catch (error) {
      console.error("Remove favorite error:", error);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra.");
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate("ProductDetail", { productId: product.id });
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={{ width: "48%", marginBottom: 15, position: 'relative' }}>
      <ProductCard 
        item={item} 
        isGrid={true} 
        onPress={() => handleProductPress(item)} 
      />
      <TouchableOpacity 
        onPress={() => handleRemoveFavorite(item.id)}
        className="absolute top-2 left-2 bg-white/80 p-1.5 rounded-full shadow-sm"
        style={{ elevation: 3 }}
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-3">Sản phẩm yêu thích</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      ) : userId === "guest" ? (
        <View className="flex-1 items-center justify-center px-10">
          <Ionicons name="heart-outline" size={80} color="#D1D5DB" />
          <Text className="text-gray-500 text-center mt-4">
            Vui lòng đăng nhập để xem danh sách sản phẩm yêu thích của bạn.
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Login")}
            className="mt-6 bg-red-600 px-8 py-3 rounded-full shadow-sm"
          >
            <Text className="text-white font-bold">Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Ionicons name="heart-dislike-outline" size={80} color="#D1D5DB" />
          <Text className="text-gray-500 text-center mt-4 text-base">
            Bạn chưa có sản phẩm yêu thích nào.
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Homepage")}
            className="mt-6 border border-red-600 px-8 py-3 rounded-full"
          >
            <Text className="text-red-600 font-bold">Khám phá sản phẩm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 15 }}
          contentContainerStyle={{ paddingTop: 15, paddingBottom: 100 }}
          onRefresh={fetchFavorites}
          refreshing={loading}
        />
      )}

      <BottomTab />
    </SafeAreaView>
  );
};

export default FavoritesScreen;
