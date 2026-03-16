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
  StyleSheet,
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

const ORDER_STATUSES = [
  { key: "", label: "Tất cả" },
  { key: "NEW", label: "Đơn mới" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "PREPARING", label: "Đang chuẩn bị" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "CANCELLED", label: "Đã hủy" },
  { key: "CANCEL_REQUESTED", label: "Yêu cầu hủy" },
];

// 10-day review window in ms
const REVIEW_WINDOW_MS = 10 * 24 * 60 * 60 * 1000;

export const getOrderStatusInfo = (status: string) => {
  switch (status) {
    case "NEW":
      return { text: "Đơn hàng mới", color: "text-blue-500", bg: "bg-blue-50" };
    case "CONFIRMED":
      return { text: "Đã xác nhận", color: "text-blue-600", bg: "bg-blue-100" };
    case "PREPARING":
      return { text: "Shop đang chuẩn bị hàng", color: "text-orange-500", bg: "bg-orange-50" };
    case "SHIPPING":
      return { text: "Đang giao hàng", color: "text-purple-500", bg: "bg-purple-50" };
    case "DELIVERED":
      return { text: "Giao thành công", color: "text-green-500", bg: "bg-green-50" };
    case "CANCELLED":
      return { text: "Đã hủy", color: "text-red-500", bg: "bg-red-50" };
    case "CANCEL_REQUESTED":
      return { text: "Yêu cầu hủy đơn", color: "text-red-600", bg: "bg-red-100" };
    default:
      return { text: "Đang xử lý", color: "text-gray-500", bg: "bg-gray-50" };
  }
};

// Helper: compute review window state from an Order object
// deliveredAt comes from order.deliveredAt (ISO string from backend)
const getReviewWindowState = (order: Order) => {
  if (order.status !== "DELIVERED") return null;

  const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt).getTime() : null;
  if (!deliveredAt) {
    // No delivered_at set yet → still within window (optimistic)
    return { canReview: true, expired: false, daysLeft: 10, deadline: null };
  }

  const now = Date.now();
  const elapsed = now - deliveredAt;
  const daysLeft = Math.max(0, Math.ceil((REVIEW_WINDOW_MS - elapsed) / (1000 * 60 * 60 * 24)));
  const expired = elapsed > REVIEW_WINDOW_MS;

  return {
    canReview: !expired,
    expired,
    daysLeft,
    deadline: new Date(deliveredAt + REVIEW_WINDOW_MS),
  };
};

const OrdersScreen: React.FC<Props> = ({ navigation }) => {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const { currentUser }           = useAuth();
  const userId = currentUser?.id?.toString() || "guest";

  const [quickBuyVisible, setQuickBuyVisible]   = useState(false);
  const [selectedProduct, setSelectedProduct]   = useState<Product | null>(null);

  const fetchOrders = async (status: string = "", isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await ApiService.getUserOrders(1, 50, status || undefined);
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
    const item = order.items[0];
    const prod: Product = {
      id:           item.productId,
      name:         item.productName,
      imageUrl:     item.productImage || "https://via.placeholder.com/100",
      price:        item.price,
      description:  "",
      category:     "",
      rating:       0,
      soldCount:    0,
      isActive:     true,
      createdAt:    "",
      originalPrice: item.price,
    };
    setSelectedProduct(prod);
    setQuickBuyVisible(true);
  };

  const handleBuyNowAction = (quantity: number, prod: Product) => {
    useCartStore.getState().toggleAllSelection(userId, false);
    useCartStore.getState().removeFromCart(userId, prod.id);
    useCartStore.getState().addToCart(userId, prod as any, quantity);
    setQuickBuyVisible(false);
    navigation.navigate("Checkout" as any, { fromQuickBuy: true });
  };

  const handleWriteReview = (order: Order) => {
    if (!order.numericId) return;
    navigation.navigate("WriteReview", {
      orderId:         order.id,
      orderId_numeric: order.numericId,
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusInfo   = getOrderStatusInfo(item.status);
    const firstItem    = item.items && item.items.length > 0 ? item.items[0] : null;
    const reviewWindow = getReviewWindowState(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
        activeOpacity={0.85}
      >
        {/* Header row: order number + status badge */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.orderCode} numberOfLines={1}>
              Mã ĐH: {item.id}
            </Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg.replace("bg-", "") }]}>
            <Text style={[styles.statusText, { color: statusInfo.color.includes("green") ? "#16a34a" : statusInfo.color.includes("red") ? "#dc2626" : statusInfo.color.includes("blue") ? "#2563eb" : statusInfo.color.includes("orange") ? "#ea580c" : statusInfo.color.includes("purple") ? "#9333ea" : "#6b7280" }]} numberOfLines={1}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        {/* First product preview */}
        {firstItem && (
          <View style={styles.productRow}>
            <Image
              source={{ uri: firstItem.productImage || "https://via.placeholder.com/100" }}
              style={styles.productImage}
              resizeMode="contain"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {firstItem.productName}
              </Text>
              <View style={styles.productMeta}>
                <Text style={styles.productQty}>x{firstItem.quantity}</Text>
                <Text style={styles.productPrice}>
                  {firstItem.price.toLocaleString("vi-VN")} đ
                </Text>
              </View>
            </View>
          </View>
        )}

        {item.items && item.items.length > 1 && (
          <Text style={styles.moreItems}>
            và {item.items.length - 1} sản phẩm khác…
          </Text>
        )}

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Thành tiền:</Text>
          <Text style={styles.totalValue}>
            {item.totalAmount.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        {/* ── Review section ── */}
        {item.isReviewed ? (
          <View style={[styles.reviewBanner, { backgroundColor: '#ECFDF5', marginTop: 10, borderColor: '#10B981', borderWidth: 0.5 }]}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={[styles.reviewBannerText, { color: '#059669', fontWeight: '700' }]}>
              Bạn đã đánh giá đơn hàng này
            </Text>
          </View>
        ) : reviewWindow && reviewWindow.canReview ? (
          <View style={styles.reviewSection}>
            <View style={styles.reviewBanner}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.reviewBannerText}>
                Còn <Text style={{ fontWeight: "800", color: "#b45309" }}>{reviewWindow.daysLeft} ngày</Text> để đánh giá
              </Text>
            </View>
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => handleWriteReview(item)}
              activeOpacity={0.85}
            >
              <Ionicons name="star-outline" size={15} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.reviewBtnText}>Đánh giá ngay</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* If review window expired */}
        {reviewWindow && reviewWindow.expired && (
          <View style={styles.expiredBadge}>
            <Ionicons name="time-outline" size={13} color="#9CA3AF" />
            <Text style={styles.expiredText}>Đã hết thời hạn đánh giá (10 ngày)</Text>
          </View>
        )}

        {/* Action buttons row */}
        <View style={styles.actionsRow}>
          {item.canCancel &&
            item.status !== "CANCELLED" &&
            item.status !== "CANCEL_REQUESTED" && (
              <TouchableOpacity
                onPress={() => handleCancelOrder(item)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>
                  {item.status === "PREPARING" ? "Yêu cầu hủy" : "Hủy đơn"}
                </Text>
              </TouchableOpacity>
            )}

          {["CANCELLED", "DELIVERED", "CANCEL_REQUESTED"].includes(item.status) && (
            <TouchableOpacity
              onPress={() => handleBuyAgain(item)}
              style={styles.buyAgainBtn}
            >
              <Ionicons name="refresh-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.buyAgainText}>Mua lại</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Status tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ORDER_STATUSES}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveTab(item.key)}
              style={[
                styles.tab,
                activeTab === item.key && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item.key && styles.tabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>Bạn không có đơn hàng nào.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
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

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#F3F4F6" },
  centered:     { flex: 1, justifyContent: "center", alignItems: "center" },
  empty:        { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText:    { color: "#6B7280", marginTop: 12, textAlign: "center", fontSize: 15 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1F2937" },

  // Tabs
  tabsContainer: { backgroundColor: "#FFFFFF" },
  tabsList:      { paddingHorizontal: 10, paddingVertical: 10 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  tabActive:     { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },
  tabText:       { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  tabTextActive: { color: "#DC2626", fontWeight: "700" },

  // List
  listContent: { padding: 12, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader:  { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  orderCode:   { fontSize: 13, fontWeight: "600", color: "#374151" },
  orderDate:   { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  statusText:  { fontSize: 11, fontWeight: "700" },

  // Product row
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginBottom: 6,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  productInfo:  { flex: 1, marginLeft: 10 },
  productName:  { fontSize: 13, fontWeight: "600", color: "#1F2937", lineHeight: 18 },
  productMeta:  { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  productQty:   { fontSize: 12, color: "#9CA3AF" },
  productPrice: { fontSize: 13, fontWeight: "700", color: "#DC2626" },

  moreItems: { fontSize: 11, color: "#9CA3AF", textAlign: "center", marginBottom: 4 },

  // Total
  totalRow:   { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  totalLabel: { fontSize: 13, color: "#6B7280" },
  totalValue: { fontSize: 14, fontWeight: "800", color: "#DC2626" },

  // ── Review section ──
  reviewSection: {
    marginTop: 10,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  reviewBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  reviewBannerText: {
    fontSize: 12,
    color: "#92400E",
    marginLeft: 4,
  },
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingVertical: 8,
  },
  reviewBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

  // Expired
  expiredBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  expiredText: { fontSize: 11, color: "#9CA3AF", marginLeft: 4, fontStyle: "italic" },

  // Action buttons
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 8,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  cancelBtnText: { fontSize: 13, color: "#4B5563", fontWeight: "500" },
  buyAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  buyAgainText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
});

export default OrdersScreen;
