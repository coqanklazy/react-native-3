import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { ApiService } from "../services/api";
import { Order } from "../types/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import { useCartStore } from "../store/cartStore";
import QuickBuyModal from "../components/QuickBuyModal";
import { Product } from "../types/api";

type Props = StackScreenProps<RootStackParamList, "Orders">;

const orderStatuses = [
  { key: "", label: "Tất cả" },
  { key: "NEW", label: "Đơn mới" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "PREPARING", label: "Đang chuẩn bị" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "CANCELLED", label: "Đã hủy" },
  { key: "CANCEL_REQUESTED", label: "Yêu cầu hủy" },
];

export const getOrderStatusInfo = (status: string) => {
  switch (status) {
    case "NEW":
      return { text: "Đơn hàng mới", color: "text-blue-500", bg: "bg-blue-50" };
    case "CONFIRMED":
      return { text: "Đã xác nhận", color: "text-blue-600", bg: "bg-blue-100" };
    case "PREPARING":
      return {
        text: "Shop đang chuẩn bị hàng",
        color: "text-orange-500",
        bg: "bg-orange-50",
      };
    case "SHIPPING":
      return {
        text: "Đang giao hàng",
        color: "text-purple-500",
        bg: "bg-purple-50",
      };
    case "DELIVERED":
      return {
        text: "Giao thành công",
        color: "text-green-500",
        bg: "bg-green-50",
      };
    case "CANCELLED":
      return { text: "Đã hủy", color: "text-red-500", bg: "bg-red-50" };
    case "CANCEL_REQUESTED":
      return {
        text: "Yêu cầu hủy đơn",
        color: "text-red-600",
        bg: "bg-red-100",
      };
    default:
      return { text: "Đang xử lý", color: "text-gray-500", bg: "bg-gray-50" };
  }
};

const OrdersScreen: React.FC<Props> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const { currentUser } = useAuth();
  const userId = currentUser?.id?.toString() || "guest";

  const [quickBuyVisible, setQuickBuyVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchOrders = async (status: string = "", isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await ApiService.getUserOrders(
        1,
        50,
        status || undefined,
      );
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders(activeTab);
    }, [activeTab]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(activeTab, true);
  };

  const handleCancelOrder = async (order: Order) => {
    Alert.alert(
      "Hủy đơn hàng",
      "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Đồng ý",
          style: "destructive",
          onPress: async () => {
            const res = await ApiService.cancelOrder(order.id);
            if (res.success) {
              Alert.alert("Thành công", res.message || "Đã hủy đơn hàng");
              fetchOrders(activeTab, true);
            } else {
              Alert.alert("Lỗi", res.message || "Không thể hủy đơn hàng");
            }
          },
        },
      ],
    );
  };

  const handleBuyAgain = (order: Order) => {
    if (!order.items || order.items.length === 0) return;

    // We just take the first item like the QuickBuyModal expects 1 product
    const item = order.items[0];
    const prod: Product = {
      id: item.productId,
      name: item.productName,
      imageUrl: item.productImage || "https://via.placeholder.com/100",
      price: item.price,
      description: "",
      category: "",
      rating: 0,
      soldCount: 0,
      isActive: true,
      createdAt: "",
      originalPrice: item.price
    };
    setSelectedProduct(prod);
    setQuickBuyVisible(true);
  };

  const handleBuyNowAction = (quantity: number, prod: Product) => {
    // 1. Unselect all items first
    useCartStore.getState().toggleAllSelection(userId, false);

    // 2. Clear then re-add to ensure fresh item with requested quantity
    useCartStore.getState().removeFromCart(userId, prod.id);
    useCartStore.getState().addToCart(userId, prod as any, quantity);

    setQuickBuyVisible(false);
    navigation.navigate("Checkout" as any, { fromQuickBuy: true });
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusInfo = getOrderStatusInfo(item.status);
    const firstItem =
      item.items && item.items.length > 0 ? item.items[0] : null;

    return (
      <TouchableOpacity
        className="bg-white mb-3 p-4 rounded-xl shadow-sm border border-gray-100"
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-gray-600 font-medium" numberOfLines={1}>
              Mã ĐH: {item.id}
            </Text>
          </View>
          <View className={`px-2 py-1 rounded ${statusInfo.bg}`}>
            <Text className={`font-bold text-xs ${statusInfo.color}`} numberOfLines={1}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        {firstItem && (
          <View className="flex-row py-2 border-t border-gray-100 mb-2">
            <Image
              source={{
                uri:
                  firstItem.productImage || "https://via.placeholder.com/100",
              }}
              className="w-16 h-16 rounded bg-gray-50 border border-gray-200"
              resizeMode="contain"
            />
            <View className="flex-1 ml-3">
              <Text className="text-gray-800 font-bold" numberOfLines={2}>
                {firstItem.productName}
              </Text>
              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-500">x{firstItem.quantity}</Text>
                <Text className="text-red-500 font-bold">
                  {firstItem.price.toLocaleString("vi-VN")} đ
                </Text>
              </View>
            </View>
          </View>
        )}

        {item.items && item.items.length > 1 && (
          <Text className="text-center text-gray-400 text-xs my-1">
            Xem thêm {item.items.length - 1} sản phẩm...
          </Text>
        )}

        <View className="flex-row items-center justify-between border-t border-gray-100 pt-3 mt-1">
          <Text className="text-gray-600">Thành tiền:</Text>
          <Text className="text-red-600 font-bold text-base">
            {item.totalAmount.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        {/* Status action buttons */}
        <View className="flex-row justify-end mt-3 space-x-2">
          {item.canCancel &&
            item.status !== "CANCELLED" &&
            item.status !== "CANCEL_REQUESTED" && (
              <TouchableOpacity
                onPress={() => handleCancelOrder(item)}
                className="border border-gray-300 px-4 py-2 rounded-lg"
              >
                <Text className="text-gray-700 font-medium">
                  {item.status === "PREPARING" ? "Gửi Yêu Cầu Hủy" : "Hủy đơn"}
                </Text>
              </TouchableOpacity>
            )}

          {["CANCELLED", "DELIVERED", "CANCEL_REQUESTED"].includes(item.status) && (
            <TouchableOpacity
              onPress={() => handleBuyAgain(item)}
              className="bg-red-500 px-4 py-2 rounded-lg ml-2"
            >
              <Text className="text-white font-medium">Mua lại</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">
          Đơn hàng của tôi
        </Text>
        <View className="w-8"></View>
      </View>

      {/* Tabs */}
      <View className="bg-white">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={orderStatuses}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveTab(item.key)}
              className={`px-4 py-2 mr-2 rounded-full border ${activeTab === item.key ? "bg-red-50 border-red-500" : "bg-white border-gray-200"}`}
            >
              <Text
                className={`font-medium ${activeTab === item.key ? "text-red-600" : "text-gray-600"}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 mt-4 text-center">
            Bạn không có đơn hàng nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      <QuickBuyModal
        visible={quickBuyVisible}
        product={selectedProduct}
        onClose={() => setQuickBuyVisible(false)}
        onBuyNow={handleBuyNowAction}
      />
    </SafeAreaView>
  );
};

export default OrdersScreen;
