import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { ApiService } from "../services/api";
import { Order } from "../types/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getOrderStatusInfo } from "./OrdersScreen";
import { useAuth } from "../hooks/useAuth";

type Props = StackScreenProps<RootStackParamList, "OrderDetail">;

const OrderDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id?.toString() || "guest";
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getUserOrders(1, 10); // Find order hack if exact API is missing, wait let's use a new API endpoint if it exists
      const specificOrder = response.data?.find((o) => o.id === orderId);
      if (specificOrder) {
        setOrder(specificOrder);
      } else {
        // Fallback: search in all pages or call getById
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Assume API ApiService.getOrderById isn't created for frontend yet, we filter from complete list
    const getById = async () => {
      try {
        setLoading(true);
        // Calling the getUserOrders to get it
        const response = await ApiService.getUserOrders(1, 100);
        const found = response.data.find((o) => o.id === orderId.toString());
        if (found) setOrder(found);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    getById();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
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
              Alert.alert("Thành công", res.message || "Thao tác thành công");
              navigation.goBack();
            } else {
              Alert.alert("Lỗi", res.message || "Không thể hủy đơn hàng");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text>Không tìm kiếm thấy đơn hàng.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 p-2 bg-red-100 rounded"
        >
          <Text className="text-red-500">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);
  const timelineData = [
    {
      status: "NEW",
      title: "Đơn hàng mới",
      icon: "document-text",
      color: "#3B82F6",
      active: [
        "NEW",
        "CONFIRMED",
        "PREPARING",
        "SHIPPING",
        "DELIVERED",
      ].includes(order.status),
    },
    {
      status: "CONFIRMED",
      title: "Đã xác nhận",
      icon: "checkmark-circle",
      color: "#2563EB",
      active: ["CONFIRMED", "PREPARING", "SHIPPING", "DELIVERED"].includes(
        order.status,
      ),
    },
    {
      status: "PREPARING",
      title: "Shop đang chuẩn bị hàng",
      icon: "cube",
      color: "#F97316",
      active: ["PREPARING", "SHIPPING", "DELIVERED"].includes(order.status),
    },
    {
      status: "SHIPPING",
      title: "Đang giao hàng",
      icon: "car",
      color: "#A855F7",
      active: ["SHIPPING", "DELIVERED"].includes(order.status),
    },
    {
      status: "DELIVERED",
      title: "Giao thành công",
      icon: "home",
      color: "#10B981",
      active: ["DELIVERED"].includes(order.status),
    },
  ];

  if (order.status === "CANCELLED") {
    timelineData.push({
      status: "CANCELLED",
      title: "Đã hủy",
      icon: "close-circle",
      color: "#EF4444",
      active: true,
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">
          Chi tiết đơn hàng
        </Text>
        <View className="w-8"></View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View className="bg-white p-4 mb-2">
          <Text className="text-gray-500 mb-1">
            Mã đơn hàng:{" "}
            <Text className="font-bold text-gray-800">{order.id}</Text>
          </Text>
          <Text className="text-gray-500 mb-2">
            Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
          </Text>
          <View
            className={`self-start px-3 py-1.5 rounded-full ${statusInfo.bg}`}
          >
            <Text className={`font-bold ${statusInfo.color}`}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View className="bg-white p-4 mb-2">
          <Text className="font-bold text-base text-gray-800 mb-4">
            Trạng thái đơn hàng
          </Text>
          <View>
            {timelineData.map((step, index) => {
              if (!step.active && order.status === "CANCELLED") return null;
              if (!step.active && order.status === "CANCEL_REQUESTED")
                return null;

              return (
                <View key={step.status} className="flex-row mb-6">
                  <View className="items-center mr-4">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center z-10 ${step.active ? "bg-white border-2" : "bg-gray-100"}`}
                      style={{
                        borderColor: step.active ? step.color : "#F3F4F6",
                      }}
                    >
                      <Ionicons
                        name={step.icon as any}
                        size={16}
                        color={step.active ? step.color : "#9CA3AF"}
                      />
                    </View>
                    {index < timelineData.length - 1 && (
                      <View className="w-0.5 bg-gray-200 h-10 absolute top-8" />
                    )}
                  </View>
                  <View className="pt-1">
                    <Text
                      className={`font-semibold ${step.active ? "text-gray-800" : "text-gray-400"}`}
                    >
                      {step.title}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Items */}
        <View className="bg-white p-4 mb-2">
          <Text className="font-bold text-base text-gray-800 mb-3">
            Sản phẩm
          </Text>
          {order.items.map((item) => (
            <View
              key={item.id}
              className="flex-row py-3 border-b border-gray-100 last:border-0"
            >
              <Image
                source={{
                  uri: item.productImage || "https://via.placeholder.com/100",
                }}
                className="w-16 h-16 rounded border border-gray-200"
                resizeMode="contain"
              />
              <View className="flex-1 ml-3 justify-center">
                <Text className="font-medium text-gray-800" numberOfLines={2}>
                  {item.productName}
                </Text>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-gray-500">x{item.quantity}</Text>
                  <Text className="font-bold text-red-500">
                    {item.price.toLocaleString("vi-VN")} đ
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Address Info */}
        <View className="bg-white p-4 mb-2">
          <Text className="font-bold text-base text-gray-800 mb-3">
            Thông tin nhận hàng
          </Text>
          <View className="flex-row items-start">
            <Ionicons
              name="location"
              size={20}
              color="#6B7280"
              className="mt-1"
            />
            <View className="ml-2 flex-1">
              <Text className="font-medium text-gray-800">
                {order.shippingAddress.fullName} -{" "}
                {order.shippingAddress.phoneNumber}
              </Text>
              <Text className="text-gray-600 mt-1 leading-5">
                {order.shippingAddress.address}, {order.shippingAddress.ward},{" "}
                {order.shippingAddress.district}, {order.shippingAddress.city}
              </Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View className="bg-white p-4 mb-6">
          <Text className="font-bold text-base text-gray-800 mb-3">
            Thanh toán
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Tổng tiền hàng</Text>
            <Text className="text-gray-800 font-medium">
              {order.totalAmount.toLocaleString("vi-VN")} đ
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Phương thức</Text>
            <Text className="text-gray-800 font-medium">
              {order.paymentMethod === "COD"
                ? "Thanh toán khi nhận hàng"
                : order.paymentMethod}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons Footer */}
      {(order.canCancel &&
        order.status !== "CANCEL_REQUESTED" &&
        order.status !== "CANCELLED") && (
          <View className="p-4 bg-white border-t border-gray-200 pb-safe">
            <TouchableOpacity
              onPress={handleCancelOrder}
              className="py-3.5 rounded-xl items-center bg-gray-100 border border-gray-300 mb-3"
            >
              <Text className="text-gray-800 font-bold text-lg">
                {order.status === "PREPARING"
                  ? "Gửi Yêu Cầu Hủy Đơn"
                  : "Hủy Đơn Hàng"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
