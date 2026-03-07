import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { useCartStore } from "../store/cartStore";
import { ApiService } from "../services/api";
import { StorageService } from "../utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, CreateOrderRequest } from "../types/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AddressModal, { AddressFormData } from "../components/AddressModal";
import { useAuth } from "../hooks/useAuth";

type Props = StackScreenProps<RootStackParamList, "Checkout">;

const CheckoutScreen: React.FC<Props> = ({ navigation, route }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id?.toString() || "guest";

  // Reactively subscribe to THIS user's cart slice to force re-renders
  const userCart = useCartStore((state) => state.carts[userId]);

  const {
    getCartItems,
    getSelectedTotalPrice,
    clearSelectedCart,
    toggleAllSelection,
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);

  const [formData, setFormData] = useState<AddressFormData>({
    fullName: "",
    phoneNumber: "",
    address: "",
    ward: "",
    district: "",
    city: "",
  });

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName || "",
        phoneNumber: prev.phoneNumber || currentUser.phoneNumber || "",
      }));
    }

    const loadCachedAddress = async () => {
      try {
        // Read normal cache or common cache
        const commonCachedAddressStr = await AsyncStorage.getItem(
          "cachedShippingAddress",
        );
        // Use user session from async if exists
        const userObj = await StorageService.getUser();
        const cachedAddressStr = await AsyncStorage.getItem(
          `cachedShippingAddress_${userObj?.id || "guest"}`,
        );

        if (cachedAddressStr) {
          const cachedAddress = JSON.parse(cachedAddressStr);
          setFormData((prev) => ({ ...prev, ...cachedAddress }));
        } else if (commonCachedAddressStr) {
          const commonCachedAddress = JSON.parse(commonCachedAddressStr);
          setFormData((prev) => ({ ...prev, ...commonCachedAddress }));
        }
      } catch (error) {
        console.error("Error loading cached:", error);
      }
    };

    loadCachedAddress();
  }, [currentUser]);

  const cartItems = getCartItems(userId).filter(
    (item) => item.selected !== false,
  );
  const totalPrice = getSelectedTotalPrice(userId);
  const shippingFee: number = 0;
  const finalTotal = totalPrice + shippingFee;

  const hasAddress =
    formData.city.trim() !== "" &&
    formData.district.trim() !== "" &&
    formData.address.trim() !== "";

  const handleSaveAddress = (newAddress: AddressFormData) => {
    setFormData(newAddress);
    setAddressModalVisible(false);
  };

  const handleCreateOrder = async () => {
    if (!hasAddress) {
      Alert.alert("Lỗi", "Vui lòng thêm địa chỉ nhận hàng.");
      setAddressModalVisible(true);
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Lỗi", "Giỏ hàng đang trống.");
      return;
    }

    if (userId === "guest") {
      Alert.alert("Lỗi", "Vui lòng đăng nhập.");
      navigation.navigate("Login");
      return;
    }

    setLoading(true);

    const orderPayload: CreateOrderRequest = {
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        productImage: item.product.imageUrl,
      })),
      shippingAddress: {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber.replace(/\s/g, ""),
        address: formData.address,
        ward: formData.ward,
        district: formData.district,
        city: formData.city,
      },
      paymentMethod: "COD",
    };

    try {
      const addressToCache = {
        address: formData.address,
        ward: formData.ward,
        district: formData.district,
        city: formData.city,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      };
      await AsyncStorage.setItem(
        "cachedShippingAddress",
        JSON.stringify(addressToCache),
      );
      if (String(userId) !== "guest") {
        await AsyncStorage.setItem(
          `cachedShippingAddress_${userId}`,
          JSON.stringify(addressToCache),
        );
      }
    } catch (error) { }

    const response = await ApiService.createOrder(orderPayload);
    setLoading(false);

    if (response.success) {
      // Always clear selected items after successful order
      clearSelectedCart(userId);

      Alert.alert("Thành công", "Đơn hàng của bạn đã được đặt thành công!", [
        { text: "OK", onPress: () => navigation.navigate("Homepage") },
      ]);
    } else {
      Alert.alert(
        "Lỗi",
        response.message || "Một lỗi không mong muốn đã xảy ra.",
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5]" edges={["top", "bottom"]}>
      <View className="flex-row items-center px-4 py-3 bg-[#DC2626]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2 mr-2"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white flex-1">Thanh toán</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white mb-2 pt-4 pb-4">
          <TouchableOpacity
            className="px-4 flex-row items-start"
            onPress={() => setAddressModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="location"
              size={22}
              color="#DC2626"
              className="mt-1"
            />
            <View className="flex-1 ml-3">
              <Text className="text-base font-bold text-gray-800 mb-2">
                Địa chỉ nhận hàng
              </Text>

              {hasAddress ? (
                <View>
                  <View className="flex-row items-center mb-1">
                    <Text className="text-base font-medium text-gray-800">
                      {formData.fullName}
                    </Text>
                    <Text className="text-base text-gray-600 ml-4">
                      {formData.phoneNumber}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-500 leading-5 pr-4">
                    {formData.address}, {formData.ward}, {formData.district},{" "}
                    {formData.city}
                  </Text>
                </View>
              ) : (
                <Text className="text-base text-gray-500 italic mt-1 pb-1">
                  Bấm vào đây để thêm địa chỉ giao hàng
                </Text>
              )}
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9ca3af"
              className="mt-6"
            />
          </TouchableOpacity>
        </View>

        <View className="bg-white mb-2 pt-4">
          <View className="px-4 flex-row items-center mb-3">
            <MaterialCommunityIcons
              name="cube-outline"
              size={22}
              color="#DC2626"
            />
            <Text className="text-base font-bold text-gray-800 ml-2">
              Sản phẩm ({cartItems.length})
            </Text>
          </View>

          {cartItems.map((item, index) => (
            <View
              key={item.product.id}
              className="px-4 py-3 flex-row bg-gray-50 border-b border-white"
            >
              <Image
                source={{
                  uri:
                    item.product.imageUrl || "https://via.placeholder.com/100",
                }}
                className="w-16 h-16 rounded border border-gray-200"
                resizeMode="contain"
              />
              <View className="flex-1 ml-3 relative">
                <Text
                  className="text-gray-800 font-medium pr-16"
                  numberOfLines={2}
                >
                  {item.product.name}
                </Text>
                <Text className="text-gray-500 mt-1">x{item.quantity}</Text>
                <Text className="text-[#DC2626] font-bold mt-1">
                  {item.product.price.toLocaleString("vi-VN")} đ
                </Text>
                <Text className="absolute top-0 right-0 font-bold text-gray-800">
                  {(item.product.price * item.quantity).toLocaleString("vi-VN")}{" "}
                  đ
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="bg-white mb-2 p-4">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons
              name="truck-outline"
              size={22}
              color="#DC2626"
            />
            <Text className="text-base font-bold text-gray-800 ml-2">
              Phương thức vận chuyển
            </Text>
          </View>

          <View className="flex-row justify-between items-center ml-8">
            <View>
              <Text className="text-gray-800 font-medium mb-1">
                Giao hàng tiêu chuẩn
              </Text>
              <Text className="text-gray-500 text-sm">
                Nhận hàng trong 3-5 ngày
              </Text>
            </View>
            <Text className="text-[#DC2626] font-medium">
              {shippingFee === 0
                ? "Miễn phí"
                : `${shippingFee.toLocaleString("vi-VN")} đ`}
            </Text>
          </View>
        </View>

        <View className="bg-white mb-2 p-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="card-outline" size={22} color="#DC2626" />
            <Text className="text-base font-bold text-gray-800 ml-2">
              Phương thức thanh toán
            </Text>
          </View>

          <View className="border border-[#DC2626] rounded-lg p-3 bg-red-50 flex-row items-center">
            <Ionicons name="radio-button-on" size={24} color="#DC2626" />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-gray-800">
                Thanh toán khi nhận hàng (COD)
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                Thanh toán bằng tiền mặt khi nhận hàng
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white mb-2 p-4">
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600 font-medium">Tạm tính:</Text>
            <Text className="text-gray-800 font-bold">
              {totalPrice.toLocaleString("vi-VN")} đ
            </Text>
          </View>
          <View className="flex-row justify-between mb-4 border-b border-gray-100 pb-4">
            <Text className="text-gray-600 font-medium">Phí vận chuyển:</Text>
            <Text className="text-[#DC2626] font-bold">
              {shippingFee === 0
                ? "Miễn phí"
                : `${shippingFee.toLocaleString("vi-VN")} đ`}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-gray-800 font-bold text-lg">Tổng cộng:</Text>
            <Text className="text-[#DC2626] font-bold text-xl">
              {finalTotal.toLocaleString("vi-VN")} đ
            </Text>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      <View className="bg-white flex-row items-center border-t border-gray-200 shadow-lg justify-between pl-4">
        <View className="flex-1">
          <Text className="text-gray-800 font-medium ml-auto mr-4 text-base">
            Tổng thanh toán
          </Text>
          <Text className="text-[#DC2626] font-bold ml-auto mr-4 text-xl mt-1">
            {finalTotal.toLocaleString("vi-VN")} đ
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCreateOrder}
          disabled={loading}
          className={`px-8 py-5 items-center justify-center min-w-[140px] flex-row ${loading ? "bg-gray-400" : "bg-[#DC2626]"}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-base mr-2">
                Đặt hàng
              </Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <AddressModal
        visible={isAddressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSave={handleSaveAddress}
        initialData={formData}
      />
    </SafeAreaView>
  );
};

export default CheckoutScreen;
