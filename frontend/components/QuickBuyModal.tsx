import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../types/api";

interface QuickBuyModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onBuyNow: (quantity: number, product: Product) => void;
}

const QuickBuyModal: React.FC<QuickBuyModalProps> = ({
  visible,
  product,
  onClose,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (visible) {
      setQuantity(1);
    }
  }, [visible]);

  if (!product) return null;

  const increaseQuantity = () => {
    if (quantity < 99) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end m-0">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl shadow-lg">
              <View className="pt-5 pb-4 px-4">
                {/* Header / Product Info */}
                <View className="flex-row items-start mb-6">
                  <Image
                    source={{
                      uri:
                        product.imageUrl || "https://via.placeholder.com/100",
                    }}
                    className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200"
                    resizeMode="cover"
                  />
                  <View className="flex-1 ml-4 justify-between h-24">
                    <View>
                      <Text
                        className="text-gray-800 font-bold text-base"
                        numberOfLines={2}
                      >
                        {product.name}
                      </Text>
                      <Text className="text-[#DC2626] font-bold text-lg mt-1">
                        {formatPrice(product.price)}
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-500">Kho: Còn hàng</Text>
                  </View>
                  <TouchableOpacity
                    onPress={onClose}
                    className="p-2 -mt-2 -mr-2"
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Quantity Selector */}
                <View className="flex-row items-center justify-between mb-6 border-t border-b border-gray-100 py-4">
                  <Text className="text-base font-bold text-gray-800">
                    Số lượng
                  </Text>
                  <View className="flex-row items-center border border-gray-200 rounded-lg">
                    <TouchableOpacity
                      onPress={decreaseQuantity}
                      className="px-4 py-2 border-r border-gray-200 bg-gray-50 rounded-l-lg"
                    >
                      <Text className="font-bold text-lg text-gray-600">-</Text>
                    </TouchableOpacity>
                    <Text className="px-6 py-2 font-bold text-base text-gray-800">
                      {quantity}
                    </Text>
                    <TouchableOpacity
                      onPress={increaseQuantity}
                      className="px-4 py-2 border-l border-gray-200 bg-gray-50 rounded-r-lg"
                    >
                      <Text className="font-bold text-lg text-gray-600">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row justify-between space-x-3 mt-2">
                  <TouchableOpacity
                    onPress={() => onBuyNow(quantity, product)}
                    className="flex-1 bg-[#DC2626] py-3.5 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold text-base">
                      Mua Ngay
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default QuickBuyModal;
